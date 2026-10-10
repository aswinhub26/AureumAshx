import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { vehicles } from "@/data/vehicles";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AUREUM Motors — Private 3D Showroom" },
      { name: "description", content: "Explore AUREUM's luxury vehicles in an interactive 3D showroom: rotate, configure and step inside." },
      { property: "og:title", content: "AUREUM Motors — Private 3D Showroom" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Rotate, configure and step inside AUREUM's luxury vehicles in 3D." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative h-screen min-h-[600px] overflow-hidden">
          <img src={hero} alt="AUREUM grand tourer in a dark showroom" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1088} />
          <div className="absolute inset-0 bg-side" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-fade" />
          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6">
            <p className="eyebrow">The private showroom</p>
            <h1 className="mt-4 max-w-2xl text-6xl leading-[0.95] md:text-8xl">Examine every line, from every seat.</h1>
            <p className="mt-6 max-w-md text-muted-foreground">Rotate, configure and step inside AUREUM's vehicles in real-time 3D.</p>
            <div className="mt-10">
              <Link to="/vehicle/$slug/explore" params={{ slug: "solenne-gt" }} search={{}} className="chip" data-active="true">Enter the showroom</Link>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-6 py-24">
          <p className="eyebrow">The collection</p>
          <h2 className="mt-2 text-5xl">Two studies in proportion.</h2>
          <div className="mt-12 grid gap-px bg-border md:grid-cols-2">
            {vehicles.map((v) => (
              <Link key={v.slug} to="/vehicle/$slug" params={{ slug: v.slug }} className="group bg-background">
                <div className="overflow-hidden">
                  <img src={v.poster} alt={v.name} className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-8">
                  <p className="eyebrow">{v.category}</p>
                  <h3 className="mt-2 text-4xl">{v.name}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{v.tagline}</p>
                  <p className="mt-6 text-[0.7rem] uppercase tracking-[0.25em] text-gold">Interactive 3D model →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
