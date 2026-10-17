import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap.js';
import { reducedMotion } from '../lib/env.js';
import { getLenis } from '../lib/lenis.js';
import { useUI } from '../store/ui.js';

const KEY = 'taaq-intro-seen';

// Side elevation of the Dune chair, in the order a carpenter builds it.
const LEGS = [
  'M128 302 L122 340', 'M146 302 L141 340', 'M118 340 H145',
  'M356 302 L361 340', 'M374 302 L370 340', 'M357 340 H374',
  'M137 304 V338', 'M365 304 V338',
];
const SEAT_FRAME = [
  'M106 272 H394 Q400 272 400 278 V294 Q400 300 394 300 H106 Q100 300 100 294 V278 Q100 272 106 272 Z',
  'M112 236 Q112 228 124 228 H380 Q392 228 392 236 V272 H112 Z',
  'M128 282 l10 10', 'M168 282 l10 10', 'M208 282 l10 10', 'M248 282 l10 10', 'M288 282 l10 10', 'M328 282 l10 10', 'M368 282 l10 10',
  'M150 244 q30 6 60 0 t60 0 t60 0 t60 0', 'M150 256 q30 -6 60 0 t60 0 t60 0 t60 0',
  'M140 250 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0', 'M364 250 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0',
];
const BACK = [
  'M98 272 L120 116 Q122 108 130 108 H138 Q146 108 145 116 L124 272',
  'M104 262 h14 v-12 h-14 z', 'M112 214 l14 2', 'M117 180 l14 2', 'M122 146 l14 2',
];
const CUSHIONS = [
  'M158 214 Q140 214 140 232 V240 H384 V232 Q384 214 366 214 Z',
  'M150 222 H376',
  'M152 238 Q148 160 164 134 Q172 122 186 126 L196 130 Q204 136 200 150 L186 238',
  'M162 228 Q160 166 172 142 Q178 134 188 138',
  'M260 214 v-4', 'M300 214 v-4', 'M220 214 v-4', 'M340 214 v-4',
];
// Solid outline used to clip the walnut fill.
const SILHOUETTE = [
  'M106 272 H394 Q400 272 400 278 V294 Q400 300 394 300 H106 Q100 300 100 294 V278 Q100 272 106 272 Z',
  'M112 236 Q112 228 124 228 H380 Q392 228 392 236 V272 H112 Z',
  'M98 272 L120 116 Q122 108 130 108 H138 Q146 108 145 116 L124 272 Z',
  'M158 214 Q140 214 140 232 V240 H384 V232 Q384 214 366 214 Z',
  'M152 238 Q148 160 164 134 Q172 122 186 126 L196 130 Q204 136 200 150 L186 238 Z',
  'M128 300 L122 340 H145 L146 300 Z', 'M356 300 L361 340 H374 L374 300 Z',
];
const DIMS = [
  'M100 366 H400', 'M100 360 V372', 'M400 360 V372',
  'M436 108 V340', 'M430 108 H442', 'M430 340 H442',
  'M100 352 V362', 'M400 352 V362',
];

function Drawing({ id }) {
  const stroke = { fill: 'none', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', pathLength: 1 };
  return (
    <svg viewBox="40 80 440 320" className="h-auto w-[min(78vw,560px)]" aria-hidden="true">
      <defs>
        <clipPath id={`chair-${id}`}>
          {SILHOUETTE.map((d) => (
            <path key={d} d={d} />
          ))}
        </clipPath>
        <linearGradient id={`walnut-${id}`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#4a2f1e" />
          <stop offset="0.45" stopColor="#6a452c" />
          <stop offset="1" stopColor="#3e2716" />
        </linearGradient>
      </defs>
      <g className="pl-fill" opacity="0" clipPath={`url(#chair-${id})`}>
        <rect x="90" y="100" width="320" height="250" fill={`url(#walnut-${id})`} />
        <image href="/images/preloader-walnut.jpg" x="90" y="100" width="320" height="250" preserveAspectRatio="xMidYMid slice" />
      </g>
      <line x1="40" y1="340" x2="480" y2="340" stroke="#8F8073" strokeWidth="0.6" strokeDasharray="2 4" />
      <g stroke="#2A1D15">
        {[LEGS, SEAT_FRAME, BACK, CUSHIONS].map((group, gi) => (
          <g key={gi} className={`pl-g${gi}`}>
            {group.map((d) => (
              <path key={d} d={d} {...stroke} className="pl-draw" strokeDasharray="1" strokeDashoffset="1" />
            ))}
          </g>
        ))}
      </g>
      <g stroke="#B8935A" className="pl-dims">
        {DIMS.map((d) => (
          <path key={d} d={d} {...stroke} strokeWidth="1" className="pl-dim" strokeDasharray="1" strokeDashoffset="1" />
        ))}
        <text x="250" y="386" textAnchor="middle" className="pl-dimtext" opacity="0" fill="#B8935A" stroke="none" style={{ font: '500 10px "IBM Plex Mono", monospace', letterSpacing: '0.14em' }}>
          D 84
        </text>
        <text x="452" y="228" className="pl-dimtext" opacity="0" fill="#B8935A" stroke="none" style={{ font: '500 10px "IBM Plex Mono", monospace', letterSpacing: '0.14em' }}>
          H 72
        </text>
      </g>
    </svg>
  );
}

function Sheet({ id }) {
  return (
    <div className="relative flex h-[100svh] w-screen flex-col items-center justify-center bg-linen">
      <div className="mono absolute left-[var(--gutter)] top-6 text-taupe">TAAQ · Drawing no. 01 · Dune lounge chair</div>
      <div className="mono absolute right-[var(--gutter)] top-6 text-taupe">Scale 1:10</div>
      <Drawing id={id} />
      <p className="mono pl-dimtext mt-4 text-brass opacity-0">W 78 · D 84 · H 72 cm</p>
      <div className="absolute bottom-6 left-[var(--gutter)] right-[var(--gutter)] flex items-end justify-between">
        <span className="mono text-taupe">Carved in Chiniot · Finished in Lahore</span>
        <span className="pl-count display text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-espresso">00</span>
      </div>
    </div>
  );
}

export default function Preloader() {
  const setIntroDone = useUI((s) => s.setIntroDone);
  const [show, setShow] = useState(() => {
    try {
      return !sessionStorage.getItem(KEY);
    } catch {
      return true;
    }
  });
  const root = useRef(null);

  useEffect(() => {
    if (!show) {
      setIntroDone();
      return undefined;
    }
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* private mode */
    }
    const lenis = getLenis();
    lenis?.stop();
    const finish = () => {
      lenis?.start();
      setShow(false);
    };
    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set('.pl-draw, .pl-dim', { strokeDashoffset: 0 });
        gsap.set('.pl-fill, .pl-dimtext', { opacity: 1 });
        gsap.to(root.current, { opacity: 0, duration: 0.4, delay: 0.8, onStart: setIntroDone, onComplete: finish });
        return;
      }
      const counter = { v: 0 };
      const counts = root.current.querySelectorAll('.pl-count');
      const tl = gsap.timeline();
      tl.to(counter, {
        v: 100,
        duration: 2.3,
        ease: 'power2.inOut',
        onUpdate: () => counts.forEach((n) => (n.textContent = String(Math.round(counter.v)).padStart(2, '0'))),
      }, 0);
      [0, 1, 2, 3].forEach((g) => {
        tl.to(`.pl-g${g} .pl-draw`, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut', stagger: 0.03 }, 0.05 + g * 0.38);
      });
      tl.to('.pl-dim', { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut', stagger: 0.04 }, 1.2);
      tl.to('.pl-dimtext', { opacity: 1, duration: 0.4 }, 1.55);
      tl.to('.pl-fill', { opacity: 0.92, duration: 0.7, ease: 'power2.out' }, 2.0);
      tl.to('.pl-crease', { scaleY: 1, duration: 0.4, ease: 'power2.inOut' }, 2.55);
      tl.add(() => setIntroDone(), 2.85);
      tl.to('.pl-left', { rotationY: 90, duration: 1.15, ease: 'power4.inOut' }, 2.85);
      tl.to('.pl-right', { rotationY: -90, duration: 1.15, ease: 'power4.inOut' }, 2.85);
      tl.to('.pl-shade', { opacity: 0.5, duration: 1.15, ease: 'power4.inOut' }, 2.85);
      tl.add(finish);
    }, root);
    return () => ctx.revert();
  }, [show, setIntroDone]);

  if (!show) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[200] overflow-hidden" style={{ perspective: '1400px' }} aria-label="Loading TAAQ" role="status">
      <div className="pl-left absolute left-0 top-0 h-full w-1/2 overflow-hidden" style={{ transformOrigin: '0% 50%' }}>
        <Sheet id="l" />
        <div className="pl-shade pointer-events-none absolute inset-0 bg-espresso opacity-0" />
      </div>
      <div className="pl-right absolute right-0 top-0 h-full w-1/2 overflow-hidden" style={{ transformOrigin: '100% 50%' }}>
        <div className="absolute right-0 top-0">
          <Sheet id="r" />
        </div>
        <div className="pl-shade pointer-events-none absolute inset-0 bg-espresso opacity-0" />
      </div>
      <div className="pl-crease pointer-events-none absolute left-1/2 top-0 h-full w-px bg-brass/60" style={{ transform: 'scaleY(0)' }} />
    </div>
  );
}
