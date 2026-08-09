import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import type { Mesh } from 'three';

const LIME = '#A3E635';
const PINK = '#F472B6';

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

function KnotMesh() {
  const mesh = useRef<Mesh>(null);
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (!mesh.current || reduced) return;
    // Slow orbital rotation on the Y axis (0.003 / frame), plus a whisper of X spin.
    mesh.current.rotation.y += 0.003;
    mesh.current.rotation.x += delta * 0.02;
  });

  return (
    <Float speed={reduced ? 0 : 1.2} rotationIntensity={reduced ? 0 : 0.15} floatIntensity={reduced ? 0 : 0.6}>
      <mesh ref={mesh}>
        <torusKnotGeometry args={[1, 0.32, 128, 16]} />
        <meshBasicMaterial color={LIME} wireframe transparent opacity={0.9} />
      </mesh>
    </Float>
  );
}

function Ring() {
  const mesh = useRef<Mesh>(null);
  const reduced = useReducedMotion();

  useFrame(() => {
    if (!mesh.current || reduced) return;
    mesh.current.rotation.z += 0.0015;
    mesh.current.rotation.y += 0.0008;
  });

  return (
    <Float speed={reduced ? 0 : 0.8} rotationIntensity={0} floatIntensity={reduced ? 0 : 0.3}>
      <mesh ref={mesh}>
        <torusGeometry args={[1.62, 0.015, 8, 96]} />
        <meshBasicMaterial color={PINK} wireframe transparent opacity={0.4} />
      </mesh>
    </Float>
  );
}

export default function WireframeScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <KnotMesh />
      <Ring />
    </Canvas>
  );
}