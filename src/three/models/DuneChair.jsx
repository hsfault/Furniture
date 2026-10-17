import { forwardRef, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useWoodMaterial, useFabricMaterial } from './useWood.js';

const SINGLE = 0.78;

/**
 * The Dune lounge chair: low walnut frame, tapered legs, thick cushions.
 * `width` is a multiplier (1 = single, 1.35 = wide) and is sprung, not snapped.
 * Changing `fabric` swaps the cushion cloth with a small "puff".
 */
const DuneChair = forwardRef(function DuneChair({ wood = 'walnut', fabric = 'boucle', width = 1, ...props }, ref) {
  const woodMat = useWoodMaterial(wood);
  const fabricMat = useFabricMaterial(fabric);
  const spring = useRef({ w: width, v: 0, puff: 0, pv: 0 });
  const parts = useRef({});
  const set = (k) => (el) => {
    parts.current[k] = el;
  };

  useEffect(() => {
    spring.current.pv += 0.9; // kick the cushions
  }, [fabric]);

  useFrame((_, dt) => {
    const s = spring.current;
    const d = Math.min(dt, 1 / 30);
    s.v += (width - s.w) * 140 * d;
    s.v *= Math.exp(-11 * d);
    s.w += s.v * d;
    s.pv += -s.puff * 260 * d;
    s.pv *= Math.exp(-9 * d);
    s.puff += s.pv * d;
    const W = SINGLE * s.w;
    const p = parts.current;
    if (!p.base) return;
    p.base.scale.x = W;
    p.back.scale.x = W;
    p.seat.scale.x = W - 0.14;
    p.cushionBack.scale.x = W - 0.16;
    p.armL.position.x = -(W / 2 - 0.035);
    p.armR.position.x = W / 2 - 0.035;
    const lx = W / 2 - 0.07;
    p.legs.children.forEach((leg, i) => {
      leg.position.x = i % 2 ? lx : -lx;
    });
    const k = 1 + s.puff * 0.12;
    p.cushions.scale.set(1 + s.puff * 0.04, k, 1 + s.puff * 0.05);
  });

  return (
    <group ref={ref} {...props}>
      <group ref={set('legs')}>
        {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([x, z], i) => (
          <mesh key={i} position={[x * 0.32, 0.05, z * 0.33]} material={woodMat} castShadow>
            <cylinderGeometry args={[0.022, 0.013, 0.1, 12]} />
          </mesh>
        ))}
      </group>
      <RoundedBox ref={set('base')} args={[1, 0.07, 0.78]} radius={0.02} smoothness={3} position={[0, 0.135, 0]} material={woodMat} castShadow receiveShadow />
      <RoundedBox ref={set('armL')} args={[0.07, 0.26, 0.78]} radius={0.03} smoothness={3} position={[-0.355, 0.3, 0]} material={woodMat} castShadow />
      <RoundedBox ref={set('armR')} args={[0.07, 0.26, 0.78]} radius={0.03} smoothness={3} position={[0.355, 0.3, 0]} material={woodMat} castShadow />
      <RoundedBox ref={set('back')} args={[1, 0.42, 0.06]} radius={0.025} smoothness={3} position={[0, 0.37, -0.37]} rotation={[-0.12, 0, 0]} material={woodMat} castShadow />
      <group ref={set('cushions')} position={[0, 0.17, 0]}>
        <RoundedBox ref={set('seat')} args={[1, 0.15, 0.7]} radius={0.065} smoothness={5} position={[0, 0.075, 0.03]} material={fabricMat} castShadow receiveShadow />
        <RoundedBox ref={set('cushionBack')} args={[1, 0.36, 0.15]} radius={0.07} smoothness={5} position={[0, 0.31, -0.27]} rotation={[-0.2, 0, 0]} material={fabricMat} castShadow />
      </group>
    </group>
  );
});

export default DuneChair;
