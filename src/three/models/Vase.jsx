import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { COLORS } from '../materials.js';

// A matka: the round-bellied water pot, in matte terracotta.
const PROFILE = [
  [0, 0], [0.09, 0], [0.11, 0.01], [0.16, 0.06], [0.19, 0.15], [0.185, 0.22], [0.16, 0.29],
  [0.11, 0.34], [0.08, 0.37], [0.078, 0.39], [0.09, 0.41], [0.082, 0.415],
];

const Vase = forwardRef(function Vase({ color = COLORS.ceramic, ...props }, ref) {
  const geom = useMemo(() => new THREE.LatheGeometry(PROFILE.map(([x, y]) => new THREE.Vector2(x, y)), 48), []);
  return (
    <group ref={ref} {...props}>
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
});

export default Vase;
