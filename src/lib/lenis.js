import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';
import { reducedMotion } from './env.js';

let lenis = null;

export function initLenis() {
  if (lenis) return lenis;
  // lerp smoothing glides toward the target every frame, which reads smoother
  // than a fixed-duration ease when wheel events arrive unevenly.
  lenis = new Lenis({
    lerp: reducedMotion ? 1 : 0.09,
    smoothWheel: !reducedMotion,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.4,
    syncTouch: false,
    autoRaf: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const getLenis = () => lenis;

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export function scrollToId(id, immediate = false) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { immediate, force: true, duration: 1.6 });
  else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
}

// Lenis velocity in px per frame, 0 when Lenis is off.
export const scrollVelocity = () => (lenis ? lenis.velocity : 0);
