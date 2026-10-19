import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { gsap, Draggable, useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { reducedMotion, isMobile } from '../lib/env.js';
import { tick } from '../lib/sound.js';
import { formatPrice } from '../lib/format.js';
import { collections, collectionStats } from '../data/collections.js';
import { woods } from '../data/brand.js';
import { useUI } from '../store/ui.js';
import { go } from '../components/DoorTransition.jsx';
import Img from '../components/Img.jsx';

const N = collections.length;
const SPREAD = 11; // degrees between the open slat and its neighbours
const PX = 70; // horizontal drag distance that moves one slat
// Angle of a slat `d` places from the open one (d can be fractional while
// dragging). Near slats fan wide, far ones pack tight, so the fan stays
// balanced around the open slat whichever collection is chosen.
const angleFor = (d) => {
  const a = Math.abs(d);
  return Math.sign(d) * (a <= 3 ? a * SPREAD : 3 * SPREAD + (a - 3) * 4.5);
};
const foil = 'linear-gradient(90deg,#8e6b3a,#f0d6a0 45%,#b8935a 60%,#7a5a2e)';
const clampIndex = (i) => Math.max(0, Math.min(N - 1, i));

/** One veneer swatch: arch top, photo window, vertical name, rivet hole. */
function Slat({ col, index, active, onPick, setRef }) {
  return (
    <div
      ref={setRef}
      className="absolute bottom-0 left-0"
      style={{ width: 'var(--slat-w)', height: 'var(--slat-h)', marginLeft: 'calc(var(--slat-w) / -2)', transformOrigin: '50% calc(100% - 22px)' }}
    >
      <button
        type="button"
        onClick={() => onPick(index)}
        aria-pressed={active}
        aria-label={`${col.name}, collection ${col.number}`}
        className="group block h-full w-full"
        style={{ transformOrigin: '50% 100%' }}
      >
        <span
          className={`slat-face relative flex h-full w-full flex-col items-center overflow-hidden rounded-b-[22px] rounded-t-[999px] transition-transform duration-500 ease-expo ${
            active ? '-translate-y-7' : 'group-hover:-translate-y-3 group-focus-visible:-translate-y-3'
          }`}
          style={{
            backgroundColor: col.cloth,
            color: col.ink,
            backgroundImage:
              'linear-gradient(90deg, rgba(0,0,0,.28), rgba(255,255,255,.1) 22%, rgba(255,255,255,.02) 50%, rgba(0,0,0,.22)), repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 1px, transparent 1px 6px), repeating-linear-gradient(0deg, rgba(0,0,0,.035) 0 2px, transparent 2px 9px)',
            boxShadow: active
              ? '0 26px 40px -18px rgba(27,22,18,.65), inset 0 0 0 1px rgba(240,214,160,.45)'
              : '0 14px 24px -16px rgba(27,22,18,.55), inset 0 0 0 1px rgba(0,0,0,.18)',
          }}
        >
          {/* photo window near the top, like a sample card */}
          <span className="relative mt-[10%] block w-[74%] overflow-hidden rounded-t-[999px] shadow-[inset_0_0_0_1px_rgba(240,214,160,.5)]" style={{ aspectRatio: '3 / 4' }}>
            <Img src={col.image} alt="" className="absolute inset-0" />
          </span>
          <span className="mt-3 font-mono text-[10px] tracking-[0.14em]" style={{ color: '#e6c991' }}>
            {col.number}
          </span>
          <span className="mt-2 block h-[2px] w-[60%]" style={{ background: foil }} />
          <span className="display mt-4 flex-1 text-[clamp(1rem,1.5vw,1.35rem)] leading-none" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            {col.name}
          </span>
          {/* rivet hole */}
          <span className="mb-[14px] mt-3 block h-4 w-4 rounded-full" style={{ background: 'radial-gradient(circle, #1b1612 45%, rgba(0,0,0,.4) 60%, transparent 70%)' }} />
        </span>
      </button>
    </div>
  );
}

function Panel({ col }) {
  const root = useRef(null);
  const openSheet = useUI((s) => s.openSheet);
  const stats = collectionStats(col);
  const woodNames = stats.woods.map((id) => woods.find((w) => w.id === id)?.name).filter(Boolean);

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.fromTo('.pn-line', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05 });
      gsap.fromTo('.pn-media', { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 1, ease: 'expo.out' });
    },
    { scope: root, dependencies: [col.id] },
  );

  return (
    <div ref={root} className="grid gap-6 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] sm:gap-8" aria-live="polite">
      <div className="pn-media">
        <Img src={col.image} alt={`${col.name} collection`} className="aspect-[4/5] w-full rounded-t-[999px] bg-[#E6DED2] shadow-niche" />
      </div>
      <div className="flex min-w-0 flex-col">
        <p className="pn-line mono text-taupe">Collection {col.number}</p>
        <h3 className="pn-line display mt-2 text-[clamp(2.4rem,4.4vw,4.2rem)] leading-[0.95] tracking-[-0.02em]">{col.name}</h3>
        <p className="pn-line mt-4 text-[16px] leading-relaxed text-espresso/85">{col.line}</p>
        <dl className="pn-line mt-5 grid grid-cols-3 gap-3 border-y hairline py-3 font-mono text-[11px] uppercase tracking-[0.12em]">
          <div>
            <dt className="text-taupe">Pieces</dt>
            <dd className="mt-1 text-espresso">{stats.count}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-taupe">Woods</dt>
            <dd className="mt-1 truncate text-espresso" title={woodNames.join(', ')}>
              {woodNames.length}
            </dd>
          </div>
          <div>
            <dt className="text-taupe">From</dt>
            <dd className="mt-1 text-espresso">{formatPrice(stats.from)}</dd>
          </div>
        </dl>
        <p className="pn-line display mt-5 line-clamp-4 text-[17px] italic leading-snug text-espresso/85">{col.essay}</p>
        <ul className="pn-line no-scrollbar -mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1" aria-label={`Pieces in ${col.name}`}>
          {stats.items.map((p) => (
            <li key={p.slug} className="shrink-0">
              <button
                type="button"
                onClick={(e) => openSheet(p.slug, e.currentTarget.querySelector('.thumb'))}
                className="group block w-[78px] text-left"
                aria-label={`${p.name}, ${formatPrice(p.price)}`}
              >
                <Img src={p.image} alt="" className="thumb aspect-[4/5] w-full rounded-t-[999px] bg-[#E6DED2]" imgClassName="transition-transform duration-500 ease-expo group-hover:scale-105" />
                <span className="mt-1 block truncate text-[11px] text-espresso/80">{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="pn-line mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn-clay" onClick={() => go(`/shop?col=${col.id}`)}>
            Shop this collection
          </button>
          <button type="button" className="btn-line" onClick={() => go('/#visit')}>
            See it in person
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SwatchFan() {
  const root = useRef(null);
  const title = useRef(null);
  const stage = useRef(null);
  const proxy = useRef(null);
  const slats = useRef([]);
  const pivot = useRef(null);
  const drag = useRef(null);
  const fan = useRef({ pos: 0, open: reducedMotion ? 1 : 0 }); // pos: fractional open index
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [mobile] = useState(isMobile);

  // Lay every slat out around the (possibly fractional) open position.
  const layout = useCallback(() => {
    const { pos, open } = fan.current;
    slats.current.forEach((el, i) => {
      if (!el) return;
      const d = i - pos;
      gsap.set(el, { rotation: angleFor(d) * open, zIndex: 40 - Math.round(Math.abs(d) * 4) });
    });
    // At either end every slat sits on one side; slide the pivot the other
    // way so the fan stays centred in its column.
    if (pivot.current) {
      const lean = ((N - 1) / 2 - pos) / ((N - 1) / 2); // 1 at the first slat, -1 at the last
      gsap.set(pivot.current, { x: -lean * open * (mobile ? 58 : 70) });
    }
    const i = clampIndex(Math.round(pos));
    if (i !== activeRef.current) {
      activeRef.current = i;
      tick(1.6);
      setActive(i);
    }
  }, []);

  const select = useCallback(
    (i) => {
      const next = clampIndex(i);
      gsap.to(fan.current, {
        pos: next,
        duration: reducedMotion ? 0.01 : 0.9,
        ease: 'expo.out',
        overwrite: true,
        onUpdate: layout,
      });
      if (proxy.current) gsap.set(proxy.current, { x: -next * PX });
    },
    [layout],
  );

  useGSAP(
    () => {
      flipChars(title.current);
      layout();
      if (reducedMotion) return;
      // The fan opens out of a closed stack as it scrolls into view.
      gsap.to(fan.current, {
        open: 1,
        duration: 1.5,
        ease: 'expo.out',
        onUpdate: layout,
        scrollTrigger: { trigger: stage.current, start: 'top 75%', once: true },
      });
    },
    { scope: root },
  );

  // Pull sideways through the deck; it snaps to a slat with inertia.
  useEffect(() => {
    if (mobile) return undefined;
    const [d] = Draggable.create(proxy.current, {
      type: 'x',
      trigger: stage.current,
      inertia: !reducedMotion,
      bounds: { minX: -(N - 1) * PX, maxX: 0 },
      edgeResistance: 0.75,
      snap: (v) => Math.round(v / PX) * PX,
      dragClickables: true,
      onPress() {
        gsap.killTweensOf(fan.current, 'pos');
        gsap.set(proxy.current, { x: -fan.current.pos * PX });
        this.update();
      },
      onDrag() {
        fan.current.pos = -this.x / PX;
        layout();
      },
      onThrowUpdate() {
        fan.current.pos = -this.x / PX;
        layout();
      },
    });
    drag.current = d;
    return () => d.kill();
  }, [mobile, layout]);

  const onKey = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      select(activeRef.current + 1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      select(activeRef.current - 1);
    }
  };

  return (
    <section ref={root} id="collections" data-chapter="06" aria-label="The collections" className="relative overflow-hidden py-[14vh]">
      <div className="wrap mb-10 grid gap-6 md:mb-14 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="mono text-taupe">06 — The collections</p>
          <h2 ref={title} className="display mt-4 text-section">
            Turn the fan, <i>pick a wood.</i>
          </h2>
        </div>
        <p className="max-w-[36ch] self-end text-[15px] leading-relaxed text-espresso/80 md:col-span-4">
          Eight collections on one brass pivot, the way our carvers carry veneer samples to a client's home. Drag the fan, or pick a swatch.
        </p>
      </div>

      <div className="wrap grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <div
            ref={stage}
            onKeyDown={onKey}
            className="relative mx-auto h-[min(68vh,620px)] max-w-[620px] cursor-grab touch-pan-y select-none active:cursor-grabbing md:h-[min(78vh,700px)]"
            style={{ '--slat-w': mobile ? '58px' : '86px', '--slat-h': mobile ? 'min(54vh, 420px)' : 'min(62vh, 560px)' }}
            role="group"
            tabIndex={0}
            aria-label="Collection swatch fan. Use the left and right arrow keys to turn it."
          >
            {/* soft pool of light behind the fan */}
            <div className="pointer-events-none absolute inset-x-[8%] bottom-[6%] top-[12%] rounded-t-[999px] bg-[#E6DED2]/70 shadow-niche" aria-hidden="true" />
            <div ref={proxy} className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0" aria-hidden="true" />
            <div ref={pivot} className="absolute bottom-[9%] left-1/2 h-0 w-0">
              <div className="absolute bottom-[-22px] left-0">
                {collections.map((c, i) => (
                  <Slat key={c.id} col={c} index={i} active={i === active} onPick={(k) => select(k)} setRef={(el) => (slats.current[i] = el)} />
                ))}
              </div>
              {/* the brass rivet everything turns on (rides inside the pivot) */}
              <span
                className="pointer-events-none absolute bottom-0 left-0 z-50 block h-7 w-7 -translate-x-1/2 translate-y-1/2 rounded-full"
                style={{ background: 'radial-gradient(circle at 35% 30%, #f6e2b4, #b8935a 55%, #6f5228)', boxShadow: '0 4px 8px rgba(27,22,18,.45), inset 0 -2px 3px rgba(0,0,0,.3)' }}
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <button type="button" onClick={() => select(active - 1)} disabled={active === 0} className="tap flex items-center justify-center rounded-full border border-espresso/25 disabled:opacity-30" aria-label="Previous collection">
              <ArrowLeft size={18} strokeWidth={1.4} />
            </button>
            <span className="mono w-16 text-center text-espresso">
              {collections[active].number} / {String(N).padStart(2, '0')}
            </span>
            <button type="button" onClick={() => select(active + 1)} disabled={active === N - 1} className="tap flex items-center justify-center rounded-full border border-espresso/25 disabled:opacity-30" aria-label="Next collection">
              <ArrowRight size={18} strokeWidth={1.4} />
            </button>
          </div>
        </div>
        <div className="lg:col-span-6">
          <Panel col={collections[active]} />
        </div>
      </div>
    </section>
  );
}
