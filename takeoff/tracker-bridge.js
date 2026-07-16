// ============================================================
//  tracker-bridge.js  (classic script, load AFTER app.js)
//  Receives a DXF handed off from the tracker (index.html "⬆ Import DXF"):
//  the tracker stages {name, text} in IndexedDB (db af_dxf_handoff /
//  store files / key "pending") and navigates here; on load we consume
//  the record and run the exact same parse path as the tool's own
//  "Import DXF" button (parseRawDxfOpenings → appendParsedOpenings).
//  No app.js behavior is modified.
// ============================================================
(function () {
  var DB = 'af_dxf_handoff', STORE = 'files', KEY = 'pending';
  var MAX_AGE_MS = 15 * 60 * 1000; // ignore stale handoffs (>15 min)

  function readAndClearPending() {
    return new Promise(function (resolve) {
      if (!window.indexedDB) return resolve(null);
      var req;
      try { req = indexedDB.open(DB, 1); } catch (e) { return resolve(null); }
      req.onupgradeneeded = function () {
        try { req.result.createObjectStore(STORE); } catch (e) {}
      };
      req.onerror = function () { resolve(null); };
      req.onsuccess = function () {
        var db = req.result;
        try {
          var tx = db.transaction(STORE, 'readwrite');
          var st = tx.objectStore(STORE);
          var g = st.get(KEY);
          g.onsuccess = function () {
            var v = g.result || null;
            try { st.delete(KEY); } catch (e) {}
            tx.oncomplete = function () { db.close(); resolve(v); };
            tx.onerror = function () { db.close(); resolve(v); };
          };
          g.onerror = function () { db.close(); resolve(null); };
        } catch (e) { db.close(); resolve(null); }
      };
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Registered after app.js's DOMContentLoaded listener → runs after init().
    readAndClearPending().then(function (pend) {
      if (!pend || !pend.text) return;
      if (pend.ts && (Date.now() - pend.ts) > MAX_AGE_MS) return;
      var statusEl = document.getElementById('dxf-status');
      if (statusEl) { statusEl.textContent = 'Loading ' + (pend.name || 'DXF') + '…'; statusEl.className = 'tk-dxf__status'; }
      // Same flow as onDxfFileChange (app.js): geometry parse first, text fallback.
      var result = null;
      if (pend.text.indexOf('SECTION') !== -1 && pend.text.indexOf('ENTITIES') !== -1) {
        try { result = parseRawDxfOpenings(pend.text); }
        catch (e) { console.warn('DXF geometry parse failed, falling back to text:', e); }
      }
      if (!result || !result.openings || !result.openings.length) result = parseDxfText(pend.text);
      Promise.resolve(appendParsedOpenings(result)).then(function () {
        if (statusEl) statusEl.textContent = (pend.name || 'DXF') + ': ' + statusEl.textContent;
        // M2: if the tracker staged this import (its "Import DXF" button), hop back once
        // the headless parse + auto-push (inside appendParsedOpenings) has completed.
        if (localStorage.getItem('af_dxf_return')) {
          localStorage.removeItem('af_dxf_return');
          setTimeout(function () { location.href = '../index.html'; }, 600);
        }
      }).catch(function (e) {
        console.error('tracker-bridge append failed:', e);
        if (statusEl) { statusEl.textContent = 'Could not import ' + (pend.name || 'DXF'); statusEl.className = 'tk-dxf__status is-err'; }
      });
    });
  });
})();
