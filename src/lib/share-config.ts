import { z } from "zod";
import type { Vehicle } from "@/data/vehicles";
import type { VehicleConfig, ViewerMode } from "@/components/vehicle/types";

export const exploreSearchSchema = z.object({
  mode: z.enum(["exterior", "interior"]).optional().catch(undefined),
  view: z.string().max(40).optional().catch(undefined),
  paint: z.string().max(40).optional().catch(undefined),
  z: z.string().max(200).optional().catch(undefined),
});
export type ExploreSearch = z.infer<typeof exploreSearchSchema>;

/** Only keep values that exist in this vehicle's manifest. */
export function decodeConfig(v: Vehicle, s: ExploreSearch): { mode?: ViewerMode | undefined; view?: string | undefined; config: VehicleConfig } {
  const zones: Record<string, string> = {};
  for (const pair of (s.z ?? "").split(",")) {
    const [zid, oid] = pair.split(":");
    const zone = [...v.exteriorZones, ...v.interiorZones].find((x) => x.id === zid);
    if (zid && oid && zone?.options.some((o) => o.id === oid)) zones[zid] = oid;
  }
  const paint = v.paint.options.some((o) => o.id === s.paint) ? s.paint : undefined;
  const list = s.mode === "interior" ? v.interiorPresets : v.exteriorPresets;
  const view = list.some((p) => p.id === s.view) ? s.view : undefined;
  return { mode: s.mode, view, config: { paint, zones } };
}

export function encodeConfig(mode: ViewerMode, view: string, c: VehicleConfig): ExploreSearch {
  const z = Object.entries(c.zones).map(([k, v]) => `${k}:${v}`).join(",");
  return { mode: mode === "exterior" ? undefined : mode, view: view || undefined, paint: c.paint, z: z || undefined };
}
