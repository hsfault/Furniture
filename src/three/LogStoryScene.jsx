import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import Log from './models/Log.jsx';
import { getTexture, COLORS } from './materials.js';

// progress (ref, 0..1) drives four acts:
// 0.00 Seasoned -> 0.25 Cut -> 0.50 Joined -> 0.75 Finished -> 1
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const R = 0.36; // log radius
const S = 1.55; // stool scale

// Six planks: where they sit inside the log, how they fan out, and which stool part they become.
const PLANKS = Array.from({ length: 6 }, (_, i) => {
  const y = -0.25 + i * 0.1;
  const w = 2 * Math.sqrt(R * R - y * y) * 0.86;
  const a = (i - 2.5) * 0.2;
  const legs = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  const stool = i < 4
    ? { pos: [legs[i][0] * 0.17 * S, 0.23 * S, legs[i][1] * 0.17 * S], rot: [0, 0, 0], scale: [0.045 * S, 0.46 * S, 0.045 * S] }
    : { pos: [0, 0.43 * S, (i === 4 ? -1 : 1) * 0.17 * S], rot: [0, 0, 0], scale: [0.4 * S, 0.045 * S, 0.035 * S] };
  return {
    log: { pos: [0, 0.42 + y, 0], rot: [0, 0, 0], scale: [1.3, 0.085, w] },
    fan: { pos: [-0.55 + Math.cos(a) * 0.7, 0.03 + i * 0.012, -Math.sin(a) * 0.7], rot: [0, a, 0], scale: [1.3, 0.06, 0.26] },
    stool,
  };
});

const tmpQ = [new THREE.Quaternion(), new THREE.Quaternion(), new THREE.Quaternion()];
const e = new THREE.Euler();
const q = (rot, out) => out.setFromEuler(e.set(...rot));

function lerp3(a, b, t, out) {
  out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
}

// Mortise-and-tenon joints: where each rail meets a leg.
const JOINTS = [];
[-1, 1].forEach((z) => [-1, 1].forEach((x) => JOINTS.push([x * 0.17 * S, 0.43 * S, z * 0.17 * S])));
[-1, 1].forEach((z) => [-1, 1].forEach((x) => JOINTS.push([x * 0.17 * S, 0.12 * S, z * 0.17 * S])));

function Story({ progress }) {
  const root = useRef();
  const log = useRef();
  const planks = useRef([]);
  const sideRails = useRef([]);
  const joints = useRef();
  const cane = useRef();
  const dust = useRef();
  const sweep = useRef();

  const woodMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: getTexture('wood-sheesham'), roughness: 0.8, metalness: 0, transparent: true }),
    [],
  );
  const jointMat = useMemo(() => new THREE.LineBasicMaterial({ color: COLORS.brass, transparent: true, opacity: 0 }), []);
  const jointGeom = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.075, 0.075, 0.075)), []);
  const caneMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#C79A5E', roughness: 0.6 }), []);
  const strandGeom = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const unitBox = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  const DUST = 260;
  const dustData = useMemo(() => {
    const seeds = Array.from({ length: DUST }, () => [Math.random() - 0.5, Math.random(), Math.random() - 0.5, Math.random()]);
    return { seeds, pos: new Float32Array(DUST * 3) };
  }, []);
  const STRANDS = 22;
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const v = useMemo(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], []);

  useFrame((state, dt) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    if (root.current) root.current.rotation.y += dt * (0.08 + (1 - smooth(0.5, 0.75, p)) * 0.12);

    // Act 1: the log, slowly turning on its axis.
    const split = smooth(0.26, 0.32, p);
    if (log.current) {
      log.current.rotation.x = t * 0.25;
      log.current.material.forEach((m) => (m.opacity = 1 - split));
      log.current.visible = split < 0.99;
      log.current.position.y = 0.42;
    }

    // Planks: inside the log -> fanned out -> stool parts.
    const fan = smooth(0.3, 0.47, p);
    planks.current.forEach((mesh, i) => {
      if (!mesh) return;
      const k = PLANKS[i];
      const join = smooth(0.52 + i * 0.025, 0.66 + i * 0.025, p);
      const [a, b, c] = v;
      lerp3(k.log.pos, k.fan.pos, fan, a);
      lerp3(k.fan.pos, k.stool.pos, join, b);
      mesh.position.copy(join > 0 ? b : a);
      if (join > 0 && join < 1) mesh.position.y += Math.sin(join * Math.PI) * 0.35;
      q(k.log.rot, tmpQ[0]);
      q(k.fan.rot, tmpQ[1]);
      q(k.stool.rot, tmpQ[2]);
      mesh.quaternion.slerpQuaternions(tmpQ[0], tmpQ[1], fan);
      if (join > 0) mesh.quaternion.slerpQuaternions(tmpQ[1], tmpQ[2], join);
      lerp3(k.log.scale, k.fan.scale, fan, a);
      lerp3(k.fan.scale, k.stool.scale, join, c);
      mesh.scale.copy(join > 0 ? c : a);
      mesh.visible = split > 0.01;
    });

    // Side rails and stretchers grow in as the frame comes together.
    const rails = smooth(0.66, 0.72, p);
    sideRails.current.forEach((m) => {
      if (!m) return;
      m.scale.x = Math.max(0.001, rails) * m.userData.len;
      m.visible = rails > 0.01;
    });

    // Brass joint outlines glow while the frame is joined, then settle.
    jointMat.opacity = smooth(0.62, 0.7, p) * (1 - smooth(0.82, 0.9, p) * 0.75) * (0.75 + Math.sin(t * 4) * 0.25);
    if (joints.current) joints.current.visible = jointMat.opacity > 0.01;

    // Act 4: oil goes on (roughness 0.8 -> 0.35) with a sweep of light across.
    const oil = smooth(0.76, 0.92, p);
    woodMat.roughness = 0.8 - oil * 0.45;
    woodMat.color.setScalar(1 - oil * 0.12);
    if (sweep.current) {
      sweep.current.position.set(-1.4 + oil * 2.8, 1.3, 0.9);
      sweep.current.intensity = Math.sin(oil * Math.PI) * 6;
    }

    // Cane seat, weave by weave.
    const weave = smooth(0.82, 0.99, p);
    if (cane.current) {
      const span = 0.32 * S;
      for (let i = 0; i < STRANDS; i++) {
        const on = Math.min(1, Math.max(0, weave * STRANDS - i));
        const half = STRANDS / 2;
        const idx = i % half;
        const off = -span / 2 + (idx + 0.5) * (span / half);
        const along = i < half;
        m4.compose(
          v[0].set(along ? 0 : off, 0.452 * S, along ? off : 0),
          tmpQ[0].identity(),
          v[1].set(along ? span * on + 0.0001 : 0.012, 0.006, along ? 0.012 : span * on + 0.0001),
        );
        cane.current.setMatrixAt(i, m4);
      }
      cane.current.instanceMatrix.needsUpdate = true;
      cane.current.visible = weave > 0.001;
    }

    // Sawdust while the saw is working.
    const saw = smooth(0.24, 0.3, p) * (1 - smooth(0.44, 0.52, p));
    if (dust.current) {
      dustData.seeds.forEach(([x, y, z, s], i) => {
        const life = (t * (0.25 + s * 0.3) + s) % 1;
        dustData.pos[i * 3] = x * 1.6 + Math.sin(t + i) * 0.05;
        dustData.pos[i * 3 + 1] = 0.9 - life * 0.9 + y * 0.1;
        dustData.pos[i * 3 + 2] = z * 0.9;
      });
      dust.current.geometry.attributes.position.needsUpdate = true;
      dust.current.material.opacity = saw * 0.8;
      dust.current.visible = saw > 0.01;
    }
  });

  return (
    <group ref={root}>
      <Log ref={log} radius={R} length={1.4} />
      {PLANKS.map((_, i) => (
        <mesh key={i} ref={(el) => (planks.current[i] = el)} geometry={unitBox} material={woodMat} castShadow receiveShadow visible={false} />
      ))}
      {[-1, 1].map((x) => (
        <mesh
          key={`r${x}`}
          ref={(el) => (sideRails.current[x < 0 ? 0 : 1] = el)}
          geometry={unitBox}
          material={woodMat}
          position={[x * 0.17 * S, 0.43 * S, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.001, 0.045 * S, 0.035 * S]}
          userData={{ len: 0.4 * S }}
          castShadow
        />
      ))}
      {[-1, 1].map((z) => (
        <mesh
          key={`s${z}`}
          ref={(el) => (sideRails.current[z < 0 ? 2 : 3] = el)}
          geometry={unitBox}
          material={woodMat}
          position={[0, 0.12 * S, z * 0.17 * S]}
          scale={[0.001, 0.028 * S, 0.028 * S]}
          userData={{ len: 0.36 * S }}
          castShadow
        />
      ))}
      <group ref={joints}>
        {JOINTS.map((pos, i) => (
          <lineSegments key={i} geometry={jointGeom} material={jointMat} position={pos} />
        ))}
      </group>
      <instancedMesh ref={cane} args={[strandGeom, caneMat, STRANDS]} castShadow />
      <points ref={dust}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={DUST} array={dustData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#E9C994" size={0.018} transparent opacity={0} depthWrite={false} />
      </points>
      <pointLight ref={sweep} color="#FFE6BF" intensity={0} distance={3} decay={1.5} />
    </group>
  );
}

export default function LogStoryScene({ progress, active = true, mobile = false, reduced = false }) {
  return (
    <Canvas
      shadows
      dpr={mobile ? 1 : [1, 1.5]}
      frameloop={!active ? 'never' : reduced ? 'demand' : 'always'}
      camera={{ fov: 30, position: [2.6, 1.7, 3.1], near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ camera }) => camera.lookAt(0, 0.45, 0)}
      role="img"
      aria-label="A sheesham log that splits into six planks, which are joined into a stool and finished with oil and a cane seat."
    >
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#FFF3E3', '#B79A7B', 0.6]} />
      <directionalLight position={[2.5, 4, 2]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} color="#FFF0DC" />
      <Story progress={progress} />
      <ContactShadows position={[0, 0.001, 0]} opacity={0.4} scale={4} blur={2.4} far={1.5} color="#3a2414" />
    </Canvas>
  );
}
