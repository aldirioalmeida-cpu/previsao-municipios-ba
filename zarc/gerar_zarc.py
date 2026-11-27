"""
Calendário de plantio da Bahia a partir do Zoneamento Agrícola de Risco Climático (ZARC/MAPA) — gera zarc_ba.json.

Fonte: dados abertos do MAPA, conjunto "Tábua de risco - Zoneamento Agrícola de Risco Climático"
(dados.agricultura.gov.br, API CKAN). Cada linha da tábua traz, para uma cultura, ciclo, tipo de solo e município,
o risco de perda (20%, 30% ou 40%; 0 = não indicado) de semear em cada um dos 36 decêndios do ano.

Usa a safra vigente e, para culturas cuja portaria ainda não saiu nela, a safra anterior; e também a tábua de
culturas perenes/olerícolas/sem safra. Só as linhas da Bahia são guardadas.

Resumo por município e cultura (+ manejo sequeiro/irrigado): em cada decêndio, o MENOR risco entre os tipos de solo,
ciclos e climas zoneados — ou seja, a janela mais ampla possível. O produtor deve conferir a portaria para o seu
solo e cultivar. Saída compacta: uma sequência de 36 caracteres por cultura ("0" não indicado, "2"/"3"/"4" = 20/30/40%).
Só biblioteca padrão do Python.
"""
import csv, io, json, os, re, sys, time, urllib.request
from datetime import datetime, timedelta, timezone

PASTA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://dados.agricultura.gov.br/api/3/action/package_show?id=tabua-de-risco-zoneamento-agricola-de-risco-climatico"
UA = {"User-Agent": "inema-zarc/1.0 (github actions)"}
FUSO = timezone(timedelta(hours=-3))


def abrir(url, tentativas=4):
    for i in range(tentativas):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300)
        except Exception as e:  # noqa
            print(f"  erro ({e}); nova tentativa", file=sys.stderr)
            time.sleep(20 * (i + 1))
    raise RuntimeError("falhou: " + url)


def recursos():
    with abrir(API) as r:
        pkg = json.load(r)["result"]
    safras, perene = [], None
    for res in pkg["resources"]:
        nome = res.get("name", "")
        m = re.search(r"Safra (\d{4})/(\d{4})", nome)
        if m:
            safras.append((int(m.group(1)), nome, res["url"]))
        elif "Perene" in nome:
            perene = (nome, res["url"])
    safras.sort()
    return safras, perene


def linhas_ba(url):
    """Lê o CSV (separador ;) em fluxo e devolve só as linhas da Bahia como dicionários."""
    with abrir(url) as r:
        txt = io.TextIOWrapper(r, encoding="utf-8-sig", errors="replace", newline="")
        cab = None
        for linha in txt:
            if cab is None:
                cab = linha.rstrip("\r\n").split(";")
                continue
            if ";BA;" not in linha:
                continue
            for row in csv.reader([linha], delimiter=";"):
                if len(row) >= len(cab):
                    yield dict(zip(cab, row))


def main():
    safras, perene = recursos()
    hoje = datetime.now(FUSO)
    ano_safra = hoje.year if hoje.month >= 7 else hoje.year - 1          # safra agrícola de julho a junho
    vigentes = [s for s in safras if s[0] <= ano_safra][-2:]              # vigente + anterior (se houver)
    fontes = [(f"{s[0]}/{s[0] + 1}", s[2]) for s in reversed(vigentes)]   # vigente primeiro
    if perene:
        fontes.append(("perene", perene[1]))
    print("fontes:", [f[0] for f in fontes], flush=True)

    culturas, idx, mun, nomes, ja = [], {}, {}, {}, set()
    for safra, url in fontes:
        vistos_nesta = set()
        n = 0
        for r in linhas_ba(url):
            n += 1
            chave = (r["Nome_cultura"].strip(), r["Nome_Outros_Manejos"].strip() or "Não se aplica")
            if chave in ja and chave not in vistos_nesta:
                continue                      # cultura já veio de uma safra mais nova
            vistos_nesta.add(chave)
            if chave not in idx:
                idx[chave] = len(culturas)
                culturas.append({"nome": chave[0], "manejo": chave[1], "safra": safra, "portaria": r.get("Portaria", "").strip()})
            k = idx[chave]
            geo = r["geocodigo"].strip()
            nomes[geo] = r["municipio"].strip()
            atual = mun.setdefault(geo, {}).get(k)
            riscos = []
            for d in range(1, 37):
                try:
                    v = int(float(r.get(f"dec{d}", "0") or 0))
                except ValueError:
                    v = 0
                riscos.append(v)
            if atual is None:
                mun[geo][k] = riscos
            else:                              # menor risco (não zero) entre solos/ciclos/climas
                mun[geo][k] = [b if a == 0 else a if b == 0 else min(a, b) for a, b in zip(atual, riscos)]
        ja |= vistos_nesta
        print(f"  {safra}: {n} linhas da Bahia", flush=True)

    cod = {0: "0", 20: "2", 30: "3", 40: "4"}
    saida = {}
    for geo, por in mun.items():
        saida[geo] = {str(k): "".join(cod.get(v, "4") for v in riscos) for k, riscos in por.items() if any(riscos)}
    doc = {"gerado_em": hoje.isoformat(timespec="minutes"),
           "fonte": "MAPA — Zoneamento Agrícola de Risco Climático (ZARC), tábuas de risco em dados abertos",
           "regra": "Por município e cultura, o menor risco entre tipos de solo, ciclos e climas zoneados em cada decêndio.",
           "culturas": culturas, "nomes": nomes, "mun": saida}
    destino = os.path.join(PASTA, "zarc_ba.json")
    with open(destino + ".tmp", "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(destino + ".tmp", destino)
    print(f"OK: zarc_ba.json ({os.path.getsize(destino) // 1024} KB, {len(culturas)} culturas, {len(saida)} municípios)")
    if len(saida) < 300:
        sys.exit("poucos municípios: algo deu errado")


if __name__ == "__main__":
    main()
