export const OBJECT_ICON_OPTIONS = [
  { key: "car", label: "Car" },
  { key: "van", label: "Van" },
  { key: "truck", label: "Truck" },
  { key: "bus", label: "Bus" },
  { key: "pickup", label: "Pickup" },
  { key: "motorcycle", label: "Motorcycle" },
  { key: "keke", label: "Keke Napep" },
  { key: "trailer", label: "Trailer" },
  { key: "container", label: "Container" },
  { key: "ambulance", label: "Ambulance" },
  { key: "tractor", label: "Tractor" },
  { key: "equipment", label: "Equipment" },
] as const;

export type ObjectIconKey = (typeof OBJECT_ICON_OPTIONS)[number]["key"];

const TRACKER_ICON = "/toyota-top-down-tracker-icon.svg";

const OBJECT_ICON_IMAGES: Record<ObjectIconKey, string> = {
  car: TRACKER_ICON,
  van: "/map-icons/van.webp",
  truck: "/map-icons/truck.webp",
  bus: "/map-icons/bus.webp",
  pickup: "/map-icons/pickup.webp",
  motorcycle: "/map-icons/motorcycle.webp",
  keke: "/map-icons/keke.webp",
  trailer: "/map-icons/trailer.webp",
  container: "/map-icons/container.webp",
  ambulance: "/map-icons/ambulance.webp",
  tractor: "/map-icons/equipment.webp",
  equipment: "/map-icons/equipment.webp",
};

const OBJECT_ICON_ALIASES: Record<string, ObjectIconKey> = {
  bike: "motorcycle",
  lorry: "truck",
  tricycle: "keke",
  "three wheeler": "keke",
  "three-wheeler": "keke",
  "keke napep": "keke",
  "pickup truck": "pickup",
  "heavy equipment": "equipment",
  "tractor equipment": "equipment",
};

export function normaliseObjectIcon(value?: string | null): ObjectIconKey {
  const key = String(value ?? "").trim().toLowerCase();
  if (OBJECT_ICON_ALIASES[key]) return OBJECT_ICON_ALIASES[key];
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
  return `<img src="${objectIconImage(key)}" alt="${objectIconLabel(key)}" width="54" height="54" style="display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 1px ${color});" />`;
}
