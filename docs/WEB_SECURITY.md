# Web session and request security

The canonical request boundary is `src/proxy.ts`; both older middleware files are removed. API state-changing requests require an exact configured Origin matching the request Host and reject cross-site Fetch Metadata. Missing/opaque origins are rejected. Native/mobile API clients should use the authenticated backend directly, rather than this cookie-based browser proxy.

## Environment changes

- `TRACKPRO_API_BASE_URL` is the server-only upstream URL. Embedded credentials, query strings and fragments are refused. The user/admin server helpers no longer use a NEXT_PUBLIC fallback for it.
- `SMARTTRACKER_ALLOWED_ORIGINS` is a comma-separated list of exact browser origins. Production defaults list the two established Smart Tracker website origins. Preview/custom origins must be explicitly configured. Wildcards and URL credentials/paths are refused.
- The remaining `NEXT_PUBLIC_API_BASE_URL` usages must contain only the public API origin needed for browser realtime connections, never credentials. `NEXT_PUBLIC_MAPBOX_TOKEN` is a domain-restricted public map token; the previously published historical token still requires owner rotation. `NEXT_PUBLIC_LIVE_WEBSOCKET_ENABLED` is a non-secret feature flag.

## Cookies and browser state

User/admin credentials are HTTP-only, host-only, Secure in production and SameSite=Lax. Legacy parent-domain cookies are cleared on user logout. Admin display/impersonation state is memory-only; it is not authorization. The old persisted admin-session key is removed on browser startup. Browser stores never receive the backend login tokens in JSON responses.

Logout forwards the appropriate refresh token to backend revocation before clearing cookies. If the upstream is unavailable, local cookies are still cleared and the response explicitly reports that server revocation could not be confirmed. Backend refresh-family replay handling and access-token revocation remain part of the separate authentication remediation. The standalone admin session still expires with its access token; automatic admin renewal is not silently introduced here.

Server-side `requireAdmin` verifies the current account with the backend rather than trusting cookie presence. Backend authorization remains authoritative for all proxied operations; a page redirect alone is never access control.

## Security headers and rendering

The production script policy uses a unique request nonce and strict-dynamic, without unsafe-inline or unsafe-eval for scripts. Root rendering is dynamic and page responses are private/no-store so a nonce is not reused from a static HTML cache. This intentionally changes the previous static rendering/cache behavior, including marketing routes; monitor hosting cost/latency rather than claiming a performance gain.

The source allow-list includes the configured API/WebSocket origin, Mapbox and the existing Esri tile origin. Local fonts and assets remain self-hosted. CSS retains unsafe-inline for the existing map/UI inline styles; this is a documented limitation, not a claim of a fully nonce-only style policy. Map workers need blob workers. Same-origin microphone access remains available for existing user-consented camera audio tools. Third-party frames, object embeds and cross-origin forms are blocked. HSTS, frame denial, nosniff, referrer and permissions policies are applied.

## Verification

Run `node --test tests/*.test.mjs`, TypeScript, lint and the production build. Security cases include missing/foreign/sibling Origin, internal framework rewrite addresses, wildcard rejection, production nonce policy and development-only eval allowance.

A local production-mode browser check with a loopback mock API verified login hydration under CSP, changing nonces, old browser-state cleanup, CSRF on normal and filename-shaped API paths, Secure/HTTP-only/host-only cookies, forged admin rejection and both logout revocation calls. It generated no CSP/page errors. This is not a production or hardware test.

## Rollback

Use a reviewed prior artifact only after evaluating session compatibility. Do not restore browser token persistence or wildcard credentials origins. Clear cookies/storage if returning to an older session model. No database changes or server deployment are part of this PR.
