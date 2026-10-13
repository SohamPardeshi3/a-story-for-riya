(() => {
gsap.registerPlugin(ScrollTrigger);
const $ = s => document.querySelector(s);
const root = document.documentElement;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- smooth scroll ---------- */
let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new Lenis({ duration: 1.15, wheelMultiplier: .95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
let vel = 0, lastY = 0;
gsap.ticker.add(() => { const y = window.scrollY; vel = vel * .88 + (y - lastY) * .12; lastY = y; });

/* ---------- word-by-word reveals ---------- */
document.querySelectorAll('[data-split]').forEach(el => {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
  gsap.fromTo(el.querySelectorAll('.w'), { opacity: .13, y: 12 }, {
    opacity: 1, y: 0, stagger: .12, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 84%', end: 'bottom 55%', scrub: true }
  });
});

/* ---------- intro ---------- */
gsap.from('.kick', { opacity: 0, y: 10, duration: 1, delay: .2 });
gsap.from('.ln>span', { yPercent: 118, duration: 1.5, stagger: .22, ease: 'power4.out', delay: .45 });
gsap.from('.cue', { opacity: 0, duration: 1.2, delay: 1.7 });
gsap.timeline({ scrollTrigger: { trigger: '#intro', start: 'top top', end: '+=70%', scrub: true, pin: true } })
  .to('.intro-in', { scale: 1.14, opacity: 0, y: -70, ease: 'none' });

/* ---------- week by week, in food ---------- */
const WEEKS = [
  { w: 6,  e: '🫐', n: 'a blueberry',  t: "Tiny, but I already have opinions. Mumma will hear them in about 34 weeks." },
  { w: 10, e: '🍓', n: 'a strawberry', t: "Mumma says she isn't hungry. I have already filed an objection." },
  { w: 14, e: '🍋', n: 'a lemon',      t: "Sour face, sweet heart. I'm told the dramatic pause runs in the family." },
  { w: 18, e: '🥑', n: 'an avocado',   t: "I can hear voices now. Mostly Mumma explaining things correctly. It's very soothing." },
  { w: 22, e: '🍌', n: 'a banana',     t: "New word today: numerology. Apparently my name will be calculated, not just chosen." },
  { w: 26, e: '🌽', n: 'a corn cob',   t: "I kick whenever it gets too quiet. I'm told this is also how Sahil gets attention." },
  { w: 30, e: '🥥', n: 'a coconut',    t: "Mumma orders for the whole table and eats three bites. Where does the rest go? I have a theory." },
  { w: 34, e: '🍈', n: 'a melon',      t: "Getting crowded. I'm sending small kicks as formal notice. Mumma likes things in writing, so I'll follow up." },
  { w: 38, e: '🎃', n: 'a pumpkin',    t: "Bags packed. Books balanced. One very small hat, ready." },
  { w: 40, e: '🍉', n: 'a watermelon', t: "That's the whole fruit stand. See you very soon." }
];
const fruits = $('#fruits'), caps = $('#caps'), wkNum = $('#wkNum');
WEEKS.forEach(d => {
  fruits.insertAdjacentHTML('beforeend', `<div class="fruit"><span class="rings"><i></i><i></i></span><span class="emo">${d.e}</span></div>`);
  caps.insertAdjacentHTML('beforeend', `<div class="cap"><h3>Week ${d.w}: ${d.n}.</h3><p>${d.t}</p></div>`);
});
gsap.set([...fruits.children, ...caps.children], { autoAlpha: 0 });
const prox = { v: 4 };
const wtl = gsap.timeline({
  defaults: { ease: 'none' },
  scrollTrigger: { trigger: '#weeks', start: 'top top', end: '+=' + WEEKS.length * 75 + '%', pin: true, scrub: .6 }
});
WEEKS.forEach((d, i) => {
  const f = fruits.children[i], c = caps.children[i], last = i === WEEKS.length - 1;
  const s = .42 + .58 * i / (WEEKS.length - 1);
  wtl.fromTo(f, { autoAlpha: 0, scale: s * .3, rotation: -32, y: 70 }, { autoAlpha: 1, scale: s, rotation: 0, y: 0, duration: .38, ease: 'back.out(1.6)' }, i)
     .fromTo(c, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: .3, ease: 'power2.out' }, i + .1)
     .to(f, { scale: s * 1.05, duration: .4 }, i + .38)
     .to(prox, { v: d.w, duration: 1, onUpdate: () => { wkNum.textContent = Math.round(prox.v); } }, i);
  if (!last) {
    wtl.to(f, { autoAlpha: 0, scale: s * 1.5, y: -90, duration: .22, ease: 'power2.in' }, i + .78)
       .to(c, { autoAlpha: 0, y: -20, duration: .2, ease: 'power2.in' }, i + .8);
  }
});
wtl.to('#wkBar', { scaleX: 1, duration: WEEKS.length }, 0).to({}, { duration: .7 });

/* ---------- the department of numbers ---------- */
const MAP = {}; 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c, i) => MAP[c] = (i % 9) + 1);
const red = n => { while (n > 9 && n !== 11 && n !== 22 && n !== 33) n = String(n).split('').reduce((a, b) => a + +b, 0); return n; };
const MEAN = {
  1: 'The first one through the door. Leads, decides, goes first.',
  2: 'The peacemaker. Quietly holds the whole room together.',
  3: 'Sunshine in a person. Talks, laughs, turns everything into a story.',
  4: 'The builder. Steady, loyal, and always on time.',
  5: 'The free spirit. Curious, restless, great company on a trip.',
  6: 'The caretaker. Feeds everyone and fixes everything.',
  7: 'The thinker. Deep, quiet, notices what others miss.',
  8: 'The achiever. Strong, ambitious, born to run things.',
  9: 'The old soul. Generous, wise, kind to everyone.',
  11: 'A master number. The intuitive: sensitive, bright, a little magic.',
  22: 'A master number. The master builder: dreams big and makes it real.',
  33: 'A master number. The master teacher: gentle heart, healing presence.'
};
const nm = $('#nm'), dobEl = $('#dob'), out = $('#out'), keep = $('#keep');
let shown = {}, shortlist = [];
try { shortlist = JSON.parse(localStorage.getItem('riya-shortlist') || '[]'); } catch (e) {}
const save = () => { try { localStorage.setItem('riya-shortlist', JSON.stringify(shortlist)); } catch (e) {} };
function numberFor(name) { const L = name.toUpperCase().replace(/[^A-Z]/g, ''); return L ? red([...L].reduce((a, c) => a + MAP[c], 0)) : null; }
function lifePath(v) { const p = v.split('-'); if (p.length !== 3) return null; const dsum = s => String(+s).split('').reduce((a, b) => a + +b, 0); return red(red(dsum(p[0])) + red(dsum(p[1])) + red(dsum(p[2]))); }
function renderOut() {
  const name = nm.value.trim(), blocks = [];
  const n1 = name ? numberFor(name) : null, n2 = dobEl.value ? lifePath(dobEl.value) : null;
  if (n1) blocks.push({ k: 'name', l: 'Name number', n: n1 });
  if (n2) blocks.push({ k: 'dob', l: 'Birth number', n: n2 });
  out.innerHTML = '';
  if (!blocks.length) { out.innerHTML = '<p class="bm">Type a name above and the numbers will answer.</p>'; renderKeep(); return; }
  blocks.forEach(b => {
    const el = document.createElement('div'); el.className = 'blk';
    el.innerHTML = '<div class="bn"></div><div><p class="bl"></p><p class="bm"></p></div>';
    el.querySelector('.bn').textContent = b.n; el.querySelector('.bl').textContent = b.l; el.querySelector('.bm').textContent = MEAN[b.n];
    out.appendChild(el);
    if (shown[b.k] !== b.n) gsap.fromTo(el.querySelector('.bn'), { scale: .6, opacity: 0, y: 14 }, { scale: 1, opacity: 1, y: 0, duration: .55, ease: 'back.out(2)' });
    shown[b.k] = b.n;
  });
  renderKeep();
}
function renderKeep() {
  keep.innerHTML = '';
  const name = nm.value.trim(), n1 = name ? numberFor(name) : null;
  if (n1) { const b = document.createElement('button'); b.className = 'btn'; b.type = 'button'; b.textContent = 'Keep this name on the shortlist';
    b.onclick = () => { if (!shortlist.some(s => s.name.toLowerCase() === name.toLowerCase())) { shortlist.unshift({ name, n: n1 }); shortlist = shortlist.slice(0, 10); save(); renderKeep(); } };
    keep.appendChild(b); }
  shortlist.forEach((s, i) => {
    const c = document.createElement('button'); c.type = 'button'; c.className = 'chip';
    c.innerHTML = '<span></span><b></b><u role="button" aria-label="Remove">×</u>';
    c.querySelector('span').textContent = s.name; c.querySelector('b').textContent = s.n;
    c.onclick = e => { if (e.target.tagName === 'U') { shortlist.splice(i, 1); save(); renderKeep(); } else { nm.value = s.name; renderOut(); } };
    keep.appendChild(c);
  });
}
nm.addEventListener('input', renderOut); dobEl.addEventListener('input', renderOut); renderOut();

/* ---------- the books ---------- */
const ROWS = [
  ['Hours of uninterrupted sleep', 8, 3],
  ['Photos on her phone', 4000, 40000],
  ['People volunteering to hold the baby', 0, 'everyone'],
  ['Times "I\'m not hungry" is said mid-meal', 'plenty', 'unchanged'],
  ['Reasons to leave the party early', 0, 1],
  ['Teasing of Sahil', 'daily', 'daily, baby may join']
];
const ledger = $('#ledger'), fmt = n => Math.round(n).toLocaleString('en-IN');
ROWS.forEach(r => {
  const row = document.createElement('div'); row.className = 'lrow';
  row.innerHTML = '<span class="lab"></span><span class="dots"></span><span class="before"></span><span class="arr">→</span><span class="after"></span>';
  row.querySelector('.lab').textContent = r[0];
  row.querySelector('.before').textContent = typeof r[1] === 'number' ? fmt(r[1]) : r[1];
  row.querySelector('.after').textContent = typeof r[2] === 'number' ? fmt(r[1]) : r[2];
  ledger.appendChild(row);
  ScrollTrigger.create({ trigger: row, start: 'top 88%', once: true, onEnter() {
    gsap.fromTo(row, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .7, ease: 'power3.out' });
    if (typeof r[2] === 'number') { const o = { v: r[1] }, af = row.querySelector('.after');
      gsap.to(o, { v: r[2], duration: 1.8, delay: .35, ease: 'power2.out', onUpdate: () => af.textContent = fmt(o.v) }); }
  } });
});
ScrollTrigger.create({ trigger: '#stamp', start: 'top 88%', once: true, onEnter() {
  gsap.fromTo('#stamp', { autoAlpha: 0, scale: 2.4, rotation: -18 }, { autoAlpha: 1, scale: 1, rotation: -4, duration: .5, ease: 'power4.in' });
} });
gsap.fromTo('#paper', { y: 60, rotation: 2 }, { y: 0, rotation: -1.2, ease: 'none', scrollTrigger: { trigger: '#paper', start: 'top 100%', end: 'top 55%', scrub: true } });

/* ---------- sunrise ---------- */
gsap.set('#sun', { xPercent: -50, yPercent: -50, y: '46vh' });
const dtl = gsap.timeline({
  defaults: { ease: 'none' },
  scrollTrigger: { trigger: '#dawn', start: 'top top', end: '+=520%', pin: true, scrub: .7 }
});
const wt = [...document.querySelectorAll('.wt')];
gsap.set(wt, { strokeDasharray: 1500, strokeDashoffset: 1500 });
dtl.to('#sun', { y: '0vh', duration: 4.6, ease: 'power1.out' }, 0)
   .to('#sun', { opacity: 1, duration: .5 }, 0)
   .to('#rays', { opacity: 1, duration: 3 }, 1.4)
   .fromTo('#d1', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, .15)
   .to('#d1', { opacity: 0, y: -22, duration: .35, ease: 'power2.in' }, 1.4)
   .fromTo('#d2', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, 1.8)
   .to('#d2', { opacity: 0, y: -22, duration: .3, ease: 'power2.in' }, 3.0)
   .to(wt, { strokeDashoffset: 0, duration: 1.3 }, 3.9)
   .to(wt, { fill: 'currentColor', duration: .6 }, 5.0)
   .to('#dend', { opacity: 1, duration: .6 }, 5.2)
   .to({}, { duration: 1.1 });

/* ---------- the sky: one long night, one sunrise ---------- */
const marks = {};
ScrollTrigger.create({ trigger: '#audit', start: 'top 72%', end: 'bottom top', onRefresh: s => marks.audit = s.start });
ScrollTrigger.create({ trigger: '#letter', start: 'top 72%', end: 'bottom top', onRefresh: s => marks.letter = s.start });
const LIGHT = [243, 239, 255], DARK = [58, 35, 71];
const P = (top, bot, fg, h1, h2, h3, stars, fly, aur) => ({ top, bot, fg, h1, h2, h3, stars, fly, aur });
const night  = P([8,11,36],[20,26,69],LIGHT,[14,20,56],[10,15,44],[7,11,32],1,1,1);
const night2 = P([10,16,52],[24,36,92],LIGHT,[16,22,62],[11,16,48],[8,12,36],1,1,1);
const blue   = P([26,32,92],[74,62,140],LIGHT,[30,36,92],[22,28,76],[16,20,60],.85,1,.9);
const purple = P([44,34,104],[128,82,150],LIGHT,[48,36,100],[36,28,82],[26,20,64],.55,1,.6);
const purple2= P([56,40,112],[168,92,150],LIGHT,[58,40,102],[44,30,86],[32,22,66],.35,1,.4);
const pink   = P([84,66,140],[236,140,140],LIGHT,[70,46,100],[54,36,86],[40,26,70],.12,.9,.15);
const orange = P([170,100,140],[250,170,120],[255,246,240],[74,44,92],[58,34,80],[44,26,64],0,.5,0);
const gold   = P([255,196,130],[255,232,160],DARK,[96,56,104],[76,44,90],[58,34,76],0,.15,0);
const bright = P([255,214,150],[255,244,196],DARK,[96,56,104],[76,44,90],[58,34,76],0,.1,0);
let stops = [{ p: 0, ...night }];
const st = { stars: 1, fly: 1 };
function buildStops() {
  const w = wtl.scrollTrigger, d = dtl.scrollTrigger, L = d.end - d.start;
  const list = [
    [0, night], [w.start, night2], [w.end, blue], [marks.audit ?? w.end + 800, purple],
    [marks.letter ?? w.end + 2000, purple2], [d.start, pink], [d.start + L * .42, orange],
    [d.start + L * .6, gold], [d.end, bright]
  ].sort((a, b) => a[0] - b[0]);
  stops = list.map(([p, o]) => ({ p, ...o }));
  apply(window.scrollY);
}
const ss = t => t * t * (3 - 2 * t);
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
const moon = $('#moon'), hills = [$('#hl1'), $('#hl2'), $('#hl3')];
function apply(y) {
  let i = 0; while (i < stops.length - 2 && y > stops[i + 1].p) i++;
  const a = stops[i], b = stops[i + 1], t = ss(clamp((y - a.p) / Math.max(1, b.p - a.p)));
  const s = root.style;
  s.setProperty('--top', rgb(mix(a.top, b.top, t))); s.setProperty('--bot', rgb(mix(a.bot, b.bot, t)));
  s.setProperty('--fg', rgb(mix(a.fg, b.fg, t)));
  s.setProperty('--h1', rgb(mix(a.h1, b.h1, t))); s.setProperty('--h2', rgb(mix(a.h2, b.h2, t))); s.setProperty('--h3', rgb(mix(a.h3, b.h3, t)));
  s.setProperty('--aur', (a.aur + (b.aur - a.aur) * t).toFixed(3));
  st.stars = a.stars + (b.stars - a.stars) * t; st.fly = a.fly + (b.fly - a.fly) * t;
  const wEnd = stops[2].p || 1, mp = clamp(y / wEnd);
  const mx = innerWidth * (.08 + .72 * mp), my = innerHeight * (.11 - Math.sin(Math.PI * mp) * .05);
  moon.style.transform = `translate3d(${mx}px,${my}px,0)`;
  moon.style.opacity = (mp < .6 ? 1 : 1 - (mp - .6) / .35).toFixed(3);
  const max = ScrollTrigger.maxScroll(window) || 1, p = y / max;
  hills.forEach((h, k) => h.style.transform = `translate3d(${(.5 - p) * (8 + k * 6)}vw,0,0)`);
}
ScrollTrigger.addEventListener('refresh', buildStops);
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { gsap.set('#bar', { scaleX: s.progress }); apply(window.scrollY); } });
ScrollTrigger.refresh();

/* ---------- fireflies, stars, and the small light that follows you ---------- */
const cv = $('#fx'), cx = cv.getContext('2d');
let W, H, DPR;
const sprite = document.createElement('canvas'); sprite.width = sprite.height = 64;
{ const g = sprite.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,244,200,1)'); gr.addColorStop(.25, 'rgba(255,205,120,.7)'); gr.addColorStop(1, 'rgba(255,170,80,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
let stars = [], flies = [], bursts = [];
const guide = { x: 0, y: 0, tx: 0, ty: 0, trail: [], active: false };
function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
  cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  stars = Array.from({ length: Math.round(W * H / 5500) }, () => ({ x: Math.random() * W, y: Math.random() * H * .8, r: .4 + Math.random() * 1.3, ph: Math.random() * 6.28, sp: .5 + Math.random() * 1.6 }));
  flies = Array.from({ length: W < 600 ? 28 : 56 }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: -.1 - Math.random() * .25, s: 14 + Math.random() * 26, ph: Math.random() * 6.28 }));
  if (!guide.active) { guide.x = guide.tx = W * .76; guide.y = guide.ty = H * .3; }
}
resize(); addEventListener('resize', resize);
const point = e => { const t = e.touches ? e.touches[0] : e; if (!t) return; guide.tx = t.clientX; guide.ty = t.clientY; guide.active = true; };
addEventListener('pointermove', point, { passive: true });
addEventListener('touchstart', point, { passive: true });
addEventListener('touchmove', point, { passive: true });
function burst(x, y, n = 14) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 1 + Math.random() * 3; bursts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 1, s: 16 + Math.random() * 22 }); } }
function loop(t) {
  cx.clearRect(0, 0, W, H);
  if (st.stars > .01) { cx.fillStyle = '#fff';
    for (const s of stars) { cx.globalAlpha = st.stars * (.35 + .65 * (.5 + .5 * Math.sin(t * .0008 * s.sp + s.ph))); cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.283); cx.fill(); } }
  if (st.fly > .01) for (const f of flies) {
    f.x += f.vx + Math.sin(t * .0006 + f.ph) * .28; f.y += f.vy - vel * .05;
    const dx = f.x - guide.x, dy = f.y - guide.y, d2 = dx * dx + dy * dy;
    if (d2 < 9000) { const d = Math.sqrt(d2) || 1; f.x += dx / d * .9; f.y += dy / d * .9; }
    if (f.y < -40) { f.y = H + 30; f.x = Math.random() * W; } else if (f.y > H + 60) f.y = -30;
    if (f.x < -40) f.x = W + 30; else if (f.x > W + 40) f.x = -30;
    cx.globalAlpha = st.fly * (.35 + .5 * (.5 + .5 * Math.sin(t * .002 + f.ph)));
    cx.drawImage(sprite, f.x - f.s / 2, f.y - f.s / 2, f.s, f.s);
  }
  for (let i = bursts.length - 1; i >= 0; i--) { const b = bursts[i]; b.x += b.vx; b.y += b.vy; b.vy += .035; b.vx *= .985; b.life -= .011;
    if (b.life <= 0) { bursts.splice(i, 1); continue; } cx.globalAlpha = b.life; cx.drawImage(sprite, b.x - b.s / 2, b.y - b.s / 2, b.s, b.s); }
  // the small light (it's the baby)
  if (!guide.active) { guide.tx = W * .76 + Math.sin(t * .0006) * 40; guide.ty = H * .3 + Math.cos(t * .0008) * 26; }
  guide.x += (guide.tx - guide.x) * .07; guide.y += (guide.ty - guide.y) * .07;
  guide.trail.push([guide.x, guide.y]); if (guide.trail.length > 18) guide.trail.shift();
  guide.trail.forEach((p, i) => { cx.globalAlpha = i / guide.trail.length * .5; const s = 10 + i * 1.1; cx.drawImage(sprite, p[0] - s / 2, p[1] - s / 2, s, s); });
  cx.globalAlpha = .95 + .05 * Math.sin(t * .004); cx.drawImage(sprite, guide.x - 34, guide.y - 34, 68, 68);
  cx.globalAlpha = 1; cx.fillStyle = '#fff8e0'; cx.beginPath(); cx.arc(guide.x, guide.y, 3.2, 0, 6.283); cx.fill();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------- wishes ---------- */
let wishes = 0;
$('#wish').addEventListener('click', e => {
  wishes++;
  $('#lcount').textContent = wishes === 1 ? 'One wish is on its way. Make another.' : `${wishes} wishes released.`;
  const r = e.currentTarget.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 18);
  const count = wishes === 1 ? 3 : 1;
  for (let k = 0; k < count; k++) setTimeout(() => {
    const el = document.createElement('div'); el.className = 'lantern'; el.style.left = (8 + Math.random() * 84) + 'vw'; document.body.appendChild(el);
    const sway = gsap.to(el, { x: (Math.random() < .5 ? -1 : 1) * (30 + Math.random() * 40), duration: 2 + Math.random() * 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.timeline({ onComplete() { sway.kill(); el.remove(); } })
      .fromTo(el, { y: 0, scale: .7, opacity: 0 }, { y: -(innerHeight + 140), scale: 1.1, duration: 9 + Math.random() * 5, ease: 'sine.in' }, 0)
      .to(el, { opacity: 1, duration: 1 }, 0).to(el, { opacity: 0, duration: 2.4 }, '>-2.4');
  }, k * 350);
});
})();
