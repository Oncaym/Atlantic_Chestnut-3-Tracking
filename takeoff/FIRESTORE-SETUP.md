# Firestore 云端开通 / rules (一次性) — takeoff shared library + elevations

takeoff tool 的共享零件库（`systems`）、立面几何（`elevGeo`）、立面手动修正（`elevEdits`）
都挂在 **AC3 项目 (atlantic-chestnut-3) 的 Firestore** 上（tracker 用同项目的 Realtime
Database；Firestore 放全公司共享数据）。

> ⚠️ **每加一个新集合，必须在 Console 里给它加一条规则，否则读写被静默拒绝。**
> `elevEdits`（#1 手动修正持久化）就是因为漏发规则，本地能存、线上 Vercel 存不进
> Firestore、换浏览器/重导入就全没了。

## 步骤

1. Firebase Console → 项目 **atlantic-chestnut-3** → **Firestore Database**（没有就先创建，
   模式 production）。
2. Firestore → **规则(Rules)** 页，粘贴并 **发布(Publish)**：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 共享零件库：systems 集合（零件号/角色规则，非敏感）。takeoff 页无登录，不要求 auth。
    match /systems/{doc} {
      allow read, write: if true;
    }
    // 立面几何：takeoff "→ Tracker" 写入，tracker 的 elev-cloud.js 读取。
    match /elevGeo/{doc} {
      allow read, write: if true;
    }
    // 立面手动修正（拆件/改角色/长度等）：Elevation Viewer 写入，重导入时按几何签名读回。
    // 跨浏览器/Vercel 共享（#1，2026-07-15）。★ 漏发这条 = 线上持久化失效。
    match /elevEdits/{doc} {
      allow read, write: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. 打开 takeoff 页，顶部状态变 "● Synced/已同步" 即成功。

## 备注

- 发布规则前做的手动修正只存在**本地 localStorage**（且是按 origin 分的：本地 build 与
  Vercel 是两个 origin，互不可见）。发布规则后，**重新做一次编辑**即会写入 Firestore 并
  跨端可见；旧的本地修正不会自动回填（除非加一次性迁移，见 `SONNET-HANDOFF.md`）。
- `openings`（下料输入）只存本地浏览器，不进云。
- RTDB（tracker 进度）与 Firestore（零件库/立面）互不干扰。
