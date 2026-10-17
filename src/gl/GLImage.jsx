import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { glImages, reducedMotion } from '../lib/env.js';
import { innerParallax } from '../lib/parallax.js';
import { unfold } from '../lib/unfold.js';
import { register, nextId } from './registry.js';

let order = 0;

/**
 * A picture that lives in the global WebGL layer when it can (velocity bend,
 * hover ripple, noisy unfold) and falls back to a plain <img> with CSS
 * parallax otherwise. The frame element keeps the layout, the alt text and
 * the click target either way.
 */
export default function GLImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  shape = 'rect',
  radius = 0,
  rotate = 0,
  parallax = true,
  reveal = true,
  clipRef,
  stateRef,
  style,
  children,
  eager = false,
  ...rest
}) {
  const frame = useRef(null);
  const img = useRef(null);
  const item = useRef(null);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const revealed = useRef(!reveal || reducedMotion);

  const playReveal = (s) => {
    gsap.to(s, { progress: 1, duration: 1.2, ease: 'power4.inOut' });
    gsap.to(s, { zoom: 1, duration: 1.7, ease: 'expo.out' });
  };

  useEffect(() => {
    if (!glImages || !src) return undefined;
    const it = {
      id: nextId(),
      order: order++,
      el: frame.current,
      src,
      shape,
      radius,
      rotate,
      parallax,
      clipEl: clipRef?.current || null,
      state: {
        hover: 0,
        hoverTarget: 0,
        mouse: new THREE.Vector2(0.5, 0.5),
        progress: 0,
        zoom: 1.3,
        velocity: { x: 0, y: 0 },
        opacity: 1,
        hidden: false,
      },
      onReady: () => setReady(true),
      onError: () => setMissing(true),
    };
    item.current = it;
    if (revealed.current) {
      if (!reveal || reducedMotion) Object.assign(it.state, { progress: 1, zoom: 1 });
      else playReveal(it.state);
    }
    if (stateRef) stateRef.current = it.state;
    const off = register(it);
    return () => {
      off();
      item.current = null;
    };
  }, [src, shape, radius, rotate, parallax, reveal, clipRef, stateRef]);

  useGSAP(
    () => {
      if (!reveal) return;
      if (glImages) {
        ScrollTrigger.create({
          trigger: frame.current,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            revealed.current = true;
            if (item.current) playReveal(item.current.state);
          },
        });
      } else {
        unfold(frame.current, img.current, { start: 'top 90%' });
      }
    },
    { scope: frame, dependencies: [src] },
  );

  useGSAP(
    () => {
      if (!glImages && parallax) innerParallax(img.current, frame.current);
    },
    { scope: frame, dependencies: [src] },
  );

  const onMove = (e) => {
    const s = item.current?.state;
    if (!s) return;
    const r = frame.current.getBoundingClientRect();
    s.mouse.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
  };
  const onEnter = (e) => {
    onMove(e);
    if (item.current) item.current.state.hoverTarget = 1;
  };
  const onLeave = () => {
    if (item.current) item.current.state.hoverTarget = 0;
  };

  const shapeClass = shape === 'arch' ? 'rounded-arch' : shape === 'pill' ? 'rounded-full' : '';
  return (
    <div
      ref={frame}
      className={`gl-frame ${shapeClass} ${className} ${ready ? 'gl-ready' : ''} ${missing ? 'img-missing' : ''} ${glImages ? 'gl-mode' : ''}`}
      style={{ borderRadius: shape === 'rect' && radius ? radius : undefined, rotate: rotate ? `${rotate}deg` : undefined, ...style }}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-reveal={reveal ? '' : undefined}
      {...rest}
    >
      <img
        ref={img}
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onError={() => setMissing(true)}
        className={`gl-img ${parallax && !glImages ? 'gl-img--parallax' : ''} ${imgClassName}`}
      />
      {missing && <span className="img-missing__label">{alt}</span>}
      {!glImages && <span className="fold-line" aria-hidden="true" />}
      {children}
    </div>
  );
}
