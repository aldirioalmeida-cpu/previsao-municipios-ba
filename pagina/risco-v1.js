/* Risco de incêndio em vegetação — INEMA (página de Focos de Calor)
   Dados: risco/risco.json (robô no GitHub: índices FWI e FMA+ calculados com NASA POWER + previsão Open-Meteo corrigida,
   risco calibrado com os focos do INPE desde 2003), extremos/municipios_ba.geojson (malha IBGE). Tudo via jsDelivr. */
(function () {
  "use strict";
  var RAIZ = document.getElementById("inema-risco");
  if (!RAIZ || RAIZ.getAttribute("data-ok")) return;
  RAIZ.setAttribute("data-ok", "1");
  var BASE = "https://cdn.jsdelivr.net/gh/aldirioalmeida-cpu/previsao-municipios-ba@main/";
  var L_CHUVA = RAIZ.getAttribute("data-chuva") || "", L_VEG = RAIZ.getAttribute("data-veg") || "", L_PREV = RAIZ.getAttribute("data-previsao") || "";

  var CSS = [
    "#inema-risco{--ac:#b4231a;--tx:#1d2733;--tx2:#55616d;--ln:#d7dee6;--bg:#fff;--cz:#f6f7f9;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:var(--tx);font-size:15px;line-height:1.45;max-width:1280px;margin:0 auto 28px}",
    "#inema-risco *{box-sizing:border-box}",
    "#inema-risco :focus-visible{outline:3px solid #1a73e8;outline-offset:2px}",
    "#inema-risco .ir-topo{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:flex-end;justify-content:space-between;margin:0 0 12px}",
    "#inema-risco h2.ir-tit{margin:0;font-size:1.55em;color:var(--ac);line-height:1.15}",
    "#inema-risco .ir-sub{margin:4px 0 0;color:var(--tx2);font-size:.92em}",
    "#inema-risco .ir-selo{display:inline-flex;align-items:center;gap:6px;background:#fdf0ee;border:1px solid #f3c7c2;color:#7a1a12;border-radius:999px;padding:4px 12px;font-size:.82em;font-weight:600}",
    "#inema-risco .ir-dias{display:flex;gap:6px;overflow-x:auto;padding:2px 2px 8px;margin:0 0 10px;scrollbar-width:thin}",
    "#inema-risco .ir-dia{flex:0 0 auto;min-width:96px;font:inherit;text-align:left;border:1px solid var(--ln);background:#fff;border-radius:12px;padding:7px 10px 8px;cursor:pointer;color:var(--tx)}",
    "#inema-risco .ir-dia:hover{border-color:var(--ac)}",
    "#inema-risco .ir-dia[aria-pressed=true]{border-color:var(--ac);box-shadow:0 0 0 2px var(--ac) inset;background:#fff8f7}",
    "#inema-risco .ir-dia b{display:block;font-size:.9em}",
    "#inema-risco .ir-dia small{display:block;color:var(--tx2);font-size:.74em}",
    "#inema-risco .ir-dia .barra{display:flex;height:6px;border-radius:3px;overflow:hidden;margin-top:6px;background:#eee}",
    "#inema-risco .ir-dia .barra i{display:block;height:100%}",
    "#inema-risco .ir-dia.passado{background:var(--cz)}",
    "#inema-risco .ir-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:0 0 12px}",
    "#inema-risco .ir-kpi{background:var(--bg);border:1px solid var(--ln);border-radius:12px;padding:10px 12px;position:relative;overflow:hidden}",
    "#inema-risco .ir-kpi:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--k,#b4231a)}",
    "#inema-risco .ir-kpi small{display:block;color:var(--tx2);font-size:.76em;text-transform:uppercase;letter-spacing:.03em}",
    "#inema-risco .ir-kpi strong{display:block;font-size:1.5em;line-height:1.15;margin:2px 0}",
    "#inema-risco .ir-kpi em{font-style:normal;font-size:.82em;color:var(--tx2)}",
    "#inema-risco .ir-ctl{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;background:var(--cz);border:1px solid var(--ln);border-radius:12px;padding:10px 12px;margin:0 0 12px}",
    "#inema-risco .ir-grp{display:flex;flex-wrap:wrap;gap:4px;align-items:center}",
    "#inema-risco .ir-grp>span{font-size:.78em;color:var(--tx2);margin-right:4px;text-transform:uppercase;letter-spacing:.03em}",
    "#inema-risco button.ir-b{font:inherit;font-size:.86em;border:1px solid var(--ln);background:#fff;color:var(--tx);border-radius:999px;padding:5px 11px;cursor:pointer;line-height:1.2}",
    "#inema-risco button.ir-b:hover{border-color:var(--ac)}",
    "#inema-risco button.ir-b[aria-pressed=true]{background:var(--ac);border-color:var(--ac);color:#fff}",
    "#inema-risco select.ir-sel,#inema-risco input.ir-busca{font:inherit;font-size:.88em;border:1px solid var(--ln);border-radius:999px;padding:5px 10px;background:#fff;color:var(--tx)}",
    "#inema-risco input.ir-busca{min-width:210px}",
    "#inema-risco .ir-corpo{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:14px}",
    "#inema-risco .ir-cx{background:var(--bg);border:1px solid var(--ln);border-radius:12px;padding:12px}",
    "#inema-risco .ir-cx h3{margin:0 0 8px;font-size:1.02em;color:var(--ac)}",
    "#inema-risco .ir-cxh{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;margin:0 0 8px}",
    "#inema-risco .ir-cxh h3{margin:0}",
    "#inema-risco .ir-mapa{position:relative}",
    "#inema-risco .ir-mapa svg{width:100%;height:auto;display:block;max-height:640px}",
    "#inema-risco .ir-mapa path.m{stroke:#fff;stroke-width:.35;cursor:pointer}",
    "#inema-risco .ir-mapa path.m:hover{stroke:#111;stroke-width:1.2}",
    "#inema-risco .ir-mapa path.m.sel{stroke:#000;stroke-width:1.7}",
    "#inema-risco .ir-mapa path.m.grp{stroke:#000;stroke-width:.9}",
    "#inema-risco .ir-tip{position:absolute;pointer-events:none;background:rgba(20,28,38,.94);color:#fff;border-radius:8px;padding:6px 9px;font-size:.84em;line-height:1.35;white-space:nowrap;display:none;z-index:3}",
    "#inema-risco .ir-leg{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:.8em;color:var(--tx);margin-top:6px}",
    "#inema-risco .ir-leg i{display:inline-block;width:15px;height:12px;border-radius:2px;margin-right:4px;vertical-align:-1px;border:1px solid rgba(0,0,0,.18)}",
    "#inema-risco .ir-lado{display:flex;flex-direction:column;gap:14px}",
    "#inema-risco .ir-reg{display:grid;grid-template-columns:auto 1fr auto;gap:5px 8px;align-items:center;font-size:.86em}",
    "#inema-risco .ir-reg button{font:inherit;background:none;border:0;padding:0;text-align:left;cursor:pointer;color:var(--tx);white-space:nowrap}",
    "#inema-risco .ir-reg button:hover,#inema-risco .ir-reg button[aria-current=true]{color:var(--ac);font-weight:700}",
    "#inema-risco .ir-reg .st{display:flex;height:14px;border-radius:4px;overflow:hidden;background:#eee}",
    "#inema-risco .ir-reg .st i{display:block;height:100%}",
    "#inema-risco .ir-reg .v{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--tx2)}",
    "#inema-risco ol.ir-rank{margin:0;padding:0;list-style:none;font-size:.86em}",
    "#inema-risco ol.ir-rank li{border-bottom:1px dotted var(--ln)}",
    "#inema-risco ol.ir-rank button{font:inherit;width:100%;display:flex;align-items:center;gap:8px;background:none;border:0;padding:4px 0;cursor:pointer;color:var(--tx);text-align:left}",
    "#inema-risco ol.ir-rank button:hover{color:var(--ac)}",
    "#inema-risco ol.ir-rank .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "#inema-risco .ir-sem{display:flex;gap:2px}",
    "#inema-risco .ir-sem i{display:block;width:10px;height:14px;border-radius:2px;border:1px solid rgba(0,0,0,.12)}",
    "#inema-risco .ir-badge{display:inline-block;border-radius:999px;padding:1px 8px;font-size:.8em;font-weight:700;white-space:nowrap;border:1px solid rgba(0,0,0,.12)}",
    "#inema-risco table.ir-semana{width:100%;border-collapse:separate;border-spacing:3px;font-size:.82em}",
    "#inema-risco table.ir-semana th{font-weight:600;color:var(--tx2);text-align:center;padding:2px}",
    "#inema-risco table.ir-semana th.n{text-align:left;color:var(--tx)}",
    "#inema-risco table.ir-semana td{text-align:center;border-radius:6px;padding:6px 2px;font-weight:700;cursor:pointer}",
    "#inema-risco table.ir-semana td.on{outline:2px solid #000}",
    "#inema-risco .ir-det{margin-top:14px}",
    "#inema-risco .ir-dett{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;margin:0 0 10px}",
    "#inema-risco .ir-dett h3{margin:0;font-size:1.25em;color:var(--tx)}",
    "#inema-risco .ir-dett span{color:var(--tx2);font-size:.9em}",
    "#inema-risco .ir-dett .acoes{margin-left:auto;display:flex;flex-wrap:wrap;gap:12px;font-size:.88em}",
    "#inema-risco .ir-dett a,#inema-risco .ir-lnk{color:#a1271c;cursor:pointer;text-decoration:underline;background:none;border:0;font:inherit;padding:0}",
    "#inema-risco .ir-prev{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;margin:0 0 12px}",
    "#inema-risco .ir-pd{border:1px solid var(--ln);border-radius:10px;overflow:hidden;font-size:.84em;background:#fff}",
    "#inema-risco .ir-pd .c{padding:6px 8px;font-weight:700}",
    "#inema-risco .ir-pd .c small{display:block;font-weight:600;opacity:.9;font-size:.85em}",
    "#inema-risco .ir-pd dl{margin:0;padding:6px 8px;display:grid;grid-template-columns:1fr auto;gap:2px 4px}",
    "#inema-risco .ir-pd dt{color:var(--tx2)}",
    "#inema-risco .ir-pd dd{margin:0;text-align:right;font-variant-numeric:tabular-nums;font-weight:600}",
    "#inema-risco .ir-graf{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:14px}",
    "#inema-risco .ir-graf svg{width:100%;height:auto;display:block}",
    "#inema-risco .ir-graf h4{margin:0 0 4px;font-size:.92em}",
    "#inema-risco .ir-glg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:.76em;color:var(--tx2);margin-top:2px}",
    "#inema-risco table.ir-comp{width:100%;border-collapse:collapse;font-size:.86em}",
    "#inema-risco table.ir-comp td,#inema-risco table.ir-comp th{padding:4px 6px;border-bottom:1px solid var(--ln);text-align:left}",
    "#inema-risco table.ir-comp td.v{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}",
    "#inema-risco details.ir-dt{margin-top:14px;background:var(--cz);border:1px solid var(--ln);border-radius:12px;padding:8px 14px;font-size:.92em}",
    "#inema-risco details.ir-dt>summary{cursor:pointer;font-weight:600;color:#a1271c}",
    "#inema-risco details.ir-dt li{margin:3px 0}",
    "#inema-risco .ir-tab{max-height:460px;overflow:auto;margin-top:8px;background:#fff;border:1px solid var(--ln);border-radius:8px}",
    "#inema-risco .ir-tab table{width:100%;border-collapse:collapse;font-size:.85em}",
    "#inema-risco .ir-tab th{position:sticky;top:0;background:#fff;border-bottom:2px solid var(--ln);text-align:left;padding:0}",
    "#inema-risco .ir-tab th button{font:inherit;font-weight:700;background:none;border:0;padding:6px 8px;cursor:pointer;color:var(--tx);width:100%;text-align:left}",
    "#inema-risco .ir-tab td{padding:4px 8px;border-bottom:1px solid #eef1f4}",
    "#inema-risco .ir-tab td.v{text-align:right;font-variant-numeric:tabular-nums}",
    "#inema-risco table.ir-val{border-collapse:collapse;font-size:.86em;margin:6px 0;min-width:60%}",
    "#inema-risco table.ir-val th,#inema-risco table.ir-val td{padding:4px 8px;border-bottom:1px solid var(--ln);text-align:right}",
    "#inema-risco table.ir-val th:first-child,#inema-risco table.ir-val td:first-child{text-align:left}",
    "#inema-risco table.ir-val td.melhor{font-weight:700;color:#1b5e20}",
    "#inema-risco .ir-links{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}",
    "#inema-risco .ir-links a{display:block;border:1px solid var(--ln);border-radius:12px;padding:10px 12px;text-decoration:none;color:var(--tx);background:#fff}",
    "#inema-risco .ir-links a:hover{border-color:var(--ac)}",
    "#inema-risco .ir-links b{display:block;color:#a1271c;font-size:.95em}",
    "#inema-risco .ir-links span{font-size:.82em;color:var(--tx2)}",
    "#inema-risco .ir-fonte{font-size:.8em;color:var(--tx2);margin-top:10px}",
    "#inema-risco .ir-aviso{background:#fff4e0;border:1px solid #f0c27a;border-radius:10px;padding:8px 12px;margin:0 0 12px;font-size:.9em}",
    "#inema-risco .ir-carr{padding:40px;text-align:center;color:var(--tx2)}",
    "#inema-risco .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
    "@media (max-width:1000px){#inema-risco .ir-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}#inema-risco .ir-corpo,#inema-risco .ir-graf{grid-template-columns:1fr}#inema-risco .ir-prev{grid-template-columns:repeat(4,minmax(0,1fr))}}",
    "@media (max-width:640px){#inema-risco{font-size:14px}#inema-risco .ir-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-risco .ir-kpi strong{font-size:1.25em}#inema-risco input.ir-busca{min-width:0;width:100%}#inema-risco .ir-grp{width:100%}#inema-risco .ir-prev{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-risco .ir-links{grid-template-columns:1fr}#inema-risco .ir-dett .acoes{margin-left:0}}"
  ].join("\n");
  var st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);
  RAIZ.innerHTML = "<div class='ir-carr' role='status'>Carregando o risco de incêndio…</div>";

  // ---------- utilidades ----------
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(v) { return v != null && isFinite(v); }
  function n0(v) { return !ok(v) ? "–" : Math.round(v).toLocaleString("pt-BR"); }
  function n1(v) { return !ok(v) ? "–" : (Math.round(v * 10) / 10).toLocaleString("pt-BR", { maximumFractionDigits: 1 }); }
  function n2(v) { return !ok(v) ? "–" : v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function json(u) { return fetch(u, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status + " em " + u.split("/").pop()); return r.json(); }); }
  var DSEM = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"], MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  function dIso(s) { var p = s.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function dCurta(s) { var d = dIso(s); return ("0" + d.getUTCDate()).slice(-2) + "/" + ("0" + (d.getUTCMonth() + 1)).slice(-2); }
  function corTexto(hex) { var r = parseInt(hex.substr(1, 2), 16), g = parseInt(hex.substr(3, 2), 16), b = parseInt(hex.substr(5, 2), 16); return (r * 299 + g * 587 + b * 114) / 1000 < 150 ? "#fff" : "#1d2733"; }
  function bin(thr, v) { var i = 0; while (i < thr.length && v >= thr[i]) i++; return i; }

  // ---------- escalas (sequenciais, seguras para daltonismo) ----------
  var CL = ["#ffffb2", "#fecc5c", "#fd8d3c", "#e31a1c", "#800026"];
  var FWI_E = { thr: [5, 10, 20, 30, 40, 50], c: ["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#8c2d04"] };
  var FCL_N = ["Abaixo da mediana", "Mediana a P75", "P75 a P90", "P90 a P97", "Acima de P97"];
  var SECO_E = { thr: [5, 10, 20, 40, 60, 90, 120], c: ["#edf5fb", "#f7f2d8", "#f6e2a4", "#f4c56b", "#ef9b3d", "#dc6a22", "#b54313", "#6e2209"] };
  var UR_E = { thr: [20, 30, 40, 50, 60, 70], c: ["#7f2704", "#d94801", "#fd8d3c", "#fdd0a2", "#deebf7", "#9ecae1", "#3182bd"] };
  var VT_E = { thr: [5, 10, 15, 20, 25, 30], c: ["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8856a7", "#810f7c"] };
  var FOC_E = { thr: [1, 3, 10, 30, 100], c: ["#f2f2f2", "#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"] };
  var VARS = {
    risco: { nome: "Risco de incêndio (calibrado com os focos)", curto: "Risco calibrado" },
    fwi: { nome: "FWI — Índice Meteorológico de Perigo de Incêndio", curto: "FWI" },
    fcl: { nome: "FWI em relação ao clima do próprio município", curto: "FWI × clima local" },
    seco: { nome: "Dias seguidos sem chuva (< 2 mm)", curto: "Dias sem chuva" },
    ur: { nome: "Umidade relativa mínima (%)", curto: "Umidade" },
    vento: { nome: "Vento médio (km/h)", curto: "Vento" },
    focos: { nome: "Focos detectados nos 7 dias até o dia (todos os satélites)", curto: "Focos (7 dias)" }
  };

  // ---------- estado ----------
  var S = { d: null, v: "risco", grp: "m", sel: "e", ord: "prob", asc: false };
  try { var g0 = JSON.parse(localStorage.getItem("inemaRisco1") || "{}"); if (VARS[g0.v]) S.v = g0.v; if (/^[mtr]$/.test(g0.grp || "")) S.grp = g0.grp; } catch (e) { /* sem armazenamento */ }
  function guarda() { try { localStorage.setItem("inemaRisco1", JSON.stringify({ v: S.v, grp: S.grp })); } catch (e) { /* ignora */ } }
  var qs = new URLSearchParams(location.search), QMUN = qs.get("municipio");

  var R, GEO, ND, IH, ENT = {}, MUNS = [], TERR = [], REGS = [], PATHS = {}, CARREGADO = false;
  function carrega() {
    if (CARREGADO) return; CARREGADO = true;
    Promise.all([json(BASE + "risco/risco.json"), json(BASE + "extremos/municipios_ba.geojson")]).then(function (r) { prepara(r[0], r[1]); monta(); }).catch(function (e) {
      RAIZ.innerHTML = "<div class='ir-aviso' role='alert'>Não foi possível carregar o risco de incêndio agora (" + esc(e.message || e) + "). Tente novamente em alguns minutos.</div>";
    });
  }

  // ---------- abas na página de focos: "Focos detectados" | "Risco de incêndio" ----------
  var OUTRO = document.getElementById(RAIZ.getAttribute("data-abas") || "");
  if (OUTRO) {
    var cssAbas = document.createElement("style");
    cssAbas.textContent = ".ir-abas{display:flex;flex-wrap:wrap;gap:6px;max-width:1280px;margin:0 auto 16px;border-bottom:2px solid #d7dee6;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif}" +
      ".ir-abas button{font:inherit;font-size:1rem;font-weight:600;border:1px solid transparent;border-bottom:0;background:#f3f5f7;color:#1d2733;padding:10px 18px;border-radius:10px 10px 0 0;cursor:pointer;margin-bottom:-2px;display:inline-flex;align-items:center;gap:8px}" +
      ".ir-abas button[aria-selected=true]{background:#fff;border-color:#d7dee6;border-bottom:2px solid #fff;color:#b4231a}" +
      ".ir-abas button:focus-visible{outline:3px solid #1a73e8;outline-offset:2px}" +
      ".ir-abas .novo{font-size:.7rem;font-weight:700;background:#b4231a;color:#fff;border-radius:999px;padding:2px 7px;letter-spacing:.03em}" +
      "@media (max-width:640px){.ir-abas button{flex:1 1 auto;justify-content:center;padding:9px 10px;font-size:.92rem}}" +
      "#inema-risco[hidden],#" + (OUTRO.id || "inema-fc") + "[hidden]{display:none!important}";
    document.head.appendChild(cssAbas);
    var abas = document.createElement("div");
    abas.className = "ir-abas"; abas.setAttribute("role", "tablist"); abas.setAttribute("aria-label", "Conteúdo da página de focos de calor");
    if (!OUTRO.id) OUTRO.id = "inema-fc";
    abas.innerHTML = "<button role='tab' id='aba-focos' aria-controls='" + OUTRO.id + "'>Focos detectados</button>" +
      "<button role='tab' id='aba-risco' aria-controls='inema-risco'>Risco de incêndio · previsão 7 dias <span class='novo'>NOVO</span></button>";
    OUTRO.parentNode.insertBefore(abas, OUTRO);
    OUTRO.setAttribute("role", "tabpanel"); OUTRO.setAttribute("aria-labelledby", "aba-focos");
    RAIZ.setAttribute("role", "tabpanel"); RAIZ.setAttribute("aria-labelledby", "aba-risco");
    var mostra = function (risco, foco) {
      OUTRO.hidden = risco; RAIZ.hidden = !risco;
      abas.querySelector("#aba-focos").setAttribute("aria-selected", !risco); abas.querySelector("#aba-focos").tabIndex = risco ? -1 : 0;
      abas.querySelector("#aba-risco").setAttribute("aria-selected", risco); abas.querySelector("#aba-risco").tabIndex = risco ? 0 : -1;
      if (risco) carrega();
      try { history.replaceState(null, "", location.pathname + location.search + (risco ? "#risco" : "")); } catch (e) { /* ignora */ }
      setTimeout(function () { window.dispatchEvent(new Event("resize")); }, 30);   // mapas da outra aba recalculam o tamanho
      if (foco) abas.querySelector(risco ? "#aba-risco" : "#aba-focos").focus();
    };
    abas.addEventListener("click", function (e) { var b = e.target.closest("[role=tab]"); if (b) mostra(b.id === "aba-risco", false); });
    abas.addEventListener("keydown", function (e) {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].indexOf(e.key) < 0) return;
      e.preventDefault(); var risco = e.key === "ArrowRight" || e.key === "End"; if (e.key === "ArrowLeft" || e.key === "Home") risco = false; mostra(risco, true);
    });
    window.addEventListener("hashchange", function () { if (location.hash === "#risco") mostra(true, false); });
    mostra(location.hash === "#risco" || new URLSearchParams(location.search).get("aba") === "risco", false);
  } else {
    carrega();
  }

  function prepara(r, geo) {
    R = r; GEO = geo; ND = r.datas.length;
    IH = r.datas.indexOf(r.hoje); if (IH < 0) IH = Math.max(0, ND - 7);
    S.d = IH;
    r.mun.forEach(function (nome, i) {
      var k = norm(nome), e = { id: "m:" + k, tipo: "m", nome: nome, k: k, i: i, r: r.r[i], t: r.t[i], mem: [i] };
      ENT[e.id] = e; MUNS.push(e);
    });
    function grupo(id, tipo, nome, lista) { var e = { id: id, tipo: tipo, nome: nome, mem: lista.map(function (m) { return m.i; }) }; ENT[id] = e; return e; }
    r.regioes.forEach(function (n, k) { var l = MUNS.filter(function (m) { return m.r === k; }); if (l.length) REGS.push(grupo("r:" + k, "r", n, l)); });
    r.territorios.forEach(function (n, k) { var l = MUNS.filter(function (m) { return m.t === k; }); if (l.length) TERR.push(grupo("t:" + k, "t", n, l)); });
    grupo("e", "e", "Bahia", MUNS);
    if (QMUN && ENT["m:" + norm(QMUN)]) S.sel = "m:" + norm(QMUN);
  }

  // ---------- valores ----------
  function media(e, campo, d) { var s = 0, n = 0; e.mem.forEach(function (i) { var v = R[campo][i][d]; if (ok(v)) { s += v; n++; } }); return n ? s / n : NaN; }
  function focos7(i, d) { var s = 0; for (var j = Math.max(0, d - 6); j <= d; j++) { if (R.tipo[j] === "p") continue; s += R.focos_todos[i][j] || 0; } return s; }
  function probE(e, d) { return e.tipo === "m" ? R.prob[e.i][d] / 1000 : media(e, "prob", d) / 1000; }
  function classeProb(p) { return ok(p) ? bin(R.limites, p) : -1; }
  function classeE(e, d) { return e.tipo === "m" ? R.classe[e.i][d] : classeProb(probE(e, d)); }
  function val(e, v, d) {
    d = d == null ? S.d : d;
    if (v === "risco") return classeE(e, d);
    if (v === "fwi") return e.tipo === "m" ? R.fwi[e.i][d] : media(e, "fwi", d);
    if (v === "fcl") return e.tipo === "m" ? R.fwi_cl[e.i][d] : Math.round(media(e, "fwi_cl", d));
    if (v === "seco") return e.tipo === "m" ? R.dias_secos[e.i][d] : media(e, "dias_secos", d);
    if (v === "ur") return e.tipo === "m" ? R.ur[e.i][d] : media(e, "ur", d);
    if (v === "vento") return e.tipo === "m" ? R.vento[e.i][d] : media(e, "vento", d);
    if (v === "focos") { var s = 0; e.mem.forEach(function (i) { s += focos7(i, d); }); return s; }
    return NaN;
  }
  function cor(v, x) {
    if (!ok(x) || x < 0) return "#d9dde2";
    if (v === "risco") return CL[x];
    if (v === "fcl") return CL[x];
    var e = v === "fwi" ? FWI_E : v === "seco" ? SECO_E : v === "ur" ? UR_E : v === "vento" ? VT_E : FOC_E;
    return e.c[bin(e.thr, x)];
  }
  function fmtV(v, x) {
    if (!ok(x) || x < 0) return "–";
    if (v === "risco") return R.classes[x];
    if (v === "fcl") return FCL_N[x];
    if (v === "fwi") return n1(x);
    if (v === "ur") return n0(x) + "%";
    if (v === "vento") return n0(x) + " km/h";
    if (v === "seco") return n0(x) + " dias";
    return n0(x);
  }
  function badge(c) { if (c < 0) return "<span class='ir-badge'>–</span>"; return "<span class='ir-badge' style='background:" + CL[c] + ";color:" + corTexto(CL[c]) + "'>" + R.classes[c] + "</span>"; }
  function grupoDe(m) { return S.grp === "t" ? ENT["t:" + m.t] : S.grp === "r" ? ENT["r:" + m.r] : m; }
  function rotDia(d, longo) {
    var dd = dIso(R.datas[d]), rel = d - IH;
    var nome = rel === 0 ? "Hoje" : rel === 1 ? "Amanhã" : rel === -1 ? "Ontem" : DSEM[dd.getUTCDay()].charAt(0).toUpperCase() + DSEM[dd.getUTCDay()].slice(1);
    return longo ? nome + ", " + dCurta(R.datas[d]) : nome;
  }
  function contaClasses(d) { var c = [0, 0, 0, 0, 0]; MUNS.forEach(function (m) { var k = R.classe[m.i][d]; if (k >= 0) c[k]++; }); return c; }

  // ---------- montagem ----------
  function monta() {
    var val0 = R.calibracao && R.calibracao.validacao && R.calibracao.validacao.bahia;
    var h = "<div class='ir-topo'><div><h2 class='ir-tit' id='ir-titulo'>Risco de incêndio em vegetação</h2><p class='ir-sub' id='ir-sub'></p></div>" +
      (val0 && ok(val0.auc_modelo) ? "<span class='ir-selo' title='Área sob a curva ROC em anos não usados na calibração'>Calibrado com os focos do INPE desde 2003 · acerto (AUC) " + n2(val0.auc_modelo) + "</span>" : "") + "</div>";
    h += "<div id='ir-avisos'></div>";
    h += "<div class='ir-dias' id='ir-dias' role='group' aria-label='Escolha o dia'></div>";
    h += "<div class='ir-kpis' id='ir-kpis' aria-live='polite'></div>";
    h += "<div class='ir-ctl' id='ir-ctl'>" +
      "<div class='ir-grp' role='group' aria-label='Variável do mapa'><span>Mapa</span>" + Object.keys(VARS).map(function (k) { return "<button class='ir-b' data-v='" + k + "' aria-pressed='false'>" + VARS[k].curto + "</button>"; }).join("") + "</div>" +
      "<div class='ir-grp' role='group' aria-label='Agrupar'><span>Agrupar</span><button class='ir-b' data-g='m' aria-pressed='false'>Município</button><button class='ir-b' data-g='t' aria-pressed='false'>Território</button><button class='ir-b' data-g='r' aria-pressed='false'>Região</button></div>" +
      "<div class='ir-grp' style='margin-left:auto'><label class='sr' for='ir-busca'>Buscar município, território ou região</label><input class='ir-busca' id='ir-busca' list='ir-dl' placeholder='Buscar município, território…'><datalist id='ir-dl'>" +
      MUNS.concat(TERR, REGS).map(function (e) { return "<option value='" + esc(e.nome) + "'>" + (e.tipo === "t" ? "Território" : e.tipo === "r" ? "Região" : "") + "</option>"; }).join("") + "</datalist></div></div>";
    h += "<div class='ir-corpo'><div class='ir-cx'><div class='ir-cxh'><h3 id='ir-tmapa'></h3><button class='ir-lnk' id='ir-csv' type='button'>Baixar tabela (CSV)</button></div>" +
      "<div class='ir-mapa' id='ir-mapa'>" + svgMapa() + "<div class='ir-tip' id='ir-tip' aria-hidden='true'></div></div><div class='ir-leg' id='ir-leg'></div></div>" +
      "<div class='ir-lado'><div class='ir-cx'><h3>Semana por região</h3><div id='ir-semana'></div></div>" +
      "<div class='ir-cx'><h3 id='ir-trank'>Maior risco</h3><ol class='ir-rank' id='ir-rank'></ol></div></div></div>";
    h += "<div class='ir-cx ir-det' id='ir-det' tabindex='-1'></div>";
    h += "<details class='ir-dt' id='ir-tabela'><summary>Tabela com todos os municípios (alternativa ao mapa)</summary><div class='ir-tab' id='ir-tab'></div></details>";
    h += "<details class='ir-dt'><summary>Precisão do índice — como foi calibrado e quanto acerta</summary>" + validacao() + "</details>";
    h += "<details class='ir-dt'><summary>Como ler este painel</summary><ul>" +
      "<li><b>Risco calibrado</b>: combina os índices meteorológicos de perigo de incêndio, o histórico de focos de cada município naquele mês e os focos dos 7 dias anteriores (nos dias de previsão, a última semana observada). O modelo estima, para cada dia, a chance de o satélite de referência do INPE detectar foco no município; as 5 classes seguem a distribuição dessas chances na Bahia desde 2003: <b>Baixo</b> (metade dos dias com menor chance), <b>Moderado</b> (próximos 25%), <b>Alto</b> (próximos 15%), <b>Muito alto</b> (próximos 7%) e <b>Extremo</b> (os 3% de dias com maior chance).</li>" +
      "<li><b>FWI</b> (Fire Weather Index, sistema canadense usado pelo Copernicus/EFFIS e pelo GWIS): combina a secura do material fino (FFMC), da camada intermediária (DMC) e profunda (DC) com o vento (ISI) e o combustível disponível (BUI). Valores mais altos = condições mais favoráveis à ignição e à propagação do fogo.</li>" +
      "<li><b>FWI × clima local</b>: compara o FWI do dia com a distribuição do próprio município desde 2003 (percentis). Útil para identificar condições incomuns para o lugar.</li>" +
      "<li><b>FMA+</b> (Fórmula de Monte Alegre alterada, índice brasileiro) aparece no detalhe do município.</li>" +
      "<li>Os dias passados usam a reanálise da NASA POWER; os mais recentes e os próximos 7 dias usam a análise e a previsão do Open-Meteo, corrigidas em cada município para o padrão da NASA POWER (para manter a coerência com a calibração). As previsões ficam menos confiáveis a partir do 4º–5º dia.</li>" +
      "<li>O índice indica o <b>perigo meteorológico e histórico</b>. A ocorrência de incêndio depende também de fontes de ignição (uso do fogo, queimadas para manejo), combustível e combate.</li></ul></details>";
    h += "<div class='ir-links'>" +
      (L_CHUVA ? "<a href='" + esc(L_CHUVA) + "'><b>Monitoramento da Chuva</b><span>Dias sem chuva, anomalias e SPI</span></a>" : "") +
      (L_VEG ? "<a href='" + esc(L_VEG) + "'><b>Monitoramento da Vegetação</b><span>Vegetação estressada (VHI) por satélite</span></a>" : "") +
      "<a href='https://terrabrasilis.dpi.inpe.br/queimadas/situacao-atual/' target='_blank' rel='noopener'><b>Programa Queimadas (INPE)</b><span>Situação atual e risco de fogo do INPE</span></a></div>";
    h += "<p class='ir-fonte' id='ir-fonte'></p>";
    RAIZ.innerHTML = h;
    liga(); render();
  }

  function validacao() {
    var cal = R.calibracao, v = cal && cal.validacao;
    if (!v || !v.bahia) return "<p>Validação indisponível.</p>";
    var b = v.bahia, h = "<p>O modelo foi ajustado com os anos de <b>" + v.anos_treino[0] + " a " + v.anos_treino[1] + "</b> e testado em <b>" + (v.anos_teste ? v.anos_teste[0] + " a " + v.anos_teste[1] : "–") +
      "</b>, anos que ele não viu. A tabela mostra a <b>AUC</b> (área sob a curva ROC): a chance de o índice dar valor maior a um dia com foco do que a um dia sem foco no mesmo conjunto (0,5 = sorteio; 1 = perfeito).</p>";
    h += "<div style='overflow-x:auto'><table class='ir-val'><caption class='sr'>Acerto de cada índice no período de teste</caption><thead><tr><th>Região</th><th>Risco calibrado</th><th>Calibrado só com meteorologia</th><th>Só histórico do mês</th><th>FWI</th><th>FMA+</th><th>Dias sem chuva</th></tr></thead><tbody>";
    function linha(nome, x) {
      var vals = [x.auc_modelo, x.auc_meteo, x.auc_linha_base, x.auc_fwi, x.auc_fma, x.auc_dias_secos], mx = Math.max.apply(null, vals.filter(ok));
      return "<tr><td>" + esc(nome) + "</td>" + vals.map(function (a) { return "<td" + (a === mx ? " class='melhor'" : "") + ">" + n2(a) + "</td>"; }).join("") + "</tr>";
    }
    h += linha("Bahia", b);
    Object.keys(v.regioes).forEach(function (n) { h += linha(n, v.regioes[n]); });
    h += "</tbody></table></div>";
    if (b.classes) {
      h += "<p>No período de teste, a chance de foco observada em cada classe (média da Bahia: <b>" + n1(100 * b.freq_foco_media) + "%</b> dos município-dias):</p><div style='overflow-x:auto'><table class='ir-val'><thead><tr><th>Classe</th><th>% dos dias</th><th>Dias com foco na classe</th><th>% de todos os focos</th></tr></thead><tbody>" +
        b.classes.map(function (c, i) { return "<tr><td>" + badge(i) + "</td><td>" + n1(100 * c.fracao_dias) + "%</td><td>" + n1(100 * (c.freq_foco || 0)) + "%</td><td>" + n1(100 * c.fracao_dos_focos) + "%</td></tr>"; }).join("") + "</tbody></table></div>";
    }
    if (ok(b.brier_skill_vs_linha_base)) h += "<p>Ganho de precisão das probabilidades (Brier skill score) em relação a usar só o histórico do mês: <b>" + n0(100 * b.brier_skill_vs_linha_base) + "%</b>.</p>";
    h += "<p style='font-size:.85em;color:var(--tx2)'>Calibração: " + esc(cal.periodo[0]) + " a " + esc(cal.periodo[1]) + ", focos do satélite de referência do INPE (AQUA, passagem da tarde), que mantém o mesmo padrão de detecção desde 2003. Recalibrado automaticamente todo mês.</p>";
    return h;
  }

  function liga() {
    RAIZ.querySelector("#ir-dias").addEventListener("click", function (e) { var b = e.target.closest("[data-d]"); if (!b) return; S.d = +b.getAttribute("data-d"); render(); });
    var ctl = RAIZ.querySelector("#ir-ctl");
    ctl.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.hasAttribute("data-v")) S.v = b.getAttribute("data-v"); else if (b.hasAttribute("data-g")) S.grp = b.getAttribute("data-g"); else return;
      guarda(); render();
    });
    RAIZ.querySelector("#ir-busca").addEventListener("change", function (e) {
      var n = norm(e.target.value), alvo = null;
      Object.keys(ENT).forEach(function (id) { if (!alvo && norm(ENT[id].nome) === n) alvo = id; });
      if (alvo) { e.target.value = ""; seleciona(alvo, true); }
    });
    var mapa = RAIZ.querySelector("#ir-mapa"), tip = RAIZ.querySelector("#ir-tip");
    RAIZ.querySelectorAll("#ir-mapa path.m").forEach(function (p) { PATHS[p.getAttribute("data-k")] = p; });
    mapa.addEventListener("mousemove", function (ev) {
      var p = ev.target.closest ? ev.target.closest("path.m") : null, m = p && ENT["m:" + p.getAttribute("data-k")];
      if (!m) { tip.style.display = "none"; return; }
      var g = grupoDe(m) || m, r = mapa.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, c = classeE(g, S.d);
      tip.innerHTML = "<b>" + esc(g.nome) + "</b>" + (g !== m ? " <span style='opacity:.75'>(" + esc(m.nome) + ")</span>" : "") + "<br>Risco: " + (c >= 0 ? R.classes[c] : "–") +
        " · FWI " + n1(val(g, "fwi")) + "<br>" + n0(val(g, "seco")) + " dias sem chuva · UR " + n0(val(g, "ur")) + "% · vento " + n0(val(g, "vento")) + " km/h";
      tip.style.display = "block";
      tip.style.left = Math.max(4, Math.min(x + 14, r.width - tip.offsetWidth - 4)) + "px";
      tip.style.top = (y + 16 + tip.offsetHeight > r.height ? y - tip.offsetHeight - 8 : y + 16) + "px";
    });
    mapa.addEventListener("mouseleave", function () { tip.style.display = "none"; });
    mapa.addEventListener("click", function (ev) { var p = ev.target.closest ? ev.target.closest("path.m") : null, m = p && ENT["m:" + p.getAttribute("data-k")]; if (m) seleciona((grupoDe(m) || m).id, false); });
    RAIZ.querySelector("#ir-rank").addEventListener("click", function (e) { var b = e.target.closest("[data-id]"); if (b) seleciona(b.getAttribute("data-id"), true); });
    RAIZ.querySelector("#ir-semana").addEventListener("click", function (e) {
      var td = e.target.closest("[data-d]"), b = e.target.closest("[data-id]");
      if (td) S.d = +td.getAttribute("data-d");
      if (b) { seleciona(b.getAttribute("data-id"), false); return; }
      if (td) render();
    });
    RAIZ.querySelector("#ir-csv").addEventListener("click", baixaCsv);
    RAIZ.querySelector("#ir-det").addEventListener("click", function (e) { if (e.target.closest("#ir-volta")) seleciona("e", false); var b = e.target.closest("[data-d]"); if (b) { S.d = +b.getAttribute("data-d"); render(); } });
    RAIZ.querySelector("#ir-tabela").addEventListener("toggle", function () { if (this.open) tabela(); });
    RAIZ.querySelector("#ir-tab").addEventListener("click", function (e) {
      var b = e.target.closest("[data-ord]"); if (b) { var o = b.getAttribute("data-ord"); if (S.ord === o) S.asc = !S.asc; else { S.ord = o; S.asc = o === "nome"; } tabela(); return; }
      var n = e.target.closest("[data-id]"); if (n) seleciona(n.getAttribute("data-id"), true);
    });
  }
  function seleciona(id, rolar) {
    if (!ENT[id]) return;
    S.sel = id;
    try { var u = new URL(location.href); if (ENT[id].tipo === "m") u.searchParams.set("municipio", ENT[id].nome); else u.searchParams.delete("municipio"); history.replaceState(null, "", u.toString()); } catch (e) { /* ignora */ }
    render();
    if (rolar) { var det = RAIZ.querySelector("#ir-det"); det.scrollIntoView({ behavior: "smooth", block: "nearest" }); det.focus({ preventScroll: true }); }
  }

  function render() {
    // dias
    var h = "";
    for (var d = 0; d < ND; d++) {
      var c = contaClasses(d), tot = c.reduce(function (a, b) { return a + b; }, 0) || 1, alto = c[3] + c[4];
      h += "<button class='ir-dia" + (d < IH ? " passado" : "") + "' data-d='" + d + "' aria-pressed='" + (d === S.d) + "' aria-label='" + rotDia(d, true) + ": " + alto + " municípios com risco muito alto ou extremo'>" +
        "<b>" + rotDia(d) + "</b><small>" + dCurta(R.datas[d]) + (R.tipo[d] === "p" ? " · previsão" : "") + "</small><span class='barra' aria-hidden='true'>" +
        c.map(function (n, k) { return n ? "<i style='width:" + (100 * n / tot).toFixed(1) + "%;background:" + CL[k] + "'></i>" : ""; }).join("") + "</span></button>";
    }
    var dias = RAIZ.querySelector("#ir-dias"); dias.innerHTML = h;
    var bsel = dias.querySelector("[aria-pressed=true]"); if (bsel && bsel.scrollIntoView && S.d >= IH) dias.scrollLeft = Math.max(0, bsel.offsetLeft - dias.offsetLeft - 8);
    RAIZ.querySelectorAll("#ir-ctl [data-v]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-v") === S.v); });
    RAIZ.querySelectorAll("#ir-ctl [data-g]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-g") === S.grp); });
    var tp = R.tipo[S.d];
    RAIZ.querySelector("#ir-sub").textContent = "417 municípios · " + rotDia(S.d, true) + " · " + (tp === "p" ? "previsão" : tp === "a" ? "análise do modelo" : "reanálise (NASA POWER)") + " · atualizado em " + new Date(R.gerado_em).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    var idade = (Date.now() - new Date(R.gerado_em).getTime()) / 36e5;
    RAIZ.querySelector("#ir-avisos").innerHTML = idade > 36 ? "<div class='ir-aviso' role='status'>Atenção: este painel não é atualizado há " + Math.round(idade) + " horas.</div>" : "";
    RAIZ.querySelector("#ir-tmapa").textContent = VARS[S.v].nome + " — " + rotDia(S.d, true) + (S.grp === "t" ? " · por território" : S.grp === "r" ? " · por região" : "");
    var selE = ENT[S.sel], selM = {};
    if (selE) selE.mem.forEach(function (i) { selM[MUNS[i].k] = 1; });
    MUNS.forEach(function (m) {
      var p = PATHS[m.k]; if (!p) return;
      var g = grupoDe(m) || m, noSel = selE && selE.tipo !== "e" && selM[m.k];
      p.setAttribute("fill", cor(S.v, val(g, S.v)));
      p.classList.toggle("sel", !!(noSel && selE.tipo === "m"));
      p.classList.toggle("grp", !!(noSel && selE.tipo !== "m"));
    });
    if (selE && selE.tipo === "m" && PATHS[selE.k]) PATHS[selE.k].parentNode.appendChild(PATHS[selE.k]);
    else if (selE && selE.tipo !== "e") selE.mem.forEach(function (i) { var p = PATHS[MUNS[i].k]; if (p) p.parentNode.appendChild(p); });
    RAIZ.querySelector("#ir-mapa svg").setAttribute("aria-label", "Mapa: " + VARS[S.v].nome + " em " + rotDia(S.d, true) + ". Use a tabela abaixo para ler os valores de cada município.");
    legenda(); kpis(); semana(); ranking(); detalhe();
    if (RAIZ.querySelector("#ir-tabela").open) tabela();
    RAIZ.querySelector("#ir-fonte").textContent = "Fonte: " + R.fonte + ". Focos: INPE (Programa Queimadas). Processamento: INEMA.";
  }

  function legenda() {
    var h;
    if (S.v === "risco") h = R.classes.map(function (n, i) { return "<span><i style='background:" + CL[i] + "'></i>" + n + "</span>"; }).join("");
    else if (S.v === "fcl") h = FCL_N.map(function (n, i) { return "<span><i style='background:" + CL[i] + "'></i>" + n + "</span>"; }).join("");
    else {
      var e = S.v === "fwi" ? FWI_E : S.v === "seco" ? SECO_E : S.v === "ur" ? UR_E : S.v === "vento" ? VT_E : FOC_E, un = S.v === "ur" ? "%" : S.v === "vento" ? " km/h" : S.v === "seco" ? " dias" : "";
      h = e.c.map(function (c, i) { var a = e.thr[i - 1], b = e.thr[i]; return "<span><i style='background:" + c + "'></i>" + (i === 0 ? "< " + b : i === e.thr.length ? "≥ " + a : a + "–" + b) + un + "</span>"; }).join("");
    }
    RAIZ.querySelector("#ir-leg").innerHTML = h + "<span><i style='background:#d9dde2'></i>sem dado</span>";
  }

  function kpi(c, rot, v, sub) { return "<div class='ir-kpi' style='--k:" + c + "'><small>" + rot + "</small><strong>" + v + "</strong><em>" + sub + "</em></div>"; }
  function kpis() {
    var d = S.d, c = contaClasses(d), alto = c[3] + c[4];
    var pior = null; MUNS.forEach(function (m) { if (!pior || R.prob[m.i][d] > R.prob[pior.i][d]) pior = m; });
    var regMax = null, regV = -1; REGS.forEach(function (r) { var n = 0; r.mem.forEach(function (i) { if (R.classe[i][d] >= 3) n++; }); var f = n / r.mem.length; if (f > regV) { regV = f; regMax = r; } });
    var diaMax = IH, diaN = -1; for (var j = IH; j < ND; j++) { var cc = contaClasses(j), nn = cc[3] + cc[4]; if (nn > diaN) { diaN = nn; diaMax = j; } }
    var f24 = 0, f7 = 0, ultObs = d; while (ultObs > 0 && R.tipo[ultObs] === "p") ultObs--;
    MUNS.forEach(function (m) { f24 += R.focos_todos[m.i][ultObs] || 0; f7 += focos7(m.i, ultObs); });
    RAIZ.querySelector("#ir-kpis").innerHTML =
      kpi(CL[4], "Risco muito alto ou extremo", n0(alto) + " <span style='font-size:.6em;color:var(--tx2)'>municípios</span>", c[4] + " em risco extremo · " + rotDia(d, true)) +
      kpi(CL[3], "Região mais crítica", regMax ? esc(regMax.nome) : "–", n0(100 * regV) + "% dos municípios em risco muito alto ou extremo") +
      kpi(pior ? CL[Math.max(0, R.classe[pior.i][d])] : "#999", "Maior risco", pior ? esc(pior.nome) : "–", pior ? "FWI " + n1(R.fwi[pior.i][d]) + " · " + n0(R.dias_secos[pior.i][d]) + (R.dias_secos[pior.i][d] === 1 ? " dia" : " dias") + " sem chuva" : "") +
      kpi("#7a1a12", "Dia mais crítico da semana", rotDia(diaMax, true), n0(diaN) + " municípios em risco muito alto ou extremo") +
      kpi("#de2d26", "Focos detectados", n0(f24) + " <span style='font-size:.6em;color:var(--tx2)'>em " + dCurta(R.datas[ultObs]) + "</span>", n0(f7) + " nos 7 dias até " + dCurta(R.datas[ultObs]) + " (todos os satélites)");
  }

  function semana() {
    var grupos = S.grp === "t" ? TERR : REGS, h = "<div style='overflow-x:auto'><table class='ir-semana'><caption class='sr'>Classe de risco média por " + (S.grp === "t" ? "território" : "região") + " e dia</caption><thead><tr><th class='n' scope='col'>" + (S.grp === "t" ? "Território" : "Região") + "</th>";
    for (var d = IH; d < ND; d++) { var ds = DSEM[dIso(R.datas[d]).getUTCDay()]; h += "<th scope='col'>" + (d === IH ? "Hoje" : ds.charAt(0).toUpperCase() + ds.slice(1)) + "<br><span style='font-weight:400'>" + dCurta(R.datas[d]).slice(0, 2) + "</span></th>"; }
    h += "</tr></thead><tbody>";
    grupos.forEach(function (g) {
      h += "<tr><th class='n' scope='row'><button class='ir-lnk' style='color:var(--tx);text-decoration:none;font-weight:600' data-id='" + g.id + "'>" + esc(g.nome) + "</button></th>";
      for (var d = IH; d < ND; d++) {
        var c = classeE(g, d), bg = c >= 0 ? CL[c] : "#eee";
        h += "<td data-d='" + d + "' class='" + (d === S.d ? "on" : "") + "' style='background:" + bg + ";color:" + corTexto(bg) + "' title='" + esc(g.nome) + ", " + rotDia(d, true) + ": " + (c >= 0 ? R.classes[c] : "–") + "'>" + (c >= 0 ? R.classes[c].split(" ").map(function (w) { return w.charAt(0).toUpperCase(); }).join("") : "–") + "</td>";
      }
      h += "</tr>";
    });
    h += "</tbody></table></div><p class='ir-glg' style='margin:4px 0 0'>B = baixo · M = moderado · A = alto · MA = muito alto · E = extremo. Clique em um dia para ver no mapa.</p>";
    RAIZ.querySelector("#ir-semana").innerHTML = h;
  }

  function ranking() {
    var base = S.grp === "m" ? MUNS : S.grp === "t" ? TERR : REGS, d = S.d;
    var arr = base.map(function (e) { return { e: e, p: probE(e, d) }; }).filter(function (x) { return ok(x.p); });
    arr.sort(function (a, b) { return b.p - a.p; });
    RAIZ.querySelector("#ir-trank").textContent = "Maior risco" + (S.grp === "t" ? " (territórios)" : S.grp === "r" ? " (regiões)" : "") + " · " + rotDia(d, true);
    RAIZ.querySelector("#ir-rank").innerHTML = arr.slice(0, 12).map(function (x, i) {
      var sem = ""; for (var j = IH; j < ND; j++) { var c = classeE(x.e, j); sem += "<i style='background:" + (c >= 0 ? CL[c] : "#eee") + "' title='" + rotDia(j, true) + ": " + (c >= 0 ? R.classes[c] : "–") + "'></i>"; }
      return "<li><button data-id='" + x.e.id + "'><span>" + (i + 1) + ".</span><span class='nm'>" + esc(x.e.nome) + "</span>" + badge(classeE(x.e, d)) + "<span class='ir-sem' aria-hidden='true'>" + sem + "</span></button></li>";
    }).join("");
  }

  // ---------- detalhe ----------
  function detalhe() {
    var e = ENT[S.sel] || ENT.e, h = "";
    var tipo = e.tipo === "m" ? "Município" + (R.regioes[e.r] ? " · Região " + R.regioes[e.r] : "") + (R.territorios[e.t] ? " · Território " + R.territorios[e.t] : "") :
      e.tipo === "t" ? "Território de identidade · " + e.mem.length + " municípios (médias)" : e.tipo === "r" ? "Região · " + e.mem.length + " municípios (médias)" : "Média dos 417 municípios";
    h += "<div class='ir-dett'><h3>" + esc(e.nome) + "</h3><span>" + esc(tipo) + "</span><span class='acoes'>" +
      (e.tipo === "m" && L_PREV ? "<a href='" + esc(L_PREV) + "?municipio=" + encodeURIComponent(e.nome) + "'>Previsão do tempo →</a>" : "") +
      (e.tipo === "m" && L_CHUVA ? "<a href='" + esc(L_CHUVA) + "?municipio=" + encodeURIComponent(e.nome) + "&modo=recente'>Chuva observada →</a>" : "") +
      (e.tipo === "m" && L_VEG ? "<a href='" + esc(L_VEG) + "?municipio=" + encodeURIComponent(e.nome) + "'>Vegetação →</a>" : "") +
      (e.tipo !== "e" ? "<button class='ir-lnk' id='ir-volta' type='button'>Ver Bahia</button>" : "") + "</span></div>";
    h += "<div class='ir-prev' role='list' aria-label='Risco nos próximos 7 dias'>";
    for (var d = IH; d < ND; d++) {
      var c = classeE(e, d), bg = c >= 0 ? CL[c] : "#eee", g = function (k) { return e.tipo === "m" ? R[k][e.i][d] : media(e, k, d); };
      h += "<div class='ir-pd' role='listitem'" + (d === S.d ? " style='box-shadow:0 0 0 2px #000'" : "") + "><div class='c' style='background:" + bg + ";color:" + corTexto(bg) + "'><small>" + rotDia(d, true) + "</small>" + (c >= 0 ? R.classes[c] : "–") + "</div>" +
        "<dl><dt>FWI</dt><dd>" + n1(g("fwi")) + "</dd><dt>Máx.</dt><dd>" + n0(g("tmax")) + " °C</dd><dt>UR mín.</dt><dd>" + n0(g("ur")) + "%</dd><dt>Vento</dt><dd>" + n0(g("vento")) + " km/h</dd><dt>Chuva</dt><dd>" + n1(g("chuva")) + " mm</dd></dl></div>";
    }
    h += "</div>";
    h += "<div class='ir-graf'><div>" + grafico(e) + "</div><div>" + componentes(e) + "</div></div>";
    RAIZ.querySelector("#ir-det").innerHTML = h;
  }
  function grafico(e) {
    var W = 640, H = 170, top = 10, left = 34, right = 40, bot = 30, w = W - left - right, bw = w / ND;
    var fwi = [], foc = [], mxF = 10, mxC = 4;
    for (var d = 0; d < ND; d++) {
      var f = e.tipo === "m" ? R.fwi[e.i][d] : media(e, "fwi", d), n = 0;
      e.mem.forEach(function (i) { n += R.focos_todos[i][d] || 0; });
      fwi.push(f); foc.push(R.tipo[d] === "p" ? null : n);
      if (ok(f)) mxF = Math.max(mxF, f); if (n > mxC) mxC = n;
    }
    mxF = Math.ceil(mxF * 1.1 / 10) * 10;
    var s = "<svg viewBox='0 0 " + W + " " + (H + top + bot) + "' role='img' aria-label='FWI diário e focos detectados em " + esc(e.nome) + "'>";
    for (var d2 = 0; d2 < ND; d2++) { var c = classeE(e, d2); if (c >= 0) s += "<rect x='" + (left + d2 * bw).toFixed(1) + "' y='" + top + "' width='" + bw.toFixed(1) + "' height='" + H + "' fill='" + CL[c] + "' opacity='.35'/>"; }
    if (IH > 0) s += "<rect x='" + (left + IH * bw).toFixed(1) + "' y='" + (top - 8) + "' width='" + ((ND - IH) * bw).toFixed(1) + "' height='6' fill='#55616d' opacity='.5'/><text x='" + (left + IH * bw + 4).toFixed(1) + "' y='" + (top - 1) + "' font-size='8' fill='#fff'>previsão</text>";
    for (var t = 0; t <= 4; t++) { var y = top + H - t / 4 * H; s += "<line x1='" + left + "' x2='" + (left + w) + "' y1='" + y.toFixed(1) + "' y2='" + y.toFixed(1) + "' stroke='#e3e7ec'/><text x='" + (left - 4) + "' y='" + (y + 3).toFixed(1) + "' font-size='9' text-anchor='end' fill='#55616d'>" + n0(mxF * t / 4) + "</text><text x='" + (left + w + 4) + "' y='" + (y + 3).toFixed(1) + "' font-size='9' fill='#a50f15'>" + n0(mxC * t / 4) + "</text>"; }
    var pts = [];
    foc.forEach(function (n, k) { if (n) { var hh = n / mxC * H; s += "<rect x='" + (left + k * bw + bw * 0.25).toFixed(1) + "' y='" + (top + H - hh).toFixed(1) + "' width='" + (bw * 0.5).toFixed(1) + "' height='" + hh.toFixed(1) + "' fill='#a50f15'><title>" + dCurta(R.datas[k]) + ": " + n + " focos</title></rect>"; } });
    fwi.forEach(function (f, k) { if (ok(f)) pts.push((left + (k + 0.5) * bw).toFixed(1) + "," + (top + H - f / mxF * H).toFixed(1)); });
    s += "<polyline points='" + pts.join(" ") + "' fill='none' stroke='#1d2733' stroke-width='2'/>";
    fwi.forEach(function (f, k) { if (ok(f)) s += "<circle cx='" + (left + (k + 0.5) * bw).toFixed(1) + "' cy='" + (top + H - f / mxF * H).toFixed(1) + "' r='" + (k === S.d ? 4.5 : 2.2) + "' fill='" + (k === S.d ? "#000" : "#1d2733") + "'><title>" + dCurta(R.datas[k]) + ": FWI " + n1(f) + "</title></circle>"; });
    for (var k = 0; k < ND; k += 2) s += "<text x='" + (left + (k + 0.5) * bw).toFixed(1) + "' y='" + (top + H + 13) + "' font-size='9' text-anchor='middle' fill='#55616d'>" + dCurta(R.datas[k]) + "</text>";
    s += "</svg>";
    return "<h4>FWI e focos — " + ND + " dias (fundo = classe de risco)</h4>" + s +
      "<div class='ir-glg'><span><b style='display:inline-block;width:16px;border-top:2px solid #1d2733;vertical-align:3px'></b> FWI (eixo esq.)</span><span><b style='display:inline-block;width:10px;height:10px;background:#a50f15;vertical-align:-1px'></b> focos detectados, todos os satélites (eixo dir.)</span></div>";
  }
  function componentes(e) {
    var d = S.d, g = function (k) { return e.tipo === "m" ? R[k][e.i][d] : media(e, k, d); };
    var linhas = [["FFMC", "umidade do material fino (folhas, capim)", n0(g("ffmc"))], ["DMC", "secura da camada orgânica intermediária", n0(g("dmc"))], ["DC", "secura profunda (seca de longo prazo)", n0(g("dc"))],
      ["ISI", "velocidade inicial de propagação", n1(g("isi"))], ["BUI", "combustível disponível", n0(g("bui"))], ["FWI", "intensidade potencial do fogo", n1(g("fwi"))],
      ["FMA+", "Fórmula de Monte Alegre alterada", n0(g("fma"))], ["Dias sem chuva", "seguidos, < 2 mm", n0(g("dias_secos"))], ["Chuva em 30 dias", "mm", n0(g("chuva30"))]];
    return "<h4>Componentes do índice — " + rotDia(d, true) + "</h4><table class='ir-comp'><tbody>" + linhas.map(function (l) { return "<tr><th scope='row'>" + l[0] + "</th><td style='color:var(--tx2)'>" + l[1] + "</td><td class='v'>" + l[2] + "</td></tr>"; }).join("") + "</tbody></table>";
  }

  // ---------- tabela acessível ----------
  function tabela() {
    var d = S.d, cols = [["nome", "Município"], ["reg", "Região"], ["prob", "Risco"], ["fwi", "FWI"], ["seco", "Dias sem chuva"], ["ur", "UR mín."], ["vento", "Vento"], ["focos", "Focos 7 dias"]];
    var arr = MUNS.map(function (m) { return { m: m, nome: m.nome, reg: R.regioes[m.r] || "", prob: R.prob[m.i][d], fwi: R.fwi[m.i][d], seco: R.dias_secos[m.i][d], ur: R.ur[m.i][d], vento: R.vento[m.i][d], focos: focos7(m.i, d) }; });
    arr.sort(function (a, b) { var x = a[S.ord], y = b[S.ord]; var r = typeof x === "string" ? x.localeCompare(y, "pt-BR") : (x || 0) - (y || 0); return S.asc ? r : -r; });
    var h = "<table><caption class='sr'>Risco de incêndio por município, " + rotDia(d, true) + "</caption><thead><tr>" + cols.map(function (c) {
      return "<th scope='col' aria-sort='" + (S.ord === c[0] ? (S.asc ? "ascending" : "descending") : "none") + "'><button data-ord='" + c[0] + "'>" + c[1] + (S.ord === c[0] ? (S.asc ? " ▲" : " ▼") : "") + "</button></th>";
    }).join("") + "</tr></thead><tbody>";
    arr.forEach(function (x) {
      h += "<tr><td><button class='ir-lnk' style='color:var(--tx)' data-id='" + x.m.id + "'>" + esc(x.nome) + "</button></td><td>" + esc(x.reg) + "</td><td>" + badge(R.classe[x.m.i][d]) + "</td><td class='v'>" + n1(x.fwi) + "</td><td class='v'>" + n0(x.seco) + "</td><td class='v'>" + n0(x.ur) + "%</td><td class='v'>" + n0(x.vento) + " km/h</td><td class='v'>" + n0(x.focos) + "</td></tr>";
    });
    RAIZ.querySelector("#ir-tab").innerHTML = h + "</tbody></table>";
  }
  function baixaCsv() {
    var d = S.d, l = [["municipio", "regiao", "territorio", "data", "tipo", "classe_risco", "fwi", "ffmc", "dmc", "dc", "isi", "bui", "fma_mais", "dias_sem_chuva", "tmax", "ur_min", "vento_kmh", "chuva_mm", "focos_7dias"].join(";")];
    MUNS.forEach(function (m) {
      var i = m.i, c = R.classe[i][d];
      l.push([m.nome, R.regioes[m.r] || "", R.territorios[m.t] || "", R.datas[d], R.tipo[d] === "p" ? "previsao" : "observado", c >= 0 ? R.classes[c] : "", R.fwi[i][d], R.ffmc[i][d], R.dmc[i][d], R.dc[i][d], R.isi[i][d], R.bui[i][d], R.fma[i][d], R.dias_secos[i][d], R.tmax[i][d], R.ur[i][d], R.vento[i][d], R.chuva[i][d], focos7(i, d)]
        .map(function (x) { return x == null ? "" : String(x).replace(".", ","); }).join(";"));
    });
    var blob = new Blob(["﻿" + l.join("\r\n")], { type: "text/csv;charset=utf-8" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "risco_incendio_bahia_" + R.datas[d] + ".csv";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function svgMapa() {
    var fs = GEO.features, minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, K = Math.cos(13 * Math.PI / 180), E = 64;
    function anda(c, f) { if (typeof c[0] === "number") f(c); else c.forEach(function (x) { anda(x, f); }); }
    fs.forEach(function (f) { anda(f.geometry.coordinates, function (p) { var x = p[0] * K * E, y = -p[1] * E; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }); });
    function proj(lo, la) { return [lo * K * E - minX + 4, -la * E - minY + 4]; }
    var w = Math.ceil(maxX - minX + 8), hh = Math.ceil(maxY - minY + 8);
    var out = "<svg viewBox='0 0 " + w + " " + hh + "' role='img' aria-label='Mapa dos municípios da Bahia'>";
    fs.forEach(function (f) {
      var k = norm(f.properties.nome), polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates, d = "";
      polys.forEach(function (pl) {
        pl.forEach(function (anel) {
          var lx = null, ly = null, s = "";
          anel.forEach(function (p, i) {
            var q = proj(p[0], p[1]), x = Math.round(q[0] * 10) / 10, y = Math.round(q[1] * 10) / 10;
            if (lx != null && Math.abs(x - lx) + Math.abs(y - ly) < 0.5 && i < anel.length - 1) return;
            s += (s ? "L" : "M") + x + " " + y; lx = x; ly = y;
          });
          d += s + "Z";
        });
      });
      out += "<path class='m' data-k='" + esc(k) + "' d='" + d + "'/>";
    });
    return out + "</svg>";
  }
})();
