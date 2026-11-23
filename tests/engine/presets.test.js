'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.TMT_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-presets-'));
const run = require('../../engine/run');
const presets = require('../../engine/presets');

test('resolveInstall picks the first catalog install whose manager exists', () => {
  const has = (m) => m === 'pacman';
  assert.deepStrictEqual(presets.resolveInstall('wezterm', 'linux', { has }), { manager: 'pacman', id: 'wezterm' });
});

test('resolveInstall honors the preferred package manager', () => {
  const has = (m) => m === 'pacman' || m === 'flatpak';
  assert.deepStrictEqual(presets.resolveInstall('wezterm', 'linux', { has, prefer: 'flatpak' }), { manager: 'flatpak', id: 'org.wezfurlong.wezterm' });
});

test('resolveInstall returns null when no manager is available', () => {
  assert.strictEqual(presets.resolveInstall('wezterm', 'linux', { has: () => false }), null);
});

test('the quiet preset stages for all three OSes', () => {
  for (const osName of ['windows', 'macos', 'linux']) {
    run.newRun({ force: true });
    const s = presets.stage('quiet', { osName, has: (m) => ['winget', 'brew', 'pacman'].includes(m) });
    assert.ok(s.files >= 3, `${osName}: files`);
    assert.strictEqual(s.unresolved.length, 0, `${osName}: ${s.unresolved}`);
  }
});
