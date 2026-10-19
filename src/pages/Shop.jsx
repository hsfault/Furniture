import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { gsap, Flip, useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { reducedMotion } from '../lib/env.js';
import { formatPrice, formatDims } from '../lib/format.js';
import { products, categories, matchesCategory } from '../data/products.js';
import { collections } from '../data/collections.js';
import { woods } from '../data/brand.js';
import { useUI } from '../store/ui.js';
import { TLink } from '../components/DoorTransition.jsx';
import GLImage from '../gl/GLImage.jsx';

const MAX = Math.ceil(Math.max(...products.map((p) => p.price)) / 10000) * 10000;
const SORTS = {
  featured: { label: 'Featured', fn: () => 0 },
  low: { label: 'Price, low to high', fn: (a, b) => a.price - b.price },
  high: { label: 'Price, high to low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name', fn: (a, b) => a.name.localeCompare(b.name) },
};

function Row({ p, index, visible, total }) {
  const openSheet = useUI((s) => s.openSheet);
  const frame = useRef(null);
  const flipSide = index % 2 === 1;
  return (
    <article
      data-flip-id={p.slug}
      className={`shop-row grid items-center gap-6 border-t hairline py-10 md:grid-cols-12 md:gap-8 md:py-14 ${visible ? '' : 'hidden'}`}
    >
      <div ref={frame} className={`md:col-span-6 ${flipSide ? 'md:order-2 md:col-start-7' : ''}`}>
        <TLink to={`/product/${p.slug}`} aria-label={p.name} className="block">
          <GLImage
            src={p.image}
            alt={p.name}
            shape={index % 3 === 0 ? 'arch' : 'rect'}
            radius={3}
            className={index % 2 ? 'aspect-[5/4] w-full' : 'aspect-[4/5] w-full md:w-[86%]'}
          />
        </TLink>
      </div>
      <div className={`md:col-span-5 ${flipSide ? 'md:order-1 md:col-start-1' : 'md:col-start-8'}`}>
        <p className="mono text-taupe">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} · {p.category}
        </p>
        <h2 className="display mt-3 text-[clamp(2rem,4.2vw,3.8rem)] leading-[0.98] tracking-[-0.02em]">{p.name}</h2>
        <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-espresso/75">{p.story}</p>
        <p className="mono mt-5 text-taupe">{formatDims(p.dims)}</p>
        <div className="mt-4 flex items-center gap-2" aria-label={`Woods: ${p.woods.map((w) => woods.find((x) => x.id === w)?.name).join(', ')}`}>
          {p.woods.map((w) => {
            const wd = woods.find((x) => x.id === w);
            return <span key={w} title={wd.name} className="h-4 w-4 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.15)]" style={{ background: `radial-gradient(circle at 35% 30%, ${wd.tint}, ${wd.hex})` }} />;
          })}
          <span className={`mono ml-3 ${p.inStock ? 'text-sage-ink' : 'text-taupe'}`}>{p.inStock ? 'In stock' : 'Made to order'}</span>
        </div>
        <div className="mt-6 flex items-center gap-5">
          <span className="display text-3xl">{formatPrice(p.price)}</span>
          <button
            type="button"
            onClick={() => openSheet(p.slug, frame.current.querySelector('.gl-frame'))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-espresso/30 transition-colors hover:border-clay hover:bg-clay hover:text-linen"
            aria-label={`Quick view: ${p.name}`}
          >
            <Plus size={18} strokeWidth={1.4} />
          </button>
          <TLink to={`/product/${p.slug}`} className="uline text-[15px]">
            View piece <span aria-hidden="true">→</span>
          </TLink>
        </div>
      </div>
    </article>
  );
}

export default function Shop() {
  const root = useRef(null);
  const title = useRef(null);
  const [params] = useSearchParams();
  const [cat, setCat] = useState(() => (categories.includes(params.get('c')) ? params.get('c') : 'All'));
  const [col, setCol] = useState(() => params.get('col'));
  const [woodSel, setWoodSel] = useState([]);
  const [cap, setCap] = useState(MAX);
  const [capDraft, setCapDraft] = useState(MAX);
  const [stock, setStock] = useState('all');
  const [sort, setSort] = useState('featured');
  const [railOpen, setRailOpen] = useState(false);
  const flipState = useRef(null);

  useGSAP(() => flipChars(title.current, { trigger: false, delay: 0.1 }), { scope: root });

  const change = (fn) => (v) => {
    if (!reducedMotion) flipState.current = Flip.getState(root.current.querySelectorAll('.shop-row'));
    fn(v);
  };

  const visibleList = useMemo(() => {
    const list = products.filter(
      (p) =>
        matchesCategory(p, cat) &&
        (!col || p.collections.includes(col)) &&
        (!woodSel.length || p.woods.some((w) => woodSel.includes(w))) &&
        p.price <= cap &&
        (stock === 'all' || (stock === 'stock' ? p.inStock : !p.inStock)),
    );
    return [...list].sort(SORTS[sort].fn);
  }, [cat, col, woodSel, cap, stock, sort]);
  const visibleSet = new Set(visibleList.map((p) => p.slug));
  const ordered = [...visibleList, ...products.filter((p) => !visibleSet.has(p.slug))];

  useLayoutEffect(() => {
    if (!flipState.current) return;
    Flip.from(flipState.current, {
      duration: 0.8,
      ease: 'power4.inOut',
      absolute: true,
      stagger: 0.015,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }),
      onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.35 }),
    });
    flipState.current = null;
  }, [visibleList]);

  const colName = collections.find((c) => c.id === col)?.name;
  const reset = () =>
    change(() => {
      setCat('All');
      setCol(null);
      setWoodSel([]);
      setCap(MAX);
      setCapDraft(MAX);
      setStock('all');
    })();

  return (
    <div ref={root} className="pb-24 pt-[calc(var(--nav-h)+8vh)]">
      <header className="wrap mb-12 grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="mono text-taupe">The index · {visibleList.length} pieces{colName ? ` · ${colName}` : ''}</p>
          <h1 ref={title} className="display mt-4 text-hero">
            The <i>Collection</i>
          </h1>
        </div>
        <p className="max-w-[38ch] self-end text-[15px] leading-relaxed text-espresso/75 md:col-span-4">
          Every piece we make, in one long index. Solid wood throughout, made to order in Chiniot unless it says otherwise.
        </p>
      </header>

      <div className="wrap grid gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <button type="button" onClick={() => setRailOpen((o) => !o)} className="btn-line w-full lg:hidden" aria-expanded={railOpen} aria-controls="filter-rail">
            <SlidersHorizontal size={16} strokeWidth={1.5} /> Filters & sort
          </button>
          <div id="filter-rail" className={`${railOpen ? 'block' : 'hidden'} mt-6 space-y-8 lg:sticky lg:top-28 lg:mt-0 lg:block`}>
            <fieldset>
              <legend className="mono mb-3 text-taupe">Category</legend>
              <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start lg:gap-0">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={cat === c}
                    onClick={() => change(setCat)(c)}
                    className={`min-h-[40px] rounded-full border px-4 text-[15px] lg:rounded-none lg:border-0 lg:px-0 ${cat === c ? 'border-espresso bg-espresso text-linen lg:bg-transparent lg:text-clay' : 'border-espresso/20 lg:text-espresso'}`}
                  >
                    <span className="hidden lg:mr-2 lg:inline">{cat === c ? '—' : ''}</span>
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>
            {col && (
              <div className="flex items-center justify-between border-t hairline pt-4">
                <span className="mono">Collection: {colName}</span>
                <button type="button" onClick={() => change(setCol)(null)} className="mono tap text-clay">
                  Clear
                </button>
              </div>
            )}
            <fieldset className="border-t hairline pt-6">
              <legend className="mono mb-3 text-taupe">Wood</legend>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {woods.map((w) => {
                  const on = woodSel.includes(w.id);
                  return (
                    <label key={w.id} className="flex min-h-[40px] cursor-pointer items-center gap-2 text-[15px]">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={on}
                        onChange={() => change(setWoodSel)(on ? woodSel.filter((x) => x !== w.id) : [...woodSel, w.id])}
                      />
                      <span className={`h-5 w-5 rounded-full ring-offset-2 ring-offset-plaster peer-focus-visible:ring-2 peer-focus-visible:ring-clay ${on ? 'ring-1 ring-espresso' : ''}`} style={{ background: `radial-gradient(circle at 35% 30%, ${w.tint}, ${w.hex})` }} />
                      {w.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <fieldset className="border-t hairline pt-6">
              <legend className="mono mb-3 text-taupe">Price</legend>
              <input
                type="range"
                min={10000}
                max={MAX}
                step={5000}
                value={capDraft}
                onChange={(e) => setCapDraft(Number(e.target.value))}
                onPointerUp={() => change(setCap)(capDraft)}
                onKeyUp={() => change(setCap)(capDraft)}
                className="w-full accent-clay"
                aria-label="Maximum price"
              />
              <p className="mono mt-2">Up to {formatPrice(capDraft)}</p>
            </fieldset>
            <fieldset className="border-t hairline pt-6">
              <legend className="mono mb-3 text-taupe">Availability</legend>
              {[
                ['all', 'Everything'],
                ['stock', 'In stock'],
                ['order', 'Made to order'],
              ].map(([v, l]) => (
                <label key={v} className="flex min-h-[40px] cursor-pointer items-center gap-3 text-[15px]">
                  <input type="radio" name="stock" value={v} checked={stock === v} onChange={() => change(setStock)(v)} className="accent-clay" />
                  {l}
                </label>
              ))}
            </fieldset>
            <label className="block border-t hairline pt-6">
              <span className="mono text-taupe">Sort</span>
              <select value={sort} onChange={(e) => change(setSort)(e.target.value)} className="mt-2 min-h-[44px] w-full border-b border-espresso/30 bg-transparent text-[15px] focus:outline-none">
                {Object.entries(SORTS).map(([k, s]) => (
                  <option key={k} value={k}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </aside>

        <div className="lg:col-span-9">
          {visibleList.length === 0 && (
            <div className="border-t hairline py-20 text-center">
              <p className="display text-3xl">Nothing on this shelf, <i>yet.</i></p>
              <button type="button" className="btn-line mt-6" onClick={reset}>
                Clear filters
              </button>
            </div>
          )}
          {ordered.map((p) => (
            <Row key={p.slug} p={p} index={visibleList.indexOf(p)} visible={visibleSet.has(p.slug)} total={visibleList.length} />
          ))}
        </div>
      </div>
    </div>
  );
}
