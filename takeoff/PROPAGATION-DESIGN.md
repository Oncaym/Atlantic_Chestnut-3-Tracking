# Takeoff — Auto-Propagation (#4) + Gasket (#3) Design

> Status: **BUILT + VERIFIED 2026-07-17 (Sonnet).** IMP-1 hatch signal confirmed by Leo
> (2026-07-16/17): solid-fill HATCH, AutoCAD color index 8, layer `0`; 750XT-only (45TU has
> none). Jamb(IMP-1)/Vertical(IMP-1) classification + gasket routing shipped in
> `takeoff/app.js`/`systems.js`. See `memory.md` "S3" for the full build/verify writeup,
> including a real DXF-HATCH-boundary parser (`dxfHatchBoundaryBBox`) and a residual gasket-LF
> gap vs. Leo's hand numbers that still needs his input (classification itself is verified
> geometrically correct). Written 2026-07-15, revised 2026-07-16 (doc-only), built 2026-07-17.
> Read order for context: `HANDOFF_FOR_OPUS.md` → this file.

## 1. The core insight — #3 and #4 are the same fix

Both problems reduce to one missing capability: **the tool doesn't read the IMP-1 region
from the drawing.** IMP-1 metal-panel areas are identified by a **distinct hatch shade**, not
by a layer name (**CORRECTED 2026-07-16** — see §3/§6: the `AF-PANEL` layer is **louvers**,
not IMP-1; that was last session's wrong guess). Once the parser reads that hatch signal:

- framing members get **role variants** by what they border — `… (Glass)` vs `… (IMP-1)`;
- **gaskets** become a per-member role sum (`E2-0127` on Glass members, `E2-0120` on IMP-1
  members) — i.e. Leo's hand method — replacing the broken perimeter model (#3);
- the same region rule runs on **every** elevation, so the classification **propagates**
  automatically (#4).

So we build one thing (IMP-1 region → role variants) and it settles #3 and most of #4.

## 2. Gasket diagnosis (#3) — why the script is off

**CORRECTED 2026-07-16 — scope:** both **750XT and 45TU** need gasket calculation fixed/built
(Leo, 2026-07-16). 45TU already has a *working* role-based gasket rule in `systems.js`
(`E2-0052`, `rule:'per_lf'`, keyed on member role — see §4) but it was built without any
IMP-1-region awareness, so it's presumably also over/under-counting wherever 45TU elevations
have IMP-1 infill; it needs the same Layer A treatment as 750XT, just wired to its own part
number instead of E2-0127/E2-0120.

Authoritative numbers (Leo, region-perimeter AND role methods agree) are **750XT-specific**:
`E2-0127 ≈ 5,982 LF`, `E2-0120 ≈ 4,795 LF`. (**CORRECTED 2026-07-16:** confirmed by checking
`systems.js` — these two part numbers don't appear in 45TU's accessory list at all; they're
computed today only in `buildElevExport`'s 750XT-only perimeter formula. So verifying against
5,982/4,795 means parsing the **AC3 building elevations** — `south.dxf`/`north.dxf`/
`east.dxf`/`west.dxf` — not `45TU.dxf`. All four `.dxf` files now sit in the same connected
`elevations/` folder.)
Script (perimeter model, `buildElevExport`): `E2-0127 = 10,779.70`, `E2-0120 = 2,144.30`.

- **E2-0120 too low (~0.45×):** IMP panels aren't detected as panels in most elevations
  (`G.panel ≈ 0`), so E2-0120 collapses to just the per-opening perimeter term.
- **E2-0127 too high (~1.8×):** (a) undetected IMP areas get counted as **glass** cells;
  (b) the model sums **each grid cell's full perimeter**, double-counting every shared
  mullion, vs Leo's rectangle-per-region outline. Both inflate glass.

Root cause = no IMP-1 region signal + per-cell (not per-region/role) accounting.
Fix = §3 Layer A → gaskets computed per role/member (§5).

## 3. Design

### Layer A — Region-driven auto-classification (the bulk of the win, from the DXF)

**CORRECTED 2026-07-16 — this whole section's "read the IMP-1 layer" premise needs to change
to "read the IMP-1 hatch shade."** What was verified this session (see §6 for the raw data):

- `AF-PANEL` is **not** IMP-1 — Leo confirmed it's the **louver** layer. (It's real geometry —
  1836 entities in `south.dxf`, 252 in `east.dxf`, 136 in `west.dxf` — just the wrong thing.)
  Today's 750XT panel/board detection (`isStructural` in `parseRawDxfOpenings`, ~line 1598)
  doesn't actually read `AF-PANEL` either — it guesses "panel-like" pieces by a **size
  heuristic** (`Math.max(w,h)>=24` etc. on the alum-profile layer), which is a separate,
  pre-existing thing from whatever currently produces `structuralPolys`/`panelStrips`. Don't
  conflate the two — the louver layer and the size-heuristic "board" detector are unrelated to
  the fix needed here.
- IMP-1 regions are identified visually by **a distinct hatch shade** (Leo, 2026-07-16), not a
  layer name. The most promising DXF signal found so far: `south.dxf` has 26 `HATCH` entities
  with an explicit color override (`group code 62 = "8"`, AutoCAD color index 8 = a gray),
  solid-fill, on layer `0` — distinct from the plain `bylayer`-colored hatches elsewhere
  (`AF_GENERAL`, `A-FLOR-LEVL`, etc.). This is a plausible candidate for "the IMP-1 shade" but
  is **not confirmed** — a first attempt at extracting these hatches' boundary coordinates via
  a naive x(10)/y(20) scan produced garbage (all bboxes started at 0,0), which means the
  boundary-vertex codes are getting mixed up with the HATCH entity's **pattern-definition
  data** (basis points/offset vectors, which also use codes 10/20/53/etc., under a different
  sub-structure). Extracting a HATCH's actual boundary polygon needs a real per-entity DXF
  HATCH parser (walk the boundary-path group, code 92/93/72/73, not a flat pair scan) — this is
  more work than the flat-scan approach `hatchBoxes`/`AF_HATCH`/`AF_GENERAL` collection
  currently uses elsewhere in the parser (which gets away with the naive scan because those
  hatches are simple, on their own layer, without competing pattern-definition data).
  **Next step before building:** confirm the color-8-on-layer-0 hypothesis with Leo (e.g. by
  clicking an IMP-1 area in AutoCAD and reading its hatch color/pattern in the properties
  palette), then build a real HATCH-boundary parser against that specific signature.

Once the real signal is confirmed, generalize into an explicit **IMP-1 region set**, then at
classification time (for ALL systems, not just 750XT):

1. Any framing member that lies within / borders an IMP-1 region → gets the `(IMP-1)`
   variant of its role.
2. A member crossing an IMP-1↔Glass boundary → **split at the boundary**; the inside
   segment becomes `(IMP-1)`, the outside stays `(Glass)`. (The 750XT `panelStrips`
   band-splitting logic in `parseRawDxfOpenings` already does exactly this for panel
   strips — generalize it to the IMP-1 layer, all systems.)
3. Everything else → `(Glass)` (or plain role where a system has no variants).

This is deterministic, reads the same layer Leo draws, and needs **zero** manual
correction. It is the real "full auto" and applies uniformly across every elevation.

### Layer B — Learned corrections (fallback + refinement, from #1 persisted edits)

For what the region rule can't decide (or where Leo overrides), the `elevEdits` saved by
#1 become training data. When Leo corrects a piece, capture a **feature signature** instead
of a coordinate:

```
{ system, orientation (V/H), sizeClass (narrow/wide), band (perimeter/interior/transom),
  borders (glass | imp-1 | louver | door) } -> role
```

Store as `state.roleRules[system] = [ {signature, role, updatedAt}, … ]` (localStorage +
Firestore `roleRules/{system}`, same pattern as `elevEdits`). On parse, AFTER Layer A,
apply the first matching rule per member. Conflict = most-specific / most-recent wins;
Leo reviews. A mis-fire is just another correction that tightens the rule. Nothing is ever
lost — the per-mark `elevEdits` point-edit is still kept.

Layer A does the drawing-driven bulk; Layer B learns Leo's judgment on the ambiguous few.

## 4. Role variants per system (systems.js)

Add `(IMP-1)` variants (and confirm `(Glass)` naming) with their own gasket rules, e.g.:

- 750XT: `Head (IMP-1)`, `Sill (IMP-1)`, `Jamb (IMP-1)`, `Vertical (IMP-1)`,
  `Horizontal (IMP-1)` → gasket `E2-0120`; plain/`(Glass)` → `E2-0127`.
- 45TU: mirror with its own IMP-1 gasket part number (**CORRECTED 2026-07-16:** 45TU's
  existing gasket part is `E2-0052`, not `E2-0120`/`E2-0127` — those two are 750XT-only, see
  §2. 45TU's `(IMP-1)` variant needs its own distinct part number, TBD — don't reuse the
  750XT numbers here).

Exact part numbers + gasket LF-per-member factors come from the parts xlsx / Leo.
These variants are auto-added to each system's allowed-role set, so the #2 whitelist keeps
them without extra config.

## 5. Gaskets become role-based (replaces perimeter model)

Once members carry Glass vs IMP-1 roles, drop the `buildElevExport` perimeter computation
for 750XT and compute gasket like 45TU already does: `per_lf` accessory rules keyed on the
role variants, summed over member lengths × count. This matches Leo's hand numbers by
construction and removes the `gasketLF` / perimeter special-case.

## 6. OPEN DEPENDENCY — STATUS (2026-07-16)

The 45TU DXF arrived 2026-07-16 (now at
`C:\Users\Ethan\Downloads\Atlantic-Chestnut Building 3\elevations\`, a connected folder that
also has `south/north/east/west.dxf`, `01.dxf`, `Roles.dxf`, both parts xlsxs, and some
`.dwg`/`.bak` files). Of the four things it was supposed to unlock:

1. ~~the exact IMP-1 layer name / hatch pattern~~ — **still open.** `AF-PANEL` (this session's
   first guess) is confirmed wrong (it's louvers). Best lead so far: `HATCH` entities with
   color-index-8 solid fill on layer `0` in `south.dxf` (26 of them) — **unconfirmed**, and
   boundary-vertex extraction for real HATCH entities needs a proper parser (see §3). Get
   Leo to confirm the hatch color/pattern in AutoCAD before building the detector.
2. **DONE.** Reproduced EL-05 with a Node `vm` harness against the real 45TU.dxf and fixed it
   — see `memory.md` "Point 6 FIXED + VERIFIED" for the full root-cause writeup (it wasn't the
   `floorY`/`Math.min` theory; it was a bay-boundary center-vs-edge tolerance bug). Shipped in
   `takeoff/app.js` (`dxfDetectCuts`), `?v=20260716b`.
3. **Not unlocked by 45TU.dxf** — the 5,982/4,795 target numbers are 750XT's, so verification
   needs `south/north/east/west.dxf` (already in hand) once Layer A is built.
4. **DONE** for point 6's fix (harness built, ran against the real DXF, confirmed before/after
   on all 8 openings in the file). The harness recipe: `vm.createContext` with stub
   `window`/`document`/`localStorage`/etc., `vm.runInContext` on `systems.js` then `app.js`,
   then call `parseRawDxfOpenings(dxfText)` directly — no DOM needed since that function is
   pure geometry→data. (Bash's view of `takeoff/app.js` was truncated at a fixed offset even
   after `sleep`+`cp` — see `memory.md` for the `head -N` workaround before the last safe
   function boundary.)

## 7. Implementation order (once the hatch signature in §6.1 is confirmed)

1. Confirm the IMP-1 hatch color/pattern with Leo; build a real HATCH-boundary parser against
   it (not the flat x/y-pair scan used for simple hatches elsewhere).
2. IMP-1 region detection from that hatch (parser) — all systems, both 750XT and 45TU.
3. Generalize band-splitting → `(IMP-1)` / `(Glass)` role variants, all systems (Layer A).
4. systems.js variant roles + gasket rules for **both** 750XT and 45TU (§4).
5. Switch gaskets to role-based; retire the 750XT perimeter model (§5). Verify 750XT vs
   5,982/4,795 using `south/north/east/west.dxf`; verify 45TU's variant against Leo's numbers
   for that system (TBD — not yet stated).
6. Learned-rule layer + Firestore `roleRules` (Layer B).
7. Single source is `AC3 tracker\takeoff\` only (mirror rule retired, see `memory.md`) — bump
   `?v=`, run the Node harness against real DXFs before handoff, note CP2 core sync if any
   CORE tracker file is touched (takeoff files aren't CORE, so likely none).

## 8. IMPLEMENTATION (2026-07-17, Sonnet) — supersedes the "not confirmed" status above

**Confirmed by Leo (2026-07-16/17):** IMP-1 = solid-fill HATCH, AutoCAD color index 8, on
layer `0` (NOT `AF-PANEL` — that's louvers). **750XT only — 45TU has no IMP-1 at all** (its
`45TU.dxf` has zero HATCH entities of any kind). Verified this signal against the real DXFs
before writing any classification code: 26 matching entities in `south.dxf`, 6 in `north.dxf`,
8 in `east.dxf`, 2 in `west.dxf`, 0 in `45TU.dxf`.

**Built, NOT Layer A/B as originally scoped in §3/§6 above** — a narrower, exactly-specified
version of Layer A only (no learned Layer B, no `(Glass)` role suffix, no all-systems
generalization — Leo's spec was 750XT-only and named only two new role variants):

1. **Real HATCH-boundary parser** (`dxfHatchBoundaryBBox`, `takeoff/app.js`) — the flat
   x(10)/y(20) pair scan `hatchBoxes` already used elsewhere is wrong for real HATCH entities
   (picks up the entity's base point AND trailing seed-point data, both of which reuse codes
   10/20 outside the actual boundary — this was the exact "boxes all start at 0,0" failure
   noted in §3 above). Walks the real boundary-path structure (codes 91/92/93/72/73/10/20/
   11/21), returns the union bbox of a HATCH's boundary loops (a single physical IMP-1 panel
   is usually several small hatch sub-loops — reveals/bolt cutouts — side by side).
2. **`imp1HatchBoxes`** built once per parse from that parser, gated to `system === '750XT'`
   at the point it's consumed (never computed/used for 45TU).
3. **Framing classification (per Leo's exact spec — NOT the old §3 "generalize band-split to
   all systems" plan):** only the VERTICAL members that fully span an IMP-1 band get
   relabeled — the band's own boundary member → `Jamb (IMP-1)`, an interior mullion crossing
   it → `Vertical (IMP-1)` (`Vertical (wide IMP-1)` for wide verticals). **Head and the
   horizontal below the panel are explicitly left untouched** — this replaces the OLD
   (wrong-signal, wrong-behavior) 750XT band-split that used to swap them to `Sill (normal)`/
   `Head`. Verified geometrically correct on a spot-checked real opening (`south.dxf` SF04.2 —
   see memory.md "S3" for the full cut dump).
4. **`systems.js`:** added `Jamb (IMP-1)` / `Vertical (IMP-1)` / `Vertical (wide IMP-1)` to the
   750XT parts that already carry the plain Jamb/Vertical roles (assumption: same hardware,
   different infill behind it — **not from a parts.xlsx line item, flag to Leo if wrong**).
5. **Gasket bug fix, NOT the §5 role-based rewrite:** `buildElevExport`'s own `G.glass`/
   `G.panel` element-grid perimeter sums already encode "×2 (interior+exterior)" per cell (see
   `add()`) — the formula was ALSO multiplying by 2 again, silently doubling every cell a
   second time. Fixed to `E2-0127 = G.glass/12`, `E2-0120 = (G.panel + openingPerim)/12`
   (opening perimeter still added once, unchanged). The codebase's own `computeAccessories()`
   report-row label (`'Gasket — glass ×2 perimeter'` / `'...IMP panel ×2 + opening
   perimeter ×1'`) already described this exact per-region-perimeter model, confirming it (not
   §5's per-role-member-length model) is the intended architecture — §5 was a proposal written
   before the code's actual structure was re-examined.
6. **Verified (Node harness, real DXFs, `south/north/east/west.dxf` forced `750XT`):**
   Jamb (IMP-1)/Vertical (IMP-1)/Vertical (wide IMP-1) all detected (43/56/3 pieces across the
   4 files); Head/Horizontal/Sill counts unaffected (no more spurious `Sill (normal)` renames);
   `45TU.dxf` regression-checked clean (zero IMP-1 roles, no gasketLF, forced `45TU`).
   **Gap not yet closed:** summed `gasketLF` across all 4 files = **E2-0127 3,326 LF / E2-0120
   2,160 LF**, vs. Leo's hand numbers of ~5,982 / ~4,795 LF — about 56%/45% of target. The
   per-cell classification itself checks out geometrically (see point 3), so the shortfall is
   in total detected glass/panel AREA, not the formula. Needs Leo's input to close: possible
   causes not yet ruled out — (a) his hand count may include building scope beyond these 4
   elevation files, (b) the grid's minimum-cell-height filter (`y2-y1 < 4`, in `buildElevExport`)
   or by-others-zone exclusion may be dropping real area, (c) his hand method may not be a pure
   per-region-perimeter tally the way the code models it. **Do not further tune the multiplier
   without new information — the last "fix the formula until it matches" attempt (the bug this
   session fixed) was itself a wrong guess.**

## 9. Layer B — BUILT (2026-07-17, Sonnet) — supersedes §3's design-only status

Deployed as designed in §3, scoped to the signature schema below (no changes to the schema were
needed):

1. **`computeRoleSignature(cut, ctx)`** (`takeoff/app.js`) — derives `{system, orientation(V/H),
   sizeClass(narrow/wide), band(perimeter/interior/transom), borders(glass/imp-1/louver/door)}`
   from a cut's geometry (`cut.src`) plus the opening's context (`bbox`, `imp1Bands`,
   `louverBand`, `doorRegions` — now hoisted out of the old 750XT-only conditional and stored on
   every opening as `_bands`, so the signature can be recomputed identically at learn-time and
   apply-time regardless of system).
2. **`persistRoleRule(system, signature, role)`** — upserts into `state.roleRules[system]`
   (dedup by signature key — one rule per unique signature, freshest write wins, so "most
   specific/most recent" from §3 collapses to "there is only ever one current role per
   signature") and pushes to Firestore `roleRules/{system}` (merge), mirroring the `elevEdits`
   fetch-all pattern.
3. **`applyLearnedRoleRules(cuts, ctx)`** — runs immediately after `applyRoleWhitelist` and
   before the mark-specific `_saved`/`roleEdits` restoration, so: whitelist → Layer B (generic,
   any mark) → per-mark manual override (most specific, still wins).
4. **Capture point:** the existing `#vc-pos` change handler (fires when Leo manually edits a
   cut's role in the elevation viewer) now calls `persistRoleRule` in addition to its existing
   per-mark `roleEdits` write — one manual correction now both (a) fixes that exact piece
   forever, and (b) teaches the general rule for every future/other cut sharing that signature.
5. **`loadRoleRulesFromCloud()`** — fetches all `roleRules/*` docs on `fb-ready`, same shape as
   `loadElevEditsFromCloud`.
6. **Verified end-to-end (Node harness, real `south.dxf`, forced `750XT`):** persisted a
   synthetic rule for one real cut's computed signature, re-ran `parseRawDxfOpenings` on the
   same file from scratch, and confirmed all 40 OTHER cuts across the opening set sharing that
   exact signature were relabeled to the learned role automatically — confirms the full
   persist → reload → re-apply loop works, which is what Leo's "Layer B not working" feedback
   was actually reporting the absence of (it had never been built, not a bug).
7. **Design caveat carried into practice:** signatures are coarse by design (5 fields, not a
   per-piece key), so a single correction can relabel many cuts across many marks at once. This
   is the intended generalization behavior from §3, not a bug — but worth flagging to Leo since
   it means a correction on an unusual one-off piece could unexpectedly relabel typical pieces
   sharing its signature.
8. **New user action:** publish a Firestore security rule for the `roleRules` collection (same
   one-time step `elevEdits` needed in `takeoff/FIRESTORE-SETUP.md`) or writes will silently
   fail (reads too).

## 10. Horizontal (Glass&Glass) — BUILT (2026-07-17, Sonnet)

Separate, simpler sub-problem from `Horizontal (IMP-1&Glass)` (§8 point 6's open gap) — Leo's
rule: *"if it's glass top and bottom, then it's horizontal(glass&glass)."*

Implementation (750XT only): any cut still plain `Horizontal` after every other classification
step runs is relabeled `Horizontal (Glass&Glass)` unless it touches/crosses an `imp1Bands`
entry in X-range — by construction, anything reaching this point that doesn't border an IMP-1
band is bordered by glass on both sides. Not gated on `imp1Bands.length` — openings with zero
IMP-1 hatches still get all their plain Horizontals relabeled.

Verified (same 4-file harness): 84 `Horizontal (Glass&Glass)` detected, 91 remain plain
`Horizontal` (all IMP-1-band-adjacent, correctly left alone) — 84+91 = 175 matches the prior
S3 harness's total `Horizontal` count exactly, confirming a clean split with zero cuts gained
or lost. 45TU regression-checked clean (label never appears). `systems.js` (E9-1206, AS-3906,
BE9-3910, E1-3603, E2-0513) and `ROLE_REMAP` updated to accept the new role name.

**Still open:** `Horizontal (IMP-1&Glass)` — the 91 remaining IMP-1-adjacent cuts — needs a
firm spec from Leo (see memory.md Open items) before being built; left as plain `Horizontal`
for now, matching the original 2026-07-16 instruction for that specific case.

## 11. Root-cause fix — stale saved snapshot masked Layer A/B (2026-07-18, Sonnet)

Leo tested §9/§10 by manually correcting a jamb to `Jamb (IMP-1)` in the viewer, then reported
(a) the correction didn't generalize to later imports, and (b) IMP-1 classification itself
disappeared on later imports of that mark. Root cause: `parseRawDxfOpenings`'s per-mark
full-snapshot restore (`state.elevEdits[mark]`, from the original #1 "persist manual edits"
feature) ran AFTER all of §9/§10's classification and, whenever a saved snapshot existed for
that mark with a matching geometry signature, wholesale overwrote the entire freshly-classified
`cuts` array with whatever was saved — freezing that mark's roles at save-time permanently. Any
mark Leo had ever manually edited got such a snapshot, so §9/§10 (and any future classification
improvement) would never show up on it again on any subsequent re-import.

Fix: the classification pipeline (§9 IMP-1 split → §10 Glass&Glass → whitelist → Layer B) is now
factored into `classifyRoles(cuts, ctx)`, called once on a fresh parse and called AGAIN on the
restored snapshot's `cuts` before the opening is pushed. This is idempotent — the IMP-1 split
step only acts on a whole (unsplit) vertical spanning a full band, so already-split/labeled
restored pieces pass straight through; only genuinely stale (pre-classification) pieces get
(re)classified. Saved splits, lengths, and any truly custom edits are untouched — only role
labels stay live against current logic.

Verified: reconstructed a faithful stale snapshot (merged split IMP-1 segments back into whole
plain-labeled members — what a real pre-S3 snapshot would look like), injected it as
`state.elevEdits`, re-parsed, and confirmed the restored role counts matched a fresh parse
exactly. Also confirmed a Layer B learned rule still applies on top of a restored stale
snapshot. 45TU regression-checked clean. `takeoff/app.js?v=20260718a`.

## 13. Major rework (2026-07-18, Sonnet) — per Leo's detailed spec "750XT IMP-1/Glass/Louver 识别与构件分类修复"

Leo supplied a full spec covering 11 numbered sections. Diagnostics requested before coding
(§十一), answered by direct code inspection first:

1. **Independent storefront identification today:** `clusterPolys(clusterInput, 20)` — pure
   spatial-proximity union-find on frame polylines, epsilon 20". No concept of "does this
   sub-region have its own complete head+sill+jambs" — any two frame members within 20" merge
   into one cluster/mark.
2. **Why Jamb/Vertical (IMP-1) didn't show on a real mark:** §11's fix only handled Stage 1
   (a WHOLE unsplit member spanning the full band). If the member is already segmented — either
   naturally (DXF draws it broken) or because a saved `elevEdits[mark]` snapshot already has it
   split into 3+ plain-labeled pieces (exactly Leo's "cut the jamb" case) — no single segment
   satisfies "spans the whole band on both sides", so the split/relabel never fires and the
   piece stays permanently mislabeled. This is a real, distinct gap from §11's fix, not the same
   bug re-appearing.
3. **Saved snapshot restore, whole vs already-split:** before this fix, a whole restored member
   would be correctly re-split (§11's re-run of `classifyRoles`); an already-split restored
   member (3 plain-labeled pieces) would NOT be reclassified — no logic re-evaluated individual
   segments independent of "was this ever one whole piece".
4. **`boards` double-count risk:** confirmed real — `boards` (flat structural polylines,
   `width>=height && height<=12`) is a pure geometric heuristic completely independent of the
   hatch-confirmed `panelStrips`/`imp1Bands`. If a board overlaps a confirmed IMP-1 hatch, the
   grid-cell loop (`inStrip`) already counts that area once; `boards`' own
   `add(...,'panel')` counted it AGAIN. If a board does NOT overlap a confirmed hatch, it has no
   IMP-1 confirmation at all yet was still being counted as IMP-1 gasket — both violate Leo's
   §2 hatch-only rule.
5. **Functions changed:** `classifyRoles` (two-stage IMP-1 vertical logic), `buildElevExport`
   (gasket key separation, per-zone perimeter, boards de-gasketed), `computeAccessories`
   (consumes the new 3-key gasket schema as separate report rows).
6. **Tests added:** a 10-test harness matching Leo's exact list 1–10 (see below).

### What was built

- **`normalizeImp1RoleToBase(position)` / `toImp1Role(baseRole)`** — shared base↔IMP-1-variant
  mapping so a stale label is never carried forward un-reevaluated, and the Jamb vs Vertical vs
  Vertical (wide) family identity survives a normalize→reclassify round-trip.
- **`classifyRoles` Stage 2 (NEW):** after Stage 1's whole-member split, EVERY vertical-family
  segment — just-split, DXF-native multi-segment, or restored-from-snapshot — is normalized to
  its base role and reclassified purely by its own geometric overlap with the relevant band
  (`overlap / segment height > 0.5` → IMP-1 variant, else base role). This is what actually
  fixes Leo's reported failure: it no longer requires a segment to have ever been "one whole
  piece". Horizontals are untouched throughout (Leo §四 condition D).
- **Gasket schema split** (`buildElevExport`): returns `{ imp1, glass, perimeter }` (semantic
  keys) instead of two combined part-number keys. `computeAccessories`'s `GASKET_DEFS` maps each
  to its own partNumber/description/box size — `imp1` and `perimeter` both use E2-0120 but
  render as two separate report rows, per Leo's explicit "两套独立 takeoff,不能混在一起".
- **Per-zone perimeter** (`buildElevExport`): confirmed via direct inspection of `south.dxf`
  SF04.1 that its louver band is a fully independent sub-frame — own Head(X)/Sill(X) at
  y=-1002.4/-1019.7 (17.25" tall) and own Jamb(X)/Vertical(X) at y=-1019.7 to -999.9, completely
  separate from the main zone's own Head/Sill at y=-1031.2/-1148.2 (117" tall) — even though both
  share one mark/bbox. Main-zone Y-extent is now derived from the classified plain Head/Sill cut
  positions (falls back to full bbox when absent, e.g. non-750XT or no louver split), and a
  louver band (when present) contributes its OWN separate perimeter — satisfying Leo's rule that
  a louver zone gets a perimeter gasket despite having zero infill gasket.
- **`boards` de-gasketed** (`buildElevExport`): still emits its visual element (elevation-view
  reference rectangle, unchanged appearance) but no longer calls `add(...,'panel')` — removed
  from the gasket sum entirely, since it's not a hatch-confirmed IMP-1 signal per Leo's §2 rule.

### Verified (10-test harness, real south/north/east/west.dxf, forced 750XT unless noted)

All 14 checks pass (some tests have sub-checks):
1. Jamb (IMP-1) detected fresh — 43 across 4 files.
2. Vertical (IMP-1) detected fresh — 56 across 4 files.
3. **Stale snapshot already split into 3 plain segments** (the exact previously-unhandled case)
   — correctly reclassified to restore the middle segment as `Jamb (IMP-1)`.
4. Vertical (wide IMP-1) detected fresh — 3 across 4 files.
5. Horizontal/Head/Sill families unaffected by the vertical split; no IMP-1-specific Horizontal
   label exists yet (correctly, pending Leo's spec).
6. 45TU: zero IMP-1 roles, zero gasketLF.
7. Per-zone perimeter differs from (exceeds) the naive single-bbox perimeter for a mark with a
   louver zone, confirming the split is actually being applied.
8. A mark with a louver zone still has `perimeter > 0` despite the louver contributing zero
   infill gasket.
9. A stale snapshot (whole members merged pre-IMP-1-style) restores to match a fresh parse
   exactly; a Layer B rule applied afterward still takes effect on top of the restore.
10. IMP-1 infill gasket sum is finite/positive (no double-count blow-up); `boards` still emit
    visual panel elements for the elevation view despite contributing nothing to the gasket sum.

**Real counts, south/north/east/west.dxf combined (750XT):** Jamb (IMP-1) = 43, Vertical
(IMP-1) = 56, Vertical (wide IMP-1) = 3 (all unchanged from the original S3 numbers — confirms
no regression from the Stage 2 rework). Gasket LF: E2-0127 glass infill = 3,326.1, E2-0120 IMP-1
infill = 910.6, E2-0120 storefront perimeter = 1,782.4. 19 of 22 marks have a louver zone, each
contributing its own additional perimeter (41 total perimeter-contributing zones across 22
marks).

### Open / unresolved

- **§6's 4th cell-classification tier ("Unknown/Ambiguous")** — no concrete detection signal
  exists yet to distinguish "confidently glass" from "ambiguous, don't default to glass silently"
  beyond the existing IMP-1-hatch/louver-region checks (which already run first, in the correct
  priority order). Flagged to Leo rather than guessed at, per the standing "don't keep guessing"
  concern from his 2026-07-17 feedback.
- **Cross-mark independent storefronts** (§5's literal "two separate clusters merged into one")
  — not reproducible in the 4 available real fixtures; what IS reproducible and fixed is the
  stacked-within-one-mark case (louver zone above, main zone below, sharing one bbox/label) —
  see the per-zone perimeter fix above. If Leo has a real DXF exhibiting the cross-mark case, it
  needs a concrete example before a clustering change is attempted (clustering already excludes
  wide/tall structural members as bay separators — see `isStructural` — so a genuine cross-mark
  merge would need a specific repro to diagnose safely).
- `Horizontal (IMP-1&Glass)` remains unbuilt, unchanged — still needs Leo's spec.
- The original S3 gasket LF gap vs. Leo's hand count is superseded by this rework's new (lower,
  now-correctly-non-doubled) numbers above; whether these now line up with his hand count is
  unverified — needs his review.

## 14. SF01 data loss + pin protection + version history (2026-07-19, Sonnet)

§13's Stage 2 fixed the "reclassification never updates" problem, but introduced the opposite
one: Stage 2 reclassifies EVERY vertical-family piece by geometry on every restore, with no way
to protect a deliberate manual/special-case classification from being silently overwritten. This
hit SF01 — a hand-built special case per `elevations.js`'s own comment ("SF01 hand-built;
SF04-SF10 auto-generated") — whose classification was replaced by the automatic reclassification
with no visible warning.

**Recovery attempted, not possible:** confirmed with Leo that the Firestore `elevEdits` doc for
SF01 is already overwritten. Checked `.github/scripts/backup-state.js` — the nightly GitHub
Action backs up only the tracker's Realtime DB `/state` and `/history`, never any Firestore
collection (`elevEdits`/`elevGeo`/`roleRules`), so no automated backup existed for this data.
Searched for a Firebase/Firestore MCP connector (`ToolSearch` + registry search) — none
available, so there's no way to query Firestore directly from this session even to check for a
point-in-time recovery option. SF01's original classification is very likely permanently lost.

**Fix (prevents recurrence), two independent safeguards in `takeoff/app.js?v=20260719a`:**

1. **Pin protection** — `classifyRoles` now takes `mark` in its context and, as a final pass
   after Stage 1/2 + whitelist + Layer B, re-applies `state.roleEdits[mark][srcKey]` (the
   viewer Position-dropdown's per-piece manual override) over whatever the automatic steps
   produced. An explicit manual choice now always wins and is never silently reclassified again
   on a future restore.
2. **Version history** — `persistElevEdits` keeps up to `ELEV_EDITS_HISTORY_LIMIT` (5) prior
   versions nested inside the same `elevEdits/{mark}` Firestore document (`rec.history`, newest
   first), only pushing a new entry when the cuts actually changed (avoids piling up no-op
   saves). `restoreElevEditsVersion(mark, idx)` makes a historical version live again, itself
   pushing the version it replaces into history first — so a restore is never a dead end.
   Viewer UI: an expandable "🕐 Version history (N)" list next to the existing "saved edits ·
   clear" line, one Restore button per version.
3. **Drift warning** — pieces that were never explicitly pinned can still drift when a
   restore's reclassification disagrees with what was saved. This is now detected (comparing
   cuts before/after the post-restore `classifyRoles` call) and surfaced as an orange warning
   banner in the viewer plus a `console.warn`, rather than flowing silently into the next save —
   the exact failure mode that let SF01 go unnoticed until it was too late to undo.

**Verified** (new 7-check harness): an explicit `roleEdits` pin survives a full reclassification
pass; history is created only when cuts genuinely change; a restored version exactly reproduces
the pre-edit cuts; the replaced version is itself pushed into history (restore isn't a dead end);
history caps at 5 entries. Full prior regression suites (§13's 10-test IMP-1/gasket harness,
45TU) re-run clean — no regressions.

**Known gap:** pin protection only covers pieces corrected via the dropdown (`state.roleEdits`).
A piece whose correctness came from some other path (never explicitly touched, just happened to
match) has no pin — the drift warning is the safety net for that case, but there's no way to
tell "correct by luck" from "correct by geometry" after the fact. If Leo can redescribe SF01's
intended classification, re-setting it via the dropdown will now make it permanently pinned.
