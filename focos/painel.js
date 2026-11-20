/* INEMA — Painel de focos de calor (carregado pela página /inema/iniciativas/focos-de-calor). Gerado a partir de focos-de-calor-inema.html. */
(function () { if (document.getElementById('inema-fc-css')) return; var s = document.createElement('style'); s.id = 'inema-fc-css'; s.textContent = "#inema-fc{--az:#0b4f8a;--az2:#e8f0f8;--tx:#1d2733;--tx2:#5b6773;--ln:#e1e6ec;--bg:#fff;--fundo:#f5f7fa;--fogo:#e4572e;--fogo2:#fdeee9;--ok:#2e7d4f;--ruim:#c0392b;\n  font-family:system-ui,-apple-system,\"Segoe UI\",Roboto,Arial,sans-serif;color:var(--tx);font-size:15px;line-height:1.45;max-width:1400px;margin:0 auto}\n#inema-fc *{box-sizing:border-box}\n#inema-fc .fc-topo{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:.5rem 1.5rem;margin-bottom:.4rem}\n#inema-fc h2{font-size:1.6rem;margin:0;color:var(--tx);letter-spacing:-.01em}\n#inema-fc h2 span{color:var(--fogo)}\n#inema-fc .fc-atual{font-size:.82rem;color:var(--tx2)}\n#inema-fc .fc-atual b{color:var(--tx)}\n#inema-fc .fc-nav{display:flex;flex-wrap:wrap;gap:.3rem 1rem;font-size:.85rem;margin:.2rem 0 1rem}\n#inema-fc .fc-nav a{color:var(--az)}\n#inema-fc .fc-nav b{color:var(--tx)}\n/* boletins */\n#inema-fc .fc-bol{background:var(--bg);border:1px solid var(--ln);border-radius:14px;padding:1rem 1.1rem;margin:0 0 1.4rem;box-shadow:0 2px 10px rgba(20,40,70,.06)}\n#inema-fc .fc-bol-cab{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:.4rem 1rem}\n#inema-fc .fc-bol-busca{display:flex;flex-wrap:wrap;gap:.5rem .9rem;align-items:center;font-size:.82rem;color:var(--tx2)}\n#inema-fc .fc-bol-busca label{display:flex;align-items:center;gap:.4rem;margin:0;font-weight:600}\n#inema-fc .fc-bol-busca input,#inema-fc .fc-bol-busca select{font:inherit;font-size:.86rem;font-weight:400;padding:.32rem .6rem;border:1px solid var(--ln);border-radius:8px;background:var(--bg);color:var(--tx)}\n#inema-fc .fc-bol h3{font-size:1.05rem;margin:0 0 .15rem}\n#inema-fc .fc-bol .sub{font-size:.78rem;color:var(--tx2);margin:0 0 .8rem}\n#inema-fc .fc-bol-grade{display:grid;grid-template-columns:minmax(220px,280px) minmax(0,1fr);gap:1rem;align-items:start}\n#inema-fc .fc-bol-ult{display:flex;flex-direction:column;gap:.15rem;padding:1rem 1.1rem;border-radius:12px;text-decoration:none;color:var(--tx);background:linear-gradient(135deg,#fff 0%,var(--fogo2) 100%);border:1px solid #f6c9bb;transition:box-shadow .15s,transform .15s}\n#inema-fc .fc-bol-ult:hover{box-shadow:0 4px 14px rgba(228,87,46,.18);transform:translateY(-1px)}\n#inema-fc .fc-bol-ult .etq{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--fogo)}\n#inema-fc .fc-bol-ult .dt{font-size:1.6rem;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}\n#inema-fc .fc-bol-ult .sem{font-size:.82rem;color:var(--tx2)}\n#inema-fc .fc-bol-ult .bt{align-self:flex-start;margin-top:.6rem;background:var(--fogo);color:#fff;font-weight:600;font-size:.86rem;padding:.4rem .9rem;border-radius:999px}\n#inema-fc .fc-bol-ant{font-size:.72rem;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em;margin:0 0 .4rem}\n#inema-fc .fc-bol-lista{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.5rem}\n#inema-fc .fc-bol-lista li{margin:0}\n#inema-fc .fc-bol-lista li.oculto{display:none}\n#inema-fc .fc-bol.todos .fc-bol-lista li.oculto{display:block}\n#inema-fc .fc-bol-lista a{display:flex;align-items:center;gap:.6rem;padding:.55rem .7rem;border:1px solid var(--ln);border-radius:10px;text-decoration:none;color:var(--tx);background:var(--bg);transition:border-color .15s,background .15s}\n#inema-fc .fc-bol-lista a:hover{border-color:var(--az);background:var(--az2)}\n#inema-fc .fc-bol-lista .ic{flex:none;font-size:.62rem;font-weight:700;color:#fff;background:var(--ruim);border-radius:4px;padding:.2rem .3rem;letter-spacing:.03em}\n#inema-fc .fc-bol-lista .tx{display:flex;flex-direction:column;font-size:.88rem;font-weight:600;line-height:1.25}\n#inema-fc .fc-bol-lista small{font-weight:400;font-size:.74rem;color:var(--tx2)}\n#inema-fc .fc-bol-mais{margin-top:.6rem;border:1px solid var(--ln);background:var(--fundo);border-radius:999px;padding:.35rem .9rem;font:inherit;font-size:.84rem;color:var(--az);cursor:pointer}\n@media (max-width:700px){#inema-fc .fc-bol-grade{grid-template-columns:1fr}}\n#inema-fc .fc-carregando,#inema-fc .fc-erro{padding:1rem;border-radius:10px;background:var(--az2)}\n#inema-fc .fc-erro{background:#fdecea;color:#8a1c12}\n/* filtros */\n#inema-fc .fc-filtros{position:relative;z-index:20;background:var(--bg);border:1px solid var(--ln);border-radius:14px;padding:.8rem 1rem;box-shadow:0 2px 10px rgba(20,40,70,.06);display:grid;grid-template-columns:auto 1fr;gap:.55rem 1rem;align-items:center}\n#inema-fc .fc-rot{font-size:.72rem;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}\n#inema-fc .fc-linha{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center}\n#inema-fc .fc-seg{display:inline-flex;background:var(--fundo);border:1px solid var(--ln);border-radius:999px;padding:3px}\n#inema-fc .fc-seg button{border:0;background:transparent;padding:.35rem .85rem;border-radius:999px;font:inherit;font-size:.86rem;color:var(--tx2);cursor:pointer}\n#inema-fc .fc-seg button[aria-pressed=true]{background:var(--bg);color:var(--tx);font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,.12)}\n#inema-fc .fc-chip{border:1px solid var(--ln);background:var(--bg);padding:.32rem .75rem;border-radius:999px;font:inherit;font-size:.84rem;cursor:pointer;color:var(--tx)}\n#inema-fc .fc-chip[aria-pressed=true]{background:var(--tx);border-color:var(--tx);color:#fff}\n#inema-fc .fc-chip .bola{display:inline-block;width:.6rem;height:.6rem;border-radius:50%;margin-right:.35rem;vertical-align:baseline}\n#inema-fc select,#inema-fc input[type=date],#inema-fc input[type=text]{font:inherit;font-size:.86rem;padding:.32rem .6rem;border:1px solid var(--ln);border-radius:8px;background:var(--bg);color:var(--tx)}\n#inema-fc .fc-datas{display:none;gap:.35rem;align-items:center;font-size:.84rem;color:var(--tx2)}\n#inema-fc .fc-datas.vis{display:inline-flex}\n#inema-fc .fc-dica{font-size:.78rem;color:var(--tx2)}\n/* indicadores */\n#inema-fc .fc-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.8rem;margin:1rem 0}\n#inema-fc .fc-kpi{background:var(--bg);border:1px solid var(--ln);border-radius:14px;padding:.85rem 1rem}\n#inema-fc .fc-kpi .t{font-size:.76rem;color:var(--tx2);font-weight:600}\n#inema-fc .fc-kpi .v{font-size:1.75rem;font-weight:700;letter-spacing:-.02em;margin-top:.15rem;font-variant-numeric:tabular-nums}\n#inema-fc .fc-kpi .s{font-size:.78rem;color:var(--tx2);margin-top:.1rem}\n#inema-fc .fc-kpi.destaque{background:linear-gradient(135deg,#fff 0%,var(--fogo2) 100%);border-color:#f6c9bb}\n#inema-fc .fc-kpi.destaque .v{color:var(--fogo)}\n#inema-fc .sobe{color:var(--ruim);font-weight:700}\n#inema-fc .desce{color:var(--ok);font-weight:700}\n/* cartões */\n#inema-fc .fc-grade{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:1rem}\n#inema-fc .fc-card{background:var(--bg);border:1px solid var(--ln);border-radius:14px;padding:1rem;min-width:0}\n#inema-fc .fc-card h3{font-size:1rem;margin:0 0 .15rem}\n#inema-fc .fc-card .sub{font-size:.78rem;color:var(--tx2);margin:0 0 .6rem}\n#inema-fc .fc-leg{display:inline-flex;align-items:center;gap:.3rem;margin:0 .7rem 0 .35rem;white-space:nowrap;color:var(--tx)}\n#inema-fc .fc-leg i{display:inline-block;width:.8rem;height:.8rem;border-radius:50%;border:1px solid rgba(0,0,0,.15)}\n#inema-fc .c12{grid-column:span 12}#inema-fc .c8{grid-column:span 8}#inema-fc .c7{grid-column:span 7}#inema-fc .c6{grid-column:span 6}#inema-fc .c5{grid-column:span 5}#inema-fc .c4{grid-column:span 4}\n#inema-fc .fc-graf{position:relative;height:260px}\n#inema-fc .fc-graf.alto{height:320px}\n#inema-fc #fc-mapa{height:520px;border-radius:10px;overflow:hidden;background:#e9eef3}\n#inema-fc .fc-mapa-topo{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.5rem;align-items:center;margin-bottom:.5rem}\n#inema-fc .fc-aviso{font-size:.82rem;color:#7a4b00;background:#fff4e5;border-radius:8px;padding:.45rem .7rem;margin-bottom:.5rem}\n/* rankings */\n#inema-fc .fc-abas{display:flex;gap:.3rem;margin-bottom:.6rem;flex-wrap:wrap}\n#inema-fc .fc-rank{display:flex;flex-direction:column;gap:.3rem;max-height:420px;overflow:auto;padding-right:.3rem}\n#inema-fc .fc-item{display:grid;grid-template-columns:1.6rem minmax(0,1fr) auto;gap:.5rem;align-items:center;font-size:.86rem}\n#inema-fc .fc-item .p{color:var(--tx2);text-align:right;font-variant-numeric:tabular-nums}\n#inema-fc .fc-item .nome{position:relative;padding:.28rem .5rem;border-radius:6px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;cursor:pointer}\n#inema-fc .fc-item .nome i{position:absolute;inset:0 auto 0 0;background:var(--fogo2);z-index:0;border-radius:6px}\n#inema-fc .fc-item .nome span{position:relative;z-index:1}\n#inema-fc .fc-item .n{font-weight:700;font-variant-numeric:tabular-nums;text-align:right;min-width:3.2rem}\n#inema-fc .fc-item .n small{display:block;font-weight:400;color:var(--tx2);font-size:.72rem}\n#inema-fc .fc-vazio{color:var(--tx2);font-size:.88rem;padding:1rem 0}\n#inema-fc .fc-acoes{display:flex;gap:.5rem;flex-wrap:wrap}\n#inema-fc .fc-bt{border:1px solid var(--az);background:var(--bg);color:var(--az);padding:.4rem .9rem;border-radius:8px;font:inherit;font-size:.86rem;cursor:pointer}\n#inema-fc .fc-bt:hover{background:var(--az2)}\n#inema-fc .fc-rodape{font-size:.78rem;color:var(--tx2);margin-top:1rem;line-height:1.5}\n#inema-fc .leaflet-container{font:inherit}\n/* unidades de conservação */\n#inema-fc .fc-uc{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:1.2rem}\n#inema-fc .fc-uc-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem;margin-bottom:.8rem}\n#inema-fc .fc-uc-kpis .fc-kpi{padding:.65rem .8rem}\n#inema-fc .fc-uc-kpis .fc-kpi .v{font-size:1.4rem}\n#inema-fc .fc-uc-tab{width:100%;border-collapse:collapse;font-size:.84rem}\n#inema-fc .fc-uc-tab th{text-align:left;font-size:.72rem;color:var(--tx2);font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:.3rem .4rem;border:0;border-bottom:1px solid var(--ln);background:none;position:sticky;top:0;background:var(--bg)}\n#inema-fc .fc-uc-tab td{padding:.32rem .4rem;border:0;border-bottom:1px solid #f0f2f5;vertical-align:middle}\n#inema-fc .fc-uc-tab td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}\n#inema-fc .fc-uc-tab tr.lin{cursor:pointer}\n#inema-fc .fc-uc-tab tr.lin:hover td{background:#f7f9fb}\n#inema-fc .fc-uc-rol{max-height:430px;overflow:auto}\n#inema-fc .fc-tag{display:inline-block;font-size:.68rem;padding:.05rem .4rem;border-radius:999px;margin-left:.3rem;vertical-align:1px;white-space:nowrap}\n#inema-fc .fc-tag.Federal{background:#e3ecf7;color:#0b4f8a}#inema-fc .fc-tag.Estadual{background:#e3f3e9;color:#1f6b40}#inema-fc .fc-tag.Municipal{background:#f3ece0;color:#7a5418}\n#inema-fc .fc-tag.pi{background:#fde8e4;color:#9a2a17}#inema-fc .fc-tag.us{background:#eef0f3;color:#4b5563}\n@media (max-width:1100px){#inema-fc .fc-uc{grid-template-columns:1fr}}\n@media (min-height:1000px) and (min-width:1100px){#inema-fc .fc-filtros{position:sticky;top:0}}\n@media (max-width:1100px){#inema-fc .fc-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}#inema-fc .c8,#inema-fc .c7,#inema-fc .c6,#inema-fc .c5,#inema-fc .c4{grid-column:span 12}}\n@media (max-width:640px){#inema-fc .fc-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}#inema-fc .fc-filtros{grid-template-columns:1fr;position:static}#inema-fc #fc-mapa{height:380px}}"; document.head.appendChild(s); })();
/* INEMA · Meteorologia — Painel de focos de calor da Bahia (dados abertos INPE / Programa Queimadas).
   Dados preparados pelo robô do GitHub (focos/gerar_focos.py) e publicados no ramo "focos".
   Bibliotecas: Chart.js (gráficos), Leaflet (mapa) e SheetJS (planilha), carregadas do jsDelivr.
   A estrutura é montada por este script porque o editor do site apaga elementos vazios. */
(function () {
  var REPO = "aldirioalmeida-cpu/previsao-municipios-ba";
  var DADOS = "https://cdn.jsdelivr.net/gh/" + REPO + "@focos/";
  var CORES_BIOMA = { "Caatinga": "#d4a017", "Cerrado": "#c4572e", "Mata Atlântica": "#2e8b57", "Não informado": "#8a8f98" };
  var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  var raiz = document.getElementById("inema-fc");
  if (!raiz) return;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmt(n) { return Math.round(n).toLocaleString("pt-BR"); }
  function carregaScript(src) { return new Promise(function (ok, erro) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = erro; document.head.appendChild(s); }); }
  function carregaCss(href) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l); }
  function json(arq) { return fetch(DADOS + arq + "?t=" + Math.floor(Date.now() / 6e5), { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(arq + ": HTTP " + r.status); return r.json(); }); }

  // ---------- datas (UTC, padrão do INPE)
  function d2n(s) { var p = s.split("-"); return Date.UTC(+p[0], p[1] - 1, +p[2]) / 864e5; }   // dias desde 1970
  function n2d(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  function br(s) { var p = s.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  function anoDe(n) { return new Date(n * 864e5).getUTCFullYear(); }

  var META, REF, TODOS, MUN, HOJE, D0REF, D0TODOS;
  var UC = null, UCREF = null, UCTODOS = null, camadaUC = null, ucLayers = {}, ucDestaque = null;
  var sel = { serie: "ref", periodo: "ano", de: null, ate: null, biomas: {}, tipo: "estado", valor: "", sats: {}, rank: "mun", corMapa: "bioma", ucGrupo: "-1", mapaUC: "todos" };
  try { var g = JSON.parse(localStorage.getItem("inemaFocos") || "{}"); ["serie", "periodo", "rank"].forEach(function (k) { if (g[k]) sel[k] = g[k]; }); } catch (e) {}
  var graficos = {}, mapa = null, camadaPontos = null, camadasRef = {}, cachePontos = {};

  raiz.innerHTML =
    "<div class='fc-topo'><h2>Painel de focos de calor <span>· Bahia</span></h2><div class='fc-atual' id='fc-atual'>Carregando dados do INPE…</div></div>" +
    "<div id='fc-corpo' style='margin-top:.6rem'><div class='fc-carregando'>Carregando o histórico de focos (2003 até hoje)…</div></div>";
  boletins();

  // ---------- boletins
  // Os boletins continuam sendo editados no site como parágrafos com link, acima do painel
  // (ex.: "Clique Aqui para acessar o Boletim de Focos de Calor do dia 16/11/2026").
  // Aqui eles são lidos e reapresentados num cartão no estilo do painel; o mais recente fica em destaque.
  function boletins() {
    var SEM = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
    var titulo = "Boletins diários de focos de calor", itens = [], remover = [];
    for (var el = raiz.previousElementSibling; el; el = el.previousElementSibling) {
      var tag = el.tagName;
      if (tag === "SCRIPT" || tag === "STYLE") continue;
      var a = el.querySelector && el.querySelector("a[href]");
      if (/^H[1-6]$/.test(tag)) { if (/bolet/i.test(el.textContent)) { titulo = el.textContent.trim(); remover.push(el); } continue; }
      if (tag === "P" && !a && !el.textContent.trim()) { remover.push(el); continue; }
      if (!a) continue;
      var txt = el.textContent.replace(/\s+/g, " ").trim(), m = txt.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      var d = m ? new Date(+m[3], m[2] - 1, +m[1]) : null;
      itens.push({ href: a.getAttribute("href"), d: d, txt: txt, ordem: itens.length });
      remover.push(el);
    }
    if (!itens.length) return;
    itens.sort(function (x, y) { return (y.d ? y.d.getTime() : 0) - (x.d ? x.d.getTime() : 0) || x.ordem - y.ordem; });
    remover.forEach(function (e) { e.parentNode.removeChild(e); });
    function data(i) { return i.d ? ("0" + i.d.getDate()).slice(-2) + "/" + ("0" + (i.d.getMonth() + 1)).slice(-2) + "/" + i.d.getFullYear() : ""; }
    function rot(i) { return i.d ? "Boletim de " + data(i) : i.txt; }
    var MAX = 6, u = itens[0], resto = itens.slice(1);
    var MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
    function li(i) {
      return "<li><a href='" + esc(i.href) + "' target='_blank' rel='noopener'><span class='ic'>PDF</span>" +
        "<span class='tx'>" + esc(rot(i)) + (i.d ? "<small>" + SEM[i.d.getDay()] + "</small>" : "") + "</span></a></li>";
    }
    // meses que têm boletim (para navegar no acervo)
    var meses = [], vistoMes = {};
    itens.forEach(function (i) { if (!i.d) return; var k = iso(i.d).slice(0, 7); if (!vistoMes[k]) { vistoMes[k] = 1; meses.push(k); } });
    var datas = itens.filter(function (i) { return i.d; });
    var card = document.createElement("div");
    card.className = "fc-bol";
    card.innerHTML =
      "<div class='fc-bol-cab'><div><h3>" + esc(titulo) + "</h3><p class='sub'>Registros de focos de calor na Bahia em 24 horas, publicados pelo INEMA · " + fmt(itens.length) + " boletins em PDF</p></div>" +
        (datas.length > 1 ? "<div class='fc-bol-busca'><label>Buscar por data <input type='date' id='fc-bol-data' min='" + iso(datas[datas.length - 1].d) + "' max='" + iso(datas[0].d) + "'></label>" +
          (meses.length > 1 ? "<label>ou mês <select id='fc-bol-mes'><option value=''>Mais recentes</option>" + meses.map(function (k) { return "<option value='" + k + "'>" + MES[+k.slice(5) - 1] + " de " + k.slice(0, 4) + "</option>"; }).join("") + "</select></label>" : "") +
        "</div>" : "") +
      "</div>" +
      "<div class='fc-bol-grade'>" +
        "<a class='fc-bol-ult' href='" + esc(u.href) + "' target='_blank' rel='noopener'>" +
          "<span class='etq'>Mais recente</span><span class='dt'>" + esc(u.d ? data(u) : u.txt) + "</span>" +
          (u.d ? "<span class='sem'>" + SEM[u.d.getDay()] + "</span>" : "") + "<span class='bt'>Abrir boletim ↗</span></a>" +
        (resto.length ? "<div><div class='fc-bol-ant' id='fc-bol-rot'>Anteriores</div><ul class='fc-bol-lista' id='fc-bol-lista'></ul>" +
          "<button type='button' class='fc-bol-mais' id='fc-bol-mais' hidden></button></div>" : "") +
      "</div>";
    raiz.insertBefore(card, raiz.firstChild);
    if (!resto.length) return;
    var lista = card.querySelector("#fc-bol-lista"), rotulo = card.querySelector("#fc-bol-rot"), mais = card.querySelector("#fc-bol-mais");
    var inData = card.querySelector("#fc-bol-data"), inMes = card.querySelector("#fc-bol-mes"), aberto = false;
    function mostra() {
      var dSel = inData && inData.value, mSel = inMes && inMes.value, sel;
      mais.hidden = true;
      if (dSel) {
        sel = itens.filter(function (i) { return i.d && iso(i.d) === dSel; });
        var p = dSel.split("-"), txt = p[2] + "/" + p[1] + "/" + p[0];
        if (sel.length) { rotulo.textContent = "Boletim de " + txt; lista.innerHTML = sel.map(li).join(""); return; }
        // sem boletim nesse dia: mostra os mais próximos (antes e depois)
        var alvo = new Date(+p[0], p[1] - 1, +p[2]).getTime();
        sel = datas.slice().sort(function (a, b) { return Math.abs(a.d - alvo) - Math.abs(b.d - alvo); }).slice(0, 4)
          .sort(function (a, b) { return b.d - a.d; });
        rotulo.textContent = "Não há boletim em " + txt + " · datas mais próximas";
        lista.innerHTML = sel.map(li).join(""); return;
      }
      if (mSel) {
        sel = itens.filter(function (i) { return i.d && iso(i.d).slice(0, 7) === mSel; });
        rotulo.textContent = MES[+mSel.slice(5) - 1].replace(/^./, function (c) { return c.toUpperCase(); }) + " de " + mSel.slice(0, 4) + " · " + sel.length + (sel.length > 1 ? " boletins" : " boletim");
        lista.innerHTML = sel.map(li).join(""); return;
      }
      rotulo.textContent = "Anteriores";
      sel = aberto ? resto.slice(0, 60) : resto.slice(0, MAX);
      lista.innerHTML = sel.map(li).join("");
      if (resto.length > MAX) {
        mais.hidden = false;
        mais.textContent = aberto ? "Mostrar menos" : "Ver mais boletins";
      }
    }
    mais.onclick = function () { aberto = !aberto; mostra(); };
    if (inData) inData.onchange = function () { if (inMes) inMes.value = ""; mostra(); };
    if (inMes) inMes.onchange = function () { if (inData) inData.value = ""; mostra(); };
    mostra();
  }

  function montaEstrutura() {
    $("fc-corpo").innerHTML =
      "<div class='fc-filtros'>" +
        "<div class='fc-rot'>Satélites</div><div class='fc-linha'><div class='fc-seg' id='fc-serie'></div><span class='fc-dica' id='fc-dica-serie'></span></div>" +
        "<div class='fc-rot'>Período</div><div class='fc-linha'><div class='fc-seg' id='fc-periodo'></div>" +
          "<span class='fc-datas' id='fc-datas'><input type='date' id='fc-de'> até <input type='date' id='fc-ate'></span></div>" +
        "<div class='fc-rot'>Bioma</div><div class='fc-linha' id='fc-biomas'></div>" +
        "<div class='fc-rot'>Recorte</div><div class='fc-linha'><select id='fc-tipo'><option value='estado'>Bahia inteira</option><option value='reg'>Região climática</option><option value='ti'>Território de Identidade</option><option value='mun'>Município</option></select>" +
          "<select id='fc-valor' hidden></select><input type='text' id='fc-busca' list='fc-lista-mun' placeholder='Digite o município…' hidden><datalist id='fc-lista-mun'></datalist></div>" +
        "<div class='fc-rot' id='fc-rot-sat' hidden>Satélite</div><div class='fc-linha' id='fc-sats' hidden></div>" +
      "</div>" +
      "<div class='fc-kpis' id='fc-kpis'></div>" +
      "<div class='fc-grade'>" +
        "<div class='fc-card c8'><h3 id='fc-t-serie'>Focos no período</h3><p class='sub' id='fc-s-serie'></p><div class='fc-graf'><canvas id='g-serie'></canvas></div></div>" +
        "<div class='fc-card c4'><h3>Por bioma</h3><p class='sub'>Participação no período</p><div class='fc-graf'><canvas id='g-bioma'></canvas></div></div>" +
        "<div class='fc-card c6'><h3 id='fc-t-acum'>Acumulado no ano</h3><p class='sub' id='fc-s-acum'></p><div class='fc-graf'><canvas id='g-acum'></canvas></div></div>" +
        "<div class='fc-card c6'><h3 id='fc-t-mes'>Focos por mês</h3><p class='sub' id='fc-s-mes'></p><div class='fc-graf'><canvas id='g-mes'></canvas></div></div>" +
        "<div class='fc-card c7'><div class='fc-mapa-topo'><div><h3>Mapa dos focos</h3><p class='sub' id='fc-s-mapa' style='margin:0'></p></div>" +
          "<div class='fc-linha'><div class='fc-seg' id='fc-mapa-uc'></div><div class='fc-seg' id='fc-cor-mapa'></div></div></div><div id='fc-aviso-mapa'></div><div id='fc-mapa'></div></div>" +
        "<div class='fc-card c5'><h3>Onde mais queimou</h3><p class='sub'>Ranking do período — clique para filtrar</p><div class='fc-abas fc-seg' id='fc-abas'></div><div class='fc-rank' id='fc-rank'></div></div>" +
        "<div class='fc-card c12' id='fc-card-uc'><div class='fc-mapa-topo'><div><h3>Focos em unidades de conservação</h3><p class='sub' id='fc-s-uc' style='margin:0'>Carregando…</p></div>" +
          "<div class='fc-seg' id='fc-uc-grupo'></div></div><div id='fc-aviso-uc'></div><div class='fc-uc'><div><div class='fc-uc-kpis' id='fc-uc-kpis'></div>" +
          "<div class='fc-graf' style='height:220px'><canvas id='g-uc'></canvas></div></div><div class='fc-uc-rol' id='fc-uc-rank'></div></div></div>" +
        "<div class='fc-card c12' id='fc-card-sat' hidden><h3>Por satélite</h3><p class='sub'>Focos detectados por cada satélite no período (um mesmo fogo pode ser detectado por vários)</p><div class='fc-graf'><canvas id='g-sat'></canvas></div></div>" +
      "</div>" +
      "<div class='fc-card' style='margin-top:1rem'><div class='fc-acoes'><button type='button' class='fc-bt' id='fc-xls'>Baixar focos do período (XLS)</button>" +
        "<button type='button' class='fc-bt' id='fc-xls-mun'>Baixar totais por município (XLS)</button>" +
        "<button type='button' class='fc-bt' id='fc-xls-uc'>Baixar totais por unidade de conservação (XLS)</button></div></div>" +
      "<p class='fc-rodape' id='fc-rodape'></p>";
  }

  // ---------- índices dos dados
  function prepara(tab, temSat) {
    var L = tab.linhas, n = L.length, o = { dia: new Int32Array(n), mun: new Int16Array(n), bio: new Int8Array(n), q: new Int32Array(n) };
    if (temSat) { o.sat = new Int8Array(n); o.frp = new Float32Array(n); }
    for (var i = 0; i < n; i++) {
      var r = L[i]; o.dia[i] = r[0]; o.mun[i] = r[1]; o.bio[i] = r[2];
      if (temSat) { o.sat[i] = r[3]; o.q[i] = r[4]; o.frp[i] = r[5]; } else o.q[i] = r[3];
    }
    o.n = n; o.d0 = d2n(tab.d0); return o;
  }

  // ---------- filtros
  function intervalo() {
    var h = HOJE, de, ate = h;
    if (sel.periodo === "hoje") de = h;
    else if (sel.periodo === "7d") de = h - 6;
    else if (sel.periodo === "30d") de = h - 29;
    else if (sel.periodo === "mes") de = d2n(n2d(h).slice(0, 8) + "01");
    else if (sel.periodo === "ano") de = d2n(n2d(h).slice(0, 4) + "-01-01");
    else { de = sel.de != null ? sel.de : h - 29; ate = sel.ate != null ? sel.ate : h; }
    var min = sel.serie === "ref" ? D0REF : D0TODOS;
    if (de < min) de = min; if (ate > h) ate = h; if (ate < de) ate = de;
    return [de, ate];
  }
  function filtroMun() {
    var t = sel.tipo, v = sel.valor;
    if (t === "estado" || v === "") return null;
    var ok = new Uint8Array(MUN.length);
    MUN.forEach(function (m, i) { ok[i] = (t === "reg" ? m[1] == v : t === "ti" ? m[2] == v : i == v) ? 1 : 0; });
    return ok;
  }
  function algumBioma() { for (var k in sel.biomas) return true; return false; }
  function algumSat() { for (var k in sel.sats) return true; return false; }
  // percorre os dados aplicando bioma/recorte/satélite; cb(diaAbsoluto, i)
  function percorre(D, de, ate, cb) {
    var fm = filtroMun(), fb = algumBioma(), fs = D.sat && algumSat();
    for (var i = 0; i < D.n; i++) {
      var d = D.d0 + D.dia[i];
      if (d < de || d > ate) continue;
      if (fb && !sel.biomas[D.bio[i]]) continue;
      if (fm && !fm[D.mun[i]]) continue;
      if (fs && !sel.sats[D.sat[i]]) continue;
      cb(d, i);
    }
  }
  function soma(D, de, ate) { var t = 0; percorre(D, de, ate, function (d, i) { t += D.q[i]; }); return t; }
  function dados() { return sel.serie === "ref" ? REF : TODOS; }
  function descRecorte() {
    if (sel.tipo === "estado" || sel.valor === "") return "Bahia";
    if (sel.tipo === "reg") return "Região " + META.regioes[sel.valor];
    if (sel.tipo === "ti") return "TI " + META.territorios[sel.valor];
    return MUN[sel.valor][0];
  }

  // ---------- desenho dos filtros
  function seg(id, itens, atual, cb) {
    $(id).innerHTML = itens.map(function (it) { return "<button type='button' data-v='" + esc(it[0]) + "' aria-pressed='" + (String(it[0]) === String(atual)) + "'" + (it[2] ? " title='" + esc(it[2]) + "'" : "") + ">" + esc(it[1]) + "</button>"; }).join("");
    $(id).onclick = function (e) { var b = e.target.closest("button"); if (b) cb(b.getAttribute("data-v")); };
  }
  function desenhaFiltros() {
    seg("fc-serie", [["ref", "Satélite de referência", "AQUA (tarde) — mesma série desde 2003, a usada para comparar anos"], ["todos", "Todos os satélites", "Todos os satélites desde " + br(META.todos_desde)]], sel.serie, function (v) {
      sel.serie = v; if (v === "todos" && !TODOS) return carregaTodos(); atualiza();
    });
    $("fc-dica-serie").textContent = sel.serie === "ref" ? "AQUA_M-T · série comparável desde 2003" : "desde " + br(META.todos_desde) + " · inclui satélites geoestacionários (GOES)";
    seg("fc-periodo", [["hoje", "Hoje"], ["7d", "7 dias"], ["30d", "30 dias"], ["mes", "Este mês"], ["ano", "Este ano"], ["outro", "Escolher datas"]], sel.periodo, function (v) {
      sel.periodo = v;
      if (v === "outro") { var iv = intervalo(); sel.de = iv[0]; sel.ate = iv[1]; }
      atualiza();
    });
    $("fc-datas").className = "fc-datas" + (sel.periodo === "outro" ? " vis" : "");
    var iv = intervalo(); $("fc-de").value = n2d(iv[0]); $("fc-ate").value = n2d(iv[1]);
    $("fc-de").min = $("fc-ate").min = n2d(sel.serie === "ref" ? D0REF : D0TODOS); $("fc-de").max = $("fc-ate").max = n2d(HOJE);
    $("fc-biomas").innerHTML = "<button type='button' class='fc-chip' data-b='todos' aria-pressed='" + !algumBioma() + "'>Todos</button>" +
      META.biomas.map(function (b, i) { return b === "Não informado" ? "" : "<button type='button' class='fc-chip' data-b='" + i + "' aria-pressed='" + !!sel.biomas[i] + "'><span class='bola' style='background:" + (CORES_BIOMA[b] || "#999") + "'></span>" + esc(b) + "</button>"; }).join("");
    var mostraSat = sel.serie === "todos";
    $("fc-rot-sat").hidden = $("fc-sats").hidden = !mostraSat;
    if (mostraSat) $("fc-sats").innerHTML = "<button type='button' class='fc-chip' data-s='todos' aria-pressed='" + !algumSat() + "'>Todos</button>" +
      META.satelites.map(function (s, i) { return "<button type='button' class='fc-chip' data-s='" + i + "' aria-pressed='" + !!sel.sats[i] + "'>" + esc(s) + "</button>"; }).join("");
    $("fc-tipo").value = sel.tipo;
    var v = $("fc-valor"), b = $("fc-busca");
    v.hidden = !(sel.tipo === "reg" || sel.tipo === "ti"); b.hidden = sel.tipo !== "mun";
    if (sel.tipo === "reg" || sel.tipo === "ti") {
      var lista = sel.tipo === "reg" ? META.regioes : META.territorios;
      v.innerHTML = "<option value=''>Escolha…</option>" + lista.map(function (n, i) { return [n, i]; }).sort(function (a, c) { return a[0].localeCompare(c[0], "pt"); })
        .map(function (p) { return "<option value='" + p[1] + "'" + (String(p[1]) === String(sel.valor) ? " selected" : "") + ">" + esc(p[0]) + "</option>"; }).join("");
    }
    if (sel.tipo === "mun") b.value = sel.valor !== "" ? MUN[sel.valor][0] : "";
  }

  // ---------- indicadores
  function kpi(t, v, s, cls) { return "<div class='fc-kpi" + (cls ? " " + cls : "") + "'><div class='t'>" + t + "</div><div class='v'>" + v + "</div><div class='s'>" + (s || "") + "</div></div>"; }
  function delta(a, b) {
    if (!b) return a ? "sem focos no período de comparação" : "—";
    var p = (a - b) / b * 100;
    return "<span class='" + (p > 0 ? "sobe" : p < 0 ? "desce" : "") + "'>" + (p > 0 ? "▲ +" : p < 0 ? "▼ " : "") + p.toFixed(0) + "%</span>";
  }
  function mediaHistorica(de, ate) {   // média do mesmo intervalo do calendário nos anos anteriores (só referência)
    var a = anoDe(ate), tot = 0, n = 0;
    for (var y = META.anos_ref[0]; y < a; y++) {
      var off = d2n(y + n2d(de).slice(4)) - de;
      if (anoDe(de) !== a) continue;
      tot += soma(REF, de + off, ate + off); n++;
    }
    return n ? [tot / n, n] : null;
  }

  // ---------- gráficos
  function grafico(id, cfg) {
    if (graficos[id]) { graficos[id].data = cfg.data; graficos[id].options = cfg.options; graficos[id].update("none"); return; }
    graficos[id] = new Chart($(id), cfg);
  }
  var baseOpc = function (extra) {
    var o = { responsive: true, maintainAspectRatio: false, animation: { duration: 250 }, interaction: { mode: "index", intersect: false },
      plugins: { legend: { labels: { boxWidth: 12, usePointStyle: true, font: { size: 11 } } }, tooltip: { callbacks: {} } },
      scales: { x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, autoSkip: true } }, y: { beginAtZero: true, grid: { color: "#eef1f4" }, ticks: { font: { size: 11 } } } } };
    for (var k in extra) o[k] = extra[k];
    return o;
  };

  function atualiza() {
    try { localStorage.setItem("inemaFocos", JSON.stringify({ serie: sel.serie, periodo: sel.periodo, rank: sel.rank })); } catch (e) {}
    desenhaFiltros();
    var D = dados(), iv = intervalo(), de = iv[0], ate = iv[1], nd = ate - de + 1;
    var porDia = new Float64Array(nd), porBio = {}, porMun = new Float64Array(MUN.length), porSat = {}, frp = 0, total = 0;
    percorre(D, de, ate, function (d, i) {
      var q = D.q[i]; total += q; porDia[d - de] += q; porBio[D.bio[i]] = (porBio[D.bio[i]] || 0) + q; porMun[D.mun[i]] += q;
      if (D.sat) { porSat[D.sat[i]] = (porSat[D.sat[i]] || 0) + q; frp += D.frp[i]; }
    });
    var desc = descRecorte(), txtPer = de === ate ? br(n2d(de)) : br(n2d(de)) + " a " + br(n2d(ate));
    // KPIs
    var antes = soma(D, d2n((anoDe(de) - 1) + n2d(de).slice(4)), d2n((anoDe(ate) - 1) + n2d(ate).slice(4)));
    var media = sel.serie === "ref" ? mediaHistorica(de, ate) : null;
    var munsAf = 0, maxDia = 0, diaMax = de; for (var m = 0; m < porMun.length; m++) if (porMun[m] > 0) munsAf++;
    for (var k = 0; k < nd; k++) if (porDia[k] > maxDia) { maxDia = porDia[k]; diaMax = de + k; }
    $("fc-kpis").innerHTML =
      kpi("Focos no período", fmt(total), esc(desc) + " · " + txtPer, "destaque") +
      kpi("Vs. mesmo período do ano anterior", delta(total, antes), fmt(antes) + " focos em " + (anoDe(de) - 1)) +
      (media ? kpi("Vs. média histórica", delta(total, media[0]), "média de " + fmt(media[0]) + " focos (" + META.anos_ref[0] + "–" + (anoDe(ate) - 1) + ")")
             : kpi("FRP total", frp ? fmt(frp) + " <small style='font-size:.9rem'>MW</small>" : "—", "potência radiativa somada dos focos")) +
      kpi("Municípios com focos", fmt(munsAf), "de 417 municípios da Bahia") +
      kpi("Dia com mais focos", maxDia ? fmt(maxDia) : "—", maxDia ? br(n2d(diaMax)) : "nenhum foco no período");

    // Série do período (diária, semanal ou mensal)
    var rot = [], val = [], agr = nd <= 92 ? "dia" : nd <= 730 ? "semana" : "mes";
    if (agr === "dia") { for (k = 0; k < nd; k++) { var s = n2d(de + k); rot.push(s.slice(8) + "/" + s.slice(5, 7)); val.push(porDia[k]); } }
    else if (agr === "semana") { for (k = 0; k < nd; k += 7) { var t = 0; for (var j = k; j < Math.min(k + 7, nd); j++) t += porDia[j]; s = n2d(de + k); rot.push(s.slice(8) + "/" + s.slice(5, 7) + "/" + s.slice(2, 4)); val.push(t); } }
    else { var mm = {}; for (k = 0; k < nd; k++) { var c = n2d(de + k).slice(0, 7); mm[c] = (mm[c] || 0) + porDia[k]; } Object.keys(mm).forEach(function (c) { rot.push(MESES[+c.slice(5) - 1] + "/" + c.slice(2, 4)); val.push(mm[c]); }); }
    $("fc-t-serie").textContent = "Focos por " + agr;
    $("fc-s-serie").textContent = desc + " · " + txtPer;
    grafico("g-serie", { type: "bar", data: { labels: rot, datasets: [{ label: "Focos", data: val, backgroundColor: "#e4572e", borderRadius: 3, maxBarThickness: 26 }] }, options: baseOpc({ plugins: { legend: { display: false } } }) });

    // Bioma
    var bl = [], bv = [], bc = [];
    META.biomas.forEach(function (b, i) { if (porBio[i]) { bl.push(b); bv.push(porBio[i]); bc.push(CORES_BIOMA[b] || "#999"); } });
    grafico("g-bioma", { type: "doughnut", data: { labels: bl, datasets: [{ data: bv, backgroundColor: bc, borderWidth: 2, borderColor: "#fff" }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: "62%", plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 10 } },
        tooltip: { callbacks: { label: function (c) { var t = c.dataset.data.reduce(function (a, b) { return a + b; }, 0); return c.label + ": " + fmt(c.raw) + " (" + (c.raw / t * 100).toFixed(0) + "%)"; } } } } } });

    // Acumulado no ano: ano do fim do período × ano anterior × média (referência)
    var A = anoDe(ate), ini = d2n(A + "-01-01"), fim = Math.min(d2n(A + "-12-31"), HOJE);
    function acum(y) { var i0 = d2n(y + "-01-01"), i1 = d2n(y + "-12-31"), arr = new Float64Array(i1 - i0 + 1); percorre(D, i0, i1, function (d, i) { arr[d - i0] += D.q[i]; }); for (var x = 1; x < arr.length; x++) arr[x] += arr[x - 1]; return arr; }
    var cur = acum(A), prev = acum(A - 1), rotA = [], dsA = [];
    for (k = 0; k < 365; k++) { s = n2d(d2n("2001-01-01") + k); rotA.push(s.slice(8) === "01" ? MESES[+s.slice(5, 7) - 1] : ""); }
    var corte = fim - ini + 1;
    dsA.push({ label: String(A), data: Array.prototype.slice.call(cur, 0, 365).map(function (v, x) { return x < corte ? v : null; }), borderColor: "#e4572e", backgroundColor: "rgba(228,87,46,.08)", fill: true, pointRadius: 0, borderWidth: 2.5, tension: .2 });
    if (A - 1 >= (sel.serie === "ref" ? META.anos_ref[0] : anoDe(D0TODOS))) dsA.push({ label: String(A - 1), data: Array.prototype.slice.call(prev, 0, 365), borderColor: "#6b7a8f", pointRadius: 0, borderWidth: 1.6, borderDash: [5, 4], tension: .2 });
    if (sel.serie === "ref" && A - 1 > META.anos_ref[0]) {
      var med = new Float64Array(365), nA = 0;
      for (var y = META.anos_ref[0]; y < A; y++) { var ay = acum(y); for (k = 0; k < 365; k++) med[k] += ay[k]; nA++; }
      dsA.push({ label: "Média " + META.anos_ref[0] + "–" + (A - 1), data: Array.prototype.map.call(med, function (v) { return v / nA; }), borderColor: "#0b4f8a", pointRadius: 0, borderWidth: 1.6, tension: .2 });
    }
    $("fc-t-acum").textContent = "Acumulado em " + A;
    $("fc-s-acum").textContent = desc + " · comparação com " + (A - 1) + (sel.serie === "ref" ? " e com a média histórica" : "");
    grafico("g-acum", { type: "line", data: { labels: rotA, datasets: dsA }, options: baseOpc({ scales: { x: { grid: { display: false }, ticks: { autoSkip: false, font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: "#eef1f4" } } } }) });

    // Por mês: ano × média
    var mA = new Float64Array(12), mP = new Float64Array(12), mM = new Float64Array(12), nM = 0;
    percorre(D, d2n(A + "-01-01"), d2n(A + "-12-31"), function (d, i) { mA[+n2d(d).slice(5, 7) - 1] += D.q[i]; });
    percorre(D, d2n((A - 1) + "-01-01"), d2n((A - 1) + "-12-31"), function (d, i) { mP[+n2d(d).slice(5, 7) - 1] += D.q[i]; });
    var dsM = [{ label: String(A), data: Array.prototype.slice.call(mA), backgroundColor: "#e4572e", borderRadius: 3 }, { label: String(A - 1), data: Array.prototype.slice.call(mP), backgroundColor: "#c5ccd6", borderRadius: 3 }];
    if (sel.serie === "ref") {
      percorre(REF, d2n(META.anos_ref[0] + "-01-01"), d2n((A - 1) + "-12-31"), function (d, i) { mM[+n2d(d).slice(5, 7) - 1] += REF.q[i]; });
      nM = A - META.anos_ref[0];
      if (nM > 0) dsM.push({ type: "line", label: "Média " + META.anos_ref[0] + "–" + (A - 1), data: Array.prototype.map.call(mM, function (v) { return v / nM; }), borderColor: "#0b4f8a", backgroundColor: "#0b4f8a", pointRadius: 3, borderWidth: 2, tension: .3 });
    }
    $("fc-t-mes").textContent = "Focos por mês em " + A;
    $("fc-s-mes").textContent = desc + (sel.serie === "ref" ? " · barras: " + A + " e " + (A - 1) + " · linha: média histórica" : " · " + A + " × " + (A - 1));
    grafico("g-mes", { type: "bar", data: { labels: MESES, datasets: dsM }, options: baseOpc({}) });

    // Satélites
    $("fc-card-sat").hidden = sel.serie !== "todos";
    if (sel.serie === "todos") {
      var sl = [], sv = []; META.satelites.forEach(function (s2, i) { if (porSat[i]) { sl.push(s2); sv.push(porSat[i]); } });
      var ord = sl.map(function (l, i) { return [l, sv[i]]; }).sort(function (a, b) { return b[1] - a[1]; });
      grafico("g-sat", { type: "bar", data: { labels: ord.map(function (x) { return x[0]; }), datasets: [{ label: "Focos", data: ord.map(function (x) { return x[1]; }), backgroundColor: "#0b4f8a", borderRadius: 3 }] },
        options: baseOpc({ indexAxis: "y", plugins: { legend: { display: false } } }) });
    }

    // Rankings
    seg("fc-abas", [["mun", "Municípios"], ["reg", "Regiões climáticas"], ["ti", "Territórios"]], sel.rank, function (v) { sel.rank = v; atualiza(); });
    var grupos = {};
    MUN.forEach(function (mu, i) { if (!porMun[i]) return; var kk = sel.rank === "mun" ? i : sel.rank === "reg" ? mu[1] : mu[2]; grupos[kk] = (grupos[kk] || 0) + porMun[i]; });
    var lista = Object.keys(grupos).map(function (kk) { return [kk, grupos[kk]]; }).sort(function (a, b) { return b[1] - a[1]; });
    var maxR = lista.length ? lista[0][1] : 1;
    $("fc-rank").innerHTML = lista.length ? lista.slice(0, 40).map(function (it, p) {
      var nome = sel.rank === "mun" ? MUN[it[0]][0] : sel.rank === "reg" ? META.regioes[it[0]] : META.territorios[it[0]];
      return "<div class='fc-item'><span class='p'>" + (p + 1) + "º</span><span class='nome' data-k='" + it[0] + "' title='Filtrar por " + esc(nome) + "'><i style='width:" + (it[1] / maxR * 100).toFixed(1) + "%'></i><span>" + esc(nome) + "</span></span>" +
        "<span class='n'>" + fmt(it[1]) + "<small>" + (it[1] / total * 100).toFixed(1) + "%</small></span></div>";
    }).join("") : "<div class='fc-vazio'>Nenhum foco no período e filtros escolhidos.</div>";

    $("fc-rodape").innerHTML = "Fonte: INPE — Programa Queimadas (dados abertos). Satélite de referência: AQUA_M-T (passagem da tarde), série usada pelo INPE para comparar anos desde 2003. " +
      "\"Todos os satélites\" soma as detecções de todos os sensores, inclusive geoestacionários (GOES), e por isso um mesmo fogo pode aparecer várias vezes; use-o para monitoramento, não para comparar anos. " +
      "Datas em UTC, como no INPE. Região climática e Território de Identidade atribuídos pelo município do foco. " +
      "Unidades de conservação: 113 UCs federais, estaduais e municipais da Bahia (base do INEMA); o foco é atribuído pela sua localização dentro do limite da UC. " +
      "Como há UCs sobrepostas (ex.: parque dentro de APA), um foco pode contar em mais de uma UC na tabela; os totais \"em UCs\" contam cada foco uma vez.";
    desenhaUC(de, ate, total);
    desenhaMapa(de, ate);
  }

  // ---------- unidades de conservação
  // uc.json: contagem por dia e UC (um foco conta em cada UC que o contém; as uniões, índices negativos, contam cada foco uma vez)
  function preparaUC(tab, temSat) {
    var L = tab.linhas, n = L.length, o = { dia: new Int32Array(n), uc: new Int16Array(n), q: new Int32Array(n) };
    if (temSat) { o.sat = new Int8Array(n); o.frp = new Float32Array(n); }
    for (var i = 0; i < n; i++) { var r = L[i]; o.dia[i] = r[0]; o.uc[i] = r[1]; if (temSat) { o.sat[i] = r[2]; o.q[i] = r[3]; o.frp[i] = r[4]; } else o.q[i] = r[2]; }
    o.n = n; o.d0 = d2n(tab.d0); return o;
  }
  var GRUPOS_UC = [["-1", "Todas"], ["-2", "Federais"], ["-3", "Estaduais"], ["-4", "Municipais"], ["-5", "Proteção Integral"], ["-6", "Uso Sustentável"]];
  function ucNoGrupo(u, g) {   // a UC u pertence à união g (-1..-6)?
    var p = UC.ucs[u]; g = +g;
    return g === -1 || (g === -2 && p[1] === "Federal") || (g === -3 && p[1] === "Estadual") || (g === -4 && p[1] === "Municipal") ||
      (g === -5 && p[2] === "Proteção Integral") || (g === -6 && p[2] === "Uso Sustentável");
  }
  function somaUC(de, ate) {   // {u: focos} no período, respeitando o filtro de satélite
    var D = sel.serie === "ref" ? UCREF : UCTODOS, fs = D.sat && algumSat(), out = {};
    for (var i = 0; i < D.n; i++) {
      var d = D.d0 + D.dia[i];
      if (d < de || d > ate || (fs && !sel.sats[D.sat[i]])) continue;
      out[D.uc[i]] = (out[D.uc[i]] || 0) + D.q[i];
    }
    return out;
  }
  function totalBahia(de, ate) {   // total do estado (só filtro de satélite), para o percentual em UC
    var D = dados(), fs = D.sat && algumSat(), t = 0;
    for (var i = 0; i < D.n; i++) { var d = D.d0 + D.dia[i]; if (d >= de && d <= ate && !(fs && !sel.sats[D.sat[i]])) t += D.q[i]; }
    return t;
  }
  function tagsUC(p) { return "<span class='fc-tag " + esc(p[1]) + "'>" + esc(p[1]) + "</span><span class='fc-tag " + (p[2] === "Proteção Integral" ? "pi" : "us") + "'>" + (p[2] === "Proteção Integral" ? "Prot. Integral" : "Uso Sust.") + "</span>"; }
  function desenhaUC(de, ate) {
    if (!UC || (sel.serie === "todos" && !UCTODOS)) { $("fc-s-uc").textContent = UC === false ? "Dados das unidades de conservação indisponíveis no momento." : "Carregando…"; return; }
    seg("fc-uc-grupo", GRUPOS_UC, sel.ucGrupo, function (v) { sel.ucGrupo = v; atualiza(); });
    var g = sel.ucGrupo, nomeG = GRUPOS_UC.filter(function (x) { return x[0] === g; })[0][1];
    var atual = somaUC(de, ate), antes = somaUC(d2n((anoDe(de) - 1) + n2d(de).slice(4)), d2n((anoDe(ate) - 1) + n2d(ate).slice(4)));
    var tot = totalBahia(de, ate), emUC = atual[g] || 0, emUCant = antes[g] || 0, pi = atual[-5] || 0, us = atual[-6] || 0;
    var txtPer = de === ate ? br(n2d(de)) : br(n2d(de)) + " a " + br(n2d(ate));
    $("fc-s-uc").textContent = (g === "-1" ? "113 UCs federais, estaduais e municipais" : "UCs: " + nomeG) + " · Bahia · " + txtPer + " · clique numa UC para vê-la no mapa";
    $("fc-aviso-uc").innerHTML = (algumBioma() || (sel.tipo !== "estado" && sel.valor !== "")) ? "<div class='fc-aviso'>Esta seção considera a Bahia inteira e todos os biomas (os filtros de bioma e recorte não se aplicam às UCs).</div>" : "";
    $("fc-uc-kpis").innerHTML =
      kpi("Focos em UCs" + (g === "-1" ? "" : " · " + nomeG), fmt(emUC), tot ? (emUC / tot * 100).toFixed(1).replace(".", ",") + "% dos " + fmt(tot) + " focos da Bahia" : "nenhum foco na Bahia no período", "destaque") +
      kpi("Vs. mesmo período de " + (anoDe(de) - 1), delta(emUC, emUCant), fmt(emUCant) + " focos em UCs") +
      kpi("Proteção Integral", fmt(pi), "parques, estações ecológicas, refúgios, monumentos e reservas biológicas") +
      kpi("Uso Sustentável", fmt(us), "APAs, florestas, reservas extrativistas, RPPNs e outras");
    var esf = [["Federais", atual[-2] || 0, "#0b4f8a"], ["Estaduais", atual[-3] || 0, "#2e8b57"], ["Municipais", atual[-4] || 0, "#b7791f"]];
    grafico("g-uc", { type: "bar", data: { labels: esf.map(function (x) { return x[0]; }), datasets: [{ label: "Focos", data: esf.map(function (x) { return x[1]; }), backgroundColor: esf.map(function (x) { return x[2]; }), borderRadius: 4, maxBarThickness: 46 }] },
      options: baseOpc({ indexAxis: "y", plugins: { legend: { display: false }, title: { display: true, text: "Focos por esfera de gestão", font: { size: 12 } } } }) });
    var lista = [];
    UC.ucs.forEach(function (p, u) { if (atual[u] && ucNoGrupo(u, g)) lista.push([u, atual[u], antes[u] || 0]); });
    lista.sort(function (a, b) { return b[1] - a[1]; });
    var T = "t" + "able", R = "t" + "r", H = "t" + "h", C = "t" + "d";   // o editor do site altera essas marcas se escritas por extenso
    $("fc-uc-rank").innerHTML = lista.length ? "<" + T + " class='fc-uc-tab'><thead><" + R + "><" + H + ">Unidade de conservação</" + H + "><" + H + " style='text-align:right'>Focos</" + H + "><" + H + " style='text-align:right' title='Focos por 100 km² da UC'>/100 km²</" + H + "><" + H + " style='text-align:right'>" + (anoDe(de) - 1) + "</" + H + "></" + R + "></thead><tbody>" +
      lista.map(function (it) {
        var p = UC.ucs[it[0]];
        return "<" + R + " class='lin' data-u='" + it[0] + "' title='Ver no mapa'><" + C + ">" + esc(p[0]) + " " + tagsUC(p) + "</" + C + "><" + C + " class='n'><b>" + fmt(it[1]) + "</b></" + C + "><" + C + " class='n'>" + (p[3] ? (function (x) { return x.toFixed(x < 1 ? 2 : 1).replace(".", ","); })(it[1] / p[3] * 100) : "–") + "</" + C + "><" + C + " class='n' style='color:var(--tx2)'>" + fmt(it[2]) + "</" + C + "></" + R + ">";
      }).join("") + "</tbody></" + T + ">" : "<div class='fc-vazio'>Nenhum foco em unidades de conservação neste período.</div>";
  }
  function mostraUCnoMapa(u) {
    var nome = UC.ucs[u][0], lay = ucLayers[nome];
    if (!mapa || !lay) return;
    if (camadaUC && !mapa.hasLayer(camadaUC)) camadaUC.addTo(mapa);
    if (ucDestaque) camadaUC.resetStyle(ucDestaque);
    ucDestaque = lay; lay.setStyle({ color: "#0f5132", weight: 3, fillOpacity: .18 }); lay.bringToFront();
    mapa.fitBounds(lay.getBounds(), { padding: [20, 20], maxZoom: 11 });
    $("fc-mapa").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function baixaUC() {
    if (!UC) return alert("Dados das unidades de conservação ainda não carregados.");
    var iv = intervalo(), at = somaUC(iv[0], iv[1]), an = somaUC(d2n((anoDe(iv[0]) - 1) + n2d(iv[0]).slice(4)), d2n((anoDe(iv[1]) - 1) + n2d(iv[1]).slice(4)));
    var linhas = [["Unidade de conservação", "Esfera", "Grupo", "Área (km²)", "Focos", "Focos por 100 km²", "Focos no mesmo período de " + (anoDe(iv[0]) - 1)]];
    UC.ucs.map(function (p, u) { return [p[0], p[1], p[2], p[3], at[u] || 0, p[3] ? +((at[u] || 0) / p[3] * 100).toFixed(2) : "", an[u] || 0]; })
      .sort(function (a, b) { return b[4] - a[4]; }).forEach(function (r) { linhas.push(r); });
    linhas.push([]); UC.unioes.forEach(function (n, j) { linhas.push(["Total sem duplicidade — " + n, "", "", "", at[-1 - j] || 0, "", an[-1 - j] || 0]); });
    linhas.push([]); linhas.push([UC.nota]);
    xls("focos-por-uc-" + n2d(iv[0]) + "-a-" + n2d(iv[1]) + ".xls", [["Unidades de conservação", linhas]]);
  }

  // ---------- mapa
  function iniciaMapa() {
    mapa = L.map("fc-mapa", { preferCanvas: true, zoomSnap: .25, attributionControl: true }).setView([-12.6, -41.7], 6);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, attribution: "Mapa base © Esri" }).addTo(mapa);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, pane: "overlayPane", opacity: .9 }).addTo(mapa);
    Promise.all([json("regioes_ba.geojson"), json("ti_ba.geojson"), json("uc_ba_mapa.geojson").catch(function () { return null; })]).then(function (g) {
      camadasRef.reg = L.geoJSON(g[0], { style: { color: "#0b4f8a", weight: 1.4, fill: false }, interactive: false }).addTo(mapa);
      camadasRef.ti = L.geoJSON(g[1], { style: { color: "#6b7a8f", weight: .8, dashArray: "3 3", fill: false }, interactive: false });
      // Limites municipais (IBGE 2024, ~0,9 MB): só baixa quando a camada é ligada.
      camadasRef.mun = L.geoJSON(null, { style: { color: "#8a6d3b", weight: .6, opacity: .8, fill: false }, interactive: false });
      var camadas = { "Regiões climáticas": camadasRef.reg, "Territórios de Identidade": camadasRef.ti, "Municípios": camadasRef.mun };
      mapa.on("overlayadd", function (e) {
        if (e.layer !== camadasRef.mun || camadasRef.munCarregado) return;
        camadasRef.munCarregado = true;
        fetch("https://cdn.jsdelivr.net/gh/" + REPO + "@main/extremos/municipios_ba.geojson")
          .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
          .then(function (gj) { camadasRef.mun.addData(gj); })
          .catch(function () { camadasRef.munCarregado = false; alert("Não foi possível carregar os limites dos municípios. Tente de novo."); });
      });
      if (g[2]) {
        mapa.createPane("ucs"); mapa.getPane("ucs").style.zIndex = 390;   // abaixo dos focos
        camadaUC = L.geoJSON(g[2], { pane: "ucs", style: function (f) { var c = f.properties.dominio === "Federal" ? "#0b4f8a" : f.properties.dominio === "Estadual" ? "#2e8b57" : "#b7791f"; return { color: c, weight: 1.1, fillColor: c, fillOpacity: .07 }; },
          onEachFeature: function (f, l) { ucLayers[f.properties.nome] = l; l.bindTooltip("<b>" + esc(f.properties.nome) + "</b><br>UC " + esc(f.properties.dominio).toLowerCase() + " · " + esc(f.properties.grupo) + "<br>" + fmt(f.properties.area_km2) + " km²", { sticky: true }); } }).addTo(mapa);
        camadas["Unidades de conservação"] = camadaUC;
      }
      L.control.layers(null, camadas, { collapsed: true, position: "topright" }).addTo(mapa);
      mapa.fitBounds(camadasRef.reg.getBounds(), { padding: [10, 10] });
    }).catch(function () {});
  }
  function controlesMapa() {
    seg("fc-cor-mapa", [["bioma", "Cor por bioma"], ["frp", "Cor por intensidade"]], sel.corMapa, function (v) { sel.corMapa = v; atualiza(); });
    seg("fc-mapa-uc", [["todos", "Todos os focos"], ["uc", "Só em UCs"]], sel.mapaUC, function (v) { sel.mapaUC = v; atualiza(); });
  }
  function pontosRef(anos) {
    return Promise.all(anos.map(function (y) { if (!cachePontos["r" + y]) cachePontos["r" + y] = json("pontos_ref_" + y + ".json"); return cachePontos["r" + y]; }));
  }
  function corFrp(f) { return f == null ? "#8a8f98" : f < 10 ? "#fdb863" : f < 50 ? "#f46d43" : f < 150 ? "#d73027" : "#7f0000"; }
  var geracaoMapa = 0;
  function desenhaMapa(de, ate) {
    if (!window.L) return;
    if (!mapa) iniciaMapa();
    var minha = ++geracaoMapa, fm = filtroMun(), fb = algumBioma(), aviso = $("fc-aviso-mapa"); aviso.innerHTML = "";
    controlesMapa();
    var prom, anos = [];
    if (sel.serie === "ref") {
      for (var y = anoDe(de); y <= anoDe(ate); y++) anos.push(y);
      if (anos.length > 3) { anos = anos.slice(-3); aviso.innerHTML = "<div class='fc-aviso'>Período longo: o mapa mostra só os últimos 3 anos do intervalo.</div>"; }
      prom = pontosRef(anos).then(function (lst) { var out = []; lst.forEach(function (arr) { arr.forEach(function (p) { var d = D0REF + p[2]; out.push({ la: p[0], lo: p[1], d: d, h: p[3], m: p[4], b: p[5], s: META.sat_ref, f: p.length > 6 ? p[6] : null, u: p.length > 7 ? p[7] : -1 }); }); }); return out; });
    } else {
      if (de < HOJE - META.dias_pontos_todos + 1) aviso.innerHTML = "<div class='fc-aviso'>O mapa de todos os satélites cobre só os últimos " + META.dias_pontos_todos + " dias; períodos anteriores aparecem nas estatísticas.</div>";
      if (!cachePontos.todos) cachePontos.todos = json("pontos_todos.json");
      prom = cachePontos.todos.then(function (arr) { return arr.map(function (p) { return { la: p[0], lo: p[1], d: D0TODOS + p[2], h: p[3], s: META.satelites[p[4]], si: p[4], m: p[5], b: p[6], f: p[7], u: p.length > 8 ? p[8] : -1 }; }); });
    }
    $("fc-s-mapa").textContent = "Carregando focos…";
    prom.then(function (pts) {
      if (minha !== geracaoMapa) return;
      if (camadaPontos) mapa.removeLayer(camadaPontos);
      var fs = sel.serie === "todos" && algumSat(), grupo = [], n = 0;
      pts.forEach(function (p) {
        if (p.d < de || p.d > ate) return;
        if (fb && !sel.biomas[p.b]) return;
        if (fm && !fm[p.m]) return;
        if (fs && !sel.sats[p.si]) return;
        if (sel.mapaUC === "uc" && !(p.u >= 0)) return;
        n++;
        var cor = sel.corMapa === "frp" ? corFrp(p.f) : (CORES_BIOMA[META.biomas[p.b]] || "#999");
        grupo.push(L.circleMarker([p.la, p.lo], { radius: n > 20000 ? 2 : 3.5, color: "#fff", weight: n > 20000 ? 0 : .6, fillColor: cor, fillOpacity: .85 })
          .bindTooltip("<b>" + esc(MUN[p.m][0]) + "</b><br>" + br(n2d(p.d)) + " " + String(p.h).padStart(4, "0").replace(/(\d\d)(\d\d)/, "$1:$2") + " UTC<br>" + esc(p.s) +
            (p.f != null ? "<br>FRP " + p.f + " MW" : "") + "<br>" + esc(META.biomas[p.b]) +
            (p.u >= 0 && UC ? "<br><span style='color:#1f6b40'>UC: " + esc(UC.ucs[p.u][0]) + "</span>" : ""), { sticky: true }));
      });
      camadaPontos = L.layerGroup(grupo).addTo(mapa);
      var leg = function (cor, txt) { return "<span class='fc-leg'><i style='background:" + cor + "'></i>" + txt + "</span>"; };
      $("fc-s-mapa").innerHTML = fmt(n) + " focos no mapa · " + (sel.corMapa === "frp"
        ? "intensidade (FRP): " + leg("#fdb863", "&lt; 10 MW") + leg("#f46d43", "10–50") + leg("#d73027", "50–150") + leg("#7f0000", "≥ 150") + leg("#8a8f98", "sem FRP")
        : "bioma: " + META.biomas.map(function (b) { return leg(CORES_BIOMA[b] || "#999", esc(b)); }).join(""));
    }).catch(function (e) { $("fc-s-mapa").textContent = "Não foi possível carregar o mapa (" + e.message + ")."; });
  }

  // ---------- planilhas
  function xls(nomeArq, abas) {
    var carregar = window.XLSX ? Promise.resolve() : carregaScript("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js");
    carregar.then(function () {
      var wb = XLSX.utils.book_new();
      abas.forEach(function (a) { var ws = XLSX.utils.aoa_to_sheet(a[1]); ws["!cols"] = a[1][0].map(function () { return { wch: 16 }; }); XLSX.utils.book_append_sheet(wb, ws, a[0]); });
      XLSX.writeFile(wb, nomeArq, { bookType: "biff8" });
    }).catch(function () { alert("Não foi possível gerar a planilha."); });
  }
  function baixaFocos() {
    var iv = intervalo(), de = iv[0], ate = iv[1], fm = filtroMun(), fb = algumBioma();
    var prom = sel.serie === "ref"
      ? (function () { var anos = []; for (var y = anoDe(de); y <= anoDe(ate); y++) anos.push(y); return pontosRef(anos).then(function (l) { var o = []; l.forEach(function (a) { a.forEach(function (p) { o.push([p[0], p[1], D0REF + p[2], p[3], META.sat_ref, p[4], p[5], p.length > 6 && p[6] != null ? p[6] : null, p.length > 7 ? p[7] : -1]); }); }); return o; }); })()
      : (cachePontos.todos || (cachePontos.todos = json("pontos_todos.json"))).then(function (a) { return a.map(function (p) { return [p[0], p[1], D0TODOS + p[2], p[3], META.satelites[p[4]], p[5], p[6], p[7], p.length > 8 ? p[8] : -1]; }); });
    prom.then(function (pts) {
      var linhas = [["Data (UTC)", "Hora (UTC)", "Latitude", "Longitude", "Satélite", "Município", "Região climática", "Território de Identidade", "Bioma", "FRP (MW)", "Unidade de conservação"]];
      var fs = sel.serie === "todos" && algumSat();
      pts.forEach(function (p) {
        if (p[2] < de || p[2] > ate || (fb && !sel.biomas[p[6]]) || (fm && !fm[p[5]])) return;
        if (fs && !sel.sats[META.satelites.indexOf(p[4])]) return;
        var mu = MUN[p[5]];
        linhas.push([br(n2d(p[2])), String(p[3]).padStart(4, "0").replace(/(\d\d)(\d\d)/, "$1:$2"), p[0], p[1], p[4], mu[0], META.regioes[mu[1]], META.territorios[mu[2]], META.biomas[p[6]], p[7] === null ? "" : p[7], p[8] >= 0 && UC ? UC.ucs[p[8]][0] : ""]);
      });
      xls("focos-bahia-" + n2d(de) + "-a-" + n2d(ate) + ".xls", [["Focos", linhas]]);
    });
  }
  function baixaMunicipios() {
    var D = dados(), iv = intervalo(), porMun = new Float64Array(MUN.length);
    percorre(D, iv[0], iv[1], function (d, i) { porMun[D.mun[i]] += D.q[i]; });
    var linhas = [["Município", "Região climática", "Território de Identidade", "Focos"]];
    MUN.map(function (m, i) { return [m[0], META.regioes[m[1]], META.territorios[m[2]], porMun[i]]; }).sort(function (a, b) { return b[3] - a[3]; }).forEach(function (r) { linhas.push(r); });
    xls("focos-por-municipio-" + n2d(iv[0]) + "-a-" + n2d(iv[1]) + ".xls", [["Municípios", linhas]]);
  }

  // ---------- eventos
  function ligaEventos() {
    $("fc-de").onchange = $("fc-ate").onchange = function () { sel.periodo = "outro"; sel.de = d2n($("fc-de").value); sel.ate = d2n($("fc-ate").value); atualiza(); };
    $("fc-biomas").onclick = function (e) { var b = e.target.closest("button"); if (!b) return; var v = b.getAttribute("data-b"); if (v === "todos") sel.biomas = {}; else if (sel.biomas[v]) delete sel.biomas[v]; else sel.biomas[v] = 1; atualiza(); };
    $("fc-sats").onclick = function (e) { var b = e.target.closest("button"); if (!b) return; var v = b.getAttribute("data-s"); if (v === "todos") sel.sats = {}; else if (sel.sats[v]) delete sel.sats[v]; else sel.sats[v] = 1; atualiza(); };
    $("fc-tipo").onchange = function () { sel.tipo = this.value; sel.valor = ""; atualiza(); };
    $("fc-valor").onchange = function () { sel.valor = this.value; atualiza(); };
    $("fc-busca").onchange = function () { var v = this.value.trim().toLowerCase(), i = MUN.findIndex(function (m) { return m[0].toLowerCase() === v; }); if (i >= 0) { sel.valor = i; atualiza(); } };
    $("fc-rank").onclick = function (e) { var n = e.target.closest(".nome"); if (!n) return; sel.tipo = sel.rank; sel.valor = n.getAttribute("data-k"); atualiza(); window.scrollTo({ top: raiz.getBoundingClientRect().top + window.scrollY - 10, behavior: "smooth" }); };
    $("fc-xls").onclick = baixaFocos; $("fc-xls-mun").onclick = baixaMunicipios; $("fc-xls-uc").onclick = baixaUC;
    $("fc-uc-rank").onclick = function (e) { var r = e.target.closest("tr[data-u]"); if (r) mostraUCnoMapa(+r.getAttribute("data-u")); };
    $("fc-lista-mun").innerHTML = MUN.map(function (m) { return "<option value='" + esc(m[0]) + "'>"; }).join("");
  }

  function carregaTodos() {
    $("fc-kpis").innerHTML = "<div class='fc-carregando' style='grid-column:1/-1'>Carregando dados de todos os satélites…</div>";
    json("todos.json").then(function (t) { TODOS = prepara(t, true); D0TODOS = TODOS.d0; atualiza(); })
      .catch(function (e) { sel.serie = "ref"; alert("Não foi possível carregar todos os satélites (" + e.message + ")."); atualiza(); });
  }

  // ---------- início
  carregaCss("https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css");
  Promise.all([json("meta.json"), json("ref.json"),
    carregaScript("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"),
    carregaScript("https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js")])
    .then(function (r) {
      META = r[0]; MUN = META.municipios; HOJE = d2n(META.hoje_utc);
      REF = prepara(r[1], false); D0REF = REF.d0; D0TODOS = d2n(META.todos_desde);
      var g = META.gerado_em ? new Date(META.gerado_em) : null, u = META.ultimo_foco_utc;
      $("fc-atual").innerHTML = "Atualizado em <b>" + (g ? g.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "–") + "</b>" +
        (u ? " · último foco: <b>" + br(u.slice(0, 10)) + " " + u.slice(11, 13) + ":" + u.slice(13, 15) + " UTC</b>" : "");
      if (window.Chart) { Chart.defaults.font.family = getComputedStyle(raiz).fontFamily; Chart.defaults.color = "#5b6773"; }
      montaEstrutura(); ligaEventos();
      if (sel.serie === "todos") carregaTodos(); else atualiza();
      json("uc.json").then(function (u) { UC = u; UCREF = preparaUC(u.ref, false); UCTODOS = preparaUC(u.todos, true); atualiza(); })
        .catch(function () { UC = false; atualiza(); });
    })
    .catch(function (e) { $("fc-corpo").innerHTML = "<div class='fc-erro'>Não foi possível carregar os dados (" + esc(e.message) + "). Tente recarregar a página.</div>"; });
})();
