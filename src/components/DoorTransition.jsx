import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap, ScrollTrigger } from '../lib/gsap.js';
import { getLenis, scrollToTop, scrollToId } from '../lib/lenis.js';
import { reducedMotion } from '../lib/env.js';
import { useUI } from '../store/ui.js';
import { bySlug } from '../data/products.js';

let runTransition = null;

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

export function labelFor(to) {
  const [path, hash] = to.split('#');
  if (hash) {
    return { collections: 'The Collections', atelier: 'The Atelier', visit: 'Visit', homes: 'Homes', configure: 'Make It Yours' }[hash] || 'Home';
  }
  if (path === '/' || path === '') return 'Home';
  if (path.startsWith('/shop')) return 'The Collection';
  if (path.startsWith('/product/')) return bySlug[path.split('/')[2]]?.name || 'The Piece';
  if (path.startsWith('/checkout')) return 'Checkout';
  if (path.startsWith('/order')) return 'Thank you';
  return 'TAAQ';
}

/** Navigate through the wardrobe doors. Same-page hash links just glide. */
export function go(to) {
  if (runTransition) runTransition(to);
}

export function TLink({ to, children, onClick, ...rest }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

function Door({ side, innerRef }) {
  const left = side === 'left';
  return (
    <div
      ref={innerRef}
      className={`absolute top-0 h-full w-1/2 ${left ? 'left-0' : 'right-0'}`}
      style={{
        visibility: 'hidden',
        // Dark walnut doors so the destination name (in linen) always reads.
        background:
          'repeating-linear-gradient(92deg, rgba(255,235,200,.035) 0 2px, transparent 2px 11px), linear-gradient(100deg, #3b2618, #2e1d12 45%, #3a2517 75%, #26170e)',
        boxShadow: left ? '18px 0 40px -20px rgba(0,0,0,.6)' : '-18px 0 40px -20px rgba(0,0,0,.6)',
      }}
    >
      <div className={`absolute inset-y-[6%] ${left ? 'left-[10%] right-[8%]' : 'left-[8%] right-[10%]'} border border-brass/35`} />
      <div className={`absolute top-0 h-full w-[3px] bg-brass/70 ${left ? 'right-0' : 'left-0'}`} />
      <div
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full ${left ? 'right-5' : 'left-5'}`}
        style={{ background: 'radial-gradient(circle at 35% 35%, #e7c98f, #b8935a 55%, #7d5f33)', boxShadow: '0 2px 4px rgba(42,29,21,.4)' }}
      />
    </div>
  );
}

export default function DoorTransition() {
  const navigate = useNavigate();
  const location = useLocation();
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const labelRef = useRef(null);
  const [label, setLabel] = useState('');
  const busy = useRef(false);
  const internal = useRef(false);

  useEffect(() => {
    runTransition = async (to) => {
      if (busy.current) return;
      const [path, hash] = to.split('#');
      const targetPath = path || '/';
      useUI.getState().setMenu(false);
      useUI.getState().setCart(false);
      useUI.getState().closeSheet();
      if (targetPath === location.pathname && !to.includes('?')) {
        if (hash) scrollToId(hash);
        else getLenis()?.scrollTo(0, { duration: 1.4 });
        return;
      }
      busy.current = true;
      internal.current = true;
      setLabel(labelFor(to));
      const d = reducedMotion ? 0.01 : 0.7;
      const doors = [leftRef.current, rightRef.current];
      await gsap
        .timeline()
        .set(doors, { visibility: 'visible' })
        .to(leftRef.current, { xPercent: 0, x: 0, duration: d, ease: 'power4.inOut' }, 0)
        .to(rightRef.current, { xPercent: 0, x: 0, duration: d, ease: 'power4.inOut' }, 0)
        .fromTo(labelRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' }, d * 0.7);
      useUI.getState().setDoors(true);
      navigate(to);
      await nextFrame();
      scrollToTop();
      await nextFrame();
      ScrollTrigger.refresh();
      if (hash) scrollToId(hash, true);
      await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 220));
      await gsap
        .timeline()
        .to(labelRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0)
        .to(leftRef.current, { xPercent: -101, duration: d, ease: 'power4.inOut' }, 0.1)
        .to(rightRef.current, { xPercent: 101, duration: d, ease: 'power4.inOut' }, 0.1)
        .set(doors, { visibility: 'hidden' });
      useUI.getState().setDoors(false);
      busy.current = false;
    };
    return () => {
      runTransition = null;
    };
  }, [navigate, location.pathname]);

  // Back/forward navigation: no doors, just start the new page at the top.
  useEffect(() => {
    if (internal.current) {
      internal.current = false;
      return;
    }
    scrollToTop();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [location.pathname]);

  useEffect(() => {
    gsap.set(leftRef.current, { xPercent: -101, x: 0, visibility: 'hidden' });
    gsap.set(rightRef.current, { xPercent: 101, x: 0, visibility: 'hidden' });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[150]" aria-hidden="true">
      <Door side="left" innerRef={leftRef} />
      <Door side="right" innerRef={rightRef} />
      {/* centring lives on the wrapper so GSAP can animate the inner y freely */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div ref={labelRef} className="rounded-sm bg-night/90 px-7 py-4 text-center opacity-0 shadow-[0_20px_40px_-16px_rgba(0,0,0,.7)] ring-1 ring-brass/40">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brass">Next room</p>
          <p className="display mt-1 whitespace-nowrap text-[clamp(1.6rem,4vw,3rem)] italic leading-tight text-linen">{label}</p>
        </div>
      </div>
    </div>
  );
}
