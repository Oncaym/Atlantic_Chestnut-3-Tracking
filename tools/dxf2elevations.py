#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
dxf2elevations.py — BATCH-convert shop-drawing DXF files into window.ELEVATIONS
entries for the tracker (elevations.js), auto-detecting the SF number from TEXT
entities in each drawing.

WHY THIS EXISTS
  Feeding elevations to Claude one chat-image at a time burns tokens. DXF is
  plain text — geometry can be extracted by code. Run this ONCE over a folder
  of DXFs; Claude (or a human) only reviews the result. Element TYPES don't
  need to be perfect: the tracker's popup type-editor (F-009) fixes
  misclassifications in two clicks.

STATUS: ⚠ UNTESTED — written 2026-07-06 without a sample DXF on hand.
  Next Claude session: run it on ONE real DXF first, compare with the
  hand-built SF01 entry in elevations.js, adjust (likely: layer→color map,
  text height threshold, rect-detection tolerance), then batch the rest.

USAGE
  python dxf2elevations.py <folder-with-dxfs> [--out elevations.add.js]
                           [--id-pattern "SF\\d+[A-Z]?"] [--merge elevations.js]
  --merge: injects/replaces keys directly inside an existing elevations.js
           (makes a .bak first). Without it, writes a standalone JS you can
           review, then paste keys in.

OUTPUT FORMAT (must match what app.js expects)
  window.ELEVATIONS = { "SF05": { viewBox:"x y w h", name:"...",
      base:"<svg fragment: outline geometry>",
      elements:[ {id:"G01",x,y,w,h,t0:"glass|panel|door|louver"} ... ] }, ... }
"""
import re, sys, os, json, argparse

def parse_pairs(text):
    """DXF = alternating group-code / value lines."""
    lines = text.splitlines()
    return [(lines[i].strip(), lines[i+1].strip()) for i in range(0, len(lines) - 1, 2)]

def entities(pairs):
    """Yield (type, dict-of-lists) for each entity in the ENTITIES section."""
    in_ent, cur, typ = False, None, None
    for code, val in pairs:
        if code == '2' and val == 'ENTITIES': in_ent = True; continue
        if in_ent and code == '0':
            if typ: yield typ, cur
            if val == 'ENDSEC': return
            typ, cur = val, {}
            continue
        if in_ent and typ is not None:
            cur.setdefault(code, []).append(val)
    if typ: yield typ, cur

def f(d, code, i=0, default=0.0):
    try: return float(d[code][i])
    except Exception: return default

def extract(path, id_pattern):
    txt = open(path, encoding='utf-8', errors='replace').read()
    pairs = parse_pairs(txt)
    segs, rects, labels = [], [], []
    for typ, d in entities(pairs):
        if typ == 'LINE':
            segs.append([(f(d,'10'), f(d,'20')), (f(d,'11'), f(d,'21'))])
        elif typ == 'LWPOLYLINE':
            xs, ys = d.get('10', []), d.get('20', [])
            pts = [(float(x), float(y)) for x, y in zip(xs, ys)]
            closed = d.get('70', ['0'])[0] in ('1', '129')
            if pts:
                for a, b in zip(pts, pts[1:]): segs.append([a, b])
                if closed and len(pts) >= 3: segs.append([pts[-1], pts[0]])
                # axis-aligned closed 4-vertex → element candidate
                if closed and len(pts) in (4, 5):
                    px = sorted(set(round(p[0], 1) for p in pts))
                    py = sorted(set(round(p[1], 1) for p in pts))
                    if len(px) == 2 and len(py) == 2:
                        rects.append((px[0], py[0], px[1]-px[0], py[1]-py[0]))
        elif typ in ('TEXT', 'MTEXT'):
            s = (d.get('1', ['']))[0]
            labels.append((s, f(d,'10'), f(d,'20'), f(d,'40', default=1.0)))
    if not segs:
        return None
    # bounds + Y-flip (DXF y-up → SVG y-down)
    xs = [p[0] for s in segs for p in s]; ys = [p[1] for s in segs for p in s]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    W, H = x1-x0, y1-y0
    sc = 400.0 / H if H else 1.0        # normalize height ≈ 400 units like SF01
    tx = lambda x: round((x - x0) * sc, 1)
    ty = lambda y: round((y1 - y) * sc, 1)
    # detect SF id from labels
    rx = re.compile(id_pattern)
    sfid = None
    for s, *_ in sorted(labels, key=lambda L: -L[3]):   # biggest text first
        m = rx.search(s.upper().replace(' ', ''))
        if m: sfid = m.group(0); break
    if not sfid:
        m = rx.search(os.path.basename(path).upper())
        sfid = m.group(0) if m else None
    # base svg: outline polylines + non-id text labels (door numbers etc.)
    parts = []
    for a, b in segs:
        parts.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="#8b949e" stroke-width="0.6" fill="none"/>'
                     % (tx(a[0]), ty(a[1]), tx(b[0]), ty(b[1])))
    for s, lx, ly, h in labels:
        s2 = re.sub(r'\\\\[A-Za-z][^;]*;|{|}', '', s).strip()  # strip MTEXT codes
        if not s2 or (sfid and s2.upper().replace(' ', '') == sfid): continue
        parts.append('<text x="%s" y="%s" fill="#ff8c42" font-size="%s" font-family="sans-serif">%s</text>'
                     % (tx(lx), ty(ly), max(4, round(h*sc, 1)), s2.replace('&','&amp;').replace('<','&lt;')))
    # elements from rect candidates (skip near-full-sheet rects = borders)
    els, n = [], 0
    for (rx0, ry0, rw, rh) in rects:
        if rw*sc > 0.9*W*sc and rh*sc > 0.9*400: continue
        if rw*sc < 6 or rh*sc < 6: continue
        n += 1
        els.append({'id': 'G%02d' % n, 'x': tx(rx0), 'y': ty(ry0+rh),
                    'w': round(rw*sc, 1), 'h': round(rh*sc, 1), 't0': 'glass'})
    return sfid, {'viewBox': '0 0 %s 400' % round(W*sc, 1),
                  'name': os.path.splitext(os.path.basename(path))[0],
                  'base': '<g>' + ''.join(parts) + '</g>', 'elements': els}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('folder'); ap.add_argument('--out', default='elevations.add.js')
    ap.add_argument('--id-pattern', default=r'SF\d+[A-Z]?(\.\d+)?')
    ap.add_argument('--merge', default=None)
    a = ap.parse_args()
    out, skipped = {}, []
    for fn in sorted(os.listdir(a.folder)):
        if not fn.lower().endswith('.dxf'): continue
        try:
            r = extract(os.path.join(a.folder, fn), a.id_pattern)
            if r and r[0]: out[r[0]] = r[1]; print('✅ %-24s → %s (%d elements)' % (fn, r[0], len(r[1]['elements'])))
            else: skipped.append(fn); print('⚠ %-24s → no SF id / no geometry' % fn)
        except Exception as e:
            skipped.append(fn); print('❌ %-24s → %s' % (fn, e))
    if not out: sys.exit('nothing extracted')
    js = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
    if a.merge:
        src = open(a.merge, encoding='utf-8').read()
        open(a.merge + '.bak', 'w', encoding='utf-8').write(src)
        m = re.search(r'window\.ELEVATIONS\s*=\s*(\{.*\})\s*;?\s*$', src, re.S)
        cur = json.loads(m.group(1)) if m else {}
        cur.update(out)
        open(a.merge, 'w', encoding='utf-8').write(
            '/* Elevation geometry — generated/merged by tools/dxf2elevations.py */\n'
            'window.ELEVATIONS=' + json.dumps(cur, ensure_ascii=False, separators=(',', ':')) + ';\n')
        print('merged %d keys into %s (backup: .bak)' % (len(out), a.merge))
    else:
        open(a.out, 'w', encoding='utf-8').write('window.ELEVATIONS_ADD=' + js + ';\n')
        print('wrote %s — review, then merge keys into elevations.js' % a.out)
    if skipped: print('skipped:', ', '.join(skipped))

if __name__ == '__main__':
    main()
