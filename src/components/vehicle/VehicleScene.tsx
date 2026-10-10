import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  MeshReflectorMaterial,
  OrbitControls,
  useProgress,
} from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import type { Hotspot, Vehicle } from "@/data/vehicles";
import { VehicleModel } from "./VehicleModel";
import type { CameraGoal, VehicleConfig, ViewerMode } from "./types";

interface SceneProps {
  vehicle: Vehicle;
  config: VehicleConfig;
  mode: ViewerMode;
  goal: CameraGoal;
  autoRotate: boolean;
  hotspots: Hotspot[];
  activeHotspot?: string | undefined;
  onHotspot: (h: Hotspot) => void;
  onSupportedZones: (ids: string[]) => void;
  onInteract: () => void;
  onLoaded: () => void;
  active: boolean;
  lowPower: boolean;
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Smoothly interpolates camera + orbit target to preset goals; user input cancels. */
function CameraPresetController({ goal, mode, autoRotate, onInteract }: Pick<SceneProps, "goal" | "mode" | "autoRotate" | "onInteract">) {
  const controls = useRef<OrbitImpl>(null);
  const { camera } = useThree();
  const anim = useRef<{ start: number; t: number; fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3 } | null>(null);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    anim.current = {
      start: performance.now(),
      t: 0,
      fromP: camera.position.clone(),
      fromT: c.target.clone(),
      toP: new THREE.Vector3(...goal.position),
      toT: new THREE.Vector3(...goal.target),
    };
  }, [goal, camera]);

  useFrame(() => {
    const c = controls.current;
    const a = anim.current;
    if (!c || !a) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    a.t = reduce ? 1 : Math.min(1, (performance.now() - a.start) / 1600);
    const k = easeInOut(a.t);
    camera.position.lerpVectors(a.fromP, a.toP, k);
    c.target.lerpVectors(a.fromT, a.toT, k);
    if (a.t >= 1) anim.current = null;
  });

  const interior = mode === "interior";
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      rotateSpeed={interior ? -0.35 : 0.6}
      zoomSpeed={0.7}
      minDistance={interior ? 0.05 : 3.4}
      maxDistance={interior ? 0.9 : 13}
      minPolarAngle={interior ? 0.2 : 0.15}
      maxPolarAngle={interior ? Math.PI - 0.2 : Math.PI / 2 - 0.06}
      autoRotate={autoRotate && !interior}
      autoRotateSpeed={0.5}
      onStart={() => {
        anim.current = null;
        onInteract();
      }}
    />
  );
}

function LoadingProgress() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="w-56 text-center">
        <p className="eyebrow">Preparing the studio</p>
        <div className="mt-3 h-px w-full bg-border">
          <div className="h-px bg-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{Math.round(progress)}%</p>
      </div>
    </Html>
  );
}

function Loaded({ onLoaded }: { onLoaded: () => void }) {
  useEffect(() => onLoaded(), [onLoaded]);
  return null;
}

function Hotspots({ hotspots, activeHotspot, onHotspot }: Pick<SceneProps, "hotspots" | "activeHotspot" | "onHotspot">) {
  return (
    <>
      {hotspots.map((h, i) => (
        <Html key={h.id} position={h.position} center zIndexRange={[10, 0]}>
          <button
            type="button"
            className="hotspot"
            data-active={activeHotspot === h.id}
            aria-label={`Explore ${h.title}`}
            onClick={() => onHotspot(h)}
          >
            <span className="text-[0.65rem] font-semibold">{i + 1}</span>
          </button>
        </Html>
      ))}
    </>
  );
}

export function VehicleScene(p: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={p.lowPower ? [1, 1.25] : [1, 1.75]}
      frameloop={p.active ? "always" : "never"}
      camera={{ position: p.goal.position, fov: 38, near: 0.02, far: 100 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05;
      }}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#0d0c0b"]} />
      <fog attach="fog" args={["#0d0c0b", 12, 26]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 9, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-6, 6, -4]} intensity={40} angle={0.6} penumbra={1} color="#f2dfb8" />
      <Environment resolution={p.lowPower ? 128 : 256}>
        <Lightformer form="rect" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[12, 1.5, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[6, 2, 0]} rotation-y={-Math.PI / 2} scale={[12, 1.5, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#e8cf9c" position={[0, 2, -8]} scale={[14, 3, 1]} />
        <Lightformer form="ring" intensity={1.2} position={[0, 3, 8]} scale={3} />
      </Environment>

      <Suspense fallback={null}>
        <VehicleModel vehicle={p.vehicle} config={p.config} onSupportedZones={p.onSupportedZones} />
        <Hotspots hotspots={p.hotspots} activeHotspot={p.activeHotspot} onHotspot={p.onHotspot} />
        <Loaded onLoaded={p.onLoaded} />
      </Suspense>

      <ContactShadows position={[0, 0.005, 0]} opacity={0.7} scale={12} blur={2.4} far={3} resolution={p.lowPower ? 256 : 512} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[60, 60]} />
        {p.lowPower ? (
          <meshStandardMaterial color="#121110" roughness={0.6} metalness={0.4} />
        ) : (
          <MeshReflectorMaterial
            resolution={512}
            mirror={0.35}
            mixStrength={1.2}
            blur={[400, 120]}
            roughness={0.85}
            depthScale={0.6}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
            color="#121110"
            metalness={0.5}
          />
        )}
      </mesh>
      <CameraPresetController goal={p.goal} mode={p.mode} autoRotate={p.autoRotate} onInteract={p.onInteract} />
    </Canvas>
  );
}

export default VehicleScene;
