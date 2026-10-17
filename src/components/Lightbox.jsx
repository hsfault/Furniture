import { useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { gsap, Flip } from '../lib/gsap.js';
import { getLenis } from '../lib/lenis.js';
import { reducedMotion } from '../lib/env.js';
import { bySlug } from '../data/products.js';
import { formatPrice } from '../lib/format.js';
import { go } from './DoorTransition.jsx';
import { useFocusTrap } from './useFocusTrap.js';
import Img from './Img.jsx';

/**
 * A room photo opened from its exact spot in the collage (GSAP Flip), with
 * pulsing brass hotspots on the furniture.
 */
export default function Lightbox({ room, from, onClose }) {
  const root = useRef(null);
  const frame = useRef(null);
  const [tag, setTag] = useState(null);
  const closing = useRef(false);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    setTag(null);
    const tl = gsap.timeline({
      onComplete: () => {
        getLenis()?.start();
        onClose();
      },
    });
    tl.to(root.current.querySelectorAll('.lb-ui'), { opacity: 0, duration: 0.2 }, 0);
    if (from && from.isConnected && !reducedMotion) {
      tl.add(Flip.fit(frame.current, from, { duration: 0.75, ease: 'power4.inOut', scale: true }), 0.05);
    }
    tl.to(root.current.firstChild, { opacity: 0, duration: 0.4 }, 0.2);
  };
  useFocusTrap(root, true, close);

  useLayoutEffect(() => {
    getLenis()?.stop();
    if (from && !reducedMotion) {
      from.setAttribute('data-flip-id', 'room-lb');
      const state = Flip.getState(from);
      from.removeAttribute('data-flip-id');
      Flip.from(state, { targets: frame.current, duration: 0.95, ease: 'power4.inOut', scale: true });
    }
    gsap.fromTo(root.current.firstChild, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    gsap.from(root.current.querySelectorAll('.lb-ui'), { opacity: 0, y: 10, stagger: 0.06, delay: 0.7, duration: 0.6 });
  }, [from]);

  return (
    <div ref={root} className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-10" role="dialog" aria-modal="true" aria-label={room.name}>
      <div className="absolute inset-0 bg-espresso/80 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-[min(1200px,calc((100svh_-_9rem)_*_var(--r)))]" style={{ '--r': room.ratio }}>
        <div ref={frame} data-flip-id="room-lb" className="relative w-full" style={{ aspectRatio: room.ratio }}>
          <Img src={room.image} alt={room.name} className={`absolute inset-0 ${room.shape === 'arch' ? 'rounded-t-[999px]' : 'rounded-sm'}`} eager />
          {room.hotspots.map((h) => {
            const p = bySlug[h.slug];
            const open = tag === h.slug;
            return (
              <div key={h.slug} className="lb-ui absolute" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
                <button
                  type="button"
                  className="hotspot relative -ml-[22px] -mt-[22px] flex h-11 w-11 items-center justify-center rounded-full"
                  onClick={() => setTag(open ? null : h.slug)}
                  aria-expanded={open}
                  aria-label={`${p.name}, ${formatPrice(p.price)}`}
                >
                  <span className="relative block h-3 w-3 rounded-full bg-brass ring-4 ring-brass/30" />
                </button>
                {open && (
                  <div className="absolute left-4 top-4 z-10 w-56 rounded-sm bg-linen p-4 text-espresso shadow-drawer">
                    <p className="display text-xl leading-tight">{p.name}</p>
                    <p className="mono mt-1 text-taupe">{formatPrice(p.price)}</p>
                    <button type="button" className="uline mono mt-1 text-clay" onClick={() => go(`/product/${p.slug}`)}>
                      View →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="lb-ui mt-4 flex items-center justify-between text-linen">
          <div>
            <p className="display text-2xl">{room.name}</p>
            <p className="mono text-linen/60">{room.products.join(' · ')}</p>
          </div>
          <button type="button" onClick={close} className="tap flex items-center justify-center rounded-full border border-linen/30" aria-label="Close">
            <X size={20} strokeWidth={1.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
