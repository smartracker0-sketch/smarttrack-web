const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const DEFAULT_ORIGINS = ["https://smarttracker.cloud", "https://www.smarttracker.cloud"];

export function exactOrigin(value: string): string | null {
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.hostname.includes('*') || parsed.origin !== value) return null;
    return parsed.origin;
  } catch { return null; }
}

export function allowedOrigins(configured: string | undefined, development: boolean): Set<string> {
  const values = configured ? configured.split(',').map(value => value.trim()) : DEFAULT_ORIGINS;
  if (values.some(value => !exactOrigin(value))) throw new Error('SMARTTRACKER_ALLOWED_ORIGINS must contain exact HTTP(S) origins');
  return new Set([...values, ...(development ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : [])]);
}

export function rejectCrossOriginWrite(request: Request, origins: Set<string>): boolean {
  if (!WRITE_METHODS.has(request.method.toUpperCase())) return false;
  const origin = request.headers.get('origin');
  if (!origin || !origins.has(origin) || !exactOrigin(origin)) return true;
  const target = new URL(request.url);
  const host = request.headers.get('host') || target.host;
  // Each BFF is same-origin. An allow-listed sibling cannot write to another host's cookies.
  if (new URL(origin).host !== host || request.headers.get('sec-fetch-site') === 'cross-site') return true;
  return false;
}

export function browserSecurityHeaders(nonce: string, production: boolean, apiOrigin?: string): Record<string,string> {
  if (!/^[A-Za-z0-9+/=]+$/.test(nonce)) throw new Error('Invalid CSP nonce');
  const api = apiOrigin && exactOrigin(apiOrigin) ? apiOrigin : '';
  const socket = api ? api.replace(/^http/, 'ws') : '';
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${production ? '' : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://api.mapbox.com https://*.tiles.mapbox.com https://server.arcgisonline.com ${api}`,
    "font-src 'self' data:",
    `connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com https://server.arcgisonline.com ${api} ${socket}${production ? '' : ' ws://localhost:3000 ws://127.0.0.1:3000'}`,
    "worker-src 'self' blob:", "media-src 'self' blob:", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
    ...(production ? ['upgrade-insecure-requests'] : []),
  ].join('; ').replace(/\s+/g, ' ').trim();
  return {
    'Content-Security-Policy': policy,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(self)',
    ...(production ? {'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'} : {}),
  };
}
