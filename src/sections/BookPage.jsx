import { useRef } from 'react';
import { collectionStats } from '../data/collections.js';
import { woods, fabrics, brand } from '../data/brand.js';
import { formatPrice, formatDims } from '../lib/format.js';
import { fmtHour } from '../lib/time.js';
import { go } from '../components/DoorTransition.jsx';
import Img from '../components/Img.jsx';

export const PAGES = 7;

const foil = 'linear-gradient(90deg,#9c7843,#f0d6a0 45%,#b8935a 60%,#8e6b3a)';

function Folio({ n, col }) {
  return (
    <div className="mt-auto flex items-center justify-between pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-taupe">
      <span>{col.name}</span>
      <span>
        {n} / {PAGES}
      </span>
    </div>
  );
}

function AddPiece({ product, onAdd }) {
  const img = useRef(null);
  return (
    <div className="bp-line flex min-h-0 flex-1 gap-3 border-t hairline pt-3">
      <div ref={img} className="w-[38%] shrink-0">
        <Img src={product.image} alt={product.name} className="aspect-[4/5] w-full rounded-t-[999px] bg-plaster" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="display text-[clamp(1rem,1.6vw,1.35rem)] leading-tight">{product.name}</p>
        <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-taupe">{formatDims(product.dims)}</p>
        <p className="mt-1 font-mono text-[11px]">{formatPrice(product.price)}</p>
        <div className="mt-auto flex flex-wrap gap-x-3">
          <button type="button" className="inline-flex min-h-[40px] items-center text-[13px] text-clay underline-offset-4 hover:underline" onClick={() => onAdd(product, img.current)}>
            Add to cart
          </button>
          <button type="button" className="inline-flex min-h-[40px] items-center text-[13px] underline-offset-4 hover:underline" onClick={() => go(`/product/${product.slug}`)}>
            View
          </button>
        </div>
      </div>
    </div>
  );
}

/** A right-hand page. */
export function Page({ col, n, onAdd }) {
  const stats = collectionStats(col);
  const woodNames = stats.woods.map((id) => woods.find((w) => w.id === id)?.name).filter(Boolean);
  const pad = 'flex h-full flex-col p-[clamp(1rem,2.4vw,2rem)]';

  if (n === 1) {
    return (
      <div className={pad}>
        <p className="bp-line mono text-taupe">Collection {col.number}</p>
        <h3 className="bp-line display mt-3 text-[clamp(2rem,4vw,3.4rem)] leading-[0.95]">{col.name}</h3>
        <p className="bp-line mt-4 text-[clamp(.9rem,1.2vw,1.05rem)] leading-relaxed text-espresso/80">{col.line}</p>
        <div className="bp-line my-5 h-px w-16" style={{ background: foil }} />
        <dl className="bp-line space-y-2 font-mono text-[11px] uppercase tracking-[0.12em]">
          <div className="flex justify-between gap-3 border-b hairline pb-2"><dt className="text-taupe">Pieces</dt><dd>{stats.count}</dd></div>
          <div className="flex justify-between gap-3 border-b hairline pb-2"><dt className="text-taupe">Woods</dt><dd className="text-right">{woodNames.join(', ')}</dd></div>
          <div className="flex justify-between gap-3 border-b hairline pb-2"><dt className="text-taupe">From</dt><dd>{formatPrice(stats.from)}</dd></div>
        </dl>
        <button type="button" className="bp-line btn-clay mt-6 self-start" onClick={() => go(`/shop?col=${col.id}`)}>
          Shop this collection
        </button>
        <Folio n={n} col={col} />
      </div>
    );
  }
  if (n === 2) {
    return (
      <div className={pad}>
        <p className="bp-line mono text-taupe">The story</p>
        <p className="bp-line display mt-4 text-[clamp(1.05rem,1.55vw,1.35rem)] italic leading-[1.45] text-espresso/90">{col.essay}</p>
        <div className="bp-line mt-auto flex items-end gap-4 pt-4">
          <Img src={col.image} alt={`${col.name} collection`} className="aspect-[4/5] w-[34%] rounded-t-[999px] bg-plaster" />
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-taupe">Photographed at the Lahore showroom</p>
        </div>
        <Folio n={n} col={col} />
      </div>
    );
  }
  if (n >= 3 && n <= 5) {
    const items = stats.items.slice((n - 3) * 2, (n - 3) * 2 + 2);
    return (
      <div className={pad}>
        <p className="bp-line mono mb-3 text-taupe">The pieces · {n - 2} of 3</p>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {items.map((p) => (
            <AddPiece key={p.slug} product={p} onAdd={onAdd} />
          ))}
        </div>
        <Folio n={n} col={col} />
      </div>
    );
  }
  if (n === 6) {
    const ws = stats.woods.map((id) => woods.find((w) => w.id === id)).filter(Boolean);
    const fs = col.id === 'living' || col.id === 'study' ? fabrics.slice(0, 2) : [];
    return (
      <div className={pad}>
        <p className="bp-line mono text-taupe">Materials & care</p>
        <ul className="mt-4 space-y-3">
          {[...ws, ...fs].map((m) => (
            <li key={m.id} className="bp-line flex gap-3">
              <span className="mt-0.5 block h-7 w-7 shrink-0 rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,.2)]" style={{ background: `radial-gradient(circle at 35% 30%, ${m.tint || m.hex}, ${m.hex})` }} />
              <div>
                <p className="display text-lg leading-tight">{m.name}</p>
                <p className="text-[12.5px] leading-snug text-espresso/70">{m.care}</p>
              </div>
            </li>
          ))}
        </ul>
        <Folio n={n} col={col} />
      </div>
    );
  }
  const weekday = brand.hours[1];
  return (
    <div className={pad}>
      <p className="bp-line mono text-taupe">Visit</p>
      <h3 className="bp-line display mt-3 text-[clamp(1.8rem,3vw,2.6rem)] leading-none">
        See it <i>in person.</i>
      </h3>
      <p className="bp-line mt-4 text-[14px] leading-relaxed text-espresso/80">
        Sit in it, open the drawers, run a hand along the grain. Every piece in this book is on the floor at the showroom.
      </p>
      <address className="bp-line mt-5 font-mono text-[11px] uppercase not-italic tracking-[0.12em]">
        {brand.showroom.line1}
        <br />
        {brand.showroom.line2}
        <br />
        <span className="text-taupe">
          Mon–Sat {fmtHour(weekday.open)}–{fmtHour(weekday.close)}
        </span>
      </address>
      <button type="button" className="bp-line btn-clay mt-6 self-start" onClick={() => go('/#visit')}>
        Book a visit
      </button>
      <Folio n={n} col={col} />
    </div>
  );
}

/** The left-hand page facing right page n + 1. */
export function Verso({ col, n }) {
  const quotes = col.essay.split('. ');
  const quote = quotes[Math.min(quotes.length - 1, Math.floor(n / 2))];
  return (
    <div className="relative flex h-full flex-col p-[clamp(1rem,2.4vw,2rem)]">
      <p className="mono text-taupe">TAAQ — {col.name}</p>
      {n % 2 ? (
        <Img src={col.image} alt="" className="mx-auto mt-6 aspect-[4/5] w-[70%] rounded-t-[999px] bg-plaster shadow-niche" />
      ) : (
        <p className="display mt-auto text-[clamp(1.3rem,2.2vw,2rem)] italic leading-[1.25] text-espresso/85">“{quote.replace(/\.$/, '')}.”</p>
      )}
      <p className="display pointer-events-none absolute bottom-6 right-6 text-[clamp(4rem,9vw,8rem)] leading-none text-espresso/[0.06]">{String(n).padStart(2, '0')}</p>
      <div className="mt-auto pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-taupe">{col.number}</div>
    </div>
  );
}

/** Inside of the front cover (left page before the first turn). */
export function InsideCover({ col }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center p-8 text-center" style={{ background: 'linear-gradient(90deg,#efe6d6,#f7f3ee 30%)' }}>
      <p className="display text-2xl tracking-[0.3em]">TAAQ</p>
      <div className="my-5 h-px w-20" style={{ background: foil }} />
      <p className="mono text-taupe">Furniture that stays</p>
      <p className="display pointer-events-none absolute inset-x-0 bottom-[8%] text-[clamp(7rem,16vw,13rem)] leading-none text-espresso/[0.07]">{col.number}</p>
    </div>
  );
}

/** Front of the cover. */
export function CoverFront({ col }) {
  return (
    <div className="cloth relative flex h-full flex-col items-center justify-between overflow-hidden py-[12%] text-center" style={{ backgroundColor: col.cloth, color: col.ink }}>
      <div className="absolute inset-[6%] border" style={{ borderColor: 'rgba(240,214,160,.5)' }} />
      <p className="relative font-mono text-[11px] tracking-[0.3em]" style={{ color: '#e6c991' }}>
        {col.number}
      </p>
      <div className="relative">
        <span className="mx-auto mb-5 block h-14 w-10 rounded-t-full border" style={{ borderColor: '#e6c991' }} />
        <p className="display px-6 text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.02]">{col.name}</p>
      </div>
      <p className="relative font-mono text-[10px] tracking-[0.4em]" style={{ color: '#e6c991' }}>
        TAAQ
      </p>
    </div>
  );
}
