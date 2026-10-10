import type { Hotspot } from "@/data/vehicles";

export function VehicleFeaturePanel({ hotspot, related, onRelated, onClose }: { hotspot: Hotspot; related?: Hotspot | undefined; onRelated: (h: Hotspot) => void; onClose: () => void }) {
  return (
    <div className="glass-panel absolute z-30 left-4 top-40 w-[calc(100%-2rem)] max-w-sm p-6 animate-in fade-in slide-in-from-left-4 duration-500 md:left-6 md:top-44" role="dialog" aria-label={hotspot.title}>
      <p className="eyebrow">Feature</p>
      <h3 className="mt-2 text-3xl">{hotspot.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{hotspot.description}</p>
      {hotspot.specs?.length ? (
        <dl className="mt-4 space-y-2 text-sm">
          {hotspot.specs.map((s) => (
            <div key={s.label} className="flex justify-between border-b pb-2">
              <dt className="text-muted-foreground">{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">Verified specifications not yet provided.</p>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        <button className="chip" onClick={onClose}>← Full vehicle view</button>
        {related && <button className="chip" onClick={() => onRelated(related)}>{related.title} →</button>}
      </div>
    </div>
  );
}
