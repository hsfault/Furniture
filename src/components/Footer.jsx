import { useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { TLink } from './DoorTransition.jsx';
import { brand, footer } from '../data/brand.js';
import { fmtHour } from '../lib/time.js';

export default function Footer() {
  const root = useRef(null);
  const title = useRef(null);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  useGSAP(() => {
    flipChars(title.current);
  }, { scope: root });

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    setSent(true);
  };

  const weekday = brand.hours[1];
  return (
    <footer id="site-footer" ref={root} className="relative z-[1] border-t hairline bg-plaster pt-20 md:pt-28">
      <div className="wrap grid gap-12 md:grid-cols-12 md:gap-6">
        <h2 ref={title} className="display text-[clamp(2rem,5vw,4rem)] leading-[1.02] tracking-[-0.02em] md:col-span-7">
          Some things are made to be <i>kept</i>.
        </h2>
        <form onSubmit={submit} className="self-end md:col-span-4 md:col-start-9" noValidate>
          <label htmlFor="newsletter" className="mono block text-taupe" aria-live="polite">
            {sent ? 'See you in your inbox.' : 'Letters from the workshop, once a month'}
          </label>
          <div className="mt-4 flex items-end gap-4 border-b border-espresso/40 pb-2">
            <input
              id="newsletter"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sent}
              placeholder="your@email.com"
              className="min-h-[44px] w-full bg-transparent text-lg placeholder:text-taupe/70 focus:outline-none"
            />
            <button
              type="submit"
              aria-label={sent ? 'Subscribed' : 'Subscribe'}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-linen transition-colors duration-500 ${sent ? 'bg-sage' : 'bg-clay hover:bg-[#a9562f]'}`}
              data-cursor="SEND"
            >
              {sent ? <Check size={18} strokeWidth={1.6} /> : <ArrowRight size={18} strokeWidth={1.6} />}
            </button>
          </div>
        </form>
      </div>

      <div className="wrap mt-20 grid grid-cols-2 gap-x-6 gap-y-12 border-t hairline pt-12 md:mt-28 md:grid-cols-4">
        {footer.columns.map((col) => (
          <div key={col.title}>
            <h3 className="mono text-taupe">{col.title}</h3>
            <ul className="mt-4 space-y-0.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <TLink to={l.to} className="inline-flex min-h-[40px] items-center text-[15px] hover:text-clay">
                    {l.label}
                  </TLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h3 className="mono text-taupe">Visit</h3>
          <address className="mt-4 space-y-1 text-[15px] not-italic leading-relaxed">
            <p>
              {brand.showroom.line1}
              <br />
              {brand.showroom.line2}
            </p>
            <p className="text-taupe">
              Mon–Sat {fmtHour(weekday.open)}–{fmtHour(weekday.close)}
            </p>
            <a href={brand.phoneHref} className="inline-flex min-h-[40px] items-center hover:text-clay">
              {brand.phone}
            </a>
            <br />
            <a href={brand.whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-[40px] items-center hover:text-clay">
              WhatsApp the showroom
            </a>
          </address>
        </div>
      </div>

      <div className="wrap mt-16 flex flex-col gap-3 border-t hairline py-6 text-[13px] text-taupe sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 TAAQ Furniture · Chiniot × Lahore</p>
        <ul className="flex gap-6">
          <li>
            <a href={brand.instagram} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center hover:text-espresso">Instagram</a>
          </li>
          <li>
            <a href={brand.pinterest} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center hover:text-espresso">Pinterest</a>
          </li>
          <li>
            <TLink to="/shop" className="inline-flex min-h-[44px] items-center hover:text-espresso">Terms</TLink>
          </li>
        </ul>
      </div>
    </footer>
  );
}
