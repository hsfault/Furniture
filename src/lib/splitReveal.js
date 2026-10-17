import { gsap, SplitText } from './gsap.js';
import { reducedMotion } from './env.js';
import { useUI } from '../store/ui.js';

// Headline: chars flip in from rotateX(-90deg) around a point behind the glyph.
// trigger: true = when scrolled into view, false = right away (after the doors open).
export function flipChars(el, { trigger = true, delay = 0, start = 'top 88%' } = {}) {
  if (!el) return null;
  if (reducedMotion) {
    return gsap.from(el, { opacity: 0, duration: 0.8, ease: 'power1.out', delay, scrollTrigger: trigger ? { trigger: el, start, once: true } : undefined });
  }
  const doorDelay = useUI.getState().doorsClosed ? 0.55 : 0;
  return SplitText.create(el, {
    type: 'words,chars',
    ignore: '.no-split',
    wordsClass: 'split-word',
    charsClass: 'split-char',
    autoSplit: true,
    onSplit(self) {
      gsap.set(self.words, { perspective: 800 });
      return gsap.from(self.chars, {
        rotateX: -90,
        opacity: 0,
        transformOrigin: '50% 50% -0.4em',
        stagger: 0.025,
        duration: 1.1,
        ease: 'expo.out',
        delay: delay + doorDelay,
        scrollTrigger: trigger ? { trigger: el, start, once: true } : undefined,
      });
    },
  });
}

// Paragraph: each word inks from 0.15 to 1 opacity, scrubbed to scroll.
export function inkWords(el, { start = 'top 80%', end = 'bottom 45%', skip = '.no-ink' } = {}) {
  if (!el) return null;
  const split = SplitText.create(el, { type: 'words', wordsClass: 'ink-word', ignore: skip });
  const words = split.words.filter((w) => !w.closest(skip));
  if (reducedMotion) return split;
  gsap.fromTo(
    words,
    { opacity: 0.15 },
    { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start, end, scrub: true } },
  );
  return split;
}
