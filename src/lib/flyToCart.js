import { gsap } from './gsap.js';
import { reducedMotion } from './env.js';
import { useUI } from '../store/ui.js';
import { chime, whoosh } from './sound.js';

// Flies a thumbnail from `from` (an element or a DOMRect) to the cart icon in an
// arc, then calls `done` and bumps the badge.
export function flyToCart({ from, src, done }) {
  const target = document.getElementById('cart-target');
  const rect = from instanceof Element ? from.getBoundingClientRect() : from;
  const finish = () => {
    chime();
    done?.();
    useUI.getState().bumpCart();
  };
  if (!target || !rect || reducedMotion) return finish();
  const t = target.getBoundingClientRect();
  const size = Math.min(140, Math.max(60, rect.width * 0.5));
  const node = document.createElement('div');
  node.setAttribute('aria-hidden', 'true');
  Object.assign(node.style, {
    position: 'fixed', left: '0px', top: '0px', width: `${size}px`, height: `${size}px`, zIndex: 120,
    borderRadius: '999px 999px 0 0', overflow: 'hidden', pointerEvents: 'none',
    background: src ? `#e6dccf url("${src}") center/cover no-repeat` : '#c2693e',
    boxShadow: '0 20px 40px -14px rgba(42,29,21,.5)',
  });
  document.body.appendChild(node);
  const x0 = rect.left + rect.width / 2 - size / 2;
  const y0 = rect.top + rect.height / 2 - size / 2;
  const x1 = t.left + t.width / 2 - size / 2;
  const y1 = t.top + t.height / 2 - size / 2;
  const lift = Math.min(y0, y1) - 160;
  const p = { t: 0 };
  whoosh(0.5, 0.8, true);
  gsap.to(p, {
    t: 1,
    duration: 0.95,
    ease: 'power2.inOut',
    onUpdate() {
      const k = p.t;
      // quadratic bezier: start -> lifted control point -> cart
      const cx = (x0 + x1) / 2;
      const x = (1 - k) * (1 - k) * x0 + 2 * (1 - k) * k * cx + k * k * x1;
      const y = (1 - k) * (1 - k) * y0 + 2 * (1 - k) * k * lift + k * k * y1;
      const s = 1 - 0.8 * k;
      node.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s}) rotate(${k * 18}deg)`;
    },
    onComplete() {
      node.remove();
      finish();
    },
  });
  return undefined;
}
