/* ============================================================
   Tracker Hub — Contribute-back endpoint (core, project-agnostic)
   ============================================================
   POST /api/contribute
   Opens a Pull Request against the PUBLIC Hub repo with the
   PM's ahead/diverged core files + the feature IDs being proposed.

   WHY a serverless endpoint:
     Reading the public Hub needs no auth (raw.githubusercontent.com).
     WRITING (opening a PR) needs a token — and a token must NEVER
     ship in the frontend. So the browser POSTs the proposed changes
     here, and this function opens the PR using a bot token held in an
     env var.

   ENV VAR (set in Vercel project settings):
     GITHUB_HUB_TOKEN — a fine-grained Personal Access Token (or a
     GitHub App installation token) with **Contents: write** and
     **Pull requests: write** permissions, scoped to ONLY the Hub repo.
     Do NOT give it access to any other repository. This function
     never logs or returns the token.

   Body: {
     hub:        { owner, repo, branch },
     files:      [ { path, content } ],   // full text of each proposed core file
     featureIds: [ "F-012", ... ],        // local-only feature IDs (optional)
     project:    "AC4",                   // contributing project name (optional)
     author:     "someone@x.com"          // for attribution in the PR body (optional)
   }
   Returns 200: { url: "<pr html_url>", branch: "contrib/..." }
   Errors: 400 bad input, 500 { error } (missing token / unexpected), 502 GitHub API error.
   ============================================================ */

const GH_API = 'https://api.github.com';
const UA = 'tracker-sync-console';

function slug(s) {
  return String(s || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'project';
}

// Thin GitHub REST helper. Throws on non-2xx with the API message (token never included).
async function gh(token, method, path, body) {
  const res = await fetch(`${GH_API}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': UA,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) {
    const msg = (data && data.message) ? data.message : `GitHub API ${res.status}`;
    const err = new Error(`GitHub ${method} ${path} → ${res.status}: ${msg}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const token = process.env.GITHUB_HUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_HUB_TOKEN not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: 'Invalid JSON' }); }
  }
  const { hub, files, featureIds, project, author } = body || {};

  // ---- validate input ----
  if (!hub || !hub.owner || !hub.repo) {
    return res.status(400).json({ error: 'hub.owner and hub.repo are required' });
  }
  const branch = (hub.branch && String(hub.branch).trim()) || 'main';
  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'files must be a non-empty array' });
  }
  for (const f of files) {
    if (!f || typeof f.path !== 'string' || !f.path.trim() || typeof f.content !== 'string') {
      return res.status(400).json({ error: 'each file needs { path:string, content:string }' });
    }
  }
  const feats = Array.isArray(featureIds) ? featureIds.filter(Boolean) : [];
  const projName = (project && String(project).trim()) || 'project';
  const featLabel = feats.length ? feats.join(', ') : 'core update';

  const owner = String(hub.owner).trim();
  const repo = String(hub.repo).trim();
  const o = encodeURIComponent(owner);
  const r = encodeURIComponent(repo);

  try {
    // 1. base branch ref → base commit sha
    const ref = await gh(token, 'GET', `/repos/${o}/${r}/git/ref/heads/${encodeURIComponent(branch)}`);
    const baseSha = ref && ref.object && ref.object.sha;
    if (!baseSha) return res.status(502).json({ error: `could not resolve base branch "${branch}"` });

    // 2. base commit → its tree sha
    const baseCommit = await gh(token, 'GET', `/repos/${o}/${r}/git/commits/${baseSha}`);
    const baseTreeSha = baseCommit && baseCommit.tree && baseCommit.tree.sha;
    if (!baseTreeSha) return res.status(502).json({ error: 'could not resolve base tree' });

    // 3. blob per file
    const treeItems = [];
    for (const f of files) {
      const blob = await gh(token, 'POST', `/repos/${o}/${r}/git/blobs`, {
        content: f.content,
        encoding: 'utf-8',
      });
      treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }

    // 4. new tree on top of base tree
    const tree = await gh(token, 'POST', `/repos/${o}/${r}/git/trees`, {
      base_tree: baseTreeSha,
      tree: treeItems,
    });

    // 5. commit
    const commit = await gh(token, 'POST', `/repos/${o}/${r}/git/commits`, {
      message: `contrib(${projName}): ${featLabel}`,
      tree: tree.sha,
      parents: [baseSha],
    });

    // 6. new branch ref
    const newBranch = `contrib/${slug(projName)}-${Date.now()}`;
    await gh(token, 'POST', `/repos/${o}/${r}/git/refs`, {
      ref: `refs/heads/${newBranch}`,
      sha: commit.sha,
    });

    // 7. pull request
    const fileList = files.map(f => `- \`${f.path}\``).join('\n');
    const prBody =
      `Automated contribution from the Tracker Sync Console.\n\n` +
      `**Project:** ${projName}\n` +
      `**Author:** ${author || '(unspecified)'}\n` +
      `**Feature IDs:** ${feats.length ? feats.join(', ') : '(none listed)'}\n\n` +
      `**Proposed core files (${files.length}):**\n${fileList}\n\n` +
      `Review the diff before merging. After merge, everyone pulls via sync.html cloud mode.`;
    const pr = await gh(token, 'POST', `/repos/${o}/${r}/pulls`, {
      title: `[contrib] ${projName}: ${featLabel}`,
      head: newBranch,
      base: branch,
      body: prBody,
    });

    return res.status(200).json({ url: pr.html_url, branch: newBranch });
  } catch (e) {
    // Never surface the token; only the API/error message.
    const status = (e && e.status && e.status >= 400 && e.status < 600) ? 502 : 500;
    return res.status(status).json({ error: String((e && e.message) || e) });
  }
}
