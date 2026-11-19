"""
Gera previsao.json com a previsão diária de 5 dias para os 417 municípios da Bahia
listados em dados/municipios_ba.csv.

- Tempo, temperatura, chuva, nuvens, umidade, vento, nascer/pôr do sol:
  modelo ECMWF IFS 0,25° (via Open-Meteo)
- Índice UV: "melhor modelo" do Open-Meteo (o ECMWF não fornece UV)

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
DIAS = 5
LOTE = 100                # municípios por requisição
VARIAVEIS = ["weather_code", "temperature_2m_min", "temperature_2m_max", "precipitation_sum",
             "cloud_cover_mean", "relative_humidity_2m_min", "relative_humidity_2m_max",
             "wind_speed_10m_mean", "wind_gusts_10m_max", "wind_direction_10m_dominant",
             "sunrise", "sunset"]
URL = "https://api.open-meteo.com/v1/forecast"
FUSO_BAHIA = timezone(timedelta(hours=-3))


def ler_municipios():
    with open(ARQ_MUN, encoding="utf-8") as f:
        return [(r["nome"], float(r["latitude"]), float(r["longitude"])) for r in csv.DictReader(f)]


def baixar(lote, variaveis, modelo=None, tentativas=4):
    params = {
        "latitude": ",".join(str(m[1]) for m in lote),
        "longitude": ",".join(str(m[2]) for m in lote),
        "daily": ",".join(variaveis),
        "timezone": "America/Bahia",
        "forecast_days": DIAS,
    }
    if modelo:
        params["models"] = modelo
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


def main():
    municipios = ler_municipios()
    print(f"{len(municipios)} municípios")
    saida = {}
    datas = None
    uv_ok = True
    for i in range(0, len(municipios), LOTE):
        lote = municipios[i:i + LOTE]
        print(f"Baixando {i + 1}-{i + len(lote)}...")
        respostas = baixar(lote, VARIAVEIS, MODELO)
        try:
            uv = baixar(lote, ["uv_index_max"])
        except RuntimeError:
            uv, uv_ok = None, False   # sem UV não impede a publicação
        for k, ((nome, _, _), resp) in enumerate(zip(lote, respostas)):
            d = resp["daily"]
            datas = datas or d["time"]
            saida[nome] = {
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
