// ============================================================
//  elev-cloud.js — 立面几何云端读取（项目文件，非 core）
//  takeoff 页（takeoff/ 的 "→ Tracker" 按钮）把每个 unit 的立面几何写进
//  同一 Firebase 项目的 Firestore `elevGeo` 集合（文档 id = unit 显示 id，
//  如 "SF04.1"）。这里实时订阅并合并进 window.ELEVATIONS——云端条目覆盖
//  elevations.js 里的同名静态条目。导入新 DXF 不再需要改文件/重新部署。
//  依赖：index.html 里 firebase-firestore-compat.js 在本文件之前加载；
//  firebase app 由 cloud-sync.js 初始化（这里只等待复用，绝不自己 init）。
//  安装状态仍存 RTDB 的 state.elevations（app.js 原逻辑），互不干扰。
// ============================================================
(function () {
  var tries = 0;
  function start() {
    if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length || !firebase.firestore) {
      if (++tries > 100) return;                 // ~30s 后放弃（本地模式/未配置）
      return setTimeout(start, 300);
    }
    try {
      firebase.firestore().collection('elevGeo').onSnapshot(function (snap) {
        var EL = window.ELEVATIONS = window.ELEVATIONS || {};
        var got = 0;
        snap.forEach(function (d) {
          var v = d.data() || {};
          if (v.viewBox && v.elements) { EL[d.id] = v; got++; }
        });
        if (got) console.log('[elevGeo] loaded ' + got + ' cloud elevations');
      }, function (err) {
        console.warn('[elevGeo] offline (Firestore 未开通? 见 takeoff tool/FIRESTORE-SETUP.md):', err && err.code);
      });
    } catch (e) { console.warn('[elevGeo] init failed:', e); }
  }
  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
