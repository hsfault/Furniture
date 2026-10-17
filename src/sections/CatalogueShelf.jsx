import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { reducedMotion } from '../lib/env.js';
import { playClick } from '../lib/sound.js';
import { collections } from '../data/collections.js';
import Img from '../components/Img.jsx';
import Book from './Book.jsx';

const foil = 'linear-gradient(90deg,#8e6b3a,#f0d6a0 45%,#b8935a 60%,#7a5a2e)';

function Spine({ col, onOpen }) {
  return (
    <li className="book-slot shrink-0" style={{ width: col.thickness }}>
      <button
        type="button"
        onClick={(e) => onOpen(col, e.currentTarget)}
        className="cloth group relative flex w-full flex-col items-center justify-between rounded-t-[3px] py-3 transition-transform duration-500 ease-expo hover:-translate-y-3 focus-visible:-translate-y-3"
        style={{
          height: col.height,
          backgroundColor: col.cloth,
          color: col.ink,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.18), 6px 0 10px -6px rgba(0,0,0,.6)',
        }}
        aria-label={`Open ${col.name}, collection ${col.number}`}
        data-cursor="OPEN"
        data-cursor-caption={col.line}
      >
        <span className="font-mono text-[10px] tracking-[0.12em]" style={{ color: '#e6c991' }}>
          {col.number}
        </span>
        <span className="absolute inset-x-0 top-9 h-[3px]" style={{ background: foil }} />
        <span className="absolute inset-x-0 top-[44px] h-px" style={{ background: foil }} />
        <span className="display text-[clamp(1.05rem,1.5vw,1.3rem)] leading-none" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          {col.name}
        </span>
        <span className="absolute inset-x-0 bottom-[46px] h-px" style={{ background: foil }} />
        <span className="absolute inset-x-0 bottom-[50px] h-[3px]" style={{ background: foil }} />
        <span className="font-mono text-[7px] tracking-[0.2em]" style={{ color: '#e6c991' }}>
          TAAQ
        </span>
      </button>
    </li>
  );
}

export default function CatalogueShelf() {
  const root = useRef(null);
  const title = useRef(null);
  const caseRef = useRef(null);
  const row = useRef(null);
  const [open, setOpen] = useState(null);
  const [overflow, setOverflow] = useState(false);

  useGSAP(
    () => {
      flipChars(title.current);
      if (reducedMotion) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: caseRef.current, start: 'top 80%', once: true } });
      tl.from(caseRef.current, { opacity: 0, y: 60, duration: 1.1, ease: 'expo.out' });
      tl.from('.book-slot, .shelf-prop', { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.05 }, 0.35);
    },
    { scope: root },
  );

  // On small screens the shelf scrolls sideways; the wheel scrolls it while hovered.
  useEffect(() => {
    const el = row.current;
    const measure = () => setOverflow(el.scrollWidth > el.clientWidth + 2);
    measure();
    window.addEventListener('resize', measure);
    const onWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth + 2 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('resize', measure);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <section ref={root} id="library" data-chapter="06" aria-label="The Library" className="relative py-[14vh]">
      <div className="wrap mb-12 grid gap-6 md:mb-16 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="mono text-taupe">06 — The Library</p>
          <h2 ref={title} className="display mt-4 text-section">
            Every collection, <i>a book.</i>
          </h2>
        </div>
        <p className="max-w-[36ch] self-end text-[15px] leading-relaxed text-espresso/75 md:col-span-4">
          Eight collections, bound in cloth and kept on one walnut shelf. Each one opens to its story, its pieces and the woods it is made from.
        </p>
      </div>

      <div className="px-3 md:px-[var(--gutter)]">
        <div
          ref={caseRef}
          className="relative mx-auto max-w-[1280px] rounded-[18px] p-3 md:p-6"
          style={{
            background: 'linear-gradient(180deg,#3B2618,#24160D)',
            boxShadow: '0 50px 80px -30px rgba(27,22,18,.65), inset 0 1px 0 rgba(255,220,170,.12)',
          }}
        >
          <div
            className="relative overflow-hidden rounded-[10px]"
            style={{
              background: 'radial-gradient(90% 70% at 50% -10%, rgba(255,214,150,.28), transparent 60%), linear-gradient(180deg,#2c1b10,#1d120a)',
              boxShadow: 'inset 0 30px 40px -20px rgba(0,0,0,.7), inset 0 0 0 1px rgba(0,0,0,.4)',
            }}
          >
            <ul
              ref={row}
              className="no-scrollbar flex items-end gap-[5px] overflow-x-auto overflow-y-hidden px-5 pt-20 md:px-10"
              data-lenis-prevent={overflow ? '' : undefined}
              aria-label="Collections"
            >
              {collections.map((c) => (
                <Spine
                  key={c.id}
                  col={c}
                  onOpen={(col, el) => {
                    playClick();
                    setOpen({ col, el });
                  }}
                />
              ))}
              <li className="book-slot shrink-0" aria-label="Coming soon">
                <div className="flex h-[300px] w-[50px] items-center justify-center rounded-t-[3px] border border-dashed border-[#c9a46a]/50">
                  <span className="mono text-[#c9a46a]/70" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    Coming soon
                  </span>
                </div>
              </li>
              {/* bookend */}
              <li className="shelf-prop ml-1 shrink-0" aria-hidden="true">
                <div className="relative h-[170px] w-[54px]">
                  <div className="absolute bottom-0 left-0 h-[10px] w-[54px] rounded-[2px]" style={{ background: foil }} />
                  <div className="absolute bottom-0 left-0 h-[170px] w-[10px] rounded-t-[999px]" style={{ background: 'linear-gradient(90deg,#7a5a2e,#f0d6a0 40%,#b8935a)' }} />
                </div>
              </li>
              {/* potted plant */}
              <li className="shelf-prop ml-8 shrink-0" aria-hidden="true">
                <svg width="110" height="200" viewBox="0 0 110 200">
                  <g fill="none" stroke="#6f7f5e" strokeWidth="2" strokeLinecap="round">
                    <path d="M55 140 C50 100 30 80 14 64" />
                    <path d="M55 140 C58 96 70 62 92 40" />
                    <path d="M55 140 C54 110 52 70 48 20" />
                  </g>
                  {[[16, 64, -40], [30, 82, -30], [92, 40, 40], [76, 66, 30], [48, 22, 5], [52, 52, -10], [64, 90, 20]].map(([x, y, r], i) => (
                    <ellipse key={i} cx={x} cy={y} rx="13" ry="5.5" fill={i % 2 ? '#8C9A7E' : '#71805f'} transform={`rotate(${r} ${x} ${y})`} />
                  ))}
                  <path d="M28 140 H82 L76 196 H34 Z" fill="#B5643F" />
                  <path d="M26 140 H84 V150 H26 Z" fill="#c2693e" />
                </svg>
              </li>
              {/* tilted frame: the Chiniot workshop */}
              <li className="shelf-prop ml-4 mr-6 shrink-0" aria-hidden="false">
                <figure className="origin-bottom-left rotate-[-7deg] rounded-[2px] p-[7px]" style={{ background: 'linear-gradient(135deg,#6a452c,#3e2716)', boxShadow: '6px 10px 16px rgba(0,0,0,.5)' }}>
                  <div className="bg-linen p-[6px]">
                    <Img src="/images/library-workshop.jpg" alt="The workshop in Chiniot, sawdust in the light" className="h-[118px] w-[150px]" />
                  </div>
                </figure>
              </li>
            </ul>
            {/* shelf plank */}
            <div className="relative h-7 md:h-8" style={{ background: 'linear-gradient(180deg,#6a452c,#4a2f1e 40%,#2e1c11)', boxShadow: '0 -6px 14px rgba(0,0,0,.45)' }}>
              <div className="absolute inset-x-0 top-0 h-px bg-[#e8c79a]/40" />
            </div>
          </div>
        </div>
        <p className="mono mt-6 text-center text-taupe">Pick a book to open it</p>
      </div>

      {open && <Book col={open.col} spine={open.el} onClosed={() => setOpen(null)} />}
    </section>
  );
}
