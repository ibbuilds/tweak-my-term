'use strict';
const mkTmp = require('../_tmp');
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { spawnSync } = require('child_process');

const home = mkTmp('tmt-hook-');
process.env.TMT_HOME = home;
const run = require('../../engine/run');
const { handle } = require('../../engine/hook');

const src = (content) => { const f = path.join(mkTmp('tmt-s-'), 'x.conf'); fs.writeFileSync(f, content); return f; };
const target = path.join(home, '.config', 'demo', 'demo.conf');

test.before(() => {
  run.newRun();
  run.stageFile('write', '~/.config/demo/demo.conf', src('a'));
});

test('denies a direct Write to a file the run targets', () => {
  const out = handle('pre-tool-use', { tool_name: 'Write', tool_input: { file_path: target, content: 'x' } });
  assert.strictEqual(out.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(out.hookSpecificOutput.permissionDecisionReason, /tmt stage/);
});

test('allows writes inside the run folder', () => {
  const inside = path.join(home, '.tweak-my-term', 'runs', 'x', 'draft.conf');
  assert.strictEqual(handle('pre-tool-use', { tool_name: 'Write', tool_input: { file_path: inside } }), null);
});

test('allows unrelated files', () => {
  assert.strictEqual(handle('pre-tool-use', { tool_name: 'Edit', tool_input: { file_path: path.join(home, 'notes.md') } }), null);
});

test('denies a shell redirect into a guarded file, allows reading it', () => {
  const deny = handle('pre-tool-use', { tool_name: 'Bash', tool_input: { command: `echo x > ${target.replace(/\\/g, '/')}` } });
  assert.strictEqual(deny.hookSpecificOutput.permissionDecision, 'deny');
  assert.strictEqual(handle('pre-tool-use', { tool_name: 'Bash', tool_input: { command: `cat ${target} 2>/dev/null` } }), null);
});

test('denies PowerShell Set-Content on $PROFILE', () => {
  const out = handle('pre-tool-use', { tool_name: 'PowerShell', tool_input: { command: 'Set-Content $PROFILE "x"' } });
  assert.strictEqual(out.hookSpecificOutput.permissionDecision, 'deny');
});

test('text that only mentions a guarded file inside a heredoc or here-string is not a write to it', () => {
  const bash = `cat > /tmp/run/brief.md <<'EOF'\nKeep demo/demo.conf and demo.conf as they are.\nEOF\necho done`;
  assert.strictEqual(handle('pre-tool-use', { tool_name: 'Bash', tool_input: { command: bash } }), null);
  const ps = "Set-Content notes.md @'\nleave demo.conf alone\n'@";
  assert.strictEqual(handle('pre-tool-use', { tool_name: 'PowerShell', tool_input: { command: ps } }), null);
});

test('a heredoc written into a guarded file is still denied', () => {
  const cmd = `cat > ${target.replace(/\\/g, '/')} <<'EOF'\nx\nEOF`;
  assert.strictEqual(handle('pre-tool-use', { tool_name: 'Bash', tool_input: { command: cmd } }).hookSpecificOutput.permissionDecision, 'deny');
});

// Real false alarms from agent runs: the guarded file was only an argument to tmt, or the
// `>` sat inside a quoted sed expression of a read-only command.
const T = () => target.replace(/\\/g, '/');
const bashAllows = (command) => assert.strictEqual(handle('pre-tool-use', { tool_name: 'Bash', tool_input: { command } }), null, command);
const bashDenies = (command) => assert.strictEqual(handle('pre-tool-use', { tool_name: 'Bash', tool_input: { command } }).hookSpecificOutput.permissionDecision, 'deny', command);

test('a write into the run folder chained with tmt staging the guarded file is allowed', () => {
  bashAllows(`cd /tmp/run; cat > out/demo.conf <<'EOF'\nx\nEOF\ntmt stage write ${T()} out/demo.conf && tmt plan`);
  bashAllows(`echo x > out/demo.conf; tmt stage block ${T()} out/demo.conf`);
});

test('a > inside a quoted expression of a read-only command is not a write', () => {
  bashAllows(`grep -v secret ${T()} | sed 's/=.*/= <redacted>/' | head -40`);
  bashAllows(`cat ${T()} | sed "s/token=.*/token=<redacted>/I"`);
});

test('a write to the guarded file through a variable or a later chained command is denied', () => {
  bashDenies(`P="${T()}"; echo x >> "$P"`);
  bashDenies(`tmt status; echo x > ${T()}`);
  bashDenies(`cat ${T()} | tee ${T()}.new && mv ${T()}.new ${T()}`);
});

test('a draft with the config\'s file name is fine elsewhere, not inside the config folder', () => {
  bashAllows('cd /tmp/run && echo x > out/demo.conf');
  bashDenies(`cd ${path.dirname(target).replace(/\\/g, '/')} && echo x > demo.conf`);
  const deny = handle('pre-tool-use', { tool_name: 'Bash', cwd: path.dirname(target), tool_input: { command: 'echo x >> demo.conf' } });
  assert.strictEqual(deny.hookSpecificOutput.permissionDecision, 'deny');
});

test('lets plain tmt commands through', () => {
  assert.strictEqual(handle('pre-tool-use', { tool_name: 'Bash', tool_input: { command: 'tmt stage write ~/.config/demo/demo.conf /tmp/x > /dev/null' } }), null);
});

test('guard can be switched off by the plugin option', () => {
  process.env.CLAUDE_PLUGIN_OPTION_GUARD_CONFIGS = 'false';
  assert.strictEqual(handle('pre-tool-use', { tool_name: 'Write', tool_input: { file_path: target } }), null);
  delete process.env.CLAUDE_PLUGIN_OPTION_GUARD_CONFIGS;
});

test('stop blocks while a run is applied but not verified, once', () => {
  run.approve(run.plan().hash);
  run.apply();
  assert.strictEqual(handle('stop', {}).decision, 'block');
  assert.strictEqual(handle('stop', { stop_hook_active: true }), null);
});

test('session start reports an open run', () => {
  const out = handle('session-start', {});
  assert.match(out.hookSpecificOutput.additionalContext, /tmt verify/);
});

test('the hook process prints JSON and exits 0 even on bad input', () => {
  const r = spawnSync(process.execPath, [path.join(__dirname, '..', '..', 'engine', 'hook.js'), 'stop'], { input: 'not json', encoding: 'utf8', env: { ...process.env } });
  assert.strictEqual(r.status, 0);
});
