"""
Extremos previstos por município da Bahia, calculados direto da grade dos modelos (sem Open-Meteo).

Para cada município (malha oficial do IBGE 2024) e cada dia local (00h–24h, horário da Bahia):
  max    maior temperatura máxima (°C) entre os pixels que tocam o município
  min    menor temperatura mínima (°C) entre os pixels que tocam o município
  mm     maior chuva acumulada no dia (mm) entre os pixels
  raj    maior rajada (km/h) entre os pixels
  urmin  menor umidade relativa (%) entre os pixels
  v      maior vento médio do dia a 10 m (km/h) entre os pixels

Modelos: ECMWF IFS 0,25° (data.ecmwf.int, open data) e NOAA GFS 0,25° (nomads.ncep.noaa.gov).
Um pixel "toca" o município se qualquer ponto de uma subgrade 6×6 dentro dele cai no polígono.
Saída: extremos.json (na raiz do repositório, ao lado de previsao.json).
"""
import argparse, datetime as dt, json, os, tempfile, time, traceback, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import eccodes
from matplotlib.path import Path

AQUI = os.path.dirname(os.path.abspath(__file__))
UA = {"User-Agent": "inema-meteorologia-extremos/1.0 (github actions)"}
NDIAS = 7
FUSO = dt.timezone(dt.timedelta(hours=-3))
# grade alvo 0,25° cobrindo a Bahia (centros dos pixels)
LONS = np.round(np.arange(-47.0, -36.99, 0.25), 2)
LATS = np.round(np.arange(-19.0, -7.99, 0.25), 2)
SUB = 6


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


def http_get(url, headers=None, tentativas=4, timeout=180):
    h = dict(UA); h.update(headers or {})
    for i in range(tentativas):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                raise
            erro = e
        except Exception as e:  # noqa
            erro = e
        time.sleep(3 * (i + 1))
    raise RuntimeError(f"falhou: {url} ({erro})")


def existe(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA, method="HEAD"), timeout=30) as r:
            return r.status == 200
    except Exception:
        return False


def mensagens(raw):
    f = tempfile.TemporaryFile(); f.write(raw); f.seek(0)
    while True:
        gid = eccodes.codes_grib_new_from_file(f)
        if gid is None:
            f.close(); break
        try:
            k = {n: eccodes.codes_get(gid, n) for n in ("shortName", "typeOfLevel", "level")}
            k["stepRange"] = eccodes.codes_get_string(gid, "stepRange")
            ni, nj = eccodes.codes_get(gid, "Ni"), eccodes.codes_get(gid, "Nj")
            v = eccodes.codes_get_values(gid).reshape(nj, ni)
            miss = eccodes.codes_get(gid, "missingValue")
            v = np.where(v == miss, np.nan, v)
            yield k, v, eccodes.codes_get_array(gid, "distinctLatitudes"), eccodes.codes_get_array(gid, "distinctLongitudes")
        finally:
            eccodes.codes_release(gid)


def para_alvo(vals, lats, lons):
    lons = np.where(lons > 180, lons - 360, lons)
    oy, ox = np.argsort(lats), np.argsort(lons)
    la, lo, v = lats[oy], lons[ox], vals[np.ix_(oy, ox)]
    iy = np.clip(np.searchsorted(la, LATS - 0.01), 0, len(la) - 1)
    ix = np.clip(np.searchsorted(lo, LONS - 0.01), 0, len(lo) - 1)
    return v[np.ix_(iy, ix)]


# ------------------------------------------------------------ pixels de cada município
def cobertura():
    with open(os.path.join(AQUI, "municipios_ba.geojson"), encoding="utf-8") as f:
        gj = json.load(f)
    passo = 0.25 / SUB
    off = (np.arange(SUB) + 0.5) * passo - 0.125
    sx, sy = np.meshgrid(np.add.outer(LONS, off).ravel(), np.add.outer(LATS, off).ravel())
    cel_x = np.repeat(np.arange(len(LONS)), SUB)[None, :].repeat(len(LATS) * SUB, 0)
    cel_y = np.repeat(np.arange(len(LATS)), SUB)[:, None].repeat(len(LONS) * SUB, 1)
    pts = np.c_[sx.ravel(), sy.ravel()]
    cx, cy = cel_x.ravel(), cel_y.ravel()
    out = {}
    for ft in gj["features"]:
        nome = ft["properties"]["nome"]
        dentro = np.zeros(len(pts), bool)
        xs, ys = [], []
        for poli in ft["geometry"]["coordinates"]:
            for anel in poli:
                a = np.array(anel); xs.append(a[:, 0]); ys.append(a[:, 1])
                bb = (pts[:, 0] >= a[:, 0].min()) & (pts[:, 0] <= a[:, 0].max()) & (pts[:, 1] >= a[:, 1].min()) & (pts[:, 1] <= a[:, 1].max())
                if bb.any():
                    idx = np.where(bb)[0]
                    dentro[idx] ^= Path(a).contains_points(pts[idx])
        cel = set(zip(cy[dentro].tolist(), cx[dentro].tolist()))
        # garante ao menos o pixel do "centro" do município (municípios muito pequenos)
        mx, my = np.concatenate(xs).mean(), np.concatenate(ys).mean()
        cel.add((int(np.argmin(abs(LATS - my))), int(np.argmin(abs(LONS - mx)))))
        out[nome] = (np.array([c[0] for c in cel]), np.array([c[1] for c in cel]))
    log(f"cobertura: {len(out)} municípios, média de {np.mean([len(v[0]) for v in out.values()]):.1f} pixels por município")
    return out


# ------------------------------------------------------------ dias locais e rodada
def dias_locais(agora):
    hoje = (agora - dt.timedelta(hours=3)).date()          # data no horário da Bahia
    ini = dt.datetime(hoje.year, hoje.month, hoje.day, 3)    # 00h local = 03 UTC
    return [hoje + dt.timedelta(days=k) for k in range(NDIAS)], ini


def candidatos(ini):
    base = ini.replace(hour=0) if ini.hour < 12 else ini.replace(hour=12)
    return [base - dt.timedelta(hours=12 * i) for i in range(4)]


# ------------------------------------------------------------ ECMWF
def ec_url(c, p, ext):
    d, h = c.strftime("%Y%m%d"), c.strftime("%H")
    return f"https://data.ecmwf.int/forecasts/{d}/{h}z/ifs/0p25/oper/{d}{h}0000-{p}h-oper-fc.{ext}"


def ec_passos(c):
    return [p for p in range(0, 145, 3)] + [p for p in range(150, 361, 6)] if c.hour in (0, 12) else []


def ec_baixar(c, p, params):
    idx = http_get(ec_url(c, p, "index")).decode().splitlines()
    out = {}
    for linha in idx:
        j = json.loads(linha)
        if j.get("levtype") == "sfc" and j.get("param") in params:
            a, n = int(j["_offset"]), int(j["_length"])
            raw = http_get(ec_url(c, p, "grib2"), {"Range": f"bytes={a}-{a + n - 1}"})
            for k, v, la, lo in mensagens(raw):
                out[j["param"]] = para_alvo(v, la, lo)
    return out


def modelo_ecmwf(c, ini):
    a = int((ini - c).total_seconds() // 3600)          # passo da 00h local do 1º dia
    fim = a + 24 * NDIAS
    passos = [p for p in ec_passos(c) if a - 6 <= p <= fim + 6]
    def um(p):
        par = ["tp", "10fg", "2t", "2d", "10u", "10v"] + (["mx2t3", "mn2t3"] if p <= 144 else ["mx2t6", "mn2t6"])
        return p, ec_baixar(c, p, par)
    campos = {}
    with ThreadPoolExecutor(6) as ex:
        for p, d in ex.map(um, passos):
            campos[p] = d
    def junta(p, nome):
        d = campos.get(p, {})
        return d.get(nome)
    dias = []
    for k in range(NDIAS):
        i0, i1 = a + 24 * k, a + 24 * (k + 1)
        dentro = [p for p in passos if i0 < p <= i1]
        tmax = np.nanmax([junta(p, "mx2t3" if p <= 144 else "mx2t6") for p in dentro], axis=0) - 273.15
        tmin = np.nanmin([junta(p, "mn2t3" if p <= 144 else "mn2t6") for p in dentro], axis=0) - 273.15
        raj = np.nanmax([junta(p, "10fg") for p in dentro], axis=0) * 3.6
        t = np.array([junta(p, "2t") for p in dentro]) - 273.15
        td = np.array([junta(p, "2d") for p in dentro]) - 273.15
        rh = np.clip(100 * np.exp(17.625 * td / (243.04 + td)) / np.exp(17.625 * t / (243.04 + t)), 0, 100)
        vel = np.hypot(np.array([junta(p, "10u") for p in dentro]), np.array([junta(p, "10v") for p in dentro])) * 3.6
        # chuva: acumulado desde o início da rodada; usa o passo disponível mais próximo das viradas de dia
        def tp_em(h):
            p = min(campos, key=lambda x: (abs(x - h), x))
            return campos[p]["tp"] * 1000.0
        chuva = np.maximum(tp_em(i1) - tp_em(i0), 0)
        dias.append({"max": tmax, "min": tmin, "mm": chuva, "raj": raj, "urmin": np.nanmin(rh, axis=0), "v": np.nanmean(vel, axis=0)})
    return dias


# ------------------------------------------------------------ GFS
def gfs_idx(c, p):
    d, h = c.strftime("%Y%m%d"), c.strftime("%H")
    return f"https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/gfs.{d}/{h}/atmos/gfs.t{h}z.pgrb2.0p25.f{p:03d}.idx"


def gfs_baixar(c, p):
    d, h = c.strftime("%Y%m%d"), c.strftime("%H")
    q = [f"dir=%2Fgfs.{d}%2F{h}%2Fatmos", f"file=gfs.t{h}z.pgrb2.0p25.f{p:03d}",
         "var_TMAX=on", "var_TMIN=on", "var_TMP=on", "var_RH=on", "var_UGRD=on", "var_VGRD=on", "var_APCP=on", "var_GUST=on",
         "lev_2_m_above_ground=on", "lev_10_m_above_ground=on", "lev_surface=on",
         "subregion=", "toplat=-7", "leftlon=312", "rightlon=324", "bottomlat=-20"]
    raw = http_get("https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?" + "&".join(q))
    out = {}
    for k, v, la, lo in mensagens(raw):
        out[(k["shortName"], k["typeOfLevel"], int(k["level"]))] = para_alvo(v, la, lo)
    return out


def modelo_gfs(c, ini):
    a = int((ini - c).total_seconds() // 3600)
    fim = a + 24 * NDIAS
    passos = list(range(max(3, a - 3), fim + 1, 3))
    def um(p):
        time.sleep(0.3)
        return p, gfs_baixar(c, p)
    campos = {}
    with ThreadPoolExecutor(3) as ex:
        for p, d in ex.map(um, passos):
            campos[p] = d
    def g(p, *k):
        return campos.get(p, {}).get(k)
    # chuva acumulada: GFS zera o balde a cada 6 h (f003 = 0-3 h; f006 = 0-6 h; ...)
    acc, A = 0.0, {}
    for p in range(3, fim + 1, 3):
        if p not in campos:
            continue
        b = g(p, "tp", "surface", 0)
        if b is None:
            continue
        inc = b if p % 6 == 3 else b - (g(p - 3, "tp", "surface", 0) if g(p - 3, "tp", "surface", 0) is not None else 0)
        acc = acc + np.maximum(inc, 0); A[p] = acc
    dias = []
    for k in range(NDIAS):
        i0, i1 = a + 24 * k, a + 24 * (k + 1)
        dentro = [p for p in passos if i0 < p <= i1]
        tmax = np.nanmax([g(p, "tmax", "heightAboveGround", 2) for p in dentro], axis=0) - 273.15
        tmin = np.nanmin([g(p, "tmin", "heightAboveGround", 2) for p in dentro], axis=0) - 273.15
        raj = np.nanmax([g(p, "gust", "surface", 0) for p in dentro], axis=0) * 3.6
        rh = np.nanmin([g(p, "2r", "heightAboveGround", 2) for p in dentro], axis=0)
        vel = np.nanmean([np.hypot(g(p, "10u", "heightAboveGround", 10), g(p, "10v", "heightAboveGround", 10)) for p in dentro], axis=0) * 3.6
        chuva = np.maximum(A.get(i1, 0) - A.get(i0, 0), 0)
        dias.append({"max": tmax, "min": tmin, "mm": chuva, "raj": raj, "urmin": rh, "v": vel})
    return dias


# ------------------------------------------------------------ estatística por município
REGRA = {"max": ("max", 0), "min": ("min", 0), "mm": ("max", 1), "raj": ("max", 0), "urmin": ("min", 0), "v": ("max", 0)}


def por_municipio(dias, cob):
    out = {}
    for nome, (iy, ix) in cob.items():
        m = {}
        for var, (op, casas) in REGRA.items():
            vals = []
            for d in dias:
                px = d[var][iy, ix]
                px = px[np.isfinite(px)]
                if not len(px):
                    vals.append(None); continue
                x = float(px.max() if op == "max" else px.min())
                vals.append(round(x, casas) if casas else int(round(x)))
            m[var] = vals
        out[nome] = m
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--saida", default="extremos.json")
    a = ap.parse_args()
    agora = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)
    datas, ini = dias_locais(agora)
    cob = cobertura()
    res = {"gerado_em": dt.datetime.now(FUSO).strftime("%Y-%m-%dT%H:%M-03:00"), "datas": [d.isoformat() for d in datas],
           "metodo": "Maior (máx., chuva, rajada, vento) ou menor (mín., umidade) valor entre os pixels do modelo que tocam o município (malha IBGE 2024). Dia = 00h–24h no horário da Bahia.",
           "modelos": {}, "erros": {}}
    for nome, rotulo, func, disp in (
            ("ecmwf", "ECMWF IFS 0,25°", modelo_ecmwf, lambda c, ini: existe(ec_url(c, max(p for p in ec_passos(c) if p <= int((ini - c).total_seconds() // 3600) + 24 * NDIAS + 6), "index"))),
            ("gfs", "GFS 0,25°", modelo_gfs, lambda c, ini: existe(gfs_idx(c, int((ini - c).total_seconds() // 3600) + 24 * NDIAS)))):
        try:
            c = next((c for c in candidatos(ini) if c <= ini and disp(c, ini)), None)
            if c is None:
                res["erros"][nome] = "nenhuma rodada disponível que cubra os 7 dias"; continue
            log(f"{nome}: rodada {c:%d/%m %HZ}")
            dias = func(c, ini)
            res["modelos"][nome] = {"nome": rotulo, "rodada": c.strftime("%Y-%m-%dT%HZ"), "municipios": por_municipio(dias, cob)}
            ex = res["modelos"][nome]["municipios"].get("Salvador", {})
            log(f"{nome}: Salvador máx {ex.get('max')} mín {ex.get('min')} chuva {ex.get('mm')}")
        except Exception as e:
            traceback.print_exc()
            res["erros"][nome] = f"{type(e).__name__}: {e}"[:300]
    with open(a.saida, "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, separators=(",", ":"))
    log(f"OK: {a.saida} ({os.path.getsize(a.saida) // 1024} KB) | erros: {res['erros']}")
    if not res["modelos"]:
        raise SystemExit("nenhum modelo gerado")


if __name__ == "__main__":
    main()
