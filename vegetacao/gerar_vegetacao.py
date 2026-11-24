"""
Saúde da vegetação por município da Bahia (NOAA STAR Blended VHP, 4 km, semanal) — gera vegetacao/semanal.json.

Índices (NOAA/NESDIS, Kogan): VCI (condição da vegetação, 0–100, NDVI em relação aos extremos históricos da mesma semana),
TCI (condição térmica, 0–100), VHI (saúde da vegetação = média de VCI e TCI) e SMN (NDVI suavizado).
Para cada município: média dos pixels ponderada pela área (subgrade 3×3 por pixel) e % da área com VHI < 40 (estresse)
e VHI < 20 (estresse severo/extremo).
O arquivo de saída também é o cache: cada rodada só lê as semanas que faltam.
"""
import datetime as dt
import json
import math
import os
import re
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
PASTA = os.path.join(RAIZ, "vegetacao")
GEO = os.path.join(RAIZ, "extremos", "municipios_ba.geojson")
STAR = "https://www.star.nesdis.noaa.gov/pub/corp/scsb/wguo/data/Blended_VH_4km/geo_TIFF/"
UA = {"User-Agent": "inema-vegetacao/1.0 (github actions)"}
F = 3
NSEM = 110          # semanas guardadas (~2 anos, para comparar com o mesmo período do ano anterior)
VARS = {"vhi": ("VH", "VHI"), "vci": ("VH", "VCI"), "tci": ("VH", "TCI"), "ndvi": ("SM", "SMN")}
FUSO = dt.timezone(dt.timedelta(hours=-3))

os.environ.setdefault("GDAL_DISABLE_READDIR_ON_OPEN", "EMPTY_DIR")
os.environ.setdefault("CPL_VSIL_CURL_ALLOWED_EXTENSIONS", ".tif")
os.environ.setdefault("GDAL_HTTP_MAX_RETRY", "4")
os.environ.setdefault("GDAL_HTTP_RETRY_DELAY", "3")
os.environ.setdefault("GDAL_HTTP_TIMEOUT", "120")
os.environ.setdefault("GDAL_HTTP_USERAGENT", UA["User-Agent"])


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


def baixa(url, tentativas=4, timeout=180):
    erro = None
    for i in range(tentativas):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                raise
            erro = e
        except Exception as e:  # noqa
            erro = e
        time.sleep(5 * (i + 1))
    raise RuntimeError(f"falhou: {url} ({erro})")


def municipios():
    with open(GEO, encoding="utf-8") as f:
        gj = json.load(f)
    nomes, geoms, xs, ys = [], [], [], []
    for ft in gj["features"]:
        nomes.append(ft["properties"]["nome"]); geoms.append(ft["geometry"])
        def anda(c):
            if isinstance(c[0], (int, float)):
                xs.append(c[0]); ys.append(c[1])
            else:
                for x in c:
                    anda(x)
        anda(ft["geometry"]["coordinates"])
    return nomes, geoms, (min(xs) - 0.1, min(ys) - 0.1, max(xs) + 0.1, max(ys) + 0.1)


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
            else:
                cx, cy = centroide(geoms[i])
                c = min(max(int((cx - t.c) / t.a), 0), w - 1)
                r = min(max(int((cy - t.f) / t.e), 0), h - 1)
                self.pix.append(np.array([r * w + c])); self.w.append(np.array([1.0]))

    def media(self, arr, casas):
        v = arr.ravel(); out = []
        for p, w in zip(self.pix, self.w):
            x = v[p]; ok = np.isfinite(x)
            out.append(round(float(np.sum(x[ok] * w[ok]) / np.sum(w[ok])), casas) if ok.any() else None)
        return out

    def fracao(self, arr, limite):
        v = arr.ravel(); out = []
        for p, w in zip(self.pix, self.w):
            x = v[p]; ok = np.isfinite(x)
            out.append(round(float(100 * np.sum(w[ok] * (x[ok] < limite)) / np.sum(w[ok]))) if ok.any() else None)
        return out


def recorte(ds, caixa):
    oeste, sul, leste, norte = caixa
    t = ds.transform
    c0 = int(math.floor((oeste - t.c) / t.a)); r0 = int(math.floor((t.f - norte) / -t.e))
    nc = int(math.ceil((leste - oeste) / t.a)); nr = int(math.ceil((norte - sul) / -t.e))
    if c0 < 0 or r0 < 0 or c0 + nc > ds.width or r0 + nr > ds.height:
        raise RuntimeError(f"janela fora da grade ({c0},{r0},{nc},{nr}) em {ds.width}x{ds.height}")
    win = Window(c0, r0, nc, nr)
    arr = ds.read(1, window=win).astype("float32")
    if ds.nodata is not None:
        arr[arr == ds.nodata] = np.nan
    return arr, win_transform(win, t), nr, nc


def le(url, caixa):
    """Lê a janela da Bahia: primeiro por faixas de bytes (GDAL /vsicurl/); se falhar, baixa o arquivo inteiro."""
    try:
        with rasterio.open("/vsicurl/" + url) as ds:
            return recorte(ds, caixa)
    except Exception as e:  # noqa
        log(f"  leitura por faixas falhou ({str(e)[:120]}); baixando inteiro: {url.rsplit('/', 1)[-1]}")
    raw = baixa(url, timeout=600)
    with rasterio.MemoryFile(raw) as mf, mf.open() as ds:
        return recorte(ds, caixa)


def data_semana(ano, sem):
    """Semana NOAA VHP: aproximada como 7 dias a partir de 1º de janeiro; devolve o dia central (ISO)."""
    return (dt.date(ano, 1, 1) + dt.timedelta(days=7 * (sem - 1) + 3)).isoformat()


def main():
    nomes, geoms, caixa = municipios()
    h = baixa(STAR).decode("utf-8", "replace")
    arqs = {}
    for m in re.finditer(r'href="(VHP\.G04\.C07\.(\w+)\.P(\d{4})(\d{3})\.(VH|SM)\.(VHI|VCI|TCI|SMN)\.tif)"', h):
        arqs[(int(m.group(3)), int(m.group(4)), m.group(6))] = m.group(1)
    semanas = sorted({(a, s) for a, s, v in arqs if all((a, s, VARS[k][1]) in arqs for k in VARS)})
    if not semanas:
        raise SystemExit("nenhuma semana completa listada")
    semanas = semanas[-NSEM:]
    log(f"{len(nomes)} municípios; {len(semanas)} semanas completas ({semanas[0]}–{semanas[-1]})")
    velho = None
    try:
        with open(os.path.join(PASTA, "semanal.json"), encoding="utf-8") as f:
            velho = json.load(f)
    except Exception:  # noqa
        pass
    cache = {}
    if velho and velho.get("mun") == nomes:
        for j, s in enumerate(velho["semanas"]):
            cache[tuple(s)] = {k: [velho[k][i][j] for i in range(len(nomes))] for k in ("vhi", "vci", "tci", "ndvi", "est", "sev")}
    faltam = [s for s in semanas if s not in cache] + [s for s in semanas[-1:] if s in cache]
    faltam = sorted(set(faltam))
    log(f"lendo {len(faltam)} semanas")
    area = None

    def uma(s):
        out = {}
        for k, (_, var) in VARS.items():
            arr, t, nr, nc = le(STAR + arqs[(s[0], s[1], var)], caixa)
            if k == "ndvi":
                arr[(arr < -0.3) | (arr > 1)] = np.nan
            else:
                arr[(arr < 0) | (arr > 100)] = np.nan
            p = Pesos.para(t, nr, nc, geoms)
            out[k] = p.media(arr, 3 if k == "ndvi" else 1)
            if k == "vhi":
                out["est"] = p.fracao(arr, 40)
                out["sev"] = p.fracao(arr, 20)
            out["_area"] = p.area
        return s, out

    feitos = 0
    with ThreadPoolExecutor(4) as ex:
        for s, out in ex.map(uma, faltam):
            area = out.pop("_area")
            cache[s] = out
            feitos += 1
            if feitos % 10 == 0:
                log(f"  {feitos}/{len(faltam)}")
    if area is None and velho:
        area = np.array(velho["area"])
    doc = {"gerado_em": dt.datetime.now(FUSO).isoformat(timespec="minutes"),
           "fonte": "NOAA/NESDIS STAR Blended Vegetation Health Products (VHP), 4 km, semanal; média ponderada pela área do município",
           "mun": nomes, "area": [round(float(a), 1) for a in area],
           "semanas": [list(s) for s in semanas], "datas": [data_semana(*s) for s in semanas]}
    for k in ("vhi", "vci", "tci", "ndvi", "est", "sev"):
        doc[k] = [[cache[s][k][i] for s in semanas] for i in range(len(nomes))]
    os.makedirs(PASTA, exist_ok=True)
    destino = os.path.join(PASTA, "semanal.json")
    with open(destino + ".tmp", "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(destino + ".tmp", destino)
    i = nomes.index("Salvador") if "Salvador" in nomes else 0
    log(f"OK: semanal.json ({os.path.getsize(destino) // 1024} KB) | {nomes[i]} VHI últimas 4: {doc['vhi'][i][-4:]} NDVI {doc['ndvi'][i][-4:]}")


if __name__ == "__main__":
    main()
