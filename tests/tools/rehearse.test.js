'use strict';
// Rehearsal grading: a tool call that names the real home (outside temp and ~/.claude) is a leak.
const test = require('node:test');
const assert = require('node:assert');
const { realHomeRefs } = require('../../tools/rehearse');

const turn = (...inputs) => ({ tools: inputs.map((input) => ({ name: 'Bash', input })) });

test('realHomeRefs counts tool calls that reach the real home', () => {
  const home = 'C:\\Users\\someone';
  const ok = ['C:\\Users\\someone\\AppData\\Local\\Temp', 'C:\\Users\\someone\\.claude'];
  const turns = [turn(
    { command: 'cat "C:/Users/someone/Documents/WindowsPowerShell/profile.ps1"' },
    { command: 'ls /c/Users/someone/.config' },
    { command: 'node engine/cli.js detect' },
    { command: 'cat C:\\Users\\someone\\AppData\\Local\\Temp\\run\\look.json' },
    { command: 'ls /c/Users/someone/.claude/plugins' },
  )];
  assert.strictEqual(realHomeRefs(turns, home, ok), 2);
});
