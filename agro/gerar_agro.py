"""
Painel agrometeorológico da Bahia — gera agro.json para os 417 municípios (sede), 7 dias.

Fonte: Open-Meteo (melhor modelo disponível para cada variável), fuso America/Bahia.
  - Evapotranspiração de referência (ET0 FAO-56) diária, mm
  - Chuva diária prevista, mm  ->  balanço hídrico = chuva - ET0
  - Umidade do solo 0-7 cm e 7-28 cm (m³/m³), média do dia
  - Condições para manejo (pulverização/aplicação), a partir dos dados horários das 6h às 18h:
      hora boa = sem chuva (< 0,1 mm), vento 3-10 km/h, umidade >= 55% e temperatura <= 30 °C
      0 Favorável (>= 4 h boas) | 1 Razoável (2-3 h) | 2 Desfavorável (1 h) | 3 Crítico (nenhuma)
      e a maior janela contínua de horas boas (ex.: "06h–10h").
Só biblioteca padrão do Python.
"""
import csv, json, os, sys, time, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

PASTA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARQ_MUN = os.path.join(PASTA, "dados", "municipios_ba.csv")
URL = "https://api.open-meteo.com/v1/forecast"
DIAS = 7
LOTE = 100
FUSO = timezone(timedelta(hours=-3))
DIARIAS = ["et0_fao_evapotranspiration", "precipitation_sum"]
HORARIAS = ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "precipitation", "soil_moisture_0_to_7cm", "soil_moisture_7_to_28cm"]


def baixar(lote, tentativas=4):
    q = {"latitude": ",".join(f"{m[1]:.4f}" for m in lote), "longitude": ",".join(f"{m[2]:.4f}" for m in lote),
         "daily": ",".join(DIARIAS), "hourly": ",".join(HORARIAS), "timezone": "America/Bahia", "forecast_days": DIAS}
    url = URL + "?" + urllib.parse.urlencode(q)
    for i in range(tentativas):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "inema-agro/1.0 (github actions)"})
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.load(r)
            d = d if isinstance(d, list) else [d]
            if len(d) != len(lote):
                raise RuntimeError(f"esperava {len(lote)} pontos, recebi {len(d)}")
            return d
        except Exception as e:  # noqa
            print(f"  erro ({e}); nova tentativa", file=sys.stderr)
            time.sleep(15 * (i + 1))
    raise RuntimeError("Open-Meteo não respondeu")


def r1(v):
    return None if v is None else round(v, 1)


def manejo(h, k):
    """Classe de manejo e janela do dia k a partir dos dados horários."""
    boas = []
    for x in range(6, 19):
        i = k * 24 + x
        try:
            t, ur, v, ch = h["temperature_2m"][i], h["relative_humidity_2m"][i], h["wind_speed_10m"][i], h["precipitation"][i]
        except (IndexError, KeyError):
            return None, 0, None
        if None in (t, ur, v, ch):
            return None, 0, None
        boas.append(ch < 0.1 and 3 <= v <= 10 and ur >= 55 and t <= 30)
    n = sum(boas)
    classe = 0 if n >= 4 else 1 if n >= 2 else 2 if n == 1 else 3
    melhor, ini, atual, ini_at = 0, None, 0, None
    for j, ok in enumerate(boas):
        if ok:
            if atual == 0:
                ini_at = j
            atual += 1
            if atual > melhor:
                melhor, ini = atual, ini_at
        else:
            atual = 0
    janela = f"{6 + ini:02d}h–{6 + ini + melhor:02d}h" if melhor else None
    return classe, n, janela


def media(lst):
    v = [x for x in lst if x is not None]
    return round(sum(v) / len(v), 3) if v else None


def main():
    with open(ARQ_MUN, encoding="utf-8") as f:
        muns = [(r["nome"], float(r["latitude"]), float(r["longitude"])) for r in csv.DictReader(f)]
    saida, datas = {}, None
    for i in range(0, len(muns), LOTE):
        lote = muns[i:i + LOTE]
        print(f"Baixando {i + 1}-{i + len(lote)}...", flush=True)
        for (nome, la, lo), r in zip(lote, baixar(lote)):
            d, h = r["daily"], r["hourly"]
            datas = datas or d["time"]
            m = {"et0": [], "chuva": [], "bal": [], "sm1": [], "sm2": [], "man": [], "horas": [], "jan": []}
            for k in range(len(d["time"])):
                et0, ch = d["et0_fao_evapotranspiration"][k], d["precipitation_sum"][k]
                m["et0"].append(r1(et0)); m["chuva"].append(r1(max(0.0, ch)) if ch is not None else None)
                m["bal"].append(r1(ch - et0) if ch is not None and et0 is not None else None)
                m["sm1"].append(media(h["soil_moisture_0_to_7cm"][k * 24:(k + 1) * 24]))
                m["sm2"].append(media(h["soil_moisture_7_to_28cm"][k * 24:(k + 1) * 24]))
                c, n, jan = manejo(h, k)
                m["man"].append(c); m["horas"].append(n); m["jan"].append(jan)
            saida[nome] = m
        time.sleep(20)
    if len(saida) != len(muns):
        raise SystemExit(f"incompleto: {len(saida)} de {len(muns)}")
    doc = {"gerado_em": datetime.now(FUSO).isoformat(timespec="minutes"), "datas": datas,
           "fonte": "Open-Meteo (melhor modelo disponível), na sede de cada município",
           "regra_manejo": "Hora boa (6h–18h): sem chuva, vento de 3 a 10 km/h, umidade ≥ 55% e temperatura ≤ 30 °C. "
                           "Favorável: 4 h ou mais; Razoável: 2–3 h; Desfavorável: 1 h; Crítico: nenhuma.",
           "municipios": saida}
    destino = os.path.join(PASTA, "agro.json")
    with open(destino + ".tmp", "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(destino + ".tmp", destino)
    print(f"OK: agro.json ({os.path.getsize(destino) // 1024} KB, {len(saida)} municípios, {datas[0]} a {datas[-1]})")


if __name__ == "__main__":
    main()
