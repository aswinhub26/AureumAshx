import type { Vehicle } from "@/data/vehicles";
import { VehicleGallery } from "./VehicleGallery";

export function ModelLoadingState({ vehicle, overlay }: { vehicle: Vehicle; overlay?: boolean }) {
  return (
    <div className={`${overlay ? "pointer-events-none z-0" : ""} absolute inset-0`}>
      <img src={vehicle.poster} alt="" className="h-full w-full object-cover opacity-30 blur-sm" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="eyebrow">Loading 3D model</p>
          <div className="mx-auto mt-3 h-px w-40 overflow-hidden bg-border">
            <div className="h-px w-1/3 animate-pulse bg-gold" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModelErrorFallback({ vehicle, reason }: { vehicle: Vehicle; reason: "webgl" | "load" }) {
  return (
    <div className="absolute inset-0 overflow-y-auto p-4 pt-36 md:p-6 md:pt-44">
      <p className="mb-4 max-w-lg text-sm text-muted-foreground">
        {reason === "webgl"
          ? "Your browser or device doesn't support 3D graphics, so we're showing the photo gallery instead."
          : "The 3D model couldn't be loaded right now. Here is the photo gallery instead — try refreshing later."}
      </p>
      <VehicleGallery vehicle={vehicle} />
    </div>
  );
}
