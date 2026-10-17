import { forwardRef } from 'react';
import { useWoodMaterial } from './useWood.js';

// Round walnut top on three legs splayed at eleven degrees.
const ArcTable = forwardRef(function ArcTable({ wood = 'walnut', scale = 1, ...props }, ref) {
  const mat = useWoodMaterial(wood);
  return (
    <group ref={ref} scale={scale} {...props}>
      <mesh position={[0, 0.515, 0]} material={mat} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.235, 0.03, 48]} />
      </mesh>
      <mesh position={[0, 0.49, 0]} material={mat} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.03, 24]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
          <mesh position={[0.1, 0.245, 0]} rotation={[0, 0, -0.19]} material={mat} castShadow>
            <cylinderGeometry args={[0.017, 0.011, 0.5, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

export default ArcTable;
