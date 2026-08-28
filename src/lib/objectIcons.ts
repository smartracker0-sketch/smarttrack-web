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

const TRACKER_ICON = "/toyota-top-down-tracker-icon.svg";

const OBJECT_ICON_IMAGES: Record<ObjectIconKey, string> = {
  car: TRACKER_ICON,
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
  return `<img src="${TRACKER_ICON}" alt="${objectIconLabel(key)}" width="54" height="54" style="display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 1px ${color});" />`;
}
