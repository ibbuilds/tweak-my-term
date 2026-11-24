'use strict';
// Parts: find what already exists for a look and fetch it into the run folder.
//   port(scheme, app)  the scheme maintainers' hand-tuned file for that app (catalog/ports.json),
//                      else the iTerm2-Color-Schemes export for that app
//   rice(repo)         a dotfiles repo's files grouped by tool, its wallpapers and license
//   get(repo, paths)   download files (raw.githubusercontent.com) under <to>/<owner>-<repo>/
// Uses the public GitHub API without a token (60 requests an hour); listings are cached.

const fs = require('fs');
const path = require('path');
const paths = require('../engine/paths');

const API = 'https://api.github.com/repos';
const RAW = 'https://raw.githubusercontent.com';
const UA = 'tweak-my-term (+https://github.com/ibbuilds/tweak-my-term)';
const DAY = 24 * 3600 * 1000;
const PORTS = path.join(__dirname, '..', 'catalog', 'ports.json');
const CATALOG = path.join(__dirname, '..', 'catalog');

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const base = (p) => p.split('/').pop();
const stem = (p) => base(p).replace(/\.[^.]+$/, '');

function parseRepo(s) {
  const m = /^(?:https?:\/\/github\.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:\/.*)?$/.exec(String(s || '').trim());
  if (!m) throw new Error(`Not a GitHub repo: ${s}. Use owner/repo or https://github.com/owner/repo.`);
  return { owner: m[1], repo: m[2] };
}
const slug = (r) => `${r.owner}/${r.repo}`;
const rawUrl = (r, p) => `${RAW}/${slug(r)}/HEAD/${p.split('/').map(encodeURIComponent).join('/')}`;

// ---- GitHub trees, cached ----------------------------------------------------------------------

function cachePath(cacheDir, key) { return path.join(cacheDir, `${key.replace(/[^A-Za-z0-9_.@-]/g, '_')}.json`); }

async function tree(r, ref, { recursive = false, fetchImpl = globalThis.fetch, cacheDir, now = Date.now() } = {}) {
  const dir = cacheDir || path.join(paths.stateRoot(), 'cache', 'github');
  const key = `${r.owner}_${r.repo}@${ref}${recursive ? '-r' : ''}`;
  const file = cachePath(dir, key);
  try {
    const c = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (ref !== 'HEAD' || now - c.at < DAY) return c.tree;
  } catch { /* no cache */ }
  const url = `${API}/${slug(r)}/git/trees/${ref}${recursive ? '?recursive=1' : ''}`;
  const res = await fetchImpl(url, { headers: { 'user-agent': UA, accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(60000) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${slug(r)}${res.status === 403 || res.status === 429 ? ' (rate limit: 60 an hour without a token; or `git clone --depth 1` the repo into the run folder)' : ''}`);
  const body = await res.json();
  const t = (body.tree || []).map((e) => ({ path: e.path, type: e.type, sha: e.sha }));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ at: now, truncated: Boolean(body.truncated), tree: t }));
  return t;
}

/** Files directly in `dir` (a/b/c), walking one level at a time; null when it doesn't exist. */
async function listDir(r, dir, opts) {
  let ref = 'HEAD';
  let t = await tree(r, ref, opts);
  for (const seg of dir.split('/').filter(Boolean)) {
    const e = t && t.find((x) => x.type === 'tree' && x.path === seg);
    if (!e) return null;
    ref = e.sha;
    t = await tree(r, ref, opts);
  }
  return t && t.filter((e) => e.type === 'blob').map((e) => `${dir}/${e.path}`);
}

// ---- ports ---------------------------------------------------------------------------------------

const spellings = (app) => [...new Set([app, app.replace(/-/g, '_'), app.replace(/-/g, '')])];
const NOT_THEME = /(^|\/)(templates?|\.github|assets|screenshots?|docs?)\/|\.(tera|md|png|jpe?g|gif|webp|svg)$|(^|\/)(justfile|renovate\.json|package(-lock)?\.json|LICENSE[^/]*|\.[^/]*)$/i;

function rank(files, words, strip) {
  const want = words.map(norm).filter(Boolean);
  return files
    .map((p) => ({ p, n: norm(stem(p)).replace(strip, '') || norm(stem(p)) }))
    .filter((x) => want.every((w) => x.n.includes(w)))
    .sort((a, b) => (b.n === want.join('')) - (a.n === want.join('')) || a.n.length - b.n.length || a.p.localeCompare(b.p))
    .map((x) => x.p);
}

async function port(scheme, app, opts = {}) {
  const idx = JSON.parse(fs.readFileSync(PORTS, 'utf8'));
  const key = Object.keys(idx.schemes).find((k) => norm(k) === norm(scheme));
  const src = key ? idx.schemes[key] : idx.any;
  const flavor = opts.flavor ? String(opts.flavor).split(/\s+/) : [];
  for (const a of spellings(String(app).toLowerCase())) {
    const r = parseRepo(src.repo.replace('{app}', a));
    let files;
    if (src.dir) files = await listDir(r, src.dir.replace('{app}', a), opts);
    else { const t = await tree(r, 'HEAD', { ...opts, recursive: true }); files = t && t.filter((e) => e.type === 'blob').map((e) => e.path); }
    if (!files) continue;
    files = files.filter((p) => !NOT_THEME.test(p));
    const hits = key ? rank(files, flavor, new RegExp(norm(key), 'g')) : rank(files, [...String(scheme).split(/\s+/), ...flavor], /$^/);
    if (!hits.length) continue;
    return { scheme: key || scheme, app, source: `https://github.com/${slug(r)}`, files: hits.slice(0, 12).map((p) => ({ path: p, url: rawUrl(r, p) })), ...(src.index ? { index: src.index } : {}), ...(key ? {} : { license: idx.any.license }) };
  }
  return { scheme: key || scheme, app, source: null, files: [], hint: `No published port found. Use the catalog recipe (tmt catalog show ${app}) with the palette from catalog/palettes/sources.json${src.index ? `, or check ${src.index}` : ''}.` };
}

// ---- rices ---------------------------------------------------------------------------------------

function catalogTools() {
  const ids = [];
  for (const cat of fs.readdirSync(CATALOG, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    for (const t of fs.readdirSync(path.join(CATALOG, cat.name), { withFileTypes: true })) {
      if (t.isDirectory() && fs.existsSync(path.join(CATALOG, cat.name, t.name, 'tool.json'))) ids.push(t.name);
    }
  }
  return ids;
}
const ALIASES = { neovim: ['nvim'], 'windows-terminal': ['windowsterminal', 'windows_terminal'], fastfetch: ['fastfetch'], powershell: ['powershell', 'windowspowershell'] };
const IMAGE = /\.(png|jpe?g|webp|gif)$/i;

function toolOf(p, tools) {
  const segs = p.toLowerCase().split('/');
  const fileStem = segs[segs.length - 1].replace(/^\./, '').replace(/\.[^.]+$/, '').replace(/rc$/, '');
  for (const t of tools) {
    const names = [t, ...(ALIASES[t] || [])];
    if (segs.slice(0, -1).some((s) => names.includes(s.replace(/^\./, ''))) || names.includes(fileStem)) return t;
  }
  return null;
}

/** The repo's file list from a shallow, blobless git clone; null when git is missing or the clone fails. */
function gitTree(url) {
  const sys = require('../engine/sys');
  if (!sys.resolveCmd('git')) return null;
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'tmt-rice-'));
  try {
    const env = { ...process.env, GIT_TERMINAL_PROMPT: '0' };
    const c = sys.exec('git', ['clone', '--quiet', '--depth', '1', '--filter=blob:none', '--no-checkout', url, dir], { env, timeout: 120000 });
    if (c.status !== 0) return null;
    const l = sys.exec('git', ['-C', dir, 'ls-tree', '-r', '-t', '--full-tree', 'HEAD'], { env });
    if (l.status !== 0) return null;
    return l.stdout.split('\n').filter(Boolean).map((line) => {
      const [meta, p] = line.split('\t');
      const [, type, sha] = meta.split(' ');
      return { path: p, type, sha };
    });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

async function rice(repo, opts = {}) {
  const r = parseRepo(repo);
  let t;
  try { t = await tree(r, 'HEAD', { ...opts, recursive: true }); } catch (e) {
    // Rate-limited (60 an hour without a token): list the repo with git instead, no file contents.
    if (!/GitHub API (403|429)/.test(e.message)) throw e;
    t = (opts.gitImpl || gitTree)(`https://github.com/${slug(r)}.git`);
  }
  if (!t) throw new Error(`Repo not found or private: https://github.com/${slug(r)}`);
  const files = t.filter((e) => e.type === 'blob').map((e) => e.path);
  const tools = opts.tools || catalogTools();
  const byTool = {};
  for (const p of files) {
    if (IMAGE.test(p) || /(history|hist|compdump|\.lock)$/i.test(p)) continue;
    const tool = toolOf(p, tools);
    if (tool) (byTool[tool] = byTool[tool] || []).push(p);
  }
  const license = files.find((p) => !p.includes('/') && /^(licen[cs]e|copying)(\.|$)/i.test(p)) || null;
  return {
    repo: `https://github.com/${slug(r)}`,
    license,
    note: license ? `Read ${license} before reusing whole files; credit the repo.` : 'No license file: take values (colors, sizes, layout), not whole files; credit the repo.',
    tools: byTool,
    wallpapers: files.filter((p) => IMAGE.test(p) && /wall|background|backdrop|(^|[/_-])bg([/_.-]|$)/i.test(p) && !/screenshot|preview/i.test(p)),
    files: files.length,
  };
}

// ---- download ------------------------------------------------------------------------------------

async function get(repo, list, to, opts = {}) {
  const r = parseRepo(repo);
  const root = path.resolve(to, `${r.owner}-${r.repo}`);
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  const jobs = list.map((p) => {
    const file = path.resolve(root, ...String(p).split('/'));
    if (!file.startsWith(root + path.sep)) throw new Error(`Path is outside the repo folder: ${p}`);
    return { p, file };
  });
  const out = [];
  for (const { p, file } of jobs) {
    const url = rawUrl(r, p);
    const res = await fetchImpl(url, { headers: { 'user-agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(60000) });
    if (!res.ok) throw new Error(`Could not download ${url} (HTTP ${res.status})`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 25 * 1024 * 1024) throw new Error(`${p} is larger than 25 MB; not saving it.`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, buf);
    out.push({ path: p, file, source: url, bytes: buf.length });
  }
  return out;
}

// ---- CLI -----------------------------------------------------------------------------------------

const USAGE = `tmt parts port <scheme> <app> [--flavor f] [--get] [--to dir] [--json]
    The scheme maintainers' file for that app (Catppuccin, Dracula, Rose Pine, Tokyo Night,
    Kanagawa ports), else the iTerm2-Color-Schemes export (1,000+ schemes, e.g. "Gruvbox Dark Hard").
tmt parts rice <github-repo> [--tool t] [--get path...] [--to dir] [--json]
    A dotfiles repo's config files grouped by tool, its wallpapers and its license.
--get downloads into --to (default: the current run's parts/ folder), never into live configs.`;

function defaultTo() {
  try {
    const run = require('../engine/run');
    const s = run.status();
    if (s && s.dir) return path.join(s.dir, 'parts');
  } catch { /* no run */ }
  return path.resolve('parts');
}

async function main(argv = []) {
  const [cmd, ...rest] = argv;
  const flags = {};
  const pos = [];
  const gets = [];
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--json') flags.json = true;
    else if (a === '--get') { flags.get = true; while (rest[i + 1] && !rest[i + 1].startsWith('--')) gets.push(rest[++i]); }
    else if (a.startsWith('--')) flags[a.slice(2)] = rest[++i];
    else pos.push(a);
  }
  const say = (data, text) => process.stdout.write(`${flags.json ? JSON.stringify(data, null, 2) : text(data)}\n`);
  if (cmd === 'port' && pos.length >= 2) {
    const r = await port(pos.slice(0, -1).join(' '), pos[pos.length - 1], { flavor: flags.flavor });
    if (flags.get && r.files.length) r.saved = await get(r.source, r.files.slice(0, 4).map((f) => f.path), flags.to || defaultTo());
    say(r, (x) => (x.files.length
      ? `${x.scheme} for ${x.app}: ${x.source}\n${x.files.map((f, n) => `${n + 1}. ${f.path}\n   ${f.url}`).join('\n')}${x.saved ? `\nSaved: ${x.saved.map((s) => s.file).join(', ')}` : '\nNext: --get saves these (up to 4) into the run folder.'}`
      : x.hint));
    return 0;
  }
  if (cmd === 'rice' && pos.length >= 1) {
    const r = await rice(pos[0], {});
    if (flags.tool) r.tools = { [flags.tool]: r.tools[flags.tool] || [] };
    if (flags.get) r.saved = await get(pos[0], gets.length ? gets : Object.values(r.tools).flat(), flags.to || defaultTo());
    say(r, (x) => [`${x.repo}  (${x.files} files, license: ${x.license || 'none'})`, x.note,
      ...Object.entries(x.tools).map(([t, f]) => `${t}: ${f.join(', ') || '(none)'}`),
      x.wallpapers.length ? `wallpapers: ${x.wallpapers.slice(0, 8).join(', ')}` : 'wallpapers: none found',
      x.saved ? `Saved ${x.saved.length} files under ${path.dirname(path.dirname(x.saved[0].file))}` : 'Next: --get <path...> saves files into the run folder.'].join('\n'));
    return 0;
  }
  process.stdout.write(`${USAGE}\n`);
  return cmd === undefined || cmd === 'help' ? 0 : 2;
}

module.exports = { parseRepo, port, rice, get, main };
