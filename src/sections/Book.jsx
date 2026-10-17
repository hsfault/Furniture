import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { gsap } from '../lib/gsap.js';
import { getLenis } from '../lib/lenis.js';
import { reducedMotion } from '../lib/env.js';
import { playClick, playRustle } from '../lib/sound.js';
import { flyToCart } from '../lib/flyToCart.js';
import { useCart } from '../store/cart.js';
import { useFocusTrap } from '../components/useFocusTrap.js';
import { Page, Verso, InsideCover, CoverFront, PAGES } from './BookPage.jsx';

function bookSize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spread = vw >= 1024;
  let H = Math.min(vh * 0.76, 640);
  let W = H * 0.7;
  if (spread && W * 2 + 120 > vw) {
    W = (vw - 120) / 2;
    H = W / 0.7;
  }
  if (!spread) {
    W = Math.min(vw * 0.88, W, 440);
    H = Math.min(W / 0.7, vh * 0.74);
    W = Math.min(W, H * 0.78);
  }
  return { W, H, spread };
}

const face = 'absolute inset-0 backface-hidden overflow-hidden';
const leftFor = (col, n) => (n <= 1 ? <InsideCover col={col} /> : <Verso col={col} n={n - 1} />);

/**
 * A cloth-bound book that flies off the shelf, turns its cover to you, opens,
 * and has real turning pages. Built from CSS 3D faces (preserve-3d).
 */
export default function Book({ col, spine, onClosed }) {
  const [{ W, H, spread }] = useState(bookSize);
  const T = Math.max(18, col.thickness * (H / col.height));
  const [page, setPage] = useState(1);
  const [turn, setTurn] = useState(null);
  const root = useRef(null);
  const backdrop = useRef(null);
  const book = useRef(null);
  const cover = useRef(null);
  const leaf = useRef(null);
  const shade = useRef(null);
  const right = useRef(null);
  const tl = useRef(null);
  const closing = useRef(false);
  const add = useCart((s) => s.add);

  const close = () => {
    if (closing.current || !tl.current) return;
    closing.current = true;
    playClick();
    setTurn(null);
    setPage(1);
    requestAnimationFrame(() => {
      const t = tl.current;
      t.eventCallback('onReverseComplete', () => {
        spine.style.visibility = '';
        getLenis()?.start();
        onClosed();
      });
      t.timeScale(1.6).reverse();
    });
  };
  useFocusTrap(root, true, close);

  useLayoutEffect(() => {
    getLenis()?.stop();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const sr = spine.getBoundingClientRect();
    const originX = vw / 2 - W / 2;
    const originY = vh / 2;
    gsap.set(book.current, {
      x: sr.left + sr.width / 2 - originX,
      y: sr.top + sr.height / 2 - originY,
      scale: sr.height / H,
      rotationY: 90,
      transformOrigin: '0% 50%',
    });
    gsap.set(cover.current, { z: T / 2, rotationY: 0, transformOrigin: '0% 50%' });
    spine.style.visibility = 'hidden';
    const d = reducedMotion ? 0.01 : 1;
    const t = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    t.to(backdrop.current, { opacity: 1, duration: 0.45 * d, ease: 'power1.out' }, 0);
    t.to(book.current, { x: 0, y: 0, scale: 1, rotationY: 0, duration: 0.95 * d }, 0.08);
    if (spread) t.to(book.current, { x: W / 2, duration: 0.6 * d }, '>-0.05');
    t.to(cover.current, { rotationY: -178, duration: 1.05 * d }, spread ? '>-0.2' : '>');
    t.fromTo(right.current.querySelectorAll('.bp-line'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.6 * d, ease: 'expo.out' }, '>-0.45');
    t.fromTo(root.current.querySelectorAll('.book-ui'), { opacity: 0 }, { opacity: 1, duration: 0.4 * d }, '<');
    tl.current = t;
    return () => t.kill();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const turnTo = (dir) => {
    if (turn || closing.current) return;
    const to = page + dir;
    if (to < 1 || to > PAGES) return;
    playRustle();
    setTurn({ from: page, to, dir });
  };

  useLayoutEffect(() => {
    if (!turn || !leaf.current) return undefined;
    const from = turn.dir > 0 ? 0 : -176;
    const to = turn.dir > 0 ? -176 : 0;
    gsap.set(leaf.current, { z: T / 2 - 0.5, transformOrigin: '0% 50%' });
    const tw = gsap.fromTo(
      leaf.current,
      { rotationY: from },
      {
        rotationY: to,
        duration: reducedMotion ? 0.01 : 0.85,
        ease: 'power2.inOut',
        onUpdate() {
          const k = this.progress();
          if (shade.current) {
            shade.current.style.opacity = String(Math.sin(k * Math.PI) * 0.55);
            shade.current.style.backgroundPosition = `${100 - k * 100}% 0`;
          }
        },
        onComplete: () => {
          setPage(turn.to);
          setTurn(null);
        },
      },
    );
    return () => tw.kill();
  }, [turn, T]);

  const onKey = (e) => {
    if (e.key === 'ArrowRight') turnTo(1);
    if (e.key === 'ArrowLeft') turnTo(-1);
  };

  const onAdd = (product, imgEl) => {
    flyToCart({ from: imgEl, src: product.image, done: () => add(product.slug) });
  };

  const rightN = turn ? (turn.dir > 0 ? turn.to : turn.from) : page;
  const leftN = turn ? (turn.dir > 0 ? turn.from : turn.to) : page;
  const leafN = turn ? (turn.dir > 0 ? turn.from : turn.to) : null;
  const paper = 'paper text-espresso';

  return (
    <div ref={root} className="fixed inset-0 z-[95]" role="dialog" aria-modal="true" aria-label={`${col.name} collection book`} onKeyDown={onKey}>
      <div ref={backdrop} className="absolute inset-0 bg-espresso/70 opacity-0 backdrop-blur-[3px]" onClick={close} />
      <div className="pointer-events-none absolute inset-0" style={{ perspective: '2200px' }}>
        <div
          ref={book}
          className="preserve-3d pointer-events-auto absolute"
          style={{ left: `calc(50% - ${W / 2}px)`, top: `calc(50% - ${H / 2}px)`, width: W, height: H }}
        >
          {/* back cover */}
          <div className="cloth absolute inset-0 rounded-r-[4px]" style={{ backgroundColor: col.cloth, transform: `translateZ(${-T / 2}px) rotateY(180deg)` }} />
          {/* spine */}
          <div
            className="cloth absolute left-0 top-0 flex h-full flex-col items-center justify-between py-4"
            style={{ width: T, backgroundColor: col.cloth, color: col.ink, transformOrigin: '0 50%', transform: `translateZ(${-T / 2}px) rotateY(-90deg)` }}
          >
            <span className="font-mono text-[10px]" style={{ color: '#e6c991' }}>{col.number}</span>
            <span className="display text-lg" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{col.name}</span>
            <span className="font-mono text-[7px] tracking-[0.2em]" style={{ color: '#e6c991' }}>TAAQ</span>
          </div>
          {/* page edges: fore-edge, head, tail */}
          <div className="page-edges absolute top-[3px]" style={{ left: W - 3, width: T - 4, height: H - 6, transformOrigin: '0 50%', transform: `translateZ(${T / 2 - 2}px) rotateY(90deg)` }} />
          <div className="page-edges absolute left-[2px]" style={{ top: 3, width: W - 5, height: T - 4, transformOrigin: '50% 0', transform: `translateZ(${-(T / 2 - 2)}px) rotateX(90deg)`, background: 'repeating-linear-gradient(0deg,#efe6d6 0 1px,#d9ccb6 1px 2px)' }} />
          <div className="page-edges absolute left-[2px]" style={{ top: H - 3, width: W - 5, height: T - 4, transformOrigin: '50% 0', transform: `translateZ(${T / 2 - 2}px) rotateX(-90deg)`, background: 'repeating-linear-gradient(0deg,#efe6d6 0 1px,#d9ccb6 1px 2px)' }} />
          {/* the right-hand page (top of the block) */}
          <div ref={right} className={`absolute left-[2px] top-[3px] overflow-hidden rounded-r-[3px] ${paper}`} style={{ width: W - 5, height: H - 6, transform: `translateZ(${T / 2 - 1.5}px)` }}>
            <Page col={col} n={rightN} onAdd={onAdd} />
          </div>
          {/* a turning leaf */}
          {turn && (
            <div ref={leaf} className="preserve-3d absolute left-[2px] top-[3px]" style={{ width: W - 5, height: H - 6 }}>
              <div className={`${face} rounded-r-[3px] ${paper}`}>
                <Page col={col} n={leafN} onAdd={onAdd} />
                <div
                  ref={shade}
                  className="pointer-events-none absolute inset-0 opacity-0"
                  style={{ background: 'linear-gradient(90deg, transparent 20%, rgba(42,29,21,.45) 50%, transparent 80%)', backgroundSize: '300% 100%' }}
                />
              </div>
              <div className={`${face} rounded-l-[3px] ${paper}`} style={{ transform: 'rotateY(180deg)' }}>
                <Verso col={col} n={leafN} />
              </div>
            </div>
          )}
          {/* front cover: cloth outside, the left-hand page inside */}
          <div ref={cover} className="preserve-3d absolute inset-0">
            <div className={`${face} rounded-r-[4px] shadow-[inset_6px_0_10px_-6px_rgba(0,0,0,.5)]`}>
              <CoverFront col={col} />
            </div>
            <div className={`${face} rounded-l-[3px] ${paper}`} style={{ transform: 'rotateY(180deg)' }}>
              {leftFor(col, leftN)}
            </div>
          </div>
        </div>
      </div>

      <button type="button" onClick={close} className="book-ui tap absolute right-4 top-4 flex items-center justify-center rounded-full bg-linen text-espresso opacity-0 md:right-8 md:top-8" aria-label="Close the book">
        <X size={20} strokeWidth={1.4} />
      </button>
      <div className="book-ui absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 text-linen opacity-0 md:bottom-8">
        <button type="button" onClick={() => turnTo(-1)} disabled={page === 1} className="tap flex items-center justify-center rounded-full border border-linen/40 disabled:opacity-30" aria-label="Previous page">
          <ArrowLeft size={18} strokeWidth={1.4} />
        </button>
        <span className="mono w-14 text-center" aria-live="polite">
          {page} / {PAGES}
        </span>
        <button type="button" onClick={() => turnTo(1)} disabled={page === PAGES} className="tap flex items-center justify-center rounded-full border border-linen/40 disabled:opacity-30" aria-label="Next page">
          <ArrowRight size={18} strokeWidth={1.4} />
        </button>
      </div>
    </div>
  );
}
