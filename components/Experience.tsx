import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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

type QualityTier = 'low' | 'medium' | 'high';

const AutoQuality: React.FC<{ quality: QualityTier; setQuality: React.Dispatch<React.SetStateAction<QualityTier>> }> = ({ quality, setQuality }) => {
  const qualityRef = React.useRef<QualityTier>(quality);
  React.useEffect(() => {
    qualityRef.current = quality;
  }, [quality]);

  const emaFpsRef = React.useRef(60);
  const lowTimeRef = React.useRef(0);
  const highTimeRef = React.useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(Math.max(delta, 1 / 240), 1 / 10);
    const fps = 1 / dt;
    const ema = emaFpsRef.current * 0.9 + fps * 0.1;
    emaFpsRef.current = ema;

    if (ema < 52) {
      lowTimeRef.current += dt;
      highTimeRef.current = 0;
    } else if (ema > 58) {
      highTimeRef.current += dt;
      lowTimeRef.current = 0;
    } else {
      lowTimeRef.current *= 0.92;
      highTimeRef.current *= 0.92;
    }

    if (lowTimeRef.current > 1.2) {
      lowTimeRef.current = 0;
      if (qualityRef.current === 'high') setQuality('medium');
      else if (qualityRef.current === 'medium') setQuality('low');
    }

    if (highTimeRef.current > 4.0) {
      highTimeRef.current = 0;
      if (qualityRef.current === 'low') setQuality('medium');
      else if (qualityRef.current === 'medium') setQuality('high');
    }
  });

  return null;
};

export const Experience: React.FC = () => {
  const expandedProject = useStore((state) => state.expandedProject);
  const isMobile = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 640px)').matches;
  }, []);
  const scrollDistance = isMobile ? 2.9 : 2.2;
  const scrollDamping = isMobile ? 0.18 : 0.09;

  const initialQuality = React.useMemo<QualityTier>(() => {
    if (typeof navigator === 'undefined') return isMobile ? 'medium' : 'high';
    const dm = (navigator as any).deviceMemory as number | undefined;
    if (isMobile) {
      if (dm !== undefined && dm <= 4) return 'low';
      return 'medium';
    }
    if (dm !== undefined && dm <= 8) return 'medium';
    return 'high';
  }, [isMobile]);

  const [quality, setQuality] = React.useState<QualityTier>(initialQuality);

  const dprMin = React.useMemo(() => {
    if (quality === 'high') return isMobile ? 1.25 : 1.05;
    if (quality === 'medium') return isMobile ? 1.15 : 1;
    return isMobile ? 1 : 1;
  }, [isMobile, quality]);

  const dprMax = React.useMemo(() => {
    if (expandedProject !== null) {
      if (quality === 'high') return isMobile ? 2.0 : 1.85;
      if (quality === 'medium') return isMobile ? 1.85 : 1.75;
      return isMobile ? 1.35 : 1.4;
    }
    if (quality === 'high') return isMobile ? 1.9 : 1.55;
    if (quality === 'medium') return isMobile ? 1.75 : 1.35;
    return isMobile ? 1.25 : 1.25;
  }, [expandedProject, isMobile, quality]);

  const spaceCfg = React.useMemo(() => {
    if (quality === 'high') {
      return {
        starsA: isMobile ? 950 : 1300,
        starsB: isMobile ? 190 : 260,
        sparkles: isMobile ? 95 : 130,
        bloomIntensity: 0.34,
        bloomThreshold: 1.35,
      };
    }
    if (quality === 'medium') {
      return {
        starsA: 900,
        starsB: 180,
        sparkles: 85,
        bloomIntensity: 0.22,
        bloomThreshold: 1.6,
      };
    }
    return {
      starsA: isMobile ? 520 : 650,
      starsB: isMobile ? 110 : 130,
      sparkles: isMobile ? 35 : 45,
      bloomIntensity: 0.14,
      bloomThreshold: 1.85,
    };
  }, [isMobile, quality]);
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
        antialias: quality !== 'low',
        powerPreference: isMobile ? "high-performance" : "low-power",
        alpha: false
      }}
      dpr={[dprMin, dprMax]}
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

      <AdaptiveDprClamp min={dprMin} />
      <AdaptiveEvents />

      <AutoQuality quality={quality} setQuality={setQuality} />
      
      <Stars radius={140} depth={90} count={spaceCfg.starsA} factor={0.95} saturation={0.25} fade speed={0.06} />
      <Stars radius={70} depth={35} count={spaceCfg.starsB} factor={1.35} saturation={0.1} fade speed={0.1} />
      <Sparkles count={spaceCfg.sparkles} speed={0.25} opacity={0.9} color="#ffffff" size={1.2} scale={[90, 60, 90]} noise={0.85} />
      
      <ScrollControls pages={TOTAL_SECTIONS} damping={scrollDamping} distance={scrollDistance}>
        <CameraHandler />
        
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        
        <IntroSection />
        <ProjectsSection />
        <SkillsSection quality={quality} />
        <AboutSection />
        <ContactSection />
      </ScrollControls>

      {quality !== 'low' && (
        <EffectComposer disableNormalPass multisampling={0}>
          <Bloom luminanceThreshold={spaceCfg.bloomThreshold} mipmapBlur={false} intensity={spaceCfg.bloomIntensity} radius={0.07} />
          <Noise opacity={0.015} />
          <Vignette eskil={false} offset={0.1} darkness={0.55} />
        </EffectComposer>
      )}

    </Canvas>
  );
};