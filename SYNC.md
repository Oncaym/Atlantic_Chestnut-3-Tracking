# Tracker Sync Protocol / 同步协议

Two (soon more) trackers share one codebase. This file is the contract that
makes "把这个功能同步到那边" a safe, one-sentence request to Claude.

## File classes

**CORE — byte-identical across all trackers. Sync by straight copy.**
| file | role |
|---|---|
| `app.js` | all dashboard logic (reads project data from `window.PROJECT`) |
| `app-log.js` | daily-log projection engine |
| `cloud-sync.js` | Firebase auth + live sync (login brand comes from PROJECT) |
| `chat.html` | natural-language updater UI (brand + project name at runtime) |
| `api/parse.js` | Claude parse endpoint (project name passed per-request) |
| `.github/workflows/backup.yml` + `.github/scripts/backup-state.js` | nightly cloud backup |

**PROJECT — never copy between trackers.**
`project-config.js` (identity, keys, seed scope, positions, door patterns,
i18n names) · `firebase-config.js` · `state.json` · `elevations.js` ·
`index.html`(*) · plan images · `warehouse.html` / `friday-triage.html` /
`SF01-elevation.html` · `README/SETUP/CLAUDE.md`

(*) `index.html` is HYBRID: mostly core markup, but contains the project's
Scope Install Tracking section, plan image reference and title. Sync it
feature-by-feature (Claude ports the specific block), never whole-file.

## How to sync

1. Check `EDITING.lock` in the TARGET folder first (same rule as any edit).
2. Core files: verify `md5` matches the source project after copying.
3. index.html features: port the specific block; keep the target's scope
   section, title and plan reference untouched.
4. Record what moved in `FEATURES.md` (both sides).
5. `node --check` every copied JS file; open the page once before pushing.

## Rules that keep this safe

- Never change `storageKey` / `baselineKey` / `langKey` on a live project —
  it orphans every user's local cache.
- New behavior differences between projects go through `window.PROJECT`
  flags (like `requirePlacedMarkers`), never through diverging core code.
- If you must fork core behavior temporarily, note it in FEATURES.md with a
  ⚠ so the next sync doesn't silently overwrite it.
- Each project has its own Firebase project + GitHub repo + Vercel app.
  Data never syncs between projects — only code does.


## Claude 必读：改 core 的标准动作（每次都要走完）

Core 是 7 个文件，改任何一个，**所有 tracker 必须同步改**，否则就回到各自漂移的老路：

`app.js` · `app-log.js` · `cloud-sync.js` · `chat.html` · `api/parse.js` ·
`.github/workflows/backup.yml` · `.github/scripts/backup-state.js`

1. 两个（将来是全部）tracker 文件夹都写 `EDITING.lock`
2. 在一个项目里改好 core 文件，`node --check` 通过
3. **原样复制**到其他所有 tracker（不要重写，就是拷贝），`md5` 校验一致
4. 项目差异永远走 `window.PROJECT`（project-config.js）或 F-019 的 Modules 开关，
   绝不允许两边的 core 文件出现不同内容
5. `FEATURES.md`（每个项目一份）登记一行 F-0XX
6. 删除所有 EDITING.lock，提醒用户：每个项目各自推 GitHub 才会上线
7. 如果用户只挂载了一个 tracker 文件夹 → 明确告诉用户"core 改动需要同步到
   其他项目"，让 TA 挂载另一个文件夹或用 project-sync.html（F-026）自行对齐

新 tracker 加入时：从 skill（project-tracker-builder）生成后，把现有项目的 7 个
core 文件拷过去覆盖模板版，然后只写它自己的 project-config.js。
