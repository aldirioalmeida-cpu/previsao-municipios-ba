/* Painel Agrometeorológico da Bahia — INEMA
   Dados: agro.json (Open-Meteo: ET0, chuva, umidade do solo, condições de manejo), extremos.json (chuva ECMWF/GFS/ICON),
   extremos/municipios_ba.geojson (malha IBGE), focos/municipios.json (regiões). Tudo via jsDelivr. */
(function () {
  "use strict";
  var RAIZ = document.getElementById("inema-agro");
  if (!RAIZ || RAIZ.getAttribute("data-ok")) return;
  RAIZ.setAttribute("data-ok", "1");
  var BASE = "https://cdn.jsdelivr.net/gh/aldirioalmeida-cpu/previsao-municipios-ba@main/";
  var PREV_MUN = RAIZ.getAttribute("data-previsao") || "";

  var CSS = [
    "#inema-agro{--az:#0b4f8a;--az2:#e8f0f8;--tx:#1d2733;--tx2:#5b6773;--ln:#d7dee6;--bg:#fff;--cz:#f5f7f9;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:var(--tx);font-size:15px;line-height:1.4;max-width:1280px;margin:0 auto 28px}",
    "#inema-agro *{box-sizing:border-box}",
    "#inema-agro .ia-topo{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;justify-content:space-between;margin:0 0 14px}",
    "#inema-agro h2.ia-tit{margin:0;font-size:1.55em;color:var(--az);line-height:1.15}",
    "#inema-agro .ia-sub{margin:4px 0 0;color:var(--tx2);font-size:.92em}",
    "#inema-agro .ia-bol{display:flex;flex-wrap:wrap;align-items:stretch;gap:14px 22px;background:#fff;border:1px solid var(--ln);border-radius:14px;padding:16px 18px;margin:0 0 20px;box-shadow:0 2px 10px rgba(20,40,70,.06)}",
    "#inema-agro .ia-bol .tx{flex:1 1 320px;display:flex;flex-direction:column;justify-content:center}",
    "#inema-agro .ia-bol .etq{font-size:.72em;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#2e7d32}",
    "#inema-agro .ia-bol h3{margin:2px 0 4px;font-size:1.25em;color:var(--tx);line-height:1.2}",
    "#inema-agro .ia-bol p{margin:0;font-size:.9em;color:var(--tx2)}",
    "#inema-agro a.ia-bol-ult{flex:0 1 280px;display:flex;flex-direction:column;gap:2px;padding:14px 16px;border-radius:12px;text-decoration:none;color:var(--tx);background:linear-gradient(135deg,#fff 0%,#e7f4e7 100%);border:1px solid #c5e2c6;transition:box-shadow .15s,transform .15s}",
    "#inema-agro a.ia-bol-ult:hover{box-shadow:0 4px 14px rgba(46,125,50,.18);transform:translateY(-1px)}",
    "#inema-agro .ia-bol-ult .dt{font-size:1.6em;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.15}",
    "#inema-agro .ia-bol-ult .sem{font-size:.84em;color:var(--tx2)}",
    "#inema-agro .ia-bol-ult .bt{align-self:flex-start;margin-top:8px;background:#2e7d32;color:#fff;font-weight:600;font-size:.88em;padding:6px 14px;border-radius:999px}",
    "#inema-agro .ia-aviso{background:#fff4e0;border:1px solid #f0c27a;border-radius:10px;padding:8px 12px;margin:0 0 12px;font-size:.9em}",
    "#inema-agro .ia-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:0 0 14px}",
    "#inema-agro .ia-kpi{background:var(--bg);border:1px solid var(--ln);border-radius:12px;padding:10px 12px;position:relative;overflow:hidden}",
    "#inema-agro .ia-kpi:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--k,#0b4f8a)}",
    "#inema-agro .ia-kpi small{display:block;color:var(--tx2);font-size:.78em;text-transform:uppercase;letter-spacing:.03em}",
    "#inema-agro .ia-kpi strong{display:block;font-size:1.55em;line-height:1.15;margin:2px 0}",
    "#inema-agro .ia-kpi em{font-style:normal;font-size:.82em;color:var(--tx2)}",
    "#inema-agro .ia-ctl{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;background:var(--cz);border:1px solid var(--ln);border-radius:12px;padding:10px 12px;margin:0 0 12px}",
    "#inema-agro .ia-grp{display:flex;flex-wrap:wrap;gap:4px;align-items:center}",
    "#inema-agro .ia-grp>span{font-size:.8em;color:var(--tx2);margin-right:4px;text-transform:uppercase;letter-spacing:.03em}",
    "#inema-agro button.ia-b{font:inherit;font-size:.88em;border:1px solid var(--ln);background:#fff;color:var(--tx);border-radius:999px;padding:5px 11px;cursor:pointer;line-height:1.2}",
    "#inema-agro button.ia-b:hover{border-color:var(--az)}",
    "#inema-agro button.ia-b.on{background:var(--az);border-color:var(--az);color:#fff}",
    "#inema-agro button.ia-b[disabled]{opacity:.4;cursor:default}",
    "#inema-agro input.ia-busca{font:inherit;font-size:.9em;border:1px solid var(--ln);border-radius:999px;padding:6px 12px;min-width:220px}",
    "#inema-agro .ia-corpo{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:14px}",
    "#inema-agro .ia-cx{background:var(--bg);border:1px solid var(--ln);border-radius:12px;padding:12px}",
    "#inema-agro .ia-cx h3{margin:0 0 8px;font-size:1.02em;color:var(--az)}",
    "#inema-agro .ia-mapa{position:relative}",
    "#inema-agro .ia-mapa svg{width:100%;height:auto;display:block;max-height:640px}",
    "#inema-agro .ia-mapa path.m{stroke:#fff;stroke-width:.35;cursor:pointer;transition:opacity .15s}",
    "#inema-agro .ia-mapa path.m:hover{stroke:#111;stroke-width:1.2}",
    "#inema-agro .ia-mapa path.m.sel{stroke:#000;stroke-width:1.8}",
    "#inema-agro .ia-mapa path.m.fora{opacity:.25}",
    "#inema-agro .ia-tip{position:absolute;pointer-events:none;background:rgba(20,28,38,.92);color:#fff;border-radius:8px;padding:6px 9px;font-size:.84em;line-height:1.3;white-space:nowrap;display:none;z-index:3}",
    "#inema-agro .ia-leg{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:.8em;color:var(--tx2);margin-top:6px}",
    "#inema-agro .ia-leg i{display:inline-block;width:14px;height:11px;border-radius:2px;margin-right:4px;vertical-align:-1px;border:1px solid rgba(0,0,0,.12)}",
    "#inema-agro .ia-legt{font-size:.85em;margin:0 0 4px;color:var(--tx)}",
    "#inema-agro .ia-lado{display:flex;flex-direction:column;gap:14px}",
    "#inema-agro .ia-reg{display:grid;grid-template-columns:auto 1fr auto;gap:5px 8px;align-items:center;font-size:.88em}",
    "#inema-agro .ia-reg .n{cursor:pointer;white-space:nowrap}",
    "#inema-agro .ia-reg .n.on{font-weight:700;color:var(--az)}",
    "#inema-agro .ia-reg .bar{height:14px;background:var(--cz);border-radius:4px;overflow:hidden;display:flex}",
    "#inema-agro .ia-reg .bar i{display:block;height:100%}",
    "#inema-agro .ia-reg .v{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}",
    "#inema-agro ol.ia-rank{margin:0;padding:0;list-style:none;font-size:.88em;columns:2;column-gap:14px}",
    "#inema-agro ol.ia-rank li{display:flex;justify-content:space-between;gap:6px;padding:3px 0;border-bottom:1px dotted var(--ln);cursor:pointer;break-inside:avoid}",
    "#inema-agro ol.ia-rank li:hover{color:var(--az)}",
    "#inema-agro ol.ia-rank b{font-variant-numeric:tabular-nums}",
    "#inema-agro .ia-det{margin-top:14px}",
    "#inema-agro .ia-dett{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;margin:0 0 10px}",
    "#inema-agro .ia-dett h3{margin:0;font-size:1.2em}",
    "#inema-agro .ia-dett span{color:var(--tx2);font-size:.9em}",
    "#inema-agro .ia-dett a{margin-left:auto;font-size:.88em;color:var(--az)}",
    // cada dia tem largura mínima: quando não cabe, o card desce para a linha de baixo em vez de espremer (e quebrar) as palavras
    "#inema-agro .ia-dias{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px}",
    "#inema-agro .ia-dia{border:1px solid var(--ln);border-radius:10px;padding:8px;text-align:center;font-size:.86em;background:#fff}",
    "#inema-agro .ia-dia.hj{border-color:var(--az);box-shadow:0 0 0 1px var(--az) inset}",
    "#inema-agro .ia-dia .d{font-weight:700}",
    "#inema-agro .ia-dia .man{display:block;border-radius:6px;color:#fff;font-weight:700;padding:3px 2px;margin:6px 0 2px;font-size:.92em}",
    "#inema-agro .ia-dia .jan{display:block;color:var(--tx2);font-size:.85em;min-height:1.2em}",
    "#inema-agro .ia-dia dl{margin:6px 0 0;display:grid;grid-template-columns:1fr auto;gap:2px 4px;text-align:left}",
    "#inema-agro .ia-dia dt{color:var(--tx2);white-space:nowrap}",
    "#inema-agro .ia-dia dd{margin:0;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap}",
    "#inema-agro .ia-graf svg{width:100%;height:auto;display:block;margin-top:10px}",
    "#inema-agro details.ia-ajuda{margin-top:14px;background:var(--cz);border:1px solid var(--ln);border-radius:12px;padding:8px 14px;font-size:.92em}",
    "#inema-agro details.ia-ajuda summary{cursor:pointer;font-weight:600;color:var(--az)}",
    "#inema-agro details.ia-ajuda li{margin:3px 0}",
    "#inema-agro .ia-links{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}",
    "#inema-agro .ia-links a{display:block;border:1px solid var(--ln);border-radius:12px;padding:10px 12px;text-decoration:none;color:var(--tx);background:#fff}",
    "#inema-agro .ia-links a:hover{border-color:var(--az)}",
    "#inema-agro .ia-links b{display:block;color:var(--az);font-size:.95em}",
    "#inema-agro .ia-links span{font-size:.82em;color:var(--tx2)}",
    "#inema-agro .ia-fonte{font-size:.8em;color:var(--tx2);margin-top:10px}",
    "#inema-agro select.ia-sel{font:inherit;font-size:.88em;border:1px solid var(--ln);border-radius:999px;padding:5px 10px;background:#fff;color:var(--tx);max-width:100%}",
    "#inema-agro .ia-zarc{margin-top:14px;padding-top:12px;border-top:1px solid var(--ln)}",
    "#inema-agro .ia-zarc h4{margin:0 0 6px;font-size:.95em}",
    "#inema-agro .ia-zw{overflow-x:auto}",
    "#inema-agro table.ia-zt{border-collapse:collapse;font-size:.76em;min-width:640px;width:100%}",
    "#inema-agro table.ia-zt th{font-weight:600;color:var(--tx2);text-align:center;padding:2px 0;border-bottom:1px solid var(--ln)}",
    "#inema-agro table.ia-zt th.c{text-align:left;padding-right:8px}",
    "#inema-agro table.ia-zt td{height:14px;padding:0;border-right:1px solid #fff}",
    "#inema-agro table.ia-zt td.n{white-space:nowrap;padding:2px 8px 2px 0;font-size:1.05em;border:0}",
    "#inema-agro table.ia-zt tr.col td.n{color:var(--tx2);font-size:.95em;padding-left:10px}",
    "#inema-agro table.ia-zt td.hj{outline:2px solid #1d2733;outline-offset:-1px}",
    "#inema-agro table.ia-zt tr.pl td{border-top:4px solid #fff}",
    "#inema-agro .ia-ztag{display:inline-block;font-size:.8em;padding:0 6px;border-radius:8px;background:#eef2f6;color:var(--tx2);margin-left:4px}",
    "#inema-agro .ia-ind{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 12px}",
    "#inema-agro .ia-indc{border:1px solid var(--ln);border-left:5px solid var(--k);border-radius:10px;padding:8px 12px;background:#fff}",
    "#inema-agro .ia-indc small{display:block;font-size:.75em;text-transform:uppercase;letter-spacing:.03em;color:var(--tx2)}",
    "#inema-agro .ia-indc b{display:block;font-size:1.15em;color:var(--k)}",
    "#inema-agro .ia-indc span{font-size:.86em;color:var(--tx)}",
    "#inema-agro .ia-nota{font-size:.86em;color:var(--tx2);margin:4px 0 0}",
    "#inema-agro .ia-gdx{margin-top:14px;padding-top:12px;border-top:1px solid var(--ln)}",
    "#inema-agro .ia-gdx h4{margin:0 0 8px;font-size:.95em}",
    "#inema-agro .ia-gdf{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:flex-end;font-size:.86em;color:var(--tx2)}",
    "#inema-agro .ia-gdf label{display:flex;flex-direction:column;gap:3px}",
    "#inema-agro .ia-gdf select,#inema-agro .ia-gdf input{font:inherit;color:var(--tx);border:1px solid var(--ln);border-radius:8px;padding:5px 8px;background:#fff}",
    "#inema-agro .ia-gdf input[type=number]{width:110px}",
    "#inema-agro #ia-gd-res{margin-top:10px;color:var(--tx)}",
    "#inema-agro .ia-carr{padding:40px;text-align:center;color:var(--tx2)}",
    "@media (max-width:1000px){#inema-agro .ia-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}#inema-agro .ia-corpo{grid-template-columns:1fr}#inema-agro .ia-links{grid-template-columns:repeat(2,minmax(0,1fr))}}",
    "@media (max-width:640px){#inema-agro{font-size:14px}#inema-agro .ia-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-agro .ia-kpi strong{font-size:1.3em}#inema-agro .ia-dias{grid-template-columns:repeat(auto-fit,minmax(104px,1fr))}#inema-agro ol.ia-rank{columns:1}#inema-agro input.ia-busca{min-width:0;width:100%}#inema-agro .ia-grp{width:100%}#inema-agro a.ia-bol-ult{flex-basis:100%}#inema-agro .ia-links{grid-template-columns:1fr}#inema-agro .ia-ind{grid-template-columns:1fr}}"
  ].join("\n");
  var st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);
  RAIZ.innerHTML = "<div class='ia-carr'>Carregando o painel agrometeorológico…</div>";

  // ---------- utilidades ----------
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function n1(v) { return v == null || isNaN(v) ? "–" : (Math.round(v * 10) / 10).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 }); }
  function n0(v) { return v == null || isNaN(v) ? "–" : Math.round(v).toLocaleString("pt-BR"); }
  function sinal(v) { return v == null ? "–" : (v > 0 ? "+" : "") + n1(v); }
  function json(u) { return fetch(u, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  var DSEM = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  function dt(iso) { return new Date(iso + "T12:00:00"); }
  var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  function rotDia(iso, i) { var d = dt(iso); return (i === 0 ? "Hoje" : DSEM[d.getDay()]) + " " + d.getDate(); }
  function dataBR(iso) { var d = dt(iso); return ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2); }
  function media(a) { var s = 0, n = 0; a.forEach(function (x) { if (x != null && !isNaN(x)) { s += x; n++; } }); return n ? s / n : null; }
  function soma(a) { var s = 0, n = 0; a.forEach(function (x) { if (x != null) { s += x; n++; } }); return n ? s : null; }

  // ---------- classes e escalas ----------
  var MAN = { nomes: ["Favorável", "Razoável", "Desfavorável", "Crítico"], cores: ["#1f6fd1", "#2e9e4f", "#f08c00", "#d63031"] };
  var VARS = {
    man: { nome: "Condições de manejo", curto: "Manejo", un: "" },
    bal: { nome: "Balanço hídrico (chuva − ET0)", curto: "Balanço hídrico", un: "mm" },
    chuva: { nome: "Chuva prevista", curto: "Chuva", un: "mm" },
    et0: { nome: "Evapotranspiração de referência (ET0)", curto: "ET0", un: "mm" },
    solo: { nome: "Umidade do solo (0–28 cm)", curto: "Umidade do solo", un: "%" },
    plant: { nome: "Condição para plantio de sequeiro", curto: "Plantio", un: "" },
    ver: { nome: "Risco de veranico", curto: "Veranico", un: "" },
    zarc: { nome: "Plantio indicado agora (ZARC)", curto: "Época de plantio (ZARC)", un: "" }
  };
  // ---------- ZARC (Zoneamento Agrícola de Risco Climático, MAPA) ----------
  var ZARC = { nomes: ["Indicado · risco 20%", "Indicado · risco 30%", "Indicado · risco 40%", "Fora da janela agora", "Não zoneado"], cores: ["#1a7f37", "#5cb85c", "#b9dd9f", "#e8a87c", "#e6e9ed"] };
  var Z = null, ZK = {}, zProm = null;
  function carregaZarc() {
    if (!zProm) zProm = json(BASE + "zarc_ba.json").then(function (z) { Z = z; Object.keys(z.nomes).forEach(function (g) { ZK[norm(z.nomes[g])] = g; }); return z; })
      .catch(function () { zProm = null; return null; });
    return zProm;
  }
  function ordemZarc() {
    return Z.culturas.map(function (c, i) { return i; }).sort(function (a, b) {
      var x = Z.culturas[a], y = Z.culturas[b]; return (x.manejo === "Sequeiro" ? 0 : 1) - (y.manejo === "Sequeiro" ? 0 : 1) || x.nome.localeCompare(y.nome, "pt-BR");
    });
  }
  function padraoZarc() { var i = Z.culturas.map(function (c) { return c.nome + "|" + c.manejo; }).indexOf("Milho 1ª Safra|Sequeiro"); return i >= 0 ? i : ordemZarc()[0]; }
  function opcoesZarc() {
    var sel = RAIZ.querySelector("#ia-zc"); if (!sel || !Z) return;
    sel.innerHTML = ordemZarc().map(function (i) { var c = Z.culturas[i]; return "<option value='" + i + "'" + (i === S.zc ? " selected" : "") + ">" + esc(c.nome) + " · " + esc(c.manejo.toLowerCase()) + "</option>"; }).join("");
  }
  function decAtual() { var d = dt(A.datas[0]); return d.getMonth() * 3 + (d.getDate() <= 10 ? 0 : d.getDate() <= 20 ? 1 : 2); }
  function rotDec(i) { return ["1º", "2º", "3º"][i % 3] + " decêndio de " + MESES[Math.floor(i / 3)]; }
  function zarcDe(m, c) { var g = Z && ZK[m.k]; return g && Z.mun[g] ? Z.mun[g][String(c)] || null : null; }
  function zarcClasse(m) {
    if (!Z) return null;
    var s = zarcDe(m, S.zc); if (!s) return 4;
    var ch = s.charAt(decAtual()); return ch === "2" ? 0 : ch === "3" ? 1 : ch === "4" ? 2 : 3;
  }
  // Ciclo médio (dias do plantio à colheita) só para estimar a colheita no calendário — varia com a cultivar
  var CICLO = [["Feijão Caupi", 75], ["Feijão", 90], ["Milho", 120], ["Soja", 115], ["Sorgo", 110], ["Algodão", 170], ["Amendoim", 110],
    ["Girassol", 110], ["Mamona", 180], ["Trigo", 115], ["Arroz", 120], ["Gergelim", 100], ["Mandioca", 365]];
  function cicloDe(nome) { for (var i = 0; i < CICLO.length; i++) if (nome.indexOf(CICLO[i][0]) === 0) return CICLO[i][1]; return null; }
  // Classes categóricas (índice 3 = fora da estação chuvosa do município)
  var PLANT = { nomes: ["Favorável", "Atenção", "Desfavorável", "Fora da estação chuvosa"], cores: ["#1f6fd1", "#f0b400", "#d63031", "#cfd5dc"] };
  var VER = { nomes: ["Sem sinal", "Atenção", "Alerta", "Fora da estação chuvosa"], cores: ["#2e9e4f", "#f08c00", "#d63031", "#cfd5dc"] };
  var CATEG = { plant: PLANT, ver: VER, zarc: ZARC };
  var CHUVOSO_MM = 50;   // mês da estação chuvosa: normal 1991–2020 (CHIRPS) de pelo menos 50 mm no município
  function mesAtual() { return dt(A.datas[0]).getMonth(); }
  function chuvoso(m) { var nm = m.d.nm; return nm ? (nm[mesAtual()] != null && nm[mesAtual()] >= CHUVOSO_MM) : null; }
  function obsSeco(m) {   // dias seguidos sem chuva observados (CHIRPS) até A.seco_ate, se o dado tiver até 15 dias
    if (m.d.seco == null || !A.seco_ate) return null;
    return (dt(A.datas[0]) - dt(A.seco_ate)) / 864e5 <= 15 ? m.d.seco : null;
  }
  function secoPrev(m) { var c = m.d.chuva, n = 0; for (var i = 0; i < c.length; i++) { if (c[i] != null && c[i] < 1) n++; else break; } return n; }
  function veranico(m) {
    var ch = chuvoso(m); if (ch == null) return null; if (!ch) return 3;
    var p = secoPrev(m), o = obsSeco(m), t = (o || 0) + p;
    if ((p >= 7 && (o == null || o >= 3)) || (p >= 3 && t >= 15)) return 2;
    if (p >= 5 || (p >= 3 && t >= 10)) return 1;
    return 0;
  }
  function plantio(m) {
    var ch = chuvoso(m); if (ch == null) return null; if (!ch) return 3;
    var c7 = soma(m.d.chuva), b7 = soma(m.d.bal), so = media(m.solo);
    if (c7 == null) return null;
    if (c7 >= 25 && b7 >= 0 && (so == null || so >= 20)) return 0;
    if (c7 >= 15 || (so != null && so >= 20 && c7 >= 5)) return 1;
    return 2;
  }
  var ESC = {
    bal: { d: [-6, -4, -2, 0, 2, 5, 10], s: [-40, -30, -20, -10, 0, 15, 40], c: ["#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#c7eae5", "#80cdc1", "#35978f", "#01665e"] },
    chuva: { d: [1, 5, 10, 20, 40, 80], s: [2, 10, 25, 50, 100, 150], c: ["#f3efe6", "#c6e9c2", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#0c2c84"] },
    et0: { d: [3, 4, 5, 6, 7], s: [20, 25, 30, 35, 42], c: ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"] },
    solo: { d: [10, 15, 20, 25, 30, 35], s: [10, 15, 20, 25, 30, 35], c: ["#8c510a", "#d8b365", "#f6e8c3", "#c7eae5", "#5ab4ac", "#2b8cbe", "#08589e"] },
    mans: { d: [2, 4, 6], s: [2, 4, 6], c: ["#d63031", "#f08c00", "#2e9e4f", "#1f6fd1"] }
  };
  function bin(thr, v) { var i = 0; while (i < thr.length && v >= thr[i]) i++; return i; }

  // ---------- estado ----------
  var S = { v: "man", d: 0, mod: "om", sel: null, reg: null, zc: null, zm: "Sequeiro" };
  try { var g = JSON.parse(localStorage.getItem("inemaAgro1") || "{}"); if (VARS[g.v]) S.v = g.v; if (g.mod) S.mod = g.mod; if (g.sel) S.sel = g.sel; if (g.zc != null) S.zc = g.zc; if (g.zm) S.zm = g.zm; } catch (e) { /* sem armazenamento */ }
  function guarda() { try { localStorage.setItem("inemaAgro1", JSON.stringify({ v: S.v, mod: S.mod, sel: S.sel, zc: S.zc, zm: S.zm })); } catch (e) { /* ignora */ } }
  var qs = new URLSearchParams(location.search);
  if (qs.get("municipio")) S.sel = norm(qs.get("municipio"));

  var A, EXT, MUN = {}, LISTA = [], REGIOES = [], PATHS = {}, MODS = [];

  Promise.all([
    json(BASE + "agro.json"),
    json(BASE + "extremos/municipios_ba.geojson"),
    json(BASE + "focos/municipios.json").catch(function () { return null; }),
    json(BASE + "extremos.json").catch(function () { return null; })
  ]).then(function (r) { prepara(r[0], r[1], r[2], r[3]); monta(); }).catch(function (e) {
    RAIZ.innerHTML = "<div class='ia-aviso'>Não foi possível carregar os dados do painel agora (" + esc(e.message || e) + "). Tente novamente em alguns minutos.</div>";
  });

  function prepara(agro, geo, focos, ext) {
    A = agro; EXT = ext;
    var reg = {};
    if (focos) { REGIOES = focos.regioes; focos.municipios.forEach(function (m) { reg[norm(m.n)] = m.r; }); }
    Object.keys(agro.municipios).forEach(function (nome) {
      var k = norm(nome);
      MUN[k] = { k: k, nome: nome, d: agro.municipios[nome], r: reg[k] };
      LISTA.push(MUN[k]);
    });
    LISTA.sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt-BR"); });
    // chuva por modelo: média no município (pixels ponderados pela área). Modelos sem a média ficam fora do seletor.
    MODS = [];
    if (ext && ext.modelos) {
      Object.keys(ext.modelos).forEach(function (mod) {
        var mm = ext.modelos[mod].municipios, idx = agro.datas.map(function (d) { return ext.datas.indexOf(d); }), tem = false;
        Object.keys(mm).forEach(function (nome) {
          var m = MUN[norm(nome)], med = mm[nome].mm_med;
          if (m && med) { m[mod] = idx.map(function (i) { return i < 0 ? null : med[i]; }); tem = true; }
        });
        if (tem) MODS.push(mod);
      });
    }
    if (S.mod !== "om" && MODS.indexOf(S.mod) < 0) S.mod = "om";   // escolha salva de um modelo que não está disponível
    LISTA.forEach(function (m) {
      m.solo = m.d.sm1.map(function (a, i) { var b = m.d.sm2[i]; return a == null || b == null ? null : Math.round((7 * a + 21 * b) / 28 * 1000) / 10; });
    });
    A.geo = geo;
    if (S.sel && !MUN[S.sel]) S.sel = null;
  }

  // valor de um município para a variável/dia atuais
  function chuvas(m) { return S.mod === "om" ? m.d.chuva : (m[S.mod] || []); }
  function val(m, v, d) {
    v = v || S.v; d = d == null ? S.d : d;
    var sem = d === "s";
    if (v === "zarc") return zarcClasse(m);
    if (v === "ver") return veranico(m);
    if (v === "plant") return plantio(m);
    if (v === "man") return sem ? m.d.man.filter(function (c) { return c != null && c <= 1; }).length : m.d.man[d];
    if (v === "bal") {
      if (S.mod === "om") return sem ? soma(m.d.bal) : m.d.bal[d];
      var c = chuvas(m), b = m.d.et0.map(function (e, i) { return c[i] == null || e == null ? null : c[i] - e; });
      return sem ? soma(b) : b[d];
    }
    if (v === "chuva") { var ch = chuvas(m); return sem ? soma(ch) : ch[d]; }
    if (v === "et0") return sem ? soma(m.d.et0) : m.d.et0[d];
    if (v === "solo") return sem ? media(m.solo) : m.solo[d];
  }
  function escala() {
    var sem = S.d === "s";
    if (S.v === "man") return sem ? { thr: ESC.mans.s, c: ESC.mans.c } : null;
    var e = ESC[S.v]; return { thr: sem ? e.s : e.d, c: e.c };
  }
  function cor(v) {
    if (v == null || isNaN(v)) return "#e6e9ed";
    if (CATEG[S.v]) return CATEG[S.v].cores[v];
    if (S.v === "man" && S.d !== "s") return MAN.cores[v];
    var e = escala(); return e.c[bin(e.thr, v)];
  }
  function txt(m) {
    var v = val(m), sem = S.d === "s";
    if (v == null) return "sem dado";
    if (S.v === "zarc") {
      var s = zarcDe(m, S.zc), prox = "";
      if (s && v === 3) { for (var q = 1; q < 36; q++) { var j = (decAtual() + q) % 36; if (s.charAt(j) !== "0") { prox = " · próxima janela: " + rotDec(j); break; } } }
      return ZARC.nomes[v] + " (" + rotDec(decAtual()) + ")" + prox;
    }
    if (S.v === "ver") {
      if (v === 3) return VER.nomes[3] + " (" + MESES[mesAtual()] + ")";
      var o = obsSeco(m);
      return VER.nomes[v] + " · " + secoPrev(m) + " de 7 dias previstos sem chuva" + (o != null ? " · " + o + (o === 1 ? " dia seco observado até " : " dias secos observados até ") + "" + dataBR(A.seco_ate) : "");
    }
    if (S.v === "plant") return PLANT.nomes[v] + (v === 3 ? " (" + MESES[mesAtual()] + ")" : " · chuva 7 dias " + n1(soma(m.d.chuva)) + " mm, balanço " + sinal(soma(m.d.bal)) + " mm, solo " + n1(media(m.solo)) + "%");
    if (S.v === "man") {
      if (sem) return v + " de 7 dias favoráveis ou razoáveis";
      return MAN.nomes[v] + " · " + m.d.horas[S.d] + " h boas" + (m.d.jan[S.d] ? " (" + m.d.jan[S.d] + ")" : "");
    }
    if (S.v === "solo") return n1(v) + "% de umidade" + (sem ? " (média)" : "");
    if (S.v === "bal") return sinal(v) + " mm" + (sem ? " em 7 dias" : "");
    return n1(v) + " mm" + (sem ? " em 7 dias" : (S.v === "et0" ? "/dia" : ""));
  }

  // ---------- montagem ----------
  function monta() {
    var ger = new Date(A.gerado_em), horas = (Date.now() - ger.getTime()) / 36e5;
    var bol = acharBoletim();
    var h = "";
    if (bol) h += "<div class='ia-bol'><div class='tx'><span class='etq'>Boletim do INEMA</span><h3>Boletim Agrometeorológico Semanal</h3>" +
      "<p>Análise semanal das condições de tempo e clima para as atividades agrícolas na Bahia, elaborada pela equipe de meteorologia do INEMA.</p></div>" +
      "<a class='ia-bol-ult' href='" + esc(bol.href) + "' target='_blank' rel='noopener'><span class='etq'>Edição mais recente</span>" +
      "<span class='dt'>" + esc(bol.data || "Boletim") + "</span>" + (bol.sem ? "<span class='sem'>" + bol.sem + "</span>" : "") +
      "<span class='bt'>Abrir boletim ↗</span></a></div>";
    h += "<div class='ia-topo'><div><h2 class='ia-tit'>Painel Agrometeorológico da Bahia</h2>" +
      "<p class='ia-sub'>Previsão para os próximos 7 dias nos 417 municípios · atualizado em " +
      ger.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) + "</p></div>" +
      "</div>";
    if (horas > 30) h += "<div class='ia-aviso'>Atenção: os dados deste painel não são atualizados há " + Math.round(horas) + " horas.</div>";
    h += "<div class='ia-ctl'>" +
      "<div class='ia-grp' id='ia-gv'><span>Mapa</span>" + Object.keys(VARS).map(function (k) { return "<button class='ia-b' data-v='" + k + "'>" + VARS[k].curto + "</button>"; }).join("") + "</div>" +
      "<div class='ia-grp' id='ia-gd'><span>Dia</span>" + A.datas.map(function (d, i) { return "<button class='ia-b' data-d='" + i + "'>" + rotDia(d, i) + "</button>"; }).join("") + "<button class='ia-b' data-d='s'>7 dias</button></div>" +
      "<div class='ia-grp' id='ia-gm'><span>Chuva</span><button class='ia-b' data-m='om' title='Open-Meteo: melhor modelo disponível, na sede do município'>Padrão</button>" +
      ["ecmwf", "gfs", "icon"].filter(function (k) { return MODS.indexOf(k) >= 0; }).map(function (k) { return "<button class='ia-b' data-m='" + k + "' title='Chuva média do modelo no município (pixels ponderados pela área)'>" + k.toUpperCase() + "</button>"; }).join("") + "</div>" +
      "<div class='ia-grp' id='ia-gz' hidden><span>Cultura</span><select class='ia-sel' id='ia-zc' aria-label='Cultura do ZARC'><option>Carregando…</option></select></div>" +
      "<div class='ia-grp' style='margin-left:auto'><input class='ia-busca' id='ia-busca' list='ia-lista' placeholder='Buscar município…' aria-label='Buscar município'><datalist id='ia-lista'>" +
      LISTA.map(function (m) { return "<option value='" + esc(m.nome) + "'>"; }).join("") + "</datalist></div></div>";
    h += "<div class='ia-corpo'><div class='ia-cx'><h3 id='ia-tmapa'></h3><div class='ia-mapa' id='ia-mapa'>" + svgMapa() + "<div class='ia-tip' id='ia-tip'></div></div><div id='ia-leg'></div></div>" +
      "<div class='ia-lado'><div class='ia-cx'><h3 id='ia-treg'>Por região</h3><div class='ia-reg' id='ia-reg'></div></div>" +
      "<div class='ia-cx'><h3 id='ia-trank'></h3><ol class='ia-rank' id='ia-rank'></ol></div></div></div>";
    h += "<div class='ia-cx ia-det' id='ia-det'></div>";
    h += "<details class='ia-ajuda'><summary>Como ler este painel</summary><ul>" +
      "<li><b>Condições de manejo</b> (pulverização e aplicação de defensivos, adubação foliar): conta as horas entre 6h e 18h sem chuva, com vento de 3 a 10 km/h, umidade relativa ≥ 55% e temperatura ≤ 30 °C. " +
      "<b style='color:" + MAN.cores[0] + "'>Favorável</b>: 4 h ou mais; <b style='color:" + MAN.cores[1] + "'>Razoável</b>: 2–3 h; <b style='color:" + MAN.cores[2] + "'>Desfavorável</b>: 1 h; <b style='color:" + MAN.cores[3] + "'>Crítico</b>: nenhuma. A janela indica o maior período contínuo de horas boas.</li>" +
      "<li><b>ET0</b> (FAO-56 Penman-Monteith) é a água que uma grama de referência bem irrigada perderia por evaporação e transpiração. Para a cultura, multiplique pelo coeficiente da cultura (Kc) da fase em que ela está.</li>" +
      "<li><b>Balanço hídrico</b> = chuva prevista − ET0. Valores negativos indicam que a atmosfera retira mais água do que a chuva repõe (déficit); positivos, excedente.</li>" +
      "<li><b>Umidade do solo</b> é o conteúdo volumétrico de água simulado pelo modelo nas camadas 0–7 cm e 7–28 cm (média ponderada). Como varia com o tipo de solo, compare valores do mesmo local ao longo dos dias.</li>" +
      "<li><b>Chuva</b>: “Padrão” é a previsão do Open-Meteo na sede do município (mesma dos cards de previsão). ECMWF, GFS e ICON mostram a chuva <b>média</b> de cada modelo no município: média dos pixels de 0,25° (≈ 27 km) que cobrem o município, cada um pesando conforme a área do município dentro dele — úteis para comparar e avaliar a incerteza.</li>" +
      "<li><b>Estação chuvosa</b> de cada município: meses cuja chuva normal (1991–2020, CHIRPS) é de pelo menos " + CHUVOSO_MM + " mm. Fora dela, Plantio e Veranico aparecem em cinza.</li>" +
      "<li><b>Plantio de sequeiro</b> (indicativo): <b style='color:" + PLANT.cores[0] + "'>Favorável</b> com 25 mm ou mais previstos em 7 dias, balanço hídrico ≥ 0 e umidade do solo ≥ 20%; <b style='color:#b08400'>Atenção</b> com 15 mm ou mais (ou solo úmido e alguma chuva); <b style='color:" + PLANT.cores[2] + "'>Desfavorável</b> abaixo disso. A época de plantio de cada cultura deve seguir o Zoneamento Agrícola de Risco Climático (ZARC/MAPA).</li>" +
      "<li><b>Veranico</b>: sequência de dias sem chuva (< 1 mm) na estação chuvosa. Soma os dias secos observados (CHIRPS, até a data indicada) e os previstos a partir de hoje. <b style='color:" + VER.cores[1] + "'>Atenção</b>: 5 ou mais dias previstos sem chuva, ou 10 ou mais no total; <b style='color:" + VER.cores[2] + "'>Alerta</b>: a semana inteira sem chuva prevista após dias secos, ou 15 ou mais no total.</li>" +
      "<li><b>Época de plantio (ZARC)</b>: no mapa, onde a cultura escolhida tem plantio indicado no decêndio atual pelo Zoneamento Agrícola de Risco Climático (MAPA), e com que risco (20%, 30% ou 40% de perda por clima). " +
      "No detalhe do município, o calendário mostra as janelas de plantio de todas as culturas zoneadas (1ª e 2ª safra, sequeiro e irrigado) e a colheita aproximada pelo ciclo médio. A tábua é atualizada uma vez por mês a partir dos dados abertos do MAPA.</li>" +
      "<li><b>Graus-dia</b> (no detalhe do município): soma térmica desde o plantio, útil para acompanhar o desenvolvimento da cultura. As temperaturas são buscadas na hora, no Open-Meteo.</li>" +
      "<li>Clique em um município no mapa, na lista ou use a busca para ver os 7 dias. Clique em uma região para destacá-la.</li></ul></details>";
    h += "<div class='ia-links'>" +
      (PREV_MUN ? "<a href='" + esc(PREV_MUN) + "'><b>Previsão por município</b><span>Temperatura, chuva e vento por período do dia</span></a>" : "") +
      "<a href='/inema/meteorologia/satelite'><b>Satélite e radar</b><span>Nuvens e chuva em tempo quase real</span></a>" +
      "<a href='https://monitordesecas.ana.gov.br/' target='_blank' rel='noopener'><b>Monitor de Secas</b><span>Severidade da seca no Nordeste (ANA)</span></a>" +
      "<a href='https://www.agritempo.gov.br/' target='_blank' rel='noopener'><b>Agritempo</b><span>Sistema de monitoramento agrometeorológico (Embrapa)</span></a></div>";
    h += "<p class='ia-fonte'>Fontes: " + esc(A.fonte) + "; ECMWF, NOAA/GFS e DWD/ICON (chuva por modelo); malha municipal IBGE. Previsões numéricas sem ajuste local — use como apoio à decisão, junto do boletim semanal.</p>";
    RAIZ.innerHTML = h;
    if (bol) escondeSecaoBoletim(bol.a);
    liga();
    render();
  }

  function acharBoletim() {
    var as = Array.prototype.slice.call(document.querySelectorAll("a[href$='.pdf'], a[href*='.pdf?']"));
    for (var i = 0; i < as.length; i++) {
      var a = as[i], href = a.getAttribute("href") || "";
      if (RAIZ.contains(a)) continue;
      var nome = decodeURIComponent(href).toLowerCase();
      if (nome.indexOf("agromet") < 0 && (a.textContent + (a.parentNode ? a.parentNode.textContent : "")).toLowerCase().indexOf("agromet") < 0) continue;
      var t = (a.parentNode ? a.parentNode.textContent : "") + " " + decodeURIComponent(href);
      var m = t.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
      var dia = m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
      return { a: a, href: a.href, data: m ? m[1] + "/" + m[2] + "/" + m[3] : "", sem: dia ? SEMANA[dia.getDay()] : "" };
    }
    return null;
  }
  var SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

  // o acesso ao boletim passa para o topo do painel: esconde o título e o parágrafo do link no conteúdo da página
  function escondeSecaoBoletim(a) {
    var p = a.closest ? a.closest("p,li,div") : a.parentNode;
    if (!p || p === RAIZ || p.contains(RAIZ)) return;
    var ant = p.previousElementSibling;
    p.style.display = "none";
    if (ant && /^H[1-6]$/.test(ant.tagName) && /boletim/i.test(ant.textContent)) ant.style.display = "none";
  }

  // ---------- mapa SVG ----------
  var PROJ;
  function svgMapa() {
    var fs = A.geo.features, minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, K = Math.cos(13 * Math.PI / 180), E = 64;
    function anda(c, f) { if (typeof c[0] === "number") f(c); else c.forEach(function (x) { anda(x, f); }); }
    fs.forEach(function (f) { anda(f.geometry.coordinates, function (p) { var x = p[0] * K * E, y = -p[1] * E; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }); });
    PROJ = function (lo, la) { return [lo * K * E - minX + 4, -la * E - minY + 4]; };
    var w = Math.ceil(maxX - minX + 8), hh = Math.ceil(maxY - minY + 8);
    var out = "<svg viewBox='0 0 " + w + " " + hh + "' role='img' aria-label='Mapa dos municípios da Bahia'>";
    fs.forEach(function (f) {
      var k = norm(f.properties.nome), polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates, d = "";
      polys.forEach(function (pl) {
        pl.forEach(function (anel) {
          var lx = null, ly = null, s = "";
          anel.forEach(function (p, i) {
            var q = PROJ(p[0], p[1]), x = Math.round(q[0] * 10) / 10, y = Math.round(q[1] * 10) / 10;
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

  function liga() {
    RAIZ.querySelector("#ia-gv").addEventListener("click", function (e) { var b = e.target.closest("[data-v]"); if (!b) return; S.v = b.getAttribute("data-v"); guarda(); render(); });
    RAIZ.querySelector("#ia-gd").addEventListener("click", function (e) { var b = e.target.closest("[data-d]"); if (!b) return; var d = b.getAttribute("data-d"); S.d = d === "s" ? "s" : +d; render(); });
    RAIZ.querySelector("#ia-gm").addEventListener("click", function (e) { var b = e.target.closest("[data-m]"); if (!b) return; S.mod = b.getAttribute("data-m"); guarda(); render(); });
    RAIZ.querySelector("#ia-zc").addEventListener("change", function (e) { S.zc = +e.target.value; guarda(); render(); });
    var busca = RAIZ.querySelector("#ia-busca");
    busca.addEventListener("change", function () { var m = MUN[norm(busca.value)]; if (m) { seleciona(m.k, true); busca.value = ""; } });
    var mapa = RAIZ.querySelector("#ia-mapa"), tip = RAIZ.querySelector("#ia-tip");
    RAIZ.querySelectorAll("#ia-mapa path.m").forEach(function (p) { PATHS[p.getAttribute("data-k")] = p; });
    mapa.addEventListener("mousemove", function (e) {
      var p = e.target.closest ? e.target.closest("path.m") : null, m = p && MUN[p.getAttribute("data-k")];
      if (!m) { tip.style.display = "none"; return; }
      var r = mapa.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      tip.innerHTML = "<b>" + esc(m.nome) + "</b>" + (m.r != null && REGIOES[m.r] ? " · " + esc(REGIOES[m.r]) : "") + "<br>" + esc(txt(m));
      tip.style.display = "block";
      tip.style.left = Math.min(x + 14, r.width - tip.offsetWidth - 4) + "px";
      tip.style.top = (y + 16 + tip.offsetHeight > r.height ? y - tip.offsetHeight - 8 : y + 16) + "px";
    });
    mapa.addEventListener("mouseleave", function () { tip.style.display = "none"; });
    mapa.addEventListener("click", function (e) { var p = e.target.closest ? e.target.closest("path.m") : null; if (p && MUN[p.getAttribute("data-k")]) seleciona(p.getAttribute("data-k"), false); });
    RAIZ.querySelector("#ia-rank").addEventListener("click", function (e) { var li = e.target.closest("li[data-k]"); if (li) seleciona(li.getAttribute("data-k"), true); });
    RAIZ.querySelector("#ia-reg").addEventListener("click", function (e) { var n = e.target.closest("[data-r]"); if (!n) return; var r = +n.getAttribute("data-r"); S.reg = S.reg === r ? null : r; render(); });
    var det = RAIZ.querySelector("#ia-det");
    det.addEventListener("change", function (e) {
      var id = e.target.id;
      if (id === "ia-gd-c") { GD.c = e.target.value; var c = CULTURAS.filter(function (x) { return x[0] === GD.c; })[0]; GD.tb = c ? c[2] : GD.tb; RAIZ.querySelector("#ia-gd-tb").value = GD.tb; }
      if (id === "ia-gd-tb") GD.tb = +e.target.value || 0;
      if (id === "ia-gd-p") GD.plantio = e.target.value;
      if (id === "ia-gd-meta") GD.meta = e.target.value;
      if (/^ia-gd-/.test(id)) guardaGD();
    });
    det.addEventListener("click", function (e) {
      if (e.target.closest("#ia-gd-ok") && S.sel && MUN[S.sel]) calculaGD(MUN[S.sel]);
      var zb = e.target.closest("[data-zm]"); if (zb && S.sel && MUN[S.sel]) { S.zm = zb.getAttribute("data-zm"); guarda(); RAIZ.querySelector("#ia-zarc").innerHTML = calendario(MUN[S.sel]); }
    });
  }
  function seleciona(k, rolar) {
    S.sel = k; guarda();
    try { var u = new URL(location.href); u.searchParams.set("municipio", MUN[k].nome); history.replaceState(null, "", u.toString()); } catch (e) { /* ignora */ }
    render();
    if (rolar) RAIZ.querySelector("#ia-det").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // ---------- renderização ----------
  function render() {
    var sem = S.d === "s";
    RAIZ.querySelectorAll("#ia-gv [data-v]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-v") === S.v); });
    RAIZ.querySelectorAll("#ia-gd [data-d]").forEach(function (b) { var d = b.getAttribute("data-d"); b.classList.toggle("on", String(S.d) === d); });
    var usaMod = S.v === "chuva" || S.v === "bal";
    RAIZ.querySelectorAll("#ia-gm [data-m]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-m") === S.mod); b.disabled = !usaMod; });
    var quando = sem ? "próximos 7 dias" : (S.d === 0 ? "hoje" : rotDia(A.datas[S.d], S.d).replace(/ \d+$/, "") + ", " + dataBR(A.datas[S.d]));
    var modTxt = usaMod && S.mod !== "om" ? " · " + S.mod.toUpperCase() + " (média no município)" : "";
    if (CATEG[S.v]) quando = "próximos 7 dias";
    var gz = RAIZ.querySelector("#ia-gz"); gz.hidden = S.v !== "zarc";
    if (S.v === "zarc") {
      if (!Z) { RAIZ.querySelector("#ia-tmapa").textContent = "Carregando o zoneamento (ZARC)…"; carregaZarc().then(function (z) { if (z) { opcoesZarc(); render(); } else RAIZ.querySelector("#ia-tmapa").textContent = "Zoneamento (ZARC) indisponível no momento."; }); return; }
      if (S.zc == null || !Z.culturas[S.zc]) S.zc = padraoZarc();
      opcoesZarc();
      quando = rotDec(decAtual()) + " · " + Z.culturas[S.zc].nome + " (" + Z.culturas[S.zc].manejo.toLowerCase() + ")";
    }
    RAIZ.querySelector("#ia-gd").style.opacity = CATEG[S.v] ? ".45" : "1";
    RAIZ.querySelector("#ia-tmapa").textContent = (S.v === "man" && sem ? "Dias com manejo favorável ou razoável" : VARS[S.v].nome) + " — " + quando + modTxt;
    LISTA.forEach(function (m) {
      var p = PATHS[m.k]; if (!p) return;
      p.setAttribute("fill", cor(val(m)));
      p.classList.toggle("sel", m.k === S.sel);
      p.classList.toggle("fora", S.reg != null && m.r !== S.reg);
    });
    if (S.sel && PATHS[S.sel]) PATHS[S.sel].parentNode.appendChild(PATHS[S.sel]);
    legenda(); regioes(); ranking(); detalhe();   // resumo estadual (kpis) retirado: médias do estado não representam bem as condições locais
  }

  function legenda() {
    var h = "";
    if (CATEG[S.v]) h = CATEG[S.v].nomes.map(function (n, i) { return "<span><i style='background:" + CATEG[S.v].cores[i] + "'></i>" + n + "</span>"; }).join("");
    else if (S.v === "man" && S.d !== "s") h = MAN.nomes.map(function (n, i) { return "<span><i style='background:" + MAN.cores[i] + "'></i>" + n + "</span>"; }).join("");
    else {
      var e = escala(), un = S.v === "man" ? " dias" : S.v === "solo" ? "%" : " mm";
      h = e.c.map(function (c, i) {
        var a = e.thr[i - 1], b = e.thr[i], r = i === 0 ? "< " + n1(b) : i === e.thr.length ? "≥ " + n1(a) : n1(a) + " a " + n1(b);
        if (S.v === "man") r = i === 0 ? "0–1" : i === e.thr.length ? "6–7" : a + "–" + (b - 1);
        return "<span><i style='background:" + c + "'></i>" + r + un + "</span>";
      }).join("");
    }
    RAIZ.querySelector("#ia-leg").innerHTML = "<div class='ia-leg'>" + h + "<span><i style='background:#e6e9ed'></i>sem dado</span></div>";
  }

  function kpis() {
    var d = S.d === "s" ? null : S.d, rot = d == null ? "nos 7 dias" : d === 0 ? "hoje" : "em " + dataBR(A.datas[d]);
    var dd = d == null ? 0 : d;
    var cls = [0, 0, 0, 0], tot = 0;
    LISTA.forEach(function (m) { var c = m.d.man[dd]; if (c != null) { cls[c]++; tot++; } });
    var bom = tot ? Math.round((cls[0] + cls[1]) / tot * 100) : null;
    var ch7 = LISTA.map(function (m) { return soma(m.d.chuva); }), chD = LISTA.map(function (m) { return d == null ? soma(m.d.chuva) : m.d.chuva[d]; });
    var com20 = ch7.filter(function (x) { return x != null && x >= 20; }).length;
    var b7 = LISTA.map(function (m) { return soma(m.d.bal); }), def = b7.filter(function (x) { return x != null && x <= -20; }).length;
    var etD = LISTA.map(function (m) { return d == null ? soma(m.d.et0) : m.d.et0[d]; }), etMax = null;
    LISTA.forEach(function (m, i) { if (etD[i] != null && (!etMax || etD[i] > etMax.v)) etMax = { v: etD[i], n: m.nome }; });
    var so = media(LISTA.map(function (m) { return d == null ? media(m.solo) : m.solo[d]; }));
    function k(cor, tit, val, sub) { return "<div class='ia-kpi' style='--k:" + cor + "'><small>" + tit + "</small><strong>" + val + "</strong><em>" + sub + "</em></div>"; }
    RAIZ.querySelector("#ia-kpis").innerHTML =
      k(MAN.cores[0], "Manejo " + (d == null ? "hoje" : rot), bom == null ? "–" : bom + "%", "dos municípios com condição favorável ou razoável · " + cls[3] + " em nível crítico") +
      k("#1d91c0", "Chuva média " + rot, n1(media(chD)) + " mm", com20 + " municípios com 20 mm ou mais em 7 dias") +
      k("#8c510a", "Déficit hídrico em 7 dias", n0(def), "municípios com balanço ≤ −20 mm (chuva − ET0)") +
      k("#f03b20", "ET0 média " + rot, n1(media(etD)) + " mm", etMax ? "maior: " + esc(etMax.n) + " (" + n1(etMax.v) + " mm)" : "") +
      k("#2b8cbe", "Umidade do solo " + rot, n1(so) + "%", "média estadual, camada 0–28 cm");
  }

  function regioes() {
    var el = RAIZ.querySelector("#ia-reg");
    if (!REGIOES.length) { el.innerHTML = "<span>Sem regiões.</span>"; return; }
    var manDia = S.v === "man" && S.d !== "s", cat = CATEG[S.v];
    RAIZ.querySelector("#ia-treg").textContent = manDia ? "Condições de manejo por região" : cat ? VARS[S.v].curto + " por região (municípios)" : "Média por região";
    var linhas = REGIOES.map(function (nome, r) {
      var ms = LISTA.filter(function (m) { return m.r === r; });
      if (cat) {
        var q = cat.nomes.map(function () { return 0; }), tt = 0; ms.forEach(function (m) { var x = val(m); if (x != null) { q[x]++; tt++; } });
        var zr = S.v === "zarc", ativos = tt - (zr ? q[4] : q[3]);
        var ordem = !ativos ? -1 : zr ? (q[0] * 3 + q[1] * 2 + q[2]) / ativos : S.v === "ver" ? (q[2] * 2 + q[1]) / ativos : (q[0] * 2 + q[1]) / ativos;
        var txtR = !tt ? "–" : !ativos ? (zr ? "não zoneado" : "fora da estação") : zr ? Math.round((q[0] + q[1] + q[2]) / ativos * 100) + "% com plantio indicado" :
          S.v === "ver" ? Math.round((q[1] + q[2]) / ativos * 100) + "% em atenção/alerta" : Math.round(q[0] / ativos * 100) + "% favorável";
        return { r: r, nome: nome, ord: ordem, bar: q.map(function (n, i) { return tt ? "<i style='width:" + (n / tt * 100) + "%;background:" + cat.cores[i] + "' title='" + cat.nomes[i] + ": " + n + "'></i>" : ""; }).join(""), v: txtR };
      }
      if (manDia) {
        var c = [0, 0, 0, 0], t = 0; ms.forEach(function (m) { var x = val(m); if (x != null) { c[x]++; t++; } });
        return { r: r, nome: nome, ord: t ? (c[0] * 3 + c[1] * 2 + c[2]) / t : -1, bar: c.map(function (n, i) { return t ? "<i style='width:" + (n / t * 100) + "%;background:" + MAN.cores[i] + "' title='" + MAN.nomes[i] + ": " + n + "'></i>" : ""; }).join(""), v: t ? Math.round((c[0] + c[1]) / t * 100) + "% fav./raz." : "–" };
      }
      var v = media(ms.map(function (m) { return val(m); })), e = escala(), max = e.thr[e.thr.length - 1] * 1.15, min = Math.min(0, e.thr[0] * 1.15);
      var w = v == null ? 0 : S.v === "bal" ? Math.max(2, Math.min(100, Math.abs(v) / (Math.max(-e.thr[0], e.thr[e.thr.length - 1]) * 1.15) * 100))
        : Math.max(2, Math.min(100, (v - min) / (max - min) * 100));
      var t = v == null ? "–" : S.v === "man" ? n1(v) + " dias" : S.v === "solo" ? n1(v) + "%" : (S.v === "bal" ? sinal(v) : n1(v)) + " mm";
      return { r: r, nome: nome, ord: v == null ? -1e9 : v, bar: "<i style='width:" + w + "%;background:" + cor(v) + "'></i>", v: t };
    });
    linhas.sort(function (a, b) { return b.ord - a.ord; });
    el.innerHTML = linhas.map(function (l) {
      return "<span class='n" + (S.reg === l.r ? " on" : "") + "' data-r='" + l.r + "' title='Clique para destacar no mapa'>" + esc(l.nome) + "</span><span class='bar'>" + l.bar + "</span><span class='v'>" + l.v + "</span>";
    }).join("");
  }

  function ranking() {
    var sem = S.d === "s", base = LISTA.filter(function (m) { return S.reg == null || m.r === S.reg; });
    var tit, ord, fmt;
    if (S.v === "zarc") {
      tit = "Plantio indicado agora (menor risco)";
      ord = function (m) { var c = val(m); return c == null || c > 2 ? -1 : 3 - c; };
      fmt = function (m) { var c = val(m); return c != null && c <= 2 ? "risco " + [20, 30, 40][c] + "%" : "–"; };
    } else if (S.v === "ver") {
      tit = "Mais dias secos na estação chuvosa";
      ord = function (m) { var c = veranico(m); return c == null || c === 3 ? -1 : (obsSeco(m) || 0) + secoPrev(m) + c * 0.01; };
      fmt = function (m) { var o = obsSeco(m); return (o != null ? o + " obs. + " : "") + secoPrev(m) + " prev."; };
    } else if (S.v === "plant") {
      tit = "Melhores condições para plantio";
      ord = function (m) { var c = plantio(m); return c == null || c === 3 ? -1e9 : (2 - c) * 1000 + (soma(m.d.chuva) || 0); };
      fmt = function (m) { return n1(soma(m.d.chuva)) + " mm em 7 dias"; };
    } else if (S.v === "man") {
      tit = sem ? "Mais dias bons para manejo" : "Maiores janelas de manejo";
      ord = function (m) { return sem ? val(m) : (m.d.horas[S.d] || 0); };
      fmt = function (m) { return sem ? val(m) + " dias" : (m.d.jan[S.d] || "–"); };
    } else if (S.v === "bal") { tit = "Maiores déficits hídricos"; ord = function (m) { var v = val(m); return v == null ? -1e9 : -v; }; fmt = function (m) { return sinal(val(m)) + " mm"; }; }
    else if (S.v === "chuva") { tit = "Maiores volumes de chuva"; ord = function (m) { var v = val(m); return v == null ? -1e9 : v; }; fmt = function (m) { return n1(val(m)) + " mm"; }; }
    else if (S.v === "et0") { tit = "Maior demanda evaporativa (ET0)"; ord = function (m) { var v = val(m); return v == null ? -1e9 : v; }; fmt = function (m) { return n1(val(m)) + " mm"; }; }
    else { tit = "Solo mais seco"; ord = function (m) { var v = val(m); return v == null ? -1e9 : -v; }; fmt = function (m) { return n1(val(m)) + "%"; }; }
    var top = base.slice().sort(function (a, b) { return ord(b) - ord(a); }).slice(0, 12);
    RAIZ.querySelector("#ia-trank").textContent = tit + (S.reg != null ? " — " + REGIOES[S.reg] : "");
    RAIZ.querySelector("#ia-rank").innerHTML = top.map(function (m, i) { return "<li data-k='" + esc(m.k) + "'><span>" + (i + 1) + ". " + esc(m.nome) + "</span><b>" + esc(fmt(m)) + "</b></li>"; }).join("");
  }

  function detalhe() {
    var el = RAIZ.querySelector("#ia-det"), m = S.sel && MUN[S.sel];
    if (!m) { el.innerHTML = "<h3>Detalhe do município</h3><p style='margin:0;color:var(--tx2)'>Clique em um município no mapa, na lista ou use a busca para ver os próximos 7 dias.</p>"; return; }
    var ch = chuvas(m), et = m.d.et0, acum = 0;
    var dias = A.datas.map(function (d, i) {
      var c = m.d.man[i], b = ch[i] != null && et[i] != null ? ch[i] - et[i] : null;
      return "<div class='ia-dia" + (i === S.d ? " hj" : "") + "'><span class='d'>" + rotDia(d, i) + "</span>" +
        "<span class='man' style='background:" + (c == null ? "#aab3bd" : MAN.cores[c]) + "'>" + (c == null ? "–" : MAN.nomes[c]) + "</span>" +
        "<span class='jan'>" + (m.d.jan[i] ? m.d.jan[i] + " (" + m.d.horas[i] + " h)" : c == null ? "" : "sem janela") + "</span>" +
        "<dl><dt>Chuva</dt><dd>" + n1(ch[i]) + " mm</dd><dt>ET0</dt><dd>" + n1(et[i]) + " mm</dd><dt>Balanço</dt><dd style='color:" + (b == null ? "inherit" : b < 0 ? "#8c510a" : "#01665e") + "'>" + sinal(b) + "</dd><dt>Solo</dt><dd>" + n1(m.solo[i]) + "%</dd></dl></div>";
    }).join("");
    var tc = soma(ch), te = soma(et), tb = tc != null && te != null ? tc - te : null;
    var fonte = S.mod === "om" ? "" : " (chuva " + S.mod.toUpperCase() + ")";
    el.innerHTML = "<div class='ia-dett'><h3>" + esc(m.nome) + "</h3><span>" + (m.r != null && REGIOES[m.r] ? "Região " + esc(REGIOES[m.r]) + " · " : "") +
      "7 dias: chuva " + n1(tc) + " mm, ET0 " + n1(te) + " mm, balanço <b style='color:" + (tb < 0 ? "#8c510a" : "#01665e") + "'>" + sinal(tb) + " mm</b>" + fonte + "</span>" +
      (PREV_MUN ? "<a href='" + esc(PREV_MUN) + "?municipio=" + encodeURIComponent(m.nome) + "'>Previsão completa do município →</a>" : "") + "</div>" +
      "<div class='ia-ind'>" + indicadores(m) + "</div>" +
      "<div class='ia-dias'>" + dias + "</div><div class='ia-graf'>" + grafico(m, ch) + "</div>" +
      "<div class='ia-zarc' id='ia-zarc'>" + calendario(m) + "</div>" + caixaGD(m);
    if (!Z) carregaZarc().then(function () { var c = RAIZ.querySelector("#ia-zarc"); if (c && S.sel === m.k) c.innerHTML = calendario(m); });
  }

  // Calendário agrícola do município: janelas de plantio do ZARC por cultura e colheita estimada pelo ciclo médio
  function calendario(m) {
    if (!Z) return "<h4>Calendário de plantio (ZARC)</h4><p class='ia-nota'>Carregando o zoneamento…</p>";
    var g = ZK[m.k], por = g && Z.mun[g];
    if (!por) return "<h4>Calendário de plantio (ZARC)</h4><p class='ia-nota'>Não há culturas zoneadas para este município nas tábuas de risco do ZARC.</p>";
    var CR = { "2": "#1a7f37", "3": "#5cb85c", "4": "#b9dd9f" }, hj = decAtual();
    var idx = ordemZarc().filter(function (i) { return por[String(i)] && (S.zm === "Todos" || Z.culturas[i].manejo === S.zm); });
    var manejos = ["Sequeiro", "Irrigado", "Todos"].filter(function (x) { return x === "Todos" || ordemZarc().some(function (i) { return por[String(i)] && Z.culturas[i].manejo === x; }); });
    var h = "<div class='ia-cxh' style='display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;justify-content:space-between'><h4 style='margin:0'>Calendário de plantio e colheita (ZARC)</h4><span class='ia-grp'>" +
      manejos.map(function (x) { return "<button type='button' class='ia-b" + (S.zm === x ? " on" : "") + "' data-zm='" + x + "'>" + x + "</button>"; }).join("") + "</span></div>";
    if (!idx.length) return h + "<p class='ia-nota'>Nenhuma cultura zoneada neste manejo.</p>";
    h += "<div class='ia-zw'><table class='ia-zt'><thead><tr><th class='c'></th>" + MESES.map(function (x) { return "<th colspan='3'>" + x.slice(0, 3) + "</th>"; }).join("") + "</tr></thead><tbody>";
    idx.forEach(function (i) {
      var c = Z.culturas[i], s = por[String(i)], ciclo = cicloDe(c.nome), col = {};
      if (ciclo) for (var d = 0; d < 36; d++) if (s.charAt(d) !== "0") col[(d + Math.round(ciclo / 10)) % 36] = 1;
      h += "<tr class='pl'><td class='n'>" + esc(c.nome) + (S.zm === "Todos" ? "<span class='ia-ztag'>" + esc(c.manejo.toLowerCase()) + "</span>" : "") + (c.safra !== Z.culturas[padraoZarc()].safra && c.safra !== "perene" ? "<span class='ia-ztag' title='Portaria da safra anterior'>" + esc(c.safra) + "</span>" : "") + "</td>";
      for (var d2 = 0; d2 < 36; d2++) { var r = s.charAt(d2); h += "<td" + (d2 === hj ? " class='hj'" : "") + " style='background:" + (CR[r] || "#f1f3f5") + "' title='" + esc(c.nome) + " · " + rotDec(d2) + ": " + (CR[r] ? "plantio indicado, risco " + r + "0%" : "plantio não indicado") + "'></td>"; }
      h += "</tr>";
      if (ciclo) {
        h += "<tr class='col'><td class='n'>colheita (aprox.)</td>";
        for (var d3 = 0; d3 < 36; d3++) h += "<td" + (d3 === hj ? " class='hj'" : "") + " style='background:" + (col[d3] ? "#e0b26b" : "#fafbfc") + "'" + (col[d3] ? " title='Colheita aproximada: " + rotDec(d3) + " (ciclo médio de " + ciclo + " dias)'" : "") + "></td>";
        h += "</tr>";
      }
    });
    h += "</tbody></table></div>";
    var safra = Z.culturas[idx[0]].safra;
    return h + "<div class='ia-leg' style='margin-top:6px'><span><i style='background:" + CR["2"] + "'></i>plantio · risco 20%</span><span><i style='background:" + CR["3"] + "'></i>risco 30%</span><span><i style='background:" + CR["4"] + "'></i>risco 40%</span>" +
      "<span><i style='background:#e0b26b'></i>colheita aproximada</span><span><i style='background:#fff;outline:2px solid #1d2733;outline-offset:-2px'></i>decêndio atual</span></div>" +
      "<p class='ia-nota'>Plantio: Zoneamento Agrícola de Risco Climático (ZARC/MAPA), safra " + esc(safra) + " — risco de perda por fatores climáticos ao semear em cada decêndio. " +
      "O painel mostra a janela mais ampla entre os tipos de solo e ciclos zoneados: confira na portaria a janela do seu solo e da sua cultivar (o crédito rural e o seguro seguem a portaria). " +
      "Colheita: estimativa pelo ciclo médio da cultura, sem valor oficial; varia com a cultivar e o clima do ano. “1ª safra” e “2ª safra” seguem a nomenclatura do ZARC.</p>";
  }

  // Veranico e plantio no detalhe do município
  function indicadores(m) {
    var v = veranico(m), p = plantio(m), o = obsSeco(m), nm = m.d.nm, mes = mesAtual();
    function card(cls, tit, nome, cor0, texto) { return "<div class='ia-indc' style='--k:" + cor0 + "'><small>" + tit + "</small><b>" + nome + "</b><span>" + texto + "</span></div>"; }
    var est = nm ? "Estação chuvosa no município: " + MESES.filter(function (x, i) { return nm[i] != null && nm[i] >= CHUVOSO_MM; }).map(function (x) { return x.slice(0, 3); }).join(", ") + " (meses com normal ≥ " + CHUVOSO_MM + " mm)." : "";
    if (v == null && p == null) return "<p class='ia-nota'>Indicadores de veranico e plantio disponíveis após a próxima atualização dos dados.</p>";
    return card("", "Veranico", VER.nomes[v], VER.cores[v],
        v === 3 ? "Fora da estação chuvosa (normal de " + MESES[mes] + ": " + n0(nm[mes]) + " mm)." : secoPrev(m) + " de 7 dias previstos sem chuva (< 1 mm)" + (o != null ? "; " + o + (o === 1 ? " dia sem chuva observado até " : " dias seguidos sem chuva observados até ") + dataBR(A.seco_ate) + " (CHIRPS)" : "") + ".") +
      card("", "Plantio de sequeiro", PLANT.nomes[p], PLANT.cores[p],
        p === 3 ? "Fora da estação chuvosa. Para a época de plantio de cada cultura, consulte o calendário (ZARC)." : "Chuva prevista em 7 dias: " + n1(soma(m.d.chuva)) + " mm; balanço " + sinal(soma(m.d.bal)) + " mm; umidade do solo média " + n1(media(m.solo)) + "%.") +
      (est ? "<p class='ia-nota' style='grid-column:1/-1'>" + est + "</p>" : "");
  }

  // ---------- graus-dia (soma térmica) ----------
  var CULTURAS = [["milho", "Milho", 10, 30], ["soja", "Soja", 10, null], ["feijao", "Feijão", 10, null], ["sorgo", "Sorgo", 10, null], ["algodao", "Algodão", 15, null], ["outra", "Outra cultura", 10, null]];
  var GD = { c: "milho", tb: 10, plantio: null, meta: "" };
  try { var gg = JSON.parse(localStorage.getItem("inemaAgroGD") || "{}"); ["c", "plantio", "meta"].forEach(function (k) { if (gg[k] != null) GD[k] = gg[k]; }); if (typeof gg.tb === "number") GD.tb = gg.tb; } catch (e) { /* ignora */ }
  function guardaGD() { try { localStorage.setItem("inemaAgroGD", JSON.stringify(GD)); } catch (e) { /* ignora */ } }
  function isoDe(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function caixaGD(m) {
    if (!GD.plantio) { var d0 = dt(A.datas[0]); d0.setDate(d0.getDate() - 30); GD.plantio = isoDe(d0); }
    return "<div class='ia-gdx'><h4>Graus-dia acumulados (soma térmica)</h4>" +
      "<div class='ia-gdf'><label>Cultura <select id='ia-gd-c'>" + CULTURAS.map(function (c) { return "<option value='" + c[0] + "'" + (c[0] === GD.c ? " selected" : "") + ">" + c[1] + "</option>"; }).join("") + "</select></label>" +
      "<label>Temperatura base (°C) <input id='ia-gd-tb' type='number' step='0.5' min='0' max='20' value='" + GD.tb + "'></label>" +
      "<label>Data do plantio <input id='ia-gd-p' type='date' value='" + esc(GD.plantio) + "' max='" + A.datas[0] + "'></label>" +
      "<label>Meta (GD, opcional) <input id='ia-gd-meta' type='number' min='0' step='10' placeholder='ex.: 1500' value='" + esc(GD.meta) + "'></label>" +
      "<button type='button' class='ia-b on' id='ia-gd-ok'>Calcular</button></div><div id='ia-gd-res' class='ia-nota'>Escolha a cultura e a data do plantio e clique em Calcular.</div></div>";
  }
  function coordDe(m) {
    if (m.d.c) return m.d.c;
    var f = (A.geo.features || []).filter(function (x) { return norm(x.properties.nome) === m.k; })[0]; if (!f) return null;
    var s0 = 0, s1 = 0, n = 0; (function anda(c) { if (typeof c[0] === "number") { s0 += c[1]; s1 += c[0]; n++; } else c.forEach(anda); })(f.geometry.coordinates);
    return n ? [s0 / n, s1 / n] : null;
  }
  function jsonExt(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }); }
  function calculaGD(m) {
    var res = RAIZ.querySelector("#ia-gd-res"), c = coordDe(m), cul = CULTURAS.filter(function (x) { return x[0] === GD.c; })[0];
    var hoje = dt(A.datas[0]), pl = GD.plantio ? dt(GD.plantio) : null;
    if (!c || !pl || isNaN(pl)) { res.textContent = "Informe uma data de plantio válida."; return; }
    var dias = Math.round((hoje - pl) / 864e5);
    if (dias < 0) { res.textContent = "A data do plantio está no futuro: o cálculo usa só a previsão a partir dela."; }
    if (dias > 400) { res.textContent = "Use um plantio dos últimos 400 dias."; return; }
    res.textContent = "Buscando temperaturas…";
    var la = (+c[0]).toFixed(4), lo = (+c[1]).toFixed(4), base = "latitude=" + la + "&longitude=" + lo + "&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FBahia";
    var pedidos = [jsonExt("https://api.open-meteo.com/v1/forecast?" + base + "&past_days=" + Math.max(0, Math.min(92, dias)) + "&forecast_days=7")];
    if (dias > 92) {   // parte antiga: reanálise ERA5 (atraso de ~5 dias)
      var fimA = new Date(hoje); fimA.setDate(fimA.getDate() - 92);
      pedidos.push(jsonExt("https://archive-api.open-meteo.com/v1/archive?" + base + "&start_date=" + GD.plantio + "&end_date=" + isoDe(fimA)));
    }
    Promise.all(pedidos).then(function (rs) {
      var T = {};
      rs.slice().reverse().forEach(function (r) { (r.daily.time || []).forEach(function (d, i) { if (r.daily.temperature_2m_max[i] != null) T[d] = [r.daily.temperature_2m_max[i], r.daily.temperature_2m_min[i]]; }); });
      var tb = GD.tb, ts = cul && cul[3] && cul[0] === GD.c ? cul[3] : null, datas = Object.keys(T).filter(function (d) { return d >= GD.plantio; }).sort();
      var acObs = 0, acPrev = 0, ult7 = [], serie = [], hojeIso = A.datas[0];
      datas.forEach(function (d) {
        var tx = T[d][0], tn = T[d][1]; if (ts != null) tx = Math.min(tx, ts); tn = Math.max(tn, tb); tx = Math.max(tx, tb);
        var g = Math.max(0, (tx + tn) / 2 - tb);
        if (d < hojeIso) { acObs += g; ult7.push(g); if (ult7.length > 7) ult7.shift(); } else acPrev += g;
        serie.push([d, acObs + acPrev, d >= hojeIso]);
      });
      var med = media(ult7), meta = +GD.meta, txt = "<b>" + n0(acObs) + " GD</b> acumulados de " + dataBR(GD.plantio) + " até ontem" +
        " · previsão para os próximos 7 dias: <b>+" + n0(acPrev) + " GD</b> (total " + n0(acObs + acPrev) + ")" + (med != null ? " · média recente " + n1(med) + " GD/dia" : "") + ".";
      if (meta > 0) {
        var falta = meta - acObs - acPrev;
        if (falta <= 0) txt += " A meta de " + n0(meta) + " GD é atingida dentro da previsão.";
        else if (med > 0) { var dd = new Date(dt(A.datas[A.datas.length - 1])); dd.setDate(dd.getDate() + Math.ceil(falta / med)); txt += " Faltam " + n0(falta) + " GD: mantido o ritmo recente, a meta seria atingida por volta de <b>" + dataBR(isoDe(dd)) + "</b>."; }
      }
      res.innerHTML = txt + "<br>" + grafGD(serie) + "<span style='font-size:.85em'>Método da média diária: GD = (Tmáx + Tmín)/2 − Tbase, com Tmín limitada à base" + (ts ? " e Tmáx a " + ts + " °C" : "") +
        ". Temperaturas do Open-Meteo (até 92 dias atrás: modelos de previsão; antes disso: reanálise ERA5) no centro do município. A meta de GD depende da cultivar: consulte a recomendação técnica.</span>";
    }).catch(function (e) { res.textContent = "Não foi possível buscar as temperaturas agora (" + e.message + "). Tente de novo em instantes."; });
  }
  function grafGD(serie) {
    if (serie.length < 2) return "";
    var W = 700, H = 120, pe = 40, pd = 10, pt = 8, pb = 20, max = serie[serie.length - 1][1] || 1, n = serie.length;
    function x(i) { return pe + (W - pe - pd) * i / (n - 1); } function y(v) { return pt + (H - pt - pb) * (1 - v / max); }
    var obs = serie.filter(function (s) { return !s[2]; }), iP = obs.length - 1;
    var o = "<svg viewBox='0 0 " + W + " " + H + "' style='width:100%;height:auto;margin:6px 0' role='img' aria-label='Graus-dia acumulados'>";
    [0, .5, 1].forEach(function (f) { o += "<line x1='" + pe + "' x2='" + (W - pd) + "' y1='" + y(max * f) + "' y2='" + y(max * f) + "' stroke='#e3e8ee'/><text x='" + (pe - 4) + "' y='" + (y(max * f) + 4) + "' font-size='10' text-anchor='end' fill='#5b6773'>" + n0(max * f) + "</text>"; });
    o += "<polyline fill='none' stroke='#2e7d32' stroke-width='2' points='" + serie.slice(0, iP + 1).map(function (s, i) { return x(i) + "," + y(s[1]); }).join(" ") + "'/>";
    if (iP < n - 1) o += "<polyline fill='none' stroke='#2e7d32' stroke-width='2' stroke-dasharray='5 4' points='" + serie.slice(Math.max(iP, 0)).map(function (s, i) { return x(i + Math.max(iP, 0)) + "," + y(s[1]); }).join(" ") + "'/>";
    o += "<text x='" + pe + "' y='" + (H - 4) + "' font-size='10' fill='#5b6773'>" + dataBR(serie[0][0]) + "</text><text x='" + (W - pd) + "' y='" + (H - 4) + "' font-size='10' text-anchor='end' fill='#5b6773'>" + dataBR(serie[n - 1][0]) + " (tracejado: previsão)</text>";
    return o + "</svg>";
  }

  // barras de chuva × linha de ET0 e balanço acumulado
  function grafico(m, ch) {
    var W = 700, H = 170, pe = 34, pd = 40, pt = 14, pb = 26, n = A.datas.length, et = m.d.et0;
    var max = Math.max(8, Math.max.apply(null, ch.concat(et).map(function (x) { return x || 0; }))) * 1.1;
    var acc = [], s = 0; for (var i = 0; i < n; i++) { s += (ch[i] || 0) - (et[i] || 0); acc.push(s); }
    var amin = Math.min(0, Math.min.apply(null, acc)), amax = Math.max(0, Math.max.apply(null, acc)); if (amax - amin < 10) { amin -= 5; amax += 5; }
    var bw = (W - pe - pd) / n;
    function x(i) { return pe + bw * (i + 0.5); }
    function y(v) { return pt + (H - pt - pb) * (1 - v / max); }
    function y2(v) { return pt + (H - pt - pb) * (1 - (v - amin) / (amax - amin)); }
    var o = "<svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Chuva, ET0 e balanço acumulado'>";
    [0, 0.5, 1].forEach(function (f) { var v = max * f; o += "<line x1='" + pe + "' x2='" + (W - pd) + "' y1='" + y(v) + "' y2='" + y(v) + "' stroke='#e3e8ee'/><text x='" + (pe - 4) + "' y='" + (y(v) + 4) + "' font-size='10' text-anchor='end' fill='#5b6773'>" + Math.round(v) + "</text>"; });
    for (i = 0; i < n; i++) {
      var c = ch[i] || 0;
      o += "<rect x='" + (x(i) - bw * 0.3) + "' y='" + y(c) + "' width='" + (bw * 0.6) + "' height='" + Math.max(0, y(0) - y(c)) + "' fill='#1d91c0' rx='2'><title>Chuva " + n1(c) + " mm</title></rect>";
      o += "<text x='" + x(i) + "' y='" + (H - 8) + "' font-size='11' text-anchor='middle' fill='#5b6773'>" + rotDia(A.datas[i], i) + "</text>";
    }
    o += "<polyline fill='none' stroke='#f03b20' stroke-width='2' points='" + et.map(function (v, i) { return x(i) + "," + y(v || 0); }).join(" ") + "'/>";
    et.forEach(function (v, i) { o += "<circle cx='" + x(i) + "' cy='" + y(v || 0) + "' r='3' fill='#f03b20'><title>ET0 " + n1(v) + " mm</title></circle>"; });
    o += "<line x1='" + pe + "' x2='" + (W - pd) + "' y1='" + y2(0) + "' y2='" + y2(0) + "' stroke='#8c510a' stroke-dasharray='2 3' opacity='.5'/>";
    o += "<polyline fill='none' stroke='#8c510a' stroke-width='2' stroke-dasharray='6 4' points='" + acc.map(function (v, i) { return x(i) + "," + y2(v); }).join(" ") + "'/>";
    o += "<text x='" + (W - pd + 4) + "' y='" + (y2(acc[n - 1]) + 4) + "' font-size='10.5' fill='#8c510a'>" + sinal(acc[n - 1]) + "</text>";
    o += "<g font-size='11' fill='#1d2733'><rect x='" + pe + "' y='0' width='10' height='9' fill='#1d91c0'/><text x='" + (pe + 14) + "' y='9'>Chuva (mm)</text>" +
      "<line x1='" + (pe + 92) + "' x2='" + (pe + 110) + "' y1='5' y2='5' stroke='#f03b20' stroke-width='2'/><text x='" + (pe + 114) + "' y='9'>ET0 (mm)</text>" +
      "<line x1='" + (pe + 180) + "' x2='" + (pe + 198) + "' y1='5' y2='5' stroke='#8c510a' stroke-width='2' stroke-dasharray='6 4'/><text x='" + (pe + 202) + "' y='9'>Balanço acumulado (mm)</text></g>";
    return o + "</svg>";
  }
})();
