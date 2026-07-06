/* ============================================================
   CP2 Cloud Sync — Firebase Auth + Realtime DB
   ============================================================
   What this does:
   - Gates the whole app behind a Firebase Auth login (email/password).
     Only emails you create in the Firebase Console can sign in.
   - Mirrors `window.state` into Firebase Realtime DB at /state.
     When anyone saves, every other open browser updates within ~1s.
   - Writes a row to /history every save (who, when, what).
   - Last write wins. No locking, no merge — the simple model.

   How it plugs in:
   - The HTML calls window.CloudSync.init(firebaseConfig) at startup.
   - Existing code keeps calling saveState() — that triggers a push
     via a monkey-patch added at the bottom of this file.
   - Remote changes call window._cloudApplyRemoteState(remoteState)
     which replaces window.state and re-renders.
   ============================================================ */

(() => {
  // Unique per browser tab — used to ignore our own echo from Firebase.
  const CLIENT_ID = Math.random().toString(36).slice(2, 10);

  let auth = null;
  let db = null;
  let currentUser = null;

  let suppressNextSave = false;   // true while applying a remote snapshot (don't push it back)
  let pendingState = null;         // debounced push buffer
  let pushTimer = null;
  let lastDescription = null;      // optional description passed to next push (for history)

  // Read-only mode: user is signed in but not in the /allowlist node.
  // We detect this via a permission_denied error on the first state read
  // (or on the presence write). When true, any saveState() attempt is
  // intercepted: we toast the user and revert local state to the last
  // known cloud snapshot.
  let isReadOnly = false;
  let lastRemoteSnapshot = null;   // last good remote state (for revert)

  // ---------- Public API ----------
  window.CloudSync = {
    init(config) {
      if (!config || !config.apiKey || /PASTE|YOUR_|XXXXX/i.test(config.apiKey)) {
        showSetupBanner();
        return;
      }
      try {
        firebase.initializeApp(config);
      } catch (e) {
        if (!/already exists/.test(e.message)) console.error(e);
      }
      auth = firebase.auth();
      db = firebase.database();
      auth.onAuthStateChanged(onAuthChanged);
      buildAuthGate();
    },
    // Call this RIGHT BEFORE saveState() to label the change.
    // e.g. CloudSync.describe('Updated SF06N → installed')
    describe(text) { lastDescription = text; },
    // Force-flush any pending push immediately
    flush() { if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; flushPush(); } },
    isSignedIn() { return !!currentUser; },
    currentUser() { return currentUser; },
    isReadOnly() { return isReadOnly; },
    logout() { if (auth) auth.signOut(); },
    openHistory() { openHistoryPanel(); },
  };

  // ---------- Auth gate UI ----------
  function buildAuthGate() {
    if (document.getElementById('cs-auth-gate')) return;
    const gate = document.createElement('div');
    gate.id = 'cs-auth-gate';
    gate.innerHTML = `
      <div class="cs-auth-card">
        <div class="cs-auth-brand">
          <div class="cs-auth-logo">CP2</div>
          <div>
            <div class="cs-auth-title">Atlantic-Chestnut Building 3</div>
            <div class="cs-auth-sub">Installation Progress Monitor</div>
          </div>
        </div>
        <form id="cs-auth-form" autocomplete="on">
          <label>
            <span>Email</span>
            <input type="email" id="cs-email" required autocomplete="email" placeholder="you@advfacade.com">
          </label>
          <label>
            <span>Password</span>
            <input type="password" id="cs-password" required autocomplete="current-password">
          </label>
          <div id="cs-auth-error" class="cs-auth-error"></div>
          <button type="submit" id="cs-auth-submit">Sign in</button>
          <button type="button" id="cs-auth-forgot">Forgot password</button>
        </form>
        <div class="cs-auth-foot">
          Accounts are created by your admin in Firebase Console.<br>
          No self-signup.
        </div>
      </div>
      <div class="cs-auth-bg"></div>
    `;
    document.body.appendChild(gate);

    document.getElementById('cs-auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('cs-email').value.trim();
      const pwd   = document.getElementById('cs-password').value;
      const errEl = document.getElementById('cs-auth-error');
      const btn   = document.getElementById('cs-auth-submit');
      errEl.textContent = '';
      btn.disabled = true; btn.textContent = 'Signing in…';
      try {
        await auth.signInWithEmailAndPassword(email, pwd);
      } catch (err) {
        errEl.textContent = humanAuthError(err);
        btn.disabled = false; btn.textContent = 'Sign in';
      }
    });
    document.getElementById('cs-auth-forgot').addEventListener('click', async () => {
      const email = document.getElementById('cs-email').value.trim();
      const errEl = document.getElementById('cs-auth-error');
      if (!email) { errEl.textContent = 'Enter your email first.'; return; }
      try {
        await auth.sendPasswordResetEmail(email);
        errEl.style.color = '#3fb950';
        errEl.textContent = `Reset email sent to ${email}`;
      } catch (err) {
        errEl.style.color = '';
        errEl.textContent = humanAuthError(err);
      }
    });
  }

  function humanAuthError(err) {
    const code = (err && err.code) || '';
    if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential') || code.includes('invalid-login'))
      return 'Wrong email or password.';
    if (code.includes('too-many-requests'))
      return 'Too many attempts. Wait a few minutes.';
    if (code.includes('network'))
      return 'Network error. Check your connection.';
    if (code.includes('user-disabled'))
      return 'This account has been disabled.';
    return (err && err.message) || 'Sign-in failed.';
  }

  function showAuthGate() {
    const g = document.getElementById('cs-auth-gate');
    if (g) g.style.display = 'flex';
    document.body.classList.add('cs-locked');
  }
  function hideAuthGate() {
    const g = document.getElementById('cs-auth-gate');
    if (g) g.style.display = 'none';
    document.body.classList.remove('cs-locked');
  }
  function showFatal(msg) {
    const div = document.createElement('div');
    div.className = 'cs-fatal';
    div.textContent = msg;
    document.body.appendChild(div);
  }

  function showSetupBanner() {
    if (document.getElementById('cs-setup-banner')) return;
    const bar = document.createElement('div');
    bar.id = 'cs-setup-banner';
    bar.innerHTML = `
      <div class="cs-setup-inner">
        <span class="cs-setup-icon">⚙</span>
        <div class="cs-setup-body">
          <strong>Cloud sync not configured yet</strong>
          <span>Running in local-only mode. Open <code>firebase-config.js</code> and paste your Firebase project keys to enable team sync. See <code>SETUP.md</code>.</span>
        </div>
        <button class="cs-setup-dismiss">Dismiss</button>
      </div>
    `;
    document.body.appendChild(bar);
    bar.querySelector('.cs-setup-dismiss').addEventListener('click', () => bar.remove());
  }

  // ---------- Auth state changes ----------
  function onAuthChanged(user) {
    currentUser = user;
    if (user) {
      hideAuthGate();
      mountStatusBadge();
      updateBadge();
      subscribeToState();
      subscribeToPresence();
    } else {
      // Clear read-only flag + banner so the next sign-in starts clean.
      isReadOnly = false;
      lastRemoteSnapshot = null;
      hideReadOnlyBanner();
      unmountStatusBadge();
      showAuthGate();
      // Stop listening (Firebase auto-unsubs when ref handle is dropped, but be defensive)
      if (db) try { db.ref('state').off(); } catch(e){}
    }
  }

  // ---------- Header status badge ----------
  function mountStatusBadge() {
    if (document.getElementById('cs-status')) return;
    const actions = document.querySelector('.header-actions');
    if (!actions) return;
    const wrap = document.createElement('div');
    wrap.id = 'cs-status';
    wrap.className = 'cs-status';
    wrap.innerHTML = `
      <button class="cs-status-btn" id="cs-history-btn" title="View edit history">
        <span class="cs-dot" id="cs-conn-dot"></span>
        <span class="cs-status-text" id="cs-status-text">Connecting…</span>
      </button>
      <div class="cs-user-menu">
        <button class="cs-user-btn" id="cs-user-btn">
          <span class="cs-user-avatar" id="cs-user-avatar"></span>
          <span class="cs-user-email" id="cs-user-email"></span>
          <span class="cs-caret">▾</span>
        </button>
        <div class="cs-user-dropdown" id="cs-user-dropdown">
          <button data-action="history">📜 Edit history</button>
          <button data-action="presence">👥 Who's online</button>
          <button data-action="logout">↪ Sign out</button>
        </div>
      </div>
    `;
    // Insert at the start of header-actions (left of the lang switcher)
    actions.insertBefore(wrap, actions.firstChild);

    document.getElementById('cs-history-btn').addEventListener('click', openHistoryPanel);
    const userBtn = document.getElementById('cs-user-btn');
    const dropdown = document.getElementById('cs-user-dropdown');
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
    dropdown.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      dropdown.classList.remove('open');
      if (action === 'history') openHistoryPanel();
      if (action === 'presence') openPresencePanel();
      if (action === 'logout') auth.signOut();
    });
  }
  function unmountStatusBadge() {
    const el = document.getElementById('cs-status');
    if (el) el.remove();
  }
  function updateBadge() {
    if (!currentUser) return;
    const email = currentUser.email || '';
    const emailEl = document.getElementById('cs-user-email');
    const avEl = document.getElementById('cs-user-avatar');
    if (emailEl) emailEl.textContent = email.split('@')[0];
    if (avEl) {
      avEl.textContent = (email[0] || '?').toUpperCase();
      avEl.style.background = colorFromEmail(email);
    }
  }
  function setConnState(state) {
    const dot = document.getElementById('cs-conn-dot');
    const txt = document.getElementById('cs-status-text');
    if (!dot) return;
    dot.className = 'cs-dot ' + state;
    if (txt) {
      txt.textContent = state === 'live' ? 'Live' :
                        state === 'syncing' ? 'Syncing…' :
                        state === 'offline' ? 'Offline' : 'Connecting…';
    }
  }
  function colorFromEmail(email) {
    let h = 0;
    for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) % 360;
    return `hsl(${h}, 55%, 45%)`;
  }

  // ---------- State sync ----------
  function subscribeToState() {
    setConnState('connecting');
    const stateRef = db.ref('state');

    // Connection indicator
    db.ref('.info/connected').on('value', (snap) => {
      setConnState(snap.val() ? 'live' : 'offline');
    });

    stateRef.on('value', (snap) => {
      const remote = snap.val();
      if (!remote) {
        // First time anyone has touched this DB. Seed it with whatever
        // local state we have so the team has a starting point.
        if (window.state) {
          pushNow(window.state, 'Initialized cloud state from local snapshot');
        }
        return;
      }
      // Stash the cloud snapshot so we can revert read-only users to it.
      const { _clientId, _ts, _by, _desc, ...stateData } = remote;
      lastRemoteSnapshot = JSON.parse(JSON.stringify(stateData));

      // Our own echo — ignore.
      if (remote._clientId === CLIENT_ID) return;

      // Remote update from another client — replace local state.
      window._cloudApplyRemoteState(stateData, { by: _by, ts: _ts, desc: _desc });
    }, (err) => {
      console.error('Firebase state listen failed:', err);
      setConnState('offline');
      // PERMISSION_DENIED on /state means this account is not in /allowlist.
      // Flip into read-only mode so save attempts are blocked locally.
      if (err && (err.code === 'PERMISSION_DENIED' || /permission/i.test(err.message || ''))) {
        enterReadOnlyMode('Your account is not on the allowlist — read-only mode');
      }
    });
  }

  // ---------- Read-only mode ----------
  function enterReadOnlyMode(reason) {
    if (isReadOnly) return;
    isReadOnly = true;
    console.warn('[CloudSync] read-only mode:', reason);
    showReadOnlyBanner(reason);
    // Snapshot whatever the app currently has as the "good" baseline so
    // we have something to revert to even if we never got a cloud read.
    // (The HTML exposes its local `state` as `window.state` for this.)
    if (!lastRemoteSnapshot && window.state) {
      try {
        lastRemoteSnapshot = JSON.parse(JSON.stringify(window.state));
      } catch (e) {
        console.warn('[CloudSync] failed to snapshot baseline state:', e);
      }
    }
  }

  function showReadOnlyBanner(reason) {
    if (document.getElementById('cs-readonly-banner')) return;
    const bar = document.createElement('div');
    bar.id = 'cs-readonly-banner';
    bar.innerHTML = `
      <span class="cs-ro-icon">🔒</span>
      <span class="cs-ro-text">${escapeHtml(reason || 'Read-only mode — you do not have edit permission')}</span>
      <span class="cs-ro-hint">Ask an admin to add your email to the allowlist if you need to edit.</span>
    `;
    document.body.appendChild(bar);
  }
  function hideReadOnlyBanner() {
    const el = document.getElementById('cs-readonly-banner');
    if (el) el.remove();
  }

  // Called by the HTML's monkey-patched saveState() — debounces ~350ms.
  window._cloudQueuePush = function(state, description) {
    if (suppressNextSave) return;       // applying a remote update, don't echo
    if (!currentUser) return;            // not signed in, nothing to push

    // Read-only user — block the save and revert UI to the cloud snapshot.
    if (isReadOnly) {
      if (window.toast) window.toast('⚠ You do not have edit permission — changes were not saved');
      revertToCloudSnapshot();
      return;
    }

    pendingState = state;
    if (description) lastDescription = description;
    setConnState('syncing');
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(flushPush, 350);
  };

  function revertToCloudSnapshot() {
    if (!window._cloudApplyRemoteState) return;
    if (!lastRemoteSnapshot) {
      // We have no baseline at all (e.g. read-only user with no localStorage
      // history). Best we can do is warn — the UI will stay as-is until the
      // user reloads.
      console.warn('[CloudSync] cannot revert — no baseline snapshot. Reload to discard changes.');
      return;
    }
    // Deep-clone so the caller can't mutate our baseline by reference.
    const fresh = JSON.parse(JSON.stringify(lastRemoteSnapshot));
    window._cloudApplyRemoteState(fresh, { by: 'cloud', desc: '(reverted — no edit permission)' });
  }

  function flushPush() {
    pushTimer = null;
    if (!pendingState || !currentUser) return;
    const desc = lastDescription;
    lastDescription = null;
    pushNow(pendingState, desc);
    pendingState = null;
  }

  function pushNow(state, description) {
    const payload = Object.assign({}, state, {
      _clientId: CLIENT_ID,
      _ts: firebase.database.ServerValue.TIMESTAMP,
      _by: currentUser.email,
      _desc: description || null,
    });
    db.ref('state').set(payload).then(() => {
      setConnState('live');
      // Push history record
      db.ref('history').push({
        ts: firebase.database.ServerValue.TIMESTAMP,
        user: currentUser.email,
        desc: description || 'edit',
        snapshot: summarizeState(state),
      }).catch((e) => console.warn('History push failed', e));
    }).catch((err) => {
      console.error('State push failed:', err);
      setConnState('offline');
      // PERMISSION_DENIED here means the user is not allowed to write —
      // either removed from /allowlist mid-session, or never was.
      // Flip to read-only and revert their local changes.
      if (err && (err.code === 'PERMISSION_DENIED' || /permission/i.test(err.message || ''))) {
        enterReadOnlyMode('Your account is not on the allowlist — read-only mode');
        if (window.toast) window.toast('⚠ You do not have edit permission — changes were not saved');
        revertToCloudSnapshot();
        return;
      }
      // Surface to user
      if (window.toast) window.toast('⚠ Cloud save failed: ' + err.message);
    });
  }

  // Short numeric summary written into each history row so the panel
  // can show "29 installed · 4 issues · 12 logs" without re-loading state.
  function summarizeState(s) {
    if (!s || !s.units) return null;
    const counts = { installed: 0, ready: 0, issue: 0, pending: 0 };
    s.units.forEach(u => { if (counts[u.status] != null) counts[u.status]++; });
    return {
      units: s.units.length,
      installed: counts.installed,
      issues: counts.issue,
      log: (s.log || []).length,
    };
  }

  // The HTML implements _cloudApplyRemoteState (defined in the inline script)
  // — but provide a fallback in case the hook isn't installed.
  if (!window._cloudApplyRemoteState) {
    window._cloudApplyRemoteState = function(stateData, meta) {
      suppressNextSave = true;
      try {
        window.state = stateData;
        if (typeof window.render === 'function') window.render();
        if (window.toast && meta && meta.by) {
          window.toast(`↻ Updated by ${meta.by.split('@')[0]}`);
        }
      } finally {
        suppressNextSave = false;
      }
    };
  }
  // Expose suppress flag for the HTML hook
  window._cloudSetSuppress = (v) => { suppressNextSave = !!v; };
  window._cloudIsSuppressed = () => suppressNextSave;

  // ---------- Presence (who's online) ----------
  let presenceRef = null;
  function subscribeToPresence() {
    if (!currentUser) return;
    const id = currentUser.uid;
    presenceRef = db.ref('presence/' + id);
    db.ref('.info/connected').on('value', (snap) => {
      if (snap.val() === true) {
        presenceRef.onDisconnect().remove();
        presenceRef.set({
          email: currentUser.email,
          since: firebase.database.ServerValue.TIMESTAMP,
          clientId: CLIENT_ID,
        }).catch((err) => {
          // Writing presence failed → almost certainly not in /allowlist.
          // This is the fastest signal that this user is read-only.
          if (err && (err.code === 'PERMISSION_DENIED' || /permission/i.test(err.message || ''))) {
            enterReadOnlyMode('Your account is not on the allowlist — read-only mode');
          }
        });
      }
    });
  }

  function openPresencePanel() {
    openPanel('Who\'s online', async (body) => {
      body.innerHTML = '<div class="cs-panel-loading">Loading…</div>';
      db.ref('presence').once('value').then(snap => {
        const val = snap.val() || {};
        const users = Object.values(val);
        if (users.length === 0) {
          body.innerHTML = '<div class="cs-panel-empty">No one else online.</div>';
          return;
        }
        body.innerHTML = users.map(u => `
          <div class="cs-presence-row">
            <span class="cs-user-avatar" style="background:${colorFromEmail(u.email)}">${(u.email[0]||'?').toUpperCase()}</span>
            <span>${escapeHtml(u.email)}</span>
            <span class="cs-presence-since">since ${formatTime(u.since)}</span>
          </div>
        `).join('');
      });
    });
  }

  // ---------- History panel ----------
  function openHistoryPanel() {
    openPanel('Edit History', (body) => {
      body.innerHTML = '<div class="cs-panel-loading">Loading…</div>';
      db.ref('history').limitToLast(200).once('value').then(snap => {
        const val = snap.val() || {};
        const rows = Object.entries(val).map(([k, v]) => ({ k, ...v })).sort((a, b) => b.ts - a.ts);
        if (rows.length === 0) {
          body.innerHTML = '<div class="cs-panel-empty">No edits yet.</div>';
          return;
        }
        body.innerHTML = `
          <div class="cs-history-list">
            ${rows.map(r => `
              <div class="cs-history-row">
                <div class="cs-history-time">${formatDateTime(r.ts)}</div>
                <div class="cs-history-body">
                  <div class="cs-history-user">
                    <span class="cs-user-avatar sm" style="background:${colorFromEmail(r.user||'?')}">${((r.user||'?')[0]||'?').toUpperCase()}</span>
                    <span>${escapeHtml((r.user||'?').split('@')[0])}</span>
                  </div>
                  <div class="cs-history-desc">${escapeHtml(r.desc || 'edit')}</div>
                  ${r.snapshot ? `<div class="cs-history-snap">
                    ${r.snapshot.installed||0} installed · ${r.snapshot.issues||0} issues · ${r.snapshot.log||0} logs
                  </div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      });
    });
  }

  function openPanel(title, fill) {
    closePanel();
    const overlay = document.createElement('div');
    overlay.className = 'cs-overlay';
    overlay.innerHTML = `
      <div class="cs-panel" role="dialog">
        <div class="cs-panel-head">
          <h3>${escapeHtml(title)}</h3>
          <button class="cs-panel-close" aria-label="Close">×</button>
        </div>
        <div class="cs-panel-body"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
    overlay.querySelector('.cs-panel-close').addEventListener('click', closePanel);
    fill(overlay.querySelector('.cs-panel-body'));
  }
  function closePanel() {
    document.querySelectorAll('.cs-overlay').forEach(el => el.remove());
  }

  // ---------- Helpers ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function formatDateTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString();
  }
  function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ---------- Styles ----------
  const css = document.createElement('style');
  css.textContent = `
    body.cs-locked { overflow: hidden; }
    body.cs-locked > *:not(#cs-auth-gate) { filter: blur(8px); pointer-events: none; user-select: none; }

    #cs-auth-gate {
      position: fixed; inset: 0; z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      background: rgba(15, 20, 25, 0.85);
      backdrop-filter: blur(12px);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: #e6edf3;
    }
    .cs-auth-bg {
      position: absolute; inset: 0; z-index: -1;
      background:
        radial-gradient(60% 60% at 30% 30%, rgba(68,147,248,0.18), transparent 70%),
        radial-gradient(50% 50% at 70% 70%, rgba(188,140,255,0.12), transparent 70%),
        #0f1419;
    }
    .cs-auth-card {
      background: rgba(26, 32, 40, 0.96);
      border: 1px solid #2d3744;
      border-radius: 16px;
      padding: 32px;
      width: 380px; max-width: calc(100vw - 24px);
      max-height: calc(100vh - 24px);
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    @media (max-width: 480px) {
      #cs-auth-gate {
        padding: max(16px, env(safe-area-inset-top)) 12px
                 max(16px, env(safe-area-inset-bottom)) 12px;
        align-items: flex-start;
      }
      .cs-auth-card { padding: 20px 18px; border-radius: 14px; width: 100%; }
      .cs-auth-brand { margin-bottom: 18px; gap: 12px; }
      .cs-auth-logo { width: 42px; height: 42px; }
      .cs-auth-title { font-size: 16px; }
      #cs-auth-form label { margin-bottom: 12px; }
      #cs-auth-form input { font-size: 16px; padding: 11px 12px; }   /* 16px prevents iOS zoom-on-focus */
      #cs-auth-submit { padding: 13px; font-size: 15px; }
      .cs-auth-foot { margin-top: 16px; padding-top: 14px; }
    }
    .cs-auth-brand { display: flex; gap: 14px; align-items: center; margin-bottom: 24px; }
    .cs-auth-logo {
      width: 48px; height: 48px; border-radius: 12px;
      background: linear-gradient(135deg, #4493f8, #bc8cff);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 15px; letter-spacing: 0.5px;
    }
    .cs-auth-title { font-size: 17px; font-weight: 600; }
    .cs-auth-sub { font-size: 12px; color: #8b949e; margin-top: 2px; }
    #cs-auth-form label { display: block; margin-bottom: 14px; }
    #cs-auth-form label span { display: block; font-size: 12px; color: #8b949e; margin-bottom: 6px; }
    #cs-auth-form input {
      width: 100%; padding: 10px 12px;
      background: #0f1419; color: #e6edf3;
      border: 1px solid #2d3744; border-radius: 8px;
      font-size: 14px; font-family: inherit;
      transition: border-color 0.15s;
    }
    #cs-auth-form input:focus { outline: none; border-color: #4493f8; }
    #cs-auth-submit {
      width: 100%; margin-top: 8px; padding: 11px;
      background: #4493f8; color: white; border: none; border-radius: 8px;
      font-size: 14px; font-weight: 600; font-family: inherit;
      cursor: pointer; transition: background 0.15s;
    }
    #cs-auth-submit:hover:not(:disabled) { background: #58a6ff; }
    #cs-auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    #cs-auth-forgot {
      width: 100%; margin-top: 8px; padding: 8px;
      background: transparent; color: #8b949e; border: none;
      font-size: 12px; cursor: pointer; font-family: inherit;
    }
    #cs-auth-forgot:hover { color: #58a6ff; }
    .cs-auth-error {
      min-height: 18px; margin-bottom: 8px;
      font-size: 12px; color: #f85149;
    }
    .cs-auth-foot {
      margin-top: 24px; padding-top: 20px;
      border-top: 1px solid #2d3744;
      font-size: 11px; color: #8b949e; line-height: 1.5;
    }

    /* Header badge */
    .cs-status {
      display: flex; align-items: center; gap: 8px;
      margin-right: 6px;
    }
    .cs-status-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: #1a2028; border: 1px solid #2d3744;
      color: #e6edf3; padding: 6px 10px; border-radius: 8px;
      font-size: 12px; cursor: pointer; font-family: inherit;
    }
    .cs-status-btn:hover { background: #232b36; }
    .cs-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #8b949e;
      box-shadow: 0 0 0 0 currentColor;
    }
    .cs-dot.live { background: #3fb950; box-shadow: 0 0 8px rgba(63,185,80,0.5); }
    .cs-dot.syncing { background: #d29922; animation: cs-pulse 1s infinite; }
    .cs-dot.offline { background: #f85149; }
    .cs-dot.connecting { background: #8b949e; animation: cs-pulse 1.5s infinite; }
    @keyframes cs-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

    .cs-user-menu { position: relative; }
    .cs-user-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: #1a2028; border: 1px solid #2d3744;
      color: #e6edf3; padding: 4px 10px 4px 4px; border-radius: 999px;
      font-size: 12px; cursor: pointer; font-family: inherit;
    }
    .cs-user-btn:hover { background: #232b36; }
    .cs-user-avatar {
      width: 22px; height: 22px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      color: white; font-size: 11px; font-weight: 600;
    }
    .cs-user-avatar.sm { width: 18px; height: 18px; font-size: 9px; }
    .cs-user-email { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cs-caret { font-size: 9px; color: #8b949e; }
    .cs-user-dropdown {
      position: absolute; top: calc(100% + 6px); right: 0;
      min-width: 180px;
      background: #1a2028; border: 1px solid #2d3744; border-radius: 8px;
      padding: 4px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      opacity: 0; pointer-events: none; transform: translateY(-4px);
      transition: opacity 0.12s, transform 0.12s;
      z-index: 1000;
    }
    .cs-user-dropdown.open { opacity: 1; pointer-events: auto; transform: translateY(0); }
    .cs-user-dropdown button {
      display: block; width: 100%; text-align: left;
      background: none; border: none; color: #e6edf3;
      padding: 8px 12px; border-radius: 5px;
      font-size: 13px; cursor: pointer; font-family: inherit;
    }
    .cs-user-dropdown button:hover { background: #232b36; }

    /* Panels */
    .cs-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      font-family: inherit;
    }
    .cs-panel {
      background: #1a2028; border: 1px solid #2d3744; border-radius: 12px;
      width: 580px; max-width: 100%; max-height: 80vh;
      display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .cs-panel-head {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid #2d3744;
    }
    .cs-panel-head h3 { font-size: 15px; font-weight: 600; margin: 0; color: #e6edf3; }
    .cs-panel-close {
      background: none; border: none; color: #8b949e;
      font-size: 22px; cursor: pointer; padding: 0 8px; line-height: 1;
    }
    .cs-panel-close:hover { color: #e6edf3; }
    .cs-panel-body {
      padding: 16px 20px; overflow-y: auto;
      color: #e6edf3; font-size: 13px;
    }
    .cs-panel-loading, .cs-panel-empty {
      padding: 40px 20px; text-align: center;
      color: #8b949e; font-size: 13px;
    }
    .cs-history-list { display: flex; flex-direction: column; gap: 2px; }
    .cs-history-row {
      display: grid; grid-template-columns: 140px 1fr;
      gap: 14px; padding: 10px 4px;
      border-bottom: 1px solid #232b36;
    }
    .cs-history-row:last-child { border-bottom: none; }
    .cs-history-time { font-size: 11px; color: #8b949e; padding-top: 2px; }
    .cs-history-user { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #8b949e; }
    .cs-history-desc { margin-top: 4px; font-size: 13px; color: #e6edf3; }
    .cs-history-snap { margin-top: 2px; font-size: 11px; color: #8b949e; }
    .cs-presence-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 4px; border-bottom: 1px solid #232b36;
      font-size: 13px;
    }
    .cs-presence-since { margin-left: auto; font-size: 11px; color: #8b949e; }

    .cs-fatal {
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      z-index: 999999;
      background: #f85149; color: white; padding: 12px 20px;
      border-radius: 8px; font-family: -apple-system, sans-serif; font-size: 13px;
    }

    #cs-setup-banner {
      position: fixed; top: 0; left: 0; right: 0; z-index: 99998;
      background: linear-gradient(90deg, #d29922, #ff8c42);
      color: #1a1a1a; font-family: -apple-system, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .cs-setup-inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; gap: 14px;
      padding: 10px 20px;
    }
    .cs-setup-icon { font-size: 20px; }
    .cs-setup-body { flex: 1; display: flex; flex-direction: column; gap: 2px; font-size: 12px; }
    .cs-setup-body strong { font-size: 13px; }
    .cs-setup-body code { background: rgba(0,0,0,0.15); padding: 1px 5px; border-radius: 3px; font-size: 11px; }
    .cs-setup-dismiss {
      background: rgba(0,0,0,0.15); border: none; color: #1a1a1a;
      padding: 6px 12px; border-radius: 6px; cursor: pointer;
      font-size: 12px; font-weight: 500; font-family: inherit;
    }
    .cs-setup-dismiss:hover { background: rgba(0,0,0,0.25); }

    /* Read-only banner — shown at the top when user is not in /allowlist */
    #cs-readonly-banner {
      position: fixed; top: 0; left: 0; right: 0; z-index: 99997;
      background: linear-gradient(90deg, #5a4a3a, #3d2f24);
      color: #fde8d0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      font-size: 12px;
      padding: 8px 20px;
      display: flex; align-items: center; gap: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      border-bottom: 1px solid rgba(232, 93, 31, 0.4);
    }
    #cs-readonly-banner .cs-ro-icon { font-size: 14px; }
    #cs-readonly-banner .cs-ro-text { font-weight: 600; color: #fff; }
    #cs-readonly-banner .cs-ro-hint { color: #c9b9a3; font-size: 11px; }
    @media (max-width: 720px) {
      #cs-readonly-banner .cs-ro-hint { display: none; }
    }

    @media (max-width: 720px) {
      .cs-user-email { display: none; }
      .cs-status-text { display: none; }
    }
  `;
  document.head.appendChild(css);

})();
