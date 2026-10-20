import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus } from '@react-three/drei';

function FitnessRings() {
  const outerRingRef = useRef();
  const middleRingRef = useRef();
  const innerSphereRef = useRef();

  useFrame((state, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += delta * 0.4;
      outerRingRef.current.rotation.y += delta * 0.3;
    }
    if (middleRingRef.current) {
      middleRingRef.current.rotation.x -= delta * 0.3;
      middleRingRef.current.rotation.z += delta * 0.4;
    }
    if (innerSphereRef.current) {
      innerSphereRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      {/* Outer Emerald Fitness Ring */}
      <Torus ref={outerRingRef} args={[2.2, 0.08, 32, 100]}>
        <meshStandardMaterial
          color="#10b981"
          emissive="#059669"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </Torus>

      {/* Middle Cyan Metabolism Ring */}
      <Torus ref={middleRingRef} args={[1.7, 0.07, 32, 100]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </Torus>

      {/* Pulsing Core Energy Orb */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere ref={innerSphereRef} args={[0.95, 64, 64]}>
          <MeshDistortMaterial
            color="#10b981"
            emissive="#047857"
            emissiveIntensity={0.4}
            distort={0.35}
            speed={2}
            roughness={0.1}
            metalness={0.9}
          />
        </Sphere>
      </Float>
    </group>
  );
}

export default function Hero3D() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '440px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -5, -5]} color="#06b6d4" intensity={2} />
        <pointLight position={[5, 5, 5]} color="#10b981" intensity={3} />
        <FitnessRings />
      </Canvas>
    </div>
  );
}
