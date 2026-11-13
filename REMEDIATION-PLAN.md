# Smart Tracker remediation plan

Updated 13 November 2026. Source baseline: backend incoming mobile/ticket compatibility commit reviewed and fast-forwarded, then current main reconciled; web current main reconciled. Work is delivered as small dependent PRs. Existing published UI/API PRs are not rewritten.

## Operating boundaries

Only Smart Tracker evidence is used. Never access the current production host, database or broker; never run deployment scripts. New-server work is prepared as scripts/runbooks and tested only on disposable local/CI resources. No Go/new database/redesign/Flutter implementation. Private notes and excluded files remain unedited and untracked. Commit/push identity is keithpgl247-ai. No raw secrets in output, reports or PRs.

## Finding to PR and acceptance mapping

The PR column is the planned review theme, not a claim that a PR or fix already exists. Detailed status and actual links are recorded in REMEDIATION-REPORT.md. Phase 2 starts only after Phase 1 code/test checks are complete; owner secret rotation and physical/server acceptance remain explicitly external.

| Finding | Phase | Planned PR | Work | Test and acceptance |
|---|---|---|---|---|
| P1A-1 | 1 | Configuration security | Secret fallbacks and missing provider credentials | Startup rejection matrix; no value in errors |
| P1A-2 | 1 | Configuration security | JWT key strength, key ID and overlap rotation | Weak/unknown/old/new key and purpose tests |
| P1A-3 | 1 | Owner provisioning | Remove restart-created owner; one-time password-stdin command; isolated preview | Existing-owner refusal, concurrent creation, no-prod preview tests |
| P1A-4 | 1 | Database roles | Separate migration, application, reporting and gateway credentials | Disposable PostGIS privilege and migration checks |
| P1A-5 | 1 | Callback security | Provider signature, timestamp, replay, limits and parsing | Unsigned/tampered/replayed/oversized requests rejected |
| P1A-6 | 1 | Configuration documentation | Setup samples unmistakably placeholders | Tracked-file scan |
| P1B-1 | 1 | Web scanning | Public map token owner rotation and full-history scanner baseline | Redacted gitleaks results; owner rotation pending |
| P1B-2 | 1 | Web environment | NEXT_PUBLIC audit; server-only secret boundaries | Environment inventory and client bundle assertions |
| P1B-3 | 1 | Web sessions | One middleware; cookies, persistence, CSRF, logout/refresh and admin enforcement | Cross-origin write and authenticated role tests |
| P1B-4 | 1 | Web headers | CSP, HSTS, framing, referrer and permissions | Header/CSP production-build checks |
| P1C-1 | 1 | Realtime authorization | Reconcile existing ticket/mobile access; scoped destinations, allow-listed origins and revoke | Cross-tenant subscribe/delivery tests; mobile compatibility |
| P1C-2 | 1 | Scorecard authorization | Tenant-scoped scorecards | Foreign org/device/driver reads rejected |
| P1C-3 | 1 | Tenant boundary | Central default-deny context and all endpoint-family access matrix | Route × role × object regression coverage |
| P1C-4 | 1 | Role policy | Root-only admin policy versus method annotations | Root/admin/viewer matrix tests |
| P1C-5 | 1 | CORS | Explicit environment allow-list; no wildcard preview origins | Allowed and foreign Origin checks |
| P1C-6 | 1 | Authentication | Redis rate limits/progressive lockout, append-only audit, BCrypt, refresh reuse | Login/refresh abuse, family replay and audit tests |
| P1D-1 | 1 | Broker security | Authenticated MQTT, per-client ACL, private plaintext, internet TLS | Disposable broker anonymous/foreign topic/TLS tests |
| P1D-2 | 1 | Device identity | Unknown-device quarantine, approval and creation limits | No tenant visibility or organisation binding before approval |
| P1D-3 | 1 | Decoder security | CRC, bounds, frame/rate limits, timeouts and fuzzing | Corrupt/truncated/random protocol frames and disconnect checks |
| P1D-4 | 1 | Gateway isolation | Loopback gateway API, separate credentials/database role | Compose exposure and privilege checks; hardware pending |
| P1E-1 | 1 | Security CI | PR/main test, secret, dependency and image gates | Green GitHub checks; isolated PostgreSQL/PostGIS |
| P1E-2 | 1 | Dependency automation | Dependabot for application/actions/images | Configuration validation |
| P1E-3 | 1 | Dependency remediation | Resolve safe high/critical upgrades; document blocked upgrades | Redacted advisory report and regression suite |
| P2-1 | 2 | Clone hygiene | No tracked runtime env/keys/dumps/logs/models/IDE/OS artifacts | Fresh-clone tracked-file audit; no history rewrite |
| P2-2 | 2 | Environment templates | Complete commented per-unit templates; remove confirmed orphans | Source/hand-over variable-name reconciliation |
| P2-3 | 2 | CI images | Dockerignore, non-root digest-pinned healthchecked image, SHA-tag GHCR build | CI build/image scan/runtime UID checks |
| P2-4 | 2 | Deployment templates | No server builds/git pulls; private secret files and template runbooks | Compose config, shell syntax and mock release tests |
| P2-5 | 2 | Security documentation | SECURITY and local/release READMEs | Documented secret handling and rotation reviewed |
| P3A-1 | 3 | VPS hardening | Named key-only account, updates, bans, sync, swap and logs | Container/VM dry run; to confirm on new server |
| P3A-2 | 3 | Firewall | Provider + host deny rules; Docker exposure controls; confirmed device ports | Offline rules tests; to confirm on new server |
| P3A-3 | 3 | Runtime isolation | Resource budgets, health and optional AI independence | Compose/runtime tests |
| P3A-4 | 3 | TLS operations | Automatic renewal and expiry alerts | Configuration/dry-run checks; server validation pending |
| P3A-5 | 3 | Database recovery | Roles, timeouts, statistics, encrypted off-server backups and weekly restores | Disposable PostgreSQL restore rehearsal; owner storage pending |
| P3A-6 | 3 | Monitoring | Health/device silence, capacity, restarts, backup age and cert expiry | Synthetic failure and alert receiver tests |
| P3A-7 | 3 | Release workflow | Backup gate, pull, owner migration, graceful start, health and rollback record | Mock + disposable stack release/rollback tests |
| P3A-8 | 3 | Cutover | DNS/IP inventory, batch re-point, data sync, parallel run and rollback | Operator read-only evidence only; physical devices pending |
| P3A-9 | 3 | Migration lineage | Canonical deployment V1–V32 and explicit divergent-history handling | Fresh PostGIS forward migration; no blanket repair |
| P3B-1 | 3 | Live map | Bulk latest/current-state preserving communication versus position | Same-data before/after test; targets not unmeasured claims |
| P3B-2 | 3 | Bounded APIs | Caps, required history range, keyset paging, SQL scope; no in-memory paging | Endpoint boundary and cursor consistency tests |
| P3B-3 | 3 | Ingestion | Ordered bounded offload, cache isolation, commit-only delivery, dedup, late data and ACK/ignition | Protocol fixtures, crash/retry tests; model hardware pending |
| P3B-4 | 3 | Database stability | Query timeouts/plans/indexes, monthly partitions, retention and raw-payload policy | Synthetic-scale PostgreSQL EXPLAIN and migration tests |
| P3B-5 | 3 | Alert lifecycle | Dedup/auto-close/reversible historical backlog treatment and real scoped delivery | Idempotency/preference/provider mock tests; no live backlog writes |
| P3B-6 | 3 | Scheduler | Sized scheduling pool, leader locks, deadlines and metrics | Two-instance lock/retry tests |
| P3B-7 | 3 | Trip correctness | Stationary completion and actual assignment | Fresh stationary and assignment regressions |
| P3B-8 | 3 | Licence limits | Vehicle slots, expiry/grace and allocation audit | Concurrent allocation and boundary/expiry tests |
| P3B-9 | 3 | Contracts | Web/API compatibility, unavailable paths and executable OpenAPI | CI spec/contract validation; mobile changes listed only |

## Handover finding reconciliation

| Finding | Mapping / qualification |
|---|---|
| ST-01 pool/startup incident | P3A-9/P3B-1/P3B-4. Existing V29 correction is in baseline; live recovery is not confirmed. |
| ST-02 migration divergence | P3A-9. Use standalone deployment lineage; do not import the separate monorepo or repair conflicting history. |
| ST-03 web/API drift | P3B-9. Existing reports/ledger APIs in merged UI/API work need a current executable matrix. |
| ST-04 broker/realtime | P1C-1/P1C-5/P1D-1. Existing CONNECT/delivery authorization and socket tickets are partially implemented; preserve authenticated mobile behavior. |
| ST-05 decoder integrity | P1D-3/P3B-3. Hardware support labels are not protocol certification. |
| ST-06 history date range | P3B-2. Range-aware query already exists in current TelemetryController; prove current behavior rather than duplicate it. |
| ST-07 backups/rollback | P3A-5/P3A-7. Historical helper backup listing is not a restored-backup rehearsal. |
| ST-08 hardware | P1D-3/P3B-3 plus commissioning checklist; to confirm with physical devices. |
| ST-09 ingestion/delivery | P3B-3/P3B-6. MQTT has bounded after-commit best effort; STOMP/cache/order need review. |
| ST-10 contracts/tests | P1C-3/P1E-1/P3B-9. Full old test suite is not assumed safe; isolate all database initialization. |
| ST-11 retention/operations | P3A-4/P3A-5/P3A-6/P3B-4. Absence of evidence is not proof that no owner-managed backups exist. |

## Evidence qualifications and exclusions

Historical fleet/alert timings and counts are dated observations, not newly measured production facts. The alert backlog treatment must be dry-run, rule-scoped and reversible, not a hard-coded mass update. The global API role policy remains root-only until explicitly changed by a reviewed role matrix. Fresh new-server secrets must be generated independently; no current-server credentials are copied. Plan limits are MVP scope; payment collection/reseller hierarchy are next phase. H2 results never substitute for PostgreSQL/PostGIS migration/plan evidence.

## Rollback and environment changes

Every PR documents new/removed variables and its own rollback decision. Removing insecure defaults may intentionally prevent startup until required variables are supplied. Do not roll back by restoring known/sample credentials. Migrations are additive/forward-reviewed; no destructive schema repair or live data modification is authorized.
