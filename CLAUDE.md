# CLAUDE.md — AC3 Project Constitution (STATIC)

> **This file is the static constitution. Keep it stable — it is prompt-cached.**
> Do NOT put dates, todos, progress, or bug logs here. Those live in `memory.md`.
> Only edit this file for permanent rule/architecture changes.
>
> **接手顺序 / Read order:** `CLAUDE.md` (this) → `memory.md` (dynamic state) → `SYNC.md`
> (code-sync contract) → `takeoff/PROPAGATION-DESIGN.md` (active design) → `HANDOFF.md`.
>
> 协作者（老板 / 其他 PM）：挂载本文件夹后，直接用中文告诉 Claude 你要什么。
> Claude 读完本文件就知道全部规矩，不用重新解释项目。

---

## 1. What this project is

Two shipped tools, one repo, deployed on Vercel from GitHub `Oncaym/Atlantic_Chestnut-3-Tracking`:

- **Tracker** (repo root) — Atlantic-Chestnut Building 3 curtain-wall / storefront install
  progress dashboard. Cloned from Cooper Park 2 (CP2); same code, AC3 scope.
- **Takeoff tool** (`/takeoff`) — DXF shop-drawing parser → openings + framing cuts (roles) →
  24 ft stock counts → accessories/gaskets → pushes interactive elevations to the tracker.

Both are pure static **HTML + JS** with **Firebase** for cloud state. No build step, no backend
except tiny Vercel serverless functions (`api/parse.js`).

## 2. Tech stack & runtime constraints

- **Frontend:** vanilla HTML/CSS/JS, no framework, no bundler. Scripts are plain `<script>`
  tags with `?v=` cache-busters in `index.html`.
- **Cloud:** Firebase — **Realtime Database** (tracker progress state, `/state`) and
  **Firestore** (takeoff shared parts library `systems`, elevation geometry `elevGeo`,
  manual elevation edits `elevEdits`). Firestore security rules are edited in the Firebase
  Console (see `takeoff/FIRESTORE-SETUP.md`) — a new collection MUST be allow-listed there
  or its reads/writes silently fail.
- **Serverless:** `api/parse.js` (natural-language update parser) needs Vercel env var
  `ANTHROPIC_API_KEY`. Never put secrets or API tokens in frontend code.
- **DXF / geometry:** the takeoff parser reads DXF entities (LWPOLYLINE / LINE / HATCH /
  INSERT blocks) and classifies them geometrically. There is **no live AutoCAD/Rhino
  runtime** — we parse exported DXF text only. "CAD constraints" here mean DXF realities:
  layers may be missing or misnamed, polylines may be unclosed, blocks may be exploded.
  **Handle missing/oddly-named layers gracefully — never assume a layer exists.**
- **Verification harness:** deterministic parser/geometry logic is checked with **Node**
  against real DXFs (see `memory.md` for the recipe). `node --check` for syntax.
- **Storage sync:** the repo folder is **OneDrive-synced**. OneDrive does not merge — it
  makes silent conflict copies. See the Edit-Lock rule (§4).

## 3. File map (durable)

**Tracker — CORE (byte-identical across trackers, sync by straight copy — see `SYNC.md`):**
`app.js` · `app-log.js` · `cloud-sync.js` · `chat.html` · `api/parse.js` ·
`.github/workflows/backup.yml` · `.github/scripts/backup-state.js`

**Tracker — PROJECT (never copy between trackers):**
`project-config.js` (SEED scope, keys, door rules, i18n names) · `firebase-config.js` ·
`state.json` · `elevations.js` · `index.html` (hybrid: core markup + AC3 scope section) ·
plan images · `warehouse.html` · `README/SETUP`.

**Takeoff (`/takeoff`) — single source of truth = `AC3 tracker\takeoff\` (see §4.2):**
`app.js` (all logic) · `systems.js` (parts + accessory rules per system) ·
`cloud-sync.js` · `firebase-init.js` · `role-sections.js` · `index.html` ·
`tracker-bridge.js` · CSS.

## 4. Hard rules (the constitution — always obey)

1. **Edit-Lock (OneDrive conflict prevention).** Before modifying ANY file in this folder:
   read `EDITING.lock` at the root. If it exists, is <2 h old, and `user` isn't you → **stop**
   and tell the user. Otherwise write `EDITING.lock` = `{user, started, note}`, do the work,
   and **delete it when done**. Read-only work needs no lock.
2. **Takeoff single source of truth.** All takeoff code lives ONLY in
   `AC3 tracker\takeoff\` — the GitHub/deploy source. The old `Downloads\takeoff tool\` dev
   copy is **deprecated; do not edit it** (no more two-copy mirror). Edit the AC3 copy only.
3. **Core sync (`SYNC.md`).** Changing a CORE file means ALL trackers must get the identical
   change. Project differences go through `window.PROJECT` flags, never through diverging core
   code. Log the change in `FEATURES.md`.
4. **Cloud is the single source of truth.** Once Firebase is configured, embedded local seed
   data is ignored. Reset data via the Firebase Console, not by editing HTML.
5. **Never change identity keys** on a live project: unit `key`, `storageKey`, `baselineKey`,
   `langKey`. Changing them orphans every user's cloud/local data. Change display names via
   `id` instead.
6. **After a takeoff code change:** bump the file's `?v=` in `takeoff/index.html`, then
   `node --check`, then remind the user each project pushes its own GitHub repo to deploy.
7. **Secrets never touch the frontend.** Tokens/keys go in Vercel env vars via serverless.

## 5. Token-saving rules (enforced every turn)

- **No full-file rewrites.** Edit with the smallest possible diff (targeted `Edit`, not
  `Write`-over). Rewriting a whole file to change three lines is forbidden unless the file is
  new or genuinely being replaced wholesale.
- **Minimal, surgical diffs.** Touch only what the task needs. Preserve surrounding code and
  comments verbatim.
- **No conversational fluff.** No "Let me…", "Now I'll…", no re-summarizing what the user
  just said, no restating the plan back. Report outcomes, not narration.
- **Structured feedback.** When you need a decision from the user, ask a **multiple-choice**
  question (concise options) rather than open prose — faster for the user, cheaper in tokens.
- **Protect the cache.** Keep this file and other large static files stable; put churn in
  `memory.md`. Respect `.claudeignore` so heavy non-code files don't invalidate the cache.
- **Don't re-read what you just wrote.** The tools confirm success; re-reading to "verify" a
  successful edit wastes tokens.

## 6. Model Scheduling & Delegation Guide

At the start of a sub-task, **suggest** the most cost-effective model for it (the user
switches). Default assumption: **Sonnet unless the task clearly needs Opus.**

| Model | Use for | Never |
|---|---|---|
| **Sonnet 5** (`claude-sonnet-5`) — workhorse, ~1/5 Opus cost, fast | **Default.** Raw code generation, refactoring, writing tests, file I/O, formatting, running CLI diagnostics, applying a plan that's already been designed. | — |
| **Opus 4.8** (`claude-opus-4-8`) — high effort | High-level planning, task breakdown, structural/architecture design, complex multi-file debugging. Always run at **high/max** effort. | Never run on "low effort" (becomes too literal, not cost-effective) — and never on simple mechanical tasks Sonnet can do. |
| **Fable 5** (`claude-fable-5`) — premium, most expensive | **Last resort only.** Existential roadblocks: deep system-architecture refactors, or complex math/geometry algorithms that have stalled other models. | **Never by default.** Escalate to it explicitly, only after Opus has genuinely stalled. |

Routing rule of thumb: **design/decide → Opus; build/execute → Sonnet; only-if-stuck → Fable.**
When handing a designed plan to implementation, say so ("this is Sonnet work").

## 7. Cowork guardrails

- **Anti-infinite-loop (3-strike halt).** If a script/command fails **3 consecutive times**
  with the same or a similar error, **stop automatic debugging immediately** and report the
  error to the user for manual environment intervention. Do not keep re-trying variations.
- **Micro-testing / sandbox habit.** Test geometry and file-automation logic on a **minimal
  mock first** (e.g. a single-pane DWG/DXF with exactly 4 boundary lines), confirm it's
  correct, then scale to a full facade drawing. Never debug logic directly on a 15 MB drawing.
- **Self-verify deterministic logic.** Parse counts, geometry, and calculations are verified
  with the Node harness on real DXFs BEFORE handoff. The user eyeballs only visuals/UX.
- **`.claudeignore`.** Heavy, non-code files (images, PDFs, `.bak`, DXF dumps, harness
  baselines, caches) are ignored to protect the prompt cache and keep context lean.

## 8. Where dynamic state lives

Current progress, milestones, resolved traps/bugs, open items, and decisions are in
**`memory.md`** — read it at the start of every session and keep it updated as you work.
