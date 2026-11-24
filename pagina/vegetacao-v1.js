/* Monitoramento da Vegetação na Bahia — INEMA
   Dados: vegetacao/semanal.json (NOAA/NESDIS STAR Blended VHP, 4 km, semanal: VHI, VCI, TCI e NDVI suavizado, média por município
   ponderada pela área e % da área com VHI < 40 e < 20 — robô no GitHub), extremos/municipios_ba.geojson (malha IBGE),
   focos/municipios.json (regiões e territórios de identidade) e, para o detalhe, chuva/mensal.json (chuva observada, CHIRPS v3). */
(function () {
  "use strict";
  var RAIZ = document.getElementById("inema-veg");
  if (!RAIZ || RAIZ.getAttribute("data-ok")) return;
  RAIZ.setAttribute("data-ok", "1");
  var BASE = "https://cdn.jsdelivr.net/gh/aldirioalmeida-cpu/previsao-municipios-ba@main/";
  var CHUVA = RAIZ.getAttribute("data-chuva") || "";
  var FOCOS = RAIZ.getAttribute("data-focos") || "";
  var AGRO = RAIZ.getAttribute("data-agro") || "";

  var CSS = [
    "#inema-veg{--az:#0b4f8a;--vd:#2e7d32;--tx:#1d2733;--tx2:#5b6773;--ln:#d7dee6;--bg:#fff;--cz:#f5f7f9;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:var(--tx);font-size:15px;line-height:1.4;max-width:1280px;margin:0 auto 28px}",
    "#inema-veg *{box-sizing:border-box}",
    "#inema-veg .iv-topo{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:flex-end;justify-content:space-between;margin:0 0 14px}",
    "#inema-veg h2.iv-tit{margin:0;font-size:1.55em;color:var(--vd);line-height:1.15}",
    "#inema-veg .iv-sub{margin:4px 0 0;color:var(--tx2);font-size:.92em}",
    "#inema-veg .iv-aviso{background:#fff4e0;border:1px solid #f0c27a;border-radius:10px;padding:8px 12px;margin:0 0 12px;font-size:.9em}",
    "#inema-veg .iv-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:0 0 14px}",
    "#inema-veg .iv-kpi{background:var(--bg);border:1px solid var(--ln);border-radius:12px;padding:10px 12px;position:relative;overflow:hidden}",
    "#inema-veg .iv-kpi:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--k,#2e7d32)}",
    "#inema-veg .iv-kpi small{display:block;color:var(--tx2);font-size:.76em;text-transform:uppercase;letter-spacing:.03em}",
    "#inema-veg .iv-kpi strong{display:block;font-size:1.5em;line-height:1.15;margin:2px 0}",
    "#inema-veg .iv-kpi em{font-style:normal;font-size:.82em;color:var(--tx2)}",
    "#inema-veg .iv-ctl{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;background:var(--cz);border:1px solid var(--ln);border-radius:12px;padding:10px 12px;margin:0 0 12px}",
    "#inema-veg .iv-grp{display:flex;flex-wrap:wrap;gap:4px;align-items:center}",
    "#inema-veg .iv-grp>span{font-size:.78em;color:var(--tx2);margin-right:4px;text-transform:uppercase;letter-spacing:.03em}",
    "#inema-veg button.iv-b{font:inherit;font-size:.86em;border:1px solid var(--ln);background:#fff;color:var(--tx);border-radius:999px;padding:5px 11px;cursor:pointer;line-height:1.2}",
    "#inema-veg button.iv-b:hover{border-color:var(--vd)}",
    "#inema-veg button.iv-b.on{background:var(--vd);border-color:var(--vd);color:#fff}",
    "#inema-veg select.iv-sel,#inema-veg input.iv-busca{font:inherit;font-size:.88em;border:1px solid var(--ln);border-radius:999px;padding:5px 10px;background:#fff;color:var(--tx)}",
    "#inema-veg input.iv-busca{min-width:210px}",
    "#inema-veg .iv-corpo{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:14px}",
    "#inema-veg .iv-cx{background:var(--bg);border:1px solid var(--ln);border-radius:12px;padding:12px}",
    "#inema-veg .iv-cx h3{margin:0 0 8px;font-size:1.02em;color:var(--vd)}",
    "#inema-veg .iv-cxh{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;margin:0 0 8px}",
    "#inema-veg .iv-cxh h3{margin:0}",
    "#inema-veg .iv-mapa{position:relative}",
    "#inema-veg .iv-mapa svg{width:100%;height:auto;display:block;max-height:640px}",
    "#inema-veg .iv-mapa path.m{stroke:#fff;stroke-width:.35;cursor:pointer}",
    "#inema-veg .iv-mapa path.m:hover{stroke:#111;stroke-width:1.2}",
    "#inema-veg .iv-mapa path.m.sel{stroke:#000;stroke-width:1.6}",
    "#inema-veg .iv-mapa path.m.grp{stroke:#000;stroke-width:.9}",
    "#inema-veg .iv-tip{position:absolute;pointer-events:none;background:rgba(20,28,38,.93);color:#fff;border-radius:8px;padding:6px 9px;font-size:.84em;line-height:1.35;white-space:nowrap;display:none;z-index:3}",
    "#inema-veg .iv-leg{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:.78em;color:var(--tx2);margin-top:6px}",
    "#inema-veg .iv-leg i{display:inline-block;width:14px;height:11px;border-radius:2px;margin-right:4px;vertical-align:-1px;border:1px solid rgba(0,0,0,.12)}",
    "#inema-veg .iv-lado{display:flex;flex-direction:column;gap:14px}",
    "#inema-veg .iv-lista{display:grid;grid-template-columns:auto 1fr auto;gap:4px 8px;align-items:center;font-size:.86em;max-height:330px;overflow:auto;padding-right:4px}",
    "#inema-veg .iv-lista .n{cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:190px}",
    "#inema-veg .iv-lista .n:hover,#inema-veg .iv-lista .n.on{color:var(--vd);font-weight:700}",
    "#inema-veg .iv-lista .bar{height:13px;background:var(--cz);border-radius:4px;position:relative;overflow:hidden}",
    "#inema-veg .iv-lista .bar i{position:absolute;top:0;bottom:0;display:block}",
    "#inema-veg .iv-lista .bar b{position:absolute;top:-2px;bottom:-2px;width:1px;background:#8a96a3}",
    "#inema-veg .iv-lista .v{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}",
    "#inema-veg ol.iv-rank{margin:0;padding:0;list-style:none;font-size:.86em;columns:2;column-gap:14px}",
    "#inema-veg ol.iv-rank li{display:flex;justify-content:space-between;gap:6px;padding:3px 0;border-bottom:1px dotted var(--ln);cursor:pointer;break-inside:avoid}",
    "#inema-veg ol.iv-rank li:hover{color:var(--vd)}",
    "#inema-veg ol.iv-rank b{font-variant-numeric:tabular-nums}",
    "#inema-veg .iv-det{margin-top:14px}",
    "#inema-veg .iv-dett{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;margin:0 0 10px}",
    "#inema-veg .iv-dett h3{margin:0;font-size:1.25em;color:var(--tx)}",
    "#inema-veg .iv-dett span{color:var(--tx2);font-size:.9em}",
    "#inema-veg .iv-dett .acoes{margin-left:auto;display:flex;gap:12px;font-size:.88em}",
    "#inema-veg .iv-dett a,#inema-veg .iv-lnk{color:var(--vd);cursor:pointer;text-decoration:underline;background:none;border:0;font:inherit;padding:0}",
    "#inema-veg .iv-cards{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin:0 0 12px}",
    "#inema-veg .iv-card{border-radius:10px;padding:8px 10px;border:1px solid rgba(0,0,0,.08)}",
    "#inema-veg .iv-card small{display:block;font-size:.74em;text-transform:uppercase;letter-spacing:.03em;opacity:.85}",
    "#inema-veg .iv-card strong{display:block;font-size:1.35em;line-height:1.15}",
    "#inema-veg .iv-card em{font-style:normal;font-size:.78em}",
    "#inema-veg .iv-graf{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}",
    "#inema-veg .iv-graf svg{width:100%;height:auto;display:block}",
    "#inema-veg .iv-graf h4{margin:0 0 4px;font-size:.92em;color:var(--tx)}",
    "#inema-veg .iv-glg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:.76em;color:var(--tx2);margin-top:2px}",
    "#inema-veg .iv-glg i{display:inline-block;width:14px;height:0;border-top:2px solid;margin-right:4px;vertical-align:3px}",
    "#inema-veg details.iv-ajuda{margin-top:14px;background:var(--cz);border:1px solid var(--ln);border-radius:12px;padding:8px 14px;font-size:.92em}",
    "#inema-veg details.iv-ajuda summary{cursor:pointer;font-weight:600;color:var(--vd)}",
    "#inema-veg details.iv-ajuda li{margin:3px 0}",
    "#inema-veg table.iv-cls{border-collapse:collapse;font-size:.86em;margin:6px 0}",
    "#inema-veg table.iv-cls td{padding:2px 8px;border-bottom:1px solid var(--ln)}",
    "#inema-veg .iv-links{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}",
    "#inema-veg .iv-links a{display:block;border:1px solid var(--ln);border-radius:12px;padding:10px 12px;text-decoration:none;color:var(--tx);background:#fff}",
    "#inema-veg .iv-links a:hover{border-color:var(--vd)}",
    "#inema-veg .iv-links b{display:block;color:var(--vd);font-size:.95em}",
    "#inema-veg .iv-links span{font-size:.82em;color:var(--tx2)}",
    "#inema-veg .iv-fonte{font-size:.8em;color:var(--tx2);margin-top:10px}",
    "#inema-veg .iv-carr{padding:40px;text-align:center;color:var(--tx2)}",
    "@media (max-width:1000px){#inema-veg .iv-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}#inema-veg .iv-corpo,#inema-veg .iv-graf{grid-template-columns:1fr}#inema-veg .iv-links{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-veg .iv-cards{grid-template-columns:repeat(3,minmax(0,1fr))}}",
    "@media (max-width:640px){#inema-veg{font-size:14px}#inema-veg .iv-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-veg .iv-kpi strong{font-size:1.25em}#inema-veg ol.iv-rank{columns:1}#inema-veg input.iv-busca{min-width:0;width:100%}#inema-veg .iv-grp{width:100%}#inema-veg .iv-links{grid-template-columns:1fr}#inema-veg .iv-cards{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-veg .iv-dett .acoes{margin-left:0}}"
  ].join("\n");
  var st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);
  RAIZ.innerHTML = "<div class='iv-carr'>Carregando o monitoramento da vegetação…</div>";

  // ---------- utilidades ----------
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(v) { return v != null && isFinite(v); }
  function n0(v) { return !ok(v) ? "–" : Math.round(v).toLocaleString("pt-BR"); }
  function n2(v) { return !ok(v) ? "–" : v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function sn(v) { if (!ok(v)) return "–"; var x = Math.round(v); return (x > 0 ? "+" : x < 0 ? "−" : "±") + Math.abs(x); }
  function json(u) { return fetch(u, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status + " em " + u.split("/").pop()); return r.json(); }); }
  var MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  function dIso(s) { var p = s.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function rotSem(i) { var d = dIso(D.datas[i]), a = new Date(d.getTime() - 3 * 864e5), b = new Date(d.getTime() + 3 * 864e5); return a.getUTCDate() + (a.getUTCMonth() !== b.getUTCMonth() ? "/" + MES[a.getUTCMonth()] : "") + "–" + b.getUTCDate() + "/" + MES[b.getUTCMonth()] + "/" + b.getUTCFullYear(); }
  function bin(thr, v) { var i = 0; while (i < thr.length && v >= thr[i]) i++; return i; }
  function corTexto(hex) { var r = parseInt(hex.substr(1, 2), 16), g = parseInt(hex.substr(3, 2), 16), b = parseInt(hex.substr(5, 2), 16); return (r * 299 + g * 587 + b * 114) / 1000 < 140 ? "#fff" : "#1d2733"; }

  // ---------- classes ----------
  var VH = { thr: [10, 20, 30, 40, 60], c: ["#67000d", "#c0392b", "#ef8a3c", "#f6d55c", "#b9dc8e", "#2e8b3e"],
    n: ["Estresse extremo", "Estresse severo", "Estresse moderado", "Estresse leve", "Normal", "Favorável"] };
  var NDVI = { thr: [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75], c: ["#a6611a", "#cfa35f", "#ebd9a6", "#d9ecb0", "#a6d47f", "#62b35a", "#2b8a3e", "#0d5a28"] };
  var EST = { thr: [10, 25, 50, 75, 90], c: ["#f4f8ef", "#fbe7b5", "#f6bd6a", "#e8793a", "#c43c22", "#7a1210"] };
  var DIF = { thr: [-15, -10, -5, -2, 2, 5, 10, 15], c: ["#7a2e05", "#c44e0c", "#f39c34", "#fdd99b", "#eeeeee", "#c4e6bd", "#6dbf73", "#2e8b3e", "#0d5a28"] };
  function classeVH(v) { return ok(v) ? bin(VH.thr, v) : -1; }

  var VARS = {
    vhi: { nome: "VHI — Índice de Saúde da Vegetação", curto: "VHI" },
    vci: { nome: "VCI — Condição da Vegetação (umidade)", curto: "VCI" },
    tci: { nome: "TCI — Condição Térmica", curto: "TCI" },
    ndvi: { nome: "NDVI (índice de vegetação)", curto: "NDVI" },
    est: { nome: "% da área com vegetação estressada (VHI < 40)", curto: "% área estressada" },
    d4: { nome: "Variação do VHI em 4 semanas", curto: "Δ 4 semanas" },
    d52: { nome: "VHI em relação à mesma semana do ano anterior", curto: "Δ 1 ano" }
  };

  // ---------- estado ----------
  var S = { v: "vhi", grp: "m", sel: "e", sem: null, rk: "pior" };
  try { var g0 = JSON.parse(localStorage.getItem("inemaVeg1") || "{}"); if (VARS[g0.v]) S.v = g0.v; if (/^[mtr]$/.test(g0.grp || "")) S.grp = g0.grp; if (g0.rk) S.rk = g0.rk; } catch (e) { /* sem armazenamento */ }
  function guarda() { try { localStorage.setItem("inemaVeg1", JSON.stringify({ v: S.v, grp: S.grp, rk: S.rk })); } catch (e) { /* ignora */ } }
  var qs = new URLSearchParams(location.search), QMUN = qs.get("municipio");

  var D, GEO, NS, CH = null, ENT = {}, MUNS = [], TERR = [], REGS = [], PATHS = {}, NOMES_R = [], NOMES_T = [];
  Promise.all([
    json(BASE + "vegetacao/semanal.json"),
    json(BASE + "extremos/municipios_ba.geojson"),
    json(BASE + "focos/municipios.json").catch(function () { return null; })
  ]).then(function (r) { prepara(r[0], r[1], r[2]); monta(); carregaChuva(); }).catch(function (e) {
    RAIZ.innerHTML = "<div class='iv-aviso'>Não foi possível carregar os dados do painel agora (" + esc(e.message || e) + "). Tente novamente em alguns minutos.</div>";
  });
  function carregaChuva() { json(BASE + "chuva/mensal.json").then(function (c) { CH = c; detalhe(); }).catch(function () { /* sem chuva: detalhe segue sem o gráfico */ }); }

  function novaEnt(id, tipo, nome, mem) { var e = { id: id, tipo: tipo, nome: nome, mem: mem }; ENT[id] = e; return e; }
  function arr(a) { var o = new Float64Array(a.length); for (var j = 0; j < a.length; j++) o[j] = a[j] == null ? NaN : a[j]; return o; }
  function agrega(mem, k) {
    var out = new Float64Array(NS);
    for (var j = 0; j < NS; j++) {
      var s = 0, w = 0;
      for (var q = 0; q < mem.length; q++) { var v = MUNS[mem[q]][k][j]; if (ok(v)) { var a = D.area[mem[q]] || 1; s += v * a; w += a; } }
      out[j] = w > 0 ? s / w : NaN;
    }
    return out;
  }
  function prepara(d, geo, focos) {
    D = d; GEO = geo; NS = d.semanas.length; S.sem = NS - 1;
    var meta = {};
    if (focos) { NOMES_R = focos.regioes || []; NOMES_T = focos.territorios || []; focos.municipios.forEach(function (m) { meta[norm(m.n)] = m; }); }
    d.mun.forEach(function (nome, i) {
      var k = norm(nome), mt = meta[k] || {}, e = novaEnt("m:" + k, "m", nome, [i]);
      e.k = k; e.r = mt.r; e.t = mt.t; e.i = i;
      ["vhi", "vci", "tci", "ndvi", "est", "sev"].forEach(function (c) { e[c] = arr(d[c][i]); });
      MUNS.push(e);
    });
    function grupo(id, tipo, nome, lista) {
      var e = novaEnt(id, tipo, nome, lista.map(function (m) { return m.i; }));
      ["vhi", "vci", "tci", "ndvi", "est", "sev"].forEach(function (c) { e[c] = agrega(e.mem, c); });
      return e;
    }
    NOMES_R.forEach(function (n, r) { var l = MUNS.filter(function (m) { return m.r === r; }); if (l.length) REGS.push(grupo("r:" + r, "r", n, l)); });
    NOMES_T.forEach(function (n, t) { var l = MUNS.filter(function (m) { return m.t === t; }); if (l.length) TERR.push(grupo("t:" + t, "t", n, l)); });
    grupo("e", "e", "Bahia", MUNS);
    if (QMUN && ENT["m:" + norm(QMUN)]) S.sel = "m:" + norm(QMUN);
  }

  function val(e, v, j) {
    j = j == null ? S.sem : j;
    if (v === "d4") return j >= 4 ? e.vhi[j] - e.vhi[j - 4] : NaN;
    if (v === "d52") return j >= 52 ? e.vhi[j] - e.vhi[j - 52] : NaN;
    return e[v][j];
  }
  function escala(v) {
    if (v === "ndvi") return NDVI;
    if (v === "est") return EST;
    if (v === "d4" || v === "d52") return DIF;
    return VH;
  }
  function cor(v, x) { if (!ok(x)) return "#d9dde2"; var e = escala(v); return e.c[bin(e.thr, x)]; }
  function fmt(v, x, un) {
    if (!ok(x)) return "–";
    if (v === "ndvi") return n2(x);
    if (v === "est") return n0(x) + "%";
    if (v === "d4" || v === "d52") return sn(x) + (un ? " pts" : "");
    return n0(x);
  }
  function grupoDe(m) { return S.grp === "t" ? ENT["t:" + m.t] : S.grp === "r" ? ENT["r:" + m.r] : m; }

  // ---------- montagem ----------
  function monta() {
    var h = "<div class='iv-topo'><div><h2 class='iv-tit'>Monitoramento da Vegetação na Bahia</h2><p class='iv-sub' id='iv-sub'></p></div></div>";
    h += "<div id='iv-avisos'></div><div class='iv-kpis' id='iv-kpis'></div><div class='iv-ctl' id='iv-ctl'></div>";
    h += "<div class='iv-corpo'><div class='iv-cx'><div class='iv-cxh'><h3 id='iv-tmapa'></h3><button class='iv-lnk' id='iv-csv' type='button'>Baixar tabela (CSV)</button></div>" +
      "<div class='iv-mapa' id='iv-mapa'>" + svgMapa() + "<div class='iv-tip' id='iv-tip'></div></div><div class='iv-leg' id='iv-leg'></div></div>" +
      "<div class='iv-lado'><div class='iv-cx'><h3 id='iv-tgrp'></h3><div class='iv-lista' id='iv-lista'></div></div>" +
      "<div class='iv-cx'><div class='iv-cxh'><h3 id='iv-trank'></h3><span class='iv-grp' id='iv-rk'><button class='iv-b' data-rk='pior'>Mais estressados</button><button class='iv-b' data-rk='melhor'>Mais vigorosos</button></span></div><ol class='iv-rank' id='iv-rank'></ol></div></div></div>";
    h += "<div class='iv-cx iv-det' id='iv-det'></div>";
    h += "<details class='iv-ajuda'><summary>Como ler este painel e metodologia</summary><ul>" +
      "<li><b>Dados</b>: Vegetation Health Products (VHP) da NOAA/NESDIS (EUA), a partir dos satélites VIIRS, em grade de 4 km, semanal. O valor de cada município é a média dos pixels ponderada pela área do município dentro de cada pixel; territórios, regiões e o estado são médias ponderadas pela área dos municípios.</li>" +
      "<li><b>NDVI</b> (Índice de Vegetação por Diferença Normalizada, suavizado): mede o verdor da vegetação (≈ 0,1 solo exposto ou caatinga seca; > 0,6 vegetação densa e vigorosa). Varia naturalmente com o tipo de vegetação e a estação — por isso o painel usa os índices abaixo para comparar com o normal.</li>" +
      "<li><b>VCI</b> (Condição da Vegetação, 0–100): onde o NDVI da semana está entre o mínimo (0) e o máximo (100) já registrados naquela semana do ano no local desde 1981. Reflete principalmente a umidade disponível para as plantas.</li>" +
      "<li><b>TCI</b> (Condição Térmica, 0–100): o mesmo para a temperatura de brilho da superfície, invertido — valores baixos indicam calor acima do normal (estresse térmico).</li>" +
      "<li><b>VHI</b> (Índice de Saúde da Vegetação) = média de VCI e TCI. É usado pela NOAA e pela FAO para monitorar seca agrícola:" +
      "<table class='iv-cls'>" + VH.n.map(function (n, i) { return "<tr><td><i style='display:inline-block;width:14px;height:11px;border-radius:2px;background:" + VH.c[i] + ";border:1px solid rgba(0,0,0,.12)'></i></td><td>" + n + "</td><td>" + (i === 0 ? "< 10" : i === 5 ? "≥ 60" : VH.thr[i - 1] + " a " + VH.thr[i]) + "</td></tr>"; }).join("") + "</table></li>" +
      "<li><b>% da área estressada</b>: fração da área do município (ou grupo) com VHI abaixo de 40. <b>Δ 4 semanas</b> e <b>Δ 1 ano</b>: diferença do VHI em pontos em relação a 4 semanas antes e à mesma semana do ano anterior.</li>" +
      "<li>Os índices de satélite podem ser afetados por nuvens persistentes (litoral e período chuvoso), áreas urbanas e corpos d'água. Use junto com a chuva observada e o conhecimento local.</li></ul></details>";
    h += "<div class='iv-links'>" +
      (CHUVA ? "<a href='" + esc(CHUVA) + "'><b>Monitoramento da Chuva</b><span>Anomalias, SPI e chuva recente</span></a>" : "") +
      (FOCOS ? "<a href='" + esc(FOCOS) + "'><b>Focos de calor</b><span>Queimadas detectadas por satélite</span></a>" : "") +
      (AGRO ? "<a href='" + esc(AGRO) + "'><b>Agrometeorologia</b><span>Previsão para as atividades agrícolas</span></a>" : "") +
      "<a href='https://www.star.nesdis.noaa.gov/smcd/emb/vci/VH/index.php' target='_blank' rel='noopener'><b>NOAA VHP</b><span>Sobre os índices de saúde da vegetação</span></a></div>";
    h += "<p class='iv-fonte' id='iv-fonte'></p>";
    RAIZ.innerHTML = h;
    liga(); render();
  }

  function controles() {
    var ops = "";
    for (var i = NS - 1; i >= 0; i--) ops += "<option value='" + i + "'" + (i === S.sem ? " selected" : "") + ">Semana " + D.semanas[i][1] + "/" + D.semanas[i][0] + " (" + rotSem(i) + ")</option>";
    return "<div class='iv-grp'><span>Semana</span><select class='iv-sel' id='iv-sem' aria-label='Semana'>" + ops + "</select></div>" +
      "<div class='iv-grp' id='iv-gv'><span>Mapa</span>" + Object.keys(VARS).map(function (k) { return "<button class='iv-b' data-v='" + k + "'>" + VARS[k].curto + "</button>"; }).join("") + "</div>" +
      "<div class='iv-grp'><span>Agrupar</span><button class='iv-b' data-g='m'>Município</button><button class='iv-b' data-g='t'>Território</button><button class='iv-b' data-g='r'>Região</button></div>" +
      "<div class='iv-grp' style='margin-left:auto'><input class='iv-busca' id='iv-busca' list='iv-dl' placeholder='Buscar município, território…' aria-label='Buscar'><datalist id='iv-dl'>" +
      MUNS.concat(TERR, REGS).map(function (e) { return "<option value='" + esc(e.nome) + "'>" + (e.tipo === "t" ? "Território" : e.tipo === "r" ? "Região" : "") + "</option>"; }).join("") + "</datalist></div>";
  }

  function liga() {
    var ctl = RAIZ.querySelector("#iv-ctl");
    ctl.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.hasAttribute("data-v")) S.v = b.getAttribute("data-v");
      else if (b.hasAttribute("data-g")) S.grp = b.getAttribute("data-g");
      else return;
      guarda(); render();
    });
    ctl.addEventListener("change", function (e) {
      if (e.target.id === "iv-sem") { S.sem = +e.target.value; render(); }
      if (e.target.id === "iv-busca") { var n = norm(e.target.value), alvo = null; Object.keys(ENT).forEach(function (id) { if (!alvo && norm(ENT[id].nome) === n) alvo = id; }); if (alvo) { e.target.value = ""; seleciona(alvo, true); } }
    });
    var mapa = RAIZ.querySelector("#iv-mapa"), tip = RAIZ.querySelector("#iv-tip");
    RAIZ.querySelectorAll("#iv-mapa path.m").forEach(function (p) { PATHS[p.getAttribute("data-k")] = p; });
    mapa.addEventListener("mousemove", function (ev) {
      var p = ev.target.closest ? ev.target.closest("path.m") : null, m = p && ENT["m:" + p.getAttribute("data-k")];
      if (!m) { tip.style.display = "none"; return; }
      var g = grupoDe(m) || m, r = mapa.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, c = classeVH(val(g, "vhi"));
      tip.innerHTML = "<b>" + esc(g.nome) + "</b>" + (g !== m ? " <span style='opacity:.75'>(" + esc(m.nome) + ")</span>" : "") + "<br>VHI " + n0(val(g, "vhi")) + (c >= 0 ? " · " + VH.n[c].toLowerCase() : "") +
        " · NDVI " + n2(val(g, "ndvi")) + "<br>" + n0(val(g, "est")) + "% da área estressada · Δ 4 sem. " + sn(val(g, "d4"));
      tip.style.display = "block";
      tip.style.left = Math.max(4, Math.min(x + 14, r.width - tip.offsetWidth - 4)) + "px";
      tip.style.top = (y + 16 + tip.offsetHeight > r.height ? y - tip.offsetHeight - 8 : y + 16) + "px";
    });
    mapa.addEventListener("mouseleave", function () { tip.style.display = "none"; });
    mapa.addEventListener("click", function (ev) { var p = ev.target.closest ? ev.target.closest("path.m") : null, m = p && ENT["m:" + p.getAttribute("data-k")]; if (m) seleciona((grupoDe(m) || m).id, false); });
    RAIZ.querySelector("#iv-lista").addEventListener("click", function (e) { var n = e.target.closest("[data-id]"); if (n) seleciona(n.getAttribute("data-id"), true); });
    RAIZ.querySelector("#iv-rank").addEventListener("click", function (e) { var li = e.target.closest("li[data-id]"); if (li) seleciona(li.getAttribute("data-id"), true); });
    RAIZ.querySelector("#iv-rk").addEventListener("click", function (e) { var b = e.target.closest("[data-rk]"); if (!b) return; S.rk = b.getAttribute("data-rk"); guarda(); ranking(); });
    RAIZ.querySelector("#iv-csv").addEventListener("click", baixaCsv);
    RAIZ.querySelector("#iv-det").addEventListener("click", function (e) { if (e.target.closest("#iv-volta")) seleciona("e", false); });
  }
  function seleciona(id, rolar) {
    if (!ENT[id]) return;
    S.sel = id;
    try { var u = new URL(location.href); if (ENT[id].tipo === "m") u.searchParams.set("municipio", ENT[id].nome); else u.searchParams.delete("municipio"); history.replaceState(null, "", u.toString()); } catch (e) { /* ignora */ }
    render();
    if (rolar) RAIZ.querySelector("#iv-det").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function render() {
    var ctl = RAIZ.querySelector("#iv-ctl");
    ctl.innerHTML = controles();
    ctl.querySelectorAll("[data-v]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-v") === S.v); });
    ctl.querySelectorAll("[data-g]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-g") === S.grp); });
    RAIZ.querySelectorAll("#iv-rk [data-rk]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-rk") === S.rk); });
    RAIZ.querySelector("#iv-sub").textContent = "Saúde da vegetação nos 417 municípios por satélite · semana " + D.semanas[S.sem][1] + "/" + D.semanas[S.sem][0] + " (" + rotSem(S.sem) + ")";
    var idade = (Date.now() - dIso(D.datas[NS - 1]).getTime()) / 864e5;
    RAIZ.querySelector("#iv-avisos").innerHTML = idade > 21 ? "<div class='iv-aviso'>Atenção: a semana mais recente disponível é de " + rotSem(NS - 1) + ".</div>" : "";
    RAIZ.querySelector("#iv-tmapa").textContent = VARS[S.v].nome + (S.grp === "t" ? " · por território" : S.grp === "r" ? " · por região" : "");
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
    legenda(); kpis(); lista(); ranking(); detalhe();
    RAIZ.querySelector("#iv-fonte").textContent = "Fonte: " + D.fonte + ". Semanas de " + rotSem(0) + " a " + rotSem(NS - 1) + ". Atualizado em " + new Date(D.gerado_em).toLocaleDateString("pt-BR") + ". Processamento: INEMA.";
  }

  function legenda() {
    var e = escala(S.v), h;
    if (e === VH) h = VH.n.map(function (n, i) { return "<span><i style='background:" + VH.c[i] + "'></i>" + n + " (" + (i === 0 ? "< 10" : i === 5 ? "≥ 60" : VH.thr[i - 1] + "–" + VH.thr[i]) + ")</span>"; }).join("");
    else h = e.c.map(function (c, i) {
      var a = e.thr[i - 1], b = e.thr[i], f = function (x) { return S.v === "ndvi" ? n2(x) : S.v === "est" ? n0(x) + "%" : sn(x); };
      return "<span><i style='background:" + c + "'></i>" + (i === 0 ? "< " + f(b) : i === e.thr.length ? "≥ " + f(a) : f(a) + " a " + f(b)) + "</span>";
    }).join("");
    RAIZ.querySelector("#iv-leg").innerHTML = h + "<span><i style='background:#d9dde2'></i>sem dado</span>";
  }

  function kpi(c, rot, v, sub) { return "<div class='iv-kpi' style='--k:" + c + "'><small>" + rot + "</small><strong>" + v + "</strong><em>" + sub + "</em></div>"; }
  function kpis() {
    var e = ENT.e, vhi = val(e, "vhi"), c = classeVH(vhi), n40 = 0, n20 = 0, nv = 0, pior = null;
    MUNS.forEach(function (m) { var x = val(m, "vhi"); if (!ok(x)) return; nv++; if (x < 40) n40++; if (x < 20) n20++; if (!pior || x < val(pior, "vhi")) pior = m; });
    var d4 = val(e, "d4"), d52 = val(e, "d52");
    RAIZ.querySelector("#iv-kpis").innerHTML =
      kpi(c >= 0 ? VH.c[c] : "#999", "VHI médio da Bahia", n0(vhi), c >= 0 ? VH.n[c] : "–") +
      kpi("#c43c22", "Área do estado estressada", n0(val(e, "est")) + "%", "VHI < 40 · " + n0(val(e, "sev")) + "% com VHI < 20") +
      kpi("#c0392b", "Municípios em estresse", n0(n40) + " <span style='font-size:.6em;color:var(--tx2)'>(" + n0(100 * n40 / Math.max(nv, 1)) + "%)</span>", n0(n20) + " com estresse severo ou extremo · pior: " + (pior ? esc(pior.nome) : "–")) +
      kpi("#2e8b3e", "NDVI médio", n2(val(e, "ndvi")), "verdor médio da vegetação no estado") +
      kpi(d4 < 0 ? "#c44e0c" : "#2e8b3e", "Tendência do VHI", sn(d4) + " <span style='font-size:.6em;color:var(--tx2)'>pts</span>", "em 4 semanas · " + (ok(d52) ? sn(d52) + " pts em 1 ano" : "sem comparação anual"));
  }

  function lista() {
    var itens = S.grp === "t" ? TERR : REGS;
    RAIZ.querySelector("#iv-tgrp").textContent = S.grp === "t" ? "Por território de identidade" : "Por região";
    var div = S.v === "d4" || S.v === "d52", vals = itens.map(function (e) { return { e: e, v: val(e, S.v) }; }).filter(function (x) { return ok(x.v); });
    vals.sort(function (a, b) { return a.v - b.v; });
    var lo = div ? Math.min(-5, Math.min.apply(null, vals.map(function (x) { return x.v; }))) : 0;
    var hi = div ? Math.max(5, Math.max.apply(null, vals.map(function (x) { return x.v; }))) : S.v === "ndvi" ? 1 : 100;
    var rng = hi - lo || 1, h = "";
    vals.forEach(function (x) {
      var a = div ? (Math.min(x.v, 0) - lo) / rng : 0, b = div ? (Math.max(x.v, 0) - lo) / rng : Math.max(0, x.v) / hi;
      h += "<span class='n" + (S.sel === x.e.id ? " on" : "") + "' data-id='" + x.e.id + "' title='" + esc(x.e.nome) + "'>" + esc(x.e.nome) + "</span>" +
        "<span class='bar'><i style='left:" + (a * 100).toFixed(1) + "%;width:" + Math.max(0.8, (b - a) * 100).toFixed(1) + "%;background:" + cor(S.v, x.v) + ";border:1px solid rgba(0,0,0,.12)'></i>" +
        (div ? "<b style='left:" + (-lo / rng * 100).toFixed(1) + "%'></b>" : (S.v === "vhi" || S.v === "vci" || S.v === "tci" ? "<b style='left:40%'></b>" : "")) + "</span><span class='v'>" + fmt(S.v, x.v) + "</span>";
    });
    RAIZ.querySelector("#iv-lista").innerHTML = h || "<span>Sem dados.</span>";
  }

  function ranking() {
    var base = S.grp === "m" ? MUNS : S.grp === "t" ? TERR : REGS;
    var inv = S.v === "est";   // para "% área estressada", pior = maior
    var arr2 = base.map(function (e) { return { e: e, k: val(e, S.v) }; }).filter(function (x) { return ok(x.k); });
    arr2.sort(function (a, b) { var d = a.k - b.k; return (S.rk === "pior") !== inv ? d : -d; });
    RAIZ.querySelector("#iv-trank").textContent = (S.rk === "pior" ? "Mais estressados" : "Mais vigorosos") + (S.grp === "t" ? " (territórios)" : S.grp === "r" ? " (regiões)" : "") + " · " + VARS[S.v].curto;
    RAIZ.querySelectorAll("#iv-rk [data-rk]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-rk") === S.rk); });
    RAIZ.querySelector("#iv-rank").innerHTML = arr2.slice(0, 12).map(function (x, i) { return "<li data-id='" + x.e.id + "'><span>" + (i + 1) + ". " + esc(x.e.nome) + "</span><b>" + fmt(S.v, x.k, true) + "</b></li>"; }).join("");
  }

  // ---------- detalhe ----------
  function card(rot, v, x, sub) {
    var c = cor(v, x), fg = corTexto(c);
    return "<div class='iv-card' style='background:" + c + ";color:" + fg + "'><small>" + rot + "</small><strong>" + fmt(v, x, true) + "</strong><em>" + sub + "</em></div>";
  }
  function detalhe() {
    if (!D) return;
    var e = ENT[S.sel] || ENT.e, j = S.sem, h = "";
    var tipo = e.tipo === "m" ? "Município" + (e.r != null && NOMES_R[e.r] ? " · Região " + NOMES_R[e.r] : "") + (e.t != null && NOMES_T[e.t] ? " · Território " + NOMES_T[e.t] : "") :
      e.tipo === "t" ? "Território de identidade · " + e.mem.length + " municípios" : e.tipo === "r" ? "Região · " + e.mem.length + " municípios" : "Média estadual · 417 municípios";
    h += "<div class='iv-dett'><h3>" + esc(e.nome) + "</h3><span>" + esc(tipo) + " · semana " + D.semanas[j][1] + "/" + D.semanas[j][0] + "</span><span class='acoes'>" +
      (e.tipo === "m" && CHUVA ? "<a href='" + esc(CHUVA) + "?municipio=" + encodeURIComponent(e.nome) + "'>Chuva observada →</a>" : "") +
      (e.tipo !== "e" ? "<button class='iv-lnk' id='iv-volta' type='button'>Ver Bahia</button>" : "") + "</span></div>";
    var c = classeVH(val(e, "vhi"));
    h += "<div class='iv-cards'>" +
      card("VHI · saúde", "vhi", val(e, "vhi"), c >= 0 ? VH.n[c] : "–") +
      card("VCI · umidade", "vci", val(e, "vci"), "condição da vegetação") +
      card("TCI · temperatura", "tci", val(e, "tci"), "condição térmica") +
      card("NDVI", "ndvi", val(e, "ndvi"), "verdor da vegetação") +
      card("Área estressada", "est", val(e, "est"), n0(val(e, "sev")) + "% com VHI < 20") +
      card("Δ VHI 4 semanas", "d4", val(e, "d4"), ok(val(e, "d52")) ? sn(val(e, "d52")) + " pts em 1 ano" : "") + "</div>";
    h += "<div class='iv-graf'><div>" + grafIndices(e) + "</div><div>" + grafNdvi(e) + "</div></div>";
    if (CH) h += "<div style='margin-top:14px'>" + grafChuva(e) + "</div>";
    RAIZ.querySelector("#iv-det").innerHTML = h;
  }
  function eixoX(left, w, top, H) {
    var s = "", ultMes = -1;
    for (var i = 0; i < NS; i++) {
      var d = dIso(D.datas[i]), m = d.getUTCMonth();
      if (m !== ultMes && d.getUTCDate() <= 7) { var x = left + (i + 0.5) / NS * w; s += "<line x1='" + x.toFixed(1) + "' x2='" + x.toFixed(1) + "' y1='" + top + "' y2='" + (top + H) + "' stroke='#eef1f4'/>"; if (m % 3 === 0) s += "<text x='" + x.toFixed(1) + "' y='" + (top + H + 13) + "' font-size='9' text-anchor='middle' fill='#5b6773'>" + MES[m] + (m === 0 ? "/" + String(d.getUTCFullYear()).slice(2) : "") + "</text>"; }
      ultMes = m;
    }
    return s;
  }
  function linha(serie, left, w, top, H, lo, hi) {
    var p = [], seg = [];
    for (var i = 0; i < NS; i++) {
      var v = serie[i];
      if (!ok(v)) { if (p.length) { seg.push(p); p = []; } continue; }
      p.push(((left + (i + 0.5) / NS * w)).toFixed(1) + "," + (top + H - (v - lo) / (hi - lo) * H).toFixed(1));
    }
    if (p.length) seg.push(p);
    return seg;
  }
  function grafIndices(e) {
    var W = 560, H = 170, top = 8, left = 28, bot = 22, w = W - left - 6;
    var s = "<svg viewBox='0 0 " + W + " " + (H + top + bot) + "' role='img' aria-label='VHI, VCI e TCI semanais'>";
    VH.thr.concat([100]).forEach(function (t, i) { var a = i === 0 ? 0 : VH.thr[i - 1]; s += "<rect x='" + left + "' y='" + (top + H - t / 100 * H).toFixed(1) + "' width='" + w + "' height='" + ((t - a) / 100 * H).toFixed(1) + "' fill='" + VH.c[i] + "' opacity='.16'/>"; });
    [0, 20, 40, 60, 80, 100].forEach(function (v) { var y = top + H - v / 100 * H; s += "<text x='" + (left - 4) + "' y='" + (y + 3).toFixed(1) + "' font-size='9' text-anchor='end' fill='#5b6773'>" + v + "</text>"; });
    s += eixoX(left, w, top, H);
    s += "<line x1='" + left + "' x2='" + (left + w) + "' y1='" + (top + H - 0.4 * H).toFixed(1) + "' y2='" + (top + H - 0.4 * H).toFixed(1) + "' stroke='#c0392b' stroke-dasharray='4 3' stroke-width='1'/>";
    [["tci", "#e67e22", 1.3, "3 2"], ["vci", "#2b8cbe", 1.3, "3 2"], ["vhi", "#1b5e20", 2.4, ""]].forEach(function (q) {
      linha(e[q[0]], left, w, top, H, 0, 100).forEach(function (pts) { s += "<polyline points='" + pts.join(" ") + "' fill='none' stroke='" + q[1] + "' stroke-width='" + q[2] + "'" + (q[3] ? " stroke-dasharray='" + q[3] + "'" : "") + "/>"; });
    });
    var xs = left + (S.sem + 0.5) / NS * w;
    s += "<line x1='" + xs.toFixed(1) + "' x2='" + xs.toFixed(1) + "' y1='" + top + "' y2='" + (top + H) + "' stroke='#000' stroke-width='1'/>";
    s += "</svg>";
    return "<h4>VHI, VCI e TCI — últimas " + NS + " semanas</h4>" + s +
      "<div class='iv-glg'><span><i style='border-color:#1b5e20'></i>VHI</span><span><i style='border-color:#2b8cbe;border-top-style:dashed'></i>VCI (umidade)</span><span><i style='border-color:#e67e22;border-top-style:dashed'></i>TCI (temperatura)</span><span><i style='border-color:#c0392b;border-top-style:dashed'></i>limite de estresse (40)</span><span>Linha preta: semana selecionada</span></div>";
  }
  function grafNdvi(e) {   // NDVI por semana do ano: ano atual × ano anterior
    var W = 560, H = 170, top = 8, left = 34, bot = 22, w = W - left - 6, anos = {}, lo = 1, hi = 0;
    for (var i = 0; i < NS; i++) { var a = D.semanas[i][0], s0 = D.semanas[i][1], v = e.ndvi[i]; (anos[a] = anos[a] || {})[s0] = v; if (ok(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
    lo = Math.max(0, Math.floor((lo - 0.03) * 20) / 20); hi = Math.min(1, Math.ceil((hi + 0.03) * 20) / 20); if (hi - lo < 0.15) hi = lo + 0.15;
    var lista2 = Object.keys(anos).map(Number).sort(), cores = ["#c7cdd4", "#8fb98a", "#1b5e20"];
    var s = "<svg viewBox='0 0 " + W + " " + (H + top + bot) + "' role='img' aria-label='NDVI por semana do ano'>";
    for (var t = 0; t <= 4; t++) { var vv = lo + (hi - lo) * t / 4, y = top + H - t / 4 * H; s += "<line x1='" + left + "' x2='" + (left + w) + "' y1='" + y.toFixed(1) + "' y2='" + y.toFixed(1) + "' stroke='#e3e7ec'/><text x='" + (left - 4) + "' y='" + (y + 3).toFixed(1) + "' font-size='9' text-anchor='end' fill='#5b6773'>" + n2(vv) + "</text>"; }
    for (var m = 0; m < 12; m++) { var xm = left + (m * 4.345 + 0.5) / 52 * w; s += "<text x='" + xm.toFixed(1) + "' y='" + (top + H + 13) + "' font-size='9' fill='#5b6773'>" + MES[m] + "</text>"; }
    var leg = "";
    lista2.forEach(function (ano, q) {
      var cc = cores[Math.max(0, cores.length - lista2.length + q)], pts = [];
      for (var sw = 1; sw <= 53; sw++) { var v = anos[ano][sw]; if (ok(v)) pts.push((left + (sw - 0.5) / 52 * w).toFixed(1) + "," + (top + H - (v - lo) / (hi - lo) * H).toFixed(1)); }
      if (pts.length) s += "<polyline points='" + pts.join(" ") + "' fill='none' stroke='" + cc + "' stroke-width='" + (q === lista2.length - 1 ? 2.4 : 1.6) + "'/>";
      leg += "<span><i style='border-color:" + cc + "'></i>" + ano + "</span>";
    });
    s += "</svg>";
    return "<h4>NDVI ao longo do ano — comparação entre anos</h4>" + s + "<div class='iv-glg'>" + leg + "</div>";
  }
  function grafChuva(e) {   // chuva mensal observada (CHIRPS) dos últimos 24 meses × normal, para relacionar com a vegetação
    var idx = {}, nm = CH.mun; nm.forEach(function (n, i) { idx[norm(n)] = i; });
    var mem = e.mem.map(function (i) { return idx[norm(D.mun[i])]; }).filter(function (x) { return x != null; });
    if (!mem.length) return "";
    var p = CH.inicio.split("-"), y0 = +p[0], m0 = +p[1] - 1, N = CH.v[0].length;
    function serie(j) { var s = 0, w = 0; mem.forEach(function (i) { var v = CH.v[i][j], a = CH.area[i] || 1; if (v != null) { s += v * a; w += a; } }); return w ? s / w : NaN; }
    function normal(m) { var s = 0, n = 0; for (var y = 1991; y <= 2020; y++) { var v = serie((y - y0) * 12 + m - m0); if (ok(v)) { s += v; n++; } } return n ? s / n : NaN; }
    var itens = [];
    for (var j = Math.max(0, N - 24); j < N; j++) { var t = y0 * 12 + m0 + j, mm = t % 12; itens.push({ v: serie(j), nor: normal(mm), m: mm, y: Math.floor(t / 12) }); }
    var W = 1140, H = 120, top = 8, left = 34, bot = 26, w = W - left - 6, bw = w / itens.length, max = 10;
    itens.forEach(function (x) { if (ok(x.v)) max = Math.max(max, x.v); if (ok(x.nor)) max = Math.max(max, x.nor); }); max *= 1.1;
    var s = "<svg viewBox='0 0 " + W + " " + (H + top + bot) + "' role='img' aria-label='Chuva mensal observada'>", pts = [];
    for (var tt = 0; tt <= 3; tt++) { var vv = max * tt / 3, yy = top + H - tt / 3 * H; s += "<line x1='" + left + "' x2='" + (left + w) + "' y1='" + yy.toFixed(1) + "' y2='" + yy.toFixed(1) + "' stroke='#e3e7ec'/><text x='" + (left - 4) + "' y='" + (yy + 3).toFixed(1) + "' font-size='9' text-anchor='end' fill='#5b6773'>" + n0(vv) + "</text>"; }
    itens.forEach(function (x, i) {
      var cx = left + i * bw, hh = ok(x.v) ? x.v / max * H : 0, pc = x.nor > 0.5 ? x.v / x.nor : 1;
      s += "<rect x='" + (cx + bw * 0.15).toFixed(1) + "' y='" + (top + H - hh).toFixed(1) + "' width='" + (bw * 0.7).toFixed(1) + "' height='" + hh.toFixed(1) + "' fill='" + (pc < 0.75 ? "#f39c34" : pc > 1.25 ? "#3a8fc4" : "#9ccbe6") + "'><title>" + MES[x.m] + "/" + x.y + ": " + n0(x.v) + " mm (normal " + n0(x.nor) + " mm)</title></rect>";
      if (ok(x.nor)) pts.push((cx + bw / 2).toFixed(1) + "," + (top + H - x.nor / max * H).toFixed(1));
      s += "<text x='" + (cx + bw / 2).toFixed(1) + "' y='" + (top + H + 12) + "' font-size='9' text-anchor='middle' fill='#5b6773'>" + MES[x.m] + "</text>";
      if (x.m === 0 || i === 0) s += "<text x='" + (cx + bw / 2).toFixed(1) + "' y='" + (top + H + 23) + "' font-size='9' text-anchor='middle' font-weight='600' fill='#1d2733'>" + x.y + "</text>";
    });
    s += "<polyline points='" + pts.join(" ") + "' fill='none' stroke='#1d2733' stroke-dasharray='4 3' stroke-width='1.5'/></svg>";
    return "<h4 style='margin:0 0 4px;font-size:.92em'>Chuva mensal observada (CHIRPS) — últimos 24 meses</h4>" + s +
      "<div class='iv-glg'><span style='display:inline-flex;align-items:center'><b style='display:inline-block;width:12px;height:8px;background:#f39c34;margin-right:4px'></b>abaixo de 75% da normal</span><span style='display:inline-flex;align-items:center'><b style='display:inline-block;width:12px;height:8px;background:#9ccbe6;margin-right:4px'></b>perto da normal</span><span style='display:inline-flex;align-items:center'><b style='display:inline-block;width:12px;height:8px;background:#3a8fc4;margin-right:4px'></b>acima de 125%</span><span><i style='border-color:#1d2733;border-top-style:dashed'></i>normal 1991–2020</span></div>";
  }

  function baixaCsv() {
    var j = S.sem, l = [["municipio", "regiao", "territorio", "semana", "vhi", "vci", "tci", "ndvi", "pct_area_vhi_menor_40", "pct_area_vhi_menor_20", "delta_vhi_4sem", "delta_vhi_1ano"].join(";")];
    MUNS.forEach(function (m) {
      l.push([m.nome, NOMES_R[m.r] || "", NOMES_T[m.t] || "", D.semanas[j][1] + "/" + D.semanas[j][0], n0(val(m, "vhi")), n0(val(m, "vci")), n0(val(m, "tci")), ok(val(m, "ndvi")) ? val(m, "ndvi").toFixed(3).replace(".", ",") : "", n0(val(m, "est")), n0(val(m, "sev")), ok(val(m, "d4")) ? Math.round(val(m, "d4")) : "", ok(val(m, "d52")) ? Math.round(val(m, "d52")) : ""].join(";"));
    });
    var blob = new Blob(["﻿" + l.join("\r\n")], { type: "text/csv;charset=utf-8" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "vegetacao_bahia_semana_" + D.semanas[j][0] + "-" + D.semanas[j][1] + ".csv";
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
