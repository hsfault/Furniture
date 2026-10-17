import { useEffect } from 'react';
import { useUI } from '../store/ui.js';
import { setAmbient, playClick } from '../lib/sound.js';

// Three-bar equaliser. Sound is off by default.
export default function SoundToggle({ className = '', dark = false }) {
  const soundOn = useUI((s) => s.soundOn);
  const toggle = useUI((s) => s.toggleSound);
  useEffect(() => {
    setAmbient(soundOn);
    if (soundOn) playClick();
  }, [soundOn]);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={soundOn}
      aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
      className={`tap inline-flex items-center justify-center gap-[3px] ${soundOn ? 'eq-on' : ''} ${className}`}
      data-cursor="SOUND"
    >
      {[0, 1, 2].map((i) => (
        <span key={i} className={`eq-bar block h-3.5 w-[2px] rounded-full ${dark ? 'bg-linen' : 'bg-espresso'}`} />
      ))}
    </button>
  );
}
