import { useEffect, useRef, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { gsap, Draggable, useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { isMobile, reducedMotion } from '../lib/env.js';
import { playClick, playThud } from '../lib/sound.js';
import { homes } from '../data/homes.js';
import { bySlug } from '../data/products.js';
import Img from '../components/Img.jsx';

function Polaroid({ home, innerRef, cardRef, onFlip, style, className = '' }) {
  return (
    <div
      ref={innerRef}
      className={`polaroid absolute left-0 top-0 select-none ${className}`}
      style={style}
      tabIndex={0}
      role="button"
      aria-label={`${home.caption}. Press Enter to turn it over.`}
      onDoubleClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      <div ref={cardRef} className="preserve-3d relative">
        <div className="backface-hidden bg-[#FBF8F3] p-[7%] pb-[30%] shadow-[0_14px_30px_-12px_rgba(0,0,0,.6)]">
          <Img src={home.image} alt={home.caption} className="aspect-square w-full bg-plaster" />
          <p className="absolute inset-x-[7%] bottom-[5%] line-clamp-2 font-hand text-[clamp(0.95rem,1.25vw,1.2rem)] leading-[1.1] text-espresso/85">{home.caption}</p>
        </div>
        <div className="backface-hidden absolute inset-0 flex flex-col bg-[#FBF8F3] p-[9%] shadow-[0_14px_30px_-12px_rgba(0,0,0,.6)]" style={{ transform: 'rotateY(180deg)' }}>
          <p className="display text-[clamp(1rem,1.35vw,1.25rem)] italic leading-snug">“{home.quote}”</p>
          <p className="font-hand mt-3 text-xl text-walnut">— {home.owner}</p>
          <p className="mono mt-auto text-[9.5px] text-taupe">{home.products.map((s) => bySlug[s].name).join(' · ')}</p>
        </div>
      </div>
    </div>
  );
}

function Table() {
  const table = useRef(null);
  const cards = useRef([]);
  const faces = useRef([]);
  const flipped = useRef(homes.map(() => false));
  const z = useRef(10);

  const scatter = (animate) => {
    const t = table.current;
    if (!t) return;
    const tw = t.clientWidth;
    const th = t.clientHeight;
    const cols = 4;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const cw = (tw - w) / (cols - 1);
      const ch = th - h;
      const x = Math.max(0, Math.min(tw - w, (i % cols) * cw + gsap.utils.random(-40, 40)));
      const y = Math.max(0, Math.min(th - h, (i < cols ? 0.05 : 0.5) * ch + gsap.utils.random(0, ch * 0.4)));
      const rotation = gsap.utils.random(-12, 12);
      if (flipped.current[i]) {
        flipped.current[i] = false;
        gsap.to(faces.current[i], { rotationY: 0, duration: 0.6 });
      }
      if (animate && !reducedMotion) gsap.to(el, { x, y, rotation, duration: 1.1, ease: 'expo.out', delay: i * 0.05 });
      else gsap.set(el, { x, y, rotation });
    });
  };

  const flip = (i) => {
    flipped.current[i] = !flipped.current[i];
    playClick();
    gsap.to(faces.current[i], { rotationY: flipped.current[i] ? 180 : 0, duration: 0.9, ease: 'expo.out', transformPerspective: 1000 });
  };

  useEffect(() => {
    scatter(false);
    const drags = Draggable.create(cards.current.filter(Boolean), {
      type: 'x,y',
      bounds: table.current,
      inertia: true,
      zIndexBoost: false,
      onPress() {
        z.current += 1;
        gsap.set(this.target, { zIndex: z.current });
        gsap.to(this.target, { scale: 1.05, duration: 0.3, ease: 'power2.out', boxShadow: '0 40px 60px -20px rgba(0,0,0,.55)' });
      },
      onRelease() {
        if (!this.isThrowing) drop(this.target);
      },
      onThrowComplete() {
        drop(this.target);
      },
    });
    function drop(el) {
      playThud(0.4);
      gsap.to(el, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)', boxShadow: '0 0 0 rgba(0,0,0,0)' });
    }
    const onResize = () => scatter(false);
    window.addEventListener('resize', onResize);
    return () => {
      drags.forEach((d) => d.kill());
      window.removeEventListener('resize', onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div
        ref={table}
        className="relative mx-[var(--gutter)] h-[min(92vh,820px)] overflow-hidden rounded-[18px]"
        style={{
          backgroundImage: "radial-gradient(120% 80% at 50% 30%, rgba(255,214,160,.18), transparent 60%), linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.35)), url('/textures/wood-walnut.jpg'), repeating-linear-gradient(92deg, #5a3a25 0 18px, #4e321f 18px 30px, #63412a 30px 52px)",
          backgroundSize: 'cover, cover, 900px auto, auto',
          boxShadow: 'inset 0 0 120px rgba(0,0,0,.45), 0 40px 70px -30px rgba(27,22,18,.6)',
        }}
      >
        {homes.map((h, i) => (
          <Polaroid
            key={h.id}
            home={h}
            innerRef={(el) => (cards.current[i] = el)}
            cardRef={(el) => (faces.current[i] = el)}
            onFlip={() => flip(i)}
            style={{ width: 'clamp(170px, 16vw, 250px)' }}
          />
        ))}
      </div>
      <div className="wrap mt-6 flex items-center justify-between">
        <p className="mono text-taupe">Drag them around · Double-click to turn one over</p>
        <button
          type="button"
          className="btn-line"
          onClick={() => {
            playClick();
            scatter(true);
          }}
        >
          <Shuffle size={16} strokeWidth={1.5} /> Shuffle
        </button>
      </div>
    </>
  );
}

function Stack() {
  const [order, setOrder] = useState(() => homes.map((_, i) => i));
  const [flipped, setFlipped] = useState(false);
  const top = useRef(null);
  const face = useRef(null);

  useEffect(() => {
    if (!top.current) return undefined;
    const [d] = Draggable.create(top.current, {
      type: 'x',
      inertia: false,
      onDragEnd() {
        if (Math.abs(this.x) > 90) {
          const dir = Math.sign(this.x);
          gsap.to(this.target, {
            x: dir * window.innerWidth,
            rotation: dir * 25,
            opacity: 0,
            duration: 0.45,
            ease: 'power2.in',
            onComplete: () => {
              setFlipped(false);
              setOrder((o) => [...o.slice(1), o[0]]);
            },
          });
        } else gsap.to(this.target, { x: 0, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      },
      onClick() {
        setFlipped((f) => !f);
      },
    });
    return () => d.kill();
  }, [order]);

  useEffect(() => {
    if (face.current) gsap.to(face.current, { rotationY: flipped ? 180 : 0, duration: 0.8, ease: 'expo.out', transformPerspective: 900 });
  }, [flipped]);

  return (
    <div className="wrap">
      <div className="relative mx-auto h-[min(118vw,520px)] w-[min(78vw,340px)]">
        {order
          .slice(0, 4)
          .reverse()
          .map((idx, k, arr) => {
            const isTop = k === arr.length - 1;
            const depth = arr.length - 1 - k;
            return (
              <Polaroid
                key={homes[idx].id}
                home={homes[idx]}
                innerRef={isTop ? top : undefined}
                cardRef={isTop ? face : undefined}
                onFlip={() => setFlipped((f) => !f)}
                className="w-full"
                style={{ transform: `translateY(${depth * 10}px) rotate(${(idx % 2 ? 1 : -1) * (2 + depth * 2)}deg)`, zIndex: k }}
              />
            );
          })}
      </div>
      <p className="mono mt-6 text-center text-taupe">Swipe for the next home · Tap to turn it over</p>
    </div>
  );
}

export default function Homes() {
  const root = useRef(null);
  const title = useRef(null);
  const [mobile] = useState(isMobile);
  useGSAP(() => flipChars(title.current), { scope: root });
  return (
    <section ref={root} id="homes" data-chapter="09" aria-label="Homes" className="relative py-[12vh]">
      <div className="wrap mb-10 grid gap-6 md:mb-14 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="mono text-taupe">09 — Homes</p>
          <h2 ref={title} className="display mt-4 text-section">
            Sent back, <i>years later</i>
          </h2>
        </div>
        <p className="max-w-[36ch] self-end text-[15px] leading-relaxed text-espresso/75 md:col-span-4">
          We ask everyone who buys from us for one photograph, a few years on. These are some of the ones that came back.
        </p>
      </div>
      {mobile ? <Stack /> : <Table />}
    </section>
  );
}
