import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';

export const CameraHandler: React.FC = () => {
  const scroll = useScroll();
  const setSection = useStore(state => state.setSection);
  const expandedProject = useStore(state => state.expandedProject);
  const projects = useStore(state => state.projects);
  
  // Vectors for smooth interpolation
  const currentPos = useRef(new THREE.Vector3(0, 5, 10));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const lastSection = useRef<number>(-1);
  const targetPosRef = useRef(new THREE.Vector3());
  const targetLookAtRef = useRef(new THREE.Vector3());
  const projectsTRef = useRef(0);
  const smoothScrollRef = useRef(0);
  
  useFrame((state, delta) => {
    // If a project is expanded, we freeze the camera logic to allow the Project component to take over visual focus
    if (expandedProject !== null) {
        return; 
    }

    const dt = Math.min(delta, 1 / 30);

    const rawR = scroll.offset; // 0 to 1 Global
    const r = THREE.MathUtils.damp(smoothScrollRef.current, rawR, 8, dt);
    smoothScrollRef.current = r;
    const sectionSize = 1/5;

    // Determine current section index
    const sectionIndex = Math.floor(r / sectionSize);
    const nextSection = Math.min(sectionIndex, 4);
    if (nextSection !== lastSection.current) {
        lastSection.current = nextSection;
        setSection(nextSection);
    }

    // Target vectors
    const targetPos = targetPosRef.current;
    const targetLookAt = targetLookAtRef.current;

    // --- SECTION 1: INTRO (0 - 0.2) ---
    if (r < 0.2) {
        const t = r / 0.2;
        if (t < 0.5) {
            const localT = t / 0.5; 
            targetPos.set(0, THREE.MathUtils.lerp(5, 2, localT), THREE.MathUtils.lerp(10, 5, localT));
        } else {
            const localT = (t - 0.5) / 0.5;
            targetPos.set(0, THREE.MathUtils.lerp(2, 1.5, localT), THREE.MathUtils.lerp(5, 3, localT));
        }
        targetLookAt.set(0, 0, 0);
    } 
    
    // --- SECTION 2: PROJECTS (0.2 - 0.4) ---
    else if (r < 0.4) {
        const tRaw = THREE.MathUtils.clamp((r - 0.2) / 0.2, 0, 1);
        let t = tRaw;
        if (tRaw <= 0.02) t = 0;
        else if (tRaw >= 0.98) t = 1;
        else t = THREE.MathUtils.damp(projectsTRef.current, tRaw, 3, dt);
        projectsTRef.current = t;

        const total = (projects && projects.length > 0) ? projects.length : 7;
        const spacing = 3.8;
        const minX = -spacing * ((total - 1) * 0.5);
        const maxX = spacing * ((total - 1) * 0.5);
        const targetX = THREE.MathUtils.lerp(minX, maxX, t);

        const seg = 1 / total;
        const half = seg * 0.5;
        let minDist = 1;
        for (let i = 0; i < total; i++) {
            const center = (i + 0.5) * seg;
            const dist = Math.abs(t - center);
            if (dist < minDist) minDist = dist;
        }
        const w = 1 - THREE.MathUtils.clamp(minDist / (half || 1), 0, 1);
        const zoomT = THREE.MathUtils.smoothstep(w, 0, 1);
        const z = THREE.MathUtils.lerp(9.2, 8.0, zoomT);

        targetPos.set(targetX, 1.65, z);
        targetLookAt.set(targetX, 0.7, 0);
    }
    
    // --- SECTION 3: SKILLS (0.4 - 0.6) ---
    else if (r < 0.6) {
        const t = (r - 0.4) / 0.2; 
        const angle = t * Math.PI * 2;
        const radius = 6;
        targetPos.set(Math.sin(angle) * radius, 2, Math.cos(angle) * radius);
        targetLookAt.set(0, 0, 0);
    }
    
    // --- SECTION 4: ABOUT (0.6 - 0.8) ---
    else if (r < 0.8) {
        const t = (r - 0.6) / 0.2;
        const x = THREE.MathUtils.lerp(-5, 5, t);
        targetPos.set(x, 2, 10);
        targetLookAt.set(x, 1, 0);
    }
    
    // --- SECTION 5: CONTACT (0.8 - 1.0) ---
    else {
        const t = (r - 0.8) / 0.2;
        targetPos.set(
            0,
            THREE.MathUtils.lerp(3, 1.5, t),
            THREE.MathUtils.lerp(10, 5, t)
        );
        targetLookAt.set(0, 0, 0);
    }

    const lambda = r >= 0.2 && r < 0.4 ? 9 : 11;
    const alpha = 1 - Math.exp(-lambda * dt);

    // Apply smoothing
    currentPos.current.lerp(targetPos, alpha);
    currentLookAt.current.lerp(targetLookAt, alpha);

    state.camera.position.copy(currentPos.current);
    state.camera.lookAt(currentLookAt.current);
  });

  return null;
};