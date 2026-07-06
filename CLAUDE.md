# AC3 Tracker — Claude 会话交接文件 / Session Handoff

> 这个文件的作用：任何人（Leo、上司、其他 PM）在自己的 Claude/Cowork 会话里挂载这个文件夹后，
> Claude 读到这里就能接上全部背景，不需要重新解释项目。改动项目前先读完本文件。

## 项目是什么

Atlantic-Chestnut Building 3（Monadnock）的**幕墙/storefront 安装进度看板**。
纯静态 HTML + Firebase 云同步，多人实时编辑，部署在 Vercel。
从 Cooper Park 2（CP2）的 tracker 复刻，界面/功能一致，scope 换成 AC3。

- Scope 基线：`AC3_Glass_Takeoff.xlsx`（图纸 A-330.00 Storefront Elevations）
- 17 个 storefront（SF01–SF17），74 vision lites + 9 doors，约 3,722 sf 玻璃
- Louver：SF01–SF14 有，SF15–SF17 是 window（无）

## 文件地图

| 文件 | 作用 | 能不能改 |
|---|---|---|
| `index.html` | 主看板（平面图、KPI、表格、时间线、图表） | UI 改动在这里 |
| `app.js` | 全部逻辑 + **scope 种子数据（第 ~517 行 SEED）** | scope 变更改这里 |
| `state.json` | 种子数据的 JSON 版（units / log / positions） | 与 app.js SEED 保持同步 |
| `cloud-sync.js` | Firebase 同步引擎 | **不要改** |
| `firebase-config.js` | Firebase 项目密钥（占位状态 = 本地模式） | 部署时填真实值 |
| `firebase-database-rules.json` | 数据库安全规则 | 一般不动 |
| `chat.html` + `api/parse.js` | **自然语言更新器**：打字/说话描述工地变化，Claude API 解析成结构化更新（支持中/英/韩） | 需要 Vercel 环境变量 `ANTHROPIC_API_KEY` |
| `SF01-elevation.html`, `elevations.js` | 立面视图 | 按需扩展 SF02+ |
| `warehouse.html` | 仓库页（CP2 带过来的，还没配 AC3 数据） | 待配置 |
| `README.md` / `SETUP.md` | 部署说明（Firebase + Vercel，约 20 分钟） | 参考用 |
| `1.png` / `2.png` | 截图参考 | — |

## 数据模型（改数据必须遵守）

**Unit（每个 storefront）：**
```json
{
  "key": "SF01",          // 唯一 ID，永远不要改，云端数据靠它对齐
  "id": "SF01",           // 显示名，可改
  "type": "Storefront",
  "zone": "Lobby | Retail",
  "level": "GF",
  "status": "pending | in-progress | installed | issue",  // in-progress 界面显示为 "Ready"
  "date": "YYYY-MM-DD",   // 安装日期
  "louver": "yes | no | na",
  "note": "描述 · X Vision Lites +N Door · XXX sf",
  "glass": [],             // 玻璃板明细：panel# + status(pending/ready/installed/issue) + date
  "panels": []
}
```

**Log（每日日志 + 证据层）：** `{ date, category, categories[], content, planned?, photos[], ref?, party?, fault? }`
- category ∈ framing / glass / louver / caulking / issue / **fit-issue（尺寸冲突）/ field-verify（主动验证记录）/ gc-inquiry（书面往来）**
- 证据字段：`ref`（RFI/邮件/submittal 编号）、`party`（对方：GC/其他分包/工厂）、`fault`（归因）
- 检索：Daily Log 顶部的过滤框，多词=AND（如输入 "SF07 Monadnock" 直接调出该纠纷的全部记录）
- chat.html 说一句话也能录证据（parse.js 会自动提取 party/fault/ref）

**state.json 顶层：** `units`、`log`、`positions`（平面图标记坐标）、`updatedAt`。

## 关键规则

1. **云端是唯一真相。** Firebase 配置好之后，本地 HTML 里嵌的旧数据会被忽略。
   要重置数据：Firebase Console → Realtime Database → 删除 `/state`，下次打开会用 SEED 重新播种。
2. **`key` 不能改。** 改了会导致云端数据和标记位置对不上。改显示名用 `id`。
3. **Scope 变更要改两处：** `app.js` 的 SEED 数组 + `state.json`，保持一致。
4. **冲突策略是 last-save-wins。** 被覆盖的编辑在 Edit History（右上角用户菜单）里能查到。
5. **`firebase-config.js` 的 apiKey 不是机密**，安全靠 Auth + 数据库规则；自助注册已关闭，账号只能在 Firebase Console 手动添加。

## 编辑锁（防 OneDrive 冲突副本，Claude 必须遵守）

OneDrive 不会合并同时编辑，只会悄悄生成冲突副本。所以任何 Claude 会话在**修改本文件夹内任何文件之前**，必须走这个流程：

1. **先读 `EDITING.lock`**（在文件夹根目录）：
   - 文件不存在，或里面的 `started` 距现在超过 2 小时（视为残留）→ 可以编辑，进入第 2 步
   - 文件存在、2 小时内、且 `user` 不是当前用户 → **停下**，告诉用户："XX 正在编辑（从 HH:MM 开始），建议等 TA 完成，或先联系确认"。用户明确说继续才能继续。
2. **开始编辑前写入锁**：
   ```json
   { "user": "当前用户的名字或邮箱", "started": "2026-07-06T14:30:00", "note": "改了什么（一句话）" }
   ```
3. **全部改完后删除 `EDITING.lock`**。这一步不能忘，忘了会挡住对方 2 小时。

只读操作（查进度、看数据）不需要锁。注意：OneDrive 同步有几秒延迟，锁不是绝对保险，两人真的同一秒开工仍可能撞车——所以大改动（动 app.js / index.html）之前，最好还是招呼一声。

## 常用指令示例（对 Claude 说这些就行）

- "把 SF07 标成 installed，日期今天，louver 装好了"
- "SF03 玻璃碎了一块，标 issue，加一条日志"
- "给我看还有哪些 unit 的 louver 没装"
- "把 takeoff 里 SF12 的数量更新一下，seed 和 state.json 都要改"
- "加一个新的立面视图 SF05，照着 SF01-elevation.html 做"

日常进度更新**优先用 chat.html**（部署后的 /chat 页面），现场打一句话就能更新，不用开 Claude。

## 当前待办 / 已知缺口

- [x] Firebase 已配置（项目 `atlantic-chestnut-3`），云端为唯一真相
- [ ] **每日备份 Action 需要配两个 GitHub secrets 才能生效**：repo Settings → Secrets →
  `FIREBASE_SERVICE_ACCOUNT`（Firebase Console → 项目设置 → 服务账号 → 生成新私钥，整个 JSON 贴入）
  和 `FIREBASE_DATABASE_URL`（https://atlantic-chestnut-3-default-rtdb.firebaseio.com）。
  配好后在 Actions 页手动 Run 一次验证。备份会提交到 repo 的 `backups/` 目录。
- [ ] PDF 卷宗导出（按 unit/纠纷把相关日志+照片导出成一份 PDF，索赔用）
- [x] Unit modal 已加 "Field Verify · R.O." tab：每 unit 存 `u.ro = [{date, stage(R.O. measure/Order check/Site check), dims, by, tol(ok/out)}]`，
  新增测量自动生成一条 field-verify 日志（**不带 auto 标记**——auto 会被 app-log.js 的投影引擎重写，改这块前注意）
- [ ] Procore submittal 抓取：必须走 serverless（照 api/parse.js 模式），token 放 Vercel 环境变量，定时写入 /submittals 节点，**绝不能把 token 放进前端**
- [ ] `warehouse.html` 尚未配 AC3 数据（没人用就别配）
- [ ] 立面视图逐个按需生成（哪个 unit 开始出问题再做哪个）

## 近期变更备忘（2026-07-06）

- Reset 按钮云模式下已改为"从云端重拉"，不会再覆盖共享数据
- 立面：新增 Frame 状态按钮；点门 marker 显示所属 SF 整面；改类型走弹窗下拉（不再循环点击）；hidden 元素彻底不显示（数据还在，要恢复让 Claude 改 state.elevations）
- 玻璃/金属板不再额外描边，用图纸本身的框线

## 给新协作者（比如你，老板）

你不需要懂代码。挂载这个文件夹，直接用中文告诉 Claude 你要什么——
改状态、查进度、调界面、加功能都行。Claude 会读这份文件知道规矩。
唯一提醒：改完东西 OneDrive 会自动同步，Leo 那边刷新就能看到。
