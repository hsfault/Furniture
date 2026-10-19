import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, ListOrdered } from 'lucide-react';
import { gsap } from '../lib/gsap.js';
import { getLenis } from '../lib/lenis.js';
import { reducedMotion } from '../lib/env.js';
import { formatTimecode } from '../lib/format.js';
import { useUI } from '../store/ui.js';
import { chapters, CUT_SECONDS } from '../data/film.js';
import { FilmCut } from '../three/FilmCutScene.js';
import SoundToggle from './SoundToggle.jsx';
import { whoosh, thud, creak } from '../lib/sound.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const seg = (a, b, x) => clamp01((x - a) / (b - a));
const absTop = (el) => el.getBoundingClientRect().top + window.scrollY;

/**
 * "Play the House": the homepage as a ~70 s film. One paused GSAP timeline
 * holds every chapter glide (driving Lenis) and every three.js door cut, so
 * play, pause, scrub and chapter jumps are all just seeks.
 */
export default function FilmPlayer() {
  const setFilm = useUI((s) => s.setFilm);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(() => chapters.reduce((s, c, i) => s + c.duration + (i ? CUT_SECONDS : 0), 0));
  const [chapter, setChapter] = useState(0);
  const [nearFooter, setNearFooter] = useState(false);
  const [ticks, setTicks] = useState([]);

  const tl = useRef(null);
  const marks = useRef([]); // [{ glideStart, start, end, duration }]
  const cut = useRef(null);
  const cutCanvas = useRef(null);
  const cutTitle = useRef(null);
  const cutNum = useRef(null);
  const cutName = useRef(null);
  const root = useRef(null);
  const bar = useRef(null);
  const ring = useRef(null);

  const scrollTo = (y) => getLenis()?.scrollTo(y, { immediate: true, force: true });

  const showCut = (on) => {
    if (cutCanvas.current) cutCanvas.current.style.visibility = on ? 'visible' : 'hidden';
    if (cutTitle.current) cutTitle.current.style.visibility = on ? 'visible' : 'hidden';
  };

  const build = useCallback(() => {
    tl.current?.kill();
    const vh = window.innerHeight;
    const sections = chapters.map((c) => document.querySelector(`[data-chapter="${c.id}"]`));
    if (sections.some((s) => !s)) return null;
    if (!cut.current && cutCanvas.current) cut.current = new FilmCut(cutCanvas.current);

    const t = gsap.timeline({
      paused: true,
      onUpdate() {
        setTime(this.time());
        if (ring.current) ring.current.style.strokeDashoffset = String(1 - this.progress());
      },
      onComplete() {
        setPlaying(false);
        setActive(false);
      },
    });
    const proxy = { y: 0 };
    const out = [];
    let prevEnd = 0;
    chapters.forEach((c, i) => {
      const el = sections[i];
      const start = i === 0 ? 0 : Math.round(absTop(el));
      const end = Math.max(start + 1, Math.round(absTop(el) + el.offsetHeight - vh));
      if (i > 0) {
        const k = { c: 0 };
        const from = prevEnd;
        let heard = 0; // the cut's sounds fire once each, playing forward
        t.fromTo(
          k,
          { c: 0 },
          {
            c: 1,
            duration: CUT_SECONDS,
            ease: 'none',
            immediateRender: false,
            onStart: () => {
              if (cutNum.current) cutNum.current.textContent = c.id;
              if (cutName.current) cutName.current.textContent = c.title;
            },
            onUpdate: () => {
              const crossed = (x) => heard < x && k.c >= x;
              if (crossed(0.02)) whoosh(1, 0.7, false);
              if (crossed(0.36)) thud(0.75);
              if (crossed(0.64)) creak(0.9);
              heard = k.c;
              showCut(true);
              cut.current?.render(k.c);
              scrollTo(k.c < 0.5 ? from : start);
              if (cutNum.current) cutNum.current.textContent = c.id;
              if (cutName.current) cutName.current.textContent = c.title;
              const inK = seg(0.28, 0.5, k.c);
              const outK = seg(0.6, 0.72, k.c);
              if (cutTitle.current) {
                cutTitle.current.style.opacity = String(inK * (1 - outK));
                cutTitle.current.style.transform = `translate(-50%,-50%) translateZ(${-1400 * (1 - inK) + 260 * outK}px)`;
              }
              setChapter(k.c < 0.5 ? i - 1 : i);
            },
            onComplete: () => showCut(false),
            onReverseComplete: () => showCut(false),
          },
        );
      }
      const glideStart = t.duration();
      t.fromTo(
        proxy,
        { y: start },
        {
          y: end,
          duration: c.duration,
          ease: 'power1.inOut',
          immediateRender: false,
          onUpdate: () => {
            showCut(false);
            scrollTo(proxy.y);
            setChapter(i);
          },
        },
      );
      out.push({ glideStart, start, end, duration: c.duration });
      prevEnd = end;
    });
    marks.current = out;
    tl.current = t;
    setTotal(t.duration());
    setTicks(out.map((m) => m.glideStart / t.duration()));
    return t;
  }, []);

  // The film starts from wherever the visitor is.
  const timeForScroll = () => {
    const y = window.scrollY;
    let idx = 0;
    marks.current.forEach((m, i) => {
      if (y >= m.start - 2) idx = i;
    });
    const m = marks.current[idx];
    if (!m) return 0;
    const k = clamp01((y - m.start) / Math.max(1, m.end - m.start));
    return m.glideStart + m.duration * k * 0.98;
  };

  const play = useCallback(() => {
    const t = build();
    if (!t) return;
    let at = timeForScroll();
    if (at >= t.duration() - 0.5) at = 0;
    t.seek(at, false);
    t.play();
    setActive(true);
    setPlaying(true);
    setListOpen(false);
  }, [build]);

  const pause = useCallback(() => {
    tl.current?.pause();
    setPlaying(false);
  }, []);

  const stop = useCallback(() => {
    tl.current?.pause();
    showCut(false);
    cut.current?.clear();
    setPlaying(false);
    setActive(false);
  }, []);

  const seekTo = (time, andPlay = true) => {
    const t = tl.current || build();
    if (!t) return;
    t.seek(time, false);
    setActive(true);
    if (andPlay) {
      t.play();
      setPlaying(true);
    }
  };

  useEffect(() => {
    setFilm({ filmPlaying: playing, filmActive: active });
  }, [playing, active, setFilm]);

  // Any wheel, touch, drag or key (except Space) hands control back.
  useEffect(() => {
    if (!playing) return undefined;
    const interrupt = (e) => {
      if (root.current?.contains(e.target)) return;
      pause();
    };
    const onKey = (e) => {
      if (e.code === 'Space') return;
      if (e.key === 'Escape') stop();
      else pause();
    };
    window.addEventListener('wheel', interrupt, { passive: true });
    window.addEventListener('touchstart', interrupt, { passive: true });
    window.addEventListener('pointerdown', interrupt);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', interrupt);
      window.removeEventListener('touchstart', interrupt);
      window.removeEventListener('pointerdown', interrupt);
      window.removeEventListener('keydown', onKey);
    };
  }, [playing, pause, stop]);

  // Space toggles play/pause while a film is under way; Esc ends it.
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
      if (typing) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (playing) pause();
        else {
          tl.current?.play();
          setPlaying(true);
        }
      } else if (e.key === 'Escape' && !playing) stop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, playing, pause, stop]);

  // Step out of the way near the footer.
  useEffect(() => {
    const footer = document.getElementById('site-footer');
    if (!footer) return undefined;
    const io = new IntersectionObserver(([e]) => setNearFooter(e.isIntersecting), { rootMargin: '0px 0px -10% 0px' });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => cut.current?.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      tl.current?.kill();
      cut.current?.dispose();
      cut.current = null;
      setFilm({ filmPlaying: false, filmActive: false });
    };
  }, [setFilm]);

  const scrub = (e) => {
    const r = bar.current.getBoundingClientRect();
    const p = clamp01((e.clientX - r.left) / r.width);
    const t = tl.current || build();
    if (!t) return;
    pause();
    setActive(true);
    t.progress(p);
  };

  if (reducedMotion) return null;
  const expanded = hover || listOpen;
  const ch = chapters[chapter];

  return (
    <>
      {/* letterbox, grain and the chapter card while the film runs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[130]">
        <div className={`absolute inset-x-0 top-0 h-[8vh] bg-night transition-transform duration-700 ease-inout4 ${active ? 'translate-y-0' : '-translate-y-full'}`} />
        <div className={`absolute inset-x-0 bottom-0 h-[8vh] bg-night transition-transform duration-700 ease-inout4 ${active ? 'translate-y-0' : 'translate-y-full'}`} />
      </div>
      {active && <div className="film-grain" aria-hidden="true" />}
      <div
        className={`pointer-events-none fixed bottom-[calc(8vh+5.5rem)] left-[var(--gutter)] z-[131] max-w-[min(520px,80vw)] text-linen transition-all duration-700 ease-expo ${active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        aria-live="polite"
      >
        <div className="rounded-sm bg-night/85 px-5 py-4 ring-1 ring-brass/30">
        <p className="display text-[clamp(1.4rem,3vw,2.4rem)] leading-none">
          {ch.id} — {ch.title}
        </p>
        <p className="mono mt-2 text-linen/85">{ch.caption}</p>
        </div>
      </div>

      {/* the cut: three.js doors + title flying in from depth */}
      <canvas ref={cutCanvas} className="pointer-events-none fixed inset-0 z-[140] h-full w-full" style={{ visibility: 'hidden' }} aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 z-[141]" style={{ perspective: '900px' }} aria-hidden="true">
        <div ref={cutTitle} className="absolute left-1/2 top-1/2 text-center text-linen" style={{ visibility: 'hidden', opacity: 0, transform: 'translate(-50%,-50%)' }}>
          <p ref={cutNum} className="font-mono text-sm tracking-[0.3em] text-brass">01</p>
          <p ref={cutName} className="display mt-3 whitespace-nowrap text-[clamp(2.4rem,7vw,6rem)] italic leading-none">Arrival</p>
        </div>
      </div>

      {/* the player */}
      <div
        ref={root}
        className={`fixed bottom-5 left-4 z-[132] transition-[transform,opacity] duration-700 ease-expo md:bottom-6 md:left-6 ${nearFooter && !playing ? 'pointer-events-none translate-y-[140%] opacity-0' : ''}`}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={(e) => {
          if (!root.current.contains(e.relatedTarget)) setHover(false);
        }}
      >
        {listOpen && (
          <ol className="absolute bottom-[calc(100%+10px)] left-0 w-[min(320px,calc(100vw-2rem))] rounded-[22px] border hairline bg-plaster p-2 shadow-drawer">
            {chapters.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={`flex min-h-[44px] w-full items-center gap-3 rounded-full px-3 text-left hover:bg-linen ${i === chapter && active ? 'text-clay' : ''}`}
                  onClick={() => {
                    const t = tl.current || build();
                    if (!t) return;
                    seekTo(marks.current[i].glideStart);
                    setListOpen(false);
                  }}
                >
                  <span className="font-mono text-[11px] text-taupe">{c.id}</span>
                  <span className="display text-lg">{c.title}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
        <div
          className={`flex h-14 items-center overflow-hidden rounded-full transition-[width,background-color,box-shadow] duration-500 ease-expo ${
            expanded ? 'w-[min(420px,calc(100vw-2rem))] border hairline bg-plaster/95 shadow-drawer' : 'w-14 bg-transparent'
          }`}
        >
          <button
            type="button"
            onClick={() => (playing ? pause() : active ? (tl.current?.play(), setPlaying(true)) : play())}
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-clay text-linen ${playing ? '' : 'breathe'}`}
            aria-label={playing ? 'Pause the film' : 'Play the house: a guided film of this page'}
          >
            {playing ? <Pause size={18} strokeWidth={1.6} /> : <Play size={18} strokeWidth={1.6} className="translate-x-[1px]" />}
            <svg viewBox="0 0 56 56" className="pointer-events-none absolute inset-0 -rotate-90" aria-hidden="true">
              <circle ref={ring} cx="28" cy="28" r="26" fill="none" stroke="#F7F3EE" strokeOpacity={active ? 0.8 : 0} strokeWidth="1.5" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
            </svg>
          </button>
          <div className={`flex min-w-0 flex-1 items-center gap-3 pl-3 pr-1 transition-opacity duration-300 ${expanded ? 'opacity-100 delay-150' : 'pointer-events-none opacity-0'}`}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] leading-tight">
                <span className="font-mono text-[10px] text-taupe">{ch.id} </span>
                {active ? ch.title : 'Play the House'}
              </p>
              <div
                ref={bar}
                role="slider"
                tabIndex={0}
                aria-label="Film progress"
                aria-valuemin={0}
                aria-valuemax={Math.round(total)}
                aria-valuenow={Math.round(time)}
                aria-valuetext={`${formatTimecode(time)} of ${formatTimecode(total)}`}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  scrub(e);
                }}
                onPointerMove={(e) => e.buttons && scrub(e)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') seekTo(Math.min(total, time + 5), playing);
                  if (e.key === 'ArrowLeft') seekTo(Math.max(0, time - 5), playing);
                }}
                className="relative mt-1.5 flex h-5 cursor-pointer items-center"
              >
                <div className="relative h-px w-full bg-espresso/20">
                  <div className="absolute inset-y-0 left-0 bg-clay" style={{ width: `${(time / total) * 100}%` }} />
                  {ticks.map((t, i) => (
                    <span key={i} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-brass" style={{ left: `${t * 100}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-taupe">
              {formatTimecode(time)} / {formatTimecode(total)}
            </span>
            <button type="button" onClick={() => setListOpen((o) => !o)} className="tap flex shrink-0 items-center justify-center" aria-label="Chapters" aria-expanded={listOpen}>
              <ListOrdered size={16} strokeWidth={1.5} />
            </button>
            <SoundToggle className="shrink-0" label={false} />
          </div>
        </div>
      </div>
    </>
  );
}
