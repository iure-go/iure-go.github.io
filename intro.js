(() => {
  'use strict';

  const SPEED = 1;
  const HOLD_END = 2.9;
  const CYCLE = 3.5;
  const CX = 360, CY = 292;
  const A0 = 132 * Math.PI / 180;
  const SWEEP = 330 * Math.PI / 180;
  const ORBIT_END = 0.8;
  const TRAIL_N = 16, TRAIL_DT = 0.012;
  const $ = id => document.getElementById(id);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const easeIO = x => -(Math.cos(Math.PI * x) - 1) / 2;
  const NS = 'http://www.w3.org/2000/svg';
  const intro = $('intro-screen');
  const skip = $('skip-intro');
  const main = document.querySelector('main');
  const pageParts = document.querySelectorAll('.site-header, main, body > footer');
  const el = {
    all: $('all'), glow: $('bg-glow'), hex: $('hex'),
    g1: $('g1'), g2: $('g2'), g3: $('g3'),
    word: $('word'), tag: $('tag'),
    trail: $('trail'), halo: $('halo'), spark: $('spark')
  };
  const lines = [];
  for (let i = 0; i < TRAIL_N; i++) {
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('opacity', 0);
    el.trail.appendChild(line);
    lines.push(line);
  }

  const orbit = u => {
    const e = easeIO(u), a = A0 + SWEEP * e, r = 105 + 38 * e;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  };
  const P0 = orbit(1), P2 = [270, 432], PC = [352, 470];
  const swoop = u => {
    const e = easeOut(u), k = 1 - e;
    return [k*k*P0[0] + 2*k*e*PC[0] + e*e*P2[0], k*k*P0[1] + 2*k*e*PC[1] + e*e*P2[1]];
  };
  const SWOOP_END = ORBIT_END + 0.4;
  const sparkPos = t => {
    if (t < 0 || t > SWOOP_END) return null;
    return t <= ORBIT_END ? orbit(t / ORBIT_END) : swoop((t - ORBIT_END) / (SWOOP_END - ORBIT_END));
  };
  const sparkVis = t => seg(t, 0, 0.08) * (1 - seg(t, 1.0, SWOOP_END));

  function render(t) {
    const pulse = t > 1.05 ? Math.exp(-(t - 1.05) * 3.5) * 0.35 : 0;
    el.glow.setAttribute('opacity', (easeOut(seg(t, 0, 1.0)) + pulse).toFixed(3));
    el.hex.setAttribute('stroke-dashoffset', (100 * (1 - easeOut(seg(t, 0.08, 0.95)))).toFixed(2));
    el.hex.setAttribute('fill-opacity', easeOut(seg(t, 0.55, 1.0)).toFixed(3));
    el.g1.setAttribute('stroke-dashoffset', (100 * (1 - easeOut(seg(t, 0.72, 0.92)))).toFixed(2));
    el.g2.setAttribute('stroke-dashoffset', (100 * (1 - easeOut(seg(t, 0.78, 0.98)))).toFixed(2));
    el.g3.setAttribute('stroke-dashoffset', (100 * (1 - easeOut(seg(t, 0.84, 1.06)))).toFixed(2));
    const word = easeOut(seg(t, 0.35, 0.85));
    el.word.setAttribute('opacity', word.toFixed(3));
    el.word.setAttribute('transform', 'translate(0 ' + ((1-word)*8).toFixed(2) + ')');
    const tagline = easeOut(seg(t, 0.75, 1.2));
    el.tag.setAttribute('opacity', tagline.toFixed(3));
    el.tag.setAttribute('transform', 'translate(0 ' + ((1-tagline)*6).toFixed(2) + ')');
    const point = sparkPos(t), visibility = sparkVis(t);
    if (point && visibility > 0) {
      el.spark.setAttribute('cx', point[0]); el.spark.setAttribute('cy', point[1]);
      el.halo.setAttribute('cx', point[0]); el.halo.setAttribute('cy', point[1]);
      el.spark.setAttribute('opacity', visibility.toFixed(3));
      el.halo.setAttribute('opacity', (visibility*0.75).toFixed(3));
    } else {
      el.spark.setAttribute('opacity', 0); el.halo.setAttribute('opacity', 0);
    }
    for (let i = 0; i < TRAIL_N; i++) {
      const a = sparkPos(t-i*TRAIL_DT), b = sparkPos(t-(i+1)*TRAIL_DT), line = lines[i];
      if (!a || !b || visibility <= 0) { line.setAttribute('opacity', 0); continue; }
      const fade = 1 - i/TRAIL_N;
      line.setAttribute('x1', a[0]); line.setAttribute('y1', a[1]);
      line.setAttribute('x2', b[0]); line.setAttribute('y2', b[1]);
      line.setAttribute('stroke-width', (0.5+2.4*fade).toFixed(2));
      line.setAttribute('opacity', (0.85*fade*visibility).toFixed(3));
    }
    el.all.setAttribute('opacity', (1-seg(t, HOLD_END, CYCLE-0.15)).toFixed(3));
  }

  let start = performance.now(), raf = 0, dismissed = false;
  function dismiss(instant = false) {
    if (dismissed) return;
    dismissed = true;
    cancelAnimationFrame(raf);
    intro.classList.add('is-closing');
    pageParts.forEach(part => { part.inert = false; });
    document.body.classList.remove('intro-active');
    const remove = () => {
      intro.remove();
      if (main) main.focus({preventScroll:true});
    };
    if (instant) remove();
    else window.setTimeout(remove, 430);
  }
  function frame(now) {
    const elapsed = ((now-start)/1000)*SPEED;
    const t = Math.min(elapsed, CYCLE);
    render(t);
    if (elapsed < CYCLE) raf = requestAnimationFrame(frame);
    else dismiss();
  }
  function play() {
    if (dismissed) return;
    cancelAnimationFrame(raf);
    start = performance.now();
    raf = requestAnimationFrame(frame);
  }

  pageParts.forEach(part => { part.inert = true; });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    render(CYCLE);
    dismiss(true);
    return;
  }
  skip.addEventListener('click', () => dismiss());
  $('stage').addEventListener('click', play);
  skip.focus({preventScroll:true});
  play();
})();
