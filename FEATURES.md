# Feature Ledger / 功能台账

One line per feature. When syncing, reference the ID ("把 F-012 同步到 CP2").
Status: ✅ live · ⬜ not enabled · ⚠ diverged (see note)

| ID | Feature | AC3 | CP2 | Notes |
|---|---|---|---|---|
| F-001 | Core dashboard (plan/KPI/grid/table/timeline/charts) | ✅ | ✅ | core |
| F-002 | Firebase cloud sync + login gate + edit history | ✅ | ✅ | core |
| F-003 | Chat updater (NL → structured updates, EN/中/한) | ✅ | ✅ | core; needs ANTHROPIC_API_KEY in Vercel |
| F-004 | Glass per-panel tracking + batch update + triage link | ✅ | ✅ | core |
| F-005 | Door Mode + door unit patterns | ✅ | ✅ | patterns per project (PROJECT.doorPatterns) |
| F-006 | Face Cap tracking | ✅ | ⬜ | core-guarded; CP2 index has no m-facecap field |
| F-007 | Interactive elevations (per-SF, DXF geometry) | ✅ | ⬜ | needs elevations.js data per project |
| F-008 | Elevation frame-status button + door→parent-SF view | ✅ | ⬜ | rides on F-007 |
| F-009 | Element type editing via popup (no cycle-click) | ✅ | ⬜ | rides on F-007 |
| F-010 | Day mode (light theme, chart-aware) | ✅ | ✅ | CSS+JS in index.html; helpers in core |
| F-011 | Evidence layer: ref/party/fault + fit-issue/field-verify/gc-inquiry + log filter | ✅ | ✅ | core + index filter input |
| F-012 | Field Verify · R.O. tab (u.ro, auto field-verify log) | ✅ | ✅ | core + index panel |
| F-013 | Cloud-safe Reset (re-pull instead of overwrite) | ✅ | ✅ | core |
| F-014 | Nightly backup GitHub Action | ✅ | ✅ | each repo needs FIREBASE_SERVICE_ACCOUNT + FIREBASE_DATABASE_URL secrets |
| F-015 | core/config architecture (project-config.js) | ✅ | ✅ | 2026-07-06 unification |
| F-016 | Warehouse page | ⬜ | ✅ | CP2-only page |
| F-017 | Friday glass triage page | ⬜ | ✅ | CP2-only page |
| F-018 | Sync Console (`sync.html` — 本地一键 core 对齐, 哈希比对+锁感知) | ✅ | ✅ | meta 工具, 双击用 Chrome/Edge 打开 |
| F-019 | Modules 面板（header ⚙ → 网页内开关功能, 存 state.features 云同步） | ✅ | ✅ | core; PM 免代码开关 |
| F-020 | New Tracker Wizard（`new-project.html` — 网页向导建新项目：粘贴 takeoff → 一键生成） | ✅ | ✅ | meta 工具; Chrome/Edge 双击打开 |
| F-021 | 数据驱动楼层（`PROJECT.floors` → 动态生成楼层按钮/Tab/底图） | ✅ | ⬜ | **core（app.js）**：无 floors 时回退到 GF+L2，行为不变；CP2 需同步 app.js 才有此能力（向后兼容，暂不同步也不影响 CP2） |
| F-022 | 向导升级 v2（导入只需编号 · louver 可编辑 · 自定义多楼层多底图 · 界面中/英/韩切换 · 云端步骤标注可选） | ✅ | ⬜ | meta 工具 new-project.html；依赖 F-021 生成的 floors |
| F-023 | Sync Console 云端 Hub 模式（从 GitHub 权威 core 一键拉取 + FEATURES.md 功能菜单 diff） | ✅ | ⬜ | meta 工具 sync.html；Hub 仓库需 public；owner/repo/branch 存 localStorage |
| F-024 | New Tracker Wizard 云端模板模式（Step 1 可从 Hub raw 拉模板生成，不用本地模板文件夹） | ✅ | ⬜ | meta 工具 new-project.html；复用 localStorage `tracker_hub` |
| F-025 | 贡献回 Hub（"📤 贡献回 Hub" 按钮 → serverless `api/contribute.js` 用 bot token 自动开 PR；无端点则降级下载打包） | ✅ | ⬜ | 端点只需部署在 Hub；env `GITHUB_HUB_TOKEN`；说明见 HUB-SETUP.md |
| F-026 | **Project Sync**（`project-sync.html`）：把 sync + new-project 合并成单文件双分页工具，中/英/韩三语，Hub 改为**粘贴 GitHub 链接**自动解析 owner/repo/branch，全部按钮 node 校验可点击 | ✅ | ⬜ | meta 工具；**取代 `sync.html` + `new-project.html`（已删除）**；F-023/24/25 的能力都并入此文件 |

## Divergence watchlist
- **F-021 (app.js 数据驱动楼层, 2026-07-07)**: AC3 的 app.js 已加 getFloors/renderFloorControls，CP2 尚未同步。改动向后兼容（无 `PROJECT.floors` 时零行为变化），所以 CP2 现状不受影响；但下次改 core 前应把 app.js 原样复制到 CP2 并 md5 校验，避免漂移。
