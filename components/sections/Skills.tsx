import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, useScroll, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

export const SkillsSection: React.FC = () => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Group>(null);
  const visibleRef = useRef(false);
  
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
      <Galaxies enabledRef={visibleRef} />

      {/* THE SUN */}
      <group ref={sunRef}>
          <Sphere args={[1.5, 64, 64]}>
            <meshStandardMaterial
              color="#ffdfb0"
              emissive="#ffb44d"
              emissiveIntensity={2.4}
              roughness={0.95}
              metalness={0}
              toneMapped={false}
            />
          </Sphere>
          <Sphere args={[1.42, 48, 48]}>
            <meshStandardMaterial
              color="#fff0d4"
              emissive="#ffd39a"
              emissiveIntensity={2.1}
              roughness={0.7}
              metalness={0}
              transparent
              opacity={0.85}
              toneMapped={false}
            />
          </Sphere>
          <Sphere args={[1.72, 48, 48]}>
            <meshBasicMaterial
              color="#ff7a18"
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.BackSide}
              toneMapped={false}
            />
          </Sphere>
          
          <pointLight 
            color="#ffeedd" 
            intensity={3.5} 
            distance={50} 
            decay={1} 
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
         />
      ))}

      <Meteors enabledRef={visibleRef} />
    </group>
  );
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

const Galaxies: React.FC<{ enabledRef: React.MutableRefObject<boolean> }> = ({ enabledRef }) => {
    const group = useRef<THREE.Group>(null);

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
        return makeGalaxy({
            count: 14000,
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
    }, [makeGalaxy]);

    const galaxyB = useMemo(() => {
        return makeGalaxy({
            count: 10000,
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
    }, [makeGalaxy]);

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
                    size={0.18}
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
                    size={0.16}
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

const Meteors: React.FC<{ enabledRef: React.MutableRefObject<boolean> }> = ({ enabledRef }) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const tmpPos = useRef(new THREE.Vector3());
    const tmpVel = useRef(new THREE.Vector3());
    const tmpColor = useRef(new THREE.Color());

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
        const count = 14;
        const arr: Array<{ pos: THREE.Vector3; vel: THREE.Vector3; len: number; width: number; rotY: number; cooldown: number; age: number; ttl: number; fast: boolean }> = [];
        for (let i = 0; i < count; i++) {
            const fast = Math.random() < 0.38;
            arr.push({
                pos: new THREE.Vector3(0, 999, 0),
                vel: new THREE.Vector3(),
                len: fast ? THREE.MathUtils.lerp(1.6, 2.8, Math.random()) : THREE.MathUtils.lerp(0.9, 1.7, Math.random()),
                width: fast ? THREE.MathUtils.lerp(0.05, 0.085, Math.random()) : THREE.MathUtils.lerp(0.03, 0.06, Math.random()),
                rotY: THREE.MathUtils.lerp(-0.8, 0.8, Math.random()),
                cooldown: Math.random() * 2.5,
                age: 0,
                ttl: fast ? THREE.MathUtils.lerp(0.55, 1.05, Math.random()) : THREE.MathUtils.lerp(1.2, 2.4, Math.random()),
                fast,
            });
        }
        return arr;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    const respawn = (m: { pos: THREE.Vector3; vel: THREE.Vector3; cooldown: number; age: number; ttl: number; fast: boolean }) => {
        m.pos.set(
            THREE.MathUtils.lerp(-14, 14, Math.random()),
            THREE.MathUtils.lerp(6, 12, Math.random()),
            THREE.MathUtils.lerp(-12, 12, Math.random())
        );
        const sx = m.fast ? THREE.MathUtils.lerp(-10.5, -7.0, Math.random()) : THREE.MathUtils.lerp(-4.8, -2.6, Math.random());
        const sy = m.fast ? THREE.MathUtils.lerp(-12.5, -8.5, Math.random()) : THREE.MathUtils.lerp(-5.8, -3.6, Math.random());
        const sz = m.fast ? THREE.MathUtils.lerp(-2.0, 2.0, Math.random()) : THREE.MathUtils.lerp(-1.0, 1.0, Math.random());
        m.vel.set(sx, sy, sz);
        m.cooldown = 0;
        m.age = 0;
        m.ttl = m.fast ? THREE.MathUtils.lerp(0.55, 1.05, Math.random()) : THREE.MathUtils.lerp(1.2, 2.4, Math.random());
    };

    useFrame((state, delta) => {
        if (!mesh.current) return;
        if (!enabledRef.current) return;

        const dt = Math.min(delta, 1 / 30);

        for (let i = 0; i < meteors.length; i++) {
            const m = meteors[i];
            if (m.cooldown > 0) {
                m.cooldown -= dt;
                dummy.position.set(0, 999, 0);
                dummy.rotation.set(0, 0, 0);
                dummy.scale.set(0.0001, 0.0001, 0.0001);
                dummy.updateMatrix();
                mesh.current.setMatrixAt(i, dummy.matrix);
                if (mesh.current.instanceColor) {
                    tmpColor.current.setRGB(0, 0, 0);
                    mesh.current.setColorAt(i, tmpColor.current);
                }
                continue;
            }

            if (m.pos.y > 900) {
                respawn(m);
            }

            m.age += dt;
            const life = THREE.MathUtils.clamp(m.age / (m.ttl || 1), 0, 1);
            const fadeIn = THREE.MathUtils.smoothstep(life, 0, 0.12);
            const fadeOut = 1 - THREE.MathUtils.smoothstep(life, 0.65, 1);
            const intensity = THREE.MathUtils.clamp(fadeIn * fadeOut, 0, 1);

            tmpVel.current.copy(m.vel);
            const speedBoost = m.fast ? 1.15 : 1;
            m.pos.addScaledVector(tmpVel.current, dt * speedBoost);

            const out = (m.pos.y < -4) || (m.pos.x < -22) || (m.pos.z < -20) || (m.pos.z > 20);
            if (out || life >= 1) {
                m.pos.set(0, 999, 0);
                m.cooldown = m.fast ? THREE.MathUtils.lerp(0.2, 1.0, Math.random()) : THREE.MathUtils.lerp(0.6, 2.4, Math.random());
                dummy.position.set(0, 999, 0);
                dummy.rotation.set(0, 0, 0);
                dummy.scale.set(0.0001, 0.0001, 0.0001);
                dummy.updateMatrix();
                mesh.current.setMatrixAt(i, dummy.matrix);
                if (mesh.current.instanceColor) {
                    tmpColor.current.setRGB(0, 0, 0);
                    mesh.current.setColorAt(i, tmpColor.current);
                }
                continue;
            }

            tmpVel.current.copy(m.vel).normalize();
            const angleZ = Math.atan2(tmpVel.current.y, tmpVel.current.x);

            tmpPos.current.copy(m.pos);
            dummy.position.copy(tmpPos.current);
            const roll = (m.fast ? 0.08 : 0.05) * Math.sin((state.clock.getElapsedTime() + i) * 3.2);
            dummy.rotation.set(0, m.rotY + roll, angleZ);
            const len = m.len * (m.fast ? 1.15 : 1);
            dummy.scale.set(len, m.width, 1);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);

            if (mesh.current.instanceColor) {
                const base = m.fast ? 1.35 : 0.85;
                const b = THREE.MathUtils.clamp(intensity * base, 0, 1.6);
                tmpColor.current.setRGB(0.70 * b, 0.90 * b, 1.0 * b);
                mesh.current.setColorAt(i, tmpColor.current);
            }
        }

        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, meteors.length]} frustumCulled={false}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={trailTexture ?? undefined}
                transparent
                opacity={0.85}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
                vertexColors
            />
        </instancedMesh>
    );
};

const Planet = ({ name, color, type, size, distance, speed, index, total }: any) => {
    const planetRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const denom = (typeof total === 'number' && total > 0) ? total : 9;
    const initialAngle = (index / denom) * Math.PI * 2;

    useFrame((state) => {
        if (planetRef.current) {
            const t = state.clock.getElapsedTime() * speed * 0.2;
            planetRef.current.position.x = Math.sin(t + initialAngle) * distance;
            planetRef.current.position.z = Math.cos(t + initialAngle) * distance;
        }
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
        }
    });

    // Procedural Materials
    let material;
    if (type === "gas") {
        material = <meshPhysicalMaterial 
            color={color} 
            roughness={0.4} 
            metalness={0.1} 
            clearcoat={0.5} 
            clearcoatRoughness={0.5}
        />;
    } else if (type === "ice") {
        material = <meshPhysicalMaterial 
            color={color} 
            roughness={0.1} 
            metalness={0.8} 
            transmission={0.2} 
            thickness={1}
        />;
    } else if (type === "terrestrial") {
        material = <meshStandardMaterial 
            color={color} 
            roughness={0.8} 
            metalness={0.1} 
        />;
    } else {
        material = <meshStandardMaterial 
            color={color} 
            roughness={0.9} 
            metalness={0.2} 
            flatShading 
        />;
    }

    return (
        <group ref={planetRef}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[size, 24, 24]} />
                {material}
            </mesh>

            <mesh>
                <sphereGeometry args={[size * 1.12, 18, 18]} />
                <meshBasicMaterial color={color} transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
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