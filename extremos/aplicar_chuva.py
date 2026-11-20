"""
Troca a chuva do previsao.json (valor do Open-Meteo no ponto da sede) pela chuva do ECMWF no
MAIOR PIXEL do município, calculada em extremos.json. Todo o resto do previsao.json fica igual.

- O valor antigo (sede) fica guardado em "mm_sede", para comparação.
- Se extremos.json não existir ou não tiver o ECMWF, o previsao.json não é alterado.
- Datas casadas pelo dia (AAAA-MM-DD); dia sem valor de pixel mantém o valor da sede.
"""
import json, os, sys

PASTA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARQ_PREV = os.path.join(PASTA, "previsao.json")
ARQ_EXT = os.path.join(PASTA, "extremos.json")
NOTA = "chuva: maior valor do ECMWF no município"


def main():
    if not os.path.exists(ARQ_EXT):
        print("extremos.json não existe: chuva do previsao.json mantida"); return
    with open(ARQ_PREV, encoding="utf-8") as f:
        prev = json.load(f)
    with open(ARQ_EXT, encoding="utf-8") as f:
        ext = json.load(f)
    try:
        import datetime as dt
        idade = (dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(ext["gerado_em"])).total_seconds() / 3600
    except Exception:
        idade = 99
    if idade > 12:
        print(f"extremos.json tem {idade:.0f} h: chuva do previsao.json mantida"); return
    ec = (ext.get("modelos") or {}).get("ecmwf")
    if not ec:
        print("extremos.json sem ECMWF: chuva do previsao.json mantida"); return
    pos = {d: i for i, d in enumerate(ext["datas"])}
    trocados, mantidos = 0, 0
    for nome, m in prev["municipios"].items():
        em = ec["municipios"].get(nome)
        sede = m.get("mm_sede", m.get("mm"))          # se rodar duas vezes, parte sempre da sede
        novo = []
        for k, d in enumerate(prev["datas"]):
            i = pos.get(d)
            v = em["mm"][i] if em and i is not None and i < len(em["mm"]) else None
            if v is None:
                v = sede[k] if sede and k < len(sede) else None; mantidos += 1
            else:
                trocados += 1
            novo.append(v)
        m["mm_sede"] = sede
        m["mm"] = novo
    modelo = prev.get("modelo") or ""
    if NOTA not in modelo:
        prev["modelo"] = (modelo + "; " + NOTA) if modelo else NOTA
    prev["chuva_rodada_ecmwf"] = ec.get("rodada")
    tmp = ARQ_PREV + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(prev, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, ARQ_PREV)
    print(f"chuva trocada pelo maior pixel do ECMWF: {trocados} valores; mantidos da sede: {mantidos}")


if __name__ == "__main__":
    main()
