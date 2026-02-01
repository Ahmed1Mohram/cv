import React, { useRef } from 'react';
import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Particles } from '../common/Particles';
import { VideoPlane } from '../common/VideoPlane';
import * as THREE from 'three';

// Intro is 0 to 0.2 of total scroll
export const IntroSection: React.FC = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const videoProgressRef = useRef(0);
  
  // We use a ref to track local opacity to avoid react re-renders
  const particlesOpacityRef = useRef(0);

  useFrame(() => {
    // Normalizing global scroll to 0-1 for this section
    // Range (0, 0.2)
    const r1 = scroll.range(0, 0.2); // 0 -> 1 during the first 20% of scroll
    videoProgressRef.current = scroll.range(0, 1/5);
    
    // Fade in particles 0 -> 1 frames 1-60 (approx first 20% of the section)
    const fadeIn = Math.min(1, r1 * 5); 
    particlesOpacityRef.current = fadeIn;
    
    if (groupRef.current) {
        // Simple parallax or movement if needed
    }
  });
  
  // Using a placeholder video URL. In production, use local assets.
  const videoUrl = ""; 

  return (
    <group ref={groupRef}>
      {videoUrl && (
        <VideoPlane 
          url={videoUrl} 
          position={[0, 2, -5]} 
          scale={[16, 9, 1]} 
          opacity={0.55} 
          progress={0}
          progressRef={videoProgressRef}
        />
      )}

      <Particles 
        count={300} 
        area={[20, 10, 20]} 
        minSize={0.02} 
        maxSize={0.08} 
        opacity={1}
        opacityRef={particlesOpacityRef}
      />
    </group>
  );
};