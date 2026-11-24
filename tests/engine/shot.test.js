'use strict';
// tmt shot must capture a terminal window only, never whatever app is in front.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const mkTmp = require('../_tmp');
const { shot } = require('../../engine/shot');

test('on Windows, shot targets terminal processes and renders that window, not the foreground one', () => {
  const prev = process.env.TMT_OS;
  process.env.TMT_OS = 'windows';
  try {
    let script = '';
    const dir = mkTmp('shot-');
    const exec = (cmd, args) => {
      script = args[args.length - 1];
      fs.writeFileSync(JSON.parse(/Save\(("(?:[^"\\]|\\.)*")/.exec(script)[1]), 'png');
      return { status: 0, stdout: '', stderr: '' };
    };
    const f = shot({ dir, exec });
    assert.ok(fs.existsSync(f));
    assert.doesNotMatch(script, /GetForegroundWindow/);
    assert.match(script, /WindowsTerminal/);
    assert.match(script, /PrintWindow/);
    assert.match(script, /no terminal window/);
  } finally { if (prev === undefined) delete process.env.TMT_OS; else process.env.TMT_OS = prev; }
});
