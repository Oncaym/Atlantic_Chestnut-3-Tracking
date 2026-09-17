# memory.md — AC3 Project Memory (DYNAMIC)

> **Agent-maintained.** Read this at the start of every session; update it as you work.
> This is the churn layer — it keeps `CLAUDE.md` (the cached constitution) stable.
> Keep entries terse. Newest first within each section. Prune stale items.
>
> **How to maintain:** when you (a) resolve a bug/trap, (b) hit a milestone, or (c) make a
> non-obvious decision — add one line here. Move anything permanent into `CLAUDE.md`.

---

## Current state / progress

- **2026-08-05 — F-054：`index.html` 加 no-cache**（两个 `vercel.json`，只针对 .html/根路径）。**踩坑记录**：
  改了 index.html 里的 CSS（submittal 弹窗全屏）之后 Leo 看到的还是旧样式 —— `?v=` 只给 JS 破缓存，
  HTML 自己是缓存的。以后动 index.html 的 CSS/markup，如果对方说"没变化"，先想这条。顺带把 Submittal Log
  表调宽（NOTE 列可换行、长回复 6 行 clamp、表格 72vh）。

- **2026-08-05 — F-053：①玻璃 `ready` 不再算进 Daily Installation Trend**（Leo：只算 installed）——
  `autoLogUnitChanges` 只在 installed 时写 glass 条目，issue 仍归 issue；已写进去的 ready 行由迁移
  `glasslog-installed-only-2026-08` 清掉（两个项目的 project-config 各带一份，AC3 是第一次有 migrations 数组）。
  **注意**：Glass 环形图里的 "Ready" 扇区是有意保留的（那是库存口径，不是安装进度）。②AC3 的 submittal
  编辑弹窗改成接近全屏 + 宽屏两列，逐家回复/Note 横跨两列，Save 吸底 —— 为以后几十条 submittal 连续编辑。

- **2026-08-05 — F-052：submittal 进 Things to Solve**（Leo）。`computeOpenItems()` 把未批准的 submittal
  也算事项，所以 🔧 徽标 / 红横幅 / Issues KPI 自动包含。`revise-resubmit`+`rejected`=球在我方（红
  Resubmit，按**退回日**算天数），`submitted`+`under-review`=球在审核方（琥珀 In review，列出当前 Rev
  还没回的几家）。draft 和 approved 不进。面板独立一段，点一行开对应 submittal 弹窗。CP2 没有 submittal
  UI，`state.submittals` 为空 → 零影响。验证：`node _tests/test-submittal-items.cjs`（23 断言）。

- **2026-08-05 — F-051：unit type 注册表**（Leo 问"以后我自己怎么加类型"）。⚙ Modules → 🔷 Unit types
  面板：名字 + 编号前缀 + 形状(6) + 描边色(8) + 两字徽标，存 `state.unitTypes`（走正常保存 → 同步 +
  编辑历史，**不需要新的 Firebase 规则**）。填充色仍然只表示安装状态；unit 弹窗可手动覆盖类型；图例自动
  生成。操作步骤写在 CP2 的 `CLAUDE.md` 末尾（"怎么加一种新的 unit 类型"）。45 条断言。

- **2026-08-05 — F-050：Face Cover 与 Beauty Cap 统一成 `beautyCap`**（Leo：本来就是一个件）。core 的
  Calendar tab 合成一行 Beauty Cap（读不到新键回落旧 `faceCover`）；两边 `scopeKpis`/`ringScopes` 都是
  caulking + beautyCap；CP2 加了一条重命名迁移。**AC3 的 Sun Shade 百分比卡删掉**——scope grid 里已经有
  一张按数量的 SUN SHADES，两个口径重复。AC3 的 `u.scopes.beautyCap` 本来就是这个键，无需迁移。

- **2026-08-05 — F-049（紧接 F-048）：①**core 删掉每日 GC 推送**（📤 按钮 + `buildDailyPushText` 等
  约 85 行；卡点横幅和 Things to Solve 保留）——Leo：推送最后都是手写的。②AC3 的三张 scope 完成度卡
  从单独一行**移进 `#scopeGrid`**，跟其它 scope 卡同一个 banner：每个项目的 scope 不同，但版式逻辑
  必须一致。注意 AC3 现在 grid 里同时有「SUN SHADES 0/19」（按数量，AC3 自己的 localStorage 统计）
  和「Sun Shade install 0%」（按 unit 的 scope 状态，core 统计）——两个口径，如果觉得重复就说一声删掉。

- **2026-08-05 — CORE 统一（AC3 ← CP2 全量同步，F-048）。** 两边的 core 已经差了约 2000 行：CP2 领先
  F-033/037/038/039/040（GC 协作、openings、lens 栏、每日推送、活动记录）+ F-041~F-047；AC3 只领先
  今天的 submittal 逐家回复 + 拖拽排序。做法：**以 CP2 的 app.js 为底**，把 AC3 的 submittal 整块
  （`/* -------- Submittal log (M4) -------- */` … `Photo gallery viewer`，AC3 版是严格更新的超集）换进去，
  合并后 `app.js` / `cloud-sync.js` / `app-log.js` / `chat.html` **四个 core 文件两边 md5 一致**。
  - **新增 core 能力 F-048（为了让两边共用同一份代码）**：per-scope 的 KPI 卡和 marker 圆环不再写死
    caulking/faceCover，改由 `PROJECT.scopeKpis[]` + `PROJECT.ringScopes[]` 驱动（缺省仍是 CP2 那对，
    老项目零变化）。AC3 配成三张卡：**Caulking / Sun Shade / Beauty Cap**（Leo 选的），圆环取前两个
    （marker 只有左上/右下两条弧）。抽出 `_scopeDrillRows(name)`，卡片点击走 `openKpiDetail('scope:<name>')`。
  - **AC3 index.html 补齐**：`#planSection`（lens 栏挂载点，缺了整条 lens 栏都不会出现）、三张 scope 卡
    （`data-gc-hide`）、unit 弹窗的 Floor / Door type 两行、**Field Verify · R.O. tab**（openings + shop
    drawing + 尺寸基准都挂在这个 tab 上）、平面图图例四项、以及 CP2 那套 CSS（GC 视图、lens 栏、openings
    清单/打印、scope 圆环、IS 菱形、门类型描边、`--kpi-accent` 条）。主题变量五个（`--caulk-ring`
    `--fc-ring` `--int-sf` `--fire-door` `--follow-op`）深浅两套都补了。
  - **静态审计**：扫了 core 里所有 `getElementById`/`querySelector('#…')`，AC3 仍缺的 4 个
    （`glass-panels-list`、`l-photo-input`、`planCollapseBtn`、`unit-projlinks`）**全部有 null guard**，
    确认不会抛错（AC3 的玻璃走 elevation，不需要 Glass tab）。CP2 侧缺的都是 AC3 专属（elevation tab、
    submittal UI、`cal-facecap`），同样有 guard，且本来就是这个状态。
  - **GC 功能在 AC3 是"装了但没开"**（Leo 决定）：`gcItems` / `access` 两个 Firebase 节点没在 AC3 的
    Firebase 项目里发布，也没建 GC 只读账号。所以 GC 卡片/📤 推送/访问日志这些代码在，但没人能用；
    **要开的时候必须先发布规则**，否则 GC 提交会静默失败（CP2 的 `firebase-database-rules.json` 可直接抄）。
  - **验证**：AC3 `_tests/test-ac3-sync.cjs`（28 断言：四个 core 文件 md5 一致、三张卡按配置绘制、
    圆环读 sunshade 而不是 faceCover、drill-down 排序、AC3 markup 齐全、缓存版本号）+ 原有
    `test-submittal-reviews.cjs`（43）；CP2 五套 84/33/36/65/21 全绿。`?v=20260805s` 四个脚本标签都bump了。
  - **Leo 待办**：本地开一遍 AC3，重点看 ①三张 scope 卡有没有数（要先在 unit 的 Calendar tab 把
    Caulking/Sun Shade/Beauty Cap 设成 Installed）②平面图上方多了 lens 栏（📐 Openings / 🔧 Issues /
    ✓ Progress）③unit 弹窗多了 Field Verify · R.O. tab 和 Floor / Door type 两行 ④原有功能（elevation
    tab、submittal log、takeoff 跳转）没被碰坏。

- **2026-08-03 — Submittal Log: per-reviewer ball-in-court responses, grouped by Rev (SHIPPED).**
  Leo's ask: Procore replies must be logged per ball-in-court party; the parties are always the
  same 4 in a fixed order, so seed them by default but keep them editable; keep history per Rev.
  - Data: `s.reviews = { Rev0:[{party,status,response,date},…], Rev1:[…] }` keyed by
    `revKey(s.rev)` (blank rev → `Rev0`). `s.ballInCourt` is now **derived** (current rev's
    parties joined `" / "`) and kept only for back-compat — nothing writes it by hand anymore.
    Legacy rows (string only, no `reviews`) are projected into rows at render time by
    `reviewsFor()` **without mutating state**; they upgrade on first save.
  - Party list is PROJECT data: `window.PROJECT.submittalReviewers` in `project-config.js`
    (AKRF / Bright Power / Dattner / Monadnock — fixed order). `app.js` is CORE and never
    hardcodes names; other trackers just supply their own list (or none → empty seed).
  - Statuses `REVIEW_STATUS`: pending · no-exception · reviewed · note (Action Required) ·
    revise-resubmit · rejected · na. First non-pending status auto-stamps today's date (editable).
  - Modal: `#sub-reviews` renders one card per reviewer (party / status / date / response
    textarea) + `+ Reviewer`, `Restore default list`, per-row `×`. Editing the **Revision** field
    (`onchange="onSubRevChange()"`) opens a fresh round pre-seeded with the same parties, statuses
    reset; earlier revs stay as read-only history in a `<details>` block. Working copy
    `_subReviews` is a deep copy → Cancel discards. Blank rows/revs dropped on save (Firebase).
  - Table BIC column: `renderBicCell()` — `Rev0 · 2/4 responded` header + a
    `grid-template-columns:max-content 1fr` grid: reviewer (color dot + name) on the left, that
    reviewer's **response text inline on the right** (+ dim date). No response but a real status →
    dim italic status label. (Leo 2026-08-03 revision: the 💬-tooltip version was rejected, the
    reply must be readable straight from the list.) `td` is `min-width:340px;max-width:520px`.
  - **Drag-to-reorder** rows (replaces one-step-at-a-time clicking): `.drag-grip` (⠿) is the only
    `draggable` element so plain row clicks still open the editor; the `<tr>` is the drop zone
    (`onSubDragOver/Leave/Drop`), upper half = insert above, lower half = insert below, shown with
    an `inset box-shadow` line. `reorderSubmittal(from,target,before)` splices by **object
    identity** (`arr.indexOf(tgt)` after removal) so it is correct while a status filter hides
    rows. ▲▼ kept as the touch/no-DnD fallback (touch devices don't fire HTML5 drag events).
  - CSS: `#submittalModal .modal { max-width:560px; max-height:88vh; overflow-y:auto }`.
    Bumped `app.js?v=20260803a` + added `project-config.js?v=20260803a` in `index.html`.
  - **Verified**: 43-check jsdom harness (`_tests/test-submittal-reviews.cjs` —
    `npm i jsdom` then `node _tests/test-submittal-reviews.cjs`; it slices the submittal block out of
    `app.js` and evals it against the real DOM, so it stays valid as long as the
    `/* -------- Submittal log (M4) -------- */` marker stands) against the real
    `index.html` markup + `node --check` on both files. Covers default seeding/order, save shape,
    Rev0→Rev1 history, legacy-string migration, row add/remove, derived string, HTML escaping,
    inline reply pairing (party↔response grid cells), drag up/down/self/last + reorder under filter.
    Not browser-tested — Leo eyeballs the UI. CORE change → `SYNC.md`/`FEATURES.md` propagation
    to CP2 still owed (CP2 needs its own `submittalReviewers` list).

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

### 2026-07-21 (Opus) — Pooled cutting-diagram DXF export (`app.js?v=20260720j`)
Leo: new export — all openings' parts POOLED (not per-elevation) into one DXF. Built
`buildPooledPacking()` (loops every opening through `collectOpeningIntoBuckets` into ONE bucket map,
then `packFFDLayout` per part — same pooling `buildReport()` uses for order-list counts) +
`downloadPooledCuttingDxf()` (wraps `buildCuttingDxf(groups,'ALL OPENINGS (pooled)')`, file
`all-openings-pooled-cutting.dxf`). New sidebar button `#export-cutting-dxf-pooled` ("Cutting DXF
(all openings pooled)"), wired in init(). Leo's choice: plain lines, NO per-piece source-mark
labels. Keeps the existing per-elevation + per-elevation-combined exports. Verified: new functions
pass isolated `node --check` (`outputs/pooled_syntax.js`); full-file check blocked by the workspace
mount capping app.js at ~3423 of ~3800 lines (known env issue) — insertion is complete functions at
clean boundaries in a file already fully node-checked at v i, so syntax is safe. Not browser-tested;
not pushed to GitHub.

### 2026-07-21 (Opus) — `Horizontal (Glass&Glass)` → `Horizontal (Glass & Glass)` rename
(covered below in the role-name fix note.)

### 2026-07-20 (evening, Opus) — Layer B DELETED (Task 1 of the Opus handoff done); `app.js?v=20260720f`
Executed Task 1 of `HANDOFF-FOR-OPUS-20260720.md`. Deleted from `takeoff/app.js`:
`computeOpeningZones`, `zoneShapeOf`, `computeRoleSignature`, `roleSigKey`, `persistRoleRule`,
`applyLearnedRoleRules`, `loadRoleRulesFromCloud` (+ its `fb-ready` registration), the viewer
Position-dropdown capture point, and all `zones`/`zoneShape` threading through `classifyRoles`
and the parse loop. `state.roleRules` no longer read/written; Firestore `roleRules` collection
left dead/harmless (see FIRESTORE-SETUP.md note). **Layer A untouched** — `imp1Bands`, Stage 1/2
IMP-1 split, `IMP1_VERTICAL_ROLES`/`normalizeImp1RoleToBase`/`toImp1Role`, Horizontal
(Glass&Glass), `applyRoleWhitelist`, and the SF01 pin-protection pass all preserved verbatim.
`_bands` on each opening retained (minus zones/zoneShape) as input for the future template
feature. Bumped `app.js?v=20260720e`→`20260720f` in `takeoff/index.html`. PROPAGATION-DESIGN.md
§3-LayerB/§9/§9b marked ⛔ ABANDONED (kept as history).
⚠️ **Verification gap (environment):** this session's shell saw only a *partial* OneDrive sync of
the 3395-line `app.js` (Files-On-Demand hydrated ~2255 lines to disk; the Read/Edit tools saw the
full file). `node --check` therefore ran only on the hydrated prefix (lines 1-2255 = **0 syntax
errors**, covers both function-deletion seams + the capture-point edit); the 3 parse-section
edits were verified by authoritative read (balanced) but not by a full `node --check`. **TODO
(direct-disk env): run `node --check takeoff/app.js` on the full file + re-run the §13 10-check
and S3/§14 regression harnesses to confirm Layer A role output is byte-for-byte unchanged.**
Nothing pushed to GitHub yet.
- **Task 2 (recognized-roles allow-list) — BUILT this session** (`app.js?v=20260720f`, same version
  bump as Task 1). Per-system `state.recognizedRoles[system]` manual list gates `applyRoleWhitelist`;
  new `recognizedRolesForSystem`/`hasManualRecognizedList`/`applyRolePins`/`applyRecognizedRolesToAll`/
  `setRecognizedRoles`; left-sidebar "01b — Recognized Roles" UI (`renderRecognizedRoles` + init
  handlers). Kills both resurfacing mechanisms: whitelist gate + dropping stale pins that hold a
  retired role (only when a manual list exists — un-curated systems keep the exact old SF01
  behaviour). Decisions (removal cascade remap→flag, keep separate from "+ Add Role", local-only
  storage) documented in PROPAGATION-DESIGN.md §17. Verified: isolated 19-check Node harness
  (`outputs/task2_harness.js`) all pass + UI `node --check` clean. **UI not browser-tested; full
  whole-file node --check / regression harness NOT run (partial-OneDrive-sync shell).**
- **Task 3 (template-classification) — BUILT (Leo asked me to finish it; `app.js?v=20260720g`).**
  Leo simplified the spec: **matching = top→bottom fill-order sequence ONLY** (no proportion/bay
  checks), **manual** pick+preview+confirm apply, **doors = another fill**, ~3–5 templates. Built
  `computeFillStack`/`fillSequenceOf`/`memberKeyOf`/`buildTemplateFromOpening`/`templatesMatchingOpening`/
  `applyTemplateToOpening` + `saveRoleTemplate`/`deleteRoleTemplate`/`loadRoleTemplatesFromCloud`
  (Firestore `roleTemplates`, tombstone delete). UI: viewer "Save as Template" + "Apply Template"
  (preview→confirm) + left-sidebar "01c — Templates" list. Layered on top of Layer A (only overrides
  role labels). Apply writes roles as roleEdits pins so they persist through re-import. As-built in
  PROPAGATION-DESIGN.md §16.9; FIRESTORE-SETUP.md has the new `roleTemplates` rule. **Leo's deeper
  goal: a self-sufficient takeoff tool that doesn't need Claude** — templates let him correct
  classification by example. Verified: 16-check Node harness + full `node --check`. **Not browser-
  tested; not pushed to GitHub.**
- **ENV NOTE (important for next session): Leo MOVED the working folder off OneDrive to
  `C:\Users\Ethan\Downloads\AC3 tracker` on 2026-07-20** specifically so the shell could see the
  full file. Even there the workspace bash mount lagged writes (served truncated partials at
  3445/3479 lines vs the real 3742), so full `node --check` was done via a stitch: bash `head -n
  3389` (reliable prefix, below every truncation) + the authoritative tail from the `Read` tool →
  `/tmp/full.js` → `node --check` (passed). If bash shows a truncated `app.js`, it's the mount, not
  the file — trust the `Read`/`Edit` tools.
- **Task 3 FIX (`app.js?v=20260720h`) — fill layout is wrong on stacked storefronts + now manually
  editable.** Leo (SF02): auto-detected `glass>louver>glass>imp-1>glass` was wrong; SF02 is louver
  (top storefront) then imp/glass/glass (lower). Cause: `computeFillStack` counted the empty gaps
  above/between storefronts as glass fills. Fix: (1) `detectFillSequence(o)` drops any glass zone
  with NO framing member (dead space) — gives `louver>imp-1>glass`; (2) auto still can't know if the
  lower glass is one fill or two (split by a transom), so the fill layout is now a **manually
  editable field** in the viewer template row (`o.fillLayout`, `openingFillSequence`/
  `setOpeningFillLayout`, `#vc-fill-layout` input + `↺ Auto` reset). Matching + template save use the
  manual layout when set. Verified: 7-check harness (`outputs/task3b_harness.js`) + full stitched
  `node --check`. As-built updated in §16.9.
- **NEW STANDING RULE (Leo, 2026-07-20) → CLAUDE.md §4.8: "Manual override everywhere."** Every
  automated/detected result must be hand-adjustable; auto-detection is only a default guess, always
  expose UI (or a documented setter) to correct it. Apply to ALL future functions, not just fills.
- **Role-name fix (`app.js?v=20260720i`, `systems.js?v=20260721a`): `Horizontal (Glass&Glass)` →
  `Horizontal (Glass & Glass)` (WITH spaces) everywhere.** The live cloud parts library uses the
  spaced name; code+seed emitted the no-space name, so the whitelist couldn't match it and
  ROLE_REMAP fell it back to plain `Horizontal` (Leo's "总是识别成 Horizontal" bug). Renamed in
  app.js (ROLE_REMAP + classifier) and systems.js (5 part role lists). Canonical name is now the
  spaced form. Verified via stitched full `node --check` on both files (mount still lagging).
- **All three Opus-handoff tasks + the fix now sit at `takeoff/app.js?v=20260720h`** (Task1 delete
  Layer B, Task2 recognized-roles, Task3 templates + fill-layout override). Root tracker
  `app.js?v=20260720a` unchanged. Still user-side: full regression harnesses (§13/§14/S3), browser
  smoke-test of the two new sidebar panels + viewer template/fill-layout controls, and GitHub push
  for Vercel.

### 2026-07-20 (late) — Layer B killed by Leo; handoff written for Opus, not built yet
Leo: propagation error rate too high — **delete Layer B entirely**, don't keep tuning it (this
overrides everything in the "Layer B propagation rework" entry above — that rework is now dead,
about to be reverted). Also raised two more items and asked me to write a handoff instead of
building: (1) stale/retired roles keep resurfacing — likely `applyRoleWhitelist`'s "no ROLE_REMAP
chain → leave visible" fallback combined with the 2026-07-19 pin-protection pass unconditionally
restoring old pins forever, with no revalidation against the system's current role set; wants a
left-sidebar manual add/remove list of recognized roles; (2) a bigger new-feature idea — manually
build a "template" from one reference elevation (fill composition + every mullion's role) and
apply templates to future imports instead of algorithmic propagation. Full detail, exact line
numbers, and open design questions are in `HANDOFF-FOR-OPUS-20260720.md` (project root) — **no
code has been changed for any of this**, that file is the entire deliverable for this session.

### 2026-07-20 — Per-elevation FFD cutting diagram + DXF export (takeoff, `app.js?v=20260720a`)
Leo: "show me how pieces for each part align on a 24' line" → refined to: pure line (no
per-piece color/label), handle spliced/oversize pieces silently, scope per elevation (not
pooled), export as DXF. Built `packFFDLayout` (keeps piece-to-stick assignment that `packFFD`
previously discarded), `buildOpeningPacking(o)` (per-elevation, not pooled — reuses the newly
extracted `collectOpeningIntoBuckets` so matching rules never drift from the pooled order list),
a "📏 Cutting diagram" viewer toggle (plain baseline + tick marks, no color/label), and a DXF
writer (`buildCuttingDxf` — LINE entities only, one layer per part number, no text) with a
per-elevation export button plus a toolbar "Cutting DXF (all elevations)" batch button. 36-check
Node harness passed (stick counts match `packFFD`, splice renders with zero ticks, tick math
correct, DXF structurally valid, per-elevation scoping doesn't lose/duplicate pieces vs pooled
total). Full details in `takeoff/PROPAGATION-DESIGN.md` §15. Not yet reviewed by Leo.

### 2026-07-20 (rev2) — Cutting diagram: revert box markers → bordered bar + ticks, elevation header, combined multi-elevation DXF (`app.js?v=20260720c`)
Leo reviewed the box-marker revision (2.5" open rectangles at each cut) and sent two screenshots:
current (the open-box markers) vs. desired (pic2 — a single bordered bar spanning the whole
stick, divided by plain tick lines at cut points). Asked for three things: revert the marker
style to match pic2 (part-name label stays, per his confirmation to keep both part-name and
stick-number labels), an elevation/mark label at the top of the diagram, and a way to export
every elevation's cutting diagram into ONE combined DXF (kept as an additional button, not a
replacement for the existing per-elevation-multi-download "Cutting DXF (all elevations)" button).
Built: `STOCK_BAR_HEIGHT` replaces `CUT_RECT_WIDTH`/`CUT_RECT_HEIGHT`/`stickCutRects` — each
stick now draws one bordered `<rect>`/`dxfRect` spanning its full stock length plus a plain tick
line (`stickTickPositions`, unchanged) at every cut boundary, in both `renderCuttingSvg` and the
new shared `buildCuttingDxfBody`. Both take a `mark` param and draw it as a header (bold text in
SVG, a `TEXT` entity on a dedicated `ELEVATION` layer in DXF) above the diagram/section.
`buildCombinedCuttingDxf(list)` stacks every opening's `buildCuttingDxfBody` output vertically
(each section headed by its own mark, `sectionGap` between sections) into a single DXF; new
toolbar button "Cutting DXF (combined, one file)" / `downloadCombinedCuttingDxf()` — the old
per-elevation-sequential-download button/flow is untouched.
**Verification note:** hit the known bash/OneDrive stale-mount issue again — `wc -l` on the real
`takeoff/app.js` via bash reported 2272 lines (truncated) vs. 3453 real lines confirmed via the
`Read` tool, and even a fresh scratch file in the outputs sandbox truncated on first read (synced
correctly one retry later). Worked around by `Read`-ing the exact modified function block
(lines 1314–1465) straight from the real file and diffing it by eye against the intended edit,
then verifying the geometry logic in an isolated 15-check Node harness (bar/tick counts, spliced
stick still zero ticks, elevation header present/absent, combined-DXF section stacking doesn't
overlap) built from that exact snippet plus stubs for `STOCK_INCHES`/`escHtml`. Did not
reconstruct the full 3453-line file for a whole-file `node --check` (would cost ~90k+ tokens in
chunked `Read` calls for marginal extra confidence beyond the isolated harness + surgical
`Edit`-tool replacements). **Not yet reviewed by Leo** — next session, check his feedback before
touching `takeoff/PROPAGATION-DESIGN.md` §15 again.

### 2026-07-20 (rev3) — Cutting diagram: open the last segment, label leftover length (`app.js?v=20260720d`)
Leo's next screenshot (SF03, part A, sticks 1/2) had two red X's pointing at the right-side
closing edge of each stick's bar, with the note: "最后一段不要闭合...显示最后一段上哪里用到了,
还有会剩多长" (don't close the last segment; show where it's used to, and how much is left). Fix:
a stick's bar is now closed left/top/bottom always, but the **right edge is only closed when
`stick.remaining ~ 0`** (fully used / spliced, `REMAINDER_EPS = 1e-6`) — real leftover material
means the right end stays open (no vertical closing line), since that far end isn't an actual cut,
just undetermined offcut. The existing tick at the used/remaining boundary (`stickTickPositions`
already emits it — every piece-end short of the stock end gets a tick, including the last real
piece when there's leftover) still marks exactly where real material stops — that answers "哪里
用到了" without new logic. Added a text label past the open end stating the leftover length
(`formatNumber(remaining)+'" left'`), in both `renderCuttingSvg` (SVG `<text>`, viewBox widened
+60 instead of +10 to fit it) and `buildCuttingDxfBody` (`dxfText` on the part's own layer).
Verified with a 10-check Node harness (3 test sticks: two with leftover — 18" and 178" — one
spliced/fully-used at exactly stock length): correct border-line counts (left+top+bottom always,
right edge only on the fully-used stick), correct tick counts unchanged, leftover label present
only on the wasteful sticks with the right numeric value, absent on the fully-used one. Not yet
reviewed by Leo — this is the third iteration of this same feature in one day (plain baseline+tick
→ 2.5" boxes → bordered bar+tick → this open-ended version), so check his feedback carefully
before changing the visual again.

### 2026-07-20 — Layer B propagation rework: regionType/regionEdge/zoneShape (`app.js?v=20260720e`)
Leo said Layer B propagation "isn't working right": correcting one member's role via the viewer
dropdown was generalizing far too broadly. Root cause confirmed by reading `computeRoleSignature`
— the old `borders` field was a single coarse "does this member's midpoint fall inside ANY IMP-1/
louver bounding box" check, with no idea of top-vs-bottom-of-band or which opening shape it's in.
So a correction on, say, a horizontal at the top edge of one IMP-1 band would match every
similarly-oriented/sized member bordering ANY IMP-1 band, anywhere in the building.
Leo's requested fix (after two clarifying rounds): his example piece is a **horizontal** sitting
on the IMP-1 band (not a vertical mullion, despite "mullion" in his first message), and matching
should require the SAME relative location (top/bottom/through a band) AND the SAME overall
opening shape (e.g. only propagate between openings that are both "louver-on-top-of-imp/glass" —
an opening with a different band stack should never share the rule).
Rebuilt `computeRoleSignature`'s output from `{system, orientation, sizeClass, band, borders}` to
`{system, orientation, sizeClass, band, regionType, regionEdge, zoneShape}`:
- **`computeOpeningZones(bbox, imp1Bands, louverBand)`** (new) — builds an ordered, contiguous,
  gap-filled list of bands for the whole opening (louver/imp-1 bands as given, everything else
  becomes `glass`), sorted bottom-to-top (larger Y = higher, confirmed from the existing "louver
  带最低一排...`Math.min(y)`" comment elsewhere in the file).
- **`zoneShapeOf(zones)`** (new) — joins that list top-to-bottom into a string like
  `"louver>imp-1>glass"`, matching Leo's own "louver on top, imp/glass on bottom" phrasing.
- **`regionType`**: which band a member's midpoint falls in (`imp-1`/`louver`/`glass`/`door`,
  `door` still a special early-return, unaffected by the Y-stack).
- **`regionEdge`**: `top`/`bottom`/`through` — where within THAT SPECIFIC band the member sits.
  Horizontals: proximity (±3") to the band's near/far Y edge. Verticals: overlap-fraction with
  the band, using the SAME `frac > 0.5` "majority inside" threshold Stage 2's existing IMP-1
  classification already uses, for consistency (not a new made-up cutoff).
- Found and fixed a real bug while writing the harness: zone lookup must NOT use the same ±3"
  tolerance as regionEdge — two contiguous zones' tolerance-padded ranges overlap right at their
  shared boundary, and `.find()` would silently prefer whichever zone came first in the array
  regardless of which one the member actually belongs to. Fixed to strict containment
  (zones tile the opening with no gaps by construction) with a nearest-zone fallback only for a
  midpoint genuinely outside all zones.
`zones`/`zoneShape` are computed ONCE per opening at parse time (right after `imp1Bands` is
built) — geometry-only, never from current roles — and threaded through both `classifyRoles` call
sites (fresh parse + restored-snapshot re-pass) and stored on `opening._bands` so the manual-edit
capture site (viewer Position dropdown, `computeRoleSignature(c, {...o._bands})`) always computes
an identical signature to what parsing would.
**Migration:** per Leo's choice, old-schema learned rules are actively discarded rather than left
dead — `loadRoleRulesFromCloud` now filters out any rule whose signature lacks `regionType` and
pushes the cleaned (now-empty, on first load after this update) list back to each system's
Firestore `roleRules/{system}` doc. Takes effect the next time the tool is opened with Firebase
connected (this session has no direct Firestore access to do it from here).
**Verified** with a 12-check Node harness (not run against real DXFs — this is pure signature/zone
logic, exercised with synthetic openings): correct `zoneShape` for a 3-band opening, top-edge vs.
bottom-edge horizontals get different signature keys (won't cross-propagate), an identically-
shaped different opening's matching piece gets the SAME key (correctly propagates), a
differently-shaped opening's matching piece gets a DIFFERENT key (correctly blocked) — this is
the exact case Leo asked for — a fully-crossing vertical reads `through`, and a door piece stays
`regionType: 'door'` regardless of the zone stack. **Not yet reviewed by Leo** — this is a
propagation/matching change, not a visual one, so his confirmation should come from testing an
actual correction in the viewer across a couple of real elevations, not from a screenshot.

### 2026-07-20 — CP2 core-sync audit: real gap is index.html + elevation cloud wiring, not core JS
Leo reported CP2 local (not yet pushed to GitHub) shows no new features and elevation markers
don't respond to clicks — asked if core files were stale. Full diagnosis:
1. **The 7 CORE JS/HTML files were already in sync** (`app.js`, `app-log.js`, `chat.html`,
   `cloud-sync.js`, `api/parse.js`, backup scripts, all `takeoff/*` core files). A bash `md5sum`
   diff first flagged 7 files as different — **false positive**: the bash sandbox's mount of
   this OneDrive folder is stale/truncated for every file in it, not just ones edited this
   session (confirmed: `os.stat`/`cat`/`wc` in bash all agree on a truncated byte count that
   doesn't match the real file via the `Read` tool). Re-verified via a sub-agent using only
   `Read`/`Write` (never bash) — 6/7 were byte-identical. The one real drift: `api/parse.js` was
   missing the `'in-progress'` status option in its enum (CP2 had
   `['installed','pending','issue']` vs AC3's version with `'in-progress'` included) — fixed.
2. **The real gap is `index.html`** (PROJECT/hybrid file, never straight-copied per SYNC.md —
   "port feature-by-feature, never whole-file"). CP2's `index.html` is missing: the RFI tab
   (`#tab-rfi`), the Calendar tab's `#cal-rows` container (so `renderCalendar()` has nothing to
   render into — this is "new features don't show"), and the "🛠 Takeoff Tool" / "⬆ Import DXF"
   header buttons. Confirmed against CP2's own `FEATURES.md`: **F-023 through F-030 are all ⬜
   for CP2** (Project Sync tool alignment, Modules i18n polish, tool/doc self-sync, embedded
   Takeoff Tool link, and critically **F-030 "Elevation 入云" `elev-cloud.js` Firestore
   live-sync was never added to CP2**).
3. **CP2 has no `elevations.js` file at all** (file doesn't exist) — this, not a markup bug, is
   why clicking an elevation marker does nothing: no per-unit geometry exists behind any marker,
   static or cloud. F-030 (the cloud path AC3 uses for SF04-SF10 without a hand-authored file)
   was never wired into CP2, so there's currently no path to elevation data for CP2 without
   either porting F-030's script tags + Firestore setup, or hand-authoring a static
   `elevations.js` like AC3's SF01.
**Resolved (Leo, 2026-07-20): CP2 doesn't need elevation/DXF features — keep CP2's original,
simpler status-page structure as-is.** No `index.html` port for F-023–030, no `elevations.js`,
no Firestore elev-cloud setup for CP2. Only the `api/parse.js` status-enum fix stands. Closed.

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

- **2026-09-04 (e)** — **The fifth loss was mine, live, from the commit an hour earlier.** Leo's
  screenshot: *0 saved elevations*, and the stash offering *38 marks*.

  The #pins-in-cloud change was inserted **between an `if` and its `else`** in the Firestore loader:

  ```js
  if (data.cuts.length) state.elevEdits[d.id] = {...};
  if (Array.isArray(data.rolePins) && data.rolePins.length) { ... }   // <- inserted here
  else delete state.elevEdits[d.id];                                   // <- now binds to the WRONG if
  ```

  The `else delete` re-bound to the new condition, so **every cloud doc written before `rolePins`
  existed — all of them — deleted its own local saved elevation on page load.** 35 elevations went
  to zero while he watched. A dangling else, in the one function whose job is to protect this data.
  Standing rule: never insert anything between an `if` and its `else`; add the braces first.

  `t-reset.js` now replays the loader body over pre-rolePins docs and asserts the records survive,
  and that a genuinely empty cut list still clears its mark.

  **The safety bar was also too much.** *"Hand-made edits: 0 saved elevations · 3 marks with role
  pins · 13 panel maps · 1 template"* plus three buttons and a jargon banner got *"我已经不会用了。。。
  好复杂"* — fair. It is now one number (**marks with saved work**), one primary action (**⬇ Back up
  to a file**), and a quiet secondary (**⬆ Restore from a file**). The rescue only appears when the
  live count is actually below the stash, and it says it in plain words — *"Some of your saved work
  is missing. This browser now has 1 mark; the last good copy had 38"* — with one button,
  **↺ Bring it back**.

- **2026-09-04 (d)** — **Where the edits actually live, and closing the hole.** Leo: *"从来没有碰过
  reset，我每次是 clear all opening，然后重新 import / 修改记录是存在 browser 里面的吗 / 我每次
  间隔会超过1个礼拜，browser 记录不见了也正常"*. So `resetAll` was a real bomb but NOT his cause —
  `clearOpenings()` only empties `state.openings` and leaves every edit record alone.

  The honest map of durability, which nobody had written down:

  | record | localStorage | Firestore |
  |---|---|---|
  | `elevEdits` (every corrected elevation + history) | yes | **yes**, one doc per mark |
  | `roleTemplates` | yes | yes |
  | `rolePins` / `roleEdits` | yes | **no** ← the hole |
  | `panelEdits`, `recognizedRoles`, `markGroups`, `systemGaskets`, `parts`, `accessories`, `openings` | yes | parts/accessories only |

  His gaps between jobs run over a week, and a browser is entitled to drop `file://` localStorage in
  that time. So his real chain was: clear openings → re-import → `elevEdits` survives in the cloud
  but its `geoSig` no longer matches because **the parser changed** (16 cuts → 28) → the whole saved
  set is discarded → `rolePins`, the only fallback, were browser-only and already gone → everything
  auto-classified → redo 28 pieces by hand. Five times.

  Two closures:
  - **`rolePins` now ride inside the per-mark `elevEdits` doc** — one write, one read, same mark, so
    they come back on any machine. The loader adopts cloud pins only where the browser has none; a
    local set is the same or newer and replacing it would be the old bug in a new hat.
  - **⬇ Back up my edits / ⬆ Restore from file** in the Parts Database header: everything
    hand-made as one small JSON file to keep beside the DXFs. Import merges by mark — marks in the
    file replace those marks, marks only present locally are left alone — and refuses anything that
    is not a takeoff edits file. This is the copy that does not depend on a browser or on Firestore
    being reachable.

  The 09-04 `applySavedRoles` pass is what fixes the geoSig half: a saved set that no longer matches
  wholesale is still applied piece by piece. Combined, a re-import after a parser change should now
  come back corrected. `t-reset.js` is at 20 checks.

- **2026-09-04 (c)** — **THE actual cause of five rounds of lost role edits: `resetAll()`.**
  Leo: *"修改记录永远是保存不了的，已经五次了，我每一次重新一个个改是要时间的"*.

  I spent four rounds making the pin matcher cleverer — relative coordinates, tolerant matching,
  offset solving, junk pruning — all of it real, none of it the problem. A matcher cannot recover
  data that has been deleted.

  ```js
  state = { partsDbVersion, parts: cloneSeedParts(), openings: [], accessories: cloneSeedAccessories() };
  ```

  `resetAll()` replaced the WHOLE state object. Every other key went with it: `elevEdits` (every
  corrected elevation *and its version history*), `rolePins`, `roleEdits`, `panelEdits`,
  `roleTemplates`, `recognizedRoles`, `markGroups`, `systemGaskets`. Then `renderAll()` called
  `save()`, writing the emptied state over localStorage. The button is labelled **"Reset to seed"**,
  sits in the *Parts Database* header, and confirms with *"Clear all parts and openings?"* — it
  reads like it resets the parts library. It deleted a month of hand-classification instead.
  That is why it happened five times, why the pin banner vanished completely rather than warning,
  and why "the drawing never changed" was true the whole time.

  Three changes:
  - `resetAll()` now resets exactly what it names — parts, accessories, openings — and carries
    every user-authored key across (`USER_AUTHORED_STATE_KEYS`). The confirm text lists what is
    kept, with the count of saved marks.
  - `save()` compares record counts against the previous write. A write that DROPS records no
    longer refreshes the backup (so the stash always holds the high-water mark), warns in the
    console, and raises a banner. A clean write advances the backup.
  - The Parts Database header carries a standing line — *"Hand-made edits: N saved elevations · N
    marks with role pins · N panel maps · N templates"* — and **↺ Restore my edits**, which puts
    the stashed high-water state back in one click.

  `t-reset.js`, 10 checks. Standing rule: nothing may assign to `state` wholesale. Add new
  user-authored keys to `USER_AUTHORED_STATE_KEYS` or they will be silently resettable.

- **2026-09-04 (b)** — **Diagnosed from Leo's EL-01 dump, after two wrong guesses.** He said the
  drawing never changed, which killed both of my theories, so the viewer got a **🔍 why?** button
  that copies the whole stored-vs-parsed picture for a mark. The dump answered it in one round trip.
  Three separate faults, none of them the one I had been chasing:

  **1. Seven of his ten pins were junk from the legacy migration.** EL-01 is ~110" × 114"; seven
  pins sat at rx≈13293, ry≈7221, carrying 750XT role names (`Jamb (X)`, `Sill (Glass)`) on a 45TU
  opening. `migrateLegacyRolePins` had converted legacy `roleEdits` keys recorded when that mark sat
  somewhere else entirely; `solveLegacyTranslation` found no two that agreed, assumed no move, and
  subtracted the current origin from coordinates that never belonged to this frame. They could never
  match, and warned on every import. `prunePinsOutsideElevation()` now drops any pin further than
  24" outside its own elevation — at migration time and on every import, so already-poisoned stores
  clean themselves. The legacy map stays untouched, so nothing real is lost.

  **2. The banner vanished on reload because the report was in memory.** `_pinReport` is filled
  during a parse; reopen the page and it is empty, so a perfectly working set of pins showed no
  notice at all — which reads exactly like "the pins are gone". `livePinReport()` recomputes the
  match from what is on screen when the parse-time report is absent, and a fully-applied set now
  says so out loud ("3 saved role pins applied") instead of staying silent.

  **3. His saved edit-set genuinely cannot match — the PARSER changed, not the drawing.** 16 saved
  cuts vs 28 fresh, and the 5.5"-wide pieces that were 2" stubs are now 44" and 47" runs. The 45TU
  work changed how these elevations read. `geoSig` correctly refuses the wholesale restore; the
  09-04 `applySavedRoles` pass is what carries those 16 roles across, but it only runs during a
  parse — **the elevation has to be re-imported once** for it to take effect. Worth remembering:
  changing classification without bumping `PARSER_VERSION` leaves saved edit-sets silently
  unmatchable.

  Bug found while testing: `prunePinsOutsideElevation` first called `cutsOrigin(src)` on an array of
  raw rects. `cutsOrigin` reads `c.src` off each element, so it returned {0,0} and the prune silently
  did nothing. `rectsOrigin` is the one that takes rects.

- **2026-09-04** — **`elevEdits` is now a role source even when the geometry signature fails.**
  Leo: *"saved pin 提示都不见了，显示的还是自动识别"*.

  A pin only exists for a piece explicitly re-labelled through the dropdown. `elevEdits` holds
  EVERY piece of an elevation you have ever corrected, with its role — but it was all-or-nothing:
  `geoSig` had to match exactly, and one changed member threw the whole record away and dropped you
  back to auto-classification, leaving the handful of pins as the only safety net.

  `applySavedRoles()` turns each saved cut into a pseudo-pin (shape + place within the elevation)
  and runs the same tolerant, offset-solving matcher the real pins use. Pieces that still exist keep
  their role; genuinely new or changed ones fall through to auto, where they belong. Explicit pins
  are applied afterwards so they still win. The viewer says *"the drawing changed — 40 of 41 saved
  roles were carried across by shape"*.

  Measured on 6.2.dxf with all 41 roles hand-set: drop a member → 40 of 41 carried; move the whole
  elevation 250, −90 → 41 of 41; hand it a genuinely different elevation → 0 matched and nothing
  forced. `t-savedroles.js`, 11 checks.

  Still unexplained: why Leo's own store showed zero pins for that mark (the banner vanished
  entirely rather than warning). Repeated imports of the same DXF keep all 9 pins here across three
  cycles, so it is specific to his saved state — but this change makes the question much less
  important, since the roles now ride on the full edit-set rather than on the pins alone.

- **2026-08-26 (b)** — **"7 of 9 saved role pins found no matching piece."** Leo: *"when i import
  elevations which already have saved role pins, it should show saved role pins directly instead of
  still being auto-classified"*.

  **Cause.** #role-pins-v2 fixed the absolute-coordinate bug by storing pins RELATIVE to the
  elevation's bbox corner. But that corner is derived from *all* the geometry in the cluster, not
  from the framing — so a revised DXF that merely adds a dimension, a note or a scrap of detail near
  the edge grows the bbox, the corner moves, and every pin shifts with it at once. Not one member
  had moved. Reproduced exactly: nudge `bbox.minX/minY` by 3, 2 and all 9 pins go unmatched.

  **Fix — the origin is a guess, the shift is solved.** `solvePinOffset()` runs before every match:
  each pin votes for the offset that would carry it onto a same-sized cut, and the offset the most
  pins agree on is applied to all of them. An unmoved frame votes (0,0) and it is a no-op, so it
  runs unconditionally. Requires ≥2 agreeing pins — one pin lining up with one same-sized piece is
  a coincidence, not evidence. After a successful solve the store is **re-anchored** to what
  actually matched, so the shift is worked out once rather than on every import, and the next
  revision is measured against the current frame. What matters now is the SHAPE of the elevation;
  where its corner sits is irrelevant.

  The viewer says which happened: silence when everything matched exactly, a green "N pins
  re-applied — this elevation sits dx, dy from where it was" when the offset was solved, and the
  orange warning only when pins genuinely found nothing.

  `t-pins.js` grew to 29 checks: the bbox-moves case, the measured offset, the re-anchor, and that
  a single pin can never move the whole set.

  **Merged, not overwritten.** Staging the device copy first caught a 2026-08-27 `#place-chip`
  feature (place a typed chip onto the canvas at its true length, drag the body to move it, a Width
  box, a blank canvas for openings with no DXF geometry) that another session had added on top of
  the 08-26c build. The device file became the base and this pin fix was re-applied onto it — the
  opposite of what happened on 08-24. The guard works when it is armed.

- **2026-08-26 (c)** — **A "/ panel" accessory rule reading 0 now says why.** Leo asked why a
  45TU / E2-0052 / per_panel / Glass row showed 0.00 and what Positions means for that rule. The
  rule was correct (28 against a real 45TU import); his elevations were imported before the Aug-24
  build, which only emitted panel cells for 750XT, so they carry no panel map. Three distinct
  zero-reasons are now printed in orange under the quantity: no panel map (re-import, or draw them
  in the gasket diagram), Positions holding role names instead of panel types, and simply no panels
  of that type in scope. The Positions box also advertises what each rule wants —
  `Glass, IMP-1, Louver, Door` for per_panel, `(part numbers)` for per_part / per_part_len, roles
  otherwise — since one text box meaning three different things with no label is a trap.
  Also flagged to Leo: 45TU's E2-0052 already comes off the panel gasket model automatically, so
  that hand-added rule would have double-counted. Test `t-perpanel.js` (8 checks).

- **2026-08-26 (d)** — **Duplicate export buttons.** The index.html splice that restored the
  cut-group buttons ran from the first restored button to the last, which in the 8/21 file swept up
  the three existing cutting-DXF buttons in between. Pasted into a file that already had them, that
  produced duplicate element IDs — and since `getElementById` returns the first match, the bottom
  three were dead controls that looked identical to the live ones. Removed; verified in the live
  DOM that no id appears twice.

- **2026-08-26** — **INCIDENT: I deleted the cut-groups feature, then merged it back.**

  **What happened.** On 2026-08-21 a different session added #cut-groups to `takeoff/app.js`
  (`autoMarkGroupKey` / `markGroupKey` / `setMarkGroup` / `clearMarkGroups` /
  `groupOpeningsByMark` / `buildGroupPacking` / `groupGasketTotals` / `downloadGroupWorkbook` /
  `downloadGroupedCuttingDxf` / `emitWorkbook` / the Cut-groups modal), with its own harness at
  `_tests/test-cut-groups.cjs`. My working copy in the following session had forked *before* that
  and never contained it. I shipped three times (Aug 24 45TU, Aug 24 gaskets-all-systems, Aug 25
  role-pins + export-scope) by committing my copy over the device **with `force: true`**, which
  disables the mtime guard whose entire job is to catch "this file changed under you". Leo noticed
  because the `SF04 group` sheets stopped appearing in the Excel export.

  **Why the guard existed and why forcing defeated it.** `device_commit_files` refuses a write when
  the device file's mtime has moved since it was staged. I never staged — I just forced. Three
  separate opportunities to catch this passed silently.

  **Recovery.** No backup, no git, no other copy anywhere on the machine. Windows *Previous
  Versions* had the 2026-08-21 file. Leo copied it (NOT "Restore", which would have wiped Aug 24–25
  in the other direction) to `takeoff/recovered/`. The two versions had genuinely diverged from a
  common ancestor, so this was a three-way merge, not a copy-back:

  - restored verbatim: the whole cut-groups block, `FRAME_GROUP_GAP`, the array-of-openings branches
    in `xlRowsFor` / `buildElevationSheet` / `buildCuttingDxfBody`, the per-column `gaskets`
    override in `buildCombinedCuttingDxf`, both buttons + the modal in index.html, the wiring.
  - adapted to the newer code: `groupOpeningsByMark(list)` now takes an optional list — the exports
    pass `scopedOpenings()`, the config modal passes nothing and sees every mark. Group exports
    carry `scopeSuffix()` in their filenames.
  - reconciled: both workbooks now share `summarySheetsFor()` and `emitWorkbook()`, so the group
    file and the per-elevation file always open on the same totals and the same per-system summary
    sheets.
  - the 8/21 harness was updated in two places only: scope helpers stubbed wide open (scoping has
    its own test), and the two sheet-name assertions changed from `ALL ELEVATIONS` to
    `ALL 750XT` + `ALL 450`, because the per-system summary is a deliberate later change. What that
    test actually guards — no group sheets in the per-elevation workbook, no member sheets beside a
    group sheet, two separate files — is unchanged and still passes.

  Green: `test-cut-groups.cjs` 52/52, plus t-scope / t-pins / t-gasketall / t-45tu / t-acc / t-wash
  / t-draw / t-prune / t-cutdrag / t-xl / t-xlsx and all three DXF harnesses.

  **Standing rule from here: never `force` a commit to the device.** Stage the device copy first,
  diff it against the working copy, and commit with `expectedMtimeMs`. If the guard fires, the
  device has work the working copy does not — merge, never overwrite. `takeoff/recovered/` is
  Leo's copy of the 8/21 files; leave it alone.

- **2026-08-24 (c)** — **Export scope by system.** Leo: *"现在导出 excel / cutting diagrams 不分
  system，改成导出前问要哪一个 system（可以多选）或者你有什么更方便的流程"*. Chose the standing
  selection over a modal (Leo picked it): a modal would ask the same question at four different
  buttons and hide the answer until after the click.

  A row of system chips sits at the top of the Consolidated Takeoff — `All` plus one per system
  actually present in the openings, multi-select, remembered in `state.exportScope`. It filters
  **the on-screen report and every export identically**: report, CSV, copy, Excel workbook, and all
  three cutting DXFs all read `scopedOpenings()`. What you are looking at is what you are about to
  hand over. The chip row hides itself when the job has only one system.

  - Empty or stale selection = every system. The scope can never silently export nothing.
  - Filenames carry it: `AC3 takeoff by elevation - 45TU.xlsx`, `takeoff - 750XT.csv`,
    `all-openings-pooled-cutting - 750XT.dxf`. Same name, different numbers is how the wrong file
    reaches the shop.
  - `state.openings` is never filtered — the Openings table and the viewer still show everything.
  - The Excel workbook now emits **one summary sheet per system** in scope (`ALL 750XT`,
    `ALL 45TU`) instead of one mixed `ALL ELEVATIONS`. A mixed summary carried one system's name in
    its title banner over another system's order lines.

  Test `t-scope.js` (15 checks), including that the two scopes partition the full report exactly
  and that cut length adds up across the split.

- **2026-08-24 (b)** — **BUG: hand-set role positions disappeared on re-import.** Leo: *"我1个月
  前修改的 role position 上个礼拜导入都不见了，需要我重新手改"*.

  **Reproduced.** Took `6.2.dxf`, pinned three roles, re-imported the same file (pins held), then
  re-imported the identical drawing translated +137.5 / −62.3 on the sheet: all three pins gone,
  silently, and the full saved edit-set with them.

  **Root cause.** A pin was keyed by the piece's ABSOLUTE drawing coordinates
  (`srcKey = x|y|w|h`). Move the elevation anywhere — a re-issued sheet, a re-exported view, a
  different origin — and every key changes at once. `elevGeoSig` (the fingerprint guarding the full
  saved edit-set: splits, merges, lengths, roles) was **the same key concatenated**, so both
  persistence layers died from one cause, at the same moment, with no message. Nothing about the
  elevation had changed; only where it sat on the paper.

  **Fix — pins describe a piece, not a coordinate.**
  - New store `state.rolePins[mark] = [{rx, ry, w, h, role}]`, measured from the elevation's own
    bbox corner. `pinOrigin()` prefers the bbox over the cuts' extent, so dragging the leftmost
    jamb cannot move the origin out from under every other pin.
  - Matching is by shape-and-place with a tolerance (`PIN_SIZE_TOL` 0.3", `PIN_POS_TOL` 1.5"),
    closest pair first, each pin used once — not string equality. A member redrawn a hair off is
    still the same member.
  - `elevGeoSig` is now relative; `elevGeoSigAbs` is kept and `geoSigMatches()` accepts either, so
    edit-sets saved by every earlier build still restore. Restored cuts carry absolute rects, so
    they are **re-registered** onto the fresh origin (`_dx/_dy`) — otherwise the restored edit-set
    would sit out of register with the new bbox, panel cells and perimeter tracer.
  - **Legacy pins are recovered, not abandoned.** `solveLegacyTranslation()` is a tiny RANSAC: each
    old absolute rect votes for the move that would carry it onto a same-sized fresh cut, and the
    winning vote is the move. Requires ≥2 agreeing pins — one vote is not evidence, and inventing a
    translation from it would write garbage. `state.roleEdits` is READ and never written or
    deleted, so the migration can always be re-run against the original.
  - **A retired role now SKIPS its pin instead of deleting it.** The old `delete pins[k]` ran on a
    read path (merely opening an elevation) and was unrecoverable: putting the role back on the
    recognized list could never bring the pin back. Now it can.
  - **Losses are said out loud.** `rolePinReport(mark)` → the viewer shows "N of M saved role pins
    found no matching piece in this import", and a quieter "re-applied, the drawing had moved"
    when the tolerant match did its job. Silence is what let this cost a week of work.

  Tests: `t-pins.js` (24 checks) — the unmoved case unregressed, the moved case with pins only,
  legacy absolute pins recovered across a move, the solver's evidence threshold, retired-role skip
  and its reversal, unmatched reporting, drag-carries-pin, and the tolerance boundaries.
  `t-prune` / `t-cutdrag` updated: they asserted on the legacy map, now they assert the real
  invariant (the piece keeps its role). Full regression green.

  Not changed: pins are still per-browser (localStorage). `elevEdits` — the heavier, complete
  record — is the cloud-synced one, and it now survives a move too.

- **2026-08-24** — **Accessories moved under the viewer; the gasket model stopped being a
  750XT/45TU fact and became per-system data.** Leo: *"put accessories under elevation viewer,
  it's so packed now"* and *"I need gasket view for all systems, you know why? because this tool
  needs to be an independent tool that doesn't rely on position detection algorithm. It's expected
  to manually set panels/pieces/gaskets"*.

  **① Layout.** The Accessories section moved out of the 440 px right rail (where 9 columns were
  wrapping into 8-character stumps) into the left column, immediately under the Elevation Viewer.
  Nothing about the table changed — it just has the room it always needed. The right rail keeps
  the Consolidated Takeoff and the export buttons.

  **② The gasket spec is now DATA.** `SYSTEM_GASKET` was a hard-coded table with exactly two
  entries; every other system silently got `{panel:{}, perimeterPart:null, doorPart:null}` and no
  way to change it. Replaced by a three-level lookup:
  `state.systemGaskets[sys]` (hand-edited) → `SYSTEM_DEFS[sys].gasket` (systems.js) →
  `SEED_SYSTEM_GASKET[sys]` (app.js — 750XT and 45TU, byte-identical to the old table).
  A new **Gasket defaults** block at the top of Accessories edits it: one text field per panel
  type (`PART×loops, PART×loops` — `×`, `x`, `*` or `:`, a bare part number meaning ×1), plus the
  storefront-perimeter part, the door-jamb part, and the coil-per-box map. Changing a default
  re-derives every opening on that system on the spot. Per-panel overrides are NOT touched — a
  panel Leo set by hand keeps what he set.
  Stored per browser (localStorage), like `recognizedRoles` and the layer config: cloud-sync only
  carries `parts` and `accessories`, and bolting a `gasket` field onto the systems doc would have
  re-created the 2026-08-20 wash race (a snapshot arriving after a local edit and overwriting it).

  **③ The gasket diagram is always available.** The 🧵 toggle used to appear only when the
  detector had already found infill cells — exactly backwards, since the elevation it reads badly
  is the one that most needs a hand-drawn map. Now:
  - the toggle is always shown, and the view no longer short-circuits on an empty `panelCells`;
  - `panelCanvasBox(o)` gives the map something to draw on even with zero parsed geometry —
    framing ∪ cells ∪ hand-drawn panels, falling back to the opening's own W×H, drawn as a dashed
    outline so there is something to aim at. (`openingFrameBox()` is unchanged and still answers
    "what did the DXF give us" for the cutting sheet's frame diagram — that one must not invent.)
  - `frameSnapAxes()` adds the canvas edges and every existing panel edge, so snapping works on a
    blank elevation and each drawn panel becomes a magnet for the next.
  - Two written empty-states replace the blank black rectangle: "no panels here yet — drag some"
    and "this system has no gasket parts set — set them under Accessories → Gasket defaults".
  - Louver panels are editable again (`PANEL_EDITABLE_TYPES` +louver). The lock was a 750XT fact
    in disguise; another system may well gasket its louver band. **Doors stay locked** — #door-gasket
    stands: a door's gasket is the two jambs and only the two jambs.

  Tests: `t-gasketall.js` (32 checks) — seeds unchanged, an unknown system round-trips, spec-text
  parsing, box-LF override, a default change moving every auto panel but not a hand-set one, and a
  typed-in opening with no DXF at all being drawn on end to end. Full regression green.

- **2026-08-20 (b)** — **Three SF06 reading errors fixed, from `6.2.dxf`.**
  ① **Beam gap.** One mark can hold two INDEPENDENT stacked openings with a structural beam
  between them (SF06: louver above, storefront below). The grid filled that gap with 5 glass
  cells that then took infill gasket. `add()` now drops any cell whose centre is outside every
  real opening — main zone (Head-to-Sill × full width) or the louver band. No Head/Sill
  classified (hand-entered / non-750XT) → main zone falls back to the bbox and nothing is
  dropped, so old behaviour is unchanged.
  ② **Fat poly split a panel.** `isStructural`'s `max(w,h) >= 24` length gate let a SHORT fat
  rectangle through: SF06's bay left of the door has a 21.01" × 14.61" infill outline on
  AF_ALUM PROFILE (AF_GLASS IN LINE marks inside it). 21" long → missed the gate → taken off as
  a phantom 21" Horizontal AND its centreline split that bay's panel in two. The identical
  39.5" × 14.61" rect in the next bay cleared 24" and was correctly dropped — which is exactly
  why only one bay split. Added a length-independent depth rule: `min(w,h) >= 8` is not an
  extrusion (deepest real profile is BE9-3910 at 6.75"). Across North / South Ex / In / 6.2 this
  excludes exactly one poly — the offending one.
  ③ **Perimeter with a door → split into two takeoffs** (Leo: "应该是整个 door jamb 的长度，
  但我突然觉得，把 door gasket 单独算更好，这样逻辑上更顺"). Was one plain bounding rectangle whose
  bottom sat at the door's floor level. Now `perimeterRuns()` returns two runs that partition every
  physical edge exactly once:
    · **storefront** — head + both side jambs + sill, with the sill BROKEN across each door width
      (the door opening is not part of the storefront's own boundary). Louver band joins this run
      as a second independent zone.
    · **door** — ONE takeoff, part **E2-0120 ×1**: both jambs at FULL height (door head → floor).
      No header, no threshold, and NO loop around the door panel. The door panel itself carries an
      empty gasket list precisely so the jambs can never be billed twice.
  They share a part number today (`DOOR_GASKET_PART` is its own constant so it can diverge) but
  never share a number — the harness asserts the two runs have no segment in common and that the
  sill never crosses a door. SF06: 95.64 LF lump → storefront 92.51 LF + door 15.91 LF (both E2-0120; drawn and reported
  as two runs so each stays auditable, summed into one order line).
  **The same function feeds the numbers and the diagram** (gold = storefront, pink = door) — the
  old code drew a rectangle while charging for something else, so the gasket diagram could not be
  used to check the takeoff, which was the whole reason it exists.
  SF06 net: 26 → 20 panels, infill gasket 236.67 → 186.58 LF per part.
- **2026-08-20 (b)** — `part-sections.js` regenerated from the updated `new block.dxf`: 16
  profiles, BY7-9065 / AS-7110 / E9-1660 now included. No part in the 750XT takeoff is missing a
  cross-section any more.

- **2026-08-20 — gasket leaves the parts library; its total rides on the cutting sheet.**
  The gasket part numbers were ALSO sitting in the 750XT parts library carrying framing roles
  (HEAD (GLASS) / JAMB / VERTICAL / …), so the order list billed them a second time off member
  run-length — 2,598" of E2-0120 and 6,297" of E2-0127 that had nothing to do with any panel.
  All four (E1-0120, E1-0127, E2-0120, E2-0127) are now struck from the parts library by
  `pruneRetiredParts()`. **Gasket quantity comes from the gasket diagram and only from there.**
  `openingGasketTotals(o)` is the single reader — panel infill + storefront perimeter + door
  jambs, one number per part number — and it feeds the accessories table, the on-screen cutting
  preview and the cutting DXF alike. On the cutting sheet it is a plain `GASKET - total length`
  text block, **not** packed onto 24′ bars: gasket is coil stock, so nesting it would be a
  fiction (Leo: "不需要排列，只需要给我总长和就行"). Also fixed: the storefront-perimeter
  checkbox no longer switches the door run off with it — they are separate takeoffs.
  SF06 on the cutting sheet: E2-0120 3,540.0" (295.00 LF — 186.58 panel + 92.51 perimeter +
  15.91 door) · E2-0127 2,239.0" (186.58 LF).

- **门也可以是炸开的几何，不只是块**（2026-08-20，Leo：2nd.dxf SF15.1/SF15.2「门都没识别出来」）。
  原来的门识别只认 INSERT 块签名（SINGLE=12 LWPOLYLINE/11 LINE，DOUBLE=22/6）。2nd.dxf **整个文件
  一个 INSERT 都没有** —— 门是炸开画的，于是：门不出 panel、不算 door gasket，而且门扇自己的边梃和
  压条被当成 storefront 的 Sill/Head 报了进去（SF15.1 因此多出 5 根假料）。
  **锚点是 `AF_SADDLE`（门槛）——只有门下面才画它。** 每条门槛（w≥12、h≤3）上方找站在它上面的门扇
  轮廓：同一 x 跨度内、脚落在门槛顶上（±3"）、高≥24"、且在「可能画门扇的层」上（door / alum /
  doorSubframe / fallback `0`、`AF_X`）——取最宽的那个。**层必须过滤**：`AF_BACKER ROD` 在同一个洞口
  上画了一个比门扇略大的矩形，不过滤就会被选中。若最宽的也不到门槛宽的 60%，说明只找到一根边梃，
  退回用门槛自己的跨度（宁可用门槛，也不要报一个 3" 宽的门）。
  找到后：`doorRegionsAll.push({kind:'EXPLODED', minX, maxX, headY: 门扇顶})`，并把落在门扇矩形内的
  所有 poly 打上 `__door`，与块门的子件走完全相同的排除路径（不进 framing、不进 lite count、不进
  structural/panel）。SF15.1 12 cuts → 7 cuts。
  验证：`harness.js 2nd.dxf` —— 两个立面都找到门、都算了 door gasket、门扇压条不再被报成 storefront、
  门 panel 自身不带 gasket。

- **perimeter = 沿着 frame 本身外缘描一圈，每个「互相连着的 frame」各算一圈**（2026-08-20，Leo：
  「perimeter 永远是绕着外围的 frame 一圈」+「15.2，左右 2 个 opening 中间没有任何 frame 连接，
  所以算分开的」）。之前每一版都是在**近似**：先是 bbox 矩形，后来是「矩形挖掉门洞」——每换一张
  图就错一次（台阶式 sill、louver 带、两跨之间不连的框）。所以不再近似，直接算真的。
  **做法**：框料全是轴对齐矩形（`cuts[].src`）。把所有边界坐标铺成网格 → 标出哪些格子是金属 →
  从图纸外圈 flood fill 出「外面」→ 每一个「金属 vs 外面」的格子面就是 perimeter 的一段。这一次
  计算白送三件事：①**不连的区域自动分开**（SF15.2 左右两组中间只有一根 6" 柱子、两侧各留 0.5"
  缝，所以是两个 component，各自一圈；louver 带同理，不需要任何特判）；②**台阶 sill / 缺角**
  照着描；③**门**——门洞底下没有 sill，所以那个缺口是通向外面的，描边自己就会顺着一侧 jamb 面
  下去再从另一侧上来。被金属完全围死的玻璃口袋 flood 不到，自然被排除（那是 panel gasket 的事）。
  **两个坑**（都踩过）：
  · **坐标要 snap**（`COORD_EPS = 0.02"`）。两根对接的料，边界坐标只在浮点噪声级别一致
    （2422.2200000 vs 2422.2200001），不 snap 就会产生一列**零宽格子**，外面从那里灌进每一个
    密封口袋 —— 症状就是端跨的每块玻璃都被描了一圈金线。0.02" 远小于任何真实缝隙（最小的真缝是
    0.5"，正是它区分开两个 opening，必须留着）。
  · **门/storefront 的归属要按「这一面朝着哪个格子」判，不能对合并后的长线做坐标判断。**
    door notch = 门那一列、header 以下的「外面」格子；朝着它的竖面算 door，朝天空的算 storefront。
    这样一根 jamb 的内表面才能**从中间劈开**：门旁边那段归门，header 以上那段归 storefront。
    第一版用「线段中点在 header 以下」判，结果 SF15.1 整条左边缘都被算成门。
  **door header 整段不算 gasket**（Leo：「door header 不用管，没有 gasket」）——不是只丢下表面。
  header 是独立画的一根料，和上面的 head 之间还有条发丝缝，那条缝通向门洞，所以只丢下表面的话
  描边会绕上去把 header 的顶面和两端当成 storefront 报掉（SF15.1/15.2 上就是这样）。改成：门那一列
  从 headY 往上 `PERIM_DOOR_HEADER_ZONE = 6"` 是一条死带，带内所有面（横的竖的）全部丢弃。
  数字对照（都与手算相符）：SF06 storefront 95.98 LF、door 15.96 LF（≈2×95.5"，与旧手算 15.91 一致）；
  SF15.1 21.35 / 13.92；SF15.2 61.25 / 13.92（13.92 LF ≈ 2×83.5"，门扇高 83.9"）。
  回归里加了四条断言：画出来的长度 == 账上的 LF（storefront 与 door 各一条）、每一段都落在真实
  料件的表面上（不许悬空）、没有任何一段横穿门洞。

- **算出来的东西要么实时重算，要么标明是哪一版解析的**（2026-08-20，Leo：SF15.2「出来怎么是这样」——
  图上画的是新的分区描边，legend 里却是 perimeter 41.87LF、5 panels、没有门，两者来自不同版本）。
  openings 存在 localStorage 里跨刷新存活，所以屏幕上的立面可能是**旧 build 解析出来的**。
  · **能重算的就别存**：`gasketPerimeterLF` / `gasketDoorLF` 现在在 `recomputeOpeningGaskets()` 里
    每次从 `perimeterRuns(o.cuts …)` 重新导出，不再读 import 当时冻结的值。画线和数字同一个来源，
    不可能再各说各话。
  · **重算不回来的要报警**：panel 是哪些格子、门在哪里，都是**读 DXF 时**定的，存下来之后无法还原。
    `PARSER_VERSION` 在每次 parse 时盖到 opening 上（`o._pv`），不匹配时 gasket diagram 顶部弹一条
    橙色横幅提示「本立面由旧 build 解析，请重新 import DXF」。**改动解析产出什么，就要 bump 它。**
  · 顺带：每次改 takeoff 的 js，`index.html` 的 `?v=` 也要 bump（这次 → `20260820b`），否则浏览器
    拿的还是缓存里的旧 app.js。

- **panel 和 door 可以在 gasket diagram 上手画**（2026-08-20，Leo：「now classic elevations all
  pretty well / but if it's not, then many issues / allow me to draw panels and doors on gasket
  diagram」）。规整的一排排立面自动识别得很好，不规整的（SF01、EL-01）就很差，再调参也是这个结
  果——所以答案不是「更聪明的猜」，是**给一支笔**。
  `state.panelEdits[mark]` 从一张平表变成三样东西：`overrides`（自动 panel 的类型/gasket 覆盖，
  原有的）、`manual`（手画的 panel，各带自己的类型和 gasket）、`hidden`（划掉的自动 panel，用于
  识别器凭空造出来的格子）。**旧的平表形状仍然能读**，以前存的不会丢。
  · **手画的 door 是真门**：`effectiveDoorRegions()` = 解析出的 door + 所有手画的 door panel，
    喂给 `perimeterRuns`。所以解析完全没认出门的立面，手画一个门照样出两根 jamb 的 gasket，
    storefront 也照样绕开门洞。少了这一步，画出来的门只会上个色、不出量。
  · **拖出来的边会吸附到真实料件的面上**（`PANEL_SNAP_IN = 4"`）。手画的 panel 是要进量的，
    「看着差不多」不够准，吸附才让手画和自动识别量得一样。离得远（>4"）就保持原位不动。
  · **只有选中的 panel 有描边（红色），其它一律不加**（Leo：「画出来的没必要再加青色虚线，改过的
    也不用加紫色虚线」）。一度给手画的加青虚线、给改过的加紫虚线，实际立面上那是叠在 gasket 圈上的
    第三第四层虚线框，反而把「我正在editer哪一块」淹掉了。**panel 是什么，看填色；怎么来的，看
    editor 和计数。** 手画的可以改类型（4 种全开）、改 gasket、删掉；自动 panel 的删除是「划掉」
    而不是真删，重新 import 也不会复活。
  · 拖拽用 module 级的 mousedown/mousemove/mouseup，靠 SVG 自己的 `getScreenCTM()` 换算坐标，
    所以任何缩放/容器宽度都对；不在画笔模式时三个 handler 全是空转。
  验证：`node t-draw.js` —— 画 panel 进量、吸附、划掉误判、手画门出两根 jamb 且与解析出的门量相同、
  存档往返、旧平表兼容，15 条全过。

- **一次性批量导出 Excel，每个 elevation 一张 sheet，全在一个文件里**（2026-08-20，Leo：「上司要求
  给每一个 elevation 做一个 excel 表格，你参考 750XT page，帮我做一次性批量生成 excel 表格功能
  全放一个文件里」）。版式**照抄他自己那份 `750XT / 45TU takeoff.xlsx` 的 750XT 页**——因为老板
  已经在看那张表了。每张 sheet 分两段，跟他手工做的一模一样：
  · **上半段 = 订货表**：Part # / Detail(B:D 合并) / Total Cut Length (in) / Stocks (FFD) / Unit /
    Stocks +15% (pcs) / Unit，按参考表的分区横幅分组（Dark Bronze 型材、Non-Color 附件、Fastener、
    Gasket、Hardware、Anchor）。
  · **下半段 = 明细**：本工具自己的逐件 dump（含每个数字背后的 roles），不然那张订货表没法核。
  · 第一张 sheet 是 **ALL ELEVATIONS**，同样版式，装项目总量（走 `buildPooledPacking`）。
  **分区归属和每箱数量是从参考表里抄下来的，不是猜的**（`XL_PART_SECTION` / `XL_BOX_QTY`）；表里
  没有的料号走一条兜底规则，**同时**在 console 和 sheet 底部列出来——新料号会以「问题」的形式出现，
  而不是悄悄落进错误的分区。
  **`xlsx-writer.js`：自己写的、无依赖的 .xlsx 生成器。** 不引 SheetJS 的理由：takeoff 是没有构建
  步骤、没有第三方运行时依赖的静态页，最不能接受的失败是「CDN 连不上所以交不出东西」。xlsx 就是一个
  装 XML 的 zip，这里要的东西（几张表、合并、列宽、一小组固定样式、数字/文本/公式）两百行就够。
  zip 条目用 **STORED 不压缩**——Excel / LibreOffice / Google Sheets 都认，省掉唯一真正需要库的部分。
  **两个必须记住的坑**：①`<worksheet>` 里子元素**顺序是 schema 规定死的**（sheetPr → sheetViews →
  cols → sheetData → mergeCells → pageMargins → pageSetup），LibreOffice 会容忍顺序错，**Excel 会
  直接报文件损坏并提示修复**。②styles.xml 里每个 `count=` 必须和实际条目数一致。
  验证：`node t-xl.js <dxf>` —— 张数/命名/唯一性、订货表的 FFD 与 cut list 一致、+15% 是向上取整、
  gasket 的 LF 与 gasket diagram 一致，最后**真的用 openpyxl 解析 + 真的用 LibreOffice 打开**
  （能转出 csv 就说明没有「文件已损坏」弹窗）。

- **Fastener / hardware / anchor 规则进了 accessories 引擎**（2026-08-20，从 YKK `04-4014-25`
  YCW 750XT 安装手册提取，并与 Leo 自己那份 takeoff.xlsx 的公式互校；只做他 Excel 里出现的那几个件）。
  **最有用的发现：规则本来就在他自己的表格公式里**（`=G77*2`、`=G78`、`=(E18+E19+E20)/9`），手册逐条
  印证，没有一条是猜的。
  · `HF-2510-W1` = **每个 shear block ×2**（p6 / p26 / p27 STEP 5 / p47）
  · `FC-1220` = **每根横档每端 ×2** = 每个 shear block ×2（p6 / p46 / p47 STEP 16）
  · `FC-1212` = 同上，但**只用于 90° 外角 shear block**（p6 / p46）；AC3 没有外角 → 恒为 0，保留可见
  · `HD-2516-W3-SS` = **pressure plate 总长 ÷ 9"**（p62 STEP 28：料本身按 9" O.C. 冲 0.281" 孔；
    扭矩 30 in-lb，自下而上）。1" 和 1-1/2" 两个玻璃厚度段都是 9"，与厚度无关。
  · `E1-3504` shear block = **每根横档每端 1 个 = 每根横档 2 个**（p26 STEP 5）。Leo 原来记的是
    「44 openings × 8」——4 根横档 × 2 端正好是 8，改成 per-piece 后在不规整立面上是准的。
  · 锚件 `E1-1222` / `E1-1234`：手册**给不出数量**（p47/p49「per approved shop drawings」、p3 注 9
    「system-to-structure fasteners are not supplied by YKK AP」）。Leo：「always follow excel」，
    所以照抄他 ACCESSORIES 块的口径（F anchor 8/opening，T anchor 1/中竖梃），由他自己改。
  **引擎加了两种规则类型**（原来五种全是量框料的，量不了「挂在别的件上」的紧固件）：
  · `per_part` —— 数量 = param × 被引用件的**件数**
  · `per_part_len` —— 数量 = 被引用件的**总长** ÷ param（param = o.c. 英寸）
  这两种规则下，**Positions 列填的是料号，不是 role**。被引用的可以是 stock 件（走 cut list）也可以是
  另一条 accessory 行；**只允许一层引用、不允许链式**，所以求值顺序永远无关紧要（两趟计算：先算非引用
  规则，再把 stock 件件数 ∪ 已算出的 accessory 数量喂给引用规则）。没填引用的行会明说
  「no part referenced」，而不是安静地报 0。
  **`E1-3603` / `E2-0513` 从 750XT 的 parts 库里删掉了**（进 `RETIRED_PARTS`）。它们本来挂着 roles 当
  型材算，结果工具在「用 24 尺料切 48 根 setting block」，而且会和新的 accessory 行**重复计**、还会出现
  在 cutting diagram 上。现在改成 accessory：**按下横档的跑长算**（Leo：一块玻璃只有下边的料上有
  setting block 和 chair，所以 run-length 是对的），且**只挂 Sill/Horizontal 系 role，绝不挂竖料**。
  料号 **E1-3603 = Setting Block Chair、E2-0513 = Setting Block**（Leo 2026-08-20 确认；这两个就是
  04-4014-25 里 1" 玻璃那套的号，尽管 AC3 玻璃是 1-1/16"）。它们**留在 accessories、不回 parts 库**：
  当 parts 会被 FFD 排到 24 尺料上、还会画进 cutting diagram，并与这两行重复计。
  `PARTS_DB_VERSION` bump 到 20260820（parts + accessories 会随版本重灌）。
  验证：`node t-acc.js <dxf>` —— 18 条断言，逐条核对上述每个数量、setting block 不再被切料也不再留在
  parts 库、Excel 里每个件落在正确的分区、没有任何件走兜底规则。

- **Report 底部按钮改竖排**（2026-08-20，Leo：「改成竖排，不要超出框」）。原来 `.tk-report__foot`
  是一行 flex：公式在左、导出按钮在右。加到六个按钮后那一行顶出了面板边界，还把公式挤成了一列一个词。
  改成 column：公式独占一行，按钮 `.tk-report__actions` 在下面竖着排、各自按标签宽度（`align-items:
  flex-start`，不拉满）。**真正止住溢出的是子元素上的 `min-width: 0`** —— flex item 默认
  `min-width:auto`，拒绝缩到内容宽度以下，这才是当初按钮溢出而不是被容器收住的原因。公式加
  `overflow-wrap: anywhere`（一长串等宽字符，窄宽度下没有自然断点）。
  改的是 `styles.css`，所以 `index.html` 里 `styles.css` 也得带 `?v=`（以前没带，会吃缓存）。

- **配件规则也是云同步的 —— 光 bump PARTS_DB_VERSION 没用**（2026-08-20，Leo：装完规则后打开，
  fastener 一条没有、setting block 没有、显示出来的行没有料号、Dark Bronze 下面还多了两行空白）。
  原因和当初 E2-0120/E2-0127 一模一样：**accessories 和 parts 在同一个云端 `systems` 文档里**，本地
  按版本重灌之后，下一次云快照又把旧的盖回来。**一次性 migration 永远赢不了云快照，必须是常驻和解器。**
  最初写成逐行 merge/adopt 的和解器，Leo 直接否掉：「**不用管我原来的规则，用新的规则全部洗一遍**」。
  所以现在是 **`washSeedAccessories()`：750XT 的配件规则归 systems.js 所有** —— 不 merge、不逐行对，
  整组替换。同时清掉所有 **system 为空** 的历史行（它们早于「按系统分规则」，会作用到每一个洞口，
  一条空 system 的 `Glazing Gasket` / `Shear Block` 就压在 750XT 的同名规则上重复计）。
  45TU / IR501T / 450 的规则不动。老的 `Shear Block` 只挂 `Horizontal + Transom Bar`，漏掉了 head/sill，
  而 04-4014-25 Detail 6 画得很清楚 head 和 sill 上都有 —— 这也是必须整组换而不是保留 positions 的原因。
  **判据是「有没有」，不是版本标记 —— 这一点栽过一次，值得记住。** 先写的是 `ACC_WASH_VERSION`
  版本标记，让每个浏览器只洗一次。结果那一次发生在**页面加载时、Firestore 快照到达之前**：洗完盖章，
  快照随后把旧行盖回来，而标记说「洗过了」，于是永远停在旧数据上。**任何「我做过了吗」式的开关，
  在这个竞态里都必输。**
  改成 presence：**只要 seeded 料号里有任何一个不在 750XT 集合里，就说明这套是旧的** —— 不管它是谁、
  什么时候放进来的 —— 洗掉重装并推上云。云上装好之后每个料号都在，wash 自然停火；而且判的是「在不在」
  不是「等不等」，所以手改某条规则的 param 不会被改回去。整条删掉的话下次 render 会回来（这些是手册
  背书的规则，本来就该如此；要改去改 systems.js，或者就地改 param）。
  `applySystemsDocs()` 在写完 `state.accessories` 之后会调 `renderAll()`，wash 就挂在那儿；而它是先设
  `lastSyncedSystemsJSON` 再 render，所以 wash 改完之后那次 push 一定会被判为有差异、真的写上去。
  另外留一条常驻的 `pruneLegacyAccessories()`：**既没 system 又没料号**的行永远删 —— 这种行下不了单、
  必然与某条具名规则重复；万一有没洗过的浏览器把旧数据推回来，下一次 render 会再剥掉。
- **Excel 去掉 TAKEOFF DETAIL 块**（Leo：「excel doesn't need to have takeoff detail」）。明细留在工具里
  （viewer + report），不再钉在每张表底下。
- **既没有料号又没有描述的配件行不进 Excel**。这种行没法下单，而且没有任何东西可供分区判断，于是从前
  会掉进兜底分支、以两行空白出现在 Dark Bronze 下面。现在跳过并在表底注明跳过了几条，让它变成一个
  「去把它命名了」的提示，而不是一个看不懂的空行。

- **setting block / chair 按 24 尺料下单**（2026-08-20，Leo：「stock length 是 24 feet，除完向上取整」）。
  它们是挤压件，takeoff 出来的是跑长（LF），下单要的是 24 尺料的**根数** = `ceil(LF / 24)`。
  为此把原来的 `XL_BOX_QTY`（料号 → 每箱数量）换成 `xlOrderPack(partNumber, description)`，返回
  `{per, unit}`：`per` = 一个可下单单位里含多少个「takeoff 单位」，`unit` = 下单单位。
  · 有料号的走 `XL_ORDER_PACK`（100/箱、500 LF/箱……，抄自参考表）
  · setting block / chair：`E1-3603` / `E2-0513` → `{ per: 24, unit: 'PCS' }`。
    （曾短暂按描述匹配，因为当时没有料号；Leo 给了号之后已并入按料号那张表。）
    **不挂在 accessory 规则上**：`cloud-sync.js` 的 `cleanAccessories()` 只保留
    partNumber/description/rule/positions/param/min/unit，**任何额外字段过一趟 Firestore 就没了**，
    所以「怎么买」这件事必须放在 app.js 的表里。
  SF06：65.80 LF ÷ 24 → **3 PCS**。回归里有断言：per 列是 24、下单单位是 PCS、数值等于 `ceil(LF/24)`、
  并且是向上取整不是四舍五入（24.1 LF → 2 根）。

- **setting block / chair 改成「每块 panel 2 个」，新增 `per_panel` 规则**（2026-08-20，Leo：
  「install setting block chairs and rubber/silicone setting blocks at the 1/4 points of the daylight
  opening (D.L.O.) along the sill or intermediate horizontal member，so 2 for each panel (not just
  lite because imp-1 panel needs setting block too)」）。
  之前按下横档跑长（per_lf）是错的。`per_lite` 也不行 —— lite 是 vision glass 的数量，**IMP-1 板不是
  lite 但一样要垫块**。所以加了 `per_panel`：**直接读 panel map**（就是 gasket 那套 glass/IMP-1/
  louver/door，含手画和手动改类型的），`positions` 列在这条规则下填的是 **panel 类型**
  （Glass / IMP-1 / Louver / Door），留空 = Glass + IMP-1。louver 和 door 不给。
  好处是它跟着 panel 走：**手画一块 panel 或把 glass 改成 IMP-1，这个数自己就变了。**
  SF06：20 块 panel 里 glass 9 + IMP-1 5 = 14 → **28 ea**（louver 5、door 1 不算）。
  **24 尺料那条随之取消**：现在算出来的是「个数」不是跑长，没有东西可以去除以 24。等 Leo 给了单块长度
  再谈从 24 尺料上裁多少根；在那之前按「个」下单。
- **wash 的判据从「料号在不在」升级成「结构签名」**：`partNumber | rule | positions`（**不含
  param/min**）。因为这次只改了规则类型、料号没变，按料号判的话云端永远收不到新规则。
  界线是：**结构（用哪条规则、读什么）归 systems.js；量值（param/min）归 Leo，在表里改不会被洗掉。**

- **框料可以在立面图上直接拖了：拖端点改长短、拖矩形新增，带磁吸**（2026-08-20，Leo 在做 45TU：
  「识别得很不好 / 增加手动 edit piece 功能，现在可以 add 但只是文字，需要在图上可以改长，改短，
  新添，需要有磁吸，像画 panel 那样」）。
  framing view 原来除了一个文本表单之外是只读的。**在识别得差的系统上，逐根改数字是不能用的** ——
  图就在眼前，改就应该在图上改。交互与 panel map 完全一致：
  · **选中一根 → 两端各出一个红色抓手**（长度的 10%，最小可点），拖动即改长短。只动被拖的那一端，
    另一端钉住；不允许拖过另一端（负长度不是东西）。
  · **✏ Draw a piece → 拖一个矩形新增**。宽的成 Horizontal、高的成 Vertical，**role 之后在下面的
    编辑器里改** —— 从一个随手画的矩形去猜 Head / Sill / Horizontal 只会添乱。
  · **磁吸 `CUT_SNAP_IN = 4"`**，吸附到其它框料的表面。`cutSnapAxes(o, skipIdx)` **要排除被拖的那根
    自己**，否则端点会黏在原地、看起来像坏了。
  · `setCutGeometry()` 是唯一改几何的入口：**同步更新 `length`（取长边）**，让料表和图永远一致；
    **并把 `roleEdits` 的 pin 一起搬过去** —— pin 是按 `srcKey` 存的，几何一变 key 就变，不搬的话
    手工定过的 role 会悄悄丢失。
  拖拽用 module 级 mousedown/mousemove/mouseup + SVG 自己的 `getScreenCTM()`，不在 framing view 时全是空转。
  验证：`node t-cutdrag.js` —— 磁吸窗口内外的行为、加长/缩短后 length 跟着走、横料取宽不取高、
  pin 随几何迁移、画出来的件真的进 cut list。

- **三处「750XT 的假设漏到 45TU」**（2026-08-20，Leo 在做 45TU 时一次报了三条）：
  1. **gasket diagram 只给 750XT**。parse 里 `if (system === '750XT')` 才写 `panelCells`，所以别的系统
     连 panel map 都没有。改成**所有系统都出** —— panel map 是核对和纠正 takeoff 的手段，在识别得差的
     系统上只会更有用。各系统的 gasket 内容交给新的 `SYSTEM_GASKET` 表；**表里没有的系统就画一张没有
     gasket 圈的图**，而不是硬套 E2-0127（错的图比没有图更糟）。
     **45TU = 每块 panel 2 圈 E2-0052**，这与原来的 per-role 规则**在算术上完全等价**：原规则是周边
     role（Jamb/Door Jamb/Head/Sill）2×LF、内部 role（Vertical/Corner/Horizontal）4×LF；一根周边料只
     邻一块 panel、一根内部料邻两块，所以「每块 panel 2 圈」正好还原成 2·L 和 4·L。
     **systems.js 里那两条 per-role E2-0052 同时删掉了 —— 留着就是双倍。** 实测 372.4 → 373.17 LF
     （差 0.2%，因为 panel 量的是 DLO 洞口、老规则量的是整根料长；panel 这个更准）。
     storefront perimeter / door jamb 两笔是 750XT 专有，45TU 的 `perimeterPart`/`doorPart` 为 null，
     既不计也不画。accessories 汇总里 perimeter/door 改成**按料号累加**，因为一个项目里可能同时有
     750XT 和 45TU 的洞口。
  2. **鼠标浮上去显示的是 750XT 的剖面**。`role-sections.js` 和 `part-sections.js` 都是从 750XT 的图里
     抽的，而且**只按 role 名索引**，于是 45TU 的 `Head` 直接命中了 750XT 的 `Head`，显示了一根完全不
     相干的型材。**错的剖面比没有剖面更糟 —— 它看起来很权威。** 加 `SECTION_LIBRARY_SYSTEM = '750XT'`
     把两处（hover tooltip、角色表展开）都门控住；非 750XT 时改为列出**该系统里覆盖这个 role 的料号**，
     那是我们真正有的、有用的答案。
  3. **Position 下拉出现 750XT 的 role**。`POSITIONS_LIST()` 是所有系统 role 的并集 —— 这对零件表是对的
     （一行可以属于任何系统），对 viewer 的下拉是错的（这根料已经属于某个系统了）。而且不只是噪音：
     选中一个 750XT 的 role，45TU 没有任何零件覆盖它，**这根料就会悄悄从 takeoff 里消失**。
     新增 `POSITIONS_FOR(system, current)`，只给该系统的 role（∪ customRoles ∪ 当前值，保证已有的
     怪值不会因为打开菜单就丢）。
  wash 的覆盖范围从 `'750XT'` 扩到 `ACC_OWNED_SYSTEMS = ['750XT','45TU']`；IR501T / 450 / 1600 不碰
  （它们的规则从来没在这儿整理过，洗了等于把云上的东西扔掉）。
  验证：`node t-45tu.js` —— 下拉隔离、剖面库门控、45TU 出 panel map、只吃 E2-0052、不吃 750XT 的料号、
  不画金线、以及 750XT 一切照旧。
- **2026-08-20** — **(IMP-1) framing roles retired.** `Jamb (IMP-1)` / `Vertical (IMP-1)` /
  `Vertical (wide IMP-1)` are gone from SYSTEM_DEFS. Their only difference from the plain roles
  was the gasket, and the gasket is now a per-PANEL takeoff, so the distinction bought nothing
  and cost a mullion being split into three sticks. Legacy data collapses automatically:
  ROLE_REMAP chains point at the base role only (never the `(X)` louver variant),
  `normalizeImp1RoleToBase` runs first in classifyRoles, `recognizedRolesForSystem` filters a
  curated list at read time, and a stale `state.roleEdits` pin is REWRITTEN to the base role
  rather than dropped (dropping it would re-expose the piece to auto-classification).
  `mergeCollinearVerticals` fuses the old three-way splits back into one member.
- **2026-08-20** — **Gasket = per-panel, hand-editable.** Every infill cell parsed from the DXF
  is stored on the opening as `o.panelCells` (survives reload; ELEV_EXPORTS does not) and
  resolved through `state.panelEdits[mark][panelKey]` into `o.panels`. A panel carries a type
  (glass/IMP-1, auto-detected from the IMP-1 hatch exactly as before) and its own gasket spec
  `[{part, loops}]`. LF = perimeter × loops, summed per part number — there is no glass/imp1
  bucket any more. Default for BOTH types is `E2-0127 ×1 + E2-0120 ×1`; the type is still stored
  separately because Leo expects the two to diverge again. Louver/door panels are shown but
  locked. Overrides ride in the EXISTING `elevEdits/{mark}` Firestore doc under a `panels` field
  — deliberately not a new collection, which would need its own security rule published before
  any write would land.
- **2026-08-20** — **E1-0120 / E1-0127 deleted from 750XT** via a STANDING sanitizer
  (`pruneRetiredParts`, called from renderAll), not a one-shot migration: those rows were
  hand-added to the CLOUD parts library, which overwrites local state on every snapshot, so a
  one-shot would be undone on the next sync. It strips them, pushes the clean 750XT doc back up
  on a deferred macrotask (after cloud-sync's `applyingRemote` guard clears), then no-ops forever.
- **2026-08-20** — **Cutting DXF is landscape + carries drawings.** Elevations run left→right,
  wrapping so the sheet lands near 1.6:1; each column = mark → its frame diagram (1:1 from
  `cuts[].src`, panels outlined) → its cut list, with each part's extrusion cross-section drawn
  under its name. Sections come from the new `part-sections.js` (13 profiles auto-extracted from
  `new block.dxf`) and are emitted as one DXF **BLOCK per part + INSERT** — inline lines put a
  single elevation at 270KB and would have run to megabytes across 40. Parts with no section
  (BY7-9065, AS-7110, E9-1660, and every non-750XT part) export as text and are reported to the
  user, not silently skipped.

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
