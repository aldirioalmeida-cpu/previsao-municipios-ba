"""
Painel ENOS (El Niño / La Niña) e oceanos — gera enos.json.

Fontes (NOAA, dados abertos):
  CPC  wksst9120.for   índices semanais Niño 1+2, 3, 3.4 e 4 (TSM e anomalia, base 1991-2020)
  CPC  oni.ascii.txt   ONI (média móvel de 3 meses da anomalia do Niño 3.4, ERSST) desde 1950
  PSL  tna.data / tsa.data   Atlântico Tropical Norte e Sul (anomalia mensal, HadISST, base 1991-2020)
  CPC  ensodisc.shtml  situação oficial (ENSO Alert System Status) e resumo (em inglês, com tradução automática para o português)
Só biblioteca padrão do Python.
"""
import html, json, os, re, sys, time, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

PASTA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUSO = timezone(timedelta(hours=-3))
UA = {"User-Agent": "inema-enos/1.0 (github actions)"}
MESES = {m: i + 1 for i, m in enumerate(["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"])}


def baixa(url, tentativas=4):
    for i in range(tentativas):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:  # noqa
            print(f"  erro em {url}: {e}", file=sys.stderr)
            time.sleep(10 * (i + 1))
    raise RuntimeError("falhou: " + url)


def semanal():
    linhas = []
    for l in baixa("https://www.cpc.ncep.noaa.gov/data/indices/wksst9120.for").splitlines():
        m = re.match(r"\s*(\d{2})([A-Z]{3})(\d{4})\s+(.*)$", l)
        if not m:
            continue
        nums = [float(x) for x in re.findall(r"-?\d+\.\d", m.group(4))]
        if len(nums) != 8:
            continue
        d = f"{m.group(3)}-{MESES[m.group(2)]:02d}-{int(m.group(1)):02d}"
        linhas.append([d] + nums[1::2] + nums[0::2])   # data, anomalias (1+2, 3, 3.4, 4), TSMs (1+2, 3, 3.4, 4)
    return linhas


def oni():
    out = []
    for l in baixa("https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt").splitlines():
        p = l.split()
        if len(p) == 4 and p[1].isdigit():
            out.append([p[0], int(p[1]), float(p[3])])   # trimestre, ano, anomalia
    return out


def psl(nome):
    out = []
    for l in baixa(f"https://psl.noaa.gov/data/correlation/{nome}.data").splitlines()[1:]:
        p = l.split()
        if len(p) == 13 and p[0].isdigit():
            for m, v in enumerate(p[1:], 1):
                x = float(v)
                if x > -90:
                    out.append([f"{p[0]}-{m:02d}", x])
    return out


def situacao():
    h = baixa("https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml")
    txt = html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", re.sub(r"(?is)<(script|style).*?</\1>", "", h))))
    st = re.search(r"ENSO Alert System Status:\s*(.+?)\s+Synopsis:", txt)
    sy = re.search(r"Synopsis:\s*(.+?)(?:\s{2,}|$)", txt)
    data = re.search(r"issued by\s+CLIMATE PREDICTION CENTER.*?(\d{1,2}\s+\w+\s+\d{4})", txt, re.I)
    resumo = None
    if sy:
        resumo = sy.group(1)
        resumo = resumo[:resumo.find(". ") + 1] if ". " in resumo[:400] else resumo[:400]
    corpo = txt[st.end():st.end() + 1500] if st else ""
    return {"status": st.group(1).strip() if st else None, "resumo": resumo, "texto": corpo.strip()[:1500],
            "data": data.group(1) if data else None,
            "url": "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml"}


MESES_EN = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
MESES_PT = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
# nomes que o tradutor não deve mexer / ajustes de termos técnicos
AJUSTES = [(r"\bEl Nino\b", "El Niño"), (r"\bLa Nina\b", "La Niña"), (r"\bO Niño\b", "O El Niño")]


def data_pt(d):
    m = re.match(r"(\d{1,2})\s+(\w+)\s+(\d{4})", d or "")
    if not m or m.group(2).lower() not in MESES_EN:
        return None
    return f"{int(m.group(1))} de {MESES_PT[MESES_EN.index(m.group(2).lower())]} de {m.group(3)}"


def traduz(texto):
    """Tradução automática inglês → português do Brasil (MyMemory; se falhar, Google Tradutor). Devolve None se nenhum responder."""
    q = urllib.parse.quote(texto)
    tentativas = [
        ("mymemory", f"https://api.mymemory.translated.net/get?langpair=en|pt-BR&q={q}",
         lambda j: j["responseData"]["translatedText"] if j.get("responseStatus") == 200 else None),
        ("google", f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q={q}",
         lambda j: "".join(p[0] for p in j[0] if p and p[0])),
    ]
    for nome, url, pega in tentativas:
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=30) as r:
                t = pega(json.loads(r.read().decode("utf-8")))
            if t and t.strip() and t.strip().lower() != texto.strip().lower():
                t = html.unescape(t.strip())
                for a, b in AJUSTES:
                    t = re.sub(a, b, t)
                # meses em minúscula, como no português (ex.: "Janeiro-Março" → "janeiro–março")
                t = re.sub(r"(?<=\w[\s(–-])(" + "|".join(m.capitalize() for m in MESES_PT) + r")\b", lambda x: x.group(1).lower(), t)
                t = re.sub(r"\b(" + "|".join(MESES_PT) + r")-(" + "|".join(MESES_PT) + r")\b", r"\1–\2", t)
                print(f"  resumo traduzido ({nome})")
                return t
        except Exception as e:  # noqa
            print(f"  tradutor {nome} falhou: {e}", file=sys.stderr)
    return None


def anterior():
    try:
        with open(os.path.join(PASTA, "enos.json"), encoding="utf-8") as f:
            return json.load(f)
    except Exception:  # noqa
        return {}


def main():
    velho = (anterior().get("situacao") or {})
    doc = {"gerado_em": datetime.now(FUSO).isoformat(timespec="minutes"), "erros": {}}
    for chave, f in (("semanal", semanal), ("oni", oni), ("situacao", situacao)):
        try:
            doc[chave] = f()
        except Exception as e:  # noqa
            doc["erros"][chave] = str(e)[:200]
    sit = doc.get("situacao")
    if sit and sit.get("resumo"):
        sit["data_pt"] = data_pt(sit.get("data"))
        # só traduz de novo quando o texto da NOAA muda (evita chamadas e mudanças de redação a cada rodada)
        if velho.get("resumo") == sit["resumo"] and velho.get("resumo_pt"):
            sit["resumo_pt"] = velho["resumo_pt"]
        else:
            sit["resumo_pt"] = traduz(sit["resumo"])
    try:
        tna, tsa = psl("tna"), psl("tsa")
        dsa = dict(tsa)
        doc["atlantico"] = [[m, v, dsa.get(m), round(v - dsa[m], 2) if m in dsa else None] for m, v in tna if m >= "1980-01"]
    except Exception as e:  # noqa
        doc["erros"]["atlantico"] = str(e)[:200]
    if "semanal" not in doc:
        raise SystemExit("sem os índices semanais: " + json.dumps(doc["erros"]))
    doc["campos_semanal"] = ["semana", "anom_1+2", "anom_3", "anom_3.4", "anom_4", "tsm_1+2", "tsm_3", "tsm_3.4", "tsm_4"]
    doc["campos_atlantico"] = ["mes", "TNA", "TSA", "TNA-TSA"]
    destino = os.path.join(PASTA, "enos.json")
    with open(destino + ".tmp", "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(destino + ".tmp", destino)
    s = doc["semanal"][-1]
    print(f"OK: enos.json | semana {s[0]} Niño3.4 {s[3]:+.1f} | ONI {doc.get('oni', [[None]])[-1]} | "
          f"situação: {(doc.get('situacao') or {}).get('status')} | erros {doc['erros']}")


if __name__ == "__main__":
    main()
