import * as THREE from 'three';
import { woods, fabrics } from '../data/brand.js';

// Every texture starts life as a procedural canvas so the 3D is never
// untextured, then swaps to the Pollinations JPG in /textures if it loads.

const SIZE = 512;
const cache = new Map();

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvas() {
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  return [c, c.getContext('2d')];
}

function speckle(ctx, r, count, colors, size = [0.5, 1.6]) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[Math.floor(r() * colors.length)];
    const s = size[0] + r() * (size[1] - size[0]);
    ctx.fillRect(r() * SIZE, r() * SIZE, s, s);
  }
}

function wood(base, dark, light, seed, { figure = 1 } = {}) {
  const [c, ctx] = canvas();
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // broad colour bands
  for (let i = 0; i < 9; i++) {
    const y = r() * SIZE;
    const g = ctx.createLinearGradient(0, y - 40, 0, y + 40);
    g.addColorStop(0, 'transparent');
    g.addColorStop(0.5, r() > 0.5 ? dark + '33' : light + '33');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 40, SIZE, 80);
  }
  // grain lines, wrapped so the tile repeats
  for (let i = 0; i < 150; i++) {
    const y0 = r() * SIZE;
    const amp = (2 + r() * 10) * figure;
    const freq = (1 + Math.floor(r() * 3)) * (Math.PI * 2) / SIZE;
    const phase = r() * Math.PI * 2;
    ctx.strokeStyle = (r() > 0.25 ? dark : light) + (r() > 0.6 ? '66' : '33');
    ctx.lineWidth = 0.4 + r() * 1.6;
    for (const off of [-SIZE, 0, SIZE]) {
      ctx.beginPath();
      for (let x = 0; x <= SIZE; x += 8) {
        const y = y0 + off + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1 + phase) * amp * 0.2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  speckle(ctx, r, 1800, [dark + '40', light + '30'], [0.6, 1.4]);
  return c;
}

function endgrain(seed) {
  const [c, ctx] = canvas();
  const r = rng(seed);
  ctx.fillStyle = '#C79A6B';
  ctx.fillRect(0, 0, SIZE, SIZE);
  const cx = SIZE / 2 + 12;
  const cy = SIZE / 2 - 8;
  for (let k = 3; k < SIZE * 0.72; k += 3 + r() * 6) {
    ctx.strokeStyle = r() > 0.5 ? 'rgba(96,58,30,0.55)' : 'rgba(140,92,52,0.35)';
    ctx.lineWidth = 0.6 + r() * 1.8;
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.08) {
      const w = 1 + Math.sin(a * 3 + k * 0.05) * 0.02 + Math.sin(a * 7) * 0.01;
      const x = cx + Math.cos(a) * k * w;
      const y = cy + Math.sin(a) * k * w;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // heartwood
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, SIZE * 0.35);
  g.addColorStop(0, 'rgba(90,50,24,0.55)');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // radial checks
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    ctx.strokeStyle = 'rgba(50,28,12,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30);
    ctx.lineTo(cx + Math.cos(a) * (80 + r() * 120), cy + Math.sin(a) * (80 + r() * 120));
    ctx.stroke();
  }
  return c;
}

function bark(seed) {
  const [c, ctx] = canvas();
  const r = rng(seed);
  ctx.fillStyle = '#6B5D50';
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 120; i++) {
    const x0 = r() * SIZE;
    ctx.strokeStyle = r() > 0.4 ? 'rgba(35,27,20,0.7)' : 'rgba(150,135,118,0.35)';
    ctx.lineWidth = 1 + r() * 5;
    ctx.beginPath();
    let x = x0;
    ctx.moveTo(x, -10);
    for (let y = 0; y <= SIZE + 10; y += 14) {
      x += (r() - 0.5) * 8;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  speckle(ctx, r, 3000, ['rgba(30,24,18,0.4)', 'rgba(170,155,135,0.25)'], [1, 3]);
  return c;
}

function boucle(base, seed) {
  const [c, ctx] = canvas();
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 5200; i++) {
    const x = r() * SIZE;
    const y = r() * SIZE;
    const rad = 1.5 + r() * 3.5;
    ctx.strokeStyle = r() > 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(90,70,50,0.18)';
    ctx.lineWidth = 0.8 + r();
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.stroke();
  }
  return c;
}

function weave(base, seed, { diag = false, line = 'rgba(0,0,0,0.12)', light = 'rgba(255,255,255,0.10)' } = {}) {
  const [c, ctx] = canvas();
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.lineWidth = 1;
  for (let i = 0; i < SIZE * 2; i += 3) {
    ctx.strokeStyle = r() > 0.5 ? line : light;
    ctx.beginPath();
    if (diag) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i - SIZE, SIZE);
    } else {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, SIZE);
      ctx.moveTo(0, i);
      ctx.lineTo(SIZE, i);
    }
    ctx.stroke();
  }
  speckle(ctx, r, 2500, [line, light], [1, 2.5]);
  return c;
}

function velvet(base, seed) {
  const [c, ctx] = canvas();
  const r = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 60; i++) {
    const x = r() * SIZE;
    const y = r() * SIZE;
    const rad = 30 + r() * 90;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, r() > 0.5 ? 'rgba(255,220,190,0.12)' : 'rgba(40,10,0,0.14)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  speckle(ctx, r, 4000, ['rgba(0,0,0,0.08)', 'rgba(255,255,255,0.06)'], [0.5, 1.2]);
  return c;
}

function cane(seed) {
  const [c, ctx] = canvas();
  const r = rng(seed);
  ctx.fillStyle = '#3B2A1B';
  ctx.fillRect(0, 0, SIZE, SIZE);
  const step = SIZE / 16;
  const strand = (x1, y1, x2, y2, w) => {
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#B88A52';
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,235,190,0.35)';
    ctx.lineWidth = w * 0.3;
    ctx.stroke();
  };
  for (let i = 0; i <= 16; i++) {
    const p = i * step;
    strand(p, 0, p, SIZE, 5);
    strand(0, p, SIZE, p, 5);
  }
  for (let i = -16; i <= 32; i++) {
    const p = i * step;
    strand(p, 0, p + SIZE, SIZE, 4);
    strand(p, SIZE, p + SIZE, 0, 4);
  }
  speckle(ctx, r, 1500, ['rgba(60,35,15,0.3)'], [1, 2]);
  return c;
}

function plaster(seed) {
  const [c, ctx] = canvas();
  const r = rng(seed);
  ctx.fillStyle = '#EDE5DA';
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 420; i++) {
    const x = r() * SIZE;
    const y = r() * SIZE;
    const rad = 4 + r() * 26;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, r() > 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(150,120,95,0.05)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  speckle(ctx, r, 5000, ['rgba(120,95,75,0.07)', 'rgba(255,255,255,0.14)'], [0.6, 1.4]);
  return c;
}

function terrazzo(seed) {
  const [c, ctx] = canvas();
  const r = rng(seed);
  ctx.fillStyle = '#EAE2D6';
  ctx.fillRect(0, 0, SIZE, SIZE);
  const chips = ['#C9B8A2', '#A99886', '#C2693E', '#8C9A7E', '#7E7268', '#D8CCBB', '#B8935A'];
  for (let i = 0; i < 1400; i++) {
    const x = r() * SIZE;
    const y = r() * SIZE;
    const s = 1 + r() * (r() > 0.94 ? 6 : 2.6);
    ctx.fillStyle = chips[Math.floor(r() * chips.length)];
    ctx.globalAlpha = 0.55 + r() * 0.45;
    ctx.beginPath();
    const n = 4 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + r() * 0.6;
      const rr = s * (0.6 + r() * 0.6);
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return c;
}

function brass(seed) {
  const [c, ctx] = canvas();
  const r = rng(seed);
  const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  g.addColorStop(0, '#9C7843');
  g.addColorStop(0.5, '#C9A468');
  g.addColorStop(1, '#8E6B3A');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let y = 0; y < SIZE; y += 1) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(255,240,200,0.07)' : 'rgba(60,40,10,0.07)';
    ctx.fillRect(0, y, SIZE, 1);
  }
  return c;
}

const GENERATORS = {
  'wood-walnut': () => wood('#5E3D27', '#2E1B10', '#8A5E3E', 11, { figure: 1.2 }),
  'wood-sheesham': () => wood('#8E5A33', '#40210F', '#B9804F', 12, { figure: 1 }),
  'wood-oak': () => wood('#D3B48A', '#9C7A52', '#EBD3AE', 13, { figure: 0.6 }),
  'wood-ash-ebonised': () => wood('#2D2824', '#141110', '#4C433C', 14, { figure: 0.9 }),
  'wood-endgrain-rings': () => endgrain(15),
  'bark-sheesham': () => bark(16),
  'fabric-boucle-cream': () => boucle('#E8E0D1', 17),
  'fabric-linen-sage': () => weave('#97A189', 18),
  'fabric-velvet-rust': () => velvet('#A0502D', 19),
  'fabric-wool-charcoal': () => weave('#413D3A', 20, { diag: true, line: 'rgba(0,0,0,0.25)', light: 'rgba(255,255,255,0.06)' }),
  'cane-weave': () => cane(21),
  'plaster-wall': () => plaster(22),
  'terrazzo-floor': () => terrazzo(23),
  'brass-brushed': () => brass(24),
};

/** Shared texture by name; repeat is baked into the cache key. */
export function getTexture(name, repeat = 1) {
  const key = `${name}@${repeat}`;
  if (cache.has(key)) return cache.get(key);
  const gen = GENERATORS[name];
  const tex = new THREE.CanvasTexture(gen ? gen() : canvas()[0]);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.repeat.set(repeat, repeat);
  cache.set(key, tex);
  new THREE.ImageLoader().load(
    `/textures/${name}.jpg`,
    (img) => {
      tex.dispose(); // drop the GPU copy so the new size is re-allocated
      tex.image = img;
      tex.needsUpdate = true;
    },
    undefined,
    () => {},
  );
  return tex;
}

export const woodTexture = (id, repeat = 1) => getTexture(woods.find((w) => w.id === id)?.texture || 'wood-walnut', repeat);
export const fabricTexture = (id, repeat = 1) => getTexture(fabrics.find((f) => f.id === id)?.texture || 'fabric-boucle-cream', repeat);

/**
 * A wood material that can crossfade between two textures (uMix 0 -> 1).
 * Call `blendTo(texture)` to start a fade; drive `material.userData.mix`.
 */
export function makeBlendMaterial(tex, opts = {}) {
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0, ...opts });
  const uniforms = { map2: { value: tex }, uMix: { value: 0 } };
  mat.userData.uniforms = uniforms;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.map2 = uniforms.map2;
    shader.uniforms.uMix = uniforms.uMix;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D map2;\nuniform float uMix;')
      .replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
          vec4 sampledDiffuseColor = mix(texture2D(map, vMapUv), texture2D(map2, vMapUv), uMix);
          diffuseColor *= sampledDiffuseColor;
        #endif`,
      );
  };
  mat.customProgramCacheKey = () => 'blend-wood';
  return mat;
}

export const COLORS = {
  brass: '#B8935A',
  clay: '#C2693E',
  ceramic: '#B5643F',
  bulb: '#FFD9A0',
};
