"""
Mapas de previsão para a Bahia com as regiões climáticas — ECMWF × GFS × ICON.

Fontes (todas abertas, sem Open-Meteo):
  ECMWF IFS 0,25°  -> data.ecmwf.int (open data, CC-BY-4.0), download parcial via arquivo .index
  NOAA GFS 0,25°   -> nomads.ncep.noaa.gov (filtro com recorte da América do Sul)
  DWD ICON global  -> opendata.dwd.de (grade icosaédrica ~13 km, interpolada para 0,25°)

Para cada modelo gera, para os 5 primeiros dias locais completos da rodada:
  chuva   chuva acumulada no dia (mm)
  tmax    temperatura máxima a 2 m (°C)   [máximo das saídas de 3 em 3 h]
  tmin    temperatura mínima a 2 m (°C)   [mínimo das saídas de 3 em 3 h]
  urmin   umidade relativa mínima a 2 m (%)
  vento   vento máximo a 10 m (km/h)
  pnmm850 pressão ao nível do mar + vento em 850 hPa (América do Sul, 12 UTC)
  v200    linhas de corrente e vento em 200 hPa (América do Sul, 12 UTC)
e ainda a análise do GFS (hora 0) de pressão + 850 hPa, usada como "carta sinótica" do modelo.

Saída: PNGs + info.json na pasta indicada (--saida), publicados no ramo "mapas".
Dia local = 00h às 24h no horário da Bahia (03 UTC a 03 UTC).
"""
import argparse, bz2, datetime as dt, io, json, os, sys, tempfile, time, traceback, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import eccodes
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import BoundaryNorm, ListedColormap, LinearSegmentedColormap
from matplotlib.path import Path
from matplotlib.patches import PathPatch
from scipy.ndimage import gaussian_filter
import cartopy.crs as ccrs
import cartopy.feature as cfeature
from scipy.spatial import cKDTree

AQUI = os.path.dirname(os.path.abspath(__file__))
UA = {"User-Agent": "inema-meteorologia-mapas/1.0 (github actions)"}
NDIAS = 5

# Grade alvo (0,25°) cobrindo a América do Sul tropical/subtropical e o Atlântico
LON0, LON1, LAT0, LAT1 = -80.0, -20.0, -40.0, 8.0
LONS = np.round(np.arange(LON0, LON1 + 0.001, 0.25), 2)
LATS = np.round(np.arange(LAT0, LAT1 + 0.001, 0.25), 2)
GLON, GLAT = np.meshgrid(LONS, LATS)
EXT_BA = (-47.2, -36.8, -18.9, -8.1)       # recorte dos mapas da Bahia
EXT_AS = (-80.0, -20.0, -40.0, 8.0)        # recorte sinótico

CIDADES = [("Salvador", -38.50, -12.97), ("Juazeiro", -40.50, -9.41), ("Barreiras", -45.00, -12.15),
           ("Vitória da Conquista", -40.84, -14.86), ("Ilhéus", -39.05, -14.79), ("Bom Jesus da Lapa", -43.42, -13.25),
           ("Paulo Afonso", -38.21, -9.40), ("Irecê", -41.86, -11.30), ("Teixeira de Freitas", -39.74, -17.54)]

DIAS_SEMANA = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"]


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


def http_get(url, headers=None, tentativas=4, timeout=120):
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
        req = urllib.request.Request(url, headers=UA, method="HEAD")
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status == 200
    except Exception:
        return False


# ---------------------------------------------------------------- leitura GRIB
def mensagens(raw):
    """Itera mensagens GRIB de um bloco de bytes, devolvendo (chaves, valores, lats, lons|None)."""
    # o ecCodes precisa de um arquivo de verdade (com fileno), não de BytesIO
    f = tempfile.TemporaryFile()
    f.write(raw); f.seek(0)
    while True:
        gid = eccodes.codes_grib_new_from_file(f)
        if gid is None:
            f.close()
            break
        try:
            k = {n: eccodes.codes_get(gid, n) for n in ("shortName", "typeOfLevel", "level", "gridType")}
            k["stepRange"] = eccodes.codes_get_string(gid, "stepRange")
            vals = eccodes.codes_get_values(gid)
            if k["gridType"] == "regular_ll":
                ni, nj = eccodes.codes_get(gid, "Ni"), eccodes.codes_get(gid, "Nj")
                lats = eccodes.codes_get_array(gid, "distinctLatitudes")
                lons = eccodes.codes_get_array(gid, "distinctLongitudes")
                vals = vals.reshape(nj, ni)
                miss = eccodes.codes_get(gid, "missingValue")
                vals = np.where(vals == miss, np.nan, vals)
                yield k, vals, lats, lons
            else:
                yield k, vals, None, None
        finally:
            eccodes.codes_release(gid)


def regular_para_alvo(vals, lats, lons):
    """Recorta/reordena uma grade regular de 0,25° para a grade alvo (vizinho mais próximo)."""
    lons = np.where(lons > 180, lons - 360, lons)
    oy = np.argsort(lats); ox = np.argsort(lons)
    lats_s, lons_s, v = lats[oy], lons[ox], vals[np.ix_(oy, ox)]
    iy = np.clip(np.searchsorted(lats_s, LATS - 0.01), 0, len(lats_s) - 1)
    ix = np.clip(np.searchsorted(lons_s, LONS - 0.01), 0, len(lons_s) - 1)
    return v[np.ix_(iy, ix)]


# ---------------------------------------------------------------- rodada e passos
def dias_da_rodada(ciclo):
    """Passos (h) de início de cada dia local completo: 00h local = 03 UTC."""
    primeiro = (3 - ciclo.hour) % 24
    if primeiro == 0:
        primeiro = 24
    return [primeiro + 24 * k for k in range(NDIAS)]


def passos_necessarios(ciclo):
    ini = dias_da_rodada(ciclo)
    return list(range(ini[0], ini[-1] + 24 + 1, 3)), ini


# ---------------------------------------------------------------- ECMWF
def ecmwf_url(ciclo, passo, ext):
    d = ciclo.strftime("%Y%m%d"); h = ciclo.strftime("%H")
    return f"https://data.ecmwf.int/forecasts/{d}/{h}z/ifs/0p25/oper/{d}{h}0000-{passo}h-oper-fc.{ext}"


def ecmwf_baixar(ciclo, passo, pedidos):
    """pedidos: lista de (param, levtype, levelist|None). Usa o .index para baixar só os campos."""
    idx = http_get(ecmwf_url(ciclo, passo, "index")).decode().splitlines()
    out = {}
    for linha in idx:
        j = json.loads(linha)
        for p, lt, lv in pedidos:
            if j.get("param") == p and j.get("levtype") == lt and (lv is None or str(j.get("levelist")) == str(lv)):
                a, n = int(j["_offset"]), int(j["_length"])
                raw = http_get(ecmwf_url(ciclo, passo, "grib2"), {"Range": f"bytes={a}-{a + n - 1}"})
                for k, vals, la, lo in mensagens(raw):
                    out[(p, lv)] = regular_para_alvo(vals, la, lo)
    return out


def modelo_ecmwf(ciclo):
    passos, ini = passos_necessarios(ciclo)
    sup = [("2t", "sfc", None), ("2d", "sfc", None), ("10u", "sfc", None), ("10v", "sfc", None), ("tp", "sfc", None)]
    sin = [("msl", "sfc", None), ("u", "pl", 850), ("v", "pl", 850), ("u", "pl", 200), ("v", "pl", 200)]
    passos_sin = {p + 9 for p in ini}  # 12 UTC de cada dia
    def um(p):
        return p, ecmwf_baixar(ciclo, p, sup + (sin if p in passos_sin else []))
    campos = {}
    with ThreadPoolExecutor(6) as ex:
        for p, d in ex.map(um, sorted(set(passos) | passos_sin)):
            for (nome, lv), v in d.items():
                campos[(nome, lv, p)] = v
    F = {}
    for p in set(passos) | passos_sin:
        g = lambda n, lv=None: campos.get((n, lv, p))
        if g("2t") is not None:
            t = g("2t") - 273.15; td = g("2d") - 273.15
            F[("t2", p)] = t
            F[("rh2", p)] = np.clip(100 * np.exp(17.625 * td / (243.04 + td)) / np.exp(17.625 * t / (243.04 + t)), 0, 100)
            F[("ws10", p)] = np.hypot(g("10u"), g("10v")) * 3.6
            F[("tpacc", p)] = g("tp") * 1000.0
        if g("msl") is not None:
            F[("msl", p)] = g("msl") / 100.0
            for lv in (850, 200):
                F[("u", lv, p)] = g("u", lv); F[("v", lv, p)] = g("v", lv)
    return F


# ---------------------------------------------------------------- GFS (NOMADS)
def gfs_idx(ciclo, passo):
    d = ciclo.strftime("%Y%m%d"); h = ciclo.strftime("%H")
    return f"https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/gfs.{d}/{h}/atmos/gfs.t{h}z.pgrb2.0p25.f{passo:03d}.idx"


def gfs_baixar(ciclo, passo, sinotico):
    d = ciclo.strftime("%Y%m%d"); h = ciclo.strftime("%H")
    q = [f"dir=%2Fgfs.{d}%2F{h}%2Fatmos", f"file=gfs.t{h}z.pgrb2.0p25.f{passo:03d}",
         "var_TMP=on", "var_RH=on", "var_UGRD=on", "var_VGRD=on", "var_APCP=on",
         "lev_2_m_above_ground=on", "lev_10_m_above_ground=on", "lev_surface=on"]
    if sinotico:
        q += ["var_PRMSL=on", "lev_mean_sea_level=on", "lev_850_mb=on", "lev_200_mb=on"]
    q += ["subregion=", "toplat=9", "leftlon=279", "rightlon=341", "bottomlat=-41"]
    url = "https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?" + "&".join(q)
    raw = http_get(url)
    out = {}
    for k, vals, la, lo in mensagens(raw):
        out[(k["shortName"], k["typeOfLevel"], int(k["level"]), k["stepRange"])] = regular_para_alvo(vals, la, lo)
    return out


def modelo_gfs(ciclo, com_analise=True):
    passos, ini = passos_necessarios(ciclo)
    passos_sin = {p + 9 for p in ini}
    todos = sorted(set(passos) | passos_sin | ({0} if com_analise else set()))
    brutos = {}
    def um(p):
        time.sleep(0.4)
        return p, gfs_baixar(ciclo, p, p in passos_sin or p == 0)
    with ThreadPoolExecutor(3) as ex:
        for p, d in ex.map(um, todos):
            brutos[p] = d
    F = {}
    for p, d in brutos.items():
        def g(n, tl, lv):
            for (sn, t, l, sr), v in d.items():
                if sn == n and t == tl and l == lv:
                    return v
            return None
        t = g("2t", "heightAboveGround", 2)
        if t is not None:
            F[("t2", p)] = t - 273.15
            F[("rh2", p)] = g("2r", "heightAboveGround", 2)
            F[("ws10", p)] = np.hypot(g("10u", "heightAboveGround", 10), g("10v", "heightAboveGround", 10)) * 3.6
        ap = g("tp", "surface", 0)
        if ap is not None:
            F[("apcp_bucket", p)] = ap
        m = g("prmsl", "meanSea", 0)
        if m is not None:
            F[("msl", p)] = m / 100.0
            for lv in (850, 200):
                F[("u", lv, p)] = g("u", "isobaricInhPa", lv); F[("v", lv, p)] = g("v", "isobaricInhPa", lv)
    # Chuva acumulada desde o início: GFS zera o "balde" a cada 6 h (f003 = 0-3 h, f006 = 0-6 h ...)
    acc, ant = 0.0, None
    for p in sorted(x for x in brutos if x > 0 and x % 3 == 0):
        b = F.get(("apcp_bucket", p))
        if b is None:
            continue
        inc = b if p % 6 == 3 else (b - F[("apcp_bucket", p - 3)] if ("apcp_bucket", p - 3) in F else b)
        acc = acc + np.maximum(inc, 0)
        F[("tpacc", p)] = acc
    return F


# ---------------------------------------------------------------- ICON (DWD)
def icon_url(ciclo, var, passo, nivel=None, invariante=False):
    h = ciclo.strftime("%H"); dh = ciclo.strftime("%Y%m%d%H")
    if invariante:
        return f"https://opendata.dwd.de/weather/nwp/icon/grib/{h}/{var.lower()}/icon_global_icosahedral_time-invariant_{dh}_{var.upper()}.grib2.bz2"
    if nivel:
        return f"https://opendata.dwd.de/weather/nwp/icon/grib/{h}/{var.lower()}/icon_global_icosahedral_pressure-level_{dh}_{passo:03d}_{nivel}_{var.upper()}.grib2.bz2"
    return f"https://opendata.dwd.de/weather/nwp/icon/grib/{h}/{var.lower()}/icon_global_icosahedral_single-level_{dh}_{passo:03d}_{var.upper()}.grib2.bz2"


def icon_valores(url):
    raw = bz2.decompress(http_get(url))
    for k, vals, la, lo in mensagens(raw):
        return vals
    raise RuntimeError("GRIB vazio: " + url)


def modelo_icon(ciclo):
    log("ICON: coordenadas das células")
    clat = icon_valores(icon_url(ciclo, "clat", 0, invariante=True))
    clon = icon_valores(icon_url(ciclo, "clon", 0, invariante=True))
    if np.nanmax(np.abs(clat)) <= 3.2:          # veio em radianos
        clat, clon = np.degrees(clat), np.degrees(clon)
    clon = np.where(clon > 180, clon - 360, clon)
    sel =np.where((clon > LON0 - 1) & (clon < LON1 + 1) & (clat > LAT0 - 1) & (clat < LAT1 + 1))[0]
    arvore = cKDTree(np.c_[clon[sel], clat[sel]])
    _, viz = arvore.query(np.c_[GLON.ravel(), GLAT.ravel()], k=1)
    mapa = sel[viz].reshape(GLON.shape)
    passos, ini = passos_necessarios(ciclo)
    passos_sin = {p + 9 for p in ini}
    limites = set(ini) | {ini[-1] + 24}     # chuva acumulada só nas viradas de dia
    tarefas = []
    for p in passos:
        for v in ("t_2m", "relhum_2m", "u_10m", "v_10m"):
            tarefas.append((v, p, None))
    for p in limites:
        tarefas.append(("tot_prec", p, None))
    for p in passos_sin:
        tarefas.append(("pmsl", p, None))
        for lv in (850, 200):
            tarefas += [("u", p, lv), ("v", p, lv)]
    def um(t):
        v, p, lv = t
        return t, icon_valores(icon_url(ciclo, v, p, lv))[mapa]
    campos = {}
    with ThreadPoolExecutor(8) as ex:
        for t, val in ex.map(um, tarefas):
            campos[t] = val
    F = {}
    for p in passos:
        F[("t2", p)] = campos[("t_2m", p, None)] - 273.15
        F[("rh2", p)] = campos[("relhum_2m", p, None)]
        F[("ws10", p)] = np.hypot(campos[("u_10m", p, None)], campos[("v_10m", p, None)]) * 3.6
    for p in limites:
        F[("tpacc", p)] = campos[("tot_prec", p, None)]
    for p in passos_sin:
        F[("msl", p)] = campos[("pmsl", p, None)] / 100.0
        for lv in (850, 200):
            F[("u", lv, p)] = campos[("u", p, lv)]; F[("v", lv, p)] = campos[("v", p, lv)]
    return F


# ---------------------------------------------------------------- escolha da rodada
def ciclos_candidatos(agora):
    base = agora.replace(minute=0, second=0, microsecond=0)
    base = base.replace(hour=12 if base.hour >= 12 else 0)
    return [base - dt.timedelta(hours=12 * i) for i in range(5)]


def disponivel(modelo, ciclo):
    passos, _ = passos_necessarios(ciclo)
    ultimo = passos[-1]
    if modelo == "ecmwf":
        return existe(ecmwf_url(ciclo, ultimo, "index"))
    if modelo == "gfs":
        return existe(gfs_idx(ciclo, ultimo))
    if modelo == "icon":
        return existe(icon_url(ciclo, "t_2m", ultimo)) and existe(icon_url(ciclo, "clat", 0, invariante=True))


# ---------------------------------------------------------------- produtos diários
def produtos(F, ciclo):
    _, ini = passos_necessarios(ciclo)
    R = []
    for k, a in enumerate(ini):
        b = a + 24
        horas = [p for p in range(a, b, 3) if ("t2", p) in F]
        P = {"dia": (ciclo + dt.timedelta(hours=a)).date()}
        if horas:
            P["tmax"] = np.nanmax([F[("t2", p)] for p in horas], axis=0)
            P["tmin"] = np.nanmin([F[("t2", p)] for p in horas], axis=0)
            P["urmin"] = np.nanmin([F[("rh2", p)] for p in horas], axis=0)
            P["vento"] = np.nanmax([F[("ws10", p)] for p in horas], axis=0)
        if ("tpacc", b) in F:
            P["chuva"] = np.maximum(F[("tpacc", b)] - F.get(("tpacc", a), 0), 0)
        s = a + 9
        if ("msl", s) in F:
            P["sin"] = {"msl": F[("msl", s)], "u850": F[("u", 850, s)], "v850": F[("v", 850, s)],
                        "u200": F[("u", 200, s)], "v200": F[("v", 200, s)]}
        R.append(P)
    return R


# ---------------------------------------------------------------- desenho
def carregar_regioes():
    with open(os.path.join(AQUI, "regioes_ba.geojson"), encoding="utf-8") as f:
        gj = json.load(f)
    regs = []
    for ft in gj["features"]:
        aneis = [np.array(anel) for poli in ft["geometry"]["coordinates"] for anel in poli]
        regs.append((ft["properties"]["nome"], aneis))
    return regs


REGIOES = carregar_regioes()


def caminho_bahia():
    """Contorno da Bahia (todas as regiões) como um Path único, para recortar o sombreado."""
    verts, codes = [], []
    for _, aneis in REGIOES:
        for anel in aneis:
            verts += anel.tolist()
            codes += [Path.MOVETO] + [Path.LINETO] * (len(anel) - 2) + [Path.CLOSEPOLY]
    return Path(verts, codes)


CAMINHO_BA = caminho_bahia()


def titulos(ax, t1, t2):
    ax.set_title(t1, loc="left", fontsize=11, fontweight="bold", pad=17)
    ax.text(0, 1.012, t2, transform=ax.transAxes, fontsize=8.5, color="#333", va="bottom", ha="left")


def mascara_bahia():
    pts = np.c_[GLON.ravel(), GLAT.ravel()]
    dentro = np.zeros(len(pts), bool)
    for _, aneis in REGIOES:
        for anel in aneis:
            dentro ^= Path(anel).contains_points(pts, radius=0.0)
    return dentro.reshape(GLON.shape)


MASCARA = None

ESTILOS = {
    "chuva": dict(rot="Chuva acumulada no dia (mm)", niveis=[0, 1, 2, 5, 10, 15, 20, 30, 40, 50, 70, 100, 150],
                  cores=["#ffffff", "#d7f0d0", "#a6dba0", "#5aae61", "#1b7837", "#4fb3d9", "#1f78b4", "#08519c",
                         "#6a51a3", "#8e44ad", "#c51b7d", "#7a0177"], ext="max"),
    "tmax": dict(rot="Temperatura máxima (°C)", niveis=list(range(16, 43, 1)), cmap="turbo", ext="both"),
    "tmin": dict(rot="Temperatura mínima (°C)", niveis=list(range(8, 31, 1)), cmap="turbo", ext="both"),
    "urmin": dict(rot="Umidade relativa mínima (%)", niveis=list(range(10, 101, 5)), cmap="BrBG", ext="neither"),
    "vento": dict(rot="Vento máximo a 10 m (km/h)", niveis=list(range(0, 65, 5)), cmap="YlOrRd", ext="max"),
}


def cmap_de(est):
    if "cores" in est:
        cm = ListedColormap(est["cores"])
        cm.set_over(est["cores"][-1])
        return cm
    return plt.get_cmap(est["cmap"], len(est["niveis"]) - 1)


def rotulo_dia(d):
    return f"{DIAS_SEMANA[d.weekday()]} {d.strftime('%d/%m/%Y')}"


def base_mapa(ext, figsize):
    fig = plt.figure(figsize=figsize, dpi=125)
    ax = plt.axes(projection=ccrs.PlateCarree())
    ax.set_extent(ext, crs=ccrs.PlateCarree())
    ax.add_feature(cfeature.OCEAN.with_scale("50m"), facecolor="#eef3f7", zorder=0)
    ax.add_feature(cfeature.LAND.with_scale("50m"), facecolor="#f7f7f4", zorder=0)
    ax.add_feature(cfeature.STATES.with_scale("50m"), edgecolor="#9a9a9a", linewidth=0.5, zorder=3)
    ax.add_feature(cfeature.BORDERS.with_scale("50m"), edgecolor="#555", linewidth=0.7, zorder=3)
    ax.add_feature(cfeature.COASTLINE.with_scale("50m"), edgecolor="#444", linewidth=0.7, zorder=3)
    return fig, ax


def desenha_regioes(ax, nomes=True):
    for nome, aneis in REGIOES:
        maior = max(aneis, key=len)
        for anel in aneis:
            ax.plot(anel[:, 0], anel[:, 1], color="#222", linewidth=0.8, transform=ccrs.PlateCarree(), zorder=4)
        if nomes:
            cx, cy = maior[:, 0].mean(), maior[:, 1].mean()
            ax.text(cx, cy, nome, fontsize=7.5, ha="center", va="center", color="#111", alpha=.8,
                    transform=ccrs.PlateCarree(), zorder=6,
                    bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none", alpha=.55))


def mapa_bahia(campo, var, titulo1, titulo2, arq):
    est = ESTILOS[var]
    cm = cmap_de(est)
    fig, ax = base_mapa(EXT_BA, (8.2, 8.6))
    # sombreado contínuo, recortado no contorno da Bahia
    cs = ax.contourf(LONS, LATS, campo, levels=est["niveis"], cmap=cm, extend=est["ext"],
                     transform=ccrs.PlateCarree(), zorder=1)
    recorte = PathPatch(CAMINHO_BA, transform=ax.transData, facecolor="none", edgecolor="none")
    ax.add_patch(recorte)
    cs.set_clip_path(recorte)
    desenha_regioes(ax)
    for nome, lo, la in CIDADES:
        ax.plot(lo, la, "o", ms=3, color="black", transform=ccrs.PlateCarree(), zorder=7)
        ax.text(lo + 0.08, la + 0.08, nome, fontsize=6.5, transform=ccrs.PlateCarree(), zorder=7)
    cb = fig.colorbar(cs, ax=ax, orientation="horizontal", pad=0.04, fraction=0.045,
                      ticks=est["niveis"][::2] if len(est["niveis"]) > 16 else est["niveis"])
    cb.set_label(est["rot"], fontsize=9); cb.ax.tick_params(labelsize=8)
    titulos(ax, titulo1, titulo2)
    fig.savefig(arq, bbox_inches="tight", pil_kwargs={"optimize": True})
    plt.close(fig)


def mapa_sinotico(sin, tipo, titulo1, titulo2, arq):
    fig, ax = base_mapa(EXT_AS, (9, 7.6))
    if tipo == "pnmm850":
        u, v = sin["u850"], sin["v850"]
        vel = np.hypot(u, v)
        cs = ax.pcolormesh(LONS, LATS, vel, cmap="YlGnBu", norm=BoundaryNorm(list(range(0, 26, 2)), 256),
                           shading="nearest", transform=ccrs.PlateCarree(), zorder=1, alpha=.85)
        ax.streamplot(LONS, LATS, u, v, density=2.2, color="#3b3b3b", linewidth=0.6, arrowsize=0.7,
                      transform=ccrs.PlateCarree(), zorder=2)
        niveis = np.arange(980, 1040, 2)
        msl = sin["msl"]
        msl = gaussian_filter(np.where(np.isfinite(msl), msl, np.nanmean(msl)), 2.5)  # tira o ruído sobre os Andes
        cl = ax.contour(LONS, LATS, msl, levels=niveis, colors="#b30000", linewidths=0.9,
                        transform=ccrs.PlateCarree(), zorder=5)
        ax.clabel(cl, fmt="%d", fontsize=7, inline=True)
        rot = "Vento em 850 hPa (m/s) · isóbaras (hPa) em vermelho"
    else:
        u, v = sin["u200"], sin["v200"]
        vel = np.hypot(u, v)
        cs = ax.pcolormesh(LONS, LATS, vel, cmap="PuRd", norm=BoundaryNorm(list(range(0, 75, 5)), 256),
                           shading="nearest", transform=ccrs.PlateCarree(), zorder=1, alpha=.85)
        ax.streamplot(LONS, LATS, u, v, density=2.4, color="#222", linewidth=0.6, arrowsize=0.7,
                      transform=ccrs.PlateCarree(), zorder=2)
        rot = "Linhas de corrente e vento em 200 hPa (m/s)"
    desenha_regioes(ax, nomes=False)
    cb = fig.colorbar(cs, ax=ax, orientation="horizontal", pad=0.04, fraction=0.045, extend="max")
    cb.set_label(rot, fontsize=9); cb.ax.tick_params(labelsize=8)
    titulos(ax, titulo1, titulo2)
    fig.savefig(arq, bbox_inches="tight", pil_kwargs={"optimize": True})
    plt.close(fig)


NOMES = {"ecmwf": "ECMWF IFS 0,25°", "gfs": "GFS 0,25°", "icon": "ICON 13 km"}


def gerar_modelo(nome, ciclo, F, saida, info):
    P = produtos(F, ciclo)
    rod = f"rodada {ciclo.strftime('%d/%m %H')} UTC"
    feitos = 0
    for k, d in enumerate(P):
        for var in ("chuva", "tmax", "tmin", "urmin", "vento"):
            if var in d:
                mapa_bahia(d[var], var, f"{NOMES[nome]} · {ESTILOS[var]['rot']}", f"{rotulo_dia(d['dia'])} · {rod}",
                           os.path.join(saida, f"{nome}_{var}_d{k}.png")); feitos += 1
        if "sin" in d:
            hora = f"{rotulo_dia(d['dia'])} 12 UTC (09h) · {rod}"
            mapa_sinotico(d["sin"], "pnmm850", f"{NOMES[nome]} · Pressão e vento em 850 hPa", hora,
                          os.path.join(saida, f"{nome}_pnmm850_d{k}.png"))
            mapa_sinotico(d["sin"], "v200", f"{NOMES[nome]} · Escoamento em 200 hPa", hora,
                          os.path.join(saida, f"{nome}_v200_d{k}.png"))
            feitos += 2
    info["modelos"][nome] = {"rodada": ciclo.strftime("%Y-%m-%dT%HZ"), "mapas": feitos,
                             "dias": [d["dia"].isoformat() for d in P]}
    log(f"{nome}: {feitos} mapas")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--saida", default="saida")
    a = ap.parse_args()
    os.makedirs(a.saida, exist_ok=True)
    global MASCARA
    MASCARA = mascara_bahia()

    agora = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)
    cands = ciclos_candidatos(agora)
    disp = {m: [c for c in cands if disponivel(m, c)] for m in ("ecmwf", "gfs", "icon")}
    for m, cs in disp.items():
        log(m, "rodadas disponíveis:", [c.strftime("%d/%m %HZ") for c in cs])
    comuns = [c for c in cands if all(c in disp[m] for m in disp)]
    escolha = {}
    for m in disp:
        if comuns:
            escolha[m] = comuns[0]          # mesma rodada para os 3: comparação justa
        elif disp[m]:
            escolha[m] = disp[m][0]
    info = {"gerado_em": dt.datetime.now(dt.timezone(dt.timedelta(hours=-3))).strftime("%Y-%m-%dT%H:%M-03:00"),
            "rodada_comum": comuns[0].strftime("%Y-%m-%dT%HZ") if comuns else None,
            "modelos": {}, "erros": {},
            "variaveis": {"chuva": ESTILOS["chuva"]["rot"], "tmax": ESTILOS["tmax"]["rot"], "tmin": ESTILOS["tmin"]["rot"],
                          "urmin": ESTILOS["urmin"]["rot"], "vento": ESTILOS["vento"]["rot"],
                          "pnmm850": "Pressão ao nível do mar e vento em 850 hPa (12 UTC)",
                          "v200": "Linhas de corrente e vento em 200 hPa (12 UTC)"}}

    for m, f in (("gfs", modelo_gfs), ("ecmwf", modelo_ecmwf), ("icon", modelo_icon)):
        if m not in escolha:
            info["erros"][m] = "nenhuma rodada disponível"; continue
        try:
            log(f"{m}: baixando rodada {escolha[m]:%d/%m %HZ}")
            F = f(escolha[m])
            gerar_modelo(m, escolha[m], F, a.saida, info)
            if m == "gfs" and ("msl", 0) in F:
                sin = {"msl": F[("msl", 0)], "u850": F[("u", 850, 0)], "v850": F[("v", 850, 0)]}
                mapa_sinotico(sin, "pnmm850", "Análise GFS · Pressão e vento em 850 hPa",
                              f"{escolha[m]:%d/%m/%Y %H} UTC (hora 0 da rodada)",
                              os.path.join(a.saida, "analise_gfs.png"))
                info["analise"] = escolha[m].strftime("%Y-%m-%dT%HZ")
            del F
        except Exception as e:
            traceback.print_exc()
            info["erros"][m] = f"{type(e).__name__}: {e}"[:300]

    with open(os.path.join(a.saida, "info.json"), "w", encoding="utf-8") as f:
        json.dump(info, f, ensure_ascii=False, indent=1)
    log("info:", json.dumps({k: info[k] for k in ("rodada_comum", "erros")}, ensure_ascii=False))
    if not info["modelos"]:
        sys.exit("nenhum modelo gerado")


if __name__ == "__main__":
    main()
