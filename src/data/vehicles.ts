/**
 * Vehicle asset manifest. All AUREUM vehicles and figures here are fictional
 * demonstration data. 3D models are openly licensed sample assets (see `model.credit`).
 *
 * Coordinate convention (after normalisation in VehicleModel):
 * car length along Z, front at +Z, ground at y=0, centred on X/Z.
 * Hotspot / camera positions are in metres in that frame.
 */
import hero from "@/assets/hero.jpg";
import solenneInterior from "@/assets/solenne-interior.jpg";
import vireoInterior from "@/assets/vireo-interior.jpg";
import detailWheel from "@/assets/detail-wheel.jpg";

export type Vec3 = [number, number, number];

export interface CameraPreset {
  id: string;
  label: string;
  position: Vec3;
  target: Vec3;
}

export interface Hotspot {
  id: string;
  title: string;
  description: string;
  position: Vec3;
  camera: { position: Vec3; target: Vec3 };
  specs?: { label: string; value: string }[];
  related?: string;
}

export interface MaterialOption {
  id: string;
  name: string;
  color: string;
}

export interface MaterialZone {
  id: string;
  label: string;
  /** glTF material names this zone controls. Zone is hidden if none exist in the model. */
  materials: string[];
  options: MaterialOption[];
  paint?: boolean;
}

export interface GalleryImage {
  src: string;
  alt: string;
  kind: "exterior" | "interior" | "detail";
}

export interface SpecGroup {
  id: "overview" | "performance" | "dimensions" | "exterior" | "interior" | "technology" | "safety";
  label: string;
  intro?: string;
  rows: { label: string; value?: string }[];
}

export interface Vehicle {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  price: string;
  summary: string;
  poster: string;
  gallery: GalleryImage[];
  model?: {
    url: string;
    credit: string;
    rotationY: number;
    length: number;
    hasInterior: boolean;
    interiorNote: string;
  };
  exteriorPresets: CameraPreset[];
  interiorPresets: CameraPreset[];
  exteriorHotspots: Hotspot[];
  interiorHotspots: Hotspot[];
  paint: MaterialZone;
  exteriorZones: MaterialZone[];
  interiorZones: MaterialZone[];
  specs: SpecGroup[];
}

const DEMO_PAINTS: MaterialOption[] = [
  { id: "obsidian", name: "Obsidian Black", color: "#0d0d0f" },
  { id: "platinum", name: "Platinum Silver", color: "#a9adb2" },
  { id: "pearl", name: "Pearl White", color: "#e8e6e1" },
  { id: "racing-green", name: "British Racing Green", color: "#0f3324" },
  { id: "burgundy", name: "Deep Burgundy", color: "#4a0f1a" },
  { id: "midnight", name: "Midnight Blue", color: "#121d3a" },
  { id: "champagne", name: "Champagne Metallic", color: "#b39b72" },
];

function exteriorPresets(L: number, H: number): CameraPreset[] {
  const d = L * 1.6;
  const t: Vec3 = [0, H * 0.45, 0];
  return [
    { id: "front", label: "Front", position: [0, H * 0.7, d], target: t },
    { id: "front-34", label: "Front ¾", position: [d * 0.72, H * 0.9, d * 0.72], target: t },
    { id: "side", label: "Side", position: [d, H * 0.6, 0], target: t },
    { id: "rear-34", label: "Rear ¾", position: [-d * 0.72, H * 0.9, -d * 0.72], target: t },
    { id: "rear", label: "Rear", position: [0, H * 0.7, -d], target: t },
    { id: "top", label: "Top", position: [0.01, d * 1.35, 0], target: [0, 0, 0] },
    { id: "wheels", label: "Wheels", position: [L * 0.55, 0.45, L * 0.45], target: [L * 0.22, 0.32, L * 0.3] },
  ];
}

const solenneL = 4.53;
const vireoL = 4.4;

export const vehicles: Vehicle[] = [
  {
    slug: "solenne-gt",
    name: "Solenne GT",
    tagline: "A mid-engined grand tourer, sculpted around its driver.",
    category: "Grand Tourer",
    price: "Price on application",
    summary:
      "The Solenne GT pairs a low, wind-shaped silhouette with a cabin finished in hand-stitched leather and carbon fibre. A demonstration vehicle for the AUREUM private showroom.",
    poster: hero,
    gallery: [
      { src: hero, alt: "Solenne GT in a dark showroom", kind: "exterior" },
      { src: solenneInterior, alt: "Solenne GT leather cabin", kind: "interior" },
      { src: detailWheel, alt: "Alloy wheel detail", kind: "detail" },
    ],
    model: {
      url: "/models/ferrari.glb",
      credit: "3D model: three.js example car asset (demonstration use).",
      rotationY: Math.PI,
      length: solenneL,
      hasInterior: true,
      interiorNote:
        "This model includes seats, steering wheel and dashboard geometry, but not every interior control is modelled in detail.",
    },
    exteriorPresets: exteriorPresets(solenneL, 1.2),
    interiorPresets: [
      { id: "cockpit", label: "Driver's cockpit", position: [0.32, 0.98, -0.55], target: [0.3, 0.8, 0.6] },
      { id: "passenger", label: "Passenger view", position: [-0.32, 0.92, -0.25], target: [0.1, 0.75, 0.5] },
      { id: "front-seats", label: "Front seats", position: [0, 1.05, 0.55], target: [0, 0.6, -0.3] },
      { id: "dashboard", label: "Dashboard close-up", position: [0.05, 0.92, -0.05], target: [0.05, 0.75, 0.6] },
      { id: "console", label: "Centre console", position: [0, 1.0, -0.15], target: [0, 0.45, 0.25] },
      { id: "roof", label: "Roof & cabin", position: [0, 0.75, -0.1], target: [0, 1.15, 0.2] },
    ],
    exteriorHotspots: [
      { id: "headlights", title: "Headlight Signature", description: "Slim projector headlamps set into the sculpted front wings define the Solenne's face.", position: [0.62, 0.72, 2.0], camera: { position: [1.6, 0.9, 3.6], target: [0.5, 0.6, 1.9] } },
      { id: "wheels", title: "Wheel Design", description: "Multi-spoke alloy wheel design with exposed brake hardware. Dimensions not yet provided.", position: [0.95, 0.38, 1.35], camera: { position: [2.3, 0.5, 2.1], target: [0.9, 0.35, 1.35] } },
      { id: "profile", title: "Side Profile", description: "A cab-forward stance and deep side intakes feed air towards the mid-mounted engine bay.", position: [0.98, 0.7, -0.4], camera: { position: [4.6, 0.8, -0.2], target: [0, 0.55, -0.2] } },
      { id: "rear", title: "Rear Design", description: "Twin round taillamps and a sculpted diffuser finish the tail.", position: [0.55, 0.72, -2.15], camera: { position: [1.4, 1.0, -4.3], target: [0, 0.6, -2] } },
    ],
    interiorHotspots: [
      { id: "steering", title: "Steering Wheel", description: "Leather and carbon-fibre rimmed steering wheel with integrated controls, as modelled.", position: [0.33, 0.8, 0.35], camera: { position: [0.33, 0.9, -0.15], target: [0.33, 0.8, 0.4] }, related: "seats" },
      { id: "seats", title: "Seat Materials", description: "Sport seats trimmed in leather. Upholstery colour can be previewed in the interior configurator.", position: [-0.3, 0.7, -0.3], camera: { position: [-0.1, 1.1, 0.5], target: [-0.3, 0.6, -0.35] }, related: "steering" },
    ],
    paint: { id: "body", label: "Body paint", materials: ["Body_Color"], options: DEMO_PAINTS, paint: true },
    exteriorZones: [],
    interiorZones: [
      {
        id: "upholstery",
        label: "Seat upholstery",
        materials: ["Leather_red"],
        options: [
          { id: "rosso", name: "Rosso Leather (original)", color: "#7a1414" },
          { id: "tan", name: "Cognac Tan", color: "#8a5a32" },
          { id: "ivory", name: "Ivory", color: "#d9d1c0" },
          { id: "onyx", name: "Onyx", color: "#141414" },
        ],
      },
    ],
    specs: [
      { id: "overview", label: "Overview", intro: "Demonstration vehicle. All AUREUM models and figures are illustrative.", rows: [{ label: "Body style", value: "Two-door coupé" }, { label: "Seats", value: "2" }, { label: "Layout", value: "Mid-engine (demonstration)" }] },
      { id: "performance", label: "Performance", rows: [{ label: "Engine" }, { label: "Power output" }, { label: "Torque" }, { label: "0–100 km/h" }, { label: "Drivetrain", value: "Rear-wheel drive (demonstration)" }] },
      { id: "dimensions", label: "Dimensions", rows: [{ label: "Length", value: "≈ 4.5 m (model scale)" }, { label: "Width" }, { label: "Height" }, { label: "Wheelbase" }] },
      { id: "exterior", label: "Exterior", rows: [{ label: "Paint", value: "7 demonstration finishes in the configurator" }, { label: "Lighting", value: "Projector headlamps, round taillamps" }, { label: "Wheels", value: "Multi-spoke alloy" }] },
      { id: "interior", label: "Interior", rows: [{ label: "Seating", value: "Two leather sport seats" }, { label: "Trim", value: "Carbon fibre accents" }, { label: "Displays" }] },
      { id: "technology", label: "Technology", rows: [{ label: "Infotainment" }, { label: "Connectivity" }, { label: "Driver assistance" }] },
      { id: "safety", label: "Safety", rows: [{ label: "Official rating" }, { label: "Airbags" }] },
    ],
  },
  {
    slug: "vireo-concept",
    name: "Vireo Concept",
    tagline: "An open-cabin study in light, glass and proportion.",
    category: "Concept",
    price: "Not for sale",
    summary:
      "Vireo is AUREUM's design study for a compact performance car: a full glass canopy, an exposed cabin cage and a fully modelled interior you can step inside.",
    poster: vireoInterior,
    gallery: [
      { src: vireoInterior, alt: "Vireo Concept cabin", kind: "interior" },
      { src: detailWheel, alt: "Wheel detail", kind: "detail" },
    ],
    model: {
      url: "/models/carconcept.glb",
      credit: "3D model: Khronos glTF Sample Assets “CarConcept” (CC BY 4.0).",
      rotationY: 0,
      length: vireoL,
      hasInterior: true,
      interiorNote: "This model includes a full cabin: seats, dashboard, steering wheel, pedals and door trims.",
    },
    exteriorPresets: exteriorPresets(vireoL, 1.3),
    interiorPresets: [
      { id: "cockpit", label: "Driver's cockpit", position: [0.35, 0.95, -0.35], target: [0.35, 0.75, 0.6] },
      { id: "passenger", label: "Passenger view", position: [-0.35, 0.95, -0.35], target: [0.1, 0.7, 0.5] },
      { id: "front-seats", label: "Front seats", position: [0, 1.1, 0.5], target: [0, 0.55, -0.4] },
      { id: "dashboard", label: "Dashboard close-up", position: [0.05, 0.95, 0], target: [0.1, 0.75, 0.7] },
      { id: "door", label: "Door trim", position: [-0.2, 0.9, -0.1], target: [0.75, 0.6, 0] },
      { id: "roof", label: "Roof & canopy", position: [0, 0.8, -0.2], target: [0, 1.3, 0.2] },
    ],
    exteriorHotspots: [
      { id: "headlights", title: "Headlights", description: "Wide light graphic set low in the nose.", position: [0.6, 0.62, 2.05], camera: { position: [1.6, 0.9, 3.7], target: [0.4, 0.55, 1.9] } },
      { id: "wheels", title: "Wheel Design", description: "Two-tone rim design with visible brake discs. Dimensions not yet provided.", position: [1.0, 0.4, 1.35], camera: { position: [2.4, 0.5, 2.2], target: [0.9, 0.35, 1.35] } },
      { id: "canopy", title: "Glass Canopy", description: "A wraparound windscreen and roof panel open the cabin to light.", position: [0, 1.25, 0.3], camera: { position: [2.5, 2.8, 2.5], target: [0, 1, 0] } },
      { id: "rear", title: "Taillights", description: "Full-width taillight panels close the rear.", position: [0.6, 0.85, -2.1], camera: { position: [1.4, 1.1, -4.3], target: [0, 0.7, -2] } },
    ],
    interiorHotspots: [
      { id: "steering", title: "Steering Wheel", description: "Four-spoke wheel with emblem, mounted on an exposed column.", position: [0.35, 0.8, 0.35], camera: { position: [0.35, 0.92, -0.15], target: [0.35, 0.8, 0.4] }, related: "seats" },
      { id: "seats", title: "Seats", description: "Two-tone shell seats on visible frames. Colour can be previewed in the interior configurator.", position: [-0.35, 0.65, -0.35], camera: { position: [-0.1, 1.15, 0.45], target: [-0.35, 0.55, -0.4] }, related: "steering" },
    ],
    paint: { id: "body", label: "Body paint", materials: ["Paint 1 Carmine"], options: DEMO_PAINTS, paint: true },
    exteriorZones: [
      {
        id: "accent",
        label: "Accent panels",
        materials: ["Paint 2 Carmine"],
        options: [
          { id: "original", name: "Carmine (original)", color: "#6b0f17" },
          { id: "graphite", name: "Graphite", color: "#2a2b2e" },
          { id: "gold", name: "Champagne Gold", color: "#b39b72" },
        ],
      },
    ],
    interiorZones: [
      {
        id: "upholstery",
        label: "Seat upholstery",
        materials: ["Interior 3 Carmine"],
        options: [
          { id: "carmine", name: "Carmine (original)", color: "#6b0f17" },
          { id: "graphite", name: "Graphite", color: "#2a2b2e" },
          { id: "pearl", name: "Pearl", color: "#d8d4cc" },
        ],
      },
    ],
    specs: [
      { id: "overview", label: "Overview", intro: "Design study — not a production vehicle. Figures are illustrative.", rows: [{ label: "Body style", value: "Two-seat open-cabin concept" }, { label: "Seats", value: "2" }] },
      { id: "performance", label: "Performance", rows: [{ label: "Powertrain" }, { label: "Power output" }, { label: "0–100 km/h" }] },
      { id: "dimensions", label: "Dimensions", rows: [{ label: "Length", value: "≈ 4.4 m (model scale)" }, { label: "Width" }, { label: "Height" }] },
      { id: "exterior", label: "Exterior", rows: [{ label: "Paint", value: "7 demonstration finishes + accent panels" }, { label: "Glass", value: "Wraparound canopy" }] },
      { id: "interior", label: "Interior", rows: [{ label: "Seating", value: "Two shell seats" }, { label: "Materials", value: "Two-tone upholstery, exposed cage" }] },
      { id: "technology", label: "Technology", rows: [{ label: "Infotainment" }, { label: "Driver assistance" }] },
      { id: "safety", label: "Safety", rows: [{ label: "Official rating" }] },
    ],
  },
];

export function getVehicle(slug: string) {
  return vehicles.find((v) => v.slug === slug);
}
