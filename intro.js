(() => {
  'use strict';

  /* =====================================================================
     1) CONFIGURAÇÃO: o que você mais vai querer ajustar
     ===================================================================== */
  const SPEED = 1;       // velocidade geral: 1 = normal, 0.5 = metade da velocidade, 2 = dobro
  const LOOP  = false;    // true = repete para sempre; false = toca uma vez e fica na logo final
  const CYCLE = 2.5;     // (s) duração de cada ciclo completo, contando o fade-out final
  const FADE_AT = 2.5;   // (s) momento em que começa o fade-out antes de reiniciar

  // Tempos do feixe de luz (em segundos):
  //   ORBIT_START → começa a circular | ORBIT_END → termina a volta | SWOOP_END → chega ao texto e some
  const ORBIT_START = 0.05, ORBIT_END = 1.5, SWOOP_END = 1.95;

  // Cauda do feixe: TRAIL_N = nº de segmentos (maior = cauda mais suave),
  // TRAIL_DT = intervalo de tempo entre segmentos (maior = cauda mais longa)
  const TRAIL_N = 18, TRAIL_DT = 0.012;

  // Para onde o feixe vai depois de circular (início do texto "iure-go")
  const WORD_START = [248, 880];

  /* =====================================================================
     2) UTILITÁRIOS: funções pequenas usadas em todo o código
     ===================================================================== */
  const NS = 'http://www.w3.org/2000/svg';            // namespace para criar elementos SVG
  const $ = id => document.getElementById(id);         // atalho para buscar elemento por id
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)); // limita v entre a e b

  // seg(t, a, b): converte o tempo t em progresso de 0 a 1 entre os instantes a e b.
  //   Antes de a → 0 | depois de b → 1 | no meio → valor proporcional.
  const seg = (t, a, b) => clamp((t - a) / (b - a));

  // Curvas de suavização (recebem 0..1 e devolvem 0..1):
  const easeOut = x => 1 - Math.pow(1 - x, 3);                      // começa rápido, termina devagar
  const easeIO = x => -(Math.cos(Math.PI * x) - 1) / 2;              // começa e termina devagar

  const set = (e, k, v) => e.setAttribute(k, v);       // atalho para alterar atributos SVG

  // Referências a todos os elementos que serão animados
  const el = {
    glow: $('glowC'), streaks: $('streaks'), stA: $('stA'), stB: $('stB'),
    r1: $('r1'), r2: $('r2'), l: $('l'),
    bar: $('bar'), ring: $('ring'), c1: $('c1'), c2: $('c2'), c3: $('c3'),
    bt: $('braceTop'), bb: $('braceBot'), word: $('word'), sub: $('sub'),
    trail: $('trail'), halo: $('halo'), spark: $('spark'),
    stage: $('svg'), particles: $('particles'), dashes: $('dashes'), logo: $('logo')
  };

  /* =====================================================================
     3) LINHAS DE CÓDIGO decorativas (efeito "digitando")
        Cada item: [x1, y1, x2, y2, cor, instante em que começa a aparecer (s)]
        Para adicionar uma linha, basta incluir mais um item na lista.
     ===================================================================== */
  const DASH_DATA = [
    [426, 351, 450, 351, '#12b8d8', 1.55],
    [440, 369, 464, 369, '#12b8d8', 1.62],
    [485, 369, 486, 369, '#78f35c', 1.66],
    [506, 369, 535, 369, '#78f35c', 1.70],
    [440, 386, 490, 386, '#78f35c', 1.74],
    [440, 403, 464, 403, '#12b8d8', 1.78],
    [428, 420, 429, 420, '#18d9d4', 1.82],
    [390, 438, 418, 438, '#12b8d8', 1.86],
    [394, 626, 422, 626, '#12b8f5', 1.62],
    [404, 639, 444, 639, '#62ee3e', 1.70],
    [422, 652, 458, 652, '#18e6f2', 1.78],
    [472, 663, 473, 663, '#62ee3e', 1.86],
    [490, 663, 491, 663, '#62ee3e', 1.90]
  ];
  // Cria um <line> SVG para cada item da lista e começa "apagado" (dashoffset = 100)
  const dashEls = DASH_DATA.map(d => {
    const n = document.createElementNS(NS, 'line');
    set(n, 'x1', d[0]); set(n, 'y1', d[1]); set(n, 'x2', d[2]); set(n, 'y2', d[3]);
    set(n, 'stroke', d[4]); set(n, 'stroke-width', d[1] < 500 ? (d[2] - d[0] <= 1 ? 10 : 8) : 6); set(n, 'pathLength', 100);
    set(n, 'stroke-dasharray', 100); set(n, 'stroke-dashoffset', 100);
    el.dashes.appendChild(n);
    return n;
  });

  /* =====================================================================
     4) PARTÍCULAS
        Usa um gerador de números aleatórios com "semente" (2024): assim as
        partículas ficam sempre nas mesmas posições a cada carregamento.
        Troque o 2024 por outro número para obter outra distribuição.
     ===================================================================== */
  function mulberry32(a) {
    // Gerador pseudoaleatório pequeno e rápido (não precisa mexer)
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const rnd = mulberry32(2024);
  // Número aleatório com distribuição "em sino" (a maioria perto de 0)
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 1.2;
  const parts = [];
  for (let i = 0; i < 56; i++) {                     // 56 = quantidade de partículas
    const near = rnd() < 0.7;                         // 70% concentradas perto da logo, 30% espalhadas
    const x = near ? 448 + gauss() * 230 : 40 + rnd() * 816;
    const y = near ? 520 + gauss() * 260 : 80 + rnd() * 1040;
    const c = document.createElementNS(NS, 'circle');
    const r = 0.9 + rnd() * 2.3;                      // raio de cada partícula (0,9 a 3,2)
    set(c, 'r', r.toFixed(2));
    set(c, 'fill', rnd() < 0.18 ? '#62ee3e' : '#29e3f5'); // 18% verdes, o resto ciano
    set(c, 'opacity', 0);
    el.particles.appendChild(c);
    parts.push({
      c, x, y,
      base: 0.35 + rnd() * 0.65,   // brilho máximo
      ph: rnd() * 6.28,            // fase do cintilar (para não piscarem juntas)
      sp: 0.8 + rnd() * 1.8,       // velocidade do cintilar
      vy: 2 + rnd() * 6,           // velocidade de subida (px por segundo)
      delay: 0.2 + rnd() * 1.4     // atraso até aparecer
    });
  }

  /* =====================================================================
     5) GEOMETRIA DO DESENHO DOS CONTORNOS
        O contorno é desenhado "seguindo" uma rota: r1 → abertura → r2 → abertura → l.
        Medimos o comprimento real de cada traço para revelar cada um na hora certa.
     ===================================================================== */
  const paths = [el.r1, el.r2, el.l];
  const lens = paths.map(p => p.getTotalLength());   // comprimento de cada traço
  // Faz o traço ficar totalmente "escondido" no início (dash = comprimento total)
  paths.forEach((p, i) => set(p, 'stroke-dasharray', lens[i] + ' ' + lens[i]));
  // pt(p, d): coordenada [x, y] do ponto a uma distância d do início do traço p
  const pt = (p, d) => { const q = p.getPointAtLength(d); return [q.x, q.y]; };
  const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

  // As "aberturas" são trechos sem desenho entre um traço e o próximo
  const gap1 = [pt(el.r1, lens[0]), pt(el.r2, 0)];
  const gap2 = [pt(el.r2, lens[1]), pt(el.l, 0)];
  const route = [
    { p: el.r1, len: lens[0], i: 0 },
    { a: gap1[0], b: gap1[1], len: dist(gap1[0], gap1[1]) },
    { p: el.r2, len: lens[1], i: 1 },
    { a: gap2[0], b: gap2[1], len: dist(gap2[0], gap2[1]) },
    { p: el.l, len: lens[2], i: 2 }
  ];
  // Calcula onde cada trecho começa e termina ao longo da rota completa
  let acc = 0;
  route.forEach(s => { s.start = acc; acc += s.len; s.end = acc; });
  const TOTAL = acc;                                  // comprimento total da rota

  /* =====================================================================
     6) TRAJETÓRIA DO FEIXE DE LUZ
        Fase 1 (orbit): circula a logo.  Fase 2 (swoop): desce em curva até o texto.
     ===================================================================== */
  const OC = [448, 520];                              // centro da órbita (centro da logo)
  // A0 = ângulo inicial (-100° ≈ topo) | SWEEP = quanto gira no total (400° = 1 volta + 40°)
  const A0 = -100 * Math.PI / 180, SWEEP = 400 * Math.PI / 180;

  // orbitPos(u): posição [x, y] do feixe, com u de 0 (início) a 1 (fim da órbita)
  //   raio = 305 - 18*e → começa com raio 305 e fecha até 287 (espiral leve).
  //   Aumente 305 para o feixe passar mais longe da logo.
  const orbitPos = u => {
    const e = easeIO(u), a = A0 + SWEEP * e, r = 305 - 18 * e;
    return [OC[0] + r * Math.cos(a), OC[1] + r * Math.sin(a)];
  };
  const END_PT = orbitPos(1);                         // ponto onde a órbita termina

  // swoop(u): curva suave (Bézier) do fim da órbita até o início do texto.
  //   swoopCtl é o "ponto de controle": mexa nele para mudar o arco da descida.
  const swoopCtl = [140, 800];
  const swoop = u => {
    const e = easeOut(u), k = 1 - e;
    return [
      k * k * END_PT[0] + 2 * k * e * swoopCtl[0] + e * e * WORD_START[0],
      k * k * END_PT[1] + 2 * k * e * swoopCtl[1] + e * e * WORD_START[1]
    ];
  };

  // sparkPos(tau): onde o feixe está no instante tau (ou null se ainda não apareceu / já sumiu)
  const sparkPos = tau => {
    if (tau < ORBIT_START || tau > SWOOP_END) return null;
    if (tau <= ORBIT_END) return orbitPos(seg(tau, ORBIT_START, ORBIT_END));
    return swoop(seg(tau, ORBIT_END, SWOOP_END));
  };
  // sparkVis(tau): visibilidade do feixe (0 a 1): surge rápido no início e some no final da descida
  const sparkVis = tau => seg(tau, ORBIT_START, ORBIT_START + 0.07) * (1 - seg(tau, 1.72, SWOOP_END));

  // Cria os segmentos da cauda (linhas que ficam mais finas e transparentes para trás)
  const trailLines = [];
  for (let i = 0; i < TRAIL_N; i++) {
    const l = document.createElementNS(NS, 'line');
    set(l, 'opacity', 0);
    el.trail.appendChild(l);
    trailLines.push(l);
  }

  /* =====================================================================
     7) RENDERIZAÇÃO: toda a linha do tempo da animação
        render(t, abs) desenha o quadro exato do instante t (segundos desde o
        início do ciclo). "abs" é um relógio contínuo, usado só nas partículas.
        Para mudar QUANDO algo acontece, altere os números dentro de seg(t, início, fim).
     ===================================================================== */
  function render(t, abs) {
    // --- Brilho de fundo: cresce até 1,3 s, dá um pulso após 1,7 s e depois "respira" ---
    const pulse = t > 1.7 ? Math.exp(-(t - 1.7) * 2.8) * 0.4 : 0;
    const breathe = t > 2.2 ? 0.07 * Math.sin((t - 2.2) * 2.2) : 0;
    set(el.glow, 'opacity', clamp(easeOut(seg(t, 0, 1.3)) + pulse + breathe, 0, 1.4).toFixed(3));

    // --- Riscos diagonais: surgem e deslizam 36 unidades até a posição final ---
    set(el.streaks, 'opacity', (0.38 * easeOut(seg(t, 0.2, 1.4))).toFixed(3));
    const sl = (1 - easeOut(seg(t, 0.2, 1.6))) * 36;
    set(el.stA, 'transform', `translate(${sl.toFixed(1)} ${(-sl).toFixed(1)})`);
    set(el.stB, 'transform', `translate(${(-sl).toFixed(1)} ${sl.toFixed(1)})`);

    // --- Contornos (hexágono + chave): desenhados entre 0,2 s e 1,55 s ---
    //     s = distância já "percorrida" na rota; cada traço mostra só a parte já percorrida.
    const s = easeOut(seg(t, 0.2, 1.55)) * TOTAL;
    set($('hexTipTop'), 'opacity', seg(s, lens[0] - 8, lens[0]));
    const lowerStart = route.find(r => r.p === el.r2).start;
    set($('hexTipBottom'), 'opacity', seg(s, lowerStart, lowerStart + 8));
    route.forEach(r => {
      if (!r.p) return;                                  // pula as aberturas (não têm desenho)
      const prog = clamp((s - r.start) / (r.end - r.start));
      set(r.p, 'stroke-dashoffset', (r.len * (1 - prog)).toFixed(2));
    });

    // --- Elementos internos: "I", "O" e chevrons são desenhados em sequência ---
    //     (início, fim) em segundos. dashoffset 100 = apagado, 0 = completo.
    set(el.bar,  'stroke-dashoffset', (100 * (1 - easeOut(seg(t, 0.95, 1.55)))).toFixed(2));
    set(el.ring, 'stroke-dashoffset', (100 * (1 - easeOut(seg(t, 1.05, 1.8)))).toFixed(2));
    set(el.c1, 'stroke-dashoffset', (100 * (1 - easeOut(seg(t, 1.20, 1.60)))).toFixed(2));
    set(el.c2, 'stroke-dashoffset', (100 * (1 - easeOut(seg(t, 1.30, 1.70)))).toFixed(2));
    set(el.c3, 'stroke-dashoffset', (100 * (1 - easeOut(seg(t, 1.40, 1.80)))).toFixed(2));

    // --- Chaves pequenas: surgem com fade e deslizam 8 unidades (a de cima desce, a de baixo sobe) ---
    const bt = easeOut(seg(t, 1.35, 1.8)), bb = easeOut(seg(t, 1.45, 1.9));
    set(el.bt, 'opacity', bt.toFixed(3));
    set(el.bt, 'transform', `translate(0 ${((1 - bt) * -8).toFixed(1)})`);
    set(el.bb, 'opacity', bb.toFixed(3));
    set(el.bb, 'transform', `translate(0 ${((1 - bb) * 8).toFixed(1)})`);

    // --- Linhas de código: cada uma é desenhada em 0,22 s a partir do instante definido em DASH_DATA ---
    dashEls.forEach((d, i) => {
      set(d, 'stroke-dashoffset', (100 * (1 - easeOut(seg(t, DASH_DATA[i][5], DASH_DATA[i][5] + 0.22)))).toFixed(2));
    });

    // --- Texto "iure-go": fade-in com subida de 14 unidades entre 1,6 s e 2,3 s ---
    const w = easeOut(seg(t, 1.6, 2.3));
    set(el.word, 'opacity', w.toFixed(3));
    set(el.word, 'transform', `translate(0 ${((1 - w) * 14).toFixed(2)})`);
    // --- Subtítulo: entra logo depois, entre 2,0 s e 2,7 s ---
    const sb = easeOut(seg(t, 2.0, 2.7));
    set(el.sub, 'opacity', sb.toFixed(3));
    set(el.sub, 'transform', `translate(0 ${((1 - sb) * 10).toFixed(2)})`);

    // --- Feixe de luz: posiciona o ponto e o halo; se não estiver ativo, esconde ---
    const p = sparkPos(t), vis = sparkVis(t);
    if (p && vis > 0) {
      set(el.spark, 'cx', p[0]); set(el.spark, 'cy', p[1]);
      set(el.halo, 'cx', p[0]);  set(el.halo, 'cy', p[1]);
      set(el.spark, 'opacity', vis.toFixed(3));
      set(el.halo, 'opacity', (vis * 0.8).toFixed(3));
    } else {
      set(el.spark, 'opacity', 0); set(el.halo, 'opacity', 0);
    }
    // --- Cauda: cada segmento liga a posição do feixe em dois instantes um pouco anteriores.
    //     Quanto mais "para trás" (i maior), mais fino (stroke-width) e transparente (opacity). ---
    for (let i = 0; i < TRAIL_N; i++) {
      const a = sparkPos(t - i * TRAIL_DT), b = sparkPos(t - (i + 1) * TRAIL_DT), l = trailLines[i];
      if (!a || !b || vis <= 0) { set(l, 'opacity', 0); continue; }
      const f = 1 - i / TRAIL_N;                         // 1 = perto do feixe, 0 = ponta da cauda
      set(l, 'x1', a[0]); set(l, 'y1', a[1]); set(l, 'x2', b[0]); set(l, 'y2', b[1]);
      set(l, 'stroke-width', (0.6 + 3.2 * f).toFixed(2));  // espessura: de 0,6 a 3,8
      set(l, 'opacity', (0.85 * f * vis).toFixed(3));
    }

    // --- Partículas: aparecem após seu "delay", cintilam (seno ao quadrado) e sobem devagar.
    //     Usam "abs" (tempo contínuo) para não reiniciarem junto com o ciclo. ---
    parts.forEach(q => {
      const env = easeOut(seg(t, q.delay, q.delay + 0.8));                       // fade-in individual
      const tw = 0.35 + 0.65 * Math.pow(Math.sin(abs * q.sp + q.ph), 2);          // cintilar
      const y = q.y - ((abs * q.vy) % 1200);                                      // subida contínua
      set(q.c, 'cx', q.x.toFixed(1));
      set(q.c, 'cy', (y < -20 ? y + 1240 : y).toFixed(1));                        // reaparece embaixo ao sair por cima
      set(q.c, 'opacity', (q.base * tw * env).toFixed(3));
    });

    // --- Fade-out final: some entre FADE_AT e o fim do ciclo (só se LOOP = true) ---
    const out = LOOP ? 1 - seg(t, FADE_AT, CYCLE - 0.15) : 1;
    set(el.stage, 'opacity', out.toFixed(3));
  }

  /* =====================================================================
     8) LAÇO DE ANIMAÇÃO (normalmente não precisa mexer)
     ===================================================================== */
  // Controle do overlay da página e reprodução única.
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro = document.getElementById('intro-screen');
  const skip = document.getElementById('skip-intro');
  const main = document.querySelector('main');
  const pageParts = document.querySelectorAll('.site-header, main, body > footer');
  const backToTop = document.getElementById('back-to-top');
  const introStorageKey = 'iure-go-portfolio-intro-seen';
  let start = performance.now(), raf = 0, dismissed = false;

  function updateBackToTop() {
    const visible = window.scrollY > 320;
    backToTop.classList.toggle('is-visible', visible);
    backToTop.setAttribute('aria-hidden', String(!visible));
    backToTop.tabIndex = visible ? 0 : -1;
  }
  window.addEventListener('scroll', updateBackToTop, {passive:true});
  updateBackToTop();

  function dismiss(instant = false) {
    if (dismissed) return;
    dismissed = true;
    cancelAnimationFrame(raf);
    try { localStorage.setItem(introStorageKey, 'true'); } catch { /* Armazenamento pode estar indisponível. */ }
    intro.classList.add('is-closing');
    pageParts.forEach(part => { part.inert = false; });
    document.body.classList.remove('intro-active');
    if (main) main.focus({preventScroll:true});
  }

  function frame(now) {
    const elapsed = ((now - start) / 1000) * SPEED;
    const t = Math.min(elapsed, CYCLE);
    render(t, now / 1000);
    if (elapsed < CYCLE) raf = requestAnimationFrame(frame);
    else dismiss();
  }

  function play() {
    if (dismissed) return;
    cancelAnimationFrame(raf);
    start = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function replayIntro(event) {
    if (event) event.preventDefault();
    dismissed = false;
    cancelAnimationFrame(raf);
    document.documentElement.classList.remove('intro-already-seen');
    intro.classList.remove('is-closing');
    document.body.classList.add('intro-active');
    pageParts.forEach(part => { part.inert = true; });
    window.scrollTo({top:0, behavior:'auto'});
    render(0, performance.now() / 1000);
    skip.focus({preventScroll:true});
    play();
  }

  pageParts.forEach(part => { part.inert = true; });
  skip.addEventListener('click', () => dismiss());
  document.getElementById('stage').addEventListener('click', play);
  const brand = document.querySelector('.brand');
  if (brand) brand.addEventListener('click', replayIntro);

  let introWasSeen = false;
  try { introWasSeen = localStorage.getItem(introStorageKey) === 'true'; } catch { /* Armazenamento pode estar indisponível. */ }
  if (introWasSeen || reduce) {
    render(CYCLE, performance.now() / 1000);
    set(el.stage, 'opacity', 1);
    dismiss(true);
    return;
  }
  skip.focus({preventScroll:true});
  play();
})();