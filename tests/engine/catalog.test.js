'use strict';
const mkTmp = require('../_tmp');
const test = require('node:test');
const assert = require('node:assert');

const catalog = require('../../engine/catalog');

function fakeHome(osName) {
  process.env.TMT_HOME = mkTmp('tmt-cat-');
  process.env.TMT_OS = osName;
  return process.env.TMT_HOME;
}

test('userConfigs: history files are never listed as configs', () => {
  fakeHome('linux');
  const raws = catalog.userConfigs('linux').map((c) => c.raw);
  assert.ok(raws.includes('~/.bashrc'));
  assert.ok(!raws.some((r) => /history/i.test(r)), raws.join(', '));
});

test('userConfigs: font folders are not configs', () => {
  fakeHome('windows');
  const tools = catalog.userConfigs('windows').flatMap((c) => c.tools);
  assert.ok(!tools.includes('nerd-fonts'));
});

test('userConfigs: a path shared by two tools is listed once, with both tools', () => {
  fakeHome('linux');
  const bashrc = catalog.userConfigs('linux').filter((c) => c.raw === '~/.bashrc');
  assert.strictEqual(bashrc.length, 1);
  assert.ok(bashrc[0].tools.includes('bash') && bashrc[0].tools.length > 1, bashrc[0].tools.join(','));
});

test('isPrivate: data files inside config folders are left out of a capture', () => {
  for (const f of ['ConsoleHost_history.txt', 'db.zo', 'history.db', '.env', 'github-token']) assert.ok(catalog.isPrivate(f), f);
  for (const f of ['settings.json', '.bashrc', 'theme.toml', 'wezterm.lua']) assert.ok(!catalog.isPrivate(f), f);
});
