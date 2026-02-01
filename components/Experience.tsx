import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { AdaptiveEvents, ScrollControls, Sparkles, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { IntroSection } from './sections/Intro';
import { ProjectsSection } from './sections/Projects';
import { SkillsSection } from './sections/Skills';
import { AboutSection } from './sections/About';
import { ContactSection } from './sections/Contact';
import { CameraHandler } from './CameraHandler';
import { TOTAL_SECTIONS, useStore } from '../store';

const AdaptiveDprClamp: React.FC<{ min?: number }> = ({ min = 1 }) => {
  const active = useThree((state) => state.internal.active);
  const current = useThree((state) => state.performance.current);
  const initialDpr = useThree((state) => state.viewport.initialDpr);
  const setDpr = useThree((state) => state.setDpr);

  React.useEffect(() => {
    if (!active) return;
    const next = Math.min(initialDpr, Math.max(min, current * initialDpr));
    setDpr(next);
  }, [active, current, initialDpr, min, setDpr]);

  React.useEffect(() => {
    return () => {
      if (active) setDpr(initialDpr);
    };
  }, [active, initialDpr, setDpr]);

  return null;
};

export const Experience: React.FC = () => {
  const expandedProject = useStore((state) => state.expandedProject);
  const isMobile = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 640px)').matches;
  }, []);
  const scrollDistance = isMobile ? 4.2 : 2.2;
  const scrollDamping = isMobile ? 0.14 : 0.09;
  const webglAvailable = React.useMemo(() => {
    if (typeof document === 'undefined') return true;
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  }, []);

  if (!webglAvailable) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">
        WebGL غير متاح على هذا الجهاز/المتصفح
      </div>
    );
  }

  return (
    <Canvas
      gl={{ 
        antialias: false, 
        powerPreference: "low-power",
        alpha: false
      }}
      dpr={[1, expandedProject !== null ? (isMobile ? 1.35 : 1.75) : (isMobile ? 1.1 : 1.35)]}
      onCreated={({ gl }) => {
        const c = gl.domElement;
        const onLost = (e: Event) => {
          e.preventDefault();
          console.error('[WebGL] context lost');
        };
        const onRestored = () => {
          console.warn('[WebGL] context restored');
        };
        c.addEventListener('webglcontextlost', onLost as any, false);
        c.addEventListener('webglcontextrestored', onRestored as any, false);
      }}
    >
      <color attach="background" args={['#000005']} />

      <AdaptiveDprClamp min={1} />
      <AdaptiveEvents />
      
      <Stars radius={140} depth={90} count={900} factor={0.95} saturation={0.25} fade speed={0.06} />
      <Stars radius={70} depth={35} count={180} factor={1.35} saturation={0.1} fade speed={0.1} />
      <Sparkles count={85} speed={0.25} opacity={0.9} color="#ffffff" size={1.2} scale={[90, 60, 90]} noise={0.85} />
      
      <ScrollControls pages={TOTAL_SECTIONS} damping={scrollDamping} distance={scrollDistance}>
        <CameraHandler />
        
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        
        <IntroSection />
        <ProjectsSection />
        <SkillsSection />
        <AboutSection />
        <ContactSection />
      </ScrollControls>

      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom luminanceThreshold={1.6} mipmapBlur={false} intensity={0.22} radius={0.07} />
        <Noise opacity={0.015} />
        <Vignette eskil={false} offset={0.1} darkness={0.55} />
      </EffectComposer>

    </Canvas>
  );
};