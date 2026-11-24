"""
Chuva observada por município da Bahia (CHIRPS v3.0, Climate Hazards Center / UCSB) — gera chuva/mensal.json e chuva/diario.json.

  mensal.json  série mensal desde jan/1981 (CHIRPS v3 final, recorte América Latina, 0,05°) por município,
               + meses ainda sem versão final, somados a partir dos dados diários (parciais).
  diario.json  últimos 365 dias (CHIRPS v3 diário "sat": final quando existe, senão preliminar) por município.

Valor do município = média dos pixels de 0,05° (~5,5 km) ponderada pela área do município dentro de cada pixel
(subgrade 4×4 por pixel). Municípios muito pequenos usam o pixel do centro.
Os arquivos de saída também servem de cache: cada rodada só lê os meses/dias que faltam (e revisa os mais recentes).
Cada GeoTIFF é baixado inteiro e recortado em memória na janela da Bahia.
"""
import datetime as dt
import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import rasterio
from rasterio import features
from rasterio.transform import Affine
from rasterio.windows import Window
from rasterio.windows import transform as win_transform

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA = os.path.join(RAIZ, "chuva")
GEO = os.path.join(RAIZ, "extremos", "municipios_ba.geojson")
CHC = "https://data.chc.ucsb.edu/products/CHIRPS/v3.0/"
UA = {"User-Agent": "inema-chuva/1.0 (github actions)"}
F = 4               # subgrade por pixel para o peso de área
NDIAS = 365         # dias guardados em diario.json
REVISA_MESES = 2    # meses finais relidos a cada rodada (revisões)
FUSO = dt.timezone(dt.timedelta(hours=-3))

os.environ.setdefault("GDAL_DISABLE_READDIR_ON_OPEN", "EMPTY_DIR")
os.environ.setdefault("CPL_VSIL_CURL_ALLOWED_EXTENSIONS", ".tif")
os.environ.setdefault("GDAL_HTTP_MAX_RETRY", "5")
os.environ.setdefault("GDAL_HTTP_RETRY_DELAY", "3")
os.environ.setdefault("GDAL_HTTP_USERAGENT", UA["User-Agent"])
os.environ.setdefault("VSI_CACHE", "FALSE")


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


def baixa(url, tentativas=5, timeout=60):
    erro = None
    for i in range(tentativas):
        t0 = time.time()
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                partes = []
                while True:
                    b = r.read(1 << 20)
                    if not b:
                        break
                    partes.append(b)
                    if time.time() - t0 > 240:
                        raise TimeoutError("download lento demais (> 240 s)")
                return b"".join(partes)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                raise
            erro = e
        except Exception as e:  # noqa
            erro = e
        log(f"  tentativa {i + 1} falhou em {time.time() - t0:.0f} s: {str(erro)[:100]} — {url.rsplit('/', 1)[-1]}")
        time.sleep(5 * (i + 1))
    raise RuntimeError(f"falhou: {url} ({erro})")


def lista(url):
    """Nomes de arquivo .tif de uma listagem de diretório HTTP (vazio se o diretório não existe)."""
    log(f"listando {url.replace(CHC, '')}")
    try:
        h = baixa(url).decode("utf-8", "replace")
    except urllib.error.HTTPError:
        return []
    return sorted(set(re.findall(r'href="([^"/?]+\.tif)"', h)))


# ------------------------------------------------------------ municípios e pesos
def municipios():
    with open(GEO, encoding="utf-8") as f:
        gj = json.load(f)
    nomes, geoms, xs, ys = [], [], [], []
    for ft in gj["features"]:
        nomes.append(ft["properties"]["nome"])
        geoms.append(ft["geometry"])
        def anda(c):
            if isinstance(c[0], (int, float)):
                xs.append(c[0]); ys.append(c[1])
            else:
                for x in c:
                    anda(x)
        anda(ft["geometry"]["coordinates"])
    caixa = (min(xs) - 0.1, min(ys) - 0.1, max(xs) + 0.1, max(ys) + 0.1)   # oeste, sul, leste, norte
    return nomes, geoms, caixa


def centroide(g):
    pts = []
    def anda(c):
        if isinstance(c[0], (int, float)):
            pts.append(c)
        else:
            for x in c:
                anda(x)
    anda(g["coordinates"])
    a = np.array(pts)
    return a[:, 0].mean(), a[:, 1].mean()


class Pesos:
    """Pixels e pesos de cada município para uma grade (transform + forma da janela)."""
    cache = {}

    @classmethod
    def para(cls, t, h, w, geoms):
        k = (round(t.c, 6), round(t.f, 6), round(t.a, 6), round(t.e, 6), h, w)
        if k not in cls.cache:
            cls.cache[k] = cls(t, h, w, geoms)
        return cls.cache[k]

    def __init__(self, t, h, w, geoms):
        sub = features.rasterize([(g, i + 1) for i, g in enumerate(geoms)], out_shape=(h * F, w * F),
                                 transform=Affine(t.a / F, 0, t.c, 0, t.e / F, t.f), fill=0, dtype="int32")
        rr, cc = np.nonzero(sub)
        ids = sub[rr, cc] - 1
        pix = (rr // F) * w + (cc // F)
        # área de cada subcélula (km²) pela latitude da linha
        lat = t.f + (rr + 0.5) * t.e / F
        area_sub = (abs(t.a) / F * 111.32 * np.cos(np.radians(lat))) * (abs(t.e) / F * 110.57)
        n = len(geoms)
        self.area = np.bincount(ids, weights=area_sub, minlength=n)
        chave = ids.astype(np.int64) * (h * w) + pix
        u, cont = np.unique(chave, return_counts=True)
        uid, upix = u // (h * w), u % (h * w)
        self.pix, self.w = [], []
        for i in range(n):
            sel = uid == i
            if sel.any():
                self.pix.append(upix[sel]); self.w.append(cont[sel].astype(float))
            else:   # município menor que a subgrade: pixel do centro
                cx, cy = centroide(geoms[i])
                c = min(max(int((cx - t.c) / t.a), 0), w - 1)
                r = min(max(int((cy - t.f) / t.e), 0), h - 1)
                self.pix.append(np.array([r * w + c])); self.w.append(np.array([1.0]))

    def medias(self, arr):
        v = arr.ravel()
        out = []
        for p, w in zip(self.pix, self.w):
            x = v[p]; ok = np.isfinite(x)
            out.append(round(float(np.sum(x[ok] * w[ok]) / np.sum(w[ok])), 1) if ok.any() else None)
        return out


def le_janela(url, caixa, geoms):
    """Baixa o GeoTIFF (o índice do TIFF fica no fim do arquivo, então a leitura por faixas é lenta e instável),
    recorta a janela da Bahia em memória e devolve (médias por município, Pesos)."""
    oeste, sul, leste, norte = caixa
    for tentativa in range(4):
        try:
            raw = baixa(url, timeout=300)
            with rasterio.MemoryFile(raw) as mf, mf.open() as ds:
                t = ds.transform
                c0 = int(math.floor((oeste - t.c) / t.a)); r0 = int(math.floor((t.f - norte) / -t.e))
                nc = int(math.ceil((leste - oeste) / t.a)); nr = int(math.ceil((norte - sul) / -t.e))
                win = Window(c0, r0, nc, nr)
                if c0 < 0 or r0 < 0 or c0 + nc > ds.width or r0 + nr > ds.height:
                    raise RuntimeError(f"janela fora da grade ({c0},{r0},{nc},{nr}) em {ds.width}x{ds.height}")
                arr = ds.read(1, window=win).astype("float32")
                nd = ds.nodata
                wt = win_transform(win, t)
            if nd is not None:
                arr[arr == nd] = np.nan
            arr[arr < 0] = np.nan
            p = Pesos.para(wt, nr, nc, geoms)
            return p.medias(arr), p
        except Exception as e:  # noqa
            if tentativa == 3:
                raise
            log(f"  nova tentativa ({e}) {url}")
            time.sleep(5 * (tentativa + 1))


def carrega(nome):
    try:
        with open(os.path.join(PASTA, nome), encoding="utf-8") as f:
            return json.load(f)
    except Exception:  # noqa
        return None


def salva(nome, doc):
    os.makedirs(PASTA, exist_ok=True)
    destino = os.path.join(PASTA, nome)
    with open(destino + ".tmp", "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(destino + ".tmp", destino)
    log(f"salvo {nome} ({os.path.getsize(destino) // 1024} KB)")


def mes_seq(a, b):
    """Lista 'AAAA-MM' de a até b (inclusive)."""
    y, m = map(int, a.split("-")); yb, mb = map(int, b.split("-"))
    out = []
    while (y, m) <= (yb, mb):
        out.append(f"{y:04d}-{m:02d}")
        m += 1
        if m > 12:
            y, m = y + 1, 1
    return out


# ------------------------------------------------------------ série mensal
def mensal(nomes, geoms, caixa):
    arqs = lista(CHC + "monthly/latam/tifs/")
    meses = sorted(f"{m.group(1)}-{m.group(2)}" for a in arqs for m in [re.match(r"chirps-v3\.0\.(\d{4})\.(\d{2})\.tif$", a)] if m)
    if not meses:
        raise SystemExit("listagem mensal vazia")
    velho = carrega("mensal.json")
    serie = {}
    if velho and velho.get("mun") == nomes:
        for j, mes in enumerate(mes_seq(velho["inicio"], velho["fim"])):
            serie[mes] = [velho["v"][i][j] for i in range(len(nomes))]
    faltam = [m for m in meses if m not in serie] + [m for m in meses[-REVISA_MESES:] if m in serie]
    faltam = sorted(set(faltam))
    log(f"mensal: {len(meses)} meses disponíveis ({meses[0]}–{meses[-1]}), lendo {len(faltam)}")
    area = None

    def um(mes):
        y, m = mes.split("-")
        return mes, le_janela(f"{CHC}monthly/latam/tifs/chirps-v3.0.{y}.{m}.tif", caixa, geoms)

    feitos = 0
    with ThreadPoolExecutor(4) as ex:
        for mes, (vals, p) in ex.map(um, faltam):
            serie[mes] = vals
            area = p.area
            feitos += 1
            if feitos % 25 == 0:
                log(f"  {feitos}/{len(faltam)}")
    if area is None and velho:
        area = np.array(velho["area"])
    if area is None:   # nada novo e sem cache: lê o último mês só para obter as áreas
        _, p = le_janela(f"{CHC}monthly/latam/tifs/chirps-v3.0.{meses[-1].replace('-', '.')}.tif", caixa, geoms)
        area = p.area
    seq = mes_seq(meses[0], meses[-1])
    v = [[serie.get(mes, [None] * len(nomes))[i] for mes in seq] for i in range(len(nomes))]
    sal = next((m for m in ("Salvador",) if m in nomes), nomes[0])
    i = nomes.index(sal)
    log(f"mensal: {sal} últimos 3 meses {v[i][-3:]}")
    return {"inicio": seq[0], "fim": seq[-1], "mun": nomes, "area": [round(float(a), 1) for a in area], "v": v}


# ------------------------------------------------------------ série diária (últimos 365 dias)
def diario(nomes, geoms, caixa):
    hoje = dt.datetime.now(dt.timezone.utc).date()
    ini = hoje - dt.timedelta(days=NDIAS + 40)
    finais, prelim = {}, {}
    for ano in range(ini.year, hoje.year + 1):
        for a in lista(f"{CHC}daily/final/sat/{ano}/"):
            m = re.match(r"chirps-v3\.0\.sat\.(\d{4})\.(\d{2})\.(\d{2})\.tif$", a)
            if m:
                finais[f"{m.group(1)}-{m.group(2)}-{m.group(3)}"] = f"{CHC}daily/final/sat/{ano}/{a}"
        for a in lista(f"{CHC}daily/prelim/sat/{ano}/"):
            m = re.match(r"chirps-v3\.0\.prelim\.(\d{4})\.(\d{2})\.(\d{2})\.tif$", a)
            if m:
                prelim[f"{m.group(1)}-{m.group(2)}-{m.group(3)}"] = f"{CHC}daily/prelim/sat/{ano}/{a}"
    todos = sorted(set(finais) | set(prelim))
    if not todos:
        raise RuntimeError("nenhum arquivo diário listado")
    fim = dt.date.fromisoformat(todos[-1])
    dias = [(fim - dt.timedelta(days=k)).isoformat() for k in range(NDIAS - 1, -1, -1)]
    velho = carrega("diario.json")
    cache = {}
    if velho and velho.get("mun") == nomes:
        d0 = dt.date.fromisoformat(velho["inicio"])
        for j in range(len(velho["tipo"])):
            dia = (d0 + dt.timedelta(days=j)).isoformat()
            if velho["tipo"][j] in "fp":
                cache[dia] = (velho["tipo"][j], [velho["v"][i][j] for i in range(len(nomes))])
    ler = []
    for dia in dias:
        if dia in finais:
            if dia not in cache or cache[dia][0] != "f":
                ler.append((dia, "f", finais[dia]))
        elif dia in prelim:
            if dia not in cache or cache[dia][0] != "p":
                ler.append((dia, "p", prelim[dia]))
    log(f"diário: {len(dias)} dias até {dias[-1]}, lendo {len(ler)} arquivos")

    def um(x):
        dia, tp, url = x
        return dia, tp, le_janela(url, caixa, geoms)[0]

    feitos = 0
    with ThreadPoolExecutor(4) as ex:
        for dia, tp, vals in ex.map(um, ler):
            cache[dia] = (tp, vals)
            feitos += 1
            if feitos % 50 == 0:
                log(f"  {feitos}/{len(ler)}")
    tipo = "".join(cache[d][0] if d in cache else "-" for d in dias)
    v = [[cache[d][1][i] if d in cache else None for d in dias] for i in range(len(nomes))]
    return {"inicio": dias[0], "fim": dias[-1], "tipo": tipo, "mun": nomes, "v": v}


def parciais(men, dia):
    """Meses posteriores ao último mês final, somados a partir do diário (um por mês, com o último dia coberto)."""
    out = []
    d0 = dt.date.fromisoformat(dia["inicio"])
    ndias = len(dia["tipo"])
    datas = [d0 + dt.timedelta(days=j) for j in range(ndias)]
    y, m = map(int, men["fim"].split("-"))
    m += 1
    if m > 12:
        y, m = y + 1, 1
    while (y, m) <= (datas[-1].year, datas[-1].month):
        idx = [j for j, d in enumerate(datas) if d.year == y and d.month == m and dia["tipo"][j] in "fp"]
        if not idx:
            break
        ultimo = datas[idx[-1]]
        prox = dt.date(y + (m == 12), 1 if m == 12 else m + 1, 1)
        completo = ultimo == prox - dt.timedelta(days=1) and len(idx) == (prox - dt.date(y, m, 1)).days
        vals = []
        for i in range(len(men["mun"])):
            xs = [dia["v"][i][j] for j in idx]
            vals.append(None if any(x is None for x in xs) else round(sum(xs), 1))
        out.append({"mes": f"{y:04d}-{m:02d}", "ate": ultimo.isoformat(), "completo": completo,
                    "preliminar": any(dia["tipo"][j] == "p" for j in idx), "v": vals})
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)
    return out


def main():
    nomes, geoms, caixa = municipios()
    log(f"{len(nomes)} municípios; janela {caixa}")
    agora = dt.datetime.now(FUSO).isoformat(timespec="minutes")
    erros = {}
    men = mensal(nomes, geoms, caixa)
    try:
        dia = diario(nomes, geoms, caixa)
    except Exception as e:  # noqa
        erros["diario"] = f"{type(e).__name__}: {e}"[:300]
        log("diário falhou:", erros["diario"])
        dia = carrega("diario.json")
    fonte = "CHIRPS v3.0 (Climate Hazards Center, UCSB), 0,05°; média ponderada pela área do município em cada pixel"
    men.update({"gerado_em": agora, "fonte": fonte, "normal": "1991-2020",
                "parciais": parciais(men, dia) if dia else [], "erros": erros})
    salva("mensal.json", men)
    if dia:
        dia.update({"gerado_em": agora, "fonte": fonte + "; diário 'sat' (distribuição diária pelo IMERG), f = final, p = preliminar"})
        salva("diario.json", dia)
    log("OK", json.dumps({"mensal": [men["inicio"], men["fim"]], "parciais": [(p["mes"], p["ate"]) for p in men["parciais"]],
                         "diario": [dia["inicio"], dia["fim"]] if dia else None, "erros": erros}))


if __name__ == "__main__":
    main()
