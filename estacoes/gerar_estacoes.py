"""
Painel de chuva das estações (SEIA/INEMA) — gera os arquivos lidos pela página (pasta estacoes/).

Entradas
  --dados    pasta com estacoes.csv, precipitacao_diaria_limpa.csv, precipitacao_mensal_limpa.csv
             (série do SEIA já sem os períodos excluídos a pedido da COTIC)
  --camadas  pasta com os GeoJSON baixados do GeoServer do INEMA (municipios, territorios, rpga, semiarido,
             biomas, bacias, limite) + regioes_ba.geojson (regiões climáticas) + chuva_mensal.json (CHIRPS por município)
  --saida    pasta de saída (cria estacoes/)

Saídas (estacoes/)
  estacoes.json         cadastro: código, nome, coordenadas, município, território, RPGA, região, bacia, semiárido,
                        bioma (por sobreposição espacial com as camadas oficiais), período e cobertura, normal CHIRPS
                        1991–2020 do município
  mensal.json           totais mensais de todas as estações (com dias válidos), desde o primeiro mês de cada uma
  diario/AAAA.json      chuva diária de todas as estações em cada ano
  camadas/<nome>.json   camadas simplificadas para o mapa: {"nome":..., "f":[{"n":nome, "g":[[anel],[anel]...]}]}
  info.json             datas, totais e fontes
Requer shapely.
"""
import argparse, csv, json, os, collections, datetime as dt, unicodedata
from shapely.geometry import shape, Point, mapping
from shapely.strtree import STRtree
from shapely.ops import unary_union

ap = argparse.ArgumentParser()
ap.add_argument("--dados", required=True); ap.add_argument("--camadas", required=True); ap.add_argument("--saida", required=True)
A = ap.parse_args()
OUT = os.path.join(A.saida, "estacoes"); os.makedirs(os.path.join(OUT, "diario"), exist_ok=True); os.makedirs(os.path.join(OUT, "camadas"), exist_ok=True)

def norm(s):
    s = unicodedata.normalize("NFD", str(s)).encode("ascii", "ignore").decode().upper()
    return " ".join("".join(c if c.isalnum() else " " for c in s).split())

def salva(nome, obj):
    with open(os.path.join(OUT, nome), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
    return os.path.getsize(os.path.join(OUT, nome))

# ---------------- camadas ----------------
def le(nome):
    return json.load(open(os.path.join(A.camadas, nome), encoding="utf-8"))["features"]

def aneis(geom, tol):
    g = geom.simplify(tol, preserve_topology=True)
    polys = [g] if g.geom_type == "Polygon" else list(getattr(g, "geoms", []))
    out = []
    for p in polys:
        if p.geom_type != "Polygon" or p.is_empty: continue
        for anel in [p.exterior] + list(p.interiors):
            cs = [[round(x, 3), round(y, 3)] for x, y in anel.coords]
            if len(cs) >= 4: out.append(cs)
    return out

CAMADAS = {}   # nome -> lista de (rotulo, geometria shapely)
def camada(chave, arquivo, campo, tol, titulo, rotulo=None):
    fs = le(arquivo); itens = []
    for f in fs:
        if not f.get("geometry"): continue
        g = shape(f["geometry"]).buffer(0)
        n = rotulo(f["properties"]) if rotulo else str(f["properties"].get(campo, "")).strip()
        itens.append((n, g))
    # junta feições com o mesmo nome (ex.: RPGA em vários pedaços)
    por = collections.OrderedDict()
    for n, g in itens: por.setdefault(n, []).append(g)
    itens = [(n, unary_union(gs)) for n, gs in por.items()]
    CAMADAS[chave] = itens
    doc = {"nome": titulo, "f": [{"n": n, "g": aneis(g, tol)} for n, g in itens]}
    t = salva(f"camadas/{chave}.json", doc)
    print(f"camada {chave}: {len(itens)} feições, {t // 1024} KB")

camada("limite", "limite.geojson", "uf", 0.004, "Limite estadual")
camada("municipios", "municipios.geojson", "nommun", 0.004, "Municípios")
camada("territorios", "territorios.geojson", "nome_ti", 0.004, "Territórios de identidade")
camada("rpga", "rpga.geojson", "rpgas", 0.004, "RPGA (Regiões de Planejamento e Gestão das Águas)")
camada("bacias", "bacias.geojson", "bacia", 0.006, "Bacias hidrográficas")
camada("semiarido", "semiarido.geojson", "x", 0.004, "Semiárido (INSA 2024)", rotulo=lambda p: "Semiárido")
camada("biomas", "biomas.geojson", "bioma", 0.005, "Biomas (IBGE)")
A.camadas_reg = os.path.join(A.camadas, "..", "regioes_ba.geojson")
fs = json.load(open(A.camadas_reg, encoding="utf-8"))["features"]
CAMADAS["regioes"] = [(f["properties"]["nome"], shape(f["geometry"]).buffer(0)) for f in fs]
print("camada regioes:", salva("camadas/regioes.json", {"nome": "Regiões climáticas", "f": [{"n": n, "g": aneis(g, 0.004)} for n, g in CAMADAS["regioes"]]}) // 1024, "KB")

def localizador(chave):
    itens = CAMADAS[chave]; arv = STRtree([g for _, g in itens])
    def acha(pt):
        for i in arv.query(pt):
            if itens[i][1].covers(pt): return itens[i][0]
        # ponto fora (ex.: estação na costa): o mais próximo, até ~5 km
        i = arv.nearest(pt)
        return itens[i][0] if itens[i][1].distance(pt) < 0.05 else None
    return acha
LOC = {k: localizador(k) for k in ["municipios", "territorios", "rpga", "regioes", "bacias", "biomas"]}
semi = CAMADAS["semiarido"][0][1]

# ---------------- normal CHIRPS por município ----------------
cm = json.load(open(os.path.join(A.camadas, "..", "chuva_mensal.json"), encoding="utf-8"))
y0, m0 = int(cm["inicio"][:4]), int(cm["inicio"][5:7]) - 1
NORMAL = {}
for i, nome in enumerate(cm["mun"]):
    s = cm["v"][i]; nm = []
    for mes in range(12):
        vs = [s[j] for y in range(1991, 2021) for j in [(y - y0) * 12 + mes - m0] if 0 <= j < len(s) and s[j] is not None]
        nm.append(round(sum(vs) / len(vs), 1) if len(vs) >= 20 else None)
    NORMAL[norm(nome)] = nm

# ---------------- estações ----------------
meta = {r["codigo"]: r for r in csv.DictReader(open(os.path.join(A.dados, "estacoes.csv"), encoding="utf-8"))}
diario = collections.defaultdict(dict)      # ano -> codigo -> {doy: v}
prim, ult, ndias = {}, {}, collections.Counter()
for r in csv.DictReader(open(os.path.join(A.dados, "precipitacao_diaria_limpa.csv"), encoding="utf-8")):
    c, d, v = r["codigo"], r["data"], float(r["valor_mm"])
    diario[d[:4]].setdefault(c, {})[d] = round(v, 1)
    if c not in prim or d < prim[c]: prim[c] = d
    if c not in ult or d > ult[c]: ult[c] = d
    ndias[c] += 1
DATA_FIM = max(ult.values())

def tipo(c):
    if c[:1] == "A" and c[1:].isdigit(): return "INMET automática"
    if c.isdigit(): return "ANA/INMET convencional"
    if c[-1:].isalpha() and c[:-1].isdigit(): return "CEMADEN"
    return "PCD / posto INEMA"

EST = []
for c, r in meta.items():
    if c not in prim: continue
    la, lo = float(r["latitude"]), float(r["longitude"]); pt = Point(lo, la)
    mun = LOC["municipios"](pt) or r["municipio"]
    total = (dt.date.fromisoformat(ult[c]) - dt.date.fromisoformat(prim[c])).days + 1
    EST.append({"c": c, "n": r["estacao"], "la": round(la, 5), "lo": round(lo, 5), "tipo": tipo(c),
                "mun": mun, "ter": LOC["territorios"](pt), "rpga": LOC["rpga"](pt), "reg": LOC["regioes"](pt),
                "bac": LOC["bacias"](pt), "bio": LOC["biomas"](pt), "semi": bool(semi.covers(pt)),
                "ini": prim[c], "fim": ult[c], "nd": ndias[c], "cob": round(100 * ndias[c] / total),
                "nm": NORMAL.get(norm(mun))})
EST.sort(key=lambda e: e["n"])
sem = [e["c"] for e in EST if not e["ter"] or not e["rpga"]]
print("estações:", len(EST), "| sem território/RPGA:", len(sem), sem[:5])

# ---------------- mensal ----------------
MENS = {}
for r in csv.DictReader(open(os.path.join(A.dados, "precipitacao_mensal_limpa.csv"), encoding="utf-8")):
    MENS.setdefault(r["codigo"], {})[r["mes"]] = (None if r["total_mm"] == "" else round(float(r["total_mm"]), 1), int(r["dias_validos"] or 0))
def mes_idx(m): return int(m[:4]) * 12 + int(m[5:]) - 1
mensal = {}
for c, d in MENS.items():
    ms = sorted(d); i0, i1 = mes_idx(ms[0]), mes_idx(ms[-1])
    tot, dv = [], []
    for i in range(i0, i1 + 1):
        m = f"{i // 12}-{i % 12 + 1:02d}"; t = d.get(m, (None, 0))
        tot.append(t[0]); dv.append(t[1])
    mensal[c] = [ms[0], tot, dv]
print("mensal.json", salva("mensal.json", {"fim": DATA_FIM[:7], "est": mensal}) // 1024, "KB")

# ---------------- diário por ano ----------------
anos = sorted(diario)
for a in anos:
    ini = dt.date(int(a), 1, 1); n = (dt.date(int(a), 12, 31) - ini).days + 1
    if a == DATA_FIM[:4]: n = (dt.date.fromisoformat(DATA_FIM) - ini).days + 1
    est = {}
    for c, dd in diario[a].items():
        arr = [None] * n
        for d, v in dd.items():
            k = (dt.date.fromisoformat(d) - ini).days
            if 0 <= k < n: arr[k] = v
        est[c] = arr
    salva(f"diario/{a}.json", {"ano": int(a), "dias": n, "est": est})
print("diário:", anos[0], "a", anos[-1], "|", sum(os.path.getsize(os.path.join(OUT, "diario", f)) for f in os.listdir(os.path.join(OUT, "diario"))) // 1024, "KB")

salva("estacoes.json", EST)
info = {"gerado_em": dt.datetime.now().isoformat(timespec="minutes"), "inicio": min(prim.values()), "fim": DATA_FIM,
        "anos": [int(a) for a in anos], "n_estacoes": len(EST), "n_registros": sum(ndias.values()),
        "fonte": "SEIA/INEMA — monitoramento hidrometeorológico (acesso público), sem os períodos excluídos a pedido da COTIC",
        "camadas": "GeoServer INEMA (municípios e territórios SEI 2026, RPGA 2012, bacias 2012, semiárido INSA 2024, biomas IBGE); regiões climáticas INEMA",
        "normal": "CHIRPS 1991–2020, média do município"}
salva("info.json", info)
print("OK", info["inicio"], info["fim"])
