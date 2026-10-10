import { createFileRoute, notFound, Link, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { getVehicle } from "@/data/vehicles";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { VehicleGallery } from "@/components/vehicle/VehicleGallery";
import { VehicleSpecificationTabs } from "@/components/vehicle/VehicleSpecificationTabs";
import { VehicleEnquiryPanel } from "@/components/vehicle/VehicleEnquiryPanel";

const VehicleViewer = lazy(() => import("@/components/vehicle/VehicleViewer"));

export const Route = createFileRoute("/vehicle/$slug/")({
  loader: ({ params }) => {
    const v = getVehicle(params.slug);
    if (!v) throw notFound();
    return { slug: v.slug, name: v.name, tagline: v.tagline };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — AUREUM Motors` : "Vehicle not found — AUREUM Motors";
    const description = loaderData?.tagline ?? "This vehicle could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:description", content: description },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center text-center">
      <div>
        <h1 className="text-4xl">Vehicle not found</h1>
        <Link to="/" className="chip mt-6 inline-block">Back to AUREUM</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => <div className="p-10" role="alert">{(error as Error).message}</div>,
  component: VehiclePage,
});

type Mode = "exterior" | "interior" | "360" | "details";

function VehiclePage() {
  const { slug } = Route.useParams();
  const vehicle = getVehicle(slug)!;
  const [mode, setMode] = useState<Mode>("exterior");
  const [enquire, setEnquire] = useState(false);
  const has3d = !!vehicle.model;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative h-[88vh] min-h-[560px] overflow-hidden">
          <img src={vehicle.poster} alt={`${vehicle.name}`} className="absolute inset-0 h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-side" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-fade" />
          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16">
            <p className="eyebrow">{vehicle.category}</p>
            <h1 className="mt-3 text-6xl md:text-8xl">{vehicle.name}</h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">{vehicle.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {has3d && (
                <Link to="/vehicle/$slug/explore" params={{ slug }} search={{}} className="chip" data-active="true">
                  Enter 3D showroom
                </Link>
              )}
              <button className="chip" onClick={() => setEnquire(true)}>Enquire</button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Explore</p>
              <h2 className="mt-2 text-4xl md:text-5xl">Every angle, every detail.</h2>
            </div>
            <div className="flex flex-wrap border" role="tablist" aria-label="Gallery mode">
              {(["exterior", "interior", "360", "details"] as Mode[]).map((m) => (
                <button key={m} role="tab" aria-selected={mode === m} data-active={mode === m} className="chip border-0" onClick={() => setMode(m)}>
                  {m === "360" ? "360° view" : m}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-10">
            {mode === "exterior" && <VehicleGallery vehicle={vehicle} kind="exterior" />}
            {mode === "interior" && <VehicleGallery vehicle={vehicle} kind="interior" />}
            {mode === "details" && <VehicleGallery vehicle={vehicle} kind="detail" />}
            {mode === "360" &&
              (has3d ? (
                <ClientOnly fallback={<div className="h-[62vh] border" />}>
                  <Suspense fallback={<div className="grid h-[62vh] place-items-center border"><p className="eyebrow">Loading 3D viewer</p></div>}>
                    <VehicleViewer vehicle={vehicle} compact />
                  </Suspense>
                </ClientOnly>
              ) : (
                <VehicleGallery vehicle={vehicle} />
              ))}
            {mode !== "360" && has3d && (
              <p className="mt-4 text-xs text-muted-foreground">Photographs are rendered illustrations. Choose “360° view” for the interactive 3D model.</p>
            )}
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1fr_2fr]">
            <div>
              <p className="eyebrow">Specifications</p>
              <h2 className="mt-2 text-4xl">The {vehicle.name}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{vehicle.summary}</p>
              <p className="mt-6 font-display text-2xl">{vehicle.price}</p>
              {vehicle.model && <p className="mt-6 text-xs text-muted-foreground">{vehicle.model.credit}</p>}
            </div>
            <VehicleSpecificationTabs vehicle={vehicle} />
          </div>
        </section>
      </main>
      <SiteFooter />
      {enquire && <VehicleEnquiryPanel vehicle={vehicle} config={{ zones: {} }} onClose={() => setEnquire(false)} />}
    </>
  );
}
