import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveEvents, ScrollControls, Sparkles, Stars, useScroll } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { IntroSection } from './sections/Intro';
import { ProjectsSection } from './sections/Projects';
import { SkillsSection } from './sections/Skills';
import { AboutSection } from './sections/About';
import { ContactSection } from './sections/Contact';
import { CameraHandler } from './CameraHandler';
import { SECTIONS, TOTAL_SECTIONS, useStore } from '../store';
import * as THREE from 'three';

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

const ShadowSettings: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const gl = useThree((s) => s.gl);

  React.useEffect(() => {
    gl.shadowMap.enabled = enabled;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.shadowMap.needsUpdate = true;
  }, [enabled, gl]);

  return null;
};

const SceneLights: React.FC<{ quality: QualityTier; shadowsEnabled: boolean }> = ({ quality, shadowsEnabled }) => {
  const scroll = useScroll();
  const ambientRef = React.useRef<THREE.AmbientLight>(null);
  const dirRef = React.useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const inSkills = scroll.visible(2 / 5, 1 / 5);
    const aBase = inSkills ? 0.006 : 0.1;
    const dBase = inSkills ? 0.012 : 0.5;
    const a = quality === 'high' ? aBase : quality === 'medium' ? (aBase * 0.9) : (aBase * 0.8);
    const d = quality === 'high' ? dBase : quality === 'medium' ? (dBase * 0.85) : (dBase * 0.75);
    if (ambientRef.current) ambientRef.current.intensity = a;
    if (dirRef.current) dirRef.current.intensity = d;
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.1} />
      <directionalLight
        ref={dirRef}
        position={[5, 7, 6]}
        intensity={0.5}
        color={'#dbe7ff'}
        castShadow={false}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.00025}
      />
    </>
  );
};

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
  const currentSection = useStore((state) => state.currentSection);
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

  const inProjects = React.useMemo(() => {
    return expandedProject === null && currentSection === SECTIONS.PROJECTS;
  }, [currentSection, expandedProject]);

  const inSkills = React.useMemo(() => {
    return expandedProject === null && currentSection === SECTIONS.SKILLS;
  }, [currentSection, expandedProject]);

  const shadowsEnabled = React.useMemo(() => {
    if (isMobile) return false;
    if (inSkills && (quality === 'high' || quality === 'medium')) return true;
    return quality === 'high';
  }, [inSkills, isMobile, quality]);

  const dprMin = React.useMemo(() => {
    let v = 1;
    if (quality === 'high') v = isMobile ? 1.25 : 1.05;
    else if (quality === 'medium') v = isMobile ? 1.15 : 1;
    else v = isMobile ? 1 : 1;
    if (inProjects) v = Math.min(v, isMobile ? 1.05 : 1);
    return v;
  }, [inProjects, isMobile, quality]);

  const dprMax = React.useMemo(() => {
    if (expandedProject !== null) {
      if (quality === 'high') return isMobile ? 2.0 : 1.85;
      if (quality === 'medium') return isMobile ? 1.85 : 1.75;
      return isMobile ? 1.35 : 1.4;
    }
    let v = 1;
    if (quality === 'high') v = isMobile ? 1.9 : 1.55;
    else if (quality === 'medium') v = isMobile ? 1.75 : 1.35;
    else v = isMobile ? 1.25 : 1.25;
    if (inProjects) v = Math.min(v, isMobile ? 1.3 : 1.15);
    return v;
  }, [expandedProject, inProjects, isMobile, quality]);

  const spaceCfg = React.useMemo(() => {
    const projectsScale = inProjects ? 0.75 : 1;
    if (quality === 'high') {
      return {
        starsA: Math.round((isMobile ? 950 : 1300) * projectsScale),
        starsB: Math.round((isMobile ? 190 : 260) * projectsScale),
        sparkles: Math.round((isMobile ? 95 : 130) * projectsScale),
        bloomIntensity: 0.34 * (inProjects ? 0.0 : 1),
        bloomThreshold: 1.35,
      };
    }
    if (quality === 'medium') {
      return {
        starsA: Math.round(900 * projectsScale),
        starsB: Math.round(180 * projectsScale),
        sparkles: Math.round(85 * projectsScale),
        bloomIntensity: 0.22 * (inProjects ? 0.0 : 1),
        bloomThreshold: 1.6,
      };
    }
    return {
      starsA: Math.round((isMobile ? 520 : 650) * projectsScale),
      starsB: Math.round((isMobile ? 110 : 130) * projectsScale),
      sparkles: Math.round((isMobile ? 35 : 45) * projectsScale),
      bloomIntensity: 0.14 * (inProjects ? 0.0 : 1),
      bloomThreshold: 1.85,
    };
  }, [inProjects, isMobile, quality]);
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
      shadows={shadowsEnabled}
      gl={{ 
        antialias: quality !== 'low',
        powerPreference: isMobile ? "high-performance" : "low-power",
        alpha: false
      }}
      dpr={[dprMin, dprMax]}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = shadowsEnabled;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
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

      <ShadowSettings enabled={shadowsEnabled} />

      <AutoQuality quality={quality} setQuality={setQuality} />
      
      <Stars radius={140} depth={90} count={spaceCfg.starsA} factor={0.95} saturation={0.25} fade speed={0.06} />
      <Stars radius={70} depth={35} count={spaceCfg.starsB} factor={1.35} saturation={0.1} fade speed={0.1} />
      <Sparkles count={spaceCfg.sparkles} speed={0.25} opacity={0.9} color="#ffffff" size={1.2} scale={[90, 60, 90]} noise={0.85} />
      
      <ScrollControls pages={TOTAL_SECTIONS} damping={scrollDamping} distance={scrollDistance}>
        <CameraHandler />
        <SceneLights quality={quality} shadowsEnabled={shadowsEnabled} />
        
        <IntroSection />
        <ProjectsSection />
        <SkillsSection quality={quality} />
        <AboutSection />
        <ContactSection />
      </ScrollControls>

      {quality !== 'low' && !inProjects && (
        <EffectComposer disableNormalPass multisampling={0}>
          <Bloom luminanceThreshold={spaceCfg.bloomThreshold} mipmapBlur={false} intensity={spaceCfg.bloomIntensity} radius={0.07} />
          <Noise opacity={0.015} />
          <Vignette eskil={false} offset={0.1} darkness={0.55} />
        </EffectComposer>
      )}

    </Canvas>
  );
};