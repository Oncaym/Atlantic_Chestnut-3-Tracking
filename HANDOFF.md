# HANDOFF — 给下一个 Claude 会话 / 模型的交接（2026-07-06, Fable 最后一班）

先读 CLAUDE.md（背景+规矩）和 SYNC.md（core 同步铁律），再读这份。
这份回答"接下来做什么、怎么做、坑在哪"。

## 现状一句话

AC3 + CP2 两个 tracker 共享 md5 一致的 core（app.js/app-log.js/cloud-sync.js/
chat.html/api/parse.js），项目差异在各自 project-config.js；带证据层、R.O. tab、
日间模式、⚙ Modules 开关、每日备份 Action、sync.html（core 对齐）、
new-project.html（建新项目向导）。功能台账 FEATURES.md（F-001~F-020）。

## Q&A（用户会这么问，你应该这么答/做）

**Q: 改功能要注意什么？**
A: 分清楚改的是 core 还是项目件（SYNC.md 有清单）。core 改完必须原样复制到所有
tracker 并 md5 校验；上锁 EDITING.lock → 改 → 测 → 删锁。用户不懂代码，别让他做判断。

**Q: 数据坏了/看到别的项目的数据？**
A: 云端是唯一真相。先 Edit History 留底 → Firebase Console 删 /state → 重播种 →
Import 备份。备份在 GitHub repo 的 backups/（每日 Action）。别点旧版 Reset——
现在的 Reset 已经安全（F-013），但部署没跟上的环境可能还是老的。

**Q: 文件读出来是截断的/乱的？**
A: 已知环境坑：Cowork 的 VM 挂载视图对"宿主侧 Edit 过且变大的文件"会按旧尺寸截断。
bash 里 wc/grep 到的可能是假的。**以 Read 工具（宿主侧）为准**；要在 VM 里处理大文件，
用"VM 截断视图 + Read 读尾部拼接"或从 GitHub 取。VM 侧 bash 写入则会完整落盘。

**Q: OneDrive 和 GitHub 谁是代码真相？**
A: GitHub。OneDrive 只是协作入口，会悄悄产生截断/冲突副本（今天就发生过 index.html
被截尾）。改完代码尽快推 GitHub；两个项目各自的 repo 各自推。

**Q: 用户说"太复杂了"？**
A: 他要的是"小学生能懂"。比喻库：core=发动机，project-config=每个工地自己的名单，
sync.html=对一对按钮，⚙=电灯开关，向导=复印机。别堆术语。

## 任务 1：AC3 批量生成全部 SF 的 elevation（用户明确要做）

目标：不再一张图一张图喂 chat（费 token）。工具已写好：**tools/dxf2elevations.py**
（⚠ 未用真实 DXF 验证过——合成 DXF 冒烟通过）。

工作流：
1. 让用户把所有 shop drawing DXF 放进一个文件夹（每张图上有 SF 编号文字）
2. 先跑**一张**：`python tools/dxf2elevations.py <folder> --out review.js`，
   与 elevations.js 里手工做的 SF01 对比，调参（常见要调：图层→颜色映射、
   文字大小阈值、矩形判定容差、viewBox 缩放）
3. 满意后整批跑，`--merge elevations.js`（自动 .bak）
4. 分类不求全对——app 里点元素弹窗改类型（F-009）比调脚本便宜
5. elevations.js 是**项目件**，只进 AC3，不同步 CP2

如果用户只有 PDF/图片没有 DXF：退回让 Claude 看图生成，但一次 batch 多张 +
只输出 JSON（省 token 的关键是别让 Claude 复述几何，直接产出 elements 数组）。

## 任务 2：Tracker 主题皮肤（用户觉得单调）

设计规格（照此实现即可）：
- 机制已就绪：CSS 变量 + body class。把现有 day-mode 泛化成 `body[data-theme="X"]`
- 建议预设 4-5 套：midnight（现状）、day（现状）、slate（蓝灰）、amber（暖工地色）、
  contrast（高对比工地强光可读）。每套只需覆盖 :root 那 13 个变量 + header 渐变
- 选择器放进 ⚙ Modules 弹窗（F-019）底部：下拉选主题，存 localStorage
  `<code>_theme`（沿用现有键），**不进云端 state**（主题是个人偏好，不是团队数据）
- 图表颜色已通过 chartTickColor() 等函数走主题（改成读 CSS 变量更彻底）
- CSS 属于 index.html（混合件）：两个项目各贴一份；切换逻辑属于 core
- 注意 plan-img 的 invert 滤镜：亮色主题要 filter:none（day-mode 已有先例）

## 任务 3（背景任务）：skill 更新

`project-tracker-builder` skill 的模板还是 core/config 分离**之前**的老代码。
按现在的架构重打包 v3（模板=现 core + 通用 project-config + new-project.html +
sync.html + SYNC/FEATURES 模板），发给其他 PM 才是最新的。

## 环境备忘

- 编辑锁协议在两个项目的 CLAUDE.md，必须遵守
- 老板（上司）也在用自己的 Claude 会话改东西，动 core 前看一眼锁、打个招呼
- 测试基建：jsdom（npm i jsdom），/tmp 会被清，测试脚本模式见本次会话
  （boot 两项目断言 units/keys/i18n/tab/theme/filter）
