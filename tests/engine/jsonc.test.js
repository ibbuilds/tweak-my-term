'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { parse, merge } = require('../../engine/jsonc');

test('parse strips line and block comments outside strings', () => {
  const text = '{\n // note\n "a": "http://x//y", /* block */ "b": "/* keep */"\n}';
  assert.deepStrictEqual(parse(text), { a: 'http://x//y', b: '/* keep */' });
});

test('parse accepts trailing commas', () => {
  assert.deepStrictEqual(parse('{"a": [1, 2,], "b": {"c": 1,},}'), { a: [1, 2], b: { c: 1 } });
});

test('parse keeps escaped quotes inside strings', () => {
  assert.deepStrictEqual(parse('{"a": "say \\"hi\\" // not a comment"}'), { a: 'say "hi" // not a comment' });
});

test('parse reports the position of a syntax error', () => {
  assert.throws(() => parse('{"a": }'), /JSON/);
});

test('merge deep-merges objects and keeps keys the fragment does not own', () => {
  const out = merge({ a: 1, p: { x: 1, y: 2 } }, { p: { y: 3, z: 4 } });
  assert.deepStrictEqual(out, { a: 1, p: { x: 1, y: 3, z: 4 } });
});

test('merge matches list items by guid, then name, then id', () => {
  const base = { list: [{ guid: '{1}', name: 'Old', hidden: true }, { name: 'Keep' }] };
  const frag = { list: [{ guid: '{1}', name: 'New' }, { name: 'Added' }] };
  assert.deepStrictEqual(merge(base, frag).list, [
    { guid: '{1}', name: 'New', hidden: true }, { name: 'Keep' }, { name: 'Added' },
  ]);
});

test('merge replaces lists of plain values', () => {
  assert.deepStrictEqual(merge({ a: [1, 2] }, { a: [3] }), { a: [3] });
});

test('merge does not mutate its inputs', () => {
  const base = { p: { x: 1 } };
  merge(base, { p: { x: 2 } });
  assert.deepStrictEqual(base, { p: { x: 1 } });
});

test('merge matches list items by a key that is unique in the list (WT keybindings repeat id)', () => {
  const base = { keybindings: [{ id: 'User.copy', keys: 'ctrl+c' }, { id: 'User.copy', keys: 'ctrl+shift+c' }, { id: 'User.x', keys: 'alt+x' }] };
  const frag = { keybindings: [{ id: 'User.copy', keys: 'ctrl+c' }, { id: 'User.copy', keys: 'ctrl+shift+c' }, { id: 'User.y', keys: 'alt+x' }] };
  assert.deepStrictEqual(merge(base, frag).keybindings, [
    { id: 'User.copy', keys: 'ctrl+c' }, { id: 'User.copy', keys: 'ctrl+shift+c' }, { id: 'User.y', keys: 'alt+x' }]);
});

test('indentOf reads the indent a file already uses', () => {
  const jsonc = require('../../engine/jsonc');
  assert.strictEqual(jsonc.indentOf('{\n  "a": 1\n}'), '  ');
  assert.strictEqual(jsonc.indentOf('{\n\t"a": 1\n}'), '\t');
  assert.strictEqual(jsonc.indentOf('{\n    "a": {\n        "b": 1\n    }\n}'), '    ');
  assert.strictEqual(jsonc.indentOf('{"a":1}'), '    ');
});
