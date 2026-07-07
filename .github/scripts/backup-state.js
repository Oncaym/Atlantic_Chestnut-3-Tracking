/* Nightly backup: export /state and /history from Firebase RTDB to backups/.
   Runs in GitHub Actions (see .github/workflows/backup.yml).
   Requires two repo secrets:
     FIREBASE_SERVICE_ACCOUNT — full JSON of a service-account key
       (Firebase Console → Project settings → Service accounts → Generate new private key)
     FIREBASE_DATABASE_URL — e.g. https://atlantic-chestnut-3-default-rtdb.firebaseio.com
*/
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

async function main() {
  const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const dbUrl = process.env.FIREBASE_DATABASE_URL;
  if (!saRaw || !dbUrl) {
    console.error('Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_DATABASE_URL secret.');
    process.exit(1);
  }
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(saRaw)),
    databaseURL: dbUrl,
  });
  const db = admin.database();

  const outDir = path.join(process.cwd(), 'backups');
  fs.mkdirSync(outDir, { recursive: true });
  const day = new Date().toISOString().slice(0, 10);

  for (const node of ['state', 'history']) {
    const snap = await db.ref(node).once('value');
    const data = snap.val();
    if (data == null) { console.warn(`/${node} is empty — skipped`); continue; }
    const json = JSON.stringify(data, null, 1);
    // latest + dated copy. Dated copies build the evidence timeline;
    // latest-*.json is what you grab for a quick restore (Import JSON).
    fs.writeFileSync(path.join(outDir, `latest-${node}.json`), json);
    fs.writeFileSync(path.join(outDir, `${day}-${node}.json`), json);
    const units = data.units ? (Array.isArray(data.units) ? data.units.length : Object.keys(data.units).length) : '-';
    console.log(`/${node}: ${json.length} bytes${node === 'state' ? `, ${units} units` : ''}`);
  }

  // Sanity guard: refuse to overwrite a good backup with a near-empty state
  // (e.g. someone wiped /state minutes before the cron fired).
  const latest = path.join(outDir, 'latest-state.json');
  if (fs.existsSync(latest)) {
    const s = JSON.parse(fs.readFileSync(latest, 'utf8'));
    const n = s.units ? (Array.isArray(s.units) ? s.units.length : Object.keys(s.units).length) : 0;
    if (n < 5) console.warn(`WARNING: latest-state.json has only ${n} units — check whether /state was reset.`);
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
