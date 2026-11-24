'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { portableArg } = require('../../tools/replay');

test('replay: check arguments inside the rehearsal home become ~ paths; others stay', () => {
  assert.strictEqual(portableArg('C:/tmp/r1/home/.config/fish/x.fish', ['C:/tmp/r1/home']), '~/.config/fish/x.fish');
  assert.strictEqual(portableArg('c:/TMP/r1/home/.bashrc', ['C:/tmp/r1/home/']), '~/.bashrc');
  assert.strictEqual(portableArg('--no-execute', ['C:/tmp/r1/home']), '--no-execute');
});
