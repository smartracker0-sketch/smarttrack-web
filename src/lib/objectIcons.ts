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
  const suffix = `${key}${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  const dark = "#202733";
  const tire = "#111827";
  const rim = "#cbd5e1";
  const glass = "#d8e8f3";
  const chrome = "#e5e7eb";
  const black = "#0f172a";
  const shadow = `<ellipse cx="60" cy="68" rx="44" ry="6" fill="#0f172a" opacity=".18"/>`;
  const defs = `
    <defs>
      <linearGradient id="paint${suffix}" x1="16" y1="14" x2="102" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset=".48" stop-color="#f4f7fb"/>
        <stop offset="1" stop-color="${accent}"/>
      </linearGradient>
      <linearGradient id="blue${suffix}" x1="10" y1="12" x2="105" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#67d5ff"/>
        <stop offset="1" stop-color="#0b65b9"/>
      </linearGradient>
      <linearGradient id="metal${suffix}" x1="12" y1="20" x2="105" y2="67" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="1" stop-color="#b7c0c8"/>
      </linearGradient>
      <linearGradient id="yellow${suffix}" x1="18" y1="10" x2="103" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ffd64d"/>
        <stop offset="1" stop-color="#e59b05"/>
      </linearGradient>
      <linearGradient id="green${suffix}" x1="14" y1="14" x2="96" y2="67" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#50b86f"/>
        <stop offset="1" stop-color="#15723a"/>
      </linearGradient>
    </defs>`;
  const wheel = (cx: number, cy = 58, r = 8) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${tire}"/><circle cx="${cx}" cy="${cy}" r="${Math.max(3, r - 4)}" fill="${rim}"/><circle cx="${cx}" cy="${cy}" r="${Math.max(1.5, r - 6)}" fill="#64748b"/>`;
  const panelLines = (x1: number, y1: number, x2: number, y2: number) =>
    `<path d="M${x1} ${y1}H${x2}M${x1} ${y2}H${x2}" stroke="#0f172a" stroke-width="1.4" opacity=".13"/>`;
  const headlight = (x: number, y: number) => `<path d="M${x} ${y}l7 1.6-1.7 3.2h-6z" fill="#fef3c7" opacity=".95"/>`;

  const body: Record<ObjectIconKey, string> = {
    car: `
      <path d="M20 50c2-8 8-17 16-20l35-4c8 1 18 12 22 22l7 2c3 1 5 4 5 7v5H15v-5c0-4 2-6 5-7z" fill="url(#paint${suffix})" stroke="#cfd8e3" stroke-width="1.3"/>
      <path d="M35 32h18v14H25c2-6 5-11 10-14zM57 31h12c6 1 12 8 16 15H57z" fill="${glass}" stroke="#b6c9d7" stroke-width="1"/>
      <path d="M16 54h88v8H16z" fill="${chrome}" opacity=".55"/>
      <path d="M55 32v14M32 47h51" stroke="${dark}" stroke-width="1.2" opacity=".22"/>
      ${headlight(93, 51)}${wheel(33, 61)}${wheel(84, 61)}
    `,
    van: `
      <path d="M18 28c0-5 4-9 9-9h48c10 0 19 10 21 22l4 20H17z" fill="url(#paint${suffix})" stroke="#cfd8e3" stroke-width="1.3"/>
      <path d="M27 26h22v19H23V31c0-3 2-5 4-5zM54 26h22c7 2 12 9 14 19H54z" fill="${glass}" stroke="#b6c9d7" stroke-width="1"/>
      <path d="M17 50h83v11H17z" fill="${chrome}" opacity=".45"/>
      <path d="M52 26v34M77 45h19" stroke="${dark}" stroke-width="1.3" opacity=".2"/>
      ${headlight(91, 48)}${wheel(34, 61)}${wheel(82, 61)}
    `,
    truck: `
      <path d="M9 27h61v31H9z" fill="url(#metal${suffix})" stroke="#b9c3cc" stroke-width="1.3"/>
      ${panelLines(15, 34, 64, 45)}
      <path d="M70 37h18l15 13v8H70z" fill="url(#paint${suffix})" stroke="#c8d2dc" stroke-width="1.3"/>
      <path d="M76 41h12l8 8H76z" fill="${glass}" stroke="#afc4d4" stroke-width="1"/>
      <path d="M9 58h95v4H9z" fill="${dark}" opacity=".18"/>
      ${headlight(97, 51)}${wheel(26, 62)}${wheel(71, 62)}${wheel(94, 62, 7)}
    `,
    bus: `
      <path d="M11 26c0-7 6-11 14-11h68c9 0 15 6 15 15v31H11z" fill="url(#blue${suffix})" stroke="#0c5a9a" stroke-width="1.3"/>
      <path d="M18 24h82v21H18z" fill="${glass}" stroke="#95b6cc" stroke-width="1"/>
      <path d="M30 24v21M43 24v21M56 24v21M69 24v21M82 24v21" stroke="${dark}" stroke-width="1.5" opacity=".24"/>
      <path d="M11 49h97v12H11z" fill="#0b4d8e" opacity=".5"/>
      ${headlight(99, 52)}${wheel(31, 62)}${wheel(88, 62)}
    `,
    pickup: `
      <path d="M15 44l13-17h33l11 17h33v17H15z" fill="url(#paint${suffix})" stroke="#cfd8e3" stroke-width="1.3"/>
      <path d="M31 31h27l8 13H22z" fill="${glass}" stroke="#afc4d4" stroke-width="1"/>
      <path d="M73 44h29v10H73z" fill="${black}" opacity=".12"/>
      <path d="M15 54h90v8H15z" fill="${chrome}" opacity=".48"/>
      <path d="M59 31v30" stroke="${dark}" stroke-width="1.2" opacity=".22"/>
      ${headlight(96, 49)}${wheel(35, 62)}${wheel(87, 62)}
    `,
    motorcycle: `
      <path d="M27 58c7-18 21-25 38-21l16 13" stroke="${dark}" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M42 42l17-13h18l-8 13z" fill="url(#paint${suffix})" stroke="#222" stroke-width="1"/>
      <path d="M65 35l9-15 13 2" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>
      <path d="M54 40l13 11H40" stroke="${accent}" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M72 25l-8-1" stroke="${dark}" stroke-width="2.5" stroke-linecap="round"/>
      ${wheel(25, 59, 12)}${wheel(88, 59, 12)}
    `,
    trailer: `
      <path d="M11 32h78v27H11z" fill="url(#metal${suffix})" stroke="#87919b" stroke-width="1.4"/>
      <path d="M89 43h17v16H89z" fill="#d1d5db" stroke="#8b949e" stroke-width="1.2"/>
      <path d="M13 34h74v8H13z" fill="#ffffff" opacity=".28"/>
      <path d="M21 32v27M42 32v27M63 32v27" stroke="#1f2937" stroke-width="1.3" opacity=".18"/>
      <path d="M104 43h9M113 43l3 7" stroke="${dark}" stroke-width="2" stroke-linecap="round"/>
      ${wheel(38, 62)}${wheel(78, 62)}${wheel(101, 62, 7)}
    `,
    container: `
      <path d="M10 24h96v38H10z" fill="url(#blue${suffix})" stroke="#084d83" stroke-width="1.4"/>
      <path d="M14 28h88v30H14z" fill="#0e73bd" opacity=".36"/>
      <path d="M20 25v36M32 25v36M44 25v36M56 25v36M68 25v36M80 25v36M92 25v36" stroke="#ffffff" stroke-width="1.4" opacity=".28"/>
      <path d="M10 50h96v12H10z" fill="#084d83" opacity=".35"/>
      <circle cx="20" cy="43" r="1.8" fill="#cbd5e1"/><circle cx="97" cy="43" r="1.8" fill="#cbd5e1"/>
      ${wheel(35, 64, 5)}${wheel(83, 64, 5)}
    `,
    ambulance: `
      <path d="M17 27c0-5 4-8 9-8h43c12 0 22 10 26 23l5 19H17z" fill="#ffffff" stroke="#cfd8e3" stroke-width="1.3"/>
      <path d="M26 26h31v18H22V31c0-3 2-5 4-5zM63 26h11c8 3 14 10 17 18H63z" fill="${glass}" stroke="#b6c9d7" stroke-width="1"/>
      <path d="M18 45h79v8H18z" fill="#ef334a"/>
      <path d="M41 40V29M35 34h12" stroke="#2563eb" stroke-width="4" stroke-linecap="round"/>
      <rect x="72" y="14" width="8" height="5" fill="#ef4444" rx="1"/><rect x="83" y="14" width="8" height="5" fill="#2563eb" rx="1"/>
      ${headlight(91, 50)}${wheel(35, 62)}${wheel(83, 62)}
    `,
    tractor: `
      <path d="M38 31h29l8 22H34z" fill="url(#green${suffix})" stroke="#14532d" stroke-width="1.3"/>
      <path d="M44 18h24v18H44z" fill="${glass}" stroke="#14532d" stroke-width="1.4"/>
      <path d="M22 49h23l7 12H19z" fill="#2f8c49" stroke="#14532d" stroke-width="1.2"/>
      <path d="M72 50h17v11H72z" fill="#223022"/>
      <path d="M48 22h15M44 36h28" stroke="${dark}" stroke-width="1.2" opacity=".25"/>
      ${wheel(31, 62, 15)}${wheel(80, 63, 10)}
    `,
    equipment: `
      <path d="M17 46h44v16H17z" fill="url(#yellow${suffix})" stroke="#b77905" stroke-width="1.3"/>
      <path d="M55 30h19l10 16H55z" fill="url(#yellow${suffix})" stroke="#b77905" stroke-width="1.3"/>
      <path d="M61 34h12l6 10H61z" fill="${glass}" stroke="#b6c9d7" stroke-width="1"/>
      <path d="M69 34l21-19 12 5-12 26" stroke="#eab308" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M99 45l10 6-11 8h-15z" fill="${dark}"/>
      <path d="M18 62h44" stroke="${dark}" stroke-width="7" stroke-linecap="round"/>
      ${wheel(29, 62, 6)}${wheel(51, 62, 6)}
    `,
  };

  return `<svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">${defs}${shadow}${body[key]}</svg>`;
}
