import { forwardRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useWoodMaterial, useCane } from './useWood.js';

// Low bench: walnut frame with a woven cane seat.
const CaneBench = forwardRef(function CaneBench({ wood = 'walnut', length = 1.3, ...props }, ref) {
  const woodMat = useWoodMaterial(wood);
  const cane = useCane(4);
  const L = length;
  return (
    <group ref={ref} {...props}>
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([x, z], i) => (
        <mesh key={i} position={[x * (L / 2 - 0.04), 0.2, z * 0.16]} material={woodMat} castShadow>
          <boxGeometry args={[0.042, 0.4, 0.042]} />
        </mesh>
      ))}
      <RoundedBox args={[L, 0.045, 0.05]} radius={0.012} position={[0, 0.41, 0.18]} material={woodMat} castShadow />
      <RoundedBox args={[L, 0.045, 0.05]} radius={0.012} position={[0, 0.41, -0.18]} material={woodMat} castShadow />
      <RoundedBox args={[0.05, 0.045, 0.36]} radius={0.012} position={[-L / 2 + 0.025, 0.41, 0]} material={woodMat} />
      <RoundedBox args={[0.05, 0.045, 0.36]} radius={0.012} position={[L / 2 - 0.025, 0.41, 0]} material={woodMat} />
      <mesh position={[0, 0.415, 0]} material={cane} receiveShadow castShadow>
        <boxGeometry args={[L - 0.08, 0.012, 0.32]} />
      </mesh>
      <mesh position={[0, 0.12, 0]} material={woodMat} castShadow>
        <boxGeometry args={[L - 0.1, 0.03, 0.03]} />
      </mesh>
    </group>
  );
});

export default CaneBench;
