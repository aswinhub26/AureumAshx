import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl tracking-[0.35em]">AUREUM</Link>
        <nav className="flex gap-6 text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
          <Link to="/vehicle/$slug" params={{ slug: "solenne-gt" }} className="hover:text-foreground">Solenne GT</Link>
          <Link to="/vehicle/$slug" params={{ slug: "vireo-concept" }} className="hover:text-foreground">Vireo</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-10 text-xs text-muted-foreground md:flex-row md:justify-between">
        <p className="font-display text-lg tracking-[0.35em] text-foreground">AUREUM MOTORS</p>
        <p>Demonstration site. Vehicles, figures and finishes are illustrative. 3D models used under their open licences.</p>
      </div>
    </footer>
  );
}
