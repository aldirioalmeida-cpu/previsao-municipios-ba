"""
Focos de calor na Bahia — dados abertos do Programa Queimadas (INPE).

Fonte: https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/
  anual/Brasil_sat_ref     satélite de referência (AQUA_M-T), 2003 até o ano passado
  anual/Brasil_todos_sats  todos os satélites, ano passado
  mensal/Brasil            todos os satélites, meses do ano atual (o do mês corrente é atualizado ao longo do dia)
  diario/Brasil            todos os satélites, hoje e ontem (para pegar as últimas horas)

Gera (pasta --saida, publicada no ramo "focos"):
  meta.json            listas (municípios, regiões, territórios, biomas, satélites) e datas
  ref.json             contagem diária por município e bioma — satélite de referência, desde 2003
  todos.json           contagem diária por município, bioma e satélite — todos os satélites, desde 1º/jan do ano passado
  pontos_ref_AAAA.json focos individuais do satélite de referência, um arquivo por ano (para o mapa)
  pontos_todos.json    focos individuais de todos os satélites dos últimos 60 dias (para o mapa)
  uc.json              focos por unidade de conservação (referência desde 2003 e todos os satélites)
  (nos pontos, o último campo é a UC do foco — a menor, se houver sobreposição — ou -1)
Datas em UTC (padrão do INPE).
"""
import argparse, csv, datetime as dt, gzip, io, json, os, sys, time, unicodedata, urllib.request, urllib.error, zipfile
import numpy as np

BASE = "https://dataserver-coids.inpe.br/queimadas/queimadas/focos/csv/"
UA = {"User-Agent": "inema-meteorologia-focos/1.0 (github actions)"}
AQUI = os.path.dirname(os.path.abspath(__file__))
SAT_REF = "AQUA_M-T"
ANO_INI_REF = 2003
DIAS_PONTOS_TODOS = 60


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


# ------------------------------------------------------------ unidades de conservação
# uc_ba.geojson: 113 UCs (federais, estaduais e municipais) do shapefile "1 - UNIDADES DE CONSERVAÇÃO".
# As UCs se sobrepõem (ex.: parque dentro de APA): um foco conta em cada UC em que cai, e os
# totais "em UC" (índices negativos) contam cada foco uma vez só.
UNIOES = [("Todas as UCs", None, None), ("Federais", "dominio", "Federal"), ("Estaduais", "dominio", "Estadual"),
          ("Municipais", "dominio", "Municipal"), ("Proteção Integral", "grupo", "Proteção Integral"),
          ("Uso Sustentável", "grupo", "Uso Sustentável")]   # índices -1, -2, ... -6


def carrega_ucs():
    from matplotlib.path import Path
    with open(os.path.join(AQUI, "uc_ba.geojson"), encoding="utf-8") as f:
        g = json.load(f)
    ucs = []
    for ft in g["features"]:
        polys = []
        for poly in ft["geometry"]["coordinates"]:
            ext = np.asarray(poly[0], float)
            polys.append((Path(ext), [Path(np.asarray(h, float)) for h in poly[1:]],
                          (ext[:, 0].min(), ext[:, 1].min(), ext[:, 0].max(), ext[:, 1].max())))
        ucs.append((ft["properties"], polys))
    return ucs


def marca_ucs(regs, ucs):
    """Grava em cada registro r["uc"] = lista dos índices das UCs que contêm o foco (a menor UC primeiro)."""
    falta = [r for r in regs if "uc" not in r]
    if not falta:
        return
    lon = np.array([r["lon"] for r in falta]); lat = np.array([r["lat"] for r in falta])
    pts = np.column_stack([lon, lat])
    dentro = [[] for _ in falta]
    for u, (_, polys) in enumerate(ucs):            # ucs já vêm em ordem crescente de área
        for ext, buracos, (x0, y0, x1, y1) in polys:
            sel = np.nonzero((lon >= x0) & (lon <= x1) & (lat >= y0) & (lat <= y1))[0]
            if not len(sel):
                continue
            ok = ext.contains_points(pts[sel])
            for h in buracos:
                ok &= ~h.contains_points(pts[sel])
            for i in sel[ok]:
                if u not in dentro[i]:
                    dentro[i].append(u)
    for r, d in zip(falta, dentro):
        r["uc"] = d


def uc_chaves(lista, ucs):
    """Índices em que o foco conta: cada UC (>=0) e as uniões (-1..-6, uma vez cada)."""
    if not lista:
        return []
    ks = list(lista)
    for j, (_, campo, valor) in enumerate(UNIOES):
        if campo is None or any(ucs[u][0][campo] == valor for u in lista):
            ks.append(-1 - j)
    return ks


def baixar(url, tentativas=4):
    for i in range(tentativas):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            erro = e
        except Exception as e:  # noqa
            erro = e
        time.sleep(5 * (i + 1))
    raise RuntimeError(f"falhou: {url} ({erro})")


def norm(s):
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").upper()
    return " ".join(s.replace("'", " ").replace("-", " ").split())


# ------------------------------------------------------------ leitura dos CSVs do INPE (só Bahia)
def linhas_ba(texto_iter):
    """Recebe um iterador de linhas de texto (com cabeçalho) e devolve registros normalizados da Bahia."""
    it = iter(texto_iter)
    cab = next(it).strip().lstrip("﻿").split(",")
    idx = {c.strip().lower(): i for i, c in enumerate(cab)}
    def col(*nomes):
        for n in nomes:
            if n in idx:
                return idx[n]
        return None
    c_id, c_lat, c_lon = col("id", "foco_id", "id_bdq"), col("lat", "latitude"), col("lon", "longitude")
    c_dt, c_sat, c_est = col("data_hora_gmt", "data_pas", "datahora"), col("satelite"), col("estado")
    c_mun, c_bio, c_frp = col("municipio"), col("bioma"), col("frp")
    for linha in it:
        if "BAHIA" not in linha:
            continue
        p = next(csv.reader([linha]))
        if len(p) <= max(c_lat, c_lon, c_dt, c_est) or p[c_est].strip().upper() != "BAHIA":
            continue
        try:
            lat, lon = float(p[c_lat]), float(p[c_lon])
        except ValueError:
            continue
        d = p[c_dt].strip()
        frp = p[c_frp].strip() if c_frp is not None and c_frp < len(p) else ""
        yield {"id": p[c_id].strip() if c_id is not None else f"{d}{lat}{lon}",
               "data": d[:10], "hora": d[11:13] + d[14:16], "lat": round(lat, 4), "lon": round(lon, 4),
               "sat": p[c_sat].strip() if c_sat is not None else SAT_REF,
               "mun": p[c_mun].strip() if c_mun is not None else "",
               "bio": p[c_bio].strip() if c_bio is not None and c_bio < len(p) else "",
               "frp": float(frp) if frp not in ("", None) else None}


def ler_url(url):
    raw = baixar(url)
    if raw is None:
        return None
    if url.endswith(".zip"):
        z = zipfile.ZipFile(io.BytesIO(raw))
        nome = [n for n in z.namelist() if n.lower().endswith(".csv")][0]
        with z.open(nome) as f:
            return list(linhas_ba(io.TextIOWrapper(f, encoding="utf-8", errors="replace")))
    return list(linhas_ba(raw.decode("utf-8", errors="replace").splitlines()))


CAMPOS = ["id", "data", "hora", "lat", "lon", "sat", "mun", "bio", "frp"]


def salva_cache(arq, regs):
    with gzip.open(arq, "wt", encoding="utf-8", newline="") as f:
        w = csv.writer(f); w.writerow(CAMPOS)
        for r in regs:
            w.writerow([r[c] if r[c] is not None else "" for c in CAMPOS])


def le_cache(arq):
    with gzip.open(arq, "rt", encoding="utf-8") as f:
        out = []
        for r in csv.DictReader(f):
            r["lat"], r["lon"] = float(r["lat"]), float(r["lon"])
            r["frp"] = float(r["frp"]) if r["frp"] else None
            out.append(r)
        return out


def com_cache(cache, nome, urls):
    """Lê do cache; se não houver, tenta as URLs em ordem e salva. Devolve None se nenhuma existir."""
    arq = os.path.join(cache, nome + ".csv.gz")
    if os.path.exists(arq):
        return le_cache(arq)
    for u in urls:
        log("baixando", u)
        regs = ler_url(BASE + u)
        if regs is not None:
            salva_cache(arq, regs)
            return regs
    return None


# ------------------------------------------------------------ principal
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--saida", default="saida_focos")
    ap.add_argument("--cache", default="cache_focos")
    a = ap.parse_args()
    os.makedirs(a.saida, exist_ok=True); os.makedirs(a.cache, exist_ok=True)

    agora = dt.datetime.now(dt.timezone.utc)
    hoje = agora.date()
    ano, mes = hoje.year, hoje.month

    with open(os.path.join(AQUI, "municipios.json"), encoding="utf-8") as f:
        M = json.load(f)
    muns = M["municipios"]
    chave = {m["k"]: i for i, m in enumerate(muns)}
    seat = np.array([[m["lo"], m["la"]] for m in muns])
    sem_nome = {}

    def mun_idx(r):
        i = chave.get(norm(r["mun"]))
        if i is None:  # nome não reconhecido: município da sede mais próxima
            i = int(np.argmin((seat[:, 0] - r["lon"]) ** 2 + (seat[:, 1] - r["lat"]) ** 2))
            if r["mun"]:
                sem_nome[r["mun"]] = sem_nome.get(r["mun"], 0) + 1
        return i

    # ---- satélite de referência: anos fechados
    # Vem dos arquivos anuais de TODOS os satélites filtrados pelo AQUA_M-T: mesma contagem da série
    # de referência do INPE, mas com o FRP (intensidade), que o arquivo "sat_ref" não traz.
    # Só os focos do AQUA ficam em cache, para o cache não crescer demais.
    ref_por_ano = {}
    for y in range(ANO_INI_REF, ano):
        arq = os.path.join(a.cache, f"refsat_{y}.csv.gz")
        if os.path.exists(arq):
            regs = le_cache(arq)
        else:
            log("baixando", f"anual/Brasil_todos_sats/focos_br_todos-sats_{y}.zip")
            todos_y = ler_url(BASE + f"anual/Brasil_todos_sats/focos_br_todos-sats_{y}.zip")
            regs = [r for r in todos_y if r["sat"] == SAT_REF] if todos_y is not None else None
            if regs is not None:
                salva_cache(arq, regs)
                if y == ano - 1:
                    salva_cache(os.path.join(a.cache, f"todos_{y}.csv.gz"), todos_y)
        if regs is None:
            regs = com_cache(a.cache, f"ref_{y}", [f"anual/Brasil_sat_ref/focos_br_ref_{y}.zip"])
        if regs is None:   # ano passado ainda sem arquivo anual de referência: usa os mensais
            regs = []
            for mm in range(1, 13):
                r2 = com_cache(a.cache, f"mes_{y}{mm:02d}", [f"mensal/Brasil/focos_mensal_br_{y}{mm:02d}.csv"]) or []
                regs += [r for r in r2 if r["sat"] == SAT_REF]
        ref_por_ano[y] = regs
        log(f"ref {y}: {len(regs)} focos")

    # ---- todos os satélites: ano passado
    todos = com_cache(a.cache, f"todos_{ano - 1}", [f"anual/Brasil_todos_sats/focos_br_todos-sats_{ano - 1}.zip"])
    if todos is None:
        todos = []
        for mm in range(1, 13):
            todos += com_cache(a.cache, f"mes_{ano - 1}{mm:02d}", [f"mensal/Brasil/focos_mensal_br_{ano - 1}{mm:02d}.csv"]) or []
    log(f"todos {ano - 1}: {len(todos)} focos")

    # ---- ano atual: meses fechados (cache) + mês corrente + diários de ontem e hoje
    atual = []
    for mm in range(1, mes):
        atual += com_cache(a.cache, f"mes_{ano}{mm:02d}", [f"mensal/Brasil/focos_mensal_br_{ano}{mm:02d}.csv"]) or []
    log("baixando mês corrente"); atual += ler_url(BASE + f"mensal/Brasil/focos_mensal_br_{ano}{mes:02d}.csv") or []
    for d in (hoje - dt.timedelta(days=1), hoje):
        atual += ler_url(BASE + f"diario/Brasil/focos_diario_br_{d:%Y%m%d}.csv") or []
    vistos, uniq = set(), []
    for r in atual:
        if r["id"] not in vistos:
            vistos.add(r["id"]); uniq.append(r)
    atual = [r for r in uniq if r["data"][:4] == str(ano)]
    log(f"ano atual {ano}: {len(atual)} focos (todos os satélites)")
    ref_por_ano[ano] = [r for r in atual if r["sat"] == SAT_REF]
    todos_total = [r for r in todos if r["data"][:4] == str(ano - 1)] + atual

    # ---- dicionários
    biomas = sorted({r["bio"] or "Não informado" for y in ref_por_ano for r in ref_por_ano[y]} |
                    {r["bio"] or "Não informado" for r in todos_total})
    b_idx = {b: i for i, b in enumerate(biomas)}
    sats = sorted({r["sat"] for r in todos_total})
    s_idx = {s: i for i, s in enumerate(sats)}

    # ---- agregados: referência (desde 2003)
    d0_ref = dt.date(ANO_INI_REF, 1, 1)
    agg = {}
    for y, regs in ref_por_ano.items():
        for r in regs:
            k = ((dt.date.fromisoformat(r["data"]) - d0_ref).days, mun_idx(r), b_idx[r["bio"] or "Não informado"])
            agg[k] = agg.get(k, 0) + 1
    ref_rows = sorted([list(k) + [v] for k, v in agg.items()])

    # ---- agregados: todos os satélites (desde 1º/jan do ano passado)
    d0_todos = dt.date(ano - 1, 1, 1)
    agg = {}
    for r in todos_total:
        k = ((dt.date.fromisoformat(r["data"]) - d0_todos).days, mun_idx(r), b_idx[r["bio"] or "Não informado"], s_idx[r["sat"]])
        q, f = agg.get(k, (0, 0.0))
        agg[k] = (q + 1, f + (r["frp"] or 0.0))
    todos_rows = sorted([list(k) + [v[0], round(v[1], 1)] for k, v in agg.items()])

    def grava(nome, obj):
        with open(os.path.join(a.saida, nome), "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))

    # ---- unidades de conservação
    ucs = carrega_ucs()
    ordem = sorted(range(len(ucs)), key=lambda u: ucs[u][0]["area_km2"])
    ucs = [ucs[u] for u in ordem]
    for y, regs in ref_por_ano.items():
        marca_ucs(regs, ucs)
    marca_ucs(todos_total, ucs)
    agg = {}
    for regs in ref_por_ano.values():
        for r in regs:
            dia = (dt.date.fromisoformat(r["data"]) - d0_ref).days
            for u in uc_chaves(r["uc"], ucs):
                agg[(dia, u)] = agg.get((dia, u), 0) + 1
    uc_ref = sorted([list(k) + [v] for k, v in agg.items()])
    agg = {}
    for r in todos_total:
        dia = (dt.date.fromisoformat(r["data"]) - d0_todos).days
        for u in uc_chaves(r["uc"], ucs):
            k = (dia, u, s_idx[r["sat"]])
            q, f = agg.get(k, (0, 0.0))
            agg[k] = (q + 1, f + (r["frp"] or 0.0))
    uc_todos = sorted([list(k) + [v[0], round(v[1], 1)] for k, v in agg.items()])
    grava("uc.json", {
        "ucs": [[p["nome"], p["dominio"], p["grupo"], p["area_km2"]] for p, _ in ucs],
        "unioes": [n for n, _, _ in UNIOES],
        "nota": "Um foco conta em cada UC que o contém (há UCs sobrepostas); as uniões (índices -1 a -6) contam cada foco uma vez.",
        "ref": {"d0": d0_ref.isoformat(), "campos": ["dia", "uc", "focos"], "linhas": uc_ref},
        "todos": {"d0": d0_todos.isoformat(), "campos": ["dia", "uc", "sat", "focos", "frp"], "linhas": uc_todos}})
    log("UCs: focos de referência em UC:", sum(1 for regs in ref_por_ano.values() for r in regs if r["uc"]),
        "| todos os satélites em UC:", sum(1 for r in todos_total if r["uc"]))

    grava("ref.json", {"d0": d0_ref.isoformat(), "campos": ["dia", "mun", "bioma", "focos"], "linhas": ref_rows})
    grava("todos.json", {"d0": d0_todos.isoformat(), "campos": ["dia", "mun", "bioma", "sat", "focos", "frp"], "linhas": todos_rows})

    # ---- pontos para o mapa
    for y, regs in ref_por_ano.items():
        grava(f"pontos_ref_{y}.json", [[r["lat"], r["lon"], (dt.date.fromisoformat(r["data"]) - d0_ref).days, int(r["hora"] or 0),
                                        mun_idx(r), b_idx[r["bio"] or "Não informado"], r["frp"],
                                        r["uc"][0] if r["uc"] else -1] for r in regs])
    corte = hoje - dt.timedelta(days=DIAS_PONTOS_TODOS)
    grava("pontos_todos.json", [[r["lat"], r["lon"], (dt.date.fromisoformat(r["data"]) - d0_todos).days, int(r["hora"] or 0),
                                 s_idx[r["sat"]], mun_idx(r), b_idx[r["bio"] or "Não informado"], r["frp"],
                                 r["uc"][0] if r["uc"] else -1]
                                for r in todos_total if dt.date.fromisoformat(r["data"]) >= corte])

    ultimo = max((r["data"] + " " + r["hora"] for r in atual), default=None)
    grava("meta.json", {
        "gerado_em": agora.astimezone(dt.timezone(dt.timedelta(hours=-3))).strftime("%Y-%m-%dT%H:%M-03:00"),
        "ultimo_foco_utc": ultimo, "hoje_utc": hoje.isoformat(), "sat_ref": SAT_REF,
        "anos_ref": sorted(ref_por_ano), "todos_desde": d0_todos.isoformat(), "dias_pontos_todos": DIAS_PONTOS_TODOS,
        "biomas": biomas, "satelites": sats, "regioes": M["regioes"], "territorios": M["territorios"],
        "municipios": [[m["n"], m["r"], m["t"]] for m in muns],
        "nomes_nao_reconhecidos": sem_nome,
        "fonte": "INPE — Programa Queimadas (dataserver-coids.inpe.br)"})
    log("referência: anos", min(ref_por_ano), "-", max(ref_por_ano), "| linhas agregadas:", len(ref_rows))
    log("todos: linhas agregadas:", len(todos_rows), "| satélites:", sats)
    log("nomes não reconhecidos:", sem_nome)
    tam = sum(os.path.getsize(os.path.join(a.saida, f)) for f in os.listdir(a.saida))
    log(f"saída: {len(os.listdir(a.saida))} arquivos, {tam / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
