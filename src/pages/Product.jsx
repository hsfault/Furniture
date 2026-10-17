import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Minus, Plus, X } from 'lucide-react';
import { gsap, Draggable, useGSAP } from '../lib/gsap.js';
import { flipChars, inkWords } from '../lib/splitReveal.js';
import { initParallax } from '../lib/parallax.js';
import { reducedMotion, isMobile } from '../lib/env.js';
import { formatPrice, formatDims } from '../lib/format.js';
import { flyToCart } from '../lib/flyToCart.js';
import { getLenis } from '../lib/lenis.js';
import { bySlug, products } from '../data/products.js';
import { collections } from '../data/collections.js';
import { rooms } from '../data/rooms.js';
import { woods, fabrics, makers, brand } from '../data/brand.js';
import { useCart, priceFor } from '../store/cart.js';
import { TLink } from '../components/DoorTransition.jsx';
import { useFocusTrap } from '../components/useFocusTrap.js';
import { Swatch } from '../sections/Configurator.jsx';
import RollingNumber from '../components/RollingNumber.jsx';
import GLImage from '../gl/GLImage.jsx';
import Img from '../components/Img.jsx';
import NotFound from './NotFound.jsx';

const ConfiguratorScene = lazy(() => import('../three/ConfiguratorScene.jsx'));

function Viewer({ product, wood, setWood, fabric, setFabric, onClose }) {
  const root = useRef(null);
  const [dims, setDims] = useState(false);
  const [size, setSize] = useState('single');
  useFocusTrap(root, true, onClose);
  useEffect(() => {
    getLenis()?.stop();
    gsap.fromTo(root.current, { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: reducedMotion ? 0.01 : 0.9, ease: 'power4.inOut' });
    return () => getLenis()?.start();
  }, []);
  return (
    <div ref={root} className="fixed inset-0 z-[96] flex flex-col bg-plaster md:flex-row" role="dialog" aria-modal="true" aria-label={`${product.name} in 3D`}>
      <div className="relative min-h-0 flex-1" data-cursor="ROTATE">
        <Suspense fallback={null}>
          <ConfiguratorScene model={product.model} wood={wood} fabric={fabric} size={size} showDims={dims} mobile={isMobile()} reduced={reducedMotion} labels={`${product.name} in 3D. Drag to rotate.`} />
        </Suspense>
        <p className="mono absolute left-[var(--gutter)] top-6">{product.name} · drag to turn</p>
      </div>
      <div className="paper w-full shrink-0 border-t hairline p-5 md:w-[360px] md:border-l md:border-t-0 md:p-8">
        <div className="flex items-center justify-between">
          <p className="display text-2xl">Make it yours</p>
          <button type="button" onClick={onClose} className="tap -mr-2 flex items-center justify-center" aria-label="Close 3D view">
            <X size={20} strokeWidth={1.4} />
          </button>
        </div>
        <p className="mono mt-5 text-taupe">Wood</p>
        <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto" role="radiogroup" aria-label="Wood">
          {product.woods.map((id) => {
            const w = woods.find((x) => x.id === id);
            return <Swatch key={id} label={w.name} color={w.hex} tint={w.tint} active={wood === id} onClick={() => setWood(id)} />;
          })}
        </div>
        {product.fabrics.length > 0 && (
          <>
            <p className="mono mt-5 text-taupe">Fabric</p>
            <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto" role="radiogroup" aria-label="Fabric">
              {product.fabrics.map((id) => {
                const f = fabrics.find((x) => x.id === id);
                return <Swatch key={id} label={f.name} color={f.hex} active={fabric === id} onClick={() => setFabric(id)} />;
              })}
            </div>
          </>
        )}
        {product.model === 'chair' && (
          <div className="mt-5 flex gap-2" role="radiogroup" aria-label="Size">
            {['single', 'wide'].map((s) => (
              <button key={s} type="button" role="radio" aria-checked={size === s} onClick={() => setSize(s)} className={`min-h-[44px] rounded-full border px-5 capitalize ${size === s ? 'border-espresso bg-espresso text-linen' : 'border-espresso/25'}`}>
                {s}
              </button>
            ))}
          </div>
        )}
        <button type="button" role="switch" aria-checked={dims} onClick={() => setDims((d) => !d)} className="btn-line mt-6 w-full">
          {dims ? 'Hide dimensions' : 'Show dimensions'}
        </button>
        <p className="mono mt-4 text-taupe">Real size: {formatDims(product.dims)}</p>
      </div>
    </div>
  );
}

function Pairs({ items }) {
  const wrap = useRef(null);
  const track = useRef(null);
  useEffect(() => {
    const [d] = Draggable.create(track.current, { type: 'x', bounds: wrap.current, inertia: true, edgeResistance: 0.85, dragClickables: true });
    return () => d.kill();
  }, []);
  return (
    <div ref={wrap} className="overflow-hidden" data-cursor="DRAG">
      <ul ref={track} className="flex w-max gap-6 px-[var(--gutter)] pb-2">
        {items.map((p) => (
          <li key={p.slug} className="w-[min(70vw,300px)] shrink-0">
            <TLink to={`/product/${p.slug}`} className="group block">
              <Img src={p.image} alt={p.name} className="aspect-[4/5] w-full rounded-t-[999px] bg-[#E6DED2]" imgClassName="transition-transform duration-700 ease-expo group-hover:scale-105" />
              <span className="display mt-3 block text-xl">{p.name}</span>
              <span className="font-mono text-[11px] text-taupe">{formatPrice(p.price)}</span>
            </TLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductBody({ product }) {
  const root = useRef(null);
  const title = useRef(null);
  const story = useRef(null);
  const firstImg = useRef(null);
  const [wood, setWood] = useState(product.woods[0]);
  const [fabric, setFabric] = useState(product.fabrics[0] || null);
  const [qty, setQty] = useState(1);
  const [viewer, setViewer] = useState(false);
  const add = useCart((s) => s.add);
  const price = priceFor(product, { wood, fabric });
  const maker = makers[product.maker];
  const w = woods.find((x) => x.id === wood);

  const gallery = useMemo(() => {
    const col = collections.find((c) => product.collections.includes(c.id));
    const room = rooms.find((r) => r.hotspots.some((h) => h.slug === product.slug)) || rooms[0];
    return [
      { src: product.image, alt: product.name, shape: 'arch', cls: 'aspect-[4/5] w-full md:w-[78%]', speed: 0.9 },
      { src: room.image, alt: `${product.name} at home: ${room.name}`, shape: 'rect', cls: 'aspect-[5/4] w-[88%] md:ml-auto md:w-[72%]', speed: 1.15 },
      { src: col ? col.image : rooms[1].image, alt: `${col?.name || 'The'} collection`, shape: 'rect', cls: 'aspect-[3/4] w-[70%] md:ml-[12%] md:w-[52%]', speed: 0.95 },
      { src: maker.image, alt: `${maker.name} at work`, shape: 'arch', cls: 'aspect-[3/4] w-[80%] ml-auto md:w-[58%]', speed: 1.2 },
    ];
  }, [product, maker]);

  const pairs = useMemo(() => {
    const same = products.filter((p) => p.slug !== product.slug && p.collections.some((c) => product.collections.includes(c)));
    const rest = products.filter((p) => p.slug !== product.slug && !same.includes(p));
    return [...same, ...rest].slice(0, 4);
  }, [product]);

  useGSAP(
    () => {
      flipChars(title.current, { trigger: false, delay: 0.15 });
      inkWords(story.current, { start: 'top 90%', end: 'bottom 60%' });
      initParallax(root.current);
    },
    { scope: root },
  );

  const specs = [
    ['Width', `${product.dims.w} cm`],
    ['Depth', `${product.dims.d} cm`],
    ['Height', `${product.dims.h} cm`],
    ...(product.dims.seat ? [['Seat height', `${product.dims.seat} cm`]] : []),
    ['Weight', `${product.weight} kg`],
    ['Wood', product.woods.map((id) => woods.find((x) => x.id === id).name).join(', ')],
    ['Finish', product.finish],
    ['Care', w.care],
  ];

  return (
    <div ref={root} className="pt-[calc(var(--nav-h)+5vh)]">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-[10vh] lg:col-span-7">
          {gallery.map((g, i) => (
            <div key={i} data-speed={g.speed} data-speed-mobile="off" ref={i === 0 ? firstImg : undefined}>
              <GLImage src={g.src} alt={g.alt} shape={g.shape} className={g.cls} eager={i === 0} />
            </div>
          ))}
        </div>

        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <TLink to={`/shop?c=${product.category}`} className="mono inline-flex min-h-[32px] items-center text-taupe hover:text-clay">
              {product.category}
            </TLink>
            <h1 ref={title} className="display mt-2 text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.95] tracking-[-0.02em]">
              {product.name}
            </h1>
            <p ref={story} className="mt-5 max-w-[46ch] text-[16px] leading-relaxed">
              {product.story}
            </p>
            <div className="mt-6">
              <RollingNumber value={price * qty} className="display text-[clamp(2rem,3vw,2.8rem)] leading-none" />
              {qty > 1 && <span className="mono ml-3 text-taupe">{formatPrice(price)} each</span>}
            </div>
            <div className="mt-6 border-t hairline pt-4">
              <p className="mono flex justify-between text-taupe">
                <span>Wood</span>
                <span className="text-espresso">{w.name}</span>
              </p>
              <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto" role="radiogroup" aria-label="Wood">
                {product.woods.map((id) => {
                  const x = woods.find((y) => y.id === id);
                  return <Swatch key={id} label={x.name} color={x.hex} tint={x.tint} active={wood === id} onClick={() => setWood(id)} />;
                })}
              </div>
            </div>
            {product.fabrics.length > 0 && (
              <div className="mt-4 border-t hairline pt-4">
                <p className="mono flex justify-between text-taupe">
                  <span>Fabric</span>
                  <span className="text-espresso">{fabrics.find((f) => f.id === fabric)?.name}</span>
                </p>
                <div className="no-scrollbar mt-2 flex gap-1 overflow-x-auto" role="radiogroup" aria-label="Fabric">
                  {product.fabrics.map((id) => {
                    const f = fabrics.find((y) => y.id === id);
                    return <Swatch key={id} label={f.name} color={f.hex} active={fabric === id} onClick={() => setFabric(id)} />;
                  })}
                </div>
              </div>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t hairline pt-6">
              <div className="inline-flex items-center rounded-full border border-espresso/25">
                <button type="button" className="tap flex items-center justify-center" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="One fewer">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-mono" aria-live="polite">
                  {qty}
                </span>
                <button type="button" className="tap flex items-center justify-center" onClick={() => setQty((q) => q + 1)} aria-label="One more">
                  <Plus size={14} />
                </button>
              </div>
              <button
                type="button"
                className="btn-clay flex-1"
                onClick={() => flyToCart({ from: firstImg.current, src: product.image, done: () => add(product.slug, { wood, fabric, qty }) })}
              >
                Add to cart
              </button>
              <button type="button" className="btn-line w-full" onClick={() => setViewer(true)} data-cursor="ROTATE">
                <Box size={16} strokeWidth={1.4} /> See it in 3D
              </button>
            </div>
            <p className="mono mt-5 text-espresso">{product.leadTime}</p>
            <p className="mono mt-1 text-taupe">{brand.deliveryNote}</p>
          </div>
        </aside>
      </div>

      <section className="wrap mt-[16vh] grid gap-10 md:grid-cols-12" aria-label="Specifications">
        <h2 className="display text-section md:col-span-4">
          The <i>details</i>
        </h2>
        <dl className="font-mono text-[12px] uppercase tracking-[0.12em] md:col-span-7 md:col-start-6">
          {specs.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 border-t hairline py-3.5 last:border-b">
              <dt className="text-taupe">{k}</dt>
              <dd className={k === 'Care' || k === 'Finish' ? 'normal-case tracking-normal font-sans text-[14px]' : ''}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="wrap mt-[16vh] grid items-end gap-10 md:grid-cols-12" aria-label="Made by">
        <div className="md:col-span-4">
          <Img src={maker.image} alt={`${maker.name}, ${maker.role}`} className="aspect-[3/4] w-[70%] rounded-t-[999px] bg-[#E6DED2] md:w-full" />
        </div>
        <div className="md:col-span-6 md:col-start-6">
          <p className="mono text-taupe">Made by</p>
          <p className="display mt-3 text-[clamp(2rem,4vw,3.6rem)] leading-none">{maker.name}</p>
          <p className="mono mt-2 text-taupe">{maker.role}</p>
          <p className="display mt-6 max-w-[38ch] text-[clamp(1.2rem,1.8vw,1.6rem)] italic leading-snug">{maker.note}</p>
        </div>
      </section>

      <section className="mt-[16vh] pb-[12vh]" aria-label="Pairs well with">
        <div className="wrap mb-8 flex items-end justify-between">
          <h2 className="display text-[clamp(2rem,4vw,3.4rem)]">
            Pairs well <i>with</i>
          </h2>
          <span className="mono hidden text-taupe sm:block">Drag</span>
        </div>
        <Pairs items={pairs} />
      </section>

      {viewer && <Viewer product={product} wood={wood} setWood={setWood} fabric={fabric} setFabric={setFabric} onClose={() => setViewer(false)} />}
    </div>
  );
}

export default function Product() {
  const { slug } = useParams();
  const product = bySlug[slug];
  if (!product) return <NotFound />;
  return <ProductBody key={slug} product={product} />;
}

