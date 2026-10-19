import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap, Draggable, Flip, InertiaPlugin, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { initParallax } from '../lib/parallax.js';
import { isMobile, reducedMotion } from '../lib/env.js';
import { formatPrice } from '../lib/format.js';
import { products, categories, matchesCategory } from '../data/products.js';
import { useUI } from '../store/ui.js';
import { whoosh } from '../lib/sound.js';
import GLImage from '../gl/GLImage.jsx';

const COLW = 270;
const GAP = 80;
const CAPTION = 56;
const SIZES = [[270, 340], [230, 230], [270, 390], [210, 262], [250, 312], [270, 270]];
const mod = (n, m) => ((n % m) + m) % m;

function layoutAll(vw, vh) {
  const cols = Math.max(6, Math.ceil(vw / (COLW + GAP)) + 2);
  const heights = Array.from({ length: cols }, (_, c) => (c % 2 ? 140 : 30));
  const pos = products.map((_, i) => {
    let c = 0;
    heights.forEach((h, k) => {
      if (h < heights[c]) c = k;
    });
    const [w, h] = SIZES[i % SIZES.length];
    const p = { x: c * (COLW + GAP) + (COLW - w) / 2, y: heights[c], w, h };
    heights[c] += h + GAP + CAPTION;
    return p;
  });
  return { pos, W: cols * (COLW + GAP), H: Math.max(vh + 500, Math.max(...heights) + 60) };
}

export function Chips({ value, onChange }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label="Filter by category">
      {categories.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          onClick={() => onChange(c)}
          className={`min-h-[44px] shrink-0 rounded-full border px-5 text-[14px] transition-colors duration-300 ${
            value === c ? 'border-espresso bg-espresso text-linen' : 'border-espresso/20 hover:border-espresso'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function Desktop({ filter }) {
  const box = useRef(null);
  const proxy = useRef(null);
  const outers = useRef([]);
  const inners = useRef([]);
  const states = useMemo(() => products.map(() => ({ current: null })), []);
  const offset = useRef({ x: -120, y: -60, px: -120, py: -60, vx: 0, vy: 0 });
  const geo = useRef(null);
  const bases = useRef([]);
  const flipState = useRef(null);
  const openSheet = useUI((s) => s.openSheet);
  const first = useRef(true);

  const place = () => {
    const g = geo.current;
    if (!g) return;
    const o = offset.current;
    const vw = box.current.clientWidth;
    const vh = box.current.clientHeight;
    bases.current.forEach((b, i) => {
      const el = outers.current[i];
      if (!el) return;
      const x = mod(b.x + o.x + b.w, g.W) - b.w;
      const y = mod(b.y + o.y + b.h + CAPTION, g.H) - b.h - CAPTION;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      el.style.visibility = x > vw + 40 || y > vh + 40 ? 'hidden' : 'visible';
    });
  };

  const relayout = () => {
    const vw = box.current.clientWidth;
    const vh = box.current.clientHeight;
    const g = layoutAll(vw, vh);
    geo.current = g;
    const matching = products.map((p) => matchesCategory(p, filter));
    if (filter === 'All') {
      bases.current = g.pos.map((p) => ({ ...p }));
      return matching;
    }
    // Matching pieces gather into a calm grid around the middle of the view.
    const list = products.map((_, i) => i).filter((i) => matching[i]);
    const cols = Math.min(list.length, Math.max(2, Math.ceil(Math.sqrt(list.length * 1.8))));
    const cellW = COLW + GAP;
    const cellH = 400 + CAPTION;
    const rows = Math.ceil(list.length / cols);
    const o = offset.current;
    const left = -o.x + vw / 2 - (cols * cellW) / 2;
    const top = -o.y + vh / 2 - (rows * cellH) / 2;
    bases.current = g.pos.map((p, i) => {
      const k = list.indexOf(i);
      if (k < 0) return { ...p };
      const [w, h] = [p.w, p.h];
      return { x: left + (k % cols) * cellW + (COLW - w) / 2, y: top + Math.floor(k / cols) * cellH + (400 - h) / 2, w, h };
    });
    return matching;
  };

  const [matching, setMatching] = useState(() => products.map(() => true));

  // Filter change: record, re-lay out, then Flip from the old positions.
  useLayoutEffect(() => {
    if (!first.current) flipState.current = Flip.getState(inners.current.filter(Boolean));
    setMatching(relayout());
    place();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!flipState.current) return;
    Flip.from(flipState.current, { duration: reducedMotion ? 0.01 : 0.9, ease: 'power4.inOut', stagger: 0.008 });
    flipState.current = null;
  }, [matching]);

  useEffect(() => {
    const o = offset.current;
    const [drag] = Draggable.create(proxy.current, {
      type: 'x,y',
      trigger: box.current,
      inertia: true,
      dragClickables: true,
      allowContextMenu: true,
      onPress() {
        gsap.set(proxy.current, { x: o.x, y: o.y });
        this.update();
      },
      onDrag() {
        o.x = this.x;
        o.y = this.y;
      },
      onThrowUpdate() {
        o.x = this.x;
        o.y = this.y;
      },
      onDragEnd() {
        const v = Math.hypot(InertiaPlugin.getVelocity(proxy.current, 'x') || 0, InertiaPlugin.getVelocity(proxy.current, 'y') || 0);
        if (v > 600) whoosh(Math.min(1, v / 2500), 0.5, true);
      },
      onClick(e) {
        const el = e.target instanceof Element ? e.target.closest('[data-slug]') : null;
        if (el) openSheet(el.dataset.slug, el.querySelector('.gl-frame'));
      },
    });
    gsap.set(proxy.current, { x: o.x, y: o.y });

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        o.x -= e.deltaX;
      } else o.y -= e.deltaY * 0.6;
    };
    const el = box.current;
    el.addEventListener('wheel', onWheel, { passive: false });

    // Only move the 29 pictures while the canvas is on screen.
    let onScreen = false;
    const seen = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        onScreen = self.isActive;
      },
    });
    const tick = () => {
      if (!onScreen) return;
      place();
      const dx = o.x - o.px;
      const dy = o.y - o.py;
      o.px = o.x;
      o.py = o.y;
      o.vx += (Math.max(-60, Math.min(60, dx)) - o.vx) * 0.2;
      o.vy += (Math.max(-60, Math.min(60, -dy)) - o.vy) * 0.2;
      states.forEach((s) => {
        if (s.current) {
          s.current.velocity.x = o.vx;
          s.current.velocity.y = o.vy;
        }
      });
    };
    gsap.ticker.add(tick);
    const onResize = () => {
      setMatching(relayout());
      place();
    };
    window.addEventListener('resize', onResize);
    return () => {
      drag.kill();
      seen.kill();
      gsap.ticker.remove(tick);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={box} className="relative h-[86vh] overflow-hidden border-y hairline">
      <div ref={proxy} className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0" aria-hidden="true" />
      {products.map((p, i) => {
        const b = bases.current[i] || { w: 260, h: 320 };
        const on = matching[i];
        return (
          <div key={p.slug} ref={(el) => (outers.current[i] = el)} className="absolute left-0 top-0" style={{ width: b.w, height: b.h + CAPTION }}>
            <button
              type="button"
              data-slug={p.slug}
              ref={(el) => (inners.current[i] = el)}
              onClick={(e) => e.detail === 0 && openSheet(p.slug, e.currentTarget.querySelector('.gl-frame'))}
              tabIndex={on ? 0 : -1}
              aria-label={`${p.name}, ${formatPrice(p.price)}`}
              className={`absolute block text-left ${on ? 'left-0 top-0' : 'left-1/2 top-[40%] -ml-[7px] overflow-hidden rounded-full opacity-40'}`}
              style={on ? { width: b.w, height: b.h + CAPTION } : { width: 14, height: 14 }}
            >
              <GLImage
                src={p.image}
                alt={p.name}
                clipRef={box}
                stateRef={states[i]}
                parallax={false}
                shape={i % 3 === 0 ? 'arch' : 'rect'}
                radius={2}
                className="w-full"
                style={{ height: on ? b.h : 14 }}
              />
              {on && (
                <span className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="display truncate text-lg">{p.name}</span>
                  <span className="shrink-0 font-mono text-[11px] text-taupe">{formatPrice(p.price)}</span>
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function MobileGrid({ filter }) {
  const root = useRef(null);
  const openSheet = useUI((s) => s.openSheet);
  const state = useRef(null);
  const first = useRef(true);

  useGSAP(() => initParallax(root.current), { scope: root });

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (state.current) Flip.from(state.current, { duration: 0.7, ease: 'power4.inOut', onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }) });
  }, [filter]);

  // Capture before the class change lands.
  const items = root.current ? [...root.current.querySelectorAll('.m-item')] : [];
  if (items.length && !first.current) state.current = Flip.getState(items);

  return (
    <div ref={root} className="wrap grid grid-cols-2 gap-x-4 gap-y-8">
      {products.map((p, i) => (
        <button
          key={p.slug}
          type="button"
          className={`m-item block text-left ${matchesCategory(p, filter) ? '' : 'hidden'} ${i % 2 ? 'mt-10' : ''}`}
          data-speed={i % 2 ? 1.06 : 0.96}
          onClick={(e) => openSheet(p.slug, e.currentTarget.querySelector('.gl-frame'))}
        >
          <GLImage src={p.image} alt={p.name} shape={i % 3 === 0 ? 'arch' : 'rect'} className="aspect-[4/5] w-full" />
          <span className="display mt-2 block text-[17px] leading-tight">{p.name}</span>
          <span className="font-mono text-[11px] text-taupe">{formatPrice(p.price)}</span>
        </button>
      ))}
    </div>
  );
}

export default function CollectionCanvas() {
  const root = useRef(null);
  const title = useRef(null);
  const [filter, setFilter] = useState('All');
  const [mobile] = useState(isMobile);

  useGSAP(() => flipChars(title.current), { scope: root });

  return (
    <section ref={root} data-chapter="08" aria-label="The collection" className="relative py-[12vh]">
      <div className="wrap mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mono text-taupe">08 — The collection</p>
          <h2 ref={title} className="display mt-4 text-section">
            Everything we <i>make</i>
          </h2>
        </div>
        <div className="md:max-w-[60%]">
          <Chips
            value={filter}
            onChange={(f) => {
              whoosh(0.8, 0.5, true);
              setFilter(f);
            }}
          />
          {!mobile && <p className="mono mt-3 text-taupe md:text-right">Drag to wander · Click a piece to open it</p>}
        </div>
      </div>
      {mobile ? <MobileGrid filter={filter} /> : <Desktop filter={filter} />}
    </section>
  );
}
