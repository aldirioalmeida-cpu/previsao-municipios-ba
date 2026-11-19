"""
Gera iuv.json com a previsão do Índice Ultravioleta (IUV) máximo diário, 5 dias,
para os 417 municípios da Bahia (dados/municipios_ba.csv).

Fonte: CAMS - Copernicus Atmosphere Monitoring Service (via Open-Meteo Air Quality API)
  - "cc": IUV de céu claro (sem nuvens)  -> referência do INEMA/OMS
  - "cn": IUV com nuvens previstas

Uso:  python gerar_iuv.py            (grava iuv.json na pasta do script)
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
ARQ_SAIDA = os.path.join(PASTA, "iuv.json")
URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
DIAS = 5
LOTE = 100
FUSO_BAHIA = timezone(timedelta(hours=-3))


def ler_municipios():
    with open(ARQ_MUN, encoding="utf-8") as f:
        return [(r["nome"], float(r["latitude"]), float(r["longitude"])) for r in csv.DictReader(f)]


def baixar(lote, tentativas=4):
    params = {
        "latitude": ",".join(str(m[1]) for m in lote),
        "longitude": ",".join(str(m[2]) for m in lote),
        "hourly": "uv_index_clear_sky,uv_index",
        "timezone": "America/Bahia",
        "forecast_days": DIAS,
    }
    url = URL + "?" + urllib.parse.urlencode(params)
    for i in range(tentativas):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "previsao-municipios-ba/1.0"})
            with urllib.request.urlopen(req, timeout=90) as r:
                dados = json.load(r)
            dados = dados if isinstance(dados, list) else [dados]
            if len(dados) != len(lote):
                raise RuntimeError(f"esperava {len(lote)} pontos, recebi {len(dados)}")
            return dados
        except Exception as e:  # noqa: BLE001
            espera = 15 * (i + 1)
            print(f"  erro ({e}); nova tentativa em {espera}s", file=sys.stderr)
            time.sleep(espera)
    raise RuntimeError("Open-Meteo (CAMS) não respondeu depois de várias tentativas")


def maximo_diario(horas, valores):
    """Máximo de cada dia (horário da Bahia), arredondado para inteiro como no boletim."""
    por_dia = {}
    for h, v in zip(horas, valores):
        if v is None:
            continue
        d = h[:10]
        por_dia[d] = max(por_dia.get(d, 0.0), v)
    return por_dia


def main():
    municipios = ler_municipios()
    print(f"{len(municipios)} municípios")
    saida, todas_datas = {}, set()
    for i in range(0, len(municipios), LOTE):
        lote = municipios[i:i + LOTE]
        print(f"Baixando IUV {i + 1}-{i + len(lote)}...")
        for (nome, lat, lon), resp in zip(lote, baixar(lote)):
            h = resp["hourly"]
            cc = maximo_diario(h["time"], h["uv_index_clear_sky"])
            cn = maximo_diario(h["time"], h["uv_index"])
            todas_datas.update(cc.keys())
            saida[nome] = {"ll": [lat, lon], "cc": cc, "cn": cn}
        time.sleep(20)   # respeita o limite por minuto do Open-Meteo

    datas = sorted(todas_datas)[:DIAS]
    for nome, m in saida.items():
        m["cc"] = [None if m["cc"].get(d) is None else round(m["cc"][d]) for d in datas]
        m["cn"] = [None if m["cn"].get(d) is None else round(m["cn"][d]) for d in datas]

    faltando = [n for n, m in saida.items() if m["cc"][0] is None]
    if len(saida) != len(municipios) or len(faltando) > 5:
        raise RuntimeError(f"Dados incompletos ({len(saida)} municípios, {len(faltando)} sem IUV)")

    doc = {
        "gerado_em": datetime.now(FUSO_BAHIA).isoformat(timespec="minutes"),
        "fonte": "CAMS - Copernicus Atmosphere Monitoring Service (via Open-Meteo)",
        "datas": datas,
        "municipios": saida,
    }
    tmp = ARQ_SAIDA + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, ARQ_SAIDA)
    print(f"OK: {ARQ_SAIDA} ({os.path.getsize(ARQ_SAIDA) // 1024} KB, {datas[0]} a {datas[-1]})")


if __name__ == "__main__":
    main()
