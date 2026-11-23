/* Painel El Niño / La Niña e oceanos — INEMA
   Dados: enos.json (robô diário: NOAA/CPC índices semanais Niño, ONI, situação oficial; NOAA/PSL TNA e TSA). */
(function () {
  "use strict";
  var RAIZ = document.getElementById("inema-enos");
  if (!RAIZ || RAIZ.getAttribute("data-ok")) return;
  RAIZ.setAttribute("data-ok", "1");
  var BASE = "https://cdn.jsdelivr.net/gh/aldirioalmeida-cpu/previsao-municipios-ba@main/";
  var CPC = "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_update/";
  var TEND = RAIZ.getAttribute("data-tendencia") || "";

  var CSS = [
    "#inema-enos{--az:#0b4f8a;--az2:#e8f0f8;--tx:#1d2733;--tx2:#5b6773;--ln:#d7dee6;--cz:#f5f7f9;--en:#d6452f;--en2:#f39a6b;--ln2:#5b9bd5;--la:#1f4e9c;--neu:#9aa5b1;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:var(--tx);font-size:15px;line-height:1.45;max-width:1280px;margin:0 auto 28px}",
    "#inema-enos *{box-sizing:border-box}",
    "#inema-enos .ie-topo{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;justify-content:space-between;margin:0 0 14px}",
    "#inema-enos h2.ie-tit{margin:0;font-size:1.55em;color:var(--az);line-height:1.15}",
    "#inema-enos .ie-sub{margin:4px 0 0;color:var(--tx2);font-size:.92em}",
    "#inema-enos .ie-bol{display:flex;align-items:center;gap:12px;background:var(--az2);border:1px solid #c9d9ea;border-radius:12px;padding:10px 14px;max-width:480px}",
    "#inema-enos .ie-bol b{display:block;color:var(--az)}",
    "#inema-enos .ie-bol span{font-size:.86em;color:var(--tx2)}",
    "#inema-enos .ie-bol a{margin-left:auto;white-space:nowrap;background:var(--az);color:#fff;text-decoration:none;border-radius:8px;padding:8px 12px;font-weight:600;font-size:.9em}",
    "#inema-enos .ie-hero{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:16px;background:linear-gradient(135deg,#fff 0%,var(--hf,#fff4ef) 100%);border:1px solid var(--ln);border-radius:16px;padding:16px;margin:0 0 14px}",
    "#inema-enos .ie-gauge svg{width:100%;height:auto;display:block}",
    "#inema-enos .ie-est small{display:block;text-transform:uppercase;letter-spacing:.04em;font-size:.78em;color:var(--tx2)}",
    "#inema-enos .ie-est h3{margin:2px 0 6px;font-size:1.7em;line-height:1.1;color:var(--hc,#d6452f)}",
    "#inema-enos .ie-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}",
    "#inema-enos .ie-chip{border:1px solid var(--ln);background:#fff;border-radius:999px;padding:4px 10px;font-size:.85em}",
    "#inema-enos .ie-chip b{font-variant-numeric:tabular-nums}",
    "#inema-enos .ie-noaa{background:#fff;border:1px solid var(--ln);border-radius:10px;padding:8px 12px;font-size:.88em;margin-top:8px}",
    "#inema-enos .ie-noaa q{font-style:italic;color:var(--tx)}",
    "#inema-enos .ie-noaa small{display:block;color:var(--tx2);margin-bottom:2px}",
    "#inema-enos .ie-regs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 14px}",
    "#inema-enos .ie-reg{background:#fff;border:1px solid var(--ln);border-radius:12px;padding:10px 12px;cursor:pointer}",
    "#inema-enos .ie-reg.on{border-color:var(--az);box-shadow:0 0 0 1px var(--az) inset}",
    "#inema-enos .ie-reg small{display:block;color:var(--tx2);font-size:.8em}",
    "#inema-enos .ie-reg strong{font-size:1.5em;font-variant-numeric:tabular-nums}",
    "#inema-enos .ie-reg em{font-style:normal;font-size:.82em;color:var(--tx2);margin-left:6px}",
    "#inema-enos .ie-reg svg{width:100%;height:34px;display:block;margin-top:4px}",
    "#inema-enos .ie-cx{background:#fff;border:1px solid var(--ln);border-radius:12px;padding:12px;margin:0 0 14px}",
    "#inema-enos .ie-cx h3{margin:0;font-size:1.05em;color:var(--az)}",
    "#inema-enos .ie-cxt{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:space-between;margin:0 0 8px}",
    "#inema-enos .ie-grp{display:flex;flex-wrap:wrap;gap:4px}",
    "#inema-enos button.ie-b{font:inherit;font-size:.85em;border:1px solid var(--ln);background:#fff;color:var(--tx);border-radius:999px;padding:4px 10px;cursor:pointer}",
    "#inema-enos button.ie-b.on{background:var(--az);border-color:var(--az);color:#fff}",
    "#inema-enos .ie-graf svg{width:100%;height:auto;display:block}",
    "#inema-enos .ie-nota{font-size:.84em;color:var(--tx2);margin:6px 0 0}",
    "#inema-enos .ie-2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}",
    "#inema-enos table.ie-tab{width:100%;border-collapse:collapse;font-size:.88em}",
    "#inema-enos table.ie-tab th,#inema-enos table.ie-tab td{border:0;border-bottom:1px solid var(--ln);padding:4px 6px;text-align:left}",
    "#inema-enos table.ie-tab td.n{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}",
    "#inema-enos table.ie-tab tr.atual td{background:#fff4ef;font-weight:700}",
    "#inema-enos .ie-imp{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}",
    "#inema-enos .ie-imp div{border-radius:12px;padding:10px 12px;font-size:.9em}",
    "#inema-enos .ie-imp h4{margin:0 0 4px;font-size:1em}",
    "#inema-enos .ie-imp ul{margin:0;padding-left:18px}",
    "#inema-enos .ie-gal{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}",
    "#inema-enos .ie-gal figure{margin:0;border:1px solid var(--ln);border-radius:12px;overflow:hidden;background:#fff}",
    "#inema-enos .ie-gal img{width:100%;height:auto;display:block;background:#f0f2f5;min-height:120px}",
    "#inema-enos .ie-gal figcaption{font-size:.84em;padding:6px 10px;color:var(--tx2)}",
    "#inema-enos details.ie-ajuda{background:var(--cz);border:1px solid var(--ln);border-radius:12px;padding:8px 14px;font-size:.92em;margin:0 0 14px}",
    "#inema-enos details.ie-ajuda summary{cursor:pointer;font-weight:600;color:var(--az)}",
    "#inema-enos .ie-fonte{font-size:.8em;color:var(--tx2)}",
    "#inema-enos .ie-aviso{background:#fff4e0;border:1px solid #f0c27a;border-radius:10px;padding:8px 12px;margin:0 0 12px;font-size:.9em}",
    "#inema-enos .ie-carr{padding:40px;text-align:center;color:var(--tx2)}",
    "@media (max-width:900px){#inema-enos .ie-hero{grid-template-columns:1fr}#inema-enos .ie-gauge{max-width:320px;margin:0 auto}#inema-enos .ie-regs{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-enos .ie-2,#inema-enos .ie-imp{grid-template-columns:1fr}#inema-enos .ie-gal{grid-template-columns:1fr 1fr}}",
    "@media (max-width:560px){#inema-enos{font-size:14px}#inema-enos .ie-gal{grid-template-columns:1fr}#inema-enos .ie-bol{max-width:none;width:100%}#inema-enos .ie-est h3{font-size:1.4em}}"
  ].join("\n");
  var st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);
  RAIZ.innerHTML = "<div class='ie-carr'>Carregando o monitoramento do El Niño e La Niña…</div>";

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function f1(v) { return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function f2(v) { return v == null || isNaN(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function t1(v) { return v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  var MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  function dBR(iso) { var p = iso.split("-"); return +p[2] + " " + MES[+p[1] - 1] + " " + p[0]; }
  var TRI = { DJF: "dez–fev", JFM: "jan–mar", FMA: "fev–abr", MAM: "mar–mai", AMJ: "abr–jun", MJJ: "mai–jul", JJA: "jun–ago", JAS: "jul–set", ASO: "ago–out", SON: "set–nov", OND: "out–dez", NDJ: "nov–jan" };
  function tri(s, a) { return (TRI[s] || s) + " " + a; }
  function corV(v) { return v >= 1.5 ? "#b2182b" : v >= 0.5 ? "#ef8a62" : v <= -1.5 ? "#2166ac" : v <= -0.5 ? "#67a9cf" : "#b8c0c8"; }
  function classe(v) {
    var a = Math.abs(v), fase = v >= 0.5 ? "El Niño" : v <= -0.5 ? "La Niña" : null;
    if (!fase) return { fase: "Neutro", int: "", txt: "Neutralidade" };
    var int = a >= 2 ? "muito forte" : a >= 1.5 ? "forte" : a >= 1 ? "moderado" : "fraco";
    if (fase === "La Niña") int = int.replace(/o$/, "a").replace("fort", "fort");
    return { fase: fase, int: int, txt: fase + " " + int };
  }
  var STATUS = {
    "el niño advisory": ["Alerta de El Niño", "El Niño está em curso e deve continuar"],
    "la niña advisory": ["Alerta de La Niña", "La Niña está em curso e deve continuar"],
    "el niño watch": ["Vigilância de El Niño", "condições favoráveis à formação de El Niño nos próximos meses"],
    "la niña watch": ["Vigilância de La Niña", "condições favoráveis à formação de La Niña nos próximos meses"],
    "final el niño advisory": ["Aviso final de El Niño", "o El Niño terminou"],
    "final la niña advisory": ["Aviso final de La Niña", "a La Niña terminou"],
    "not active": ["Sistema de alerta inativo", "neutralidade esperada"]
  };
  function status(s) {
    if (!s) return null;
    var k = s.toLowerCase().replace(/\s+/g, " ").trim(), r = [];
    Object.keys(STATUS).forEach(function (x) { if (k.indexOf(x) >= 0 && !(x.indexOf("final") < 0 && k.indexOf("final " + x) >= 0)) r.push(STATUS[x]); });
    return r.length ? r : [[s, ""]];
  }

  fetch(BASE + "enos.json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(monta).catch(function (e) { RAIZ.innerHTML = "<div class='ie-aviso'>Não foi possível carregar os dados agora (" + esc(e.message || e) + "). Tente novamente em alguns minutos.</div>"; });

  var J, W, ONI, REG = 3, PER = 104, ONIP = "30";
  var NOMES = ["", "Niño 1+2", "Niño 3", "Niño 3.4", "Niño 4"];
  var AREAS = ["", "costa do Peru e Equador", "Pacífico leste", "Pacífico centro-leste (índice principal)", "Pacífico central"];

  function monta(j) {
    J = j; W = j.semanal || []; ONI = j.oni || [];
    var u = W[W.length - 1], n34 = u[3], oni = ONI.length ? ONI[ONI.length - 1] : null;
    var cl = classe(oni ? oni[2] : n34), sit = j.situacao || {}, stt = status(sit.status);
    var quente = (oni ? oni[2] : n34) >= 0.5, frio = (oni ? oni[2] : n34) <= -0.5;
    var hc = quente ? "#c0392b" : frio ? "#1f4e9c" : "#4b5763", hf = quente ? "#fff1ea" : frio ? "#eaf2fb" : "#f3f5f7";
    var bol = acharBoletim();
    var h = "<div class='ie-topo'><div><h2 class='ie-tit'>El Niño e La Niña</h2><p class='ie-sub'>Monitoramento do Pacífico e do Atlântico Tropical · semana de " + dBR(u[0]) +
      " · atualizado em " + new Date(j.gerado_em).toLocaleDateString("pt-BR") + "</p></div>" +
      (bol ? "<div class='ie-bol'><div><b>Boletim de Monitoramento das TSMs</b><span>" + esc(bol.txt) + "</span></div><a href='" + esc(bol.href) + "' target='_blank' rel='noopener'>Abrir PDF</a></div>" : "") + "</div>";
    var semanas = (Date.now() - new Date(u[0] + "T12:00:00").getTime()) / 864e5;
    if (semanas > 16) h += "<div class='ie-aviso'>Atenção: o índice semanal mais recente é de " + dBR(u[0]) + ".</div>";

    // destaque: medidor + situação
    var w4 = W[W.length - 5], dif = w4 ? n34 - w4[3] : null;
    h += "<div class='ie-hero' style='--hc:" + hc + ";--hf:" + hf + "'><div class='ie-gauge'>" + gauge(n34) + "</div><div class='ie-est'>" +
      "<small>Situação atual do ENOS</small><h3>" + esc(cl.txt) + "</h3>" +
      "<div class='ie-chips'><span class='ie-chip'>Niño 3.4 na semana: <b>" + f1(n34) + " °C</b></span>" +
      (dif != null ? "<span class='ie-chip'>Em 4 semanas: <b>" + (dif >= 0.05 ? "▲ " : dif <= -0.05 ? "▼ " : "■ ") + f1(dif) + " °C</b></span>" : "") +
      (oni ? "<span class='ie-chip'>ONI (" + tri(oni[0], oni[1]) + "): <b>" + f2(oni[2]) + " °C</b></span>" : "") +
      (stt ? stt.map(function (s) { return "<span class='ie-chip' title='" + esc(s[1]) + "'>NOAA: <b>" + esc(s[0]) + "</b></span>"; }).join("") : "") + "</div>" +
      "<p style='margin:6px 0 0'>" + frase(cl, oni, n34, dif) + "</p>" +
      (sit.resumo ? "<div class='ie-noaa'><small>Resumo oficial do NOAA/CPC" + (sit.data ? ", " + esc(sit.data) : "") + " (em inglês)</small><q lang='en'>" + esc(sit.resumo) + "</q> <a href='" + esc(sit.url) + "' target='_blank' rel='noopener'>discussão completa</a></div>" : "") +
      "</div></div>";

    // quatro regiões
    h += "<div class='ie-regs' id='ie-regs'>" + [1, 2, 3, 4].map(function (r) {
      var v = u[r], t = u[r + 4], a4 = w4 ? v - w4[r] : null;
      return "<div class='ie-reg" + (r === REG ? " on" : "") + "' data-r='" + r + "' title='" + esc(AREAS[r]) + "'><small>" + NOMES[r] + " · " + AREAS[r].replace(" (índice principal)", "") + "</small>" +
        "<strong style='color:" + corV(v) + "'>" + f1(v) + " °C</strong><em>TSM " + t1(t) + " °C" + (a4 != null ? " · " + (a4 >= 0 ? "▲" : "▼") + f1(a4) : "") + "</em>" + spark(r) + "</div>";
    }).join("") + "</div>";

    // série semanal
    h += "<div class='ie-cx'><div class='ie-cxt'><h3 id='ie-tsem'></h3><div class='ie-grp' id='ie-per'>" +
      [[26, "6 meses"], [52, "1 ano"], [104, "2 anos"], [260, "5 anos"], [W.length, "desde 1990"]].map(function (p) { return "<button class='ie-b' data-p='" + p[0] + "'>" + p[1] + "</button>"; }).join("") +
      "</div></div><div class='ie-graf' id='ie-gsem'></div><p class='ie-nota'>Anomalia semanal da temperatura da superfície do mar (OISST, base 1991–2020). Limiares de ±0,5 °C (El Niño / La Niña) e ±1,5 °C (evento forte). Clique nos cartões acima para trocar a região.</p></div>";

    // ONI + episódios
    h += "<div class='ie-2'><div class='ie-cx'><div class='ie-cxt'><h3>Índice Oceânico Niño (ONI)</h3><div class='ie-grp' id='ie-onip'><button class='ie-b' data-o='30'>30 anos</button><button class='ie-b' data-o='tudo'>desde 1950</button></div></div>" +
      "<div class='ie-graf' id='ie-goni'></div><p class='ie-nota'>Média móvel de 3 meses da anomalia no Niño 3.4 (ERSST). É o índice usado pela NOAA para classificar os episódios: 5 trimestres seguidos acima de +0,5 °C (El Niño) ou abaixo de −0,5 °C (La Niña).</p></div>" +
      "<div class='ie-cx'><h3 style='margin-bottom:8px'>Episódios mais intensos desde 1950</h3>" + episodios() + "</div></div>";

    // Atlântico
    h += "<div class='ie-cx'><div class='ie-cxt'><h3>Atlântico Tropical: TNA, TSA e gradiente</h3></div><div class='ie-graf' id='ie-gatl'></div>" +
      "<p class='ie-nota'>Para a Bahia o Atlântico importa tanto quanto o Pacífico. <b>Gradiente positivo</b> (Atlântico Norte mais quente que o Sul) tende a manter a Zona de Convergência Intertropical mais ao norte e <b>reduzir</b> as chuvas do semiárido no outono; <b>gradiente negativo</b> favorece chuvas. Anomalias mensais (NOAA/PSL, HadISST).</p></div>";

    // impactos
    h += "<div class='ie-cx'><h3 style='margin-bottom:8px'>O que costuma acontecer na Bahia</h3><div class='ie-imp'>" +
      "<div style='background:#fff1ea;border:1px solid #f4c7b2'><h4 style='color:#b2182b'>Em anos de El Niño</h4><ul>" +
      "<li>Tendência de <b>chuvas abaixo da média no norte e nordeste do estado</b> (semiárido, Vale do São Francisco), sobretudo no período chuvoso de fevereiro a maio.</li>" +
      "<li>Temperaturas <b>acima da média</b> e maior risco de ondas de calor, estiagem prolongada e focos de calor.</li>" +
      "<li>No sul, extremo sul e oeste o sinal é mais fraco e variável; o Atlântico e eventos locais podem predominar.</li></ul></div>" +
      "<div style='background:#eaf2fb;border:1px solid #b9d0ea'><h4 style='color:#1f4e9c'>Em anos de La Niña</h4><ul>" +
      "<li>Tendência de <b>chuvas normais a acima da média no semiárido</b>, especialmente quando o gradiente do Atlântico é negativo.</li>" +
      "<li>Temperaturas mais amenas que em anos de El Niño.</li>" +
      "<li>Os impactos dependem da intensidade do evento e da época do ano; nenhum dos dois determina sozinho a chuva de uma estação.</li></ul></div></div>" +
      "<p class='ie-nota'>Relações climatológicas gerais, não previsão. Para o prognóstico dos próximos meses, consulte a " + (TEND ? "<a href='" + esc(TEND) + "'>Tendência Climática</a> do INEMA" : "Tendência Climática do INEMA") + ".</p></div>";

    // figuras
    h += "<div class='ie-cx'><h3 style='margin-bottom:8px'>Mapas do NOAA/CPC (atualização semanal)</h3><div class='ie-gal'>" +
      fig(CPC + "sstanim.gif", "Anomalia da TSM nas últimas semanas (animação)") +
      fig(CPC + "ssta_c.gif", "Anomalia semanal da TSM no Pacífico") +
      fig(CPC + "heat-last-year.gif", "Anomalia do conteúdo de calor no Pacífico equatorial (subsuperfície), último ano") +
      "</div></div>";

    h += "<details class='ie-ajuda'><summary>Como ler este painel</summary><ul>" +
      "<li><b>El Niño</b> é o aquecimento anormal das águas do Pacífico equatorial central e leste; <b>La Niña</b>, o resfriamento. Juntos com a oscilação da pressão atmosférica (Oscilação Sul) formam o <b>ENOS</b>.</li>" +
      "<li>O <b>índice semanal</b> mostra a evolução mais recente; o <b>ONI</b>, por ser média de 3 meses, é o que define oficialmente os episódios e sua intensidade: fraco (0,5–0,9), moderado (1,0–1,4), forte (1,5–1,9) e muito forte (≥ 2,0).</li>" +
      "<li>O medidor usa a anomalia semanal do Niño 3.4. A classificação no título usa o ONI mais recente.</li>" +
      "<li>A situação do NOAA segue o sistema de alerta americano (Watch = vigilância; Advisory = evento em curso).</li></ul></details>";
    h += "<p class='ie-fonte'>Fontes: NOAA Climate Prediction Center (índices semanais OISST v2.1, ONI/ERSST v5, discussão diagnóstica mensal) e NOAA Physical Sciences Laboratory (TNA e TSA). Dados atualizados automaticamente todos os dias." +
      (j.erros && Object.keys(j.erros).length ? " Itens indisponíveis nesta atualização: " + esc(Object.keys(j.erros).join(", ")) + "." : "") + "</p>";
    RAIZ.innerHTML = h;

    RAIZ.querySelector("#ie-regs").addEventListener("click", function (e) { var c = e.target.closest("[data-r]"); if (!c) return; REG = +c.getAttribute("data-r"); RAIZ.querySelectorAll(".ie-reg").forEach(function (x) { x.classList.toggle("on", x === c); }); semanal(); });
    RAIZ.querySelector("#ie-per").addEventListener("click", function (e) { var b = e.target.closest("[data-p]"); if (!b) return; PER = +b.getAttribute("data-p"); semanal(); });
    RAIZ.querySelector("#ie-onip").addEventListener("click", function (e) { var b = e.target.closest("[data-o]"); if (!b) return; ONIP = b.getAttribute("data-o"); grafOni(); });
    semanal(); grafOni(); atlantico();
  }

  function frase(cl, oni, n34, dif) {
    var tend = dif == null ? "" : dif >= 0.2 ? " e segue aquecendo" : dif <= -0.2 ? " e vem esfriando" : " e está estável nas últimas semanas";
    if (cl.fase === "Neutro") return "O Pacífico equatorial está em <b>neutralidade</b>: a anomalia do Niño 3.4 está entre −0,5 e +0,5 °C" + tend + ".";
    return "O Pacífico equatorial está sob <b>" + cl.txt + "</b>: a anomalia da temperatura no Niño 3.4 é de " + f1(n34) + " °C na semana" + tend + "." +
      (oni ? " O ONI do trimestre " + tri(oni[0], oni[1]) + " foi de " + f2(oni[2]) + " °C." : "");
  }

  function acharBoletim() {
    var as = Array.prototype.slice.call(document.querySelectorAll("a[href*='.pdf']"));
    for (var i = 0; i < as.length; i++) {
      var a = as[i], href = decodeURIComponent(a.getAttribute("href") || "");
      if (RAIZ.contains(a)) continue;
      if (!/TSM|monitoramento/i.test(href + " " + a.textContent)) continue;
      var m = href.match(/(\d{2})[\-\/](\d{2})[\-\/](\d{4})/);
      return { href: a.href, txt: m ? "Edição de " + m[1] + "/" + m[2] + "/" + m[3] + " · INEMA" : "Última edição · INEMA" };
    }
    return null;
  }

  // medidor semicircular −3 a +3 °C
  function gauge(v) {
    var cx = 150, cy = 140, R = 115, r0 = 80, min = -3, max = 3;
    function ang(x) { return Math.PI * (1 - (Math.max(min, Math.min(max, x)) - min) / (max - min)); }
    function pt(a, rr) { return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)]; }
    function arco(a0, a1, c) {
      var p0 = pt(ang(a0), R), p1 = pt(ang(a1), R), p2 = pt(ang(a1), r0), p3 = pt(ang(a0), r0);
      return "<path d='M" + p0 + "A" + R + " " + R + " 0 0 1 " + p1 + "L" + p2 + "A" + r0 + " " + r0 + " 0 0 0 " + p3 + "Z' fill='" + c + "'/>";
    }
    var o = "<svg viewBox='0 0 300 190' role='img' aria-label='Medidor da anomalia do Niño 3.4: " + f1(v) + " °C'>";
    o += arco(-3, -1.5, "#2166ac") + arco(-1.5, -0.5, "#67a9cf") + arco(-0.5, 0.5, "#d5dbe1") + arco(0.5, 1.5, "#ef8a62") + arco(1.5, 3, "#b2182b");
    [-3, -1.5, -0.5, 0.5, 1.5, 3].forEach(function (x) { var p = pt(ang(x), R + 10); o += "<text x='" + p[0] + "' y='" + (p[1] + 3) + "' font-size='10' text-anchor='middle' fill='#5b6773'>" + (x > 0 ? "+" : "") + t1(x).replace(",0", "") + "</text>"; });
    var pl = pt(ang(-2.2), (R + r0) / 2), pr = pt(ang(2.2), (R + r0) / 2);
    o += "<text x='" + pl[0] + "' y='" + (pl[1] + 4) + "' font-size='10' fill='#fff' text-anchor='middle' font-weight='700'>LA NIÑA</text><text x='" + pr[0] + "' y='" + (pr[1] + 4) + "' font-size='10' fill='#fff' text-anchor='middle' font-weight='700'>EL NIÑO</text>";
    var a = ang(v), pn = pt(a, R - 4), b1 = pt(a + Math.PI / 2, 7), b2 = pt(a - Math.PI / 2, 7);
    o += "<path d='M" + b1 + "L" + pn + "L" + b2 + "Z' fill='#1d2733'/><circle cx='" + cx + "' cy='" + cy + "' r='9' fill='#1d2733'/>";
    o += "<text x='" + cx + "' y='" + (cy + 34) + "' font-size='24' font-weight='700' text-anchor='middle' fill='" + corV(v) + "'>" + f1(v) + " °C</text>";
    o += "<text x='" + cx + "' y='" + (cy + 48) + "' font-size='10.5' text-anchor='middle' fill='#5b6773'>anomalia semanal no Niño 3.4" + (Math.abs(v) > 3 ? " (fora da escala)" : "") + "</text>";
    return o + "</svg>";
  }

  function spark(r) {
    var s = W.slice(-26).map(function (w) { return w[r]; }), mn = Math.min.apply(null, s.concat([-0.5])), mx = Math.max.apply(null, s.concat([0.5]));
    function y(v) { return 32 - (v - mn) / (mx - mn) * 30; }
    var pts = s.map(function (v, i) { return (i / (s.length - 1) * 200).toFixed(1) + "," + y(v).toFixed(1); }).join(" ");
    return "<svg viewBox='0 0 200 34' preserveAspectRatio='none'><line x1='0' x2='200' y1='" + y(0) + "' y2='" + y(0) + "' stroke='#ccd3da' stroke-dasharray='3 3'/><polyline fill='none' stroke='" + corV(s[s.length - 1]) + "' stroke-width='2' points='" + pts + "'/></svg>";
  }

  // série semanal com área colorida
  function semanal() {
    RAIZ.querySelectorAll("#ie-per [data-p]").forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-p") === PER); });
    var s = W.slice(-PER).filter(function (w) { return w[0] >= "1990"; }), Wd = 900, H = 260, pe = 40, pd = 12, pt = 12, pb = 26, n = s.length;
    RAIZ.querySelector("#ie-tsem").textContent = "Anomalia semanal — " + NOMES[REG];
    var vals = s.map(function (w) { return w[REG]; }), mn = Math.min(-2, Math.floor(Math.min.apply(null, vals))), mx = Math.max(2, Math.ceil(Math.max.apply(null, vals)));
    function x(i) { return pe + (Wd - pe - pd) * (n === 1 ? 0.5 : i / (n - 1)); }
    function y(v) { return pt + (H - pt - pb) * (1 - (v - mn) / (mx - mn)); }
    var o = "<svg viewBox='0 0 " + Wd + " " + H + "' role='img' aria-label='Série semanal'><defs><clipPath id='ie-cq'><rect x='0' y='0' width='" + Wd + "' height='" + y(0) + "'/></clipPath><clipPath id='ie-cf'><rect x='0' y='" + y(0) + "' width='" + Wd + "' height='" + H + "'/></clipPath></defs>";
    for (var g = mn; g <= mx; g++) o += "<line x1='" + pe + "' x2='" + (Wd - pd) + "' y1='" + y(g) + "' y2='" + y(g) + "' stroke='" + (g === 0 ? "#8a96a3" : "#eef1f4") + "'/><text x='" + (pe - 6) + "' y='" + (y(g) + 4) + "' font-size='11' text-anchor='end' fill='#5b6773'>" + (g > 0 ? "+" : "") + g + "</text>";
    [[0.5, "#ef8a62"], [-0.5, "#67a9cf"], [1.5, "#b2182b"], [-1.5, "#2166ac"]].forEach(function (l) { o += "<line x1='" + pe + "' x2='" + (Wd - pd) + "' y1='" + y(l[0]) + "' y2='" + y(l[0]) + "' stroke='" + l[1] + "' stroke-dasharray='5 4' opacity='.8'/>"; });
    var area = "M" + x(0) + "," + y(0) + vals.map(function (v, i) { return "L" + x(i).toFixed(1) + "," + y(v).toFixed(1); }).join("") + "L" + x(n - 1) + "," + y(0) + "Z";
    o += "<path d='" + area + "' fill='#ef8a62' opacity='.55' clip-path='url(#ie-cq)'/><path d='" + area + "' fill='#67a9cf' opacity='.6' clip-path='url(#ie-cf)'/>";
    o += "<polyline fill='none' stroke='#1d2733' stroke-width='1.4' points='" + vals.map(function (v, i) { return x(i).toFixed(1) + "," + y(v).toFixed(1); }).join(" ") + "'/>";
    var ultAno = null, passo = n > 400 ? 5 : 1;
    s.forEach(function (w, i) {
      var a = +w[0].slice(0, 4), m = +w[0].slice(5, 7);
      if (n <= 60) { if (i === 0 || w[0].slice(5, 7) !== s[i - 1][0].slice(5, 7)) o += "<text x='" + x(i) + "' y='" + (H - 8) + "' font-size='10.5' text-anchor='middle' fill='#5b6773'>" + MES[m - 1] + (m === 1 || i === 0 ? "/" + String(a).slice(2) : "") + "</text>"; }
      else if (a !== ultAno) { ultAno = a; if (a % passo === 0 && i > 0) o += "<line x1='" + x(i) + "' x2='" + x(i) + "' y1='" + pt + "' y2='" + (H - pb) + "' stroke='#eef1f4'/><text x='" + x(i) + "' y='" + (H - 8) + "' font-size='10.5' text-anchor='middle' fill='#5b6773'>" + a + "</text>"; }
    });
    var bw = (Wd - pe - pd) / Math.max(1, n - 1);
    s.forEach(function (w, i) { o += "<rect x='" + (x(i) - bw / 2) + "' y='" + pt + "' width='" + bw + "' height='" + (H - pt - pb) + "' fill='transparent'><title>Semana de " + dBR(w[0]) + ": " + f1(w[REG]) + " °C (TSM " + t1(w[REG + 4]) + " °C)</title></rect>"; });
    var u = vals[n - 1]; o += "<circle cx='" + x(n - 1) + "' cy='" + y(u) + "' r='4' fill='" + corV(u) + "' stroke='#fff' stroke-width='1.5'/>";
    RAIZ.querySelector("#ie-gsem").innerHTML = o + "</svg>";
  }

  function grafOni() {
    RAIZ.querySelectorAll("#ie-onip [data-o]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-o") === ONIP); });
    var s = ONIP === "tudo" ? ONI : ONI.slice(-360), Wd = 600, H = 240, pe = 32, pd = 8, pt = 10, pb = 24, n = s.length;
    var vals = s.map(function (o) { return o[2]; }), mn = Math.min(-2, Math.floor(Math.min.apply(null, vals))), mx = Math.max(2, Math.ceil(Math.max.apply(null, vals)));
    var bw = (Wd - pe - pd) / n;
    function y(v) { return pt + (H - pt - pb) * (1 - (v - mn) / (mx - mn)); }
    var o = "<svg viewBox='0 0 " + Wd + " " + H + "' role='img' aria-label='Série do ONI'>";
    for (var g = mn; g <= mx; g++) o += "<line x1='" + pe + "' x2='" + (Wd - pd) + "' y1='" + y(g) + "' y2='" + y(g) + "' stroke='" + (g === 0 ? "#8a96a3" : "#eef1f4") + "'/><text x='" + (pe - 5) + "' y='" + (y(g) + 4) + "' font-size='10.5' text-anchor='end' fill='#5b6773'>" + (g > 0 ? "+" : "") + g + "</text>";
    s.forEach(function (q, i) {
      var v = q[2], x0 = pe + i * bw;
      o += "<rect x='" + x0.toFixed(2) + "' y='" + Math.min(y(0), y(v)).toFixed(1) + "' width='" + Math.max(0.6, bw - (bw > 2 ? 0.3 : 0)).toFixed(2) + "' height='" + Math.abs(y(v) - y(0)).toFixed(1) + "' fill='" + corV(v) + "'><title>" + tri(q[0], q[1]) + ": " + f2(v) + " °C</title></rect>";
      if (q[0] === "DJF" && q[1] % (n > 400 ? 10 : 5) === 0) o += "<text x='" + x0 + "' y='" + (H - 8) + "' font-size='10.5' text-anchor='middle' fill='#5b6773'>" + q[1] + "</text>";
    });
    RAIZ.querySelector("#ie-goni").innerHTML = o + "</svg>";
  }

  function episodios() {
    var eps = [], cur = null;
    ONI.forEach(function (q, i) {
      var sg = q[2] >= 0.5 ? 1 : q[2] <= -0.5 ? -1 : 0;
      if (cur && cur.sg === sg) { cur.n++; if (Math.abs(q[2]) > Math.abs(cur.pico)) { cur.pico = q[2]; cur.qp = q; } cur.fim = q; cur.ult = i; }
      else { if (cur && cur.sg) eps.push(cur); cur = { sg: sg, n: 1, pico: q[2], qp: q, ini: q, fim: q, ult: i }; }
    });
    if (cur && cur.sg) eps.push(cur);
    eps = eps.filter(function (e) { return e.n >= 5 || e.ult === ONI.length - 1; });
    function lin(e) {
      var atual = e.ult === ONI.length - 1;
      return "<tr" + (atual ? " class='atual'" : "") + "><td>" + e.ini[1] + (e.fim[1] !== e.ini[1] ? "–" + String(e.fim[1]).slice(2) : "") + (atual ? " (em curso)" : "") + "</td><td>" + tri(e.qp[0], e.qp[1]) + "</td><td class='n' style='color:" + corV(e.pico) + "'>" + f1(e.pico) + "</td></tr>";
    }
    var en = eps.filter(function (e) { return e.sg > 0; }).sort(function (a, b) { return b.pico - a.pico; }), la = eps.filter(function (e) { return e.sg < 0; }).sort(function (a, b) { return a.pico - b.pico; });
    var atual = eps.length && eps[eps.length - 1].ult === ONI.length - 1 ? eps[eps.length - 1] : null;
    var top = function (l) { var t = l.slice(0, 6); if (atual && l.indexOf(atual) >= 6) t.push(atual); return t; };
    var pos = atual ? (atual.sg > 0 ? en : la).indexOf(atual) + 1 : 0;
    var h = atual ? "<p style='margin:0 0 8px;font-size:.9em'>O episódio atual de <b>" + (atual.sg > 0 ? "El Niño" : "La Niña") + "</b> já alcançou ONI de <b>" + f2(atual.pico) + " °C</b> — " +
      (pos === 1 ? "<b>o mais intenso</b>" : "o " + pos + "º mais intenso") + " desde 1950 até agora.</p>" : "";
    h += "<table class='ie-tab'><thead><tr><th>El Niño</th><th>Pico</th><th style='text-align:right'>ONI</th></tr></thead><tbody>" + top(en).map(lin).join("") + "</tbody></table>";
    h += "<table class='ie-tab' style='margin-top:10px'><thead><tr><th>La Niña</th><th>Pico</th><th style='text-align:right'>ONI</th></tr></thead><tbody>" + top(la).map(lin).join("") + "</tbody></table>";
    return h;
  }

  function atlantico() {
    var el = RAIZ.querySelector("#ie-gatl"), a = (J.atlantico || []).slice(-48);
    if (!a.length) { el.innerHTML = "<p class='ie-nota'>Dados do Atlântico indisponíveis nesta atualização.</p>"; return; }
    var Wd = 900, H = 230, pe = 40, pd = 70, pt = 12, pb = 26, n = a.length, all = [];
    a.forEach(function (r) { [r[1], r[2], r[3]].forEach(function (v) { if (v != null) all.push(v); }); });
    var mn = Math.min(-1, Math.floor(Math.min.apply(null, all) * 2) / 2), mx = Math.max(1, Math.ceil(Math.max.apply(null, all) * 2) / 2), bw = (Wd - pe - pd) / n;
    function x(i) { return pe + bw * (i + 0.5); }
    function y(v) { return pt + (H - pt - pb) * (1 - (v - mn) / (mx - mn)); }
    var o = "<svg viewBox='0 0 " + Wd + " " + H + "' role='img' aria-label='Atlântico tropical'>";
    for (var g = mn; g <= mx + 1e-9; g += 0.5) o += "<line x1='" + pe + "' x2='" + (Wd - pd) + "' y1='" + y(g) + "' y2='" + y(g) + "' stroke='" + (Math.abs(g) < 1e-9 ? "#8a96a3" : "#eef1f4") + "'/><text x='" + (pe - 5) + "' y='" + (y(g) + 4) + "' font-size='10.5' text-anchor='end' fill='#5b6773'>" + (g > 0 ? "+" : "") + t1(g) + "</text>";
    a.forEach(function (r, i) {
      var v = r[3];
      if (v != null) o += "<rect x='" + (x(i) - bw * 0.35) + "' y='" + Math.min(y(0), y(v)) + "' width='" + bw * 0.7 + "' height='" + Math.abs(y(v) - y(0)) + "' fill='" + (v > 0 ? "#f4a582" : "#92c5de") + "'><title>" + r[0] + " — gradiente TNA−TSA: " + f2(v) + " °C</title></rect>";
      var m = +r[0].slice(5, 7);
      if (m === 1 || i === 0) o += "<text x='" + x(i) + "' y='" + (H - 8) + "' font-size='10.5' text-anchor='middle' fill='#5b6773'>" + MES[m - 1] + "/" + r[0].slice(2, 4) + "</text>";
    });
    function linha(k, c) { return "<polyline fill='none' stroke='" + c + "' stroke-width='2' points='" + a.map(function (r, i) { return r[k] == null ? "" : x(i).toFixed(1) + "," + y(r[k]).toFixed(1); }).join(" ") + "'/>"; }
    o += linha(1, "#c0392b") + linha(2, "#1f4e9c");
    var u = a[n - 1];
    o += "<text x='" + (Wd - pd + 6) + "' y='" + (y(u[1]) + 4) + "' font-size='11' fill='#c0392b'>TNA " + f2(u[1]) + "</text>";
    if (u[2] != null) o += "<text x='" + (Wd - pd + 6) + "' y='" + (y(u[2]) + (Math.abs(y(u[2]) - y(u[1])) < 12 ? 16 : 4)) + "' font-size='11' fill='#1f4e9c'>TSA " + f2(u[2]) + "</text>";
    o += "<g font-size='11' fill='#1d2733'><line x1='" + pe + "' x2='" + (pe + 18) + "' y1='6' y2='6' stroke='#c0392b' stroke-width='2'/><text x='" + (pe + 22) + "' y='10'>TNA (Atlântico Norte)</text>" +
      "<line x1='" + (pe + 160) + "' x2='" + (pe + 178) + "' y1='6' y2='6' stroke='#1f4e9c' stroke-width='2'/><text x='" + (pe + 182) + "' y='10'>TSA (Atlântico Sul)</text>" +
      "<rect x='" + (pe + 310) + "' y='1' width='10' height='9' fill='#f4a582'/><rect x='" + (pe + 320) + "' y='1' width='10' height='9' fill='#92c5de'/><text x='" + (pe + 334) + "' y='10'>Gradiente TNA − TSA</text></g>";
    el.innerHTML = o + "</svg>";
  }

  function fig(src, leg) {
    return "<figure><a href='" + esc(src) + "' target='_blank' rel='noopener'><img loading='lazy' src='" + esc(src) + "' alt='" + esc(leg) + "' referrerpolicy='no-referrer'></a><figcaption>" + esc(leg) + "</figcaption></figure>";
  }
})();
