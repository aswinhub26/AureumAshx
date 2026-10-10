import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Vehicle } from "@/data/vehicles";
import type { VehicleConfig } from "./types";
import { refineVireoCockpit } from "./cockpit-details";

interface Props {
  vehicle: Vehicle;
  config: VehicleConfig;
  onSupportedZones?: (ids: string[]) => void;
}

type Entry = { mat: THREE.MeshStandardMaterial; original: THREE.Color };

/** Loads, normalises (length along Z, ground at 0) and recolours named material zones only. */
export function VehicleModel({ vehicle, config, onSupportedZones }: Props) {
  const model = vehicle.model;
  if (!model) throw new Error("Vehicle model is unavailable");
  const gltf = useGLTF(model.url, true);

  const { scene, scale, offset, rot, reg } = useMemo(() => {
    const scene = gltf.scene.clone(true);
    if (vehicle.slug === "vireo-concept") refineVireoCockpit(scene);
    const zones = [vehicle.paint, ...vehicle.exteriorZones, ...vehicle.interiorZones];
    const byName: Record<string, THREE.Material> = {};
    const reg: Record<string, Entry[]> = {};

    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const swap = (m: THREE.Material) => {
        const zone = zones.find((z) => z.materials.includes(m.name));
        if (!zone) return m;
        // The wheel's leather is independent of the seat upholstery finish.
        if (vehicle.slug === "vireo-concept" && mesh.name.startsWith("InteriorSteeringWheel")) return m;
        if (!byName[m.name]) {
          const src = m as THREE.MeshStandardMaterial;
          let next: THREE.MeshStandardMaterial;
          if (zone.paint) {
            const p = new THREE.MeshPhysicalMaterial({
              color: src.color?.clone() ?? new THREE.Color("#777"),
              metalness: 0.75,
              roughness: 0.32,
              clearcoat: 0.8,
              clearcoatRoughness: 0.12,
              envMapIntensity: 1.1,
            });
            p.name = m.name;
            next = p;
          } else {
            next = src.clone();
          }
          byName[m.name] = next;
          (reg[zone.id] ??= []).push({ mat: next, original: next.color.clone() });
        }
        return byName[m.name] ?? m;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
    });

    const rotY = model.rotationY;
    const tmp = new THREE.Group();
    tmp.add(scene);
    const box0 = new THREE.Box3().setFromObject(scene);
    const s0 = box0.getSize(new THREE.Vector3());
    const rot = (s0.x > s0.z ? Math.PI / 2 : 0) + rotY;
    tmp.rotation.y = rot;
    tmp.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(tmp);
    const size = box.getSize(new THREE.Vector3());
    const scale = model.length / Math.max(size.x, size.z);
    const c = box.getCenter(new THREE.Vector3());
    tmp.remove(scene);
    return { scene, scale, offset: new THREE.Vector3(-c.x, -box.min.y, -c.z), rot, reg };
  }, [gltf, vehicle, model]);

  useEffect(() => {
    onSupportedZones?.(Object.keys(reg));
  }, [reg, onSupportedZones]);

  useEffect(() => {
    const all = [vehicle.paint, ...vehicle.exteriorZones, ...vehicle.interiorZones];
    for (const zone of all) {
      const entries = reg[zone.id];
      if (!entries) continue;
      const optId = zone.paint ? config.paint : config.zones[zone.id];
      const opt = zone.options.find((o) => o.id === optId);
      for (const e of entries) e.mat.color.copy(opt ? new THREE.Color(opt.color) : e.original);
    }
  }, [config, vehicle, reg]);

  return (
    <group scale={scale}>
      <group position={offset}>
        <group rotation-y={rot}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}
