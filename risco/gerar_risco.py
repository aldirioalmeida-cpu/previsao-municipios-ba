"""
Risco de incêndio em vegetação por município da Bahia — INEMA.

Dois modos:
  --calibrar     baixa o clima diário de 2003 até hoje (NASA POWER, reanálise MERRA-2/GEOS) nos 417 municípios, calcula os
                 índices e calibra, com os focos do satélite de referência do INPE (AQUA, tarde), um modelo logístico por
                 região. Valida em anos que o modelo não viu (treino 2003–2019, teste 2020 em diante) e grava
                 risco/calibracao.json (coeficientes, linhas de base, limites das classes e métricas de acerto).
  (padrão)       operação diária: últimos 300 dias (NASA POWER) + análise e previsão de 7 dias (Open-Meteo, corrigida para
                 o padrão da NASA POWER em cada município) -> risco/risco.json para o painel.

Índices calculados (todos por município, diários):
  FWI  — Sistema canadense de Índice Meteorológico de Perigo de Incêndio (Van Wagner, 1987): FFMC, DMC, DC, ISI, BUI, FWI.
  FMA+ — Fórmula de Monte Alegre alterada (Nunes et al., 2006).
  Dias seguidos sem chuva (< 2 mm), chuva acumulada em 30 e 90 dias.
O "risco calibrado" é a probabilidade, estimada pelo modelo, de o satélite de referência detectar ao menos um foco no
município naquele dia, considerando o histórico do município no mês (linha de base) e as condições do dia.
"""
import argparse
import datetime as dt
import json
import math
import os
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA = os.path.join(RAIZ, "risco")
REPO = os.environ.get("GITHUB_REPOSITORY", "aldirioalmeida-cpu/previsao-municipios-ba")
FOCOS = f"https://raw.githubusercontent.com/{REPO}/focos/"
POWER = "https://power.larc.nasa.gov/api/temporal/daily/point"
OM = "https://api.open-meteo.com/v1/forecast"
UA = {"User-Agent": "inema-risco-incendio/1.0 (github actions)"}
FUSO = dt.timezone(dt.timedelta(hours=-3))
INICIO_CAL = dt.date(2003, 1, 1)
ANO_TESTE = 2020
NOMES_CLASSES = ["Baixo", "Moderado", "Alto", "Muito alto", "Extremo"]
QUANTIS = [0.50, 0.75, 0.90, 0.97]
FEATS = ["linha_base", "ffmc", "dmc", "dc", "isi", "fwi", "ur", "tmax", "vento", "chuva_dia", "chuva30", "chuva90", "dias_secos", "fma", "focos_7d"]
N_METEO = len(FEATS) - 1   # as primeiras N_METEO variáveis formam o modelo "só meteorológico" (sem focos recentes)


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


def norm(s):
    s = unicodedata.normalize("NFD", str(s))
    return " ".join("".join(c for c in s if unicodedata.category(c) != "Mn").upper().replace("'", " ").replace("-", " ").split())


def baixa(url, tentativas=5, timeout=180):
    erro = None
    for i in range(tentativas):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            erro = e
            if e.code in (400, 404):
                raise
        except Exception as e:  # noqa
            erro = e
        log(f"  tentativa {i + 1} falhou: {str(erro)[:120]}")
        time.sleep(6 * (i + 1))
    raise RuntimeError(f"falhou: {url[:120]} ({erro})")


# ------------------------------------------------------------------ municípios
def municipios():
    with open(os.path.join(RAIZ, "focos", "municipios.json"), encoding="utf-8") as f:
        m = json.load(f)
    return m["municipios"], m["regioes"], m["territorios"]


# ------------------------------------------------------------------ NASA POWER
def power_ponto(la, lo, d0, d1):
    q = {"parameters": "T2M_MAX,T2MDEW,WS10M,PRECTOTCORR", "community": "AG", "latitude": f"{la:.4f}", "longitude": f"{lo:.4f}",
         "start": d0.strftime("%Y%m%d"), "end": d1.strftime("%Y%m%d"), "format": "JSON"}
    j = json.loads(baixa(POWER + "?" + urllib.parse.urlencode(q), timeout=300))
    p = j["properties"]["parameter"]
    n = (d1 - d0).days + 1
    out = {}
    for k in ("T2M_MAX", "T2MDEW", "WS10M", "PRECTOTCORR"):
        a = np.full(n, np.nan, np.float32)
        for ds, v in p[k].items():
            i = (dt.date(int(ds[:4]), int(ds[4:6]), int(ds[6:])) - d0).days
            if 0 <= i < n and v is not None and v > -900:
                a[i] = v
        out[k] = a
    return out


POWER_REG = "https://power.larc.nasa.gov/api/temporal/daily/regional"
CAIXA = {"latitude-min": -18.5, "latitude-max": -8.5, "longitude-min": -46.7, "longitude-max": -37.2}


def power_todos(muns, d0, d1):
    """Clima diário da NASA POWER pela API regional (grade 0,5° × 0,625°, uma requisição por variável e ano).
    Cada município recebe o valor da célula da grade que o contém — o mesmo que a API por ponto devolve."""
    n = (d1 - d0).days + 1
    lat = np.array([m["la"] for m in muns]); lon = np.array([m["lo"] for m in muns])
    out = {}
    for par in ("T2M_MAX", "T2MDEW", "WS10M", "PRECTOTCORR"):
        arr = np.full((n, len(muns)), np.nan, np.float32)
        a = d0
        while a <= d1:
            b = min(dt.date(a.year, 12, 31), d1)
            q = dict(CAIXA, parameters=par, community="AG", start=a.strftime("%Y%m%d"), end=b.strftime("%Y%m%d"), format="JSON")
            j = json.loads(baixa(POWER_REG + "?" + urllib.parse.urlencode(q), timeout=300))
            pts = j["features"]
            plo = np.array([f["geometry"]["coordinates"][0] for f in pts]); pla = np.array([f["geometry"]["coordinates"][1] for f in pts])
            ula, ulo = np.unique(pla), np.unique(plo)
            chave = {(round(float(x), 4), round(float(y), 4)): k for k, (x, y) in enumerate(zip(pla, plo))}
            viz = np.array([chave[(round(float(ula[np.argmin(np.abs(ula - la))]), 4), round(float(ulo[np.argmin(np.abs(ulo - lo))]), 4))]
                            for la, lo in zip(lat, lon)])
            series = []
            for f in pts:
                s = np.full((b - a).days + 1, np.nan, np.float32)
                for ds, v in f["properties"]["parameter"][par].items():
                    k = (dt.date(int(ds[:4]), int(ds[4:6]), int(ds[6:])) - a).days
                    if 0 <= k < len(s) and v is not None and v > -900:
                        s[k] = v
                series.append(s)
            series = np.array(series)            # (pontos, dias)
            o = (a - d0).days
            arr[o:o + series.shape[1], :] = series[viz].T
            a = b + dt.timedelta(days=1)
            time.sleep(1.5)
        out[par] = arr
        log(f"  NASA POWER {par}: {d0}–{d1} ok")
    T = out["T2M_MAX"]
    return T, umidade(T, out["T2MDEW"]), out["WS10M"] * 3.6, out["PRECTOTCORR"]


def umidade(T, Td):
    es = lambda t: 6.112 * np.exp(17.62 * t / (243.12 + t))   # noqa: E731
    return np.clip(100 * es(Td) / es(T), 5, 100).astype(np.float32)


def ultimo_valido(*arrs):
    ok = np.ones(arrs[0].shape[0], bool)
    for a in arrs:
        ok &= np.isfinite(a).mean(axis=1) > 0.9
    idx = np.where(ok)[0]
    return int(idx[-1]) if len(idx) else -1


def preenche(a):
    """Preenche falhas isoladas com o valor do dia anterior (ou do seguinte, no início)."""
    a = a.copy()
    for j in range(1, a.shape[0]):
        m = ~np.isfinite(a[j]); a[j, m] = a[j - 1, m]
    for j in range(a.shape[0] - 2, -1, -1):
        m = ~np.isfinite(a[j]); a[j, m] = a[j + 1, m]
    return a


# ------------------------------------------------------------------ índices
ELL04 = [11.5, 10.5, 9.2, 7.9, 6.8, 6.2, 6.5, 7.4, 8.7, 10.0, 11.2, 11.8]   # fator de duração do dia, latitude 10–30°S


def indices(T, H, W, P, datas, lat):
    """Sistema FWI (Van Wagner 1987, ajustes de latitude do pacote cffdrs) + FMA+ + dias sem chuva. Arrays (dias, municípios)."""
    nd, nm = T.shape
    ffmc = np.full(nm, 85.0); dmc = np.full(nm, 6.0); dc = np.full(nm, 15.0); fma = np.zeros(nm); dsc = np.zeros(nm)
    out = {k: np.zeros((nd, nm), np.float32) for k in ("ffmc", "dmc", "dc", "isi", "bui", "fwi", "fma", "dias_secos")}
    lat = np.asarray(lat, float)
    with np.errstate(all="ignore"):
        for j in range(nd):
            t, h, w, p = T[j].astype(float), H[j].astype(float), W[j].astype(float), np.maximum(P[j].astype(float), 0)
            mes = datas[j].month - 1
            # ---- FFMC
            mo = 147.2 * (101 - ffmc) / (59.5 + ffmc)
            rf = p - 0.5
            chove = p > 0.5
            mo_r = np.where(mo > 150,
                            mo + 42.5 * rf * np.exp(-100 / (251 - mo)) * (1 - np.exp(-6.93 / np.maximum(rf, 1e-6))) + 0.0015 * (mo - 150) ** 2 * np.sqrt(np.maximum(rf, 0)),
                            mo + 42.5 * rf * np.exp(-100 / (251 - mo)) * (1 - np.exp(-6.93 / np.maximum(rf, 1e-6))))
            mo = np.where(chove, np.minimum(mo_r, 250), mo)
            ed = 0.942 * h ** 0.679 + 11 * np.exp((h - 100) / 10) + 0.18 * (21.1 - t) * (1 - np.exp(-0.115 * h))
            ew = 0.618 * h ** 0.753 + 10 * np.exp((h - 100) / 10) + 0.18 * (21.1 - t) * (1 - np.exp(-0.115 * h))
            ko = 0.424 * (1 - (h / 100) ** 1.7) + 0.0694 * np.sqrt(w) * (1 - (h / 100) ** 8)
            kd = ko * 0.581 * np.exp(0.0365 * t)
            k1 = 0.424 * (1 - ((100 - h) / 100) ** 1.7) + 0.0694 * np.sqrt(w) * (1 - ((100 - h) / 100) ** 8)
            kw = k1 * 0.581 * np.exp(0.0365 * t)
            m = np.where(mo > ed, ed + (mo - ed) * 10 ** (-kd), np.where(mo < ew, ew - (ew - mo) * 10 ** (-kw), mo))
            ffmc = np.clip(59.5 * (250 - m) / (147.2 + m), 0, 101)
            # ---- DMC
            el = np.where(lat > -10, 9.0, ELL04[mes])
            re = 0.92 * p - 1.27
            mo2 = 20 + np.exp(5.6348 - dmc / 43.43)
            b = np.where(dmc <= 33, 100 / (0.5 + 0.3 * dmc), np.where(dmc <= 65, 14 - 1.3 * np.log(np.maximum(dmc, 1e-6)), 6.2 * np.log(np.maximum(dmc, 1e-6)) - 17.2))
            mr = mo2 + 1000 * re / (48.77 + b * re)
            pr = 244.72 - 43.43 * np.log(np.maximum(mr - 20, 1e-6))
            dmc0 = np.where(p > 1.5, np.maximum(pr, 0), dmc)
            k = np.where(t > -1.1, 1.894 * (t + 1.1) * (100 - h) * el * 1e-6, 0)
            dmc = np.maximum(dmc0 + 100 * k, 0)
            # ---- DC
            rd = 0.83 * p - 1.27
            qo = 800 * np.exp(-dc / 400)
            qr = qo + 3.937 * rd
            dr = 400 * np.log(800 / np.maximum(qr, 1e-6))
            dc0 = np.where(p > 2.8, np.maximum(dr, 0), dc)
            v = np.maximum(np.where(t > -2.8, 0.36 * (t + 2.8) + 1.4, 1.4), 0)
            dc = dc0 + 0.5 * v
            # ---- ISI, BUI, FWI
            mm = 147.2 * (101 - ffmc) / (59.5 + ffmc)
            isi = 0.208 * np.exp(0.05039 * w) * 91.9 * np.exp(-0.1386 * mm) * (1 + mm ** 5.31 / 4.93e7)
            soma = dmc + 0.4 * dc
            bui = np.where(soma <= 0, 0, np.where(dmc <= 0.4 * dc, 0.8 * dmc * dc / np.maximum(soma, 1e-6),
                                                   dmc - (1 - 0.8 * dc / np.maximum(soma, 1e-6)) * (0.92 + (0.0114 * dmc) ** 1.7)))
            bui = np.maximum(bui, 0)
            fd = np.where(bui <= 80, 0.626 * bui ** 0.809 + 2, 1000 / (25 + 108.64 * np.exp(-0.023 * bui)))
            bb = 0.1 * isi * fd
            fwi = np.where(bb > 1, np.exp(2.72 * (0.434 * np.log(np.maximum(bb, 1e-6))) ** 0.647), bb)
            # ---- FMA+ (umidade e vento da tarde; abatimento pela chuva do dia)
            fat = np.select([p <= 2.4, p <= 4.9, p <= 9.9, p <= 12.9], [1.0, 0.7, 0.4, 0.2], 0.0)
            fma = np.where(p > 12.9, 0, fma * fat + 100 / np.maximum(h, 5) * np.exp(0.04 * w / 3.6))
            dsc = np.where(p < 2, dsc + 1, 0)
            for nome, val in (("ffmc", ffmc), ("dmc", dmc), ("dc", dc), ("isi", isi), ("bui", bui), ("fwi", fwi), ("fma", fma), ("dias_secos", dsc)):
                out[nome][j] = val
    return out


def acumulado(P, n):
    c = np.cumsum(np.vstack([np.zeros((1, P.shape[1])), np.nan_to_num(P)]), axis=0)
    s = c[n:] - c[:-n]
    out = np.full(P.shape, np.nan, np.float32)
    out[n - 1:] = s
    return out


def logit(p):
    p = np.clip(p, 1e-5, 1 - 1e-5)
    return np.log(p / (1 - p))


def matriz(ind, T, H, W, P, P30, P90, base_dm, rec):
    """Variáveis explicativas (dias, municípios, len(FEATS)). rec = fração dos 7 dias anteriores com foco no município."""
    with np.errstate(all="ignore"):
        cols = [logit(base_dm), ind["ffmc"] / 100, np.log1p(ind["dmc"]), np.log1p(ind["dc"]), np.log1p(ind["isi"]), np.log1p(ind["fwi"]),
                H / 100, T / 40, W / 20, np.log1p(np.maximum(P, 0)), np.log1p(P30), np.log1p(P90), np.minimum(ind["dias_secos"], 150) / 30,
                np.log1p(ind["fma"]) / 5, rec]
    return np.stack(cols, axis=-1).astype(np.float32)


def recentes(fogo):
    """Fração dos 7 dias anteriores (sem contar o próprio dia) com foco no município."""
    c = np.cumsum(np.vstack([np.zeros((1, fogo.shape[1])), fogo.astype(np.float32)]), axis=0)
    out = np.zeros(fogo.shape, np.float32)
    for j in range(1, fogo.shape[0]):
        a = max(0, j - 7)
        out[j] = (c[j] - c[a]) / 7.0
    return out


# ------------------------------------------------------------------ estatística
def ajusta(X, y, lam=5.0, it=60):
    """Regressão logística com penalização ridge (Newton com busca linear: só aceita passos que melhoram a
    verossimilhança penalizada, o que evita divergência). X já padronizado; devolve pesos [intercepto, ...]."""
    Xa = np.hstack([np.ones((X.shape[0], 1)), X]).astype(np.float64)
    Xa = np.nan_to_num(Xa)
    w = np.zeros(Xa.shape[1]); R = np.eye(Xa.shape[1]); R[0, 0] = 0
    pm = min(max(y.mean(), 1e-6), 1 - 1e-6); w[0] = math.log(pm / (1 - pm))

    def obj(wv):
        z = Xa @ wv
        return float(np.sum(y * z - np.logaddexp(0, z)) - 0.5 * lam * wv[1:] @ wv[1:])

    atual = obj(w)
    for _ in range(it):
        z = Xa @ w
        p = 1 / (1 + np.exp(-np.clip(z, -35, 35)))
        g = Xa.T @ (y - p) - lam * R @ w
        Hs = Xa.T @ (Xa * (p * (1 - p) + 1e-9)[:, None]) + lam * R + 1e-6 * np.eye(len(w))
        dw = np.linalg.solve(Hs, g)
        t = 1.0
        while t > 1e-6:
            novo = obj(w + t * dw)
            if np.isfinite(novo) and novo >= atual - 1e-10:
                break
            t /= 2
        if t <= 1e-6:
            break
        w = w + t * dw
        melhora = novo - atual; atual = novo
        if np.max(np.abs(t * dw)) < 1e-7 or melhora < 1e-8:
            break
    return w


def prevê(X, w):
    z = w[0] + X @ w[1:]
    return 1 / (1 + np.exp(-np.clip(z, -30, 30)))


def auc(y, s):
    o = np.argsort(s, kind="mergesort"); s2 = s[o]; y2 = y[o].astype(bool)
    _, inv, cnt = np.unique(s2, return_inverse=True, return_counts=True)
    fim = np.cumsum(cnt); ini = fim - cnt
    r = ((ini + fim + 1) / 2.0)[inv]
    n1 = y2.sum(); n0 = len(y2) - n1
    if n1 == 0 or n0 == 0:
        return None
    return float((r[y2].sum() - n1 * (n1 + 1) / 2) / (n1 * n0))


def brier_skill(y, p, p_ref):
    b = np.mean((p - y) ** 2); br = np.mean((p_ref - y) ** 2)
    return float(1 - b / br) if br > 0 else None


def linha_base(fogo, datas, anos_ok, reg, n_reg, k=60.0):
    """Probabilidade de foco por município e mês do ano (anos de treino), suavizada para a média da região."""
    nm = fogo.shape[1]
    mes = np.array([d.month - 1 for d in datas]); ano = np.array([d.year for d in datas])
    sel = np.isin(ano, anos_ok)
    base = np.zeros((nm, 12))
    for m in range(12):
        s = sel & (mes == m)
        dias = s.sum()
        freq_m = fogo[s].sum(axis=0)
        for r in range(n_reg):
            idx = reg == r
            p_reg = freq_m[idx].sum() / max(dias * idx.sum(), 1)
            base[idx, m] = (freq_m[idx] + k * p_reg) / (dias + k)
    return np.clip(base, 1e-4, 0.99)


# ------------------------------------------------------------------ focos
def focos_ref(muns, datas):
    meta = json.loads(baixa(FOCOS + "meta.json"))
    ref = json.loads(baixa(FOCOS + "ref.json", timeout=300))
    pos = {norm(m[0]): i for i, m in enumerate(meta["municipios"])}
    mapa = np.array([pos.get(norm(m["n"]), -1) for m in muns])
    inv = {v: i for i, v in enumerate(mapa) if v >= 0}
    d0 = dt.date.fromisoformat(ref["d0"])
    off = (datas[0] - d0).days
    fogo = np.zeros((len(datas), len(muns)), np.uint8)
    for dia, mun, _bio, n in ref["linhas"]:
        j = dia - off
        if 0 <= j < len(datas) and mun in inv and n > 0:
            fogo[j, inv[mun]] = 1
    return fogo, meta


def focos_recentes(muns, datas):
    """Focos por dia (satélite de referência e todos os satélites) para as datas pedidas."""
    meta = json.loads(baixa(FOCOS + "meta.json"))
    pos = {norm(m[0]): i for i, m in enumerate(meta["municipios"])}
    inv = {pos[norm(m["n"])]: i for i, m in enumerate(muns) if norm(m["n"]) in pos}
    sats = meta["satelites"]; iref = sats.index(meta["sat_ref"]) if meta["sat_ref"] in sats else -1
    todos = json.loads(baixa(FOCOS + "todos.json", timeout=300))
    d0 = dt.date.fromisoformat(todos["d0"])
    idx = {d: j for j, d in enumerate(datas)}
    ref = np.zeros((len(datas), len(muns)), np.int32); tot = ref.copy()
    for dia, mun, _bio, sat, n, _frp in todos["linhas"]:
        d = d0 + dt.timedelta(days=dia)
        if d in idx and mun in inv:
            tot[idx[d], inv[mun]] += n
            if sat == iref:
                ref[idx[d], inv[mun]] += n
    return ref, tot, meta.get("ultimo_foco_utc")


# ------------------------------------------------------------------ calibração
def calibrar():
    muns, regioes, _ = municipios()
    hoje = dt.datetime.now(FUSO).date()
    d1 = hoje - dt.timedelta(days=1)
    datas = [INICIO_CAL + dt.timedelta(days=k) for k in range((d1 - INICIO_CAL).days + 1)]
    log(f"calibração: {len(muns)} municípios, {datas[0]}–{datas[-1]} ({len(datas)} dias)")
    T, H, W, P = power_todos(muns, datas[0], datas[-1])
    fim = ultimo_valido(T, H, W, P)
    datas, T, H, W, P = datas[:fim + 1], T[:fim + 1], H[:fim + 1], W[:fim + 1], P[:fim + 1]
    T, H, W, P = preenche(T), preenche(H), preenche(W), np.nan_to_num(P)
    log(f"NASA POWER até {datas[-1]}")
    lat = [m["la"] for m in muns]
    ind = indices(T, H, W, P, datas, lat)
    P30, P90 = acumulado(P, 30), acumulado(P, 90)
    fogo, meta = focos_ref(muns, datas)
    log(f"focos de referência: {int(fogo.sum())} município-dias com foco")
    reg = np.array([m["r"] for m in muns]); nreg = len(regioes)
    anos = np.array([d.year for d in datas]); mes = np.array([d.month - 1 for d in datas])
    ultimo_ano_completo = datas[-1].year - (0 if datas[-1].month == 12 and datas[-1].day == 31 else 1)
    anos_treino = list(range(2003, ANO_TESTE)); anos_teste = list(range(ANO_TESTE, ultimo_ano_completo + 1))
    anos_todos = list(range(2003, ultimo_ano_completo + 1))
    valido = (np.arange(len(datas)) >= 90)[:, None] & np.ones((1, len(muns)), bool)

    def base_dm(base):
        return base[:, mes].T   # (dias, municípios)

    # ---------- validação: treino até 2019, teste 2020+
    rec = recentes(fogo)
    base_tr = linha_base(fogo, datas, anos_treino, reg, nreg)
    X = matriz(ind, T, H, W, P, P30, P90, base_dm(base_tr), rec)
    tr = valido & np.isin(anos, anos_treino)[:, None]
    te = valido & np.isin(anos, anos_teste)[:, None]
    val = {"regioes": {}, "anos_treino": [anos_treino[0], anos_treino[-1]], "anos_teste": [anos_teste[0], anos_teste[-1]] if anos_teste else None}
    p_te_all, y_te_all, fwi_te_all, fma_te_all, base_te_all, met_te_all, p_tr_all = [], [], [], [], [], [], []
    usa_focos = {}
    for r in range(nreg):
        cm = reg == r
        Xtr = X[tr & cm[None, :]]; ytr = fogo[tr & cm[None, :]].astype(float)
        Xte = X[te & cm[None, :]]; yte = fogo[te & cm[None, :]].astype(float)
        mu, sd = Xtr.mean(axis=0), Xtr.std(axis=0) + 1e-6
        Ztr, Zte = (Xtr - mu) / sd, (Xte - mu) / sd
        w = ajusta(Ztr, ytr)
        pcte = prevê(Zte, w); pctr = prevê(Ztr, w)
        wm = ajusta(Ztr[:, :N_METEO], ytr)                 # só meteorológico (sem focos recentes)
        pmte = prevê(Zte[:, :N_METEO], wm); pmtr = prevê(Ztr[:, :N_METEO], wm)
        wb = ajusta(Ztr[:, :1], ytr)                       # só o histórico do mês
        pbte = prevê(Zte[:, :1], wb)
        a_comp, a_met = auc(yte, pcte) or 0, auc(yte, pmte) or 0
        usa = a_comp >= a_met + 0.002                      # focos recentes só entram onde melhoram o acerto
        usa_focos[r] = usa
        pte, ptr = (pcte, pctr) if usa else (pmte, pmtr)
        fwi_te = ind["fwi"][te & cm[None, :]]; fma_te = ind["fma"][te & cm[None, :]]
        val["regioes"][regioes[r]] = {
            "n_teste": int(len(yte)), "focos_teste": int(yte.sum()), "usa_focos_recentes": bool(usa),
            "auc_modelo": auc(yte, pte), "auc_completo": a_comp, "auc_meteo": a_met, "auc_linha_base": auc(yte, pbte), "auc_fwi": auc(yte, fwi_te), "auc_fma": auc(yte, fma_te),
            "auc_dias_secos": auc(yte, ind["dias_secos"][te & cm[None, :]]),
            "brier_skill_vs_linha_base": brier_skill(yte, pte, pbte)}
        vr = val["regioes"][regioes[r]]
        log(f"  {regioes[r]}: focos no teste {vr['focos_teste']} | AUC com focos recentes {a_comp:.3f} | só meteo {a_met:.3f} | usa focos: {usa} | linha de base {vr['auc_linha_base'] or 0:.3f} | "
            f"FWI {vr['auc_fwi'] or 0:.3f} | FMA+ {vr['auc_fma'] or 0:.3f} | dias secos {vr['auc_dias_secos'] or 0:.3f}")
        p_te_all.append(pte); y_te_all.append(yte); fwi_te_all.append(fwi_te); fma_te_all.append(fma_te); base_te_all.append(pbte); met_te_all.append(pmte); p_tr_all.append(ptr)
    pte = np.concatenate(p_te_all); yte = np.concatenate(y_te_all); ptr = np.concatenate(p_tr_all)
    lim_tr = [float(np.quantile(ptr, q)) for q in QUANTIS]
    cls = np.searchsorted(lim_tr, pte, side="right")
    val["bahia"] = {"auc_modelo": auc(yte, pte), "auc_meteo": auc(yte, np.concatenate(met_te_all)), "auc_linha_base": auc(yte, np.concatenate(base_te_all)),
                    "auc_fwi": auc(yte, np.concatenate(fwi_te_all)), "auc_fma": auc(yte, np.concatenate(fma_te_all)),
                    "brier_skill_vs_linha_base": brier_skill(yte, pte, np.concatenate(base_te_all)),
                    "classes": [{"classe": NOMES_CLASSES[c], "fracao_dias": float((cls == c).mean()), "freq_foco": float(yte[cls == c].mean()) if (cls == c).any() else None,
                                 "fracao_dos_focos": float(yte[cls == c].sum() / max(yte.sum(), 1))} for c in range(5)],
                    "freq_foco_media": float(yte.mean())}
    log("Bahia (teste):", json.dumps({k: v for k, v in val["bahia"].items() if k != "classes"}))
    for c in val["bahia"]["classes"]:
        log(f"   {c['classe']:<11} {100 * c['fracao_dias']:5.1f}% dos dias | foco em {100 * (c['freq_foco'] or 0):5.2f}% | {100 * c['fracao_dos_focos']:5.1f}% dos focos")

    # ---------- modelo final: todos os anos completos
    base = linha_base(fogo, datas, anos_todos, reg, nreg)
    X = matriz(ind, T, H, W, P, P30, P90, base_dm(base), rec)
    tudo = valido & np.isin(anos, anos_todos)[:, None]
    modelos, p_all = {}, []
    for r in range(nreg):
        cm = reg == r
        Xr = X[tudo & cm[None, :]]; yr = fogo[tudo & cm[None, :]].astype(float)
        mu, sd = Xr.mean(axis=0), Xr.std(axis=0) + 1e-6
        if usa_focos.get(r, True):
            w = ajusta((Xr - mu) / sd, yr)
        else:   # região em que os focos recentes não melhoraram o acerto: peso zero para essa variável
            w = np.concatenate([ajusta(((Xr - mu) / sd)[:, :N_METEO], yr), np.zeros(len(FEATS) - N_METEO)])
        if not np.all(np.isfinite(w)) or np.max(np.abs(w[1:])) > 50:
            raise SystemExit(f"ajuste instável na região {regioes[r]}: {w}")
        modelos[str(r)] = {"mu": mu.round(6).tolist(), "sd": sd.round(6).tolist(), "w": w.round(6).tolist(), "usa_focos_recentes": bool(usa_focos.get(r, True))}
        p_all.append(prevê((Xr - mu) / sd, w))
    limites = [float(np.quantile(np.concatenate(p_all), q)) for q in QUANTIS]
    # percentis locais do FWI (clima de cada município, 2003–último ano)
    fwi_h = ind["fwi"][np.isin(anos, anos_todos)]
    pct_fwi = np.quantile(fwi_h, [0.5, 0.75, 0.9, 0.97], axis=0).T
    doc = {"gerado_em": dt.datetime.now(FUSO).isoformat(timespec="minutes"),
           "periodo": [datas[0].isoformat(), datas[-1].isoformat()], "feats": FEATS, "regioes": regioes,
           "mun": [m["n"] for m in muns], "linha_base": np.round(base, 5).tolist(), "modelos": modelos,
           "limites": limites, "classes": NOMES_CLASSES, "quantis": QUANTIS, "fwi_percentis": np.round(pct_fwi, 2).tolist(),
           "pesos_variaveis": {regioes[int(r)]: dict(zip(FEATS, [round(x, 3) for x in m["w"][1:]])) for r, m in modelos.items()},
           "validacao": val,
           "fonte": "Clima: NASA POWER (MERRA-2/GEOS) diário; focos: INPE, satélite de referência AQUA (tarde)"}
    os.makedirs(PASTA, exist_ok=True)
    with open(os.path.join(PASTA, "calibracao.json"), "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    log("calibracao.json gravado; limites das classes:", [round(x, 4) for x in limites])


# ------------------------------------------------------------------ operação diária
def open_meteo(muns):
    out = []
    for i in range(0, len(muns), 100):
        parte = muns[i:i + 100]
        q = {"latitude": ",".join(f"{m['la']:.4f}" for m in parte), "longitude": ",".join(f"{m['lo']:.4f}" for m in parte),
             "daily": "temperature_2m_max,relative_humidity_2m_min,wind_speed_10m_mean,precipitation_sum",
             "timezone": "America/Bahia", "past_days": 31, "forecast_days": 7}
        r = json.loads(baixa(OM + "?" + urllib.parse.urlencode(q), timeout=180))
        out += r if isinstance(r, list) else [r]
        time.sleep(3)
    return out


def operar():
    muns, regioes, territorios = municipios()
    arq = os.path.join(PASTA, "calibracao.json")
    cal = json.load(open(arq, encoding="utf-8")) if os.path.exists(arq) else {}
    if cal.get("feats") != FEATS:
        log("calibração ausente ou de outra versão do modelo: recalibrando")
        calibrar()
        cal = json.load(open(arq, encoding="utf-8"))
    nm = len(muns)
    hoje = dt.datetime.now(FUSO).date()
    d0 = hoje - dt.timedelta(days=300)
    # ---- NASA POWER (passado)
    datas_p = [d0 + dt.timedelta(days=k) for k in range((hoje - d0).days)]
    T, H, W, P = power_todos(muns, datas_p[0], datas_p[-1])
    fimP = ultimo_valido(T, H, W, P)
    log(f"NASA POWER até {datas_p[fimP]}")
    # ---- Open-Meteo (análise recente + previsão)
    om = open_meteo(muns)
    om_datas = [dt.date.fromisoformat(s) for s in om[0]["daily"]["time"]]
    def omv(k, conv=1.0):
        return np.array([[np.nan if v is None else v * conv for v in o["daily"][k]] for o in om], np.float32).T
    oT, oH, oW, oP = omv("temperature_2m_max"), omv("relative_humidity_2m_min"), omv("wind_speed_10m_mean"), omv("precipitation_sum")
    # ---- correção de viés: dias em comum (NASA POWER válido × Open-Meteo passado)
    comuns = [(datas_p.index(d), j) for j, d in enumerate(om_datas) if d in datas_p and datas_p.index(d) <= fimP and d < hoje]
    ip = [a for a, _ in comuns]; io = [b for _, b in comuns]
    with np.errstate(all="ignore"):
        dT = np.nanmean(T[ip] - oT[io], axis=0); dH = np.nanmean(H[ip] - oH[io], axis=0)
        rW = np.clip(np.nanmean(W[ip], axis=0) / np.maximum(np.nanmean(oW[io], axis=0), 0.1), 0.4, 2.5)
    dT, dH, rW = np.nan_to_num(dT), np.nan_to_num(dH), np.nan_to_num(rW, nan=1.0)
    log(f"viés médio Open-Meteo→POWER ({len(comuns)} dias): Tmax {dT.mean():+.2f} °C, UR {dH.mean():+.1f} pts, vento ×{rW.mean():.2f}")
    # ---- série combinada: POWER até fimP; depois Open-Meteo corrigido (análise até ontem, previsão de hoje a +6)
    datas = datas_p[:fimP + 1] + [d for d in om_datas if d > datas_p[fimP]]
    tipo = ["o"] * (fimP + 1)
    TT, HH, WW, PP = [T[:fimP + 1]], [H[:fimP + 1]], [W[:fimP + 1]], [P[:fimP + 1]]
    for j, d in enumerate(om_datas):
        if d > datas_p[fimP]:
            TT.append((oT[j] + dT)[None]); HH.append(np.clip(oH[j] + dH, 5, 100)[None]); WW.append((oW[j] * rW)[None]); PP.append(oP[j][None])
            tipo.append("a" if d < hoje else "p")
    T, H, W, P = preenche(np.vstack(TT)), preenche(np.vstack(HH)), preenche(np.vstack(WW)), np.nan_to_num(np.vstack(PP))
    ind = indices(T, H, W, P, datas, [m["la"] for m in muns])
    P30, P90 = acumulado(P, 30), acumulado(P, 90)
    base = np.array(cal["linha_base"])
    mes = np.array([d.month - 1 for d in datas])
    # focos recentes (satélite de referência): fração dos 7 dias anteriores com foco; nos dias de previsão,
    # usa a última semana observada (até ontem), como na prática do monitoramento
    ih0 = datas.index(hoje) if hoje in datas else len(datas) - 7
    j0 = max(0, ih0 - 30)
    fr_ref, _, _ = focos_recentes(muns, datas[j0:])
    fogo = np.zeros((len(datas), nm), np.float32)
    fogo[j0:] = (fr_ref > 0).astype(np.float32)
    fogo[ih0:] = 0                                 # hoje e próximos dias: ainda sem focos completos
    rec = recentes(fogo)
    for j in range(ih0 + 1, len(datas)):
        rec[j] = rec[ih0]
    X = matriz(ind, T, H, W, P, P30, P90, base[:, mes].T, rec)
    reg = np.array([m["r"] for m in muns])
    prob = np.zeros((len(datas), nm), np.float32)
    for r, md in cal["modelos"].items():
        cm = reg == int(r)
        mu, sd, w = np.array(md["mu"]), np.array(md["sd"]), np.array(md["w"])
        prob[:, cm] = prevê((X[:, cm] - mu) / sd, w)
    classe = np.searchsorted(cal["limites"], prob, side="right")
    pct = np.array(cal["fwi_percentis"])          # (municípios, 4)
    fwi_cl = (ind["fwi"][:, :, None] >= pct[None, :, :]).sum(axis=2)
    # ---- janela publicada: 14 dias anteriores + hoje + 6
    ih = datas.index(hoje) if hoje in datas else len(datas) - 7
    sel = list(range(max(0, ih - 14), len(datas)))
    dsel = [datas[j] for j in sel]
    fref, ftot, ult = focos_recentes(muns, dsel)
    def tab(a, casas=1):
        return [[None if not np.isfinite(a[j, i]) else (round(float(a[j, i]), casas) if casas else int(round(float(a[j, i])))) for j in sel] for i in range(nm)]
    doc = {"gerado_em": dt.datetime.now(FUSO).isoformat(timespec="minutes"), "hoje": hoje.isoformat(),
           "datas": [d.isoformat() for d in dsel], "tipo": "".join(tipo[j] for j in sel),
           "mun": [m["n"] for m in muns], "r": [m["r"] for m in muns], "t": [m["t"] for m in muns],
           "regioes": regioes, "territorios": territorios, "classes": cal["classes"], "limites": cal["limites"],
           "classe": [[int(classe[j, i]) for j in sel] for i in range(nm)],
           "prob": [[int(round(1000 * float(prob[j, i]))) for j in sel] for i in range(nm)],
           "fwi_cl": [[int(fwi_cl[j, i]) for j in sel] for i in range(nm)],
           "fwi": tab(ind["fwi"]), "ffmc": tab(ind["ffmc"], 0), "dmc": tab(ind["dmc"], 0), "dc": tab(ind["dc"], 0),
           "isi": tab(ind["isi"]), "bui": tab(ind["bui"], 0), "fma": tab(ind["fma"], 0), "dias_secos": tab(ind["dias_secos"], 0),
           "tmax": tab(T), "ur": tab(H, 0), "vento": tab(W, 0), "chuva": tab(P), "chuva30": tab(P30, 0),
           "focos_ref": [[int(fref[k, i]) for k in range(len(sel))] for i in range(nm)],
           "focos_todos": [[int(ftot[k, i]) for k in range(len(sel))] for i in range(nm)], "ultimo_foco_utc": ult,
           "calibracao": {"periodo": cal["periodo"], "gerado_em": cal["gerado_em"], "validacao": cal["validacao"]},
           "fonte": "Índices: sistema FWI (Van Wagner, 1987) e FMA+ (Nunes et al., 2006); clima: NASA POWER (reanálise) e Open-Meteo (análise e previsão, corrigidas para o padrão da NASA POWER em cada município); calibração com os focos do INPE (satélite de referência AQUA), 2003 em diante"}
    os.makedirs(PASTA, exist_ok=True)
    with open(os.path.join(PASTA, "risco.json"), "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    jh = sel.index(ih) if ih in sel else 0
    cont = np.bincount([doc["classe"][i][jh] for i in range(nm)], minlength=5)
    log(f"OK risco.json | hoje {hoje}: " + ", ".join(f"{cal['classes'][c]} {cont[c]}" for c in range(5)) +
        f" | Salvador FWI {doc['fwi'][[m['n'] for m in muns].index('Salvador')][jh]}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--calibrar", action="store_true")
    a = ap.parse_args()
    calibrar() if a.calibrar else operar()
