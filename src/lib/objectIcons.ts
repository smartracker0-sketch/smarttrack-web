export const OBJECT_ICON_OPTIONS = [
  { key: "car", label: "Car" },
  { key: "van", label: "Van" },
  { key: "truck", label: "Truck" },
  { key: "bus", label: "Bus" },
  { key: "pickup", label: "Pickup" },
  { key: "motorcycle", label: "Motorcycle" },
  { key: "trailer", label: "Trailer" },
  { key: "container", label: "Container" },
  { key: "ambulance", label: "Ambulance" },
  { key: "tractor", label: "Tractor" },
  { key: "equipment", label: "Equipment" },
] as const;

export type ObjectIconKey = (typeof OBJECT_ICON_OPTIONS)[number]["key"];

const OBJECT_ICON_IMAGES: Record<ObjectIconKey, string> = {
  car: "/object%20icon/car.png",
  van: "/object%20icon/van.png",
  truck: "/object%20icon/truck.png",
  bus: "/object%20icon/bus.png",
  pickup: "/object%20icon/pickup.png",
  motorcycle: "/object%20icon/motorcycle.png",
  trailer: "/object%20icon/trailer.png",
  container: "/object%20icon/container%2C.png",
  ambulance: "/object%20icon/ambulance.png",
  tractor: "/object%20icon/tractor.png",
  equipment: "/object%20icon/equipment..png",
};

export function normaliseObjectIcon(value?: string | null): ObjectIconKey {
  const key = String(value ?? "").toLowerCase();
  return OBJECT_ICON_OPTIONS.some((option) => option.key === key) ? (key as ObjectIconKey) : "car";
}

export function objectIconLabel(value?: string | null) {
  const key = normaliseObjectIcon(value);
  return OBJECT_ICON_OPTIONS.find((option) => option.key === key)?.label ?? "Car";
}

export function objectIconImage(value?: string | null) {
  return OBJECT_ICON_IMAGES[normaliseObjectIcon(value)];
}

export function objectIconSvg(value: string | null | undefined, color = "#EF334A") {
  const key = normaliseObjectIcon(value);
  const glyph = objectIconGlyph(key);

  return `
    <svg viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-label="${objectIconLabel(key)}" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible">
      <path d="M32 2 40 15.5A23 23 0 1 1 24 15.5Z" fill="${color}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="32" cy="35" r="17.5" fill="rgba(0,0,0,.08)"/>
      <g transform="translate(20 23)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${glyph}
      </g>
      <circle cx="32" cy="35" r="22.5" fill="none" stroke="rgba(15,23,42,.12)" stroke-width="1"/>
    </svg>`;
}

function objectIconGlyph(key: ObjectIconKey) {
  switch (key) {
    case "motorcycle":
      return `<circle cx="5" cy="16" r="3"/><circle cx="19" cy="16" r="3"/><path d="m8 16 4-7 3 7m-7 0h7l4-6h-4m-3-1-2-3h4"/>`;
    case "bus":
      return `<rect x="4" y="2.5" width="16" height="17" rx="3"/><path d="M7 6h10v7H7zM8 17h.01M16 17h.01"/><circle cx="8" cy="20" r="1.5" fill="#fff"/><circle cx="16" cy="20" r="1.5" fill="#fff"/>`;
    case "truck":
      return `<path d="M2 7h12v10H2zM14 10h4l4 4v3h-8z"/><circle cx="7" cy="18" r="2" fill="#fff"/><circle cx="18" cy="18" r="2" fill="#fff"/>`;
    case "pickup":
      return `<path d="M2 9h9l3 4h8v5H2zM5 9l2-4h6l3 8"/><circle cx="7" cy="18" r="2" fill="#fff"/><circle cx="18" cy="18" r="2" fill="#fff"/>`;
    case "van":
      return `<path d="M3 5h13l5 7v6H3zM16 6v7h5"/><circle cx="7" cy="18" r="2" fill="#fff"/><circle cx="18" cy="18" r="2" fill="#fff"/>`;
    case "trailer":
      return `<path d="M2 6h17v10H2zM19 13h3M4 16v2M17 16v2"/><circle cx="6" cy="19" r="2" fill="#fff"/><circle cx="16" cy="19" r="2" fill="#fff"/>`;
    case "container":
      return `<rect x="2.5" y="4" width="19" height="16" rx="1"/><path d="M7 4v16M12 4v16M17 4v16"/>`;
    case "ambulance":
      return `<path d="M2 7h13l6 6v6H2zM15 8v6h6"/><path d="M8.5 9v6M5.5 12h6" stroke-width="3"/><circle cx="6" cy="19" r="2" fill="#fff"/><circle cx="18" cy="19" r="2" fill="#fff"/>`;
    case "tractor":
      return `<circle cx="7" cy="17" r="4"/><circle cx="19" cy="18" r="2.5"/><path d="M7 13V6h7l3 8h3M9 6V3h5M11 13h6"/>`;
    case "equipment":
      return `<path d="M3 19h14M5 19V9h7l3 5v5M12 9l3-5h3v10M18 4l3 2-3 3"/><circle cx="8" cy="19" r="2" fill="#fff"/><circle cx="16" cy="19" r="2" fill="#fff"/>`;
    case "car":
    default:
      return `<path d="m4 14 2-6h12l2 6v5H4zM7 8l2-4h6l2 4"/><circle cx="8" cy="18" r="2" fill="#fff"/><circle cx="16" cy="18" r="2" fill="#fff"/>`;
  }
}
