# Smart Tracker remediation report

Updated 13 November 2026. Work is in progress. No server was accessed, migrated or deployed. A listed future check is not a passing result.

| Area | Status | Evidence / next check |
|---|---|---|
| Baseline | Closed locally | Incoming mobile realtime compatibility reviewed; repositories reconciled before remediation branches. |
| Backend startup/owner work | Fixed in code · rollout pending | [Backend PR #2](https://github.com/Richdadbtc/tracpro-backend/pull/2); selected unit/CLI and disposable PostGIS CI passed. |
| Web sessions/CSRF/headers | Fixed in code · rollout pending | Canonical src/proxy.ts, nonce CSP, exact same-origin writes, host-only cookies, no browser credential persistence, verified admin guard and refresh-token logout forwarding. See docs/WEB_SECURITY.md. |
| Web verification | Verified locally | Production build/TypeScript and targeted lint passed; local production-mode browser check confirmed CSP hydration, nonce renewal, storage cleanup, CSRF, cookie flags, forged admin rejection and two logout revocations. |
| Remaining Phase 1 | Next review themes | See REMEDIATION-PLAN.md; not claimed closed. |
| Phase 2 | Not started | Ordered after Phase 1 local/code acceptance. |
| Phase 3 | Not started | New-server templates and disposable tests only; server/hardware checks remain external. |

## Owner actions

| Action | State |
|---|---|
| Rotate previously published map token; apply domain restrictions | Owner action pending; do not rewrite public history. |
| Generate fresh JWT, DB, Redis, gateway and webhook/provider secrets on the new server | Pending secure provisioning; never copy old host credentials. |
| Grant a named non-root SSH deployment user with approved key on the new VPS | Pending; no current production access requested. |
| Enable provider backups/snapshots and independent backup storage | To confirm on new server. |
| Supply installed device models/firmware and IP/domain addressing | To confirm with physical devices. |
| Agree cutover and acceptance window | Pending; no release executed. |

Current production commands, when required, are written for the owner to run and review; they are never executed by this remediation session. Final report statuses distinguish fixed in code · rollout pending, to confirm on server, to confirm with hardware and next phase.
