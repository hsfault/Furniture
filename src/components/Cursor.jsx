import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap.js';
import { finePointer } from '../lib/env.js';
import { pxToCm } from '../lib/format.js';

/**
 * A lerped ring and dot. Over [data-cursor] it becomes a brass measuring
 * crosshair spanning the element, reading its size in centimetres.
 */
export default function Cursor() {
  const ring = useRef(null);
  const dot = useRef(null);
  const h = useRef(null);
  const v = useRef(null);
  const wLabel = useRef(null);
  const hLabel = useRef(null);
  const tag = useRef(null);
  const chip = useRef(null);

  useEffect(() => {
    if (!finePointer) return undefined;
    document.documentElement.classList.add('has-cursor');
    const s = { x: -100, y: -100, rx: -100, ry: -100, el: null, shown: false };

    const onMove = (e) => {
      s.x = e.clientX;
      s.y = e.clientY;
      if (!s.shown) {
        s.shown = true;
        s.rx = s.x;
        s.ry = s.y;
        gsap.to([ring.current, dot.current], { opacity: 1, duration: 0.3 });
      }
      const target = e.target instanceof Element ? e.target.closest('[data-cursor]') : null;
      if (target !== s.el) {
        s.el = target;
        const on = !!target;
        tag.current.textContent = target?.dataset.cursor || '';
        const cap = target?.dataset.cursorCaption;
        chip.current.textContent = cap || '';
        gsap.to(chip.current, { opacity: cap ? 1 : 0, duration: 0.25 });
        gsap.to([h.current, v.current, wLabel.current, hLabel.current], { opacity: on ? 1 : 0, duration: 0.3 });
        gsap.to(tag.current, { opacity: on ? 1 : 0, duration: 0.3 });
        gsap.to(ring.current, { scale: on ? 2.6 : 1, borderColor: on ? '#B8935A' : '#2A1D15', duration: 0.45, ease: 'expo.out' });
        gsap.to(dot.current, { backgroundColor: on ? '#B8935A' : '#2A1D15', duration: 0.3 });
      }
    };
    const onLeave = () => {
      s.shown = false;
      gsap.to([ring.current, dot.current], { opacity: 0, duration: 0.3 });
    };
    const onDown = () => gsap.to(ring.current, { scale: s.el ? 2.2 : 0.7, duration: 0.2 });
    const onUp = () => gsap.to(ring.current, { scale: s.el ? 2.6 : 1, duration: 0.4, ease: 'expo.out' });

    const tick = () => {
      s.rx += (s.x - s.rx) * 0.18;
      s.ry += (s.y - s.ry) * 0.18;
      ring.current.style.transform = `translate3d(${s.rx - 6}px, ${s.ry - 6}px, 0)`;
      dot.current.style.transform = `translate3d(${s.x - 1.5}px, ${s.y - 1.5}px, 0)`;
      tag.current.style.transform = `translate3d(${s.x + 22}px, ${s.y + 16}px, 0)`;
      chip.current.style.transform = `translate3d(${s.x + 22}px, ${s.y + 38}px, 0)`;
      if (s.el && s.el.isConnected) {
        const r = s.el.getBoundingClientRect();
        h.current.style.transform = `translate3d(${r.left}px, ${s.ry}px, 0)`;
        h.current.style.width = `${r.width}px`;
        v.current.style.transform = `translate3d(${s.rx}px, ${r.top}px, 0)`;
        v.current.style.height = `${r.height}px`;
        wLabel.current.textContent = `${pxToCm(r.width)} cm`;
        hLabel.current.textContent = `${pxToCm(r.height)} cm`;
        wLabel.current.style.transform = `translate3d(${Math.max(8, r.right - 64)}px, ${s.ry - 20}px, 0)`;
        hLabel.current.style.transform = `translate3d(${s.rx + 8}px, ${Math.max(8, r.top + 4)}px, 0)`;
      }
    };
    gsap.ticker.add(tick);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  if (!finePointer) return null;
  const line = 'pointer-events-none fixed left-0 top-0 z-[300] opacity-0';
  const mono = 'pointer-events-none fixed left-0 top-0 z-[300] whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] opacity-0';
  return (
    <div aria-hidden="true">
      <div ref={h} className={`${line} h-px`} style={{ background: 'linear-gradient(90deg,#B8935A 0 6px,transparent 6px calc(100% - 6px),#B8935A calc(100% - 6px)), repeating-linear-gradient(90deg,#B8935A 0 1px,transparent 1px 10px)', backgroundSize: '100% 100%, 100% 1px' }} />
      <div ref={v} className={`${line} w-px`} style={{ background: 'repeating-linear-gradient(180deg,#B8935A 0 1px,transparent 1px 10px)' }} />
      <span ref={wLabel} className={`${mono} text-brass`} />
      <span ref={hLabel} className={`${mono} text-brass`} />
      <span ref={tag} className={`${mono} rounded-full bg-espresso px-2 py-0.5 text-linen`} />
      <span ref={chip} className={`${mono} max-w-[260px] rounded-full border border-brass/40 bg-linen/95 px-2.5 py-1 text-espresso`} />
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[301] h-3 w-3 rounded-full border border-espresso opacity-0" />
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[301] h-[3px] w-[3px] rounded-full bg-espresso opacity-0" />
    </div>
  );
}
