# Takeoff — Auto-Propagation (#4) + Gasket (#3) Design

> Status: **DESIGN / not yet implemented.** Written 2026-07-15. **Revised 2026-07-16** after
> the 45TU DXF + the AC3 elevation DXFs (`south/north/east/west.dxf`) became available and were
> inspected — several §3/§6 assumptions below were wrong and are corrected inline (search
> "**CORRECTED 2026-07-16**"). Still not built — Leo asked for the doc to be fixed first, build
> to follow in a later session.
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
