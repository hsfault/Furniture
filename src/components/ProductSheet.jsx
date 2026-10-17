import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { gsap, Flip } from '../lib/gsap.js';
import { getLenis } from '../lib/lenis.js';
import { reducedMotion } from '../lib/env.js';
import { useUI } from '../store/ui.js';
import { useCart, priceFor } from '../store/cart.js';
import { bySlug } from '../data/products.js';
import { woods } from '../data/brand.js';
import { formatDims } from '../lib/format.js';
import { flyToCart } from '../lib/flyToCart.js';
import { go } from './DoorTransition.jsx';
import { useFocusTrap } from './useFocusTrap.js';
import RollingNumber from './RollingNumber.jsx';
import Img from './Img.jsx';

/** Side sheet for a product. The clicked picture morphs into it with Flip. */
export default function ProductSheet() {
  const sheet = useUI((s) => s.sheet);
  const close = useUI((s) => s.closeSheet);
  const add = useCart((s) => s.add);
  const [current, setCurrent] = useState(null);
  const [wood, setWood] = useState(null);
  const root = useRef(null);
  const panel = useRef(null);
  const media = useRef(null);
  const flipState = useRef(null);
  useFocusTrap(root, !!sheet, close);

  // Capture the source picture's position before the sheet renders.
  useLayoutEffect(() => {
    if (sheet) {
      const product = bySlug[sheet.slug];
      if (sheet.from && !reducedMotion) {
        sheet.from.setAttribute('data-flip-id', 'sheet-media');
        flipState.current = Flip.getState(sheet.from);
        sheet.from.removeAttribute('data-flip-id');
      } else flipState.current = null;
      setCurrent({ product, from: sheet.from });
      setWood(product.woods[0]);
      getLenis()?.stop();
    }
  }, [sheet]);

  useLayoutEffect(() => {
    if (!current || !sheet) return;
    gsap.fromTo(root.current.firstChild, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: reducedMotion ? 0.01 : 0.8, ease: 'power4.out' });
    if (flipState.current) {
      Flip.from(flipState.current, { targets: media.current, duration: 0.9, ease: 'power4.inOut', scale: true, absolute: true, zIndex: 90 });
    }
    gsap.from(panel.current.querySelectorAll('.sheet-line'), { opacity: 0, y: 16, stagger: 0.05, delay: 0.35, duration: 0.8 });
  }, [current, sheet]);

  useEffect(() => {
    if (sheet || !current) return;
    getLenis()?.start();
    const tl = gsap.timeline({ onComplete: () => setCurrent(null) });
    tl.to(panel.current, { xPercent: 100, duration: reducedMotion ? 0.01 : 0.55, ease: 'power4.in' });
    tl.to(root.current.firstChild, { opacity: 0, duration: 0.3 }, 0.2);
  }, [sheet, current]);

  if (!current) return null;
  const { product } = current;
  const price = priceFor(product, { wood });
  const addToCart = () => {
    flyToCart({ from: media.current, src: product.image, done: () => add(product.slug, { wood }) });
  };

  return (
    <div ref={root} className="fixed inset-0 z-[85]" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="absolute inset-0 bg-espresso/40" onClick={close} />
      <aside ref={panel} className="paper absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto sm:w-[min(520px,92vw)]" data-lenis-prevent>
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="mono text-taupe">{product.category}</span>
          <button type="button" onClick={close} className="tap -mr-2 flex items-center justify-center" aria-label="Close">
            <X size={20} strokeWidth={1.4} />
          </button>
        </div>
        <div className="px-6 pt-4">
          <div ref={media} data-flip-id="sheet-media" className="relative">
            <Img src={product.image} alt={product.name} className="aspect-[4/5] w-full rounded-t-[999px] bg-plaster shadow-niche" eager />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-5 px-6 pb-8 pt-6">
          <h2 className="sheet-line display text-4xl leading-none">{product.name}</h2>
          <p className="sheet-line mono text-taupe">{formatDims(product.dims)}</p>
          <p className="sheet-line text-[15px] leading-relaxed text-espresso/80">{product.story}</p>
          <div className="sheet-line">
            <p className="mono mb-3 text-taupe">Wood</p>
            <div className="flex gap-2" role="radiogroup" aria-label="Wood">
              {product.woods.map((id) => {
                const w = woods.find((x) => x.id === id);
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={wood === id}
                    onClick={() => setWood(id)}
                    className={`tap flex items-center justify-center rounded-full border ${wood === id ? 'border-clay' : 'border-transparent'}`}
                    aria-label={w.name}
                    title={w.name}
                  >
                    <span className="block h-8 w-8 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.15)]" style={{ background: `linear-gradient(135deg, ${w.tint}, ${w.hex})` }} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="sheet-line flex items-end justify-between border-t hairline pt-5">
            <RollingNumber value={price} className="display text-3xl" />
            <span className="mono text-taupe">{product.leadTime}</span>
          </div>
          <div className="sheet-line mt-auto flex flex-wrap gap-3">
            <button type="button" className="btn-clay flex-1" onClick={addToCart}>
              Add to cart
            </button>
            <button type="button" className="btn-line flex-1" onClick={() => go(`/product/${product.slug}`)}>
              View piece
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
