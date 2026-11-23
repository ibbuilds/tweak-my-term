'use strict';
const mkTmp = require('../_tmp');
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const os = require('os');
const fs = require('fs');

const home = mkTmp('tmt-home-');
process.env.TMT_HOME = home;
const paths = require('../../engine/paths');
const { applyBlock, removeBlock, markerFor } = require('../../engine/blocks');

test('~ expands to the fake home', () => {
  assert.strictEqual(paths.expand('~/.bashrc'), path.join(home, '.bashrc'));
});

test('{xdg-config} expands under home when XDG_CONFIG_HOME is unset', () => {
  const saved = process.env.XDG_CONFIG_HOME; delete process.env.XDG_CONFIG_HOME;
  assert.strictEqual(paths.expand('{xdg-config}/kitty/kitty.conf'), path.join(home, '.config', 'kitty', 'kitty.conf'));
  if (saved !== undefined) process.env.XDG_CONFIG_HOME = saved;
});

test('{wt-settings} resolves to the packaged Windows Terminal path under a fake home', () => {
  assert.strictEqual(paths.expand('{wt-settings}', { os: 'windows' }),
    path.join(home, 'AppData', 'Local', 'Packages', 'Microsoft.WindowsTerminal_8wekyb3d8bbwe', 'LocalState', 'settings.json'));
});

test('targets outside home are rejected', () => {
  assert.throws(() => paths.target('/etc/passwd'), /outside/);
  assert.throws(() => paths.target('~/../escape'), /outside/);
});

test('unknown tokens are rejected', () => {
  assert.throws(() => paths.expand('{nope}/x'), /unknown path token/);
});

test('markerFor picks the comment style by file type', () => {
  assert.strictEqual(markerFor('x/wezterm.lua').start, '-- >>> tweak-my-term >>>');
  assert.strictEqual(markerFor('~/.bashrc').start, '# >>> tweak-my-term >>>');
  assert.throws(() => markerFor('settings.json'), /block/);
});

test('applyBlock appends a block to a file without one, keeping the rest', () => {
  assert.strictEqual(applyBlock('export A=1\n', 'source x', '~/.bashrc'),
    'export A=1\n\n# >>> tweak-my-term >>>\nsource x\n# <<< tweak-my-term <<<\n');
});

test('applyBlock creates content for a missing file', () => {
  assert.strictEqual(applyBlock(null, 'source x\n', '~/.zshrc'), '# >>> tweak-my-term >>>\nsource x\n# <<< tweak-my-term <<<\n');
});

test('applyBlock replaces only its own block', () => {
  const before = 'a\n# >>> tweak-my-term >>>\nold\n# <<< tweak-my-term <<<\nb\n';
  assert.strictEqual(applyBlock(before, 'new', '~/.bashrc'), 'a\n# >>> tweak-my-term >>>\nnew\n# <<< tweak-my-term <<<\nb\n');
});

test('applyBlock keeps CRLF files CRLF', () => {
  assert.strictEqual(applyBlock('a\r\n', 'x', 'p.ps1'), 'a\r\n\r\n# >>> tweak-my-term >>>\r\nx\r\n# <<< tweak-my-term <<<\r\n');
});

test('removeBlock takes the block out', () => {
  const s = applyBlock('a\n', 'x', '~/.bashrc');
  assert.strictEqual(removeBlock(s, '~/.bashrc'), 'a\n');
});
