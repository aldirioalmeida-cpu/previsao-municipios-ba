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
    "#inema-agro .ia-dias{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}",
    "#inema-agro .ia-dia{border:1px solid var(--ln);border-radius:10px;padding:8px;text-align:center;font-size:.86em;background:#fff}",
    "#inema-agro .ia-dia.hj{border-color:var(--az);box-shadow:0 0 0 1px var(--az) inset}",
    "#inema-agro .ia-dia .d{font-weight:700}",
    "#inema-agro .ia-dia .man{display:block;border-radius:6px;color:#fff;font-weight:700;padding:3px 2px;margin:6px 0 2px;font-size:.92em}",
    "#inema-agro .ia-dia .jan{display:block;color:var(--tx2);font-size:.85em;min-height:1.2em}",
    "#inema-agro .ia-dia dl{margin:6px 0 0;display:grid;grid-template-columns:1fr auto;gap:2px 4px;text-align:left}",
    "#inema-agro .ia-dia dt{color:var(--tx2)}",
    "#inema-agro .ia-dia dd{margin:0;text-align:right;font-variant-numeric:tabular-nums;font-weight:600}",
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
    "#inema-agro .ia-carr{padding:40px;text-align:center;color:var(--tx2)}",
    "@media (max-width:1000px){#inema-agro .ia-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}#inema-agro .ia-corpo{grid-template-columns:1fr}#inema-agro .ia-links{grid-template-columns:repeat(2,minmax(0,1fr))}}",
    "@media (max-width:640px){#inema-agro{font-size:14px}#inema-agro .ia-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-agro .ia-kpi strong{font-size:1.3em}#inema-agro .ia-dias{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-agro ol.ia-rank{columns:1}#inema-agro input.ia-busca{min-width:0;width:100%}#inema-agro .ia-grp{width:100%}#inema-agro a.ia-bol-ult{flex-basis:100%}#inema-agro .ia-links{grid-template-columns:1fr}}"
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
    solo: { nome: "Umidade do solo (0–28 cm)", curto: "Umidade do solo", un: "%" }
  };
  var ESC = {
    bal: { d: [-6, -4, -2, 0, 2, 5, 10], s: [-40, -30, -20, -10, 0, 15, 40], c: ["#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#c7eae5", "#80cdc1", "#35978f", "#01665e"] },
    chuva: { d: [1, 5, 10, 20, 40, 80], s: [2, 10, 25, 50, 100, 150], c: ["#f3efe6", "#c6e9c2", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#0c2c84"] },
    et0: { d: [3, 4, 5, 6, 7], s: [20, 25, 30, 35, 42], c: ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"] },
    solo: { d: [10, 15, 20, 25, 30, 35], s: [10, 15, 20, 25, 30, 35], c: ["#8c510a", "#d8b365", "#f6e8c3", "#c7eae5", "#5ab4ac", "#2b8cbe", "#08589e"] },
    mans: { d: [2, 4, 6], s: [2, 4, 6], c: ["#d63031", "#f08c00", "#2e9e4f", "#1f6fd1"] }
  };
  function bin(thr, v) { var i = 0; while (i < thr.length && v >= thr[i]) i++; return i; }

  // ---------- estado ----------
  var S = { v: "man", d: 0, mod: "om", sel: null, reg: null };
  try { var g = JSON.parse(localStorage.getItem("inemaAgro1") || "{}"); if (VARS[g.v]) S.v = g.v; if (g.mod) S.mod = g.mod; if (g.sel) S.sel = g.sel; } catch (e) { /* sem armazenamento */ }
  function guarda() { try { localStorage.setItem("inemaAgro1", JSON.stringify({ v: S.v, mod: S.mod, sel: S.sel })); } catch (e) { /* ignora */ } }
  var qs = new URLSearchParams(location.search);
  if (qs.get("municipio")) S.sel = norm(qs.get("municipio"));

  var A, EXT, MUN = {}, LISTA = [], REGIOES = [], PATHS = {};

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
    if (ext && ext.modelos) {
      Object.keys(ext.modelos).forEach(function (mod) {
        var mm = ext.modelos[mod].municipios, idx = agro.datas.map(function (d) { return ext.datas.indexOf(d); });
        Object.keys(mm).forEach(function (nome) {
          var m = MUN[norm(nome)];
          if (m) m[mod] = idx.map(function (i) { return i < 0 ? null : mm[nome].mm[i]; });
        });
      });
    }
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
    if (S.v === "man" && S.d !== "s") return MAN.cores[v];
    var e = escala(); return e.c[bin(e.thr, v)];
  }
  function txt(m) {
    var v = val(m), sem = S.d === "s";
    if (v == null) return "sem dado";
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
    h += "<div class='ia-kpis' id='ia-kpis'></div>";
    h += "<div class='ia-ctl'>" +
      "<div class='ia-grp' id='ia-gv'><span>Mapa</span>" + Object.keys(VARS).map(function (k) { return "<button class='ia-b' data-v='" + k + "'>" + VARS[k].curto + "</button>"; }).join("") + "</div>" +
      "<div class='ia-grp' id='ia-gd'><span>Dia</span>" + A.datas.map(function (d, i) { return "<button class='ia-b' data-d='" + i + "'>" + rotDia(d, i) + "</button>"; }).join("") + "<button class='ia-b' data-d='s'>7 dias</button></div>" +
      "<div class='ia-grp' id='ia-gm'><span>Chuva</span><button class='ia-b' data-m='om' title='Open-Meteo: melhor modelo disponível, na sede do município'>Padrão</button>" +
      (EXT ? ["ecmwf", "gfs", "icon"].filter(function (k) { return EXT.modelos[k]; }).map(function (k) { return "<button class='ia-b' data-m='" + k + "' title='Maior valor da grade do modelo dentro do município'>" + k.toUpperCase() + "</button>"; }).join("") : "") + "</div>" +
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
      "<li><b>Chuva</b>: “Padrão” é a previsão do Open-Meteo na sede do município (mesma dos cards de previsão). ECMWF, GFS e ICON mostram o <b>maior</b> valor da grade de cada modelo dentro do município — úteis para comparar e avaliar a incerteza.</li>" +
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
    var modTxt = usaMod && S.mod !== "om" ? " · " + S.mod.toUpperCase() : "";
    RAIZ.querySelector("#ia-tmapa").textContent = (S.v === "man" && sem ? "Dias com manejo favorável ou razoável" : VARS[S.v].nome) + " — " + quando + modTxt;
    LISTA.forEach(function (m) {
      var p = PATHS[m.k]; if (!p) return;
      p.setAttribute("fill", cor(val(m)));
      p.classList.toggle("sel", m.k === S.sel);
      p.classList.toggle("fora", S.reg != null && m.r !== S.reg);
    });
    if (S.sel && PATHS[S.sel]) PATHS[S.sel].parentNode.appendChild(PATHS[S.sel]);
    legenda(); kpis(); regioes(); ranking(); detalhe();
  }

  function legenda() {
    var h = "";
    if (S.v === "man" && S.d !== "s") h = MAN.nomes.map(function (n, i) { return "<span><i style='background:" + MAN.cores[i] + "'></i>" + n + "</span>"; }).join("");
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
    var manDia = S.v === "man" && S.d !== "s";
    RAIZ.querySelector("#ia-treg").textContent = manDia ? "Condições de manejo por região" : "Média por região";
    var linhas = REGIOES.map(function (nome, r) {
      var ms = LISTA.filter(function (m) { return m.r === r; });
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
    if (S.v === "man") {
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
      "<div class='ia-dias'>" + dias + "</div><div class='ia-graf'>" + grafico(m, ch) + "</div>";
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
