/* INEMA · Meteorologia — Chuva nas estações (rede pluviométrica do SEIA/INEMA).
   Monta toda a página dentro de #inema-est (o editor do site apaga elementos vazios).
   Dados em estacoes/ no repositório (gerados por estacoes/gerar_estacoes.py) e servidos pelo jsDelivr. */
(function () {
  "use strict";
  var REPO = "aldirioalmeida-cpu/previsao-municipios-ba";
  var BASE = (window.INEMA_EST_BASE || ("https://cdn.jsdelivr.net/gh/" + REPO + "@main/")) + "estacoes/";
  var RAIZ = document.getElementById("inema-est");
  if (!RAIZ) return;

  // ---------------- estilo ----------------
  var CSS = "" +
    "#inema-est{--az:#0b4f8a;--az2:#e8f0f8;--az3:#d3e3f3;--tx:#1d2733;--tx2:#5b6773;--ln:#d7dee6;--bg:#fff;--bg2:#f4f7fa;--ok:#2e6b4f;--al:#9a5b00;--alb:#fff4e5;" +
    "font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:var(--tx);font-size:15px;line-height:1.4;max-width:1500px;margin:0 auto}" +
    "#inema-est *{box-sizing:border-box}" +
    "#inema-est h2{font-size:1.5rem;margin:0;color:var(--az);line-height:1.2}" +
    "#inema-est .ie-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:.6rem 1.5rem;margin-bottom:.8rem}" +
    "#inema-est .ie-nav{display:flex;flex-wrap:wrap;gap:.3rem 1rem;font-size:.85rem;margin:.3rem 0 0}#inema-est .ie-nav a{color:var(--az)}" +
    "#inema-est .ie-kpis{display:flex;flex-wrap:wrap;gap:.5rem}" +
    "#inema-est .ie-kpi{background:var(--bg2);border:1px solid var(--ln);border-radius:10px;padding:.35rem .75rem;min-width:7.5rem}" +
    "#inema-est .ie-kpi b{display:block;font-size:1.15rem;font-variant-numeric:tabular-nums}#inema-est .ie-kpi span{font-size:.75rem;color:var(--tx2)}" +
    "#inema-est .ie-app{display:grid;grid-template-columns:270px minmax(0,1fr) 370px;gap:12px;align-items:start}" +
    "#inema-est .ie-side,#inema-est .ie-info{background:var(--bg);border:1px solid var(--ln);border-radius:12px;padding:12px;display:grid;gap:12px;min-width:0}" +
    "#inema-est .ie-side{position:sticky;top:8px;max-height:calc(100vh - 16px);overflow:auto}" +
    "#inema-est .ie-grp{display:grid;gap:6px}" +
    "#inema-est .ie-rot{font-size:.72rem;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em}" +
    "#inema-est select,#inema-est input[type=date],#inema-est input[type=number]{font:inherit;font-size:.9rem;padding:.38rem .5rem;border:1px solid var(--ln);border-radius:8px;background:#fff;color:var(--tx);width:100%;min-width:0}" +
    "#inema-est .ie-chips{display:flex;flex-wrap:wrap;gap:4px}" +
    "#inema-est .ie-chips button{font:inherit;font-size:.82rem;border:1px solid var(--ln);background:#fff;color:var(--tx);padding:.3rem .6rem;border-radius:999px;cursor:pointer}" +
    "#inema-est .ie-chips button[aria-pressed=true]{background:var(--az);border-color:var(--az);color:#fff}" +
    "#inema-est .ie-chips.v button[aria-pressed=true]{background:var(--ok);border-color:var(--ok)}" +
    "#inema-est .ie-dupla{display:grid;grid-template-columns:1fr 1fr;gap:6px}" +
    "#inema-est .ie-dupla label{display:grid;gap:2px;font-size:.78rem;color:var(--tx2)}" +
    "#inema-est .ie-cam{display:grid;gap:3px}#inema-est .ie-cam label{display:flex;gap:7px;align-items:center;font-size:.88rem;cursor:pointer}" +
    "#inema-est .ie-cam i{width:16px;height:0;border-top:2px solid;display:inline-block}" +
    "#inema-est .ie-mapa{position:relative;border:1px solid var(--ln);border-radius:12px;overflow:hidden;background:#eef3f7;min-width:0}" +
    "#inema-est #ie-map{height:min(78vh,760px);min-height:440px}" +
    "#inema-est .ie-cv{position:absolute;inset:0;pointer-events:none;z-index:450}" +
    "#inema-est .ie-tit{position:absolute;left:54px;top:10px;z-index:500;background:rgba(255,255,255,.93);border:1px solid var(--ln);border-radius:10px;padding:.4rem .7rem;font-size:.85rem;max-width:calc(100% - 70px);box-shadow:0 1px 4px rgba(0,0,0,.08)}" +
    "#inema-est .ie-tit b{color:var(--az)}" +
    "#inema-est .ie-leg{position:absolute;left:10px;bottom:22px;z-index:500;background:rgba(255,255,255,.93);border:1px solid var(--ln);border-radius:10px;padding:.4rem .6rem;font-size:.72rem;color:var(--tx2);max-width:calc(100% - 20px)}" +
    "#inema-est .ie-leg .es{display:flex;flex-wrap:wrap}#inema-est .ie-leg .es span{display:grid;justify-items:center;min-width:30px}#inema-est .ie-leg .es i{width:30px;height:10px;display:block}" +
    "#inema-est .ie-dica{position:absolute;z-index:600;pointer-events:none;background:#1d2733;color:#fff;font-size:.8rem;padding:.35rem .55rem;border-radius:6px;max-width:260px;line-height:1.35}" +
    "#inema-est .ie-carr{position:absolute;right:10px;bottom:22px;z-index:500;background:var(--az);color:#fff;font-size:.8rem;padding:.3rem .6rem;border-radius:999px}" +
    "#inema-est .ie-abas{display:flex;gap:2px;border-bottom:1px solid var(--ln);margin:-4px -4px 0}" +
    "#inema-est .ie-abas button{font:inherit;font-size:.88rem;border:0;background:none;padding:.45rem .7rem;cursor:pointer;color:var(--tx2);border-bottom:3px solid transparent}" +
    "#inema-est .ie-abas button[aria-selected=true]{color:var(--az);border-bottom-color:var(--az);font-weight:600}" +
    "#inema-est .ie-res{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}" +
    "#inema-est .ie-res div{background:var(--bg2);border-radius:8px;padding:.4rem .55rem}#inema-est .ie-res b{display:block;font-size:1.1rem;font-variant-numeric:tabular-nums}#inema-est .ie-res span{font-size:.74rem;color:var(--tx2)}" +
    "#inema-est table{border-collapse:collapse;width:100%;font-size:.85rem}" +
    "#inema-est td,#inema-est th{padding:.3rem .35rem;border-bottom:1px solid var(--ln);text-align:left;vertical-align:top}" +
    "#inema-est th{font-size:.75rem;color:var(--tx2);font-weight:600}" +
    "#inema-est td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    "#inema-est tr.cl{cursor:pointer}#inema-est tr.cl:hover td{background:var(--bg2)}" +
    "#inema-est .ie-bar{height:6px;border-radius:3px;background:var(--az);opacity:.75;margin-top:3px}" +
    "#inema-est .ie-nota{font-size:.8rem;color:var(--tx2)}" +
    "#inema-est .ie-aviso{background:var(--alb);color:var(--tx);border-left:4px solid var(--al);border-radius:6px;padding:.5rem .7rem;font-size:.84rem}" +
    "#inema-est .ie-pill{display:inline-block;font-size:.72rem;padding:.1rem .5rem;border-radius:999px;background:var(--az2);color:var(--tx);margin:2px 2px 0 0}" +
    "#inema-est .ie-pill.r{background:var(--alb);color:var(--al)}" +
    "#inema-est .ie-bt{font:inherit;font-size:.84rem;border:1px solid var(--az);background:#fff;color:var(--az);padding:.35rem .7rem;border-radius:8px;cursor:pointer}" +
    "#inema-est .ie-bt:hover{background:var(--az2)}" +
    "#inema-est svg text{font-size:10.5px;fill:#5b6773}" +
    "#inema-est .ie-rolar{max-height:420px;overflow:auto}" +
    "#inema-est button:focus-visible,#inema-est select:focus-visible,#inema-est input:focus-visible{outline:3px solid #7fb2e5;outline-offset:1px}" +
    "#inema-est .ie-busca{position:relative}#inema-est .ie-sug{position:absolute;left:0;right:0;top:100%;z-index:700;background:#fff;border:1px solid var(--ln);border-radius:8px;max-height:240px;overflow:auto;box-shadow:0 4px 12px rgba(0,0,0,.12)}" +
    "#inema-est .ie-sug button{display:block;width:100%;text-align:left;font:inherit;font-size:.84rem;border:0;background:#fff;padding:.35rem .55rem;cursor:pointer}#inema-est .ie-sug button:hover{background:var(--bg2)}" +
    "#inema-est .leaflet-container{font:inherit}" +
    "@media (max-width:1250px){#inema-est .ie-app{grid-template-columns:250px minmax(0,1fr)}#inema-est .ie-info{grid-column:1/-1}}" +
    "@media (max-width:760px){#inema-est .ie-app{grid-template-columns:minmax(0,1fr)}#inema-est .ie-side{position:static;max-height:none}#inema-est #ie-map{height:62vh;min-height:360px}}";

  // ---------------- utilidades ----------------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function br(v, c) { return v == null || isNaN(v) ? "–" : Number(v).toLocaleString("pt-BR", { minimumFractionDigits: c || 0, maximumFractionDigits: c || 0 }); }
  function json(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status + " em " + u.split("/").pop()); return r.json(); }); }
  function carregaScript(u) { return new Promise(function (ok, erro) { var s = document.createElement("script"); s.src = u; s.onload = ok; s.onerror = function () { erro(new Error("falha ao carregar " + u)); }; document.head.appendChild(s); }); }
  function carregaCss(u) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = u; document.head.appendChild(l); }
  var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  var MESESL = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  function D(iso) { return new Date(iso + "T12:00:00Z"); }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function soma(iso0, n) { var d = D(iso0); d.setUTCDate(d.getUTCDate() + n); return iso(d); }
  function dias(a, b) { return Math.round((D(b) - D(a)) / 864e5); }
  function dBR(s) { return s ? s.slice(8, 10) + "/" + s.slice(5, 7) + "/" + s.slice(0, 4) : "–"; }
  function dCurto(s) { return s.slice(8, 10) + "/" + s.slice(5, 7); }
  function diasNoMes(a, m) { return new Date(Date.UTC(a, m, 0)).getUTCDate(); }

  // ---------------- escalas ----------------
  var CORES_CHUVA = ["#ffffff", "#d4efcf", "#a3dc99", "#62bd6a", "#2a8f4e", "#47b3dc", "#1c79c0", "#0d4a9c", "#6a3fa0", "#b0238a"];
  var ESC = {
    dia: { niv: [1, 5, 10, 20, 30, 50, 75, 100, 150], cor: CORES_CHUVA, u: "mm" },
    sem: { niv: [1, 10, 20, 30, 50, 75, 100, 150, 200], cor: CORES_CHUVA, u: "mm" },
    mes: { niv: [5, 25, 50, 75, 100, 150, 200, 300, 400], cor: CORES_CHUVA, u: "mm" },
    tri: { niv: [25, 75, 150, 250, 400, 600, 800, 1000, 1300], cor: CORES_CHUVA, u: "mm" },
    ano: { niv: [200, 400, 600, 800, 1000, 1200, 1500, 1800, 2200], cor: CORES_CHUVA, u: "mm" },
    anom: { niv: [25, 50, 75, 90, 110, 125, 150, 200], cor: ["#7f3b08", "#b35806", "#e08214", "#fdb863", "#f4f4f4", "#b8e186", "#4dac26", "#1b7a3a", "#0b4f8a"], u: "% da normal" },
    diasc: { niv: [1, 3, 5, 8, 12, 16, 20, 25, 30], cor: ["#ffffff", "#e5f2fa", "#c4e1f2", "#93c6e6", "#5ea6d6", "#3584c2", "#1f62a6", "#154486", "#0d2b63", "#081a40"], u: "dias" },
    max: { niv: [5, 10, 20, 30, 50, 75, 100, 150, 200], cor: ["#ffffff", "#fff3c4", "#ffe08a", "#ffc24d", "#ff9a2e", "#f2661f", "#d63a1c", "#a71d31", "#6e1046", "#3d0a3a"], u: "mm/dia" }
  };
  function corDe(e, v) { for (var i = 0; i < e.niv.length; i++) if (v < e.niv[i]) return e.cor[i]; return e.cor[e.cor.length - 1]; }
  function lum(c) { var n = parseInt(c.slice(1), 16); return .299 * (n >> 16) + .587 * (n >> 8 & 255) + .114 * (n & 255); }

  var CAM = [
    ["regioes", "Regiões climáticas", "#2e6b4f", 1.6, true],
    ["territorios", "Territórios de identidade", "#8a4fb3", 1.4, false],
    ["rpga", "RPGA", "#0b6fa8", 1.6, false],
    ["bacias", "Bacias hidrográficas", "#2a9bb0", 1, false],
    ["municipios", "Municípios", "#7d8a96", .6, false],
    ["semiarido", "Semiárido", "#c2771c", 2, false],
    ["biomas", "Biomas", "#6a8f2a", 1.6, false]
  ];
  var UNID = { reg: ["regioes", "Região climática"], ter: ["territorios", "Território de identidade"], rpga: ["rpga", "RPGA"], bac: ["bacias", "Bacia hidrográfica"], mun: ["municipios", "Município"], bio: ["biomas", "Bioma"] };

  // ---------------- estado ----------------
  var S = { per: "mes", n: 30, mes: null, ano: null, de: null, ate: null, vis: "valores", vr: "total", cob: 80, unid: "ter",
            cam: { regioes: true }, base: "claro", filtro: null, est: null, aba: "resumo" };
  try { var q = new URLSearchParams(location.search);
    if (q.get("estacao")) S.est = q.get("estacao");
    if (q.get("vis")) S.vis = q.get("vis"); if (q.get("var")) S.vr = q.get("var");
    if (q.get("per")) S.per = q.get("per"); if (q.get("mes")) S.mes = q.get("mes"); if (q.get("ano")) S.ano = +q.get("ano");
    if (q.get("de")) S.de = q.get("de"); if (q.get("ate")) S.ate = q.get("ate"); if (q.get("n")) S.n = +q.get("n");
  } catch (e) { /* ignora */ }

  var INFO, EST = [], POR = {}, MENS = {}, ANOS = {}, CAMS = {}, L, mapa, cv, ctx, layersCam = {}, idwLayer = null, unidLayer = null, VAL = [], baseLayers = {};

  RAIZ.innerHTML = "<style>" + CSS + "</style><p class='ie-nota'>Carregando o painel de chuva das estações…</p>";
  carregaCss("https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css");
  Promise.all([carregaScript("https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"), json(BASE + "info.json"), json(BASE + "estacoes.json"), json(BASE + "camadas/limite.json")])
    .then(function (r) { INFO = r[1]; EST = r[2]; CAMS.limite = r[3]; L = window.L; EST.forEach(function (e) { POR[e.c] = e; }); monta(); })
    .catch(function (e) { RAIZ.innerHTML = "<style>" + CSS + "</style><div class='ie-aviso'>Não foi possível carregar o painel (" + esc(e.message) + "). Tente recarregar a página.</div>"; });

  // ---------------- estrutura ----------------
  function monta() {
    var fim = INFO.fim;
    if (!S.mes) S.mes = fim.slice(0, 7);
    if (!S.ano) S.ano = +fim.slice(0, 4);
    if (!S.ate) S.ate = fim; if (!S.de) S.de = soma(fim, -29);
    var anosOpt = INFO.anos.slice().reverse().map(function (a) { return "<option>" + a + "</option>"; }).join("");
    RAIZ.innerHTML = "<style>" + CSS + "</style>" +
      "<div class='ie-top'><div><h2>Chuva nas estações — Bahia</h2>" +
      "<div class='ie-nav'><b>Meteorologia:</b><a href='/inema/meteorologia'>Ferramentas</a><a href='/inema/meteorologia/modelos'>Mapas dos modelos</a></div></div>" +
      "<div class='ie-kpis' id='ie-kpis'></div></div>" +
      "<div class='ie-app'>" +
      "<aside class='ie-side' aria-label='Opções do mapa'>" +
        "<div class='ie-grp ie-busca'><span class='ie-rot'>Buscar estação ou município</span><input id='ie-busca' type='search' placeholder='ex.: Barreiras, Ibicuí, 1241008' autocomplete='off' style='font:inherit;font-size:.9rem;padding:.38rem .5rem;border:1px solid #d7dee6;border-radius:8px;width:100%'><div class='ie-sug' id='ie-sug' hidden></div></div>" +
        "<div class='ie-grp'><span class='ie-rot'>Período</span><div class='ie-chips' id='ie-per'></div><div id='ie-per-op'></div></div>" +
        "<div class='ie-grp'><span class='ie-rot'>Informação</span><select id='ie-var'>" +
          "<option value='total'>Chuva acumulada (mm)</option><option value='anom'>Anomalia (% da normal CHIRPS)</option><option value='dias'>Dias com chuva (≥ 1 mm)</option><option value='max'>Maior chuva em um dia (mm)</option></select></div>" +
        "<div class='ie-grp'><span class='ie-rot'>Visualização</span><div class='ie-chips v' id='ie-vis'></div><div id='ie-vis-op'></div></div>" +
        "<div class='ie-grp'><span class='ie-rot'>Camadas</span><div class='ie-cam' id='ie-cam'></div></div>" +
        "<div class='ie-grp'><span class='ie-rot'>Recorte</span><div class='ie-dupla'><select id='ie-ft' aria-label='Tipo de recorte'><option value=''>Bahia inteira</option>" +
          Object.keys(UNID).map(function (k) { return "<option value='" + k + "'>" + UNID[k][1] + "</option>"; }).join("") + "<option value='semi'>Semiárido</option></select><select id='ie-fv' aria-label='Unidade do recorte' hidden></select></div></div>" +
        "<div class='ie-grp'><span class='ie-rot'>Qualidade mínima</span><label class='ie-nota' for='ie-cob'>Mostrar estações com pelo menos <b id='ie-cob-v'>80</b>% dos dias com dado</label><input id='ie-cob' type='range' min='0' max='100' step='5' value='80'></div>" +
        "<div class='ie-grp'><span class='ie-rot'>Mapa de fundo</span><div class='ie-chips' id='ie-base'><button type='button' data-b='claro' aria-pressed='true'>Claro</button><button type='button' data-b='satelite' aria-pressed='false'>Satélite</button><button type='button' data-b='nenhum' aria-pressed='false'>Sem fundo</button></div></div>" +
      "</aside>" +
      "<div class='ie-mapa'><div id='ie-map'></div><canvas class='ie-cv' id='ie-cv'></canvas><div class='ie-tit' id='ie-tit'></div><div class='ie-leg' id='ie-leg'></div><div class='ie-dica' id='ie-dica' hidden></div><div class='ie-carr' id='ie-carr' hidden>Carregando dados…</div></div>" +
      "<section class='ie-info' aria-label='Informações'><div class='ie-abas' role='tablist'>" +
        "<button type='button' role='tab' data-a='resumo'>Resumo</button><button type='button' role='tab' data-a='unid'>Por unidade</button><button type='button' role='tab' data-a='est'>Estação</button><button type='button' role='tab' data-a='dados'>Dados</button><button type='button' role='tab' data-a='sobre'>Sobre</button></div>" +
        "<div id='ie-aba'></div></section>" +
      "</div>";
    window.__ieAnos = anosOpt;
    montaControles();
    montaMapa();
    atualiza();
  }

  function chips(id, itens, atual, attr) {
    document.getElementById(id).innerHTML = itens.map(function (it) { return "<button type='button' data-" + attr + "='" + it[0] + "' aria-pressed='" + (it[0] === atual) + "'" + (it[2] ? " title='" + esc(it[2]) + "'" : "") + ">" + it[1] + "</button>"; }).join("");
  }
  function montaControles() {
    var $ = function (i) { return document.getElementById(i); };
    $("ie-per").onclick = function (ev) { var b = ev.target.closest("button"); if (!b) return; S.per = b.dataset.p; if (S.per === "dias" && !S.n) S.n = 30; atualiza(); };
    $("ie-vis").onclick = function (ev) { var b = ev.target.closest("button"); if (!b) return; S.vis = b.dataset.v; atualiza(); };
    $("ie-var").value = S.vr; $("ie-var").onchange = function () { S.vr = this.value; atualiza(); };
    $("ie-cob").oninput = function () { S.cob = +this.value; $("ie-cob-v").textContent = S.cob; atualiza(true); };
    $("ie-base").onclick = function (ev) { var b = ev.target.closest("button"); if (!b) return; S.base = b.dataset.b; [].forEach.call(this.children, function (x) { x.setAttribute("aria-pressed", x === b); }); fundo(); };
    $("ie-cam").innerHTML = CAM.map(function (c) { return "<label><input type='checkbox' data-c='" + c[0] + "'" + (S.cam[c[0]] ? " checked" : "") + "><i style='border-color:" + c[2] + "'></i>" + c[1] + "</label>"; }).join("");
    $("ie-cam").onchange = function (ev) { var c = ev.target.dataset.c; if (!c) return; S.cam[c] = ev.target.checked; camadas(); };
    $("ie-ft").onchange = function () { var t = this.value, fv = $("ie-fv");
      if (!t) { S.filtro = null; fv.hidden = true; atualiza(true); zoomFiltro(); return; }
      if (t === "semi") { S.filtro = { t: "semi", v: true }; fv.hidden = true; atualiza(true); zoomFiltro(); return; }
      var vals = {}; EST.forEach(function (e) { if (e[t]) vals[e[t]] = 1; });
      fv.innerHTML = Object.keys(vals).sort(function (a, b) { return a.localeCompare(b, "pt-BR"); }).map(function (v) { return "<option>" + esc(v) + "</option>"; }).join("");
      fv.hidden = false; S.filtro = { t: t, v: fv.value }; atualiza(true); zoomFiltro(); };
    $("ie-fv").onchange = function () { S.filtro = { t: $("ie-ft").value, v: this.value }; atualiza(true); zoomFiltro(); };
    document.querySelector("#inema-est .ie-abas").onclick = function (ev) { var b = ev.target.closest("button"); if (!b) return; S.aba = b.dataset.a; aba(); };
    // busca
    var bi = $("ie-busca"), sg = $("ie-sug");
    bi.oninput = function () {
      var t = norm(bi.value); if (t.length < 2) { sg.hidden = true; return; }
      var r = EST.filter(function (e) { return norm(e.n + " " + e.c + " " + e.mun).indexOf(t) >= 0; }).slice(0, 12);
      sg.innerHTML = r.length ? r.map(function (e) { return "<button type='button' data-c='" + esc(e.c) + "'>" + esc(e.n) + " <span class='ie-nota'>" + esc(e.mun) + "</span></button>"; }).join("") : "<div class='ie-nota' style='padding:.4rem'>Nada encontrado.</div>";
      sg.hidden = false;
    };
    sg.onclick = function (ev) { var b = ev.target.closest("button"); if (!b) return; sg.hidden = true; bi.value = ""; escolhe(b.dataset.c, true); };
    document.addEventListener("click", function (ev) { if (!ev.target.closest(".ie-busca")) sg.hidden = true; });
  }
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase(); }

  // ---------------- período ----------------
  function periodo() {
    var fim = INFO.fim, p = { tipo: S.per };
    if (S.per === "dias") { p.de = soma(fim, -(S.n - 1)); p.ate = fim; p.nome = S.n === 1 ? "Último dia (" + dBR(fim) + ")" : "Últimos " + S.n + " dias (" + dCurto(p.de) + " a " + dCurto(fim) + ")"; }
    else if (S.per === "mes") { var a = +S.mes.slice(0, 4), m = +S.mes.slice(5); p.de = S.mes + "-01"; p.ate = S.mes + "-" + ("0" + diasNoMes(a, m)).slice(-2); if (p.ate > fim) { p.ate = fim; p.parcial = true; } p.nome = MESESL[m - 1] + " de " + a + (p.parcial ? " (até " + dCurto(fim) + ")" : ""); }
    else if (S.per === "ano") { p.de = S.ano + "-01-01"; p.ate = S.ano + "-12-31"; if (p.ate > fim) { p.ate = fim; p.parcial = true; } p.nome = "Ano de " + S.ano + (p.parcial ? " (até " + dCurto(fim) + ")" : ""); }
    else { p.de = S.de < INFO.inicio ? INFO.inicio : S.de; p.ate = S.ate > fim ? fim : S.ate; if (p.de > p.ate) { var t = p.de; p.de = p.ate; p.ate = t; } p.nome = dBR(p.de) + " a " + dBR(p.ate); }
    p.n = dias(p.de, p.ate) + 1;
    return p;
  }
  function escala(p) {
    if (S.vr === "anom") return ESC.anom; if (S.vr === "dias") return ESC.diasc; if (S.vr === "max") return ESC.max;
    return p.n <= 3 ? ESC.dia : p.n <= 20 ? ESC.sem : p.n <= 45 ? ESC.mes : p.n <= 120 ? ESC.tri : ESC.ano;
  }
  function controlesPeriodo() {
    chips("ie-per", [["dias", "Últimos dias"], ["mes", "Mês"], ["ano", "Ano"], ["livre", "Intervalo"]], S.per, "p");
    var o = document.getElementById("ie-per-op"), h = "";
    if (S.per === "dias") h = "<div class='ie-chips'>" + [1, 3, 7, 15, 30, 60, 90].map(function (n) { return "<button type='button' data-n='" + n + "' aria-pressed='" + (S.n === n) + "'>" + (n === 1 ? "24 h" : n + " d") + "</button>"; }).join("") + "</div>";
    else if (S.per === "mes") h = "<div class='ie-dupla'><select id='ie-mm' aria-label='Mês'>" + MESESL.map(function (m, i) { return "<option value='" + ("0" + (i + 1)).slice(-2) + "'>" + m + "</option>"; }).join("") + "</select><select id='ie-ma' aria-label='Ano'>" + window.__ieAnos + "</select></div>";
    else if (S.per === "ano") h = "<select id='ie-aa' aria-label='Ano'>" + window.__ieAnos + "</select>";
    else h = "<div class='ie-dupla'><label>De<input type='date' id='ie-de' min='" + INFO.inicio + "' max='" + INFO.fim + "' value='" + S.de + "'></label><label>Até<input type='date' id='ie-ate' min='" + INFO.inicio + "' max='" + INFO.fim + "' value='" + S.ate + "'></label></div><span class='ie-nota'>Intervalos longos carregam vários anos de dados.</span>";
    o.innerHTML = h;
    if (S.per === "dias") o.onclick = function (ev) { var b = ev.target.closest("button"); if (!b) return; S.n = +b.dataset.n; atualiza(); };
    else o.onclick = null;
    if (S.per === "mes") { var mm = document.getElementById("ie-mm"), ma = document.getElementById("ie-ma"); mm.value = S.mes.slice(5); ma.value = S.mes.slice(0, 4); mm.onchange = ma.onchange = function () { S.mes = ma.value + "-" + mm.value; atualiza(); }; }
    if (S.per === "ano") { var aa = document.getElementById("ie-aa"); aa.value = S.ano; aa.onchange = function () { S.ano = +aa.value; atualiza(); }; }
    if (S.per === "livre") { document.getElementById("ie-de").onchange = function () { if (this.value) { S.de = this.value; atualiza(); } }; document.getElementById("ie-ate").onchange = function () { if (this.value) { S.ate = this.value; atualiza(); } }; }
  }

  // ---------------- dados ----------------
  function anos(p) { var r = []; for (var a = +p.de.slice(0, 4); a <= +p.ate.slice(0, 4); a++) if (INFO.anos.indexOf(a) >= 0) r.push(a); return r; }
  function garanteAnos(lista) {
    var falta = lista.filter(function (a) { return !ANOS[a]; });
    if (!falta.length) return Promise.resolve();
    document.getElementById("ie-carr").hidden = false;
    return Promise.all(falta.map(function (a) { return json(BASE + "diario/" + a + ".json").then(function (j) { ANOS[a] = j; }); }))
      .then(function () { document.getElementById("ie-carr").hidden = true; }, function (e) { document.getElementById("ie-carr").hidden = true; throw e; });
  }
  function garanteMensal() { return MENS.est ? Promise.resolve() : json(BASE + "mensal.json").then(function (j) { MENS = j; }); }
  // série diária de uma estação entre duas datas (null = sem dado)
  function serie(c, de, ate) {
    var out = [], d = de;
    while (d <= ate) {
      var a = +d.slice(0, 4), y = ANOS[a], ini = a + "-01-01", k0 = dias(ini, d), fimAno = a + "-12-31", ate2 = ate < fimAno ? ate : fimAno, n = dias(d, ate2) + 1;
      var arr = y && y.est[c];
      for (var i = 0; i < n; i++) out.push(arr ? (arr[k0 + i] === undefined ? null : arr[k0 + i]) : null);
      d = soma(ate2, 1);
    }
    return out;
  }
  function normalPeriodo(e, p) {
    if (!e.nm) return null;
    var t = 0, d = p.de;
    for (var i = 0; i < p.n; i++) { var a = +d.slice(0, 4), m = +d.slice(5, 7), nm = e.nm[m - 1]; if (nm == null) return null; t += nm / diasNoMes(a, m); d = soma(d, 1); }
    return t;
  }
  function calcula(p) {
    VAL = [];
    EST.forEach(function (e) {
      if (e.ini > p.ate || e.fim < p.de) return;
      if (!passaFiltro(e)) return;
      var s = serie(e.c, p.de, p.ate), n = 0, t = 0, dc = 0, mx = null;
      s.forEach(function (v) { if (v != null) { n++; t += v; if (v >= 1) dc++; if (mx == null || v > mx) mx = v; } });
      if (!n) return;
      var cob = Math.round(100 * n / p.n), r = { e: e, tot: Math.round(t * 10) / 10, n: n, cob: cob, dias: dc, max: mx };
      var nm = normalPeriodo(e, p); r.norm = nm; r.anom = nm && nm > 0.5 ? Math.round(100 * t / nm) : null;
      r.ok = cob >= S.cob;
      r.v = S.vr === "total" ? r.tot : S.vr === "anom" ? r.anom : S.vr === "dias" ? r.dias : r.max;
      VAL.push(r);
    });
  }
  function passaFiltro(e) { var f = S.filtro; if (!f) return true; if (f.t === "semi") return e.semi; return e[f.t] === f.v; }
  function validos() { return VAL.filter(function (r) { return r.ok && r.v != null; }); }

  // ---------------- mapa ----------------
  function montaMapa() {
    mapa = L.map("ie-map", { preferCanvas: true, zoomSnap: .25, minZoom: 5, maxZoom: 13 }).fitBounds(BA);
    baseLayers.claro = [L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, attribution: "Mapa base © Esri" }),
                        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, pane: "shadowPane", opacity: .8 })];
    baseLayers.satelite = [L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 17, attribution: "Imagens © Esri" })];
    fundo();
    mapa.createPane("limite"); mapa.getPane("limite").style.zIndex = 420; mapa.getPane("limite").style.pointerEvents = "none";
    mapa.createPane("unid"); mapa.getPane("unid").style.zIndex = 405;
    mapa.createPane("idw"); mapa.getPane("idw").style.zIndex = 402; mapa.getPane("idw").style.pointerEvents = "none";
    L.polyline(CAMS.limite.f[0].g.map(ll), { pane: "limite", color: "#1d2733", weight: 2, interactive: false }).addTo(mapa);
    cv = document.getElementById("ie-cv"); ctx = cv.getContext("2d");
    mapa.on("move zoom resize viewreset", desenhaEst);
    mapa.on("zoomend", function () { if (S.vis === "valores") desenhaEst(); });
    mapa.on("mousemove", passa); mapa.on("mouseout", function () { document.getElementById("ie-dica").hidden = true; });
    mapa.on("click", function (ev) { var r = maisPerto(ev.containerPoint); if (r) escolhe(r.e.c, false); });
    window.addEventListener("resize", function () { setTimeout(desenhaEst, 100); });
    camadas();
  }
  var BA = [[-18.4, -46.7], [-8.5, -37.3]];
  function ll(anel) { return anel.map(function (p) { return [p[1], p[0]]; }); }
  function fundo() {
    Object.keys(baseLayers).forEach(function (k) { baseLayers[k].forEach(function (l) { if (mapa.hasLayer(l)) mapa.removeLayer(l); }); });
    if (baseLayers[S.base]) baseLayers[S.base].forEach(function (l) { l.addTo(mapa); });
  }
  function carregaCamada(k) { return CAMS[k] ? Promise.resolve(CAMS[k]) : json(BASE + "camadas/" + k + ".json").then(function (j) { CAMS[k] = j; return j; }); }
  function camadas() {
    CAM.forEach(function (c) {
      var k = c[0];
      if (S.cam[k] && !layersCam[k]) {
        carregaCamada(k).then(function (j) {
          if (!S.cam[k] || layersCam[k]) return;
          var g = L.layerGroup();
          j.f.forEach(function (f) {
            L.polygon(f.g.map(ll), { color: c[2], weight: c[3], fill: k === "semiarido", fillOpacity: k === "semiarido" ? .06 : 0, interactive: true })
              .bindTooltip(esc(f.n), { sticky: true, direction: "top", opacity: .9 }).addTo(g);
          });
          layersCam[k] = g; g.addTo(mapa); desenhaEst();
        });
      } else if (!S.cam[k] && layersCam[k]) { mapa.removeLayer(layersCam[k]); layersCam[k] = null; }
    });
  }
  function zoomFiltro() {
    var pts = EST.filter(passaFiltro).map(function (e) { return [e.la, e.lo]; });
    if (!S.filtro || !pts.length) { mapa.fitBounds(BA); return; }
    mapa.fitBounds(L.latLngBounds(pts).pad(.15), { maxZoom: 10 });
  }

  // desenho das estações num canvas sobre o mapa
  function desenhaEst() {
    if (!mapa) return;
    var sz = mapa.getSize(), dpr = window.devicePixelRatio || 1;
    if (cv.width !== sz.x * dpr || cv.height !== sz.y * dpr) { cv.width = sz.x * dpr; cv.height = sz.y * dpr; cv.style.width = sz.x + "px"; cv.style.height = sz.y + "px"; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, sz.x, sz.y);
    var p = window.__iePer, es = window.__ieEsc; if (!p) return;
    VAL.forEach(function (r) { var pt = mapa.latLngToContainerPoint([r.e.la, r.e.lo]); r.x = pt.x; r.y = pt.y; });
    var vis = validos(), fora = VAL.filter(function (r) { return !r.ok || r.v == null; });
    if (S.vis === "pontos" || S.vis === "valores") fora.forEach(function (r) { if (r.x < -10 || r.y < -10 || r.x > sz.x + 10 || r.y > sz.y + 10) return; ctx.beginPath(); ctx.arc(r.x, r.y, 3, 0, 7); ctx.strokeStyle = "rgba(91,103,115,.7)"; ctx.lineWidth = 1; ctx.stroke(); });
    if (S.vis === "valores") etiquetas(vis, es, sz);
    else {
      var raio = S.vis === "pontos" ? 5.5 : 2.5;
      vis.slice().sort(function (a, b) { return a.v - b.v; }).forEach(function (r) {
        if (r.x < -10 || r.y < -10 || r.x > sz.x + 10 || r.y > sz.y + 10) return;
        ctx.beginPath(); ctx.arc(r.x, r.y, raio, 0, 7);
        ctx.fillStyle = S.vis === "pontos" ? corDe(es, r.v) : "#1d2733"; ctx.fill();
        if (S.vis === "pontos") { ctx.strokeStyle = "rgba(29,39,51,.6)"; ctx.lineWidth = .8; ctx.stroke(); }
      });
    }
    var sel = S.est && VAL.filter(function (r) { return r.e.c === S.est; })[0];
    if (sel) { ctx.beginPath(); ctx.arc(sel.x, sel.y, 14, 0, 7); ctx.strokeStyle = "#e4572e"; ctx.lineWidth = 3; ctx.stroke(); }
  }
  function txt(v) { return S.vr === "anom" ? v + "%" : S.vr === "dias" ? String(v) : v >= 100 ? String(Math.round(v)) : v.toFixed(1).replace(".", ","); }
  function etiquetas(vis, es, sz) {
    ctx.font = "600 12px system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var ord = vis.slice().sort(function (a, b) { return S.vr === "anom" ? Math.abs(b.v - 100) - Math.abs(a.v - 100) : b.v - a.v; }), pos = [], resto = [], ok = [];
    ord.forEach(function (r) {
      if (r.x < -30 || r.y < -15 || r.x > sz.x + 30 || r.y > sz.y + 15) return;
      var t = txt(r.v), w = ctx.measureText(t).width + 10, h = 18, b = { x: r.x - w / 2, y: r.y - h / 2, w: w, h: h };
      for (var i = 0; i < pos.length; i++) { var o = pos[i]; if (b.x < o.x + o.w + 1 && o.x < b.x + b.w + 1 && b.y < o.y + o.h + 1 && o.y < b.y + b.h + 1) { resto.push(r); return; } }
      pos.push(b); ok.push([r, t, b]);
    });
    resto.forEach(function (r) { ctx.beginPath(); ctx.arc(r.x, r.y, 2.6, 0, 7); ctx.fillStyle = corDe(es, r.v); ctx.fill(); ctx.strokeStyle = "rgba(29,39,51,.55)"; ctx.lineWidth = .8; ctx.stroke(); });
    ok.reverse().forEach(function (a) {
      var r = a[0], b = a[2], c = corDe(es, r.v);
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(b.x, b.y, b.w, b.h, 4); else ctx.rect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = "rgba(29,39,51,.45)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = lum(c) > 150 ? "#1d2733" : "#fff"; ctx.fillText(a[1], b.x + b.w / 2, b.y + b.h / 2 + .5);
    });
  }
  function maisPerto(pt) {
    var m = null, dm = 15 * 15;
    VAL.forEach(function (r) { if (r.x == null) return; var d = (r.x - pt.x) * (r.x - pt.x) + (r.y - pt.y) * (r.y - pt.y); if (d < dm) { dm = d; m = r; } });
    return m;
  }
  function passa(ev) {
    var r = maisPerto(ev.containerPoint), t = document.getElementById("ie-dica");
    if (!r) { t.hidden = true; mapa.getContainer().style.cursor = ""; return; }
    mapa.getContainer().style.cursor = "pointer";
    t.innerHTML = "<b>" + esc(r.e.n) + "</b><br>" + esc(r.e.mun) + "<br>" +
      "Chuva: <b>" + br(r.tot, 1) + " mm</b>" + (r.anom != null ? " · " + r.anom + "% da normal" : "") + "<br>" +
      r.dias + " dias com chuva · máx. " + br(r.max, 1) + " mm<br><span style='opacity:.8'>" + r.cob + "% dos dias com dado" + (r.ok ? "" : " (abaixo do mínimo)") + "</span>";
    t.hidden = false;
    var x = ev.containerPoint.x + 14, y = ev.containerPoint.y + 14, sz = mapa.getSize();
    if (x > sz.x - 270) x -= 285; if (y > sz.y - 110) y -= 120; t.style.left = x + "px"; t.style.top = y + "px";
  }

  // interpolação (inverso da distância ao quadrado) com máscara de 50 km e recorte no limite estadual
  function interpola(es) {
    if (idwLayer) { mapa.removeLayer(idwLayer); idwLayer = null; }
    if (S.vis !== "idw") return;
    var pts = validos(); if (pts.length < 3) return;
    var lo0 = -46.7, lo1 = -37.2, la0 = -18.5, la1 = -8.4, W = 380;
    function my(la) { return Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360)); }
    var y0 = my(la1), y1 = my(la0), H = Math.round(W * (y1 - y0) / ((lo1 - lo0) * Math.PI / 180) * -1);
    if (H < 0) H = -H;
    var c = document.createElement("canvas"); c.width = W; c.height = H; var g = c.getContext("2d"), img = g.createImageData(W, H), kx = Math.cos(13 * Math.PI / 180);
    var P = pts.map(function (r) { return [r.e.lo, r.e.la, r.v]; });
    for (var j = 0; j < H; j++) {
      var yy = y0 + (y1 - y0) * (j + .5) / H, la = (2 * Math.atan(Math.exp(yy)) - Math.PI / 2) * 180 / Math.PI;
      for (var i = 0; i < W; i++) {
        var lo = lo0 + (lo1 - lo0) * (i + .5) / W, sw = 0, sv = 0, dmin = 1e9;
        for (var t = 0; t < P.length; t++) { var dx = (P[t][0] - lo) * kx * 111, dy = (P[t][1] - la) * 111, d2 = dx * dx + dy * dy; if (d2 < dmin) dmin = d2; if (d2 > 22500) continue; var w = 1 / Math.max(d2, 4); sw += w; sv += w * P[t][2]; }
        var o = (j * W + i) * 4;
        if (!sw || dmin > 2500) continue;
        var cor = corDe(es, sv / sw), n = parseInt(cor.slice(1), 16); img.data[o] = n >> 16; img.data[o + 1] = n >> 8 & 255; img.data[o + 2] = n & 255; img.data[o + 3] = 235;
      }
    }
    g.putImageData(img, 0, 0);
    g.globalCompositeOperation = "destination-in"; g.beginPath();
    CAMS.limite.f[0].g.forEach(function (anel) { anel.forEach(function (q, k) { var x = (q[0] - lo0) / (lo1 - lo0) * W, y = (my(q[1]) - y0) / (y1 - y0) * H; k ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); });
    g.fillStyle = "#000"; g.fill("evenodd");
    idwLayer = L.imageOverlay(c.toDataURL(), [[la0, lo0], [la1, lo1]], { pane: "idw", opacity: .82, interactive: false }).addTo(mapa);
  }

  // média por unidade (polígonos coloridos)
  function porUnidade() {
    var k = S.unid, campo = k, out = {};
    validos().forEach(function (r) { var u = r.e[campo]; if (!u) return; (out[u] = out[u] || []).push(r.v); });
    return Object.keys(out).map(function (u) { var l = out[u], m = l.reduce(function (a, b) { return a + b; }, 0) / l.length; return { u: u, m: S.vr === "dias" ? Math.round(m) : Math.round(m * 10) / 10, n: l.length }; })
      .sort(function (a, b) { return b.m - a.m; });
  }
  function coropletico(es) {
    if (unidLayer) { mapa.removeLayer(unidLayer); unidLayer = null; }
    if (S.vis !== "unid") return;
    var nome = UNID[S.unid][0], lista = porUnidade(), por = {}; lista.forEach(function (x) { por[x.u] = x; });
    carregaCamada(nome).then(function (j) {
      if (S.vis !== "unid" || UNID[S.unid][0] !== nome) return;
      if (unidLayer) mapa.removeLayer(unidLayer);
      var g = L.layerGroup();
      j.f.forEach(function (f) {
        var x = por[f.n];
        L.polygon(f.g.map(ll), { pane: "unid", color: "#4a5560", weight: .8, fillColor: x ? corDe(es, x.m) : "#ffffff", fillOpacity: x ? .82 : .15 })
          .bindTooltip("<b>" + esc(f.n) + "</b><br>" + (x ? "média " + txt(x.m) + (S.vr === "anom" ? "" : " " + es.u) + " · " + x.n + " estações" : "sem estação com dados suficientes"), { sticky: true, opacity: .92 }).addTo(g);
      });
      unidLayer = g.addTo(mapa);
    });
  }

  // ---------------- atualização ----------------
  function atualiza(rapido) {
    var p = periodo(); window.__iePer = p;
    controlesPeriodo();
    chips("ie-vis", [["valores", "Valores", "Etiqueta com o valor de cada estação"], ["pontos", "Pontos"], ["idw", "Interpolado", "Superfície contínua a partir das estações (IDW)"], ["unid", "Por unidade", "Média das estações em cada território, RPGA, região…"]], S.vis, "v");
    var vo = document.getElementById("ie-vis-op");
    vo.innerHTML = S.vis === "unid" ? "<select id='ie-un' aria-label='Unidade'>" + Object.keys(UNID).map(function (k) { return "<option value='" + k + "'" + (k === S.unid ? " selected" : "") + ">" + UNID[k][1] + "</option>"; }).join("") + "</select>" : "";
    if (S.vis === "unid") document.getElementById("ie-un").onchange = function () { S.unid = this.value; atualiza(true); };
    garanteAnos(anos(p)).then(function () {
      calcula(p);
      var es = escala(p); window.__ieEsc = es;
      titulo(p, es); legenda(es); kpis(p);
      desenhaEst(); interpola(es); coropletico(es);
      aba(); url();
    }).catch(function (e) { document.getElementById("ie-tit").innerHTML = "<span style='color:#8a1c12'>Não foi possível carregar os dados (" + esc(e.message) + ").</span>"; });
  }
  var NOMEVAR = { total: "Chuva acumulada", anom: "Anomalia (% da normal)", dias: "Dias com chuva ≥ 1 mm", max: "Maior chuva em um dia" };
  function titulo(p, es) {
    var f = S.filtro ? " · " + (S.filtro.t === "semi" ? "Semiárido" : esc(S.filtro.v)) : "";
    document.getElementById("ie-tit").innerHTML = "<b>" + NOMEVAR[S.vr] + "</b> · " + esc(p.nome) + f + "<br><span class='ie-nota'>" + validos().length + " estações com dados suficientes · fonte: SEIA/INEMA</span>";
  }
  function legenda(es) {
    var h = "<div style='margin-bottom:2px'>" + (S.vr === "anom" ? "% da normal CHIRPS 1991–2020" : NOMEVAR[S.vr] + " (" + es.u + ")") + "</div><div class='es'>";
    es.cor.forEach(function (c, i) { var a = i ? es.niv[i - 1] : null, b = es.niv[i]; h += "<span><i style='background:" + c + ";border:1px solid #d7dee6'></i>" + (a == null ? "<" + b : b == null ? "≥" + a : a + "–" + b) + "</span>"; });
    document.getElementById("ie-leg").innerHTML = h + "</div>";
  }
  function kpis(p) {
    var v = validos(), tot = v.map(function (r) { return r.tot; }).sort(function (a, b) { return a - b; });
    var med = tot.length ? tot[Math.floor(tot.length / 2)] : null, mx = v.slice().sort(function (a, b) { return b.tot - a.tot; })[0];
    var an = v.filter(function (r) { return r.anom != null; }).map(function (r) { return r.anom; }).sort(function (a, b) { return a - b; }), anm = an.length ? an[Math.floor(an.length / 2)] : null;
    document.getElementById("ie-kpis").innerHTML =
      "<div class='ie-kpi'><b>" + v.length + "</b><span>estações no mapa</span></div>" +
      "<div class='ie-kpi'><b>" + br(med, 1) + " mm</b><span>mediana do período</span></div>" +
      "<div class='ie-kpi'><b>" + (mx ? br(mx.tot, 1) + " mm" : "–") + "</b><span>" + (mx ? "maior: " + esc(mx.e.mun) : "maior total") + "</span></div>" +
      "<div class='ie-kpi'><b>" + (anm != null ? anm + "%" : "–") + "</b><span>mediana da anomalia</span></div>" +
      "<div class='ie-kpi'><b>" + dBR(INFO.fim) + "</b><span>último dado</span></div>";
  }

  // ---------------- abas ----------------
  function aba() {
    [].forEach.call(document.querySelectorAll("#inema-est .ie-abas button"), function (b) { b.setAttribute("aria-selected", b.dataset.a === S.aba); });
    var el = document.getElementById("ie-aba");
    if (S.aba === "resumo") el.innerHTML = abaResumo();
    else if (S.aba === "unid") el.innerHTML = abaUnid();
    else if (S.aba === "est") { el.innerHTML = "<p class='ie-nota'>Carregando…</p>"; abaEst(el); return; }
    else if (S.aba === "dados") el.innerHTML = abaDados();
    else el.innerHTML = abaSobre();
    liga(el);
  }
  function liga(el) {
    el.onclick = function (ev) {
      var tr = ev.target.closest("tr[data-c]"); if (tr) { escolhe(tr.dataset.c, true); return; }
      var u = ev.target.closest("tr[data-u]"); if (u) { var t = S.unid; document.getElementById("ie-ft").value = t; document.getElementById("ie-ft").onchange(); var fv = document.getElementById("ie-fv"); fv.value = u.dataset.u; fv.onchange(); return; }
      var b = ev.target.closest("button[data-x]"); if (b) exporta(b.dataset.x);
    };
    var su = el.querySelector("#ie-un2"); if (su) su.onchange = function () { S.unid = this.value; aba(); if (S.vis === "unid") atualiza(true); };
  }
  function abaResumo() {
    var v = validos(), p = window.__iePer, es = window.__ieEsc;
    var top = v.slice().sort(function (a, b) { return S.vr === "anom" ? b.v - a.v : b.v - a.v; }).slice(0, 15);
    var secos = v.filter(function (r) { return r.tot < 1; }).length;
    var h = "<div class='ie-res'><div><b>" + v.length + "</b><span>estações com ≥ " + S.cob + "% dos dias</span></div><div><b>" + (VAL.length - v.length) + "</b><span>com dados insuficientes</span></div>" +
      "<div><b>" + secos + "</b><span>sem chuva (< 1 mm)</span></div><div><b>" + v.filter(function (r) { return r.anom != null && r.anom < 75; }).length + "</b><span>abaixo de 75% da normal</span></div></div>";
    h += "<div><span class='ie-rot'>Maiores valores — " + NOMEVAR[S.vr].toLowerCase() + "</span><table><thead><tr><th>Estação</th><th style='text-align:right'>" + es.u + "</th></tr></thead><tbody>" +
      top.map(function (r, i) { return "<tr class='cl' data-c='" + esc(r.e.c) + "'><td>" + (i + 1) + ". " + esc(r.e.n) + "<br><span class='ie-nota'>" + esc(r.e.ter || "") + "</span></td><td class='n'>" + txt(r.v) + "</td></tr>"; }).join("") + "</tbody></table></div>";
    h += "<p class='ie-nota'>Clique numa estação no mapa ou na lista para ver a série completa. " + (p.parcial ? "O período ainda está em andamento." : "") + "</p>";
    return h;
  }
  function abaUnid() {
    var lista = porUnidade(), mx = Math.max.apply(null, lista.map(function (x) { return Math.abs(x.m); }).concat([1])), es = window.__ieEsc;
    var h = "<div class='ie-grp'><span class='ie-rot'>Média das estações por</span><select id='ie-un2'>" + Object.keys(UNID).map(function (k) { return "<option value='" + k + "'" + (k === S.unid ? " selected" : "") + ">" + UNID[k][1] + "</option>"; }).join("") + "</select></div>";
    h += "<div class='ie-rolar'><table><thead><tr><th>" + UNID[S.unid][1] + "</th><th style='text-align:right'>" + es.u + "</th><th style='text-align:right'>est.</th></tr></thead><tbody>" +
      lista.map(function (x) { return "<tr class='cl' data-u='" + esc(x.u) + "' title='Filtrar o mapa'><td>" + esc(x.u) + "<div class='ie-bar' style='width:" + Math.max(2, 100 * Math.abs(x.m) / mx) + "%;background:" + corDe(es, x.m) + ";opacity:1;border:1px solid #d7dee6'></div></td><td class='n'>" + txt(x.m) + "</td><td class='n'>" + x.n + "</td></tr>"; }).join("") + "</tbody></table></div>";
    return h + "<p class='ie-nota'>Média simples das estações com dados suficientes dentro de cada unidade. Clique numa linha para recortar o mapa. Para ver no mapa, use a visualização “Por unidade”.</p>";
  }
  function abaDados() {
    var v = VAL.slice().sort(function (a, b) { return a.e.n.localeCompare(b.e.n, "pt-BR"); });
    return "<div style='display:flex;gap:6px;flex-wrap:wrap'><button type='button' class='ie-bt' data-x='periodo'>Baixar tabela do período (CSV)</button></div>" +
      "<div class='ie-rolar'><table><thead><tr><th>Estação</th><th style='text-align:right'>mm</th><th style='text-align:right'>% normal</th><th style='text-align:right'>dados</th></tr></thead><tbody>" +
      v.map(function (r) { return "<tr class='cl' data-c='" + esc(r.e.c) + "'><td>" + esc(r.e.n) + "</td><td class='n'>" + br(r.tot, 1) + "</td><td class='n'>" + (r.anom != null ? r.anom + "%" : "–") + "</td><td class='n'" + (r.ok ? "" : " style='color:#9a5b00'") + ">" + r.cob + "%</td></tr>"; }).join("") + "</tbody></table></div>" +
      "<p class='ie-nota'>Tabela de todas as estações com algum dado no período (inclusive as abaixo da qualidade mínima, em laranja). O CSV abre no Excel.</p>";
  }
  function abaSobre() {
    return "<div class='ie-grp' style='gap:8px;font-size:.88rem'>" +
      "<p><b>Dados.</b> Chuva diária das estações do monitoramento hidrometeorológico do SEIA/INEMA (PCDs do INEMA, CEMADEN, ANA e INMET), de " + dBR(INFO.inicio) + " a " + dBR(INFO.fim) + ": " + br(INFO.n_estacoes) + " estações e " + br(INFO.n_registros) + " registros diários. Os períodos que a COTIC pediu para excluir já foram retirados.</p>" +
      "<p><b>Qualidade.</b> Uma estação só entra no mapa se tiver pelo menos o percentual de dias com dado escolhido no período (80% por padrão). Os totais somam apenas os dias com dado.</p>" +
      "<p><b>Anomalia.</b> Compara o total com a normal 1991–2020 do município da estação, estimada pelo satélite CHIRPS (proporcional aos dias do período). A rede tem poucas estações com 30 anos de dados, por isso a normal vem do satélite.</p>" +
      "<p><b>Interpolado.</b> Inverso do quadrado da distância (IDW) com as estações válidas; áreas a mais de 50 km de qualquer estação ficam em branco. É uma aproximação visual: chuva convectiva varia muito em poucos quilômetros.</p>" +
      "<p><b>Camadas.</b> Municípios e territórios de identidade (SEI 2026), RPGA (INEMA 2012), bacias hidrográficas (INEMA 2012), semiárido (INSA 2024) e biomas (IBGE), do GeoServer do INEMA; regiões climáticas usadas nos boletins do INEMA. Cada estação foi associada às unidades pela sua coordenada.</p>" +
      "<div class='ie-aviso'>Dados brutos de estações automáticas e convencionais, sem consistência completa. Valores isolados muito altos podem ser leituras acumuladas de vários dias. Use com cautela e confira a série da estação.</div></div>";
  }

  // ficha da estação
  function escolhe(c, centraliza) {
    S.est = c; S.aba = "est"; var e = POR[c];
    if (centraliza && e) mapa.setView([e.la, e.lo], Math.max(mapa.getZoom(), 9));
    desenhaEst(); aba(); url();
  }
  function abaEst(el) {
    var e = S.est && POR[S.est];
    if (!e) { el.innerHTML = "<p class='ie-nota'>Clique numa estação no mapa, ou busque pelo nome ou município, para ver a série de chuva.</p>"; return; }
    var fim = e.fim, de = soma(fim, -119);
    Promise.all([garanteMensal(), garanteAnos([+de.slice(0, 4), +fim.slice(0, 4)].filter(function (a, i, l) { return l.indexOf(a) === i; }))]).then(function () {
      if (S.est !== e.c || S.aba !== "est") return;
      var r = VAL.filter(function (x) { return x.e.c === e.c; })[0], p = window.__iePer, m = MENS.est[e.c];
      var h = "<div class='ie-grp'><div><b style='font-size:1.05rem'>" + esc(e.n) + "</b><br><span class='ie-nota'>código " + esc(e.c) + " · " + esc(e.tipo) + " · " + e.la.toFixed(4) + ", " + e.lo.toFixed(4) + "</span></div>" +
        "<div>" + [["Município", e.mun], ["Território", e.ter], ["RPGA", e.rpga], ["Região", e.reg], ["Bacia", e.bac], ["Bioma", e.bio]].filter(function (x) { return x[1]; }).map(function (x) { return "<span class='ie-pill' title='" + x[0] + "'>" + esc(x[1]) + "</span>"; }).join("") + (e.semi ? "<span class='ie-pill'>Semiárido</span>" : "") + "</div>" +
        "<div class='ie-res'><div><b>" + (r ? br(r.tot, 1) + " mm" : "–") + "</b><span>" + esc(p.nome) + "</span></div><div><b>" + (r && r.anom != null ? r.anom + "%" : "–") + "</b><span>da normal no período</span></div>" +
        "<div><b>" + dBR(e.ini).slice(3) + "</b><span>início da série</span></div><div><b>" + e.cob + "%</b><span>dos dias com dado desde o início</span></div></div>" +
        (r && !r.ok ? "<div class='ie-aviso'>Esta estação tem só " + r.cob + "% dos dias com dado no período escolhido.</div>" : "") + "</div>";
      h += "<div><span class='ie-rot'>Chuva diária — últimos 120 dias com registro</span>" + grafDiario(e, de, fim) + "</div>";
      h += "<div><span class='ie-rot'>Chuva mensal — 36 meses</span>" + grafMensal(e, m) + "</div>";
      h += "<div><span class='ie-rot'>Total por ano</span>" + grafAnual(e, m) + "</div>";
      h += "<div style='display:flex;gap:6px;flex-wrap:wrap'><button type='button' class='ie-bt' data-x='mensal'>Baixar série mensal (CSV)</button><button type='button' class='ie-bt' data-x='diaria'>Baixar chuva diária do período (CSV)</button></div>";
      el.innerHTML = h; liga(el);
    }).catch(function (er) { el.innerHTML = "<div class='ie-aviso'>Não foi possível carregar a série (" + esc(er.message) + ").</div>"; });
  }
  function svgBarras(vals, rot, cor, opc) {
    opc = opc || {}; var W = 340, H = opc.h || 120, pe = 30, pd = 4, pt = 8, pb = 18, n = vals.length;
    var mx = Math.max.apply(null, vals.map(function (v) { return v == null ? 0 : v; }).concat(opc.linha || []).concat([opc.min || 5])) * 1.08;
    function y(v) { return pt + (H - pt - pb) * (1 - v / mx); }
    var bw = (W - pe - pd) / n, o = "<svg viewBox='0 0 " + W + " " + H + "' style='width:100%;height:auto' role='img'>";
    [0, mx / 2 / 1.08, mx / 1.08].forEach(function (v) { o += "<line x1='" + pe + "' x2='" + (W - pd) + "' y1='" + y(v) + "' y2='" + y(v) + "' stroke='#e3e8ee'/><text x='" + (pe - 3) + "' y='" + (y(v) + 3) + "' text-anchor='end'>" + Math.round(v) + "</text>"; });
    vals.forEach(function (v, i) {
      if (v == null) { if (opc.falta) o += "<rect x='" + (pe + i * bw) + "' y='" + (y(0) - 2) + "' width='" + Math.max(bw - .5, .5) + "' height='2' fill='#f0a340'><title>" + rot[i] + ": sem dado</title></rect>"; return; }
      var c = typeof cor === "function" ? cor(i, v) : cor;
      o += "<rect x='" + (pe + i * bw + (bw > 3 ? .5 : 0)) + "' y='" + y(v) + "' width='" + Math.max(bw - (bw > 3 ? 1 : 0), .6) + "' height='" + Math.max(0, y(0) - y(v)) + "' fill='" + c + "'><title>" + rot[i] + ": " + br(v, 1) + " mm" + (opc.tip ? opc.tip(i) : "") + "</title></rect>";
    });
    if (opc.linha) o += "<polyline fill='none' stroke='#e4572e' stroke-width='1.8' points='" + opc.linha.map(function (v, i) { return (pe + i * bw + bw / 2) + "," + y(v || 0); }).join(" ") + "'/>";
    (opc.marcas || []).forEach(function (mk) { o += "<text x='" + (pe + mk[0] * bw) + "' y='" + (H - 4) + "'>" + mk[1] + "</text>"; });
    return o + "</svg>";
  }
  function grafDiario(e, de, ate) {
    var s = serie(e.c, de, ate), rot = [], mk = [];
    for (var i = 0; i < s.length; i++) { var d = soma(de, i); rot.push(dBR(d)); if (d.slice(8) === "01") mk.push([i, MESES[+d.slice(5, 7) - 1]]); }
    return svgBarras(s, rot, "#1c79c0", { falta: true, marcas: mk }) + "<span class='ie-nota'>Laranja: dia sem dado.</span>";
  }
  function mesesDe(m) { var a = +m[0].slice(0, 4), mm = +m[0].slice(5) - 1; return m[1].map(function (_, i) { var t = a * 12 + mm + i; return Math.floor(t / 12) + "-" + ("0" + (t % 12 + 1)).slice(-2); }); }
  function grafMensal(e, m) {
    if (!m) return "<p class='ie-nota'>Sem totais mensais.</p>";
    var ms = mesesDe(m), k = Math.max(0, ms.length - 36), ult = ms.slice(k), tot = m[1].slice(k), dv = m[2].slice(k);
    var nm = e.nm ? ult.map(function (x) { return e.nm[+x.slice(5) - 1]; }) : null, mk = [];
    ult.forEach(function (x, i) { if (x.slice(5) === "01") mk.push([i, x.slice(0, 4)]); });
    return svgBarras(tot.map(function (v, i) { return dv[i] ? v : null; }), ult.map(function (x) { return MESES[+x.slice(5) - 1] + "/" + x.slice(0, 4); }),
      function (i) { var dm = diasNoMes(+ult[i].slice(0, 4), +ult[i].slice(5)); return dv[i] / dm >= .8 ? "#1c79c0" : "#9cc3e4"; },
      { linha: nm, marcas: mk, tip: function (i) { return " (" + dv[i] + " dias com dado)"; } }) +
      "<span class='ie-nota'>" + (nm ? "Linha vermelha: normal CHIRPS 1991–2020 do município. " : "") + "Barras claras: mês com menos de 80% dos dias.</span>";
  }
  function grafAnual(e, m) {
    if (!m) return "";
    var ms = mesesDe(m), por = {};
    ms.forEach(function (x, i) { var a = x.slice(0, 4); por[a] = por[a] || { t: 0, d: 0, n: 0 }; if (m[1][i] != null) por[a].t += m[1][i]; por[a].d += m[2][i]; por[a].n += diasNoMes(+a, +x.slice(5)); });
    var anos = Object.keys(por).sort(), norm = e.nm ? e.nm.reduce(function (a, b) { return a + (b || 0); }, 0) : null, mk = [];
    anos.forEach(function (a, i) { if (i === 0 || i === anos.length - 1 || +a % 10 === 0) mk.push([i, a]); });
    return svgBarras(anos.map(function (a) { return por[a].d ? Math.round(por[a].t) : null; }), anos,
      function (i) { var a = por[anos[i]]; return a.d / a.n >= .9 ? "#2e6b4f" : "#a9cbb9"; },
      { linha: norm ? anos.map(function () { return norm; }) : null, marcas: mk, h: 110, tip: function (i) { var a = por[anos[i]]; return " (" + Math.round(100 * a.d / a.n) + "% dos dias dos meses com registro)"; } }) +
      "<span class='ie-nota'>Verde escuro: ano com 90% ou mais dos dias com dado." + (norm ? " Linha: normal anual (" + br(norm) + " mm)." : "") + "</span>";
  }

  // ---------------- exportação ----------------
  function baixa(nome, linhas) {
    var csv = "﻿" + linhas.map(function (l) { return l.map(function (x) { var s = x == null ? "" : String(x); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(";"); }).join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = nome; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function num(v, c) { return v == null ? "" : Number(v).toFixed(c == null ? 1 : c).replace(".", ","); }
  function exporta(t) {
    var p = window.__iePer, e = POR[S.est];
    if (t === "periodo") {
      var l = [["codigo", "estacao", "municipio", "territorio", "rpga", "regiao", "latitude", "longitude", "de", "ate", "chuva_mm", "normal_mm", "pct_normal", "dias_com_chuva", "max_diaria_mm", "pct_dias_com_dado"]];
      VAL.forEach(function (r) { l.push([r.e.c, r.e.n, r.e.mun, r.e.ter, r.e.rpga, r.e.reg, num(r.e.la, 5), num(r.e.lo, 5), p.de, p.ate, num(r.tot), num(r.norm), r.anom, r.dias, num(r.max), r.cob]); });
      baixa("chuva_estacoes_" + p.de + "_" + p.ate + ".csv", l);
    } else if (t === "mensal" && e) {
      var m = MENS.est[e.c], ms = mesesDe(m), l2 = [["codigo", "estacao", "mes", "chuva_mm", "dias_com_dado", "normal_chirps_mm"]];
      ms.forEach(function (x, i) { l2.push([e.c, e.n, x, num(m[1][i]), m[2][i], e.nm ? num(e.nm[+x.slice(5) - 1]) : ""]); });
      baixa("chuva_mensal_" + e.c + ".csv", l2);
    } else if (t === "diaria" && e) {
      var s = serie(e.c, p.de, p.ate), l3 = [["codigo", "estacao", "data", "chuva_mm"]];
      s.forEach(function (v, i) { l3.push([e.c, e.n, soma(p.de, i), num(v)]); });
      baixa("chuva_diaria_" + e.c + "_" + p.de + "_" + p.ate + ".csv", l3);
    }
  }

  // ---------------- link da página ----------------
  function url() {
    try {
      var q = new URLSearchParams(); q.set("per", S.per); q.set("var", S.vr); q.set("vis", S.vis);
      if (S.per === "dias") q.set("n", S.n); if (S.per === "mes") q.set("mes", S.mes); if (S.per === "ano") q.set("ano", S.ano);
      if (S.per === "livre") { q.set("de", S.de); q.set("ate", S.ate); }
      if (S.est) q.set("estacao", S.est);
      history.replaceState(null, "", location.pathname + "?" + q.toString());
    } catch (e) { /* ignora */ }
  }
})();
