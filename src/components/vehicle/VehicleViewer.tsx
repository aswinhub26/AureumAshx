import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, Component, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { Hotspot, Vehicle } from "@/data/vehicles";
import type { CameraGoal, VehicleConfig, ViewerMode } from "./types";
import { PaintConfigurator, InteriorMaterialConfigurator } from "./Configurators";
import { VehicleFeaturePanel } from "./VehicleFeaturePanel";
import { ModelErrorFallback, ModelLoadingState } from "./ModelStates";

const VehicleScene = lazy(() => import("./VehicleScene"));

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(e: unknown) {
    console.error("3D viewer failed", e);
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export interface ViewerState {
  mode: ViewerMode;
  view: string;
  config: VehicleConfig;
}

interface Props {
  vehicle: Vehicle;
  compact?: boolean;
  initial?: { mode?: ViewerMode | undefined; view?: string | undefined; config?: VehicleConfig };
  onStateChange?: (s: ViewerState) => void;
  onEnquire?: (s: ViewerState) => void;
  onShare?: (s: ViewerState) => void;
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function VehicleViewer({ vehicle, compact, initial, onStateChange, onEnquire, onShare }: Props) {
  const [mode, setMode] = useState<ViewerMode>(initial?.mode ?? "exterior");
  const presets = mode === "interior" ? vehicle.interiorPresets : vehicle.exteriorPresets;
  const [view, setView] = useState<string>(initial?.view ?? (mode === "interior" ? vehicle.interiorPresets[0]!.id : "front-34"));
  const [config, setConfig] = useState<VehicleConfig>(initial?.config ?? { zones: {} });
  const [goal, setGoal] = useState<CameraGoal>(() => {
    const list = (initial?.mode ?? "exterior") === "interior" ? vehicle.interiorPresets : vehicle.exteriorPresets;
    const p = list.find((x) => x.id === (initial?.view ?? "front-34")) ?? list[1] ?? list[0]!;
    return { position: p.position, target: p.target, nonce: 0 };
  });
  const [autoRotate, setAutoRotate] = useState(false);
  const [active, setActive] = useState<Hotspot | null>(null);
  const [supported, setSupported] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [lowPower, setLowPower] = useState(false);
  const [panel, setPanel] = useState<"configure" | "none">(compact ? "none" : "configure");
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWebgl(hasWebGL());
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    setLowPower(mobile || (navigator.hardwareConcurrency ?? 8) <= 4);
    if (mobile && !compact) setPanel("none");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && !compact) setAutoRotate(false);
    let inView = true;
    const io = new IntersectionObserver(([e]) => {
      inView = e ? e.isIntersecting || e.intersectionRatio > 0 : true;
      setVisible(inView && document.visibilityState !== "hidden");
    });
    if (wrap.current) io.observe(wrap.current);
    const onVis = () => setVisible(inView && document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [compact]);

  const state = useMemo(() => ({ mode, view, config }), [mode, view, config]);
  useEffect(() => onStateChange?.(state), [state, onStateChange]);

  const goTo = useCallback((position: CameraGoal["position"], target: CameraGoal["target"]) => {
    setGoal((g) => ({ position, target, nonce: g.nonce + 1 }));
  }, []);

  const selectPreset = (id: string, list = presets) => {
    const p = list.find((x) => x.id === id);
    if (!p) return;
    setView(id);
    setActive(null);
    goTo(p.position, p.target);
  };

  const switchMode = (m: ViewerMode) => {
    if (m === mode) return;
    setMode(m);
    setAutoRotate(false);
    const list = m === "interior" ? vehicle.interiorPresets : vehicle.exteriorPresets;
    selectPreset(m === "interior" ? list[0]!.id : "front-34", list);
  };

  const onHotspot = (h: Hotspot) => {
    setActive(h);
    setAutoRotate(false);
    setView("");
    goTo(h.camera.position, h.camera.target);
  };

  const resetView = () => selectPreset(mode === "interior" ? vehicle.interiorPresets[0]!.id : "front-34");

  const fullscreen = () => {
    const el = wrap.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  const hotspots = mode === "interior" ? vehicle.interiorHotspots : vehicle.exteriorHotspots;
  const allHotspots = [...vehicle.exteriorHotspots, ...vehicle.interiorHotspots];
  const onSupported = useCallback((ids: string[]) => setSupported(ids), []);
  const onLoaded = useCallback(() => setLoaded(true), []);
  const onInteract = useCallback(() => {
    setAutoRotate(false);
    setView("");
  }, []);

  const fallback = <ModelErrorFallback vehicle={vehicle} reason={webgl === false ? "webgl" : "load"} />;

  return (
    <div
      ref={wrap}
      className={`relative w-full overflow-hidden bg-background ${compact ? "h-[62vh] min-h-[420px] border" : "h-[100dvh]"}`}
      onDoubleClick={resetView}
    >
      {webgl === false || !vehicle.model ? (
        fallback
      ) : webgl === null ? (
        <ModelLoadingState vehicle={vehicle} />
      ) : (
        <SceneBoundary fallback={fallback}>
          {!loaded && <ModelLoadingState vehicle={vehicle} overlay />}
          <Suspense fallback={<ModelLoadingState vehicle={vehicle} />}>
            <div className={`absolute inset-y-0 left-0 transition-[right] duration-700 ${panel === "configure" ? "right-0 md:right-[25rem]" : "right-0"}`} aria-label={`Interactive 3D model of the ${vehicle.name}. Drag to rotate, scroll or pinch to zoom.`} role="img">
              <VehicleScene
                vehicle={vehicle}
                config={config}
                mode={mode}
                goal={goal}
                autoRotate={autoRotate}
                hotspots={loaded ? hotspots : []}
                activeHotspot={active?.id}
                onHotspot={onHotspot}
                onSupportedZones={onSupported}
                onInteract={onInteract}
                onLoaded={onLoaded}
                active={visible}
                lowPower={lowPower}
              />
            </div>
          </Suspense>
        </SceneBoundary>
      )}

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 md:p-6">
        <div className="pointer-events-auto">
          {!compact && (
            <Link to="/vehicle/$slug" params={{ slug: vehicle.slug }} className="chip inline-block">
              ← Exit showroom
            </Link>
          )}
          <p className="eyebrow mt-4">Interactive 3D model · demonstration</p>
          <h2 className="mt-1 text-3xl md:text-5xl">{vehicle.name}</h2>
        </div>
        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          <div className="flex border" role="tablist" aria-label="Exploration mode">
            {(["exterior", "interior"] as const).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} data-active={mode === m} className="chip border-0" onClick={() => switchMode(m)}>
                {m}
              </button>
            ))}
          </div>
          {!compact && (
            <button className="chip hidden md:inline-block" onClick={fullscreen}>
              Full screen
            </button>
          )}
        </div>
      </div>

      {/* Presets */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        {mode === "interior" && vehicle.model && (
          <p className="mb-3 max-w-md text-xs text-muted-foreground">{vehicle.model.interiorNote}</p>
        )}
        <div className="flex items-end justify-between gap-3">
          <div className="-mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Camera views">
            {presets.map((p) => (
              <button key={p.id} className="chip shrink-0 bg-background/60" data-active={view === p.id} onClick={() => selectPreset(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 gap-1.5">
            {mode === "exterior" && (
              <button className="chip bg-background/60" data-active={autoRotate} onClick={() => setAutoRotate((a) => !a)} aria-pressed={autoRotate}>
                Auto-rotate
              </button>
            )}
            <button className="chip bg-background/60" onClick={resetView}>
              Reset view
            </button>
          </div>
        </div>
        {compact && (
          <div className="mt-3 flex justify-end">
            <Link to="/vehicle/$slug/explore" params={{ slug: vehicle.slug }} search={{}} className="chip" data-active="true">
              Open full showroom →
            </Link>
          </div>
        )}
      </div>

      {/* Configure panel */}
      {!compact && (
        <>
          <button
            className="chip absolute right-4 top-28 bg-background/70 md:right-6 md:top-32"
            onClick={() => setPanel((p) => (p === "configure" ? "none" : "configure"))}
            aria-expanded={panel === "configure"}
          >
            {panel === "configure" ? "Hide configurator" : "Configure"}
          </button>
          {panel === "configure" && (
            <aside className="glass-panel absolute z-30 bottom-28 right-4 top-40 w-[calc(100%-2rem)] max-w-sm overflow-y-auto p-5 md:right-6 md:top-44">
              <p className="eyebrow">Configure your vehicle</p>
              <p className="mt-2 text-xs text-muted-foreground">Demonstration finishes — not a statement of factory availability.</p>
              <PaintConfigurator vehicle={vehicle} config={config} supported={supported} onChange={setConfig} />
              <InteriorMaterialConfigurator vehicle={vehicle} config={config} supported={supported} onChange={setConfig} />
              <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">
                <button className="chip" onClick={() => setConfig({ zones: {} })}>Reset configuration</button>
                {onShare && <button className="chip" onClick={() => onShare(state)}>Share</button>}
                {onEnquire && <button className="chip" data-active="true" onClick={() => onEnquire(state)}>Enquire about this vehicle</button>}
              </div>
            </aside>
          )}
        </>
      )}

      {active && (
        <VehicleFeaturePanel
          hotspot={active}
          related={allHotspots.find((h) => h.id === active.related)}
          onRelated={onHotspot}
          onClose={resetView}
        />
      )}
    </div>
  );
}

export default VehicleViewer;
