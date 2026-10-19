import { lazy, Suspense, useRef, useState } from 'react';
import { useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { reducedMotion, isMobile } from '../lib/env.js';
import { flyToCart } from '../lib/flyToCart.js';
import { playClick } from '../lib/sound.js';
import { woods, fabrics } from '../data/brand.js';
import { bySlug } from '../data/products.js';
import { useCart, priceFor } from '../store/cart.js';
import LazyMount from '../components/LazyMount.jsx';
import RollingNumber from '../components/RollingNumber.jsx';

const ConfiguratorScene = lazy(() => import('../three/ConfiguratorScene.jsx'));
const chair = bySlug['dune-lounge-chair'];

export function Swatch({ active, label, onClick, color, tint, small }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`tap group flex shrink-0 flex-col items-center gap-1.5 ${small ? '' : 'px-1'}`}
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 ${active ? 'border-clay' : 'border-transparent group-hover:border-brass/60'}`}>
        <span className="block h-8 w-8 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.12),inset_0_-6px_10px_rgba(0,0,0,.18)]" style={{ background: `radial-gradient(circle at 35% 30%, ${tint || color}, ${color})` }} />
      </span>
      {!small && <span className={`mono whitespace-nowrap text-[10px] ${active ? 'text-espresso' : 'text-taupe'}`}>{label}</span>}
    </button>
  );
}

function Row({ title, value, children }) {
  return (
    <div className="border-t hairline py-5">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="mono text-taupe">{title}</p>
        <p className="mono text-espresso">{value}</p>
      </div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label={title}>
        {children}
      </div>
    </div>
  );
}

export default function Configurator() {
  const root = useRef(null);
  const title = useRef(null);
  const stage = useRef(null);
  const glRef = useRef(null);
  const [wood, setWood] = useState('walnut');
  const [fabric, setFabric] = useState('boucle');
  const [size, setSize] = useState('single');
  const [dims, setDims] = useState(false);
  const [mobile] = useState(isMobile);
  const add = useCart((s) => s.add);
  const price = priceFor(chair, { wood, fabric, size });

  useGSAP(() => flipChars(title.current), { scope: root });

  const pick = (fn) => (v) => {
    playClick();
    fn(v);
  };

  const addToCart = () => {
    const src = glRef.current?.snapshot?.() || chair.image;
    flyToCart({ from: stage.current, src, done: () => add(chair.slug, { wood, fabric, size }) });
  };

  const w = woods.find((x) => x.id === wood);
  const f = fabrics.find((x) => x.id === fabric);

  return (
    <section ref={root} id="configure" data-chapter="05" aria-label="Make it yours" className="relative py-[14vh]">
      <div className="wrap mb-10 md:mb-14">
        <p className="mono text-taupe">05 — Make it yours</p>
        <h2 ref={title} className="display mt-4 max-w-[14ch] text-section">
          One chair, <i>your way.</i>
        </h2>
      </div>
      <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div ref={stage} className="relative lg:col-span-7">
          <LazyMount className="niche relative h-[60vh] overflow-hidden rounded-t-[999px] bg-[#E6DED2] md:h-[78vh] lg:h-[80vh]">
            {(visible) => (
              <Suspense fallback={<div className="absolute inset-0 animate-pulse bg-[#E6DED2]" />}>
                <ConfiguratorScene wood={wood} fabric={fabric} size={size} showDims={dims} mobile={mobile} active={visible} reduced={reducedMotion} glRef={glRef} />
              </Suspense>
            )}
          </LazyMount>
          <p className="mono absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-taupe">Drag to turn · Dune Lounge Chair</p>
        </div>

        <div className="lg:col-span-5 lg:pt-6">
          <p className="display text-3xl">{chair.name}</p>
          <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-espresso/75">{chair.story}</p>
          <div className="mt-8">
            <Row title="Wood" value={w.name}>
              {woods.map((x) => (
                <Swatch key={x.id} label={x.name} color={x.hex} tint={x.tint} active={wood === x.id} onClick={() => pick(setWood)(x.id)} />
              ))}
            </Row>
            <Row title="Fabric" value={f.name}>
              {fabrics.map((x) => (
                <Swatch key={x.id} label={x.name} color={x.hex} active={fabric === x.id} onClick={() => pick(setFabric)(x.id)} />
              ))}
            </Row>
            <Row title="Size" value={size === 'wide' ? 'Wide · W 105 cm' : 'Single · W 78 cm'}>
              {['single', 'wide'].map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  onClick={() => pick(setSize)(s)}
                  className={`min-h-[44px] shrink-0 rounded-full border px-6 text-[15px] capitalize transition-colors duration-300 ${size === s ? 'border-espresso bg-espresso text-linen' : 'border-espresso/25 hover:border-espresso'}`}
                >
                  {s}
                </button>
              ))}
            </Row>
            <div className="flex items-center justify-between border-t hairline py-5">
              <p className="mono text-taupe">Show dimensions</p>
              <button
                type="button"
                role="switch"
                aria-checked={dims}
                onClick={() => pick(setDims)(!dims)}
                className="tap flex items-center justify-end"
                aria-label="Show dimensions"
              >
                <span className={`relative block h-6 w-11 rounded-full transition-colors duration-300 ${dims ? 'bg-brass' : 'bg-espresso/15'}`}>
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-linen shadow transition-transform duration-300 ease-expo ${dims ? 'translate-x-6' : 'translate-x-1'}`} />
                </span>
              </button>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4 border-t hairline pt-6">
              <div>
                <RollingNumber value={price} className="display text-[clamp(2.2rem,3.6vw,3.2rem)] leading-none" />
                <p className="mono mt-2 text-taupe">Made to order · 5–6 weeks</p>
              </div>
              <button type="button" className="btn-clay" onClick={addToCart}>
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
