import { createFileRoute, notFound, useNavigate, Link } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useState } from "react";
import { toast } from "sonner";
import { getVehicle } from "@/data/vehicles";
import { decodeConfig, encodeConfig, exploreSearchSchema } from "@/lib/share-config";
import type { ViewerState } from "@/components/vehicle/VehicleViewer";
import { VehicleEnquiryPanel } from "@/components/vehicle/VehicleEnquiryPanel";

const VehicleViewer = lazy(() => import("@/components/vehicle/VehicleViewer"));

export const Route = createFileRoute("/vehicle/$slug/explore")({
  ssr: false,
  validateSearch: exploreSearchSchema,
  loader: ({ params }) => {
    const v = getVehicle(params.slug);
    if (!v) throw notFound();
    return { slug: v.slug, name: v.name, tagline: v.tagline };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `Explore the ${loaderData.name} in 3D — AUREUM Motors` : "Vehicle not found — AUREUM Motors";
    const description = loaderData ? `Rotate, configure and step inside the ${loaderData.name} in AUREUM's private 3D showroom.` : "This vehicle could not be found.";
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
  component: Explore,
});

function Explore() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const vehicle = getVehicle(slug)!;
  const [initial] = useState(() => decodeConfig(vehicle, search));
  const [enquiry, setEnquiry] = useState<ViewerState | null>(null);

  const onStateChange = useCallback(
    (s: ViewerState) => {
      void navigate({ search: encodeConfig(s.mode, s.view, s.config), replace: true });
    },
    [navigate],
  );

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${vehicle.name} — AUREUM`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Configuration link copied");
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <main className="overscroll-none">
      <h1 className="sr-only">Explore the {vehicle.name}</h1>
      <Suspense fallback={<div className="grid h-[100dvh] place-items-center"><p className="eyebrow">Opening the showroom</p></div>}>
        <VehicleViewer vehicle={vehicle} initial={initial} onStateChange={onStateChange} onShare={onShare} onEnquire={setEnquiry} />
      </Suspense>
      {enquiry && <VehicleEnquiryPanel vehicle={vehicle} config={enquiry.config} onClose={() => setEnquiry(null)} />}
    </main>
  );
}
