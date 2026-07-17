# SONNET-HANDOFF.md — build tasks for Claude Sonnet 5

> **Purpose:** these are the *implementation* tasks (design already settled). Run each in a
> **fresh Sonnet 5 chat** with this folder mounted. Opus/design tasks stay in Leo's main chat.
> Paste one task block per chat.
>
> **Every Sonnet chat MUST, before coding:** read `CLAUDE.md` (constitution) + `memory.md`
> (state) first. Then obey the constitution: **minimal surgical diffs, no full-file rewrites,
> no conversational fluff.** Edit takeoff code in **`AC3 tracker\takeoff\` only** (single
> source — the Downloads copy is deprecated). Use the **`EDITING.lock`** protocol, `node
> --check` after JS edits, bump `?v=` in the relevant `index.html`, and **halt after 3
> same-error failures** and report back.

---

## ⭐ NEW — from the 2026-07-16 review (do these next, before revisiting M1–M6)

### T1 — DXF parse + verify CLI tool (dev infra)  · Sonnet · **build first — cuts every later debug's token cost**
**Why (Leo, 2026-07-16):** production parsing already happens in-browser (the DXF never enters a
prompt). But *debugging* the parser does burn tokens — Claude rebuilds an ad-hoc Node harness,
runs it, and eyeballs output every time. A committed CLI tool makes parse + verify deterministic
and compact, so future work (S4, M2-v2, #3/#4) never re-reads a DXF into context or re-derives a
harness.
**Build `takeoff/tools/dxf-cli.js` (Node), interface:**
```
node takeoff/tools/dxf-cli.js <file.dxf> [--system 45TU|750XT|auto] [--mark EL-01]
     [--json] [--baseline f.json] [--save-baseline f.json]
```
- Load `systems.js` + `app.js` parser fns in a `vm` context with stubbed
  `window/document/localStorage` (the proven harness pattern — see memory.md "Node parser
  harness recipe"; `head` app.js at a clean function boundary to dodge the OneDrive bash-mount
  truncation when the *agent* runs it — on Leo's own machine `fs` reads the whole file fine).
- Call `parseRawDxfOpenings(text, {forcedSystem})` (pairs with S4's new `forcedSystem` param).
- **Default output = COMPACT per-mark summary** (mark, system, WxH, per-role piece counts +
  lengths). **Never dump raw geometry.** `--json` = structured. `--baseline f.json` = diff vs a
  saved run, print only diffs, **exit 1 on any change** (deterministic regression gate).
  `--save-baseline` = write current as the baseline.
**Use it thereafter for ALL parser verification** instead of bespoke harnesses. Add a 5-line
`takeoff/tools/README.md`.
**Constraint:** `takeoff/` single-source; no `?v=` (not browser-loaded); not CORE (no CP2 sync).


### S4 — Fix system misidentification on import (Takeoff)  · small · **root cause of "door still detected as frames" + stray "Door Jamb At Transom"**
**Diagnosed by Opus on the real `45TU.dxf` (all 8 openings + full cut list).** The `#2`
whitelist works, but it never gets the chance on 45TU because **the system is wrong during
classification.**
**Root cause:** `parseRawDxfOpenings` sets `const system = dxfSystemForMark(mark)` (`~1635`)
for each cluster. `dxfSystemForMark` (`~2099`) maps only `WN/WS/SF` marks; anything else
(the 45TU file uses `EL-01…EL-08`) falls through to `SYSTEMS_LIST()[0]` = **IR501T**. All role
classification, the 750XT-specific branch (`sysIs750`), AND `applyRoleWhitelist(cuts, system)`
then run against **IR501T** — which legitimately *has* `Door Jamb At Transom` + `Outside 90°
Corner`, so the whitelist keeps them. Only afterwards does `appendParsedOpenings` (`~2351`) do
`o.system = sys` (your confirmed 45TU) — **too late; the cuts are already classified/whitelisted
as IR501T.** (Harness proof: 45TU.dxf → every opening tagged IR501T; EL-01 shows
`Door Jamb At Transom:3pcs`. With the system correct, the whitelist remaps those to `Door Jamb`,
which is 45TU's real door role — `AS-0411` jamb + `AS-0412` head=Transom Bar.)
**Fix:** pick the system **before** parsing and thread it through, so classification uses it:
1. In `parseRawDxfOpenings(text, opts)`, use `const system = (opts && opts.forcedSystem) ||
   dxfSystemForMark(mark);` — the forced system flows into `sysIs750`, the 750XT block, and
   `applyRoleWhitelist` correctly.
2. Reorder the import flow so `pickSystem()` runs **before** `parseRawDxfOpenings` and passes
   `{forcedSystem: sys}` (for both the paste path `~2323` and the file/bridge paths). Keep
   `'auto'` = fall back to `dxfSystemForMark`. The late `o.system = sys` reassignment
   (`~2351`) can stay as a harmless belt-and-suspenders, or be removed.
**Verify (harness):** re-run the Opus harness (below) on `45TU.dxf` with `forcedSystem:'45TU'`
→ EL-01 has **no** `Door Jamb At Transom` / `Outside 90° Corner`; door = `Door Jamb` +
`Transom Bar` only. Confirm `south/north/east/west.dxf` (SF-marks → 750XT) are unchanged.
**Harness recipe:** `head -2450 takeoff/app.js > app_prefix.js`, load it + `systems.js` in a
`vm` context with stubbed `window/document/localStorage` (see memory.md "Node parser harness"),
call `parseRawDxfOpenings(dxfText, {forcedSystem})`.
**Door-frame rule (RESOLVED by Leo 2026-07-16):** KEEP `Door Jamb` + `Transom Bar` — they are
the storefront's own **attaching** members (the opening frame the door hangs on), NOT the door
itself. Exclude only the actual **bought door unit** (the operable leaf: its stiles/rails/glass).
Block-door mode already skips leaf interior verticals + the door-opening glass cells — so
**verify** the 45TU doors are block-detected (`doorKindOf` signature) so the leaf isn't taken
off; if a door isn't block-detected and the leaf leaks in as `Vertical`/glass, exclude just the
leaf. **Never** drop `Door Jamb`/`Transom Bar`. So for issue 1, **S4 (system fix) is the whole
fix** — no blanket door-frame exclusion.
**Constraint:** `takeoff/app.js` only (single source). Bump `?v=`. Not a CORE tracker file → no
CP2 sync.

### M2-v2 — In-tracker region import (supersedes the built M2)  · medium-large
**Why:** the shipped M2 (tracker "Import DXF" → navigates to takeoff → confirm system → parses →
auto-returns) is the confusing round-trip the manager wants gone. His intent: **the tracker
imports a DXF by itself**, detecting only the elevation *regions* it needs (glass / louver /
metal-panel / door) — it does **not** need the system. The takeoff tool does only the material
takeoff. Both write to **one** `elevGeo/{mark}` doc.
**Key fact (verified):** region/element detection is **system-independent** — `buildElevExport`
produces `elements:[{id,x,y,w,h,t0}]` (`t0 ∈ glass|louver|panel|door`) from geometry alone;
only role/cut classification needs the system. So the tracker can parse regions with no system.
**DECISION (Opus):** build a **focused standalone region parser** for the tracker rather than
refactoring the 2200-line takeoff parser — lower risk, keeps the working takeoff untouched.
Accept the tradeoff: two parsers must keep emitting the same `t0` element schema.
**Build:**
1. **`dxf-elevations.js` (new, tracker-side):** a trimmed port of the *geometry* path only —
   DXF pair/entity parse (`dxfPairs`/`dxfCollectEntities`…), polyline clustering
   (`clusterPolys`), door-region + louver-band + panel-strip + glass-grid detection, and
   `buildElevExport`'s element/base/viewBox construction. **Omit** all role/cut/system logic
   (`dxfDetectCuts`, the 750XT/45TU blocks, whitelist, gaskets). Output per elevation:
   `{ key:mark, viewBox, base, elements[] }`.
2. **Tracker "Import DXF" button (index.html):** replace the current stage-and-navigate handler
   (`stageDxfForTakeoff`) with one that runs `dxf-elevations.js` **in-page** on the chosen file
   and, per elevation, writes geometry to Firestore `elevGeo/{mark}` (merge) + updates
   `window.ELEVATIONS[mark]`, then re-renders. **No system prompt, no navigation.**
3. **Takeoff writes material into the same doc:** change `exportElevationsToTracker`
   (takeoff/app.js) to merge its material under a subfield — `elevGeo/{mark}.takeoff =
   {system, cuts, gaskets, …}` — and **stop overwriting** the geometry fields the tracker owns
   (`viewBox/base/elements`). Result: one `elevGeo/{mark}` doc, geometry from the tracker,
   material from the takeoff. Keep the takeoff's own in-tool elevation viewer working from its
   local parse as today.
4. Keep the M2 `elevations.js` merge-as-fallback fix (already shipped) — cloud stays
   authoritative.
**Verify:** in the tracker, Import DXF → elevations render in the Elevation tab with correct
glass/louver/panel/door regions, **without** opening the takeoff tool or picking a system;
separately, a takeoff push adds material to the same doc without wiping the geometry.
**Constraint:** `dxf-elevations.js` + `index.html` + `elevations.js` are PROJECT/tracker files
(no CP2 sync). `takeoff/app.js` edit = single source, bump `?v=`. **Supersedes the built M2's
navigate-to-takeoff button** — remove/repurpose `stageDxfForTakeoff` + the return-hop in
`tracker-bridge.js` (the auto-push added to `appendParsedOpenings` can stay as the takeoff-side
material push).

---

## READY NOW

### S1 — Top-banner install progress on scope cards  (Tracker)  · small
**Goal:** on the "SCOPE INSTALL TRACKING" cards, make the big top number show install progress
as a fraction — `installed/planned` (e.g. `0/20`, `1/9`, `0/6`) — instead of just the on-plan
count. Keep the existing "N on plan · M installed · dwg X" subline and the progress bar.
**Location (verified):** all scope-card logic is an **inline `<script>` in `index.html`**
(`~1538–1677`), NOT `app.js`. `paintCard(c)` (`~1589–1602`) already computes, per card:
- plan scopes (`extSf/intSf/entryDoors/slidingDoors/hmDoors`): `placed` (on-plan) + `inst`
  (installed) — set the headline to `inst + '/' + placed`.
- piece scopes (`louvers`, `sunShade`, `glassGL3`): `mInstalled(k)` / `mTotal(k)` — headline
  `done + '/' + tot`.
- **free-count scopes (`metalPanel`, `glassGL1`, `glassGL2`) have NO total today** → leave the
  headline as the plain count (or add a `data-total` per card if Leo supplies expected qtys).
**Steps:** find the big-number element in the card markup (`~1459–1536`) and set its text in
`paintCard` to the fraction per the branch above. `paint()` is already called after every
render (`window.__afterScopeRender`), so no wiring needed.
**Verify:** each card headline reads `installed/planned` and matches its subline; a 0-installed
plan scope shows `0/20`; free-count scopes still show a sane number.
**Constraint:** `index.html` is a PROJECT/hybrid file → **no CP2 sync needed** for this.

### S2 — Point 6: phantom-door fix  (Takeoff)  · needs 45TU DXF
**Symptom:** a plain head gets labeled `Transom Bar` and a mullion `Door Jamb` where there is
no door (e.g. EL-05). **Root cause (see memory.md):** the non-750 door heuristic in
`dxfDetectCuts` uses `floorY = min bottom of ANY vertical`; one low-drawn mullion drags it
down, so real sills read as "missing" → phantom door.
**Fix (designed):** use a **mode-based floor** (most common vertical-bottom Y), as the 750XT
path already does via `byCount(vBotList)[0]`, gated per system so 1600/IR501T/450 behavior is
unchanged. **First reproduce EL-05 with the Node harness on the real 45TU DXF** (harness recipe
in memory.md), fix, re-run, confirm the head is `Head` and no phantom door. Micro-test on a
minimal mock first.
**Blocker:** requires the **45TU DXF** in a connected folder.

### S3 — Gasket (#3) + auto-propagation (#4) build  (Takeoff)  · needs 45TU DXF · large
**Spec:** implement `takeoff/PROPAGATION-DESIGN.md` §7 in order — IMP-1 region detection from
the DXF layer/hatch → `(IMP-1)`/`(Glass)` role variants (generalize the existing 750XT
panelStrip band-split to all systems) → `systems.js` variant roles + gasket rules → switch
gaskets to **role-based per-member summation** and retire the perimeter model → learned-rule
layer (Firestore `roleRules`).
**Verify:** gasket output must match Leo's hand numbers `E2-0127 ≈ 5,982 LF` /
`E2-0120 ≈ 4,795 LF` on the real drawing; run the parser harness before handing back.
**Blocker:** requires the **45TU DXF** + its exact **IMP-1 layer name / hatch pattern**.
**Escalation:** if the geometry/region logic stalls Sonnet after honest attempts, escalate to
Opus (Fable only if Opus also stalls).

---

## DESIGNED — ready to build (M2–M6)

> Designed by Opus against the real code (line refs are from the current files; re-Grep to
> confirm before editing). Where a block says **DECISION**, that's a product choice Opus made;
> Leo can veto before you build.

---

### M6 — Chat status-change bug fix  (Tracker · CORE)  · small · **do this first**
**Symptom:** change a unit's status in the chat → chat says "saved" → main dashboard doesn't
update (until that tab is reloaded).
**Root cause (confirmed):** `chat.html` `confirmPreview()` (`~663–746`) clones the entire
existing `/state` doc into `next` (`~675`) and only overwrites `_ts/_by/_desc` (`~707–711`),
so the write **inherits the stale `_clientId`** left by the last dashboard save. `cloud-sync.js`
`subscribeToState()` (`~303–307`) self-echo-filters: `if (remote._clientId === CLIENT_ID)
return;`. The dashboard tab that made the last edit has `CLIENT_ID` equal to that inherited id,
so it treats the chat's write as its own echo and never re-renders. `.set()` still resolves →
chat reports success.
**Fix:** in `chat.html` `confirmPreview()`, before building `payload`, stamp a **fresh unique
`_clientId`** that no dashboard tab will match — e.g. `payload._clientId = 'chat-' +
Math.random().toString(36).slice(2)` (or `delete next._clientId` then set it). One-line change
at `~707–711`. Do NOT change `cloud-sync.js`'s echo filter — it's correct.
**Also (secondary):** `api/parse.js` status enum (`~59`) is `installed/pending/issue` — add
`in-progress` so chat can set it (app.js already renders that status).
**Verify:** two browsers/tabs on the dashboard; change a status via chat; both dashboards
update within ~1s without reload.
**Constraint:** `chat.html` + `api/parse.js` are **CORE** → replicate the fix to CP2 and log in
`FEATURES.md` (per `SYNC.md`).

---

### M2 — Simpler elevation import  (Tracker + Takeoff)  · medium  · ⚠️ SUPERSEDED by M2-v2 (built, now being replaced — kept for history)
**Goal:** kill the two-step round-trip (open takeoff tool → import DXF → click "→ Tracker").
The read side is already live: `elev-cloud.js` auto-`onSnapshot`s `elevGeo` into
`window.ELEVATIONS`. Friction is entirely on the push side.
**DECISION (Opus):** do the low-risk combo that reuses existing machinery — (a) auto-push on
import, and (b) re-add the tracker's "Import DXF" button that stages the file for a headless
parse. (Full inline-in-tracker parsing is a bigger rewrite — defer.)
**Build:**
1. **Auto-push (takeoff/app.js):** after a successful DXF import (right after
   `ELEV_EXPORTS.set(...)` completes for the batch, `~1786`, or at the end of
   `appendParsedOpenings`), automatically call `exportElevationsToTracker()` when cloud is
   connected (`window.__fb`). Keep the manual "→ Tracker" button (`export-elev`) as a
   force-re-push fallback.
2. **Tracker "Import DXF" button (index.html):** re-add a header button next to the
   `🛠 Takeoff Tool` link (`~1426`). It reads a chosen `.dxf` file and stages it into the
   IndexedDB store that `takeoff/tracker-bridge.js` already consumes (`af_dxf_handoff` /
   `files` / key `"pending"` — read `tracker-bridge.js` `~11` for the exact shape), sets a
   `return` flag, then navigates to `takeoff/index.html`.
3. **Return hop (takeoff/tracker-bridge.js):** after the headless parse + auto-push completes,
   if the `return` flag is set, navigate back to `../index.html`. Net UX = one click in the
   tracker → elevations appear live.
4. **Make cloud authoritative (elevations.js):** `elevations.js` currently does
   `window.ELEVATIONS = {…}` (wholesale overwrite) and loads AFTER `elev-cloud.js`, so it only
   works by an async race. Change it to **merge as fallback** (only fill keys not already
   present) so cloud `elevGeo` always wins.
**Verify:** from the tracker, Import DXF → returns to tracker → the elevation renders in the
unit modal's Elevation tab without opening the takeoff tool manually or clicking "→ Tracker".
**Constraint:** takeoff files = `AC3 tracker\takeoff\` only (single source). `index.html` /
`elevations.js` are PROJECT files (no CP2 sync).

---

### M3 — Per-elevation Calendar tab + tab restructure + RFI  (Tracker)  · LARGE · design-review first
**Goal:** replace the modal's separate **Details(framing)** and **Glass** tabs with one
**Calendar** tab that lists install progress (status + date) for every scope of that elevation;
convert the **R.O. Field-Verify** tab into an **RFI** tab; final tab order
**Calendar / Elevation / RFI**.

**DECISIONS (Opus — Leo please confirm, they cascade):**
- **D1. Canonical per-scope model:** `u.scopes = { [scopeKey]: {status, date} }`,
  `status ∈ pending|in-progress|installed|issue` (blank = N/A), for the **unit-level** scopes
  only: `frame, caulking, beautyCap, sunshade`. Elevation-backed scopes
  (`glass, metalPanel, louver, doors`) are **not** stored here — they roll up from the
  elevation elements (see D3).
- **D2. Keep the rest of the app working via two-way mirror:** on save, sync
  `u.scopes.frame ↔ {u.status, u.date}` (so the grid, timeline and scope-cards keep working)
  and `u.scopes.beautyCap.status ↔ u.facecap`. (Glass/louver/doors/metalPanel are derived from
  elevation elements, not mirrored.)
- **D3 (CONFIRMED by Leo). Glass keeps per-unit status editing on the ELEVATION tab; the
  Calendar shows a read-only glass ROLLUP fraction** (installed/total, e.g. `2/10`). Source of
  truth = the elevation glass elements (`state.elevations[key].el[elId]`, `type==='glass'`),
  already editable per element via `openElevStatus` on the Elevation tab and already bucketed by
  `_renderElevKpis` as `bt.glass=[installed,total]`. **Drop only the separate Glass tab**
  (`glassPanels[]`); keep `glassPanels[]` data in state (untabbed). Give the same rollup
  treatment to the other elevation-backed scopes (`metalPanel/louver/doors`): the Calendar shows
  their installed/total fraction from the elevation elements; editing stays on the Elevation tab.
- **D4. RFI is per-elevation:** `u.rfi = [{ref, date, subject, status: open|answered|closed,
  party, response, dateAnswered}]`. (Project-wide RFI register is out of scope; manager wants
  it in the elevation tab.) Existing `u.ro[]` data stays stored, untabbed.

**Build:**
1. **Tabs (index.html `~2840–2845`):** reorder/replace the four `.modal-tab` divs to
   `Calendar (tab-cal) / Elevation (tab-elev) / RFI (tab-rfi)`. Remove `tab-framing`,
   `tab-glass`. Add panels `panel-cal`, `panel-rfi`; keep `panel-elev`; remove/keep-hidden
   `panel-framing`, `panel-glass`.
2. **switchModalTab (app.js `~2334`):** update the iteration array to
   `['cal','elev','rfi']`; call `renderCalendar()` when `tab==='cal'`, `renderRfiList()` when
   `tab==='rfi'`. `openUnit()` (`~2330`) initial tab → `'cal'`.
3. **Calendar tab (`renderCalendar()`):** a table, one row per applicable scope — two kinds:
   - **Elevation-backed** (`glass`, `metalPanel`, `louver`, `doors`): **read-only rollup
     fraction** `installed/total` (e.g. `2/10`) from the elevation elements (reuse
     `_renderElevKpis`'s `bt` bucketing / same count logic), with a hint "edit on Elevation
     tab". No editing here.
   - **Unit-level** (`frame`, `caulking`, `beautyCap`, `sunshade`): editable
     `[Status dropdown | Date picker]`, stored in `u.scopes` (frame mirrors `u.status/u.date`,
     beautyCap mirrors `u.facecap`).
   Row applicability per unit: always `frame`; `glass`/`metalPanel`/`louver`/`doors` if the
   elevation has elements of that type (or `u.louver==='yes'`, `isDoor(u)`); `beautyCap` if
   `u.facecap==='yes'`; `caulking`/`sunshade` as optional rows. Sort by date so it reads as a
   schedule. Move essential unit fields (`id`, `note`) into the Calendar header (they lose their
   home when Details is dropped).
4. **saveUnit() (app.js `~2467`):** persist `u.scopes`; apply the D2 mirrors; extend
   `autoLogUnitChanges` (app-log.js) to auto-log each scope status change into the matching
   daily-log category (`framing/glass/louver/caulking`; add `doors/metal-panel/sunshade/
   beauty-cap` categories to the log category list in `index.html ~3015–3022` +
   `categoryLabel()` app.js `~2293`).
5. **RFI tab (`renderRfiList()` / `readRfiRows()` / `addRfiRow()` / `removeRfiRow()`):** model
   on the existing R.O. functions (`renderRoList` `~2266`, `readRoRows` `~2280`, `addRoRow`
   `~2287`). New RFI rows auto-append a `gc-inquiry` daily-log entry (mirror how R.O. appended
   `field-verify`, app.js `~2498–2513`, and keep it **non-`auto`** so the projection engine
   won't rewrite it).
**Verify:** modal opens on Calendar; every scope row saves status+date; frame row still drives
the grid/timeline/scope-cards; RFI rows persist and log a gc-inquiry entry; tab order is
Calendar/Elevation/RFI.
**Constraint:** `app.js`, `app-log.js` are **CORE** — these changes must go to CP2 (log in
`FEATURES.md`). `index.html` is project. Big change → build behind a quick manual smoke test;
halt-and-report after 3 same-error failures.

---

### M4 — Submittal log  (Tracker)  · medium
**Goal:** a project-wide submittal register.
**DECISION (Opus):** new top-level tracker section + `state.submittals[]` in RTDB `/state`,
modeled on the existing Daily Log CRUD (`saveLog()` app.js `~2687`).
**Model:** `state.submittals = [{ id, number, title, spec, scope, submittedDate,
status: draft|submitted|under-review|approved|approved-as-noted|revise-resubmit|rejected,
rev, returnedDate, ballInCourt, note }]`.
**Build:** add a "Submittals" section/nav entry in `index.html` (follow the Daily Log section's
markup + a render function like `renderSubmittals()` in app.js reading `state.submittals`);
add/edit/delete rows via the normal `saveState()`/`render()` pattern; filter by status.
**Verify:** add/edit/delete a submittal; persists to cloud; survives reload; status filter works.
**Constraint:** `app.js` CORE → CP2 sync + `FEATURES.md`. Keep `state.submittals` optional so
existing states without it don't break (default `[]`).

---

### M5 — Material tracking table  (Tracker · warehouse.html)  · medium
**Goal:** track material lead time + delivery status.
**DECISION (Opus):** fold into the existing (currently-unconfigured) `warehouse.html`, wiring
it to AC3 cloud state; store as `state.materials[]`.
**Model:** `state.materials = [{ id, material, scope, supplier, poNumber, qty, leadTimeWeeks,
orderedDate, expectedDate, status: not-ordered|ordered|in-production|shipped|delivered|installed,
deliveredDate, note }]`.
**Build:** in `warehouse.html`, connect to the same Firebase/state as the tracker (reuse
`firebase-config.js` + the `/state` read pattern from `cloud-sync.js`); render a materials
table with add/edit/delete + a lead-time / expected-vs-delivered view; write back to
`state.materials`. Add a header link to warehouse from the tracker if not present.
**Verify:** add a material row, set expected/delivered dates + status; persists; overdue
(expected < today, not delivered) is visually flagged.
**Constraint:** `warehouse.html` is a PROJECT file (no CP2 sync). Default `state.materials` to
`[]` for old states.

---

## Suggested build order for the Sonnet chats
1. **M6** (quick, high-value bug) → 2. **M1** (quick UI) → 3. **M2** (import UX) →
4. **M4** + **M5** (independent CRUD registers) → 5. **M3** (large; confirm D1–D4 first) →
6. **S2/S3** when the 45TU DXF is available.
