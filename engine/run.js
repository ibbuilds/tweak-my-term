'use strict';
// The run: one change to a user's terminal, from staged files to a verified, measured
// result, with a byte-for-byte undo. Every step checks the one before it.
//
//   open -> planned -> approved -> applied -> verified -> done
//                                       \-> failed            any applied run -> restored

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const paths = require('./paths');
const jsonc = require('./jsonc');
const blocks = require('./blocks');
const { diff } = require('./diff');
const installers = require('./installers');
const fonts = require('./fonts');
const sys = require('./sys');
const schema = require('./schema');
const text = require('./text');

const KINDS = ['write', 'block', 'merge-json'];
const OPEN = ['open', 'planned', 'approved'];

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const now = () => new Date().toISOString();

class GateError extends Error {}

// ---------- storage ----------
const runsDir = () => path.join(paths.stateRoot(), 'runs');
const runDir = (id) => path.join(runsDir(), id);
const pointer = () => path.join(paths.stateRoot(), 'current');

function save(st) {
  st.updated = now();
  fs.mkdirSync(runDir(st.id), { recursive: true });
  fs.writeFileSync(path.join(runDir(st.id), 'state.json'), JSON.stringify(st, null, 2) + '\n');
  return st;
}

function load(id) {
  const f = path.join(runDir(id), 'state.json');
  if (!fs.existsSync(f)) throw new GateError(`run ${id} not found`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function current() {
  try { return load(fs.readFileSync(pointer(), 'utf8').trim()); } catch { return null; }
}

function list() {
  if (!fs.existsSync(runsDir())) return [];
  return fs.readdirSync(runsDir()).sort().map((id) => { try { const s = load(id); return { id, status: s.status, created: s.created }; } catch { return null; } }).filter(Boolean);
}

const unfinished = (st) => st && (st.status === 'applied' || st.status === 'verified' || (st.status === 'failed' && st.applied));

function requireOpen() {
  const st = current();
  if (!st || !OPEN.includes(st.status)) throw new GateError('no open run: start one with `tmt new`');
  return st;
}

function invalidate(st) {
  if (st.status !== 'open') { st.status = 'open'; st.plan = null; st.approved = null; }
}

// ---------- new ----------
function newRun({ force = false, note = '' } = {}) {
  const cur = current();
  if (unfinished(cur) && !force) {
    throw new GateError(`run ${cur.id} is applied but unfinished (${cur.status}): finish it (tmt verify, tmt measure) or undo it (tmt restore), or pass --force`);
  }
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
  const id = `${stamp}-${crypto.randomBytes(2).toString('hex')}`;
  const st = save({ id, created: now(), os: paths.platform(), status: 'open', note, files: [], installs: [], fonts: [], checks: [], shells: [], look: null, plan: null, approved: null, applied: null });
  fs.mkdirSync(paths.stateRoot(), { recursive: true });
  fs.writeFileSync(pointer(), id);
  return st;
}

// ---------- stage ----------
function stageFile(kind, target, source, { os: osName } = {}) {
  const st = requireOpen();
  if (!KINDS.includes(kind)) throw new GateError(`unknown kind "${kind}" (use ${KINDS.join(', ')})`);
  const abs = paths.target(target, { os: osName || st.os });
  if (!fs.existsSync(source)) throw new GateError(`source file ${source} not found`);
  const buf = fs.readFileSync(source);
  if (kind === 'block') blocks.markerFor(abs);
  if (kind === 'merge-json') {
    try { jsonc.parse(buf.toString('utf8')); } catch (e) { throw new GateError(`${source} is not valid JSON(C): ${e.message}`); }
  }
  const dir = path.join(runDir(st.id), 'staged');
  fs.mkdirSync(dir, { recursive: true });
  const existing = st.files.findIndex((f) => f.target === target);
  const n = existing >= 0 ? existing : st.files.length;
  const name = `${String(n).padStart(3, '0')}-${path.basename(source)}`;
  fs.writeFileSync(path.join(dir, name), buf);
  const entry = { kind, target, source: `staged/${name}` };
  if (existing >= 0) st.files[existing] = entry; else st.files.push(entry);
  invalidate(st);
  return save(st);
}

function stageInstall(manager, id) {
  const st = requireOpen();
  installers.command(manager, id); // validates the manager
  if (!st.installs.some((i) => i.manager === manager && i.id === id)) st.installs.push({ manager, id });
  invalidate(st);
  return save(st);
}

function stageFont(name) {
  const st = requireOpen();
  if (!/^[A-Za-z0-9-]+$/.test(name)) throw new GateError(`"${name}" is not a Nerd Fonts release name (e.g. JetBrainsMono)`);
  if (!st.fonts.includes(name)) st.fonts.push(name);
  invalidate(st);
  return save(st);
}

function stageCheck(argv) {
  const st = requireOpen();
  if (!Array.isArray(argv) || !argv.length) throw new GateError('a check needs a command');
  if (argv.some((a) => String(a).includes('{file}'))) throw new GateError('the check has an unfilled {file}: name the file, or leave it out (verify already runs the catalog validator for each config it knows)');
  // verify runs from wherever the agent is then; pin relative file arguments to where they are now.
  st.checks.push(argv.map((a, n) => (n > 0 && !path.isAbsolute(a) && !a.startsWith('-') && !a.startsWith('~')
    && /[\\/.]/.test(a) && fs.existsSync(a) ? path.resolve(a) : a)));
  invalidate(st);
  return save(st);
}

function stageShell(id) {
  const st = requireOpen();
  if (!st.shells.includes(id)) st.shells.push(id);
  return save(st);
}

function setLook(file) {
  const st = requireOpen();
  const look = jsonc.parse(fs.readFileSync(file, 'utf8'));
  const errs = schema.check('look', look);
  if (errs.length) throw new GateError(`look spec is invalid:\n  ${errs.join('\n  ')}`);
  fs.writeFileSync(path.join(runDir(st.id), 'look.json'), JSON.stringify(look, null, 2) + '\n');
  st.look = 'look.json';
  if (!st.shells.length && look.shells) st.shells = look.shells.map((s) => s.id);
  return save(st);
}

function readLook(st) {
  if (!st.look) return null;
  try { return JSON.parse(fs.readFileSync(path.join(runDir(st.id), st.look), 'utf8')); } catch { return null; }
}

// ---------- plan ----------
function propose(kind, abs, before, staged) {
  if (kind === 'write') return staged;
  const cur = text.decode(before);
  const add = text.decode(staged).text;
  if (kind === 'block') {
    if (cur.text && !cur.text.includes('>>> tweak-my-term >>>') && blocks.alreadyPresent(cur.text, add, abs)) return before;
    return text.encode(blocks.applyBlock(cur.text, add, abs), before ? cur.enc : 'utf8');
  }
  const base = cur.text && cur.text.trim() ? jsonc.parse(cur.text) : {};
  const merged = jsonc.merge(base, jsonc.parse(add));
  // nothing to change: keep the user's bytes (and their formatting and comments)
  if (before && JSON.stringify(merged) === JSON.stringify(base)) return before;
  const eol = cur.text && cur.text.includes('\r\n') ? '\r\n' : '\n';
  const out = jsonc.stringify(merged, jsonc.styleOf(cur.text), jsonc.indentOf(cur.text)).replace(/\n/g, eol) + eol;
  return text.encode(out, before ? cur.enc : 'utf8');
}

const isBinary = (b) => text.isBinary(b);

function plan({ os: osName } = {}) {
  const st = requireOpen();
  if (!st.files.length && !st.installs.length && !st.fonts.length) throw new GateError('nothing staged: use `tmt stage ...` first');
  const dir = runDir(st.id);
  const pdir = path.join(dir, 'proposed');
  fs.rmSync(pdir, { recursive: true, force: true });
  fs.mkdirSync(pdir, { recursive: true });
  const files = st.files.map((f, n) => {
    const abs = paths.target(f.target, { os: osName || st.os });
    const before = fs.existsSync(abs) ? fs.readFileSync(abs) : null;
    const staged = fs.readFileSync(path.join(dir, f.source));
    const after = propose(f.kind, abs, before, staged);
    const proposed = `proposed/${String(n).padStart(3, '0')}`;
    fs.writeFileSync(path.join(dir, proposed), after);
    const change = !before ? 'create' : before.equals(after) ? 'unchanged' : 'modify';
    const d = isBinary(before) || isBinary(after) ? (change === 'unchanged' ? '' : '(binary file)\n') : diff(text.decode(before).text, text.decode(after).text);
    return { kind: f.kind, target: f.target, abs, display: paths.pretty(abs), beforeHash: before ? sha(before) : null, afterHash: sha(after), proposed, change, diff: d };
  });
  const fontsNeeded = st.fonts.map((name) => ({ name, present: fonts.installed(name, st.os).length > 0 }));
  const installs = st.installs.map((i) => ({ ...i, command: installers.display(i.manager, i.id), sudo: installers.needsSudo(i.manager) }));
  const hash = sha(JSON.stringify({ files: files.map((f) => [f.kind, f.abs, f.beforeHash, f.afterHash]), installs: st.installs, fonts: st.fonts, checks: st.checks }));
  st.plan = { hash, at: now(), files: files.map(({ diff: _d, ...rest }) => rest), installs, fonts: fontsNeeded, checks: st.checks };
  st.status = 'planned';
  st.approved = null;
  fs.writeFileSync(path.join(dir, 'plan.diff'), files.map((f) => `=== ${f.change.toUpperCase()} ${f.display} (${f.kind})\n${f.diff}`).join('\n'));
  save(st);
  return { id: st.id, hash, files, installs, fonts: fontsNeeded, checks: st.checks, steps: designSteps(dir) };
}

/** Which setup-skill design steps left their file in the run folder (skipped steps show). */
function designSteps(dir) {
  const has = (f) => fs.existsSync(path.join(dir, f));
  let brief = '';
  try { brief = fs.readFileSync(path.join(dir, 'brief.md'), 'utf8'); } catch { /* no brief */ }
  return { brief: Boolean(brief), parts: /^\**Parts\**:/im.test(brief), look: has('look.json'), preview: has('preview.png') };
}

function approve(hash) {
  const st = requireOpen();
  if (!st.plan) throw new GateError('no plan to approve: run `tmt plan`');
  if (!hash || hash.length < 8 || !st.plan.hash.startsWith(hash.toLowerCase())) {
    throw new GateError(`hash ${hash || '(none)'} does not match the current plan (${st.plan.hash.slice(0, 12)}); show the plan to the user and approve its hash`);
  }
  st.status = 'approved';
  st.approved = st.plan.hash;
  return save(st);
}

// ---------- apply ----------
const WINGET_ALREADY = new Set([-1978335189, 2316632107, -1978335135, 2316632161]);

function runInstalls(st, { allowInstalls, exec }) {
  if (!st.installs.length) return [];
  if (!allowInstalls) throw new GateError('installs are not allowed: rerun with --allow-installs (or set allow_installs in the plugin options) after the user agrees');
  const manual = [];
  const done = [];
  for (const i of st.installs) {
    // A simulated home (TMT_HOME: tests, agent rehearsals) must never install on the real machine.
    if (paths.fake() && exec === sys.exec) { done.push({ ...i, simulated: true }); continue; }
    const [cmd, args] = installers.command(i.manager, i.id);
    if (installers.needsSudo(i.manager)) {
      if (exec('sudo', ['-n', 'true']).status !== 0) { manual.push(installers.display(i.manager, i.id)); continue; }
      const r = exec('sudo', ['-n', cmd, ...args], { timeout: 900000 });
      if (r.status !== 0) return failInstall(st, i, r);
    } else {
      const r = exec(cmd, args, { timeout: 900000 });
      const already = i.manager === 'winget' && (WINGET_ALREADY.has(r.status) || /already installed/i.test(r.stdout));
      if (r.status !== 0 && !already) return failInstall(st, i, r);
    }
    done.push(i);
  }
  if (manual.length) {
    throw new GateError(`these installs need sudo; ask the user to run them, then run \`tmt apply\` again:\n  ${manual.join('\n  ')}`);
  }
  return done;
}

function failInstall(st, i, r) {
  st.status = 'failed';
  st.error = `install failed: ${i.manager} ${i.id}: ${(r.stderr || r.stdout).trim().slice(0, 500)}`;
  save(st);
  throw new GateError(st.error);
}

function apply({ allowInstalls = false, exec = sys.exec, fontInstaller = fonts.install } = {}) {
  const st = current();
  if (!st || st.status !== 'approved' || !st.plan || st.approved !== st.plan.hash) {
    throw new GateError('plan not approved: run `tmt plan`, show it to the user, then `tmt approve <hash>`');
  }
  const dir = runDir(st.id);
  for (const f of st.plan.files) {
    const nowHash = fs.existsSync(f.abs) ? sha(fs.readFileSync(f.abs)) : null;
    if (nowHash !== f.beforeHash) throw new GateError(`${f.display} changed since the plan was made; run \`tmt plan\` again and get a new approval`);
  }
  runInstalls(st, { allowInstalls, exec });

  const manifest = { files: [], fonts: [], dirs: [] };
  const bdir = path.join(dir, 'backup');
  fs.mkdirSync(bdir, { recursive: true });
  st.plan.files.forEach((f, n) => {
    const entry = { target: f.abs, display: f.display, existed: fs.existsSync(f.abs), backup: null, afterHash: f.afterHash };
    if (entry.existed) { entry.backup = `backup/${String(n).padStart(3, '0')}`; fs.copyFileSync(f.abs, path.join(dir, entry.backup)); }
    manifest.files.push(entry);
  });
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  try {
    for (const name of st.fonts) {
      if (fonts.installed(name, st.os).length) continue;
      manifest.fonts.push({ name, ...fontInstaller(name, { exec, osName: st.os }) });
    }
    for (const f of st.plan.files) {
      if (f.change === 'unchanged') continue;
      // Remember the folders this write creates, so restore can take them away again.
      for (let d = path.dirname(f.abs); !fs.existsSync(d); d = path.dirname(d)) {
        if (!manifest.dirs.includes(d)) manifest.dirs.push(d);
        if (path.dirname(d) === d) break;
      }
      fs.mkdirSync(path.dirname(f.abs), { recursive: true });
      fs.writeFileSync(f.abs, fs.readFileSync(path.join(dir, f.proposed)));
    }
  } catch (e) {
    st.status = 'failed';
    st.applied = { at: now(), partial: true };
    st.error = `apply failed: ${e.message}; undo with \`tmt restore\``;
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    save(st);
    throw new GateError(st.error);
  }
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  st.status = 'applied';
  st.applied = { at: now() };
  save(st);
  return { id: st.id, written: st.plan.files.filter((f) => f.change !== 'unchanged').map((f) => f.display), fonts: manifest.fonts.map((f) => f.name) };
}

// ---------- verify ----------
function autoCheck(abs) {
  const base = path.basename(abs).toLowerCase();
  const ext = path.extname(base);
  const fwd = abs.replace(/\\/g, '/');
  if (ext === '.json' || ext === '.jsonc') return { name: `JSON parses: ${paths.pretty(abs)}`, internal: 'json', file: abs };
  if (['.bashrc', '.bash_profile', '.profile', '.bash_logout'].includes(base) || ext === '.bash' || ext === '.sh') return { name: `bash -n ${paths.pretty(abs)}`, argv: ['bash', '-n', fwd] };
  if (['.zshrc', '.zprofile', '.zshenv'].includes(base) || ext === '.zsh') return { name: `zsh -n ${paths.pretty(abs)}`, argv: ['zsh', '-n', fwd] };
  if (ext === '.fish') return { name: `fish -n ${paths.pretty(abs)}`, argv: ['fish', '--no-execute', fwd] };
  if (ext === '.ps1') {
    const ps = sys.WIN ? 'powershell' : 'pwsh';
    return { name: `PowerShell parses: ${paths.pretty(abs)}`, argv: [ps, '-NoProfile', '-Command', `$e=$null;[void][System.Management.Automation.Language.Parser]::ParseFile('${abs.replace(/'/g, "''")}',[ref]$null,[ref]$e);if($e){$e|%{$_.ToString()};exit 1}`] };
  }
  return null;
}

function expandArg(a) {
  if (/^~([\\/]|$)/.test(a) || /\{[a-z-]+\}/.test(a)) { try { return paths.expand(a); } catch { return a; } }
  return a;
}

// Commands that Windows Terminal startupActions run in a tab or pane: the first word after
// new-tab/split-pane and their flags. A pane whose program is missing opens as an error.
const WT_VALUE_FLAGS = new Set(['-p', '--profile', '-d', '--startingDirectory', '--title', '--tabColor', '--colorScheme', '-s', '--size']);
function wtWords(cmd) {
  return (cmd.match(/"[^"]*"|\S+/g) || []).map((w) => w.replace(/^"|"$/g, ''));
}
function startupCommands(sa) {
  const out = [];
  for (const part of sa.split(/(?<!\\);/)) {
    const w = wtWords(part.trim());
    if (!['new-tab', 'nt', 'split-pane', 'sp'].includes(w[0])) continue;
    for (let i = 1; i < w.length; i++) {
      if (WT_VALUE_FLAGS.has(w[i])) { i++; continue; }
      if (w[i].startsWith('-')) continue;
      out.push(w[i]);
      break;
    }
  }
  return out;
}

function verify({ exec = sys.exec } = {}) {
  const st = current();
  if (!st || !st.applied || st.status === 'restored') throw new GateError('nothing applied to verify: run `tmt apply` first');
  const checks = [];
  for (const f of st.plan.files) {
    const c = autoCheck(f.abs);
    if (c) checks.push(c);
    // The tool's own validator from the catalog, so a check never depends on the agent.
    const v = require('./catalog').validatorFor(f.abs, st.os || paths.platform());
    const same = (argv) => argv && argv.join(' ') === v.argv.join(' ');
    if (v && !st.checks.some(same) && !checks.some((x) => same(x.argv))) {
      checks.push({ name: v.argv.join(' ').split(f.abs.replace(/\\/g, '/')).join(paths.pretty(f.abs)), argv: v.argv });
    }
  }
  for (const f of st.plan.files) {
    let sa = null;
    try { sa = /.jsonc?$/i.test(f.abs) ? jsonc.parse(fs.readFileSync(f.abs, 'utf8')).startupActions : null; } catch { /* the JSON check reports it */ }
    if (typeof sa === 'string') checks.push({ name: `startup panes start installed programs: ${paths.pretty(f.abs)}`, internal: 'panes', commands: startupCommands(sa) });
  }
  for (const argv of st.checks) checks.push({ name: argv.join(' '), argv: argv.map(expandArg) });
  const results = checks.map((c) => {
    if (c.internal === 'json') {
      try { jsonc.parse(fs.readFileSync(c.file, 'utf8')); return { name: c.name, status: 0 }; } catch (e) { return { name: c.name, status: 1, output: e.message }; }
    }
    if (c.internal === 'panes') {
      const missing = c.commands.filter((cmd) => !sys.resolveCmd(cmd) && !fs.existsSync(cmd));
      return missing.length ? { name: c.name, status: 1, output: `not installed or not on PATH: ${missing.join(', ')}` } : { name: c.name, status: 0 };
    }
    if (!sys.resolveCmd(c.argv[0]) && !fs.existsSync(c.argv[0])) return { name: c.name, status: 0, skipped: `${c.argv[0]} not installed` };
    // In a simulated home, the tools must read that home (zellij layouts, includes, themes).
    // Not USERPROFILE: Windows tools (delta) then fail to find their known folders.
    const env = paths.fake() ? { ...process.env, HOME: paths.home(), XDG_CONFIG_HOME: path.join(paths.home(), '.config') } : undefined;
    const r = exec(c.argv[0], c.argv.slice(1), { timeout: 60000, env });
    return { name: c.name, status: r.status, output: (r.stdout + r.stderr).trim().slice(0, 2000) };
  });
  const ok = results.every((r) => r.status === 0);
  st.verify = { at: now(), ok, results };
  st.status = ok ? 'verified' : 'failed';
  if (!ok) st.error = 'verify failed: fix the files in a new run, or undo with `tmt restore`';
  save(st);
  return { id: st.id, ok, checks: results };
}

// ---------- measure ----------
function shellCommand(id) {
  switch (id) {
    case 'bash': return [sys.gitBash() || 'bash', ['-i', '-c', 'exit']];
    case 'zsh': return ['zsh', ['-i', '-c', 'exit']];
    case 'fish': return ['fish', ['-i', '-c', 'exit']];
    case 'powershell': return ['powershell', ['-NoLogo', '-Command', 'exit']];
    case 'pwsh': return ['pwsh', ['-NoLogo', '-Command', 'exit']];
    case 'nu': case 'nushell': return ['nu', ['-c', 'exit']];
    default: return null;
  }
}

function defaultShells(osName) {
  if (osName === 'windows') return ['powershell'].concat(sys.gitBash() ? ['bash'] : []);
  return osName === 'macos' ? ['zsh'] : ['bash'];
}

function budgetFor(st) {
  const env = Number(process.env.CLAUDE_PLUGIN_OPTION_STARTUP_BUDGET_MS || process.env.TMT_BUDGET_MS);
  if (env > 0) return env;
  const look = st && st.id ? readLook(st) : null;
  return (look && look.budget && look.budget.shellStartMs) || 500;
}

function timeShell(id, runs, exec) {
  const c = shellCommand(id);
  if (!c || (!sys.resolveCmd(c[0]) && !fs.existsSync(c[0]))) return { shell: id, skipped: 'not installed' };
  const env = { ...process.env };
  if (paths.fake()) { env.HOME = paths.home(); env.USERPROFILE = paths.home(); }
  const times = [];
  let lastErr = '';
  for (let i = 0; i < runs; i++) {
    const t0 = process.hrtime.bigint();
    const r = exec(c[0], c[1], { timeout: 30000, env });
    times.push(Number(process.hrtime.bigint() - t0) / 1e6);
    if (r.status !== 0) lastErr = (r.stderr || r.stdout).trim().slice(0, 300);
  }
  times.sort((a, b) => a - b);
  return { shell: id, runs, medianMs: Math.round(times[Math.floor(times.length / 2)]), minMs: Math.round(times[0]), error: lastErr || undefined };
}

function measure({ before = false, runs = 5, shells, exec = sys.exec } = {}) {
  let st = current();
  if (st && before && ['done', 'restored'].includes(st.status)) st = null;
  if (!st) {
    if (!before) throw new GateError('no run: start one with `tmt new` (or use `tmt measure --before` to just time the shells)');
    // diagnosis outside a run: time the shells, record nothing
    const os = paths.platform();
    const budget = budgetFor({ os, look: null, id: null });
    const results = (shells && shells.length ? shells : defaultShells(os)).map((s) => timeShell(s, runs, exec));
    return { id: null, budgetMs: budget, results, before: null, overBudget: results.filter((r) => r.medianMs > budget).map((r) => r.shell) };
  }
  if (!before && !['verified', 'done'].includes(st.status)) throw new GateError(`measure comes after verify (run is ${st.status})`);
  const list = shells && shells.length ? shells : st.shells.length ? st.shells : defaultShells(st.os);
  const budget = budgetFor(st);
  const results = list.map((s) => timeShell(s, runs, exec));
  const over = results.filter((r) => r.medianMs > budget);
  const key = before ? 'measureBefore' : 'measure';
  st[key] = { at: now(), budgetMs: budget, results };
  if (!before) st.status = 'done';
  save(st);
  const prev = st.measureBefore && !before ? st.measureBefore.results : null;
  return { id: st.id, budgetMs: budget, results, before: prev, overBudget: over.map((r) => r.shell) };
}

// ---------- restore ----------
function restore(id, { exec = sys.exec } = {}) {
  const st = id ? load(id) : current();
  if (!st) throw new GateError('no run to restore');
  const dir = runDir(st.id);
  const mf = path.join(dir, 'manifest.json');
  if (!fs.existsSync(mf)) throw new GateError(`run ${st.id} has nothing applied to restore`);
  if (st.status === 'restored') throw new GateError(`run ${st.id} is already restored`);
  const manifest = JSON.parse(fs.readFileSync(mf, 'utf8'));
  // keep whatever is there now, in case the user changed it after the apply
  const keep = path.join(dir, 'pre-restore');
  fs.mkdirSync(keep, { recursive: true });
  const changedSince = [];
  manifest.files.forEach((e, n) => {
    if (fs.existsSync(e.target)) {
      const buf = fs.readFileSync(e.target);
      fs.writeFileSync(path.join(keep, String(n).padStart(3, '0')), buf);
      if (e.afterHash && sha(buf) !== e.afterHash) changedSince.push(e.display);
    }
  });
  for (const e of [...manifest.files].reverse()) {
    if (e.existed) { fs.mkdirSync(path.dirname(e.target), { recursive: true }); fs.copyFileSync(path.join(dir, e.backup), e.target); } else fs.rmSync(e.target, { force: true });
  }
  // Folders apply created, deepest first; only empty ones (anything the user added since stays).
  for (const d of [...(manifest.dirs || [])].sort((a, b) => b.length - a.length)) {
    try { fs.rmdirSync(d); } catch { /* not empty or already gone: keep it */ }
  }
  for (const f of manifest.fonts || []) fonts.uninstall(f, { exec });
  st.status = 'restored';
  st.restored = { at: now(), changedSince };
  save(st);
  return { id: st.id, restored: manifest.files.map((e) => e.display), changedSince };
}

// ---------- status ----------
function status() {
  const st = current();
  if (!st) return { status: 'none', next: 'start a run: `tmt new`' };
  const staged = st.files.length + st.installs.length + st.fonts.length;
  const next = {
    open: staged ? 'review what is staged, then `tmt plan`' : 'stage files with `tmt stage ...`, then `tmt plan`',
    planned: `show the plan to the user; if they agree: \`tmt approve ${st.plan ? st.plan.hash.slice(0, 12) : '<hash>'}\``,
    approved: '`tmt apply`',
    applied: '`tmt verify`',
    verified: '`tmt measure`',
    done: 'finished: take a screenshot (`tmt shot`) to polish, `tmt new` for another change, or `tmt restore` to undo',
    failed: st.applied ? 'fix it in a new run (`tmt new --force`) or undo with `tmt restore`' : 'fix the cause, then `tmt plan` again',
    restored: 'restored: `tmt new` to start again',
  }[st.status];
  return { id: st.id, status: st.status, next, staged: { files: st.files.length, installs: st.installs.length, fonts: st.fonts.length, checks: st.checks.length }, error: st.status === 'failed' ? st.error : undefined, dir: runDir(st.id) };
}

module.exports = {
  GateError, newRun, current, load, list, runDir, stageFile, stageInstall, stageFont, stageCheck, stageShell, setLook, readLook,
  plan, approve, apply, verify, measure, restore, status, shellCommand,
};
