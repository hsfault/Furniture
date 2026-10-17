import { forwardRef } from 'react';
import { useWoodMaterial, useCane } from './useWood.js';

// The finished Ravi stool, used by the 3D viewer.
const Stool = forwardRef(function Stool({ wood = 'sheesham', ...props }, ref) {
  const mat = useWoodMaterial(wood, { roughness: 0.35 });
  const cane = useCane(2);
  return (
    <group ref={ref} {...props}>
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([x, z], i) => (
        <mesh key={i} position={[x * 0.17, 0.22, z * 0.17]} material={mat} castShadow>
          <boxGeometry args={[0.04, 0.44, 0.04]} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={i < 2 ? [0, 0.43, (i ? 1 : -1) * 0.17] : [(i === 3 ? 1 : -1) * 0.17, 0.43, 0]} rotation={[0, i < 2 ? 0 : Math.PI / 2, 0]} material={mat} castShadow>
          <boxGeometry args={[0.38, 0.04, 0.035]} />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <mesh key={`s${i}`} position={[0, 0.12, (i ? 1 : -1) * 0.17]} material={mat}>
          <boxGeometry args={[0.34, 0.025, 0.025]} />
        </mesh>
      ))}
      <mesh position={[0, 0.445, 0]} material={cane} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.01, 0.32]} />
      </mesh>
    </group>
  );
});

export default Stool;
