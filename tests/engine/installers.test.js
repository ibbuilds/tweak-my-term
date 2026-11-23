'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.TMT_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-installers-'));
const installers = require('../../engine/installers');

test('resolve picks the first catalog install whose manager exists', () => {
  const has = (m) => m === 'pacman';
  assert.deepStrictEqual(installers.resolve('wezterm', 'linux', { has }), { manager: 'pacman', id: 'wezterm' });
});

test('resolve honors the preferred package manager', () => {
  const has = (m) => m === 'pacman' || m === 'flatpak';
  assert.deepStrictEqual(installers.resolve('wezterm', 'linux', { has, prefer: 'flatpak' }), { manager: 'flatpak', id: 'org.wezfurlong.wezterm' });
});

test('resolve returns null when no manager is available', () => {
  assert.strictEqual(installers.resolve('wezterm', 'linux', { has: () => false }), null);
});
