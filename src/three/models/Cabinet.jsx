import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { useWoodMaterial, useBrass } from './useWood.js';

// Storage pieces in the viewer: a carcass with two arched door panels.
function archShape(w, h) {
  const s = new THREE.Shape();
  const r = w / 2;
  s.moveTo(-r, 0);
  s.lineTo(r, 0);
  s.lineTo(r, h - r);
  s.absarc(0, h - r, r, 0, Math.PI, false);
  s.lineTo(-r, 0);
  return s;
}

const Cabinet = forwardRef(function Cabinet({ wood = 'walnut', ...props }, ref) {
  const mat = useWoodMaterial(wood);
  const brass = useBrass();
  const inset = useMemo(() => new THREE.ExtrudeGeometry(archShape(0.3, 0.72), { depth: 0.012, bevelEnabled: false }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a1d15', roughness: 0.8 }), []);
  return (
    <group ref={ref} {...props}>
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([x, z], i) => (
        <mesh key={i} position={[x * 0.4, 0.06, z * 0.17]} material={mat} castShadow>
          <cylinderGeometry args={[0.02, 0.014, 0.12, 10]} />
        </mesh>
      ))}
      <RoundedBox args={[0.9, 1.1, 0.4]} radius={0.02} smoothness={3} position={[0, 0.67, 0]} material={mat} castShadow receiveShadow />
      {[-1, 1].map((x) => (
        <group key={x} position={[x * 0.215, 0.27, 0.2]}>
          <mesh geometry={inset} material={dark} position={[0, 0.06, 0]} />
          <mesh position={[-x * 0.12, 0.42, 0.03]} rotation={[Math.PI / 2, 0, 0]} material={brass}>
            <cylinderGeometry args={[0.012, 0.012, 0.04, 12]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.67, 0.201]} material={mat}>
        <boxGeometry args={[0.012, 1.06, 0.004]} />
      </mesh>
    </group>
  );
});

export default Cabinet;
