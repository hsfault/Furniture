import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { reducedMotion, isMobile } from '../lib/env.js';
import { localLightLabel } from '../lib/time.js';
import { useUI } from '../store/ui.js';
import { TLink } from '../components/DoorTransition.jsx';

const DioramaScene = lazy(() => import('../three/DioramaScene.jsx'));

export default function Hero() {
  const section = useRef(null);
  const pin = useRef(null);
  const text = useRef(null);
  const title = useRef(null);
  const progress = useRef(0);
  const introDone = useUI((s) => s.introDone);
  const [mobile] = useState(isMobile);
  const [active, setActive] = useState(true);
  const [label, setLabel] = useState(() => localLightLabel());

  useEffect(() => {
    const id = setInterval(() => setLabel(localLightLabel()), 30000);
    return () => clearInterval(id);
  }, []);

  useGSAP(
    () => {
      // Render only while the hero (including its pin distance) is on screen.
      // An IntersectionObserver misreads the pinned, position:fixed element.
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => setActive(self.isActive),
      });
      if (mobile || reducedMotion) return;
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: '+=150%',
        pin: pin.current,
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
      gsap.to(text.current, {
        yPercent: -40,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top top', end: '+=55%', scrub: true },
      });
      gsap.to('.hero-foot', {
        opacity: 0,
        y: 30,
        ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top top', end: '+=30%', scrub: true },
      });
    },
    { scope: section },
  );

  useGSAP(
    () => {
      if (!introDone) return;
      flipChars(title.current, { trigger: false, delay: 0.5 });
      gsap.from('.hero-fade', { opacity: 0, y: 14, duration: 1.2, stagger: 0.1, delay: 1.1, ease: 'expo.out' });
    },
    { scope: section, dependencies: [introDone] },
  );

  return (
    <section ref={section} data-chapter="01" aria-label="Arrival" className="relative">
      <div ref={pin} className="relative h-[100svh] w-full overflow-hidden bg-[#EAE3D9]">
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <DioramaScene progress={progress} mobile={mobile} reduced={reducedMotion} active={active} />
          </Suspense>
        </div>
        {/* soft vignette so the type always reads */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(234,227,217,.75) 0%, rgba(234,227,217,0) 38%, rgba(234,227,217,0) 75%, rgba(234,227,217,.6) 100%)' }} />

        <div ref={text} className="wrap pointer-events-none absolute inset-x-0 top-[calc(var(--nav-h)+4vh)] md:top-[calc(var(--nav-h)+6vh)]">
          <h1 ref={title} className="display max-w-[11ch] text-hero text-espresso" style={{ visibility: introDone ? 'visible' : 'hidden' }}>
            Furniture that <i>stays.</i>
          </h1>
          <p className="hero-fade mono mt-6 text-walnut">Solid wood · Carved in Chiniot · Finished in Lahore</p>
          <p className="hero-fade mono mt-2 text-taupe md:hidden">{label}</p>
        </div>

        <p className="hero-fade mono pointer-events-none absolute right-[var(--gutter)] top-[calc(var(--nav-h)+0.5rem)] hidden text-taupe md:block" aria-live="off">
          {label}
        </p>

        <div className="hero-foot wrap absolute inset-x-0 bottom-0 flex items-end justify-between pb-6 md:pb-8">
          <span className="w-14" aria-hidden="true" />
          <div className="hero-fade pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-8">
            <span className="mono text-taupe">Scroll</span>
            <span className="scroll-cue block h-12 w-px bg-brass" />
          </div>
          <TLink to="/shop" className="hero-fade uline text-[15px] text-espresso" data-cursor="VIEW">
            Explore the collection <span aria-hidden="true">→</span>
          </TLink>
        </div>
      </div>
    </section>
  );
}
