import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap.js';
import { getLenis } from '../lib/lenis.js';
import { reducedMotion, finePointer } from '../lib/env.js';
import { playClick } from '../lib/sound.js';
import { useUI } from '../store/ui.js';
import { menuDrawers, brand } from '../data/brand.js';
import { go } from './DoorTransition.jsx';
import { useFocusTrap } from './useFocusTrap.js';

const WOOD = "url('/textures/wood-walnut.jpg')";

function Drawer({ item, index, onPick, setRef }) {
  const [missing, setMissing] = useState(false);
  return (
    <li
      ref={setRef}
      className="drawer group relative flex-1"
      style={{ transformStyle: 'preserve-3d', zIndex: 5 - index }}
    >
      {/* the contents: a page preview that rises out of the drawer's top edge */}
      {finePointer && (
        <div className="pointer-events-none absolute bottom-[calc(100%-6px)] right-[22%] hidden h-[24vh] w-[min(18vw,280px)] overflow-hidden md:block" aria-hidden="true">
          <div className={`drawer-preview absolute inset-0 translate-y-full overflow-hidden rounded-t-[999px] transition-transform duration-700 ease-expo group-hover:translate-y-0 ${missing ? 'img-missing' : ''}`}>
            <img src={item.preview} alt="" onError={() => setMissing(true)} className="h-full w-full object-cover" />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => onPick(item)}
        className="drawer-front relative flex h-full w-full items-center justify-between overflow-hidden px-[var(--gutter)] text-left text-[#F1E4CF] transition-[transform,box-shadow] duration-500 ease-expo group-hover:[transform:translateZ(46px)_scale(1.03)] group-focus-visible:[transform:translateZ(46px)_scale(1.03)]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(255,255,255,.07), rgba(0,0,0,.18) 92%, rgba(0,0,0,.35)), ${WOOD}, linear-gradient(100deg, #5e3d27, #4a2f1e 40%, #6a452c 70%, #4d311f)`,
          backgroundSize: 'cover, 900px auto, cover',
          boxShadow: 'inset 0 1px 0 rgba(255,235,200,.18), inset 0 -2px 0 rgba(0,0,0,.35), 0 2px 0 #1d120b',
        }}
        data-cursor="OPEN"
      >
        <span className="flex items-baseline gap-4 md:gap-8">
          <span className="mono text-brass">{item.note}</span>
          <span className="display text-[clamp(2.2rem,7vw,7.5rem)] leading-none tracking-[-0.02em]">{item.label}</span>
        </span>
        {/* brass pull */}
        <span className="relative mr-[6%] block h-4 w-24 md:w-36" aria-hidden="true">
          <span className="absolute inset-x-3 top-1/2 h-[7px] -translate-y-1/2 rounded-full" style={{ background: 'linear-gradient(180deg,#f0d6a0,#b8935a 55%,#7a5a2e)', boxShadow: '0 3px 5px rgba(0,0,0,.45)' }} />
          <span className="absolute left-0 top-0 h-4 w-4 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%,#f0d6a0,#9c7843)' }} />
          <span className="absolute right-0 top-0 h-4 w-4 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%,#f0d6a0,#9c7843)' }} />
        </span>
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ boxShadow: '0 40px 60px -20px rgba(0,0,0,.65)' }} />
      </button>
    </li>
  );
}

export default function DrawerMenu() {
  const open = useUI((s) => s.menuOpen);
  const setMenu = useUI((s) => s.setMenu);
  const root = useRef(null);
  const drawers = useRef([]);
  const [visible, setVisible] = useState(false);
  useFocusTrap(root, open, () => setMenu(false));

  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      setVisible(true);
      lenis?.stop();
    } else lenis?.start();
  }, [open]);

  useEffect(() => {
    if (!visible) return undefined;
    const els = drawers.current.filter(Boolean);
    const ctx = gsap.context(() => {
      if (open) {
        gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' });
        if (!reducedMotion) {
          gsap.fromTo(
            els,
            { xPercent: (i) => (i % 2 ? 110 : -110) },
            { xPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.07, delay: 0.05 },
          );
        }
      } else {
        gsap
          .timeline({ onComplete: () => setVisible(false) })
          .to(els, { xPercent: (i) => (i % 2 ? 110 : -110), duration: reducedMotion ? 0.01 : 0.55, ease: 'power4.in', stagger: 0.04 })
          .to(root.current, { opacity: 0, duration: 0.2 }, '-=0.15');
      }
    }, root);
    return () => ctx.kill();
  }, [open, visible]);

  const pick = (item) => {
    playClick();
    setMenu(false);
    setTimeout(() => go(item.to), reducedMotion ? 0 : 420);
  };

  if (!visible) return null;
  return (
    <div
      id="drawer-menu"
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[55] flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#3b2618,#24160d)' }}
    >
      <div className="h-[var(--nav-h)] shrink-0" />
      <ul className="flex flex-1 flex-col gap-[6px] px-2 pb-2 md:px-4" style={{ perspective: '1200px' }}>
        {menuDrawers.map((item, i) => (
          <Drawer key={item.label} item={item} index={i} onPick={pick} setRef={(el) => (drawers.current[i] = el)} />
        ))}
      </ul>
      <div className="wrap mono flex shrink-0 flex-wrap justify-between gap-2 py-3 text-[#cdb79a]">
        <span>
          {brand.showroom.line1}, {brand.showroom.line2}
        </span>
        <a href={brand.phoneHref} className="tap inline-flex items-center">
          {brand.phone}
        </a>
      </div>
    </div>
  );
}
