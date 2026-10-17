import { forwardRef, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useWoodMaterial, useBrass } from './useWood.js';
import { COLORS } from '../materials.js';

// A soft additive halo stands in for bloom: cheap, and it works on every GPU.
function haloTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,226,170,1)');
  g.addColorStop(0.18, 'rgba(255,200,130,0.55)');
  g.addColorStop(0.5, 'rgba(255,170,90,0.12)');
  g.addColorStop(1, 'rgba(255,160,80,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// Thin brass rod with a ring shade. `power` is a ref (0..1) so a parent can
// flicker it on without re-rendering.
const HaloLamp = forwardRef(function HaloLamp({ wood = 'walnut', power, lightIntensity = 2.6, castLight = true, ...props }, ref) {
  const woodMat = useWoodMaterial(wood);
  const brass = useBrass();
  const glow = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3a2a18', emissive: COLORS.bulb, emissiveIntensity: 0, toneMapped: false }), []);
  const halo = useMemo(
    () => new THREE.SpriteMaterial({ map: haloTexture(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false }),
    [],
  );
  const light = useRef();

  useFrame(() => {
    const p = power ? power.current : 1;
    glow.emissiveIntensity = 0.2 + p * 2.2;
    halo.opacity = p * 0.85;
    if (light.current) light.current.intensity = p * lightIntensity;
  });

  return (
    <group ref={ref} {...props}>
      <mesh position={[0, 0.018, 0]} material={woodMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.16, 0.036, 40]} />
      </mesh>
      <mesh position={[0, 0.8, 0]} material={brass} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 1.56, 10]} />
      </mesh>
      <mesh position={[0.09, 1.58, 0]} rotation={[0, 0, Math.PI / 2]} material={brass}>
        <cylinderGeometry args={[0.006, 0.006, 0.18, 8]} />
      </mesh>
      <group position={[0.18, 1.58, 0]} rotation={[0.35, 0, 0]}>
        <mesh material={brass} castShadow>
          <torusGeometry args={[0.17, 0.018, 16, 64]} />
        </mesh>
        <mesh material={glow} position={[0, 0, -0.012]}>
          <torusGeometry args={[0.165, 0.008, 12, 64]} />
        </mesh>
        <mesh material={glow}>
          <sphereGeometry args={[0.04, 20, 20]} />
        </mesh>
        <sprite material={halo} scale={[0.75, 0.75, 0.75]} />
      </group>
      {castLight && <pointLight ref={light} position={[0.18, 1.5, 0.05]} color="#FFC98A" intensity={0} distance={7} decay={1.6} />}
    </group>
  );
});

export default HaloLamp;
