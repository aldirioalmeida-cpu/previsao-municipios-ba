"""
Temperaturas diárias (máxima e mínima) dos 417 municípios da Bahia para o cálculo de graus-dia do painel
agrometeorológico — gera temp_ba.json.

O site do governo (ba.gov.br) não deixa a página buscar dados direto na Open-Meteo, por isso o robô guarda a série
no repositório e a página lê pelo jsDelivr.

  - Dias recentes e previsão (7 dias): API de previsão da Open-Meteo (past_days=20), refeita a cada rodada.
  - Dias antigos: reanálise ERA5 (archive-api), preenchida aos poucos (BLOCO dias por rodada) até cobrir DIAS_HIST.
Formato: {"inicio": "AAAA-MM-DD", "hoje": "AAAA-MM-DD", "mun": {nome: [tx..., tn...]}} com valores em décimos de °C
(inteiros; null quando falta) — a primeira metade da lista é a máxima e a segunda a mínima.
Só biblioteca padrão do Python.
"""
import csv, json, os, sys, time, urllib.parse, urllib.request
from datetime import date, datetime, timedelta, timezone

PASTA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARQ_MUN = os.path.join(PASTA, "dados", "municipios_ba.csv")
DESTINO = os.path.join(PASTA, "temp_ba.json")
PREV = "https://api.open-meteo.com/v1/forecast"
ARQ = "https://archive-api.open-meteo.com/v1/archive"
FUSO = timezone(timedelta(hours=-3))
LOTE = 100
DIAS_HIST = 400        # quanto a série guarda para trás
BLOCO = 90             # dias de reanálise buscados por rodada (limite de uso da Open-Meteo)


def baixar(url, lote, extra, tentativas=3):
    q = {"latitude": ",".join(f"{m[1]:.4f}" for m in lote), "longitude": ",".join(f"{m[2]:.4f}" for m in lote),
         "daily": "temperature_2m_max,temperature_2m_min", "timezone": "America/Bahia"}
    q.update(extra)
    u = url + "?" + urllib.parse.urlencode(q)
    for i in range(tentativas):
        try:
            req = urllib.request.Request(u, headers={"User-Agent": "inema-agro/1.0 (github actions)"})
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.load(r)
            d = d if isinstance(d, list) else [d]
            if len(d) != len(lote):
                raise RuntimeError(f"esperava {len(lote)} pontos, recebi {len(d)}")
            return d
        except Exception as e:  # noqa
            print(f"  erro ({e}); nova tentativa", file=sys.stderr)
            time.sleep(30 * (i + 1))
    raise RuntimeError("Open-Meteo não respondeu")


def junta(serie, resp):
    d = resp["daily"]
    for t, tx, tn in zip(d["time"], d["temperature_2m_max"], d["temperature_2m_min"]):
        if tx is not None and tn is not None:
            serie[t] = (round(tx * 10), round(tn * 10))


def main():
    with open(ARQ_MUN, encoding="utf-8") as f:
        muns = [(r["nome"], float(r["latitude"]), float(r["longitude"])) for r in csv.DictReader(f)]
    hoje = datetime.now(FUSO).date()
    alvo = hoje - timedelta(days=DIAS_HIST)

    # série já guardada
    S = {m[0]: {} for m in muns}
    inicio = None
    try:
        with open(DESTINO, encoding="utf-8") as f:
            ant = json.load(f)
        inicio = date.fromisoformat(ant["inicio"])
        for nome, v in ant["mun"].items():
            if nome not in S:
                continue
            n = len(v) // 2
            for i in range(n):
                if v[i] is not None and v[n + i] is not None:
                    S[nome][(inicio + timedelta(days=i)).isoformat()] = (v[i], v[n + i])
        print("série anterior desde", inicio, flush=True)
    except Exception as e:  # noqa
        print("  sem série anterior:", e, file=sys.stderr)

    # dias recentes e previsão
    for i in range(0, len(muns), LOTE):
        lote = muns[i:i + LOTE]
        print(f"Previsão {i + 1}-{i + len(lote)}...", flush=True)
        try:
            for m, r in zip(lote, baixar(PREV, lote, {"past_days": 20, "forecast_days": 7})):
                junta(S[m[0]], r)
        except Exception as e:  # noqa
            if inicio is None:
                raise
            print("  previsão falhou nesta rodada; mantém a série anterior:", e, file=sys.stderr)
            break
        time.sleep(15)

    # reanálise para trás, um bloco por rodada
    mais_antigo = min((min(s) for s in S.values() if s), default=hoje.isoformat())
    mais_antigo = date.fromisoformat(mais_antigo)
    if mais_antigo > alvo:
        fim = mais_antigo - timedelta(days=1)
        ini = max(alvo, fim - timedelta(days=BLOCO - 1))
        for i in range(0, len(muns), LOTE):
            lote = muns[i:i + LOTE]
            print(f"Reanálise {ini}..{fim} {i + 1}-{i + len(lote)}...", flush=True)
            try:
                for m, r in zip(lote, baixar(ARQ, lote, {"start_date": ini.isoformat(), "end_date": fim.isoformat()})):
                    junta(S[m[0]], r)
            except Exception as e:  # noqa
                print("  reanálise falhou nesta rodada:", e, file=sys.stderr)
                break
            time.sleep(30)

    # monta a saída a partir do dia mais antigo comum (corta o que passou de DIAS_HIST)
    datas = sorted({d for s in S.values() for d in s if d >= alvo.isoformat()})
    ini = date.fromisoformat(datas[0])
    fim = date.fromisoformat(datas[-1])
    n = (fim - ini).days + 1
    lista = [(ini + timedelta(days=i)).isoformat() for i in range(n)]
    saida = {}
    for nome, s in S.items():
        tx = [s[d][0] if d in s else None for d in lista]
        tn = [s[d][1] if d in s else None for d in lista]
        saida[nome] = tx + tn
    doc = {"gerado_em": datetime.now(FUSO).isoformat(timespec="minutes"), "inicio": lista[0], "hoje": hoje.isoformat(),
           "fonte": "Open-Meteo: modelos de previsão (últimos 20 dias e próximos 7) e reanálise ERA5 (antes disso), na sede do município",
           "unidade": "décimos de °C; primeira metade = máxima, segunda = mínima", "mun": saida}
    with open(DESTINO + ".tmp", "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(DESTINO + ".tmp", DESTINO)
    print(f"OK: temp_ba.json ({os.path.getsize(DESTINO) // 1024} KB, {len(saida)} municípios, {lista[0]} a {lista[-1]})")
    if len(saida) < 400:
        sys.exit("poucos municípios")


if __name__ == "__main__":
    main()
