import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, useScroll, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

type QualityTier = 'low' | 'medium' | 'high';

export const SkillsSection: React.FC<{ quality?: QualityTier }> = ({ quality = 'high' }) => {
  const scroll = useScroll();
  const isMobile = useThree((state) => state.size.width <= 640);
  const shadowsEnabled = !isMobile && (quality === 'high' || quality === 'medium');
  const shadowMapSize = quality === 'high' ? 512 : 256;
  const groupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Group>(null);
  const visibleRef = useRef(false);
  const meteorTargetsRef = useRef<Array<{ pos: THREE.Vector3; radius: number }>>([]);

  const sunGlowTexture = useMemo(() => {
      if (typeof document === 'undefined') return null;
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 240, 200, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 140, 0, 0.6)');
      gradient.addColorStop(0.6, 'rgba(255, 60, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      return tex;
  }, []);
  
  // Fully procedural planets to avoid texture loading failures
  const planets = [
      { name: "React", color: "#61dafb", type: "gas", size: 0.42, distance: 3.4, speed: 0.9 },
      { name: "JavaScript", color: "#f7df1e", type: "gas", size: 0.36, distance: 4.3, speed: 0.76 },
      { name: "TypeScript", color: "#3178c6", type: "ice", size: 0.34, distance: 5.2, speed: 0.66 },
      { name: "HTML", color: "#e34f26", type: "rocky", size: 0.3, distance: 6.1, speed: 0.58 },
      { name: "CSS", color: "#1572b6", type: "ice", size: 0.3, distance: 7.0, speed: 0.52 },
      { name: "Node.js", color: "#68a063", type: "terrestrial", size: 0.4, distance: 7.9, speed: 0.46 },
      { name: "SQL", color: "#8ab4ff", type: "ice", size: 0.34, distance: 8.8, speed: 0.4 },
      { name: "Next.js", color: "#111111", type: "rocky", size: 0.26, distance: 9.9, speed: 0.34 },
      { name: "Three.js", color: "#ffffff", type: "ice", size: 0.3, distance: 11.2, speed: 0.28 },
  ];

  if (meteorTargetsRef.current.length !== planets.length) {
      meteorTargetsRef.current = planets.map((p) => ({ pos: new THREE.Vector3(), radius: p.size }));
  }

  useFrame(() => {
    const start = 2/5; 
    const visible = scroll.visible(start, 1/5);
    visibleRef.current = visible;
    
    if (groupRef.current) {
        groupRef.current.visible = visible;
        
        if (visible) {
             groupRef.current.rotation.y += 0.0005;
        }
    }

  });

  return (
    <group ref={groupRef}>
      <Galaxies enabledRef={visibleRef} quality={quality} />

      {/* THE SUN */}
      <group ref={sunRef} scale={isMobile ? 0.74 : 0.92}>
          <Sun
            isMobile={isMobile}
            quality={quality}
            shadowsEnabled={shadowsEnabled}
            shadowMapSize={shadowMapSize}
            glowTexture={sunGlowTexture}
          />
      </group>

      {planets.map((planet, i) => (
        <Orbit key={`orbit-${i}`} radius={planet.distance} />
      ))}
      
      {planets.map((planet, i) => (
         <Planet 
            key={i} 
            {...planet} 
            index={i} 
            total={planets.length}
            meteorTarget={meteorTargetsRef.current[i]}
            quality={quality}
            shadowsEnabled={shadowsEnabled}
            isMobile={isMobile}
         />
      ))}

      <Asteroids enabledRef={visibleRef} quality={quality} />
      <Meteors enabledRef={visibleRef} targetsRef={meteorTargetsRef} quality={quality} />
    </group>
  );
};

const createSunSurfaceTexture = (seed: number) => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const rand = (x: number, y: number) => {
        const v = Math.sin(x * 12.9898 + y * 78.233 + seed * 0.13) * 43758.5453;
        return v - Math.floor(v);
    };

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    for (let y = 0; y < canvas.height; y++) {
        const v = y / (canvas.height - 1);
        for (let x = 0; x < canvas.width; x++) {
            const u = x / (canvas.width - 1);
            const i = (y * canvas.width + x) * 4;

            const n = (rand(x, y) * 2 - 1) * 0.25;
            const bands = Math.sin((v * 10 + u * 2 + seed * 0.02) * Math.PI) * 0.12;
            const cells = Math.sin((u * 30 + seed * 0.03)) * Math.sin((v * 18 + seed * 0.01)) * 0.08;
            let m = 1.0 + n + bands + cells;
            m = THREE.MathUtils.clamp(m, 0.6, 1.35);

            const base = new THREE.Color('#ffcc7a');
            const hot = new THREE.Color('#ff6a00');
            const t = THREE.MathUtils.clamp(0.35 + (m - 1.0) * 1.3, 0, 1);
            const c = base.clone().lerp(hot, t);

            d[i + 0] = Math.round(c.r * 255);
            d[i + 1] = Math.round(c.g * 255);
            d[i + 2] = Math.round(c.b * 255);
            d[i + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1, 1);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
};

const Sun: React.FC<{
    isMobile: boolean;
    quality: QualityTier;
    shadowsEnabled: boolean;
    shadowMapSize: number;
    glowTexture: THREE.Texture | null;
}> = ({ isMobile, quality, shadowsEnabled, shadowMapSize, glowTexture }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const sunTexture = useMemo(() => createSunSurfaceTexture(1337), []);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.001;
        }
    });

    const sunRadius = 1.35;
    const lightIntensity = isMobile ? 5.0 : (quality === 'high' ? 11.0 : 8.8);
    const lightDistance = isMobile ? 22 : 30;
    const glowScale = sunRadius * (isMobile ? 5.4 : 6.2);

    return (
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[sunRadius, 64, 64]} />
                <meshBasicMaterial map={sunTexture ?? undefined} color="#ffb000" toneMapped={false} />
            </mesh>

            {glowTexture && (
                <sprite scale={[glowScale, glowScale, 1]}>
                    <spriteMaterial
                        map={glowTexture}
                        transparent
                        opacity={0.55}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        toneMapped={false}
                    />
                </sprite>
            )}

            <pointLight
                intensity={lightIntensity}
                decay={2}
                distance={lightDistance}
                color="#ffb000"
                castShadow={shadowsEnabled}
                shadow-mapSize={[shadowMapSize, shadowMapSize]}
                shadow-bias={-0.0005}
                shadow-camera-near={0.5}
                shadow-camera-far={40}
            />

            <pointLight intensity={isMobile ? 0.08 : 0.12} decay={2} distance={10} color="#ff4400" />
        </group>
    );
};

const makePlanetTexture = (params: { type: string; color: string; seed: number; lowDetail: boolean }) => {
    if (typeof document === 'undefined') return null;
    const w = params.lowDetail ? 128 : 256;
    const h = params.lowDetail ? 64 : 128;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const base = new THREE.Color(params.color);
    const br = Math.round(base.r * 255);
    const bg = Math.round(base.g * 255);
    const bb = Math.round(base.b * 255);
    ctx.fillStyle = `rgb(${br},${bg},${bb})`;
    ctx.fillRect(0, 0, w, h);

    const rand = (x: number, y: number) => {
        const v = Math.sin(x * 12.9898 + y * 78.233 + params.seed * 0.13) * 43758.5453;
        return v - Math.floor(v);
    };

    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let y = 0; y < h; y++) {
        const v = y / (h - 1);
        for (let x = 0; x < w; x++) {
            const u = x / (w - 1);
            const i = (y * w + x) * 4;

            const n = (rand(x, y) * 2 - 1) * 0.18;
            let m = 1;
            if (params.type === 'gas') {
                const bands = 8;
                const b = Math.sin(v * Math.PI * bands + params.seed * 0.2) * 0.18;
                const swirl = Math.sin((u + v) * Math.PI * 2 + params.seed * 0.12) * 0.05;
                m = 0.9 + b + swirl + n;
            } else if (params.type === 'ice') {
                const marb = Math.sin((u * 10 + v * 7) + params.seed * 0.1) * 0.12;
                m = 0.86 + marb + n;
            } else {
                const grit = (rand(x * 2, y * 2) * 2 - 1) * 0.22;
                const crater = Math.sin(u * 16 + params.seed * 0.3) * Math.sin(v * 11 + params.seed * 0.17) * 0.12;
                m = 0.78 + grit + crater + n;
            }

            m = THREE.MathUtils.clamp(m, 0.55, 1.12);
            d[i + 0] = THREE.MathUtils.clamp(br * m, 0, 255);
            d[i + 1] = THREE.MathUtils.clamp(bg * m, 0, 255);
            d[i + 2] = THREE.MathUtils.clamp(bb * m, 0, 255);
            d[i + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1, 1);
    tex.needsUpdate = true;
    return tex;
};

const makeFresnelAtmosphereMaterial = (color: string) => {
    const c = new THREE.Color(color);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
            uBias: { value: 0.02 },
            uScale: { value: 1.0 },
            uPower: { value: 3.5 },
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewDir;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewDir = normalize(-mvPosition.xyz);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            uniform float uBias;
            uniform float uScale;
            uniform float uPower;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            void main() {
                float fres = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), uPower);
                float a = clamp(uBias + uScale * fres, 0.0, 1.0);
                gl_FragColor = vec4(uColor, a);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
    });
    return material;
};

const Orbit: React.FC<{ radius: number }> = ({ radius }) => {
    const geometry = useMemo(() => {
        const segments = 256;
        const positions = new Float32Array(segments * 3);
        for (let i = 0; i < segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            positions[i * 3 + 0] = Math.cos(a) * radius;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = Math.sin(a) * radius;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        g.computeBoundingSphere();
        return g;
    }, [radius]);

    return (
        <lineLoop geometry={geometry} frustumCulled={false}>
            <lineBasicMaterial
                color="#cfe3ff"
                transparent
                opacity={0.25}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
            />
        </lineLoop>
    );
};

const Galaxies: React.FC<{ enabledRef: React.MutableRefObject<boolean>; quality: QualityTier }> = ({ enabledRef, quality }) => {
    const group = useRef<THREE.Group>(null);
    const isMobile = useThree((state) => state.size.width <= 640);

    const makeGalaxy = useMemo(() => {
        return (params: {
            count: number;
            radius: number;
            branches: number;
            spin: number;
            randomness: number;
            randomnessPower: number;
            center: THREE.Vector3;
            rotation: THREE.Euler;
            insideColor: string;
            outsideColor: string;
        }) => {
            const positions = new Float32Array(params.count * 3);
            const colors = new Float32Array(params.count * 3);

            const inside = new THREE.Color(params.insideColor);
            const outside = new THREE.Color(params.outsideColor);

            for (let i = 0; i < params.count; i++) {
                const r = Math.random() * params.radius;
                const branchAngle = ((i % params.branches) / params.branches) * Math.PI * 2;
                const spinAngle = r * params.spin;

                const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * r;
                const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * r * 0.18;
                const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * r;

                const x = Math.cos(branchAngle + spinAngle) * r + randomX;
                const y = randomY;
                const z = Math.sin(branchAngle + spinAngle) * r + randomZ;

                const p = new THREE.Vector3(x, y, z)
                    .applyEuler(params.rotation)
                    .add(params.center);

                positions[i * 3 + 0] = p.x;
                positions[i * 3 + 1] = p.y;
                positions[i * 3 + 2] = p.z;

                const mixed = inside.clone().lerp(outside, r / params.radius);
                const sparkle = THREE.MathUtils.lerp(0.7, 1.35, Math.random());
                mixed.multiplyScalar(sparkle);
                colors[i * 3 + 0] = mixed.r;
                colors[i * 3 + 1] = mixed.g;
                colors[i * 3 + 2] = mixed.b;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.computeBoundingSphere();
            return geometry;
        };
    }, []);

    const galaxyA = useMemo(() => {
        const baseCount = quality === 'high'
            ? 11000
            : quality === 'medium'
                ? 7500
                : 3800;
        const count = Math.round(baseCount * (isMobile ? 0.7 : 1));

        return makeGalaxy({
            count,
            radius: 55,
            branches: 5,
            spin: 0.28,
            randomness: 0.36,
            randomnessPower: 3.2,
            center: new THREE.Vector3(-95, 22, -160),
            rotation: new THREE.Euler(-0.25, 0.65, 0.1),
            insideColor: '#fff2cf',
            outsideColor: '#8ab4ff',
        });
    }, [isMobile, makeGalaxy, quality]);

    const galaxyB = useMemo(() => {
        const baseCount = quality === 'high'
            ? 8000
            : quality === 'medium'
                ? 5200
                : 2500;
        const count = Math.round(baseCount * (isMobile ? 0.7 : 1));

        return makeGalaxy({
            count,
            radius: 42,
            branches: 4,
            spin: 0.34,
            randomness: 0.38,
            randomnessPower: 3.0,
            center: new THREE.Vector3(120, 10, -140),
            rotation: new THREE.Euler(0.18, -0.55, -0.1),
            insideColor: '#ffe2f3',
            outsideColor: '#a78bfa',
        });
    }, [isMobile, makeGalaxy, quality]);

    useFrame((state) => {
        if (!group.current) return;
        group.current.visible = enabledRef.current;
        if (!enabledRef.current) return;
        const t = state.clock.getElapsedTime();
        group.current.rotation.y = t * 0.018;
        group.current.rotation.x = Math.sin(t * 0.07) * 0.015;
    });

    return (
        <group ref={group} frustumCulled={false}>
            <points geometry={galaxyA} frustumCulled={false}>
                <pointsMaterial
                    size={isMobile ? 0.22 : 0.2}
                    sizeAttenuation
                    transparent
                    opacity={0.6}
                    vertexColors
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    toneMapped={false}
                />
            </points>
            <points geometry={galaxyB} frustumCulled={false}>
                <pointsMaterial
                    size={isMobile ? 0.2 : 0.18}
                    sizeAttenuation
                    transparent
                    opacity={0.55}
                    vertexColors
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    toneMapped={false}
                />
            </points>
        </group>
    );
};

const Asteroids: React.FC<{ enabledRef: React.MutableRefObject<boolean>; quality: QualityTier }> = ({ enabledRef, quality }) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const isMobile = useThree((state) => state.size.width <= 640);
    const tmpColor = useRef(new THREE.Color());
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const asteroids = useMemo(() => {
        const base = isMobile ? 8 : 12;
        const count = quality === 'high' ? base : quality === 'medium' ? Math.max(4, Math.round(base * 0.75)) : Math.max(3, Math.round(base * 0.5));
        const arr: Array<{
            pos: THREE.Vector3;
            vel: THREE.Vector3;
            rot: THREE.Euler;
            rotVel: THREE.Vector3;
            size: number;
            shade: number;
        }> = [];

        for (let i = 0; i < count; i++) {
            arr.push({
                pos: new THREE.Vector3(
                    THREE.MathUtils.lerp(-13, 13, Math.random()),
                    THREE.MathUtils.lerp(-1.5, 7.5, Math.random()),
                    THREE.MathUtils.lerp(-14, 14, Math.random())
                ),
                vel: new THREE.Vector3(
                    THREE.MathUtils.lerp(-0.25, 0.25, Math.random()),
                    THREE.MathUtils.lerp(-0.05, 0.08, Math.random()),
                    THREE.MathUtils.lerp(-0.22, 0.22, Math.random())
                ),
                rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
                rotVel: new THREE.Vector3(
                    THREE.MathUtils.lerp(-0.6, 0.6, Math.random()),
                    THREE.MathUtils.lerp(-0.9, 0.9, Math.random()),
                    THREE.MathUtils.lerp(-0.6, 0.6, Math.random())
                ),
                size: THREE.MathUtils.lerp(0.08, 0.22, Math.random()) * (Math.random() < 0.2 ? 1.55 : 1),
                shade: THREE.MathUtils.lerp(0.55, 1.0, Math.random()),
            });
        }
        return arr;
    }, [isMobile, quality]);

    useFrame((state, delta) => {
        if (!mesh.current) return;
        if (!enabledRef.current) {
            mesh.current.visible = false;
            return;
        }

        mesh.current.visible = true;
        const dt = Math.min(delta, 1 / 30);
        const t = state.clock.getElapsedTime();

        for (let i = 0; i < asteroids.length; i++) {
            const a = asteroids[i];

            a.pos.addScaledVector(a.vel, dt);
            a.rot.x += a.rotVel.x * dt;
            a.rot.y += a.rotVel.y * dt;
            a.rot.z += a.rotVel.z * dt;

            if (a.pos.x > 16) a.pos.x = -16;
            if (a.pos.x < -16) a.pos.x = 16;
            if (a.pos.z > 16) a.pos.z = -16;
            if (a.pos.z < -16) a.pos.z = 16;
            if (a.pos.y > 9) a.pos.y = -2;
            if (a.pos.y < -2) a.pos.y = 9;

            dummy.position.copy(a.pos);
            dummy.rotation.set(a.rot.x, a.rot.y + Math.sin(t * 0.25 + i) * 0.05, a.rot.z);
            dummy.scale.setScalar(a.size);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);

            if (mesh.current.instanceColor) {
                const c = a.shade;
                tmpColor.current.setRGB(0.55 * c, 0.6 * c, 0.65 * c);
                mesh.current.setColorAt(i, tmpColor.current);
            }
        }

        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, asteroids.length]} frustumCulled={false}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
                roughness={0.98}
                metalness={0.05}
                emissive={new THREE.Color('#0b1220')}
                emissiveIntensity={0.25}
                vertexColors
                toneMapped={false}
            />
        </instancedMesh>
    );
};

const Meteors: React.FC<{ enabledRef: React.MutableRefObject<boolean>; targetsRef: React.MutableRefObject<Array<{ pos: THREE.Vector3; radius: number }>>; quality: QualityTier }> = ({ enabledRef, targetsRef, quality }) => {
    const trailMesh = useRef<THREE.InstancedMesh>(null);
    const headMesh = useRef<THREE.InstancedMesh>(null);
    const impactMesh = useRef<THREE.InstancedMesh>(null);
    const wasEnabledRef = useRef(false);
    const isMobile = useThree((state) => state.size.width <= 640);
    const tmpPos = useRef(new THREE.Vector3());
    const tmpVel = useRef(new THREE.Vector3());
    const tmpColor = useRef(new THREE.Color());

    const sparkTexture = useMemo(() => {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const r = canvas.width / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0.0, 'rgba(255,255,255,1.0)');
        g.addColorStop(0.12, 'rgba(220,245,255,0.95)');
        g.addColorStop(0.32, 'rgba(170,210,255,0.40)');
        g.addColorStop(1.0, 'rgba(120,160,255,0.00)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.needsUpdate = true;
        return tex;
    }, []);

    const trailTexture = useMemo(() => {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        grad.addColorStop(0.0, 'rgba(255,255,255,1.00)');
        grad.addColorStop(0.08, 'rgba(210,245,255,0.95)');
        grad.addColorStop(0.25, 'rgba(160,220,255,0.55)');
        grad.addColorStop(0.55, 'rgba(120,180,255,0.18)');
        grad.addColorStop(1.0, 'rgba(90,140,255,0.00)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const vGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        vGrad.addColorStop(0.0, 'rgba(0,0,0,0)');
        vGrad.addColorStop(0.5, 'rgba(0,0,0,1)');
        vGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = vGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.needsUpdate = true;
        return tex;
    }, []);

    const meteors = useMemo(() => {
        const base = isMobile ? 5 : 8;
        const minLow = isMobile ? 3 : 4;
        const count = quality === 'high' ? base : quality === 'medium' ? Math.max(3, Math.round(base * 0.75)) : Math.max(minLow, Math.round(base * 0.5));
        const arr: Array<{ pos: THREE.Vector3; vel: THREE.Vector3; targetRef: { pos: THREE.Vector3; radius: number } | null; target: THREE.Vector3; hitR: number; len: number; width: number; rotY: number; cooldown: number; age: number; ttl: number; fast: boolean; warm: boolean; impactAge: number; impactTtl: number; impactPos: THREE.Vector3 }> = [];
        for (let i = 0; i < count; i++) {
            const fast = Math.random() < 0.38;
            const warm = Math.random() < 0.45;
            arr.push({
                pos: new THREE.Vector3(0, 999, 0),
                vel: new THREE.Vector3(),
                targetRef: null,
                target: new THREE.Vector3(),
                hitR: 0.4,
                len: fast ? THREE.MathUtils.lerp(1.6, 2.8, Math.random()) : THREE.MathUtils.lerp(0.9, 1.7, Math.random()),
                width: fast ? THREE.MathUtils.lerp(0.05, 0.085, Math.random()) : THREE.MathUtils.lerp(0.03, 0.06, Math.random()),
                rotY: THREE.MathUtils.lerp(-0.8, 0.8, Math.random()),
                cooldown: i === 0 ? 0 : (0.12 + Math.random() * 0.95),
                age: 0,
                ttl: fast ? THREE.MathUtils.lerp(0.55, 1.05, Math.random()) : THREE.MathUtils.lerp(1.2, 2.4, Math.random()),
                fast,
                warm,
                impactAge: 999,
                impactTtl: 0.22,
                impactPos: new THREE.Vector3(0, 999, 0),
            });
        }
        return arr;
    }, [isMobile, quality]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    const pickTarget = (targetsRef?: React.MutableRefObject<Array<{ pos: THREE.Vector3; radius: number }>>) => {
        const list = targetsRef?.current;
        if (!list || list.length === 0) return null;
        const idx = Math.floor(Math.random() * list.length);
        const t = list[idx];
        if (!t) return null;
        return t;
    };

    const respawn = (
        m: { pos: THREE.Vector3; vel: THREE.Vector3; targetRef: { pos: THREE.Vector3; radius: number } | null; target: THREE.Vector3; hitR: number; cooldown: number; age: number; ttl: number; fast: boolean },
        targetsRef?: React.MutableRefObject<Array<{ pos: THREE.Vector3; radius: number }>>
    ) => {
        const t = pickTarget(targetsRef);
        if (t) {
            m.targetRef = t;
            m.target.copy(t.pos);
            m.hitR = t.radius * 1.05;

            const dir = new THREE.Vector3(
                THREE.MathUtils.lerp(-1, 1, Math.random()),
                THREE.MathUtils.lerp(0.25, 1.0, Math.random()),
                THREE.MathUtils.lerp(-1, 1, Math.random())
            ).normalize();

            const spawnDist = m.fast ? THREE.MathUtils.lerp(13, 18, Math.random()) : THREE.MathUtils.lerp(10, 15, Math.random());
            const offset = new THREE.Vector3(
                THREE.MathUtils.lerp(-0.18, 0.18, Math.random()),
                THREE.MathUtils.lerp(-0.12, 0.12, Math.random()),
                THREE.MathUtils.lerp(-0.18, 0.18, Math.random())
            );

            m.pos.copy(m.target).addScaledVector(dir, spawnDist);
            tmpPos.current.copy(m.target).add(offset);

            tmpVel.current.copy(tmpPos.current).sub(m.pos);
            const dist = Math.max(0.001, tmpVel.current.length());
            tmpVel.current.normalize();
            const speed = m.fast ? THREE.MathUtils.lerp(16, 24, Math.random()) : THREE.MathUtils.lerp(11, 17, Math.random());
            m.vel.copy(tmpVel.current).multiplyScalar(speed);
            m.ttl = dist / speed;
        } else {
            m.targetRef = null;
            m.pos.set(
                THREE.MathUtils.lerp(-14, 14, Math.random()),
                THREE.MathUtils.lerp(6, 12, Math.random()),
                THREE.MathUtils.lerp(-12, 12, Math.random())
            );
            const sx = m.fast ? THREE.MathUtils.lerp(-10.5, -7.0, Math.random()) : THREE.MathUtils.lerp(-4.8, -2.6, Math.random());
            const sy = m.fast ? THREE.MathUtils.lerp(-12.5, -8.5, Math.random()) : THREE.MathUtils.lerp(-5.8, -3.6, Math.random());
            const sz = m.fast ? THREE.MathUtils.lerp(-2.0, 2.0, Math.random()) : THREE.MathUtils.lerp(-1.0, 1.0, Math.random());
            m.vel.set(sx, sy, sz);
            m.ttl = m.fast ? THREE.MathUtils.lerp(0.55, 1.05, Math.random()) : THREE.MathUtils.lerp(1.2, 2.4, Math.random());
        }

        m.cooldown = 0;
        m.age = 0;
    };

    useFrame((state, delta) => {
        if (!trailMesh.current || !headMesh.current || !impactMesh.current) return;
        if (!enabledRef.current) {
            wasEnabledRef.current = false;
            return;
        }

        if (!wasEnabledRef.current) {
            wasEnabledRef.current = true;
            for (let i = 0; i < meteors.length; i++) {
                const m = meteors[i];
                m.cooldown = 0;
                m.pos.set(0, 999, 0);
                m.impactAge = 999;
            }
        }

        const dt = Math.min(delta, 1 / 30);

        for (let i = 0; i < meteors.length; i++) {
            const m = meteors[i];

            if (m.impactAge < (m.impactTtl || 0)) {
                m.impactAge += dt;
                const p = THREE.MathUtils.clamp(m.impactAge / (m.impactTtl || 1), 0, 1);
                const grow = THREE.MathUtils.smoothstep(p, 0, 0.25);
                const fade = 1 - THREE.MathUtils.smoothstep(p, 0.25, 1);
                const s = (m.hitR * 1.65) * (0.85 + grow * 0.65);

                dummy.position.copy(m.impactPos);
                dummy.quaternion.copy(state.camera.quaternion);
                dummy.scale.set(s, s, s);
                dummy.updateMatrix();
                impactMesh.current.setMatrixAt(i, dummy.matrix);

                const b = THREE.MathUtils.clamp(fade * 2.2, 0, 2.2);
                tmpColor.current.setRGB(0.85 * b, 0.95 * b, 1.0 * b);
                impactMesh.current.setColorAt(i, tmpColor.current);
            } else {
                dummy.position.set(0, 999, 0);
                dummy.quaternion.set(0, 0, 0, 1);
                dummy.scale.set(0.0001, 0.0001, 0.0001);
                dummy.updateMatrix();
                impactMesh.current.setMatrixAt(i, dummy.matrix);
                tmpColor.current.setRGB(0, 0, 0);
                impactMesh.current.setColorAt(i, tmpColor.current);
            }

            if (m.cooldown > 0) {
                m.cooldown -= dt;
                dummy.position.set(0, 999, 0);
                dummy.rotation.set(0, 0, 0);
                dummy.scale.set(0.0001, 0.0001, 0.0001);
                dummy.updateMatrix();
                trailMesh.current.setMatrixAt(i, dummy.matrix);
                headMesh.current.setMatrixAt(i, dummy.matrix);
                tmpColor.current.setRGB(0, 0, 0);
                trailMesh.current.setColorAt(i, tmpColor.current);
                headMesh.current.setColorAt(i, tmpColor.current);
                continue;
            }

            if (m.pos.y > 900) {
                respawn(m, targetsRef);
            }

            if (m.targetRef) {
                m.target.copy(m.targetRef.pos);
                m.hitR = m.targetRef.radius * 1.05;
            }

            m.age += dt;
            const life = THREE.MathUtils.clamp(m.age / (m.ttl || 1), 0, 1);
            const fadeIn = THREE.MathUtils.smoothstep(life, 0, 0.12);
            const fadeOut = 1 - THREE.MathUtils.smoothstep(life, 0.65, 1);
            const intensity = THREE.MathUtils.clamp(fadeIn * fadeOut, 0, 1);

            tmpVel.current.copy(m.vel);
            const speedBoost = m.fast ? 1.15 : 1;
            m.pos.addScaledVector(tmpVel.current, dt * speedBoost);

            const currentSpeed = m.vel.length();
            tmpPos.current.copy(m.target).sub(m.pos);
            const dTo = tmpPos.current.length();
            if (dTo > 0.001 && currentSpeed > 0.001) {
                tmpPos.current.multiplyScalar(1 / dTo);
                const steer = isMobile ? 2.2 : 3.0;
                const alpha = 1 - Math.exp(-steer * dt);
                tmpPos.current.multiplyScalar(currentSpeed);
                m.vel.lerp(tmpPos.current, alpha);
            }

            const hitDist = m.pos.distanceTo(m.target);
            if (hitDist <= (m.hitR || 0.4)) {
                m.impactAge = 0;
                tmpPos.current.copy(m.pos).sub(m.target);
                if (tmpPos.current.lengthSq() > 1e-6) tmpPos.current.normalize();
                m.impactPos.copy(m.target).addScaledVector(tmpPos.current, (m.hitR || 0.4) * 0.98);
                m.pos.set(0, 999, 0);
                m.cooldown = m.fast ? THREE.MathUtils.lerp(0.35, 1.25, Math.random()) : THREE.MathUtils.lerp(0.85, 2.8, Math.random());

                dummy.position.set(0, 999, 0);
                dummy.rotation.set(0, 0, 0);
                dummy.scale.set(0.0001, 0.0001, 0.0001);
                dummy.updateMatrix();
                trailMesh.current.setMatrixAt(i, dummy.matrix);
                headMesh.current.setMatrixAt(i, dummy.matrix);
                tmpColor.current.setRGB(0, 0, 0);
                trailMesh.current.setColorAt(i, tmpColor.current);
                headMesh.current.setColorAt(i, tmpColor.current);
                continue;
            }

            const out = (m.pos.y < -4) || (m.pos.x < -22) || (m.pos.z < -20) || (m.pos.z > 20);
            if (out || life >= 1) {
                m.pos.set(0, 999, 0);
                m.cooldown = m.fast ? THREE.MathUtils.lerp(0.2, 1.0, Math.random()) : THREE.MathUtils.lerp(0.6, 2.4, Math.random());
                dummy.position.set(0, 999, 0);
                dummy.rotation.set(0, 0, 0);
                dummy.scale.set(0.0001, 0.0001, 0.0001);
                dummy.updateMatrix();
                trailMesh.current.setMatrixAt(i, dummy.matrix);
                headMesh.current.setMatrixAt(i, dummy.matrix);
                tmpColor.current.setRGB(0, 0, 0);
                trailMesh.current.setColorAt(i, tmpColor.current);
                headMesh.current.setColorAt(i, tmpColor.current);
                continue;
            }

            tmpVel.current.copy(m.vel).normalize();
            const angleZ = Math.atan2(tmpVel.current.y, tmpVel.current.x);

            tmpPos.current.copy(m.pos);
            dummy.position.copy(tmpPos.current);
            const roll = (m.fast ? 0.08 : 0.05) * Math.sin((state.clock.getElapsedTime() + i) * 3.2);
            dummy.rotation.set(0, m.rotY + roll, angleZ);
            const len = m.len * (m.fast ? 1.25 : 1);
            dummy.scale.set(len, m.width, 1);
            dummy.updateMatrix();
            trailMesh.current.setMatrixAt(i, dummy.matrix);

            const headOffset = len * 0.52;
            const wobble = (m.fast ? 0.03 : 0.02) * Math.sin((state.clock.getElapsedTime() + i) * 6.2);
            const headScale = THREE.MathUtils.clamp(m.width * 2.2, 0.07, 0.22) * (m.fast ? 1.1 : 1);
            tmpPos.current.copy(m.pos).addScaledVector(tmpVel.current, headOffset);
            dummy.position.copy(tmpPos.current);
            dummy.rotation.set(
                (m.rotY * 0.2) + wobble,
                (m.rotY * 0.35) - wobble,
                angleZ + wobble
            );
            dummy.scale.set(headScale, headScale, headScale);
            dummy.updateMatrix();
            headMesh.current.setMatrixAt(i, dummy.matrix);

            const base = m.fast ? 2.1 : 1.4;
            const b = THREE.MathUtils.clamp(intensity * base, 0, 3.0);
            if (m.warm) tmpColor.current.setRGB(1.0 * b, 0.62 * b, 0.25 * b);
            else tmpColor.current.setRGB(0.70 * b, 0.90 * b, 1.0 * b);
            trailMesh.current.setColorAt(i, tmpColor.current);

            const hb = THREE.MathUtils.clamp(b * 1.25, 0, 3.2);
            if (m.warm) tmpColor.current.setRGB(1.0 * hb, 0.78 * hb, 0.45 * hb);
            else tmpColor.current.setRGB(0.85 * hb, 1.0 * hb, 1.0 * hb);
            headMesh.current.setColorAt(i, tmpColor.current);
        }

        trailMesh.current.instanceMatrix.needsUpdate = true;
        if (trailMesh.current.instanceColor) trailMesh.current.instanceColor.needsUpdate = true;
        headMesh.current.instanceMatrix.needsUpdate = true;
        if (headMesh.current.instanceColor) headMesh.current.instanceColor.needsUpdate = true;
        impactMesh.current.instanceMatrix.needsUpdate = true;
        if (impactMesh.current.instanceColor) impactMesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh key={`trail-${meteors.length}`} ref={trailMesh} args={[undefined, undefined, meteors.length]} frustumCulled={false}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial
                    map={trailTexture ?? undefined}
                    transparent
                    opacity={0.96}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                    vertexColors
                />
            </instancedMesh>
            <instancedMesh key={`head-${meteors.length}`} ref={headMesh} args={[undefined, undefined, meteors.length]} frustumCulled={false}>
                <sphereGeometry args={[1, 12, 12]} />
                <meshBasicMaterial
                    transparent
                    opacity={1}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                    vertexColors
                />
            </instancedMesh>
            <instancedMesh key={`impact-${meteors.length}`} ref={impactMesh} args={[undefined, undefined, meteors.length]} frustumCulled={false}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial
                    map={sparkTexture ?? undefined}
                    transparent
                    opacity={0.95}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                    vertexColors
                    side={THREE.DoubleSide}
                />
            </instancedMesh>
        </group>
    );
};

const Planet = ({ name, color, type, size, distance, speed, index, total, meteorTarget, quality, shadowsEnabled, isMobile }: any) => {
    const planetRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const denom = (typeof total === 'number' && total > 0) ? total : 9;
    const initialAngle = (index / denom) * Math.PI * 2;

    const lowDetail = quality === 'low' || !!isMobile;
    const baseColor = useMemo(() => {
        const c = new THREE.Color(color);
        const hsl = { h: 0, s: 0, l: 0 };
        c.getHSL(hsl);
        c.setHSL(hsl.h, hsl.s * 0.55, THREE.MathUtils.clamp(hsl.l * 0.9 + 0.06, 0, 1));
        return `#${c.getHexString()}`;
    }, [color]);

    const albedo = useMemo(() => makePlanetTexture({ type, color: baseColor, seed: (index + 1) * 97, lowDetail }), [type, baseColor, index, lowDetail]);
    const atmosphereMat = useMemo(() => makeFresnelAtmosphereMaterial(baseColor), [baseColor]);

    useFrame((state) => {
        if (planetRef.current) {
            const t = state.clock.getElapsedTime() * speed * 0.2;
            planetRef.current.position.x = Math.sin(t + initialAngle) * distance;
            planetRef.current.position.z = Math.cos(t + initialAngle) * distance;

            if (meteorTarget?.pos) {
                planetRef.current.getWorldPosition(meteorTarget.pos);
            }
        }
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
        }
    });

    // Procedural Materials
    let material;
    if (type === "gas") {
        material = <meshStandardMaterial
            color={baseColor}
            roughness={0.55}
            metalness={0.05}
            map={albedo ?? undefined}
        />;
    } else if (type === "ice") {
        material = <meshStandardMaterial
            color={baseColor}
            roughness={0.25}
            metalness={0.02}
            map={albedo ?? undefined}
        />;
    } else if (type === "terrestrial") {
        material = <meshStandardMaterial 
            color={baseColor} 
            roughness={0.85} 
            metalness={0.05} 
            map={albedo ?? undefined}
        />;
    } else {
        material = <meshStandardMaterial 
            color={baseColor} 
            roughness={0.95} 
            metalness={0.03} 
            map={albedo ?? undefined}
        />;
    }

    const seg = lowDetail ? 16 : (quality === 'high' ? 28 : 22);

    return (
        <group ref={planetRef}>
            <mesh ref={meshRef} castShadow={!!shadowsEnabled} receiveShadow={!!shadowsEnabled}>
                <sphereGeometry args={[size, seg, seg]} />
                {material}
            </mesh>

            <mesh material={atmosphereMat}>
                <sphereGeometry args={[size * 1.06, lowDetail ? 14 : 18, lowDetail ? 14 : 18]} />
            </mesh>

            <Billboard position={[0, size + 0.3, 0]} follow lockZ>
                <Text
                    fontSize={0.3}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    textAlign="center"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {name}
                </Text>
            </Billboard>
        </group>
    );
}