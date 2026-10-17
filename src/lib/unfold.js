import { gsap } from './gsap.js';
import { reducedMotion } from './env.js';

// DOM "unfold": the frame drops open from its top edge like a blind while the
// picture inside settles from 1.3 to 1. The GL layer does its own version.
export function unfold(frame, img, { trigger = frame, start = 'top 85%', delay = 0 } = {}) {
  if (!frame) return null;
  if (reducedMotion) {
    return gsap.from(frame, { opacity: 0, duration: 0.8, ease: 'power1.out', scrollTrigger: { trigger, start, once: true } });
  }
  const tl = gsap.timeline({ delay, scrollTrigger: { trigger, start, once: true } });
  tl.fromTo(frame, { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 1.2, ease: 'power4.inOut' }, 0);
  if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0.15);
  const line = frame.querySelector('.fold-line');
  if (line) tl.fromTo(line, { opacity: 1 }, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.6);
  return tl;
}
