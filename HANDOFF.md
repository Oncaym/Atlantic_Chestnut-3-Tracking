# HANDOFF — 给下一个 Claude 会话 / 模型的交接（最后更新 2026-07-20，见文末最新一轮）

先读 CLAUDE.md（背景+规矩）和 SYNC.md（core 同步铁律 + 编辑锁），再读这份。
这份回答"接下来做什么、怎么做、坑在哪"。功能台账在 FEATURES.md（F-001~F-027）。

> **2026-07-20 晚，给 Opus 4.8 的专项交接在 `HANDOFF-FOR-OPUS-20260720.md`（还没做，先读那份）：**
> ① 删除 Layer B propagation（今天刚做完又被 Leo 否决，错误率太高，明确要求删掉，不要再调）
> ② 诊断+修复"识别总出现已经不存在的历史 role"（pin 保护机制 + whitelist 的已知交互问题）,
> 加一个左侧手动增删"可识别 role"列表的功能 ③ Leo 提的新功能构想——模板式识别（先 import 一个
> 经典 elevation 手动定义每个 role，存成模板，之后新 elevation 可以选模板仿照识别）,这个需要
> Opus 先出设计再动手，不要直接翻译需求成代码。

## 现状一句话

AC3 + CP2 两个 tracker 共享 md5 一致的 core；项目差异在各自 project-config.js。
在此之上已建成一套**开源自助分发系统**：一个 GitHub **Hub**（权威 core，public）+ 一个
单文件工具 **`project-sync.html`**（拉取 / 贡献 / 建新项目，中英韩三语），让任何 PM 能自己
生成、更新、贡献 tracker，不用互传文件夹。

## 本轮（2026-07-07）做了什么

- **数据驱动楼层（F-021，core/app.js）**：`PROJECT.floors` → 动态生成楼层按钮/Tab/底图；
  无 `floors` 时回退到 GF+L2，向后兼容。**已同步 CP2**（core 保持 md5 一致）。
- **`project-sync.html`（F-026/F-027）**：把旧的 `sync.html` + `new-project.html`
  **合并成单文件双分页工具**（🔁 拉取/贡献 · 🏗 新建项目），中/英/韩，Hub 改为**粘贴
  GitHub 链接**自动解析 owner/repo/branch。旧两个文件已删除。
  - 云端模式：从 Hub raw 拉 core + 读 FEATURES.md 列功能差异 + 哈希比对 + 一键拉取。
  - 也同步**工具/文档文件**（project-sync.html / SYNC.md / FEATURES.md / HUB-SETUP.md，🔧 标记）
    并对残留旧文件（sync.html / new-project.html）提供 🗑 一键删除 → 工具能自我分发。
  - 新建项目：从 Hub 拉模板生成；只需编号、louver 可编辑、自定义多楼层多底图、云端步骤标注可选。
- **贡献回 Hub（F-025）**：`api/contribute.js`（serverless，照 api/parse.js 模式）用
  `GITHUB_HUB_TOKEN`（Vercel env，细粒度 PAT，仅 Hub 仓库 Contents+PR 写）自动开 PR；
  前端在 `project-sync.html` 填 `contribUrl`（已部署端点绝对地址）；没配则降级下载打包。
- **`HUB-SETUP.md`**：给守门人的一次性建仓 + token + 审核流程说明。
- **清理**：删掉了误装进项目的 `node_modules` + `package-lock.json`（jsdom 测试残留，
  tracker 是纯静态站、运行时零 npm 依赖）；`package.json` 去掉 jsdom 依赖；加了 `.gitignore`。

## Q&A（用户会这么问，你应该这么答/做）

**Q: API key（chat 报 ANTHROPIC_API_KEY not set）加在哪？**
A: **Vercel** 环境变量 `ANTHROPIC_API_KEY`（不是 Firebase，不是本地文件）。每个部署各配一份，
改完要重新部署。credit 按 Anthropic **密钥/账号**计——同一把 key 用在多个 tracker 就共用额度；
要隔离就发不同 key（Anthropic console 可设每 key 花费上限）。**key 绝不能进仓库/前端**（Hub public 更危险）。

**Q: 守门人在哪收 PR？**
A: Hub 仓库的 Pull requests 页一定有。但如果 `GITHUB_HUB_TOKEN` 是你自己账号的 PAT，
PR 作者=你自己，GitHub 不会通知你自己的操作 → 铃铛/邮件不响。要主动提醒：用 bot 账号/GitHub App，
或改 `api/contribute.js` 开完 PR 自动把你设为 assignee/reviewer。（此项待办，见下。）

**Q: Firebase 项目太多/"Add app" 是什么？**
A: 每栋楼一个独立 Firebase 项目（数据隔离，SETUP.md 强调别复用）。账号建项目有配额，可申请提额。
同一项目里 "+ Add app" 是加多个客户端（网页/手机/备份部署）**共享同一份数据**，不是放不同楼的。
将来撞配额可考虑"一个项目 + 不同 DB 路径命名空间"，但需改代码、共享 auth/规则。

**Q: 文件读出来是截断的/乱的？**
A: 已知环境坑：Cowork 的 VM 挂载对"宿主侧改过且变大的 OneDrive 文件"会长时间卡在旧/截断快照，
bash 的 wc/grep/node 读到的是假的。**以 Read 工具（宿主侧）为准**。可靠校验大文件的办法：
① 新文件 bash 能读到真身；② 把内容写进 outputs 暂存区（bash-fresh）再 node --check；
③ 逐段 Read 人工核对 + 隔离测新函数。别信 subagent 在 bash 里跑出来的"node --check 通过"，
它很可能校验的是截断副本。

**Q: 会话太长？**
A: 新开对话更省 token（历史会重复计费）。让新会话读 CLAUDE.md→SYNC.md→HANDOFF.md→FEATURES.md 即可接手。

## 本轮（2026-07-10）做了什么

- **F-029 内嵌 Takeoff（tracker ⬆ Import DXF）**：tracker header 新增 "⬆ Import DXF" 按钮，
  选 DXF 后经 IndexedDB（`af_dxf_handoff`/files/"pending"）暂存并跳转 `takeoff/index.html`，
  `takeoff/tracker-bridge.js` 开页自动走 `parseRawDxfOpenings → appendParsedOpenings`（与工具自身
  Import DXF 完全同路径）。`takeoff/` 是 Downloads takeoff tool 的原样拷贝（app.js/systems.js md5 一致，
  仅 index.html 改标题+加 "← Tracker" 返回链+挂 bridge 脚本）。south.dxf harness 实测：10 openings
  （SF04–SF10，部分两段），mark 全匹配、全 750XT、0 errors。
- **cloud-sync 补种缺失系统（两份拷贝同改）**：原来只在云端全空时才 seed，导致 systems.js 里
  新加的 750XT 每次开页被云端旧 docs 覆盖、"看不到"。现在快照到达后若发现本地 SYSTEM_DEFS
  有云端缺的系统，自动补写该系统文档（每会话一次，防循环）→ 750XT 首次打开即入云并共享给
  所有 PM；今后 systems.js 加新系统同理自动共享。qa-system 快捷下拉也加了 750XT 选项。
  零件库仍连共享 Firestore `material-takeoff-tool`（与 Hillview 同库，openings 仅本地）。
  750XT parts 与 `750XT parts.xlsx` 已逐项核对一致（A/B/C 占位号待换真号；Vertical(Lv)
  Pocket Filler ×2 仍是占位 ×1，换真号时处理）。
- takeoff tool（Downloads）与 `takeoff/` 今后要**双向保持同步**：改了一边记得拷到另一边（md5 校验）。
- **同日第二轮修复**：① header 按钮改为 "🛠 Takeoff Tool" 直跳（不再在 tracker 里选文件；
  takeoff/tracker-bridge.js 保留，暂时闲置）② unit 弹窗 tab 栏补上 Details(framing)/Glass 按钮
  （原来 panel-framing 无按钮，点走回不来）③ **app.js(core)**：新建 unit 的 key 过滤 Firebase
  非法字符 `.#$/[]`→`-`（"SF04.1" 会让整包 db.ref('state').set 静默失败、刷新即丢；display id
  不变）——**core 改动，待同步 CP2** ④ 确认 "tracker 只有 SF04 有立面" 是部署滞后：本地
  elevations.js 已含 SF04–SF10 全部，需推 GitHub 重新部署。
- **✅ takeoff 算法修正已完成（同日第三轮，两份 app.js 同改，south.dxf harness 回归通过）**：
  ① `isStructural`（全局，clustering 前排除）：竖向 ≥12" 宽=建筑柱、横向 ≥6" 厚=board/IMP，
  不计料且不再把两个立面桥接成一个 → SF04 自动拆成 SF04.1/SF04.2，lites 12+10=22 守恒；
  ② 750XT 最短件阈值 10"→8"（柱旁 9" 短横料回收，其他 system 不变）；
  ③ 750XT 位置集后处理：Transom Bar→Horizontal (X)、Door Jamb 分段去重合回全高一根、
  无 Door Jamb At Transom/Corner 专位、竖梃 w≥3.5"→Vertical (wide)，louver 带内→(wide X)
  （XMAP 增补，Hillview 无 louver 块不受影响）；④ `COLOR_750XT` 配色=xlsx 色键。
  参照基线：`harness-baseline-south-20260710.json`（已更新为修正后 11 openings，含件数+总长）。
  其余 SF 件数与修正前完全一致（唯一全局行为变化是 isStructural，阈值远超真实型材尺寸）。
- **零件库云**：已把两份 firebase-init.js 指向 atlantic-chestnut-3 的 **Firestore**（用户已删旧
  material-takeoff-tool 项目；tracker 用同项目 RTDB，互不干扰）。**用户需在 Console 开通
  Firestore + 发布规则**，步骤见 takeoff tool 文件夹 `FIRESTORE-SETUP.md`。
- **✅ Elevation 入云已建成（F-030，同日第四轮）**：takeoff 页 Openings 区新增 "→ Tracker"
  按钮（import DXF 后可用；几何 payload 只在内存，刷新要重 import）→ 每 unit 一个 Firestore
  `elevGeo` 文档（id=mark，如 "SF04.1"）：{viewBox 高度归一 400, base=框线 SVG rects+louver
  slats, elements:[{id,x,y,w,h,t0∈glass|louver|door|panel}]}，board=panel、柱子不导出。
  tracker 端 `elev-cloud.js`（新项目文件，core 未动）等 cloud-sync 初始化 firebase 后订阅
  elevGeo 并合并进 window.ELEVATIONS（云端覆盖同名静态条目）。south.dxf harness 实测 11 个
  立面全部生成，SF04.2 = 14 glass+4 louver+1 door+1 panel ✓。**匹配规则：unit 显示 id 必须
  等于 mark**（SF04.1/SF04.2 —— 用户要相应建 unit；SF07 这类整版 mark 是 SF07.1/.2 两个）。
  POSITION_COLORS 还补了 (X)/(Lv)/(wide) 新色系（棕/深紫/粉/橄榄/天蓝/墨绿/蓝紫），任何
  system 下不再显示灰色。elevations.js 里旧的合并版 SF04 静态条目可择机删除。
- **反向状态上色（takeoff viewer 读 tracker 安装状态）**：尚未做，下一步可选。
- **2026-07-13 第四轮（两份同改，?v=20260713d）**：① **Vertical (X) 料件 = Vertical (Lv)
  同款**（用户确认）：BE9-3910/AS-3906/E9-1206/A-Pocket-Filler(×2占位) 加 'Vertical (X)'
  角色，unresolved 消除。② **"↔ 连续"开关进 UI**：Parts Database 每行 roles 前的虚线
  chip，点击切 `p.continuous`（=报表按整跑长度合并出料，C Face Cover 那套 contRuns 逻辑），
  开关随云端零件库同步（cleanParts 已保留字段）。
- **⚠ 云端零件库过期坑**：Firestore 的 750XT 文档是 7/10 播种的，systems.js 之后新加的
  Sill (normal)/Vertical (X) 角色、C 的 continuous 在云端都没有，且每次开页云端覆盖本地。
  cloud-sync 只补种"整个系统缺失"。**最快修法：Firebase Console → Firestore → systems →
  删除 '750XT' 文档 → 重新打开 takeoff 页 → 自动用最新 systems.js 补种**（该文档没有用户
  手工改动时是安全的）。以后 systems.js 改角色都要记得这一步，或直接在页面 UI 里点
  chip 改（会推上云）。
- **2026-07-13 第三轮：方向转变 + Add Role（两份同改，?v=20260713c）**。用户明确：不再让
  Claude 迭代识别算法（太耗 token 且图纸变体多），改为**把手动改 role 做顺**：
  ① 报表角色层加 **"+ Add Role"** 按钮 → `state.customRoles[]`（localStorage，不进云；
  角色挂上 part 后随 parts 云同步）→ POSITIONS_LIST 并入 → viewer 点料的"位置"下拉、
  角色表即时可用；空角色也显示在角色表，可用 "+ 加入 part…" 挂零件。
  ② 未映射/自定义角色 viewer 配色：按名称哈希从 8 色备用板取色（不再一律灰）。
  ③ 修复 SF11/12 "一整面元素"：导出 boards 过滤加 h≤12（整面 scope/backer structural
  矩形不再变成盖住全脸的 panel 元素）。east 实测无巨型。
  ④ 遗留：用户手里的 east.dxf 已更新（有 SF13/SF14），我方挂载快照还是旧的——louver
  元素缺失问题等文件同步后再看，或用户在 tracker Edit layout 里手动把格子改成 louver。
  Vertical (X) 料件仍等 xlsx（坏快照）。用户 fab-drawing 想法：从 cut ticket 起步（见对话）。
- **2026-07-13 第二轮：金属板带(IMP)语义 + Sill (normal) + C 连续跑长（两份同改）**。
  发现：AC3 图纸的 IMP 板带 = **扁长条 HATCH**（h≤12" w≥20"；AF_HATCH=普通金属板，
  AF_GENERAL=后有钢梁——图层天然区分单/双绿点）；大块 hatch = by-others 开口区。
  规则（全部 750XT-gated）：① 板带上沿那排横料 = **Sill (normal)**（新 position，青
  #00bcd4，料件 BE9-3904/E9-3162/AS-3907/E9-1206/E1-3603/E2-0513，用户口述，xlsx 坏快照
  没读到原文）② 带下沿那排 = Head（黄）③ 穿带竖梃拆 **蓝粉蓝** 三段：带段 →
  Vertical (X)/Jamb (X)/Vertical (wide X) ④ 板带须在主 sill 之上（竖件底端众数），
  louver 带重叠的条跳过 ⑤ 多条带按 y 重叠分组逐带处理。**Vertical (X) 的料件清单
  还没有**（xlsx 挂载快照损坏读不到）→ 报表会显示 1 条 unresolved，等 xlsx 可读或
  用户口述后补进 systems.js（两份）。
  **C (Face Cover) 连续跑长**：systems.js 部件加 `continuous: true` → buildReport 里
  同排相邻 sill 段合并（缝隙≤8"）按整跑长度出料（subsill 同逻辑）；cloud-sync 的
  cleanParts/applySystemsDocs 保留该标记。SF01 实测 C = 2×100.5"。
  **导出**：板带格子 → panel 元素；by-others 大块 hatch 内格子不出元素。
  SF01 终态：Head18 / Sill(normal)9 / Sill8 / Hor7 / HorX1 / Jamb6 / JambX4(含边框带段
  2×9") / Vertical12 / VerticalX4×9" / C跑长2×100.5，south 13 立面零退化。
  基线未重存（等 Vertical (X) 料件定了再存）。脚本缓存 ?v=20260713b。
- **2026-07-13：SF01（01.dxf）修复——by-others 开口语义（两份同改，dxfDetectCuts）**。
  用户给出正确答案图对照，root cause 三连：① 01.dxf 无门块 → 几何 fallback 门检测把
  "底部无 sill"的 bay 全判成门（地面基准被开口的地下延伸拉低）→ Door Jamb ×14 灾难；
  ② sill/head 全局"最值两档"在分区立面判错；③ (X) 的真正语义 = **贴 by-others 开口/
  面板的 pocket 条件**（louver 只是其一；maisonette window 同理，见 2.png 右侧）。
  修法（全部 gate 在 system==='750XT'，Hillview 行为不变）：地面/sill/head 基准改用
  **竖件端点众数**；无门块时"无 sill 开口"= by-others 开口：伸到地面下的开口侧竖梃
  = Jamb (X) 整根、开口上横档 = Horizontal (X)、head 行受保护不被吃；横料分类改**局部
  判定**——本跨竖件在此收头=Head、起脚=Sill、穿过=Horizontal（±3" 容差覆盖 4" 宽竖梃）。
  实测：SF01 与正确答案逐位置一致（Head14/Hor15/HorX1/Sill13/JambX2；Jamb/Vertical 有
  1-2 根全高竖料归属待用户在 viewer 确认），south 13 立面无退化，west/east 正常。
  新基线 `harness-baseline-20260713.json`（01+south+west+east 共 20 立面，件数+总长）。
  脚本缓存号已 bump 到 ?v=20260713（两份 index.html）。
- **同日第五轮修复（用户实测反馈，两份同改）**：
  ① **整版拆分**：聚类只认框料层（alum/doorSubframe/门块）。根因是 sill 下 layer-0 的
  grade LINE——`dxfPolylineSummary` 对 LINE 只读组码 10/20（起点），它成了 0×0 隐形点，
  正好落在两片立面中间把两边桥接。fallback/outline 层的件现在聚类后按 x 重叠归给最近
  立面（只进分类池，不扩 bbox）。south.dxf 现在 **13 openings**（SF07/SF08 也拆开了），
  各立面 bbox 略变小（不再含 grade line）——对 Hillview 图纸的影响未验证，下次跑 Hillview
  注意 bbox/Subsill 是否正常。
  ② **Sill (X)**：门立面里门框竖梃比窗台低，把 louver 带底横料挤出 sill 判定（错标
  Horizontal (X)）。750XT 现按"带内最低一排横料 = Sill (X)"纠正；门上横档不在带内不受影响。
  实测 4 个门立面 Sill(X) 全部归位，Horizontal (X) 只剩门上横档各 1 根。
  ③ **file:// 云连接**：firebase-init.js 从 `<script type="module">` 改成普通脚本+动态
  import（file:// 下 module 会被 CORS 拦掉 → __fb 不存在 → "→ Tracker" 报云端未连接、
  零件库只剩本地种子）。现在双击本地打开也能连 Firestore。

## 本轮（2026-07-19 ~ 2026-07-20）做了什么 — 详细版见 memory.md + takeoff/PROPAGATION-DESIGN.md §11-15

这轮主题是两条线：① 750XT IMP-1/gasket 识别准确性（takeoff 工具）② tracker 侧几个 UX 缺口。

**Takeoff 工具（`takeoff/app.js`，本轮最终 `?v=20260720b`）：**
- **§11 根因修复**：还原已保存的 elevEdits 快照时会掩盖新的自动分类结果（Layer A/B 白改）—
  已修复为"还原后重新跑分类"，并加了 drift 检测/警告。
- **§13 大返工**：Jamb/Vertical(IMP-1) 两阶段分类（整根未切分 + 已切分逐段都能正确识别）、
  gasket 三路径分离（imp1 infill / glass infill / perimeter 不再混算）、独立 storefront
  周长按 zone 分别算、boards 不再误计 gasket。10 项 harness 全过。
- **§14 SF01 数据丢失 + 修复**：自动重分类覆盖了 SF01 手工特例，**Firestore 无版本历史、
  确认不可恢复**（已告知 Leo）。修复：①`state.roleEdits` 手工覆盖现在是"pin"，任何自动
  重分类都不会再覆盖它 ②`elevEdits` 加 5 版历史（`persistElevEdits`/`restoreElevEditsVersion`），
  viewer 里有 "🕐 Version history" 一键恢复 ③ 未 pin 的漂移会在 viewer 显示橙色警告。
- **gasket 可视化**：viewer 加 "🧵 Gasket diagram" 开关，把 infill/perimeter 两种 gasket
  用虚线圈直接画在立面上，方便 Leo 目视核对算法——**gasket 数量他说"仍不准"但没给新目标值**，
  这是留给他核对用的工具，尚待他反馈具体哪里不对。
- **§15 FFD 下料图 + DXF 导出（本轮最新，两次迭代）**：Leo 要"看 FFD 摆料结果，每个 part
  在 24' 料上怎么排"。建了 `packFFDLayout`（保留摆料明细，之前 `packFFD` 只返回根数）+
  `buildOpeningPacking(o)`（**按单个立面**摆料，不跨立面汇总——注意这跟报表里"按 part
  汇总下单"的 `buildReport()`/`packFFD` 是两套视图，根数天然不同，是设计如此）。
  viewer 新增 "📏 Cutting diagram" 开关 + 每立面 "⬇ Export DXF"，工具栏加
  "Cutting DXF (all elevations)" 批量导出（逐个触发下载，没加 zip 依赖）。
  **第二次迭代**（Leo 看完图后要求）：断点标记从细 tick 线改成 **2.5" 宽的空心矩形框**
  （`CUT_RECT_WIDTH`/`stickCutRects`），并在每摞料左边标 part number、每行左边标料号
  （stick 1/2/3…）——DXF 里对应加了 `TEXT` 实体。拼接超长料仍按 Leo 原话"不用特殊展示"，
  静默处理成一根不切的整料线。两版都有 Node harness 回归（21 + 32 项全过）。
  **Leo 还没看过这版效果，下一步是等他确认这个下料图/DXF 是否符合预期。**

**Tracker（root `app.js`，本轮 `?v=20260720a`，**CORE 文件，待同步 CP2**）：**
- Calendar tab 的 Glass/Metal Panel/Louver/Doors 几个 rollup 行（之前是纯只读、提示去
  Elevation tab 改）现在加了状态下拉 + 日期 + "Apply to all" 按钮，可以直接在 Calendar tab
  批量把某个 scope 的所有构件设成同一状态/日期（`applyCalendarBulkScope`）——刻意做成独立
  按钮，不挂在弹窗主 Save 上，避免误触批量覆盖个体进度。

**CP2 核对（花了不少 token 但结论是好消息）：**
- Leo 反馈 CP2 本地看不到新功能、立面点了没反应，怀疑 core 没同步。**核对下来 7 个 CORE
  文件其实早就一致**——最初 bash md5sum 报的"7 个都不同"是**假阳性**：这个 session 的 bash
  沙盒对 AC3 这个 OneDrive 文件夹的挂载缓存是旧的/被截断的（不止 app.js，文件夹里几乎每个
  文件都中招），拿 bash 读到的内容去比较自然全错。改用 subagent 配合 Read 工具（不走 bash）
  重新核对后，6/7 文件字节级一致，唯一真实差异是 `api/parse.js` 缺 `'in-progress'` 状态项
  （已修复）。
- **真正的缺口是 `index.html`**（PROJECT 文件，SYNC.md 规定不能整份复制）：CP2 缺 RFI tab、
  Calendar tab 容器、Takeoff Tool 入口，FEATURES.md 上 F-023~F-030 对 CP2 全是 ⬜——包括
  F-030 elev-cloud Firestore 直连。CP2 也**完全没有 `elevations.js` 文件**，这才是"点立面
  没反应"的真正原因（没有任何几何数据可点）。
  **Leo 的决定：CP2 不需要立面功能，维持原来的简化版结构即可**——已在两边 memory.md /
  FEATURES.md 记录，这条不用再查，除非 Leo 改主意。

## 当前待办 / 已知缺口

- [ ] **§13 遗留：`Horizontal (IMP-1&Glass)` 分类仍未建**——需要 Leo 给出明确判定规则
      （跟 `Horizontal (Glass&Glass)` 怎么区分），之前一次指示前后矛盾过，等他想清楚再动手。
- [ ] **Gasket 数量准确性未最终确认**——Leo 说"仍不准"但没给新的目标数字；已交付可视化
      工具（gasket diagram 开关）供他目测核对，具体哪里错还没反馈回来。
- [ ] **§15 下料图/DXF 导出（含最新的矩形断点+标签版本）Leo 还没验收**——下一次会话如果
      他提"下料图"相关反馈，先读 `takeoff/PROPAGATION-DESIGN.md` §15 了解现状再动手，避免
      重新设计已经确认过的部分。
- [ ] **root `app.js` 的 Calendar 批量编辑改动是 CORE 文件，还没同步 CP2**（连同这轮之前
      历史遗留的其他 CORE 差异——M2/M2-v2/M3/M4/M5/S3 等——都在这次 CP2 核对里已确认
      JS 层其实一致，只是 CP2 自己没做 index.html 改造去用这些功能，见上）。
- [ ] 老清单未变：贡献 PR 通知机制、把更新后的 AC3 推到 Hub 仓库、project-tracker-builder
      skill 模板重打包 v3、主题皮肤、AC3 批量生成全部 SF elevation、`warehouse.html` 未配
      AC3 数据——都还没做，优先级看 Leo。

## 环境备忘（本轮再次踩到，务必留意）

- **bash 沙盒对这个 OneDrive 文件夹的挂载会长期卡在旧快照**，本轮在 root `app.js` 和
  `takeoff/app.js` 上都各自踩到过（不同的截断点，且不止改过的文件——CP2 核对时发现
  AC3 文件夹里几乎每个文件在 bash 视角下都是截断的）。**只信 Read 工具的内容**；校验大文件
  语法时，用 subagent 跑"逐段 Read 拼出真实内容→写到 outputs 暂存区→node --check"，
  不要直接信 bash 里 `cat`/`wc`/`node --check` 对原路径的结果。
- 两个项目的 `EDITING.lock` 目前都已清空（本次交接时确认过），新会话可以直接开始改动，
  但仍要照 CLAUDE.md 的规矩：改前查锁、写锁、改完删锁。
- 版本号现状：root tracker `app.js?v=20260720a`；`takeoff/app.js?v=20260720b`——
  两边都**还没推 GitHub**，只在本地/OneDrive，Leo 要看到线上效果需要自己 push 部署。
- 编辑锁协议在两个项目的 CLAUDE.md，必须遵守（改文件前写 EDITING.lock，改完删）。
- 老板/其他 PM 也在用各自 Claude 会话，动 core 前看锁、打招呼；core 改完要同步所有 tracker + md5 校验。
- GitHub 是代码真相，Firebase（各项目独立）是数据真相；OneDrive 只是协作入口，会产生冲突/截断副本。

## 怎么加一种新的 unit 类型（F-051）

不用改代码，也不用部署：

1. 顶部 **⚙** → 面板底部 **🔷 Unit types…**
2. **+ Add type**，填四样：
   - **Name** —— 图例上显示的名字，例如 `Hollow metal door`
   - **Id starts with** —— 编号前缀，例如 `HM`（其实是正则，`^` 可省略；大小写不敏感）
   - **形状 / 颜色** —— 6 种形状 × 8 种描边色，都是挑好的
   - **Badge**（可选）—— marker 角上的两字标记，例如 `HM`
3. **Save**。立刻生效，并同步给所有登录的人；平面图图例会自动多出这一项。

几条要知道的规矩：
- **填充色永远是安装状态**（绿=已装、黄=就绪、红=问题、灰=待装），类型只改形状/描边/徽标 —— 所以一眼还是先看得出装没装。
- 前缀命中就自动归类；某个 unit 想例外，打开它的弹窗 → Calendar tab → **Unit type** 下拉手动指定（下拉里会写明"自动会判成什么"）。
- 删掉一个类型，对应的 marker 会退回普通圆点，数据不会丢。
- 内置的三种（外部 storefront 圆形 / IS 菱形 / 门 方形）删不掉，但可以用同前缀的自定义类型盖过去。
- 想让某个类型跟着仓库走（新克隆的 tracker 也自带），把它写进 `project-config.js` 的 `unitTypes`；界面上加的存在云端。
