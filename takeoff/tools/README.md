# takeoff/tools

**`dxf-cli.js`** — parse a DXF through the real takeoff parser (`app.js`/`systems.js`) from
the command line, no browser: `node dxf-cli.js <file.dxf> [--system 45TU|750XT|auto] [--mark EL-01] [--json] [--baseline f.json] [--save-baseline f.json]`.
Use this for all parser debugging/verification instead of a one-off Node harness — save a
`--save-baseline` after a known-good parse, then `--baseline` on future runs to catch
regressions (exits 1 on any diff). Single-source (`AC3 tracker\takeoff\` only), not
browser-loaded (no `?v=`), not CORE (no CP2 sync).
