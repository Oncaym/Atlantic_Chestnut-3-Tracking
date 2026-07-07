# Hub 配置指南 / Tracker Core Hub Setup

这份文档给 **Hub 维护者**（Leo）看，讲一次性把"权威 core 仓库（Hub）"搭起来，
以及打通"贡献回 Hub（自动发 PR）"的流程。日常用户不用读这个，读 `SYNC.md` 即可。

## 概念

- **Hub** 是一个**公开（public）**的 GitHub 仓库，里面放**祝福过的 core 文件**
  （app.js / app-log.js / cloud-sync.js / chat.html / api/parse.js / .github/... 等）、
  模板/脚手架文件，以及 `FEATURES.md`（功能台账）。
- 各个项目（AC3、CP2、AC4…）通过 `sync.html` 的**云端模式**从 Hub 拉最新 core。
- 读 Hub 只需 `raw.githubusercontent.com`，**无需登录、无需 token**——所以 Hub 必须是 public。
- **贡献回 Hub**（写操作 = 开 PR）需要 token。token **绝不能进前端**，
  所以走一个 serverless 端点 `api/contribute`，token 存在服务端环境变量里。

---

## 一、创建 Hub 仓库（一次性）

1. 在 GitHub 新建一个 **public** 仓库，例如 `tracker-core-hub`。
2. 把祝福过的 core 文件 + 模板 + `FEATURES.md` 推上去。目录结构与项目一致
   （`app.js`、`api/parse.js`、`.github/workflows/backup.yml` … 保持相同相对路径，
   `sync.html` 的 `CORE_FILES` 列表按这些路径逐一比对）。
3. 记住三样：`owner`（账号/组织）、`repo`（仓库名）、`branch`（一般 `main`）。

## 二、让项目连上 Hub

打开 `project-sync.html`（合并后的单一工具：🔁 拉取/贡献 + 🏗 新建项目 两个分页，中/英/韩）：

1. 在顶部 **☁ Hub 仓库** 卡片，直接**粘贴 Hub 的 GitHub 链接**（形如
   `https://github.com/账号/仓库` 或 `.../tree/分支`）→ 自动解析 owner/repo/branch → 点 **💾 记住**
   （存进浏览器 localStorage 的 `tracker_hub`）。不用手输 owner/repo。
2. 「🔁 拉取/贡献」页选自己的 tracker 文件夹 → 自动比对 core 差异 + 功能差异。
3. 勾选要更新的 core 文件 → **拉取到本地**（项目件 project-config / state / index 永不被触碰）。
4. 「🏗 新建项目」页复用同一个 Hub，直接从云端拉模板生成新项目。

## 三、打通"贡献回 Hub"（自动发 PR，可选但推荐）

写操作要 token，所以把 `api/contribute` 部署成 serverless 端点：

1. **部署**：把 Hub 仓库（或一个小的配套仓库）部署到 **Vercel**。
   `api/contribute.js` 与 `api/parse.js` 是同一种 serverless 函数，部署方式一致。
   部署后端点地址形如 `https://your-hub.vercel.app/api/contribute`。
2. **配 token**：在 Vercel 项目 Settings → Environment Variables 里加：
   - `GITHUB_HUB_TOKEN` = 一个**细粒度 Personal Access Token**（Fine-grained PAT）
     或 GitHub App 安装 token。
   - 权限：**Contents: write** + **Pull requests: write**。
   - **Repository access：只勾选 Hub 这一个仓库**，别给它别的仓库权限。
   - 这个 token 只存在服务端，端点代码从不打印、从不返回它。
3. **填端点地址**：在 `project-sync.html` 顶部 Hub 卡片的 **贡献端点 URL (contribUrl)** 栏，
   填入 `https://your-hub.vercel.app/api/contribute` → 记住。
   （因为页面从 `file://` 打开，这里必须是**已部署端点的绝对地址**。）

### 没配端点也能贡献（降级方案）
如果 `contribUrl` 留空：点"📤 贡献回 Hub"会**下载一个手动打包文件**
（把每个改动的 core 文件用 `===== path =====` 头拼在一起）。
把这个文件发给 Hub 维护者，由 TA 手动开 PR。功能不阻断，只是不自动。

## 四、贡献 / 审核流程

1. 项目里某人改进了 core、或加了新功能（在 `FEATURES.md` 登记为本地独有的 `F-0XX`）。
2. 他在 `sync.html` 云端模式扫描后，会看到"📤 贡献回 Hub"按钮
   （出现条件：本地 core 与 Hub 有分歧，或存在 Hub 没有的本地功能 ID）。
3. 点按钮 → 端点用 Hub token 在 Hub 仓库开一个分支 `contrib/<项目>-<时间戳>` 并发起 PR。
4. **维护者（你）在 GitHub 上审核 PR**，看 diff，决定合并或退回。
5. 合并后，所有项目再用 `sync.html` 云端模式拉最新 core，即可同步到这次改动。

## 五、`api/contribute` 请求 / 响应约定

- **请求** `POST`，JSON：
  ```json
  {
    "hub":        { "owner": "advfacade", "repo": "tracker-core-hub", "branch": "main" },
    "files":      [ { "path": "app.js", "content": "…完整文本…" } ],
    "featureIds": [ "F-012" ],
    "project":    "AC4",
    "author":     "someone@x.com"
  }
  ```
- **成功** `200`：`{ "url": "<PR 链接>", "branch": "contrib/ac4-<时间戳>" }`
- **错误**：`400` 入参不合法（files 空 / 缺 owner|repo）；
  `500` `{ "error": "GITHUB_HUB_TOKEN not configured" }` 或未预期错误；
  `502` GitHub API 返回的错误。

## 六、注意事项（换行符）

Git 可能在提交时规范化换行符（CRLF ↔ LF）。这会让本地文件与 Hub 版本的哈希对不上，
`sync.html` 会显示"有更新"即使内容其实一样。**从云端拉取一次**，本地就会与 Hub 对齐，
之后哈希比对恢复正常。首次接入 Hub 或换机器时留意这一点即可。
