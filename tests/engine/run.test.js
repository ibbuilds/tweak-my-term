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

test("verify runs the catalog tool's own validator on a config it knows", () => {
  freshHome();
  const prevOs = process.env.TMT_OS;
  process.env.TMT_OS = 'linux';
  try {
    run.newRun();
    run.stageFile('write', '{xdg-config}/ghostty/config.ghostty', src('c.ghostty', 'font-size = 12\n'));
    run.stageFile('write', '{xdg-config}/ghostty/notes.txt', src('n.txt', 'x'));
    run.approve(run.plan().hash);
    run.apply();
    const names = run.verify().checks.map((c) => c.name);
    assert.ok(names.includes('ghostty +validate-config --config-file=~/.config/ghostty/config.ghostty'), names.join('\n'));
    assert.ok(!names.some((n) => /notes\.txt/.test(n)), names.join('\n'));
  } finally { if (prevOs === undefined) delete process.env.TMT_OS; else process.env.TMT_OS = prevOs; }
});

test('plan reports which design steps the run folder shows', () => {
  freshHome();
  const st = run.newRun();
  run.stageFile('write', '~/x.txt', src('x', 'x'));
  assert.deepStrictEqual(run.plan().steps, { brief: false, asked: false, references: false, parts: false, look: false, preview: false });
  const dir = run.runDir(st.id);
  fs.writeFileSync(path.join(dir, 'brief.md'), '# Brief\nParts:\n- palette: Catppuccin port\n');
  fs.writeFileSync(path.join(dir, 'look.json'), '{}');
  fs.writeFileSync(path.join(dir, 'preview.png'), 'png');
  assert.deepStrictEqual(run.plan().steps, { brief: true, asked: false, references: false, parts: true, look: true, preview: true });
  // three curated references, each a link and what is taken from it
  fs.writeFileSync(path.join(dir, 'brief.md'), [
    '# Brief', 'References:',
    '- https://reddit.com/r/unixporn/a take: side pane with fetch',
    '- https://github.com/u/dots take: prompt pills',
    '- https://reddit.com/r/unixporn/b take: tab bar colors',
    'Parts:', '- palette: Catppuccin port', ''].join('\n'));
  assert.strictEqual(run.plan().steps.references, false, 'links alone: the screenshots were never looked at');
  fs.mkdirSync(path.join(dir, 'refs'));
  for (const n of ['1.png', '2.jpg', '3.webp']) fs.writeFileSync(path.join(dir, 'refs', n), 'img');
  assert.strictEqual(run.plan().steps.references, true, 'three saved screenshots in refs/ to look at');
  fs.writeFileSync(path.join(dir, 'brief.md'), [
    '# Brief', 'References:',
    '- https://reddit.com/r/unixporn/a',
    '- https://github.com/u/dots take: prompt',
    '- https://x.org take: colors',
    'Parts:', '- p', ''].join('\n'));
  assert.strictEqual(run.plan().steps.references, false, 'a link without what it gives does not count');
});

test('plan lists the user\'s shells and terminals that the staged files leave untouched', () => {
  freshHome();
  const prevOs = process.env.TMT_OS;
  process.env.TMT_OS = 'linux';
  try {
    const st = run.newRun();
    const dir = run.runDir(st.id);
    // detect.json from `tmt detect`: bash and zsh installed, kitty has a config
    fs.writeFileSync(path.join(dir, 'detect.json'), JSON.stringify({
      tools: { bash: { installed: true }, zsh: { installed: true }, eza: { installed: true } },
      terminals: { kitty: { installed: false } },
      configs: [{ tool: 'kitty', tools: ['kitty'], path: '~/.config/kitty/kitty.conf' }],
    }));
    run.stageFile('block', '~/.bashrc', src('b', 'PS1=x'));
    assert.deepStrictEqual(run.plan().uncovered, ['zsh', 'kitty']);
    assert.deepStrictEqual(run.load(st.id).plan.uncovered, ['zsh', 'kitty'], 'kept in the run state for graders');
    run.stageFile('write', '~/.zshrc', src('z', 'PROMPT=x'));
    run.stageFile('write', '~/.config/kitty/kitty.conf', src('k', 'font_size 12'));
    assert.deepStrictEqual(run.plan().uncovered, []);
  } finally { if (prevOs === undefined) delete process.env.TMT_OS; else process.env.TMT_OS = prevOs; }
});

test('plan without detect.json cannot tell coverage', () => {
  freshHome();
  run.newRun();
  run.stageFile('write', '~/x.txt', src('x', 'x'));
  assert.strictEqual(run.plan().uncovered, null);
});

test('a staged check with an unfilled {file} placeholder is refused', () => {
  freshHome();
  run.newRun();
  assert.throws(() => run.stageCheck(['ghostty', '+validate-config', '--config-file={file}']), /\{file\}/);
});

test('in a simulated home, verify runs checks with HOME set to that home', () => {
  const h = freshHome();
  run.newRun();
  run.stageFile('write', '~/x.txt', src('x', 'x'));
  run.stageCheck([process.execPath, '-e', 'process.exit(process.env.HOME === process.env.TMT_HOME ? 0 : 7)']);
  run.approve(run.plan().hash);
  run.apply();
  const v = run.verify();
  assert.ok(v.checks.some((c) => c.name.startsWith(process.execPath) && c.status === 0), JSON.stringify(v.checks) + h);
});

test('plan lists the whole-terminal parts the look leaves undecided', () => {
  freshHome();
  const st = run.newRun();
  run.stageFile('write', '~/x.txt', src('x', 'x'));
  assert.strictEqual(run.plan().lookGaps, null, 'no look.json yet');
  const dir = run.runDir(st.id);
  fs.writeFileSync(path.join(dir, 'look.json'), JSON.stringify({ name: 'v', prompt: { lines: 2 }, window: { padding: 8 } }));
  assert.deepStrictEqual(run.plan().lookGaps, ['onStart', 'tools', 'layout']);
  fs.writeFileSync(path.join(dir, 'look.json'), JSON.stringify({ name: 'v', prompt: {}, window: {}, onStart: { fetch: 'none' }, tools: [], layout: { multiplexer: 'none' } }));
  assert.deepStrictEqual(run.plan().lookGaps, [], 'an explicit "none" is a decision');
});

test('plan lists, per detected shell and terminal, every element the look has not decided', () => {
  freshHome();
  const prevOs = process.env.TMT_OS;
  process.env.TMT_OS = 'linux';
  try {
    const st = run.newRun();
    const dir = run.runDir(st.id);
    fs.writeFileSync(path.join(dir, 'detect.json'), JSON.stringify({ tools: { bash: { installed: true } }, terminals: { kitty: { installed: true } }, configs: [] }));
    run.stageFile('write', '~/x.txt', src('x', 'x'));
    assert.strictEqual(run.plan().undecided, null, 'no look.json yet');
    fs.writeFileSync(path.join(dir, 'look.json'), JSON.stringify({ name: 'v', elements: { 'bash.prompt': { choice: 'two-line pills', why: 'wants git info at a glance' }, 'kitty.tab-icon': { choice: 'none', why: 'single tab user' }, 'kitty.scrollbar': 'hidden' } }));
    const u = run.plan().undecided;
    assert.ok(u.bash.includes('banner') && !u.bash.includes('prompt'), JSON.stringify(u.bash));
    assert.ok(u.kitty.includes('window-icon') && !u.kitty.includes('tab-icon'), JSON.stringify(u.kitty));
    assert.ok(u.kitty.includes('scrollbar'), 'a choice without a why (other than "keep") is not decided');
    const all = require('../../catalog/elements.json');
    const every = {};
    for (const t of ['bash', 'kitty']) for (const e of Object.keys(all[t === 'bash' ? 'shell' : 'terminal'])) every[`${t}.${e}`] = 'keep';
    fs.writeFileSync(path.join(dir, 'look.json'), JSON.stringify({ name: 'v', elements: every }));
    const kept = run.plan().undecided;
    assert.ok(kept.kitty.includes('tab-icon') && kept.kitty.includes('window-icon') && kept.bash.includes('prompt'), 'the look restyles icons and prompt; "keep" is not a choice for them');
    assert.ok(!kept.kitty.includes('keybindings') && !kept.bash.includes('aliases'), 'options may stay as they are');
    for (const t of ['bash', 'kitty']) for (const e of all.restyle[t === 'bash' ? 'shell' : 'terminal']) every[`${t}.${e}`] = { choice: `new ${e}`, why: `need behind ${t} ${e}` };
    fs.writeFileSync(path.join(dir, 'look.json'), JSON.stringify({ name: 'v', elements: every }));
    assert.deepStrictEqual(run.plan().undecided, {});
  } finally { if (prevOs === undefined) delete process.env.TMT_OS; else process.env.TMT_OS = prevOs; }
});

test('a restyled element left as it was, or a why pasted on many elements, is not decided', () => {
  freshHome();
  const prevOs = process.env.TMT_OS;
  process.env.TMT_OS = 'linux';
  try {
    const st = run.newRun();
    const dir = run.runDir(st.id);
    fs.writeFileSync(path.join(dir, 'detect.json'), JSON.stringify({ tools: {}, terminals: { kitty: { installed: true } }, configs: [] }));
    run.stageFile('write', '~/x.txt', src('x', 'x'));
    const all = require('../../catalog/elements.json');
    const every = {};
    for (const e of Object.keys(all.terminal)) every[`kitty.${e}`] = { choice: `new ${e}`, why: `need behind ${e}` };
    every['kitty.tab-icon'] = { choice: 'none: profile icons unchanged', why: 'calm tabs' };
    every['kitty.window-icon'] = { choice: 'default app icon', why: 'no shortcut used' };
    every['kitty.bell'] = { choice: 'none', why: 'quiet office' };
    for (const e of ['font', 'cursor', 'padding', 'opacity']) every[`kitty.${e}`] = { choice: `new ${e}`, why: 'vaporwave look' };
    fs.writeFileSync(path.join(dir, 'look.json'), JSON.stringify({ name: 'v', elements: every }));
    const u = run.plan().undecided.kitty;
    assert.ok(u.includes('tab-icon') && u.includes('window-icon'), 'unchanged or default is "keep" in other words: ' + u);
    assert.ok(!u.includes('bell'), 'a real "none" with its own why is a decision');
    assert.deepStrictEqual(u.filter((e) => ['font', 'cursor', 'padding', 'opacity'].includes(e)).sort(), ['cursor', 'font', 'opacity', 'padding'], 'one why pasted on 4+ elements names no need');
  } finally { if (prevOs === undefined) delete process.env.TMT_OS; else process.env.TMT_OS = prevOs; }
});

test('plan reports whether the brief records the questions asked and the user answers', () => {
  freshHome();
  const st = run.newRun();
  run.stageFile('write', '~/x.txt', src('x', 'x'));
  const dir = run.runDir(st.id);
  fs.writeFileSync(path.join(dir, 'brief.md'), ['# Brief', 'Asked:', '- Q: side panes? A: fetch and a clock', '- Q: icons? A: yes', 'Parts:', '- p', ''].join('\n'));
  assert.strictEqual(run.plan().steps.asked, false, 'two answers are not an interview');
  fs.writeFileSync(path.join(dir, 'brief.md'), ['# Brief', 'Asked:', '- Q: side panes? A: fetch and a clock', '- Q: icons? A: yes, per shell', '- Q: speed or looks? A: looks, under a second', 'Parts:', '- p', ''].join('\n'));
  assert.strictEqual(run.plan().steps.asked, true);
});

test('plan flags a layout no different from the one the user has now', () => {
  freshHome();
  const st = run.newRun();
  run.stageFile('write', '~/x.txt', src('x', 'x'));
  const dir = run.runDir(st.id);
  assert.strictEqual(run.plan().layoutSame, null, 'no current.json: unknown');
  fs.writeFileSync(path.join(dir, 'current.json'), JSON.stringify({ terminals: { 'windows-terminal': { layout: { panes: 2 } } } }));
  fs.writeFileSync(path.join(dir, 'look.json'), JSON.stringify({ name: 'v', layout: { arrangement: { split: 'row', sizes: [60, 40], panes: [{ run: 'shell' }, { run: 'fastfetch' }] } } }));
  assert.strictEqual(run.plan().layoutSame, true, 'two panes before, two panes now');
  fs.writeFileSync(path.join(dir, 'look.json'), JSON.stringify({ name: 'v', layout: { arrangement: { split: 'row', sizes: [60, 40], panes: [{ run: 'shell' }, { split: 'column', sizes: [50, 50], panes: [{ run: 'fastfetch' }, { run: 'btop' }] }] } } }));
  assert.strictEqual(run.plan().layoutSame, false, 'a third pane with its own job');
  fs.writeFileSync(path.join(dir, 'look.json'), JSON.stringify({ name: 'v', layout: { multiplexer: 'zellij' } }));
  assert.strictEqual(run.plan().layoutSame, false, 'a multiplexer is a new layout');
});

test('plan flags tools the look uses that are neither installed nor staged to install', () => {
  freshHome();
  const prevOs = process.env.TMT_OS;
  process.env.TMT_OS = 'linux';
  try {
    const st = run.newRun();
    const dir = run.runDir(st.id);
    fs.writeFileSync(path.join(dir, 'detect.json'), JSON.stringify({ tools: { bash: { installed: true }, starship: { installed: true }, fastfetch: { installed: false } }, terminals: {}, configs: [] }));
    fs.writeFileSync(path.join(dir, 'look.json'), JSON.stringify({ name: 'v', tools: ['starship', 'fastfetch', 'not-a-catalog-tool'] }));
    run.stageFile('write', '~/x.txt', src('x', 'x'));
    assert.deepStrictEqual(run.plan().toolsMissing, ['fastfetch']);
    run.stageInstall('apt', 'fastfetch');
    assert.deepStrictEqual(run.plan().toolsMissing, []);
  } finally { if (prevOs === undefined) delete process.env.TMT_OS; else process.env.TMT_OS = prevOs; }
});

test('plan flags tools the user accepted in Asked that no install provides', () => {
  freshHome();
  const prevOs = process.env.TMT_OS;
  process.env.TMT_OS = 'linux';
  try {
    const st = run.newRun();
    const dir = run.runDir(st.id);
    fs.writeFileSync(path.join(dir, 'detect.json'), JSON.stringify({ tools: { starship: { installed: true } }, terminals: {}, configs: [] }));
    fs.writeFileSync(path.join(dir, 'look.json'), JSON.stringify({ name: 'v', tools: ['starship'] }));
    fs.writeFileSync(path.join(dir, 'brief.md'), ['# Brief', 'Asked:', '- Q: Layout? A: dashboard', '- Q: Tools to install? A: all (starship, fastfetch, frobnicator)', '- Q: Speed? A: looks', ''].join('\n'));
    run.stageFile('write', '~/x.txt', src('x', 'x'));
    assert.deepStrictEqual(run.plan().toolsMissing, ['fastfetch'], 'accepted, installable, not staged');
    run.stageInstall('apt', 'fastfetch');
    assert.deepStrictEqual(run.plan().toolsMissing, []);
  } finally { if (prevOs === undefined) delete process.env.TMT_OS; else process.env.TMT_OS = prevOs; }
});

test('merge-json refuses values broken by shell quoting: control characters or an unexpanded ${...}', () => {
  freshHome();
  run.newRun();
  const bad = String.raw`{"profiles": {"defaults": {"backgroundImage": "%USERPROFILE%.config\neon\bg.png"}}}`;
  assert.throws(() => run.stageFile('merge-json', '{wt-settings}', src('a.json', bad)), /profiles\.defaults\.backgroundImage.*control character/);
  const tpl = '{"profiles": {"list": [{"guid": "{1}", "icon": "C:/icons/${n}.png"}]}}';
  assert.throws(() => run.stageFile('merge-json', '{wt-settings}', src('b.json', tpl)), /icon.*\$\{n\}/);
  run.stageFile('merge-json', '{wt-settings}', src('c.json', JSON.stringify({ profiles: { defaults: { backgroundImage: ['%USERPROFILE%', '.config', 'neon', 'bg.png'].join(String.fromCharCode(92)) } } })));
});

test('verify follows a startup pane\'s -p profile to that profile\'s commandline', () => {
  freshHome();
  run.newRun();
  const s = {
    startupActions: 'new-tab -p "Shell" ; split-pane -V -s 0.4 -p "Vis" ; split-pane -H --profile "{0000-n}"',
    profiles: { list: [
      { name: 'Shell' },
      { name: 'Vis', commandline: 'not-a-real-tool-xyz.exe -p "%USERPROFILE%\cava.conf"' },
      { guid: '{0000-n}', name: 'Node', commandline: '"node" -v' },
    ] },
  };
  run.stageFile('write', '~/t/settings.json', src('settings.json', JSON.stringify(s)));
  run.approve(run.plan().hash);
  run.apply();
  const v = run.verify();
  const c = v.checks.find((x) => /startup panes/.test(x.name));
  assert.strictEqual(c.status, 1, JSON.stringify(v.checks));
  assert.match(c.output, /not-a-real-tool-xyz\.exe \(profile Vis\)/);
  assert.doesNotMatch(c.output, /node/);
});

test('apply reports each install, its catalog tool, and whether that tool is now on PATH', () => {
  freshHome();
  const prevOs = process.env.TMT_OS;
  process.env.TMT_OS = 'windows';
  try {
    run.newRun();
    run.stageInstall('winget', 'karlstav.cava');
    run.approve(run.plan().hash);
    const r = run.apply({ allowInstalls: true, exec: () => ({ status: 0, stdout: '', stderr: '' }) });
    assert.deepStrictEqual(r.installed.map(({ manager, id, tool }) => ({ manager, id, tool })), [{ manager: 'winget', id: 'karlstav.cava', tool: 'cava' }]);
    assert.strictEqual(r.installed[0].onPath, Boolean(require('../../engine/sys').resolveCmd('cava')));
  } finally { if (prevOs === undefined) delete process.env.TMT_OS; else process.env.TMT_OS = prevOs; }
});
