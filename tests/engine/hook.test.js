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
