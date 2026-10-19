import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { gsap } from '../lib/gsap.js';
import { getLenis } from '../lib/lenis.js';
import { reducedMotion } from '../lib/env.js';
import { slide, whoosh } from '../lib/sound.js';
import { useUI } from '../store/ui.js';
import { useCart, cartSubtotal, cartCount } from '../store/cart.js';
import { woods, fabrics } from '../data/brand.js';
import { formatPrice } from '../lib/format.js';
import { go } from './DoorTransition.jsx';
import { useFocusTrap } from './useFocusTrap.js';
import Img from './Img.jsx';

const name = (list, id) => list.find((x) => x.id === id)?.name;

function Line({ item }) {
  const row = useRef(null);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const drop = () => {
    whoosh(0.6, 0.35, false);
    gsap.to(row.current, {
      height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0,
      duration: reducedMotion ? 0.01 : 0.5, ease: 'power4.inOut',
      onComplete: () => remove(item.key),
    });
  };
  const detail = [name(woods, item.wood), name(fabrics, item.fabric), item.size === 'wide' ? 'Wide' : null].filter(Boolean).join(' · ');
  return (
    <li ref={row} className="grid grid-cols-[72px_1fr_auto] items-start gap-4 overflow-hidden border-b hairline py-5 sm:grid-cols-[96px_1fr_auto]">
      <Img src={item.image} alt={item.name} className="aspect-[4/5] rounded-t-[999px] bg-plaster" />
      <div className="min-w-0">
        <p className="display text-xl leading-tight">{item.name}</p>
        <p className="mono mt-1 text-taupe">{detail}</p>
        <div className="mt-3 inline-flex items-center rounded-full border border-espresso/20">
          <button type="button" className="tap flex items-center justify-center" onClick={() => setQty(item.key, item.qty - 1)} aria-label={`One fewer ${item.name}`}>
            <Minus size={14} />
          </button>
          <span className="w-6 text-center font-mono text-sm" aria-live="polite">{item.qty}</span>
          <button type="button" className="tap flex items-center justify-center" onClick={() => setQty(item.key, item.qty + 1)} aria-label={`One more ${item.name}`}>
            <Plus size={14} />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-mono text-sm">{formatPrice(item.price * item.qty)}</span>
        <button type="button" onClick={drop} className="mono tap -mr-2 inline-flex items-center justify-end px-2 text-taupe underline-offset-4 hover:text-clay hover:underline">
          Remove
        </button>
      </div>
    </li>
  );
}

export default function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setCart = useUI((s) => s.setCart);
  const items = useCart((s) => s.items);
  const subtotal = useCart(cartSubtotal);
  const count = useCart(cartCount);
  const [mounted, setMounted] = useState(false);
  const panel = useRef(null);
  const backdrop = useRef(null);
  useFocusTrap(panel, open, () => setCart(false));

  useEffect(() => {
    if (open) {
      setMounted(true);
      slide(1, true);
      getLenis()?.stop();
    } else if (mounted) {
      slide(0.8, false);
      getLenis()?.start();
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return undefined;
    const d = reducedMotion ? 0.01 : 0.85;
    const ctx = gsap.context(() => {
      if (open) {
        gsap.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
        gsap.fromTo(panel.current, { yPercent: 100 }, { yPercent: 0, duration: d, ease: 'power4.out' });
      } else {
        gsap.to(backdrop.current, { opacity: 0, duration: 0.4 });
        gsap.to(panel.current, { yPercent: 100, duration: d * 0.7, ease: 'power4.in', onComplete: () => setMounted(false) });
      }
    });
    return () => ctx.kill();
  }, [open, mounted]);

  if (!mounted) return null;
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Your cart">
      <div ref={backdrop} className="absolute inset-0 bg-espresso/60" onClick={() => setCart(false)} />
      <div ref={panel} className="absolute inset-x-0 bottom-0 flex h-[100svh] flex-col md:inset-x-[max(2rem,calc((100vw-1100px)/2))] md:h-[70vh]">
        {/* the drawer front */}
        <div
          className="relative flex h-20 shrink-0 items-center justify-between px-6 text-[#F1E4CF] md:rounded-t-[14px]"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(255,255,255,.08), rgba(0,0,0,.25)), url('/textures/wood-walnut.jpg'), linear-gradient(100deg,#5e3d27,#4a2f1e 40%,#6a452c 70%,#4d311f)",
            backgroundSize: 'cover, 700px auto, cover',
            boxShadow: '0 -20px 40px -20px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,235,200,.2)',
          }}
        >
          <p className="display text-2xl">
            Your drawer <span className="font-mono text-sm text-brass">({count})</span>
          </p>
          <span className="absolute left-1/2 top-1/2 h-[7px] w-28 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: 'linear-gradient(180deg,#f0d6a0,#b8935a 55%,#7a5a2e)', boxShadow: '0 3px 5px rgba(0,0,0,.45)' }} aria-hidden="true" />
          <button type="button" onClick={() => setCart(false)} className="tap -mr-2 flex items-center justify-center" aria-label="Close cart">
            <X size={20} strokeWidth={1.4} />
          </button>
        </div>
        <div className="paper flex min-h-0 flex-1 flex-col shadow-niche">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
              <p className="display text-3xl">An empty drawer, <i>for now</i>.</p>
              <button type="button" className="btn-clay" onClick={() => go('/shop')}>
                Browse the collection
              </button>
            </div>
          ) : (
            <>
              <ul className="min-h-0 flex-1 overflow-y-auto px-6" data-lenis-prevent>
                {items.map((it) => (
                  <Line key={it.key} item={it} />
                ))}
              </ul>
              <div className="flex flex-col gap-4 border-t hairline px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mono text-taupe">Subtotal</p>
                  <p className="display text-3xl">{formatPrice(subtotal)}</p>
                </div>
                <button type="button" className="btn-clay" onClick={() => go('/checkout')}>
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
