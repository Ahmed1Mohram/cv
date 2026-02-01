import React, { useEffect, useRef, useState } from 'react';
import { RoundedBox, useScroll, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';

// Projects section: 0.2 to 0.4
export const ProjectsSection: React.FC = () => {
  const scroll = useScroll();
  const camera = useThree(state => state.camera);
  
  const groupRef = useRef<THREE.Group>(null);
  const [activeProject, setActiveProject] = useState(0);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [prefetchAll, setPrefetchAll] = useState(false);
  const prefetchTimerRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const activeProjectRef = useRef(0);
  const sectionVisibleRef = useRef(false);
  const wasVisibleRef = useRef(false);
  
  const expandedProject = useStore(state => state.expandedProject);
  const setExpandedProject = useStore(state => state.setExpandedProject);
  const projectsFromStore = useStore(state => state.projects);

  const showScreenshots = sectionVisible || expandedProject !== null;

  const spacing = 3.8;
  const fallbackProjects = [
      { id: 1, title: "موقع د. أحمد محرم", subtitle: "موقع تعريفي احترافي وتجربة مستخدم سلسة", liveUrl: "https://dr-ahmed-mohram.vercel.app/", localScreenshotUrl: "/projects/dr-ahmed-mohram.jpg" },
      { id: 2, title: "بورتفوليو محمد محرم", subtitle: "واجهة حديثة مع انتقالات ناعمة وأداء سريع", liveUrl: "https://mohamed-mohram.vercel.app/", localScreenshotUrl: "/projects/mohamed-mohram.jpg" },
      { id: 3, title: "مشروع تجريبي", subtitle: "تجارب واجهات وتفاعلات لتطوير الفكرة", liveUrl: "https://fgdfg-livid.vercel.app/", localScreenshotUrl: "/projects/fgdfg-livid.jpg" },
      { id: 4, title: "المستقبل", subtitle: "موقع محتوى/خدمات مع تنظيم واضح للأقسام", liveUrl: "https://www.almostaqbal.net/", localScreenshotUrl: "/projects/almostaqbal.jpg" },
      { id: 5, title: "أذكار", subtitle: "تجربة بسيطة وسريعة لقراءة الأذكار", liveUrl: "https://azqar.vercel.app/", localScreenshotUrl: "/projects/azqar.jpg" },
      { id: 6, title: "Mohram AI", subtitle: "تجربة ذكاء اصطناعي بواجهة نظيفة وسريعة", liveUrl: "https://mohram-ai.vercel.app/", localScreenshotUrl: "/projects/mohram-ai.jpg" },
      { id: 7, title: "كوتش نصر", subtitle: "صفحة هبوط تركّز على التحويل والثقة", liveUrl: "https://cotch-nasr.vercel.app/", localScreenshotUrl: "/projects/cotch-nasr.jpg" }
  ];

  const projects = ((projectsFromStore && projectsFromStore.length > 0) ? projectsFromStore : fallbackProjects).map((p: any, idx: number, arr: any[]) => {
      const liveUrl = (p?.liveUrl ?? p?.live_url ?? '') as string;
      const localScreenshotUrl = (p?.imageUrl ?? p?.image_url ?? p?.localScreenshotUrl ?? '') as string;
      const x = (idx - (arr.length - 1) / 2) * spacing;
      return {
          id: Number(p.id),
          x,
          title: (p?.title ?? '') as string,
          subtitle: (p?.subtitle ?? '') as string,
          liveUrl,
          localScreenshotUrl,
      };
  });

  useEffect(() => {
    if (prefetchTimerRef.current) {
      window.clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = null;
    }

    if (sectionVisible && expandedProject === null) {
      setPrefetchAll(false);
      prefetchTimerRef.current = window.setTimeout(() => {
        setPrefetchAll(true);
      }, 700);
    } else {
      setPrefetchAll(false);
    }

    return () => {
      if (prefetchTimerRef.current) {
        window.clearTimeout(prefetchTimerRef.current);
        prefetchTimerRef.current = null;
      }
    };
  }, [sectionVisible, expandedProject]);

  useFrame((state, delta) => {
    // If a project is expanded, we handle animation logic for that specific project
    if (expandedProject !== null) return;

    // Normal Scroll Logic
    const start = 1/5;
    const end = 2/5;
    const offset = scroll.offset;

    const nextVisible = scroll.visible(start, 1/5);

    if (nextVisible !== sectionVisibleRef.current) {
      sectionVisibleRef.current = nextVisible;
      setSectionVisible(nextVisible);
    }

    let rawP = 0;
    if (offset > start && offset < end) {
        rawP = (offset - start) / (end - start);
    } else if (offset >= end) {
        rawP = 1;
    }
    if (rawP <= 0.01) rawP = 0;
    else if (rawP >= 0.99) rawP = 1;

    if (!nextVisible) {
      wasVisibleRef.current = false;
      smoothProgressRef.current = 0;
      progressRef.current = 0;
      if (activeProjectRef.current !== 0) {
        activeProjectRef.current = 0;
        setActiveProject(0);
      }
      if (groupRef.current) {
        groupRef.current.visible = false;
      }
      return;
    }

    if (!wasVisibleRef.current) {
      wasVisibleRef.current = true;
      smoothProgressRef.current = 0;
      progressRef.current = 0;
      if (activeProjectRef.current !== 0) {
        activeProjectRef.current = 0;
        setActiveProject(0);
      }
    }

    const p = THREE.MathUtils.damp(smoothProgressRef.current, rawP, 3, delta);
    smoothProgressRef.current = p;
    progressRef.current = p;

    const total = projects.length;
    let nextActive = 0;
    if (total > 0) {
      const seg = 1 / total;
      let bestDist = Infinity;
      for (let i = 0; i < total; i++) {
        const center = (i + 0.5) * seg;
        const d = Math.abs(p - center);
        if (d < bestDist) {
          bestDist = d;
          nextActive = i;
        }
      }
    }
    if (nextActive !== activeProjectRef.current) {
      activeProjectRef.current = nextActive;
      setActiveProject(nextActive);
    }
    
    if (groupRef.current) {
         groupRef.current.visible = nextVisible || expandedProject !== null;
    }
  });

  const handleProjectClick = (id: number) => {
    if (expandedProject !== null) return;
    if (!sectionVisibleRef.current) return;
    setExpandedProject(id);
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
        {projects.map((proj, idx) => (
            <ProjectItem 
                key={proj.id}
                proj={proj}
                index={idx}
                activeIndex={activeProject}
                prefetchAll={prefetchAll}
                total={projects.length}
                isActive={idx === activeProject}
                isExpanded={expandedProject === proj.id}
                anyExpanded={expandedProject !== null}
                showScreenshots={showScreenshots}
                progress={0}
                progressRef={progressRef}
                onClick={sectionVisible ? (() => handleProjectClick(proj.id)) : (() => {})}
                camera={camera}
            />
        ))}
    </group>
  );
};

interface ProjectItemProps {
    proj: { id: number; x: number; title: string; subtitle: string; liveUrl: string; localScreenshotUrl: string };
    index: number;
    activeIndex: number;
    prefetchAll: boolean;
    total: number;
    isActive: boolean;
    isExpanded: boolean;
    anyExpanded: boolean;
    showScreenshots: boolean;
    progress: number;
    progressRef?: React.MutableRefObject<number>;
    onClick: () => void;
    camera: THREE.Camera;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ 
    proj, index, activeIndex, prefetchAll, total, isActive, isExpanded, anyExpanded, showScreenshots, progress, progressRef, onClick, camera 
}) => {
    const group = useRef<THREE.Group>(null);
    const gl = useThree(state => state.gl);
    const targetPos = useRef(new THREE.Vector3());
    const targetScale = useRef(new THREE.Vector3(1, 1, 1));
    const targetRot = useRef(new THREE.Euler(0, 0, 0));
    const tmpForward = useRef(new THREE.Vector3());
    const tmpTargetPosition = useRef(new THREE.Vector3());
    const arFont = "https://cdn.jsdelivr.net/npm/@openfonts/tajawal_arabic@1.44.1/files/tajawal-arabic-700.woff";

    const textureRef = useRef<THREE.Texture | null>(null);
    const textureTierRef = useRef<'low' | 'high' | null>(null);
    const controllerRef = useRef<AbortController | null>(null);
    const requestIdRef = useRef(0);
    const inFlightRef = useRef(false);
    const inFlightTierRef = useRef<'low' | 'high' | null>(null);
    const mountedRef = useRef(true);
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const [textureReady, setTextureReady] = useState(false);
    const [textureFailed, setTextureFailed] = useState(false);

    const isNear = Math.abs(index - activeIndex) <= 1;
    const shouldLoad = (isExpanded || (showScreenshots && !anyExpanded && (prefetchAll || isNear)));

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const desiredTier: 'low' | 'high' = (isExpanded || isNear) ? 'high' : 'low';
        const hasUsable = !!textureRef.current && (textureTierRef.current === 'high' || textureTierRef.current === desiredTier);
        if (hasUsable) {
            if (!textureReady) setTextureReady(true);
            if (textureFailed) setTextureFailed(false);
            return;
        }

        if (!shouldLoad && !inFlightRef.current) {
            return;
        }

        if (inFlightRef.current && (inFlightTierRef.current === 'high' || inFlightTierRef.current === desiredTier)) {
            return;
        }

        requestIdRef.current += 1;
        const requestId = requestIdRef.current;
        inFlightRef.current = true;
        inFlightTierRef.current = desiredTier;
        if (controllerRef.current) controllerRef.current.abort();
        controllerRef.current = new AbortController();

        setTextureFailed(false);

        const baseUrl = (import.meta as any)?.env?.BASE_URL ?? '/';
        const withBase = (u: string) => {
            if (!u) return u;
            if (!u.startsWith('/')) return u;
            const b = String(baseUrl);
            return `${b.replace(/\/$/, '')}${u}`;
        };

        const local = withBase(proj.localScreenshotUrl);
        const candidates = [
            local,
            local.replace(/\.jpg$/i, '.png'),
            local.replace(/\.png$/i, '.jpg'),
        ].filter((v, i, a) => !!v && a.indexOf(v) === i);

        const prev = textureRef.current;

        const loadResizedTexture = async (url: string) => {
            const abs = new URL(url, window.location.href).toString();
            const res = await fetch(abs, { mode: 'cors', signal: controllerRef.current?.signal, cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const ct = (res.headers.get('content-type') || '').toLowerCase();
            if (ct && !ct.includes('image/')) {
                throw new Error(`Not an image (${ct})`);
            }
            const blob = await res.blob();

            const nearOrExpanded = isExpanded || isNear;
            const isLarge = blob.size > 4 * 1024 * 1024;
            const isVeryLarge = blob.size > 8 * 1024 * 1024;

            const maxTex = gl?.capabilities?.maxTextureSize || 4096;
            const requestedW = isExpanded
              ? (isVeryLarge ? 2560 : (isLarge ? 3072 : 2560))
              : (isNear ? (isVeryLarge ? 1600 : 2048) : (isLarge ? 1024 : 1400));

            const w = Math.min(requestedW, maxTex);
            const h = Math.round(w * (9 / 16));
            let bmp: ImageBitmap | null = null;
            try {
                bmp = await createImageBitmap(blob, { resizeWidth: w, resizeHeight: h, resizeQuality: 'high' } as any);
            } catch {
                try {
                    bmp = await createImageBitmap(blob);
                } catch {
                    bmp = null;
                }
            }

            let canvas: any;
            if (typeof (globalThis as any).OffscreenCanvas !== 'undefined') {
                canvas = new (globalThis as any).OffscreenCanvas(w, h);
            } else {
                const c = document.createElement('canvas');
                c.width = w;
                c.height = h;
                canvas = c;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('No 2d context');
            (ctx as any).imageSmoothingEnabled = true;
            (ctx as any).imageSmoothingQuality = 'high';

            if (bmp) {
                ctx.drawImage(bmp as any, 0, 0, w, h);
                if (typeof (bmp as any).close === 'function') (bmp as any).close();
            } else {
                const obj = URL.createObjectURL(blob);
                try {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    const loaded = new Promise<void>((resolve, reject) => {
                        img.onload = () => resolve();
                        img.onerror = () => reject(new Error('Image decode failed'));
                    });
                    img.src = obj;
                    await loaded;
                    ctx.drawImage(img, 0, 0, w, h);
                } finally {
                    URL.revokeObjectURL(obj);
                }
            }

            const t = new THREE.CanvasTexture(canvas);
            t.colorSpace = THREE.SRGBColorSpace;
            t.generateMipmaps = nearOrExpanded;
            t.minFilter = nearOrExpanded ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
            t.magFilter = THREE.LinearFilter;
            const maxAniso = gl?.capabilities?.getMaxAnisotropy ? gl.capabilities.getMaxAnisotropy() : 1;
            t.anisotropy = nearOrExpanded ? Math.min(16, maxAniso || 1) : 1;
            return t;
        };

        const run = async () => {
            const delayBase = prefetchAll ? 150 : 0;
            const delay = (isNear || isExpanded) ? delayBase : (delayBase + Math.min(1500, index * 220));
            await new Promise((r) => setTimeout(r, delay));
            for (const c of candidates) {
                if (requestId !== requestIdRef.current) return;
                try {
                    const t = await loadResizedTexture(c);
                    if (requestId !== requestIdRef.current) return;
                    if (textureRef.current && textureRef.current !== t) {
                        const img: any = (textureRef.current as any).image;
                        if (img && typeof img.close === 'function') img.close();
                        textureRef.current.dispose();
                    }
                    textureRef.current = t;
                    if (mountedRef.current) {
                        setTexture(t);
                        setTextureReady(true);
                        setTextureFailed(false);
                    }
                    textureTierRef.current = desiredTier;
                    inFlightRef.current = false;
                    inFlightTierRef.current = null;
                    if (prev && prev !== t) {
                        const img: any = (prev as any).image;
                        if (img && typeof img.close === 'function') img.close();
                        prev.dispose();
                    }
                    return;
                } catch (e) {
                    if ((e as any)?.name === 'AbortError') return;
                    console.warn('[Projects] Failed to load screenshot texture:', c, e);
                }
            }
            if (requestId !== requestIdRef.current) return;
            inFlightRef.current = false;
            inFlightTierRef.current = null;
            if (mountedRef.current) {
                setTexture(null);
                setTextureReady(false);
                setTextureFailed(true);
            }
        };

        run();
    }, [proj.localScreenshotUrl, shouldLoad, isNear, isExpanded]);

    useEffect(() => {
        return () => {
            if (controllerRef.current) controllerRef.current.abort();
            if (textureRef.current) {
                const img: any = (textureRef.current as any).image;
                if (img && typeof img.close === 'function') img.close();
                textureRef.current.dispose();
                textureRef.current = null;
            }
        };
    }, []);

    useFrame((state, delta) => {
        if (!group.current) return;

        if (isExpanded) {
            // ANIMATE TO FULL SCREEN
            const forward = tmpForward.current;
            forward.set(0, 0, -5).applyQuaternion(camera.quaternion);
            tmpTargetPosition.current.copy(camera.position).add(forward);
            targetPos.current.copy(tmpTargetPosition.current);
            
            const dist = 5;
            const vFov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
            const height = 2 * Math.tan(vFov / 2) * dist;
            const width = height * (state.viewport.aspect);
            
            let scale = 1;
            if (width / height > 16/9) {
                 scale = width; 
            } else {
                 scale = height * (16/9);
            }

            targetScale.current.set(scale * 1.25, scale * 1.25, 1); 
            targetRot.current.copy(camera.rotation);

        } else if (anyExpanded) {
            // HIDE
            targetScale.current.set(0, 0, 0);
        } else {
            // NORMAL SCROLL STATE + SLOW FLOAT
            // We add a slow sine wave to the Y position
            const floatY = Math.sin(state.clock.getElapsedTime() * 0.22 + proj.id) * 0.12;
            const floatZ = Math.sin(state.clock.getElapsedTime() * 0.18 + proj.id) * 0.05;
            const sway = Math.sin(state.clock.getElapsedTime() * 0.2 + proj.id) * 0.03;

            const sectionProgress = progressRef?.current ?? progress;
            const seg = total > 0 ? 1 / total : 1;
            const center = (index + 0.5) * seg;
            const half = seg * 0.5;
            const dist = Math.abs(sectionProgress - center);
            const w = 1 - THREE.MathUtils.clamp(dist / (half || 1), 0, 1);
            const zoomT = THREE.MathUtils.smoothstep(w, 0, 1);
            const s = THREE.MathUtils.lerp(0.96, 1.32, zoomT);
            
            const rel = THREE.MathUtils.clamp(index - activeIndex, -2, 2);
            targetPos.current.set(proj.x, 1 + floatY + zoomT * 0.12, zoomT * 0.75 + floatZ - Math.abs(rel) * 0.08);
            targetScale.current.set(s, s, 1);
            const tiltT = 1 - zoomT;
            targetRot.current.set(0.025 * tiltT, rel * 0.12 * tiltT + sway, rel * 0.03 * tiltT);
        }

        const lambda = anyExpanded ? 10 : 8;
        group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetPos.current.x, lambda, delta);
        group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetPos.current.y, lambda, delta);
        group.current.position.z = THREE.MathUtils.damp(group.current.position.z, targetPos.current.z, lambda, delta);
        group.current.scale.x = THREE.MathUtils.damp(group.current.scale.x, targetScale.current.x, lambda, delta);
        group.current.scale.y = THREE.MathUtils.damp(group.current.scale.y, targetScale.current.y, lambda, delta);
        group.current.scale.z = THREE.MathUtils.damp(group.current.scale.z, targetScale.current.z, lambda, delta);
        group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRot.current.x, lambda, delta);
        group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRot.current.y, lambda, delta);
        group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetRot.current.z, lambda, delta);
    });

    return (
        <group ref={group} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <group>
                {!isExpanded && isActive && !anyExpanded && (
                    <RoundedBox args={[3.34, 1.92, 0.06]} radius={0.12} smoothness={8} position={[0, 0, -0.05]}>
                        <meshStandardMaterial color="#05060a" roughness={0.7} metalness={0.1} emissive="#0b1020" emissiveIntensity={0.25} />
                    </RoundedBox>
                )}

                {!isExpanded && isActive && !anyExpanded && (
                    <mesh position={[0, 0, 0.005]}>
                        <planeGeometry args={[3.26, 1.86]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={isActive && !anyExpanded ? 0.08 : 0.03} depthWrite={false} />
                    </mesh>
                )}

                <mesh position={[0, 0, 0.02]}>
                    <planeGeometry args={[3.2, 1.8]} />
                    <meshBasicMaterial
                        key={textureReady ? (texture?.uuid ?? 'tex') : 'no-tex'}
                        color={textureReady ? '#ffffff' : '#0b1020'}
                        map={textureReady ? (texture ?? undefined) : undefined}
                        toneMapped={false}
                    />
                </mesh>

                {shouldLoad && !textureReady && (
                    <Text
                        position={[0, 0, 0.06]}
                        fontSize={0.18}
                        font={arFont}
                        color="rgba(255,255,255,0.75)"
                        anchorX="center"
                        anchorY="middle"
                        direction="rtl"
                        fillOpacity={!anyExpanded ? 1 : 0}
                    >
                        {textureFailed ? 'فشل تحميل الصورة' : 'جاري التحميل...'}
                    </Text>
                )}

                <Text 
                    position={[0, -1.2, 0.1]} 
                    fontSize={0.25} 
                    font={arFont}
                    color="white"
                    anchorX="center" 
                    anchorY="middle"
                    direction="rtl"
                    fillOpacity={!anyExpanded ? (isActive ? 1 : 0) : 0}
                >
                    {proj.title}
                </Text>

                {!isExpanded && !anyExpanded && (
                    <Text
                        position={[0, -1.35, 0.1]}
                        fontSize={0.14}
                        font={arFont}
                        color="#cbd5ff"
                        anchorX="center"
                        anchorY="middle"
                        direction="rtl"
                        maxWidth={3.2}
                        lineHeight={1.15}
                        fillOpacity={isActive ? 0.85 : 0}
                    >
                        {proj.subtitle}
                    </Text>
                )}

                {!isExpanded && !anyExpanded && (
                    <Text
                        position={[0, -1.5, 0.1]}
                        fontSize={0.16}
                        font={arFont}
                        color="#88ccff"
                        anchorX="center"
                        anchorY="middle"
                        direction="rtl"
                        fillOpacity={isActive ? 0.9 : 0}
                    >
                        اضغط لعرض التفاصيل
                    </Text>
                )}
            </group>
        </group>
    )
}