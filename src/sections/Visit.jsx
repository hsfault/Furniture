import { useMemo, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { reducedMotion } from '../lib/env.js';
import { creak, thud, chime } from '../lib/sound.js';
import { brand } from '../data/brand.js';
import { openStatus, fmtHour, nextDays, dayShort, dayLong, dateShort } from '../lib/time.js';

const SLOTS = [[11, 0], [12, 30], [14, 0], [15, 30], [17, 0], [18, 30]];
const slotLabel = ([h, m]) => `${h > 12 ? h - 12 : h}${m ? `:${String(m).padStart(2, '0')}` : ''}${h >= 12 ? 'pm' : 'am'}`;

function DoorLeaf({ side, innerRef }) {
  const [missing, setMissing] = useState(false);
  const left = side === 'left';
  return (
    <div
      ref={innerRef}
      className={`absolute top-0 h-full w-1/2 ${left ? 'left-0' : 'right-0'}`}
      style={{
        transformOrigin: left ? '0% 50%' : '100% 50%',
        background: 'linear-gradient(100deg,#4a2f1e,#6a452c 45%,#3e2716)',
        boxShadow: left ? 'inset -2px 0 0 rgba(0,0,0,.4)' : 'inset 2px 0 0 rgba(0,0,0,.4)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* carved panels, for when the photograph is missing */}
      <div className="absolute inset-[10%] rounded-t-[999px] border-2 border-[#2e1c11]/60 shadow-[inset_0_0_0_6px_rgba(255,220,170,.06)]" />
      <div className="absolute inset-x-[18%] bottom-[8%] top-[52%] border border-[#2e1c11]/60" />
      {!missing && (
        <img
          src={`/images/visit-door-${side}.jpg`}
          alt=""
          onError={() => setMissing(true)}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      )}
      <span
        className={`absolute top-1/2 h-10 w-2 -translate-y-1/2 rounded-full ${left ? 'right-3' : 'left-3'}`}
        style={{ background: 'linear-gradient(180deg,#f0d6a0,#b8935a 55%,#7a5a2e)' }}
      />
    </div>
  );
}

export default function Visit() {
  const root = useRef(null);
  const title = useRef(null);
  const doorL = useRef(null);
  const doorR = useRef(null);
  const bloom = useRef(null);
  const [showroomMissing, setShowroomMissing] = useState(false);
  const status = useMemo(() => openStatus(brand.hours), []);
  const days = useMemo(() => nextDays(7), []);
  const [day, setDay] = useState(() => days.findIndex((d) => brand.hours[d.getDay()].open !== null));
  const [slot, setSlot] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(null);

  const openDoors = () =>
    gsap
      .timeline({ onStart: () => creak() })
      .to(doorL.current, { rotationY: 104, duration: reducedMotion ? 0.01 : 1.6, ease: 'power3.inOut' }, 0)
      .to(doorR.current, { rotationY: -104, duration: reducedMotion ? 0.01 : 1.6, ease: 'power3.inOut' }, 0)
      .fromTo(bloom.current, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.3);

  useGSAP(
    () => {
      flipChars(title.current);
      gsap.set([doorL.current, doorR.current], { rotationY: 0 });
      ScrollTrigger.create({
        trigger: doorL.current.parentElement,
        start: 'top 65%',
        onEnter: openDoors,
        onLeaveBack: () => gsap.to([doorL.current, doorR.current], { rotationY: 0, duration: 1, ease: 'power3.inOut' }),
      });
    },
    { scope: root },
  );

  const submit = (e) => {
    e.preventDefault();
    if (slot === null) return setError('Pick a time that suits you.');
    if (name.trim().length < 2) return setError('Tell us your name.');
    if (phone.replace(/\D/g, '').length < 10) return setError('A phone number we can call, please.');
    setError('');
    const d = days[day];
    const msg = `We'll see you on ${dayLong(d)}, ${slotLabel(SLOTS[slot])}.`;
    gsap
      .timeline()
      .to([doorL.current, doorR.current], { rotationY: 0, duration: reducedMotion ? 0.01 : 0.9, ease: 'power3.inOut' })
      .add(() => {
        thud(0.6);
        setBooked(msg);
        setTimeout(() => chime(), 500);
      })
      .add(openDoors(), '+=0.35');
  };

  return (
    <section ref={root} id="visit" data-chapter="10" aria-label="Visit the showroom" className="relative py-[14vh]">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[560px] overflow-hidden rounded-t-[999px] shadow-niche" style={{ perspective: '1600px' }}>
            {/* the showroom behind the doors */}
            <div className={`absolute inset-0 ${showroomMissing ? 'bg-missing' : 'bg-[#e6dccf]'}`}>
              {!showroomMissing && (
                <img src="/images/visit-showroom.jpg" alt="The TAAQ showroom: plinths, arches and a skylight" onError={() => setShowroomMissing(true)} className="h-full w-full object-cover" />
              )}
            </div>
            <div ref={bloom} className="pointer-events-none absolute inset-0 opacity-0" style={{ background: 'radial-gradient(60% 50% at 50% 35%, rgba(255,236,200,.75), transparent 70%)', mixBlendMode: 'screen' }} />
            {booked && (
              <div className="absolute inset-x-0 bottom-[12%] flex justify-center px-8 text-center">
                <p className="display rounded-sm bg-linen/95 px-5 py-4 text-[clamp(1.4rem,2.6vw,2.2rem)] leading-tight" role="status">
                  {booked}
                </p>
              </div>
            )}
            <DoorLeaf side="left" innerRef={doorL} />
            <DoorLeaf side="right" innerRef={doorR} />
          </div>
        </div>

        <div className="lg:col-span-6 lg:pt-10">
          <p className="mono text-taupe">10 — Visit</p>
          <h2 ref={title} className="display mt-4 text-section">
            The doors are <i>open</i>
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <address className="flex flex-col items-start not-italic">
              <p className="text-lg leading-snug">
                {brand.showroom.line1}
                <br />
                {brand.showroom.line2}
              </p>
              <a href={brand.phoneHref} className="mt-2 inline-flex min-h-[44px] items-center text-taupe hover:text-clay">
                {brand.phone}
              </a>
              <a href={brand.showroom.mapUrl} target="_blank" rel="noreferrer" className="uline mt-1 text-[15px]">
                Get directions <ArrowUpRight size={16} strokeWidth={1.5} />
              </a>
            </address>
            <div>
              <p className={`mono inline-flex items-center gap-2 ${status.open ? 'text-sage-ink' : 'text-clay'}`}>
                <span className={`h-2 w-2 rounded-full ${status.open ? 'bg-sage' : 'bg-clay'}`} />
                {status.open ? 'Open now' : 'Closed'}
              </p>
              <ul className="mt-3 font-mono text-[12px]">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                  const h = brand.hours[d];
                  const today = d === status.dayIndex;
                  return (
                    <li key={d} className={`flex justify-between border-b hairline py-1.5 ${today ? 'text-espresso' : 'text-taupe'}`}>
                      <span>
                        {today && <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-clay align-middle" />}
                        {h.day}
                      </span>
                      <span>{h.open === null ? 'Closed' : `${fmtHour(h.open)} – ${fmtHour(h.close)}`}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <form onSubmit={submit} className="mt-12 border-t hairline pt-8" noValidate>
            <p className="display text-2xl">Book a visit</p>
            <p className="mono mt-4 text-taupe">Day</p>
            <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label="Day">
              {days.map((d, i) => {
                const closed = brand.hours[d.getDay()].open === null;
                return (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={day === i}
                    disabled={closed}
                    onClick={() => setDay(i)}
                    className={`flex min-h-[56px] min-w-[60px] shrink-0 flex-col items-center justify-center rounded-full border px-3 transition-colors disabled:opacity-35 ${
                      day === i ? 'border-espresso bg-espresso text-linen' : 'border-espresso/20 hover:border-espresso'
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em]">{dayShort(d)}</span>
                    <span className="text-[14px]">{dateShort(d)}</span>
                  </button>
                );
              })}
            </div>
            <p className="mono mt-5 text-taupe">Time</p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Time">
              {SLOTS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={slot === i}
                  onClick={() => setSlot(i)}
                  className={`min-h-[44px] rounded-full border px-4 font-mono text-[12px] transition-colors ${slot === i ? 'border-clay bg-clay text-linen' : 'border-espresso/20 hover:border-espresso'}`}
                >
                  {slotLabel(s)}
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mono text-taupe">Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="mt-1 min-h-[44px] w-full border-b border-espresso/30 bg-transparent text-lg focus:border-espresso focus:outline-none" />
              </label>
              <label className="block">
                <span className="mono text-taupe">Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" placeholder="+92 3xx xxxxxxx" className="mt-1 min-h-[44px] w-full border-b border-espresso/30 bg-transparent text-lg placeholder:text-taupe/60 focus:border-espresso focus:outline-none" />
              </label>
            </div>
            {error && (
              <p className="mt-4 text-[14px] text-clay" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn-clay mt-8">
              Book a visit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
