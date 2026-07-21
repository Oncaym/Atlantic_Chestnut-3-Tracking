#!/usr/bin/env node
// ============================================================
//  dxf-cli.js — parse + verify a DXF against the takeoff parser, no browser needed.
//
//  Usage:
//    node dxf-cli.js <file.dxf> [--system 45TU|750XT|auto] [--mark EL-01]
//         [--json] [--baseline f.json] [--save-baseline f.json]
//
//  Loads systems.js + app.js parser functions in a Node `vm` context with stubbed
//  window/document/localStorage (the harness pattern in memory.md "Node parser harness
//  recipe"), then calls parseRawDxfOpenings(text, {forcedSystem}) directly — no DOM needed,
//  that function is pure geometry-in/data-out.
//
//  Default output is a COMPACT per-mark summary (mark, system, WxH, per-role piece counts +
//  total run length). Never dumps raw geometry. --json = structured. --baseline f.json diffs
//  against a saved run and exits 1 on any change (a deterministic regression gate).
//  --save-baseline f.json writes the current parse as the new baseline.
//
//  NOTE for whoever runs this on their own machine: this does a plain fs.readFileSync of
//  app.js/systems.js — no truncation workaround needed there. (The AC3 agent's own bash
//  sandbox has a separate, unrelated issue reading this same OneDrive-synced folder — see
//  memory.md "bash mount serves STALE/TRUNCATED snapshots" — not a concern for a real machine.)
// ============================================================
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') args.json = true;
    else if (a === '--system') args.system = argv[++i];
    else if (a === '--mark') args.mark = argv[++i];
    else if (a === '--baseline') args.baseline = argv[++i];
    else if (a === '--save-baseline') args.saveBaseline = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
    else args._.push(a);
  }
  return args;
}

function loadSandbox(appJsPath, systemsJsPath) {
  const appjs = fs.readFileSync(appJsPath, 'utf8');
  const sysjs = fs.readFileSync(systemsJsPath, 'utf8');
  const sandbox = {
    console,
    window: { addEventListener() {}, removeEventListener() {}, ELEVATIONS: {} },
    document: {
      addEventListener() {}, getElementById() { return null; }, querySelectorAll() { return []; },
      createElement() { return { style: {}, setAttribute() {}, appendChild() {} }; },
      createElementNS() { return { style: {}, setAttribute() {}, appendChild() {} }; },
      readyState: 'complete',
    },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    navigator: {}, alert() {}, confirm() { return true; }, prompt() { return null; },
    requestAnimationFrame() {}, fetch: undefined,
    setTimeout, clearTimeout, setInterval, clearInterval,
    Promise, Map, Set, Math, JSON, Array, Object, String, Number, Boolean, Date, RegExp,
  };
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(sysjs, sandbox, { filename: 'systems.js' });
  vm.runInContext(appjs, sandbox, { filename: 'app.js' });
  return sandbox;
}

// Compact per-mark, per-role summary: never the raw cut/geometry list.
function summarize(openings) {
  return openings.map(o => {
    const roles = {};
    for (const c of (o.cuts || [])) {
      const k = c.position;
      if (!roles[k]) roles[k] = { count: 0, length: 0 };
      roles[k].count += c.count || 1;
      roles[k].length += (c.length || 0) * (c.count || 1);
    }
    return {
      mark: o.mark,
      system: o.system,
      width: o.width,
      height: o.height,
      roles: Object.keys(roles).sort().map(k => ({
        role: k, count: roles[k].count, length: +roles[k].length.toFixed(1),
      })),
    };
  });
}

function printCompact(summary, errors) {
  for (const o of summary) {
    console.log(`${o.mark}  [${o.system}]  ${o.width}"x${o.height}"`);
    for (const r of o.roles) {
      console.log(`  ${r.role.padEnd(22)} x${r.count}   ${r.length}"`);
    }
  }
  if (errors && errors.length) console.log(`\n${errors.length} error(s) during parse.`);
}

function byMark(summary) { return Object.fromEntries(summary.map(o => [o.mark, o])); }

function diffBaseline(current, baseline) {
  const cur = byMark(current), base = byMark(baseline);
  const marks = new Set([...Object.keys(cur), ...Object.keys(base)]);
  const diffs = [];
  for (const mark of [...marks].sort()) {
    const c = cur[mark], b = base[mark];
    if (!b) { diffs.push(`+ ${mark} (new opening)`); continue; }
    if (!c) { diffs.push(`- ${mark} (removed)`); continue; }
    if (c.system !== b.system) diffs.push(`${mark}: system ${b.system} -> ${c.system}`);
    const cr = Object.fromEntries(c.roles.map(r => [r.role, r]));
    const br = Object.fromEntries(b.roles.map(r => [r.role, r]));
    for (const role of new Set([...Object.keys(cr), ...Object.keys(br)])) {
      const cv = cr[role], bv = br[role];
      if (!bv) diffs.push(`${mark}: +${role} (new, x${cv.count} ${cv.length}")`);
      else if (!cv) diffs.push(`${mark}: -${role} (removed, was x${bv.count} ${bv.length}")`);
      else if (cv.count !== bv.count || Math.abs(cv.length - bv.length) > 0.1)
        diffs.push(`${mark}: ${role}  x${bv.count}->x${cv.count}   ${bv.length}"->${cv.length}"`);
    }
  }
  return diffs;
}

function printHelp() {
  console.log(`dxf-cli.js — parse + verify a DXF against the takeoff parser

Usage:
  node dxf-cli.js <file.dxf> [--system 45TU|750XT|auto] [--mark EL-01]
       [--json] [--baseline f.json] [--save-baseline f.json]

  --system NAME       force this system for classification (default: auto-detect per mark)
  --mark ID           only show this one opening's mark
  --json              structured JSON output instead of the compact text summary
  --baseline FILE      diff current parse vs a saved baseline; exits 1 if anything differs
  --save-baseline FILE write the current parse as a new baseline file
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args._[0]) { printHelp(); process.exit(args.help ? 0 : 1); }

  const dxfPath = args._[0];
  const takeoffDir = path.resolve(__dirname, '..');
  const appJsPath = path.join(takeoffDir, 'app.js');
  const systemsJsPath = path.join(takeoffDir, 'systems.js');

  const sandbox = loadSandbox(appJsPath, systemsJsPath);
  const dxfText = fs.readFileSync(dxfPath, 'utf8');

  const forcedSystem = (args.system && args.system !== 'auto') ? args.system : undefined;
  const result = sandbox.parseRawDxfOpenings(dxfText, { forcedSystem });
  if (!result || !result.openings) {
    console.error('Parse failed — no openings detected (check the DXF has a SECTION/ENTITIES block).');
    process.exit(1);
  }

  let openings = result.openings;
  if (args.mark) openings = openings.filter(o => o.mark === args.mark);
  const summary = summarize(openings);

  if (args.saveBaseline) {
    fs.writeFileSync(args.saveBaseline, JSON.stringify(summary, null, 1));
    console.log(`Baseline saved: ${args.saveBaseline} (${summary.length} opening(s))`);
    return;
  }

  if (args.baseline) {
    const baseline = JSON.parse(fs.readFileSync(args.baseline, 'utf8'));
    const diffs = diffBaseline(summary, baseline);
    if (!diffs.length) { console.log('No differences vs baseline.'); return; }
    console.log(`${diffs.length} difference(s) vs baseline:`);
    diffs.forEach(d => console.log('  ' + d));
    process.exit(1);
  }

  if (args.json) { console.log(JSON.stringify(summary, null, 1)); return; }
  printCompact(summary, result.errors);
}

main();
