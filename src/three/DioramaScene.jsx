import { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, Sparkles } from '@react-three/drei';
import DuneChair from './models/DuneChair.jsx';
import ArcTable from './models/ArcTable.jsx';
import HaloLamp from './models/HaloLamp.jsx';
import CaneBench from './models/CaneBench.jsx';
import Vase from './models/Vase.jsx';
import { getTexture } from './materials.js';
import { useUI } from '../store/ui.js';
import { hourFloat } from '../lib/time.js';
import { playThud } from '../lib/sound.js';

// --- Light from the visitor's clock -------------------------------------------------
const warm = new THREE.Color('#FFB066');
const noon = new THREE.Color('#FFF3E0');
const dusk = new THREE.Color('#FF8A4C');

export function sunFor(h) {
  const night = h < 6 || h >= 19.5;
  if (night) {
    return {
      night: true,
      pos: new THREE.Vector3(-6, 6, 1),
      color: new THREE.Color('#7F8FB8'),
      intensity: 0.25,
      ambient: 0.12,
      sky: new THREE.Color('#2B3550'),
      lamp: 1,
    };
  }
  const t = Math.min(1, Math.max(0, (h - 6) / 13.5)); // 06:00 -> 19:30
  const arc = Math.sin(t * Math.PI);
  const elev = 0.12 + arc * 0.95;
  const az = 0.9 - t * 1.8; // morning from the front-left, evening from the back-left
  const pos = new THREE.Vector3(-Math.cos(elev) * Math.cos(az), Math.sin(elev), Math.cos(elev) * Math.sin(az)).multiplyScalar(9);
  const color = t < 0.5 ? warm.clone().lerp(noon, Math.min(1, t * 2.4)) : noon.clone().lerp(dusk, Math.max(0, (t - 0.55) * 2.2));
  return {
    night: false,
    pos,
    color,
    intensity: 1.6 + arc * 1.6,
    ambient: 0.25 + arc * 0.2,
    sky: color.clone().lerp(new THREE.Color('#F3E6D6'), 0.55).lerp(new THREE.Color('#D8E4EE'), arc * 0.5),
    lamp: t > 0.85 ? 0.8 : 0.35,
  };
}

// --- Gradient for light shafts -----------------------------------------------------
function shaftAlpha() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#fff');
  g.addColorStop(0.35, '#888');
  g.addColorStop(1, '#000');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 256);
  const h = ctx.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, 'rgba(0,0,0,1)');
  h.addColorStop(0.3, 'rgba(0,0,0,0)');
  h.addColorStop(0.7, 'rgba(0,0,0,0)');
  h.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = h;
  ctx.fillRect(0, 0, 64, 256);
  return new THREE.CanvasTexture(c);
}

// --- Walls with an arched window ------------------------------------------------------
const WIN = { z: 0.25, r: 0.55, bottom: 0.55, spring: 2.05 };

function archWallGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-3.1, 0);
  s.lineTo(2.3, 0);
  s.lineTo(2.3, 3.2);
  s.lineTo(-3.1, 3.2);
  s.lineTo(-3.1, 0);
  const cx = -WIN.z;
  const hole = new THREE.Path();
  hole.moveTo(cx - WIN.r, WIN.bottom);
  hole.lineTo(cx - WIN.r, WIN.spring);
  hole.absarc(cx, WIN.spring, WIN.r, Math.PI, 0, true);
  hole.lineTo(cx + WIN.r, WIN.bottom);
  hole.lineTo(cx - WIN.r, WIN.bottom);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: false, curveSegments: 32 });
  // ExtrudeGeometry UVs are in shape units; scale them to the plaster tile.
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.4, uv.getY(i) * 0.4);
  return g;
}

function Room({ sun, wallMats }) {
  const geom = useMemo(archWallGeometry, []);
  const floorTex = useMemo(() => getTexture('terrazzo-floor', 3), []);
  const shaftTex = useMemo(shaftAlpha, []);
  const shafts = useRef();

  useEffect(() => {
    if (!shafts.current) return;
    const origin = new THREE.Vector3(-3, (WIN.bottom + WIN.spring) / 2 + 0.2, WIN.z);
    shafts.current.position.copy(origin);
    shafts.current.lookAt(origin.clone().add(sun.pos.clone().normalize().negate()));
  }, [sun]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0, 0.4]} receiveShadow>
        <planeGeometry args={[7, 6]} />
        <meshStandardMaterial map={floorTex} roughness={0.55} />
      </mesh>
      <mesh position={[0.18, 1.6, -2.28]} material={wallMats[0]} receiveShadow castShadow>
        <boxGeometry args={[6.7, 3.2, 0.16]} />
      </mesh>
      <mesh geometry={geom} rotation={[0, Math.PI / 2, 0]} position={[-3.16, 0, 0]} material={wallMats[1]} receiveShadow castShadow />
      {/* sky glow behind the arch */}
      <mesh position={[-3.6, 1.6, WIN.z]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.2, 3]} />
        <meshBasicMaterial color={sun.sky} toneMapped={false} />
      </mesh>
      {/* skirting line */}
      <mesh position={[0.18, 0.04, -2.19]}>
        <boxGeometry args={[6.7, 0.08, 0.02]} />
        <meshStandardMaterial color="#D9CDBD" roughness={0.9} />
      </mesh>
      {!sun.night && (
        <group ref={shafts}>
          {[0, Math.PI / 3, -Math.PI / 3].map((r, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, r]} position={[0, 0, 2]}>
              <planeGeometry args={[1.05, 4]} />
              <meshBasicMaterial
                color={sun.color}
                alphaMap={shaftTex}
                transparent
                opacity={0.09}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      )}
      <Sparkles count={70} scale={[2.6, 2, 2.4]} position={[-1.5, 1.2, WIN.z + 0.3]} size={1.6} speed={0.18} opacity={0.55} color="#F2DDB5" noise={0.6} />
    </group>
  );
}

// --- Dust puffs when a piece lands ---------------------------------------------------
function DustPuff({ trigger }) {
  const points = useRef();
  const N = 28;
  const data = useMemo(() => {
    const dirs = Array.from({ length: N }, () => {
      const a = Math.random() * Math.PI * 2;
      return [Math.cos(a), 0.25 + Math.random() * 0.5, Math.sin(a), 0.6 + Math.random() * 0.8];
    });
    return { dirs, pos: new Float32Array(N * 3) };
  }, []);
  const state = useRef({ t: 10, x: 0, z: 0, s: 1 });
  trigger.current = (x, z, s = 1) => Object.assign(state.current, { t: 0, x, z, s });

  useFrame((_, dt) => {
    const st = state.current;
    st.t += dt;
    const p = points.current;
    if (!p) return;
    const k = Math.min(1, st.t / 0.9);
    p.visible = k < 1;
    if (!p.visible) return;
    const e = 1 - Math.pow(1 - k, 3);
    data.dirs.forEach(([dx, dy, dz, sp], i) => {
      data.pos[i * 3] = st.x + dx * e * 0.45 * sp * st.s;
      data.pos[i * 3 + 1] = 0.02 + dy * e * 0.18 * st.s;
      data.pos[i * 3 + 2] = st.z + dz * e * 0.45 * sp * st.s;
    });
    p.geometry.attributes.position.needsUpdate = true;
    p.material.opacity = 0.55 * (1 - k);
  });

  return (
    <points ref={points} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={N} array={data.pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#E7D8C2" size={0.035} transparent opacity={0} depthWrite={false} />
    </points>
  );
}

// --- Camera: dolly on scroll, orbit with the cursor ---------------------------------------
const P0 = new THREE.Vector3(3.5, 1.7, 4.6);
const T0 = new THREE.Vector3(0.05, 0.6, -0.35);
const P1 = new THREE.Vector3(0.95, 0.95, 1.75);
const T1 = new THREE.Vector3(0.2, 0.42, 0.05);

function CameraRig({ progress, mobile }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);
  const off = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((state, dt) => {
    const m = mouse.current;
    const k = Math.min(1, dt * 3);
    m.sx += (m.x - m.sx) * k;
    m.sy += (m.y - m.sy) * k;
    const p = progress?.current ?? 0;
    const e = p * p * (3 - 2 * p);
    pos.lerpVectors(P0, P1, e);
    tgt.lerpVectors(T0, T1, e);
    const yaw = mobile ? Math.sin(state.clock.elapsedTime * 0.25) * 0.1 : -m.sx * ((4 * Math.PI) / 180);
    const pitch = mobile ? 0 : m.sy * ((2.5 * Math.PI) / 180);
    off.copy(pos).sub(tgt).applyAxisAngle(THREE.Object3D.DEFAULT_UP, yaw);
    off.y += pitch * off.length();
    camera.position.copy(tgt).add(off);
    camera.lookAt(tgt);
  });
  return null;
}

// --- Pieces dropping in -----------------------------------------------------------
const PIECES = [
  { key: 'chair', pos: [0.2, 0, 0.1], rot: 0.32, puff: 1.2 },
  { key: 'table', pos: [1.08, 0, 0.42], rot: 0, puff: 0.7 },
  { key: 'bench', pos: [0.9, 0, -1.78], rot: 0, puff: 1.3 },
  { key: 'vase', pos: [-2.05, 0, -1.55], rot: 0, puff: 0.6 },
  { key: 'lamp', pos: [-0.62, 0, -0.62], rot: -0.5, puff: 0.6 },
];

function Pieces({ progress, reduced, sun, power }) {
  const introDone = useUI((s) => s.introDone);
  const refs = useRef([]);
  const sim = useRef(PIECES.map((_, i) => ({ y: reduced ? 0 : 3.2 + i * 0.25, v: 0, sq: 0, sqv: 0, landed: reduced, start: i * 0.18 })));
  const t0 = useRef(null);
  const puffs = useRef(PIECES.map(() => ({ current: null })));
  const flicker = useRef(null);

  useFrame((state, dt) => {
    // Fixed substeps so the fall takes the same real time on a slow GPU.
    const steps = Math.max(1, Math.ceil(Math.min(dt, 0.1) / (1 / 120)));
    const d = Math.min(dt, 0.1) / steps;
    if (introDone && t0.current === null) t0.current = state.clock.elapsedTime;
    const t = t0.current === null ? -1 : state.clock.elapsedTime - t0.current;
    sim.current.forEach((s, i) => {
      const g = refs.current[i];
      if (!g) return;
      for (let k = 0; k < steps; k++) {
      if (!reduced && t >= s.start) {
        if (!s.landed || s.y > 0 || Math.abs(s.v) > 0) {
          s.v -= 16 * d;
          s.y += s.v * d;
          if (s.y <= 0) {
            if (!s.landed) {
              s.landed = true;
              const [x, , z] = PIECES[i].pos;
              puffs.current[i].current?.(x, z, PIECES[i].puff);
              playThud(PIECES[i].puff);
            }
            s.sqv -= Math.min(0.5, Math.abs(s.v) * 0.025);
            s.y = 0;
            s.v = Math.abs(s.v) > 1.2 ? -s.v * 0.3 : 0;
          }
        }
      }
      // squash-and-stretch spring
      s.sqv += -s.sq * 320 * d;
      s.sqv *= Math.exp(-10 * d);
      s.sq += s.sqv * d * 10;
      }
      const [x, y, z] = PIECES[i].pos;
      g.position.set(x, y + Math.max(0, s.y), z);
      g.scale.set(1 - s.sq * 0.5, 1 + s.sq, 1 - s.sq * 0.5);
      g.visible = reduced || t >= s.start;
      if (PIECES[i].key === 'chair') {
        const p = progress?.current ?? 0;
        g.rotation.y = PIECES[i].rot + p * ((25 * Math.PI) / 180);
      }
    });
    // the lamp flickers on once the last piece has landed
    const allDown = sim.current.every((s) => s.landed && s.y === 0);
    if (allDown && flicker.current === null) flicker.current = state.clock.elapsedTime + 0.25;
    if (reduced) power.current = sun.lamp;
    else if (flicker.current !== null) {
      const f = state.clock.elapsedTime - flicker.current;
      const pattern = f < 0 ? 0 : f < 0.07 ? 0.9 : f < 0.16 ? 0.05 : f < 0.22 ? 0.7 : f < 0.34 ? 0.15 : f < 0.4 ? 1 : 1;
      power.current = pattern * sun.lamp;
    } else power.current = 0;
  });

  const set = (i) => (el) => {
    refs.current[i] = el;
  };
  return (
    <>
      <group ref={set(0)} rotation={[0, PIECES[0].rot, 0]} visible={false}>
        <DuneChair wood="walnut" fabric="boucle" />
      </group>
      <group ref={set(1)} visible={false}>
        <ArcTable wood="walnut" />
      </group>
      <group ref={set(2)} visible={false}>
        <CaneBench wood="walnut" length={1.5} />
      </group>
      <group ref={set(3)} visible={false}>
        <Vase scale={1.25} />
      </group>
      <group ref={set(4)} rotation={[0, PIECES[4].rot, 0]} visible={false}>
        <HaloLamp power={power} lightIntensity={sun.night ? 4.5 : 2} />
      </group>
      {puffs.current.map((r, i) => (
        <DustPuff key={i} trigger={r} />
      ))}
    </>
  );
}

class Quiet extends Component {
  constructor(p) {
    super(p);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Scene({ progress, mobile, reduced }) {
  const sun = useMemo(() => sunFor(hourFloat()), []);
  const power = useRef(0);
  const wallMats = useMemo(() => {
    const tex = getTexture('plaster-wall', 1.4);
    return [0, 1].map(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, transparent: true }));
  }, []);
  const sunLight = useRef();

  useFrame(() => {
    const p = progress?.current ?? 0;
    const fade = 1 - Math.min(1, Math.max(0, (p - 0.25) / 0.5));
    wallMats.forEach((m) => {
      m.opacity = fade;
      m.depthWrite = fade > 0.98;
      m.visible = fade > 0.01;
    });
  });

  useEffect(() => {
    if (!sunLight.current) return;
    sunLight.current.target.position.set(0, 0.4, 0);
    sunLight.current.target.updateMatrixWorld();
  }, []);

  const lights = (
    <>
      <Lightformer form="rect" intensity={1.2} position={[0, 3, 2]} scale={[6, 3, 1]} color="#fff4e6" />
      <Lightformer form="rect" intensity={0.6} position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[4, 2, 1]} color="#ffe2c0" />
    </>
  );

  return (
    <>
      <color attach="background" args={['#EAE3D9']} />
      <fog attach="fog" args={['#EAE3D9', 9, 18]} />
      <ambientLight intensity={sun.ambient} color={sun.night ? '#8C94B0' : '#FFF4E6'} />
      <hemisphereLight args={[sun.night ? '#5B6584' : '#FFF6EA', '#CDBBA5', sun.night ? 0.25 : 0.75]} />
      <directionalLight
        ref={sunLight}
        position={sun.pos.toArray()}
        intensity={sun.intensity}
        color={sun.color}
        castShadow={!mobile}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <Quiet fallback={<Environment resolution={64} environmentIntensity={0.35}>{lights}</Environment>}>
        <Suspense fallback={null}>
          <Environment preset="apartment" environmentIntensity={sun.night ? 0.12 : 0.35} />
        </Suspense>
      </Quiet>
      <Room sun={sun} wallMats={wallMats} />
      <Pieces progress={progress} reduced={reduced} sun={sun} power={power} />
      <ContactShadows position={[0, 0.003, 0]} opacity={0.55} scale={7} blur={2.6} far={1.6} resolution={mobile ? 256 : 512} color="#3a2414" />
      <CameraRig progress={progress} mobile={mobile} />
    </>
  );
}

export default function DioramaScene({ progress, mobile, reduced, active = true }) {
  return (
    <Canvas
      shadows={!mobile}
      dpr={mobile ? 1 : [1, 1.5]}
      frameloop={!active ? 'never' : reduced ? 'demand' : 'always'}
      camera={{ fov: mobile ? 46 : 34, position: P0.toArray(), near: 0.1, far: 40 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.15;
      }}
      aria-label="A 3D room: a bouclé lounge chair, a walnut side table, a brass floor lamp, a cane bench and a clay vase under an arched window."
      role="img"
    >
      <Scene progress={progress} mobile={mobile} reduced={reduced} />
    </Canvas>
  );
}
