import { useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { gsap, useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { reducedMotion } from '../lib/env.js';
import { formatPrice } from '../lib/format.js';
import { dateLong } from '../lib/time.js';
import { TLink } from '../components/DoorTransition.jsx';
import { pop } from '../lib/sound.js';

const STEPS = [
  { label: 'Order received', days: 0, note: 'A carpenter reads your order the same day.' },
  { label: 'Wood selected', days: 3, note: 'Boards chosen and matched for grain in Chiniot.' },
  { label: 'In the workshop', days: 7, note: 'Cut, joined and carved by hand.' },
  { label: 'Finishing', days: 26, note: 'Seven coats of oil, a day between each.' },
  { label: 'Delivered', days: 38, note: 'Two people, blankets and gloves, to your room.' },
];

export default function OrderConfirmed() {
  const { id } = useParams();
  const root = useRef(null);
  const title = useRef(null);
  const order = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(`taaq-order-${id}`) || 'null');
    } catch {
      return null;
    }
  }, [id]);
  const start = order ? new Date(order.placed) : new Date();

  useGSAP(
    () => {
      flipChars(title.current, { trigger: false, delay: 0.2 });
      const d = reducedMotion ? 0.01 : 1;
      const tl = gsap.timeline({ delay: 0.9 });
      tl.fromTo('.tl-line', { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, duration: 2.2 * d, ease: 'power2.inOut' });
      tl.fromTo('.tl-node', { scale: 0 }, { scale: 1, duration: 0.6 * d, ease: 'back.out(2.4)', stagger: { each: 0.42 * d, onStart: () => pop() } }, 0.1);
      tl.fromTo('.tl-text', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 * d, stagger: 0.42 * d, ease: 'expo.out' }, 0.25);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="wrap pb-[14vh] pt-[calc(var(--nav-h)+8vh)]">
      <p className="mono text-taupe">Order {id}</p>
      <h1 ref={title} className="display mt-4 max-w-[14ch] text-section">
        Thank you{order?.name ? `, ${order.name}` : ''}. <i>It begins.</i>
      </h1>
      {order && (
        <p className="mono mt-6 text-taupe">
          {formatPrice(order.total)} · delivering to {order.city} · around {dateLong(new Date(start.getTime() + STEPS[4].days * 864e5))}
        </p>
      )}

      <ol className="relative mt-16 grid gap-10 md:mt-24 md:grid-cols-5 md:gap-4">
        <span className="tl-line absolute bottom-2 left-[7px] top-2 w-px origin-top bg-brass md:hidden" aria-hidden="true" />
        <span className="tl-line absolute left-2 right-[18%] top-[7px] hidden h-px origin-left bg-brass md:block" aria-hidden="true" />
        {STEPS.map((s) => (
          <li key={s.label} className="relative pl-10 md:pl-0 md:pt-10">
            <span className="tl-node absolute left-0 top-0 block h-[15px] w-[15px] rounded-full border border-brass bg-plaster md:left-0" aria-hidden="true">
              <span className="absolute inset-[3px] rounded-full bg-clay" />
            </span>
            <div className="tl-text">
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-brass-ink">{dateLong(new Date(start.getTime() + s.days * 864e5))}</p>
              <p className="display mt-2 text-2xl leading-tight">{s.label}</p>
              <p className="mt-2 max-w-[26ch] text-[14px] text-taupe">{s.note}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-20 flex flex-wrap items-center gap-6 border-t hairline pt-8">
        <p className="mono">
          Order number <span className="text-clay">{id}</span>
        </p>
        <TLink to="/shop" className="btn-clay">
          Continue browsing
        </TLink>
      </div>
    </section>
  );
}
