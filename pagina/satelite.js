/* INEMA · Meteorologia — Satélite (página /inema/meteorologia/satelite). Carregado pela página do portal. Gerado a partir de satelite-inema.html. */
(function () { if (document.getElementById('inema-sat-css')) return; var s = document.createElement('style'); s.id = 'inema-sat-css'; s.textContent = "#inema-sat{--az:#0b4f8a;--az2:#e8f0f8;--tx:#1d2733;--tx2:#5b6773;--ln:#d7dee6;--bg:#fff;font-family:system-ui,-apple-system,\"Segoe UI\",Roboto,Arial,sans-serif;color:var(--tx);font-size:15px;line-height:1.4;max-width:1400px;margin:0 auto}\n#inema-sat *{box-sizing:border-box}\n#inema-sat h2{font-size:1.45rem;margin:0 0 .25rem;color:var(--az)}\n#inema-sat .is-nav{display:flex;flex-wrap:wrap;gap:.3rem 1rem;font-size:.85rem;margin:0 0 .8rem}\n#inema-sat .is-nav a{color:var(--az)}\n#inema-sat .is-nav b{color:var(--tx)}\n#inema-sat .is-status{padding:.8rem 1rem;border-radius:6px;background:var(--az2);margin:1rem 0}\n#inema-sat .is-rot{font-size:.78rem;font-weight:600;color:var(--tx2);text-transform:uppercase;letter-spacing:.03em;margin:.6rem 0 .25rem}\n#inema-sat .is-bts{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center}\n#inema-sat .is-bts button{border:1px solid var(--ln);background:var(--bg);color:var(--tx);padding:.42rem .8rem;border-radius:999px;cursor:pointer;font:inherit;font-size:.88rem}\n#inema-sat .is-bts button[aria-pressed=true]{background:var(--az);border-color:var(--az);color:#fff}\n#inema-sat .is-bts.modo button[aria-pressed=true]{background:#2e6b4f;border-color:#2e6b4f}\n#inema-sat .is-bts.fonte button[aria-pressed=true]{background:#7a4b00;border-color:#7a4b00}\n#inema-sat .is-bts.passo button[aria-pressed=true]{background:#4b5563;border-color:#4b5563}\n#inema-sat .is-bts button:disabled{opacity:.4;cursor:not-allowed}\n#inema-sat .is-camadas{display:flex;flex-wrap:wrap;gap:.35rem}\n#inema-sat .is-camadas label{display:inline-flex;align-items:center;gap:.35rem;border:1px solid var(--ln);border-radius:999px;padding:.32rem .75rem;font-size:.86rem;cursor:pointer;background:var(--bg);user-select:none}\n#inema-sat .is-camadas label.on{border-color:var(--az);background:var(--az2)}\n#inema-sat .is-camadas label.off{opacity:.45;cursor:not-allowed}\n#inema-sat .is-camadas input{margin:0;accent-color:var(--az)}\n#inema-sat .is-camadas i{display:inline-block;width:14px;height:3px;border-radius:2px}\n#inema-sat figure{margin:.8rem 0 0;border:1px solid var(--ln);border-radius:8px;overflow:hidden;background:#111}\n#inema-sat figcaption{padding:.45rem .7rem;font-size:.85rem;background:#f3f6f9;color:var(--tx);border-bottom:1px solid var(--ln);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.4rem .8rem}\n#inema-sat figcaption span{color:var(--tx2)}\n#inema-sat .is-cab-dir{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}\n#inema-sat button.is-max{border:1px solid var(--ln);background:#fff;color:var(--tx);border-radius:6px;padding:.3rem .6rem;font:inherit;font-size:.82rem;cursor:pointer;display:inline-flex;align-items:center;gap:.35rem}\n#inema-sat button.is-max:hover{background:var(--az2)}\n#inema-sat button.is-max svg{width:15px;height:15px}\n#inema-sat figure img{display:block;width:100%;height:auto}\n#inema-sat .is-desc{color:var(--tx2);font-size:.85rem;margin:.4rem 0 0}\n#inema-sat .is-palco{background:#000}\n#inema-sat .is-mosaico{position:relative;background:#000;line-height:0;max-width:1100px;margin:0 auto}\n#inema-sat .is-quadro{position:absolute;inset:0;display:grid}\n#inema-sat .is-quadro.oculto{visibility:hidden}\n#inema-sat .is-cel{position:relative;width:100%;height:100%;overflow:hidden}\n#inema-sat .is-cel img{position:absolute;inset:0;width:100%;height:100%;display:block}\n#inema-sat .is-cel img.raios{filter:brightness(0) saturate(100%) invert(84%) sepia(68%) saturate(1000%) hue-rotate(359deg) brightness(105%)}\n#inema-sat .is-ref{pointer-events:none}\n#inema-sat svg.is-vetor{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}\n#inema-sat svg.is-vetor path{fill:none;pointer-events:fill;vector-effect:non-scaling-stroke;stroke-linejoin:round}\n#inema-sat svg.is-vetor path.hl{stroke-width:3;stroke-opacity:1;fill:rgba(255,255,255,.08)}\n#inema-sat svg.is-vetor .l-barragens path{fill:rgba(59,130,246,.55)}\n#inema-sat svg.is-vetor .l-barragens circle{fill:#60a5fa;stroke:#fff;stroke-width:1;vector-effect:non-scaling-stroke;pointer-events:all}\n#inema-sat svg.is-vetor .l-barragens .hl{fill:#facc15;stroke:#fff}\n#inema-sat .is-etiq{position:absolute;z-index:6;background:rgba(15,23,32,.9);color:#fff;padding:.45rem .65rem;border-radius:8px;font-size:.82rem;line-height:1.45;pointer-events:none;max-width:320px;box-shadow:0 4px 14px rgba(0,0,0,.35)}\n#inema-sat .is-etiq[hidden]{display:none}\n#inema-sat .is-etiq i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:.35rem;vertical-align:-1px}\n#inema-sat .is-etiq span{color:#cbd5e1}\n#inema-sat .is-player{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .8rem;padding:.5rem .7rem;background:#f3f6f9;border-top:1px solid var(--ln);font-size:.85rem}\n#inema-sat .is-player[hidden]{display:none}\n#inema-sat .is-player button{border:1px solid var(--ln);background:#fff;border-radius:6px;padding:.3rem .55rem;cursor:pointer;font:inherit;font-size:.85rem;min-width:2.2rem}\n#inema-sat .is-player input[type=range]{flex:1;min-width:140px;accent-color:var(--az)}\n#inema-sat .is-player .vel{display:inline-flex;align-items:center;gap:.3rem;color:var(--tx2)}\n#inema-sat .is-player .vel input{flex:none;width:90px;min-width:0}\n#inema-sat .is-carga{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.7);color:#fff;padding:.6rem 1rem;border-radius:8px;font-size:.9rem;line-height:1.3;z-index:5;text-align:center}\n#inema-sat .is-falta{padding:3rem 1rem;text-align:center;color:var(--tx2);background:#fff;line-height:1.4}\n#inema-sat .is-nota{color:var(--tx2);font-size:.8rem;margin-top:.8rem}\n#inema-sat .is-nota a{color:var(--az)}\n/* tela cheia */\n#inema-sat figure:fullscreen,#inema-sat figure.is-cheia{display:flex;flex-direction:column;border-radius:0;border:0;width:100vw;height:100vh;max-width:none}\n#inema-sat figure.is-cheia{position:fixed;inset:0;z-index:2147483000}\n#inema-sat figure:fullscreen .is-palco,#inema-sat figure.is-cheia .is-palco{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden}\n#inema-sat figure:fullscreen #is-area,#inema-sat figure.is-cheia #is-area{width:100%;height:100%;display:flex;align-items:center;justify-content:center}\n#inema-sat figure:fullscreen .is-mosaico,#inema-sat figure.is-cheia .is-mosaico{max-width:none;height:100%;width:auto;max-height:100%}\n#inema-sat figure:fullscreen #is-area \u003e a img,#inema-sat figure.is-cheia #is-area \u003e a img{max-height:100%;width:auto;max-width:100%;margin:0 auto}\n/* tela cheia: título e controles flutuam sobre a imagem e somem quando o mouse para */\n#inema-sat figure:fullscreen{position:relative}\n#inema-sat figure:fullscreen figcaption,#inema-sat figure.is-cheia figcaption{position:absolute;top:0;left:0;right:0;z-index:10;background:rgba(243,246,249,.9);transition:opacity .35s}\n#inema-sat figure:fullscreen .is-player,#inema-sat figure.is-cheia .is-player{position:absolute;bottom:0;left:0;right:0;z-index:10;background:rgba(243,246,249,.9);transition:opacity .35s}\n#inema-sat figure.is-ocioso figcaption,#inema-sat figure.is-ocioso .is-player{opacity:0;pointer-events:none}\n#inema-sat figure.is-ocioso .is-palco{cursor:none}\n/* logo do INEMA no canto inferior direito da imagem (oceano nos recortes da Bahia e do Nordeste) */\n#inema-sat .is-logo{position:absolute;right:1.6%;bottom:1.6%;width:14%;min-width:78px;max-width:170px;z-index:4;pointer-events:none;\n  background:rgba(255,255,255,.62);border-radius:8px;padding:.45% .7%;line-height:0;opacity:.82}\n#inema-sat .is-logo img{width:100%;height:auto;display:block}\n#inema-sat figure:fullscreen .is-logo,#inema-sat figure.is-cheia .is-logo{transition:bottom .35s}\n#inema-sat figure:fullscreen:not(.is-ocioso) .is-logo,#inema-sat figure.is-cheia:not(.is-ocioso) .is-logo{bottom:calc(1.6% + 46px)}\n@media (max-width:640px){#inema-sat .is-player .vel{display:none}}"; document.head.appendChild(s); })();
/* INEMA · Meteorologia — Satélite GOES-19.
   Fontes: CPTEC/INPE DSAT (mosaico de blocos com realces do CPTEC) e NOAA/NESDIS/STAR (imagens prontas).
   O site só permite carregar IMAGENS de fora (não dados): a hora da imagem mais recente do CPTEC é descoberta
   tentando carregar um bloco e recuando de 10 em 10 minutos (as imagens do GOES-19 saem a cada 10 min).
   Camadas da Bahia: desenhadas por cima com a projeção do satélite (grade fixa do GOES, longitude -75,2°),
   ajustada à grade de latitude/longitude do próprio CPTEC.
   A estrutura é montada por este script porque o editor do site apaga elementos vazios. */
(function () {
  var STAR = "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/";
  var DADOS = "https://cdn.jsdelivr.net/gh/aldirioalmeida-cpu/previsao-municipios-ba@";
  var FONTES = [["cptec", "CPTEC/INPE (DSAT)"], ["noaa", "NOAA/STAR"]];
  var REC = {
    noaa: [["nsa", "Bahia e Norte/Nordeste"], ["ssa", "Sul da América do Sul"], ["fd", "Disco completo"]],
    // [id, nome, zoom, x0, x1, y0, y1] — blocos 256 px do DSAT
    cptec: [["ba", "Bahia", 5, 15, 17, 12, 14], ["ne", "Nordeste e Bahia", 5, 15, 18, 11, 14], ["br", "Brasil", 4, 6, 9, 5, 8], ["as", "América do Sul", 4, 5, 9, 5, 10]]
  };
  var CANAIS = {
    noaa: [
      ["GEOCOLOR", "GeoColor", "Cor real de dia e infravermelho à noite. Visão geral, nevoeiro e nuvens baixas."],
      ["13", "Infravermelho (banda 13)", "Temperatura do topo das nuvens, dia e noite. Realça convecção profunda."],
      ["08", "Vapor d'água (banda 8)", "Umidade em altos níveis (~300 hPa): cavados, VCAN e jatos."],
      ["Sandwich", "Sanduíche", "Visível + infravermelho: topos convectivos e overshooting de dia."],
      ["AirMass", "Massa de ar", "Massas de ar quentes/frias e secas/úmidas; frentes e ciclogênese."]],
    cptec: [
      ["ch13_cpt_DSA", "Infravermelho (realce DSA)", "Canal 13 (10,35 µm) com o realce de cores do CPTEC: topos frios em azul/roxo indicam convecção profunda."],
      ["ch08_cpt_WVCOLOR35", "Vapor d'água 6,2 µm", "Vapor d'água em altos níveis: VCAN, cavados e jatos."],
      ["ch09_cpt_WVCOLOR35", "Vapor d'água 6,9 µm", "Vapor d'água em níveis médios-altos."],
      ["convective_storm", "Convecção (RGB, de dia)", "Day Convection: tempestades severas em amarelo intenso (só de dia)."],
      ["night_microphysics", "Microfísica noturna (RGB)", "Nuvens baixas e nevoeiro à noite."]]
  };
  // camadas: [id, nome, tipo, cor] — "bloco" = camada do CPTEC; "raios" = GLM (muda com a hora); "vetor" = limites da Bahia
  var CAMADAS = [
    ["countries", "Países e estados", "bloco", "#fff"],
    ["labels", "Nomes", "bloco", "#fff"],
    ["grid", "Latitude/longitude", "bloco", "#cbd5e1"],
    ["glm", "Raios (GLM)", "raios", "#ffd60a"],
    ["regioes", "Regiões climáticas", "vetor", "#00e676", "main/mapas/regioes_ba.geojson", "Região climática"],
    ["rpga", "RPGAs", "vetor", "#38bdf8", "main/mapas/rpga_ba.geojson", "RPGA"],
    ["ti", "Territórios de Identidade", "vetor", "#ff9f43", "main/focos/ti_ba.geojson", "Território de Identidade"],
    ["mun", "Municípios", "vetor", "#e2e8f0", "main/extremos/municipios_ba.geojson", "Município"],
    ["barragens", "Barragens", "vetor", "#3b82f6", "main/mapas/barragens_ba.geojson", "Barragem"]
  ];
  var ORDEM_VETOR = ["mun", "ti", "rpga", "regioes", "barragens"];        // ordem de desenho (de baixo para cima)
  var ORDEM_ETIQ = ["barragens", "mun", "ti", "rpga", "regioes"];         // ordem na etiqueta (do menor para o maior)
  var LOGO = "<div class='is-logo'><img alt='INEMA' src='https://cdn.jsdelivr.net/gh/aldirioalmeida-cpu/previsao-municipios-ba@main/pagina/logo-inema.png'></div>";
  var raiz = document.getElementById("inema-sat");
  if (!raiz) return;
  var ICO_MAX = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round'><path d='M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'/></svg>";
  var ICO_MIN = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round'><path d='M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5'/></svg>";
  raiz.innerHTML =
    "<h2>Satélite</h2>" +
    "<div class='is-nav'><b>Meteorologia:</b><a href='/inema/meteorologia/previsao-temperaturas'>Previsão de temperaturas e extremos</a>" +
    "<a href='/inema/meteorologia/modelos'>Mapas dos modelos</a><a href='/inema/meteorologia/satelite'>Satélite</a></div>" +
    "<div class='is-rot'>Fonte</div><div class='is-bts fonte' id='is-fonte'></div>" +
    "<div class='is-rot'>Recorte</div><div class='is-bts' id='is-setor'></div>" +
    "<div class='is-rot'>Canal / produto</div><div class='is-bts' id='is-canal'></div>" +
    "<div class='is-rot'>Exibição</div><div class='is-bts modo' id='is-modo'></div>" +
    "<div id='is-passo-bloco'><div class='is-rot'>Intervalo entre imagens</div><div class='is-bts passo' id='is-passo'></div></div>" +
    "<div class='is-rot'>Camadas</div><div class='is-camadas' id='is-camadas'></div>" +
    "<p class='is-desc' id='is-desc'></p>" +
    "<figure id='is-fig'><figcaption><b id='is-tit'></b><span class='is-cab-dir'><span id='is-hora'></span>" +
      "<button type='button' class='is-max' id='is-max' title='Maximizar a imagem (Esc para sair)'>" + ICO_MAX + "<span>Maximizar</span></button></span></figcaption>" +
      "<div class='is-palco'><div id='is-area'></div></div>" +
      "<div class='is-player' id='is-player' hidden><button type='button' id='is-play' title='Pausar / continuar'>❚❚</button>" +
      "<button type='button' id='is-ant' title='Imagem anterior'>◀</button><button type='button' id='is-prox' title='Próxima imagem'>▶</button>" +
      "<input type='range' id='is-barra' min='0' max='0' value='0' aria-label='Imagem da animação'>" +
      "<span class='vel'>velocidade <input type='range' id='is-vel' min='1' max='10' value='5' aria-label='Velocidade da animação'></span></div></figure>" +
    "<p class='is-nota' id='is-nota'></p>" +
    "<p class='is-nota'><a href='https://www.cptec.inpe.br/dsat/' target='_blank' rel='noopener'>CPTEC DSAT — visualizador interativo completo</a></p>";

  var $ = function (id) { return document.getElementById(id); };
  var sel = { f: "cptec", s: { noaa: "nsa", cptec: "ba" }, c: { noaa: "GEOCOLOR", cptec: "ch13_cpt_DSA" }, m: "atual", p: 10,
              cam: { countries: true, labels: true, grid: false, glm: false, regioes: false, ti: false, mun: false } };
  try {
    var g = JSON.parse(localStorage.getItem("inemaSatelite3") || "{}");
    if (g.f) { for (var k in g) if (k !== "cam") sel[k] = g[k]; for (var k2 in g.cam || {}) sel.cam[k2] = g.cam[k2]; }
  } catch (e) {}
  var geracao = 0, animTimer = null, horaCache = {}, vetores = {}, anim = null;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function dois(n) { return ("0" + n).slice(-2); }
  function botoes(id, itens, atual, attr, desab) {
    $(id).innerHTML = itens.map(function (it) {
      return "<button type='button' data-" + attr + "='" + esc(it[0]) + "' aria-pressed='" + (String(it[0]) === String(atual)) + "'" +
        (desab && desab(it[0]) ? " disabled" : "") + ">" + esc(it[1]) + "</button>";
    }).join("");
  }
  function rotHora(t) {
    var l = new Date(t.getTime() - 3 * 36e5);
    return dois(t.getUTCDate()) + "/" + dois(t.getUTCMonth() + 1) + " " + dois(t.getUTCHours()) + ":" + dois(t.getUTCMinutes()) +
      " UTC (" + dois(l.getUTCHours()) + ":" + dois(l.getUTCMinutes()) + " na Bahia)";
  }

  // ---------- projeção do GOES-19 (grade fixa) -> pixel global dos blocos do CPTEC
  // Coeficientes ajustados à grade lat/lon do CPTEC no zoom 5 (91% dos pontos sobre as linhas da grade).
  var GOES = { lon0: -75.2, a: 17994.9617, b: -893.4162 + 14 * 256, c: -17883.2857, d: 151.2353 + 10 * 256 };
  function projeta(lon, lat, z) {
    var req = 6378137, rpol = 6356752.31414, H = 42164160, e2 = 0.0066943800229;
    var la = lat * Math.PI / 180, lo = (lon - GOES.lon0) * Math.PI / 180;
    var pc = Math.atan((rpol * rpol) / (req * req) * Math.tan(la)), cp = Math.cos(pc);
    var rc = rpol / Math.sqrt(1 - e2 * cp * cp);
    var sx = H - rc * cp * Math.cos(lo), sy = -rc * cp * Math.sin(lo), sz = rc * Math.sin(pc);
    var x = Math.asin(-sy / Math.sqrt(sx * sx + sy * sy + sz * sz)), y = Math.atan(sz / sx), f = Math.pow(2, z - 5);
    return [(GOES.a * x + GOES.b) * f, (GOES.c * y + GOES.d) * f];
  }
  function carregaVetor(id) {
    if (vetores[id]) return vetores[id];
    var cam = CAMADAS.filter(function (c) { return c[0] === id; })[0];
    vetores[id] = fetch(DADOS + cam[4]).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    return vetores[id];
  }
  function caminhoFeicao(ft, z, r) {   // um caminho SVG por feição (para identificar ao passar o mouse)
    var ox = r[3] * 256, oy = r[5] * 256, out = "", gm = ft.geometry; if (!gm) return "";
    var polys = gm.type === "Polygon" ? [gm.coordinates] : gm.type === "MultiPolygon" ? gm.coordinates : [];
    polys.forEach(function (poly) {
      poly.forEach(function (anel) {
        for (var i = 0; i < anel.length; i++) { var p = projeta(anel[i][0], anel[i][1], z); out += (i ? "L" : "M") + (p[0] - ox).toFixed(1) + " " + (p[1] - oy).toFixed(1); }
        out += "Z";
      });
    });
    return out;
  }
  function nomeFeicao(id, pr) {
    if (id === "rpga") return (pr.codigo ? pr.codigo + " – " : "") + pr.nome;
    if (id === "barragens") return pr.nome || "Barragem sem nome cadastrado";
    return pr.nome || pr.NOME || "";
  }
  function desenhaVetores(r, minha) {
    var area = $("is-area").querySelector(".is-mosaico"); if (!area) return;
    var velho = area.querySelector("svg.is-vetor"); if (velho) velho.remove();
    var etq = area.querySelector(".is-etiq"); if (etq) etq.remove();
    var ativos = CAMADAS.filter(function (c) { return c[2] === "vetor" && sel.cam[c[0]]; });
    if (!ativos.length) return;
    var w = (r[4] - r[3] + 1) * 256, h = (r[6] - r[5] + 1) * 256;
    Promise.all(ativos.map(function (c) { return carregaVetor(c[0]).then(function (gj) { return [c, gj]; }, function () { return [c, null]; }); })).then(function (lst) {
      if (minha !== geracao) return;
      var area2 = $("is-area").querySelector(".is-mosaico"); if (!area2) return;
      var s = "<svg class='is-vetor' viewBox='0 0 " + w + " " + h + "' preserveAspectRatio='none' aria-hidden='true'>";
      ORDEM_VETOR.forEach(function (id) {
        lst.forEach(function (it) {
          if (it[0][0] !== id || !it[1]) return;
          var larg = id === "mun" ? 0.6 : id === "ti" ? 1.1 : id === "rpga" ? 1.3 : id === "barragens" ? 0.8 : 1.7;
          s += "<g data-l='" + id + "' class='l-" + id + "' stroke='" + it[0][3] + "' stroke-width='" + larg + "' stroke-opacity='" + (id === "mun" ? .6 : .95) + "'>";
          var fz = Math.pow(2, r[2] - 5);
          it[1].features.forEach(function (ft) {
            var pr = ft.properties || {}, nome = esc(nomeFeicao(id, pr)), d = caminhoFeicao(ft, r[2], r);
            if (d) s += "<path d='" + d + "' data-n='" + nome + "'/>";
            if (id === "barragens" && pr.c) {   // marcador: deixa ver e apontar até as represas pequenas
              var p = projeta(pr.c[0], pr.c[1], r[2]);
              s += "<circle cx='" + (p[0] - r[3] * 256).toFixed(1) + "' cy='" + (p[1] - r[5] * 256).toFixed(1) + "' r='" + (2.6 * Math.max(fz, .6)).toFixed(1) + "' data-n='" + nome + "'/>";
            }
          });
          s += "</g>";
        });
      });
      area2.insertAdjacentHTML("beforeend", s + "</svg><div class='is-etiq' id='is-etiq' hidden></div>");
      ligaEtiqueta(area2);
    });
  }
  // ao passar o mouse (ou tocar), mostra o município, território, RPGA e região do ponto
  function ligaEtiqueta(area) {
    if (area.getAttribute("data-etiq")) return;
    area.setAttribute("data-etiq", "1");
    var ultimo = [];
    function mostra(ev) {
      var et = $("is-etiq"); if (!et) return;
      var pt = ev.touches ? ev.touches[0] : ev, achados = {};
      ultimo.forEach(function (p) { p.classList.remove("hl"); }); ultimo = [];
      document.elementsFromPoint(pt.clientX, pt.clientY).forEach(function (el) {
        if ((el.tagName !== "path" && el.tagName !== "circle") || !el.getAttribute("data-n")) return;
        var id = el.parentNode.getAttribute("data-l");
        if (!achados[id]) { achados[id] = el.getAttribute("data-n"); el.classList.add("hl"); ultimo.push(el); }
      });
      var linhas = ORDEM_ETIQ.filter(function (id) { return achados[id]; }).map(function (id) {
        var c = CAMADAS.filter(function (x) { return x[0] === id; })[0];
        return "<div><i style='background:" + c[3] + "'></i><span>" + esc(c[5]) + ":</span> <b>" + esc(achados[id]) + "</b></div>";
      });
      if (!linhas.length) { et.hidden = true; return; }
      et.innerHTML = linhas.join(""); et.hidden = false;
      var caixa = area.getBoundingClientRect(), x = pt.clientX - caixa.left, y = pt.clientY - caixa.top;
      var dir = x > caixa.width * 0.6, baixo = y < 70;
      et.style.left = (dir ? "auto" : (x + 14) + "px"); et.style.right = (dir ? (caixa.width - x + 14) + "px" : "auto");
      et.style.top = (baixo ? y + 16 : y - 12) + "px"; et.style.transform = baixo ? "none" : "translateY(-100%)";
    }
    function some() { var et = $("is-etiq"); if (et) et.hidden = true; ultimo.forEach(function (p) { p.classList.remove("hl"); }); ultimo = []; }
    area.addEventListener("mousemove", mostra);
    area.addEventListener("mouseleave", some);
    area.addEventListener("touchstart", mostra, { passive: true });
  }

  // ---------- CPTEC DSAT: mosaico de blocos
  function bloco(prod, t, z, x, y) {
    var d = t.getUTCFullYear() + dois(t.getUTCMonth() + 1) + dois(t.getUTCDate()), h = dois(t.getUTCHours()) + dois(t.getUTCMinutes());
    return "https://s" + ((x + y) % 4) + ".cptec.inpe.br/goes/goes16/web_tiles/" + d + "/" + prod + "/" + h + "/" + z + "/" + x + "/" + y + ".png";
  }
  function ref(camada, z, x, y) { return "https://s" + ((x + y) % 4) + ".cptec.inpe.br/goes/goes16/web_tiles/references/" + camada + "/" + z + "/" + x + "/" + y + ".png"; }
  function acharHora(prod, r, cb) {      // tenta 10, 20, ... 120 min atrás até achar um bloco que exista
    var chave = prod + r[2];
    if (horaCache[chave] && Date.now() - horaCache[chave].quando < 5 * 6e4) return cb(horaCache[chave].t);
    var base = new Date(Math.floor(Date.now() / 6e5) * 6e5), n = 1;
    var x = Math.floor((r[3] + r[4]) / 2), y = Math.floor((r[5] + r[6]) / 2);
    (function tenta() {
      if (n > 12) return cb(null);
      var t = new Date(base.getTime() - n * 6e5), im = new Image();
      im.onload = function () { horaCache[chave] = { t: t, quando: Date.now() }; cb(t); };
      im.onerror = function () { n++; tenta(); };
      im.src = bloco(prod, t, r[2], x, y);
    })();
  }
  function grade(r) { return "grid-template-columns:repeat(" + (r[4] - r[3] + 1) + ",1fr);grid-template-rows:repeat(" + (r[6] - r[5] + 1) + ",1fr)"; }
  function quadro(prod, t, r, oculto, k) {
    var h = "<div class='is-quadro" + (oculto ? " oculto" : "") + "' data-k='" + k + "' style='" + grade(r) + "'>";
    for (var y = r[5]; y <= r[6]; y++) for (var x = r[3]; x <= r[4]; x++) {
      h += "<div class='is-cel'><img alt='' class='base' src='" + bloco(prod, t, r[2], x, y) + "'>" +
        (sel.cam.glm ? "<img alt='' class='raios' src='" + bloco("glm_density_group_pixel", t, r[2], x, y) + "' onerror=\"this.style.display='none'\">" : "") + "</div>";
    }
    return h + "</div>";
  }
  function referencias(r) {   // camadas fixas do CPTEC (não mudam com a hora): uma vez só, por cima das imagens
    var ativas = CAMADAS.filter(function (c) { return c[2] === "bloco" && sel.cam[c[0]]; });
    if (!ativas.length) return "";
    var h = "<div class='is-quadro is-ref' style='" + grade(r) + "'>";
    for (var y = r[5]; y <= r[6]; y++) for (var x = r[3]; x <= r[4]; x++) {
      h += "<div class='is-cel'>" + ativas.map(function (c) { return "<img alt='' src='" + ref(c[0], r[2], x, y) + "'>"; }).join("") + "</div>";
    }
    return h + "</div>";
  }
  function paraAnim() { if (animTimer) { clearTimeout(animTimer); animTimer = null; } anim = null; $("is-player").hidden = true; }
  function mostraCptec(minha) {
    var r = REC.cptec.filter(function (x) { return x[0] === sel.s.cptec; })[0] || REC.cptec[0];
    var prod = sel.c.cptec;
    $("is-area").innerHTML = "<div class='is-falta'>Procurando a imagem mais recente do CPTEC…</div>";
    acharHora(prod, r, function (t) {
      if (minha !== geracao) return;
      if (!t) { $("is-area").innerHTML = "<div class='is-falta'>Imagens do CPTEC indisponíveis no momento. Tente a fonte NOAA.</div>"; return; }
      var proporcao = "aspect-ratio:" + (r[4] - r[3] + 1) + "/" + (r[6] - r[5] + 1);
      if (sel.m === "atual") {
        $("is-area").innerHTML = "<div class='is-mosaico' style='" + proporcao + "'>" + quadro(prod, t, r, false, 0) + referencias(r) + LOGO + "</div>";
        $("is-hora").textContent = rotHora(t);
        desenhaVetores(r, minha);
        return;
      }
      // animação: últimas 3 ou 6 h, de 10, 20 ou 30 em 30 min
      var horas = sel.m === "a6" ? 6 : 3, passo = sel.p, n = horas * 60 / passo + 1, quadros = [];
      for (var i = n - 1; i >= 0; i--) quadros.push(new Date(t.getTime() - i * passo * 6e4));
      var h = "<div class='is-mosaico' style='" + proporcao + "'>";
      quadros.forEach(function (q, k) { h += quadro(prod, q, r, k !== quadros.length - 1, k); });
      h += referencias(r) + LOGO + "<div class='is-carga' id='is-carga'>Carregando as imagens… 0/" + n + "</div></div>";
      $("is-area").innerHTML = h;
      desenhaVetores(r, minha);
      var els = [].slice.call($("is-area").querySelectorAll(".is-quadro:not(.is-ref)")), ok = [], prontos = 0;
      els.forEach(function (el, k) {
        var imgs = el.querySelectorAll("img.base"), faltam = imgs.length, falhou = false;
        var fim = function () {
          if (--faltam > 0) return;
          prontos++; if (!falhou) ok[k] = true;
          if (minha !== geracao) return;
          var c = $("is-carga"); if (c) c.textContent = "Carregando as imagens… " + prontos + "/" + n;
          if (prontos === n) inicia();
        };
        [].forEach.call(imgs, function (im) {
          if (im.complete && im.naturalWidth) return fim();
          im.addEventListener("load", fim); im.addEventListener("error", function () { falhou = true; fim(); });
        });
      });
      function inicia() {
        var c = $("is-carga"); if (c) c.remove();
        var lista = []; els.forEach(function (el, k) { if (ok[k]) lista.push(k); else el.remove(); });
        if (!lista.length) { $("is-area").innerHTML = "<div class='is-falta'>Não foi possível carregar a animação agora.</div>"; return; }
        anim = { els: els, quadros: quadros, lista: lista, i: lista.length - 1, tocando: true };
        $("is-player").hidden = false; $("is-barra").max = lista.length - 1; mostraQuadro(lista.length - 1);
        $("is-play").textContent = "❚❚";
        agenda();
      }
    });
  }
  function mostraQuadro(i) {
    if (!anim) return;
    var a = anim; a.els[a.lista[a.i]].classList.add("oculto");
    a.i = (i + a.lista.length) % a.lista.length;
    a.els[a.lista[a.i]].classList.remove("oculto");
    $("is-barra").value = a.i;
    $("is-hora").textContent = (a.i + 1) + "/" + a.lista.length + " · " + rotHora(a.quadros[a.lista[a.i]]);
  }
  function agenda() {
    if (animTimer) clearTimeout(animTimer);
    if (!anim || !anim.tocando) return;
    var v = +$("is-vel").value, ms = Math.round(1400 / v);   // velocidade 1 a 10
    animTimer = setTimeout(function () { mostraQuadro(anim.i + 1); agenda(); }, anim.i === anim.lista.length - 1 ? ms * 3 : ms);
  }
  $("is-play").onclick = function () { if (!anim) return; anim.tocando = !anim.tocando; this.textContent = anim.tocando ? "❚❚" : "▶"; agenda(); };
  $("is-ant").onclick = function () { if (!anim) return; anim.tocando = false; $("is-play").textContent = "▶"; mostraQuadro(anim.i - 1); };
  $("is-prox").onclick = function () { if (!anim) return; anim.tocando = false; $("is-play").textContent = "▶"; mostraQuadro(anim.i + 1); };
  $("is-barra").oninput = function () { if (!anim) return; anim.tocando = false; $("is-play").textContent = "▶"; mostraQuadro(+this.value); };
  $("is-vel").oninput = function () { agenda(); };

  // ---------- NOAA STAR: imagens prontas
  function mostraNoaa() {
    var s = sel.s.noaa, c = sel.c.noaa, t = Math.floor(Date.now() / 6e5), u;
    if (s === "fd") u = STAR + "FD/" + c + "/1808x1808.jpg?t=" + t;
    else if (sel.m === "atual") u = STAR + "SECTOR/" + s + "/" + c + "/1800x1080.jpg?t=" + t;
    else u = STAR + "SECTOR/" + s + "/" + c + "/GOES19-" + s.toUpperCase() + "-" + c + "-900x540.gif?t=" + t;
    $("is-area").innerHTML = "<div style='position:relative;line-height:0'><a href='" + u.split("?")[0] + "' target='_blank' rel='noopener'><img alt='Imagem de satélite GOES-19' src='" + u + "'></a>" + LOGO + "</div>";
    $("is-area").querySelector("img").onerror = function () { $("is-hora").textContent = "imagem indisponível no momento"; };
    $("is-hora").textContent = s === "fd" || sel.m === "atual" ? "data e hora (UTC) no rodapé da imagem" : "animação — pode levar alguns segundos para carregar";
  }

  // ---------- maximizar (tela cheia; se o navegador não permitir, ocupa a janela)
  function cheia() { return document.fullscreenElement === $("is-fig") || $("is-fig").classList.contains("is-cheia"); }
  function botaoMax() { var c = cheia(); $("is-max").innerHTML = (c ? ICO_MIN : ICO_MAX) + "<span>" + (c ? "Sair da tela cheia" : "Maximizar") + "</span>"; }
  $("is-max").onclick = function () {
    var fig = $("is-fig");
    if (cheia()) {
      if (document.fullscreenElement) document.exitFullscreen(); else { fig.classList.remove("is-cheia"); document.body.style.overflow = document.documentElement.style.overflow = ""; botaoMax(); acorda(); }
      return;
    }
    if (fig.requestFullscreen) fig.requestFullscreen().catch(function () { fig.classList.add("is-cheia"); document.body.style.overflow = document.documentElement.style.overflow = "hidden"; botaoMax(); acorda(); });
    else { fig.classList.add("is-cheia"); document.body.style.overflow = document.documentElement.style.overflow = "hidden"; botaoMax(); acorda(); }
  };
  document.addEventListener("fullscreenchange", function () { botaoMax(); acorda(); });
  // na tela cheia, título e controles somem 2,5 s depois que o mouse para (e voltam ao mexer ou tocar)
  var tmOcioso = null;
  function acorda() {
    var fig = $("is-fig"); fig.classList.remove("is-ocioso"); clearTimeout(tmOcioso);
    if (!cheia()) return;
    tmOcioso = setTimeout(function () {
      if (cheia() && !fig.querySelector("figcaption:hover, .is-player:hover")) fig.classList.add("is-ocioso");
    }, 2500);
  }
  ["mousemove", "mousedown", "touchstart", "keydown", "wheel"].forEach(function (ev) { $("is-fig").addEventListener(ev, acorda, { passive: true }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("is-fig").classList.contains("is-cheia")) { $("is-fig").classList.remove("is-cheia"); document.body.style.overflow = document.documentElement.style.overflow = ""; botaoMax(); acorda(); } });

  function desenhaCamadas() {
    var f = sel.f;
    $("is-camadas").innerHTML = CAMADAS.map(function (c) {
      var off = f !== "cptec", on = !off && sel.cam[c[0]];
      return "<label class='" + (off ? "off" : on ? "on" : "") + "' title='" + (off ? "Camadas disponíveis só na fonte CPTEC" : "") + "'><input type='checkbox' data-cam='" + c[0] + "'" + (on ? " checked" : "") + (off ? " disabled" : "") + ">" +
        "<i style='background:" + c[3] + ";box-shadow:0 0 0 1px rgba(0,0,0,.25)'></i>" + esc(c[1]) + "</label>";
    }).join("");
  }
  function desenha() {
    geracao++; paraAnim();
    var f = sel.f;
    if (f === "noaa" && sel.s.noaa === "fd" && sel.m !== "atual") sel.m = "atual";
    if (f === "noaa" && (sel.m === "a3" || sel.m === "a6")) sel.m = "anim";
    if (f === "cptec" && sel.m === "anim") sel.m = "a3";
    botoes("is-fonte", FONTES, f, "f");
    botoes("is-setor", REC[f].map(function (r) { return [r[0], r[1]]; }), sel.s[f], "s");
    if (!CANAIS[f].some(function (c) { return c[0] === sel.c[f]; })) sel.c[f] = CANAIS[f][0][0];
    botoes("is-canal", CANAIS[f], sel.c[f], "c");
    botoes("is-modo", f === "cptec" ? [["atual", "Imagem mais recente"], ["a3", "Animação 3 h"], ["a6", "Animação 6 h"]]
                                    : [["atual", "Imagem mais recente"], ["anim", "Animação (últimas horas)"]], sel.m, "m",
      function (m) { return m === "anim" && f === "noaa" && sel.s.noaa === "fd"; });
    $("is-passo-bloco").hidden = !(f === "cptec" && sel.m !== "atual");
    botoes("is-passo", [[10, "10 min"], [20, "20 min"], [30, "30 min"]], sel.p, "p");
    desenhaCamadas();
    var c = CANAIS[f].filter(function (x) { return x[0] === sel.c[f]; })[0] || CANAIS[f][0];
    var r = REC[f].filter(function (x) { return x[0] === sel.s[f]; })[0] || REC[f][0];
    $("is-desc").textContent = c[2];
    $("is-tit").textContent = (f === "cptec" ? "CPTEC/INPE · " : "NOAA · ") + "GOES-19 · " + c[1] + (f === "cptec" && sel.cam.glm ? " + raios" : "") + " · " + r[1];
    $("is-hora").textContent = "";
    var nImg = sel.m === "atual" ? 0 : (sel.m === "a6" ? 6 : 3) * 60 / sel.p + 1;
    $("is-nota").textContent = f === "cptec"
      ? "Fonte: CPTEC/INPE — DSAT (GOES-19), com os realces de cores do CPTEC. O satélite gera uma imagem a cada 10 minutos; a mais recente costuma ter 10–20 min de atraso." +
        (nImg ? " Animação com " + nImg + " imagens de " + sel.p + " em " + sel.p + " minutos." : "") +
        " Limites da Bahia desenhados com a projeção do satélite (podem diferir alguns quilômetros nas bordas)."
      : "Fonte: NOAA/NESDIS/STAR — GOES-19 (GOES-Leste), domínio público. A animação dos recortes cobre as últimas horas (~10 MB). O disco completo não tem animação. As camadas só estão disponíveis na fonte CPTEC.";
    try { localStorage.setItem("inemaSatelite3", JSON.stringify(sel)); } catch (e) {}
    if (f === "cptec") mostraCptec(geracao); else mostraNoaa();
  }
  $("is-fonte").onclick = function (e) { var b = e.target.closest("button"); if (b) { sel.f = b.getAttribute("data-f"); desenha(); } };
  $("is-setor").onclick = function (e) { var b = e.target.closest("button"); if (b) { sel.s[sel.f] = b.getAttribute("data-s"); desenha(); } };
  $("is-canal").onclick = function (e) { var b = e.target.closest("button"); if (b) { sel.c[sel.f] = b.getAttribute("data-c"); desenha(); } };
  $("is-modo").onclick = function (e) { var b = e.target.closest("button"); if (b && !b.disabled) { sel.m = b.getAttribute("data-m"); desenha(); } };
  $("is-passo").onclick = function (e) { var b = e.target.closest("button"); if (b) { sel.p = +b.getAttribute("data-p"); desenha(); } };
  $("is-camadas").onchange = function (e) {
    var cb = e.target.closest("input[data-cam]"); if (!cb) return;
    sel.cam[cb.getAttribute("data-cam")] = cb.checked;
    var tipo = CAMADAS.filter(function (c) { return c[0] === cb.getAttribute("data-cam"); })[0][2];
    if (tipo === "vetor" && sel.f === "cptec" && $("is-area").querySelector(".is-mosaico")) {   // só redesenha a sobreposição
      desenhaCamadas(); try { localStorage.setItem("inemaSatelite3", JSON.stringify(sel)); } catch (e2) {}
      var r = REC.cptec.filter(function (x) { return x[0] === sel.s.cptec; })[0] || REC.cptec[0];
      desenhaVetores(r, geracao); return;
    }
    desenha();
  };
  desenha();
  setInterval(function () { if (sel.m === "atual" && !document.hidden) desenha(); }, 6e5);   // atualiza a cada 10 min
})();
