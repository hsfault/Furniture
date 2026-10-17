import { memo } from 'react';
import { formatPrice } from '../lib/format.js';

const DIGITS = '0123456789';

// Each digit is a vertical strip 0-9 that rolls to its value.
function RollingNumber({ value, format = formatPrice, className = '' }) {
  const text = format(value);
  const chars = text.split('');
  return (
    <span className={`inline-flex align-baseline ${className}`} aria-label={text} role="text">
      {chars.map((ch, i) => {
        const key = `${chars.length - i}`; // keep keys stable from the right so digits roll in place
        if (!DIGITS.includes(ch)) {
          return (
            <span key={key + ch} aria-hidden="true" className="inline-block whitespace-pre">
              {ch}
            </span>
          );
        }
        return (
          <span key={key} aria-hidden="true" className="relative inline-block h-[1.1em] overflow-hidden leading-[1.1]">
            <span className="invisible">0</span>
            <span
              className="absolute left-0 top-0 flex flex-col transition-transform duration-700 ease-expo"
              style={{ transform: `translateY(-${Number(ch) * 10}%)` }}
            >
              {DIGITS.split('').map((d) => (
                <span key={d} className="block h-[1.1em] leading-[1.1]">
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default memo(RollingNumber);
