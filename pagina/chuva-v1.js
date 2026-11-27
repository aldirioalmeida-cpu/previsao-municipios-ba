/* Monitoramento da Chuva na Bahia — INEMA
   Dados: chuva/mensal.json e chuva/diario.json (CHIRPS v3.0, UCSB, média ponderada por área em cada município — robô no GitHub),
   extremos/municipios_ba.geojson (malha IBGE) e focos/municipios.json (regiões e territórios de identidade). Tudo via jsDelivr.
   Anomalias, percentis e SPI são calculados aqui, no navegador, para qualquer período escolhido (normal 1991–2020). */
(function () {
  "use strict";
  var RAIZ = document.getElementById("inema-chuva");
  if (!RAIZ || RAIZ.getAttribute("data-ok")) return;
  RAIZ.setAttribute("data-ok", "1");
  var BASE = "https://cdn.jsdelivr.net/gh/aldirioalmeida-cpu/previsao-municipios-ba@main/";
  var PREV_MUN = RAIZ.getAttribute("data-previsao") || "";
  var AGRO = RAIZ.getAttribute("data-agro") || "";

  var CSS = [
    "#inema-chuva{--az:#0b4f8a;--az2:#e8f0f8;--tx:#1d2733;--tx2:#5b6773;--ln:#d7dee6;--bg:#fff;--cz:#f5f7f9;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:var(--tx);font-size:15px;line-height:1.4;max-width:1280px;margin:0 auto 28px}",
    "#inema-chuva *{box-sizing:border-box}",
    "#inema-chuva .ic-topo{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:flex-end;justify-content:space-between;margin:0 0 14px}",
    "#inema-chuva h2.ic-tit{margin:0;font-size:1.55em;color:var(--az);line-height:1.15}",
    "#inema-chuva .ic-sub{margin:4px 0 0;color:var(--tx2);font-size:.92em}",
    "#inema-chuva .ic-modos{display:inline-flex;background:var(--cz);border:1px solid var(--ln);border-radius:999px;padding:3px}",
    "#inema-chuva .ic-modos button{font:inherit;font-size:.92em;border:0;background:transparent;color:var(--tx);padding:7px 16px;border-radius:999px;cursor:pointer;font-weight:600}",
    "#inema-chuva .ic-modos button.on{background:var(--az);color:#fff;box-shadow:0 1px 4px rgba(11,79,138,.3)}",
    "#inema-chuva .ic-aviso{background:#fff4e0;border:1px solid #f0c27a;border-radius:10px;padding:8px 12px;margin:0 0 12px;font-size:.9em}",
    "#inema-chuva .ic-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:0 0 14px}",
    "#inema-chuva .ic-kpi{background:var(--bg);border:1px solid var(--ln);border-radius:12px;padding:10px 12px;position:relative;overflow:hidden}",
    "#inema-chuva .ic-kpi:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--k,#0b4f8a)}",
    "#inema-chuva .ic-kpi small{display:block;color:var(--tx2);font-size:.76em;text-transform:uppercase;letter-spacing:.03em}",
    "#inema-chuva .ic-kpi strong{display:block;font-size:1.5em;line-height:1.15;margin:2px 0}",
    "#inema-chuva .ic-kpi em{font-style:normal;font-size:.82em;color:var(--tx2)}",
    "#inema-chuva .ic-ctl{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;background:var(--cz);border:1px solid var(--ln);border-radius:12px;padding:10px 12px;margin:0 0 12px}",
    "#inema-chuva .ic-grp{display:flex;flex-wrap:wrap;gap:4px;align-items:center}",
    "#inema-chuva .ic-grp>span{font-size:.78em;color:var(--tx2);margin-right:4px;text-transform:uppercase;letter-spacing:.03em}",
    "#inema-chuva button.ic-b{font:inherit;font-size:.86em;border:1px solid var(--ln);background:#fff;color:var(--tx);border-radius:999px;padding:5px 11px;cursor:pointer;line-height:1.2}",
    "#inema-chuva button.ic-b:hover{border-color:var(--az)}",
    "#inema-chuva button.ic-b.on{background:var(--az);border-color:var(--az);color:#fff}",
    "#inema-chuva select.ic-sel,#inema-chuva input.ic-busca{font:inherit;font-size:.88em;border:1px solid var(--ln);border-radius:999px;padding:5px 10px;background:#fff;color:var(--tx)}",
    "#inema-chuva input.ic-busca{min-width:210px}",
    "#inema-chuva .ic-per{font-weight:600;color:var(--az);font-size:.95em}",
    "#inema-chuva .ic-corpo{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:14px}",
    "#inema-chuva .ic-cx{background:var(--bg);border:1px solid var(--ln);border-radius:12px;padding:12px}",
    "#inema-chuva .ic-cx h3{margin:0 0 8px;font-size:1.02em;color:var(--az)}",
    "#inema-chuva .ic-cxh{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between;margin:0 0 8px}",
    "#inema-chuva .ic-cxh h3{margin:0}",
    "#inema-chuva .ic-mapa{position:relative}",
    "#inema-chuva .ic-mapa svg{width:100%;height:auto;display:block;max-height:640px}",
    "#inema-chuva .ic-mapa path.m{stroke:#fff;stroke-width:.35;cursor:pointer}",
    "#inema-chuva .ic-mapa path.m:hover{stroke:#111;stroke-width:1.2}",
    "#inema-chuva .ic-mapa path.m.sel{stroke:#000;stroke-width:1.6}",
    "#inema-chuva .ic-mapa path.m.grp{stroke:#000;stroke-width:.9}",
    "#inema-chuva .ic-tip{position:absolute;pointer-events:none;background:rgba(20,28,38,.93);color:#fff;border-radius:8px;padding:6px 9px;font-size:.84em;line-height:1.35;white-space:nowrap;display:none;z-index:3}",
    "#inema-chuva .ic-leg{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:.78em;color:var(--tx2);margin-top:6px}",
    "#inema-chuva .ic-leg i{display:inline-block;width:14px;height:11px;border-radius:2px;margin-right:4px;vertical-align:-1px;border:1px solid rgba(0,0,0,.12)}",
    "#inema-chuva .ic-lado{display:flex;flex-direction:column;gap:14px}",
    "#inema-chuva .ic-lista{display:grid;grid-template-columns:auto 1fr auto;gap:4px 8px;align-items:center;font-size:.86em;max-height:330px;overflow:auto;padding-right:4px}",
    "#inema-chuva .ic-lista .n{cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:190px}",
    "#inema-chuva .ic-lista .n:hover,#inema-chuva .ic-lista .n.on{color:var(--az);font-weight:700}",
    "#inema-chuva .ic-lista .bar{height:13px;background:var(--cz);border-radius:4px;position:relative;overflow:hidden}",
    "#inema-chuva .ic-lista .bar i{position:absolute;top:0;bottom:0;display:block}",
    "#inema-chuva .ic-lista .bar b{position:absolute;top:-2px;bottom:-2px;width:1px;background:#8a96a3}",
    "#inema-chuva .ic-lista .v{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}",
    "#inema-chuva ol.ic-rank{margin:0;padding:0;list-style:none;font-size:.86em;columns:2;column-gap:14px}",
    "#inema-chuva ol.ic-rank li{display:flex;justify-content:space-between;gap:6px;padding:3px 0;border-bottom:1px dotted var(--ln);cursor:pointer;break-inside:avoid}",
    "#inema-chuva ol.ic-rank li:hover{color:var(--az)}",
    "#inema-chuva ol.ic-rank b{font-variant-numeric:tabular-nums}",
    "#inema-chuva .ic-det{margin-top:14px}",
    "#inema-chuva .ic-dett{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;margin:0 0 10px}",
    "#inema-chuva .ic-dett h3{margin:0;font-size:1.25em;color:var(--tx)}",
    "#inema-chuva .ic-dett span{color:var(--tx2);font-size:.9em}",
    "#inema-chuva .ic-dett .acoes{margin-left:auto;display:flex;gap:10px;font-size:.88em}",
    "#inema-chuva .ic-dett a,#inema-chuva .ic-lnk{color:var(--az);cursor:pointer;text-decoration:underline;background:none;border:0;font:inherit;padding:0}",
    "#inema-chuva .ic-spis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin:0 0 12px}",
    "#inema-chuva .ic-spi{border-radius:10px;padding:8px 10px;border:1px solid rgba(0,0,0,.08)}",
    "#inema-chuva .ic-spi small{display:block;font-size:.74em;text-transform:uppercase;letter-spacing:.03em;opacity:.85}",
    "#inema-chuva .ic-spi strong{display:block;font-size:1.35em;line-height:1.15}",
    "#inema-chuva .ic-spi em{font-style:normal;font-size:.78em}",
    "#inema-chuva .ic-res{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:0 0 12px}",
    "#inema-chuva .ic-res div{background:var(--cz);border-radius:10px;padding:8px 10px}",
    "#inema-chuva .ic-res small{display:block;color:var(--tx2);font-size:.74em;text-transform:uppercase;letter-spacing:.03em}",
    "#inema-chuva .ic-res b{font-size:1.15em;font-variant-numeric:tabular-nums}",
    "#inema-chuva .ic-graf{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}",
    "#inema-chuva .ic-graf svg{width:100%;height:auto;display:block}",
    "#inema-chuva .ic-graf h4{margin:0 0 4px;font-size:.92em;color:var(--tx)}",
    "#inema-chuva .ic-graf .ic-grpp{margin:0 0 4px}",
    "#inema-chuva .ic-glg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:.76em;color:var(--tx2);margin-top:2px}",
    "#inema-chuva .ic-glg i{display:inline-block;width:12px;height:8px;border-radius:2px;margin-right:4px;vertical-align:0}",
    "#inema-chuva details.ic-ajuda{margin-top:14px;background:var(--cz);border:1px solid var(--ln);border-radius:12px;padding:8px 14px;font-size:.92em}",
    "#inema-chuva details.ic-ajuda summary{cursor:pointer;font-weight:600;color:var(--az)}",
    "#inema-chuva details.ic-ajuda li{margin:3px 0}",
    "#inema-chuva table.ic-cls{border-collapse:collapse;font-size:.86em;margin:6px 0}",
    "#inema-chuva table.ic-cls td{padding:2px 8px;border-bottom:1px solid var(--ln)}",
    "#inema-chuva .ic-links{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}",
    "#inema-chuva .ic-links a{display:block;border:1px solid var(--ln);border-radius:12px;padding:10px 12px;text-decoration:none;color:var(--tx);background:#fff}",
    "#inema-chuva .ic-links a:hover{border-color:var(--az)}",
    "#inema-chuva .ic-links b{display:block;color:var(--az);font-size:.95em}",
    "#inema-chuva .ic-links span{font-size:.82em;color:var(--tx2)}",
    "#inema-chuva .ic-fonte{font-size:.8em;color:var(--tx2);margin-top:10px}",
    "#inema-chuva .ic-carr{padding:40px;text-align:center;color:var(--tx2)}",
    "@media (max-width:1000px){#inema-chuva .ic-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}#inema-chuva .ic-corpo,#inema-chuva .ic-graf{grid-template-columns:1fr}#inema-chuva .ic-links{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-chuva .ic-spis{grid-template-columns:repeat(3,minmax(0,1fr))}#inema-chuva .ic-res{grid-template-columns:repeat(3,minmax(0,1fr))}}",
    "@media (max-width:640px){#inema-chuva{font-size:14px}#inema-chuva .ic-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-chuva .ic-kpi strong{font-size:1.25em}#inema-chuva ol.ic-rank{columns:1}#inema-chuva input.ic-busca{min-width:0;width:100%}#inema-chuva .ic-grp{width:100%}#inema-chuva .ic-links{grid-template-columns:1fr}#inema-chuva .ic-res{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-chuva .ic-dett .acoes{margin-left:0}}"
  ].join("\n");
  var st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);
  RAIZ.innerHTML = "<div class='ic-carr'>Carregando o monitoramento da chuva…</div>";

  // ---------- utilidades ----------
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ok(v) { return v != null && isFinite(v); }
  function n1(v) { return !ok(v) ? "–" : (Math.round(v * 10) / 10).toLocaleString("pt-BR", { maximumFractionDigits: 1 }); }
  function n0(v) { return !ok(v) ? "–" : Math.round(v).toLocaleString("pt-BR"); }
  function sn(v, d) { if (!ok(v)) return "–"; var x = d ? (Math.round(v * 10) / 10) : Math.round(v); return (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toLocaleString("pt-BR", { maximumFractionDigits: d ? 1 : 0 }); }
  function f2(v) { return !ok(v) ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(Math.round(v * 100) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function json(u) { return fetch(u, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status + " em " + u.split("/").pop()); return r.json(); }); }
  var MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  var MESL = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  function dBR(d) { return ("0" + d.getUTCDate()).slice(-2) + "/" + ("0" + (d.getUTCMonth() + 1)).slice(-2) + "/" + d.getUTCFullYear(); }
  function dCurta(d) { return ("0" + d.getUTCDate()).slice(-2) + "/" + ("0" + (d.getUTCMonth() + 1)).slice(-2); }
  function iso2d(s) { var p = s.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function diasMes(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }

  // ---------- estatística: SPI (gama de 2 parâmetros, McKee et al. 1993) ----------
  function gln(x) {
    var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    var y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t);
    var s = 1.000000000190015; for (var j = 0; j < 6; j++) s += c[j] / ++y;
    return -t + Math.log(2.5066282746310005 * s / x);
  }
  function gammp(a, x) {   // função gama incompleta regularizada P(a, x)
    if (x <= 0) return 0;
    var g = gln(a), n, del, sum, ap;
    if (x < a + 1) {
      ap = a; sum = del = 1 / a;
      for (n = 0; n < 300; n++) { ap += 1; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-12) break; }
      return sum * Math.exp(-x + a * Math.log(x) - g);
    }
    var b = x + 1 - a, c = 1e300, d = 1 / b, h = d, an;
    for (n = 1; n < 300; n++) {
      an = -n * (n - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-12) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - g) * h;
  }
  function ninv(p) {   // inversa da normal padrão (Acklam)
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00],
      b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01],
      c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00],
      d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00], q, r;
    if (p < 0.02425) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - 0.02425) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  function spiGama(ref, x) {
    if (!ok(x) || ref.length < 20) return NaN;
    var pos = ref.filter(function (v) { return v > 0.05; }), q = (ref.length - pos.length) / ref.length;
    if (pos.length < 8) return NaN;
    var m = 0, lm = 0; pos.forEach(function (v) { m += v; lm += Math.log(v); }); m /= pos.length; lm /= pos.length;
    var A = Math.log(m) - lm; if (A <= 1e-6) A = 1e-6;
    var al = (1 + Math.sqrt(1 + 4 * A / 3)) / (4 * A), be = m / al;
    var H = q + (1 - q) * (x > 0.05 ? gammp(al, x / be) : 0);
    if (x <= 0.05 && q > 0) H = q / 2;   // sem chuva: centro da massa de probabilidade em zero
    H = Math.min(Math.max(H, 0.0013), 0.9987);   // limita o SPI a ±3
    return ninv(H);
  }

  // ---------- classes e escalas ----------
  var SPI_C = { thr: [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2], c: ["#7a2e05", "#c44e0c", "#f39c34", "#fdd99b", "#eeeeee", "#c4e6bd", "#6dbf73", "#3a8fc4", "#174f8f"],
    n: ["Extremamente seco", "Severamente seco", "Moderadamente seco", "Levemente seco", "Normal", "Levemente úmido", "Moderadamente úmido", "Muito úmido", "Extremamente úmido"] };
  var PCT_C = { thr: [25, 50, 75, 90, 110, 125, 150, 200], c: ["#7a2e05", "#c44e0c", "#f39c34", "#fdd99b", "#eeeeee", "#c4e6bd", "#6dbf73", "#3a8fc4", "#174f8f"] };
  var PCTL_C = { thr: [5, 10, 20, 33, 67, 80, 90, 95], c: ["#7a2e05", "#c44e0c", "#f39c34", "#fdd99b", "#eeeeee", "#c4e6bd", "#6dbf73", "#3a8fc4", "#174f8f"] };
  var SEQ_C = ["#f7f4ec", "#d9eecf", "#a5dbb6", "#6cc2bd", "#3e9fc3", "#2475b3", "#1d4e9a", "#20307a", "#2a1a5e"];
  var SECO_C = { thr: [3, 7, 15, 30, 60, 90, 120, 180], c: ["#edf5fb", "#f7f2d8", "#f6e2a4", "#f4c56b", "#ef9b3d", "#dc6a22", "#b54313", "#86290c", "#57190a"] };
  function bin(thr, v) { var i = 0; while (i < thr.length && v >= thr[i]) i++; return i; }
  function bonito(x) { if (x <= 0) return 0; var e = Math.pow(10, Math.floor(Math.log10(x))), f = x / e; return (f < 1.5 ? 1 : f < 2.25 ? 2 : f < 3.5 ? 2.5 : f < 7.5 ? 5 : 10) * e; }
  function escalaMm(k) { return [5, 15, 30, 50, 75, 110, 160, 240].map(function (b) { return bonito(b * Math.pow(k, 0.85)); }); }
  function escalaAnom(k) { var f = Math.pow(k, 0.7); return [-100, -50, -25, -10, 10, 25, 50, 100].map(function (b) { return (b < 0 ? -1 : 1) * bonito(Math.abs(b) * f); }); }
  function classeSpi(v) { return ok(v) ? bin(SPI_C.thr, v) : -1; }
  function corTexto(hex) { var r = parseInt(hex.substr(1, 2), 16), g = parseInt(hex.substr(3, 2), 16), b = parseInt(hex.substr(5, 2), 16); return (r * 299 + g * 587 + b * 114) / 1000 < 140 ? "#fff" : "#1d2733"; }

  var VARS_M = {
    spi: { nome: "SPI (índice padronizado de precipitação)", curto: "SPI" },
    pct: { nome: "Chuva em % da normal", curto: "% da normal" },
    anom: { nome: "Anomalia de chuva (mm)", curto: "Anomalia (mm)" },
    pctl: { nome: "Posição na série histórica (percentil)", curto: "Percentil" },
    total: { nome: "Chuva acumulada (mm)", curto: "Acumulado" },
    normal: { nome: "Normal climatológica 1991–2020 (mm)", curto: "Normal" }
  };
  var VARS_R = {
    total: { nome: "Chuva acumulada (mm)", curto: "Acumulado" },
    pct: { nome: "Chuva em % da normal estimada", curto: "% da normal" },
    seco: { nome: "Dias seguidos sem chuva (< 1 mm) até o último dia", curto: "Dias sem chuva" },
    max: { nome: "Maior chuva em um dia (mm)", curto: "Maior chuva diária" }
  };
  var ESCALAS = [1, 2, 3, 4, 6, 9, 12, 18, 24, 36, 48];
  var JANELAS = [7, 15, 30, 60, 90, 180];

  // ---------- estado ----------
  var S = { modo: "m", k: 3, fim: null, v: "spi", grp: "m", sel: "e", rv: "total", rj: 30, rk: "seco", span: 10 };
  try {
    var g0 = JSON.parse(localStorage.getItem("inemaChuva1") || "{}");
    ["modo", "v", "grp", "rv", "rk"].forEach(function (c) { if (typeof g0[c] === "string") S[c] = g0[c]; });
    ["k", "rj", "span"].forEach(function (c) { if (typeof g0[c] === "number") S[c] = g0[c]; });
  } catch (e) { /* sem armazenamento */ }
  var K_SALVO = ESCALAS.indexOf(S.k) >= 0 ? S.k : 3;   // período livre não fica guardado: ao voltar, abre na última escala padrão
  function guarda() {
    if (ESCALAS.indexOf(S.k) >= 0) K_SALVO = S.k;
    try { localStorage.setItem("inemaChuva1", JSON.stringify({ modo: S.modo, k: K_SALVO, v: S.v, grp: S.grp, rv: S.rv, rj: S.rj, rk: S.rk, span: S.span })); } catch (e) { /* ignora */ }
  }
  var qs = new URLSearchParams(location.search);
  if (+qs.get("escala") > 0) S.k = +qs.get("escala");
  if (qs.get("modo") === "recente") S.modo = "r";
  var QMUN = qs.get("municipio"), QFIM = qs.get("fim"), QINI = qs.get("inicio");
  if (!(S.k >= 1 && S.k % 1 === 0)) S.k = 3;
  if (!VARS_M[S.v]) S.v = "spi";
  if (!VARS_R[S.rv]) S.rv = "total";
  if (JANELAS.indexOf(S.rj) < 0) S.rj = 30;

  // ---------- dados ----------
  var M, D, GEO, Y0, M0, N, ENT = {}, MUNS = [], TERR = [], REGS = [], PATHS = {}, NOMES_R = [], NOMES_T = [], L = -1, DIAS = [];
  Promise.all([
    json(BASE + "chuva/mensal.json"),
    json(BASE + "chuva/diario.json").catch(function () { return null; }),
    json(BASE + "extremos/municipios_ba.geojson"),
    json(BASE + "focos/municipios.json").catch(function () { return null; })
  ]).then(function (r) { prepara(r[0], r[1], r[2], r[3]); monta(); }).catch(function (e) {
    RAIZ.innerHTML = "<div class='ic-aviso'>Não foi possível carregar os dados do painel agora (" + esc(e.message || e) + "). Tente novamente em alguns minutos.</div>";
  });

  function idxYM(y, m) { return (y - Y0) * 12 + (m - M0); }
  function ymDe(i) { var t = Y0 * 12 + M0 + i; return { y: Math.floor(t / 12), m: t % 12 }; }
  function rotMes(i) { var a = ymDe(i); return MES[a.m] + "/" + a.y; }
  function rotPer(fim, k) {
    if (k === 1) return MESL[ymDe(fim).m] + " de " + ymDe(fim).y;
    var a = ymDe(fim - k + 1), b = ymDe(fim);
    return a.y === b.y ? MES[a.m] + "–" + MES[b.m] + "/" + b.y : MES[a.m] + "/" + a.y + " a " + MES[b.m] + "/" + b.y;
  }

  function novaEnt(id, tipo, nome, mem) { var e = { id: id, tipo: tipo, nome: nome, mem: mem, c: {} }; ENT[id] = e; return e; }
  function agrega(mem, pega, n) {   // média ponderada pela área dos municípios do grupo
    var out = new Float64Array(n);
    for (var j = 0; j < n; j++) {
      var s = 0, w = 0;
      for (var q = 0; q < mem.length; q++) { var v = pega(mem[q], j); if (ok(v)) { var a = M.area[mem[q]] || 1; s += v * a; w += a; } }
      out[j] = w > 0 ? s / w : NaN;
    }
    return out;
  }
  function prefixo(e) {
    var cs = new Float64Array(N + 1), cn = new Int32Array(N + 1);
    for (var j = 0; j < N; j++) { var v = e.s[j]; cs[j + 1] = cs[j] + (ok(v) ? v : 0); cn[j + 1] = cn[j] + (ok(v) ? 0 : 1); }
    e.cs = cs; e.cn = cn;
  }

  function prepara(men, dia, geo, focos) {
    M = men; D = dia; GEO = geo;
    var p = men.inicio.split("-"); Y0 = +p[0]; M0 = +p[1] - 1; N = men.v[0].length;
    var meta = {};
    if (focos) {
      NOMES_R = focos.regioes || []; NOMES_T = focos.territorios || [];
      focos.municipios.forEach(function (m) { meta[norm(m.n)] = m; });
    }
    var idxDia = {};
    if (dia) dia.mun.forEach(function (n, i) { idxDia[n] = i; });
    var ND = dia ? dia.tipo.length : 0;
    if (dia) {
      for (var j = ND - 1; j >= 0; j--) if (dia.tipo[j] !== "-") { L = j; break; }
      var d0 = iso2d(dia.inicio);
      for (var q = 0; q < ND; q++) DIAS.push(new Date(d0.getTime() + q * 864e5));
    }
    men.mun.forEach(function (nome, i) {
      var k = norm(nome), mt = meta[k] || {};
      var e = novaEnt("m:" + k, "m", nome, [i]);
      e.k = k; e.r = mt.r; e.t = mt.t; e.i = i;
      e.s = new Float64Array(N); for (var j = 0; j < N; j++) { var v = men.v[i][j]; e.s[j] = v == null ? NaN : v; }
      e.p = (men.parciais || []).map(function (pp) { var v = pp.v[i]; return v == null ? NaN : v; });
      if (dia && idxDia[nome] != null) { var di = idxDia[nome]; e.d = new Float64Array(ND); for (var jj = 0; jj < ND; jj++) { var x = dia.v[di][jj]; e.d[jj] = x == null ? NaN : x; } }
      prefixo(e); MUNS.push(e);
    });
    function grupo(id, tipo, nome, mem) {
      var e = novaEnt(id, tipo, nome, mem.map(function (m) { return m.i; }));
      e.s = agrega(e.mem, function (i, j) { return MUNS[i].s[j]; }, N);
      e.p = (men.parciais || []).map(function (pp, q) { return agrega(e.mem, function (i) { return MUNS[i].p[q]; }, 1)[0]; });
      if (dia) e.d = agrega(e.mem, function (i, j) { return MUNS[i].d ? MUNS[i].d[j] : NaN; }, ND);
      e.area = 0; e.mem.forEach(function (i) { e.area += M.area[i] || 0; });
      prefixo(e); return e;
    }
    NOMES_R.forEach(function (n, r) { var mem = MUNS.filter(function (m) { return m.r === r; }); if (mem.length) REGS.push(grupo("r:" + r, "r", n, mem)); });
    NOMES_T.forEach(function (n, t) { var mem = MUNS.filter(function (m) { return m.t === t; }); if (mem.length) TERR.push(grupo("t:" + t, "t", n, mem)); });
    grupo("e", "e", "Bahia", MUNS);
    S.fim = N - 1;
    if (QFIM && /^\d{4}-\d{2}$/.test(QFIM)) { var f = idxYM(+QFIM.slice(0, 4), +QFIM.slice(5) - 1); if (f >= 0 && f < N) S.fim = f; }
    if (QINI && /^\d{4}-\d{2}$/.test(QINI)) { var ii = idxYM(+QINI.slice(0, 4), +QINI.slice(5) - 1); if (ii >= 0 && ii <= S.fim) S.k = S.fim - ii + 1; }
    S.k = Math.min(S.k, S.fim + 1);
    if (QMUN && ENT["m:" + norm(QMUN)]) S.sel = "m:" + norm(QMUN);
  }

  // ---------- cálculos ----------
  function soma(e, a, b) { if (a < 0 || b >= N || a > b) return NaN; return e.cn[b + 1] - e.cn[a] > 0 ? NaN : e.cs[b + 1] - e.cs[a]; }
  function calcEm(e, fim, k) {
    var key = fim + ":" + k;
    if (e.c[key]) return e.c[key];
    var T = soma(e, fim - k + 1, fim), yE = ymDe(fim).y, ref = [], hist = [];
    for (var y = 1991; y <= 2020; y++) { var j = fim - 12 * (yE - y), x = soma(e, j - k + 1, j); if (ok(x)) ref.push(x); }
    for (var jj = fim - 12; jj - k + 1 >= 0; jj -= 12) { var h = soma(e, jj - k + 1, jj); if (ok(h)) hist.push(h); }
    var nor = ref.length >= 20 ? ref.reduce(function (a, b) { return a + b; }, 0) / ref.length : NaN;
    var r = { T: T, normal: nor, anom: T - nor, pct: nor > 0.5 ? 100 * T / nor : NaN, spi: spiGama(ref, T), n: hist.length + 1 };
    if (ok(T)) {
      var menor = 0, igual = 0; hist.forEach(function (h) { if (h < T - 1e-9) menor++; else if (Math.abs(h - T) <= 1e-9) igual++; });
      r.pos = menor + 1; r.posU = r.n - menor - igual; r.pctl = 100 * (menor + 0.5 * igual + 0.5) / r.n;
    }
    e.c[key] = r; return r;
  }
  function calc(e) { return calcEm(e, S.fim, S.k); }
  function normalMes(e, m) {
    var key = "nm" + m; if (e.c[key] != null) return e.c[key];
    var s = 0, n = 0; for (var y = 1991; y <= 2020; y++) { var v = e.s[idxYM(y, m)]; if (ok(v)) { s += v; n++; } }
    e.c[key] = n >= 20 ? s / n : NaN; return e.c[key];
  }
  function calcRec(e, rj) {
    var key = "r" + rj; if (e.c[key]) return e.c[key];
    var r = { total: NaN, normal: NaN, pct: NaN, seco: NaN, max: NaN, prelim: false, falta: 0 };
    if (!e.d || L < 0) return (e.c[key] = r);
    var t = 0, nor = 0, mx = -1, falta = 0;
    for (var j = Math.max(0, L - rj + 1); j <= L; j++) {
      var v = e.d[j]; if (ok(v)) { t += v; if (v > mx) mx = v; } else falta++;
      if (D.tipo[j] === "p") r.prelim = true;
      var dd = DIAS[j], m = dd.getUTCMonth(); nor += normalMes(e, m) / diasMes(dd.getUTCFullYear(), m);
    }
    var sec = 0; for (var q = L; q >= 0; q--) { var x = e.d[q]; if (ok(x) && x < 1) sec++; else break; }
    r.total = falta > rj / 3 ? NaN : t; r.normal = nor; r.pct = nor > 0.5 && ok(r.total) ? 100 * r.total / nor : NaN; r.seco = sec; r.seco_todo = sec > L; r.max = mx >= 0 ? mx : NaN; r.falta = falta;
    e.c[key] = r; return r;
  }
  function valor(e) {
    if (S.modo === "m") { var r = calc(e); return S.v === "total" ? r.T : S.v === "normal" ? r.normal : r[S.v]; }
    return calcRec(e, S.rj)[S.rv];
  }
  function escalaAtual() {
    if (S.modo === "m") {
      if (S.v === "spi") return { thr: SPI_C.thr, c: SPI_C.c, fmt: function (x) { return f2(x).replace(",00", ""); } };
      if (S.v === "pct") return { thr: PCT_C.thr, c: PCT_C.c, un: "%" };
      if (S.v === "pctl") return { thr: PCTL_C.thr, c: PCTL_C.c, un: "" };
      if (S.v === "anom") return { thr: escalaAnom(S.k), c: PCT_C.c, un: " mm", sin: true };
      return { thr: escalaMm(S.k), c: SEQ_C, un: " mm" };
    }
    if (S.rv === "pct") return { thr: PCT_C.thr, c: PCT_C.c, un: "%" };
    if (S.rv === "seco") return { thr: SECO_C.thr, c: SECO_C.c, un: " dias" };
    if (S.rv === "max") return { thr: [5, 10, 20, 30, 50, 75, 100, 150], c: SEQ_C, un: " mm" };
    return { thr: escalaMm(S.rj / 30), c: SEQ_C, un: " mm" };
  }
  function cor(v) { if (!ok(v)) return "#d9dde2"; var e = escalaAtual(); return e.c[bin(e.thr, v)]; }
  function fmtV(v, comUn) {
    if (!ok(v)) return "–";
    if (S.modo === "m") {
      if (S.v === "spi") return f2(v);
      if (S.v === "pct") return n0(v) + "%";
      if (S.v === "pctl") return n0(v);
      if (S.v === "anom") return sn(v) + (comUn ? " mm" : "");
      return n0(v) + (comUn ? " mm" : "");
    }
    if (S.rv === "pct") return n0(v) + "%";
    if (S.rv === "seco") return n0(v) + (comUn ? " dias" : "");
    return n1(v) + (comUn ? " mm" : "");
  }
  function grupoDe(m) { return S.grp === "t" ? ENT["t:" + m.t] : S.grp === "r" ? ENT["r:" + m.r] : m; }

  // ---------- montagem ----------
  function monta() {
    var h = "<div class='ic-topo'><div><h2 class='ic-tit'>Monitoramento da Chuva na Bahia</h2><p class='ic-sub' id='ic-sub'></p></div>" +
      "<div class='ic-modos' role='tablist'><button data-modo='m'>Anomalias e SPI</button><button data-modo='r'>Chuva recente</button></div></div>";
    h += "<div id='ic-avisos'></div><div class='ic-kpis' id='ic-kpis'></div>";
    h += "<div class='ic-ctl' id='ic-ctl'></div>";
    h += "<div class='ic-corpo'><div class='ic-cx'><div class='ic-cxh'><h3 id='ic-tmapa'></h3><button class='ic-lnk' id='ic-csv' type='button'>Baixar tabela (CSV)</button></div>" +
      "<div class='ic-mapa' id='ic-mapa'>" + svgMapa() + "<div class='ic-tip' id='ic-tip'></div></div><div class='ic-leg' id='ic-leg'></div></div>" +
      "<div class='ic-lado'><div class='ic-cx'><h3 id='ic-tgrp'></h3><div class='ic-lista' id='ic-lista'></div></div>" +
      "<div class='ic-cx'><div class='ic-cxh'><h3 id='ic-trank'></h3><span class='ic-grp' id='ic-rk'><button class='ic-b' data-rk='seco'>Mais secos</button><button class='ic-b' data-rk='umido'>Mais chuvosos</button></span></div><ol class='ic-rank' id='ic-rank'></ol></div></div></div>";
    h += "<div class='ic-cx ic-det' id='ic-det'></div>";
    h += "<details class='ic-ajuda'><summary>Como ler este painel e metodologia</summary><ul>" +
      "<li><b>Dados</b>: CHIRPS v3.0 (Climate Hazards Center, Universidade da Califórnia em Santa Bárbara), estimativa de chuva que combina satélite (infravermelho) e estações, em grade de 0,05° (≈ 5,5 km), desde 1981. O valor de cada município é a média dos pixels ponderada pela área do município dentro de cada pixel; regiões, territórios e o estado são médias ponderadas pela área dos municípios.</li>" +
      "<li><b>Normal</b>: média de 1991–2020 do mesmo período (mesmos meses do ano). <b>Anomalia</b> = acumulado − normal; <b>% da normal</b> = acumulado ÷ normal.</li>" +
      "<li><b>SPI</b> (Índice Padronizado de Precipitação, McKee et al., 1993): ajusta uma distribuição gama ao acumulado do mesmo período em 1991–2020 e converte a chuva observada em desvios padrão. Escalas curtas (1–3 meses) refletem a seca meteorológica e agrícola; 6–12 meses, a hidrológica (rios e reservatórios); 24 meses ou mais, a de longo prazo.</li>" +
      "<li><b>Percentil</b>: posição do acumulado entre todos os anos desde 1981 (0 = o mais seco, 100 = o mais chuvoso).</li>" +
      "<li><b>Chuva recente</b>: CHIRPS diário (versão “sat”, que distribui a chuva de cada pêntada pelos dias conforme o satélite IMERG). Os últimos dias são <b>preliminares</b> e podem mudar quando sair a versão final (≈ 3ª semana do mês seguinte). A normal das janelas diárias é estimada a partir das normais mensais. Por causa do método de distribuição diária, a contagem de dias sem chuva é aproximada.</li>" +
      "<li>Escala do SPI usada no mapa:<table class='ic-cls'>" + SPI_C.n.map(function (n, i) { var a = SPI_C.thr[i - 1], b = SPI_C.thr[i]; return "<tr><td><i style='display:inline-block;width:14px;height:11px;border-radius:2px;background:" + SPI_C.c[i] + ";border:1px solid rgba(0,0,0,.12)'></i></td><td>" + n + "</td><td>" + (i === 0 ? "≤ −2,0" : i === 8 ? "≥ +2,0" : f2(a).replace(",00", ",0") + " a " + f2(b).replace(",00", ",0")) + "</td></tr>"; }).join("") + "</table></li>" +
      "<li>Clique em um município (ou território/região, conforme o agrupamento) no mapa, nas listas ou use a busca para ver os detalhes. Os links do painel podem ser compartilhados: o endereço guarda o município, o período e a escala.</li></ul></details>";
    h += "<div class='ic-links'>" +
      (AGRO ? "<a href='" + esc(AGRO) + "'><b>Agrometeorologia</b><span>Previsão de chuva, ET0 e balanço hídrico</span></a>" : "") +
      (PREV_MUN ? "<a href='" + esc(PREV_MUN) + "'><b>Previsão por município</b><span>Próximos dias, por período</span></a>" : "") +
      "<a href='https://monitordesecas.ana.gov.br/' target='_blank' rel='noopener'><b>Monitor de Secas</b><span>Mapa mensal da seca no Brasil (ANA)</span></a>" +
      "<a href='https://www.chc.ucsb.edu/data/chirps3' target='_blank' rel='noopener'><b>CHIRPS v3</b><span>Sobre os dados (Climate Hazards Center)</span></a></div>";
    h += "<p class='ic-fonte' id='ic-fonte'></p>";
    RAIZ.innerHTML = h;
    liga();
    render();
  }

  function controles() {
    var h = "";
    if (S.modo === "m") {
      var ops = "", opsI = "", ini = S.fim - S.k + 1;
      for (var i = N - 1; i >= 0; i--) ops += "<option value='" + i + "'" + (i === S.fim ? " selected" : "") + ">" + MESL[ymDe(i).m] + " de " + ymDe(i).y + "</option>";
      for (var i2 = S.fim; i2 >= 0; i2--) opsI += "<option value='" + i2 + "'" + (i2 === ini ? " selected" : "") + ">" + MESL[ymDe(i2).m] + " de " + ymDe(i2).y + "</option>";
      h += "<div class='ic-grp'><span>De</span><select class='ic-sel' id='ic-ini' aria-label='Mês inicial do período'>" + opsI + "</select>" +
        "<span style='margin-left:6px'>até</span><select class='ic-sel' id='ic-fim' aria-label='Mês final do período'>" + ops + "</select></div>";
      h += "<div class='ic-grp' id='ic-gk'><span>Período</span>" + ESCALAS.map(function (k) { return "<button class='ic-b' data-k='" + k + "'>" + k + (k === 1 ? " mês" : " meses") + "</button>"; }).join("") +
        (ESCALAS.indexOf(S.k) < 0 ? "<span class='ic-b on' style='cursor:default'>livre: " + S.k + " meses</span>" : "") + "</div>";
      h += "<div class='ic-grp' id='ic-gv'><span>Mapa</span>" + Object.keys(VARS_M).map(function (k) { return "<button class='ic-b' data-v='" + k + "'>" + VARS_M[k].curto + "</button>"; }).join("") + "</div>";
    } else {
      h += "<div class='ic-grp' id='ic-gj'><span>Últimos</span>" + JANELAS.map(function (j) { return "<button class='ic-b' data-j='" + j + "'>" + j + " dias</button>"; }).join("") + "</div>";
      h += "<div class='ic-grp' id='ic-gv'><span>Mapa</span>" + Object.keys(VARS_R).map(function (k) { return "<button class='ic-b' data-rv='" + k + "'>" + VARS_R[k].curto + "</button>"; }).join("") + "</div>";
    }
    h += "<div class='ic-grp' id='ic-gg'><span>Agrupar</span><button class='ic-b' data-g='m'>Município</button><button class='ic-b' data-g='t'>Território</button><button class='ic-b' data-g='r'>Região</button></div>";
    h += "<div class='ic-grp' style='margin-left:auto'><input class='ic-busca' id='ic-busca' list='ic-dl' placeholder='Buscar município, território…' aria-label='Buscar'><datalist id='ic-dl'>" +
      MUNS.concat(TERR, REGS).map(function (e) { return "<option value='" + esc(e.nome) + "'>" + (e.tipo === "t" ? "Território" : e.tipo === "r" ? "Região" : "") + "</option>"; }).join("") + "</datalist></div>";
    return h;
  }

  function liga() {
    RAIZ.querySelector(".ic-modos").addEventListener("click", function (e) { var b = e.target.closest("[data-modo]"); if (!b) return; S.modo = b.getAttribute("data-modo"); guarda(); render(); });
    var ctl = RAIZ.querySelector("#ic-ctl");
    ctl.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.hasAttribute("data-k")) S.k = Math.min(+b.getAttribute("data-k"), S.fim + 1);
      else if (b.hasAttribute("data-v")) S.v = b.getAttribute("data-v");
      else if (b.hasAttribute("data-j")) S.rj = +b.getAttribute("data-j");
      else if (b.hasAttribute("data-rv")) S.rv = b.getAttribute("data-rv");
      else if (b.hasAttribute("data-g")) S.grp = b.getAttribute("data-g");
      else return;
      guarda(); render();
    });
    ctl.addEventListener("change", function (e) {
      if (e.target.id === "ic-fim") { S.fim = +e.target.value; S.k = Math.min(S.k, S.fim + 1); render(); }
      if (e.target.id === "ic-ini") { S.k = S.fim - (+e.target.value) + 1; guarda(); render(); }
      if (e.target.id === "ic-busca") {
        var n = norm(e.target.value), alvo = null;
        Object.keys(ENT).forEach(function (id) { if (!alvo && norm(ENT[id].nome) === n) alvo = id; });
        if (alvo) { e.target.value = ""; seleciona(alvo, true); }
      }
    });
    var mapa = RAIZ.querySelector("#ic-mapa"), tip = RAIZ.querySelector("#ic-tip");
    RAIZ.querySelectorAll("#ic-mapa path.m").forEach(function (p) { PATHS[p.getAttribute("data-k")] = p; });
    mapa.addEventListener("mousemove", function (ev) {
      var p = ev.target.closest ? ev.target.closest("path.m") : null, m = p && ENT["m:" + p.getAttribute("data-k")];
      if (!m) { tip.style.display = "none"; return; }
      var g = grupoDe(m) || m, r = mapa.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
      tip.innerHTML = "<b>" + esc(g.nome) + "</b>" + (g !== m ? " <span style='opacity:.75'>(" + esc(m.nome) + ")</span>" : (m.r != null && NOMES_R[m.r] ? " · " + esc(NOMES_R[m.r]) : "")) + "<br>" + esc(textoTip(g));
      tip.style.display = "block";
      tip.style.left = Math.max(4, Math.min(x + 14, r.width - tip.offsetWidth - 4)) + "px";
      tip.style.top = (y + 16 + tip.offsetHeight > r.height ? y - tip.offsetHeight - 8 : y + 16) + "px";
    });
    mapa.addEventListener("mouseleave", function () { tip.style.display = "none"; });
    mapa.addEventListener("click", function (ev) { var p = ev.target.closest ? ev.target.closest("path.m") : null, m = p && ENT["m:" + p.getAttribute("data-k")]; if (m) seleciona((grupoDe(m) || m).id, false); });
    RAIZ.querySelector("#ic-lista").addEventListener("click", function (e) { var n = e.target.closest("[data-id]"); if (n) seleciona(n.getAttribute("data-id"), true); });
    RAIZ.querySelector("#ic-rank").addEventListener("click", function (e) { var li = e.target.closest("li[data-id]"); if (li) seleciona(li.getAttribute("data-id"), true); });
    RAIZ.querySelector("#ic-rk").addEventListener("click", function (e) { var b = e.target.closest("[data-rk]"); if (!b) return; S.rk = b.getAttribute("data-rk"); guarda(); ranking(); });
    RAIZ.querySelector("#ic-csv").addEventListener("click", baixaCsv);
    RAIZ.querySelector("#ic-det").addEventListener("click", function (e) {
      var b = e.target.closest("[data-span]"); if (b) { S.span = +b.getAttribute("data-span"); guarda(); detalhe(); return; }
      var k = e.target.closest("[data-ks]"); if (k) { S.k = +k.getAttribute("data-ks"); S.modo = "m"; guarda(); render(); return; }
      if (e.target.closest("#ic-volta")) { seleciona("e", false); return; }
      if (e.target.closest("#ic-xls")) baixaXls();
    });
  }
  function seleciona(id, rolar) {
    if (!ENT[id]) return;
    S.sel = id;
    try { var u = new URL(location.href); if (ENT[id].tipo === "m") u.searchParams.set("municipio", ENT[id].nome); else u.searchParams.delete("municipio"); history.replaceState(null, "", u.toString()); } catch (e) { /* ignora */ }
    render();
    if (rolar) RAIZ.querySelector("#ic-det").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function textoTip(e) {
    if (S.modo === "m") {
      var r = calc(e);
      return n0(r.T) + " mm · " + n0(r.pct) + "% da normal · SPI " + f2(r.spi) + (ok(r.spi) ? " (" + SPI_C.n[classeSpi(r.spi)].toLowerCase() + ")" : "");
    }
    var q = calcRec(e, S.rj);
    return n1(q.total) + " mm em " + S.rj + " dias · " + n0(q.pct) + "% da normal · " + (q.seco_todo ? "≥ " : "") + n0(q.seco) + " dias sem chuva";
  }

  // ---------- renderização ----------
  function render() {
    RAIZ.querySelectorAll(".ic-modos [data-modo]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-modo") === S.modo); });
    var ctl = RAIZ.querySelector("#ic-ctl");
    ctl.innerHTML = controles();
    ctl.querySelectorAll("[data-k]").forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-k") === S.k); });
    ctl.querySelectorAll("[data-v]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-v") === S.v); });
    ctl.querySelectorAll("[data-j]").forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-j") === S.rj); });
    ctl.querySelectorAll("[data-rv]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-rv") === S.rv); });
    ctl.querySelectorAll("[data-g]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-g") === S.grp); });
    RAIZ.querySelectorAll("#ic-rk [data-rk]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-rk") === S.rk); });
    var ultF = rotMes(N - 1), par = (M.parciais || [])[0];
    RAIZ.querySelector("#ic-sub").textContent = S.modo === "m"
      ? "Chuva observada nos 417 municípios · " + rotPer(S.fim, S.k) + " (" + S.k + (S.k === 1 ? " mês" : " meses") + ") comparado à normal 1991–2020"
      : "Chuva observada nos 417 municípios · últimos " + S.rj + " dias até " + (L >= 0 ? dBR(DIAS[L]) : "–");
    var av = "";
    if (S.modo === "r" && L >= 0 && D.tipo.slice(Math.max(0, L - S.rj + 1), L + 1).indexOf("p") >= 0) av += "<div class='ic-aviso'>Os dias a partir de " + dBR(DIAS[D.tipo.indexOf("p")]) + " são <b>preliminares</b> (CHIRPS preliminar) e podem ser revistos quando sair a versão final.</div>";
    if (S.modo === "m" && par) av += "";
    RAIZ.querySelector("#ic-avisos").innerHTML = av;
    var tit = S.modo === "m" ? VARS_M[S.v].nome + " — " + rotPer(S.fim, S.k) : VARS_R[S.rv].nome + " — últimos " + S.rj + " dias";
    RAIZ.querySelector("#ic-tmapa").textContent = tit + (S.grp === "t" ? " · por território" : S.grp === "r" ? " · por região" : "");
    var selE = ENT[S.sel], selM = {};
    if (selE) selE.mem.forEach(function (i) { selM[MUNS[i].k] = 1; });
    MUNS.forEach(function (m) {
      var p = PATHS[m.k]; if (!p) return;
      var g = grupoDe(m) || m;
      p.setAttribute("fill", cor(valor(g)));
      var noSel = selE && selE.tipo !== "e" && selM[m.k];
      p.classList.toggle("sel", !!(noSel && selE.tipo === "m"));
      p.classList.toggle("grp", !!(noSel && selE.tipo !== "m"));
    });
    if (selE && selE.tipo === "m" && PATHS[selE.k]) PATHS[selE.k].parentNode.appendChild(PATHS[selE.k]);
    else if (selE && selE.tipo !== "e") selE.mem.forEach(function (i) { var p = PATHS[MUNS[i].k]; if (p) p.parentNode.appendChild(p); });
    legenda(); kpis(); lista(); ranking(); detalhe();
    RAIZ.querySelector("#ic-fonte").textContent = "Fonte: " + (M.fonte || "CHIRPS v3.0") + ". Série mensal final até " + ultF +
      (par ? "; " + MESL[+par.mes.slice(5) - 1] + " de " + par.mes.slice(0, 4) + " parcial até " + dBR(iso2d(par.ate)) + (par.preliminar ? " (preliminar)" : "") : "") +
      ". Atualizado em " + new Date(M.gerado_em).toLocaleDateString("pt-BR") + ". Processamento: INEMA.";
  }

  function legenda() {
    var e = escalaAtual(), h = "";
    if (S.modo === "m" && S.v === "spi") h = SPI_C.n.map(function (n, i) { return "<span><i style='background:" + SPI_C.c[i] + "'></i>" + n + "</span>"; }).join("");
    else h = e.c.map(function (c, i) {
      var a = e.thr[i - 1], b = e.thr[i], fa = e.sin ? sn(a) : n0(a), fb = e.sin ? sn(b) : n0(b);
      var r = i === 0 ? "< " + fb : i === e.thr.length ? "≥ " + fa : fa + " a " + fb;
      return "<span><i style='background:" + c + "'></i>" + r + (e.un || "") + "</span>";
    }).join("");
    RAIZ.querySelector("#ic-leg").innerHTML = h + "<span><i style='background:#d9dde2'></i>sem dado</span>";
  }

  function kpi(cor0, rot, val, sub) { return "<div class='ic-kpi' style='--k:" + cor0 + "'><small>" + rot + "</small><strong>" + val + "</strong><em>" + sub + "</em></div>"; }
  function kpis() {
    var e = ENT.e, h = "";
    if (S.modo === "m") {
      var r = calc(e), secos = 0, umidos = 0, val = 0, pior = null;
      MUNS.forEach(function (m) { var q = calc(m); if (!ok(q.spi)) return; val++; if (q.spi <= -1) secos++; if (q.spi >= 1) umidos++; if (!pior || q.spi < calc(pior).spi) pior = m; });
      var cs = classeSpi(r.spi);
      h += kpi("#1d91c0", "Chuva na Bahia", n0(r.T) + " mm", "média estadual · " + rotPer(S.fim, S.k));
      h += kpi(r.anom < 0 ? "#c44e0c" : "#2b8cbe", "Em relação à normal", n0(r.pct) + "%", sn(r.anom) + " mm (normal " + n0(r.normal) + " mm)");
      h += kpi(cs >= 0 ? SPI_C.c[cs] : "#999", "SPI estadual (" + S.k + (S.k === 1 ? " mês" : " meses") + ")", f2(r.spi), cs >= 0 ? SPI_C.n[cs] : "–");
      h += kpi("#c44e0c", "Municípios em seca", n0(secos) + " <span style='font-size:.6em;color:var(--tx2)'>(" + n0(100 * secos / Math.max(val, 1)) + "%)</span>", "SPI ≤ −1 · mais seco: " + (pior ? esc(pior.nome) + " (" + f2(calc(pior).spi) + ")" : "–"));
      h += kpi("#2b8cbe", "Acima do normal", n0(umidos) + " <span style='font-size:.6em;color:var(--tx2)'>(" + n0(100 * umidos / Math.max(val, 1)) + "%)</span>", "municípios com SPI ≥ +1");
    } else {
      var q = calcRec(e, S.rj), s30 = 0, mx = null, top = null;
      MUNS.forEach(function (m) { var x = calcRec(m, S.rj); if (x.seco >= 30) s30++; if (ok(x.max) && (!mx || x.max > calcRec(mx, S.rj).max)) mx = m; if (ok(x.total) && (!top || x.total > calcRec(top, S.rj).total)) top = m; });
      h += kpi("#1d91c0", "Chuva na Bahia", n1(q.total) + " mm", "média estadual · últimos " + S.rj + " dias");
      h += kpi(q.pct < 100 ? "#c44e0c" : "#2b8cbe", "Em relação à normal", n0(q.pct) + "%", "normal estimada: " + n0(q.normal) + " mm");
      h += kpi("#b54313", "Sem chuva há 30+ dias", n0(s30), "municípios com 30 dias ou mais seguidos < 1 mm");
      h += kpi("#225ea8", "Maior acumulado", top ? n1(calcRec(top, S.rj).total) + " mm" : "–", top ? esc(top.nome) : "");
      h += kpi("#20307a", "Maior chuva em um dia", mx ? n1(calcRec(mx, S.rj).max) + " mm" : "–", mx ? esc(mx.nome) : "");
    }
    RAIZ.querySelector("#ic-kpis").innerHTML = h;
  }

  function lista() {
    var itens = S.grp === "t" ? TERR : REGS, tit = S.grp === "t" ? "Por território de identidade" : "Por região";
    RAIZ.querySelector("#ic-tgrp").textContent = tit;
    var vals = itens.map(function (e) { return { e: e, v: valor(e) }; }).filter(function (x) { return ok(x.v); });
    var div = (S.modo === "m" && (S.v === "spi" || S.v === "anom" || S.v === "pct" || S.v === "pctl")) || (S.modo === "r" && S.rv === "pct");
    var centro = S.modo === "m" ? (S.v === "pct" ? 100 : S.v === "pctl" ? 50 : 0) : 100;
    vals.sort(function (a, b) { return a.v - b.v; });
    var lo = Math.min.apply(null, vals.map(function (x) { return x.v; }).concat([div ? centro : 0])), hi = Math.max.apply(null, vals.map(function (x) { return x.v; }).concat([div ? centro : 0]));
    if (S.modo === "m" && S.v === "spi") { lo = Math.min(lo, -2); hi = Math.max(hi, 2); }
    var rng = hi - lo || 1, h = "";
    vals.forEach(function (x) {
      var a = div ? (Math.min(x.v, centro) - lo) / rng : 0, b = div ? (Math.max(x.v, centro) - lo) / rng : (x.v - Math.min(lo, 0)) / (hi - Math.min(lo, 0) || 1);
      h += "<span class='n" + (S.sel === x.e.id ? " on" : "") + "' data-id='" + x.e.id + "' title='" + esc(x.e.nome) + "'>" + esc(x.e.nome) + "</span>" +
        "<span class='bar'><i style='left:" + (a * 100).toFixed(1) + "%;width:" + Math.max(0.8, (b - a) * 100).toFixed(1) + "%;background:" + cor(x.v) + ";border:1px solid rgba(0,0,0,.12)'></i>" +
        (div ? "<b style='left:" + ((centro - lo) / rng * 100).toFixed(1) + "%'></b>" : "") + "</span><span class='v'>" + fmtV(x.v, false) + "</span>";
    });
    RAIZ.querySelector("#ic-lista").innerHTML = h || "<span>Sem dados.</span>";
  }

  function chaveRank(e) {
    if (S.modo === "m") { var r = calc(e); return S.v === "total" || S.v === "normal" ? (S.v === "total" ? r.T : r.normal) : S.v === "anom" ? r.anom : S.v === "pct" ? r.pct : S.v === "pctl" ? r.pctl : r.spi; }
    var q = calcRec(e, S.rj); return S.rv === "seco" ? -q.seco : S.rv === "max" ? q.max : S.rv === "pct" ? q.pct : q.total;
  }
  function ranking() {
    var base = S.grp === "m" ? MUNS : S.grp === "t" ? TERR : REGS;
    var arr = base.map(function (e) { return { e: e, k: chaveRank(e) }; }).filter(function (x) { return ok(x.k); });
    arr.sort(function (a, b) { return S.rk === "seco" ? a.k - b.k : b.k - a.k; });
    var tit = (S.rk === "seco" ? "Mais secos" : "Mais chuvosos") + (S.grp === "t" ? " (territórios)" : S.grp === "r" ? " (regiões)" : "") + " · " + (S.modo === "m" ? VARS_M[S.v].curto : VARS_R[S.rv].curto);
    RAIZ.querySelector("#ic-trank").textContent = tit;
    RAIZ.querySelectorAll("#ic-rk [data-rk]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-rk") === S.rk); });
    RAIZ.querySelector("#ic-rank").innerHTML = arr.slice(0, 12).map(function (x, i) {
      return "<li data-id='" + x.e.id + "'><span>" + (i + 1) + ". " + esc(x.e.nome) + "</span><b>" + fmtV(valor(x.e), true) + "</b></li>";
    }).join("");
  }

  // ---------- detalhe ----------
  function detalhe() {
    var e = ENT[S.sel] || ENT.e, h = "";
    var tipo = e.tipo === "m" ? "Município" + (e.r != null && NOMES_R[e.r] ? " · Região " + NOMES_R[e.r] : "") + (e.t != null && NOMES_T[e.t] ? " · Território " + NOMES_T[e.t] : "") :
      e.tipo === "t" ? "Território de identidade · " + e.mem.length + " municípios" : e.tipo === "r" ? "Região · " + e.mem.length + " municípios" : "Média estadual · 417 municípios";
    h += "<div class='ic-dett'><h3>" + esc(e.nome) + "</h3><span>" + esc(tipo) + "</span><span class='acoes'>" +
      (e.tipo === "m" && PREV_MUN ? "<a href='" + esc(PREV_MUN) + "?municipio=" + encodeURIComponent(e.nome) + "'>Previsão do tempo →</a>" : "") +
      (e.tipo !== "e" ? "<button class='ic-lnk' id='ic-volta' type='button'>Ver Bahia</button>" : "") + "</span></div>";
    // SPI em várias escalas no mês escolhido
    var fim = S.modo === "m" ? S.fim : N - 1;
    h += "<div class='ic-spis'>" + [1, 3, 6, 12, 24, 48].map(function (k) {
      var r = calcEm(e, fim, k), c = classeSpi(r.spi), bg = c >= 0 ? SPI_C.c[c] : "#eef0f2", fg = corTexto(bg);
      return "<div class='ic-spi' data-ks='" + k + "' style='background:" + bg + ";color:" + fg + ";cursor:pointer' title='Ver no mapa'><small>SPI-" + k + " · " + rotPer(fim, k) + "</small><strong>" + f2(r.spi) + "</strong><em>" + (c >= 0 ? SPI_C.n[c] : "–") + " · " + n0(r.pct) + "% da normal</em></div>";
    }).join("") + "</div>";
    if (S.modo === "m") {
      var r = calc(e);
      h += "<div class='ic-res'>" +
        "<div><small>Acumulado · " + rotPer(S.fim, S.k) + "</small><b>" + n0(r.T) + " mm</b></div>" +
        "<div><small>Normal 1991–2020</small><b>" + n0(r.normal) + " mm</b></div>" +
        "<div><small>Anomalia</small><b>" + sn(r.anom) + " mm (" + n0(r.pct) + "%)</b></div>" +
        "<div><small>Posição desde 1981</small><b>" + (ok(r.pos) ? (r.pos <= r.posU ? r.pos + "º mais seco" : r.posU + "º mais chuvoso") : "–") + "</b> <span style='font-size:.8em;color:var(--tx2)'>de " + r.n + " anos</span></div>" +
        "<div><small>Percentil</small><b>" + n0(r.pctl) + "</b></div></div>";
    } else {
      var q = calcRec(e, S.rj);
      h += "<div class='ic-res'>" +
        "<div><small>Últimos " + S.rj + " dias</small><b>" + n1(q.total) + " mm</b></div>" +
        "<div><small>Normal estimada</small><b>" + n0(q.normal) + " mm</b></div>" +
        "<div><small>% da normal</small><b>" + n0(q.pct) + "%</b></div>" +
        "<div><small>Dias seguidos sem chuva</small><b>" + (q.seco_todo ? "≥ " : "") + n0(q.seco) + "</b></div>" +
        "<div><small>Maior chuva em um dia</small><b>" + n1(q.max) + " mm</b></div></div>";
    }
    h += "<div class='ic-graf'><div>" + grafMeses(e) + "</div><div>" + (S.modo === "m" ? grafSpi(e) : grafDias(e)) + "</div></div>";
    RAIZ.querySelector("#ic-det").innerHTML = h;
  }

  function eixoY(max, H, top, left, w) {
    var passo = bonito(max / 4) || 1, h = "";
    for (var v = 0; v <= max + 1e-9; v += passo) { var y = top + H - v / max * H; h += "<line x1='" + left + "' x2='" + (left + w) + "' y1='" + y.toFixed(1) + "' y2='" + y.toFixed(1) + "' stroke='#e3e7ec'/><text x='" + (left - 4) + "' y='" + (y + 3).toFixed(1) + "' font-size='9' text-anchor='end' fill='#5b6773'>" + n0(v) + "</text>"; }
    return h;
  }
  // Meses do gráfico: o período selecionado (no mínimo 24 meses até o mês final) + meses parciais quando o período chega ao último mês
  function mesesGraf(e) {
    var fim = S.modo === "m" ? S.fim : N - 1, ini = S.modo === "m" ? fim - S.k + 1 : fim + 1;
    var j0 = Math.max(0, Math.min(fim - 23, ini)), itens = [];
    for (var j = j0; j <= fim; j++) itens.push({ j: j, rot: MES[ymDe(j).m], ano: ymDe(j).y, v: e.s[j], nor: normalMes(e, ymDe(j).m), par: false, m: ymDe(j).m, noPer: j >= ini });
    if (fim === N - 1) (M.parciais || []).forEach(function (p, q) { var mm = +p.mes.slice(5) - 1; itens.push({ rot: MES[mm], ano: +p.mes.slice(0, 4), v: e.p[q], nor: normalMes(e, mm), par: !p.completo, ate: p.ate, m: mm, noPer: false }); });
    return itens;
  }
  function grafMeses(e) {
    var itens = mesesGraf(e), par = itens.filter(function (x) { return x.par; });
    var W = 560, H = 170, top = 10, left = 32, bot = 30, w = W - left - 6, bw = w / itens.length, letras = itens.length <= 40;
    var max = 10; itens.forEach(function (x) { if (ok(x.v)) max = Math.max(max, x.v); if (ok(x.nor)) max = Math.max(max, x.nor); }); max = bonito(max * 1.08) || max;
    var s = "<svg viewBox='0 0 " + W + " " + (H + top + bot) + "' role='img' aria-label='Chuva mensal e normal'>" + eixoY(max, H, top, left, w);
    var iP = -1, nP = 0; itens.forEach(function (x, i) { if (x.noPer) { if (iP < 0) iP = i; nP++; } });
    var mostraFaixa = S.modo === "m" && nP > 0 && nP < itens.length;
    if (mostraFaixa) s += "<rect x='" + (left + iP * bw).toFixed(1) + "' y='" + top + "' width='" + (nP * bw).toFixed(1) + "' height='" + H + "' fill='#e8f0f8'/>";
    var pts = [];
    itens.forEach(function (x, i) {
      var cx = left + i * bw, hh = ok(x.v) ? x.v / max * H : 0, pc = ok(x.v) && x.nor > 0.5 ? 100 * x.v / x.nor : NaN;
      var c = ok(pc) ? PCT_C.c[bin(PCT_C.thr, pc)] : "#cfd6de";
      s += "<rect x='" + (cx + bw * 0.12).toFixed(1) + "' y='" + (top + H - hh).toFixed(1) + "' width='" + (bw * 0.76).toFixed(1) + "' height='" + hh.toFixed(1) + "' fill='" + c + "' stroke='" + (x.par ? "#0b4f8a" : "rgba(0,0,0,.25)") + "'" + (x.par ? " stroke-dasharray='3 2'" : "") + "><title>" + MESL[x.m] + " de " + x.ano + ": " + n0(x.v) + " mm" + (x.par ? " (parcial até " + dBR(iso2d(x.ate)) + ")" : "") + " · normal " + n0(x.nor) + " mm</title></rect>";
      if (ok(x.nor)) pts.push((cx + bw / 2).toFixed(1) + "," + (top + H - x.nor / max * H).toFixed(1));
      if ((x.m === 0 && (itens.length <= 120 || x.ano % 5 === 0)) || i === 0) s += "<text x='" + (cx + bw / 2).toFixed(1) + "' y='" + (top + H + 24) + "' font-size='9' text-anchor='middle' fill='#1d2733' font-weight='600'>" + x.ano + "</text>";
      if (letras) s += "<text x='" + (cx + bw / 2).toFixed(1) + "' y='" + (top + H + 12) + "' font-size='8.5' text-anchor='middle' fill='#5b6773'>" + x.rot.charAt(0).toUpperCase() + "</text>";
    });
    s += "<polyline points='" + pts.join(" ") + "' fill='none' stroke='#1d2733' stroke-width='1.6' stroke-dasharray='4 3'/>";
    s += "</svg>";
    var a = itens[0], b = itens[itens.length - 1];
    return "<div class='ic-cxh' style='margin:0 0 4px'><h4 style='margin:0'>Chuva mensal — " + MES[a.m] + "/" + a.ano + " a " + MES[b.m] + "/" + b.ano + "</h4>" +
      (S.modo === "m" ? "<button class='ic-lnk' id='ic-xls' type='button' title='Observado mensal, normal 1991–2020 e anomalia do período selecionado'>Baixar em Excel</button>" : "") + "</div>" + s +
      "<div class='ic-glg'><span><i style='background:#f39c34'></i>abaixo da normal</span><span><i style='background:#eeeeee;border:1px solid #ccc'></i>normal</span><span><i style='background:#6dbf73'></i>acima</span><span><i style='background:none;border-top:2px dashed #1d2733;height:0;width:16px'></i>normal 1991–2020</span>" +
      (mostraFaixa ? "<span><i style='background:#e8f0f8;border:1px solid #c9d8e8'></i>período selecionado</span>" : "") +
      (par.length ? "<span><i style='background:#fff;border:1px dashed #0b4f8a'></i>mês parcial</span>" : "") + "</div>";
  }
  function grafSpi(e) {
    var anos = S.span, ini = Math.max(S.k - 1, N - 12 * anos), itens = [];
    for (var j = ini; j < N; j++) itens.push({ j: j, v: calcEm(e, j, S.k).spi });
    var W = 560, H = 170, top = 10, left = 32, bot = 30, w = W - left - 6, bw = w / itens.length, lim = 3;
    var s = "<svg viewBox='0 0 " + W + " " + (H + top + bot) + "' role='img' aria-label='Série histórica do SPI'>";
    [-2, -1, 0, 1, 2].forEach(function (v) { var y = top + H / 2 - v / lim * H / 2; s += "<line x1='" + left + "' x2='" + (left + w) + "' y1='" + y.toFixed(1) + "' y2='" + y.toFixed(1) + "' stroke='" + (v === 0 ? "#9aa5b1" : "#e3e7ec") + "'/><text x='" + (left - 4) + "' y='" + (y + 3).toFixed(1) + "' font-size='9' text-anchor='end' fill='#5b6773'>" + (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + "</text>"; });
    itens.forEach(function (x, i) {
      if (!ok(x.v)) return;
      var v = Math.max(-lim, Math.min(lim, x.v)), y0 = top + H / 2, y1 = y0 - v / lim * H / 2, cx = left + i * bw;
      s += "<rect x='" + cx.toFixed(2) + "' y='" + Math.min(y0, y1).toFixed(1) + "' width='" + Math.max(bw * 0.9, 0.6).toFixed(2) + "' height='" + Math.max(Math.abs(y1 - y0), 0.5).toFixed(1) + "' fill='" + SPI_C.c[classeSpi(x.v)] + "'" + (x.j === S.fim ? " stroke='#000' stroke-width='1'" : "") + "><title>" + rotPer(x.j, S.k) + ": SPI " + f2(x.v) + "</title></rect>";
    });
    var passoAno = anos <= 10 ? 1 : anos <= 20 ? 2 : 5;
    itens.forEach(function (x, i) { var a = ymDe(x.j); if (a.m === 0 && a.y % passoAno === 0) s += "<text x='" + (left + i * bw).toFixed(1) + "' y='" + (top + H + 14) + "' font-size='9' fill='#5b6773'>" + a.y + "</text>"; });
    s += "</svg>";
    var botoes = [5, 10, 20, 50].map(function (a) { return "<button class='ic-b" + (S.span === a ? " on" : "") + "' data-span='" + a + "' type='button'>" + (a === 50 ? "desde 1981" : a + " anos") + "</button>"; }).join("");
    return "<div class='ic-cxh' style='margin:0 0 4px'><h4 style='margin:0'>SPI-" + S.k + " — histórico</h4><span class='ic-grp'>" + botoes + "</span></div>" + s +
      "<div class='ic-glg'><span><i style='background:" + SPI_C.c[1] + "'></i>seco</span><span><i style='background:" + SPI_C.c[7] + "'></i>úmido</span><span>Contorno preto: período selecionado</span></div>";
  }
  function grafDias(e) {
    if (!e.d || L < 0) return "<h4>Chuva diária</h4><p>Sem dados diários.</p>";
    var n = Math.max(S.rj, 30), ini = Math.max(0, L - n + 1), itens = [];
    var ac = 0, an = 0;
    for (var j = ini; j <= L; j++) { var v = e.d[j], dd = DIAS[j]; ac += ok(v) ? v : 0; an += normalMes(e, dd.getUTCMonth()) / diasMes(dd.getUTCFullYear(), dd.getUTCMonth()); itens.push({ j: j, v: v, ac: ac, an: an, p: D.tipo[j] === "p" }); }
    var W = 560, H = 170, top = 10, left = 32, right = 38, bot = 30, w = W - left - right, bw = w / itens.length;
    var maxD = 5; itens.forEach(function (x) { if (ok(x.v)) maxD = Math.max(maxD, x.v); }); maxD = bonito(maxD * 1.1);
    var maxA = Math.max(ac, an, 1); maxA = bonito(maxA * 1.08);
    var s = "<svg viewBox='0 0 " + W + " " + (H + top + bot) + "' role='img' aria-label='Chuva diária e acumulada'>" + eixoY(maxD, H, top, left, w);
    for (var t = 0; t <= 4; t++) { var va = maxA * t / 4, ya = top + H - t / 4 * H; s += "<text x='" + (left + w + 4) + "' y='" + (ya + 3).toFixed(1) + "' font-size='9' fill='#0b4f8a'>" + n0(va) + "</text>"; }
    var pa = [], pn = [];
    itens.forEach(function (x, i) {
      var cx = left + i * bw, hh = ok(x.v) ? x.v / maxD * H : 0;
      if (hh > 0) s += "<rect x='" + (cx + bw * 0.1).toFixed(2) + "' y='" + (top + H - hh).toFixed(1) + "' width='" + Math.max(bw * 0.8, 0.8).toFixed(2) + "' height='" + hh.toFixed(1) + "' fill='" + (x.p ? "#7fb3dc" : "#2475b3") + "'><title>" + dBR(DIAS[x.j]) + ": " + n1(x.v) + " mm" + (x.p ? " (preliminar)" : "") + "</title></rect>";
      pa.push((cx + bw / 2).toFixed(1) + "," + (top + H - x.ac / maxA * H).toFixed(1));
      pn.push((cx + bw / 2).toFixed(1) + "," + (top + H - x.an / maxA * H).toFixed(1));
      if (DIAS[x.j].getUTCDate() === 1 || i === 0) s += "<text x='" + cx.toFixed(1) + "' y='" + (top + H + 14) + "' font-size='9' fill='#5b6773'>" + dCurta(DIAS[x.j]) + "</text>";
    });
    s += "<polyline points='" + pn.join(" ") + "' fill='none' stroke='#1d2733' stroke-width='1.5' stroke-dasharray='4 3'/>";
    s += "<polyline points='" + pa.join(" ") + "' fill='none' stroke='#0b4f8a' stroke-width='2'/>";
    s += "</svg>";
    return "<h4>Chuva diária e acumulada — últimos " + itens.length + " dias</h4>" + s +
      "<div class='ic-glg'><span><i style='background:#2475b3'></i>chuva diária (mm, eixo esq.)</span><span><i style='background:#7fb3dc'></i>preliminar</span><span><i style='background:none;border-top:2px solid #0b4f8a;height:0;width:16px'></i>acumulado</span><span><i style='background:none;border-top:2px dashed #1d2733;height:0;width:16px'></i>normal acumulada (eixo dir.)</span></div>";
  }

  // ---------- exportação ----------
  function baixaCsv() {
    var linhas = [];
    if (S.modo === "m") {
      linhas.push(["municipio", "regiao", "territorio", "periodo", "acumulado_mm", "normal_1991_2020_mm", "anomalia_mm", "pct_normal", "spi_" + S.k, "percentil"].join(";"));
      MUNS.forEach(function (m) { var r = calc(m); linhas.push([m.nome, NOMES_R[m.r] || "", NOMES_T[m.t] || "", rotPer(S.fim, S.k), n1(r.T), n1(r.normal), n1(r.anom), n0(r.pct), ok(r.spi) ? r.spi.toFixed(2).replace(".", ",") : "", n0(r.pctl)].join(";")); });
    } else {
      linhas.push(["municipio", "regiao", "territorio", "ultimos_dias", "ate", "acumulado_mm", "normal_estimada_mm", "pct_normal", "dias_sem_chuva", "maior_chuva_diaria_mm"].join(";"));
      MUNS.forEach(function (m) { var q = calcRec(m, S.rj); linhas.push([m.nome, NOMES_R[m.r] || "", NOMES_T[m.t] || "", S.rj, L >= 0 ? dBR(DIAS[L]) : "", n1(q.total), n1(q.normal), n0(q.pct), n0(q.seco), n1(q.max)].join(";")); });
    }
    var blob = new Blob(["﻿" + linhas.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = S.modo === "m" ? "chuva_bahia_" + ymDe(S.fim).y + "-" + ("0" + (ymDe(S.fim).m + 1)).slice(-2) + "_" + S.k + "meses.csv" : "chuva_bahia_ultimos_" + S.rj + "_dias.csv";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  // Excel do local selecionado: chuva mensal observada, normal 1991–2020 e anomalia de cada mês do período escolhido
  // (mais os meses parciais, quando o período chega ao último mês). A biblioteca SheetJS só é baixada no clique.
  var XLSX_URL = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js", xlsxProm = null;
  function carregaXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (!xlsxProm) xlsxProm = new Promise(function (ok1, falha) {
      var sc = document.createElement("script"); sc.src = XLSX_URL; sc.async = true;
      sc.onload = function () { window.XLSX ? ok1(window.XLSX) : falha(new Error("XLSX")); };
      sc.onerror = function () { xlsxProm = null; falha(new Error("XLSX")); };
      document.head.appendChild(sc);
    });
    return xlsxProm;
  }
  function r1(v) { return ok(v) ? Math.round(v * 10) / 10 : null; }
  function slug(s) { return norm(s).toLowerCase().replace(/ /g, "_"); }
  function tabelaMensal(e) {
    var ini = S.fim - S.k + 1, linhas = [];
    for (var j = ini; j <= S.fim; j++) {
      var a = ymDe(j), v = e.s[j], nor = normalMes(e, a.m);
      linhas.push([a.y + "-" + ("0" + (a.m + 1)).slice(-2), MESL[a.m], a.y, r1(v), r1(nor), ok(v) && ok(nor) ? r1(v - nor) : null, ok(v) && nor > 0.5 ? Math.round(100 * v / nor) : null, "final"]);
    }
    if (S.fim === N - 1) (M.parciais || []).forEach(function (p, q) {
      var mm = +p.mes.slice(5) - 1, v = e.p[q], nor = normalMes(e, mm);
      var cheio = !!p.completo;   // mês incompleto: sem anomalia (a normal é do mês inteiro)
      linhas.push([p.mes, MESL[mm], +p.mes.slice(0, 4), r1(v), r1(nor), cheio && ok(v) && ok(nor) ? r1(v - nor) : null, cheio && ok(v) && nor > 0.5 ? Math.round(100 * v / nor) : null,
        cheio ? "preliminar" : "parcial até " + dBR(iso2d(p.ate)) + " (sem anomalia)"]);
    });
    return linhas;
  }
  function baixaXls() {
    var e = ENT[S.sel] || ENT.e, linhas = tabelaMensal(e), r = calc(e);
    var tipo = e.tipo === "m" ? "Município" : e.tipo === "t" ? "Território de identidade" : e.tipo === "r" ? "Região" : "Estado (média dos 417 municípios)";
    var cab = ["Mês (AAAA-MM)", "Mês", "Ano", "Chuva observada (mm)", "Normal 1991–2020 (mm)", "Anomalia (mm)", "% da normal", "Situação do dado"];
    var meta = [["Chuva mensal observada — " + e.nome], ["Tipo", tipo], ["Período selecionado", rotPer(S.fim, S.k) + " (" + S.k + (S.k === 1 ? " mês" : " meses") + ")"],
      ["Fonte", (M.fonte || "CHIRPS v3.0") + ". Processamento: INEMA"], ["Gerado em", new Date().toLocaleString("pt-BR")], []];
    var tot = ["Total do período", "", "", r1(r.T), r1(r.normal), r1(r.anom), ok(r.pct) ? Math.round(r.pct) : null, "só meses finais (" + rotPer(S.fim, S.k) + ")"];
    var nome = "chuva_mensal_" + slug(e.nome) + "_" + linhas[0][0] + "_a_" + ymDe(S.fim).y + "-" + ("0" + (ymDe(S.fim).m + 1)).slice(-2);
    var bt = RAIZ.querySelector("#ic-xls"); if (bt) { bt.disabled = true; bt.textContent = "Gerando…"; }
    carregaXlsx().then(function (X) {
      var aoa = meta.concat([cab], linhas, [[], tot]);
      var ws = X.utils.aoa_to_sheet(aoa);
      ws["!cols"] = [{ wch: 14 }, { wch: 11 }, { wch: 6 }, { wch: 20 }, { wch: 21 }, { wch: 14 }, { wch: 12 }, { wch: 22 }];
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
      var wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, "Chuva mensal");
      X.writeFile(wb, nome + ".xlsx");
    }).catch(function () {   // sem acesso à biblioteca: entrega a mesma tabela em CSV (abre no Excel)
      var fmt = function (v) { return v == null ? "" : String(v).replace(".", ","); };
      var txt = meta.concat([cab], linhas, [[], tot]).map(function (l) { return l.map(fmt).join(";"); }).join("\r\n");
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + txt], { type: "text/csv;charset=utf-8" })); a.download = nome + ".csv";
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }).then(function () { var b2 = RAIZ.querySelector("#ic-xls"); if (b2) { b2.disabled = false; b2.textContent = "Baixar em Excel"; } });
  }

  // ---------- mapa SVG ----------
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
