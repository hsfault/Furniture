import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { getTexture, COLORS } from './materials.js';

const NIGHT = new THREE.Color('#1B1612');
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const seg = (a, b, x) => clamp01((x - a) / (b - a));

/**
 * The cut between two film chapters. Two walnut-veneer doors swing in from the
 * depth and close across the screen, sawdust drifts through warm light, then
 * the doors swing open again. render(c) is a pure function of c (0..1) so the
 * film's master timeline can scrub it.
 */
export class FilmCut {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    this.camera.position.set(0, 0, 5);

    this.scene.add(new THREE.AmbientLight('#ffe9cf', 0.55));
    const key = new THREE.PointLight('#ffc47e', 18, 14, 1.4);
    key.position.set(1.5, 1.8, 3);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight('#9fb0d8', 0.6);
    rim.position.set(-3, 2, -2);
    this.scene.add(rim);

    this.wood = new THREE.MeshStandardMaterial({ map: getTexture('wood-walnut'), roughness: 0.42, metalness: 0.05 });
    this.brass = new THREE.MeshStandardMaterial({ color: COLORS.brass, metalness: 0.9, roughness: 0.3 });
    this.edge = new THREE.MeshStandardMaterial({ color: '#3B2618', roughness: 0.6 });

    this.left = new THREE.Group();
    this.right = new THREE.Group();
    this.scene.add(this.left, this.right);

    // Sawdust: small warm flakes, instanced.
    this.dustCount = 320;
    const flake = new THREE.PlaneGeometry(0.018, 0.012);
    this.dustMat = new THREE.MeshStandardMaterial({ color: '#E8C48E', emissive: '#6b4320', emissiveIntensity: 0.6, side: THREE.DoubleSide, transparent: true });
    this.dust = new THREE.InstancedMesh(flake, this.dustMat, this.dustCount);
    this.seeds = Array.from({ length: this.dustCount }, () => [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 3 - 1, Math.random(), Math.random() * Math.PI * 2]);
    this.scene.add(this.dust);
    this.m4 = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.e = new THREE.Euler();
    this.v = new THREE.Vector3();
    this.s = new THREE.Vector3(1, 1, 1);

    this.resize();
  }

  buildDoors() {
    [this.left, this.right].forEach((g) => {
      g.children.forEach((c) => c.geometry?.dispose());
      g.clear();
    });
    const h = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * 1.04;
    const w = h * this.camera.aspect * 1.04;
    const dw = w / 2;
    this.doorW = dw;
    const geom = new RoundedBoxGeometry(dw, h, 0.14, 4, 0.035);
    // turn the veneer so the grain runs vertically
    const uv = geom.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i) * 2, uv.getX(i));
    const handleGeom = new THREE.CylinderGeometry(0.018, 0.018, Math.min(0.9, h * 0.28), 16);
    const capGeom = new THREE.CylinderGeometry(0.028, 0.028, 0.06, 12);
    const panelGeom = new RoundedBoxGeometry(dw * 0.7, h * 0.36, 0.02, 2, 0.01);

    const make = (group, side) => {
      // side -1 = left door (hinge on the left edge), +1 = right door
      group.position.set(side * (w / 2), 0, 0);
      const door = new THREE.Mesh(geom, this.wood);
      door.position.x = -side * (dw / 2);
      group.add(door);
      [0.22, -0.22].forEach((y) => {
        // raised panels
        const panel = new THREE.Mesh(panelGeom, this.wood);
        panel.position.set(-side * (dw / 2), y * h, 0.075);
        group.add(panel);
      });
      const handle = new THREE.Mesh(handleGeom, this.brass);
      handle.position.set(-side * (dw - 0.16), 0, 0.12);
      group.add(handle);
      [1, -1].forEach((y) => {
        const cap = new THREE.Mesh(capGeom, this.brass);
        cap.rotation.x = Math.PI / 2;
        cap.position.set(-side * (dw - 0.16), (y * Math.min(0.9, h * 0.28)) / 2, 0.08);
        group.add(cap);
      });
      const edgeStrip = new THREE.Mesh(new THREE.BoxGeometry(0.03, h, 0.15), this.edge);
      edgeStrip.position.x = -side * (dw - 0.015);
      group.add(edgeStrip);
    };
    make(this.left, -1);
    make(this.right, 1);
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.buildDoors();
  }

  /** c: 0 -> 1 across the whole cut. */
  render(c, time = performance.now() / 1000) {
    const close = ease(seg(0, 0.36, c));
    const open = ease(seg(0.64, 1, c));
    const depth = (1 - close) * -7 + open * 1.4;
    const angle = THREE.MathUtils.degToRad(82) * (1 - close) + THREE.MathUtils.degToRad(96) * open;
    this.left.position.z = depth;
    this.right.position.z = depth;
    this.left.rotation.y = -angle;
    this.right.rotation.y = angle;

    // night tint: rises as the doors close, clears as they open
    const tint = Math.min(seg(0, 0.3, c), 1 - seg(0.78, 1, c));
    this.renderer.setClearColor(NIGHT, tint * 0.96);

    const dustAlpha = Math.sin(Math.PI * c);
    this.dustMat.opacity = dustAlpha;
    this.seeds.forEach(([x, y, z, s, r], i) => {
      const fall = ((c * (0.6 + s) + s) % 1) * 2.6;
      this.v.set(x * 2.6 + Math.sin(time * 0.7 + r) * 0.08, 1.3 - fall + y * 0.2, z * 1.2 + 1.2);
      this.e.set(r + time * (0.5 + s), r * 0.5 + c * 6, 0);
      this.q.setFromEuler(this.e);
      const k = 0.6 + s * 1.2;
      this.s.set(k, k, k);
      this.m4.compose(this.v, this.q, this.s);
      this.dust.setMatrixAt(i, this.m4);
    });
    this.dust.instanceMatrix.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.renderer.setClearColor(NIGHT, 0);
    this.renderer.clear();
  }

  dispose() {
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
    });
    this.dustMat.dispose();
    this.brass.dispose();
    this.edge.dispose();
    this.wood.dispose(); // the shared texture stays cached for the 3D scenes
    this.renderer.dispose();
  }
}
