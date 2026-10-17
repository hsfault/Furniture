import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { inkWords } from '../lib/splitReveal.js';
import { initParallax } from '../lib/parallax.js';
import { finePointer, reducedMotion } from '../lib/env.js';
import GLImage from '../gl/GLImage.jsx';

// An image set into the sentence like a word. Hover springs it to 3x width.
function Pill({ src, alt }) {
  const ref = useRef(null);
  const grow = (on) => {
    if (!finePointer || reducedMotion) return;
    gsap.to(ref.current, { width: on ? '4.8em' : '1.6em', duration: on ? 0.9 : 0.6, ease: on ? 'elastic.out(1, 0.55)' : 'power3.out' });
  };
  return (
    <span className="pill no-ink mx-[0.12em] inline-block align-[-0.08em]" onPointerEnter={() => grow(true)} onPointerLeave={() => grow(false)}>
      <span ref={ref} className="inline-block h-[0.8em] w-[1.6em] align-middle">
        <GLImage src={src} alt={alt} shape="pill" parallax={false} reveal={false} className="h-full w-full rounded-full" data-cursor="VIEW" />
      </span>
    </span>
  );
}

export default function Manifesto() {
  const root = useRef(null);
  const left = useRef(null);
  const right = useRef(null);

  useGSAP(
    () => {
      inkWords(left.current, { skip: '.no-ink' });
      inkWords(right.current, { skip: '.no-ink' });
      initParallax(root.current);
    },
    { scope: root },
  );

  return (
    <section ref={root} data-chapter="02" aria-label="Manifesto" className="wrap relative py-[18vh] md:py-[24vh]">
      <div className="mb-10 flex items-center gap-4 md:mb-16">
        <span className="mono text-taupe">02 — Manifesto</span>
        <span className="rule w-24" />
      </div>
      <div className="grid gap-y-8 md:grid-cols-12">
        <p ref={left} data-speed="1.1" className="display text-[clamp(1.8rem,4.6vw,3.6rem)] leading-[1.16] tracking-[-0.015em] md:col-span-10">
          We carve <Pill src="/images/manifesto-1.jpg" alt="A chisel carving walnut" /> in Chiniot, oil every joint{' '}
          <Pill src="/images/manifesto-2.jpg" alt="Hands oiling a walnut surface" /> by hand, and build each piece to outlive{' '}
          <Pill src="/images/manifesto-3.jpg" alt="An old armchair in a sunbeam" /> its first home.
        </p>
        <p ref={right} data-speed="0.9" className="display text-[clamp(1.8rem,4.6vw,3.6rem)] leading-[1.16] tracking-[-0.015em] md:col-span-9 md:col-start-4 md:text-right">
          No veneered chipboard, no screws where a joint will do. Just <i>wood, weight</i> and the patience to let both settle.
        </p>
      </div>
      <div className="mt-16 grid gap-8 border-t hairline pt-8 md:mt-24 md:grid-cols-12">
        {[
          ['18', 'months air-drying every board'],
          ['41', 'years at the bench, our oldest carver'],
          ['0', 'screws in a Ravi stool'],
          ['∞', 'repairs, for the life of the piece'],
        ].map(([n, t], i) => (
          <div key={t} className={`md:col-span-3 ${i % 2 ? 'md:translate-y-10' : ''}`}>
            <p className="display text-5xl leading-none">{n}</p>
            <p className="mono mt-3 max-w-[22ch] text-taupe">{t}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
