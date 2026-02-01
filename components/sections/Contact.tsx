import React, { useRef } from 'react';
import { useScroll, Text, Float } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const ContactSection: React.FC = () => {
  const scroll = useScroll();
  const isMobile = useThree((state) => state.size.width <= 640);
  const group = useRef<THREE.Group>(null);
  const arFont = "https://cdn.jsdelivr.net/npm/@openfonts/tajawal_arabic@1.44.1/files/tajawal-arabic-700.woff";
  const email = "ahmedmhram3@gmail.com";
  
  useFrame(() => {
    // Visibility logic (Section 5 is 0.8 - 1.0)
    // We make it visible during the last part of scroll
    const visible = scroll.range(4/5, 1/5) > 0.1;
    if (group.current) {
        group.current.visible = visible;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            {/* Arabic Text */}
            <Text
                font={arFont}
                fontSize={isMobile ? 0.42 : 0.6}
                maxWidth={isMobile ? 5.6 : 8}
                lineHeight={1.5}
                textAlign="center"
                direction="rtl"
                position={[0, isMobile ? 2.1 : 2.5, 0]}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.01}
                outlineColor="#000000"
            >
                لو عايز حد يحققلك افكارك ابعتلي
            </Text>
            
             <Text
                font={arFont}
                fontSize={isMobile ? 0.18 : 0.25}
                position={[0, isMobile ? 1.3 : 1.5, 0]}
                color="#88ccff"
                anchorX="center"
                anchorY="middle"
                direction="rtl"
            >
                تواصل عبر البريد: {email}
            </Text>

            {/* Glowing Button Placeholder */}
            <mesh position={[0, isMobile ? 0.45 : 0.5, 0]} onClick={() => window.location.href = `mailto:${email}`}>
                <planeGeometry args={[isMobile ? 2.4 : 3, isMobile ? 0.85 : 1]} />
                <meshBasicMaterial color="#4f46e5" transparent opacity={0.8} />
            </mesh>
            <Text
                 position={[0, isMobile ? 0.45 : 0.5, 0.1]}
                 font={arFont}
                 fontSize={isMobile ? 0.22 : 0.3}
                 color="white"
                 anchorX="center"
                 anchorY="middle"
                 direction="rtl"
            >
                ابعتلي
            </Text>
        </Float>
    </group>
  );
};