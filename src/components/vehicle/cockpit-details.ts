import * as THREE from "three";

/** Enhance the existing Vireo meshes, leaving the cached source GLB untouched. */
export function refineVireoCockpit(scene: THREE.Object3D) {
  const palette = getComputedStyle(document.documentElement);
  const color = (name: string) => palette.getPropertyValue(name).trim();
  const ink = color("--cockpit-ink");
  const silver = color("--cockpit-silver");
  const gold = color("--cockpit-gold");
  const red = color("--cockpit-red");
  const muted = color("--cockpit-muted");
  const leatherColor = color("--cockpit-leather");
  const metalColor = color("--cockpit-metal");
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = ink;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = muted;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 468); ctx.lineTo(290, 44); ctx.lineTo(1740, 44);
  ctx.lineTo(1978, 468); ctx.closePath(); ctx.stroke();

  const text = (value: string, x: number, y: number, size: number, fill = silver) => {
    ctx.fillStyle = fill;
    ctx.font = `500 ${size}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(value, x, y);
  };
  const gauge = (cx: number, title: string, max: number, step: number) => {
    const cy = 266, radius = 173;
    const angle = (v: number) => (135 + v / max * 270) * Math.PI / 180;
    ctx.lineWidth = 7; ctx.strokeStyle = muted;
    ctx.beginPath(); ctx.arc(cx, cy, radius, angle(0), angle(max)); ctx.stroke();
    for (let v = 0; v <= max; v += step / 5) {
      const major = Math.abs(v / step - Math.round(v / step)) < 0.001;
      const a = angle(v), r = radius - (major ? 23 : 12);
      ctx.strokeStyle = v >= max * 0.8 ? red : silver;
      ctx.lineWidth = major ? 4 : 2;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.lineTo(cx + Math.cos(a) * (radius - 4), cy + Math.sin(a) * (radius - 4)); ctx.stroke();
      if (major) text(String(v), cx + Math.cos(a) * (radius - 47), cy + Math.sin(a) * (radius - 47) + 8, 23);
    }
    const a = angle(0);
    ctx.strokeStyle = red; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(cx - Math.cos(a) * 15, cy - Math.sin(a) * 15);
    ctx.lineTo(cx + Math.cos(a) * 127, cy + Math.sin(a) * 127); ctx.stroke();
    ctx.fillStyle = silver; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
    text(title, cx, cy + 76, 20, gold);
  };
  gauge(575, "km/h", 280, 40);
  gauge(1473, "rpm × 1000", 8, 1);
  text("VIREO", 1024, 110, 27, gold);
  text("0", 1024, 285, 142);
  text("km/h", 1024, 323, 23);
  text("P", 1024, 394, 39, gold);
  text("FUEL   ━━━━━━━━", 535, 454, 19);
  text("ENGINE   ━━━━━━", 1490, 454, 19);
  const display = new THREE.CanvasTexture(canvas);
  display.colorSpace = THREE.SRGBColorSpace;
  display.flipY = false;
  display.anisotropy = 4;

  const leatherCanvas = document.createElement("canvas");
  leatherCanvas.width = leatherCanvas.height = 256;
  const grain = leatherCanvas.getContext("2d");
  if (grain) {
    grain.fillStyle = muted; grain.fillRect(0, 0, 256, 256);
    grain.fillStyle = ink;
    for (let y = 4; y < 256; y += 8) for (let x = 4; x < 256; x += 8) {
      grain.beginPath(); grain.arc(x + (y % 16 ? 0 : 4), y, 1.3, 0, Math.PI * 2); grain.fill();
    }
  }
  const leather = new THREE.CanvasTexture(leatherCanvas);
  leather.wrapS = leather.wrapT = THREE.RepeatWrapping;
  leather.repeat.set(6, 6);
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const steering = object.name.startsWith("InteriorSteeringWheel");
    if (!steering && object.name !== "InteriorSteeringDash") return;
    const refine = (source: THREE.Material) => {
      if (!(source instanceof THREE.MeshStandardMaterial)) return source;
      const mat = source.clone();
      if (source.name === "Dashboard") {
        mat.map = display; mat.emissiveMap = display;
        mat.color.setRGB(1, 1, 1); mat.emissive.setRGB(1, 1, 1);
        mat.emissiveIntensity = 0.75; mat.roughness = 0.45; mat.metalness = 0;
        mat.toneMapped = false;
      } else if (steering) {
        // Keep the original sculpted wheel; remove its oversized hexagonal pattern.
        mat.map = null; mat.normalMap = null; mat.roughnessMap = null;
        mat.metalnessMap = null; mat.aoMap = null;
        const metal = source.name === "Hardware";
        mat.color.set(metal ? metalColor : leatherColor);
        mat.metalness = metal ? 0.8 : 0.05;
        mat.roughness = metal ? 0.3 : 0.72;
        mat.bumpMap = metal ? null : leather; mat.bumpScale = 0.0006;
      }
      return mat;
    };
    object.material = Array.isArray(object.material) ? object.material.map(refine) : refine(object.material);
  });
}