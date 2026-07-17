# memory.md — AC3 Project Memory (DYNAMIC)

> **Agent-maintained.** Read this at the start of every session; update it as you work.
> This is the churn layer — it keeps `CLAUDE.md` (the cached constitution) stable.
> Keep entries terse. Newest first within each section. Prune stale items.
>
> **How to maintain:** when you (a) resolve a bug/trap, (b) hit a milestone, or (c) make a
> non-obvious decision — add one line here. Move anything permanent into `CLAUDE.md`.

---

## Current state / progress

- **2026-07-17 — Leo feedback after reviewing S3/M4/M5 (NOT yet acted on, recorded per his
  instruction — "you don't need to figure it out now"):**
  1. **New ask:** both Submittal Log (tracker) and Material Tracking (`warehouse.html`) list
     views need **manual row reordering** (change order in the list), not just sort-by-date/
     filter. Not built. Needs a design decision (drag handles? up/down buttons? a persisted
     `order` field on each row synced like everything else in `state.submittals[]`/
     `state.materials[]`?) before building — screenshot Leo sent shows the current Submittal
     Log table for reference (columns: #, title, spec section, date, status, rev, ballInCourt,
     parties, notes-preview).
  2. **Layer B (learned corrections) "not working"** — root cause: **Layer B was never built**
     as of this feedback (only the Layer A/IMP-1 slice shipped in the S3 session). **RESOLVED
     2026-07-17: Layer B is now built and verified end-to-end — see "Open items" below.**
  3. **New correction to the S3 IMP-1 spec (contradicts the previous instruction!):** Leo's
     2026-07-16 spec said "the horizontal framing member below the panel remains horizontal; do
     not rename it." Now (2026-07-17): **that was wrong / incomplete** — a horizontal member
     between two GLASS lites (`Horizontal (Glass&Glass)`) is different from a horizontal member
     between an IMP-1 panel and glass (`Horizontal (IMP-1&Glass)`), and the current code labels
     both simply `Horizontal`. The `Horizontal (IMP-1&Glass)` variant is NOT currently detected
     — this is a real, not-yet-built classification gap, not a bug in existing code (existing
     code is doing exactly what was originally specified). **Do not build this yet** — needs a
     clear, stable spec from Leo first given the instruction reversal (what exactly
     distinguishes `(IMP-1&Glass)` from `(Glass&Glass)`? Is it always the member directly
     bordering the panel band on both the head AND sill side, or only one? Does `Head` need the
     same `(IMP-1&Glass)` treatment, or only the "horizontal below" role Leo specifically
     called out?).
  4. **Leo's meta-feedback, verbatim in spirit:** he is frustrated with the back-and-forth
     iteration on DXF classification logic ("I am so tired of back and forth and this workflow
     is not even sustainable. We need to figure out a better way, that develops the detection
     without making new mistakes."). This is a standing process concern, not a task — **explicitly
     not to be solved now**, just recorded. Candidate root causes worth considering in a future
     session (not yet analyzed/decided): (a) classification specs have been arriving in
     increments with each new increment sometimes reversing the previous one (Sill(normal)/Head
     swap → "don't touch head/horizontal" → now "actually horizontal needs an IMP-1 variant
     after all") — a single upfront visual reference (e.g., Leo marking up a screenshot/PDF of
     one full elevation with every role name once, sent BEFORE any code is written) might avoid
     repeated guess-then-correct cycles; (b) `dxf-cli.js` (built for T1) already gives a fast
     compact per-mark/per-role text summary — consider whether a visual (SVG/image) diff output
     would let Leo catch classification mistakes faster than reading role/count tables; (c)
     consider batching ALL of Leo's classification corrections into one spec pass before
     touching code again, rather than building incrementally per message.
- **2026-07-16 backlog CLEARED (Sonnet):** every item in `SONNET-HANDOFF.md`'s ⭐ NEW section
  (T1, S4, M2-v2, optional #11) is now built + verified as far as the agent sandbox allows
  (Node-harness parser regression checks; Firestore/browser behavior needs Leo). **Still
  outstanding, user-side only:** (1) push all this session's code to GitHub for Vercel to
  redeploy (nothing is live until then); (2) manual browser smoke test of M2-v2's Import DXF
  button + cross-tab `elevGeo` sync; (3) CP2 core-sync of every CORE file touched this whole
  project (`app.js`, `app-log.js`, `chat.html`, `api/parse.js`) — not yet done, per `SYNC.md`;
  (4) S3 (gasket/auto-propagation) is still doc-only per Leo's 2026-07-16 instruction — not
  built.
- **New PROJECT file: `dxf-elevations.js`** (tracker root) — system-independent geometry-only
  DXF parser for the tracker's own "Import DXF" button (M2-v2). No CP2 sync (project file).
- **Mirror rule RETIRED (2026-07-16):** takeoff is now single-source in `AC3 tracker\takeoff\`;
  `Downloads\takeoff tool\` is deprecated — do not edit it.
- Takeoff **#1 (persist manual edits)** and **#2 (per-system role whitelist)** shipped in
  code (`app.js?v=20260715a`). **Pending user actions:** (a) publish the Firestore rule for
  the new `elevEdits` collection; (b) push `takeoff/app.js` + `index.html` to GitHub for
  Vercel to deploy.
- Takeoff **#3 (gasket)** + **#4 (auto-propagation)** are **designed, not built** — see
  `takeoff/PROPAGATION-DESIGN.md`. Blocked on the 45TU DXF (see Open items).
- **Manager backlog M1–M6 (2026-07-16) — all DESIGNED; build blocks in `SONNET-HANDOFF.md`,
  ready to run in fresh Sonnet chats.** M6 (chat bug) diagnosed → root cause = stale
  `_clientId` inherited by `chat.html confirmPreview()` → dashboard self-echo-filters it in
  `cloud-sync.js ~307`; fix = stamp a fresh `_clientId` in the chat write. **M3 is large and
  has 4 product DECISIONS (D1–D4) awaiting Leo's OK before build** (per-scope `u.scopes` model;
  glass simplifies to one status/elevation; RFI per-elevation). Suggested build order in the
  handoff: M6 → M1 → M2 → M4/M5 → M3 → S2/S3 (DXF-gated).

## Milestones

- **2026-07-17 (Sonnet)** — S3 built: IMP-1 hatch detection (real HATCH-boundary parser) +
  Jamb(IMP-1)/Vertical(IMP-1) classification + gasket double-count bug fix, 750XT-only.
  Verified geometrically correct on real DXFs; gasket LF totals still below Leo's hand
  numbers — flagged as an open item needing his input, not further guessed at. Full writeup
  below under "S3".
- **2026-07-16 (Sonnet)** — M2-v2 built: tracker imports DXF geometry itself (new
  `dxf-elevations.js`, system-independent), no more navigate-to-takeoff round-trip; takeoff
  now writes material into `elevGeo/{mark}.takeoff` only. Verified byte-identical geometry vs
  the production parser on real 45TU.dxf + south.dxf. See Open items for full detail.
- **2026-07-16 (Sonnet)** — S4 fixed: system now confirmed BEFORE DXF parse (not after) at all
  three import entry points + tracker-bridge's headless path; verified against real 45TU.dxf
  and south.dxf (no regression) via `dxf-cli.js`. See Open items for full detail.
- **2026-07-16 (review)** — Diagnosed Leo's "door still detected as frames" against the real
  `45TU.dxf` (Opus harness): **root cause = system misidentified as IR501T**, not a whitelist
  bug (see Open items S4). Redesigned M2 → in-tracker region import (M2-v2). Both specced in
  `SONNET-HANDOFF.md`.
- **2026-07-16** — Designed all of M2–M6 (Opus) against the real code; appended build-ready
  blocks to `SONNET-HANDOFF.md`. Chat bug root cause found (stale `_clientId` self-echo).
- **2026-07-16** — Retired the takeoff mirror rule (single-source now); triaged the manager's
  M1–M6 backlog by model; wrote `SONNET-HANDOFF.md` for the build tasks.
- **2026-07-16** — Restructured project docs into dual-track: static `CLAUDE.md` constitution
  + this dynamic `memory.md` + `.claudeignore`.
- **2026-07-15** — Wrote `takeoff/PROPAGATION-DESIGN.md` (#4 auto-propagation + #3 gasket
  unified around reading the IMP-1 layer/hatch).
- **2026-07-15** — Takeoff #1: manual elevation edits (split/merge/role/length/count) now
  persist to Firestore `elevEdits/{mark}` (project `elevDb`) with a geometry signature, shared
  across browsers/Vercel; restored on re-import when geometry matches.
- **2026-07-15** — Takeoff #2: role detection constrained per system (allowed roles derived
  from `SYSTEM_DEFS`); 45TU no longer leaks `Door Jamb At Transom` / `Outside 90° Corner` /
  `Subsill`. Verified with a Node test harness (12/12 checks).

## Resolved traps / bugs (knowledge base — don't re-learn these)

- **bash mount serves STALE/TRUNCATED snapshots** of just-edited files (esp. OneDrive files
  like `AC3 tracker/**`). Symptom: `node --check` reports a spurious "Unexpected end of input"
  at the truncation line; `wc -l` short by ~100 lines. **Trust the `Read` tool for content.**
  To syntax-check freshly-edited code, run the logic in isolation with stubs, or reconstruct
  from `Read`-tool content — do not trust bash's view of the file.
- **Firestore is unreachable from the agent sandbox** (no network). Can't push/verify cloud
  data directly — guide the user or use the running page's UI.
- **New Firestore collection = silent failure until allow-listed.** Rules deny everything
  except explicitly matched collections. Adding a collection (e.g. `elevEdits`) requires a
  rule in the Firebase Console (`takeoff/FIRESTORE-SETUP.md`), or writes fail quietly.
- **OneDrive makes silent conflict copies** on concurrent edits. Always use the `EDITING.lock`
  protocol (CLAUDE.md §4). Deleting files in the OneDrive folder from bash needs the
  file-delete permission tool.
- **Missing / oddly-named DXF layers** must be handled gracefully — the parser can't assume a
  layer exists; fall back to geometry-based classification.
- **Two mirror copies drift.** Takeoff `app.js` etc. must be kept byte-identical across
  `Downloads\takeoff tool\` and `AC3 tracker\takeoff\` (verify `md5sum`).
- **Node parser harness recipe (real-DXF verification):** `head` the (bash-truncated) file +
  `Read`-tool tail for the dxf* helpers + a minimal `window.SYSTEM_DEFS` stub → eval. Used for
  the louver-classification fix; use it before any handoff of deterministic parser logic.

<!-- Rhino/AutoCAD API notes (e.g. Rhino 7 vs 8 RhinoCommon compat) go here IF live CAD
     scripting is added later. Not applicable to the current DXF-parse-only stack. -->

## Open items / next actions

### 2026-07-17 — Leo feedback, NOT yet built (see "Current state" above for full detail)
- [x] **Manual row reordering BUILT (2026-07-17, Sonnet).**
      **Submittal Log** (`index.html`/`app.js`, CORE): `renderSubmittals()` already iterated
      `state.submittals` in plain array order (no auto-sort existed) — added ↑/↓ buttons as a
      new leading table column; `moveSubmittal(idx, dir)` swaps the row with its adjacent
      VISIBLE neighbor (recomputes the same status filter internally, so arrows always match
      what's on screen even when filtered) by swapping the two real array slots in
      `state.submittals`, then `saveState(false)` (no toast spam per click — persists/syncs
      exactly like any other submittal edit). **Material Tracking** (`warehouse.html`, project
      file): this one WAS always auto-sorted by `expectedDate`, which would fight any manual
      order — added a "Sort: Expected Date / Manual order" dropdown (per-browser
      `localStorage` preference, not synced state) next to "+ Add"; manual mode renders
      `materialsList` in stored array order and shows ↑/↓ per row, `moveMaterial(id, dir)`
      swaps + calls `pushMaterials()` (the same fetch-full-`/state`-then-fresh-`_clientId`
      write already used by add/edit/delete, from M5). Both verified via direct `Read`-tool
      inspection line-by-line (bash mount truncated both files again mid-script on every
      attempt — same known trap, see "Resolved traps"; not a real syntax issue). CORE
      (`app.js`) → bumped `app.js?v=20260717a` in `index.html`; still needs CP2 sync +
      `FEATURES.md` log (not done). `warehouse.html` → no CP2 sync, no `?v=` (inline script).
- [x] **Gasket visualization (2026-07-19, Sonnet): both gasket types now drawn directly on the
      elevation, per Leo's request ("gasket takeoff is still not accurate... draw gasket lines
      so I can know how you do the takeoff").** `takeoff/app.js?v=20260719c`.
      `buildElevExport` now draws, into the exported SVG `base`: (1) infill gasket — TWO dashed
      loops (inner+outer ring, standing in for interior+exterior) per counted glass/IMP-1 cell,
      teal for E2-0127 glass, orange for E2-0120 IMP-1; (2) perimeter gasket — one bold gold
      outline per independent zone (main zone: full width × actual Head-to-Sill height; louver
      zone, if present: its own band extents). Inset amounts are visual only, don't affect the
      LF numbers (unchanged, computed from the same raw cell/zone rects as before). This SVG is
      what already gets pushed to the tracker's `elevGeo`, so it's visible there too, but also
      viewable directly in the takeoff tool without needing Firestore: added a "🧵 Gasket
      diagram" toggle button in the elevation viewer (next to the framing view), with a legend
      (cell-type colors + gasket-line colors + the mark's current glass/IMP-1/perimeter LF).
      **Verified**: harness dump of a real mark (south.dxf SF04.1) confirms line counts match
      exactly — 24 teal loops for 12 glass cells (2 each), 8 orange loops for 4 panel cells (2
      each), 2 gold perimeter loops (main zone + louver zone) — geometry matches the numbers
      being reported, nothing hidden or double-drawn. Full prior regression suites (10-test
      IMP-1/gasket harness, 45TU, SF01 pin/history) re-run clean, no regressions.
      **On accuracy**: Leo said the gasket takeoff is still not accurate, without a new specific
      number this time (unlike the earlier 3,326/5,982 hand-count gap). Rather than guess at
      another blind formula tweak — the mistake already made once (see §2 "S3 bug fix" note) —
      the diagram is the tool for him to point at exactly which cell/loop looks wrong; a spot
      check of one real mark shows the code doing exactly what it says (no hidden double-count),
      but that doesn't rule out a wrong CLASSIFICATION (a cell that should be glass showing as
      panel, a zone boundary in the wrong place, etc.) — needs Leo to look and point.
- [x] **Calendar-tab bulk edit for elevation-backed scopes (2026-07-20, Sonnet), CORE (`app.js`
      → bumped `app.js?v=20260720a` in `index.html`).** Leo's screenshot showed Glass/Louver rows
      on the Calendar tab as pure read-only rollups ("0 / 16", "edit on Elevation tab" hint) — he
      asked to "enable edit on Calendar tab." `renderCalendar()`'s non-editable row branch
      (glass/metalPanel/louver/doors — these are element-count rollups, not single fields) now
      renders a status dropdown + date input + "Apply to all" button alongside the frac; new
      `applyCalendarBulkScope(scope, btnEl)` reads the sibling `.cal-bulk-status`/`.cal-bulk-date`
      values from the clicked button's row, maps scope→element type via `CAL_BULK_SCOPE_TYPE`,
      builds the same element list `_elevScopeCounts`/`renderElevation` use, filters to matching
      non-deleted elements, confirms (states count + overwrite warning), then bulk-writes
      `S.el[id] = {...status, date}` per element (same shape as `saveElevStatus`'s per-element
      write) and calls `saveState(); renderCalendar(); renderElevation();`. Deliberately wired as
      its own explicit action (inline `onclick`, matching the file's existing convention for
      dynamically-generated buttons) — NOT read by `readCalendarScopes()`/the modal's main Save,
      so a stray dropdown pick can never silently bulk-overwrite individually-tracked element
      progress just because Save was clicked for an unrelated reason. Per-piece editing on the
      Elevation tab still works unchanged; this just adds a fast bulk path. Verified via
      `node --check` on a clean reassembly (bash mount hit the same stale-truncation trap again
      at a new byte offset — see "Resolved traps"; real file via `Read` tool is intact, 3569
      lines). **Still needs**: CP2 core-sync + `FEATURES.md` log (outstanding backlog item, not
      unique to this change — see other CORE changes below).
- [x] **DATA LOSS (2026-07-19): SF01's Firestore `elevEdits` was overwritten by the automatic
      Stage 2 reclassification (§13 below), with no way to recover the old value.** SF01 is a
      hand-built special case (`elevations.js`: "SF01 hand-built; SF04-SF10 auto-generated") —
      its classification must have been manually set at some point, but Stage 2 reclassifies
      EVERY vertical-family piece by geometry on every restore, with no notion of "this piece
      was deliberately hand-set, leave it alone." Leo confirmed the Firestore doc is already
      overwritten (no version history existed there) and there is no automated backup for
      `elevEdits`/`elevGeo`/`roleRules` (the nightly GitHub Action backs up ONLY the tracker's
      Realtime DB `/state`+`/history`, confirmed by reading `.github/scripts/backup-state.js` —
      it never touches Firestore). No Firebase/Firestore MCP connector is available either (`ToolSearch`/registry search both empty) — **I have no way to connect to or query Firestore
      directly**, and even if I could, nothing there retains the pre-overwrite value. **SF01's
      original classification is very likely permanently lost** — told Leo this plainly rather
      than guessing at a recovery path. Path forward: if he can redescribe SF01's correct
      classification, re-set it via the viewer dropdown — it will now be permanently pinned (see
      §13 below) and never get silently reclassified again.
- [x] **FIX (2026-07-19, Sonnet): pin manual role overrides against auto-reclassification +
      elevEdits version history (≥5 versions), to prevent a repeat of the SF01 loss.**
      `takeoff/app.js?v=20260719a`. Two independent safeguards:
      (1) **Pin protection** — `classifyRoles` now applies `state.roleEdits[mark]` (the
      viewer dropdown's per-piece manual overrides) as a final pass AFTER Stage 1/2 + whitelist
      + Layer B, so an explicit manual role choice always wins and is never silently
      reclassified by geometry again. This is what should have protected SF01 if its
      classification had gone through the dropdown.
      (2) **Version history** — `persistElevEdits` now keeps up to 5 prior versions nested in
      the same `elevEdits/{mark}` Firestore doc (`rec.history`, newest first, only pushed when
      something actually changed), so any future overwrite — pinned piece or not — is
      recoverable from inside the app without needing an external backup. New
      `restoreElevEditsVersion(mark, idx)` restores a version (itself saving the current one to
      history first, so restoring is never a dead end). Viewer UI: a "🕐 Version history (N)"
      expandable list with a Restore button per version, next to the existing "saved edits ·
      clear" line.
      (3) **Drift warning** — even for NON-pinned pieces, if restoring a saved snapshot causes
      Stage 1/2 to reclassify something differently than what was saved, this is now detected
      and surfaced as a visible orange warning banner in the viewer ("N piece(s) changed from
      your saved version...") plus a console.warn, instead of silently flowing through
      unnoticed into the next save — this is what would have caught the SF01 problem before it
      became unrecoverable.
      **Verified**: new 7-check harness — explicit pin survives reclassification; history is
      created only on real changes; a restored version exactly matches the pre-edit state; the
      version being replaced is itself preserved in history (restore isn't a dead end); history
      caps at 5. All prior regression suites (10-test IMP-1/gasket suite, 45TU) re-run clean, no
      regressions.
      **Known gap**: pin protection only covers pieces corrected via the viewer's Position
      dropdown (`state.roleEdits`). A piece whose "special" classification came from some other
      path (e.g. was simply never touched because old logic happened to get it right) has no
      pin and can still drift — the drift warning is the safety net for that case; there's no
      way to distinguish "correct by luck" from "correct by geometry" after the fact.
- [x] **MAJOR REWORK (2026-07-18, Sonnet, per Leo's detailed spec): two-stage IMP-1 vertical
      classification + gasket infill/perimeter separation + per-zone perimeter + boards
      double-count fix.** `takeoff/app.js?v=20260718b`. Full detail in
      `takeoff/PROPAGATION-DESIGN.md` §13. Summary:
      (1) **Two-stage classification** (`classifyRoles`): Stage 1 unchanged (splits a WHOLE
      unsplit vertical spanning a band into 3 pieces). NEW Stage 2 reclassifies EVERY
      vertical-family segment (freshly split, DXF-native multi-segment, or restored from a
      snapshot already split into plain-labeled pieces) by its own geometric overlap with the
      band — fixes the real gap: a segment that was never one continuous whole piece (Leo's
      "cut the jamb" case — an already-split saved snapshot) could never satisfy Stage 1's
      "spans the whole band" test and stayed permanently mislabeled. `normalizeImp1RoleToBase`/
      `toImp1Role` preserve the Jamb vs Vertical vs Vertical (wide) family identity throughout.
      (2) **Gasket infill vs perimeter separated** into distinct semantic keys
      (`imp1`/`glass`/`perimeter`) all the way through `buildElevExport` → `gasketLF` →
      `computeAccessories` — no longer summed into one E2-0120 number (Leo: "两套独立
      takeoff,不能混在一起").
      (3) **Per-zone perimeter**: confirmed via real DXF inspection (south.dxf SF04.1) that a
      louver band is its own fully-framed sub-opening (own head/sill/jambs, distinct Y-range,
      separated by a structural gap) even though it shares one mark/bbox with the main glass/
      IMP-1 zone — each zone now gets its own E2-0120 perimeter contribution (louver zones get a
      perimeter gasket despite zero infill, per Leo's rule). Main-zone extent is derived from
      actual classified Head/Sill Y-positions, not the raw bbox.
      (4) **`boards` no longer contributes gasket** — it's a pure geometric heuristic (flat
      structural polyline, no hatch check), not a confirmed IMP-1 signal per Leo's hatch-only
      rule; it either duplicated an already-hatch-confirmed panel (double count) or asserted
      IMP-1 with zero confirmation. Now emits its visual element only (elevation-view
      reference), contributes nothing to `G.panel`.
      **Verified**: 10-test harness (matching Leo's exact list) — 14/14 checks pass, including
      the specific "already-3-segment stale snapshot with plain roles" case (Test 3) that the
      2026-07-18 root-cause fix above did NOT cover. Real counts across south/north/east/
      west.dxf (750XT): Jamb (IMP-1)=43, Vertical (IMP-1)=56, Vertical (wide IMP-1)=3 (unchanged
      from S3 — confirms no regression). Gasket LF: E2-0127 glass infill=3,326.1, E2-0120 IMP-1
      infill=910.6, E2-0120 storefront perimeter=1,782.4 (19 of 22 marks have a louver zone,
      each contributing its own extra perimeter). 45TU regression clean.
      **Open/unresolved** (see PROPAGATION-DESIGN.md §13 for full detail): (a) Section 6's 4th
      cell-classification tier ("Unknown/Ambiguous", vs. silently defaulting to Glass) has no
      concrete detection signal yet — flagged to Leo rather than guessed; (b) the "two
      independent storefronts as two separate marks/clusters" case (side-by-side, not
      stacked-within-one-mark) was not reproducible in the 4 available real fixtures — the
      stacked-within-one-mark case (louver above / main below) IS reproduced and fixed; a
      cross-mark case needs a concrete example if Leo has one; (c) the still-open
      `Horizontal (IMP-1&Glass)` gap (needs Leo's spec) is unchanged by this rework.
- [x] **ROOT-CAUSE FIX (2026-07-18, Sonnet): stale `elevEdits` snapshot was masking IMP-1/
      Glass&Glass/Layer B on every re-import.** `takeoff/app.js?v=20260718a`. Leo reported (a)
      manually correcting a jamb to `Jamb (IMP-1)` didn't generalize to later imports, and (b)
      the IMP-1 classification itself seemed to disappear on later imports of a mark he'd
      touched — both traced to the SAME bug: `parseRawDxfOpenings`'s per-mark full-snapshot
      restore (`state.elevEdits[mark]`, the #1 "persist manual edits" feature) ran AFTER IMP-1
      band classification + Glass&Glass + Layer B, and — whenever a saved snapshot existed for
      that mark with a matching geometry signature — wholesale overwrote the freshly-computed
      `cuts` array with whatever was saved, permanently freezing that mark's roles at
      save-time. Any mark Leo had ever manually edited (e.g. a split) got a full snapshot saved,
      so all of S3/Layer B's improvements were invisible on that mark from then on, forever —
      this is exactly why my end-to-end Layer B harness test (which used marks with no existing
      snapshot) passed while Leo's real test (on an already-edited mark) failed.
      **Fix:** factored the 750XT classification pipeline (IMP-1 band split → Horizontal
      (Glass&Glass) → whitelist → Layer B) into a reusable `classifyRoles(cuts, ctx)`, called
      once on the fresh parse AND again on the restored snapshot's cuts before pushing to
      `openings`. Idempotent by construction — the IMP-1 split step only acts on a WHOLE
      (unsplit) vertical spanning a full band, so already-split/labeled restored pieces pass
      through unchanged; only genuinely stale (pre-classification) pieces get (re)classified.
      Saved splits/lengths/custom edits are untouched — only role labels stay live.
      **Verified** via harness: reconstructed a faithful "pre-IMP-1" stale snapshot (merged
      split IMP-1 segments back into whole plain-labeled members, matching what a real snapshot
      saved before S3 existed would look like), injected it as `state.elevEdits`, re-parsed —
      restored role counts matched a fresh parse exactly (Jamb/Jamb(IMP-1)/Vertical/
      Vertical(IMP-1) all correct). Also confirmed a Layer B learned rule still applies on top
      of a restored stale snapshot. 45TU regression-checked clean.
- [x] **Layer B (learned corrections) BUILT + `Horizontal (Glass&Glass)` FIXED (2026-07-17,
      Sonnet).** `takeoff/app.js?v=20260717b`, `takeoff/systems.js`.
      **Layer B:** `computeRoleSignature(cut, ctx)` derives `{system, orientation(V/H),
      sizeClass(narrow/wide), band(perimeter/interior/transom), borders(glass/imp-1/louver/
      door)}` from a cut's geometry + the opening's `_bands` context (bbox, imp1Bands,
      louverBand, doorRegions — now stored on every opening object at parse time).
      `persistRoleRule(system, sig, role)` upserts one rule per unique signature into
      `state.roleRules[system]` (dedup by signature key, freshest wins) and pushes to Firestore
      `roleRules/{system}` (merge, same pattern as `elevEdits`). `applyLearnedRoleRules(cuts,
      ctx)` runs after `applyRoleWhitelist` on every parse and overrides any cut whose computed
      signature matches a stored rule. The `#vc-pos` manual-role-change handler now calls
      `persistRoleRule` in addition to the existing mark-specific `roleEdits` override, so any
      manual correction Leo makes in the elevation viewer is learned generally (any mark, this
      system) as well as remembered for that exact piece. `loadRoleRulesFromCloud()` fetches all
      `roleRules/*` docs on `fb-ready`. **Verified end-to-end** via Node harness: manually
      persisted a rule for a real cut's signature, re-parsed the same DXF from scratch, and
      confirmed all 40 OTHER cuts sharing that exact signature (across all 4 elevations) picked
      up the learned role automatically — this is what was reported as "not working" before
      (it was simply never built). **Caveat to flag to Leo:** signatures are intentionally
      generic (not per-piece), so one correction can relabel many cuts at once by design — a
      correction on a "narrow interior vertical bordering glass" piece will apply to every other
      cut with that same signature, not just the one edited.
      **Horizontal (Glass&Glass):** new deterministic rule (750XT only) — any cut still plain
      `Horizontal` after all other classification steps that does NOT touch/cross an IMP-1 band
      is relabeled `Horizontal (Glass&Glass)` (glass on both sides, by construction). Verified:
      84 instances detected across south/north/east/west.dxf; 91 remain plain `Horizontal`
      (all IMP-1-band-adjacent) — count matches the prior S3 harness's total `Horizontal: 175`
      exactly (84+91), confirming a clean split with no cuts gained/lost. 45TU regression-
      checked clean (no `Glass&Glass` label, no `roleRules` entries leak into 45TU parses).
      `ROLE_REMAP` + `systems.js` (E9-1206, AS-3906, BE9-3910, E1-3603, E2-0513) updated to
      accept the new role name.
      **Still NOT built (needs Leo's spec, per below):** `Horizontal (IMP-1&Glass)` — the 91
      remaining plain-`Horizontal` cuts stay unrenamed pending a firm rule.
      **New user action:** publish a Firestore security rule for the new `roleRules` collection
      (same one-time step `elevEdits` needed) or Layer B's cloud sync will silently fail.
- [ ] **`Horizontal (IMP-1&Glass)`** — new classification variant needed for a `Horizontal`
      member bordering an IMP-1 band (contradicts the prior "don't touch horizontal"
      instruction). **Get a firm, single spec from Leo before touching this code again** — do
      not guess at the exact geometric rule from a one-line message given the instruction
      already reversed once. (Note: `Horizontal (Glass&Glass)` — the non-IMP-1-adjacent case —
      is now built; see above. This item is only the remaining IMP-1-adjacent case.)
- [ ] **Process concern (not a task):** Leo wants a more sustainable classification-development
      workflow (fewer back-and-forth correction cycles). See "Current state" 2026-07-17 entry
      #4 for candidate ideas (upfront visual markup, visual diff output, batched spec passes) —
      unanalyzed, for a future session to pick up deliberately, not mid-task.

### Manager backlog (2026-07-16) — all DESIGNED; full build specs in `SONNET-HANDOFF.md`
- [x] **M1/S1 FIXED (2026-07-16):** scope-card headline now shows `installed/planned` (plan
      scopes: extSf/intSf/entryDoors/slidingDoors/hmDoors → `.sc-inst`/`.sc-placed`) or
      `done/total` (piece scopes: louvers `/89`, sunShade `/19`, glassGL3 `/1`) — HTML-only
      diff, no JS change needed since `paintCard` already fills those classes everywhere. Free-
      count scopes (metalPanel/glassGL1/glassGL2) left as plain count. Project file (index.html)
      → no CP2 sync needed.
- [x] **M2 BUILT (2026-07-16):** `takeoff/app.js appendParsedOpenings` (~2346) now auto-calls
      `exportElevationsToTracker()` after save() when `ELEV_EXPORTS.size && window.__fb` (manual
      "→ Tracker" button stays as force-re-push fallback); bumped `?v=20260716a`. Tracker
      `index.html` header has a new "⬆ Import DXF" button + `stageDxfForTakeoff()` (stages into
      `af_dxf_handoff/files/"pending"`, sets `localStorage.af_dxf_return`, navigates to
      `takeoff/index.html`). `takeoff/tracker-bridge.js` return-hop: after
      `appendParsedOpenings` resolves, if `af_dxf_return` is set, clears it and navigates back to
      `../index.html` after 600ms; bumped `?v=20260716a`. `elevations.js` line 2 changed from a
      wholesale `window.ELEVATIONS={...}` to `window.ELEVATIONS=Object.assign({...},
      window.ELEVATIONS)` so cloud entries already loaded by `elev-cloud.js` survive (fixes the
      async race — static seed is now fallback-only). **Verify in browser** (bash mount served a
      stale/truncated view of `elevations.js`/`tracker-bridge.js` right after editing — known
      OneDrive trap; edits were confirmed correct via `Read`/`Grep` tool, not bash).
- [x] **M3 BUILT (2026-07-16):** tab order is now Calendar/Elevation/RFI (`tab-cal`/`tab-elev`/
      `tab-rfi`, `panel-cal`/`panel-elev`/`panel-rfi`); Details and Glass tabs are gone.
      `app.js`: `renderCalendar()` + `readCalendarScopes()` + `_elevScopeCounts()` (new,
      standalone copy of `_renderElevKpis`'s bucketing — didn't touch the working original);
      `u.scopes = {frame,caulking,sunshade,beautyCap}` each `{status,date}`; D2 mirror
      `scopes.frame → u.status/u.date` and `scopes.beautyCap.status==='installed' → u.facecap
      ='yes'` applied in `saveUnit()`. RFI tab (`renderRfiList/_rfiRowsRaw/readRfiRows/
      addRfiRow/removeRfiRow`, modeled on the old R.O. functions) stores `u.rfi[]` and
      auto-logs new rows as non-auto `gc-inquiry` entries. `openUnit()` default tab is now
      always `'cal'`. Added 4 log categories (`doors/metal-panel/sunshade/beauty-cap`) to the
      Daily Log checkbox list + `categoryLabel()`; `autoLogUnitChanges` (app-log.js) extended
      to auto-log caulking/sunshade/beautyCap installed→category, issue→'issue' (same
      sweep-then-add pattern as frame/louver). Bumped `?v=` for `app.js`, `app-log.js`,
      `elevations.js` in `index.html` (the M2 elevations.js fix hadn't been bumped either —
      caught and fixed now).
      **Judgment calls made without stopping to ask (Leo authorized proceeding through the
      whole backlog):** (1) kept `u.louver`/`u.facecap` as small header dropdowns on the
      Calendar tab (`cal-louver`/`cal-facecap`) instead of dropping them — they drive plan-
      marker CSS, map popovers, KPI counts and timeline dot categorization elsewhere in
      app.js, so removing their only edit UI would've frozen a widely-used field; the Calendar
      **rows** for louver/doors are still the read-only elevation rollup per D3, gated to also
      show when `u.louver==='yes'` / `isDoor(u)` even with no elevation. (2) Glass tab drop is
      literal — `u.glassPanels`/`glassNote` data stays stored but now has **no edit UI at all**
      for units without elevation geometry (only elevation-backed units can still edit glass,
      via the Elevation tab's element popup); flagging this trade-off since it's a real
      functionality loss for non-elevation units, not just a UI simplification. (3) Old R.O.
      tab/functions (`renderRoList` etc.) left in app.js unused/uncalled rather than deleted —
      `u.ro[]` data stays stored, untabbed, per D4. (4) `roTab` feature-module toggle
      (`FEATURE_MODULES`) repointed from `#tab-ro` to `#tab-rfi` so it stays meaningful.
      **Not yet done:** replicate to CP2 (CORE: app.js, app-log.js) + log in `FEATURES.md`;
      manual smoke test in a browser (build-time verification only — syntax-checked via
      `Read`/`Grep` due to the recurring bash stale-mount trap, never opened in an actual
      browser).
- [x] **M4 BUILT (2026-07-16):** submittal log — `state.submittals[]` (`{id, number, title, spec,
      scope, submittedDate, status, rev, returnedDate, ballInCourt, note}`). New "📋 Submittal
      Log" section in `index.html` (after the Unit Detail Table, before the footer) + a
      `submittalModal`. `app.js`: `renderSubmittals()` wired into `render()`, `setSubmittalFilter`,
      `openAddSubmittal/editSubmittal/saveSubmittal/deleteSubmittal(FromModal)/
      closeSubmittalModal`, defaults `remoteState.submittals` to `[]` in
      `_cloudApplyRemoteState` (same pattern as `log`/`positions`). CORE (app.js) → still needs
      CP2 sync + `FEATURES.md` log. Bash `node --check app.js` hit the known stale-OneDrive-mount
      trap (memory.md "Resolved traps") on an unrelated line — verified correct via `Read`/`Grep`
      instead.
- [x] **M5 BUILT (2026-07-16):** material tracking — new "📦 Material Tracking" card in
      `warehouse.html` (below Recent), `state.materials[]` (`{id, material, scope, supplier,
      poNumber, qty, leadTimeWeeks, orderedDate, expectedDate, status, deliveredDate, note}`),
      overdue flag when `expectedDate < today` and not delivered/installed. Reads live via
      `fbDb.ref('state/materials').on('value',...)` (cascades under the existing `/state`
      RTDB rule — no rule change needed); writes fetch the full `/state` doc and stamp a fresh
      `_clientId` before `.set()` (`pushMaterials()`), same anti-self-echo pattern as the M6
      `chat.html` fix, so an open tracker tab's `cloud-sync.js` listener doesn't ignore
      warehouse-originated changes. Gated by the same `isEditor` allowlist check already on
      this page. `app.js _cloudApplyRemoteState` now also defaults `remoteState.materials` to
      `[]` (same as log/positions/submittals). Project file (warehouse.html) → no CP2 sync.
- [x] **M6 FIXED (2026-07-16):** `chat.html confirmPreview()` now stamps a fresh
      `_clientId: 'chat-' + Math.random()...` on the payload (~line 707-712) so the dashboard's
      self-echo filter (`cloud-sync.js ~307`) no longer swallows chat writes. Added
      `in-progress` to the `status` enum in `api/parse.js` (~line 59). Both files are CORE →
      still needs: replicate to CP2 + log in `FEATURES.md`; user to push/deploy.

### 2026-07-16 review — Leo's post-build issues (specs in `SONNET-HANDOFF.md` ⭐ NEW section)
- [x] **#1 persistence "gone on Vercel" — clarified (Leo 2026-07-16): the `elevEdits` rule WAS
      published yesterday; what was missing is the #1 CODE never reached Vercel.** So Vercel ran
      old code (no `persistElevEdits`/`loadElevEditsFromCloud`) → nothing saved/loaded there.
      Recovery: edits made on the LOCAL build (has #1 code) with the rule live are in that
      browser's localStorage (`state.elevEdits`) and, if the rule was live at edit time, also in
      Firestore. **Recover by:** (1) deploy the #1 code to Vercel; (2) if any mark is missing,
      open the local build's console and push local→cloud (snippet given to Leo). Edits made only
      on OLD-code Vercel were never saved = unrecoverable. FIRESTORE-SETUP.md now in active folder.
- [x] **Optional #11 BUILT (2026-07-16, Sonnet): elevEdits one-time cloud self-heal.**
      `loadElevEditsFromCloud` (`takeoff/app.js` ~385) now snapshots `state.elevEdits` (the
      localStorage copy) BEFORE merging the fresh cloud snapshot on top, then diffs: any mark
      present locally with saved cuts but absent from the cloud collection gets pushed up via
      the same `setDoc(...,{merge:true})` pattern `persistElevEdits` uses. Runs every load;
      no-op once a mark is synced (skipped once the cloud has it). Self-heals exactly the
      pre-deploy gap described above ("#1 persistence gone on Vercel" — edits saved locally
      while the Firestore rule wasn't live yet). Bumped `takeoff/app.js?v=20260716e`.
      Syntax-verified via the usual `Read`-confirmed + bash-truncated-copy `node --check`
      workaround (bash mount trap, see Resolved traps); parser regression-checked unaffected
      (45TU.dxf via `dxf-cli.js`-style harness, unchanged output). **Not verifiable further
      from the agent sandbox** — needs a real browser + live Firestore + an actual local-only
      mark to observe the push (Firestore is unreachable from the agent sandbox).
- [x] **T1 BUILT (2026-07-16):** `takeoff/tools/dxf-cli.js` — loads `systems.js`+`app.js` in a
      Node `vm` sandbox (same stub pattern as the harness), calls
      `parseRawDxfOpenings(text, {forcedSystem})` directly, prints a compact per-mark/per-role
      summary (never raw geometry). Flags: `--system`, `--mark`, `--json`, `--baseline f.json`
      (diff + exit 1 on any change), `--save-baseline f.json`. `takeoff/tools/README.md` added.
      **Gotcha found+fixed:** repo root `package.json` has `"type":"module"`, which broke the
      CLI's `require()` (Node treats every `.js` under the repo as ESM by default) — added
      `takeoff/tools/package.json` with `{"type":"commonjs"}` to scope CommonJS back on for
      just this folder, without touching the root config (used by the Vercel API functions).
      **Verified working** (parse, `--mark`, `--json`, `--save-baseline`/`--baseline` round-trip
      all tested) — but only by copying a safely-`head`-truncated `app.js` into a scratch temp
      dir first, since my own bash sandbox still can't read the real OneDrive `app.js` past
      ~line 2467 (same known trap). **This is agent-sandbox-only** — the tool itself does a
      plain `fs.readFileSync`, so it'll read the whole file fine when Leo runs it on his own
      machine (noted in the file's header comment). Not CORE, no `?v=` (not browser-loaded).
- [ ] **ChatGPT "DXF Takeoff Architecture" advice (Leo, 2026-07-16):** mostly ALREADY how this
      project works — deterministic parser (`parseRawDxfOpenings`), DXF never sent to Claude
      (Node/browser parses), geometry stored externally (Firestore `elevGeo`/`elevEdits`), Node
      harness validation, compact summaries, Sonnet-for-routine / Opus-for-judgment routing,
      prompt-cached `CLAUDE.md`. **Net-new idea = wrap the takeoff workflow (harness recipe,
      layer rules, validation, output schema) in a Claude Skill.** Can't create skills in-session
      (read-only cache) — Leo makes it via Settings > Capabilities / `skill-creator`; I can draft
      its content on request.
- [x] **S4 FIXED + VERIFIED (2026-07-16, Sonnet).** `parseRawDxfOpenings(text, opts)` and
      `parseDxfText(text, opts)` now accept `opts.forcedSystem`, which wins over
      `dxfSystemForMark(mark)` at the classification site — so an unrecognized mark (e.g.
      `EL-01`) no longer silently falls through to `SYSTEMS_LIST()[0]` (IR501T) and gets
      whitelisted against the wrong system. Reordered all three import entry points to ask
      `pickSystem()` BEFORE parsing (not after) and thread the choice through:
      `runDxfParse()` (now `async`), `onDxfFileChange(e)`, and `tracker-bridge.js`'s headless
      handoff-import path (all pass `{forcedSystem}` into the parse call and `sys` as
      `appendParsedOpenings`'s new `presetSys` 3rd param, which skips its own now-redundant
      `pickSystem()` prompt when a caller already resolved one). The old late `o.system = sys`
      reassignment in `appendParsedOpenings` was kept as harmless belt-and-suspenders (per
      `SONNET-HANDOFF.md`'s explicit option). Bumped `takeoff/app.js?v=20260716c`,
      `tracker-bridge.js?v=20260716b`.
      **Verified via `dxf-cli.js` against the real `45TU.dxf`:** forcing `--system 45TU` on
      EL-01 now gives clean 45TU roles (`Door Jamb`, `Head`, `Horizontal`, `Jamb`, `Sill`,
      `Transom Bar` only — no `Door Jamb At Transom`); auto-detect (no forcedSystem) still
      misreads it as IR501T with the phantom roles, confirming this was the exact bug. Also
      confirmed no regression: `south.dxf`'s SF-marks (750XT) produce byte-identical output
      whether auto-detected or forced to `750XT` — those already resolved correctly, untouched
      by this fix. Lock released; done using the same `/tmp` scratch-copy + `head`-to-clean-
      boundary workaround as T1 (bash mount truncated the live file at line 2447 again — see
      "Resolved traps").
- [x] **M2-v2 BUILT + VERIFIED (2026-07-16, Sonnet).** New tracker-root `dxf-elevations.js`
      (PROJECT, no CP2 sync) — a trimmed, **system-independent** port of just the geometry
      half of `takeoff/app.js`'s `parseRawDxfOpenings` → `buildElevExport` pipeline (DXF
      group-code parse, `clusterPolys`, door-block/louver-block/panel-hatch region detection,
      the glass/louver/panel/door element grid + SVG base). Deliberately omits every
      role/cut/system thing (`dxfDetectCuts`, 750XT/45TU branches, whitelist, gaskets) — that
      stays takeoff-only. One simplification: the takeoff parser's `minLen` (shortest admitted
      profile) is 8" for 750XT / 10" otherwise; this port has no system so it always uses 8"
      (matches AC3's dominant 750XT system; documented in the file's header comment).
      Tracker's "⬆ Import DXF" button (`index.html`) now runs `importDxfInTracker(e)`
      **in-page** — no system prompt, no navigation to the takeoff tool: parses via
      `DxfElevations.parseElevationRegions(text)`, writes each mark straight into
      `window.ELEVATIONS[mark]` (instant render) and, if `firebase.firestore()` is live (the
      same compat SDK `elev-cloud.js` already uses), merges `{viewBox,name,base,elements}`
      into Firestore `elevGeo/{mark}`. Old `stageDxfForTakeoff` (IndexedDB stage + navigate)
      removed/replaced. `takeoff/app.js`: `buildElevExport`'s call site now attaches
      `_ex.takeoff = {system, cuts, gaskets}`; `exportElevationsToTracker` rewritten to merge
      **only** `{takeoff: {...}}` into `elevGeo/{mark}` (skips marks with no `.takeoff` data)
      — Firestore field-level merge means this never touches the tracker-owned
      `viewBox/base/elements` siblings. `takeoff/tracker-bridge.js`'s old M2 return-hop
      (`af_dxf_return` → navigate back to `../index.html`) removed as dead/superseded UX; its
      IndexedDB-handoff consumer is left in place but now inert (nothing populates
      `af_dxf_handoff` anymore) in case a future tool wants to reuse it. Bumped
      `takeoff/app.js?v=20260716d`, `tracker-bridge.js?v=20260716c`; added
      `dxf-elevations.js?v=20260716a` script tag to tracker `index.html`.
      **Verified via a Node harness** (real `app.js`'s own `parseRawDxfOpenings` run
      side-by-side with the new standalone `dxf-elevations.js`, same stub-`window` pattern as
      `dxf-cli.js`): on both `south.dxf` (750XT, 13 SF-marks) and `45TU.dxf` (8 EL-marks), the
      new port's per-mark glass/louver/panel/door element counts AND `viewBox` are
      **byte-identical** to the production takeoff parser's own `ELEV_EXPORTS` output — no
      regression, geometry detection genuinely is system-independent as designed. Confirmed
      `_ex.takeoff` carries `{system, cuts[], gaskets}` correctly (spot-checked on 45TU/EL-01).
      **Not yet done (needs a real browser + live Firestore, can't verify from the agent
      sandbox — see "Firestore is unreachable from the agent sandbox" in Resolved traps):**
      manual smoke test of the actual button click → Firestore write → cross-tab
      `elev-cloud.js` pickup; confirm a takeoff push afterwards adds `.takeoff` without
      wiping the geometry Leo will see in the browser.
- [ ] **Ask Leo:** was the test on the **deployed** Vercel build? Whitelist (`?v=20260715a`) +
      point-6 (`20260716b`) may not be live yet (deploy still pending) — some symptoms could be
      stale-deploy, but S4 is a real bug regardless.
- [x] **Door-frame rule RESOLVED (Leo 2026-07-16):** KEEP `Door Jamb`/`Transom Bar` (storefront
      attaching members); exclude only the bought door unit (leaf). Block-mode already skips the
      leaf — verify. So S4 (system fix) fully resolves issue 1; no blanket door exclusion.
      Also: Leo tested the **local** build, so S4 is the confirmed live cause (not a stale deploy).

### Prior items
- [ ] **User: publish `elevEdits` Firestore rule** (Console → atlantic-chestnut-3 → Firestore
      → Rules) or #1 cloud-sharing stays local-only. Rule block is in `FIRESTORE-SETUP.md`.
- [ ] **User: deploy** — push `takeoff/app.js` + `takeoff/index.html` to GitHub; Vercel
      redeploys; open at `/takeoff/` (trailing slash).
- [x] **45TU DXF received (2026-07-16)** at
      `C:\Users\Ethan\Downloads\Atlantic-Chestnut Building 3\elevations\` (now a connected
      folder; also has `south/north/east/west.dxf`, `01.dxf`, `Roles.dxf`, the parts xlsxs, and
      some `.dwg`/`.bak`/`.dwl` files). See below — it partly unblocked #6, but **not** #3/#4
      the way `PROPAGATION-DESIGN.md` assumed (see "S3 findings").
- [x] **Point 6 (phantom door) FIXED + VERIFIED (2026-07-16), root cause was NOT what memory.md
      guessed.** Built a Node harness (`vm.createContext`, stub `window`/`document`/
      `localStorage`, eval `systems.js` + `app.js`, call `parseRawDxfOpenings` on the real
      45TU.dxf text) and reproduced EL-05 exactly (Head→"Transom Bar", a plain mullion→
      "Door Jamb"). **Actual root cause:** in `dxfDetectCuts`'s non-750 door-fallback branch,
      bay boundaries (`colXs`) were the bounding verticals' **center** x, not their facing
      edge. A wide vertical (here a 4.5"-wide corner post) offsets its center ~2.25" from
      where the adjoining Head/Sill actually terminates — enough to exceed the hardcoded ±2
      span tolerance, so a real spanning Sill/Head reads as "missing" → the bay misreads as a
      doorless gap (phantom door) and the bounding vertical gets mislabeled Door Jamb. The
      `floorY = Math.min(...)` theory was NOT the cause here (all verticals in EL-05 bottom
      out within 0.02" of each other) — did not touch `floorY`. **Fix:** `takeoff/app.js`
      `dxfDetectCuts` (~line 1928) now derives `xL`/`xR` from the bounding vertical's facing
      edge (`colEdge()`, new helper) instead of its center. **Verified on the real file:**
      before fix, EL-02/03/05/08 (plain storefront, no real door) all had false
      "Transom Bar"/"Door Jamb" cuts; after the fix all four are clean (0/0), while EL-01/04
      (which have genuine double-doors w/ transom — confirmed by inspecting their Door
      Jamb/Subsill/transom geometry) keep their correct classification. Bumped
      `takeoff/app.js?v=20260716b`.
      **Bash-mount gotcha hit again, worse than usual:** the bash-visible copy of `app.js` was
      truncated mid-function at a **fixed byte/line offset** (~line 2467, inside `copyReport`)
      on every read, even after `sleep 15` and `cp`-ing it — this wasn't just "stale", the
      mount seems to cap/corrupt reads of this specific large OneDrive file. Workaround: took
      the bash-truncated copy, cut it at the last clean function boundary before the
      corruption (`head -2450` lines, right after `exportCsv()` closes and before
      `copyReport()` starts, which `node --check` confirmed is valid syntax), and ran the
      harness against that — `dxfDetectCuts`/`parseRawDxfOpenings` are defined well before
      line 2450 so this didn't affect the test. The real edit itself was confirmed correct via
      `Read`/`Grep` (as usual).
- [ ] **S3 (gasket + auto-propagation) — design assumptions in `PROPAGATION-DESIGN.md` don't
      match the real 45TU.dxf; needs Leo's call before building.** Findings from inspecting the
      real DXF layers (all 45TU/elevations files now connected):
      - No layer named "IMP-1" anywhere. The actual **metal-panel region layer is `AF-PANEL`**
        (1836 entities in `south.dxf`, 252 in `east.dxf`, 136 in `west.dxf`, 0 in `north.dxf`/
        `45TU.dxf`) — "IMP-1" was probably Leo's spec-callout name for the panel material, not
        the DXF layer name. The parser **does not currently read `AF-PANEL` at all**: today's
        750XT panel/board detection (`structuralPolys`/`isStructural` in
        `parseRawDxfOpenings`, ~line 1598) uses a **geometric size heuristic**
        (`Math.max(w,h)>=24` etc.), not the actual layer. Reading `AF-PANEL` directly instead
        of guessing by size is exactly Layer A's premise and is very doable — but is a
        different (more reliable) approach than what's in the design doc.
      - **E2-0127 / E2-0120 (the 5,982 / 4,795 LF hand numbers) are 750XT part numbers, not
        45TU's.** `takeoff/systems.js` shows 45TU already has its own working role-based
        gasket (`E2-0052`, `rule:'per_lf'`) — 45TU doesn't need #3/#4 at all. E2-0127/E2-0120
        only appear in `app.js`'s `buildElevExport` perimeter formula (750XT-only), confirming
        the target numbers are for the **AC3 building's actual storefront elevations**
        (`south/north/east/west.dxf`, already sitting in the same connected folder — not
        45TU.dxf).
      - Net: the 45TU DXF unblocked #6 (done above) but is **the wrong file** to build/verify
        #3/#4 against. That needs `south/north/east/west.dxf` (750XT), and "Layer A" should be
        redesigned around reading `AF-PANEL` directly rather than the geometric heuristic.
      - **Did not start building #3/#4** — this changes the design doc's premises in a way
        that affects file targets, verification data, and possibly the Layer A detection
        approach; flagged to Leo rather than guessing on a large, order-affecting parser
        change. `PROPAGATION-DESIGN.md` itself was written before any real DXF was available
        and should be revised against these findings before implementation.
      - **Leo's correction (2026-07-16):** `AF-PANEL` is **louvers, not IMP-1**. IMP-1 is
        identified by **a distinct hatch shade**, not a layer name. **Both 750XT and 45TU**
        need gasket calc (45TU's existing `E2-0052` role-based rule was built without any
        IMP-1-region awareness, so it likely needs the same Layer A treatment, wired to its
        own part number — not E2-0127/E2-0120, those stay 750XT-only). Instruction: **just
        revise `PROPAGATION-DESIGN.md` for now — do not build.**
      - **`PROPAGATION-DESIGN.md` revised (2026-07-16)** with all of the above (marked
        "CORRECTED 2026-07-16" inline): §1/§3 swapped "read the IMP-1 layer" for "read the
        IMP-1 hatch shade"; found a candidate signal — 26 `HATCH` entities in `south.dxf` with
        an explicit color-index-8 (gray) solid fill on layer `0`, distinct from the
        `bylayer`-colored hatches elsewhere — **unconfirmed**, and a first attempt to extract
        their boundary coordinates via the same flat x(10)/y(20) pair-scan the parser already
        uses for simple hatches produced garbage (all boxes started at 0,0) — real HATCH
        entities need proper boundary-path parsing (codes 92/93/72/73), not the flat scan,
        because pattern-definition data shares codes 10/20 with the boundary vertices. §2/§4/§6
        updated for the corrected file targets (750XT numbers → `south/north/east/west.dxf`,
        already in the connected folder) and the both-systems scope. §7 implementation order
        now starts with "confirm the hatch signature with Leo" before any parser work.
      - **S3 BUILT + VERIFIED (2026-07-17, Sonnet)** — Leo confirmed the color-8/layer-0 hatch
        hypothesis and gave the exact framing/gasket spec (750XT-only; 45TU has none). Before
        writing classification code, re-verified the hatch signal directly against the real
        DXFs with a proper parser (not the earlier flat-scan guess): **26/6/8/2 matching HATCH
        entities in south/north/east/west.dxf respectively, 0 in 45TU.dxf** (confirms
        750XT-only). Built `dxfHatchBoundaryBBox(entity)` in `takeoff/app.js` — a real DXF
        HATCH boundary-path walker (codes 91/92/93/72/73/10/20/11/21), because the existing
        flat x(10)/y(20) scan (`hatchBoxes`, used for `AF_HATCH`/`AF_GENERAL` + `byOthersZones`)
        picks up a HATCH's base point (0,0,0, sits right before the boundary data) and trailing
        seed-point data (both reuse codes 10/20) — exactly the "all boxes start at 0,0" garbage
        noted in the earlier attempt. New `imp1HatchBoxes` collection (filtered
        `layer==='0' && color62==='8' && solidFill70==='1'`) feeds the per-cluster
        `panelStrips` **only when `system==='750XT'`** (empty array otherwise — this is what
        makes 45TU structurally incapable of getting IMP-1 output, not just "didn't detect
        any"). Replaced the OLD wrong-signal 750XT band-split (which used `AF_HATCH`/
        `AF_GENERAL` layer hatches — a real but unrelated feature — and swapped Head↔Sill
        (normal) at the panel band) with Leo's exact spec: only VERTICAL members that fully
        span a panel band get relabeled (`Jamb`→`Jamb (IMP-1)`, `Vertical`/`Vertical (wide)`→
        `Vertical (IMP-1)`/`Vertical (wide IMP-1)`); **Head and the horizontal below are
        explicitly left untouched** (no rename at all, matching "do not rename it as an
        IMP-1-specific member"). `systems.js`: added the 3 new roles to the 750XT parts that
        already carry plain Jamb/Vertical (same hardware assumption — flagged, not from a real
        parts.xlsx line item). Added `ROLE_REMAP` fallback entries (defensive only). **Gasket
        bug fix** in `buildElevExport`: the formula was `2 * G.glass` / `2 * G.panel +
        openingPerim`, but `G.glass`/`G.panel` (via `add()`) already bake in the "×2
        interior+exterior" factor per cell — the formula's extra `2×` silently doubled
        everything a second time. Fixed to `G.glass/12` and `(G.panel + openingPerim)/12`.
        Confirmed via `computeAccessories()`'s own existing report-row labels
        (`'Gasket — glass ×2 perimeter'` / `'...IMP panel ×2 + opening perimeter ×1'`) that
        this per-region-perimeter model (not `PROPAGATION-DESIGN.md` §5's proposed
        role-based-member-length alternative) is the codebase's actual intended architecture.
        **Verified via Node harness** (real `south/north/east/west.dxf`, forced `750XT`):
        `Jamb (IMP-1)` ×43, `Vertical (IMP-1)` ×56, `Vertical (wide IMP-1)` ×3 detected across
        the 4 files; `Head`/`Horizontal`/`Sill` counts unaffected (no stray `Sill (normal)`
        anymore); spot-checked `south.dxf` SF04.2's full cut list by hand — the two opening
        jambs correctly split into Jamb/`Jamb (IMP-1)`/Jamb three-ways at the real panel
        band's Y-range, head/horizontal directly bordering the panel keep their plain labels.
        `45TU.dxf` regression-checked clean (forced `45TU`: zero IMP-1 roles anywhere, no
        `gasketLF` on any opening — confirms "no IMP-1 for 45TU" structurally, not by luck).
        **Gap NOT fully closed:** summed `gasketLF` across all 4 files = **E2-0127 3,326 LF /
        E2-0120 2,160 LF** vs. Leo's hand numbers **~5,982 / ~4,795 LF** (56%/45% of target).
        Classification is verified geometrically correct, so this isn't a classification bug —
        the shortfall is in total detected glass/panel area or in a scope/methodology mismatch
        with Leo's hand count. Did NOT keep tuning multipliers to force a match (the exact
        mistake being fixed this session was an earlier undiagnosed guess) — documented as an
        open item in `PROPAGATION-DESIGN.md` §8 for Leo to help close (possible causes: hand
        count covers more building scope than these 4 files; the grid's min-cell-height/
        by-others-zone filters dropping real area; his hand tally may not be a pure
        per-region-perimeter method). Bumped `takeoff/app.js?v=20260717a`. Not CORE, no CP2
        sync. Lock released.
- [ ] After remapping, a 45TU door jamb shows as two `Door Jamb` pieces (upper+lower) — merge
      once in the viewer; with #1 the merge now persists.
- [ ] Nightly backup Action needs two GitHub secrets: `FIREBASE_SERVICE_ACCOUNT` +
      `FIREBASE_DATABASE_URL` (see old handoff). Then run once from Actions to verify.
- [ ] PDF dossier export (per unit/dispute: logs + photos → one PDF for claims).
- [ ] CP2 core sync: takeoff `app.js` diverged this cycle — sync per `SYNC.md` when ready.

## Decisions log

- **2026-07-16 (review)** — **S4** = thread user-selected system into `parseRawDxfOpenings`
  (`forcedSystem` overrides `dxfSystemForMark`); classification/whitelist must use the confirmed
  system, not the mark. Root of "door detected as frames".
- **2026-07-16 (review)** — **M2 SUPERSEDED by M2-v2:** tracker parses regions itself
  (system-independent, new `dxf-elevations.js`); takeoff writes material into the same
  `elevGeo/{mark}` doc (`.takeoff` subfield). Chose a focused standalone tracker parser over
  refactoring the 2200-line takeoff parser (lower risk; both must emit the same `t0` schema).
- **2026-07-16** — **M2 (v1, superseded)** = auto-push on takeoff import + tracker Import-DXF
  button that navigates to takeoff; full inline-in-tracker parsing deferred.
- **2026-07-16** — **M3** = `u.scopes {status,date}` for unit-level scopes (frame/caulking/
  beautyCap/sunshade), mirrored to `u.status/date` + `facecap`. **Glass (D3, Leo-confirmed):
  keep per-unit status editing on the Elevation tab; Calendar shows a read-only rollup fraction
  (e.g. 2/10) from the elevation glass elements** — same treatment for metalPanel/louver/doors.
  Drop only the Glass tab (keep `glassPanels[]` data). RFI per-elevation (`u.rfi`).
- **2026-07-16** — **M4** submittals = `state.submittals[]` new tracker section; **M5**
  materials = `state.materials[]` folded into `warehouse.html`.
- **2026-07-16** — **Mirror rule retired.** Takeoff single-source = `AC3 tracker\takeoff\`;
  Downloads copy deprecated. (Manager: mirror upkeep not worth it.)
- **2026-07-16** — **Model split:** Opus for design/diagnosis (Leo's main chat), Sonnet for
  build/execute (fresh chats via `SONNET-HANDOFF.md`); Fable reserved for stalls only.
- **2026-07-15** — #1 persistence stores the **full edited cut-set** per mark (not just role
  overrides), guarded by a geometry signature, so splits/merges survive re-import.
- **2026-07-15** — #2 uses a **derive-from-SYSTEM_DEFS whitelist** (not hand-maintained lists),
  so it self-configures and can't touch a system's legit roles (e.g. 750XT variants).
- **2026-07-15** — #3 gasket will move to **role-based per-member summation** (matches the hand
  count) and retire the perimeter model; it depends on #4's IMP-1 layer detection.
- **2026-07-15** — #4 = **Layer A** (deterministic region classification from the IMP-1
  layer/hatch, all systems) + **Layer B** (learned feature-signature rules from #1's saved
  edits). Enabled by user confirming IMP-1 is on a distinct layer/hatch.

## Scratch / notes

<!-- transient working notes — safe to clear each session -->
- (none)
