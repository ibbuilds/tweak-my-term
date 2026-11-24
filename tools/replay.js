#!/usr/bin/env node
'use strict';
// Replay recorded plans on a real machine: stage → plan → approve → apply → verify →
// restore in a temporary fake home, with the real tools installed, so each config is
// checked by the tool's own validator (CI runs it on macOS and Linux). No AI involved.
//
//   node tools/replay.js record <run-dir> <name> <home-fixture>   save a rehearsal's plan
//   node tools/replay.js run [name...] [--os macos|linux|windows]  replay (all by default)
//
// A replay is rehearsals/replays/<name>/: replay.json { os, home, files: [{kind, target,
// file}], checks } and the staged files. Only files and checks: installs are the CI's job.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'rehearsals', 'replays');
const CLI = path.join(ROOT, 'engine', 'cli.js');

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}

/** Arguments that point into the rehearsal's home become `~/...` so they work anywhere. */
function portableArg(a, homes) {
  const s = String(a).replace(/\\/g, '/');
  for (const h of homes) {
    const hh = h.replace(/\\/g, '/').replace(/\/+$/, '');
    if (hh && s.toLowerCase().startsWith(hh.toLowerCase() + '/')) return '~/' + s.slice(hh.length + 1);
  }
  return a;
}

function record(runDir, name, home, opts = {}) {
  const st = JSON.parse(fs.readFileSync(path.join(runDir, 'state.json'), 'utf8'));
  const out = path.join(DIR, name);
  fs.mkdirSync(path.join(out, 'files'), { recursive: true });
  const files = st.files.map((f, n) => {
    const file = `files/${String(n).padStart(3, '0')}-${path.basename(f.source).replace(/^\d{3}-/, '')}`;
    const from = path.join(runDir, f.source);
    // Replays check configs, not pixels: big images become a small valid PNG of the same name.
    if (/\.(png|jpe?g|webp|gif)$/i.test(from) && fs.statSync(from).size > 64 * 1024) {
      fs.writeFileSync(path.join(out, file), require('../kit/png').encode({ width: 16, height: 10, data: Buffer.alloc(16 * 10 * 4, 0x80) }));
    } else fs.copyFileSync(from, path.join(out, file));
    return { kind: f.kind, target: f.target, file };
  });
  const homes = opts.homes || [path.join(runDir, '..', '..', '..', 'home'), os.homedir()];
  // Checks that name files outside the home (the run folder) can't be replayed elsewhere.
  const inRun = (a) => portableArg(a, [runDir]) !== a;
  const checks = (st.checks || []).filter((c) => !c.some(inRun) && !c.some((a) => String(a).includes('{file}'))).map((c) => c.map((a) => portableArg(a, homes)))
    .filter((c) => !c.some((a) => /^([A-Za-z]:)?[\\/]/.test(String(a)) && !String(a).startsWith('~')));
  fs.writeFileSync(path.join(out, 'replay.json'), JSON.stringify({ os: st.os, home, files, checks }, null, 2) + '\n');
  return out;
}

function tmt(args, env) {
  const r = spawnSync(process.execPath, [CLI, ...args], { env, encoding: 'utf8', timeout: 600000 });
  return { status: r.status, out: `${r.stdout || ''}${r.stderr || ''}` };
}

function replay(name) {
  const dir = path.join(DIR, name);
  const rp = JSON.parse(fs.readFileSync(path.join(dir, 'replay.json'), 'utf8'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `tmt-replay-${name}-`));
  const home = path.join(tmp, 'home');
  copyDir(path.join(ROOT, 'rehearsals', 'homes', rp.home), home);
  const env = { ...process.env, TMT_HOME: home, TMT_STATE: path.join(tmp, 'state'), TMT_OS: rp.os };
  const step = (args) => { const r = tmt(args, env); if (r.status !== 0) throw new Error(`tmt ${args.join(' ')}:\n${r.out}`); return r.out; };
  step(['new', '--note', `replay ${name}`]);
  for (const f of rp.files) step(['stage', f.kind, f.target, path.join(dir, f.file)]);
  for (const c of rp.checks) step(['stage', 'check', '--', ...c]);
  const plan = JSON.parse(step(['plan', '--json']));
  step(['approve', plan.hash]);
  step(['apply']);
  const v = tmt(['verify'], env);
  step(['restore']);
  // REPLAY_STRICT=1 (CI, tools installed): a check skipped for a missing tool is a failure.
  const skipped = /^skip /m.test(v.out);
  return { name, ok: v.status === 0 && !(process.env.REPLAY_STRICT === '1' && skipped), verify: v.out.trim() };
}

if (require.main === module) {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === 'record') {
    const [runDir, name, home] = rest;
    if (!runDir || !name || !home) { console.error('usage: node tools/replay.js record <run-dir> <name> <home-fixture>'); process.exit(2); }
    console.log(record(path.resolve(runDir), name, home));
  } else if (cmd === 'run') {
    const i = rest.indexOf('--os');
    const onlyOs = i >= 0 ? rest.splice(i, 2)[1] : null;
    const names = rest.length ? rest : (fs.existsSync(DIR) ? fs.readdirSync(DIR) : []);
    let failed = 0;
    for (const n of names) {
      const rp = JSON.parse(fs.readFileSync(path.join(DIR, n, 'replay.json'), 'utf8'));
      if (onlyOs && rp.os !== onlyOs) continue;
      let r;
      try { r = replay(n); } catch (e) { r = { name: n, ok: false, verify: e.message }; }
      if (!r.ok) failed++;
      console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${n}\n${r.verify.split('\n').map((l) => `     ${l}`).join('\n')}`);
    }
    process.exit(failed ? 1 : 0);
  } else {
    console.error('usage: node tools/replay.js record <run-dir> <name> <home> | run [name...] [--os os]');
    process.exit(2);
  }
}

module.exports = { record, replay, portableArg };
