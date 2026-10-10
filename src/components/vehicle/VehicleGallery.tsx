import { useState } from "react";
import type { GalleryImage, Vehicle } from "@/data/vehicles";

export function VehicleGallery({ vehicle, kind }: { vehicle: Vehicle; kind?: GalleryImage["kind"] }) {
  const images = kind ? vehicle.gallery.filter((g) => g.kind === kind) : vehicle.gallery;
  const [i, setI] = useState(0);
  if (!images.length) return <p className="text-sm text-muted-foreground">No images available for this view yet.</p>;
  const img = images[Math.min(i, images.length - 1)]!;
  return (
    <div>
      <figure className="relative overflow-hidden border">
        <img src={img.src} alt={img.alt} className="aspect-[16/10] w-full object-cover" loading="lazy" width={1600} height={1000} />
        <figcaption className="absolute bottom-3 left-3 chip bg-background/70">Rendered illustration · {img.kind}</figcaption>
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            <button className="chip bg-background/70" aria-label="Previous image" onClick={() => setI((x) => (x - 1 + images.length) % images.length)}>←</button>
            <button className="chip bg-background/70" aria-label="Next image" onClick={() => setI((x) => (x + 1) % images.length)}>→</button>
          </div>
        )}
      </figure>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2">
          {images.map((g, n) => (
            <button key={n} onClick={() => setI(n)} aria-label={g.alt} className={`w-24 border ${n === i ? "border-gold" : "opacity-60 hover:opacity-100"}`}>
              <img src={g.src} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
