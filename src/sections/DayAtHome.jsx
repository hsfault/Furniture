import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { reducedMotion } from '../lib/env.js';
import { clockFromProgress } from '../lib/time.js';
import { day } from '../data/rooms.js';
import { bySlug } from '../data/products.js';
import { TLink } from '../components/DoorTransition.jsx';
import Img from '../components/Img.jsx';

function Panel({ p, mobile }) {
  const arch = p.shape === 'arch';
  return (
    <article className={`day-panel relative flex shrink-0 items-center ${mobile ? 'w-full flex-col gap-8 py-20' : 'h-full w-screen gap-[5vw] px-[8vw]'}`} data-bg={p.bg} data-fg={p.fg}>
      <div
        className={`day-frame relative shrink-0 overflow-hidden ${arch ? 'rounded-t-[999px]' : 'rounded-[3px]'} ${
          mobile ? (arch ? 'aspect-[4/5] w-[78%]' : 'aspect-[16/10] w-full') : arch ? 'h-[66vh] w-[min(36vw,52vh)]' : 'h-[58vh] w-[min(52vw,92vh)]'
        }`}
      >
        <Img src={p.image} alt={`${p.label}: ${p.story}`} className="day-img absolute inset-y-0 -left-[8%] w-[116%]" />
      </div>
      <div className={mobile ? 'w-full' : 'max-w-[30ch]'}>
        <p className="mono opacity-70">
          {p.time} — {p.label}
        </p>
        <h3 className="display mt-4 text-[clamp(2.2rem,4.4vw,4.6rem)] leading-[0.98]">
          {p.title} <i>{p.italic}</i>
        </h3>
        <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed opacity-80">{p.story}</p>
        <ul className="mt-6 flex flex-col gap-1">
          {p.links.map((slug) => (
            <li key={slug}>
              <TLink to={`/product/${slug}`} className="uline text-[15px]">
                {bySlug[slug].name} <span aria-hidden="true">→</span>
              </TLink>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function DayAtHome() {
  const root = useRef(null);
  const pin = useRef(null);
  const track = useRef(null);
  const clock = useRef(null);
  const sun = useRef(null);
  const [mobile] = useState(() => window.innerWidth < 768);

  useGSAP(
    () => {
      const panels = gsap.utils.toArray('.day-panel');
      if (mobile || reducedMotion) {
        panels.forEach((panel, i) => {
          ScrollTrigger.create({
            trigger: panel,
            start: 'top 60%',
            end: 'bottom 60%',
            onToggle: (self) => {
              if (!self.isActive) return;
              gsap.to(root.current, { backgroundColor: day[i].bg, color: day[i].fg, duration: reducedMotion ? 0 : 0.8, overwrite: true });
              if (clock.current) clock.current.textContent = day[i].time;
            },
          });
        });
        return;
      }
      const distance = () => track.current.scrollWidth - window.innerWidth;
      const move = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            if (clock.current) clock.current.textContent = clockFromProgress(p);
            if (sun.current) {
              const x = 6 + p * 88;
              const y = 46 - Math.sin(p * Math.PI) * 36;
              sun.current.style.left = `${x}%`;
              sun.current.style.top = `${y}px`;
              sun.current.dataset.moon = p > 0.82 ? '1' : '0';
            }
          },
        },
      });
      // the light changes through the day
      const tl = gsap.timeline({
        scrollTrigger: { trigger: pin.current, start: 'top top', end: () => `+=${distance()}`, scrub: 1, invalidateOnRefresh: true },
      });
      day.slice(1).forEach((d) => tl.to(pin.current, { backgroundColor: d.bg, color: d.fg, ease: 'none', duration: 1 }));
      // pictures drift against the direction of travel
      panels.forEach((panel) => {
        const img = panel.querySelector('.day-img');
        if (!img) return;
        gsap.fromTo(
          img,
          { xPercent: -6 },
          { xPercent: 6, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-chapter="04" aria-label="A day at home" className="relative" style={{ backgroundColor: day[0].bg, color: day[0].fg }}>
      {mobile || reducedMotion ? (
        <div className="wrap">
          <div className="sticky top-0 z-[2] flex items-center justify-between py-4" style={{ background: 'inherit' }}>
            <p className="mono">04 — A day at home</p>
            <p ref={clock} className="font-mono text-2xl tabular-nums">07:00</p>
          </div>
          {day.map((p) => (
            <Panel key={p.id} p={p} mobile />
          ))}
        </div>
      ) : (
        <div ref={pin} className="relative h-screen overflow-hidden" style={{ backgroundColor: day[0].bg, color: day[0].fg }}>
          <div className="wrap absolute inset-x-0 top-[calc(var(--nav-h)+0.5rem)] z-[2] flex items-start justify-between">
            <p className="mono">04 — A day at home</p>
            <p ref={clock} className="font-mono text-[clamp(2rem,4vw,3.4rem)] leading-none tabular-nums" aria-label="Time of day">
              07:00
            </p>
          </div>
          {/* the sun (and later the moon) along its arc */}
          <div className="pointer-events-none absolute inset-x-[6vw] top-[calc(var(--nav-h)+4.5rem)] z-[1] h-14" aria-hidden="true">
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible opacity-40">
              <path d="M0 50 Q50 -22 100 50" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 1.5" vectorEffect="non-scaling-stroke" />
            </svg>
            <span ref={sun} data-moon="0" className="sun absolute -ml-3 -mt-3 block h-6 w-6" style={{ left: '6%', top: '46px' }}>
              <span className="sun-disc absolute inset-0 rounded-full border border-current" />
              <span className="sun-core absolute inset-[5px] rounded-full bg-clay" />
            </span>
          </div>
          <div ref={track} className="flex h-full w-max items-center pt-16">
            {day.map((p) => (
              <Panel key={p.id} p={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
