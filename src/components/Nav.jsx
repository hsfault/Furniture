import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TLink } from './DoorTransition.jsx';
import SoundToggle from './SoundToggle.jsx';
import { useUI } from '../store/ui.js';
import { useCart, cartCount } from '../store/cart.js';
import { nav } from '../data/brand.js';
import { gsap } from '../lib/gsap.js';
import { playClick } from '../lib/sound.js';

function Roll({ children }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

export default function Nav() {
  const { pathname } = useLocation();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const filmPlaying = useUI((s) => s.filmPlaying);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenu = useUI((s) => s.setMenu);
  const setCart = useUI((s) => s.setCart);
  const bump = useUI((s) => s.cartBump);
  const count = useCart(cartCount);
  const badge = useRef(null);
  const last = useRef(0);

  useEffect(() => {
    const onScroll = (y) => {
      setSolid(y > 100);
      const dy = y - last.current;
      if (Math.abs(dy) > 6) setHidden(dy > 0 && y > 240);
      last.current = y;
    };
    // Lenis drives native scroll, so plain scroll events see every frame.
    const handler = () => onScroll(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setHidden(false);
  }, [pathname]);

  useEffect(() => {
    if (!bump || !badge.current) return;
    gsap.fromTo(badge.current, { scale: 1.7 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
  }, [bump]);

  const hide = (hidden && !menuOpen) || filmPlaying;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[60] transition-[transform,background-color] duration-500 ease-inout4 ${
        hide ? '-translate-y-full' : 'translate-y-0'
      } ${solid && !menuOpen ? 'bg-plaster/95 shadow-[0_1px_0_rgba(184,147,90,0.35)]' : 'bg-transparent'}`}
    >
      <nav className={`wrap flex h-[var(--nav-h)] items-center justify-between ${menuOpen ? 'text-linen' : 'text-espresso'}`} aria-label="Main">
        <TLink to="/" className="tap display flex items-center text-[22px] tracking-[0.2em]" aria-label="TAAQ, home">
          TAAQ
        </TLink>
        <div className="flex items-center gap-1 sm:gap-3">
          <ul className="hidden items-center gap-7 lg:flex">
            {nav.map((l) => (
              <li key={l.label}>
                <TLink to={l.to} className="roll-host tap inline-flex items-center text-[15px]">
                  <Roll>{l.label}</Roll>
                </TLink>
              </li>
            ))}
          </ul>
          <button
            id="cart-target"
            type="button"
            onClick={() => {
              playClick();
              setCart(true);
            }}
            className="roll-host tap inline-flex items-center gap-2 px-2 text-[15px] lg:ml-4"
            aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
          >
            <Roll>Cart</Roll>
            <span ref={badge} className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-clay px-1.5 font-mono text-[11px] text-linen">
              {count}
            </span>
          </button>
          <SoundToggle dark={menuOpen} className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={() => {
              playClick();
              setMenu(!menuOpen);
            }}
            className="roll-host tap inline-flex items-center gap-3 pl-2 text-[15px]"
            aria-expanded={menuOpen}
            aria-controls="drawer-menu"
          >
            <span className="hidden sm:inline">
              <Roll>{menuOpen ? 'Close' : 'Menu'}</Roll>
            </span>
            <span className="relative block h-3 w-6" aria-hidden="true">
              <span className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
              <span className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ${menuOpen ? '-translate-y-[5px] -rotate-45' : ''}`} />
            </span>
            <span className="sr-only sm:hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
