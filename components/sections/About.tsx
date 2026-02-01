import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Particles } from '../common/Particles';

export const AboutSection: React.FC = () => {
  const scroll = useScroll();
  const group = useRef<THREE.Group>(null);
  
  // 5 Timeline Panels
  // Positions x=-4,-2,0,2,4
  const panels = [
      { id: 1, year: '2019', title: 'Beginning', desc: 'Started journey in CS' },
      { id: 2, year: '2020', title: 'Frontend', desc: 'Mastered React & TS' },
      { id: 3, year: '2021', title: '3D Web', desc: 'Discovered Three.js' },
      { id: 4, year: '2022', title: 'Senior', desc: 'Led diverse teams' },
      { id: 5, year: '2023', title: 'Future', desc: 'Building next-gen UIs' },
  ];

  useFrame(() => {
    // Visibility: Section 4 is 0.6 -> 0.8
    const visible = scroll.visible(3/5, 1/5);
    if (group.current) {
        group.current.visible = visible;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
        {panels.map((p, i) => (
             <TimelinePanel key={p.id} data={p} index={i} total={panels.length} />
        ))}
        
        {/* Background Particles specific to About */}
        <Particles 
            count={100} 
            area={[15, 5, 5]} 
            minSize={0.02} 
            maxSize={0.05} 
            color="#88ccff" 
            opacity={0.5}
        />
    </group>
  );
};

interface PanelData {
    id: number;
    year: string;
    title: string;
    desc: string;
}

interface TimelinePanelProps {
    data: PanelData;
    index: number;
    total: number;
}

const TimelinePanel: React.FC<TimelinePanelProps> = ({ data, index, total }) => {
    const mesh = useRef<THREE.Group>(null);
    const scroll = useScroll();
    
    // X Positions: -4, -2, 0, 2, 4
    const xPos = (index - 2) * 2; 
    
    useFrame(() => {
        // Animation logic
        // We want them to appear sequentially as we scroll through the section
        // Section range: 0.6 to 0.8
        // Local progress 0 to 1
        const sectionStart = 3/5;
        const sectionLength = 1/5;
        const globalOffset = scroll.offset;
        
        if (globalOffset < sectionStart || globalOffset > sectionStart + sectionLength) return;
        
        const localProgress = (globalOffset - sectionStart) / sectionLength;
        
        // Each panel takes up 20% of the section scroll
        const panelStart = index * 0.2;
        const panelEnd = panelStart + 0.3; // overlap slightly
        
        let opacity = 0;
        let yPos = 1;
        
        if (localProgress > panelStart) {
             const t = Math.min(1, (localProgress - panelStart) / 0.15);
             opacity = t;
             yPos = THREE.MathUtils.lerp(1, 2, t);
        }
        
        if (mesh.current) {
            mesh.current.position.set(xPos, yPos, 0);
            
            // Update children opacity if materials support it
            mesh.current.children.forEach((child: any) => {
                if (child.material) child.material.opacity = opacity * 0.8;
                if (child.fillOpacity !== undefined) child.fillOpacity = opacity; // For Text
            });
        }
    });

    return (
        <group ref={mesh} position={[xPos, 1, 0]}>
            <mesh>
                <planeGeometry args={[1.8, 2.5]} />
                <meshPhysicalMaterial 
                    color="#111" 
                    transparent 
                    opacity={0} 
                    roughness={0.2}
                    metalness={0.8}
                    side={THREE.DoubleSide}
                />
            </mesh>
            
            <mesh position={[0, 0, 0.01]}>
                 <ringGeometry args={[0.8, 0.82, 32]} />
                 <meshBasicMaterial color="white" transparent opacity={0} />
            </mesh>

            <Text
                position={[0, 0.5, 0.1]}
                fontSize={0.3}
                color="#4f46e5"
                anchorX="center"
                anchorY="middle"
                fillOpacity={0}
            >
                {data.year}
            </Text>
            
            <Text
                position={[0, 0, 0.1]}
                fontSize={0.15}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.5}
                textAlign="center"
                fillOpacity={0}
            >
                {data.title}
            </Text>
            
            <Text
                position={[0, -0.4, 0.1]}
                fontSize={0.1}
                color="#aaa"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.4}
                textAlign="center"
                fillOpacity={0}
            >
                {data.desc}
            </Text>
        </group>
    );
}