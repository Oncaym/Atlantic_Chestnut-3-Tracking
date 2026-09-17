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
| F-028 | Modules 面板（⚙）标签/标题/描述/按钮三语自适应（读 currentLang；切语言自动重建面板） | ✅ | ⬜ | **core（app.js）**，需同步 CP2；warehouse.html 也已加入 project-sync 的 TOOLING 同步清单 |
| F-027 | Project Sync 同步"工具/文档文件"（project-sync.html/SYNC.md/FEATURES.md/HUB-SETUP.md 可从 Hub 拉取，🔧 标记）+ 旧文件清理（sync.html/new-project.html 若残留可一键 🗑 删除） | ✅ | ⬜ | 让工具能自我分发；contribDiffFiles 限定 core，不误报"贡献" |
| F-029 | Tracker 内嵌 Takeoff Tool（header "🛠 Takeoff Tool" 直跳 `takeoff/`，import DXF 在 takeoff 页做） | ✅ | ⬜ | **非 core**：`takeoff/` = Downloads takeoff tool 的镜像拷贝（改一边要同步另一边）；零件库共享 Firestore 挂 atlantic-chestnut-3 项目 |
| F-030 | **Elevation 入云**：takeoff 页 "→ Tracker" 按钮把每个 unit 的立面几何（glass/louver/door/panel 元素+框线 base）写入 Firestore `elevGeo`；tracker 端 `elev-cloud.js` 实时订阅合并进 `window.ELEVATIONS`（云端覆盖 elevations.js 同名静态条目）→ 导入新 DXF 不用改文件不用重部署 | ✅ | ⬜ | 非 core（elev-cloud.js + index.html 两个 script 标签）；需 Firestore 开通+规则（takeoff tool/`FIRESTORE-SETUP.md`）；unit 显示 id 必须与 mark 一致（如 SF04.1） |
| F-031 | **Submittal 逐家回复（按 Rev 分组）**：BIC 不再是一行文本，改成每个审核方一行（状态 + Procore 回复原文 + 回复日期），默认按固定顺序自动带出、可增删改；改 Revision 自动开新一轮，旧 Rev 存为历史；表格 BIC 列显示 `Rev0 · 2/4 responded` + 每家色标 + **回复原文直接显示在对应审核方右侧** | ✅ | ⬜ | **core（app.js）**，需同步 CP2；名单是项目数据 `PROJECT.submittalReviewers`（CP2 要填自己的审核方，留空则不预填）；`s.reviews={Rev0:[{party,status,response,date}]}`，`s.ballInCourt` 变成派生字符串（向后兼容，旧数据渲染/首次保存时自动升级） |
| F-032 | **Submittal 行拖拽排序**：⠿ 手柄拖到任意位置（上半格插上方/下半格插下方，蓝线预览），不用一格格点；▲▼ 保留作触屏回退 | ✅ | ⬜ | **core（app.js）**，需同步 CP2；只有手柄 `draggable`，点行仍然打开编辑；`reorderSubmittal()` 按对象identity移动 → 带筛选时排序仍正确；HTML5 DnD 手机不触发，故留 ▲▼ |
| F-033 | **手工新建的 opening 也有画布（#blank-canvas，2026-08-27，Leo：「能加 cut，但没有地方放这些料」）**：Elevation Viewer 的 frame view 之前把画布范围**从料上算**——`srcs = cuts.filter(c => c.src)`，没有 DXF 几何就一根都没有，于是直接落到「No source geometry」那个 `<div>`。问题在于所有画/拖的 handler 绑的是 `<svg id="frame-map-svg">`，那个 div 不是它，所以「Draw a piece」在叫你往一个不存在的东西上拖矩形，手加的 cut 只能永远是 chip。**修法不是做新工具**（Leo 明确说了别做），而是把画布范围改成**从 opening 本身算**——它自己知道尺寸，标题栏就印着（`35.25" × 62.25"`）。①`blankBox` 用 `!o._bands && o.width>0 && o.height>0` 判定手工 opening（`templateControlsHtml` 本来就是这么判的）；**DXF 解析过、但料被删光的 opening 保持原样报错**，因为它的坐标在 DXF 空间里，一个 0 起点的框会把画布放到离几何十万八千里的地方。②画上第一根料之后仍然把 opening 的框并进范围，否则画布会**塌缩到第一根料上**，后面画的全部比例错乱。③把 opening 的框用虚线画出来（空的时候中间标尺寸），有个东西可以瞄。④`cutSnapAxes` 给手工 opening 补上它自己的四条边——这是它唯一的固定参照，不然画个 sill 会差 1/8"。**实测**（真浏览器，不是只跑 jsdom）：新建 35.25×62.25 的 SF17 → 画布出现 → 随手拖一条歪的底料，吸附成 `x=0 w=35.25`（正好开口宽）；再拖一条左边料，吸附成 `x=0 y=0.5 h=61.75`（正好坐在底料上顶到头部）；右侧 Consolidated Takeoff 同步出 BE9-2552/2553/2556 + E9-1015。`node _tests/test-blank-canvas.cjs`（15 断言，含 mutation 验证：回退修改则 8 条报错）。 |
| F-034 | **点 chip 就把料放到画布上 + 拖动移位（#place-chip，2026-08-27，Leo：「我输长度和 role，点一下底下的 chip，料就出现在画布上，我只要把它移到位就行，而不是重新画一根」）**：①**放置**——底部 chip（没有几何的料）点一下就按**你输入的长度**落到画布上，宽度默认 **2"**（除转角和宽料外全是 2"；编辑器新增 Width 框改那几根）。位置按 role 给默认落点：sill 贴底、head 贴顶、jamb 贴左右边、其余居中——**只是起点，本来就是要你拖的**。②**×2 的 chip 点一次放一根、剩下的还留在 chip 上**，所以点两下两根竖料都上墙，计价总数分毫不变。③**避让只在同方向之间生效**——jamb 和 sill 本来就共用左下角，那才叫框；早期版本拿原点跨方向比，把两根 jamb 都挤离了它们该在的边。④**拖动移位**（原来只有两端拉长/缩短，根本没有「移动」）：按住料身拖走，**吸附的是料的边不是光标**（光标只是随手抓的一点），所以专门加了 `rawPt` 拿未吸附坐标、`snapSpan` 吸附两条边。⑤`snapSpan` 比的是两条边的**吸附位移量**，不是「哪个结果离原位近」——后者永远选中没吸附的那条边（位移为 0），结果就是料拖到横梁底下也贴不上去。⑥没真的移动的按下不会当成一次编辑提交（普通点击仍然只是选中）。⑦画笔打开时拖过料身仍然是画新料，不是移动。⑧改 Length 会同步改画布上那根料的长度（原来只改数字、图不动，图和料单会悄悄不一致）。**实测**（真浏览器）：35.25×62.25 的 SF17，四次点击 → 底料、顶料、左右竖料各就各位，右侧 Consolidated Takeoff 出 Head 35.25" / Jamb 124.50" / Sill 35.25"，跟 chip 完全对得上；把中间横料往上拖 → 顶边吸到头料底面 (y=58.25)。`node _tests/test-blank-canvas.cjs`（36 断言，三处 mutation 验证全部报错）。 |

## Divergence watchlist
- **F-021 (app.js 数据驱动楼层, 2026-07-07)**: AC3 的 app.js 已加 getFloors/renderFloorControls，CP2 尚未同步。改动向后兼容（无 `PROJECT.floors` 时零行为变化），所以 CP2 现状不受影响；但下次改 core 前应把 app.js 原样复制到 CP2 并 md5 校验，避免漂移。
