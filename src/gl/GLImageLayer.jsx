import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from './shaders/imageBend.vert?raw';
import fragmentShader from './shaders/imageBend.frag?raw';
import { getItems, subscribe, glState } from './registry.js';
import { glImages } from '../lib/env.js';
import { scrollVelocity } from '../lib/lenis.js';

const SHAPE_RADII = {
  rect: (r) => [r, r],
  arch: () => [1e5, 0],
  pill: () => [1e5, 1e5],
};

// Scroll velocity -> a spring, so pictures bow while moving and settle with a wobble.
function VelocitySpring() {
  useFrame(() => {
    const target = Math.max(-60, Math.min(60, scrollVelocity()));
    glState.spring += (target - glState.velocity) * 0.14;
    glState.spring *= 0.7;
    glState.velocity += glState.spring;
  });
  return null;
}

function GLPlane({ item }) {
  const mesh = useRef();
  const { size, gl } = useThree();
  const [tex, setTex] = useState(null);

  const uniforms = useMemo(
    () => ({
      uTex: { value: null },
      uImageSize: { value: new THREE.Vector2(1, 1) },
      uSize: { value: new THREE.Vector2(1, 1) },
      uRadii: { value: new THREE.Vector2(0, 0) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0 },
      uProgress: { value: 1 },
      uZoom: { value: 1 },
      uParallax: { value: 0 },
      uParallaxAmt: { value: item.parallax ? 1 : 0 },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uClip: { value: new THREE.Vector4(-1e5, -1e5, 1e5, 1e5) },
      uViewportH: { value: 1 },
      uDpr: { value: 1 },
    }),
    [item],
  );

  useEffect(() => {
    let cancelled = false;
    new THREE.TextureLoader().load(
      item.src,
      (t) => {
        if (cancelled) return t.dispose();
        t.colorSpace = THREE.NoColorSpace; // sample raw sRGB, write raw sRGB
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        gl.initTexture(t);
        setTex(t);
      },
      undefined,
      () => !cancelled && item.onError?.(),
    );
    return () => {
      cancelled = true;
    };
  }, [item, gl]);

  useEffect(() => {
    if (!tex) return undefined;
    uniforms.uTex.value = tex;
    uniforms.uImageSize.value.set(tex.image.width, tex.image.height);
    item.onReady?.();
    return () => tex.dispose();
  }, [tex, uniforms, item]);

  useFrame((state, delta) => {
    const m = mesh.current;
    const el = item.el;
    if (!m || !el || !tex || !el.isConnected) {
      if (m) m.visible = false;
      return;
    }
    const s = item.state;
    const vw = size.width;
    const vh = size.height;
    const r = el.getBoundingClientRect();
    if (s.hidden || s.opacity <= 0.001 || r.width < 1 || r.bottom < -vh || r.top > vh * 2 || r.right < -vw || r.left > vw * 2) {
      m.visible = false;
      return;
    }
    m.visible = true;
    const w = item.rotate ? el.offsetWidth : r.width;
    const h = item.rotate ? el.offsetHeight : r.height;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    m.position.set(cx - vw / 2, vh / 2 - cy, 0);
    m.scale.set(w, h, 1);
    m.rotation.z = (-(item.rotate || 0) * Math.PI) / 180;

    s.hover += (s.hoverTarget - s.hover) * Math.min(1, delta * 5);
    const u = uniforms;
    u.uSize.value.set(w, h);
    const [rt, rb] = (SHAPE_RADII[item.shape] || SHAPE_RADII.rect)(item.radius || 0);
    u.uRadii.value.set(rt, rb);
    u.uMouse.value.copy(s.mouse);
    u.uHover.value = s.hover;
    u.uProgress.value = s.progress;
    u.uZoom.value = s.zoom;
    u.uOpacity.value = s.opacity;
    u.uParallax.value = Math.max(-1, Math.min(1, (cy - vh / 2) / (vh / 2 + h / 2)));
    u.uVelocity.value.set(s.velocity.x, glState.velocity + s.velocity.y);
    u.uTime.value = state.clock.elapsedTime;
    u.uViewportH.value = vh;
    u.uDpr.value = state.gl.getPixelRatio();
    const clip = item.clipEl;
    if (clip && clip.isConnected) {
      const c = clip.getBoundingClientRect();
      u.uClip.value.set(c.left, c.top, c.right, c.bottom);
    } else u.uClip.value.set(-1e5, -1e5, 1e5, 1e5);
  });

  return (
    <mesh ref={mesh} visible={false} renderOrder={item.order}>
      <planeGeometry args={[1, 1, 24, 24]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function ResizeCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.left = -size.width / 2;
    camera.right = size.width / 2;
    camera.top = size.height / 2;
    camera.bottom = -size.height / 2;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

export default function GLImageLayer() {
  const [list, setList] = useState(getItems);
  const [hidden, setHidden] = useState(false);

  useEffect(() => subscribe(() => setList(getItems())), []);
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  if (!glImages) return null;
  return (
    <div className="gl-layer" aria-hidden="true">
      <Canvas
        orthographic
        flat
        dpr={[1, 1.5]}
        frameloop={hidden ? 'never' : 'always'}
        camera={{ position: [0, 0, 500], near: 1, far: 1000, zoom: 1 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        <ResizeCamera />
        <VelocitySpring />
        {list.map((it) => (
          <GLPlane key={it.id} item={it} />
        ))}
      </Canvas>
    </div>
  );
}
