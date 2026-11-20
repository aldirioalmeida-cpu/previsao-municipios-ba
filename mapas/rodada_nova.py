"""
Verifica se já saiu uma rodada (00Z ou 12Z) mais nova que a dos mapas publicados, completa nos três modelos.

Usa a mesma regra do gerar_mapas.py: a rodada está "disponível" num modelo quando já existe o último passo
de que os mapas precisam (5 dias locais completos). Só biblioteca padrão; termina em segundos.

Saída (para o $GITHUB_OUTPUT do workflow):
  rodar=true|false
  rodada=AAAA-MM-DDTHHZ   (rodada comum mais nova disponível, se houver)
Uso: python rodada_nova.py [--publicada AAAA-MM-DDTHHZ]   (sem --publicada, lê o info.json do ramo "mapas")
"""
import argparse, datetime as dt, json, sys, urllib.request

REPO = "aldirioalmeida-cpu/previsao-municipios-ba"
UA = {"User-Agent": "inema-meteorologia-mapas/1.0 (github actions)"}
NDIAS = 5


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def existe(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA, method="HEAD"), timeout=30) as r:
            return r.status == 200
    except Exception:
        return False


def ultimo_passo(ciclo):
    primeiro = (3 - ciclo.hour) % 24 or 24          # 00h local (03 UTC) do 1º dia completo
    return primeiro + 24 * (NDIAS - 1) + 24


def disponivel(modelo, c):
    p = ultimo_passo(c)
    d, h, dh = c.strftime("%Y%m%d"), c.strftime("%H"), c.strftime("%Y%m%d%H")
    if modelo == "ecmwf":
        return existe(f"https://data.ecmwf.int/forecasts/{d}/{h}z/ifs/0p25/oper/{d}{h}0000-{p}h-oper-fc.index")
    if modelo == "gfs":
        return existe(f"https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/gfs.{d}/{h}/atmos/gfs.t{h}z.pgrb2.0p25.f{p:03d}.idx")
    base = f"https://opendata.dwd.de/weather/nwp/icon/grib/{h}"
    return (existe(f"{base}/t_2m/icon_global_icosahedral_single-level_{dh}_{p:03d}_T_2M.grib2.bz2") and
            existe(f"{base}/clat/icon_global_icosahedral_time-invariant_{dh}_CLAT.grib2.bz2"))


def publicada():
    try:
        url = f"https://raw.githubusercontent.com/{REPO}/mapas/info.json"
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
            return json.load(r).get("rodada_comum")
    except Exception as e:
        log("info.json publicado não lido:", e)
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--publicada")
    a = ap.parse_args()
    pub = a.publicada or publicada()
    pub_dt = dt.datetime.strptime(pub, "%Y-%m-%dT%HZ") if pub else None

    agora = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None, minute=0, second=0, microsecond=0)
    base = agora.replace(hour=12 if agora.hour >= 12 else 0)
    nova = None
    for i in range(3):                               # só rodadas mais novas que a publicada interessam
        c = base - dt.timedelta(hours=12 * i)
        if pub_dt and c <= pub_dt:
            break
        ok = {m: disponivel(m, c) for m in ("ecmwf", "gfs", "icon")}
        log(f"rodada {c:%d/%m %HZ}:", ", ".join(f"{m} {'ok' if v else 'ainda não'}" for m, v in ok.items()))
        if all(ok.values()):
            nova = c
            break
    log("publicada:", pub or "nenhuma", "| nova completa:", nova.strftime("%Y-%m-%dT%HZ") if nova else "não")
    print("rodar=" + ("true" if nova else "false"))
    if nova:
        print("rodada=" + nova.strftime("%Y-%m-%dT%HZ"))


if __name__ == "__main__":
    main()
