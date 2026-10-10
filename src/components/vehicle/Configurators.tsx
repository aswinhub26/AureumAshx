import type { MaterialZone, Vehicle } from "@/data/vehicles";
import type { VehicleConfig } from "./types";

interface Props {
  vehicle: Vehicle;
  config: VehicleConfig;
  supported: string[];
  onChange: (c: VehicleConfig) => void;
}

function Zone({ zone, value, onSelect, onReset }: { zone: MaterialZone; value?: string | undefined; onSelect: (id: string) => void; onReset: () => void }) {
  const current = zone.options.find((o) => o.id === value);
  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{zone.label}</p>
        {value && (
          <button className="text-[0.65rem] uppercase tracking-[0.2em] text-gold hover:underline" onClick={onReset}>
            Original
          </button>
        )}
      </div>
      <p className="mt-1 font-display text-xl">{current?.name ?? "Original finish"}</p>
      <div className="mt-3 flex flex-wrap gap-2.5" role="radiogroup" aria-label={zone.label}>
        {zone.options.map((o) => (
          <button
            key={o.id}
            role="radio"
            aria-checked={value === o.id}
            aria-label={o.name}
            title={o.name}
            onClick={() => onSelect(o.id)}
            className={`h-10 w-10 rounded-full border-2 transition ${value === o.id ? "border-gold scale-110" : "border-transparent hover:border-border"}`}
          >
            <span className="block h-full w-full rounded-full border border-border" style={{ background: `radial-gradient(circle at 30% 30%, color-mix(in oklab, ${o.color} 60%, white), ${o.color} 60%)` }} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function PaintConfigurator({ vehicle, config, supported, onChange }: Props) {
  const zones = vehicle.exteriorZones.filter((z) => supported.includes(z.id));
  return (
    <>
      {supported.includes(vehicle.paint.id) && (
        <Zone zone={vehicle.paint} value={config.paint} onSelect={(id) => onChange({ ...config, paint: id })} onReset={() => onChange({ ...config, paint: undefined })} />
      )}
      {zones.map((z) => (
        <Zone
          key={z.id}
          zone={z}
          value={config.zones[z.id]}
          onSelect={(id) => onChange({ ...config, zones: { ...config.zones, [z.id]: id } })}
          onReset={() => {
            const { [z.id]: _, ...rest } = config.zones;
            onChange({ ...config, zones: rest });
          }}
        />
      ))}
    </>
  );
}

export function InteriorMaterialConfigurator({ vehicle, config, supported, onChange }: Props) {
  const zones = vehicle.interiorZones.filter((z) => supported.includes(z.id));
  if (!zones.length) return null;
  return (
    <div className="mt-8 border-t pt-2">
      <p className="eyebrow mt-4">Interior</p>
      {zones.map((z) => (
        <Zone
          key={z.id}
          zone={z}
          value={config.zones[z.id]}
          onSelect={(id) => onChange({ ...config, zones: { ...config.zones, [z.id]: id } })}
          onReset={() => {
            const { [z.id]: _, ...rest } = config.zones;
            onChange({ ...config, zones: rest });
          }}
        />
      ))}
      <p className="mt-4 text-xs text-muted-foreground">Ambient lighting colours are not supported by this model.</p>
    </div>
  );
}

export function describeConfig(vehicle: Vehicle, config: VehicleConfig) {
  const out: { label: string; value: string }[] = [];
  out.push({ label: vehicle.paint.label, value: vehicle.paint.options.find((o) => o.id === config.paint)?.name ?? "Original finish" });
  for (const z of [...vehicle.exteriorZones, ...vehicle.interiorZones]) {
    const o = z.options.find((x) => x.id === config.zones[z.id]);
    if (o) out.push({ label: z.label, value: o.name });
  }
  return out;
}
