import { useEffect, useRef, useState } from 'react';

const near = (el, margin) => {
  const r = el.getBoundingClientRect();
  return r.bottom > -margin && r.top < window.innerHeight + margin && r.width > 0;
};

// Mounts children once the box comes near the viewport and reports whether it
// is currently on screen, so canvases can stop rendering off-screen.
// Visibility is a rect check on scroll: IntersectionObserver misreports
// elements inside ScrollTrigger pins (position: fixed).
export default function LazyMount({ children, className = '', rootMargin = 300, style, as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    const check = () => {
      raf = 0;
      if (near(el, rootMargin)) setMounted(true);
      setVisible(near(el, 0));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [rootMargin]);
  return (
    <Tag ref={ref} className={className} style={style} {...rest}>
      {mounted ? children(visible) : null}
    </Tag>
  );
}
