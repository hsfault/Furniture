import { useEffect } from 'react';
import { useUI } from '../store/ui.js';
import { finePointer } from '../lib/env.js';
import { unlockAudio, setAmbient, knock, tick, chime } from '../lib/sound.js';

const INTERACTIVE = 'a[href], button, [role="button"], [role="radio"], [role="switch"], [role="slider"], input[type="checkbox"], input[type="radio"], select, summary';

/**
 * Site-wide sound: unlocks audio on the first gesture (browsers require one),
 * runs the room tone, knocks on every press and ticks on hover. Elements can
 * opt out with data-sound="none" when they play their own sound.
 */
export default function SoundEffects() {
  const soundOn = useUI((s) => s.soundOn);

  useEffect(() => {
    const unlock = () => {
      if (!unlockAudio()) return;
      setAmbient(useUI.getState().soundOn);
      ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.removeEventListener(e, unlock, true));
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.addEventListener(e, unlock, { capture: true, passive: true }));

    const target = (e) => {
      const el = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
      if (!el || el.closest('[data-sound="none"]') || el.disabled) return null;
      return el;
    };
    const onDown = (e) => {
      if (target(e)) knock();
    };
    const onKey = (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && target(e)) knock();
    };
    let hovered = null;
    const onOver = (e) => {
      const el = target(e);
      if (el && el !== hovered) tick(0.8);
      hovered = el;
    };
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('keydown', onKey, true);
    if (finePointer) window.addEventListener('pointerover', onOver, { passive: true });
    return () => {
      ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.removeEventListener(e, unlock, true));
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerover', onOver);
    };
  }, []);

  useEffect(() => {
    setAmbient(soundOn);
    if (soundOn) setTimeout(() => chime(0.5), 30);
  }, [soundOn]);

  return null;
}
