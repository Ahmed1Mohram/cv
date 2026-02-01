import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesProps {
  count: number;
  area: [number, number, number]; // x, y, z spread
  minSize: number;
  maxSize: number;
  color?: string;
  velocityScale?: number;
  opacity?: number;
  opacityRef?: React.MutableRefObject<number>;
}

export const Particles: React.FC<ParticlesProps> = ({
  count,
  area,
  minSize,
  maxSize,
  color = '#ffffff',
  velocityScale = 0.02,
  opacity = 1,
  opacityRef
}) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const updateAccumulator = useRef(0);
  
  // Generate random initial positions and velocities
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * area[0];
      const y = (Math.random() - 0.5) * area[1];
      const z = (Math.random() - 0.5) * area[2];
      const speed = Math.random() * velocityScale;
      const factor = Math.random() * 100; // Random offset for sine waves
      const size = Math.random() * (maxSize - minSize) + minSize;
      temp.push({ x, y, z, speed, factor, size, mx: 0, my: 0 });
    }
    return temp;
  }, [count, area, minSize, maxSize, velocityScale]);

  const dummy = new THREE.Object3D();

  useFrame((state, delta) => {
    if (!mesh.current) return;

    updateAccumulator.current += delta;
    if (updateAccumulator.current < 1 / 30) return;
    updateAccumulator.current = 0;

    const effectiveOpacity = opacityRef ? opacityRef.current : opacity;

    particles.forEach((particle, i) => {
      // Movement Logic
      particle.y += particle.speed;
      // Reset if out of bounds (looping)
      if (particle.y > area[1] / 2) particle.y = -area[1] / 2;

      // Subtle sway
      const t = state.clock.getElapsedTime();
      const sway = Math.sin(t * 0.5 + particle.factor) * 0.1;
      
      dummy.position.set(
        particle.x + sway,
        particle.y,
        particle.z
      );

      dummy.rotation.set(0, 0, 0);

      dummy.scale.set(particle.size, particle.size, particle.size);
      dummy.updateMatrix();
      
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    
    mesh.current.instanceMatrix.needsUpdate = true;
    
    // Update global opacity via material color or uniform if using shader
    // Here using standard material transparent prop
    if(mesh.current.material instanceof THREE.Material) {
        mesh.current.material.opacity = effectiveOpacity;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        emissive={color}
        emissiveIntensity={2}
        toneMapped={false}
      />
    </instancedMesh>
  );
};
