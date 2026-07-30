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

export function normaliseObjectIcon(value?: string | null): ObjectIconKey {
  const key = String(value ?? "").toLowerCase();
  return OBJECT_ICON_OPTIONS.some((option) => option.key === key) ? (key as ObjectIconKey) : "car";
}

export function objectIconLabel(value?: string | null) {
  const key = normaliseObjectIcon(value);
  return OBJECT_ICON_OPTIONS.find((option) => option.key === key)?.label ?? "Car";
}

export function objectIconSvg(value: string | null | undefined, color = "#EF334A") {
  const key = normaliseObjectIcon(value);
  const accent = color;
  const dark = "#1f2937";
  const glass = "#dbeafe";
  const suffix = `${key}${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  const shadow = `<ellipse cx="37" cy="63" rx="20" ry="5" fill="#0f172a" opacity=".22"/>`;
  const wheel = (x: number, y = 52, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${dark}"/><circle cx="${x}" cy="${y}" r="${Math.max(2, r - 3)}" fill="#94a3b8"/>`;
  const gradients = `
    <defs>
      <linearGradient id="assetGrad${suffix}" x1="12" y1="10" x2="62" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ff918b"/>
        <stop offset="1" stop-color="${accent}"/>
      </linearGradient>
      <linearGradient id="assetSide${suffix}" x1="15" y1="34" x2="59" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${accent}"/>
        <stop offset="1" stop-color="#b91c1c"/>
      </linearGradient>
    </defs>`;

  const body = {
    car: `
      <path d="M18 36L25 24H48L56 36L60 48H14L18 36Z" fill="url(#assetGrad${suffix})"/>
      <path d="M24 27H47L53 36H18L24 27Z" fill="${glass}" opacity=".88"/>
      <path d="M19 37H55L58 48H16L19 37Z" fill="url(#assetSide${suffix})"/>
      ${wheel(24)}${wheel(50)}
      <path d="M27 28L24 36M45 28L48 36" stroke="${dark}" stroke-width="2" opacity=".45"/>
    `,
    van: `
      <path d="M13 28C13 23 17 20 22 20H47C53 20 59 27 60 34L62 48H12L13 28Z" fill="url(#assetGrad${suffix})"/>
      <path d="M20 25H35V36H17V30C17 27 18 25 20 25Z" fill="${glass}" opacity=".88"/>
      <path d="M38 25H48C52 25 56 30 57 36H38V25Z" fill="${glass}" opacity=".82"/>
      <path d="M14 38H61V49H12L14 38Z" fill="url(#assetSide${suffix})"/>
      ${wheel(24)}${wheel(51)}
    `,
    truck: `
      <path d="M10 24H43V48H10V24Z" fill="url(#assetGrad${suffix})"/>
      <path d="M43 31H55L63 40V48H43V31Z" fill="url(#assetSide${suffix})"/>
      <path d="M48 34H55L59 40H48V34Z" fill="${glass}" opacity=".85"/>
      <path d="M14 28H39V38H14V28Z" fill="#fff" opacity=".16"/>
      ${wheel(22)}${wheel(48)}${wheel(58,52,4)}
    `,
    bus: `
      <path d="M10 22C10 18 14 16 19 16H55C60 16 64 20 64 25V48H10V22Z" fill="url(#assetGrad${suffix})"/>
      <path d="M15 23H58V34H15V23Z" fill="${glass}" opacity=".86"/>
      <path d="M19 23V34M29 23V34M39 23V34M49 23V34" stroke="${dark}" stroke-width="2" opacity=".32"/>
      <path d="M10 38H64V49H10V38Z" fill="url(#assetSide${suffix})"/>
      ${wheel(23)}${wheel(51)}
    `,
    pickup: `
      <path d="M13 32L22 23H43L49 34H61V48H13V32Z" fill="url(#assetGrad${suffix})"/>
      <path d="M24 26H42L46 34H20L24 26Z" fill="${glass}" opacity=".86"/>
      <path d="M49 34H61V43H49V34Z" fill="#111827" opacity=".18"/>
      <path d="M13 39H61V49H13V39Z" fill="url(#assetSide${suffix})"/>
      ${wheel(24)}${wheel(52)}
    `,
    motorcycle: `
      <path d="M22 48C25 39 32 34 41 35L49 42" stroke="url(#assetGrad${suffix})" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M38 33L45 24L52 25" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 36L39 30L46 37" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
      ${wheel(20,51,8)}${wheel(54,51,8)}
      <path d="M42 28L35 27" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>
    `,
    trailer: `
      <path d="M8 27H46V48H8V27Z" fill="url(#assetGrad${suffix})"/>
      <path d="M46 36H61V48H46V36Z" fill="url(#assetSide${suffix})"/>
      <path d="M13 32H40M13 38H40" stroke="#fff" stroke-width="3" opacity=".2"/>
      ${wheel(20)}${wheel(41)}${wheel(56,52,4)}
    `,
    container: `
      <path d="M9 22H61V49H9V22Z" fill="url(#assetGrad${suffix})"/>
      <path d="M9 39H61V49H9V39Z" fill="url(#assetSide${suffix})"/>
      <path d="M16 24V48M25 24V48M34 24V48M43 24V48M52 24V48" stroke="#fff" stroke-width="2" opacity=".22"/>
      ${wheel(22)}${wheel(49)}
    `,
    ambulance: `
      <path d="M12 29C12 24 16 21 21 21H44C51 21 58 28 60 36L62 48H12V29Z" fill="#f8fafc"/>
      <path d="M43 30H56L61 39V48H43V30Z" fill="url(#assetGrad${suffix})"/>
      <path d="M18 26H38V36H16V30C16 28 17 26 18 26Z" fill="${glass}" opacity=".9"/>
      <path d="M25 39V30M20 34H30" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      ${wheel(24)}${wheel(52)}
    `,
    tractor: `
      <path d="M28 26H46L51 41H24L28 26Z" fill="url(#assetGrad${suffix})"/>
      <path d="M32 20H44V28H32V20Z" fill="${glass}" opacity=".82"/>
      <path d="M12 43H26L31 48H12V43Z" fill="${accent}"/>
      ${wheel(22,51,9)}${wheel(51,51,6)}
    `,
    equipment: `
      <path d="M13 34H43V49H13V34Z" fill="url(#assetGrad${suffix})"/>
      <path d="M37 25H50L56 34H37V25Z" fill="${glass}" opacity=".82"/>
      <path d="M45 34L61 24" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
      <path d="M58 21L65 25L61 32" stroke="${dark}" stroke-width="4" stroke-linecap="round" fill="none"/>
      ${wheel(24)}${wheel(44)}
    `,
  }[key];

  return `<svg width="74" height="74" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">${gradients}${shadow}${body}</svg>`;
}
