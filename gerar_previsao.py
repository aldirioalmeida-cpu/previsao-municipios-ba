"""
Gera previsao.json com a previsão diária de 7 dias para os 417 municípios da Bahia
listados em dados/municipios_ba.csv.

- Tempo, temperatura, chuva, nuvens, umidade, vento, nascer/pôr do sol:
  modelo ECMWF IFS 0,25° (via Open-Meteo)
- Índice UV: "melhor modelo" do Open-Meteo (o ECMWF não fornece UV)
- Previsão por período (madrugada 0-6h, manhã 6-12h, tarde 12-18h, noite 18-24h), a partir dos
  dados horários do mesmo modelo e da mesma rodada. Em cada dia, "p" traz 4 períodos [temp, mm, código, nuvens]:
  temperatura = mínima da madrugada, média da manhã, máxima da tarde e média da noite (sempre dentro da mín/máx do dia).
  A chuva do dia ("mm") é a SOMA dos 4 períodos, e o código do tempo do dia ("c") e as nuvens ("n") são
  recalculados a partir deles, para o card e o detalhamento sempre baterem.

Uso:  python gerar_previsao.py            (grava previsao.json na pasta do script)
Só usa a biblioteca padrão do Python (3.8+).
"""
import csv
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

PASTA = os.path.dirname(os.path.abspath(__file__))
ARQ_MUN = os.path.join(PASTA, "dados", "municipios_ba.csv")
ARQ_SAIDA = os.path.join(PASTA, "previsao.json")

MODELO = "ecmwf_ifs025"
DIAS = 7                  # o site mostra 5; a planilha de temperaturas da COCEP usa os 7
LOTE = 100                # municípios por requisição
VARIAVEIS = ["weather_code", "temperature_2m_min", "temperature_2m_max", "precipitation_sum",
             "cloud_cover_mean", "relative_humidity_2m_min", "relative_humidity_2m_max",
             "wind_speed_10m_mean", "wind_gusts_10m_max", "wind_direction_10m_dominant",
             "sunrise", "sunset"]
HORARIAS = ["temperature_2m", "precipitation", "weather_code", "cloud_cover"]
PERIODOS = [(0, "min"), (6, "med"), (12, "max"), (18, "med")]   # hora de início (local) e como resumir a temperatura
LIM_PERIODO = (2.5, 10)   # mm em 6 h: até 2,5 fraca; até 10 moderada; acima forte
LIM_DIA = (5, 25)         # mm no dia: até 5 fraca; até 25 moderada; acima forte
URL = "https://api.open-meteo.com/v1/forecast"
FUSO_BAHIA = timezone(timedelta(hours=-3))


def ler_municipios():
    with open(ARQ_MUN, encoding="utf-8") as f:
        return [(r["nome"], float(r["latitude"]), float(r["longitude"])) for r in csv.DictReader(f)]


def baixar(lote, variaveis, modelo=None, tentativas=4, horarias=None):
    params = {
        "latitude": ",".join(str(m[1]) for m in lote),
        "longitude": ",".join(str(m[2]) for m in lote),
        "daily": ",".join(variaveis),
        "timezone": "America/Bahia",
        "forecast_days": DIAS,
    }
    if modelo:
        params["models"] = modelo
    if horarias:
        params["hourly"] = ",".join(horarias)
    url = URL + "?" + urllib.parse.urlencode(params)
    for i in range(tentativas):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "previsao-municipios-ba/1.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                dados = json.load(r)
            dados = dados if isinstance(dados, list) else [dados]
            if len(dados) != len(lote):
                raise RuntimeError(f"esperava {len(lote)} pontos, recebi {len(dados)}")
            return dados
        except Exception as e:  # noqa: BLE001
            espera = 10 * (i + 1)
            print(f"  erro ({e}); nova tentativa em {espera}s", file=sys.stderr)
            time.sleep(espera)
    raise RuntimeError("Open-Meteo não respondeu depois de várias tentativas")


def arred(lista, casas=0):
    return [None if v is None else (round(v) if casas == 0 else round(v, casas)) for v in lista]


def hora(lista):
    return [v[11:16] if v else None for v in lista]   # "2026-11-19T04:57" -> "04:57"


def cod_por_chuva(cod, mm, lim):
    """Código do tempo coerente com a chuva mostrada: sem chuva não há gota; a intensidade vem do total."""
    if cod in (45, 48):                      # nevoeiro
        return cod if mm < 0.1 else (61 if mm < lim[0] else 63 if mm < lim[1] else 65)
    if mm < 0.1:
        return 0                             # sem chuva: o ícone segue só as nuvens
    if cod >= 95:
        return cod                           # trovoada
    if cod < 51 and mm < 1:
        return 0                             # garoa desprezível sem sinal de chuva no modelo
    pancada = 80 <= cod <= 82 or cod < 51
    if mm < lim[0]:
        return 80 if pancada else 61
    if mm < lim[1]:
        return 81 if pancada else 63
    return 82 if pancada else 65


def periodos(h, datas, tmin, tmax):
    """Resume os dados horários em 4 períodos por dia e recalcula chuva, código e nuvens do dia."""
    pos = {t: i for i, t in enumerate(h["time"])}
    por_dia, mm_dia, c_dia, n_dia = [], [], [], []
    for k, data in enumerate(datas):
        ps, soma, cod_d, nuv_d, horas_d = [], 0.0, -1, 0.0, 0
        for ini, modo in PERIODOS:
            temps, mm, cod, nuv, n = [], 0.0, -1, 0.0, 0
            for x in range(6):
                i = pos.get(f"{data}T{ini + x:02d}:00")
                if i is None or h["temperature_2m"][i] is None:
                    continue
                temps.append(h["temperature_2m"][i]); n += 1
                mm += h["precipitation"][i] or 0.0
                nuv += h["cloud_cover"][i] or 0.0
                c = h["weather_code"][i]
                if c is not None and c > cod:
                    cod = c                  # condição mais significativa do período
            if not n:
                ps = None
                break
            t = min(temps) if modo == "min" else max(temps) if modo == "max" else sum(temps) / len(temps)
            t = round(t)
            if tmax[k] is not None:
                t = min(t, tmax[k])
            if tmin[k] is not None:
                t = max(t, tmin[k])
            mm = max(0.0, round(mm, 1))
            ps.append([t, mm, cod_por_chuva(cod, mm, LIM_PERIODO), round(nuv / n)])
            soma += mm; nuv_d += nuv; horas_d += n
            cod_d = max(cod_d, cod)
        if ps is None:                       # dia sem todas as horas: fica sem detalhamento
            por_dia.append(None); mm_dia.append(None); c_dia.append(None); n_dia.append(None)
            continue
        soma = round(soma, 1)
        por_dia.append(ps); mm_dia.append(soma)
        c_dia.append(cod_por_chuva(cod_d, soma, LIM_DIA)); n_dia.append(round(nuv_d / horas_d))
    return por_dia, mm_dia, c_dia, n_dia


def main():
    municipios = ler_municipios()
    print(f"{len(municipios)} municípios")
    saida = {}
    datas = None
    uv_ok = True
    for i in range(0, len(municipios), LOTE):
        lote = municipios[i:i + LOTE]
        print(f"Baixando {i + 1}-{i + len(lote)}...")
        respostas = baixar(lote, VARIAVEIS, MODELO, horarias=HORARIAS)
        try:
            uv = baixar(lote, ["uv_index_max"])
        except RuntimeError:
            uv, uv_ok = None, False   # sem UV não impede a publicação
        for k, ((nome, lat, lon), resp) in enumerate(zip(lote, respostas)):
            d = resp["daily"]
            datas = datas or d["time"]
            saida[nome] = {
                "ll": [lat, lon],   # sede do município (usada para achar o mais próximo do visitante)
                "c": d["weather_code"],
                "min": arred(d["temperature_2m_min"]),
                "max": arred(d["temperature_2m_max"]),
                # o ECMWF às vezes gera -0,1 mm (ruído da desacumulação da chuva): vira 0
                "mm": [None if v is None else max(0.0, v) for v in arred(d["precipitation_sum"], 1)],
                "n": arred(d["cloud_cover_mean"]),
                "urmin": arred(d["relative_humidity_2m_min"]),
                "urmax": arred(d["relative_humidity_2m_max"]),
                "v": arred(d["wind_speed_10m_mean"]),
                "raj": arred(d["wind_gusts_10m_max"]),
                "dir": arred(d["wind_direction_10m_dominant"]),
                "nasc": hora(d["sunrise"]),
                "por": hora(d["sunset"]),
                "uv": arred(uv[k]["daily"]["uv_index_max"]) if uv else [None] * len(d["time"]),
            }
            # períodos do dia; chuva/código/nuvens do dia passam a ser a soma/resumo dos períodos
            m = saida[nome]
            try:
                p, mm_p, c_p, n_p = periodos(resp["hourly"], d["time"], m["min"], m["max"])
                m["p"] = p
                for j in range(len(d["time"])):
                    if mm_p[j] is not None:
                        m["mm"][j], m["c"][j], m["n"][j] = mm_p[j], c_p[j], n_p[j]
            except (KeyError, TypeError, ValueError) as e:
                print(f"  aviso: sem períodos para {nome} ({e})", file=sys.stderr)
        time.sleep(20)   # respeita o limite por minuto do Open-Meteo (cada ponto/variável conta)

    # Validação: não publica um arquivo quebrado
    faltando = [n for n, v in saida.items() if v["max"][0] is None or v["min"][0] is None]
    if len(saida) != len(municipios) or len(faltando) > 5:
        raise RuntimeError(f"Dados incompletos ({len(saida)} municípios, {len(faltando)} sem temperatura)")

    doc = {
        "gerado_em": datetime.now(FUSO_BAHIA).isoformat(timespec="minutes"),
        "modelo": "ECMWF IFS 0,25° (via Open-Meteo)",
        "modelo_uv": "Open-Meteo (melhor modelo disponível)" if uv_ok else None,
        "datas": datas,
        "periodos": {"nomes": ["Madrugada", "Manhã", "Tarde", "Noite"], "horas": ["0h–6h", "6h–12h", "12h–18h", "18h–24h"],
                     "campos": ["temp", "mm", "codigo", "nuvens"]},
        "municipios": saida,
    }
    tmp = ARQ_SAIDA + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, ARQ_SAIDA)
    print(f"OK: {ARQ_SAIDA} ({os.path.getsize(ARQ_SAIDA) // 1024} KB, {len(datas)} dias, "
          f"{datas[0]} a {datas[-1]}, UV {'ok' if uv_ok else 'indisponível'})")


if __name__ == "__main__":
    main()
