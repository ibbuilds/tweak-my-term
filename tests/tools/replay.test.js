'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { portableArg } = require('../../tools/replay');

test('replay: check arguments inside the rehearsal home become ~ paths; others stay', () => {
  assert.strictEqual(portableArg('C:/tmp/r1/home/.config/fish/x.fish', ['C:/tmp/r1/home']), '~/.config/fish/x.fish');
  assert.strictEqual(portableArg('c:/TMP/r1/home/.bashrc', ['C:/tmp/r1/home/']), '~/.bashrc');
  assert.strictEqual(portableArg('--no-execute', ['C:/tmp/r1/home']), '--no-execute');
});

test('replay: record keeps checks on the home and drops checks on the run folder drafts', () => {
  const fs = require('fs');
  const path = require('path');
  const mkTmp = require('../_tmp');
  const { record } = require('../../tools/replay');
  const root = mkTmp('tmt-rec-');
  const home = path.join(root, 'home');
  const runDir = path.join(root, 'state', 'runs', 'r1');
  fs.mkdirSync(path.join(runDir, 'out'), { recursive: true });
  fs.writeFileSync(path.join(runDir, 'out', 'b.block'), 'x');
  fs.writeFileSync(path.join(runDir, 'state.json'), JSON.stringify({ os: 'linux', files: [{ kind: 'block', target: '~/.bashrc', source: 'out/b.block' }], checks: [
    ['bash', '-n', path.join(home, '.bashrc')],
    ['bash', '-n', path.join(runDir, 'out', 'b.block')],
  ] }));
  // The run folder sits under the user's real home (as %TEMP% does on Windows).
  const out = record(runDir, `test-rec-${path.basename(root)}`, 'linux-basic', { homes: [home, root] });
  try {
    const rp = JSON.parse(fs.readFileSync(path.join(out, 'replay.json'), 'utf8'));
    assert.deepStrictEqual(rp.checks, [['bash', '-n', '~/.bashrc']]);
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

test('replay: record swaps big images for a small valid PNG', () => {
  const fs = require('fs');
  const path = require('path');
  const mkTmp = require('../_tmp');
  const { record } = require('../../tools/replay');
  const { decode } = require('../../kit/png');
  const root = mkTmp('tmt-rec-');
  const runDir = path.join(root, 'state', 'runs', 'r1');
  fs.mkdirSync(path.join(runDir, 'out'), { recursive: true });
  fs.writeFileSync(path.join(runDir, 'out', 'bg.png'), Buffer.alloc(300 * 1024, 1));
  fs.writeFileSync(path.join(runDir, 'state.json'), JSON.stringify({ os: 'windows', files: [{ kind: 'copy', target: '~/.config/x/bg.png', source: 'out/bg.png' }], checks: [] }));
  const out = record(runDir, `test-img-${path.basename(root)}`, 'windows-basic', { homes: [path.join(root, 'home')] });
  try {
    const png = fs.readFileSync(path.join(out, 'files', '000-bg.png'));
    assert.ok(png.length < 2048, `placeholder is ${png.length} bytes`);
    assert.ok(decode(png).width > 0);
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});
