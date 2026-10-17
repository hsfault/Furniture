import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from '../../lib/gsap.js';
import { makeBlendMaterial, woodTexture, fabricTexture, getTexture, COLORS } from '../materials.js';

// A wood material that crossfades to the new wood's texture in 0.6s when `wood` changes.
export function useWoodMaterial(wood, opts = {}) {
  const mat = useMemo(() => makeBlendMaterial(woodTexture(wood), { roughness: 0.48, ...opts }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const prev = useRef(wood);
  useEffect(() => {
    if (prev.current === wood) return undefined;
    prev.current = wood;
    const u = mat.userData.uniforms;
    const next = woodTexture(wood);
    u.map2.value = next;
    u.uMix.value = 0;
    const tw = gsap.to(u.uMix, {
      value: 1,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete() {
        mat.map = next;
        u.uMix.value = 0;
      },
    });
    return () => tw.kill();
  }, [wood, mat]);
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

export function useFabricMaterial(fabric) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: fabricTexture(fabric, 2), roughness: 0.96, metalness: 0 }), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    mat.map = fabricTexture(fabric, 2);
    mat.needsUpdate = true;
  }, [fabric, mat]);
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

export function useBrass() {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLORS.brass, map: getTexture('brass-brushed'), metalness: 0.85, roughness: 0.32 }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

export function useCane(repeat = 3) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: getTexture('cane-weave', repeat), roughness: 0.7 }), [repeat]);
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}
