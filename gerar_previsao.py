"""
Gera previsao.json com a previsão diária do modelo ECMWF IFS 0,25° (via Open-Meteo)
para os 417 municípios da Bahia listados em dados/municipios_ba.csv.

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
DIAS = 10                 # o ECMWF IFS vai até 15 dias, mas o último dia costuma vir incompleto
LOTE = 100                # municípios por requisição
VARIAVEIS = ["weather_code", "temperature_2m_max", "temperature_2m_min",
             "precipitation_sum", "precipitation_probability_max"]
URL = "https://api.open-meteo.com/v1/forecast"
FUSO_BAHIA = timezone(timedelta(hours=-3))


def ler_municipios():
    with open(ARQ_MUN, encoding="utf-8") as f:
        return [(r["nome"], float(r["latitude"]), float(r["longitude"])) for r in csv.DictReader(f)]


def baixar(lote, tentativas=4):
    params = {
        "latitude": ",".join(str(m[1]) for m in lote),
        "longitude": ",".join(str(m[2]) for m in lote),
        "daily": ",".join(VARIAVEIS),
        "timezone": "America/Bahia",
        "forecast_days": DIAS,
        "models": MODELO,
    }
    url = URL + "?" + urllib.parse.urlencode(params)
    for i in range(tentativas):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "previsao-municipios-ba/1.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                dados = json.load(r)
            return dados if isinstance(dados, list) else [dados]
        except Exception as e:  # noqa: BLE001
            espera = 10 * (i + 1)
            print(f"  erro ({e}); nova tentativa em {espera}s", file=sys.stderr)
            time.sleep(espera)
    raise RuntimeError("Open-Meteo não respondeu depois de várias tentativas")


def arred(lista, casas=0):
    return [None if v is None else (round(v) if casas == 0 else round(v, casas)) for v in lista]


def main():
    municipios = ler_municipios()
    print(f"{len(municipios)} municípios")
    saida = {}
    datas = None
    for i in range(0, len(municipios), LOTE):
        lote = municipios[i:i + LOTE]
        print(f"Baixando {i + 1}-{i + len(lote)}...")
        respostas = baixar(lote)
        if len(respostas) != len(lote):
            raise RuntimeError(f"Esperava {len(lote)} pontos, recebi {len(respostas)}")
        for (nome, _, _), resp in zip(lote, respostas):
            d = resp["daily"]
            datas = datas or d["time"]
            saida[nome] = {
                "c": d["weather_code"],
                "max": arred(d["temperature_2m_max"]),
                "min": arred(d["temperature_2m_min"]),
                "mm": arred(d["precipitation_sum"], 1),
                "p": d["precipitation_probability_max"],
            }
        time.sleep(1)

    # Validação: não publica um arquivo quebrado
    faltando = [n for n, v in saida.items() if v["max"][0] is None or v["min"][0] is None]
    if len(saida) != len(municipios) or len(faltando) > 5:
        raise RuntimeError(f"Dados incompletos ({len(saida)} municípios, {len(faltando)} sem temperatura)")

    doc = {
        "gerado_em": datetime.now(FUSO_BAHIA).isoformat(timespec="minutes"),
        "modelo": "ECMWF IFS 0,25° (via Open-Meteo)",
        "datas": datas,
        "municipios": saida,
    }
    tmp = ARQ_SAIDA + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, ARQ_SAIDA)
    print(f"OK: {ARQ_SAIDA} ({os.path.getsize(ARQ_SAIDA) // 1024} KB, {len(datas)} dias, {datas[0]} a {datas[-1]})")


if __name__ == "__main__":
    main()
