import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VideoPlaneProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  opacity?: number;
  transparent?: boolean;
  progress: number; // 0 to 1
  progressRef?: React.MutableRefObject<number>;
  duration?: number;
  playing?: boolean; // New prop to toggle between scrub and play
  scrub?: boolean;
}

export const VideoPlane: React.FC<VideoPlaneProps> = ({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  opacity = 1,
  transparent = true,
  progress,
  progressRef,
  playing = false, // Default to scrubbing
  scrub = true,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const scrubAccumulator = useRef(0);
  
  const [video] = useState(() => {
    const vid = document.createElement('video');
    vid.src = url;
    vid.crossOrigin = 'Anonymous';
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.preload = 'metadata';
    return vid;
  });

  const [texture] = useState(() => {
     const tex = new THREE.VideoTexture(video);
     tex.minFilter = THREE.LinearFilter;
     tex.magFilter = THREE.LinearFilter;
     tex.format = THREE.RGBAFormat;
     tex.generateMipmaps = false;
     // Use string literal 'srgb' for safety across versions/bundlers
     tex.colorSpace = 'srgb'; 
     return tex;
  });

  useEffect(() => {
    if (playing) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [playing, video]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.opacity = opacity;
    }
  }, [opacity]);

  useFrame((_, delta) => {
    // If NOT playing, we scrub based on progress
    if (!playing && scrub && video.duration) {
      scrubAccumulator.current += delta;
      if (scrubAccumulator.current < 1 / 15) return;
      scrubAccumulator.current = 0;

      const effectiveProgress = progressRef ? progressRef.current : progress;
      const targetTime = Math.max(0, Math.min(effectiveProgress * video.duration, video.duration));
      if (Math.abs(video.currentTime - targetTime) > 0.1) {
          video.currentTime = targetTime;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 0.5625]} /> 
      <meshBasicMaterial 
        ref={materialRef} 
        map={texture} 
        transparent={transparent} 
        opacity={opacity}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
};