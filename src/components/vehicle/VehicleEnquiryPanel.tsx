import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Vehicle } from "@/data/vehicles";
import type { VehicleConfig } from "./types";
import { describeConfig } from "./Configurators";

const schema = z.object({
  full_name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
});

export function VehicleEnquiryPanel({ vehicle, config, onClose }: { vehicle: Vehicle; config: VehicleConfig; onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string>();
  const summary = describeConfig(vehicle, config);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      full_name: fd.get("full_name"),
      email: fd.get("email"),
      phone: (fd.get("phone") as string) || undefined,
      message: (fd.get("message") as string) || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setError(undefined);
    setStatus("sending");
    const { error: err } = await supabase.from("vehicle_enquiries").insert({
      ...parsed.data,
      phone: parsed.data.phone ?? null,
      message: parsed.data.message ?? null,
      vehicle_slug: vehicle.slug,
      configuration: { ...config, summary },
    });
    if (err) {
      console.error(err);
      setStatus("error");
      setError("We couldn't send your enquiry. Please try again.");
      return;
    }
    setStatus("done");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Enquire about this vehicle">
      <div className="glass-panel max-h-[90dvh] w-full max-w-lg overflow-y-auto p-6 md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Private enquiry</p>
            <h3 className="mt-2 text-3xl">{vehicle.name}</h3>
          </div>
          <button className="chip" onClick={onClose} aria-label="Close enquiry">Close</button>
        </div>
        <dl className="mt-5 space-y-1.5 border-y py-4 text-sm">
          {summary.map((s) => (
            <div key={s.label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
        {status === "done" ? (
          <div className="py-8 text-center">
            <p className="font-display text-2xl">Thank you.</p>
            <p className="mt-2 text-sm text-muted-foreground">Your enquiry has been received. A client advisor will be in touch.</p>
            <button className="chip mt-6" onClick={onClose}>Return to the showroom</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            {[
              { n: "full_name", l: "Full name", t: "text", r: true },
              { n: "email", l: "Email", t: "email", r: true },
              { n: "phone", l: "Phone (optional)", t: "tel" },
            ].map((f) => (
              <label key={f.n} className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{f.l}</span>
                <input name={f.n} type={f.t} required={f.r} className="mt-1.5 w-full border border-input bg-transparent px-3 py-2.5 text-sm outline-none focus:border-gold" />
              </label>
            ))}
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Message (optional)</span>
              <textarea name="message" rows={3} maxLength={2000} className="mt-1.5 w-full border border-input bg-transparent px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <button type="submit" disabled={status === "sending"} className="chip w-full py-3" data-active="true">
              {status === "sending" ? "Sending…" : "Send enquiry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
