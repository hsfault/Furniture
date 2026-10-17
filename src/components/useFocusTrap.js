import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// Keeps Tab inside `ref` while `active`, closes on Escape, restores focus after.
export function useFocusTrap(ref, active, onClose) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!active) return undefined;
    const prev = document.activeElement;
    const el = ref.current;
    const t = setTimeout(() => el?.querySelector(FOCUSABLE)?.focus({ preventScroll: true }), 60);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close.current?.();
        return;
      }
      if (e.key !== 'Tab' || !el) return;
      const items = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey, true);
      if (prev && prev.focus) prev.focus({ preventScroll: true });
    };
  }, [ref, active]);
}
