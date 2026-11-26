"""
Alerta por e-mail de focos de calor em Unidades de Conservação ESTADUAIS da Bahia.

Roda logo depois do gerar_focos.py, lendo a pasta de saída (pontos_todos.json, uc.json, meta.json):
  - considera os focos de TODOS os satélites das últimas 72 h que caíram dentro de UC estadual;
  - "novos" = ainda não avisados (a lista dos já avisados fica em uc_alerta_estado.json, publicado
    no ramo "focos" e baixado de volta no início de cada rodada);
  - envia UM e-mail por rodada, com os focos novos agrupados por UC, pela conta Outlook / Microsoft 365
    do setor (SMTP smtp.office365.com:587 com STARTTLS).

Configuração no GitHub (Settings > Secrets and variables > Actions):
  segredo  ALERTA_SMTP_USUARIO    e-mail do setor (remetente e login)
  segredo  ALERTA_SMTP_SENHA      senha da conta (ou senha de aplicativo)
  variável ALERTA_DESTINATARIOS   e-mails separados por vírgula (aba "Variables"; também aceito como segredo)
  opcionais: ALERTA_SMTP_SERVIDOR (padrão smtp.office365.com), ALERTA_SMTP_PORTA (padrão 587)

Sem os segredos, só registra no log e não marca nada como avisado.
Primeira rodada com os segredos (sem estado anterior): envia um e-mail de ativação com os focos das
últimas 24 h, que serve de teste do envio.
Se o envio falhar, nada é marcado como avisado e a próxima rodada tenta de novo.
Só biblioteca padrão.
"""
import argparse, datetime as dt, html, json, os, smtplib, ssl, sys
from email.message import EmailMessage
from email.utils import formataddr

UTC = dt.timezone.utc
BAHIA = dt.timezone(dt.timedelta(hours=-3))
JANELA_H = 72          # focos considerados (últimas horas)
GUARDA_H = 96          # por quanto tempo um foco fica na lista de já avisados
PAINEL = "https://www.ba.gov.br/inema/iniciativas/focos-de-calor"
CLASSES = [(10, "baixa"), (50, "moderada"), (150, "alta"), (float("inf"), "muito alta")]


def log(*a):
    print(*a, flush=True)


def classe(frp):
    if frp is None:
        return "sem FRP"
    for lim, nome in CLASSES:
        if frp < lim:
            return nome


def carrega(pasta, nome):
    with open(os.path.join(pasta, nome), encoding="utf-8") as f:
        return json.load(f)


def focos_em_uc_estadual(pasta, agora):
    meta, uc, pts = carrega(pasta, "meta.json"), carrega(pasta, "uc.json"), carrega(pasta, "pontos_todos.json")
    d0 = dt.date.fromisoformat(meta["todos_desde"])
    sats, muns, ucs = meta["satelites"], meta["municipios"], uc["ucs"]
    estaduais = {i for i, p in enumerate(ucs) if p[1] == "Estadual"}
    out = []
    for p in pts:
        lat, lon, dia, hora, si, mun, _bio, frp, u = p[:9]
        if u not in estaduais:
            continue
        quando = dt.datetime.combine(d0 + dt.timedelta(days=dia), dt.time(hora // 100, hora % 100), UTC)
        if (agora - quando).total_seconds() > JANELA_H * 3600:
            continue
        out.append({"chave": f"{lat:.4f},{lon:.4f},{quando:%Y%m%d%H%M},{sats[si]}",
                    "quando": quando, "lat": lat, "lon": lon, "sat": sats[si], "frp": frp,
                    "mun": muns[mun][0], "uc": ucs[u][0], "grupo": ucs[u][2]})
    return sorted(out, key=lambda f: f["quando"])


def monta_email(novos, ativacao):
    por_uc = {}
    for f in novos:
        por_uc.setdefault(f["uc"], []).append(f)
    ordem = sorted(por_uc, key=lambda k: -len(por_uc[k]))
    agora_l = dt.datetime.now(BAHIA)
    assunto = ("[INEMA] Alerta de focos em UC estadual ativado — " if ativacao else "[INEMA] Focos de calor em UC estadual — ") + \
        f"{len(novos)} foco{'s' if len(novos) > 1 else ''} em {len(ordem)} UC{'s' if len(ordem) > 1 else ''} ({agora_l:%d/%m %H:%M})"
    hl = lambda t: html.escape(str(t))
    intro = ("Este é o primeiro envio do alerta automático: abaixo, os focos das últimas 24 h dentro de unidades de "
             "conservação estaduais. A partir de agora chegam só os focos novos, a cada rodada do robô (~3 h).") if ativacao else \
            "Novos focos de calor detectados dentro de unidades de conservação estaduais desde o último aviso."
    txt = [intro, ""]
    h = [f"<div style='font-family:Segoe UI,Arial,sans-serif;font-size:14px;color:#1d2733'><p>{hl(intro)}</p>"]
    for nome in ordem:
        fs = por_uc[nome]
        frps = [f["frp"] for f in fs if f["frp"] is not None]
        muns = sorted({f["mun"] for f in fs})
        ini, fim = fs[0]["quando"].astimezone(BAHIA), fs[-1]["quando"].astimezone(BAHIA)
        resumo = f"{len(fs)} foco{'s' if len(fs) > 1 else ''} · {ini:%d/%m %H:%M}" + (f" a {fim:%d/%m %H:%M}" if fim != ini else "") + \
                 (f" · maior FRP {max(frps):.1f} MW ({classe(max(frps))})" if frps else "")
        txt += [f"{nome} ({fs[0]['grupo']}) — {', '.join(muns)}", "  " + resumo]
        h.append(f"<h3 style='margin:18px 0 4px;font-size:15px;color:#b3261e'>{hl(nome)}</h3>"
                 f"<div style='color:#5b6773;margin-bottom:6px'>{hl(fs[0]['grupo'])} · {hl(', '.join(muns))}<br>{hl(resumo)}</div>"
                 "<table cellpadding='4' style='border-collapse:collapse;font-size:13px'>"
                 "<tr style='background:#f5f7fa'><th align='left'>Data/hora (Bahia)</th><th align='left'>Satélite</th>"
                 "<th align='left'>Intensidade</th><th align='left'>Município</th><th align='left'>Local</th></tr>")
        for f in fs[-15:]:
            q = f["quando"].astimezone(BAHIA)
            inten = classe(f["frp"]) + (f" · {f['frp']:.1f} MW" if f["frp"] is not None else "")
            mapa = f"https://www.google.com/maps?q={f['lat']:.5f},{f['lon']:.5f}"
            txt.append(f"  {q:%d/%m %H:%M} · {f['sat']} · {inten} · {f['mun']} · {mapa}")
            h.append(f"<tr style='border-top:1px solid #e1e6ec'><td>{q:%d/%m %H:%M}</td><td>{hl(f['sat'])}</td><td>{hl(inten)}</td>"
                     f"<td>{hl(f['mun'])}</td><td><a href='{mapa}'>ver no mapa</a></td></tr>")
        if len(fs) > 15:
            h.append(f"<tr><td colspan='5' style='color:#5b6773'>… e mais {len(fs) - 15} detecções (mostradas as 15 mais recentes)</td></tr>")
        h.append("</table>")
        txt.append("")
    rodape = ("Fonte: INPE – Programa Queimadas (todos os satélites; o GOES-19 detecta o mesmo fogo várias vezes ao dia). "
              "Horários no fuso da Bahia. Painel completo: " + PAINEL)
    txt.append(rodape)
    h.append(f"<p style='margin-top:18px;color:#5b6773;font-size:12px'>{hl(rodape.replace(PAINEL, ''))}"
             f"<a href='{PAINEL}'>painel de focos de calor</a>.</p></div>")
    return assunto, "\n".join(txt), "".join(h)


def envia(assunto, texto, corpo_html):
    usuario = os.environ.get("ALERTA_SMTP_USUARIO", "").strip()
    senha = os.environ.get("ALERTA_SMTP_SENHA", "")
    dest = [e.strip() for e in os.environ.get("ALERTA_DESTINATARIOS", "").replace(";", ",").split(",") if e.strip()]
    if not (usuario and senha and dest):
        log("Segredos do alerta não configurados (ALERTA_SMTP_USUARIO, ALERTA_SMTP_SENHA, ALERTA_DESTINATARIOS): e-mail não enviado.")
        return False
    servidor = os.environ.get("ALERTA_SMTP_SERVIDOR", "").strip() or "smtp.office365.com"
    porta = int(os.environ.get("ALERTA_SMTP_PORTA", "").strip() or 587)
    msg = EmailMessage()
    msg["Subject"], msg["From"], msg["To"] = assunto, formataddr(("INEMA – Meteorologia", usuario)), ", ".join(dest)
    msg.set_content(texto)
    msg.add_alternative(corpo_html, subtype="html")
    try:
        with smtplib.SMTP(servidor, porta, timeout=60) as s:
            s.starttls(context=ssl.create_default_context())
            s.login(usuario, senha)
            s.send_message(msg)
        log(f"E-mail enviado para {len(dest)} destinatário(s).")
        return True
    except smtplib.SMTPAuthenticationError as e:
        log("FALHA de autenticação no servidor de e-mail. Se a mensagem citar 'SmtpClientAuthentication is disabled' ou "
            "'basic authentication', a TI precisa liberar o envio SMTP autenticado para esta caixa. Detalhe:", e.smtp_code, e.smtp_error[:300])
    except Exception as e:  # noqa
        log("FALHA no envio do e-mail:", type(e).__name__, str(e)[:300])
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--saida", default="saida_focos")
    ap.add_argument("--anterior", default="alerta_estado_anterior.json")
    a = ap.parse_args()
    agora = dt.datetime.now(UTC)
    estado_ant = None
    if os.path.exists(a.anterior):
        try:
            with open(a.anterior, encoding="utf-8") as f:
                estado_ant = json.load(f)
        except Exception:
            estado_ant = None
    vistos = dict((estado_ant or {}).get("vistos", {}))

    focos = focos_em_uc_estadual(a.saida, agora)
    # Lista publicada no ramo "focos" para o disparador do Google (Apps Script), que envia o alerta pelo Gmail.
    with open(os.path.join(a.saida, "uc_alerta_focos.json"), "w", encoding="utf-8") as f:
        json.dump({"gerado_em": agora.isoformat(timespec="minutes"), "janela_h": JANELA_H, "painel": PAINEL,
                   "focos": [{"chave": x["chave"], "quando": x["quando"].isoformat(timespec="minutes"), "lat": x["lat"], "lon": x["lon"],
                              "sat": x["sat"], "frp": x["frp"], "mun": x["mun"], "uc": x["uc"], "grupo": x["grupo"]} for x in focos]},
                  f, ensure_ascii=False, separators=(",", ":"))
    if not os.environ.get("ALERTA_SMTP_USUARIO"):
        log(f"uc_alerta_focos.json: {len(focos)} focos em UC estadual nas últimas {JANELA_H} h (o e-mail é enviado pelo disparador do Google).")
        return
    ativacao = estado_ant is None
    if ativacao:
        novos = [f for f in focos if (agora - f["quando"]).total_seconds() <= 24 * 3600]
    else:
        novos = [f for f in focos if f["chave"] not in vistos]
    log(f"Focos em UC estadual nas últimas {JANELA_H} h: {len(focos)} | novos para avisar: {len(novos)}" + (" (ativação)" if ativacao else ""))

    enviado = False
    if novos:
        enviado = envia(*monta_email(novos, ativacao))
    elif ativacao:
        enviado = envia("[INEMA] Alerta de focos em UC estadual ativado",
                        "O alerta automático está ativo. Não há focos em unidades de conservação estaduais nas últimas 24 h.\n"
                        "Daqui em diante você recebe um e-mail sempre que surgirem focos novos.\nPainel: " + PAINEL,
                        "<p>O alerta automático está ativo. Não há focos em unidades de conservação estaduais nas últimas 24 h.</p>"
                        f"<p>Daqui em diante você recebe um e-mail sempre que surgirem focos novos. <a href='{PAINEL}'>Painel de focos</a>.</p>")

    if enviado or (estado_ant is not None and not novos):
        for f in focos:
            vistos.setdefault(f["chave"], agora.isoformat(timespec="minutes"))
    limite = agora - dt.timedelta(hours=GUARDA_H)
    vistos = {k: v for k, v in vistos.items() if dt.datetime.fromisoformat(v) >= limite}
    if enviado or estado_ant is not None:
        with open(os.path.join(a.saida, "uc_alerta_estado.json"), "w", encoding="utf-8") as f:
            json.dump({"atualizado_em": agora.isoformat(timespec="minutes"), "vistos": vistos}, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
