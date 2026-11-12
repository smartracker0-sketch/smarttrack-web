# Smart Tracker — design implementation handoff

Chosen direction: **01 Signature**. The other five files are alternatives for reference only.

```text
Implement the Signature design in the Smart Tracker web app.

Repository: smarttrack-web (Next.js App Router, React 19, Tailwind v4, Zustand, Mapbox GL).
API: tracpro-backend (Spring Boot). Do not change backend business logic for styling.
Reference: "01 Signature.html" (open in Chrome). It is a visual impression with sample data.
Port the visual system onto real components and real queries; never replace working behaviour
with the mock's in-memory logic. Every page in the mock maps to one route below.

1. Read first
- AGENTS.md / CLAUDE.md, package.json, layouts, middleware, session helpers, globals.css.
- Map every route to its API calls. Baseline: npm run build and npm run lint.

2. Brand and tokens
- Title "Smart Tracker", Smart Tracker logo as favicon. Copy the light and dark token block.
- Sidebar: deep-blue gradient (#132F86 → #0F2160 → #0A1338), optional light style. Brand #1D4ED8.
- Motion statuses: Moving, Idle, Stopped, Inactive. Connectivity: Online, Offline, Inactive
  (never reported). Device extra state: Online · No GPS.
- Short copy only: no taglines, no repeated counts.
- Spacing: 4/8/12/16/20/24/32px. Page gutters 20px, sections 16px; radii 8/12/14px.
- Page title 24px, card title 15px semibold, body 14px, meta 12.5px; tabular figures.
- Controls 36px / compact 30px. Visible keyboard focus, light/dark contrast.

3. Frame
- Top bar 56px: logo, divider, "Hub Page" context, search (Ctrl K, server search), theme
  switch, notifications, help, name + role, avatar. No tenant filter, no menu toggle (phones get
  a menu button). Profile menu: profile, preferences, security, sidebar style, sign out.
- Sidebar 200px / 56px rail, round toggle on its edge, no badges. Map pages open it on the rail.
- Hubs open a 200px flat panel (title, ×, items with icons) that starts on Overview.
- Routes. Hub panels stay short (max 7 items); related pages are tabs under the page title
  (shown as "Group: Tab | Tab"). The last-used tab is remembered per group.
  Dashboard · Live map · Control Center · History (in this order)
  Top bar also has an "AI Assistant" button that opens a right-side chat panel (no floating
  chat icon anywhere). It opens a bounded panel (up to 400px wide and 560px tall), with
  space above and below it; the conversation scrolls inside. It never fills the page height.
  Control Center: Overview, Vehicles, Devices, SIM cards, Vehicle groups,
    Alerts: Events | Rules, Places: Geofences | POIs
  Fuel Hub: Overview, Fuel events: Refuels | Drains & theft, Consumption, Fuel cards,
    Setup: Sensors | Calibration | Alert rules, Fuel reports
  Video Hub: Overview, Streaming, Events: Events & evidence | Priority incidents, Driver scores,
    Cameras: Cameras | Storage | Data & SIM, Insights: Analytics | Reports, Alert rules
  Maintenance: Overview, Work orders: Work orders | Job cards, Service schedules,
    Downtime & faults: Downtime | Faults, Parts & documents: Parts | Documents,
    Records: History | Reports, Automation: Alerts | Reports scheduling | Settings
  Reports: Report library (cards → report result table), Automated delivery (incl. email
    schedules), Device reports, SMS reports
  Settings · Support · Admin: Overview, Accounts, Users & roles: Users | Role profiles,
    Licences: Registry | Device consumption, Modules, Audit logs, System: Health | Platform settings (root superadmin only) | Reset hub

4. Page header (hero) on every non-map page: eyebrow (hub), title, tenant multi-select (search,
   All tenants / individual selection / Clear / Apply) feeding that page's API scope, refresh, page actions.
- Compact, unboxed headers use a 40px page icon, hub context, 24px title and a bottom hairline. Top-bar context names
  the active child page. Group/table/detail tabs share a bordered tab strip, clear selected
  surface, hover/focus states and arrow-key navigation.
- Keep title and controls on one line at desktop widths; move secondary controls into More
  when needed. On phones, title has its own line and controls scroll horizontally.
- Overview pages show operational follow-ups rather than repeating hub navigation.
- Settings has separate Organisation, Units & formats, Notifications, Map, Security and
  API keys forms. Maintenance Settings has service defaults. Both have a sticky Save changes /
  Cancel bar, dirty state and required-field validation. The HTML remembers saved values locally;
  the production port must use authorised settings APIs and user/tenant scope.

- Tenant picker: All tenants is a distinct option above the searchable list. When it is
  active, individual checkboxes remain clear. Selecting a tenant switches to explicit
  multi-selection. Clear selects no tenants; Apply commits the scope. Cancel/outside click
  leaves the current scope unchanged.

5. Tables (all list pages)
- KPI tiles that filter the table where shown; optional tabs.
- First column is the vehicle reg wherever the record has a vehicle.
- Toolbar: search, segment filter, date filter (Today/Yesterday/Week/Month/Custom with
  from-to), Filters popover, Import / Export menu (import, template, CSV, Excel, PDF), Trash
  (devices), primary Add.
- Row checkboxes + page select-all; selection turns the toolbar into a bulk bar
  (count, Select all N, page-specific actions, Clear).
- Table tabs, segment, page size, search and sorting are remembered independently per page
  across navigation/reload. Do not persist row selections. Long segment sets move into Filters
  when the desktop toolbar runs out of room. Keep table toolbars on one line at >=1280px.
- Table headers stay visible inside the scrolling table; rows are 48px. Enter opens a focused row.
- Row click opens a detail dialog: title, subtitle, status chips, field list, Actions menu,
  primary Edit. Maintenance and alert-event tables also keep a per-row ⋮ menu.
- Horizontal scrollbar shown above and below wide tables, kept in sync.
- Footer: "Showing x–y of N", rows per page, first / previous / numbered / next / last.
- Server-side search, sort, filter and cursor pagination. HTML previews use sample arrays only.
- Video Events and Priority incidents keep their full tables and add recent evidence previews
  that open the same row detail. Streaming has searchable vehicle selection, channel tiles,
  Snapshot feedback and a return link when entered from the live map. Preview media is simulated.
- Add/Edit forms have associated labels, required-field errors and prevent blank saves.

6. Dashboard (order is user-arrangeable; Arrange = drag + Save layout/Cancel; Customize = sheet
   with show/hide, reorder, Reset; persist per user)
- Fleet motion (4 solid cards) → Fuel snapshot (white band) → Status charts (Device
  connectivity pie, Device health pie, Driver allocation) → Driver intelligence band →
  Telemetry band → Video snapshot band → Fleet km summary (7D/30D/Custom area chart) +
  Recent activity (paged) → Mileage by vehicle (Today/7D/30D/Custom with date, time-of-day and
  minimum trip duration, search, Export CSV; the table has a 220px internal scrolling area,
  hidden scrollbar, sticky header and keyboard focus, no paging; rows do not extend the page).

7. Live map (map fills the page; panels float with 12px gaps)
- Vehicle list 340px, left: title + count, status-mode toggle (motion/connectivity), Filter and
  sort popover (List Vehicles/Devices, Sort Last report/Plate/Speed, Group, Fuel sensor fitted,
  camera fitted), List settings popover (tenant, show stale, coordinates, plate labels),
  search, status summary (label above count) with share bar. Rows have two lines:
  line 1 = [plate · tracker-count chip (only when >1) · hover pin] [status chip] [age];
  status chips share a fixed left edge; ages align right; pinning never selects a vehicle;
  line 2 = address (truncated) · speed km/h (right). Pin shows on hover; pinned rows first.
  No pictures, no checkboxes, no duplicate icons. Pin remains keyboard accessible.
- Phones: navigation opens as a drawer, vehicle list becomes a bottom sheet; map drawers stay
  inside the viewport. Dashboard bands use two columns so labels and values stay readable.
- Left tools column beside the list: fold, collapse list, recenter, map style (Streets,
  Satellite, Hybrid, Terrain; clusters Balanced/Rings/Off), full screen. Zoom bottom-left.
- Selected vehicle: red "Exit focus" pill; vehicle actions column (Nearby vehicles, Nearby POIs
  with radius 1–50 km, Video stream, Share location, Driver details); hover card 264px beside
  the marker (closable, reopens on marker hover): plate, Edit, motion + engine chips, device
  line, Speed / Today / Odometer / Battery, location with lat/lng and map link.
- Right tool dock 64px (foldable): Geofences, POIs, Trips | Details, Replay, Immobilize, Fuel,
  Video (disabled with a reason until a vehicle is selected).
- Drawers 360px: Vehicle details (Overview / Sensors / Device tabs), Remote control
  (Immobilize / Enable engine → password confirm; sent to the vehicle's device), Fuel (24h-30d),
  Trips (search, period, filters incl. shortest trip km and minimum duration, rules, tiles,
  Trips / By day / By vehicle, export menu, per-trip replay/export), Geofences, POIs.
- Replay (also History page): panel with period (1h–30d or custom), six stats, stop/drive
  timeline; bottom dock with seek bar, restart, ±30 s, play/pause (Space), speed 1×–1000×,
  legend; route coloured by speed, stops A/B/C, event dots.
- Trips period/filter/rules popovers stay inside the Trips panel.
- A table detail that opens a vehicle on the live map provides Back to the originating page.
- Keyboard: Ctrl/Command+K opens search; Escape closes the top layer; Space toggles replay.
- Commands go to devices only (Devices detail → Send command / Command history; Remote control).

8. Support and platform contacts
- Support sits directly below Settings in the sidebar (and before Admin in alternative More menus).
  Header Help opens Support. It has a support request form and searchable FAQ groups for setup,
  live map, trackers, alerts, reports, fuel, video, drivers and accounts.
- Admin > System > Platform settings is restricted to root superadmins. Configure support email,
  phone, WhatsApp, operating hours and help-centre URL there. Blank channels stay hidden.
  Do not hardcode another product's contact details. In the mock, saved platform contacts are
  shared across all six designs through browser storage; production must use platform settings
  APIs with server-enforced root-only writes and safe public contact reads.
- The preview prepares requests locally and does not transmit them. The production port must
  connect submission to the support API, including pending, error and confirmation states.

9. Verify
- Light/dark, sidebar expanded/rail/hub, list collapsed, drawers open, replay, 360–1440px.
- Map instance survives page changes; tenant filter changes API scope.
- Roles see only permitted pages; hidden navigation is not authorisation.
- npm run build and lint pass. No production deployment is authorised by this prompt.
```

Preview checks (run from the design folder with its local HTTP server on port 8765):
`node _source/verify.cjs` writes screenshots and `verification/results.json` for the six
frames, Signature routes/tabs, desktop light/dark and phone layouts. The script uses the
same installed Playwright dependency as `_source/screenshots.cjs`. These preview checks
do not replace production API, authorisation, real media or accessibility testing.

## Repository build status — 11 November 2026

The first Signature build is integrated into `smarttrack-web` and `tracpro-backend`.
The detailed implementation matrix and verification limits are maintained in
`smarttrack-web/docs/IMPLEMENTATION_STATUS.md`. The specifications above remain the
target design; they must not be read as a claim that every production module is complete.

- Implemented: shared client/admin frame; compact icon headers and group tabs; browser
  theme/preferences; bounded dashboard mileage and AI; aligned vehicle rows and map dock;
  Support form and FAQ; root-admin Support contacts; settings save bars; camera event review;
  shared inventory tables; real mileage aggregation and device search.
- Contacts are authenticated reads and server-enforced root-only writes. Root settings retain
  the existing SMS provider control. Backend contact updates replace all five fields with PUT;
  blank values hide channels. Migration V30 creates the versioned platform settings table.
- Mileage uses positive recorded odometer deltas in a period of up to 31 days; insufficient
  samples show unavailable distance. Tenant filters narrow server permissions. They are only
  offered on connected views that can apply organisation scope.
- Mapbox remains supported; Leaflet/Esri is the fallback without a configured token, including
  route replay. Commands retain the existing confirmation and authorization workflow.
- All 62 design routes are registered. Reports and Maintenance scheduling use recurring
  execution queues, run history and downloadable CSV/Excel. Several other connected
  workflows still need completion and final verification.
  Licence Registry still uses the existing Billing overview;
  Device consumption currently lists device records. Dedicated licensing operations are pending.
- The complete Trips/nearby/replay specification, persistent map across Next.js route changes,
  exhaustive legacy-table/form styling, and large-fleet lookup pagination remain follow-up work.
  The assistant currently uses the client session and is not added to the separate admin session.
- Verified: production build, lint without errors, five stream lifecycle tests, eleven isolated
  backend tests, all 62 route loads, and selected desktop/phone light/dark interactions and captures.
  Browser checks use intercepted API/WebSocket fixtures and blank map tiles. Live services,
  PostgreSQL migration/query execution, actual media/commands/AI, complete accessibility auditing
  and every requested route/viewport/theme combination are not verified. No deployment was run.

The six HTML previews keep their sample data and preview-only actions. Their contact settings
remain browser-local; this repository build does not change the preview engine.

Local browser preview is now available through `tracpro-backend/start-local-preview.ps1` and
`smarttrack-web/scripts/start-local-preview.ps1`: frontend port 3000, backend port 8089,
isolated H2 file database, hardware listeners and external integrations disabled. It uses
polling locally and leaves production environment files unchanged. Login now opens Dashboard
by default. A real local sign-in, Dashboard and Support smoke test passes without console
errors. Driver role queries use the typed DRIVER enum, and root-client tenant options use
the client session rather than requiring an admin-console cookie. PostgreSQL migrations and
production services remain unverified.

## Approved navigation and History refinement

- Keep the deep-blue sidebar and existing navigation links. Use compact, standard outline
  icons, 36px navigation rows, a square chevron collapse control in the brand header, and
  independent 224px expanded / 56px rail states. The map no longer forces the main sidebar
  onto its rail. Profile remains in the top bar; no profile or language section belongs in
  the sidebar.
- The desktop brand sits in the sidebar header. The top bar contains route context, search,
  a two-button light/dark pill, a standard sparkle icon for AI, a bell notification feed and
  the account menu. Phone navigation remains a drawer.
- Fleet list: a 332px floating, content-sized panel capped to the available map height;
  the navigation icon beside the Fleet title collapses it. Remove the external right-side
  toggle; show a small map button only while collapsed to reopen it. Main navigation and
  vehicle-list collapse are independent. Keep the approved aligned two-line vehicle rows,
  status summary and phone bottom sheet.
  Empty and loading lists use content height on phones as well; reserve the 48% bottom-sheet
  height for populated lists. Empty messages must not create a large blank panel.
- History uses a compact floating filter card: vehicle, combined date-range control, Advanced
  movement/vehicle-search filters, Show history and Export. Remove decorative Summary/Logs
  tabs inside this card. Use the same form in the live-map History drawer; keep existing
  History routes, playback, export and keyboard controls working.
- These newer navigation and History requirements supersede the earlier frame/card sizing
  where they differ. The reference site's branding, account controls and language controls
  are not copied into the product.

Use relevant Lucide outline icons across pages, at a consistent stroke and size,
without a decorative boxed tile around header icons. Fuel uses a fuel pump, Cameras
a camera, Maintenance a wrench, and other pages their corresponding symbols.

Login uses concise marketing/photography on the left and one email/password form
on the right. Both fields are visible on arrival; do not add an email-only step.
Keep password visibility, validation, pending/error states and safe internal return
navigation. Use the verified production logo and Smart Tracker/Telematics wordmark
in the login box, sidebar and phone drawer. Phones show the form without the marketing
panel. The Freepik photo is compressed locally to WebP with source attribution.
Copyright names Smart Tracker Telematics unless the user supplies another legal
company name. Hide public floating chat on login. Temporary workspace network and
502/503/504 failures retry up to three attempts before showing Retry.

## Connected operational records and reports

Dashboard action cells use 14px semibold titles and 12.5px supporting links; reserve
large figure typography for actual numbers. Video snapshot keeps its camera count
prominent and uses compact Streaming, Video events and Driver scores links.

The repository build now connects SIM cards, job cards, downtime, faults, parts,
fuel-card entries, calibration, camera data plans, storage policies and maintenance
defaults to validated backend records. Create/edit/delete, atomic CSV import and
search/sort/paging preserve role and tenant restrictions. Calibration updates the
existing sensor calibration curve. Data-plan usage synchronization and automated
storage-policy enforcement remain unfinished.

Refuels, Drains & theft, Consumption, Fuel reports, Video Analytics, Video Reports,
Maintenance Reports and SMS Reports use a shared report workspace. Keep Custom
periods (maximum 31 days), tenant scope, table search/sort/status, all-matching
CSV/XLSX exports and Print/PDF. Fuel changes use at least 5 L or 5% tank capacity;
drains require review. Missing tank readings leave complete totals unavailable.
Driver consumption rates pair fuel and distance from the same trips. Video uses
received events and clip availability; maintenance selects work orders by creation
time. SMS includes only accessible device-linked messages, except root may see
unlinked platform messages in All tenants. Reports cache scoped results for 30 seconds.

Fuel and Video alert rules now persist device policies and affect real alert processing.
Fuel supports low/drop enable switches, thresholds and a whole-minute drop window
in both ingestion paths. Video supports enable/minimum severity before alert persistence;
received footage stays available. One policy per device; changes apply within 15 seconds.
Delete restores defaults. Duplicate, cross-tenant and relinking writes are rejected.

Maintenance attention now lists open work orders due by the selected period end,
including earlier overdue work, and excludes completed/cancelled work. Keep Today,
Next 7 days, Next 30 days and Custom. Dates use Africa/Lagos. Work orders enforce
tenant/personal ownership, record completion timestamps and invalidate report caches
after committed writes. API responses contain explicit fields rather than full entities.

Root role profiles define base roles plus None/Read/Write module permissions;
account module policies override them. Viewer/driver profiles cannot grant writes.
History, Fuel, Video and Maintenance require the shared Control Center directory.
Profile assignments end current sessions, and root roles cannot be replaced through
profiles. API authentication checks current database roles, enabled state and session
version. Navigation, page access, widgets, write controls and AI capabilities use the
same permissions. Reset hub requires administrator password and selected-user email
confirmation to revoke sessions or clear saved preference records, with audit history.
It does not clear another browser's local preferences. V31 is a source migration only.

Reports Automated delivery and Maintenance Reports scheduling now use persistent schedules,
an execution queue and paged history with CSV/Excel downloads. Select a connected report,
IANA time zone, once/daily/weekly/monthly recurrence, a rolling 1–31-day period and
in-app or configured email delivery. Monthly schedules retain the original day across
shorter months. Reject an initial time in a DST gap. Pause/edit/remove and Run now work;
manual runs are idempotent and stale edits require refresh. After downtime, queue one
catch-up and advance to a future occurrence. Keep immutable run configuration/files,
worker leases, tenant/role checks and permission checks before delivery. Removing a
schedule cancels future/queued work but retains history. Earlier passive report records
require explicit setup before conversion. Local preview disables email; actual provider
delivery and PostgreSQL V32 migration execution remain unverified.

Root inventory, map, telemetry, mileage and replay reads now share global fleet visibility;
tenant filters narrow it. Ordinary users retain owner/assignment/organisation restrictions.
Telemetry history applies its requested date interval with a strict 31-day maximum.
Realtime uses separate short-lived connection tickets, scoped subscriptions and per-message
device/module/session-version checks. Session revocation stops existing socket deliveries.
Tickets cannot authenticate REST. Root activation channels stay root-only. Local preview
uses polling; isolated real STOMP tests cover live delivery and revoked/foreign access.

Other unfinished workflows and verification limits remain listed in
smarttrack-web/docs/IMPLEMENTATION_STATUS.md. Route availability alone must not
be described as a complete full build.

## 12 November refinements

- Hub overview summary rows contain three metrics. Omit the redundant destination card;
  retain the records panel's View all link. Dashboard action-card titles use 14px text
  that wraps within the tile, independently of numeric KPI typography.
- Dashboard Customize includes Sidebar colour: Blue / White. Default and Reset use White;
  Save applies and remembers the selection; Cancel leaves it unchanged. White remains
  white with either content theme. Both styles support active/hover/focus, collapsed rail
  and phone drawer. Sidebar labels and rail icons use stronger weights.
- Login has a centered form hierarchy, balanced spacing and structured marketing features.
  The production logo is compressed to a direct-loaded 256px WebP (13 KB versus 202 KB PNG).
- Shared tables have a three-dot row action menu: details, supported edits/deletes,
  map/device links and module-specific actions. Menus stay inside the viewport and support
  keyboard navigation. Vehicle Groups uses the shared page header, table and native
  validated add/edit form. Legacy page conversion continues; no dummy actions are added.
- Replace generic “Open workspace” with a named destination. Use concise record labels.
- AI receives the selected tenant IDs and intersects them with authorised fleet access.
  All tenants, selected tenants and an empty selection are distinct. Conversations and
  caches are scoped per user/selection; changing scope cancels old requests and clears
  pending actions. Confirmed actions bind device IDs. Root can inspect all tenants;
  an ordinary user cannot expand access by submitting another tenant ID. New devices
  inherit the registering user's tenant. Deterministic API checks verify scoped answers
  and insight totals; external AI-provider responses remain unverified.
- Live map uses the complete live-object directory. History/dashboard directory queries
  paginate through all devices. Trips supports server scope, 31-day periods, search,
  minimum distance/duration, status, by-day/by-vehicle grouping, paging, CSV/Excel and
  replay links. Keep period/filter/rules popovers contained inside the drawer. Missing
  odometer samples keep distance unavailable rather than manufacturing zero.
- Login uses the compact “Sign in” heading and “Access your fleet dashboard” introduction.
  Inter is hosted locally with its OFL licence; the favicon is a compressed production-logo
  derivative. The final production build passes without remote font requests.
- Vendors, Expenses, Documents, Consigners, E-lock and Tyres use the shared header, table,
  three-dot menu and validated Add/Edit forms with real, scoped PUT endpoints. Document
  downloads require access to their document record. Driver roster and Vehicle States use
  the shared scoped tables. Profile saves the display name with a sticky Save/Cancel bar.
- Final selected backend regression run: 100 tests, zero failures. Latest browser checks
  cover sidebar persistence/cancel/dark/rail/phone, groups actions, AI scope/history and
  login at 1440, 1366, 1024, 768, 390 and 360px. Live providers, production migrations,
  licence lifecycle, broader Settings and remaining map/legacy workflows are unfinished.
