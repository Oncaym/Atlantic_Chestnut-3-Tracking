/* ============================================================
   Hillview Reservoir — Kawneer Takeoff Tool — Logic
   ============================================================ */

const STORAGE_KEY = 'hillview-kawneer-takeoff-v2';
const PARTS_DB_VERSION = 20260618;
// SYSTEMS & POSITIONS derived dynamically from parts data (with fallback defaults)
const DEFAULT_SYSTEMS = ['IR501T', '450'];
const DEFAULT_POSITIONS = ['Head', 'Jamb', 'Sill', 'Horizontal', 'Vertical', 'Transom Bar', 'Door Jamb', 'Door Jamb At Transom'];

// ============================================================
//  #whitelist (#2): keep each system's detected roles inside the roles that actually
//  belong to that system. One universal geometric detector emits generic roles
//  (Transom Bar / Door Jamb At Transom / Outside 90° Corner / Subsill …); without this,
//  a system like 45TU (which has no 'Door Jamb At Transom' or 'Outside 90° Corner') keeps
//  roles that don't exist for it. Allowed roles are derived straight from SYSTEM_DEFS
//  (parts.roles ∪ accessories.positions), so it self-configures and never touches a role
//  the system legitimately defines (e.g. 750XT's (X)/(wide) variants stay untouched).
//  Anything out-of-system is remapped to the nearest in-system role via ROLE_REMAP.
const ROLE_REMAP = {
  'Door Jamb At Transom': ['Door Jamb', 'Jamb', 'Vertical'],
  'Door Jamb':            ['Door Jamb', 'Jamb', 'Vertical'],
  'Outside 90° Corner':   ['Corner', 'Vertical', 'Jamb'],
  'Corner':               ['Corner', 'Outside 90° Corner', 'Vertical', 'Jamb'],
  'Transom Bar':          ['Transom Bar', 'Head', 'Horizontal'],
  'Subsill':              ['Subsill', 'Sill'],
  // #S3: defensive fallback only — systems.js's 750XT parts already list these directly, so
  // this chain shouldn't normally fire; kept in case a future edit drops them from a part's
  // roles[] and the whitelist needs somewhere safe to remap to.
  'Jamb (IMP-1)':         ['Jamb (IMP-1)', 'Jamb (X)', 'Jamb'],
  'Vertical (IMP-1)':     ['Vertical (IMP-1)', 'Vertical (X)', 'Vertical'],
  'Vertical (wide IMP-1)':['Vertical (wide IMP-1)', 'Vertical (wide X)', 'Vertical (wide)'],
  'Horizontal (Glass&Glass)': ['Horizontal (Glass&Glass)', 'Horizontal'],
};
const _allowedRolesCache = new Map();
function allowedRolesForSystem(system) {
  if (_allowedRolesCache.has(system)) return _allowedRolesCache.get(system);
  const def = (window.SYSTEM_DEFS || {})[system];
  const set = new Set();
  if (def) {
    for (const p of (def.parts || [])) for (const r of (p.roles || [])) set.add(r);
    for (const a of (def.accessories || [])) for (const r of (a.positions || [])) set.add(r);
  }
  _allowedRolesCache.set(system, set);
  return set;
}
// #recognized-roles (#2, 2026-07-20, Opus — HANDOFF-FOR-OPUS Task 2): Leo can curate a per-system
// list of the roles the classifier is allowed to output — `state.recognizedRoles[system]` (a plain
// array of role strings, edited from the left-sidebar "Recognized Roles" panel). This is the
// authoritative gate on top of the SYSTEM_DEFS-derived allowed set:
//   - If a manual list EXISTS for a system, it (∪ customRoles, so manual "+ Add Role" assignment is
//     never blocked) is the recognized set. A role Leo removes from it stops being produced by the
//     whitelist AND is dropped from any stale per-piece pin (see classifyRoles' pin pass) — that
//     pin drop is what finally stops a retired role from resurfacing on every re-import.
//   - If NO manual list exists for a system, behaviour is exactly as before (SYSTEM_DEFS set only),
//     so existing projects are unaffected until Leo opts in by curating a list.
// Kept separate from customRoles/"+ Add Role" (that only makes a role AVAILABLE for manual
// assignment; this gates what the AUTO-classifier may emit) — see PROPAGATION-DESIGN.md §17.
function recognizedRolesForSystem(system) {
  const manual = (typeof state !== 'undefined' && state.recognizedRoles) ? state.recognizedRoles[system] : null;
  if (Array.isArray(manual)) return new Set([...manual, ...((state && state.customRoles) || [])]);
  return allowedRolesForSystem(system);
}
function hasManualRecognizedList(system) {
  return !!(typeof state !== 'undefined' && state.recognizedRoles && Array.isArray(state.recognizedRoles[system]));
}
// Remap any cut whose role isn't recognized for `system` to the nearest role that is.
function applyRoleWhitelist(cuts, system) {
  const allowed = recognizedRolesForSystem(system);
  if (!allowed.size) return;                 // unknown system → leave as-is
  for (const c of cuts) {
    if (!c || allowed.has(c.position)) continue;
    const chain = ROLE_REMAP[c.position];
    if (!chain) continue;                     // no known target → leave visible for manual fix
    for (const cand of chain) { if (allowed.has(cand)) { c.position = cand; break; } }
  }
}
function SYSTEMS_LIST() {
  const fromParts = Array.from(new Set((state.parts||[]).map(p => p.system).filter(Boolean)));
  return fromParts.length ? fromParts : DEFAULT_SYSTEMS.slice();
}
function POSITIONS_LIST() {
  const fromParts = Array.from(new Set((state.parts||[]).flatMap(p => p.roles||[])));
  // 自定义角色(报表 "+ Add Role" 建的): 还没挂到任何 part 上也要出现在
  // 角色表和 viewer 的位置下拉里,方便先给料改 role、后配零件。
  const custom = Array.from(new Set(state.customRoles || []));
  const all = Array.from(new Set(fromParts.concat(custom)));
  return all.length ? all : DEFAULT_POSITIONS.slice();
}
// Back-compat aliases (Proxy so existing SYSTEMS.map / SYSTEMS.indexOf still work)
const SYSTEMS = new Proxy([], { get(_,k){ const a=SYSTEMS_LIST(); return typeof a[k]==='function'?a[k].bind(a):a[k]; } });
const POSITIONS = new Proxy([], { get(_,k){ const a=POSITIONS_LIST(); return typeof a[k]==='function'?a[k].bind(a):a[k]; } });
function wasteFactor(){ const p = (typeof state !== 'undefined' && state && state.wastePct != null) ? +state.wastePct : 20; return 1 + ((isFinite(p) ? p : 20) / 100); }   // #1: user-selectable waste %
function wastePctVal(){ return (typeof state !== 'undefined' && state && state.wastePct != null && isFinite(+state.wastePct)) ? +state.wastePct : 20; }
const STOCK_INCHES = 288; // 24 ft

// DXF layer-name config (can be overridden via setLayerConfig({alum:'...',...}))
let LAYER_CONFIG = {
  alum: 'AF_ALUM PROFILE',
  doorSubframe: 'AF-DOOR SUBFRAME',
  outline: 'AF_OUTLINE',
  scope: 'AF SCOPE',
  door: 'A-DOOR-1',
  fallbacks: ['0','AF_X'],
};
function setLayerConfig(cfg){ LAYER_CONFIG = Object.assign({}, LAYER_CONFIG, cfg||{}); save(); }
window.setLayerConfig = setLayerConfig;


// ---------- Default seed data ----------
// Seeded from user's parts CSV. Duplicate part numbers across positions are
// consolidated to a single row with multiple roles — required for
// part-centric aggregation (e.g. 575T217 carries Head + Jamb).
// 系统数据(parts/accessories)已抽到 systems.js 的 window.SYSTEM_DEFS。
// 这里只把它摊平成 SEED_PARTS / SEED_ACCESSORIES(自动补 system; id 在 clone 时生成)。
const SEED_PARTS = [];
const SEED_ACCESSORIES = [];
(function buildSeedFromDefs() {
  const defs = (typeof window !== 'undefined' && window.SYSTEM_DEFS) || {};
  const pref = (typeof window !== 'undefined' && window.SYSTEM_ORDER) || [];
  // 按 SYSTEM_ORDER 排, 其余(未列出的)按对象顺序补在后面
  const order = pref.filter(s => defs[s]).concat(Object.keys(defs).filter(s => !pref.includes(s)));
  for (const sys of order) {
    for (const p of (defs[sys].parts || [])) SEED_PARTS.push(Object.assign({ system: sys }, p));
    for (const a of (defs[sys].accessories || [])) SEED_ACCESSORIES.push(Object.assign({ system: sys }, a));
  }
})();

const SEED_OPENINGS = [];

// ---------- State ----------
function cloneSeedAccessories() {
  return SEED_ACCESSORIES.map(a => ({ ...a, id: uid(), positions: [...a.positions] }));
}

let state = load() || {
  partsDbVersion: PARTS_DB_VERSION,
  parts: cloneSeedParts(),
  openings: SEED_OPENINGS,
  accessories: cloneSeedAccessories(),
};
if (!Array.isArray(state.accessories)) state.accessories = cloneSeedAccessories();

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function save() {
  try {
    state.partsDbVersion = PARTS_DB_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch(e){}
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.parts) || !Array.isArray(parsed.openings)) return null;
    parsed.openings = parsed.openings.map(o => ({
      ...o,
      system: o.system === '451T' ? '450' : o.system,
    }));
    if (parsed.partsDbVersion !== PARTS_DB_VERSION) {
      parsed.parts = cloneSeedParts();
      parsed.accessories = cloneSeedAccessories();   // 配件也随版本重灌(已改为按系统分)
      parsed.partsDbVersion = PARTS_DB_VERSION;
    }
    // 旧数据兼容: 配件缺 system 字段的, 视为通用(沿用旧全局行为, 不限系统)
    if (Array.isArray(parsed.accessories)) {
      for (const a of parsed.accessories) if (a.system === undefined) a.system = '';
    }
    return parsed;
  } catch(e) { return null; }
}

function cloneSeedParts() {
  return SEED_PARTS.map(p => ({ ...p, id: uid(), roles: [...p.roles] }));
}

// ---------- ICON helper ----------
function ico(name, cls = 'ico') {
  const paths = {
    plus:    '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    trash:   '<path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>',
    download:'<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    copy:    '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>',
    reset:   '<path d="M3 12a9 9 0 1015.7-6.1L21 3M21 3v6h-6"/>',
    upload:  '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    fileText:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    inbox:   '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>',
    table:   '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    eye:     '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  };
  const d = paths[name] || '';
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${d}</svg>`;
}

// ============================================================
//  RENDER
// ============================================================
function renderAll() {
  renderParts();
  renderOpenings();
  renderReport();
  renderMeta();
  renderRecognizedRoles();
  renderRoleTemplates();
  save();
}

// ---------- Recognized Roles panel (#2, 2026-07-20 Opus) ----------
let _rrSystem = null;  // which system the panel is currently showing
function renderRecognizedRoles() {
  const sel = document.getElementById('rr-system');
  const body = document.getElementById('rr-body');
  if (!sel || !body) return;
  const systems = SYSTEMS_LIST();
  if (_rrSystem == null || !systems.includes(_rrSystem)) _rrSystem = systems[0] || null;
  sel.innerHTML = systems.map(s => `<option value="${escHtml(s)}"${s === _rrSystem ? ' selected' : ''}>${escHtml(s)}</option>`).join('');
  if (!_rrSystem) { body.innerHTML = '<p class="tk-section__sub">No systems defined yet — add parts first.</p>'; return; }
  const curated = hasManualRecognizedList(_rrSystem);
  const roles = curated
    ? (state.recognizedRoles[_rrSystem] || [])
    : Array.from(allowedRolesForSystem(_rrSystem));
  const chips = roles.slice().sort().map(r =>
    `<span class="tk-chip" data-role="${escHtml(r)}" style="display:inline-flex;align-items:center;gap:6px;margin:3px;padding:4px 8px;border:1px solid var(--af-border,#ccc);border-radius:14px;font-size:12px;">
       ${escHtml(r)}
       ${curated ? `<button type="button" class="rr-del" data-role="${escHtml(r)}" title="Retire this role" style="border:none;background:none;cursor:pointer;font-size:14px;line-height:1;color:var(--af-fg-3,#999);">×</button>` : ''}
     </span>`).join('');
  body.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:2px;">${chips || '<span class="tk-section__sub">(no roles)</span>'}</div>
    <div class="tk-addbar" style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      ${curated
        ? `<input id="rr-add" type="text" class="tk-input tk-input--sm" placeholder="Add a role (exact name)" style="min-width:200px;" />
           <button class="tk-btn tk-btn--dark tk-btn--sm" id="rr-add-btn">Add role</button>
           <button class="tk-btn tk-btn--ghost tk-btn--sm" id="rr-reset" title="Revert to the full parts-derived set (removes the manual restriction)">Reset to default</button>`
        : `<span class="tk-section__sub" style="margin:0;">Showing the full parts-derived set for <b>${escHtml(_rrSystem)}</b> (uncurated).</span>
           <button class="tk-btn tk-btn--dark tk-btn--sm" id="rr-curate" title="Start curating: seeds the list from the current set so you can remove retired roles">Curate this system</button>`}
    </div>`;
}

// ---------- Template controls (#template, §16) ----------
// Row shown inside the Elevation Viewer: save this elevation as a template, and (if any saved
// template matches this elevation's fill layout) pick + apply one.
function templateControlsHtml(o) {
  if (!o || !o._bands) {
    return `<div style="margin:6px 0;font-size:11px;color:#999;">🧩 Templates need a DXF-parsed elevation (no geometry on a hand-added opening).</div>`;
  }
  const seq = openingFillSequence(o);
  const isManual = Array.isArray(o.fillLayout) && o.fillLayout.length;
  const matches = templatesMatchingOpening(o);
  let h = `<div style="margin:6px 0;font-size:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
    <span style="color:#999;">🧩 Fill layout (top→bottom):</span>
    <input id="vc-fill-layout" class="tk-cell-input" value="${escAttr(seq)}" spellcheck="false" title="Fill order top→bottom, separated by > — e.g. louver>imp-1>glass>glass. Edit to correct auto-detection; this is what templates match on." style="min-width:240px;font-family:var(--af-font-mono,monospace);" />
    <button class="tk-btn tk-btn--ghost tk-btn--sm" id="vc-fill-auto" title="Reset to the auto-detected fill layout">↺ Auto</button>
    <span style="color:${isManual ? '#2a8a4a' : '#999'};">(${isManual ? 'manual' : 'auto'})</span>
    <button class="tk-btn tk-btn--ghost tk-btn--sm" id="vc-save-template" title="Save this elevation's fill layout + every member's role as a reusable template">💾 Save as Template</button>`;
  if (matches.length) {
    h += `<select id="vc-template-pick" class="tk-cell-select">${matches.map(t => `<option value="${escAttr(t.id)}">${escHtml(t.name)}</option>`).join('')}</select>
      <button class="tk-btn tk-btn--dark tk-btn--sm" id="vc-apply-template" title="Preview, then apply the selected template's roles to this elevation">Apply Template</button>`;
  } else {
    h += `<span style="color:#999;">(no saved template matches this layout)</span>`;
  }
  return h + `</div>`;
}

// ---------- Templates management list (#template, §16) ----------
function renderRoleTemplates() {
  const host = document.getElementById('tmpl-list');
  if (!host) return;
  const tmpls = state.roleTemplates || [];
  if (!tmpls.length) { host.innerHTML = '<p class="tk-section__sub">No templates yet. Open a correctly-classified elevation in the viewer and click "Save as Template".</p>'; return; }
  host.innerHTML = tmpls.map(t => `
    <div style="display:flex;align-items:center;gap:10px;padding:6px 4px;border-bottom:1px solid var(--af-line,#eee);font-size:12px;">
      <b>${escHtml(t.name)}</b>
      <span style="color:#999;">${escHtml(t.system)} · ${escHtml(t.fillSequence)} · ${(t.members||[]).length} slots</span>
      <button class="tk-btn tk-btn--ghost tk-btn--sm tmpl-del" data-tmpl="${escAttr(t.id)}" title="Delete this template" style="margin-left:auto;">Delete</button>
    </div>`).join('');
}

// ---------- Parts Database ----------
function partRowHtml(p) {
  return `
    <tr data-id="${p.id}">
      <td class="col-sys">
        <select class="tk-cell-select" data-field="system">
          ${SYSTEMS.map(s => `<option value="${s}" ${s===p.system?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td class="col-pn">
        <input class="tk-cell-input mono" data-field="partNumber" value="${escAttr(p.partNumber)}" placeholder="Part #" />
      </td>
      <td>
        <input class="tk-cell-input" data-field="description" value="${escAttr(p.description)}" placeholder="Description" />
      </td>
      <td class="col-roles">
        <div class="tk-roles" data-field="roles">
          <span class="tk-role ${p.continuous?'is-on':''}" data-cont="1" style="border-style:dashed;" title="Continuous part: cut lengths merged across the full run (adjacent same-row segments span mullions and merge into one, e.g. C Face Cover runs continuously over the sill). Toggle syncs with the cloud parts library.">↔ Continuous</span>
          ${POSITIONS.map(pos => `<span class="tk-role ${p.roles.includes(pos)?'is-on':''}" data-role="${pos}">${pos}</span>`).join('')}
        </div>
      </td>
      <td class="tk-rowdel">
        <button class="tk-rowdel-btn" data-action="del-part" title="Delete row">${ico('trash')}</button>
      </td>
    </tr>`;
}

// 零件表按系统折叠; 默认只展开"当前在用系统"(有 opening 的); 用户点标题可切换。
let _partsExpandInit = false;
const partsExpanded = new Set();
function renderParts() {
  const tbody = document.getElementById('parts-tbody');
  if (!state.parts.length) {
    tbody.innerHTML = `<tr class="is-empty"><td colspan="6">No parts defined — add a row to begin.</td></tr>`;
    return;
  }
  const systems = SYSTEMS_LIST();
  _partsExpandInit = true;   // #2: default all system groups collapsed (no auto-expand)
  const bySys = {};
  for (const p of state.parts) (bySys[p.system] = bySys[p.system] || []).push(p);
  const order = systems.concat(Object.keys(bySys).filter(s => !systems.includes(s)));
  let html = '';
  for (const sys of order) {
    const parts = bySys[sys];
    if (!parts || !parts.length) continue;
    const open = partsExpanded.has(sys);
    html += `<tr class="sys-group" data-sysgroup="${escAttr(sys)}"><td colspan="6" style="cursor:pointer; font-weight:600; background:var(--af-bg-2,#f1f1f1); user-select:none;">${open ? '▾' : '▸'} ${escHtml(sys || '(no system)')} <span style="color:var(--af-fg-3); font-weight:400;">· ${parts.length} parts</span></td></tr>`;
    if (open) for (const p of parts) html += partRowHtml(p);
  }
  tbody.innerHTML = html;
}

// ---------- Openings (Cut Schedule by opening) ----------
function renderOpenings() {
  const tbody = document.getElementById('openings-tbody');
  if (!state.openings.length) {
    tbody.innerHTML = `<tr class="is-empty"><td colspan="10">No openings yet — add one below, or paste a schedule into the DXF box.</td></tr>`;
    return;
  }
  tbody.innerHTML = state.openings.map(o => `
    <tr data-id="${o.id}">
      <td class="col-mark"><input class="tk-cell-input mono" data-field="mark" value="${escAttr(o.mark)}" placeholder="SF-01" /></td>
      <td class="col-sys">
        <select class="tk-cell-select" data-field="system">
          ${SYSTEMS.map(s => `<option value="${s}" ${s===o.system?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td class="col-num-sm"><input class="tk-cell-input num" data-field="qty" type="number" min="1" step="1" value="${o.qty}" /></td>
      <td class="col-num"><input class="tk-cell-input num" data-field="width"  type="number" min="0" step="0.125" value="${o.width}"  /></td>
      <td class="col-num"><input class="tk-cell-input num" data-field="height" type="number" min="0" step="0.125" value="${o.height}" /></td>
      <td class="col-num-sm"><input class="tk-cell-input num" data-field="horiz" type="number" min="0" step="1" value="${o.horiz||0}" title="Intermediate horizontals (full-width cuts)" /></td>
      <td class="col-num-sm"><input class="tk-cell-input num" data-field="vert"  type="number" min="0" step="1" value="${o.vert||0}"  title="Intermediate verticals (full-height cuts)" /></td>
      <td class="col-num-sm"><input class="tk-cell-input num" data-field="lites" type="number" min="0" step="1" value="${o.lites||0}" title="Glass lites (auto from VISION GLASS MARK; editable)" /></td>
      <td class="col-num"><span class="tk-cell-input num" style="color:var(--af-fg-3); font-size:11.5px;">${formatNumber(openingTotalInches(o))}"</span></td>
      <td class="tk-rowdel">
        <button class="tk-rowdel-btn" data-action="view-opening" title="View elevation (traceback)">${ico('eye')}</button>
        <button class="tk-rowdel-btn" data-action="del-opening" title="Delete row">${ico('trash')}</button>
      </td>
    </tr>
  `).join('');
}

// ---------- Elevation Viewer (traceback: cut → source polyline) ----------
// 配色与手算图例一致
const POSITION_COLORS = {
  'Head': '#e6c700', 'Jamb': '#00b400', 'Sill': '#e00000', 'Horizontal': '#00b4b4',
  'Door Jamb At Transom': '#0000e0', 'Transom Bar': '#000000', 'Vertical': '#9898cc',
  'Door Jamb': '#e000e0', 'Outside 90° Corner': '#808080', 'Subsill': '#f26722',
  // (X)/(Lv)/(wide) 变体(AC3 louver/宽竖梃)——用未被占用的新色系,任何 system 下都不再灰。
  'Head (X)': '#8a5a2b',        // 棕
  'Sill (X)': '#6a2ca0',        // 深紫
  'Jamb (X)': '#ff7eb6',        // 粉
  'Horizontal (X)': '#9a9a00',  // 橄榄
  'Vertical (Lv)': '#37b6ff',   // 天蓝
  'Vertical (X)': '#ff8ac2',    // 粉(金属板带段)
  'Vertical (wide)': '#0e7a5a', // 墨绿
  'Vertical (wide X)': '#7a4df0', // 蓝紫
  'Sill (normal)': '#00bcd4',   // 青
};

// 1600 系统(两种尺寸):只分 4 类。Head/Sill/Transom Bar 用同一种颜色(周边横料)。
function is1600(system) { return /^1600/.test(String(system || '')); }
const COLOR_1600 = {
  'Head': '#e6c700', 'Sill': '#e6c700', 'Transom Bar': '#e6c700', // 周边横料(黄)
  'Horizontal': '#00b4b4',                                        // 中间横料(青)
  'Jamb': '#00b400',                                              // 周边竖料(绿)
  'Vertical': '#9898cc',                                          // 中间竖料(紫)
};
// 750XT(AC3):配色 = 750XT parts.xlsx 色键(与手涂范式 1.png/2.png 一致)。
const COLOR_750XT = {
  'Head': '#e6c700',                              // Top(黄)
  'Head (X)': '#21a121', 'Sill (X)': '#21a121',   // Top(X)/Sill(X)(绿)
  'Horizontal': '#f04a22',                        // 红橙
  'Horizontal (X)': '#8a5a2b',                    // 棕(含门上横档)
  'Sill': '#c9a0f0',                              // 淡紫
  'Jamb': '#e00000', 'Door Jamb': '#e00000',      // 红(Jamb/Door Jamb)
  'Jamb (X)': '#f59300',                          // 橙
  'Vertical': '#3f3fbf',                          // 靛蓝
  'Vertical (Lv)': '#f06ec8',                     // 粉
  'Vertical (X)': '#ff8ac2',                      // 粉(金属板带段,蓝粉蓝的"粉")
  'Vertical (wide)': '#0ea5a5',                   // 宽竖梃(青绿)
  'Vertical (wide X)': '#37b6ff',                 // 宽竖梃·带段(浅蓝)
  'Sill (normal)': '#00bcd4',                     // 青(金属板带上沿的窗台)
  'Subsill': '#f26722',
};
// 未映射角色(含自定义 Add Role 建的)→ 按名称哈希从备用色板取色,保证同名同色、不再一律灰
const CUSTOM_ROLE_COLORS = ['#d81b60', '#8e24aa', '#3949ab', '#00897b', '#7cb342', '#fb8c00', '#5d4037', '#00acc1'];
function customRoleColor(position) {
  let h = 0; const s = String(position || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return CUSTOM_ROLE_COLORS[h % CUSTOM_ROLE_COLORS.length];
}
function cutColor(position, system) {
  if (state.roleColors && state.roleColors[position]) return state.roleColors[position];   // T2: renamed-role color override
  if (String(system) === '750XT') return COLOR_750XT[position] || POSITION_COLORS[position] || customRoleColor(position);
  if (is1600(system)) return COLOR_1600[position] || POSITION_COLORS[position] || customRoleColor(position);
  return POSITION_COLORS[position] || customRoleColor(position);
}

// 系统相关改名(450 与 IR501T 唯一区别都在这): 门框 transom 以上那段 ——
//   · 既是 elevation 最边 jamb → Jamb
//   · 其余(中间门框)→ 与 Vertical 同一构成, 归 Vertical(同色)
// 即 450 里没有独立的 "Door Jamb At Transom" 类。IR501T 保持 Door Jamb At Transom。
// 几何分类时已对边门框那段打了 edgeDoorJamb 标记。
function cutDisplayPosition(c, system) {
  if (system === '450' && c.position === 'Door Jamb At Transom') {
    return c.edgeDoorJamb ? 'Jamb' : 'Vertical';
  }
  return c.position;
}

// T3: stable geometry key for a cut's source (rounded to 0.1") — remembers manual role overrides across re-imports.
function srcKey(s) { return [s.x, s.y, s.w, s.h].map(n => Math.round((n || 0) * 10) / 10).join('|'); }

// ============================================================
//  #persist (#1): manual elevation edits (splits/merges/role/length/count) survive
//  reload AND are shared across browsers/Vercel via Firestore (project elevDb,
//  collection `elevEdits`, one doc per mark). Local state.elevEdits mirrors the cloud
//  and is the offline fallback. On DXF re-import a saved edit-set is restored only when
//  its geometry signature matches the fresh parse (see parseRawDxfOpenings).
//  Note: this is also the training data #4's auto-propagation will learn from.
// ============================================================
function elevGeoSig(cuts) {
  // Role-independent fingerprint of the parsed source geometry for one elevation.
  return (cuts || []).filter(c => c && c.src).map(c => srcKey(c.src)).sort().join(';');
}
function elevEditRecord(o) {
  return {
    cuts: (o.cuts || []).map(c => ({ position: c.position, length: c.length, count: c.count || 1, src: c.src ? { ...c.src } : null })),
    geoSig: o.geoSig || elevGeoSig(o.cuts),
    width: o.width, height: o.height, system: o.system || '',
  };
}
// #history (2026-07-19, Leo — SF01 data loss): keep at most this many prior versions per mark,
// newest first, nested inside the same elevEdits doc (`rec.history`) so it travels with one
// write/read — no new Firestore collection needed. This is what lets a bad overwrite (like the
// SF01 case, where an automatic reclassification silently replaced a hand-set special-case
// classification) be undone from within the app, instead of depending on an external backup that
// didn't exist for this data (the nightly GitHub Action only backs up the tracker's Realtime DB
// /state, never the takeoff tool's Firestore collections).
const ELEV_EDITS_HISTORY_LIMIT = 5;
function persistElevEdits(o) {
  if (!o || !o.mark) return;
  state.elevEdits = state.elevEdits || {};
  const rec = elevEditRecord(o);
  rec.updatedAt = Date.now();
  const prev = state.elevEdits[o.mark];
  // Only push a history entry if something actually changed (avoid piling up no-op saves).
  const prevSig = prev ? JSON.stringify((prev.cuts || []).map(c => [c.position, c.length, c.count])) : null;
  const nextSig = JSON.stringify((rec.cuts || []).map(c => [c.position, c.length, c.count]));
  if (prev && prevSig !== nextSig) {
    const prevHistory = Array.isArray(prev.history) ? prev.history : [];
    const prevEntry = { cuts: prev.cuts, geoSig: prev.geoSig, width: prev.width, height: prev.height, system: prev.system, updatedAt: prev.updatedAt || 0 };
    rec.history = [prevEntry, ...prevHistory].slice(0, ELEV_EDITS_HISTORY_LIMIT);
  } else {
    rec.history = (prev && Array.isArray(prev.history)) ? prev.history : [];
  }
  state.elevEdits[o.mark] = rec;
  save();
  const fb = window.__fb;
  if (fb && fb.setDoc) {
    try {
      fb.setDoc(fb.doc(fb.elevDb || fb.db, 'elevEdits', String(o.mark)),
        Object.assign({}, rec, { updatedAt: fb.serverTimestamp() }), { merge: true })
        .catch(err => console.warn('[elevEdits] push failed:', err));
    } catch (err) { console.warn('[elevEdits] push failed:', err); }
  }
}
// #history: restore one prior version for `mark` back to being the live edit-set. The version
// being replaced is itself pushed to history first (via persistElevEdits' own diffing), so
// restoring is never a dead end — you can always step back again.
function restoreElevEditsVersion(mark, historyIdx) {
  const rec = state.elevEdits && state.elevEdits[mark];
  const entry = rec && Array.isArray(rec.history) && rec.history[historyIdx];
  if (!entry) return false;
  const o = state.openings.find(x => x.mark === mark);
  if (!o) return false;
  o.cuts = (entry.cuts || []).map(c => ({ position: c.position, length: c.length, count: c.count || 1, src: c.src ? { ...c.src } : null }));
  o.geoSig = entry.geoSig || elevGeoSig(o.cuts);
  persistElevEdits(o);   // saves the restored version as current, pushing today's (pre-restore) version into history
  return true;
}
function clearElevEdits(mark) {
  if (!mark) return;
  if (state.roleEdits) delete state.roleEdits[mark];
  if (state.elevEdits) delete state.elevEdits[mark];
  save();
  const fb = window.__fb;
  if (fb && fb.setDoc) {
    try {
      fb.setDoc(fb.doc(fb.elevDb || fb.db, 'elevEdits', String(mark)),
        { cuts: [], geoSig: '', updatedAt: fb.serverTimestamp() }, { merge: true }).catch(() => {});
    } catch (_) {}
  }
}
function loadElevEditsFromCloud() {
  const fb = window.__fb;
  if (!fb || !fb.getDocs || !fb.collection) return;
  const _localSnapshot = Object.assign({}, state.elevEdits || {}); // #11: pre-merge snapshot, to find cloud gaps below
  fb.getDocs(fb.collection(fb.elevDb || fb.db, 'elevEdits')).then(snap => {
    state.elevEdits = state.elevEdits || {};
    const _cloudMarks = new Set();
    snap.forEach(d => {
      _cloudMarks.add(d.id);
      const data = d.data() || {};
      if (data && Array.isArray(data.cuts)) {
        if (data.cuts.length) state.elevEdits[d.id] = { cuts: data.cuts, geoSig: data.geoSig || '', width: data.width, height: data.height, system: data.system || '', updatedAt: data.updatedAt || 0, history: Array.isArray(data.history) ? data.history : [] };
        else delete state.elevEdits[d.id];   // a cleared mark
      }
    });
    save();
    // #11: one-time self-heal — a mark edited locally before the elevEdits Firestore rule was
    // published/deployed only ever saved to localStorage; now that cloud is reachable, push any
    // such local-only mark up. No-op once everything's synced (skips marks the cloud already has).
    const _missing = Object.keys(_localSnapshot).filter(mark => !_cloudMarks.has(mark) && _localSnapshot[mark] && Array.isArray(_localSnapshot[mark].cuts) && _localSnapshot[mark].cuts.length);
    if (_missing.length && fb.setDoc) {
      console.log('[elevEdits] self-heal: pushing ' + _missing.length + ' local-only mark(s) to cloud:', _missing.join(', '));
      for (const mark of _missing) {
        const rec = _localSnapshot[mark];
        try {
          fb.setDoc(fb.doc(fb.elevDb || fb.db, 'elevEdits', String(mark)),
            Object.assign({}, rec, { updatedAt: fb.serverTimestamp() }), { merge: true })
            .catch(err => console.warn('[elevEdits] self-heal push failed for', mark, err));
        } catch (err) { console.warn('[elevEdits] self-heal push failed for', mark, err); }
      }
    }
  }).catch(err => console.warn('[elevEdits] load failed:', err));
}
if (typeof window !== 'undefined') {
  if (window.__fb) loadElevEditsFromCloud();
  else window.addEventListener('fb-ready', loadElevEditsFromCloud, { once: true });
}

// (#LayerB learned-role propagation removed 2026-07-20 — Leo's call, error rate too high.
//  computeOpeningZones/zoneShapeOf/computeRoleSignature/roleSigKey/persistRoleRule/
//  applyLearnedRoleRules/loadRoleRulesFromCloud all deleted; state.roleRules no longer used.
//  Layer A geometric classification below is unchanged. See PROPAGATION-DESIGN.md §3/§9/§9b
//  (marked ABANDONED) and the template-based approach in §16.)
// #fix (2026-07-18): IMP-1 base role ↔ IMP-1-variant role mapping, shared by both classification
// stages below. Keeping this as the single source of truth means "which family is this
// member" (Jamb vs Vertical vs Vertical (wide)) is never lost, even after normalizing an
// already-IMP-1-labeled segment back to its base role for re-evaluation.
const IMP1_VERTICAL_ROLES = ['Jamb', 'Vertical', 'Vertical (wide)'];
function normalizeImp1RoleToBase(position) {
  if (position === 'Jamb (IMP-1)') return 'Jamb';
  if (position === 'Vertical (IMP-1)') return 'Vertical';
  if (position === 'Vertical (wide IMP-1)') return 'Vertical (wide)';
  return position;
}
function toImp1Role(baseRole) {
  if (baseRole === 'Jamb') return 'Jamb (IMP-1)';
  if (baseRole === 'Vertical (wide)') return 'Vertical (wide IMP-1)';
  if (baseRole === 'Vertical') return 'Vertical (IMP-1)';
  return baseRole;
}
// #fix (2026-07-18, per Leo's spec "750XT IMP-1/Glass/Louver 识别与构件分类修复"): the full
// 750XT role-classification pipeline. Two-STAGE IMP-1 vertical handling, per Leo's explicit
// requirement — stage 1 alone (whole-member-spans-the-band split) is not sufficient because a
// vertical member is not always one continuous whole piece by the time this runs:
//   - it may already be several separate DXF-native segments (broken at intersections), or
//   - it may be a RESTORED state.elevEdits[mark] snapshot already split into 3+ pieces (e.g. by
//     an earlier manual edit), each already carrying a plain (non-IMP-1) role.
// In either case no single segment "fully spans past the band on both sides", so the old
// single-stage check never fired and the piece stayed permanently mislabeled. Stage 2 fixes
// this: it re-evaluates EVERY vertical-family segment (freshly split, DXF-native multi-segment,
// or restored) purely by its own geometric overlap with the band, independent of whether it was
// ever a single whole piece. Called from both a fresh parse and a restored-snapshot re-pass —
// see parseRawDxfOpenings call sites — and is idempotent either way.
function classifyRoles(cuts, ctx) {
  const { system, bbox, imp1Bands = [], louverBand, doorRegions, mark } = ctx;
  const inX = (b, midX) => midX >= b.minX - 6 && midX <= b.maxX + 6;
  if (system === '750XT' && imp1Bands.length) {
    // ---- Stage 1: split a WHOLE (unsplit) vertical that fully spans a band into 3 pieces
    // (above/through/below). Only creates new segments where none exist yet; a no-op for
    // members that are already segmented (DXF-native or restored) — those are handled by Stage 2.
    const next = [];
    for (const cut of cuts) {
      const s = cut.src;
      if (!s || s.w > s.h) { next.push(cut); continue; } // horizontal — never touched by IMP-1 split (Head/Sill/Horizontal stay as classified)
      const midX = s.x + s.w / 2;
      const baseRole = normalizeImp1RoleToBase(cut.position);
      const xb = IMP1_VERTICAL_ROLES.includes(baseRole)
        ? imp1Bands.find(b => inX(b, midX) && s.y < b.minY - 2 && (s.y + s.h) > b.maxY + 2) : null;
      if (xb) {
        const mk = (y0, y1, pos) => ({ position: pos, length: dxfRound(y1 - y0), count: cut.count || 1,
          src: { x: s.x, y: dxfRound(y0), w: s.w, h: dxfRound(y1 - y0), layer: s.layer } });
        next.push(mk(s.y, xb.minY, baseRole));
        next.push(mk(xb.minY, xb.maxY, toImp1Role(baseRole)));
        next.push(mk(xb.maxY, s.y + s.h, baseRole));
        continue;
      }
      next.push(cut);
    }
    cuts.length = 0; cuts.push(...next);
    // ---- Stage 2: reclassify EVERY vertical-family segment (just-split, DXF-native multi-
    // segment, or restored-from-snapshot) by its own overlap with the relevant band — not by
    // whether it happens to span the whole band itself. Always normalizes to the base role
    // first so a stale IMP-1 label never survives un-reevaluated (Leo: "先将旧的 Jamb (IMP-1)
    // 等 role normalize 回基础 role;再根据当前几何重新判断;否则旧 role 可能永久残留").
    // Boundary (Jamb) vs interior (Vertical/Vertical (wide)) identity is preserved throughout —
    // normalize→reclassify never merges the two families into one label.
    for (const cut of cuts) {
      const s = cut.src;
      if (!s || s.w > s.h) continue; // horizontals are never part of this vertical split
      const baseRole = normalizeImp1RoleToBase(cut.position);
      if (!IMP1_VERTICAL_ROLES.includes(baseRole)) continue;
      const midX = s.x + s.w / 2;
      const band = imp1Bands.find(b => inX(b, midX));
      if (!band) { cut.position = baseRole; continue; }
      // "majority inside the band" — segment overlaps the band by more than half its own
      // height. A segment that just touches a band edge (e.g. the above/below remainder after
      // Stage 1's split) has ~0 overlap and correctly stays the base role; a segment that IS
      // the band crossing (fresh, DXF-native, or restored) has high/full overlap.
      const segTop = s.y, segBot = s.y + s.h;
      const ovTop = Math.max(segTop, band.minY), ovBot = Math.min(segBot, band.maxY);
      const overlap = Math.max(0, ovBot - ovTop);
      const frac = s.h > 0 ? overlap / s.h : 0;
      cut.position = frac > 0.5 ? toImp1Role(baseRole) : baseRole;
    }
  }
  // #S3-followup (2026-07-17, Leo): "if it's glass top and bottom, then it's
  // horizontal(glass&glass)". Everything that borders IMP-1 or louver already got its own
  // label above (this step only ever sees whatever is still plain 'Horizontal'), so any
  // remaining plain 'Horizontal' that does NOT touch/cross an IMP-1 band is, by construction,
  // glass on both sides. A 'Horizontal' that DOES touch/cross the band is left unrelabeled —
  // its correct label (`Horizontal (IMP-1&Glass)`) needs a firm spec from Leo first (see
  // memory.md "Horizontal (IMP-1&Glass)").
  if (system === '750XT') {
    for (const cut of cuts) {
      if (cut.position !== 'Horizontal') continue;
      const s = cut.src; if (!s) continue;
      const midX = s.x + s.w / 2;
      const bordersImp1 = imp1Bands.some(b => inX(b, midX) &&
        (Math.abs(s.y - b.maxY) < 3 || Math.abs((s.y + s.h) - b.minY) < 3 || (s.y < b.maxY && (s.y + s.h) > b.minY)));
      if (!bordersImp1) cut.position = 'Horizontal (Glass&Glass)';
    }
  }
  // #whitelist (#2): constrain roles to those that belong to this system.
  applyRoleWhitelist(cuts, system);
  // #fix (2026-07-19, Leo — SF01 data loss): a piece the user has EXPLICITLY assigned a role to
  // via the elevation viewer's Position dropdown (state.roleEdits[mark][srcKey]) must never be
  // silently overridden by the automatic Stage 1/2 IMP-1 geometry reclassification above — that
  // is exactly what happened to SF01 (a hand-classified special case): the reclassification ran
  // on every restore and clobbered a deliberate manual choice with no way to protect it. Applied
  // LAST, after every automatic step, so an explicit per-piece pin always wins. Only covers
  // pieces pinned via the dropdown (state.roleEdits) — see the "changed vs. saved" detection at
  // the elevEdits restore call site for a broader safety net that also catches non-pinned drift.
  applyRolePins(cuts, mark, system);
}
// #recognized-roles (#2, 2026-07-20, Opus): re-apply the viewer Position-dropdown pins
// (state.roleEdits[mark]), EXCEPT any pin whose role Leo has since retired from this system's
// recognized list — those pins are deleted outright so they can never resurrect the retired role
// on a future re-import (the exact "stale role keeps coming back" symptom from HANDOFF Task 2).
// Factored out of classifyRoles so the sidebar's reapply pass (applyRecognizedRolesToAll) shares
// identical logic. When a system has NO manual recognized list, `recognized` is null and this is
// byte-for-byte the old behaviour — every pin re-applied — so the SF01 pin-protection guarantee is
// fully preserved for un-curated systems. Dropping a pin only happens after Leo has explicitly
// retired that role from the list, which is his deliberate instruction, not a silent override.
function applyRolePins(cuts, mark, system) {
  if (!(mark && typeof state !== 'undefined' && state.roleEdits && state.roleEdits[mark])) return;
  const pins = state.roleEdits[mark];
  const recognized = hasManualRecognizedList(system) ? recognizedRolesForSystem(system) : null;
  for (const cut of cuts) {
    if (!cut.src) continue;
    const k = srcKey(cut.src);
    const pinned = pins[k];
    if (pinned == null) continue;
    if (recognized && !recognized.has(pinned)) { delete pins[k]; continue; }  // retired role → drop stale pin
    cut.position = pinned;
  }
}
// #recognized-roles (#2): re-run the whitelist gate + pin pass over EVERY existing opening, so a
// change to a system's recognized list takes effect immediately on the openings already parsed
// (not only on the next DXF import). Deliberately does NOT re-run the geometric Stage 1/2 split
// (that's only needed when the DXF geometry itself changes) — it just re-gates roles and drops any
// now-retired pins. Net effect of removing a role R from system S: any cut still holding R is
// remapped via ROLE_REMAP if a chain lands in the recognized set (cascade step a); otherwise R
// stays visible as a one-time flag for manual fix (step c) but is now unpinned, so it will not
// resurface after the next re-import. (Live geometric re-derivation — cascade step b — is left to
// the next DXF re-import to avoid re-running the unverified-here split logic on live data.)
function applyRecognizedRolesToAll() {
  for (const o of (state.openings || [])) {
    if (!Array.isArray(o.cuts)) continue;
    applyRoleWhitelist(o.cuts, o.system);
    applyRolePins(o.cuts, o.mark, o.system);
  }
  save();
  if (typeof renderAll === 'function') renderAll();
}
// Programmatic curation API (also used by the sidebar UI). Pass a role array to set/replace the
// list for a system, or null to clear it (revert that system to the SYSTEM_DEFS-derived default).
function setRecognizedRoles(system, roles) {
  if (!system) return;
  state.recognizedRoles = state.recognizedRoles || {};
  if (roles == null) delete state.recognizedRoles[system];
  else state.recognizedRoles[system] = Array.from(new Set(roles.filter(Boolean)));
  applyRecognizedRolesToAll();
}
if (typeof window !== 'undefined') window.setRecognizedRoles = setRecognizedRoles;

// ============================================================
//  #template (2026-07-20, Opus — PROPAGATION-DESIGN.md §16): teach-by-example classification.
//  Leo builds a template from ONE correct reference elevation (its fill stack + the role of every
//  member), then applies it to future imports of the SAME fill layout. Matching is fill-order ONLY
//  (top→bottom sequence of louver/imp-1/glass/door), per Leo — no proportion or bay-count checks.
//  Apply is MANUAL (pick → preview → confirm) and LAYERS ON TOP of Layer A: Layer A still finds the
//  fills + members geometrically; the template only overrides ROLE labels. Templates persist in
//  state.roleTemplates + Firestore `roleTemplates` (one doc per template, same fetch-all/merge
//  pattern as elevEdits; deletion via a {deleted:true} tombstone since the fb wrapper has no
//  deleteDoc). Reuses _bands (kept on each opening) as the geometric source — the deleted Layer B
//  is NOT resurrected: matching here is a strict per-opening fill-sequence equality, not a loose
//  system-wide learned signature.
// ============================================================
// Fill stack for one opening, ordered TOP→BOTTOM. Full-width Y-bands only (louver/imp-1/glass);
// a door region contributes a 'door' band over its Y-extent. Contiguous glass merges.
function computeFillStack(bands) {
  if (!bands || !bands.bbox) return [];
  const bbox = bands.bbox, imp1Bands = bands.imp1Bands || [], louverBand = bands.louverBand, doorRegions = bands.doorRegions || [];
  const hard = [];
  if (louverBand) hard.push({ type: 'louver', minY: louverBand.minY, maxY: louverBand.maxY });
  for (const b of imp1Bands) hard.push({ type: 'imp-1', minY: b.minY, maxY: b.maxY });
  if (doorRegions.length) hard.push({ type: 'door', minY: bbox.minY, maxY: Math.max(...doorRegions.map(d => d.headY)) });
  hard.sort((a, b) => a.minY - b.minY);
  const zones = [];
  let cursor = bbox.minY;
  for (const b of hard) {
    if (b.minY - cursor > 2) zones.push({ type: 'glass', minY: cursor, maxY: b.minY });
    zones.push(b);
    cursor = Math.max(cursor, b.maxY);
  }
  if (bbox.maxY - cursor > 2) zones.push({ type: 'glass', minY: cursor, maxY: bbox.maxY });
  if (!zones.length) zones.push({ type: 'glass', minY: bbox.minY, maxY: bbox.maxY });
  return zones.slice().reverse();  // reverse bottom→top to Leo's top→bottom convention
}
function fillSequenceOf(fillStack) {
  return (fillStack || []).map(z => z.type).join('>');
}
// Auto-detected fill sequence for an opening, with dead-space glass removed: a 'glass' zone that
// contains NO framing member is empty space between/around storefronts, not a real fill. (This is
// what produced the bogus "glass>louver>glass>imp-1>glass" on SF02's stacked louver+main layout —
// the top gap and the gap between the two storefronts were counted as glass.) louver/imp-1/door
// are always kept. NOTE: auto-detect still can't know intent (e.g. whether one glass area is one
// fill or two split by a transom) — that's why the layout is manually overridable below.
function detectFillSequence(o) {
  if (!o || !o._bands) return '';
  const stack = computeFillStack(o._bands);
  const members = (o.cuts || []).filter(c => c.src);
  const kept = stack.filter(z => z.type !== 'glass' || members.some(c => { const my = c.src.y + c.src.h / 2; return my >= z.minY && my <= z.maxY; }));
  return fillSequenceOf(kept.length ? kept : stack);
}
// The fill sequence used for matching + saved on a template: Leo's MANUAL override (o.fillLayout,
// an ordered array of fill types top→bottom) if set, else the auto-detected one. Manual always
// wins — per project rule, every function must stay hand-adjustable.
function openingFillSequence(o) {
  if (o && Array.isArray(o.fillLayout) && o.fillLayout.length) return o.fillLayout.join('>');
  return detectFillSequence(o);
}
function setOpeningFillLayout(o, seqStr) {
  if (!o) return;
  const parts = String(seqStr || '').split('>').map(s => s.trim()).filter(Boolean);
  if (parts.length) o.fillLayout = parts; else delete o.fillLayout;
  save();
}
// A member's slot within a specific opening's fill stack: orientation + width class + whether it
// sits on the opening perimeter + which fill it's in + where in that fill. Scoped to ONE opening
// (not a system-wide key), so it's used only to transfer roles between same-layout elevations under
// an explicit template — never to auto-generalize (that looseness is what killed Layer B).
function memberKeyOf(cut, fillStack, bbox) {
  const s = cut && cut.src;
  if (!s || !bbox) return null;
  const orient = s.w > s.h ? 'H' : 'V';
  const widthClass = (orient === 'V' && s.w >= 3.5) ? 'wide' : 'narrow';
  const midY = s.y + s.h / 2, tol = 3;
  const atEdge = (v, e) => e != null && Math.abs(v - e) < tol;
  let region = 'interior';
  if (orient === 'H' && (atEdge(s.y, bbox.minY) || atEdge(s.y + s.h, bbox.maxY))) region = 'perimeter';
  else if (orient === 'V' && (atEdge(s.x, bbox.minX) || atEdge(s.x + s.w, bbox.maxX))) region = 'perimeter';
  const zones = fillStack || [];
  let zone = zones.find(z => midY >= z.minY && midY <= z.maxY);
  if (!zone && zones.length) zone = zones.reduce((best, z) => { const d = midY < z.minY ? z.minY - midY : midY - z.maxY; return (!best || d < best.d) ? { z, d } : best; }, null).z;
  const regionType = zone ? zone.type : 'glass';
  let regionEdge = 'through';
  if (zone) {
    if (orient === 'H') {
      const nearTop = Math.abs((s.y + s.h) - zone.maxY) < tol || Math.abs(s.y - zone.maxY) < tol;
      const nearBottom = Math.abs(s.y - zone.minY) < tol || Math.abs((s.y + s.h) - zone.minY) < tol;
      regionEdge = nearTop ? 'top' : nearBottom ? 'bottom' : 'through';
    } else {
      const overlap = Math.max(0, Math.min(s.y + s.h, zone.maxY) - Math.max(s.y, zone.minY));
      const frac = s.h > 0 ? overlap / s.h : 0;
      regionEdge = frac > 0.5 ? 'through' : (Math.abs((s.y + s.h) - zone.maxY) < Math.abs(s.y - zone.minY) ? 'top' : 'bottom');
    }
  }
  return [orient, widthClass, region, regionType, regionEdge].join('|');
}
// Build a template from a fully-correct opening: its fill sequence + one role per distinct member
// slot (first-wins; same-slot members in a valid storefront share a role, per Leo's simple model).
function buildTemplateFromOpening(o, name) {
  if (!o || !o._bands) return null;
  const fillStack = computeFillStack(o._bands), bbox = o._bands.bbox, members = [], seen = new Set();
  for (const c of (o.cuts || [])) {
    if (!c.src) continue;
    const key = memberKeyOf(c, fillStack, bbox);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    members.push({ key, role: c.position });
  }
  return { id: uid(), name: String(name || o.mark || 'Template').trim(), system: o.system || '',
    fillSequence: openingFillSequence(o), members, createdAt: Date.now(), updatedAt: Date.now() };
}
// Templates that could apply to this opening: same system AND identical top→bottom fill sequence.
function templatesMatchingOpening(o) {
  if (!o || !o._bands) return [];
  const seq = openingFillSequence(o);
  return (state.roleTemplates || []).filter(t => t.system === o.system && t.fillSequence === seq);
}
// Compute (and optionally commit) the role changes a template would make to an opening. Never
// silent — the UI previews `changes` and only calls again with {commit:true} on confirm. Committing
// also pins each changed role into state.roleEdits so it survives a future re-import (reuses the #1
// pin machinery; those pins are Leo's chosen roles, so the recognized-roles gate keeps them).
function applyTemplateToOpening(o, templateId, opts) {
  opts = opts || {};
  const t = (state.roleTemplates || []).find(x => x.id === templateId);
  if (!t || !o || !o._bands) return { changes: [], applied: false };
  const fillStack = computeFillStack(o._bands), bbox = o._bands.bbox;
  const byKey = new Map(t.members.map(m => [m.key, m.role]));
  const changes = [];
  for (const c of (o.cuts || [])) {
    if (!c.src) continue;
    const role = byKey.get(memberKeyOf(c, fillStack, bbox));
    if (role && role !== c.position) changes.push({ cut: c, from: c.position, to: role });
  }
  if (opts.commit) {
    for (const ch of changes) {
      ch.cut.position = ch.to;
      if (o.mark && ch.cut.src) { state.roleEdits = state.roleEdits || {}; (state.roleEdits[o.mark] = state.roleEdits[o.mark] || {})[srcKey(ch.cut.src)] = ch.to; }
    }
    o.appliedTemplate = t.id;
    if (typeof persistElevEdits === 'function') persistElevEdits(o);
    save();
  }
  return { changes, applied: !!opts.commit };
}
// ---- template persistence (local + Firestore `roleTemplates`) ----
function saveRoleTemplate(t) {
  if (!t || !t.id) return;
  state.roleTemplates = state.roleTemplates || [];
  const i = state.roleTemplates.findIndex(x => x.id === t.id);
  if (i >= 0) state.roleTemplates[i] = t; else state.roleTemplates.push(t);
  save();
  const fb = window.__fb;
  if (fb && fb.setDoc) {
    try { fb.setDoc(fb.doc(fb.elevDb || fb.db, 'roleTemplates', String(t.id)), Object.assign({}, t, { updatedAt: fb.serverTimestamp() }), { merge: true }).catch(err => console.warn('[roleTemplates] push failed:', err)); }
    catch (err) { console.warn('[roleTemplates] push failed:', err); }
  }
}
function deleteRoleTemplate(id) {
  state.roleTemplates = (state.roleTemplates || []).filter(t => t.id !== id);
  save();
  const fb = window.__fb;
  if (fb && fb.setDoc) {   // tombstone (fb wrapper has no deleteDoc) — loader skips deleted docs
    try { fb.setDoc(fb.doc(fb.elevDb || fb.db, 'roleTemplates', String(id)), { deleted: true, members: [], updatedAt: fb.serverTimestamp() }, { merge: true }).catch(() => {}); } catch (_) {}
  }
}
function loadRoleTemplatesFromCloud() {
  const fb = window.__fb;
  if (!fb || !fb.getDocs || !fb.collection) return;
  fb.getDocs(fb.collection(fb.elevDb || fb.db, 'roleTemplates')).then(snap => {
    const cloud = [];
    snap.forEach(d => { const data = d.data() || {}; if (data && !data.deleted && Array.isArray(data.members)) cloud.push(Object.assign({}, data, { id: d.id })); });
    state.roleTemplates = cloud;
    save();
    if (typeof renderRoleTemplates === 'function') renderRoleTemplates();
  }).catch(err => console.warn('[roleTemplates] load failed:', err));
}
if (typeof window !== 'undefined') {
  if (window.__fb) loadRoleTemplatesFromCloud();
  else window.addEventListener('fb-ready', loadRoleTemplatesFromCloud, { once: true });
}

// 手动修改识别: 点立面图色块/底部 chip 选中某根料 → 内联编辑器(位置/长度/数量/删除); "+ Add cut" 新增。
let viewerOpeningId = null;
let viewerEditIdx = null;
let _viewerGeom = null;      // #2: {minX,maxY} to map a click back to src coords
let viewerSplitSrc = null;   // #2: src-coord point where the user last clicked (for precise split)
let viewerShowGasket = false;  // #gasket-viz (2026-07-19): toggle framing view ↔ gasket diagram
let viewerShowCutting = false; // #cutting-diagram (2026-07-20): toggle framing view ↔ per-elevation cutting diagram
// #5: floating tooltip showing a role's section drawing (from role-sections.js) on hover.
function _ensureRoleTip() {
  let t = document.getElementById('role-tip');
  if (!t) {
    t = document.createElement('div');
    t.id = 'role-tip';
    t.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;background:#fff;border:1px solid #ccc;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.18);padding:8px 10px;display:none;max-width:230px;font:12px var(--af-font-sans,system-ui);';
    document.body.appendChild(t);
  }
  return t;
}
function showRoleTip(e, cut, system) {
  if (!cut) return;
  const pos = cutDisplayPosition(cut, system);
  const sec = (window.ROLE_SECTIONS || {})[pos];
  const t = _ensureRoleTip();
  t.innerHTML = `<div style="font-weight:600;margin-bottom:4px;">${escHtml(pos)}</div>` +
    (sec ? `<div style="width:128px;height:92px;display:flex;align-items:center;justify-content:center;">${sec}</div>` : `<div style="color:#999;">no section drawing</div>`);
  t.style.display = 'block';
  moveRoleTip(e);
}
function moveRoleTip(e) {
  const t = document.getElementById('role-tip');
  if (!t || t.style.display === 'none') return;
  t.style.left = (e.clientX + 14) + 'px';
  t.style.top = (e.clientY + 14) + 'px';
}
function hideRoleTip() { const t = document.getElementById('role-tip'); if (t) t.style.display = 'none'; }

function renderViewer(openingId) {
  const o = state.openings.find(x => x.id === openingId);
  const sec = document.getElementById('viewer-section');
  if (!o || !sec) return;
  if (openingId !== viewerOpeningId) viewerEditIdx = null;
  viewerOpeningId = openingId;
  const box = document.getElementById('viewer-box');
  const legend = document.getElementById('viewer-legend');
  const editBox = document.getElementById('viewer-edit');
  document.getElementById('viewer-sub').textContent =
    `${o.mark} — ${o.system} · ${formatNumber(o.width)}" × ${formatNumber(o.height)}"`;
  sec.style.display = '';
  const cuts = o.cuts || (o.cuts = []);
  if (viewerEditIdx != null && (viewerEditIdx < 0 || viewerEditIdx >= cuts.length)) viewerEditIdx = null;

  // #gasket-viz (2026-07-19, Leo: "gasket takeoff is still not accurate... draw gasket lines so
  // I can know how you do the takeoff"): toggle button, always shown when this mark has an
  // exported elevation (built alongside every parse, in ELEV_EXPORTS). Framing view is default;
  // switching to the gasket diagram shows the same SVG buildElevExport pushes to the tracker
  // (infill cells colored by type + both infill gasket loops + the perimeter loop(s)) without
  // needing Firestore — this is exactly the geometry the gasketLF numbers are computed from.
  const _exExport = ELEV_EXPORTS.get(o.mark);
  const _cutGroups = viewerShowCutting ? buildOpeningPacking(o) : null;
  const toggleHtml =
    (_exExport ? `<button class="tk-btn tk-btn--ghost tk-btn--sm" id="vc-toggle-gasket" style="float:right;margin-left:6px;">${viewerShowGasket ? '📐 Framing view' : '🧵 Gasket diagram'}</button>` : '') +
    `<button class="tk-btn tk-btn--ghost tk-btn--sm" id="vc-toggle-cutting" style="float:right;">${viewerShowCutting ? '📐 Framing view' : '📏 Cutting diagram'}</button>`;
  const subEl = document.getElementById('viewer-sub');
  if (subEl && subEl.parentElement) {
    let btnHost = document.getElementById('viewer-gasket-toggle-host');
    if (!btnHost) {
      btnHost = document.createElement('span');
      btnHost.id = 'viewer-gasket-toggle-host';
      subEl.parentElement.appendChild(btnHost);
    }
    btnHost.innerHTML = toggleHtml;
  }
  // #cutting-diagram (2026-07-20, Leo: "show me how pieces for each part align on a 24' line...
  // do this for each elevation separately... export in cad/dxf"): pure-line preview (no per-piece
  // color/label, just baseline + cut ticks — packFFDLayout/stickTickPositions are the single
  // source of truth shared with the DXF export below) scoped to THIS opening only, plus a
  // one-click DXF download for this elevation.
  if (viewerShowCutting) {
    if (!_cutGroups.length) {
      box.innerHTML = `<div style="padding:18px;color:#888;font-size:13px;">No parts with stock cuts for ${escHtml(o.mark)} yet.</div>`;
    } else {
      box.innerHTML = renderCuttingSvg(_cutGroups, o.mark);
    }
    box.onmouseover = null; box.onmousemove = null; box.onmouseout = null;
    legend.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:12px;align-items:center;">
        ${_cutGroups.map(g => `<span>${escHtml(g.partNumber)} · ${g.sticks.length} stick${g.sticks.length === 1 ? '' : 's'}</span>`).join('')}
        ${_cutGroups.length ? `<button class="tk-btn tk-btn--ghost tk-btn--sm" id="vc-export-cutting-dxf">⬇ Export DXF (this elevation)</button>` : ''}
      </div>
      <div style="margin-top:6px;font-size:11px;color:#999;">One bar per 24′ stick with a tick line at each cut — open on the right unless the stick is fully used (leftover length labeled). Part name to the left of each pile, stick number per row, elevation mark as the header. Layer per part number in the DXF.</div>`;
    if (editBox) editBox.innerHTML = '';
    return;
  }
  if (viewerShowGasket && _exExport) {
    const d = _exExport.data;
    const elRects = (d.elements || []).map(el => {
      const col = { glass: '#bcd6ee', panel: '#c9c9c9', louver: '#bfe6c8', door: '#f2c48a' }[el.t0] || '#ddd';
      return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${col}" fill-opacity="0.55" stroke="none"><title>${escHtml(el.t0)}</title></rect>`;
    }).join('');
    box.innerHTML = `<svg viewBox="${d.viewBox}" style="width:100%;max-height:520px;display:block;background:#0b0e12;">${elRects}${d.base}</svg>`;
    box.onmouseover = null; box.onmousemove = null; box.onmouseout = null;
    legend.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:12px;">
        <span><span style="display:inline-block;width:12px;height:12px;background:#bcd6ee;margin-right:5px;"></span>Glass cell</span>
        <span><span style="display:inline-block;width:12px;height:12px;background:#c9c9c9;margin-right:5px;"></span>IMP-1/panel cell</span>
        <span><span style="display:inline-block;width:12px;height:12px;background:#bfe6c8;margin-right:5px;"></span>Louver (no infill gasket)</span>
        <span><span style="display:inline-block;width:12px;height:12px;background:#f2c48a;margin-right:5px;"></span>Door (no infill gasket)</span>
        <span><span style="display:inline-block;width:16px;height:0;border-top:2px dashed #2dd4bf;margin-right:5px;vertical-align:middle;"></span>E2-0127 glass gasket (2 loops/cell = interior+exterior)</span>
        <span><span style="display:inline-block;width:16px;height:0;border-top:2px dashed #f97316;margin-right:5px;vertical-align:middle;"></span>E2-0120 IMP-1 infill gasket (2 loops/cell)</span>
        <span><span style="display:inline-block;width:16px;height:0;border-top:2px solid #eab308;margin-right:5px;vertical-align:middle;"></span>E2-0120 storefront perimeter (1 loop/independent zone)</span>
      </div>
      <div style="margin-top:6px;font-size:11px;color:#999;">
        Glass ${_exExport.gaskets ? formatNumber(_exExport.gaskets.glass) : 0}LF · IMP-1 infill ${_exExport.gaskets ? formatNumber(_exExport.gaskets.imp1) : 0}LF · Perimeter ${_exExport.gaskets ? formatNumber(_exExport.gaskets.perimeter) : 0}LF
      </div>`;
    if (editBox) editBox.innerHTML = '';
    return;
  }

  const srcs = cuts.filter(c => c.src);
  if (srcs.length) {
    const minX = Math.min(...srcs.map(c => c.src.x));
    const maxX = Math.max(...srcs.map(c => c.src.x + c.src.w));
    const minY = Math.min(...srcs.map(c => c.src.y));
    const maxY = Math.max(...srcs.map(c => c.src.y + c.src.h));
    _viewerGeom = { minX, maxY };   // #2
    const W = maxX - minX, H = maxY - minY, pad = Math.max(W, H) * 0.04 + 2;
    const minVis = Math.max(W, H) * 0.005;
    const ordered = [...srcs].sort((a, b) => (b.src.w * b.src.h) - (a.src.w * a.src.h));
    const rects = ordered.map(c => {
      const idx = cuts.indexOf(c);
      const s = c.src;
      let y0 = s.y, hh = s.h;
      if (s.h > c.length + 0.6 && (c.position === 'Door Jamb' || c.position === 'Door Jamb At Transom')) {
        hh = c.length;
        if (c.position === 'Door Jamb At Transom') y0 = s.y + s.h - c.length;
      }
      const x = s.x - minX, y = maxY - (y0 + hh); // DXF y朝上 → SVG y朝下
      const dp = cutDisplayPosition(c, o.system);
      const col = cutColor(dp, o.system);
      const sel = idx === viewerEditIdx;
      return `<rect data-cut="${idx}" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${Math.max(s.w, minVis).toFixed(2)}" height="${Math.max(hh, minVis).toFixed(2)}" fill="${col}" fill-opacity="0.85" stroke="${sel ? '#ff2d2d' : '#222'}" stroke-width="${(Math.max(W, H) * (sel ? 0.006 : 0.0015)).toFixed(3)}" style="cursor:pointer;"><title>${escHtml(dp)} — ${formatNumber(c.length)}"${s.layer ? ' · ' + escHtml(s.layer) : ''}  (click to edit)</title></rect>`;
    }).join('');
    box.innerHTML = `<svg viewBox="${(-pad).toFixed(2)} ${(-pad).toFixed(2)} ${(W + 2 * pad).toFixed(2)} ${(H + 2 * pad).toFixed(2)}" style="width:100%;max-height:520px;display:block;">${rects}</svg>`;
    box.onmouseover = e => { const r = e.target.closest && e.target.closest('rect[data-cut]'); if (r) showRoleTip(e, cuts[+r.getAttribute('data-cut')], o.system); };   // #5: role section on hover
    box.onmousemove = moveRoleTip;
    box.onmouseout = e => { if (e.target.closest && e.target.closest('rect[data-cut]')) hideRoleTip(); };
  } else {
    box.innerHTML = `<div style="padding:18px;color:#888;font-size:13px;">No source geometry. Edit with the chips below, or click "+ Add cut" to add a piece.</div>`;
  }

  // 无溯源料(手动加的/手填) → 可点 chip
  const manual = cuts.map((c, i) => ({ c, i })).filter(x => !x.c.src);
  let html = '';
  const _ovm = state.roleEdits && state.roleEdits[o.mark];   // legacy role-only overrides
  const _elevRec = state.elevEdits && state.elevEdits[o.mark];
  const _sev = _elevRec && (_elevRec.cuts || []).length;   // #persist: full saved edit-set (synced)
  if (_sev || (_ovm && Object.keys(_ovm).length)) {
    const _n = _sev || Object.keys(_ovm).length;
    const _label = _sev ? `Saved manual edits on ${escHtml(o.mark)}: ${_n} pieces · synced` : `Manual role overrides on ${escHtml(o.mark)}: ${_n} remembered`;
    html += `<div style="margin:6px 0;font-size:11px;color:#999;">${_label} · <button class="tk-btn tk-btn--ghost tk-btn--sm" id="vc-clear-ov" title="Forget saved edits for this mark (next import reverts to pure auto-detection)">× clear</button></div>`;
  }
  html += templateControlsHtml(o);   // #template (2026-07-20): Save-as / Apply template row
  // #history (2026-07-19, Leo — SF01 data loss): show the last N saved versions for this mark
  // with a one-click Restore, so an overwrite (auto-reclassification, a bad manual edit, etc.)
  // is always recoverable from inside the app — there is no external backup for this data.
  const _hist = (_elevRec && Array.isArray(_elevRec.history)) ? _elevRec.history : [];
  if (_hist.length) {
    const fmtWhen = t => { try { return new Date(t).toLocaleString(); } catch (_) { return ''; } };
    html += `<div style="margin:6px 0;font-size:11px;color:#999;">
      <details><summary style="cursor:pointer;">🕐 Version history (${_hist.length})</summary>
      <div style="margin-top:4px;display:flex;flex-direction:column;gap:4px;">
        ${_hist.map((h, i) => `<div style="display:flex;align-items:center;gap:8px;">
          <span>${fmtWhen(h.updatedAt)} · ${(h.cuts || []).length} pieces</span>
          <button class="tk-btn tk-btn--ghost tk-btn--sm" data-restore-hist="${i}" title="Restore this version (today's version is saved to history first)">↺ Restore</button>
        </div>`).join('')}
      </div></details></div>`;
  }
  // #fix (2026-07-19): visible warning when restoring a saved snapshot caused the automatic
  // classifier to change a piece that was never explicitly pinned — surfaces drift instead of
  // letting it silently overwrite the saved version on the next edit (the SF01 failure mode).
  if (o._reclassifiedDrift && o._reclassifiedDrift.length) {
    html += `<div style="margin:6px 0;padding:6px 10px;border:1px solid #d9822b;border-radius:6px;background:rgba(217,130,43,.12);font-size:11px;">
      ⚠ ${o._reclassifiedDrift.length} piece(s) changed from your saved version when reclassified:
      ${o._reclassifiedDrift.map(d => `${escHtml(d.from)} → ${escHtml(d.to)}`).join(', ')}.
      Use Version history above to restore the previous version if this wasn't intended.</div>`;
  }
  if (manual.length) {
    html += `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;font-size:12px;">`
      + manual.map(({ c, i }) => {
          const dp = cutDisplayPosition(c, o.system);
          return `<span data-cut="${i}" style="cursor:pointer;padding:2px 8px;border:1px solid ${i === viewerEditIdx ? '#ff2d2d' : '#bbb'};border-radius:10px;">${escHtml(dp)} · ${formatNumber(c.length)}″ ×${c.count || 1}</span>`;
        }).join('')
      + `</div>`;
  }
  // 选中料的编辑器
  if (viewerEditIdx != null && cuts[viewerEditIdx]) {
    const c = cuts[viewerEditIdx];
    html += `
      <div style="margin-top:10px;padding:10px 12px;border:1px solid var(--af-line,#ddd);border-radius:8px;background:var(--af-bg-2,#f6f6f6);display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:13px;">
        <b>Edit piece #${viewerEditIdx + 1}</b>
        <label>Position <select id="vc-pos" class="tk-cell-select">${POSITIONS.map(p => `<option value="${escAttr(p)}" ${p === c.position ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
        <label>Length <input id="vc-len" class="tk-cell-input num" type="number" step="0.125" value="${c.length}" style="width:84px;" />″</label>
        <label>Count <input id="vc-cnt" class="tk-cell-input num" type="number" min="1" step="1" value="${c.count || 1}" style="width:60px;" /></label>
        ${c.src ? `<button class="tk-btn tk-btn--ghost tk-btn--sm" id="vc-split" title="Split this piece in two at the point you clicked">✂ Split here</button>
        <button class="tk-btn tk-btn--ghost tk-btn--sm" id="vc-merge" title="Merge with the adjacent in-line piece of the same role">⧉ Merge</button>` : ''}
        <button class="tk-btn tk-btn--ghost tk-btn--sm" id="vc-del">Delete piece</button>
        <button class="tk-btn tk-btn--ghost tk-btn--sm" id="vc-done">Done</button>
      </div>`;
  }
  if (editBox) editBox.innerHTML = html;

  const agg = {};
  for (const c of cuts) {
    const dp = cutDisplayPosition(c, o.system);
    if (!agg[dp]) agg[dp] = { len: 0, n: 0 };
    agg[dp].len += c.length * (c.count || 1);
    agg[dp].n += (c.count || 1);
  }
  legend.innerHTML = Object.entries(agg).map(([p, a]) =>
    `<span style="display:inline-flex;align-items:center;gap:5px;"><span style="width:12px;height:12px;border-radius:3px;border:1px solid #555;background:${cutColor(p, o.system)};"></span>${escHtml(p)} · ${a.n} pcs · ${formatNumber(a.len)}"</span>`
  ).join('');
  sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function refreshAfterCutEdit() {
  save();
  if (viewerOpeningId != null) {
    const o = state.openings.find(x => x.id === viewerOpeningId);
    if (o) persistElevEdits(o);   // #persist (#1): save full edit-set (local + cloud)
    renderViewer(viewerOpeningId);
  }
  renderReport(); renderMeta(); renderOpenings();
}

document.addEventListener('click', e => {
  if (!e.target || !e.target.closest) return;
  if (e.target.closest('#vc-toggle-gasket') && viewerOpeningId != null) {   // #gasket-viz: framing ↔ gasket diagram toggle
    viewerShowGasket = !viewerShowGasket;
    if (viewerShowGasket) viewerShowCutting = false;
    renderViewer(viewerOpeningId);
    return;
  }
  if (e.target.closest('#vc-toggle-cutting') && viewerOpeningId != null) {   // #cutting-diagram: framing ↔ cutting diagram toggle
    viewerShowCutting = !viewerShowCutting;
    if (viewerShowCutting) viewerShowGasket = false;
    renderViewer(viewerOpeningId);
    return;
  }
  if (e.target.closest('#vc-export-cutting-dxf') && viewerOpeningId != null) {   // #cutting-diagram: export this elevation's DXF
    const o = state.openings.find(x => x.id === viewerOpeningId);
    if (o) downloadCuttingDxf(o);
    return;
  }
  if (e.target.closest('#vc-fill-auto') && viewerOpeningId != null) {   // #template: reset fill layout to auto-detected
    const o = state.openings.find(x => x.id === viewerOpeningId);
    if (o) { delete o.fillLayout; save(); renderViewer(viewerOpeningId); }
    return;
  }
  if (e.target.closest('#vc-save-template') && viewerOpeningId != null) {   // #template: save this elevation as a reusable template
    const o = state.openings.find(x => x.id === viewerOpeningId);
    if (o && o._bands) {
      const name = prompt('Template name:', o.mark || 'Template');
      if (name) { const t = buildTemplateFromOpening(o, name); if (t) { saveRoleTemplate(t); renderRoleTemplates(); renderViewer(viewerOpeningId); } }
    } else if (o) { alert('This opening has no parsed geometry — templates need a DXF-imported elevation.'); }
    return;
  }
  if (e.target.closest('#vc-apply-template') && viewerOpeningId != null) {   // #template: preview then apply
    const o = state.openings.find(x => x.id === viewerOpeningId);
    const pick = document.getElementById('vc-template-pick');
    const id = pick && pick.value;
    if (o && id) {
      const prev = applyTemplateToOpening(o, id, { commit: false });
      if (!prev.changes.length) { alert('This template would not change any roles on this elevation.'); return; }
      const summary = prev.changes.slice(0, 12).map(c => `• ${c.from} → ${c.to}`).join('\n');
      const more = prev.changes.length > 12 ? `\n…and ${prev.changes.length - 12} more` : '';
      if (confirm(`Apply template — ${prev.changes.length} role change(s):\n\n${summary}${more}`)) {
        applyTemplateToOpening(o, id, { commit: true });
        refreshAfterCutEdit();
      }
    }
    return;
  }
  { // #template: delete a saved template from the sidebar list
    const delBtn = e.target.closest('.tmpl-del');
    if (delBtn) {
      const id = delBtn.getAttribute('data-tmpl');
      const t = (state.roleTemplates || []).find(x => x.id === id);
      if (t && confirm(`Delete template "${t.name}"?`)) { deleteRoleTemplate(id); renderRoleTemplates(); }
      return;
    }
  }
  if (e.target.closest('#viewer-close')) {
    document.getElementById('viewer-section').style.display = 'none';
    viewerEditIdx = null;
    return;
  }
  if (e.target.closest('#vc-clear-ov') && viewerOpeningId != null) {   // forget saved edits for this mark (local + cloud)
    const o = state.openings.find(x => x.id === viewerOpeningId);
    if (o) { clearElevEdits(o.mark); renderViewer(viewerOpeningId); }
    return;
  }
  { // #history: restore a prior version for the mark currently open in the viewer
    const restoreBtn = e.target.closest('[data-restore-hist]');
    if (restoreBtn && viewerOpeningId != null) {
      const o = state.openings.find(x => x.id === viewerOpeningId);
      const idx = +restoreBtn.getAttribute('data-restore-hist');
      if (o && restoreElevEditsVersion(o.mark, idx)) { renderReport(); renderMeta(); renderOpenings(); renderViewer(viewerOpeningId); }
      return;
    }
  }
  if (e.target.closest('#vc-split') && viewerOpeningId != null && viewerEditIdx != null) {   // #2: split at clicked point
    const o = state.openings.find(x => x.id === viewerOpeningId); const c = o && o.cuts && o.cuts[viewerEditIdx];
    if (c && c.src) {
      const s = c.src, R = dxfRound, vertical = s.h >= s.w; let a, b;
      if (vertical) { const yc = Math.min(Math.max((viewerSplitSrc ? viewerSplitSrc.y : s.y + s.h / 2), s.y + 0.5), s.y + s.h - 0.5);
        b = { ...c, length: R(yc - s.y), count: c.count || 1, src: { ...s, y: s.y, h: R(yc - s.y) } };
        a = { ...c, length: R(s.y + s.h - yc), count: c.count || 1, src: { ...s, y: yc, h: R(s.y + s.h - yc) } }; }
      else { const xc = Math.min(Math.max((viewerSplitSrc ? viewerSplitSrc.x : s.x + s.w / 2), s.x + 0.5), s.x + s.w - 0.5);
        a = { ...c, length: R(xc - s.x), count: c.count || 1, src: { ...s, x: s.x, w: R(xc - s.x) } };
        b = { ...c, length: R(s.x + s.w - xc), count: c.count || 1, src: { ...s, x: xc, w: R(s.x + s.w - xc) } }; }
      o.cuts.splice(viewerEditIdx, 1, a, b); viewerEditIdx = null; viewerSplitSrc = null; refreshAfterCutEdit();
    }
    return;
  }
  if (e.target.closest('#vc-merge') && viewerOpeningId != null && viewerEditIdx != null) {   // #2: merge with adjacent in-line piece
    const o = state.openings.find(x => x.id === viewerOpeningId); const c = o && o.cuts && o.cuts[viewerEditIdx];
    if (c && c.src) {
      const s = c.src, vertical = s.h >= s.w, tol = 1.2, gap = 10, R = dxfRound;
      const j = o.cuts.findIndex((k, ix) => ix !== viewerEditIdx && k.src && k.position === c.position && (vertical
        ? (Math.abs(k.src.x - s.x) < tol && (Math.abs((k.src.y + k.src.h) - s.y) < gap || Math.abs((s.y + s.h) - k.src.y) < gap))
        : (Math.abs(k.src.y - s.y) < tol && (Math.abs((k.src.x + k.src.w) - s.x) < gap || Math.abs((s.x + s.w) - k.src.x) < gap))));
      if (j < 0) { alert('No adjacent in-line piece of the same role to merge.'); return; }
      const k = o.cuts[j];
      if (vertical) { const y0 = Math.min(s.y, k.src.y), y1 = Math.max(s.y + s.h, k.src.y + k.src.h); c.src = { ...s, y: y0, h: R(y1 - y0) }; c.length = R(y1 - y0); }
      else { const x0 = Math.min(s.x, k.src.x), x1 = Math.max(s.x + s.w, k.src.x + k.src.w); c.src = { ...s, x: x0, w: R(x1 - x0) }; c.length = R(x1 - x0); }
      o.cuts.splice(j, 1); if (j < viewerEditIdx) viewerEditIdx--; refreshAfterCutEdit();
    }
    return;
  }
  // 选中某根料(立面图色块 或 底部 chip)
  const cutEl = e.target.closest('[data-cut]');
  if (cutEl && (cutEl.closest('#viewer-box') || cutEl.closest('#viewer-edit')) && viewerOpeningId != null) {
    viewerEditIdx = parseInt(cutEl.getAttribute('data-cut'), 10);
    viewerSplitSrc = null;   // #2: capture the clicked point (in src coords) for a precise split
    const svg = cutEl.ownerSVGElement;
    if (svg && _viewerGeom && svg.getScreenCTM) { try { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse()); viewerSplitSrc = { x: p.x + _viewerGeom.minX, y: _viewerGeom.maxY - p.y }; } catch (_) {} }
    renderViewer(viewerOpeningId);
    return;
  }
  if (e.target.closest('#viewer-addcut') && viewerOpeningId != null) {
    const o = state.openings.find(x => x.id === viewerOpeningId);
    if (o) {
      o.cuts = o.cuts || [];
      o.cuts.push({ position: 'Head', length: dxfRound(o.width || 24), count: 1 });
      viewerEditIdx = o.cuts.length - 1;
      refreshAfterCutEdit();
    }
    return;
  }
  if (e.target.closest('#vc-del') && viewerOpeningId != null && viewerEditIdx != null) {
    const o = state.openings.find(x => x.id === viewerOpeningId);
    if (o && o.cuts && o.cuts[viewerEditIdx]) { o.cuts.splice(viewerEditIdx, 1); viewerEditIdx = null; refreshAfterCutEdit(); }
    return;
  }
  if (e.target.closest('#vc-done')) { viewerEditIdx = null; if (viewerOpeningId != null) renderViewer(viewerOpeningId); return; }
});

// 编辑器字段改动(位置/长度/数量)
document.addEventListener('change', e => {
  if (e.target && e.target.id === 'vc-fill-layout' && viewerOpeningId != null) {   // #template: manual fill-layout override
    const o = state.openings.find(x => x.id === viewerOpeningId);
    if (o) { setOpeningFillLayout(o, e.target.value); renderViewer(viewerOpeningId); }
    return;
  }
  if (viewerOpeningId == null || viewerEditIdx == null) return;
  if (!e.target.closest || !e.target.closest('#viewer-edit')) return;
  const o = state.openings.find(x => x.id === viewerOpeningId);
  if (!o || !o.cuts || !o.cuts[viewerEditIdx]) return;
  const c = o.cuts[viewerEditIdx];
  if (e.target.id === 'vc-pos') {
    c.position = e.target.value;
    if (c.src && o.mark) {   // T3: remember this manual role override (survives DXF re-import)
      state.roleEdits = state.roleEdits || {};
      (state.roleEdits[o.mark] = state.roleEdits[o.mark] || {})[srcKey(c.src)] = c.position;
    }
  }
  else if (e.target.id === 'vc-len') c.length = parseFloat(e.target.value) || 0;
  else if (e.target.id === 'vc-cnt') c.count = Math.max(1, parseInt(e.target.value) || 1);
  else return;
  refreshAfterCutEdit();
});

// ---------- Accessories takeoff (rules engine) ----------
const ACC_RULES = {
  per_piece:   { label: '/ piece',   paramLabel: 'qty per piece' },
  per_spacing: { label: 'spacing',   paramLabel: 'o.c. inches'   },
  per_lf:      { label: '× LF',      paramLabel: 'factor'        },
  per_lite:    { label: '/ lite',    paramLabel: 'qty per lite'  },
  per_opening: { label: '/ opening', paramLabel: 'qty per opening' },
};

function computeAccessories() {
  // 按系统聚合: 每个 system 一份 {pos, lites, openingsQty}; system '' 视为全部洞口(旧通用行为)
  const bySys = {};
  const agg = (sys) => bySys[sys] || (bySys[sys] = { pos: {}, lites: 0, openingsQty: 0 });
  const allOpen = { pos: {}, lites: 0, openingsQty: 0 };
  const tally = (g, o, q) => {
    g.openingsQty += q;
    g.lites += (parseFloat(o.lites) || 0) * q;
    for (const c of expandOpeningCuts(o)) {
      const p = g.pos[c.position] || (g.pos[c.position] = { inches: 0, pieces: 0, lens: [] });
      p.inches += c.length * c.count * q;
      p.pieces += c.count * q;
      for (let i = 0; i < c.count * q; i++) p.lens.push(c.length);
    }
  };
  for (const o of state.openings) {
    const q = o.qty || 1;
    tally(agg(o.system || ''), o, q);
    tally(allOpen, o, q);
  }
  const ruleRows = (state.accessories || []).map(a => {
    const g = (a.system === '' || a.system === undefined) ? allOpen : (bySys[a.system] || { pos: {}, lites: 0, openingsQty: 0 });
    const pos = g.pos, lites = g.lites, openingsQty = g.openingsQty;
    const sel = (a.positions && a.positions.length) ? a.positions : Object.keys(pos);
    let inches = 0, pieces = 0, lens = [];
    for (const p of sel) if (pos[p]) {
      inches += pos[p].inches; pieces += pos[p].pieces; lens = lens.concat(pos[p].lens);
    }
    const param = parseFloat(a.param) || 0;
    const mn = parseFloat(a.min) || 0;
    let qty = 0, basis = '';
    if (a.rule === 'per_piece') {
      qty = Math.ceil(param * pieces);
      basis = `${pieces} pcs × ${param}`;
    } else if (a.rule === 'per_lite') {
      qty = Math.ceil(param * lites);
      basis = `${formatNumber(lites)} lites × ${param}`;
    } else if (a.rule === 'per_opening') {
      qty = Math.ceil(param * openingsQty);
      basis = `${openingsQty} openings × ${param}`;
    } else if (a.rule === 'per_spacing') {
      qty = param > 0 ? lens.reduce((acc, L) => acc + Math.max(mn, Math.floor(L / param) + 1), 0) : 0;
      basis = `${lens.length} pcs @ ${param}" o.c., min ${mn}/pc`;
    } else if (a.rule === 'per_lf') {
      qty = Math.ceil(param * inches / 12 * 10) / 10;
      basis = `${formatNumber(inches)}" × ${param} ÷ 12`;
    }
    return { acc: a, qty, basis };
  });
  // Perimeter-based gaskets computed at DXF import (state.openings[].gasketLF). Read-only rows
  // in the table. #fix (2026-07-18, Leo §一/§七): infill gasket (glass/IMP-1) and storefront
  // perimeter gasket are TWO INDEPENDENT takeoffs — kept as separate semantic keys
  // (imp1/glass/perimeter) all the way from buildElevExport so they never get summed together,
  // even though `imp1` and `perimeter` happen to use the same physical part number (E2-0120).
  const gsum = { imp1: 0, glass: 0, perimeter: 0 };
  for (const o of state.openings) { const gk = o.gasketLF; if (!gk) continue; const q = o.qty || 1; for (const k in gsum) gsum[k] += (+gk[k] || 0) * q; }
  const GASKET_DEFS = {
    imp1:      { partNumber: 'E2-0120', description: 'Gasket — IMP-1 infill ×2 (interior + exterior)', box: 500 },
    glass:     { partNumber: 'E2-0127', description: 'Gasket — glass infill ×2 (interior + exterior)', box: 250 },
    perimeter: { partNumber: 'E2-0120', description: 'Gasket — storefront perimeter ×1 (per independent zone)', box: 500 },
  };
  const gaskRows = Object.keys(gsum).filter(k => gsum[k] > 0.05).map(k => {
    const def = GASKET_DEFS[k];
    const lf = Math.round(gsum[k] * 10) / 10, boxes = def.box ? Math.ceil(lf / def.box) : 0;
    return { acc: { _computed: true, partNumber: def.partNumber, description: def.description, rule: 'perimeter', positions: [], param: '', min: 0, unit: 'LF', system: '750XT' }, qty: lf, basis: def.box ? (boxes + ' box' + (boxes > 1 ? 'es' : '') + ' @ ' + def.box + "'/box") : '' };
  });
  return ruleRows.concat(gaskRows);
}

function renderAccessories() {
  const tbody = document.getElementById('acc-tbody');
  if (!tbody) return;
  let rows = computeAccessories();
  const sysInUse = new Set(state.openings.map(o => o.system).filter(Boolean));
  if (sysInUse.size) rows = rows.filter(r => !r.acc.system || sysInUse.has(r.acc.system));
  if (!rows.length) {
    tbody.innerHTML = `<tr class="is-empty"><td colspan="9">No accessory rules — add one below.</td></tr>`;
    return;
  }
  const sysOpts = ['', ...SYSTEMS_LIST()];
  tbody.innerHTML = rows.map(({ acc: a, qty, basis }) => a._computed ? `
    <tr class="acc-computed" title="Computed from imported elevations — perimeter-based gasket (auto)">
      <td class="col-sys">${escHtml(a.system || '')}</td>
      <td class="col-mark mono">${escHtml(a.partNumber || '')}</td>
      <td>${escHtml(a.description || '')}</td>
      <td class="col-sys">perimeter</td>
      <td>auto (import)</td>
      <td class="col-num-sm">—</td>
      <td class="col-num-sm">—</td>
      <td class="col-num"><span class="acc-qty mono" title="${escAttr(basis)}">${formatNumber(qty)} ${escHtml(a.unit || 'ea')}</span></td>
      <td class="tk-rowdel" title="${escAttr(basis)}">🔒</td>
    </tr>
  ` : `
    <tr data-id="${a.id}">
      <td class="col-sys"><select class="tk-cell-select" data-afield="system">${sysOpts.map(s => `<option value="${escAttr(s)}" ${s === (a.system || '') ? 'selected' : ''}>${s || '(all)'}</option>`).join('')}</select></td>
      <td class="col-mark"><input class="tk-cell-input mono" data-afield="partNumber" value="${escAttr(a.partNumber || '')}" placeholder="P/N" /></td>
      <td><input class="tk-cell-input" data-afield="description" value="${escAttr(a.description || '')}" /></td>
      <td class="col-sys">
        <select class="tk-cell-select" data-afield="rule">
          ${Object.entries(ACC_RULES).map(([k, r]) => `<option value="${k}" ${k === a.rule ? 'selected' : ''}>${r.label}</option>`).join('')}
        </select>
      </td>
      <td><input class="tk-cell-input" data-afield="positions" value="${escAttr((a.positions || []).join(', '))}" placeholder="(all positions)" title="Comma-separated positions; empty = all" /></td>
      <td class="col-num-sm"><input class="tk-cell-input num" data-afield="param" type="number" step="0.05" value="${a.param}" title="${(ACC_RULES[a.rule] || {}).paramLabel || 'param'}" /></td>
      <td class="col-num-sm"><input class="tk-cell-input num" data-afield="min" type="number" step="1" value="${a.min || 0}" title="min per piece (spacing rule)" /></td>
      <td class="col-num"><span class="acc-qty mono" title="${escAttr(basis)}">${formatNumber(qty)} ${escHtml(a.unit || 'ea')}</span></td>
      <td class="tk-rowdel"><button class="tk-rowdel-btn" data-action="del-accessory" title="Delete rule">${ico('trash')}</button></td>
    </tr>
  `).join('');
}

document.addEventListener('input', e => {
  const tr = e.target.closest && e.target.closest('#acc-tbody tr[data-id]');
  if (!tr) return;
  const a = (state.accessories || []).find(x => x.id === tr.dataset.id);
  const f = e.target.dataset.afield;
  if (!a || !f) return;
  if (f === 'positions') a.positions = e.target.value.split(/[,;、]/).map(s => s.trim()).filter(Boolean);
  else if (f === 'param' || f === 'min') a[f] = parseFloat(e.target.value) || 0;
  else a[f] = e.target.value;
  save();
  // 只刷该行的 qty,不打断输入
  const row = computeAccessories().find(r => r.acc.id === a.id);
  const cell = tr.querySelector('.acc-qty');
  if (row && cell) { cell.textContent = `${formatNumber(row.qty)} ${a.unit || 'ea'}`; cell.title = row.basis; }
});

document.addEventListener('change', e => {
  const tr = e.target.closest && e.target.closest('#acc-tbody tr[data-id]');
  if (!tr) return;
  const f = e.target.dataset.afield;
  if (f !== 'rule' && f !== 'system') return;
  const a = (state.accessories || []).find(x => x.id === tr.dataset.id);
  if (a) { a[f] = e.target.value; save(); }
  renderAccessories();   // rule/system 变了要重算并(system)重新过滤
});

document.addEventListener('click', e => {
  if (!e.target.closest) return;
  if (e.target.closest('#acc-add')) {
    const defSys = (state.openings.find(o => o.system) || {}).system || SYSTEMS_LIST()[0] || '';
    state.accessories.push({ id: uid(), system: defSys, partNumber: '', description: '', rule: 'per_piece', positions: [], param: 1, min: 0, unit: 'ea' });
    save(); renderAccessories();
    return;
  }
  const del = e.target.closest('[data-action="del-accessory"]');
  if (del) {
    const tr = del.closest('tr[data-id]');
    state.accessories = (state.accessories || []).filter(x => x.id !== tr.dataset.id);
    save(); renderAccessories();
  }
});

// 报表刷新时联动辅料表
const _renderReportBase = renderReport;
renderReport = function () {
  const r = _renderReportBase.apply(this, arguments);
  try { renderAccessories(); } catch (e) {}
  return r;
};

function openingTotalInches(o) {
  // Per single opening (NOT multiplied by qty here) — just to show row-level info
  const cuts = expandOpeningCuts(o);
  const single = cuts.reduce((acc, c) => acc + c.length, 0);
  return single * (o.qty || 1);
}

// Returns array of {position, length, count} for ONE instance of opening (multiply by qty in aggregation)
function expandOpeningCuts(o) {
  if (Array.isArray(o.cuts) && o.cuts.length) {
    return o.cuts.map(c => ({
      position: cutDisplayPosition(c, o.system),   // 450 边门框 transom 以上段 → Jamb
      length: parseFloat(c.length) || 0,
      count: parseInt(c.count) || 1,
      src: c.src || null,                          // 连续件(continuous)跑长合并要用几何
    })).filter(c => c.position && c.length > 0 && c.count > 0);
  }
  const cuts = [];
  if (o.width  > 0) cuts.push({ position: 'Head', length: o.width, count: 1 });
  if (o.width  > 0) cuts.push({ position: 'Sill', length: o.width, count: 1 });
  if (o.height > 0) cuts.push({ position: 'Jamb', length: o.height, count: 2 });
  if (o.horiz  > 0 && o.width > 0) cuts.push({ position: 'Horizontal', length: o.width, count: o.horiz });
  if (o.vert   > 0 && o.height > 0) cuts.push({ position: 'Vertical', length: o.height, count: o.vert });
  return cuts;
}

// ============================================================
//  AGGREGATION → REPORT
// ============================================================
// 一维下料装箱 — First-Fit-Decreasing (FFD):
//   长段优先,每段塞进第一根还放得下的料(回头利用任意已开料的剩余),全塞不下才开新料.
//   返回 { sticks: 根数, over: [被拼接的超长段...] }。
//   超长段(单件 > 整料)按拼接计入: floor(L/stock) 根整料 + 余段并入 FFD 池(余=0 不入)。
function packFFD(pieces, stock, eps = 1e-6) {
  const over = [];
  const fit = [];
  let fullSticks = 0;            // 超长段整除出的整根, 直接计入
  for (const p of pieces) {
    if (p > stock + eps) {
      over.push(p);
      const nFull = Math.floor((p + eps) / stock);
      fullSticks += nFull;
      const rem = p - nFull * stock;
      if (rem > eps) fit.push(rem);   // 余段入池; 余=0 不入
    } else if (p > 0) {
      fit.push(p);
    }
  }
  fit.sort((a, b) => b - a); // 长 → 短
  const rema = []; // 每根料剩余长度
  for (const p of fit) {
    let placed = false;
    for (let i = 0; i < rema.length; i++) {
      if (rema[i] + eps >= p) { rema[i] -= p; placed = true; break; }
    }
    if (!placed) rema.push(stock - p);
  }
  return { sticks: fullSticks + rema.length, over: over.sort((a, b) => b - a) };
}

// #cutting-diagram (2026-07-20): same FFD algorithm as packFFD() above (identical sort order,
// identical first-fit loop) but keeps the actual piece-to-stick assignment instead of just a
// count, so the on-screen diagram and the DXF export always match the stock numbers already
// shown in the report — never a second, diverging calculation.
// Spliced/oversize pieces (single piece > stock) are handled silently, per Leo's instruction not
// to call them out visually: each full stock consumed by the splice comes back as one stick whose
// only "piece" is the full stock length itself (no internal cut), so it just renders as a plain,
// uncut 24' line — indistinguishable from an ordinary unused stock until you look closely. Its
// leftover remainder is folded back into the normal FFD pool exactly like packFFD does.
// Returns: array of { pieces:[len,...], remaining } — one entry per stick, in the same total
// count packFFD(pieces, stock) would report.
function packFFDLayout(pieces, stock, eps = 1e-6) {
  const sticks = [];
  const fit = [];
  for (const p of pieces) {
    if (p > stock + eps) {
      const nFull = Math.floor((p + eps) / stock);
      for (let i = 0; i < nFull; i++) sticks.push({ pieces: [stock], remaining: 0 });
      const rem = p - nFull * stock;
      if (rem > eps) fit.push(rem);
    } else if (p > 0) {
      fit.push(p);
    }
  }
  fit.sort((a, b) => b - a); // 长 → 短, same order as packFFD
  for (const p of fit) {
    let placed = false;
    for (let i = 0; i < sticks.length; i++) {
      if (sticks[i].remaining + eps >= p) { sticks[i].remaining -= p; sticks[i].pieces.push(p); placed = true; break; }
    }
    if (!placed) sticks.push({ pieces: [p], remaining: stock - p });
  }
  return sticks;
}

// #cutting-diagram: pack ONE elevation's own pieces per part (not pooled across the whole
// project — Leo asked for the diagram/export scoped per elevation). Reuses the identical
// matching logic as buildReport() via collectOpeningIntoBuckets, so "what part does this cut
// belong to" never drifts between the order list and the per-elevation diagram.
// Returns: [{ system, partNumber, description, stock, sticks: [{pieces, remaining}] }]
function buildOpeningPacking(o) {
  const buckets = new Map();
  collectOpeningIntoBuckets(o, buckets, null, null);
  return [...buckets.values()]
    .filter(b => b.pieces.length)
    .map(b => {
      const stock = b.stockInches || STOCK_INCHES;
      return {
        system: b.system,
        partNumber: b.partNumber,
        description: b.description,
        stock,
        sticks: packFFDLayout(b.pieces, stock),
      };
    })
    .sort((a, b) => a.partNumber.localeCompare(b.partNumber, undefined, { numeric: true }));
}

// #cutting-diagram: shared cut-boundary geometry so the on-screen SVG preview and the DXF
// export always draw identical cuts. A boundary lands only strictly before the stock's far end,
// so a spliced full-length stick (one piece == stock) draws with zero boundary markers — a
// plain uncut line, per the "don't show the splice" treatment above.
function stickTickPositions(stick, stock, eps = 1e-6) {
  const ticks = [];
  let cum = 0;
  for (const len of stick.pieces) {
    cum += len;
    if (cum < stock - eps) ticks.push(cum);
  }
  return ticks;
}

// #cutting-diagram (2026-07-20 rev2, Leo: revert the 2.5" open-box markers back to a bordered
// bar for the whole stick + plain tick lines at each cut boundary (pic2 reference), keep the
// part-name/stick-number labels, add the elevation mark as a header on the diagram. Bar height
// unchanged from the box-marker revision (STOCK_BAR_HEIGHT, was CUT_RECT_HEIGHT). Tick x-positions
// are stickTickPositions() directly — no more per-tick rectangle.
// #cutting-diagram (2026-07-20 rev3, Leo: "最后一段不要闭合...显示最后一段上哪里用到了,还有会剩
// 多长" — don't close the last segment; show where it's used to and how much is left): a stick
// with real leftover (remaining > 0) no longer draws a closing right-side border — the bar is
// only closed left/top/bottom, left open on the right, because that far end isn't a real cut, it's
// undetermined offcut. The existing tick at the used/remaining boundary (stickTickPositions
// already includes it) still marks exactly where real material stops. A text label states the
// leftover length. A stick with zero leftover (exact/spliced fill) is still drawn fully closed.
const STOCK_BAR_HEIGHT = 8;    // inches, the outlined stick bar straddles the baseline (±4)
const REMAINDER_EPS = 1e-6;

// #cutting-diagram: render one part's stack of sticks as plain SVG lines (no fill, no per-piece
// label) — one bar per stick (full stock length, closed left/top/bottom, right edge open unless
// fully used) with a tick line at each cut boundary, part name label to the left of each pile
// (group), stick number to the left of each row, leftover length labeled past the open end, and
// the elevation mark as a header above the whole diagram.
function renderCuttingSvg(groups, mark) {
  const stockMax = Math.max(...groups.map(g => g.stock), STOCK_INCHES);
  const rowH = 18, halfH = STOCK_BAR_HEIGHT / 2, padT = 10;
  const xStickNum = 26, xPartLabel = 2, xLineStart = 96; // left-side label columns, then the line
  const headH = mark ? 22 : 0;
  let y = padT + headH;
  let body = '';
  if (mark) body += `<text x="${xPartLabel}" y="${(padT + 8).toFixed(2)}" font-size="13" font-weight="600" fill="currentColor">${escHtml(mark)}</text>`;
  for (const g of groups) {
    const yFirst = y;
    let stickIdx = 0;
    for (const s of g.sticks) {
      stickIdx++;
      const ticks = stickTickPositions(s, g.stock);
      const remaining = s.remaining || 0;
      const hasWaste = remaining > REMAINDER_EPS;
      const barTop = y - halfH, barBot = y + halfH;
      const xEnd = (xLineStart + g.stock).toFixed(2);
      body += `<text x="${xStickNum}" y="${(y + 3.5).toFixed(2)}" font-size="7" fill="currentColor" text-anchor="end">${stickIdx}</text>`;
      body += `<line x1="${xLineStart}" y1="${barTop.toFixed(2)}" x2="${xLineStart}" y2="${barBot.toFixed(2)}" stroke="currentColor" stroke-width="1.1"/>`;
      body += `<line x1="${xLineStart}" y1="${barTop.toFixed(2)}" x2="${xEnd}" y2="${barTop.toFixed(2)}" stroke="currentColor" stroke-width="1.1"/>`;
      body += `<line x1="${xLineStart}" y1="${barBot.toFixed(2)}" x2="${xEnd}" y2="${barBot.toFixed(2)}" stroke="currentColor" stroke-width="1.1"/>`;
      if (!hasWaste) body += `<line x1="${xEnd}" y1="${barTop.toFixed(2)}" x2="${xEnd}" y2="${barBot.toFixed(2)}" stroke="currentColor" stroke-width="1.1"/>`;
      body += ticks.map(t => {
        const x = (xLineStart + t).toFixed(2);
        return `<line x1="${x}" y1="${barTop.toFixed(2)}" x2="${x}" y2="${barBot.toFixed(2)}" stroke="currentColor" stroke-width="1"/>`;
      }).join('');
      if (hasWaste) body += `<text x="${(xLineStart + g.stock + 4).toFixed(2)}" y="${(y + 3.5).toFixed(2)}" font-size="7" fill="currentColor">${formatNumber(remaining)}" left</text>`;
      y += rowH;
    }
    const yLast = y - rowH;
    body += `<text x="${xPartLabel}" y="${((yFirst + yLast) / 2 + 3.5).toFixed(2)}" font-size="8" fill="currentColor">${escHtml(g.partNumber)}</text>`;
    y += rowH * 0.6; // group gap between parts
  }
  const totalH = y + padT;
  return `<svg viewBox="0 0 ${(xLineStart + stockMax + 60).toFixed(2)} ${totalH.toFixed(2)}" style="width:100%;max-height:520px;display:block;color:#333;" preserveAspectRatio="xMinYMin meet">${body}</svg>`;
}

// #cutting-diagram: minimal ASCII DXF (R12-compatible, LINE + TEXT entities, inches). One layer
// per part number so AutoCAD's layer panel groups the sticks; part-name/stick-number TEXT sits
// to the left of each pile/row (same layout as the SVG preview above).
function sanitizeDxfLayer(name) {
  const s = String(name || 'PART').replace(/[^A-Za-z0-9_\-.]/g, '_');
  return s || 'PART';
}
function dxfLine(x1, y1, x2, y2, layer) {
  return `0\nLINE\n8\n${layer}\n10\n${x1.toFixed(4)}\n20\n${y1.toFixed(4)}\n30\n0\n11\n${x2.toFixed(4)}\n21\n${y2.toFixed(4)}\n31\n0\n`;
}
function dxfRect(x1, y1, x2, y2, layer) {
  return dxfLine(x1, y1, x2, y1, layer) + dxfLine(x2, y1, x2, y2, layer) + dxfLine(x2, y2, x1, y2, layer) + dxfLine(x1, y2, x1, y1, layer);
}
function dxfText(x, y, height, value, layer) {
  return `0\nTEXT\n8\n${layer}\n10\n${x.toFixed(4)}\n20\n${y.toFixed(4)}\n30\n0\n40\n${height}\n1\n${String(value).replace(/[\r\n]/g, ' ')}\n`;
}
// #cutting-diagram: shared entity-body builder so a single-elevation DXF and the combined
// all-elevations DXF (buildCombinedCuttingDxf) draw identical geometry — bordered bar per stick
// (full stock length) + tick line per cut boundary, part/stick labels, elevation mark as a header
// above the section. yOffset lets the combined export stack sections vertically; returns where
// the next section should start (endY) so sections never overlap.
function buildCuttingDxfBody(groups, mark, yOffset) {
  const rowGap = 8, groupGap = 24, halfH = STOCK_BAR_HEIGHT / 2;
  const xStickNum = -14, xPartLabel = -90, textH = 5;
  let y = yOffset;
  let body = '';
  if (mark) {
    body += dxfText(0, y + textH * 1.6, textH * 1.4, mark, 'ELEVATION');
    y -= textH * 2.6; // drop below the header before the first stick row
  }
  for (const g of groups) {
    const layer = sanitizeDxfLayer(g.partNumber);
    const yFirst = y;
    let stickIdx = 0;
    for (const s of g.sticks) {
      stickIdx++;
      const remaining = s.remaining || 0;
      const hasWaste = remaining > REMAINDER_EPS;
      const barTop = y - halfH, barBot = y + halfH;
      body += dxfText(xStickNum, y - textH / 3, textH, stickIdx, layer);
      body += dxfLine(0, barTop, 0, barBot, layer);         // left edge
      body += dxfLine(0, barTop, g.stock, barTop, layer);   // top
      body += dxfLine(0, barBot, g.stock, barBot, layer);   // bottom
      if (!hasWaste) body += dxfLine(g.stock, barTop, g.stock, barBot, layer); // right edge only if fully used
      for (const t of stickTickPositions(s, g.stock)) body += dxfLine(t, barTop, t, barBot, layer);
      if (hasWaste) body += dxfText(g.stock + 3, y - textH / 3, textH, formatNumber(remaining) + '" left', layer);
      y -= rowGap;
    }
    const yLast = y + rowGap;
    body += dxfText(xPartLabel, (yFirst + yLast) / 2 - textH / 3, textH, g.partNumber, layer);
    y -= groupGap;
  }
  return { body, endY: y };
}
function buildCuttingDxf(groups, mark) {
  const { body } = buildCuttingDxfBody(groups, mark, 0);
  const header = '0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n1\n0\nENDSEC\n'; // 1 = inches
  const entities = '0\nSECTION\n2\nENTITIES\n' + body + '0\nENDSEC\n';
  return header + entities + '0\nEOF\n';
}
// #cutting-diagram (2026-07-20 rev2, Leo: "export all elevations in one dxf"): every elevation's
// section stacked in a single file, each headed by its own mark label, using the same
// buildCuttingDxfBody as the single-elevation export so the geometry never diverges.
function buildCombinedCuttingDxf(list) {
  const sectionGap = 40;
  let y = 0, body = '';
  for (const { mark, groups } of list) {
    const r = buildCuttingDxfBody(groups, mark, y);
    body += r.body;
    y = r.endY - sectionGap;
  }
  const header = '0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n1\n0\nENDSEC\n';
  const entities = '0\nSECTION\n2\nENTITIES\n' + body + '0\nENDSEC\n';
  return header + entities + '0\nEOF\n';
}
function downloadCuttingDxf(o) {
  const groups = buildOpeningPacking(o);
  if (!groups.length) { alert('No parts with stock cuts for ' + (o.mark || 'this elevation') + '.'); return; }
  const dxf = buildCuttingDxf(groups, o.mark);
  const blob = new Blob([dxf], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = (o.mark || 'elevation') + '-cutting.dxf';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function downloadAllCuttingDxf() {
  const opens = state.openings.filter(o => buildOpeningPacking(o).length);
  if (!opens.length) { alert('No openings with stock cuts to export.'); return; }
  let i = 0;
  const next = () => { if (i >= opens.length) return; downloadCuttingDxf(opens[i]); i++; setTimeout(next, 350); };
  next();
}
// #cutting-diagram (2026-07-20 rev2): single combined DXF, all elevations stacked in one file —
// separate button/action from downloadAllCuttingDxf (which still downloads one file per elevation).
function downloadCombinedCuttingDxf() {
  const list = state.openings
    .map(o => ({ mark: o.mark, groups: buildOpeningPacking(o) }))
    .filter(x => x.groups.length);
  if (!list.length) { alert('No openings with stock cuts to export.'); return; }
  const dxf = buildCombinedCuttingDxf(list);
  const blob = new Blob([dxf], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'all-elevations-cutting-combined.dxf';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// #cutting-diagram: factored out of buildReport() so a single opening can be
// packed on its own (per-elevation diagram/DXF export) using the exact same matching rules
// as the project-wide order list — never a second, diverging implementation.
function collectOpeningIntoBuckets(o, buckets, posTotals, unresolved) {
  const cuts = expandOpeningCuts(o);
  // 连续件跑长(如 750XT 的 C Face Cover 连续覆盖 sill,不被竖梃打断——subsill 同逻辑):
  // 同 position 同一行的相邻段合并(缝隙≤8" 即竖梃宽),跑长 = 合并后的整段跨度。
  const contRuns = pos => {
    const segs = cuts.filter(c => c.position === pos && c.src && c.src.w >= c.src.h)
      .map(c => ({ row: Math.round(c.src.y * 10) / 10, x1: c.src.x, x2: c.src.x + c.src.w }))
      .sort((a, b) => a.row - b.row || a.x1 - b.x1);
    const runs = []; let cur = null;
    for (const s of segs) {
      if (cur && s.row === cur.row && s.x1 - cur.x2 <= 8) { cur.x2 = Math.max(cur.x2, s.x2); }
      else { if (cur) runs.push(cur.x2 - cur.x1); cur = { row: s.row, x1: s.x1, x2: s.x2 }; }
    }
    if (cur) runs.push(cur.x2 - cur.x1);
    return runs;
  };
  for (const c of cuts) {
    // Every part assigned to this position needs the same cut length.
    const allMatches = state.parts.filter(p =>
      p.system === o.system &&
      Array.isArray(p.roles) &&
      p.roles.includes(c.position)
    );
    // 连续件不按单段计——除非该 cut 没有几何(手工行),才退回逐段
    const matches = allMatches.filter(p => !p.continuous || !c.src);
    const nPieces = c.count * (o.qty || 1);
    const totalLen = c.length * nPieces;
    if (!allMatches.length) {
      if (unresolved) unresolved.push({ mark: o.mark, system: o.system, position: c.position, totalInches: totalLen });
      continue;
    }
    if (posTotals) {
      const pt = posTotals[o.system] || (posTotals[o.system] = {});
      pt[c.position] = (pt[c.position] || 0) + totalLen;
    }
    for (const match of matches) {
      const key = match.system + '|' + match.partNumber;
      if (!buckets.has(key)) {
        buckets.set(key, {
          system: match.system,
          partNumber: match.partNumber,
          description: match.description,
          rolesUsed: new Set(),
          totalInches: 0,
          pieces: [],   // 单件长度清单,给摆料用
          stockInches: match.stockInches || STOCK_INCHES,
        });
      }
      const b = buckets.get(key);
      const q = (match.roleQty && +match.roleQty[c.position] > 0) ? +match.roleQty[c.position] : 1;   // #4: per-role part quantity
      b.totalInches += totalLen * q;
      for (let i = 0; i < nPieces * q; i++) b.pieces.push(c.length);
      b.rolesUsed.add(c.position);
    }
  }
  // 连续件(continuous: true, 如 C Face Cover): 每个角色按跑长出料
  for (const match of state.parts.filter(p => p.system === o.system && p.continuous && Array.isArray(p.roles))) {
    for (const role of match.roles) {
      const runs = contRuns(role);
      if (!runs.length) continue;
      const key = match.system + '|' + match.partNumber;
      if (!buckets.has(key)) {
        buckets.set(key, {
          system: match.system, partNumber: match.partNumber, description: match.description,
          rolesUsed: new Set(), totalInches: 0, pieces: [],
          stockInches: match.stockInches || STOCK_INCHES,
        });
      }
      const b = buckets.get(key);
      const q = (match.roleQty && +match.roleQty[role] > 0) ? +match.roleQty[role] : 1;   // #4: per-role part quantity
      const n = (o.qty || 1) * q;
      for (const rl of runs) { b.totalInches += rl * n; for (let i = 0; i < n; i++) b.pieces.push(rl); }
      b.rolesUsed.add(role + ' (run)');
    }
  }
}

function buildReport() {
  // Bucket: key = system + '|' + partNumber → { system, partNumber, description, roles:Set, totalInches }
  const buckets = new Map();
  const unresolved = []; // {opening, position, length}
  const posTotals = {};  // { system: { position: 总下料长(in) } } —— 角色层用

  for (const o of state.openings) collectOpeningIntoBuckets(o, buckets, posTotals, unresolved);

  const rows = [...buckets.values()].map(b => {
    const stock = b.stockInches || STOCK_INCHES;
    const { sticks, over } = packFFD(b.pieces, stock);     // 余量前: 真实摆料
    const stocksWaste = sticks > 0 ? Math.ceil(sticks * wasteFactor()) : 0; // 余量后: ceil(A × waste factor)
    return {
      ...b,
      rolesUsed: [...b.rolesUsed],
      stocks: sticks,
      stocksWaste,
      oversize: over,
    };
  });

  // Sort: IR501T first, then 450, then by partNumber
  rows.sort((a, b) => {
    const sa = SYSTEMS.indexOf(a.system);
    const sb = SYSTEMS.indexOf(b.system);
    if (sa !== sb) return sa - sb;
    return a.partNumber.localeCompare(b.partNumber, undefined, { numeric: true });
  });

  // Unresolved aggregation by sys+pos
  const unMap = new Map();
  for (const u of unresolved) {
    const k = u.system + '|' + u.position;
    if (!unMap.has(k)) unMap.set(k, { system: u.system, position: u.position, totalInches: 0, count: 0 });
    const r = unMap.get(k);
    r.totalInches += u.totalInches;
    r.count += 1;
  }

  return { rows, unresolved: [...unMap.values()], posTotals };
}

// 报表角色行展开状态(key = system|position)。默认折叠(先看角色总长)。
const reportExpanded = new Set();
document.addEventListener('click', e => {
  // "+ Add Role": 新建自定义角色 → 进 POSITIONS(角色表 + viewer 位置下拉即时可用)
  if (e.target.closest && e.target.closest('#role-add')) {
    const name = (prompt('New role name\n(after creating it, in the Elevation Viewer click a piece → Position dropdown to reassign it to this role;\nthen attach a part to it in the By-Role table)') || '').trim();
    if (name) {
      if (POSITIONS_LIST().includes(name)) { alert('Role already exists: ' + name); }
      else {
        if (!Array.isArray(state.customRoles)) state.customRoles = [];
        state.customRoles.push(name);
        save(); renderReport();
        if (viewerOpeningId != null) renderViewer(viewerOpeningId);
      }
    }
    return;
  }
  // 角色下"移出 part"(改该 part 的 roles)
  const rm = e.target.closest && e.target.closest('[data-rmrole]');
  if (rm) {
    const sp = rm.getAttribute('data-rmrole').split('|');
    const pos = sp.pop(), pid = sp.join('|');
    const p = state.parts.find(x => x.id === pid);
    if (p) { p.roles = (p.roles || []).filter(r => r !== pos); save(); renderReport(); renderMeta(); renderParts(); }
    return;
  }
  // T2: rename role (✎) — must be checked before the row-toggle below
  const ren = e.target.closest && e.target.closest('[data-renamerole]');
  if (ren) {
    const sp = ren.getAttribute('data-renamerole').split('|');
    const oldPos = sp.pop(), sys = sp.join('|');
    const next = (prompt('Rename role\n' + oldPos + '  →', oldPos) || '').trim();
    if (!next || next === oldPos) return;
    if (POSITIONS_LIST().includes(next) &&
        !confirm('Role "' + next + '" already exists — renaming will MERGE "' + oldPos + '" into it. Continue?')) return;
    renameRole(sys, oldPos, next);
    return;
  }
  // 角色行折叠/展开
  const g = e.target.closest && e.target.closest('#report-body .role-group');
  if (!g) return;
  const k = g.dataset.rolegroup;
  if (reportExpanded.has(k)) reportExpanded.delete(k); else reportExpanded.add(k);
  renderReport();
});
// 角色下"加入 part"(下拉)
document.addEventListener('change', e => {
  if (e.target && e.target.id === 'waste-pct') { state.wastePct = Math.max(0, parseFloat(e.target.value) || 0); save(); renderReport(); renderMeta(); return; }   // #1
  const rq = e.target.closest && e.target.closest('[data-roleqty]');   // #4: per-role part qty
  if (rq) {
    const sp = rq.getAttribute('data-roleqty').split('|'); const pos = sp.pop(), pid = sp.join('|');
    const p = state.parts.find(x => x.id === pid);
    if (p) { p.roleQty = p.roleQty || {}; const v = Math.max(1, parseInt(rq.value) || 1); if (v === 1) delete p.roleQty[pos]; else p.roleQty[pos] = v; save(); renderReport(); renderMeta(); renderParts(); }
    return;
  }
  const sel = e.target.closest && e.target.closest('[data-addrole]');
  if (!sel || !sel.value) return;
  const sp = sel.getAttribute('data-addrole').split('|');
  const pos = sp.pop();
  const p = state.parts.find(x => x.id === sel.value);
  if (p && !(p.roles || []).includes(pos)) { p.roles = [...(p.roles || []), pos]; save(); renderReport(); renderMeta(); renderParts(); }
});
// T2: rename a role — updates parts.roles + cuts.position (this system), the customRoles entry,
// and carries the old color forward via state.roleColors (checked first in cutColor).
// If newPos already exists it MERGES (dedupe). Parts changes push to cloud; cuts/openings are local.
function renameRole(sys, oldPos, newPos) {
  if (!newPos || newPos === oldPos) return;
  const oldColor = cutColor(oldPos, sys);
  for (const p of state.parts) {
    if (p.system !== sys || !Array.isArray(p.roles)) continue;
    if (p.roles.includes(oldPos)) p.roles = [...new Set(p.roles.map(r => r === oldPos ? newPos : r))];
  }
  for (const o of state.openings) {
    if (o.system !== sys) continue;
    for (const c of (o.cuts || [])) if (c.position === oldPos) c.position = newPos;
  }
  if (Array.isArray(state.customRoles)) {
    const i = state.customRoles.indexOf(oldPos);
    if (i >= 0) state.customRoles.splice(i, 1, newPos);
    state.customRoles = [...new Set(state.customRoles)];
  }
  if (!POSITIONS_LIST().includes(newPos)) (state.customRoles = state.customRoles || []).push(newPos);
  const mapHas = String(sys) === '750XT' ? COLOR_750XT[newPos] : is1600(sys) ? COLOR_1600[newPos] : POSITION_COLORS[newPos];
  if (!mapHas) { state.roleColors = state.roleColors || {}; state.roleColors[newPos] = oldColor; }
  save(); renderParts(); renderReport(); renderMeta();
  if (viewerOpeningId != null) renderViewer(viewerOpeningId);
}
function renderReport() {
  const wrap = document.getElementById('report-body');
  const { rows, unresolved, posTotals } = buildReport();

  if (!rows.length && !unresolved.length) {
    wrap.innerHTML = `
      <div class="tk-report-empty">
        ${ico('inbox')}
        <div>Add openings and parts to generate the consolidated takeoff.</div>
      </div>`;
    return;
  }

  let html = `
    <div style="padding:6px 16px; display:flex; align-items:center; justify-content:space-between;">
      <span style="font:600 11px var(--af-font-sans,system-ui); letter-spacing:.12em; text-transform:uppercase; color:var(--af-fg-3,#888);">By Role — total cut length per role (expand to see which parts make it up)</span>
      <button class="tk-btn tk-btn--ghost tk-btn--sm" id="role-add" title="Create a custom role; after creating it, click a piece in the Elevation Viewer → Position dropdown to reassign">+ Add Role</button>
    </div>
    <div class="tk-table-wrap">
      <table class="tk-report-table">
        <thead>
          <tr>
            <th>Role</th>
            <th class="num">Cut Length</th>
            <th class="num"></th>
            <th class="num"></th>
          </tr>
        </thead>
        <tbody>`;

  // 系统顺序(SYSTEMS_LIST), 角色顺序(POSITIONS)
  const sysOrder = SYSTEMS_LIST().filter(s => rows.some(r => r.system === s))
    .concat([...new Set(rows.map(r => r.system))].filter(s => !SYSTEMS_LIST().includes(s)));
  for (const sys of sysOrder) {
    html += `<tr class="sys-break"><td colspan="4">${escHtml(sys)}</td></tr>`;
    const posOfSys = posTotals[sys] || {};
    const positions = POSITIONS.filter(p => (posOfSys[p] || 0) > 0 || rows.some(r => r.system === sys && r.rolesUsed.includes(p)) || (state.customRoles || []).includes(p));
    for (const pos of positions) {
      const assigned = state.parts.filter(p => p.system === sys && (p.roles || []).includes(pos));
      const key = sys + '|' + pos;
      const open = reportExpanded.has(key);
      html += `
        <tr class="role-group" data-rolegroup="${escAttr(key)}" style="cursor:pointer;">
          <td><span style="font-weight:600;">${open ? '▾' : '▸'} ${escHtml(pos)}</span> <span class="roles">· ${assigned.length} parts</span> <button class="tk-rowdel-btn" data-renamerole="${escAttr(sys + '|' + pos)}" title="Rename role" style="margin-left:6px;">✎</button></td>
          <td class="num" style="font-weight:600;">${formatNumber(posOfSys[pos] || 0)}″</td>
          <td class="num"></td><td class="num"></td>
        </tr>`;
      // 组成可改: 列出该角色下的 part(垃圾桶=移出该角色), 末行下拉=把现有 part 加入该角色
      if (open) {
        const _sec = (window.ROLE_SECTIONS || {})[pos];   // #5: show role section drawing when expanded
        if (_sec) html += `<tr class="role-part"><td colspan="4" style="padding:6px 26px;"><div style="display:flex;align-items:center;gap:12px;"><div style="min-width:128px;height:82px;display:flex;align-items:center;flex:0 0 auto;">${_sec}</div><span style="color:var(--af-fg-3,#888);font-size:11px;">Section · ${escHtml(pos)}</span></div></td></tr>`;
        for (const p of assigned) {
          html += `
            <tr class="role-part">
              <td style="padding-left:26px;">
                <span class="pn">${escHtml(p.partNumber)}</span>
                <span class="desc">${escHtml(p.description || '—')}</span>
                <label style="margin-left:6px;font-size:11px;color:var(--af-fg-3,#888);">×<input class="tk-cell-input num" data-roleqty="${escAttr(p.id + '|' + pos)}" type="number" min="1" step="1" value="${(p.roleQty && p.roleQty[pos]) || 1}" style="width:44px;" title="Qty of this part per piece in this role (use instead of adding the part twice)" /></label>
                <button class="tk-rowdel-btn" data-rmrole="${escAttr(p.id + '|' + pos)}" title="Remove this part from ${escAttr(pos)}" style="margin-left:6px;">${ico('trash')}</button>
              </td>
              <td class="num"></td><td class="num"></td><td class="num"></td>
            </tr>`;
        }
        const cands = state.parts.filter(p => p.system === sys && !(p.roles || []).includes(pos));
        if (cands.length) {
          html += `
            <tr class="role-part">
              <td style="padding-left:26px;">
                <select class="tk-cell-select" data-addrole="${escAttr(sys + '|' + pos)}" style="max-width:300px;">
                  <option value="">+ Add part…</option>
                  ${cands.map(p => `<option value="${escAttr(p.id)}">${escHtml(p.partNumber)} — ${escHtml(p.description || '')}</option>`).join('')}
                </select>
              </td>
              <td class="num"></td><td class="num"></td><td class="num"></td>
            </tr>`;
        }
      }
    }
  }

  html += `</tbody></table></div>`;

  // 按-part 订料清单: 每个 part 一行, 根数 = 该 part 所有角色叠加(只出现一次)
  html += `
    <div style="padding:14px 16px 6px; display:flex; align-items:center; justify-content:space-between; font:600 11px var(--af-font-sans,system-ui); letter-spacing:.12em; text-transform:uppercase; color:var(--af-fg-3,#888);"><span>By Part — order list (stick count = sum across all roles)</span><label style="text-transform:none; letter-spacing:0; font-weight:400;">Waste&nbsp;<input id="waste-pct" type="number" min="0" step="5" value="${wastePctVal()}" style="width:52px;" title="Waste allowance % added on top of the FFD stock count" />%</label></div>
    <div class="tk-table-wrap">
      <table class="tk-report-table">
        <thead>
          <tr>
            <th>Part #</th>
            <th class="num">Cut Length</th>
            <th class="num">24′ Stocks</th>
            <th class="num">+ ${wastePctVal()}%</th>
          </tr>
        </thead>
        <tbody>`;
  let curSys = null;
  for (const r of rows) {
    if (r.system !== curSys) { curSys = r.system; html += `<tr class="sys-break"><td colspan="4">${escHtml(r.system)}</td></tr>`; }
    html += `
      <tr>
        <td>
          <span class="pn">${escHtml(r.partNumber)}</span>
          <span class="desc">${escHtml(r.description || '—')}</span>
          <span class="roles">${r.rolesUsed.join(' · ')}</span>
        </td>
        <td class="num">${formatNumber(r.totalInches)}″</td>
        <td class="num"><span class="stocks">${r.stocks}</span></td>
        <td class="num">${r.stocksWaste}</td>
      </tr>`;
  }
  html += `</tbody></table></div>`;

  if (unresolved.length) {
    html += `
      <div style="padding: 16px 20px; background:#fff7f3; border-top:1px solid var(--af-line);">
        <div style="font-family:var(--af-font-sans); font-size:11px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:var(--af-danger); margin-bottom:8px;">Unresolved cuts — no part assigned for these roles</div>
        <table class="tk-report-table" style="background:transparent;">
          <thead>
            <tr><th>System</th><th>Position</th><th class="num">Total Inches</th></tr>
          </thead>
          <tbody>
            ${unresolved.map(u => `
              <tr>
                <td><span class="pn">${u.system}</span></td>
                <td>${u.position}</td>
                <td class="num">${formatNumber(u.totalInches)}″</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  wrap.innerHTML = html;
}

function renderMeta() {
  const { rows } = buildReport();
  const totalIn = rows.reduce((a, r) => a + r.totalInches, 0);
  const totalStocks = rows.reduce((a, r) => a + r.stocks, 0);
  const totalStocksWaste = rows.reduce((a, r) => a + r.stocksWaste, 0);
  document.getElementById('meta-inches').innerHTML = `${formatNumber(totalIn)}<span class="unit">in</span>`;
  document.getElementById('meta-waste').innerHTML  = `${totalStocks}<span class="unit">pcs</span>`;
  document.getElementById('meta-stocks').innerHTML = `${totalStocksWaste}<span class="unit">pcs</span>`;
  document.getElementById('meta-openings').textContent = state.openings.length;
  document.getElementById('meta-parts').textContent = state.parts.length;
  const totalQty = state.openings.reduce((a, o) => a + (parseInt(o.qty)||0), 0);
  document.getElementById('meta-totalqty').textContent = totalQty;
}

// ============================================================
//  FORMATTING / ESCAPING
// ============================================================
function formatNumber(n) {
  if (!isFinite(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function escHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function escAttr(s) { return escHtml(s); }

// ============================================================
//  EVENT HANDLERS
// ============================================================
function onPartsChange(e) {
  const tr = e.target.closest('tr[data-id]');
  if (!tr) return;
  const p = state.parts.find(x => x.id === tr.dataset.id);
  if (!p) return;
  const field = e.target.dataset.field;
  if (!field) return;
  if (field === 'system') p.system = e.target.value;
  else if (field === 'partNumber') p.partNumber = e.target.value.trim();
  else if (field === 'description') p.description = e.target.value;
  renderReport(); renderMeta(); save();
}

function onPartsClick(e) {
  // 系统分组标题: 折叠/展开
  const grp = e.target.closest('.sys-group');
  if (grp) {
    const sys = grp.dataset.sysgroup;
    if (partsExpanded.has(sys)) partsExpanded.delete(sys); else partsExpanded.add(sys);
    renderParts();
    return;
  }
  // "↔ 连续" 开关(连续件: 下料按整跑合并, 见 buildReport 的 contRuns)
  const cont = e.target.closest('[data-cont]');
  if (cont) {
    const tr = cont.closest('tr[data-id]');
    const p = state.parts.find(x => x.id === tr.dataset.id);
    if (p) { p.continuous = !p.continuous; cont.classList.toggle('is-on'); renderReport(); renderMeta(); save(); }
    return;
  }
  // role chip toggle
  const role = e.target.closest('.tk-role');
  if (role) {
    const tr = role.closest('tr[data-id]');
    const p = state.parts.find(x => x.id === tr.dataset.id);
    const r = role.dataset.role;
    if (p.roles.includes(r)) p.roles = p.roles.filter(x => x !== r);
    else p.roles = [...p.roles, r];
    role.classList.toggle('is-on');
    renderReport(); renderMeta(); save();
    return;
  }
  const del = e.target.closest('[data-action="del-part"]');
  if (del) {
    const tr = del.closest('tr[data-id]');
    state.parts = state.parts.filter(x => x.id !== tr.dataset.id);
    renderParts(); renderReport(); renderMeta(); save();
  }
}

function onOpeningsInput(e) {
  const tr = e.target.closest('tr[data-id]');
  if (!tr) return;
  const o = state.openings.find(x => x.id === tr.dataset.id);
  if (!o) return;
  const f = e.target.dataset.field;
  if (!f) return;
  if (f === 'mark') o.mark = e.target.value;
  else if (f === 'system') {
    o.system = e.target.value;
    // 改成 1600 → 按 4 类重新归类(基于已解析几何);改完重画整表
    if (is1600(o.system) && Array.isArray(o.cuts) && o.cuts.length) { reclassify1600(o); renderOpenings(); }
  }
  else if (['qty','width','height','horiz','vert','lites'].includes(f)) o[f] = parseFloat(e.target.value) || 0;

  // Light update — only re-render report + meta + the row's total cell
  renderReport(); renderMeta();
  const totalCell = tr.querySelectorAll('td')[8];
  if (totalCell) totalCell.querySelector('span').textContent = `${formatNumber(openingTotalInches(o))}"`;
  save();
}

function onOpeningsClick(e) {
  const view = e.target.closest('[data-action="view-opening"]');
  if (view) {
    const tr = view.closest('tr[data-id]');
    renderViewer(tr.dataset.id);
    return;
  }
  const del = e.target.closest('[data-action="del-opening"]');
  if (del) {
    const tr = del.closest('tr[data-id]');
    state.openings = state.openings.filter(x => x.id !== tr.dataset.id);
    renderOpenings(); renderReport(); renderMeta(); save();
  }
}

// ---------- Add part ----------
function addPart() {
  const sys = (state.openings.find(o => o.system) || {}).system || SYSTEMS_LIST()[0] || 'IR501T';
  const p = { id: uid(), system: sys, partNumber: '', description: '', roles: [] };
  state.parts.push(p);
  partsExpanded.add(sys);   // 确保新 part 所在系统组展开, 否则被折叠藏起来看不见
  renderParts(); save();
  // focus 新行的 partNumber(按 id 精确取, 防空)
  const inp = document.querySelector(`#parts-tbody tr[data-id="${p.id}"] input[data-field="partNumber"]`);
  if (inp) inp.focus();
}

// ---------- Quick-add opening ----------
function addOpeningFromQuick() {
  const mark = document.getElementById('qa-mark').value.trim() || `SF-${String(state.openings.length+1).padStart(2,'0')}`;
  const system = document.getElementById('qa-system').value;
  const width  = parseFloat(document.getElementById('qa-width').value) || 0;
  const height = parseFloat(document.getElementById('qa-height').value) || 0;
  const qty    = parseInt(document.getElementById('qa-qty').value) || 1;
  if (width <= 0 || height <= 0) { flash('qa-status', 'Width & height required', true); return; }
  state.openings.push({ id: uid(), mark, system, qty, width, height, horiz: 0, vert: 0 });
  // clear form
  document.getElementById('qa-mark').value = '';
  document.getElementById('qa-width').value = '';
  document.getElementById('qa-height').value = '';
  document.getElementById('qa-qty').value = '1';
  renderOpenings(); renderReport(); renderMeta(); save();
  flash('qa-status', `Added ${mark}`, false);
}

function flash(id, msg, isErr) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'tk-dxf__status ' + (isErr ? 'is-err' : 'is-ok');
  setTimeout(() => { el.textContent = ''; el.className = 'tk-dxf__status'; }, 2400);
}

// ============================================================
//  DXF / TEXT PASTE PARSER
//  Heuristic parser — accepts rows in flexible formats:
//    SF-01  IR501T   72   96   2
//    SF-02, 450, 60x84, qty 3
//    Mark: SF-03   System: IR501T   72" x 96"   Q: 4
//  Extracts: mark, system, width, height, qty
// ============================================================
function parseDxfText(text, opts) {
  const dxfOpenings = parseRawDxfOpenings(text, opts);
  if (dxfOpenings) return dxfOpenings;

  const forcedSystem = opts && opts.forcedSystem;
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const out = [];
  const errors = [];

  for (const raw of lines) {
    // Skip header-ish lines
    if (/^(mark|tag|opening|system|qty|width|height)\b/i.test(raw) && /\b(mark|tag|opening)\b/i.test(raw) && /\b(width|height|qty|system)\b/i.test(raw)) continue;

    // Detect system (an explicit forcedSystem wins — same #S4 rule as the geometry parser)
    let system = forcedSystem || null;
    if (!system) {
      if (/\bIR\s*501\s*T\b/i.test(raw)) system = 'IR501T';
      else if (/\b450\b/i.test(raw) || /\b451\s*T\b/i.test(raw)) system = '450';
    }

    // Width × height pattern: "72x96" "72 x 96" "72\" x 96\"" "72.5 × 96"
    let width = null, height = null;
    const wh = raw.match(/(\d+(?:\.\d+)?)\s*["”]?\s*[x×X*]\s*(\d+(?:\.\d+)?)\s*["”]?/);
    if (wh) {
      width = parseFloat(wh[1]);
      height = parseFloat(wh[2]);
    }

    // Mark: "SF-01" "F-3" "ENT-2" or first token
    let mark = null;
    const markMatch = raw.match(/\b([A-Z]{1,4}[-\s]?\d{1,3}[A-Z]?)\b/i);
    if (markMatch) mark = markMatch[1].toUpperCase().replace(/\s+/, '-');

    // Qty: "qty 3" "q: 4" "x4" "(3)" or trailing integer
    let qty = 1;
    const qtyM = raw.match(/\b(?:qty|q|count|#)\s*[:=]?\s*(\d+)\b/i)
              || raw.match(/\((\d+)\)\s*$/)
              || raw.match(/\bx\s*(\d+)\b/i);
    if (qtyM) qty = parseInt(qtyM[1]);

    // If width/height not found via WxH, try the alternate pattern:
    // tokens separated by comma/tab/pipe: mark, sys, w, h, qty
    if (!wh) {
      const tokens = raw.split(/[,\t|]/).map(t => t.trim()).filter(Boolean);
      if (tokens.length >= 4) {
        // Try to find two consecutive numeric tokens as w, h
        for (let i = 0; i < tokens.length - 1; i++) {
          const a = parseFloat(tokens[i]); const b = parseFloat(tokens[i+1]);
          if (!isNaN(a) && !isNaN(b) && a > 0 && b > 0 && tokens[i].match(/^\d+(\.\d+)?["”]?$/) && tokens[i+1].match(/^\d+(\.\d+)?["”]?$/)) {
            width = a; height = b;
            break;
          }
        }
        // First non-numeric token is mark if not found
        if (!mark) {
          const first = tokens.find(t => /[A-Za-z]/.test(t) && !/^(ir501t|450|451t)$/i.test(t));
          if (first) mark = first.toUpperCase();
        }
      }
    }

    if (!system || !width || !height) {
      errors.push(raw);
      continue;
    }
    if (!mark) mark = `SF-${String(out.length+1).padStart(2,'0')}`;
    out.push({ id: uid(), mark, system, qty, width, height, horiz: 0, vert: 0 });
  }

  return { openings: out, errors };
}

// ============================================================
//  Elevation export → tracker (云端 Firestore /elevGeo, 每 unit 一个文档)
//  几何解析(parseRawDxfOpenings)时同步生成 tracker 格式的立面数据:
//  { viewBox:"0 0 W 400", name, base:<SVG 框线>, elements:[{id,x,y,w,h,t0}] }
//  t0: glass | louver(百叶带) | door(门块) | panel(IMP board, 即 structural 横板)。
//  柱子(竖向 structural)不属于任何立面, 不导出。openings 存 localStorage 但
//  几何 payload 只留内存(LAST_ELEV_EXPORTS), 刷新后需重新 Import DXF 才能再导。
// ============================================================
let ELEV_EXPORTS = new Map();   // T4: accumulate across imports, keyed by elevGeo doc key (re-parse of same mark overwrites). Session-only (payload not persisted across reload).

function buildElevExport(mark, c, pool, louverBand, doorRegions, structuralPolys, panelStrips, byOthersZones, cuts) {
  const bb = c.bbox;
  // 只有"扁条"structural(h≤12,IMP 板带)才出 panel 元素——整面大小的 structural
  // 矩形(scope/backer 框)不是板,导出会盖住整个立面(SF11/12 巨型元素 bug)。
  const boards = structuralPolys.filter(p => p.width >= p.height && p.height <= 12 &&
    p.centerX >= bb.minX - 2 && p.centerX <= bb.maxX + 2 &&
    p.centerY >= bb.minY - 2 && p.centerY <= bb.maxY + 2);
  const s = 400 / bb.height;
  const X = v => +(((v - bb.minX) * s).toFixed(1));
  const Y = v => +(((bb.maxY - v) * s).toFixed(1));
  const W = v => +((v * s).toFixed(1));
  let base = '<g fill="none" stroke="#3fa0ff" stroke-width="0.6">';
  for (const p of c.polys) base += `<rect x="${X(p.minX)}" y="${Y(p.maxY)}" width="${W(p.width)}" height="${W(p.height)}"/>`;
  for (const p of boards) base += `<rect x="${X(p.minX)}" y="${Y(p.maxY)}" width="${W(p.width)}" height="${W(p.height)}"/>`;
  if (louverBand) {
    const lx1 = X(Math.max(louverBand.minX, bb.minX)), lx2 = X(Math.min(louverBand.maxX, bb.maxX));
    for (let ly = louverBand.minY + 2; ly < louverBand.maxY; ly += 4)
      base += `<line x1="${lx1}" y1="${Y(ly)}" x2="${lx2}" y2="${Y(ly)}"/>`;
  }
  base += '</g>';
  const els = []; let n = 0;
  const louverBays = new Set();   // #louver-fix: bays that already got a louver cell from the grid
  const G = { glass: 0, panel: 0 };   // gasket: sum of element perimeters (inches), by type
  // #gasket-viz (2026-07-19, Leo: "gasket takeoff is still not accurate... draw gasket lines so
  // I can know how you do the takeoff"): every glass/panel cell that contributes to G.glass/
  // G.panel is recorded here (DXF-space rect) so the two loops actually counted for it
  // (interior+exterior) can be drawn on the elevation, not just summed into a number.
  const gasketCells = [];
  const add = (x1, y1, x2, y2, t0) => {
    if (t0 === 'glass' || t0 === 'panel') { G[t0] += 2 * ((x2 - x1) + (y2 - y1)); gasketCells.push({ x1, y1, x2, y2, t0 }); }
    els.push({ id: mark + '-' + (++n), x: X(x1), y: Y(y2), w: W(x2 - x1), h: W(y2 - y1), t0 });
  };
  const H = pool.filter(p => p.width > p.height && p.height >= 1);
  const V = pool.filter(p => p.height > p.width && p.width >= 1);
  const vxs = [...new Set(V.map(v => Math.round(v.centerX)))].sort((a, b) => a - b);
  const inDoor = (x1, x2, y1, y2) => doorRegions.some(d =>
    x1 >= d.minX - 3 && x2 <= d.maxX + 3 && (y1 + y2) / 2 < d.headY);
  for (let i = 0; i + 1 < vxs.length; i++) {
    const xL = vxs[i], xR = vxs[i + 1], cx = (xL + xR) / 2;
    const rows = [...new Set(H.filter(h => h.minX <= cx && h.maxX >= cx).map(h => +h.centerY.toFixed(1)))].sort((a, b) => a - b);
    for (let j = 0; j + 1 < rows.length; j++) {
      const y1 = rows[j], y2 = rows[j + 1];
      if (y2 - y1 < 4) continue;                 // 太薄不是格
      if (inDoor(xL, xR, y1, y2)) continue;      // 门洞交给 door 元素
      const cy = (y1 + y2) / 2;
      const isLv = louverBand && cy >= louverBand.minY - 3 && cy <= louverBand.maxY + 3 &&
                   cx >= louverBand.minX - 10 && cx <= louverBand.maxX + 10;
      // by-others 大块区(hatch)内的格子不出元素;金属板带条内的格子 = panel
      const inZone = (byOthersZones || []).some(z => {
        const ox = Math.min(xR, z.maxX) - Math.max(xL, z.minX), oy = Math.min(y2, z.maxY) - Math.max(y1, z.minY);
        return ox > 0 && oy > 0 && (ox * oy) > 0.6 * (xR - xL) * (y2 - y1);
      });
      if (inZone) continue;
      const inStrip = (panelStrips || []).some(sp => cy >= sp.minY - 2 && cy <= sp.maxY + 2 &&
        Math.min(xR, sp.maxX) - Math.max(xL, sp.minX) > (xR - xL) * 0.5);
      const _t0 = inStrip ? 'panel' : (isLv ? 'louver' : 'glass'); if (_t0 === 'louver') louverBays.add(i); add(xL, y1, xR, y2, _t0);
    }
  }
  // #louver-fix: louver band whose top/bottom sit on the louver's own frame (AF-PANEL, excluded from the pool)
  // never forms a grid cell → emit an explicit louver element per bay across the band (bays already covered above are skipped).
  if (louverBand) { for (let i = 0; i + 1 < vxs.length; i++) { const xL = vxs[i], xR = vxs[i + 1], cx = (xL + xR) / 2; if (cx < louverBand.minX - 10 || cx > louverBand.maxX + 10) continue; if (louverBays.has(i)) continue; if (inDoor(xL, xR, louverBand.minY, louverBand.maxY)) continue; add(xL, louverBand.minY, xR, louverBand.maxY, 'louver'); } }
  for (const d of doorRegions) add(d.minX, bb.minY, d.maxX, d.headY, 'door');
  // #fix (2026-07-18, Leo §八): IMP-1 must be confirmed by HATCH signature ONLY (§二) — `boards`
  // is a pure geometric heuristic (flat structural rectangle, no hatch check) and is NOT a
  // confirmed IMP-1 signal. If a board happens to sit on a confirmed IMP-1 panelStrip, that
  // physical panel's perimeter was already counted once by the grid-cell loop above (`inStrip`)
  // — adding it again here would double-count the same panel. If it does NOT overlap a
  // confirmed panelStrip, there is no hatch confirmation at all, so it must not be assumed to
  // be IMP-1 either. Either way: still emit the visual element (elevation-view reference
  // rectangle, unchanged from before) but never let `boards` contribute to the gasket sum —
  // pushed directly instead of through `add()`, which is what accumulates G.panel/G.glass.
  for (const p of boards) els.push({ id: mark + '-' + (++n), x: X(p.minX), y: Y(p.maxY), w: W(p.maxX - p.minX), h: W(p.maxY - p.minY), t0: 'panel' });
  // Gaskets (per-infill-cell, confirmed 2026-07-16/17): glass → 2 loops (interior+exterior)
  // of E2-0127; IMP-1 panel → 2 loops of E2-0120. #S3 bug fix: G.glass/G.panel already ARE the
  // qty-2 (interior+exterior) sum — `add()` does `2*perimeter` per cell — so these must NOT be
  // multiplied by 2 again (the old `2*G.glass`/`2*G.panel` silently doubled every cell a second
  // time, inflating E2-0127 ~4x actual).
  // #fix (2026-07-18, Leo §一/§五/§七): storefront perimeter gasket and infill gasket are TWO
  // INDEPENDENT takeoffs — must not be summed into one number (the old code added openingPerim
  // straight into the E2-0120 infill total). Perimeter is also computed PER INDEPENDENT ZONE,
  // not the whole cluster bbox: real DXFs (confirmed against south.dxf SF04.1 — see
  // PROPAGATION-DESIGN.md §12) show a louver band is its own fully-framed sub-opening (own
  // head/sill/jambs, distinct Y-range from the main glass/IMP-1 zone, separated by a structural
  // gap) even though it shares one mark/bbox with the main zone — each such zone needs its own
  // E2-0120 perimeter gasket (Louver gets a perimeter gasket despite having NO infill gasket).
  // Main-zone extent is derived from the actual classified Head/Sill member Y-positions (not the
  // (X)-suffixed louver-zone variants), falling back to the full bbox when no Head/Sill cuts
  // exist (e.g. non-750XT, or a mark with no louver split at all — matches the old behavior).
  const _cuts = cuts || [];
  const headYs = _cuts.filter(cc => cc.position === 'Head' && cc.src).map(cc => cc.src.y + cc.src.h);
  const sillYs = _cuts.filter(cc => cc.position === 'Sill' && cc.src).map(cc => cc.src.y);
  const mainTop = headYs.length ? Math.max(...headYs) : bb.maxY;
  const mainBot = sillYs.length ? Math.min(...sillYs) : bb.minY;
  const mainH = mainTop > mainBot ? (mainTop - mainBot) : bb.height;
  const mainPerim = 2 * (bb.width + mainH);
  let perimTotal = mainPerim;
  if (louverBand) perimTotal += 2 * ((louverBand.maxX - louverBand.minX) + (louverBand.maxY - louverBand.minY));
  const gaskets = {
    imp1: +(G.panel / 12).toFixed(2),          // E2-0120 infill (IMP-1 panels), ×2 already baked into G.panel by add()
    glass: +(G.glass / 12).toFixed(2),         // E2-0127 infill (glass), ×2 already baked into G.glass by add()
    perimeter: +(perimTotal / 12).toFixed(2),  // E2-0120 storefront perimeter(s), ×1 per independent zone — separate takeoff from infill
  };
  // #gasket-viz (2026-07-19, Leo): draw BOTH gasket types directly on the elevation so the
  // takeoff can be visually audited instead of trusted as a black-box number.
  //  - Infill gasket (E2-0127 glass / E2-0120 IMP-1): TWO dashed loops per counted cell —
  //    an inner ring and an outer ring, standing in for "interior + exterior" (×2) — inset from
  //    the cell edges so they read as distinct lines rather than overlapping the framing rects
  //    already drawn above. Teal = glass (E2-0127), orange = IMP-1 (E2-0120 infill).
  //  - Perimeter gasket (E2-0120, ×1 per independent zone): a single bold gold outline around
  //    each zone's own frame (main zone: full width × Head-to-Sill height; louver zone, if any:
  //    its own band extents) — these are the two "independent storefronts" from §12/§13.
  // Inset amounts are visual only (chosen to sit clearly inside a typical cell/frame without
  // overlapping); they do not affect the LF numbers, which are computed from the raw cell/zone
  // rects above, unchanged.
  let gasketViz = '';
  const inset = (x1, y1, x2, y2, d) => ({ x1: x1 + d, y1: y1 + d, x2: x2 - d, y2: y2 - d });
  const rectPath = (r, color, dash) => {
    if (r.x2 - r.x1 <= 0 || r.y2 - r.y1 <= 0) return '';
    return `<rect x="${X(r.x1)}" y="${Y(r.y2)}" width="${W(r.x2 - r.x1)}" height="${W(r.y2 - r.y1)}" fill="none" stroke="${color}" stroke-width="0.5" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
  };
  gasketViz += '<g>';
  for (const cell of gasketCells) {
    const color = cell.t0 === 'glass' ? '#2dd4bf' : '#f97316';   // teal E2-0127, orange E2-0120 infill
    gasketViz += rectPath(inset(cell.x1, cell.y1, cell.x2, cell.y2, 0.6), color, '2,1');   // exterior loop
    gasketViz += rectPath(inset(cell.x1, cell.y1, cell.x2, cell.y2, 2.2), color, '2,1');   // interior loop
  }
  gasketViz += rectPath({ x1: bb.minX, y1: mainBot, x2: bb.maxX, y2: mainTop }, '#eab308', null).replace('stroke-width="0.5"', 'stroke-width="1.2"');
  if (louverBand) gasketViz += rectPath(louverBand, '#eab308', null).replace('stroke-width="0.5"', 'stroke-width="1.2"');
  gasketViz += '</g>';
  base = base.replace('</g>', '</g>' + gasketViz);
  return { key: mark, data: { viewBox: `0 0 ${+(bb.width * s).toFixed(1)} 400`, name: mark, base, elements: els }, gaskets };
}

async function exportElevationsToTracker() {
  const st = document.getElementById('export-status');
  const say = (t, err) => { if (st) { st.textContent = t; st.className = 'tk-dxf__status ' + (err ? 'is-err' : 'is-ok'); } };
  if (!ELEV_EXPORTS.size) return say('Import DXF (geometry parse) first, then export elevations', true);
  if (!window.__fb) return say('Cloud not connected — enable Firestore first (see FIRESTORE-SETUP.md)', true);
  try {
    const fb = window.__fb;
    say('Pushing…');
    // #M2-v2: merge ONLY the `.takeoff` subfield (system/cuts/gaskets) — the geometry fields
    // (viewBox/base/elements) are the tracker's own dxf-elevations.js import's responsibility
    // now; a plain merge of a doc containing just `{takeoff:{...}}` leaves sibling top-level
    // fields (viewBox/base/elements) untouched. If a mark has no takeoff data (shouldn't
    // happen — computed alongside every opening) skip it rather than writing an empty doc.
    for (const e of ELEV_EXPORTS.values()) {
      if (!e.takeoff) continue;
      await fb.setDoc(fb.doc(fb.elevDb || fb.db, 'elevGeo', String(e.key)),
        { takeoff: Object.assign({}, e.takeoff, { updatedAt: fb.serverTimestamp() }) }, { merge: true });
    }
    const marks = [...ELEV_EXPORTS.keys()].join(', ');
    if (st) st.title = marks;
    say(`Pushed ${ELEV_EXPORTS.size} elevations: ${marks}`);
  } catch (err) {
    console.error('[elevGeo] push failed:', err);
    say('Push failed: ' + ((err && err.code) || err), true);
  }
}

function parseRawDxfOpenings(text, opts) {
  if (!/\bSECTION\b/i.test(text) || !/\bENTITIES\b/i.test(text)) return null;
  // #S4: a user-confirmed system (opts.forcedSystem) must win over the per-mark guess —
  // otherwise unrecognized mark patterns (e.g. "EL-01") fall through dxfSystemForMark() to
  // SYSTEMS_LIST()[0] and get classified/whitelisted against the WRONG system for the whole
  // parse (only `o.system` got corrected afterward in appendParsedOpenings, too late to affect
  // classification). See memory.md "S4" for the full diagnosis.
  const forcedSystem = opts && opts.forcedSystem;
  const pairs = dxfPairs(text);
  const entities = dxfCollectEntities(pairs, 'ENTITIES');
  const blocks = dxfCollectBlocks(pairs);
  const allEntities = [...entities];
  // AC3 doors are placed as SINGLE DOOR (12 LWPOLYLINE / 11 LINE) or DOUBLE DOOR (22/6)
  // blocks on AF_ALUM PROFILE. Detect them by content signature, tag their exploded polys
  // (__door) so they're kept OUT of storefront frame classification + lite counting, and
  // record each door's x-span + head Y so flanking mullions can be marked Door Jamb.
  const doorRegionsAll = [];
  const louverRegionsAll = []; // `louver ele` blocks (blade LINEs, on AF-PANEL) — subframe is NOT taken into takeoff.
  const blockSig = name => { const b = blocks.get(name) || []; let lw = 0, ln = 0; for (const e of b) { if (/LWPOLYLINE/i.test(e.type)) lw++; else if (e.type === 'LINE') ln++; } return lw + '/' + ln; };
  const doorKindOf = name => { const s = blockSig(name); return s === '12/11' ? 'SINGLE' : (s === '22/6' ? 'DOUBLE' : null); };
  const isLouverBlock = name => { const b = blocks.get(name) || []; let lw = 0, ln = 0; for (const e of b) { if (/LWPOLYLINE/i.test(e.type)) lw++; else if (e.type === 'LINE') ln++; } return (lw === 0 && ln >= 24) || /louver/i.test(name); };
  for (const insert of entities.filter(e => e.type === 'INSERT').map(dxfInsertSummary)) {
    const block = blocks.get(insert.block);
    if (!block) continue;
    const kind = doorKindOf(insert.block);
    const kids = block.map(child => dxfTransformEntity(child, insert));
    for (const child of kids) { if (kind) child.__door = 1; allEntities.push(child); }
    if (kind) {
      const dp = kids.map(dxfPolylineSummary).filter(p => p && p.layer === LAYER_CONFIG.alum && (p.width > 0 || p.height > 0));
      if (dp.length) doorRegionsAll.push({ kind, minX: Math.min(...dp.map(p => p.minX)), maxX: Math.max(...dp.map(p => p.maxX)), headY: Math.max(...dp.map(p => p.maxY)) });
    } else if (isLouverBlock(insert.block)) {
      const lp = kids.map(dxfPolylineSummary).filter(p => p);
      if (lp.length) louverRegionsAll.push({ minX: Math.min(...lp.map(p => p.minX)), maxX: Math.max(...lp.map(p => p.maxX)), minY: Math.min(...lp.map(p => p.minY)), maxY: Math.max(...lp.map(p => p.maxY)) });
    }
  }
  const hasDoorBlocks = doorRegionsAll.length > 0;
  // AC3 hatch 检测: AF_HATCH/AF_GENERAL 的 HATCH 边界 bbox。
  //  · 扁长条(h≤12,w≥20) = 金属板带(IMP): AF_HATCH=普通板, AF_GENERAL=后有钢梁
  //  · 大块 = by-others 开口区(maisonette window 等, 不出玻璃元素)
  const hatchBoxes = [];
  for (const e of allEntities) {
    if (!/^HATCH$/i.test(e.type)) continue;
    const lay = dxfValue(e, 8);
    if (lay !== 'AF_HATCH' && lay !== 'AF_GENERAL') continue;
    const xs = [], ys = [];
    for (let k = 0; k + 1 < e.pairs.length; k++) {
      const c1 = e.pairs[k][0], c2 = e.pairs[k + 1][0];
      if ((c1 === 10 || c1 === 11) && (c2 === 20 || c2 === 21)) {
        const x = parseFloat(e.pairs[k][1]), y = parseFloat(e.pairs[k + 1][1]);
        if (Math.abs(x) > 1 && Math.abs(y) > 1) { xs.push(x); ys.push(y); }
      }
    }
    if (!xs.length) continue;
    hatchBoxes.push({ layer: lay, minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) });
  }
  // #S3 (confirmed by Leo, 2026-07-16/17): IMP-1 metal panel is identified by a HATCH SHADE,
  // not a layer — solid-fill, AutoCAD color index 8 (gray), drawn on layer '0'. Verified
  // against the real south/north/east/west.dxf (26/6/8/2 matching entities respectively;
  // 45TU.dxf has zero HATCH entities at all — IMP-1 is 750XT-only, per Leo). This is a
  // DIFFERENT, unrelated signal from the `hatchBoxes` collection above (AF_HATCH/AF_GENERAL
  // layers) — that was the pre-this-session guess and stays only for `byOthersZones` (large
  // by-others opening blocks), not panel detection. Real per-entity boundary-path parsing
  // (`dxfHatchBoundaryBBox`) is required here — the flat x/y scan used for `hatchBoxes` above
  // produces garbage on real HATCH entities (see that function's header comment).
  const imp1HatchBoxes = [];
  for (const e of allEntities) {
    if (!/^HATCH$/i.test(e.type)) continue;
    if (dxfValue(e, 8) !== '0' || dxfValue(e, 62) !== '8' || dxfValue(e, 70) !== '1') continue;
    const bb = dxfHatchBoundaryBBox(e);
    if (bb) imp1HatchBoxes.push(bb);
  }
  // Collect ALL alum + door subframe polylines (no outline dependency)
  const profiles = allEntities
    .filter(e => /POLYLINE|LWPOLYLINE/i.test(e.type) || e.type === 'LINE')
    .map(e => { const s = dxfPolylineSummary(e); if (s && e.__door) s.__door = 1; return s; })
    .filter(p => p && p.width >= 0 && p.height >= 0);
  // Sill-flashing lines (thin wide horizontals, h<1) are commonly drawn on the
  // outline/scope layers — admit only that shape from those layers.
  const flashingLike = p => p.height < 1 && p.width > 10;
  const alumDoorPolys = profiles.filter(p =>
    p.layer === LAYER_CONFIG.alum ||
    p.layer === LAYER_CONFIG.doorSubframe ||
    LAYER_CONFIG.fallbacks.includes(p.layer) ||
    ((p.layer === LAYER_CONFIG.outline || p.layer === LAYER_CONFIG.scope) && flashingLike(p))
  );
  // Marks (Hillview: WS/WN sit above the cluster; AC3: SF on AF_ANNO, drawn in a row below).
  const labels = allEntities
    .filter(e => /^M?TEXT$/i.test(e.type))
    .map(dxfMtextSummary)
    .filter(t => t && /^(WS|WN|SF)\d+$/i.test(t.text))
    .map((t, i) => ({ ...t, id: i, text: t.text.toUpperCase() }));
  // Same-named marks (e.g. SF04 drawn as two bays) → suffix .1/.2… left-to-right by x.
  const marksByName = {};
  for (const l of labels) (marksByName[l.text] = marksByName[l.text] || []).push(l);
  for (const name in marksByName) {
    const grp = marksByName[name].sort((a, b) => a.x - b.x);
    grp.forEach((l, i) => { l.display = grp.length > 1 ? `${name}.${i + 1}` : name; });
  }
  // Structural separators (AC3-family): building columns (vertical, ≥12" wide) and
  // IMP/board panels (horizontal, ≥6" thick) are NOT profiles — drop them before
  // clustering, so they're neither taken off nor bridge two bays into one elevation
  // (e.g. the 21.5"-wide column between SF04.1 and SF04.2). Door-block polys are
  // exempt (they're wide but belong to the cluster; alumPool already excludes them).
  const isStructural = p => !p.__door && Math.max(p.width, p.height) >= 24 &&
    (p.height > p.width ? p.width >= 12 : p.height >= 6);
  const structuralPolys = alumDoorPolys.filter(isStructural);  // 留给立面导出(board=panel 元素)
  const framePolys = alumDoorPolys.filter(p => !isStructural(p));
  // 聚类只认真正的框料层(alum / doorSubframe / 门块)。fallback('0'/AF_X)和 outline
  // 层的件不参与聚类——AC3 图纸 sill 下有 layer-0 的 grade LINE(解析只读起点,成了
  // 0×0 的隐形点),恰好落在两片立面中间,会把它们桥接成一个"整版"。这些件在聚类后
  // 按 x 重叠归给最近的立面,只进分类池(Subsill 等),不参与 bbox。
  const isFrameLayer = p => p.__door ||
    p.layer === LAYER_CONFIG.alum || p.layer === LAYER_CONFIG.doorSubframe;
  const clusterInput = framePolys.filter(isFrameLayer);
  // Cluster polys spatially → each cluster = 1 elevation
  const clusters = clusterPolys(clusterInput, 20);
  for (const p of framePolys) {
    if (isFrameLayer(p)) continue;
    let best = null, bestOv = 0;
    for (const c of clusters) {
      const ov = Math.max(0, Math.min(p.maxX, c.bbox.maxX) - Math.max(p.minX, c.bbox.minX));
      if (ov > bestOv) { bestOv = ov; best = c; }
    }
    if (best && bestOv > 0) best.polys.push(p);
  }
  const openings = [];
  const used = new Set();
  // T4: do NOT reset ELEV_EXPORTS — it accumulates across imports; same mark overwrites via .set below.
  for (const c of clusters) {
    // Match the mark whose x sits within the cluster (WS/WN above, SF below — both x-aligned),
    // nearest-center as tiebreak. Require x-containment so no cluster grabs a neighbor's mark.
    let best = null, bestD = 1e9;
    for (const lbl of labels) {
      if (used.has(lbl.id)) continue;
      if (lbl.x < c.bbox.minX - 3 || lbl.x > c.bbox.maxX + 3) continue;
      const d = Math.hypot(lbl.x - c.centerX, lbl.y - c.centerY);
      if (d < bestD) { bestD = d; best = lbl; }
    }
    if (best) used.add(best.id);
    const mark = best ? best.display : `EL-${String(openings.length+1).padStart(2,'0')}`;
    const system = forcedSystem || dxfSystemForMark(mark);
    // 几何识别(不分图层): 凡"真实框料"(细长矩形, min(w,h)>=1 且 max(w,h)>=10)都进分类池;
    // 薄 flashing(h<1 且宽)走 Subsill。门按几何判("底部无 sill 且跨内有 transom bar = 门")。
    // Louver: the blades sit on AF-PANEL (already outside the pool) — that IS the louver's own
    // subframe, correctly not taken off. The storefront frame AT the louver area IS taken off, as
    // (X)/(Lv) part variants (per 1.png: green Head(X)/Sill(X), orange Jamb(X), pink Vertical(Lv)).
    const louverBands = louverRegionsAll.filter(l => { const cx = (l.minX + l.maxX) / 2; return cx >= c.bbox.minX - 3 && cx <= c.bbox.maxX + 3; });
    const louverBand = louverBands.length ? {
      minX: Math.min(...louverBands.map(l => l.minX)), maxX: Math.max(...louverBands.map(l => l.maxX)),
      minY: Math.min(...louverBands.map(l => l.minY)), maxY: Math.max(...louverBands.map(l => l.maxY)),
    } : null;
    const inLouver = p => {
      if (!louverBand) return false;
      const cx = (p.minX + p.maxX) / 2;
      return cx >= louverBand.minX - 10 && cx <= louverBand.maxX + 10 &&
             p.maxY >= louverBand.minY - 5 && p.minY <= louverBand.maxY + 5;
    };
    // 750XT(AC3) 图纸有 9" 短横料(柱旁补齐段),放宽最短件阈值到 8;其他系统保持 10。
    const minLen = system === '750XT' ? 8 : 10;
    const alumPool = c.polys.filter(p => !p.__door && (
      (Math.min(p.width, p.height) >= 1 && Math.max(p.width, p.height) >= minLen) ||
      (p.height < 1 && p.width > 10)  // flashing → Subsill
    ));
    // Placed door blocks whose center falls in this cluster → drive Door Jamb classification.
    const doorRegions = doorRegionsAll.filter(d => {
      const cx = (d.minX + d.maxX) / 2; return cx >= c.bbox.minX - 3 && cx <= c.bbox.maxX + 3;
    });
    // #S3: this elevation's IMP-1 panel strips — from the confirmed hatch signal, 750XT only
    // (per Leo: 45TU has no IMP-1 at all). Louver-band strips are excluded (keeps the
    // pre-existing louver (X) logic untouched — the two regions don't overlap in practice).
    const panelStrips = system === '750XT' ? imp1HatchBoxes.filter(hb =>
      hb.minX < c.bbox.maxX && hb.maxX > c.bbox.minX && hb.minY > c.bbox.minY - 5 && hb.maxY < c.bbox.maxY + 5 &&
      !(louverBand && hb.maxY > louverBand.minY - 5 && hb.minY < louverBand.maxY + 5)) : [];
    const byOthersZones = hatchBoxes.filter(hb => (hb.maxY - hb.minY) > 12 && (hb.maxX - hb.minX) > 12 &&
      hb.minX < c.bbox.maxX && hb.maxX > c.bbox.minX && hb.minY < c.bbox.maxY && hb.maxY > c.bbox.minY);
    const cuts = dxfDetectCuts(c.bbox, alumPool, [], { useBlockDoors: hasDoorBlocks, doorRegions, system });
    // 750XT(AC3): 位置集严格按 750XT parts.xlsx——没有 Transom Bar / Door Jamb At
    // Transom / Corner 专位。门上横档 = Horizontal (X)(棕,见 2.png);门侧竖梃全高
    // 一根 Door Jamb(红,transom 分段去重合回);宽竖梃(≥3.5")= Vertical (wide),
    // louver 带内由下面 XMAP 转成 Vertical (wide X)。
    if (system === '750XT') {
      const seenSrc = new Set(), keep = [];
      for (const cut of cuts) {
        if (cut.position === 'Transom Bar') cut.position = 'Horizontal (X)';
        else if (cut.position === 'Outside 90° Corner') cut.position = 'Vertical (wide)';
        else if (cut.position === 'Door Jamb' || cut.position === 'Door Jamb At Transom') {
          const k = cut.src ? [cut.src.x, cut.src.y, cut.src.w, cut.src.h].join(',') : String(Math.random());
          if (seenSrc.has(k)) continue;            // 同一根竖梃的 transom 分段 → 全高一根
          seenSrc.add(k);
          cut.position = 'Door Jamb';
          if (cut.src) cut.length = dxfRound(cut.src.h);
        }
        if ((cut.position === 'Vertical' || cut.position === 'Jamb') && cut.src && cut.src.w >= 3.5) cut.position = 'Vertical (wide)';
        keep.push(cut);
      }
      cuts.length = 0; cuts.push(...keep);
    }
    // Louver-area members → (X)/(Lv) variants (still counted; only the part role changes).
    if (louverBand) {
      const XMAP = { 'Head': 'Head (X)', 'Sill': 'Sill (X)', 'Horizontal': 'Horizontal (X)', 'Jamb': 'Jamb (X)', 'Vertical': 'Vertical (X)', 'Vertical (wide)': 'Vertical (wide X)', 'Door Jamb': 'Vertical (X)' };
      for (const cut of cuts) {
        if (!cut.src || !XMAP[cut.position]) continue;
        const cx = cut.src.x + cut.src.w / 2;
        if (cx >= louverBand.minX - 10 && cx <= louverBand.maxX + 10 &&
            (cut.src.y + cut.src.h) >= louverBand.minY - 5 && cut.src.y <= louverBand.maxY + 5) cut.position = XMAP[cut.position];
      }
      // 750XT: louver 带最低一排横料 = Sill (X)。门立面里门框竖梃比窗台低,会把带底
      // 挤出 sill 判定、错标成 Horizontal (X)——按带内最低行统一纠正(门上横档不在带内,不受影响)。
      if (system === '750XT') {
        const bandHX = cuts.filter(k => k.position === 'Horizontal (X)' && k.src &&
          (k.src.y + k.src.h) >= louverBand.minY - 5 && k.src.y <= louverBand.maxY + 5 &&
          (k.src.x + k.src.w / 2) >= louverBand.minX - 10 && (k.src.x + k.src.w / 2) <= louverBand.maxX + 10);
        if (bandHX.length) {
          const lowest = Math.min(...bandHX.map(k => k.src.y));
          for (const k of bandHX) if (k.src.y - lowest < 2) k.position = 'Sill (X)';
        }
      }
    }
    // #S3 (confirmed 2026-07-16/17): IMP-1 panel framing logic — ONLY the verticals that fully
    // span across a panel band get relabeled: the band's own left/right boundary member →
    // `Jamb (IMP-1)`, an interior mullion crossing through the band → `Vertical (IMP-1)` (wide
    // verticals → `Vertical (wide IMP-1)`). The head (member above the panel) and the
    // horizontal below it are explicitly LEFT UNCHANGED — Leo: "do not rename it as an
    // IMP-1-specific member." (This replaces the old Sill(normal)/Head-swap + (X)-suffix
    // band-split, which used the wrong AF_HATCH/AF_GENERAL hatch signal — see memory.md "S3".)
    // Adjacent panel strips with overlapping Y merge into one band (a single physical panel is
    // often several small hatch entities side by side at the same height). Computed even when
    // empty so later steps (Horizontal Glass&Glass) can rely on it.
    const imp1Bands = [];
    for (const s of panelStrips.slice().sort((a, b) => a.minY - b.minY)) {
      const b = imp1Bands.find(bb => s.minY <= bb.maxY + 1 && s.maxY >= bb.minY - 1);
      if (b) { b.minY = Math.min(b.minY, s.minY); b.maxY = Math.max(b.maxY, s.maxY); b.minX = Math.min(b.minX, s.minX); b.maxX = Math.max(b.maxX, s.maxX); }
      else imp1Bands.push({ minX: s.minX, maxX: s.maxX, minY: s.minY, maxY: s.maxY });
    }
    // #fix (2026-07-18, Leo): classification pipeline factored into a function so it can be
    // re-applied to a RESTORED saved snapshot below, not just a fresh parse — previously a
    // saved elevEdits snapshot (from before IMP-1/Glass&Glass/Layer B existed, or just from an
    // earlier manual split) would wholesale overwrite `cuts` AFTER this pipeline ran once,
    // permanently freezing that mark's roles at save-time and masking every later detection/
    // learning improvement on every future re-import. Idempotent: the IMP-1 split step only
    // acts on a WHOLE (unsplit) vertical that fully spans a band, so already-split/relabeled
    // restored pieces pass through unchanged; only stale unsplit pieces get (re)classified.
    classifyRoles(cuts, { system, bbox: c.bbox, imp1Bands, louverBand, doorRegions, mark });
    // #persist (#1): fingerprint of THIS parse (geometry only, role-independent).
    const _freshSig = elevGeoSig(cuts);
    // If a full saved edit-set exists for this mark and the DXF geometry is unchanged,
    // restore it wholesale (splits/merges/role/length edits all survive), THEN re-run the same
    // classification pipeline on the restored cuts so role labels stay live. Otherwise fall
    // back to the lighter remembered role overrides (legacy roleEdits).
    const _saved = state.elevEdits && state.elevEdits[mark];
    let _reclassifiedDrift = null;   // #fix (2026-07-19): surfaced to the viewer — see renderViewer
    if (_saved && _saved.geoSig === _freshSig && Array.isArray(_saved.cuts) && _saved.cuts.length) {
      cuts.length = 0;
      for (const sc of _saved.cuts) cuts.push({ position: sc.position, length: sc.length, count: sc.count || 1, src: sc.src ? { ...sc.src } : null });
      const _beforeReclass = cuts.map(cc => cc.position);
      classifyRoles(cuts, { system, bbox: c.bbox, imp1Bands, louverBand, doorRegions, mark });
      // #fix (2026-07-19, Leo — SF01 data loss): the automatic reclassification above can still
      // change a piece that was never explicitly pinned via the dropdown (e.g. a hand-tuned split
      // whose role happened to match old logic but not the new geometry rule). Rather than let
      // that drift silently through a second save, record it so the viewer can show "N pieces
      // changed from your saved version" — a visible warning instead of a silent overwrite, which
      // is what let SF01 slip through uncaught.
      const drift = [];
      cuts.forEach((cc, i) => { if (_beforeReclass[i] != null && cc.position !== _beforeReclass[i]) drift.push({ src: cc.src, from: _beforeReclass[i], to: cc.position }); });
      if (drift.length) { _reclassifiedDrift = drift; console.warn('[classify] ' + drift.length + ' piece(s) in ' + mark + ' changed from the saved version on reclassify:', drift); }
    } else {
      const _ov = state.roleEdits && state.roleEdits[mark];
      if (_ov) for (const cc of cuts) { if (cc.src) { const k = srcKey(cc.src); if (_ov[k] != null) cc.position = _ov[k]; } }
    }
    // Louver area is not glass → exclude it from vision-lite counting.
    const lites = dxfCountLites(alumPool.filter(p => !inLouver(p)));
    openings.push({
      id: uid(), mark, system, qty: 1, lites,
      width: dxfRound(c.bbox.width),
      height: dxfRound(c.bbox.height),
      horiz: cuts.filter(c => c.position === 'Horizontal').reduce((a,c) => a + c.count, 0),
      vert: cuts.filter(c => c.position === 'Vertical').reduce((a,c) => a + c.count, 0),
      cuts, geoSig: _freshSig,
      // Per-opening geometric context (bbox + detected IMP-1/louver/door bands). Local-only
      // (not part of the elevGeo/elevEdits schema pushed to the tracker/Firestore). Layer B
      // used this to recompute a signature on manual edit; that's gone (2026-07-20), but the
      // context is retained here — it's the natural input for the template-matching feature
      // (PROPAGATION-DESIGN.md §16).
      _bands: { bbox: { minX: c.bbox.minX, minY: c.bbox.minY, maxX: c.bbox.maxX, maxY: c.bbox.maxY }, imp1Bands, louverBand, doorRegions },
      // #fix (2026-07-19): non-null when reclassifying a restored saved snapshot changed a piece
      // that wasn't pinned via the dropdown — surfaced as a warning banner in the viewer instead
      // of silently overwriting the saved version. Local-only (not part of the synced schema).
      _reclassifiedDrift,
    });
    const _ex = buildElevExport(mark, c, alumPool, louverBand, doorRegions, structuralPolys, panelStrips, byOthersZones, cuts);
    // #M2-v2: geometry (viewBox/base/elements) is now owned by the tracker's own
    // dxf-elevations.js import; this tool's push (exportElevationsToTracker) writes ONLY
    // the `.takeoff` subfield below, so it never clobbers the tracker's geometry.
    _ex.takeoff = { system, cuts: cuts.map(cc => ({ position: cc.position, length: cc.length, count: cc.count || 1 })), gaskets: _ex.gaskets };
    ELEV_EXPORTS.set(_ex.key, _ex);
    if (_ex.gaskets && system === '750XT') openings[openings.length - 1].gasketLF = _ex.gaskets;   // gasket: perimeter model is 750XT-only (45TU etc. use per-role glazing gasket rules)
  }
  return { openings, errors: [] };
}

// Spatial union-find clustering of polylines by bbox proximity
function clusterPolys(polys, eps) {
  if (!polys.length) return [];
  const n = polys.length;
  const parent = Array.from({length: n}, (_, i) => i);
  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
  function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }
  const GRID = 50;
  const buckets = new Map();
  for (let i = 0; i < n; i++) {
    const p = polys[i];
    for (let bx = Math.floor(p.minX / GRID); bx <= Math.floor(p.maxX / GRID) + 1; bx++) {
      for (let by = Math.floor(p.minY / GRID); by <= Math.floor(p.maxY / GRID) + 1; by++) {
        const key = bx + ',' + by;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(i);
      }
    }
  }
  function near(a, b) {
    return !(a.maxX + eps < b.minX || b.maxX + eps < a.minX || a.maxY + eps < b.minY || b.maxY + eps < a.minY);
  }
  const checked = new Set();
  for (const [key, list] of buckets) {
    const [bx, by] = key.split(',').map(Number);
    for (const i of list) {
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        const nbrs = buckets.get((bx+dx) + ',' + (by+dy));
        if (!nbrs) continue;
        for (const j of nbrs) {
          if (i >= j) continue;
          const k = i + ',' + j;
          if (checked.has(k)) continue;
          checked.add(k);
          if (near(polys[i], polys[j])) union(i, j);
        }
      }
    }
  }
  const groups = new Map();
  for (let i = 0; i < n; i++) {
    const r = find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(polys[i]);
  }
  const clusters = [];
  for (const members of groups.values()) {
    if (members.length < 3) continue;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const m of members) {
      minX = Math.min(minX, m.minX); minY = Math.min(minY, m.minY);
      maxX = Math.max(maxX, m.maxX); maxY = Math.max(maxY, m.maxY);
    }
    const w = maxX - minX, h = maxY - minY;
    if (w < 5 || h < 5) continue;
    clusters.push({
      bbox: { minX, minY, maxX, maxY, width: w, height: h, centerX: (minX+maxX)/2, centerY: (minY+maxY)/2 },
      polys: members,
      centerX: (minX+maxX)/2,
      centerY: (minY+maxY)/2,
    });
  }
  return clusters;
}


// 数中梃网格的格子数 ≈ 玻璃片数(含 spandrel;门洞会多计 1 格/樘,表里可手改)。
// 竖件 xmid 定 bay 边界,跨过 bay 中心的横件定层数,每 bay 格数 = 层数 − 1。
function dxfCountLites(alumProfiles) {
  const H = alumProfiles.filter(p => p.width > p.height && p.height >= 1);
  const V = alumProfiles.filter(p => p.height > p.width && p.width >= 1);
  if (!V.length || !H.length) return 0;
  const xs = [...new Set(V.map(v => Math.round((v.minX + v.maxX) / 2)))].sort((a, b) => a - b);
  let lites = 0;
  for (let i = 0; i + 1 < xs.length; i++) {
    const cx = (xs[i] + xs[i + 1]) / 2;
    const levels = new Set(H.filter(h => h.minX <= cx && h.maxX >= cx).map(h => Math.round((h.minY + h.maxY) / 2 / 3)));
    lites += Math.max(0, levels.size - 1);
  }
  return lites;
}

function dxfDetectCuts(outline, alumProfiles, doorSubframe, opts) {
  const noDoors = !!(opts && opts.noDoors); // true: 关门检测,subframe 料按普通框料分
  // outline is a synthesized cluster bbox; we DON'T pre-add Head/Sill/Jamb
  // Classify each polyline by its position within the cluster
  const cuts = [];
  const addCut = (position, length, count = 1, src = null, extra = null) => {
    if (length > 0 && count > 0) {
      const cut = { position, length: dxfRound(length), count };
      if (src) cut.src = { x: dxfRound(src.minX), y: dxfRound(src.minY), w: dxfRound(src.width), h: dxfRound(src.height), layer: src.layer };
      if (extra) Object.assign(cut, extra);
      cuts.push(cut);
    }
  };

  // Classify alum profiles (geometric: 横件 w>h, 竖件 h>w, 薄料 h<1)
  const horizontals = alumProfiles.filter(p => p.width > p.height && p.height >= 1);
  const verticals = alumProfiles.filter(p => p.height > p.width && p.width >= 1);
  const thin = alumProfiles.filter(p => p.height < 1 && p.width > 10);

  // 750XT(AC3): by-others 开口(maisonette window 等)的竖梃会伸到 sill 以下,
  // 所以 sill/head/地面基准不能用最值——改用出现次数(众数)。
  const sysIs750 = ((opts && opts.system) || '') === '750XT';
  const byCount = ys => { const m = new Map(); for (const v of ys) m.set(v, (m.get(v) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]); };
  const vTopList = verticals.map(v => Math.round(v.maxY * 10) / 10);
  const vBotList = verticals.map(v => Math.round(v.minY * 10) / 10);
  const headYs = sysIs750 ? new Set(byCount(vTopList).slice(0, 2))
                          : new Set([...new Set(vTopList)].sort((a, b) => b - a).slice(0, 2));
  const sillYs = sysIs750 ? new Set(byCount(vBotList).slice(0, 2))
                          : new Set([...new Set(vBotList)].sort((a, b) => a - b).slice(0, 2));
  const floor750 = sysIs750 && vBotList.length ? byCount(vBotList)[0] : null;

  // ---- 门检测 ----
  // AC3: 门由 SINGLE/DOUBLE DOOR 块给出(opts.doorRegions,门扇几何已从 alumProfiles 排除);
  //   用块的 x-span 定位门洞,门洞两侧最近的框料竖梃 = Door Jamb(门头 Y 以上段 = At Transom)。
  // 其它图纸(无门块)回退到旧几何启发式:立面按竖件列切 bay,底部无 sill 的空挡 = 门。
  const useBlockDoors = !!(opts && opts.useBlockDoors);
  const doorRegions = (opts && opts.doorRegions) || [];
  const doorHeads = [];
  if (useBlockDoors) {
    const vmids = verticals.map(v => (v.minX + v.maxX) / 2);
    for (const d of doorRegions) {
      const left = vmids.filter(x => x <= d.minX + 2);
      const right = vmids.filter(x => x >= d.maxX - 2);
      doorHeads.push({
        minX: d.minX, maxX: d.maxX, minY: d.headY, maxY: d.headY, width: d.maxX - d.minX,
        leftJambX: left.length ? Math.max(...left) : null,
        rightJambX: right.length ? Math.min(...right) : null,
      });
    }
  } else if (verticals.length >= 2) {
    // 750XT: 地面 = 多数竖件的底端(众数),否则 by-others 开口的地下延伸会把地面拉低,
    // 导致所有 bay 都"底部无 sill"而被误判成门。
    const floorY = (floor750 != null) ? floor750 : Math.min(...verticals.map(v => v.minY));
    const sillTol = Math.max(6, (outline.height || 0) * 0.06);
    const colMap = new Map();
    for (const v of verticals) {
      const k = Math.round((v.minX + v.maxX) / 2);
      if (!colMap.has(k)) colMap.set(k, []);
      colMap.get(k).push(v);
    }
    const colKeys = [...colMap.keys()].sort((a, b) => a - b);
    // #6 fix (phantom door, verified against 45TU.dxf EL-05): a bay's boundary must be the
    // FACING EDGE of its bounding vertical, not the vertical's center. A wide vertical (e.g.
    // a corner post/mullion) offsets its center from where the adjoining Head/Sill actually
    // terminates; with a center-based boundary that offset can exceed the ±2 span tolerance
    // below, so a real spanning Sill/Head reads as "missing" → the whole bay is misread as a
    // doorless gap (phantom door), and the bounding vertical gets misclassified as Door Jamb.
    const colEdge = (k, side) => {
      const vs = colMap.get(k);
      return side === 'right' ? Math.max(...vs.map(v => v.maxX)) : Math.min(...vs.map(v => v.minX));
    };
    for (let i = 0; i + 1 < colKeys.length; i++) {
      const xL = colEdge(colKeys[i], 'right'), xR = colEdge(colKeys[i + 1], 'left');
      const spans = h => h.minX <= xL + 2 && h.maxX >= xR - 2;
      // bay 底部有横料 → 窗
      if (horizontals.some(h => spans(h) && (h.minY + h.maxY) / 2 <= floorY + sillTol)) continue;
      // 空挡即门: 门头取跨该 bay、底部之上最低的横料; 没有则全高门(头取该 bay 竖件顶)
      const caps = horizontals.filter(h => spans(h) && (h.minY + h.maxY) / 2 > floorY + sillTol);
      const inBayVerts = verticals.filter(v => { const x = (v.minX + v.maxX) / 2; return x >= xL - 2 && x <= xR + 2; });
      if (!inBayVerts.length) continue;
      const headY = caps.length
        ? Math.min(...caps.map(h => (h.minY + h.maxY) / 2))
        : Math.max(...inBayVerts.map(v => v.maxY));
      doorHeads.push({ minX: xL, maxX: xR, minY: headY, maxY: headY, width: xR - xL });
    }
  }
  // Helper: 竖件属于哪个门(门洞两侧的框料竖梃 = door jamb)
  function findDoorFor(v) {
    const x = (v.minX + v.maxX) / 2;
    for (const d of doorHeads) {
      if (useBlockDoors) {
        if ((d.leftJambX != null && Math.abs(x - d.leftJambX) < 0.5) ||
            (d.rightJambX != null && Math.abs(x - d.rightJambX) < 0.5)) return d;
      } else if (Math.abs(x - d.minX) < 3 || Math.abs(x - d.maxX) < 3) return d;
    }
    return null;
  }

  // HEAD/SILL/HORIZONTAL by Y — headYs/sillYs 已在上方(门检测前)按 system 规则算好
  // 跨某个门 bay、且在该门头高度的横料 → Transom Bar(门头)。
  // 750XT: head 行永远不当门头(开口无 transom 时 cap 会落到 head 行,不能吃掉 Head)。
  const isDoorHeadBar = (h) => !(sysIs750 && [...headYs].some(y => Math.abs(h.maxY - y) < 1)) &&
    doorHeads.some(d =>
    Math.abs((h.minY + h.maxY) / 2 - d.minY) < 5 && h.minX >= d.minX - 2 && h.maxX <= d.maxX + 2);
  for (const h of horizontals) {
    // 750XT 无门块: "无 sill 开口"是 by-others 开口,上方横档 = Horizontal (X)(棕)
    if (isDoorHeadBar(h)) { addCut(sysIs750 && !useBlockDoors ? 'Horizontal (X)' : 'Transom Bar', h.width, 1, h); continue; }
    if (sysIs750) {
      // 750XT 局部判定(分区立面,如 SF01): 本跨内竖件在这根横料处"收头"→ Head,
      // "起脚"→ Sill,穿过 → Horizontal。全局最高/最低两档在分区结构下会判错。
      const inSpan = v => { const x = (v.minX + v.maxX) / 2; return x >= h.minX - 3 && x <= h.maxX + 3; };  // ±3: 宽竖梃(4")中心离料端 2"
      const endsIn = yv => yv >= h.minY - 1 && yv <= h.maxY + 1;
      const headish = verticals.some(v => inSpan(v) && endsIn(v.maxY) && !endsIn(v.minY));
      const sillish = verticals.some(v => inSpan(v) && endsIn(v.minY) && !endsIn(v.maxY));
      if (headish && !sillish) { addCut('Head', h.width, 1, h); continue; }
      if (sillish && !headish) { addCut('Sill', h.width, 1, h); continue; }
      addCut('Horizontal', h.width, 1, h); continue;
    }
    if ([...headYs].some(y => Math.abs(h.maxY - y) < 1)) { addCut('Head', h.width, 1, h); continue; }
    if ([...sillYs].some(y => Math.abs(h.minY - y) < 1)) { addCut('Sill', h.width, 1, h); continue; }
    addCut('Horizontal', h.width, 1, h);
  }

  // Vertical classification
  const vXs = [...new Set(verticals.map(v => Math.round((v.minX + v.maxX) / 2 * 10) / 10))].sort((a,b) => a - b);
  const jambXs = vXs.length ? new Set([vXs[0], vXs[vXs.length - 1]]) : new Set();
  // Typical vertical width for corner detection
  const vWidthsSorted = verticals.map(v => v.width).sort((a,b) => a - b);
  const typicalVW = vWidthsSorted.length ? vWidthsSorted[Math.floor(vWidthsSorted.length / 2)] : 2.75;
  for (const v of verticals) {
    const xmid = (v.minX + v.maxX) / 2;
    const xkey = Math.round(xmid * 10) / 10;
    // Block-door mode: verticals INTERIOR to a door span are the door leaf/panel, not
    // storefront framing (the real jambs sit at the door edges) — skip them.
    if (useBlockDoors && doorHeads.some(d => xmid > d.minX + 1 && xmid < d.maxX - 1 &&
        Math.abs(xmid - (d.leftJambX ?? -1e9)) > 0.5 && Math.abs(xmid - (d.rightJambX ?? -1e9)) > 0.5)) continue;
    const isJamb = jambXs.has(xkey);
    const myDoor = findDoorFor(v);
    // 转角料: 宽度≈普通竖通的两倍(看宽度, 不看位置), 且优先于门判定, 不被门吃掉。
    const isCorner = v.width >= 1.7 * typicalVW;
    if (isCorner) {
      addCut('Outside 90° Corner', v.height, 1, v);
    } else if (myDoor) {
      if (sysIs750 && !useBlockDoors) {
        // 750XT 无门块: 这是 by-others 开口(maisonette 等),不是门。
        // 伸到地面以下的开口侧竖梃 = Jamb (X)(pocket 条件,橙);
        // 开口上方(transom 以上)的短竖 = Jamb(红)。整根计,不劈段。
        if (floor750 != null && v.minY < floor750 - 2) addCut('Jamb (X)', v.height, 1, v);
        else addCut('Jamb', v.height, 1, v);
      } else {
        const upper = Math.max(0, v.maxY - myDoor.minY);
        const lower = Math.max(0, myDoor.minY - v.minY);
        // 边门框(同时是 elevation 最边 jamb)的 transom 以上段打标记: 450 出料时按 Jamb 计
        if (upper > 0.5) addCut('Door Jamb At Transom', upper, 1, v, isJamb ? { edgeDoorJamb: true } : null);
        if (lower > 0.5) addCut('Door Jamb', lower, 1, v);
      }
    } else if (isJamb) {
      addCut('Jamb', v.height, 1, v);
    } else {
      addCut('Vertical', v.height, 1, v);
    }
  }
  // Each drawn door head → one Transom Bar piece (synthesized heads have no drawn bar)
  // (Transom Bar 已在上面横料分类里按门头发出, 此处不再重复)
  // Subsills
  for (const s of thin) addCut('Subsill', s.width, 1, s);
  // HEAD synthesis: if no head detected, use outline width
  if (!cuts.some(c => c.position === 'Head') && verticals.length) {
    const jambW = verticals[0].width || 2.75;
    addCut('Head', Math.max(0, outline.width - 2 * jambW));
  }
  return cuts;
}

// 1600 专用归类:基于已解析的 cut.src 几何,只分 4 类,不做门检测。
// 判定原则(用户定义):"某一侧没有相邻横料 = 周边"
//   竖料: 只有一边有横料 → Jamb;两边都有 → Vertical
//   横料: 上方没有横料(本跨最顶) → Head;下方没有 → Sill;上下都有 → Horizontal
// 这样能扛阶梯底/门洞:角部抬高的底料、门头横料都按"本跨上下邻居"正确归类,
// 而不是用全局最高/最低一条线。门洞处被拆成两段的竖料(共用 src)去重合回整根。
function reclassify1600(o) {
  if (!o || !Array.isArray(o.cuts) || !o.cuts.length) return;
  const seen = new Set(), boxes = [];
  for (const c of o.cuts) {
    if (!c.src) continue;
    const s = c.src, key = [s.x, s.y, s.w, s.h].join(',');
    if (seen.has(key)) continue;
    seen.add(key); boxes.push(s);
  }
  if (!boxes.length) return;   // 无溯源几何(手填)→ 不动
  const H = o.height || 1, W = o.width || 1;
  const tx = Math.max(2, W * 0.01), ty = Math.max(2, H * 0.01);
  const mk = (s) => ({ s, x0: s.x, x1: s.x + s.w, y0: s.y, y1: s.y + s.h, xc: s.x + s.w / 2, yc: s.y + s.h / 2 });
  const horiz = boxes.filter(s => s.w >= s.h).map(mk);
  const vert  = boxes.filter(s => s.h > s.w).map(mk);
  const coversX = (h, x) => h.x0 <= x + 0.001 && h.x1 >= x - 0.001;            // 横料是否盖住某 x 点
  const ovX = (a, b) => Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);          // x 区间重叠量
  const near = (a, b) => ovX(a, b) > Math.min(a.x1 - a.x0, b.x1 - b.x0) * 0.4; // 视为上下相邻
  const cuts = [];
  // 竖料(逐段判):在该段自己的高度范围内,左右两侧都有横料 → Vertical(中梃);
  //   只有一边(或没有)→ Jamb。于是顶部 band 段判 Vertical、下挂段的外侧边判 Jamb,
  //   门洞两侧的 mullion 因门头/门槛在门那侧也有横料 → 仍判 Vertical。
  for (const v of vert) {
    const relH = horiz.filter(h => h.y1 >= v.y0 - ty && h.y0 <= v.y1 + ty);   // y 区间相交的横料
    const left  = relH.some(h => coversX(h, v.xc - tx));
    const right = relH.some(h => coversX(h, v.xc + tx));
    cuts.push({ position: (left && right) ? 'Vertical' : 'Jamb', length: dxfRound(v.s.h), count: 1, src: { ...v.s } });
  }
  // 横料:看上方/下方(x 区间重叠)有没有横料;门头(抬高且下方无料)单列 Transom Bar
  const botRef = horiz.length ? Math.min(...horiz.map(g => g.yc)) : 0;
  for (const h of horiz) {
    const above = horiz.some(g => g !== h && g.yc > h.yc + ty && near(g, h));
    const below = horiz.some(g => g !== h && g.yc < h.yc - ty && near(g, h));
    let pos;
    if (above && below) pos = 'Horizontal';
    else if (!above && !below) pos = (h.yc > H / 2) ? 'Head' : 'Sill';         // 孤立件按上/下半场
    else if (!above) pos = 'Head';                                             // 上无下有 → 本跨最顶 = Head
    else pos = (h.yc <= botRef + H * 0.2) ? 'Sill' : 'Transom Bar';            // 上有下无 → 近底=Sill,抬高=门头(单独算)
    cuts.push({ position: pos, length: dxfRound(h.s.w), count: 1, src: { ...h.s } });
  }
  o.cuts = cuts;
  o.horiz = cuts.filter(c => c.position === 'Horizontal').length;
  o.vert  = cuts.filter(c => c.position === 'Vertical').length;
}

function dxfSystemForMark(mark) {
  const clean = String(mark || '').toUpperCase().replace(/\s+/g, '');
  const exterior = new Set([
    'WN1', 'WN2', 'WN3', 'WN4',
    'WS12', 'WS13', 'WS14', 'WS15', 'WS16', 'WS17', 'WS18', 'WS19',
    'WS20', 'WS21', 'WS22', 'WS23', 'WS24', 'WS25', 'WS26', 'WS27',
    'WS28', 'WS29', 'WS30', 'WS31', 'WS32', 'WS33', 'WS34',
    'WS46', 'WS47',
  ]);
  const interior = new Set([
    'WN5',
    'WS1', 'WS2', 'WS3', 'WS4', 'WS5', 'WS6', 'WS7', 'WS8', 'WS9',
    'WS10', 'WS11',
    'WS35', 'WS36', 'WS37', 'WS38', 'WS39', 'WS40', 'WS41', 'WS42',
    'WS43', 'WS44', 'WS45',
  ]);
  if (exterior.has(clean)) return 'IR501T';
  if (interior.has(clean)) return '450';
  if (/^SF\d/.test(clean)) return '750XT';  // AC3 storefront marks → YKK 750XT
  const sys = SYSTEMS_LIST();
  return sys[0] || 'IR501T';
}

function dxfPairs(text) {
  const lines = text.split(/\r?\n/);
  const pairs = [];
  for (let i = 0; i < lines.length - 1; i += 2) {
    const code = parseInt(lines[i].trim(), 10);
    if (!Number.isNaN(code)) pairs.push([code, lines[i + 1].trim()]);
  }
  return pairs;
}

function dxfCollectEntities(pairs, sectionName) {
  let section = null;
  let pendingSection = false;
  let current = null;
  const entities = [];

  for (const [code, value] of pairs) {
    if (code === 0 && value === 'SECTION') { pendingSection = true; continue; }
    if (pendingSection && code === 2) { section = value; pendingSection = false; continue; }
    if (code === 0 && value === 'ENDSEC') { section = null; continue; }
    if (section !== sectionName) continue;

    if (code === 0) {
      if (current) entities.push(current);
      current = { type: value, pairs: [] };
    } else if (current) {
      current.pairs.push([code, value]);
    }
  }
  if (current) entities.push(current);
  return entities;
}

function dxfCollectBlocks(pairs) {
  let section = null;
  let pendingSection = false;
  let blockName = null;
  let current = null;
  const blockEntities = [];
  const blocks = new Map();

  for (const [code, value] of pairs) {
    if (code === 0 && value === 'SECTION') { pendingSection = true; continue; }
    if (pendingSection && code === 2) { section = value; pendingSection = false; continue; }
    if (code === 0 && value === 'ENDSEC') { section = null; continue; }
    if (section !== 'BLOCKS') continue;

    if (code === 0 && value === 'BLOCK') {
      blockName = null;
      blockEntities.length = 0;
      current = null;
      continue;
    }
    if (code === 0 && value === 'ENDBLK') {
      if (current) blockEntities.push(current);
      if (blockName) blocks.set(blockName, blockEntities.map(e => ({ type: e.type, pairs: [...e.pairs] })));
      current = null;
      blockName = null;
      continue;
    }
    if (blockName === null && code === 2) {
      blockName = value;
      continue;
    }
    if (blockName === null) continue;

    if (code === 0) {
      if (current) blockEntities.push(current);
      current = { type: value, pairs: [] };
    } else if (current) {
      current.pairs.push([code, value]);
    }
  }
  return blocks;
}

function dxfValues(entity, code) {
  return entity.pairs.filter(([c]) => c === code).map(([, value]) => value);
}

function dxfValue(entity, code) {
  const values = dxfValues(entity, code);
  return values.length ? values[0] : '';
}

// #S3: real HATCH boundary-path parser (walks codes 91/92/93/72/73/10/20/11/21, per the DXF
// spec), NOT a flat x(10)/y(20) pair scan. A flat scan is wrong for HATCH: every entity also
// carries a base/elevation point (10/20/30 = 0,0,0, right after the AcDbHatch subclass marker,
// BEFORE the boundary data) and, after the boundary paths, pattern-definition/seed-point data
// that reuses the same 10/20 codes (e.g. gradient seed points under code 98) — a naive scan
// picks up both and produces garbage boxes that "start at 0,0" (see PROPAGATION-DESIGN.md §3,
// the original failed attempt). Returns the union bbox of ALL boundary-path loops (a single
// HATCH entity here is typically many small sub-loops — bolt/reveal cutouts — that together
// outline one physical panel), or null if unparseable. Only line (72=1) and arc/ellipse
// (72=2/3, approximated by their circumscribing box) edges are handled — spline (72=4)
// boundaries aren't expected in these architectural panel hatches and abort the walk safely
// (returns whatever was accumulated so far, never throws).
function dxfHatchBoundaryBBox(entity) {
  const p = entity.pairs;
  const i91 = p.findIndex(([c]) => c === 91); // number of boundary paths — marks the start of boundary data
  if (i91 === -1) return null;
  let i = i91 + 1;
  let nPaths = parseInt(p[i91][1], 10);
  if (!Number.isFinite(nPaths) || nPaths <= 0) return null;
  const xs = [], ys = [];
  const next = () => (i < p.length ? p[i] : null);
  for (let pi = 0; pi < nPaths; pi++) {
    const t92 = next(); if (!t92 || t92[0] !== 92) break; // malformed — stop, keep whatever we have
    const flag = parseInt(t92[1], 10); i++;
    const isPoly = (flag & 2) !== 0;
    if (isPoly) {
      const tBulge = next(); if (!tBulge || tBulge[0] !== 72) break;
      const hasBulge = tBulge[1] === '1'; i++;
      const tClosed = next(); if (!tClosed || tClosed[0] !== 73) break; i++;
      const tN = next(); if (!tN || tN[0] !== 93) break;
      const nverts = parseInt(tN[1], 10); i++;
      let ok = true;
      for (let v = 0; v < nverts; v++) {
        const tx = next(); if (!tx || tx[0] !== 10) { ok = false; break; }
        xs.push(parseFloat(tx[1])); i++;
        const ty = next(); if (!ty || ty[0] !== 20) { ok = false; break; }
        ys.push(parseFloat(ty[1])); i++;
        if (hasBulge && next() && next()[0] === 42) i++; // skip bulge value
      }
      if (!ok) break;
    } else {
      const tN = next(); if (!tN || tN[0] !== 93) break;
      const nedges = parseInt(tN[1], 10); i++;
      let ok = true;
      for (let ed = 0; ed < nedges; ed++) {
        const tType = next(); if (!tType || tType[0] !== 72) { ok = false; break; }
        const etype = parseInt(tType[1], 10); i++;
        if (etype === 1) { // line: 10/20 start, 11/21 end
          if (!next() || next()[0] !== 10) { ok = false; break; } xs.push(parseFloat(p[i][1])); i++;
          if (!next() || next()[0] !== 20) { ok = false; break; } ys.push(parseFloat(p[i][1])); i++;
          if (!next() || next()[0] !== 11) { ok = false; break; } xs.push(parseFloat(p[i][1])); i++;
          if (!next() || next()[0] !== 21) { ok = false; break; } ys.push(parseFloat(p[i][1])); i++;
        } else if (etype === 2 || etype === 3) { // arc/ellipse — approximate via circumscribing box
          if (!next() || next()[0] !== 10) { ok = false; break; } const cx = parseFloat(p[i][1]); i++;
          if (!next() || next()[0] !== 20) { ok = false; break; } const cy = parseFloat(p[i][1]); i++;
          let r = 0;
          if (etype === 2) { if (next() && next()[0] === 40) { r = parseFloat(p[i][1]); i++; } if (next() && next()[0] === 50) i++; if (next() && next()[0] === 51) i++; if (next() && next()[0] === 73) i++; }
          else { let mx = 0, my = 0; if (next() && next()[0] === 11) { mx = parseFloat(p[i][1]); i++; } if (next() && next()[0] === 21) { my = parseFloat(p[i][1]); i++; } r = Math.hypot(mx, my); if (next() && next()[0] === 40) i++; if (next() && next()[0] === 50) i++; if (next() && next()[0] === 51) i++; if (next() && next()[0] === 73) i++; }
          xs.push(cx - r, cx + r); ys.push(cy - r, cy + r);
        } else { ok = false; break; } // spline or unknown edge type — bail out of this path
      }
      if (!ok) break;
    }
    // 97 = number of source boundary objects; skip that many 330 handles
    const t97 = next();
    if (t97 && t97[0] === 97) {
      const nsrc = parseInt(t97[1], 10); i++;
      for (let s = 0; s < nsrc; s++) { if (next() && next()[0] === 330) i++; }
    }
  }
  if (!xs.length) return null;
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

function dxfMtextSummary(entity) {
  return {
    text: dxfValue(entity, 1).trim(),
    x: parseFloat(dxfValue(entity, 10)),
    y: parseFloat(dxfValue(entity, 20)),
  };
}

function dxfInsertSummary(entity) {
  return {
    block: dxfValue(entity, 2),
    x: parseFloat(dxfValue(entity, 10)) || 0,
    y: parseFloat(dxfValue(entity, 20)) || 0,
    scaleX: parseFloat(dxfValue(entity, 41)) || 1,
    scaleY: parseFloat(dxfValue(entity, 42)) || 1,
  };
}

function dxfTransformEntity(entity, insert) {
  return {
    type: entity.type,
    pairs: entity.pairs.map(([code, value]) => {
      if (code === 10) return [code, String(insert.x + (parseFloat(value) || 0) * insert.scaleX)];
      if (code === 20) return [code, String(insert.y + (parseFloat(value) || 0) * insert.scaleY)];
      return [code, value];
    }),
  };
}

function dxfPolylineSummary(entity) {
  const xs = dxfValues(entity, 10).map(Number);
  const ys = dxfValues(entity, 20).map(Number);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    handle: dxfValue(entity, 5),
    layer: dxfValue(entity, 8),
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

function dxfTransformBox(box, insert) {
  const minX = insert.x + box.minX * insert.scaleX;
  const maxX = insert.x + box.maxX * insert.scaleX;
  const minY = insert.y + box.minY * insert.scaleY;
  const maxY = insert.y + box.maxY * insert.scaleY;
  return {
    ...box,
    handle: `${insert.block}:${box.handle}`,
    minX,
    maxX,
    minY,
    maxY,
    width: Math.abs(maxX - minX),
    height: Math.abs(maxY - minY),
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

function dxfRound(value) {
  return Math.round(value * 1000) / 1000;
}

// ---------- System picker modal (import 追问 + 批量统一) ----------
// resolve 值: 系统名=套用该系统; null=保持自动识别(仅 import); undefined=取消(不改动)
function pickSystem({ title, msg, includeAuto } = {}) {
  return new Promise(resolve => {
    const modal = document.getElementById('system-modal');
    const choices = document.getElementById('system-modal-choices');
    if (!modal || !choices) { resolve(undefined); return; }
    document.getElementById('system-modal-title').textContent = title || 'Select System';
    document.getElementById('system-modal-msg').textContent = msg || '';
    const done = (val) => { modal.style.display = 'none'; choices.innerHTML = ''; modal.onclick = null; resolve(val); };
    choices.innerHTML = '';
    for (const s of SYSTEMS_LIST()) {
      const b = document.createElement('button');
      b.className = 'tk-btn tk-btn--dark'; b.textContent = s;
      b.onclick = () => done(s); choices.appendChild(b);
    }
    if (includeAuto) {
      const b = document.createElement('button');
      b.className = 'tk-btn tk-btn--ghost'; b.textContent = 'Keep auto-detect (per-mark)';
      b.onclick = () => done(null); choices.appendChild(b);
    }
    const c = document.createElement('button');
    c.className = 'tk-btn tk-btn--ghost'; c.textContent = 'Cancel';
    c.onclick = () => done(undefined); choices.appendChild(c);
    modal.style.display = 'flex';
    modal.onclick = (e) => { if (e.target === modal) done(undefined); };
  });
}

async function setAllOpeningsSystem() {
  if (!state.openings.length) return;
  const sys = await pickSystem({
    title: 'Unify System',
    msg: `Set the system for all ${state.openings.length} openings to:`,
    includeAuto: false,
  });
  if (!sys) return; // 取消
  state.openings.forEach(o => { o.system = sys; if (is1600(sys)) reclassify1600(o); });
  save(); renderOpenings(); renderReport(); renderMeta();
}

async function runDxfParse() {
  const ta = document.getElementById('dxf-text');
  const text = ta.value;
  // #S4: ask which system BEFORE parsing, so classification/whitelist run against the
  // confirmed system instead of a per-mark guess (see memory.md "S4").
  const sys = await pickSystem({
    title: 'Import — Select System',
    msg: `Which system is this batch? (usually one at a time; the whole batch gets it — or keep auto-detect for a mixed schedule).`,
    includeAuto: true,
  });
  if (sys === undefined) return; // cancelled — nothing parsed yet, nothing to undo
  appendParsedOpenings(parseDxfText(text, { forcedSystem: sys || undefined }), ta, sys);
}

async function appendParsedOpenings(result, sourceEl = null, presetSys) {
  const { openings, errors } = result;
  const statusEl = document.getElementById('dxf-status');
  if (!openings.length) {
    statusEl.textContent = `0 openings parsed — check format`;
    statusEl.className = 'tk-dxf__status is-err';
    return;
  }
  if (state.openings.length &&
      !confirm(`The Openings table already has ${state.openings.length} rows; import will append (not replace).\nClick OK to append; click Cancel to stop, then clear the old rows before importing.`)) {
    statusEl.textContent = 'Import cancelled — table unchanged';
    statusEl.className = 'tk-dxf__status is-err';
    return;
  }
  // #S4: callers now ask which system BEFORE parsing and pass their resolved choice as
  // presetSys, so classification already ran against the confirmed system. Only ask here as a
  // fallback if a caller didn't pre-ask (keeps this function safe to call directly elsewhere).
  const sys = presetSys !== undefined ? presetSys : await pickSystem({
    title: 'Import — Select System',
    msg: `Parsed ${openings.length} openings. Which system is this batch? (usually one at a time; the whole batch gets it)`,
    includeAuto: true,
  });
  if (sys === undefined) {
    statusEl.textContent = 'Import cancelled — table unchanged';
    statusEl.className = 'tk-dxf__status is-err';
    return;
  }
  if (sys) openings.forEach(o => { o.system = sys; }); // belt-and-suspenders relabel; cuts were already classified with forcedSystem above
  if (is1600(sys)) openings.forEach(reclassify1600);
  state.openings.push(...openings);
  renderOpenings(); renderReport(); renderMeta(); save();
  // M2: auto-push elevations parsed this batch (manual "→ Tracker" button stays as a force-re-push fallback).
  if (ELEV_EXPORTS.size && window.__fb) { try { await exportElevationsToTracker(); } catch (e) { console.warn('[M2] auto-push failed:', e); } }
  const msg = `+${openings.length} openings added` + (errors.length ? ` · ${errors.length} skipped` : '');
  statusEl.textContent = msg;
  statusEl.className = 'tk-dxf__status ' + (errors.length ? 'is-err' : 'is-ok');
  if (sourceEl) sourceEl.value = '';
}

function importDxfFile() {
  document.getElementById('dxf-file').click();
}

async function onDxfFileChange(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const statusEl = document.getElementById('dxf-status');
  try {
    const text = await file.text();
    // #S4: ask which system BEFORE parsing (same rule as runDxfParse) so classification runs
    // against the confirmed system instead of a per-mark guess.
    const sys = await pickSystem({
      title: 'Import — Select System',
      msg: `Which system is ${file.name}? (usually one at a time; the whole batch gets it — or keep auto-detect for a mixed schedule).`,
      includeAuto: true,
    });
    if (sys === undefined) { statusEl.textContent = 'Import cancelled'; statusEl.className = 'tk-dxf__status is-err'; e.target.value = ''; return; }
    const forcedSystem = sys || undefined;
    // Try real DXF geometry parse first; fall back to text/schedule parser
    let result = null;
    if (text.includes('SECTION') && text.includes('ENTITIES')) {
      try { result = parseRawDxfOpenings(text, { forcedSystem }); } catch (e) { console.warn('DXF parse failed, falling back to text:', e); }
    }
    if (!result || !result.openings || !result.openings.length) {
      result = parseDxfText(text, { forcedSystem });
    }
    await appendParsedOpenings(result, null, sys);
    statusEl.textContent = `${file.name}: ${statusEl.textContent}`;
  } catch (err) {
    statusEl.textContent = `Could not read ${file.name}`;
    statusEl.className = 'tk-dxf__status is-err';
  } finally {
    e.target.value = '';
  }
}

function loadDxfSample() {
  const sample = `SF-01  IR501T  72  96   2
SF-02, IR501T, 60x84, qty 3
ENT-1   IR501T   84" x 108"   x1
F-3   450   48 x 96    (4)
F-4   450   36 x 84    qty: 6`;
  document.getElementById('dxf-text').value = sample;
}

// ============================================================
//  EXPORT
// ============================================================
function exportCsv() {
  const { rows, unresolved } = buildReport();
  const lines = [];
  lines.push(['System','Part Number','Description','Roles','Total Cut Length (in)','Stocks (FFD, pcs)','Stocks +'+wastePctVal()+'% (pcs)','Oversize (pcs)','Oversize Lengths (in)']
    .map(csvEsc).join(','));
  for (const r of rows) {
    lines.push([
      r.system, r.partNumber, r.description, r.rolesUsed.join(' / '),
      r.totalInches.toFixed(2), r.stocks, r.stocksWaste,
      r.oversize.length, r.oversize.map(o => o.toFixed(2)).join(' / ')
    ].map(csvEsc).join(','));
  }
  if (unresolved.length) {
    lines.push('');
    lines.push('UNRESOLVED — no part assigned for these positions');
    lines.push(['System','Position','Total Cut Length (in)'].map(csvEsc).join(','));
    for (const u of unresolved) {
      lines.push([u.system, u.position, u.totalInches.toFixed(2)].map(csvEsc).join(','));
    }
  }
  const ascii = s => String(s ?? '').replace(/×/g, 'x').replace(/÷/g, '/').replace(/[″"]/g, 'in').replace(/°/g, 'deg');
  const accRows = computeAccessories().filter(r => r.qty > 0);   // #3: export only accessories actually used (qty > 0)
  if (accRows.length) {
    lines.push('');
    lines.push('ACCESSORIES');
    lines.push(['Part Number','Description','Rule','Positions','Param','Min','Qty','Unit','Basis'].map(csvEsc).join(','));
    for (const { acc: a, qty, basis } of accRows) {
      lines.push([
        a.partNumber || '', a.description || '', ascii((ACC_RULES[a.rule] || {}).label || a.rule),
        (a.positions || []).join(' / ') || '(all)', a.param, a.min || 0, qty, a.unit || 'ea', ascii(basis)
      ].map(csvEsc).join(','));
    }
  }
  download('takeoff.csv', String.fromCharCode(0xFEFF) + lines.join('\n'), 'text/csv;charset=utf-8');   // #3: UTF-8 BOM so Excel doesn't mojibake
}
function csvEsc(v) {
  const s = String(v ?? '');
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
}
function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
}

function copyReport() {
  const { rows, unresolved } = buildReport();
  const COL = [22, 14, 38, 22, 14, 8, 8, 6];
  const pad = (s, n, right) => {
    s = String(s);
    if (s.length > n) s = s.slice(0, n-1)+'…';
    return right ? s.padStart(n) : s.padEnd(n);
  };
  const header = ['System','Part #','Description','Roles','Cut In.','Stocks','+'+wastePctVal()+'%','Over']
    .map((h,i) => pad(h, COL[i], i>=4)).join('  ');
  const rule = COL.map(n => '─'.repeat(n)).join('  ');
  const out = [header, rule];
  for (const r of rows) {
    out.push([
      pad(r.system, COL[0]),
      pad(r.partNumber, COL[1]),
      pad(r.description, COL[2]),
      pad(r.rolesUsed.join('/'), COL[3]),
      pad(formatNumber(r.totalInches), COL[4], true),
      pad(r.stocks, COL[5], true),
      pad(r.stocksWaste, COL[6], true),
      pad(r.oversize.length || '—', COL[7], true),
    ].join('  '));
  }
  if (unresolved.length) {
    out.push('');
    out.push('UNRESOLVED:');
    for (const u of unresolved) {
      out.push(`  ${u.system}  ${u.position.padEnd(12)}  ${formatNumber(u.totalInches).padStart(10)}"`);
    }
  }
  const text = out.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    flash('export-status', 'Report copied to clipboard', false);
  }, () => {
    flash('export-status', 'Copy failed', true);
  });
}

// ============================================================
//  RESET
// ============================================================
function importPartList(text, format) {
  // format: 'json' (array of {system, partNumber, description, roles:[]}) or 'csv'
  // CSV columns: system, partNumber, description, role1, role2, ...
  let parts = [];
  text = (text||'').trim();
  if (!text) return { ok:false, error:'empty input' };
  if (format === 'json' || text.startsWith('[') || text.startsWith('{')) {
    try {
      const data = JSON.parse(text);
      parts = (Array.isArray(data) ? data : data.parts || []).map(p => ({
        id: uid(),
        system: String(p.system || p.System || '').trim(),
        partNumber: String(p.partNumber || p.part || p['Part #'] || p['Part'] || '').trim(),
        description: String(p.description || p.desc || p['Description'] || '').trim(),
        roles: Array.isArray(p.roles) ? p.roles : (p.role ? [p.role] : []),
      })).filter(p => p.partNumber);
    } catch (e) { return { ok:false, error:'JSON parse: '+e.message }; }
  } else {
    // CSV/TSV
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    const sep = lines[0].includes('\t') ? '\t' : ',';
    const header = lines[0].split(sep).map(s => s.trim().toLowerCase());
    const iSys = header.findIndex(h => /system/i.test(h));
    const iPn  = header.findIndex(h => /part/i.test(h) && /num|#/i.test(h));
    const iDesc= header.findIndex(h => /desc/i.test(h));
    const iRoleStart = header.findIndex(h => /role|position/i.test(h));
    if (iPn < 0) return { ok:false, error:'no Part Number column' };
    for (const ln of lines.slice(1)) {
      const cols = ln.split(sep).map(s => s.trim());
      const roles = iRoleStart >= 0 ? cols.slice(iRoleStart).filter(Boolean) : [];
      parts.push({
        id: uid(),
        system: iSys >= 0 ? cols[iSys] : '',
        partNumber: cols[iPn],
        description: iDesc >= 0 ? cols[iDesc] : '',
        roles,
      });
    }
  }
  if (!parts.length) return { ok:false, error:'no rows parsed' };
  state.parts = parts;
  state.partsDbVersion = (state.partsDbVersion||0) + 1;
  save();
  renderAll();
  return { ok:true, count:parts.length };
}
window.importPartList = importPartList;

function resetAll() {
  if (!confirm('Clear all parts and openings? This cannot be undone.')) return;
  state = { partsDbVersion: PARTS_DB_VERSION, parts: cloneSeedParts(), openings: [], accessories: cloneSeedAccessories() };
  renderAll();
}
function clearOpenings() {
  if (!state.openings.length) return;
  if (!confirm('Remove all openings? Parts database stays.')) return;
  state.openings = [];
  renderOpenings(); renderReport(); renderMeta(); save();
}

// ============================================================
//  WIRE UP
// ============================================================
function init() {
  // Parts
  const partsBody = document.getElementById('parts-tbody');
  partsBody.addEventListener('input', onPartsChange);
  partsBody.addEventListener('change', onPartsChange);
  partsBody.addEventListener('click', onPartsClick);
  document.getElementById('add-part').addEventListener('click', addPart);

  // Import Parts button → file picker
  const importPartsBtn = document.getElementById('import-parts');
  const partsFileInput = document.getElementById('parts-file');
  if (importPartsBtn && partsFileInput) {
    importPartsBtn.addEventListener('click', () => partsFileInput.click());
    partsFileInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const text = await file.text();
      const fmt = file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv';
      const result = importPartList(text, fmt);
      flash('qa-status', result.ok ? `Imported ${result.count} parts` : ('Error: '+result.error), !result.ok);
      e.target.value = '';
    });
  }

  // Layer Config button → open modal
  const lcBtn = document.getElementById('layer-config');
  const lcModal = document.getElementById('layer-config-modal');
  const lcOpen = () => {
    document.getElementById('lc-alum').value = LAYER_CONFIG.alum || '';
    document.getElementById('lc-doorSubframe').value = LAYER_CONFIG.doorSubframe || '';
    document.getElementById('lc-outline').value = LAYER_CONFIG.outline || '';
    document.getElementById('lc-door').value = LAYER_CONFIG.door || '';
    document.getElementById('lc-fallbacks').value = (LAYER_CONFIG.fallbacks || []).join(',');
    lcModal.style.display = 'flex';
  };
  const lcClose = () => { lcModal.style.display = 'none'; };
  if (lcBtn && lcModal) {
    lcBtn.addEventListener('click', lcOpen);
    document.getElementById('lc-cancel').addEventListener('click', lcClose);
    document.getElementById('lc-save').addEventListener('click', () => {
      setLayerConfig({
        alum: document.getElementById('lc-alum').value.trim(),
        doorSubframe: document.getElementById('lc-doorSubframe').value.trim(),
        outline: document.getElementById('lc-outline').value.trim(),
        door: document.getElementById('lc-door').value.trim(),
        fallbacks: document.getElementById('lc-fallbacks').value.split(',').map(s => s.trim()).filter(Boolean),
      });
      lcClose();
    });
    lcModal.addEventListener('click', (e) => { if (e.target === lcModal) lcClose(); });
  }


  // Openings
  const opsBody = document.getElementById('openings-tbody');
  opsBody.addEventListener('input', onOpeningsInput);
  opsBody.addEventListener('change', onOpeningsInput);
  opsBody.addEventListener('click', onOpeningsClick);
  document.getElementById('add-opening').addEventListener('click', addOpeningFromQuick);
  document.getElementById('clear-openings').addEventListener('click', clearOpenings);
  const setAllSysBtn = document.getElementById('set-all-system');
  if (setAllSysBtn) setAllSysBtn.addEventListener('click', setAllOpeningsSystem);

  // DXF
  document.getElementById('dxf-import').addEventListener('click', importDxfFile);
  document.getElementById('dxf-file').addEventListener('change', onDxfFileChange);
  document.getElementById('dxf-parse').addEventListener('click', runDxfParse);
  document.getElementById('dxf-sample').addEventListener('click', loadDxfSample);
  const exportElevBtn = document.getElementById('export-elev');
  if (exportElevBtn) exportElevBtn.addEventListener('click', exportElevationsToTracker);

  // Export
  document.getElementById('export-csv').addEventListener('click', exportCsv);
  const exportCuttingAllBtn = document.getElementById('export-cutting-dxf-all');
  if (exportCuttingAllBtn) exportCuttingAllBtn.addEventListener('click', downloadAllCuttingDxf);
  const exportCuttingCombinedBtn = document.getElementById('export-cutting-dxf-combined');
  if (exportCuttingCombinedBtn) exportCuttingCombinedBtn.addEventListener('click', downloadCombinedCuttingDxf);
  document.getElementById('copy-report').addEventListener('click', copyReport);
  document.getElementById('reset-all').addEventListener('click', resetAll);

  // Recognized Roles panel (#2, 2026-07-20 Opus)
  const rrSystemSel = document.getElementById('rr-system');
  if (rrSystemSel) rrSystemSel.addEventListener('change', e => { _rrSystem = e.target.value; renderRecognizedRoles(); });
  const rrBody = document.getElementById('rr-body');
  if (rrBody) {
    rrBody.addEventListener('click', e => {
      if (!_rrSystem) return;
      const del = e.target.closest('.rr-del');
      if (del) {
        const cur = (state.recognizedRoles && state.recognizedRoles[_rrSystem]) || [];
        setRecognizedRoles(_rrSystem, cur.filter(r => r !== del.dataset.role));
        return;
      }
      if (e.target.closest('#rr-curate')) { setRecognizedRoles(_rrSystem, Array.from(allowedRolesForSystem(_rrSystem))); return; }
      if (e.target.closest('#rr-reset'))  { setRecognizedRoles(_rrSystem, null); return; }
      if (e.target.closest('#rr-add-btn')) {
        const inp = document.getElementById('rr-add');
        const v = inp && inp.value.trim();
        if (!v) return;
        const cur = (state.recognizedRoles && state.recognizedRoles[_rrSystem]) || [];
        setRecognizedRoles(_rrSystem, [...cur, v]);
      }
    });
    rrBody.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.id === 'rr-add') { e.preventDefault(); document.getElementById('rr-add-btn')?.click(); }
    });
  }

  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
