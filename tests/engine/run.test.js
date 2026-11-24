'use strict';
const mkTmp = require('../_tmp');
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Each test gets a fresh fake home; the engine reads TMT_HOME on every call.
function freshHome() {
  const h = mkTmp('tmt-run-');
  process.env.TMT_HOME = h;
  delete process.env.TMT_STATE;
  return h;
}
const run = require('../../engine/run');

function src(name, content) {
  const d = mkTmp('tmt-src-');
  const f = path.join(d, name);
  fs.writeFileSync(f, content);
  return f;
}
const read = (f) => fs.readFileSync(f, 'utf8');

test('staging needs an open run', () => {
  freshHome();
  assert.throws(() => run.stageFile('write', '~/.bashrc', src('b', 'x')), /no open run/);
});

test('plan shows create and modify with a diff and a hash', () => {
  const h = freshHome();
  fs.writeFileSync(path.join(h, '.bashrc'), 'old\n');
  run.newRun();
  run.stageFile('write', '~/.bashrc', src('b', 'new\n'));
  run.stageFile('write', '~/.config/kitty/kitty.conf', src('k', 'font_size 12\n'));
  const p = run.plan();
  assert.match(p.hash, /^[0-9a-f]{64}$/);
  const byTarget = Object.fromEntries(p.files.map((f) => [f.display, f]));
  assert.strictEqual(byTarget['~/.bashrc'].change, 'modify');
  assert.match(byTarget['~/.bashrc'].diff, /-old/);
  assert.match(byTarget['~/.bashrc'].diff, /\+new/);
  assert.strictEqual(byTarget['~/.config/kitty/kitty.conf'].change, 'create');
});

test('apply refuses without approval', () => {
  freshHome();
  run.newRun();
  run.stageFile('write', '~/.bashrc', src('b', 'x\n'));
  run.plan();
  assert.throws(() => run.apply(), /not approved/);
});

test('approve refuses a hash that does not match the plan', () => {
  freshHome();
  run.newRun();
  run.stageFile('write', '~/.bashrc', src('b', 'x\n'));
  run.plan();
  assert.throws(() => run.approve('deadbeef'), /does not match/);
});

test('staging after approval needs a new plan and approval', () => {
  freshHome();
  run.newRun();
  run.stageFile('write', '~/.bashrc', src('b', 'x\n'));
  run.approve(run.plan().hash);
  run.stageFile('write', '~/.zshrc', src('z', 'y\n'));
  assert.throws(() => run.apply(), /not approved/);
});

test('apply refuses when a target changed after the plan', () => {
  const h = freshHome();
  fs.writeFileSync(path.join(h, '.bashrc'), 'old\n');
  run.newRun();
  run.stageFile('write', '~/.bashrc', src('b', 'new\n'));
  run.approve(run.plan().hash);
  fs.writeFileSync(path.join(h, '.bashrc'), 'edited by the user\n');
  assert.throws(() => run.apply(), /changed since the plan/);
  assert.strictEqual(read(path.join(h, '.bashrc')), 'edited by the user\n');
});

test('apply writes files, then restore puts back every byte and removes created files', () => {
  const h = freshHome();
  const original = Buffer.from([0xef, 0xbb, 0xbf, 0x61, 0x0d, 0x0a, 0x00, 0xff]);
  fs.writeFileSync(path.join(h, '.bashrc'), original);
  run.newRun();
  run.stageFile('write', '~/.bashrc', src('b', 'new\n'));
  run.stageFile('write', '~/.config/x/y.conf', src('y', 'y\n'));
  run.approve(run.plan().hash);
  run.apply();
  assert.strictEqual(read(path.join(h, '.bashrc')), 'new\n');
  assert.strictEqual(read(path.join(h, '.config', 'x', 'y.conf')), 'y\n');
  run.restore();
  assert.deepStrictEqual(fs.readFileSync(path.join(h, '.bashrc')), original);
  assert.strictEqual(fs.existsSync(path.join(h, '.config', 'x', 'y.conf')), false);
  assert.strictEqual(run.current().status, 'restored');
});

test('restore also removes the folders apply created, and keeps folders that were there', () => {
  const h = freshHome();
  fs.mkdirSync(path.join(h, '.config', 'mine'), { recursive: true });
  run.newRun();
  run.stageFile('write', '~/.config/look/art/bg.txt', src('a', 'a\n'));
  run.stageFile('write', '~/.config/mine/x.conf', src('x', 'x\n'));
  run.approve(run.plan().hash);
  run.apply();
  run.restore();
  assert.strictEqual(fs.existsSync(path.join(h, '.config', 'look')), false, 'created folders are gone');
  assert.strictEqual(fs.existsSync(path.join(h, '.config', 'mine')), true, 'existing folder kept');
  assert.strictEqual(fs.existsSync(path.join(h, '.config')), true);
});

test('a staged check that names a file by a relative path still finds it at verify time', () => {
  freshHome();
  run.newRun();
  const dir = mkTmp('tmt-chk-');
  fs.writeFileSync(path.join(dir, 'block.sh'), 'echo ok');
  const cwd = process.cwd();
  process.chdir(dir);
  try { run.stageCheck([process.execPath, '-e', 'require("fs").accessSync(process.argv[1])', 'block.sh', 'not-a-file']); } finally { process.chdir(cwd); }
  const argv = run.current().checks[0];
  assert.strictEqual(fs.realpathSync(argv[3]), fs.realpathSync(path.join(dir, 'block.sh')));
  assert.strictEqual(argv[4], 'not-a-file');
});

test('block staging keeps the rest of an rc file', () => {
  const h = freshHome();
  fs.writeFileSync(path.join(h, '.zshrc'), 'alias ll=ls\n');
  run.newRun();
  run.stageFile('block', '~/.zshrc', src('z', 'eval "$(starship init zsh)"\n'));
  run.approve(run.plan().hash);
  run.apply();
  assert.strictEqual(read(path.join(h, '.zshrc')),
    'alias ll=ls\n\n# >>> tweak-my-term >>>\neval "$(starship init zsh)"\n# <<< tweak-my-term <<<\n');
});

test('merge-json keeps keys the fragment does not own', () => {
  const h = freshHome();
  const target = path.join(h, 'AppData', 'Local', 'Packages', 'Microsoft.WindowsTerminal_8wekyb3d8bbwe', 'LocalState', 'settings.json');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, '{\n // mine\n "copyOnSelect": true,\n "profiles": {"list": [{"guid": "{a}", "name": "Mine"}]},\n}\n');
  run.newRun();
  run.stageFile('merge-json', '{wt-settings}', src('f.json', '{"schemes": [{"name": "X", "background": "#000000"}], "profiles": {"defaults": {"colorScheme": "X"}}}'));
  run.approve(run.plan({ os: 'windows' }).hash);
  run.apply();
  const out = JSON.parse(read(target));
  assert.strictEqual(out.copyOnSelect, true);
  assert.strictEqual(out.profiles.list[0].name, 'Mine');
  assert.strictEqual(out.profiles.defaults.colorScheme, 'X');
  assert.strictEqual(out.schemes[0].name, 'X');
});

test('installs only run when allowed, through the given executor', () => {
  freshHome();
  run.newRun();
  run.stageInstall('winget', 'junegunn.fzf');
  run.approve(run.plan().hash);
  assert.throws(() => run.apply({ exec: () => ({ status: 0 }) }), /installs are not allowed/);
  const calls = [];
  run.apply({ allowInstalls: true, exec: (cmd, args) => { calls.push([cmd, ...args].join(' ')); return { status: 0, stdout: '', stderr: '' }; } });
  assert.match(calls[0], /^winget install --id junegunn\.fzf --exact/);
});

test('with a simulated home (TMT_HOME) the real package manager is never called', () => {
  freshHome();
  run.newRun();
  run.stageInstall('winget', 'junegunn.fzf');
  run.approve(run.plan().hash);
  const sys = require('../../engine/sys');
  const real = sys.exec;
  const calls = [];
  sys.exec = (cmd, args) => { calls.push(cmd); return { status: 0, stdout: '', stderr: '' }; };
  try { run.apply({ allowInstalls: true }); } finally { sys.exec = real; }
  assert.deepStrictEqual(calls.filter((c) => c === 'winget'), []);
  assert.strictEqual(run.current().status, 'applied');
});

test('a failed install stops the apply before any file is written', () => {
  const h = freshHome();
  run.newRun();
  run.stageInstall('winget', 'bad.id');
  run.stageFile('write', '~/.bashrc', src('b', 'x\n'));
  run.approve(run.plan().hash);
  assert.throws(() => run.apply({ allowInstalls: true, exec: () => ({ status: 1, stdout: '', stderr: 'nope' }) }), /install failed/);
  assert.strictEqual(fs.existsSync(path.join(h, '.bashrc')), false);
  assert.strictEqual(run.current().status, 'failed');
});

test('verify fails on a broken JSON target and passes on a good one', () => {
  const h = freshHome();
  run.newRun();
  run.stageFile('write', '~/.config/t/a.json', src('a.json', '{"a": 1,}'));
  run.approve(run.plan().hash);
  run.apply();
  assert.strictEqual(run.verify().ok, true);
  fs.writeFileSync(path.join(h, '.config', 't', 'a.json'), '{"a": ');
  const v = run.verify();
  assert.strictEqual(v.ok, false);
  assert.strictEqual(run.current().status, 'failed');
});

test('verify fails when a Windows Terminal startup pane runs a command that is not installed', () => {
  freshHome();
  run.newRun();
  const settings = (sa) => JSON.stringify({ startupActions: sa, profiles: { defaults: {} } });
  run.stageFile('write', '~/t/settings.json', src('settings.json', settings('new-tab ; split-pane -V -s 0.35 --title "Mon" not-a-real-tool-xyz --flag ; move-focus left ; split-pane -H node -v')));
  run.approve(run.plan().hash);
  run.apply();
  const v = run.verify();
  assert.strictEqual(v.ok, false);
  const c = v.checks.find((x) => /startup panes/.test(x.name));
  assert.ok(c, v.checks.map((x) => x.name).join(' | '));
  assert.match(c.output, /not-a-real-tool-xyz/);
  assert.doesNotMatch(c.output, /\bnode\b/);
});

test('verify passes startup panes whose commands are installed', () => {
  freshHome();
  run.newRun();
  run.stageFile('write', '~/t/settings.json', src('settings.json', JSON.stringify({ startupActions: 'new-tab -p "PowerShell" ; sp -V node -v ; focus-tab -t 0' })));
  run.approve(run.plan().hash);
  run.apply();
  const v = run.verify();
  assert.strictEqual(v.ok, true, JSON.stringify(v.checks));
  assert.ok(v.checks.some((x) => /startup panes/.test(x.name)));
});

test('verify runs staged checks and reports their output', () => {
  freshHome();
  run.newRun();
  run.stageFile('write', '~/x.txt', src('x', 'x'));
  run.stageCheck([process.execPath, '-e', 'process.exit(3)']);
  run.approve(run.plan().hash);
  run.apply();
  const v = run.verify();
  assert.strictEqual(v.ok, false);
  assert.ok(v.checks.some((c) => c.status === 3));
});

test('status names the next step', () => {
  freshHome();
  run.newRun();
  run.stageFile('write', '~/x.txt', src('x', 'x'));
  assert.match(run.status().next, /tmt plan/);
  run.plan();
  assert.match(run.status().next, /tmt approve/);
});

test('a new run is refused while one is applied but unfinished', () => {
  freshHome();
  run.newRun();
  run.stageFile('write', '~/x.txt', src('x', 'x'));
  run.approve(run.plan().hash);
  run.apply();
  assert.throws(() => run.newRun(), /unfinished/);
  run.newRun({ force: true });
});

test('block staging keeps a UTF-16LE file UTF-16LE with its BOM', () => {
  const h = freshHome();
  const f = path.join(h, 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('$env:A = 1\r\n', 'utf16le')]));
  run.newRun();
  run.stageFile('block', '{ps-profile}', src('b.ps1', '. "$HOME/x.ps1"\n'), { os: 'windows' });
  const p = run.plan({ os: 'windows' });
  assert.match(p.files[0].diff, /\+\. "\$HOME\/x\.ps1"/);
  run.approve(p.hash);
  run.apply();
  const out = fs.readFileSync(f);
  assert.deepStrictEqual([...out.subarray(0, 2)], [0xff, 0xfe]);
  assert.strictEqual(out.subarray(2).toString('utf16le'),
    '$env:A = 1\r\n\r\n# >>> tweak-my-term >>>\r\n. "$HOME/x.ps1"\r\n# <<< tweak-my-term <<<\r\n');
});

test('merge-json that changes nothing leaves the file bytes alone', () => {
  const h = freshHome();
  const f = path.join(h, '.config', 'x', 'settings.json');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, '{\n    "a":\n    [\n        1\n    ],\n    "b": true\n}\n');
  run.newRun();
  run.stageFile('merge-json', '~/.config/x/settings.json', src('f.json', '{"a": [1]}'));
  assert.strictEqual(run.plan().files[0].change, 'unchanged');
});

test('a block whose lines are already in the file is left alone', () => {
  const h = freshHome();
  fs.writeFileSync(path.join(h, '.bashrc'), '# mine\nsource ~/x.sh\n');
  run.newRun();
  run.stageFile('block', '~/.bashrc', src('b', '# comment lines do not count\nsource ~/x.sh\n'));
  assert.strictEqual(run.plan().files[0].change, 'unchanged');
});

test('merge-json keeps the file\'s own JSON style (Windows Terminal puts [ and { on their own line)', () => {
  const h = freshHome();
  const f = path.join(h, '.config', 'x', 'settings.json');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, '{\n    "a":\n    [\n        {\n            "id": "x",\n            "v": 1\n        }\n    ],\n    "b": [],\n    "c": {}\n}');
  run.newRun();
  run.stageFile('merge-json', '~/.config/x/settings.json', src('f.json', '{"a": [{"id": "x", "v": 2}]}'));
  const p = run.plan();
  assert.strictEqual(p.files[0].diff, '     [\n         {\n             "id": "x",\n-            "v": 1\n+            "v": 2\n         }\n     ],\n     "b": [],\n');
});

test('measure --before works without a run (diagnosis) and saves nothing', () => {
  freshHome();
  const calls = [];
  const r = run.measure({ before: true, runs: 1, shells: ['powershell'], exec: (c) => { calls.push(c); return { status: 0, stdout: '', stderr: '' }; } });
  assert.strictEqual(r.id, null);
  assert.strictEqual(r.results.length, 1);
  assert.strictEqual(run.current(), null);
});
