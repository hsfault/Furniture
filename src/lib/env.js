const mq = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches;

export const reducedMotion = mq('(prefers-reduced-motion: reduce)');
export const finePointer = mq('(hover: hover) and (pointer: fine)');
export const isTouch = mq('(hover: none), (pointer: coarse)');

export const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

function detectWebGL2() {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

export const webgl2 = typeof window !== 'undefined' && detectWebGL2();

// Decided once at startup so the layer never flips mode mid-session.
export const glImages = webgl2 && !reducedMotion && !(isTouch && isMobile());
