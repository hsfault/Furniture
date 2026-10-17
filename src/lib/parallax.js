import { gsap, ScrollTrigger } from './gsap.js';
import { reducedMotion } from './env.js';

// Moves every [data-speed] element inside `scope` at its own rate.
// speed 1 = normal scroll, > 1 faster, < 1 slower. Call inside useGSAP.
export function initParallax(scope) {
  if (reducedMotion || !scope) return;
  scope.querySelectorAll('[data-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed);
    if (!speed || speed === 1) return;
    if (el.dataset.speedMobile === 'off' && window.innerWidth < 768) return;
    const dist = () => (window.innerHeight + el.offsetHeight) * (1 - speed) * 0.5;
    gsap.fromTo(
      el,
      { y: () => -dist() },
      {
        y: () => dist(),
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      },
    );
  });
}

// Inner parallax for a DOM image that is 120% of its frame's height.
export function innerParallax(img, frame = img.parentElement, amount = 8) {
  if (reducedMotion || !img) return null;
  return gsap.fromTo(
    img,
    { yPercent: -amount },
    {
      yPercent: amount,
      ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
    },
  );
}

export const refreshScroll = () => ScrollTrigger.refresh();
