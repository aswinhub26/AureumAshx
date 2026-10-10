import { useState } from "react";
import type { Vehicle } from "@/data/vehicles";

export function VehicleSpecificationTabs({ vehicle }: { vehicle: Vehicle }) {
  const [tab, setTab] = useState(vehicle.specs[0]!.id);
  const group = vehicle.specs.find((s) => s.id === tab)!;
  const provided = group.rows.filter((r) => r.value);
  const missing = group.rows.filter((r) => !r.value);
  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-2" role="tablist">
        {vehicle.specs.map((s) => (
          <button key={s.id} role="tab" aria-selected={tab === s.id} data-active={tab === s.id} className="chip shrink-0" onClick={() => setTab(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="mt-6" role="tabpanel">
        {group.intro && <p className="mb-5 max-w-xl text-sm text-muted-foreground">{group.intro}</p>}
        <dl className="grid gap-px bg-border sm:grid-cols-2">
          {provided.map((r) => (
            <div key={r.label} className="bg-background p-5">
              <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{r.label}</dt>
              <dd className="mt-2 font-display text-2xl">{r.value}</dd>
            </div>
          ))}
        </dl>
        {missing.length > 0 && (
          <p className="mt-4 text-xs text-muted-foreground">
            Information not yet provided: {missing.map((m) => m.label).join(", ")}.
          </p>
        )}
      </div>
    </div>
  );
}
