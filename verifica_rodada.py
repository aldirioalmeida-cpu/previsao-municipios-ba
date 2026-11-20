"""
Decide se o robô da previsão deve atualizar: só quando o Open-Meteo já tem uma rodada 00Z ou 12Z do ECMWF
mais nova que a previsão publicada (as rodadas 06Z e 18Z são ignoradas).

Fonte: https://api.open-meteo.com/data/ecmwf_ifs025/static/meta.json
  last_run_initialisation_time (hora da rodada) e last_run_availability_time (quando entrou no Open-Meteo)

Regras:
  - rodada mais recente do Open-Meteo é 00Z ou 12Z e ficou disponível depois da previsão publicada -> atualiza
  - segurança: previsão publicada com 13 h ou mais (perdeu uma rodada) -> atualiza
  - sem acesso aos metadados: atualiza se a previsão tiver 6 h ou mais (comportamento antigo)
Saída (para o $GITHUB_OUTPUT): rodar=true|false
Só biblioteca padrão; termina em segundos.
"""
import datetime as dt, json, os, sys, urllib.request

PASTA = os.path.dirname(os.path.abspath(__file__))
META = "https://api.open-meteo.com/data/ecmwf_ifs025/static/meta.json"
UTC = dt.timezone.utc


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def main():
    try:
        with open(os.path.join(PASTA, "previsao.json"), encoding="utf-8") as f:
            gerado = dt.datetime.fromisoformat(json.load(f)["gerado_em"]).astimezone(UTC)
    except Exception as e:
        log("previsao.json não lido:", e); print("rodar=true"); return
    agora = dt.datetime.now(UTC)
    idade = (agora - gerado).total_seconds() / 3600
    log(f"previsão publicada: {gerado:%d/%m %H:%M} UTC ({idade:.1f} h)")

    try:
        req = urllib.request.Request(META, headers={"User-Agent": "previsao-municipios-ba/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            m = json.load(r)
        ini = dt.datetime.fromtimestamp(m["last_run_initialisation_time"], UTC)
        disp = dt.datetime.fromtimestamp(m["last_run_availability_time"], UTC)
    except Exception as e:
        log("metadados do Open-Meteo indisponíveis:", e)
        print("rodar=" + ("true" if idade >= 6 else "false")); return

    log(f"última rodada ECMWF no Open-Meteo: {ini:%d/%m %H}Z, disponível desde {disp:%d/%m %H:%M} UTC")
    if ini.hour in (0, 12) and disp > gerado:
        log("-> rodada 00Z/12Z nova: atualizar"); print("rodar=true")
    elif idade >= 13:
        log("-> previsão com 13 h ou mais: atualizar por segurança"); print("rodar=true")
    else:
        log("-> nada novo (rodadas 06Z/18Z são ignoradas)"); print("rodar=false")


if __name__ == "__main__":
    main()
