import { useUI } from '../store/ui.js';

// Equaliser bars plus a word, so it is obvious what it does.
export default function SoundToggle({ className = '', dark = false, label = true }) {
  const soundOn = useUI((s) => s.soundOn);
  const toggle = useUI((s) => s.toggleSound);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={soundOn}
      aria-label={soundOn ? 'Sound is on. Turn sound off' : 'Sound is off. Turn sound on'}
      title={soundOn ? 'Sound on' : 'Sound off'}
      className={`tap inline-flex items-center justify-center gap-2 px-1 ${soundOn ? 'eq-on' : ''} ${className}`}
    >
      <span className="inline-flex items-end gap-[3px]" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`eq-bar block h-3.5 w-[2px] rounded-full ${dark ? 'bg-linen' : 'bg-espresso'} ${soundOn ? '' : 'opacity-50'}`} />
        ))}
      </span>
      {label && <span className="font-mono text-[10px] uppercase tracking-[0.14em]">{soundOn ? 'On' : 'Off'}</span>}
    </button>
  );
}
