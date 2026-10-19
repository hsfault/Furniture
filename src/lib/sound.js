// Every sound is synthesised with the Web Audio API: no audio files.
// Browsers only allow audio after a user gesture, so the context is created on
// the first pointer/key press (see unlockAudio) and every sfx call before that
// is silently skipped.
import { useUI } from '../store/ui.js';

let ctx = null;
let master = null;
let ambient = null;
const last = {};

const on = () => useUI.getState().soundOn;

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(comp).connect(ctx.destination);
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend();
      else if (on()) ctx.resume();
    });
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Runs fn(t) only when sound is on and unlocked; `gap` throttles repeats (ms).
function play(name, fn, gap = 30) {
  if (!on() || !ctx || ctx.state !== 'running') return;
  const now = performance.now();
  if (last[name] && now - last[name] < gap) return;
  last[name] = now;
  fn(ctx.currentTime);
}

const noiseCache = {};
function noise(seconds, color = 'white') {
  const key = `${color}${seconds}`;
  if (noiseCache[key]) return noiseCache[key];
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (color === 'brown') {
      b = (b + 0.02 * w) / 1.02;
      d[i] = b * 3.5;
    } else if (color === 'pink') {
      b = 0.97 * b + 0.03 * w;
      d[i] = (b + w * 0.2) * 1.4;
    } else d[i] = w;
  }
  noiseCache[key] = buf;
  return buf;
}

function env(t, peak, attack, decay) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(master);
  return g;
}

function noiseHit(t, { dur = 0.1, type = 'bandpass', freq = 1200, q = 1, peak = 0.2, attack = 0.003, decay = 0.08, color = 'white', sweepTo } = {}) {
  const src = ctx.createBufferSource();
  src.buffer = noise(Math.max(dur, 0.05), color);
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
  f.Q.value = q;
  src.connect(f).connect(env(t, peak, attack, decay));
  src.start(t);
  src.stop(t + dur + 0.05);
}

function tone(t, { freq = 440, to, type = 'sine', peak = 0.15, attack = 0.004, decay = 0.2 } = {}) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + attack + decay);
  o.connect(env(t, peak, attack, decay));
  o.start(t);
  o.stop(t + attack + decay + 0.05);
}

// ---- the palette -------------------------------------------------------------

/** A short hollow knock on wood: buttons, links, swatches. */
export const knock = (v = 1) =>
  play('knock', (t) => {
    noiseHit(t, { freq: 1700, q: 2.5, peak: 0.16 * v, decay: 0.05 });
    tone(t, { freq: 230, to: 120, peak: 0.22 * v, decay: 0.12 });
    tone(t, { freq: 520, to: 380, peak: 0.06 * v, decay: 0.06 });
  }, 45);

/** A tiny tick: hover, and each detent of the sample fan. */
export const tick = (v = 1) =>
  play('tick', (t) => {
    noiseHit(t, { type: 'highpass', freq: 3800, q: 0.7, peak: 0.07 * v, attack: 0.001, decay: 0.025, dur: 0.05 });
    tone(t, { freq: 1900, to: 1500, peak: 0.025 * v, attack: 0.001, decay: 0.03 });
  }, 55);

/** Air moving past: sheets, lightboxes, filters. */
export const whoosh = (v = 1, dur = 0.45, up = true) =>
  play('whoosh', (t) => {
    noiseHit(t, { dur, freq: up ? 500 : 2400, sweepTo: up ? 2600 : 450, q: 0.9, peak: 0.12 * v, attack: dur * 0.45, decay: dur * 0.55, color: 'pink' });
  }, 120);

/** A drawer running on waxed runners, ending on its stop. */
export const slide = (v = 1, open = true) =>
  play('slide', (t) => {
    noiseHit(t, { dur: 0.42, type: 'lowpass', freq: open ? 700 : 1100, sweepTo: open ? 1200 : 600, q: 0.6, peak: 0.16 * v, attack: 0.08, decay: 0.32, color: 'brown' });
    noiseHit(t, { dur: 0.42, freq: 2600, q: 4, peak: 0.025 * v, attack: 0.06, decay: 0.3 });
    tone(t + 0.36, { freq: 160, to: 90, peak: 0.18 * v, decay: 0.14 });
    noiseHit(t + 0.36, { freq: 1300, q: 2, peak: 0.08 * v, decay: 0.05 });
  }, 200);

/** A heavy piece settling on a floor. */
export const thud = (v = 1) =>
  play(`thud${Math.round(v * 10)}`, (t) => {
    tone(t, { freq: 120, to: 45, peak: 0.32 * v, attack: 0.004, decay: 0.28 });
    noiseHit(t, { type: 'lowpass', freq: 420, q: 0.7, peak: 0.12 * v, decay: 0.12, color: 'brown' });
  }, 60);

/** A wooden door swinging on old hinges. */
export const creak = (v = 1) =>
  play('creak', (t) => {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(95, t);
    o.frequency.linearRampToValueAtTime(140, t + 0.35);
    o.frequency.linearRampToValueAtTime(110, t + 0.8);
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = 23;
    lg.gain.value = 18;
    lfo.connect(lg).connect(o.frequency);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 6;
    o.connect(bp).connect(env(t, 0.06 * v, 0.12, 0.75));
    o.start(t);
    lfo.start(t);
    o.stop(t + 0.95);
    lfo.stop(t + 0.95);
  }, 400);

/** A small brass bell: added to cart, booked, ordered. */
export const chime = (v = 1) =>
  play('chime', (t) => {
    [[1046, 0.11], [1568, 0.06], [2888, 0.025]].forEach(([f, p]) => tone(t, { freq: f, peak: p * v, attack: 0.004, decay: 1.4 }));
    [[1318, 0.08], [1975, 0.04]].forEach(([f, p]) => tone(t + 0.12, { freq: f, peak: p * v, attack: 0.004, decay: 1.2 }));
  }, 250);

/** Paper: Polaroids turning over. */
export const rustle = (v = 1) =>
  play('rustle', (t) => {
    noiseHit(t, { dur: 0.4, type: 'highpass', freq: 2400, sweepTo: 5200, q: 0.5, peak: 0.08 * v, attack: 0.05, decay: 0.33 });
  }, 150);

/** A soft cushion puff: fabric swaps. */
export const puff = (v = 1) =>
  play('puff', (t) => {
    noiseHit(t, { dur: 0.3, type: 'lowpass', freq: 900, sweepTo: 300, q: 0.5, peak: 0.16 * v, attack: 0.02, decay: 0.25, color: 'pink' });
    tone(t, { freq: 90, to: 60, peak: 0.1 * v, decay: 0.18 });
  }, 120);

/** A handsaw stroke or two: the log is cut. */
export const saw = (v = 1) =>
  play('saw', (t) => {
    for (let i = 0; i < 3; i++) {
      const s = t + i * 0.22;
      noiseHit(s, { dur: 0.2, freq: i % 2 ? 2600 : 3200, sweepTo: i % 2 ? 3400 : 2400, q: 3, peak: 0.07 * v, attack: 0.03, decay: 0.16 });
    }
  }, 600);

/** A pencil on paper: the preloader drawing. */
export const scratch = (v = 1) =>
  play('scratch', (t) => {
    noiseHit(t, { dur: 0.16, type: 'highpass', freq: 5200, q: 0.8, peak: 0.03 * v, attack: 0.02, decay: 0.13 });
  }, 90);

/** A bulb flickering on. */
export const buzz = (v = 1) =>
  play('buzz', (t) => {
    tone(t, { freq: 100, type: 'square', peak: 0.025 * v, attack: 0.005, decay: 0.12 });
    noiseHit(t, { freq: 3000, q: 1, peak: 0.04 * v, decay: 0.03 });
  }, 60);

/** A light pop: timeline nodes, small confirmations. */
export const pop = (v = 1) =>
  play('pop', (t) => {
    tone(t, { freq: 520, to: 980, peak: 0.08 * v, attack: 0.003, decay: 0.09 });
  }, 40);

// Kept for older call sites.
export const playClick = () => knock();
export const playThud = (v) => thud(v);
export const playRustle = () => rustle();

// ---- room tone ------------------------------------------------------------------

/** A quiet room: warm air plus a slow breath, so the house feels inhabited. */
export function setAmbient(enabled) {
  if (!enabled || !ctx) {
    if (ambient && ctx) {
      const a = ambient;
      ambient = null;
      a.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5);
      setTimeout(() => a.nodes.forEach((n) => n.stop()), 2000);
    }
    return;
  }
  if (ambient) return;
  const src = ctx.createBufferSource();
  src.buffer = noise(6, 'brown');
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 520;
  const air = ctx.createBufferSource();
  air.buffer = noise(5, 'pink');
  air.loop = true;
  const hp = ctx.createBiquadFilter();
  hp.type = 'bandpass';
  hp.frequency.value = 1800;
  hp.Q.value = 0.4;
  const airGain = ctx.createGain();
  airGain.gain.value = 0.12;
  const gain = ctx.createGain();
  gain.gain.value = 0.0001;
  gain.gain.setTargetAtTime(0.07, ctx.currentTime, 1.5);
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.06;
  lfoGain.gain.value = 0.025;
  lfo.connect(lfoGain).connect(gain.gain);
  src.connect(lp).connect(gain);
  air.connect(hp).connect(airGain).connect(gain);
  gain.connect(master);
  src.start();
  air.start();
  lfo.start();
  ambient = { gain, nodes: [src, air, lfo] };
}
