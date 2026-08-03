/* Harness: exercises the submittal-log block of app.js against the real index.html markup. */
const fs = require('fs');
const { JSDOM } = require('/tmp/node_modules/jsdom');
const ROOT = '/sessions/relaxed-eloquent-archimedes/mnt/AC3 tracker/';

const html = fs.readFileSync(ROOT + 'index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only' });
const { window } = dom;
const src = fs.readFileSync(ROOT + 'app.js', 'utf8');
const a = src.indexOf('/* -------- Submittal log (M4) -------- */');
const b = src.indexOf('/* -------- Photo gallery viewer');
if (a < 0 || b < 0) throw new Error('block markers not found');
const block = src.slice(a, b);

const cfg = fs.readFileSync(ROOT + 'project-config.js', 'utf8');
window.eval(cfg);
window.state = { submittals: [] };
window.saveState = () => { window.__saved = (window.__saved || 0) + 1; };
window.toast = m => window.__toasts.push(m);
window.__toasts = [];
window.formatDate = d => d;
window.confirm = () => true;
window.eval(block + '\nwindow.__peek = () => ({ rev: _subReviewsRev, all: _subReviews });');
Object.defineProperty(window, '_subReviews', { get: () => window.__peek().all });
Object.defineProperty(window, '_subReviewsRev', { get: () => window.__peek().rev });

const ok = [];
const bad = [];
const t = (name, cond, extra) => (cond ? ok : bad).push(name + (cond ? '' : ' :: ' + JSON.stringify(extra)));

// 1. Add: defaults seeded in fixed order
window.openAddSubmittal();
const parties = window._subReviews.Rev0.map(r => r.party);
t('default 4 reviewers, fixed order',
  JSON.stringify(parties) === JSON.stringify(window.PROJECT.submittalReviewers), parties);
t('rev field defaults Rev0', window.document.getElementById('sub-rev').value === 'Rev0');
t('editor rendered 4 textareas',
  window.document.querySelectorAll('#sub-reviews textarea').length === 4);

// 2. Fill in responses like Procore
window.document.getElementById('sub-number').value = 'AF-009';
window.document.getElementById('sub-title').value = 'Sliding Door Data';
window.document.getElementById('sub-status').value = 'under-review';
window.setReviewField(0, 'status', 'na');
window.setReviewField(0, 'response', 'Acoustical review not required');
window.setReviewField(1, 'status', 'note');
window.setReviewField(1, 'response', 'Action required: share U-value & SHGC');
window.saveSubmittal();
const s = window.state.submittals[0];
t('saved 1 submittal', window.state.submittals.length === 1);
t('reviews stored under Rev0', !!(s.reviews && s.reviews.Rev0 && s.reviews.Rev0.length === 4), s.reviews);
t('AKRF response persisted', s.reviews.Rev0[0].response === 'Acoustical review not required');
t('status auto-stamped a date', /^\d{4}-\d{2}-\d{2}$/.test(s.reviews.Rev0[0].date), s.reviews.Rev0[0].date);
t('untouched reviewer stays pending + dateless',
  s.reviews.Rev0[3].status === 'pending' && !s.reviews.Rev0[3].date, s.reviews.Rev0[3]);
t('ballInCourt derived string',
  s.ballInCourt === window.PROJECT.submittalReviewers.join(' / '), s.ballInCourt);

// 3. Table cell render
window.renderSubmittals();
const cell = window.document.querySelectorAll('#submittalsBody tr td')[9].innerHTML;
t('cell shows rev + responded count', cell.includes('Rev0 · 2/4 responded'), cell.slice(0, 80));
t('cell lists every party', window.PROJECT.submittalReviewers.every(p =>
  cell.includes(p.replace(/&/g, '&amp;'))), cell);
// responses render inline, to the right of their reviewer, in a 2-col grid
t('cell is a 2-column grid', cell.includes('grid-template-columns:max-content 1fr'), cell.slice(0, 200));
t('response text shown inline (not a tooltip icon)',
  cell.includes('Acoustical review not required') && cell.includes('U-value &amp; SHGC') && !cell.includes('\u{1F4AC}'), cell.slice(0, 400));
{
  const cellEl = window.document.querySelectorAll('#submittalsBody tr td')[9];
  const g = cellEl.querySelector('div[style*="grid-template-columns"]');
  const kids = Array.from(g.children).map(d => d.textContent.trim());
  t('2 grid cells per reviewer (party, reply)', kids.length === 8, kids.length);
  t('reply sits immediately after its own party',
    kids[0].includes('AKRF') && kids[1].startsWith('Acoustical review not required') &&
    kids[2].includes('Bright Power') && kids[3].startsWith('Action required'), kids);
  t('reply carries the response date', /2\d{3}-\d{2}-\d{2}/.test(kids[1]), kids[1]);
  t('pending reviewer has an empty reply cell', kids[7] === '', kids[7]);
}

// 4. Re-open, bump to Rev1 -> history kept, parties carried, responses reset
window.editSubmittal(0);
t('reopen shows Rev0 rows', window._subReviewsRev === 'Rev0' && window._subReviews.Rev0.length === 4);
window.document.getElementById('sub-rev').value = 'Rev1';
window.onSubRevChange();
t('Rev1 seeded with same parties',
  JSON.stringify(window._subReviews.Rev1.map(r => r.party)) === JSON.stringify(parties));
t('Rev1 responses blank', window._subReviews.Rev1.every(r => r.status === 'pending' && !r.response && !r.date));
t('Rev0 history still in working copy', window._subReviews.Rev0[1].response.includes('U-value'));
t('history block rendered', window.document.querySelector('#sub-reviews details') !== null);
window.setReviewField(2, 'status', 'no-exception');
window.saveSubmittal();
const s2 = window.state.submittals[0];
t('both revs persisted', Object.keys(s2.reviews).sort().join(',') === 'Rev0,Rev1', Object.keys(s2.reviews));
t('Rev0 history intact after save', s2.reviews.Rev0[1].response.includes('U-value'));
t('id preserved on edit', s2.id === s.id);
window.renderSubmittals();
const cell2 = window.document.querySelectorAll('#submittalsBody tr td')[9].innerHTML;
t('cell follows current rev', cell2.includes('Rev1 · 1/4 responded'), cell2.slice(0, 80));

// 5. Legacy row (string only, no reviews) renders + upgrades on open
window.state.submittals.push({ id: 'legacy1', number: 'AF-005', rev: 'Rev0',
  ballInCourt: 'AKRF Inc.(Consulting) / Dattner Architects', status: 'under-review' });
window.renderSubmittals();
const legacyCell = window.document.querySelectorAll('#submittalsBody tr')[1].querySelectorAll('td')[9].innerHTML;
t('legacy string renders as rows', legacyCell.includes('Rev0 · 0/2 responded') && legacyCell.includes('Dattner'), legacyCell.slice(0, 90));
t('legacy row not mutated by render', window.state.submittals[1].reviews === undefined);
window.editSubmittal(1);
t('legacy opens with its 2 parties', window._subReviews.Rev0.length === 2, window._subReviews.Rev0);
window.resetReviewRows();
t('restore default list gives 4, order kept',
  JSON.stringify(window._subReviews.Rev0.map(r => r.party)) === JSON.stringify(parties));

// 6. Remove / add rows, blank rows dropped on save
window.removeReviewRow(3);
window.addReviewRow();
window.saveSubmittal();
t('blank added row dropped on save', window.state.submittals[1].reviews.Rev0.length === 3,
  window.state.submittals[1].reviews.Rev0);
t('removed reviewer gone from string',
  !window.state.submittals[1].ballInCourt.includes('Monadnock'), window.state.submittals[1].ballInCourt);

// 7. XSS / escaping
window.state.submittals.push({ id: 'x', number: 'X', rev: 'Rev0',
  reviews: { Rev0: [{ party: '<img src=x onerror=1>', status: 'note', response: 'a & b <b>', date: '' }] } });
window.renderSubmittals();
const xcell = window.document.querySelectorAll('#submittalsBody tr')[2].querySelectorAll('td')[9].innerHTML;
t('party escaped in cell', !xcell.includes('<img src=x'), xcell.slice(0, 120));

// 8. Drag-to-reorder
window.state.submittals = ['a','b','c','d'].map(n => ({ id: n, number: n.toUpperCase(), rev: 'Rev0', status: 'draft' }));
window.renderSubmittals();
const ids = () => window.state.submittals.map(x => x.id).join('');
t('grip is the only draggable element',
  window.document.querySelectorAll('#submittalsBody [draggable="true"]').length === 4 &&
  window.document.querySelectorAll('#submittalsBody tr[draggable="true"]').length === 0);
t('rows are drop zones', window.document.querySelector('#submittalsBody tr').getAttribute('ondrop') !== null);
window.reorderSubmittal(0, 2, false);          // a dropped below c
t('drag down (below target)', ids() === 'bcad', ids());
window.reorderSubmittal(3, 0, true);           // d dropped above b
t('drag up (above target)', ids() === 'dbca', ids());
window.reorderSubmittal(1, 1, true);
t('dropping on itself is a no-op', ids() === 'dbca', ids());
window.reorderSubmittal(0, 3, false);
t('drag to last position', ids() === 'bcad', ids());
// filtered view: hidden rows must keep their relative order
window.state.submittals = [
  { id: 'p1', status: 'draft' }, { id: 'h1', status: 'approved' },
  { id: 'p2', status: 'draft' }, { id: 'p3', status: 'draft' }];
window.setSubmittalFilter('draft');
window.renderSubmittals();
window.reorderSubmittal(3, 0, true);           // p3 above p1 while p2/h1 filtered context
t('reorder under a filter uses real indices', ids() === 'p3p1h1p2', ids());
t('filtered render still shows only matches',
  window.document.querySelectorAll('#submittalsBody tr').length === 3);
window.setSubmittalFilter('all');
// arrows still work (touch fallback)
window.renderSubmittals();
window.moveSubmittal(0, 1);
t('arrow fallback intact', ids() === 'p1p3h1p2', ids());
t('grip + both arrows present in handle cell',
  window.document.querySelector('#submittalsBody td').querySelectorAll('button').length === 2);

console.log('PASS ' + ok.length + '\n' + ok.map(x => '  ✓ ' + x).join('\n'));
if (bad.length) { console.log('\nFAIL ' + bad.length + '\n' + bad.map(x => '  ✗ ' + x).join('\n')); process.exit(1); }
