import { lazy, Suspense, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { reducedMotion, isMobile } from '../lib/env.js';
import { getLenis } from '../lib/lenis.js';
import LazyMount from '../components/LazyMount.jsx';

const LogStoryScene = lazy(() => import('../three/LogStoryScene.jsx'));

const STEPS = [
  { n: '01', title: 'Seasoned', copy: 'Air-dried for eighteen months. No kilns, no hurry.', sub: 'Sheesham logs from the banks of the Chenab, stacked and stickered in the open air.' },
  { n: '02', title: 'Cut', copy: 'Sawn into six planks along the grain.', sub: 'Quarter-sawn so the boards stay flat and the figure runs true.' },
  { n: '03', title: 'Joined', copy: 'Mortise and tenon. Not a single screw.', sub: 'Eight joints, each cut by hand and drawn tight with a walnut peg.' },
  { n: '04', title: 'Finished', copy: 'Oiled seven times, then woven with cane.', sub: 'A day between coats. The seat is woven wet so it tightens as it dries.' },
];
// Progress values the mobile stepper animates to (centre of each act).
const STOPS = [0.12, 0.42, 0.68, 1];

export default function LogToLivingRoom() {
  const root = useRef(null);
  const pin = useRef(null);
  const title = useRef(null);
  const line = useRef(null);
  const progress = useRef(0);
  const [step, setStep] = useState(0);
  const [mobile] = useState(isMobile);
  const pinned = !mobile && !reducedMotion;

  useGSAP(
    () => {
      flipChars(title.current);
      if (!pinned) {
        progress.current = STOPS[0];
        return;
      }
      ScrollTrigger.create({
        trigger: pin.current,
        start: 'top top',
        end: '+=300%',
        pin: true,
        anticipatePin: 1,
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
          setStep(Math.min(3, Math.floor(self.progress * 4)));
          if (line.current) line.current.style.transform = `scaleY(${self.progress})`;
        },
      });
    },
    { scope: root },
  );

  const goStep = (i) => {
    setStep(i);
    if (pinned) {
      const st = ScrollTrigger.getAll().find((s) => s.trigger === pin.current);
      if (st) {
        const y = st.start + (st.end - st.start) * (i / 4 + 0.13);
        getLenis()?.scrollTo(y, { duration: 1.4 });
      }
      return;
    }
    gsap.to(progress, { current: STOPS[i], duration: reducedMotion ? 0 : 1.6, ease: 'power3.inOut' });
  };

  return (
    <section ref={root} id="atelier" data-chapter="07" aria-label="From log to living room" className="relative">
      <div ref={pin} className="relative flex min-h-screen items-center py-24 md:py-0">
        <div className="wrap grid w-full gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <p className="mono text-taupe">07 — The atelier</p>
            <h2 ref={title} className="display mt-4 text-[clamp(2.2rem,5vw,5rem)] leading-[0.95] tracking-[-0.02em]">
              Log to <i>living room</i>
            </h2>
            <ol className="relative mt-10 space-y-1 pl-6 md:mt-14">
              <span className="absolute bottom-3 left-0 top-3 w-px bg-brass/25" aria-hidden="true" />
              <span ref={line} className="absolute bottom-3 left-0 top-3 w-px origin-top bg-brass" style={{ transform: `scaleY(${pinned ? 0 : (step + 1) / 4})` }} aria-hidden="true" />
              {STEPS.map((s, i) => (
                <li key={s.n}>
                  <button
                    type="button"
                    onClick={() => goStep(i)}
                    aria-current={step === i ? 'step' : undefined}
                    className={`block w-full py-3 text-left transition-colors duration-500 ${step === i ? 'text-espresso' : 'text-taupe hover:text-walnut'}`}
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="font-mono text-[11px]">{s.n}</span>
                      <span className="display text-[clamp(1.5rem,2.6vw,2.2rem)] leading-tight">{s.title}</span>
                    </span>
                    <span className={`block overflow-hidden pl-9 transition-[max-height,opacity] duration-700 ease-expo ${step === i ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0 md:max-h-32 md:opacity-80'}`}>
                      <span className="mt-1 block text-[15px]">{s.copy}</span>
                      <span className="mt-1 block text-[13px] text-taupe">{s.sub}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="md:col-span-7">
            <LazyMount className="relative h-[58vh] md:h-[82vh]">
              {(visible) => (
                <Suspense fallback={null}>
                  <LogStoryScene progress={progress} active={visible} mobile={mobile} reduced={false} />
                </Suspense>
              )}
            </LazyMount>
          </div>
        </div>
      </div>
    </section>
  );
}
