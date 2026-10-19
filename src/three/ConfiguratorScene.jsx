import { Component, Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import DuneChair from './models/DuneChair.jsx';
import ArcTable from './models/ArcTable.jsx';
import HaloLamp from './models/HaloLamp.jsx';
import CaneBench from './models/CaneBench.jsx';
import Vase from './models/Vase.jsx';
import Stool from './models/Stool.jsx';
import Cabinet from './models/Cabinet.jsx';
import DimensionLines from './DimensionLines.jsx';
import { getTexture } from './materials.js';

const deg = (d) => (d * Math.PI) / 180;

class Quiet extends Component {
  constructor(p) {
    super(p);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Model({ model, wood, fabric, width }) {
  switch (model) {
    case 'table':
      return <ArcTable wood={wood} scale={1.25} />;
    case 'lamp':
      return <HaloLamp wood={wood} scale={0.62} lightIntensity={1.4} />;
    case 'bench':
      return <CaneBench wood={wood} length={1.1} />;
    case 'vase':
      return <Vase scale={1.6} />;
    case 'stool':
      return <Stool wood={wood} scale={1.4} />;
    case 'box':
      return <Cabinet wood={wood} scale={0.8} />;
    default:
      return <DuneChair wood={wood} fabric={fabric} width={width} />;
  }
}

// Size of each model in the viewer, for the dimension lines (metres).
const BOUNDS = {
  chair: (w) => [0.78 * w, 0.84, 0.72],
  table: () => [0.6, 0.6, 0.67],
  lamp: () => [0.32, 0.32, 1.05],
  bench: () => [1.1, 0.42, 0.44],
  vase: () => [0.6, 0.6, 0.66],
  stool: () => [0.56, 0.56, 0.64],
  box: () => [0.72, 0.32, 1.0],
};

function Turntable({ children, spinning }) {
  const g = useRef();
  useFrame((_, dt) => {
    if (g.current && spinning.current) g.current.rotation.y += dt * 0.18;
  });
  return <group ref={g}>{children}</group>;
}

function Capture({ glRef }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (!glRef) return;
    glRef.current = {
      snapshot: () => {
        gl.render(scene, camera);
        return gl.domElement.toDataURL('image/png');
      },
      element: gl.domElement,
    };
  }, [gl, scene, camera, glRef]);
  return null;
}

function Plinth() {
  const tex = getTexture('terrazzo-floor', 1);
  return (
    <mesh position={[0, -0.03, 0]} receiveShadow>
      <cylinderGeometry args={[0.78, 0.8, 0.06, 64]} />
      <meshStandardMaterial map={tex} roughness={0.6} />
    </mesh>
  );
}

export default function ConfiguratorScene({
  model = 'chair',
  wood = 'walnut',
  fabric = 'boucle',
  size = 'single',
  dims,
  showDims = false,
  mobile = false,
  active = true,
  reduced = false,
  glRef,
  labels,
}) {
  const width = size === 'wide' ? 1.35 : 1;
  const spinning = useRef(!reduced);
  const [bw, bd, bh] = (BOUNDS[model] || BOUNDS.chair)(width);
  return (
    <Canvas
      shadows
      dpr={mobile ? 1 : [1, 1.25]}
      frameloop={!active ? 'never' : reduced ? 'demand' : 'always'}
      camera={{ fov: 32, position: [2.2, 1.35, 2.6], near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      role="img"
      aria-label={labels || 'A 3D model you can rotate. Use the controls beside it to change wood, fabric and size.'}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 2.5]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} color="#FFF1DF" />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#D9E2F0" />
      <Quiet
        fallback={
          <Environment resolution={64} environmentIntensity={0.5}>
            <Lightformer form="rect" intensity={1.5} position={[0, 3, 2]} scale={[5, 3, 1]} />
          </Environment>
        }
      >
        <Suspense fallback={null}>
          <Environment preset="apartment" environmentIntensity={0.45} />
        </Suspense>
      </Quiet>
      <Turntable spinning={spinning}>
        <Plinth />
        <Model model={model} wood={wood} fabric={fabric} width={width} />
        <group position={[0, 0, model === 'chair' ? 0 : 0]}>
          <DimensionLines w={bw} d={bd} h={bh} show={showDims} />
        </group>
      </Turntable>
      <ContactShadows position={[0, 0.001, 0]} opacity={0.45} scale={3} blur={2.2} far={1.2} resolution={256} color="#3a2414" />
      <OrbitControls
        makeDefault
        target={[0, model === 'lamp' ? 0.5 : 0.35, 0]}
        enablePan={false}
        enableZoom={!mobile}
        minDistance={2}
        maxDistance={5}
        minPolarAngle={deg(60)}
        maxPolarAngle={deg(85)}
        enableDamping
        dampingFactor={0.08}
        onStart={() => {
          spinning.current = false;
        }}
      />
      <Capture glRef={glRef} />
    </Canvas>
  );
}

export { BOUNDS };
