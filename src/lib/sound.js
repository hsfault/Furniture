// Every sound is synthesised with the Web Audio API and kept very quiet.
// Nothing plays until the visitor turns sound on (a user gesture).
import { useUI } from '../store/ui.js';

let ctx = null;
let master = null;
let ambient = null;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const on = () => useUI.getState().soundOn;

function noiseBuffer(seconds, color = 'white') {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (color === 'brown') {
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    } else data[i] = w;
  }
  return buf;
}

function envGain(peak, attack, decay, t0) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  g.connect(master);
  return g;
}

// A short hollow knock, like a drawer front closing on its stops.
export function playClick() {
  if (!on() || !ensure()) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(0.08);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1400;
  bp.Q.value = 3;
  src.connect(bp).connect(envGain(0.12, 0.002, 0.06, t));
  src.start(t);
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(190, t);
  osc.frequency.exponentialRampToValueAtTime(90, t + 0.12);
  osc.connect(envGain(0.1, 0.004, 0.14, t));
  osc.start(t);
  osc.stop(t + 0.2);
}

// Paper rustle for page turns.
export function playRustle() {
  if (!on() || !ensure()) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(0.5);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(2500, t);
  hp.frequency.linearRampToValueAtTime(5200, t + 0.4);
  src.connect(hp).connect(envGain(0.05, 0.06, 0.38, t));
  src.start(t);
}

// Soft thud when a 3D piece lands.
export function playThud(volume = 1) {
  if (!on() || !ensure()) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(110, t);
  osc.frequency.exponentialRampToValueAtTime(42, t + 0.22);
  osc.connect(envGain(0.16 * volume, 0.005, 0.26, t));
  osc.start(t);
  osc.stop(t + 0.32);
}

// Very soft room tone: brown noise through a low-pass, slowly breathing.
export function setAmbient(enabled) {
  if (!enabled) {
    if (ambient) {
      const a = ambient;
      ambient = null;
      a.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
      setTimeout(() => a.src.stop(), 1500);
    }
    return;
  }
  if (ambient || !ensure()) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(4, 'brown');
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 420;
  const gain = ctx.createGain();
  gain.gain.value = 0.0001;
  gain.gain.setTargetAtTime(0.035, ctx.currentTime, 1.2);
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 0.01;
  lfo.connect(lfoGain).connect(gain.gain);
  lfo.start();
  src.connect(lp).connect(gain).connect(master);
  src.start();
  ambient = { src, gain };
}
