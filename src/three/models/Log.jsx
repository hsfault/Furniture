import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { getTexture } from '../materials.js';

// A seasoned sheesham log: bark around the side, growth rings on the caps.
const Log = forwardRef(function Log({ radius = 0.36, length = 1.4, ...props }, ref) {
  const mats = useMemo(() => {
    const bark = new THREE.MeshStandardMaterial({ map: getTexture('bark-sheesham', 2), roughness: 0.95, transparent: true });
    const rings = new THREE.MeshStandardMaterial({ map: getTexture('wood-endgrain-rings'), roughness: 0.8, transparent: true });
    return [bark, rings, rings];
  }, []);
  return (
    <mesh ref={ref} rotation={[0, 0, Math.PI / 2]} material={mats} castShadow {...props}>
      <cylinderGeometry args={[radius, radius * 1.04, length, 48, 1]} />
    </mesh>
  );
});

export default Log;
