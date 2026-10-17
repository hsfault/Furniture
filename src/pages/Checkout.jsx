import { useMemo, useRef, useState } from 'react';
import { useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { formatPrice, orderNumber } from '../lib/format.js';
import { nextDays, dayShort, dateShort } from '../lib/time.js';
import { useCart, cartSubtotal } from '../store/cart.js';
import { useUI } from '../store/ui.js';
import { brand, woods, fabrics } from '../data/brand.js';
import { go, TLink } from '../components/DoorTransition.jsx';
import Img from '../components/Img.jsx';

const CITIES = ['Lahore', 'Islamabad', 'Rawalpindi', 'Karachi', 'Faisalabad', 'Multan', 'Sialkot', 'Peshawar'];
const SLOTS = ['Morning · 10–1', 'Afternoon · 2–6'];

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mono text-taupe">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[13px] text-clay">{error}</span>}
    </label>
  );
}
const inputCls = 'mt-1 min-h-[46px] w-full border-b border-espresso/30 bg-transparent text-[17px] placeholder:text-taupe/50 focus:border-espresso focus:outline-none';

export default function Checkout() {
  const root = useRef(null);
  const title = useRef(null);
  const items = useCart((s) => s.items);
  const subtotal = useCart(cartSubtotal);
  const clear = useCart((s) => s.clear);
  const setCart = useUI((s) => s.setCart);
  const days = useMemo(() => nextDays(14).filter((d) => d.getDay() !== 0), []);
  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', city: 'Lahore', card: '', exp: '', cvc: '', cardName: '' });
  const [day, setDay] = useState(4);
  const [slot, setSlot] = useState(0);
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);

  useGSAP(() => flipChars(title.current, { trigger: false, delay: 0.1 }), { scope: root });

  const delivery = items.length ? brand.deliveryFee : 0;
  const gst = Math.round(subtotal * brand.gst);
  const total = subtotal + delivery + gst;

  const set = (k) => (e) => {
    let v = e.target.value;
    if (k === 'card') v = v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (k === 'exp') v = v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
    if (k === 'cvc') v = v.replace(/\D/g, '').slice(0, 4);
    setF((s) => ({ ...s, [k]: v }));
  };

  const place = (e) => {
    e.preventDefault();
    const err = {};
    if (f.name.trim().length < 2) err.name = 'Your full name, please.';
    if (f.phone.replace(/\D/g, '').length < 10) err.phone = 'A number our driver can call.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) err.email = 'We send the delivery timeline here.';
    if (f.address.trim().length < 8) err.address = 'House, street and area.';
    if (f.card.replace(/\D/g, '').length < 16) err.card = 'Sixteen digits (this is a mock, any will do).';
    if (!/^\d{2}\/\d{2}$/.test(f.exp)) err.exp = 'MM/YY';
    if (f.cvc.length < 3) err.cvc = '3 digits';
    setErrors(err);
    if (Object.keys(err).length) {
      root.current.querySelector(`[name="${Object.keys(err)[0]}"]`)?.focus();
      return;
    }
    setPlacing(true);
    const id = orderNumber();
    const order = { id, total, city: f.city, name: f.name.split(' ')[0], placed: Date.now(), delivery: days[day].getTime(), items };
    try {
      sessionStorage.setItem(`taaq-order-${id}`, JSON.stringify(order));
    } catch {
      /* private mode */
    }
    setTimeout(() => {
      clear();
      setCart(false);
      go(`/order/${id}`);
    }, 500);
  };

  if (!items.length) {
    return (
      <section ref={root} className="wrap flex min-h-[80svh] flex-col items-start justify-center pt-[var(--nav-h)]">
        <p className="mono text-taupe">Checkout</p>
        <h1 ref={title} className="display mt-4 text-section">
          Your drawer is <i>empty.</i>
        </h1>
        <TLink to="/shop" className="btn-clay mt-8">
          Browse the collection
        </TLink>
      </section>
    );
  }

  return (
    <div ref={root} className="pb-[14vh] pt-[calc(var(--nav-h)+6vh)]">
      <header className="wrap mb-12">
        <p className="mono text-taupe">Checkout · {items.length} piece{items.length > 1 ? 's' : ''}</p>
        <h1 ref={title} className="display mt-4 text-section">
          Almost <i>home.</i>
        </h1>
      </header>
      <form onSubmit={place} noValidate className="wrap grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-14 lg:col-span-7">
          <fieldset className="grid gap-6 sm:grid-cols-2">
            <legend className="display mb-6 text-2xl">Delivery details</legend>
            <Field label="Full name" error={errors.name}>
              <input name="name" value={f.name} onChange={set('name')} autoComplete="name" className={inputCls} />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input name="phone" value={f.phone} onChange={set('phone')} type="tel" autoComplete="tel" placeholder="+92 3xx xxxxxxx" className={inputCls} />
            </Field>
            <Field label="Email" error={errors.email}>
              <input name="email" value={f.email} onChange={set('email')} type="email" autoComplete="email" className={inputCls} />
            </Field>
            <Field label="City">
              <select name="city" value={f.city} onChange={set('city')} className={inputCls}>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address" error={errors.address}>
                <input name="address" value={f.address} onChange={set('address')} autoComplete="street-address" placeholder="House 12, Street 4, Sector …" className={inputCls} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="display mb-2 text-2xl">Delivery slot</legend>
            <p className="mb-5 text-[14px] text-taupe">Two people, blankets, gloves. We carry it in, place it, and take the packaging away.</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="Delivery day">
              {days.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={day === i}
                  onClick={() => setDay(i)}
                  className={`flex min-h-[60px] flex-col items-center justify-center rounded-sm border transition-colors ${day === i ? 'border-espresso bg-espresso text-linen' : 'border-espresso/15 hover:border-espresso'}`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em]">{dayShort(d)}</span>
                  <span className="text-[15px]">{dateShort(d)}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Delivery time">
              {SLOTS.map((s, i) => (
                <button key={s} type="button" role="radio" aria-checked={slot === i} onClick={() => setSlot(i)} className={`min-h-[44px] rounded-full border px-5 font-mono text-[12px] ${slot === i ? 'border-clay bg-clay text-linen' : 'border-espresso/20'}`}>
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="grid gap-6 sm:grid-cols-4">
            <legend className="display mb-2 text-2xl">Payment</legend>
            <p className="mono -mt-2 text-taupe sm:col-span-4">A mock card form. Nothing is charged.</p>
            <div className="sm:col-span-4">
              <Field label="Card number" error={errors.card}>
                <input name="card" value={f.card} onChange={set('card')} inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" className={`${inputCls} font-mono`} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Name on card">
                <input name="cardName" value={f.cardName} onChange={set('cardName')} autoComplete="cc-name" className={inputCls} />
              </Field>
            </div>
            <Field label="Expiry" error={errors.exp}>
              <input name="exp" value={f.exp} onChange={set('exp')} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" className={`${inputCls} font-mono`} />
            </Field>
            <Field label="CVC" error={errors.cvc}>
              <input name="cvc" value={f.cvc} onChange={set('cvc')} inputMode="numeric" autoComplete="cc-csc" placeholder="123" className={`${inputCls} font-mono`} />
            </Field>
          </fieldset>
        </div>

        <aside className="lg:col-span-5">
          <div className="paper rounded-sm p-6 shadow-niche lg:sticky lg:top-28 md:p-8">
            <p className="display text-2xl">Summary</p>
            <ul className="mt-5 divide-y divide-brass/30">
              {items.map((it) => (
                <li key={it.key} className="flex gap-4 py-4">
                  <Img src={it.image} alt={it.name} className="aspect-[4/5] w-14 shrink-0 rounded-t-[999px] bg-plaster" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px]">{it.name}</p>
                    <p className="mono text-taupe">
                      {[woods.find((w) => w.id === it.wood)?.name, fabrics.find((x) => x.id === it.fabric)?.name, it.size === 'wide' ? 'Wide' : null].filter(Boolean).join(' · ')} · ×{it.qty}
                    </p>
                  </div>
                  <span className="font-mono text-[13px]">{formatPrice(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t hairline pt-4 font-mono text-[12px] uppercase tracking-[0.1em]">
              <div className="flex justify-between"><dt className="text-taupe">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-taupe">White-glove delivery</dt><dd>{formatPrice(delivery)}</dd></div>
              <div className="flex justify-between"><dt className="text-taupe">GST 18%</dt><dd>{formatPrice(gst)}</dd></div>
              <div className="flex items-baseline justify-between border-t hairline pt-3 text-espresso"><dt>Total</dt><dd className="display text-3xl normal-case tracking-normal">{formatPrice(total)}</dd></div>
            </dl>
            <button type="submit" className="btn-clay mt-6 w-full" disabled={placing}>
              {placing ? 'Placing your order…' : 'Place order'}
            </button>
            <p className="mono mt-4 text-center text-taupe">{brand.deliveryNote}</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
