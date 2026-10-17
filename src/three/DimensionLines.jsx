import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { COLORS } from './materials.js';

const brass = new THREE.MeshBasicMaterial({ color: COLORS.brass, toneMapped: false });
const up = new THREE.Vector3(0, 1, 0);

// One dimension: a brass rod with arrowheads and end ticks, drawn from its middle.
function Dim({ from, to, label, show, delay = 0 }) {
  const group = useRef();
  const prog = useRef(0);
  const { mid, len, quat } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    return {
      mid: a.clone().add(b).multiplyScalar(0.5),
      len: dir.length(),
      quat: new THREE.Quaternion().setFromUnitVectors(up, dir.normalize()),
    };
  }, [from, to]);
  const t0 = useRef(0);

  useFrame((state, dt) => {
    if (show && t0.current === 0) t0.current = state.clock.elapsedTime;
    if (!show) t0.current = 0;
    const ready = show && state.clock.elapsedTime - t0.current > delay;
    prog.current += ((ready ? 1 : 0) - prog.current) * Math.min(1, dt * 6);
    if (group.current) {
      group.current.scale.set(1, Math.max(0.0001, prog.current), 1);
      group.current.visible = prog.current > 0.01;
    }
  });

  const head = 0.03;
  return (
    <group position={mid} quaternion={quat}>
      <group ref={group}>
        <mesh material={brass}>
          <cylinderGeometry args={[0.0035, 0.0035, len - head * 2, 6]} />
        </mesh>
        <mesh material={brass} position={[0, len / 2 - head / 2, 0]}>
          <coneGeometry args={[0.012, head, 12]} />
        </mesh>
        <mesh material={brass} position={[0, -len / 2 + head / 2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.012, head, 12]} />
        </mesh>
        {[1, -1].map((s) => (
          <mesh key={s} material={brass} position={[0, (s * len) / 2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.002, 0.002, 0.06, 4]} />
          </mesh>
        ))}
      </group>
      <Html center position={[0, 0, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <span
          className="mono whitespace-nowrap rounded-full bg-linen/90 px-2 py-0.5 text-walnut transition-opacity duration-500"
          style={{ opacity: show ? 1 : 0, transitionDelay: show ? `${delay + 0.3}s` : '0s' }}
        >
          {label}
        </span>
      </Html>
    </group>
  );
}

/** Brass dimension lines around a w × d × h box (metres), labelled in cm. */
export default function DimensionLines({ w, d, h, show, y0 = 0.005, gap = 0.09 }) {
  const cm = (m) => `${Math.round(m * 100)} cm`;
  return (
    <group>
      <Dim show={show} label={`W ${cm(w)}`} from={[-w / 2, y0, d / 2 + gap]} to={[w / 2, y0, d / 2 + gap]} />
      <Dim show={show} delay={0.15} label={`D ${cm(d)}`} from={[w / 2 + gap, y0, d / 2]} to={[w / 2 + gap, y0, -d / 2]} />
      <Dim show={show} delay={0.3} label={`H ${cm(h)}`} from={[-w / 2 - gap, 0, -d / 2]} to={[-w / 2 - gap, h, -d / 2]} />
    </group>
  );
}
