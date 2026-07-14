# HANDOFF → next session (Opus) · 2026-07-13

## ✅ Session log 2026-07-13 (Opus) — done (both copies, ?v=20260713e)
- **T1 gasket** — DONE in code. 5 `per_lf` accessory rules on 750XT (`systems.js`): `E2-0120` (×1 Head(X)/Sill(X)/Head/Sill/Jamb(X)/Jamb/Door Jamb, ×2 Sill(normal)) and `F` placeholder (×4 Horizontal/Vertical/Vertical(wide), ×2 Head/Sill/Jamb/Door Jamb/Horizontal(X)/Horizontal(Y), ×1 Sill(normal)). qty = count × run length (per_lf uses summed piece length). Counts from user's Roles.dxf table. **Cloud NOT yet updated** — Firestore unreachable from the agent sandbox; the cloud `systems/750XT` doc still has empty accessories and overwrites local on load. To land: open the live page and add one accessory row (any save pushes the whole 750XT accessories array up), OR REST-PATCH `systems/750XT` accessories field. Only the `accessories` field needs patching (custom parts/roles in cloud untouched).
- **T2 role rename** — DONE. ✎ button per By-Role row → prompt. `renameRole(sys,old,new)` updates parts.roles + cuts.position (scoped to that system), customRoles entry, carries old color into `state.roleColors` (checked first in `cutColor`); merge into existing role keeps that role's hardcoded color; confirm() on merge.
- **T3 persist manual role edits** — DONE. `state.roleEdits = {[mark]:{[srcKey]:position}}`, srcKey = `x|y|w|h` rounded 0.1. Recorded on vc-pos change; re-applied at end of per-cluster loop in `parseRawDxfOpenings` (no-op when empty → no parse regression); "× clear" affordance in viewer edit box. elevExport is type-based → unaffected.
- **T4 → Tracker accumulates** — DONE. `LAST_ELEV_EXPORTS` array → `ELEV_EXPORTS` Map keyed by elevGeo doc key; per-parse reset removed (same mark overwrites, different marks accumulate across imports). Export reports the mark list + sets status `title` for overflow. Session-only (not persisted across reload).
- **T6 full-English UI** — DONE. All user-visible strings in `index.html`, `app.js`, `cloud-sync.js` translated (tracker-bridge.js had none). Verified 0 CJK outside comments; comments left as-is. `rolesUsed '·连续' → ' (run)'`.
- **Verify** — systems.js node-loads clean; renameRole/roleEdits/accumulation logic unit-tested (all pass). Full-file `node --check` blocked by the known truncated-mount trap (only "Unexpected end of input" at the cut point — no real syntax error); inserts Read-verified balanced.
- **Not done**: **T5** (SF11–14 louvers) — needs a non-stale east.dxf + your OK on the louver-region heuristic before coding. **T7 cloud parts merge** — same Firestore-unreachable blocker as T1. **CP2 sync** of these core-file changes (app.js/cloud-sync.js) still pending per SYNC.md. Harness baseline not re-saved (mount truncation).

## ✅ Session log 2026-07-13 (Opus) part 2 — UI/tracker fixes
- **Deploy layout fix**: takeoff is deployed at `/takeoff/` (subfolder of the `Atlantic_Chestnut-3-Tracking` repo). Root + takeoff/ share filenames (app.js/index.html/cloud-sync.js) but live in different folders → no GitHub collision. Bug: visiting bare `/takeoff` (no trailing slash) made relative CSS/JS resolve to site root → unstyled page. Fix: added `redirects [{/takeoff → /takeoff/}]` to **root `vercel.json`** (re-upload vercel.json). Immediate workaround: open `/takeoff/`.
- **#1** no duplicate part-number in a role: `+ Add part` dropdown hides part numbers already in the role; add handler guards dup partNumber. (takeoff app.js, both copies)
- **#2** Parts Database groups now default **collapsed** (removed auto-expand). (both copies)
- **#3** tracker elevation elements: real **Delete** (not just 'hidden'). `state.elevations[key].deleted[]`; custom els removed, base els recorded in `deleted` and skipped in render + KPI count. New Delete button in `#elevStatusModal`. **tracker ROOT app.js + index.html (core file → sync to CP2)**; bumped root app.js ?v=20260713e.
- **#5** role section drawings: `role-sections.js` (NEW, ~52KB) = `window.ROLE_SECTIONS[role]` = SVG outline auto-extracted from `elevations/Roles.dxf` (aluminum-profile layers only, normalized 0–100). Shown on By-Role expand + as a hover tooltip over pieces in the Elevation Viewer. Added `<script src="role-sections.js">` before app.js in both index.html. **Not done**: in-browser "upload a dxf → auto-recognize sections" (would port the Python extractor to JS) — follow-up.
- **#4** push not updating tracker elevation: `elev-cloud.js` subscribes to `elevGeo` and overwrites static in real time, but an already-open elevation editor doesn't re-render on snapshot → reopen the unit / refresh. Also the deployed takeoff was pre-T4 (only last import pushed) until re-upload. No code bug found.
- **#6** role-edit persistence: the live version predated T3; after re-upload it has T3 (`state.roleEdits`, unit-tested). The earlier loss was the old build.
- **Re-upload checklist** (GitHub, manual): repo root → `vercel.json`, `app.js`, `index.html`; `takeoff/` → `app.js`, `index.html`, `systems.js`, `cloud-sync.js`, `role-sections.js` (new). Then Vercel redeploys.
- Roles.dxf gasket counts (T1) and Roles.dxf sections (#5) both sourced from the same `elevations/Roles.dxf` legend (14 role rows, labels x≈12682, sections just left).

## ✅ Session log 2026-07-13 (Opus) part 3 — tweaks
- **#1 reverted**: duplicate part numbers in a role are allowed again (user changed their mind). `+ Add part` no longer filters by partNumber.
- **#5 role sections reworked** (`role-sections.js` regenerated, ~272KB, ?v=20260713f): now applies INSERT rotation (matrix transform), keeps CAD colors (entity code 62 / LAYER-table color → ACI→hex, grouped into one `<path>` per color), includes the AF_Gasket layer, and uses ONE global scale (≈9.26 px/in) so horizontals (~69×24) and verticals (~23×69) are truthfully proportioned. SVGs carry explicit width/height; display containers widened (By-Role 128×82, hover 128×92). Coord sanity-checked (all within viewBox). Generator lives only in chat history (Python over Roles.dxf) — re-run if Roles.dxf changes.
- **#2 no code bug found**: `buildElevExport` returns `{key:mark}`, tracker reads `window.ELEVATIONS[u.id]`, `elev-cloud.js` is loaded and overwrites static live. Mismatch causes: pushing a drawing that doesn't contain the viewed unit, or mark≠unit-display-id (dash/case). Tell user to hard-refresh tracker and check console for `[elevGeo] loaded N`.
- **localStorage note**: `roleEdits` (T3) and elevation edits are per-origin — `file://` and the deployed site have separate stores; edits don't cross over. Expected, not a bug.

## ✅ Session log 2026-07-13 (Opus) part 4 — louver export fix + Lv merge (?v=20260713g)
- **LOUVER EXPORT BUG FIXED** (the real cause of "SF11-14 louvers not in tracker"): louvers WERE detected at parse (cuts get (X)/(Lv) roles, `louverBand` non-null, base SVG draws blade lines) but `buildElevExport` emitted **0 louver elements** for east.dxf. Root cause: east's louver band is bounded by the louver's OWN frame on layer AF-PANEL (excluded from the frame `pool`), so the glass-cell grid never forms a cell inside the band → nothing gets `t0:'louver'`. south.dxf's louver band IS bounded by pool horizontals, so its grid cells become louver (worked). Fix (additive, in `buildElevExport`): track `louverBays` that already got a louver grid cell; after the grid loop, for each bay whose center-x is in the louver band and that has NO louver cell yet, emit an explicit louver element spanning `[louverBand.minY, louverBand.maxY]`. **Harness-verified on all 4 drawings**: south UNCHANGED (SF04–10 louver counts identical → hard floor preserved), east now SF11-14 = 4/5/4/4 louvers, west SF02/03 = 2/4 (were 0), SF01 unchanged (no louver). Built a working Node harness by combining bash-truncated head (lines 1-1897) + Read-tool tail (dxf* helpers) + minimal SYSTEM_DEFS stub — see chat for the recipe (the mount truncates app.js AND systems.js).
- **Vertical (Lv) merged into Vertical (X)** (user: they're identical). systems.js: removed 'Vertical (Lv)' from all 750XT part roles (each also had 'Vertical (X)'). app.js XMAP: `Vertical→Vertical (X)`, `Door Jamb→Vertical (X)` (was Vertical (Lv)). COLOR maps still list a (dead) 'Vertical (Lv)' entry — harmless. Cloud parts doc still has Lv on parts until re-seeded, but no cut emits Lv anymore so it's inert.
- **#1 reverted**: duplicate part numbers in a role allowed again.
- Re-upload (GitHub): `takeoff/` app.js, index.html, systems.js (+ role-sections.js if not already). Root app.js/index.html/vercel.json from parts 2/3.

> Read order: `AC3 tracker/CLAUDE.md` (rules + editing lock) → `AC3 tracker/SYNC.md` → `AC3 tracker/HANDOFF.md` (full history) → this file.
> This file = execution spec for the current TODOs. All diagnoses below are verified — do not re-investigate.

## Folders (ask user to mount all three)

| Path | Contents |
|---|---|
| `C:\Users\Ethan\Downloads\takeoff tool` | The tool (original): index.html + app.js (~2100 lines) + systems.js + cloud-sync.js + firebase-init.js. No lock protocol |
| `C:\Users\Ethan\OneDrive\文档\Claude\Projects\AC3 tracker` | Tracker. **Before editing ANY file: read CLAUDE.md, write EDITING.lock, delete it when done** |
| `C:\Users\Ethan\Downloads\Atlantic-Chestnut Building 3\elevations` | Test drawings: 01/south/west/east.dxf, 750XT parts.xlsx, 1.png/2.png (hand-colored role paradigms) |

**Mirror rule (iron law)**: `AC3 tracker/takeoff/` is a copy of the Downloads takeoff tool (app.js / systems.js / cloud-sync.js / index.html / firebase-init.js). **Every edit must be applied to BOTH copies** (apply the same Edit twice). After changes, bump `?v=` in both index.html files (currently 20260713d).

## Environment traps (all hit before — don't re-hit)

- **bash mount serves stale/truncated snapshots** of files recently edited on the host. Trust the **Read tool** for verification. For the Node harness, app.js is often tail-truncated — cut at the first anchor that exists: `function exportCsv()` → `function loadDxfSample()` → `function importDxfFile()` → `function runDxfParse()` → `lastIndexOf('\nfunction ')`.
- systems.js snapshots truncate at random points — **don't stitch**; use a self-contained stub like `/tmp/systems-750xt.js` (write the full current 750XT block into it and eval that for tests).
- `750XT parts.xlsx` becomes an unreadable/corrupt zip in the mount whenever the user edits it. Don't retry endlessly — **ask the user to paste the contents**.
- Harness template (drives the real functions, never re-implement the algorithm):
  ```js
  global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
  global.document={getElementById:()=>null,addEventListener:()=>{},createElement:()=>({style:{},classList:{add(){},remove(){}},setAttribute:()=>{},appendChild:()=>{}}),querySelectorAll:()=>[]};
  global.navigator={clipboard:{}};global.window=global;
  // eval systems stub → read app.js, truncate at anchor → append
  // global.__api={parseRawDxfOpenings,buildReport,get state(){return state},set state(v){state=v},get exports(){return LAST_ELEV_EXPORTS}} → eval
  ```
- Regression baseline: `harness-baseline-20260713.json` (now outdated; re-save after confirming all 4 drawings parse as expected). **Never regress the normal storefronts** — that's the hard floor.

## User's hard rules

- ≤10% of tokens per change; ask before big moves; no guessing; harness regression after every algorithm-adjacent change.
- **Do NOT iterate on DXF recognition heuristics** unless the user explicitly asks (it's expensive and drawings vary). Recognition errors are fixed by the user with the self-serve tools that now exist: click a cut in the Elevation Viewer → change its role via the Position dropdown; "+ Add Role" creates new roles; Parts table role-chips attach parts; "↔ 连续" toggle marks a part as continuous; tracker "Edit layout" changes element types.

## NEW TASKS from the user (2026-07-13, in priority order)

### T1. Gasket takeoff
User: "要算 gasket, 你懂怎么算吗, 不懂问我" — **ask the user for their gasket calculation rules before building anything.** Context: the tool already has an Accessories rules engine (per-piece qty / o.c. spacing / LF factor / per-lite; see Accessories section + `accessories` in systems.js). Gaskets are most likely LF-based off framing cut lengths per position (possibly ×2 for interior+exterior, glass-edge based, or per-lite perimeter). Get the exact rule(s) from the user (which positions, which factor, interior/exterior, corners/waste), then model them as accessory rules of the 750XT system so they ride the existing engine and cloud-sync.

### T2. Role RENAME feature
User wants to rename roles (e.g. `Vertical (Lv)` → `Vertical (X)`). Add a rename affordance in the By-Role table (e.g. ✎ icon per role row → prompt for new name). A rename must update, atomically:
- `state.parts[].roles` (all parts of that system),
- `state.openings[].cuts[].position` (all cuts),
- `state.customRoles[]` entry if present,
- then `save(); renderParts(); renderReport(); renderMeta();` and re-render viewer if open.
Note: hard-coded color maps (`COLOR_750XT`, `POSITION_COLORS`) are keyed by name — a renamed role that leaves the map falls back to `customRoleColor(name)` (hash palette). That's acceptable; optionally carry the old color into a `state.roleColors[name]` override map checked first by `cutColor()`.
Warning: renaming to an existing role MERGES them — confirm() with the user in that case. Cloud: parts changes push automatically; cuts/openings are local-only.

### T3. Persist manual role edits across re-imports
User: re-importing a DXF wipes their manual role corrections (they previously asked for no memory; **they changed their mind — remember edits now**).
Design: keep a per-drawing override journal in state, keyed by mark + piece geometry:
- `state.roleEdits = { [mark]: { [srcKey]: position } }` where `srcKey = x|y|w|h` rounded to 0.1 (stable across re-imports since geometry comes from the same DXF).
- Record: in the viewer edit handler where `cut.position` is changed by the user (and on delete? — start with position changes only).
- Apply: at the end of `parseRawDxfOpenings`'s per-cluster loop (after all auto classification), for each cut with src, if `roleEdits[mark][srcKey]` exists → override position. Also apply to `buildElevExport`? No — elements are separate; keep it to cuts.
- Persisted via `save()` (localStorage). Add a small "× clear overrides for this mark" affordance in the viewer header so the user can revert to pure auto.

### T4. "→ Tracker" must transfer ALL elevations + show which
Current bug/behavior: `LAST_ELEV_EXPORTS` is an in-memory array reset on every `parseRawDxfOpenings` call, so the push only covers the LAST import (user saw "已推送 1 个立面" after importing one file — earlier imports were not re-pushed).
Fix: accumulate instead of reset — e.g. `let ELEV_EXPORTS = new Map()` keyed by mark; on each parse, `set(mark, data)` (new parse of same mark overwrites). Persist across page reloads if feasible: localStorage may blow up (base SVG strings; south alone ≈ 400KB — 5MB cap risk) → prefer IndexedDB, or accept session-only persistence and say so in the button tooltip.
`exportElevationsToTracker()` then pushes everything in the map and reports **the list of marks**: e.g. `Pushed 14 elevations: SF01, SF04.1, SF04.2, …` (set `#export-status` text; it may need a title attr for overflow).
Apply T3 overrides before building export? (Elements are type-based, not role-based — unaffected. No action.)

### T5. SF11–SF14 louvers missing in tracker elevations
User's east.dxf was RE-EXPORTED and now contains SF13/SF14 — the mounted snapshot here is stale (old east.dxf has SF11/12/13 only), so this was not reproducible. Once the mount syncs (or ask user to re-copy east.dxf):
- Check whether the new east.dxf still has louver INSERT blocks (`isLouverBlock`: block with 0 LWPOLYLINE + ≥24 LINEs, or /louver/i name). If the louver is now drawn inline (not as INSERT), `louverRegionsAll` stays empty → `louverBand` null → no (X)/(Lv) cuts AND no louver cells in the export.
- If so, this is the ONE recognition extension the user does want (too many cells to hand-paint): detect louver regions as dense stacks of parallel horizontal LINEs directly in ENTITIES (e.g. ≥10 lines, same x-extent, vertical spacing ≤3") on whatever layer the blades live (check the actual drawing first; south used AF-PANEL block inserts). Confirm the pattern with the user before coding; regression-test south/west/01 (must stay byte-identical counts).
- Tracker-side fallback: user can flip cell types in tracker Edit layout, but they explicitly said there are too many — automation is wanted here.

### T6. Full-English UI pass (user demand: NO non-English text anywhere in the takeoff UI)
Scope (**both copies**):
- `index.html`: project bar ("零件库 Parts Library…", "各系统的 parts + 配件规则云端共享;openings 仅本地"), Set System button title, viewer hints ("点立面图里的料…", "新增一根料(手动)"), system-modal "选择 System", DXF paste hints, report footer formula line ("FFD 摆料(长段优先 · 回头补余料 · 超长段拼接)").
- `app.js`: all user-visible strings — Add Role prompt/alert, import confirm ("Openings 表中已有 N 行,导入会追加…"), pickSystem modal text, flash/status messages ("已推送 N 个立面到 tracker (elevGeo)", "先 Import DXF(几何解析)再导出立面", "云端未连接 — 需先开通 Firestore…", "推送中…"), By-Role header ("各角色总下料长(点开看由哪些 part 组成)"), "+ 加入 part…", "把该 part 移出「…」", **"↔ 连续" chip → "↔ Continuous"**, `rolesUsed.add(role + '·连续')` → `role + ' (run)'`, viewer edit box ("编辑料 #", "位置"), etc. **Only user-visible strings — leave code comments alone.**
- `cloud-sync.js`: every `setStatus` string ("● 连接中…", "● 已同步", "● 保存中…", "● 初始化零件库…", "● 离线(用本地零件库)", "● 云端连接失败(用本地零件库)", "● 保存失败(已存本地)", "● 初始化失败(用本地零件库)", "● 云端为空,且无本地种子") → English equivalents.
- `tracker-bridge.js`: check remaining strings.
- Verify with `grep -P "[\x{4e00}-\x{9fff}]"` over the four files — hits allowed only in comments. Bump `?v=`.

### T7. Cloud parts-library merge (careful — user has custom data in cloud now)
Firestore `systems/750XT` (project atlantic-chestnut-3) was seeded 7/10. Local systems.js later added: `Sill (normal)` role (on BE9-3904/E9-3162/AS-3907/E9-1206/E1-3603/E2-0513), `Vertical (X)` (= same parts as Vertical (Lv): BE9-3910/AS-3906/E9-1206/A-Pocket-Filler), `Vertical (wide X)` (BY7-9065/AS-7110/E9-1660/A-Pocket-Filler×2), `continuous:true` on C. Cloud overwrites local on every page load, so these vanish for the user unless merged.
**Do NOT delete the cloud doc to reseed** — the user has already added a custom role `Horizontal(Y)` with 4 parts attached in the live page (visible in their By-Role table; that data lives in the cloud doc now, and `state.customRoles` locally). Merge options: (a) guide the user to click the missing role chips + the Continuous toggle in the Parts table (UI edits push to cloud — safest); (b) one-shot merge script via Firestore REST (union roles per part, OR the continuous flags) — confirm with user first. Note their screenshot also shows `Sill(normal)` (no space) with 6 parts — they may have hand-created it; if both `Sill (normal)` (code) and `Sill(normal)` (hand-made) exist, use T2 rename to merge and confirm which spelling wins (cuts are emitted as `Sill (normal)` by app.js — that spelling must survive).

## Other open items (older, still pending)

- Tracker units need a fresh Import → "→ Tracker" push for every drawing (old exports had a full-face giant panel element on SF11/12 — fixed in code; and stray glass on SF01 — fixed).
- Remove the stale static merged `SF04` entry from tracker `elevations.js` (cloud elevGeo overrides same-name keys, but clean it up).
- Tracker core `app.js` unit-key sanitize change (`.#$/[]` → `-`) is NOT yet synced to CP2.
- Reverse status coloring (takeoff viewer reads tracker install status) — approved direction, not built.
- **Fab drawing / cut ticket** (user is excited about this): step 1 = cut ticket per piece (part#, section, length, role, host elevation + location thumbnail). All data exists (`cuts[].src` geometry + role→parts mapping). Ask the user for 1–2 samples of their current hand-made fab drawings to set the format.
- Re-save the harness baseline after the above settle.

## Architecture quick reference

- Parse chain in `parseRawDxfOpenings` (app.js ~line 1150+): door/louver INSERT detection → HATCH detection (AF_HATCH = IMP panel strip, AF_GENERAL = strip w/ steel beam behind, large = by-others zone) → `isStructural` exclusion (columns ≥12" wide verticals / boards ≥6" thick horizontals, removed BEFORE clustering) → clustering on frame layers only (layer-0 grade LINEs parse as 0×0 invisible points that bridge elevations — kept out) → mark matching (same-name pairs get .1/.2) → `dxfDetectCuts` (750XT: floor/sill/head from mode of vertical endpoints; no door blocks → "no-sill opening" = by-others: flanking deep verticals = Jamb (X), cap bar = Horizontal (X); horizontals classified LOCALLY: verticals ending at a bar = Head, starting = Sill, passing = Horizontal) → 750XT position post-processing (no Transom Bar / Door Jamb At Transom / Corner; door transom → Horizontal (X); Door Jamb full-height dedupe; w≥3.5" → Vertical (wide)) → louver XMAP (+ band-lowest-row → Sill (X)) → IMP panel bands (top edge row = Sill (normal), bottom edge row = Head, verticals crossing a band split into 3 segments, band segment → (X) variant; bands must sit above the main floor; bands grouped by y-overlap) → `buildElevExport` (cells: glass / louver / panel / door; strips h≤12 only become panel elements; by-others zones suppress cells).
- `buildReport`: per-cut part matching + **continuous parts** aggregate via `contRuns` (adjacent same-row segments merged across mullions, gap ≤8", priced as full runs).
- Colors: `COLOR_750XT` (xlsx color key) → `POSITION_COLORS` → `customRoleColor` (name hash, 8-color palette).
- Custom roles: `state.customRoles[]` (localStorage; becomes shared once attached to a part, which syncs via parts cloud).
- Cloud: parts library = Firestore `systems` collection (no auth; rules open only systems + elevGeo, see FIRESTORE-SETUP.md); elevations = Firestore `elevGeo` (doc id = mark; tracker `elev-cloud.js` subscribes and merges into `window.ELEVATIONS`, cloud wins over static elevations.js); tracker progress data = RTDB with auth (separate). `firebase-init.js` is a classic script using dynamic import — **do not** revert it to `type="module"` (breaks on file://).
- Tracker↔takeoff handoff: tracker header "🛠 Takeoff Tool" links to `takeoff/index.html`; unit display id must equal the mark (e.g. `SF04.1`) for elevations to attach.
