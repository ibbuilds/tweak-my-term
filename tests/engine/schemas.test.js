'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', '..', 'schemas');
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  test(`schemas/${f} is valid JSON`, () => {
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  });
}

test('look schema: a nested pane arrangement and gap validate; unknown keys do not', () => {
  const { check } = require('../../engine/schema');
  const base = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'kit', 'fixtures', 'look.json'), 'utf8'));
  const layout = { multiplexer: 'native', gap: 12, arrangement: { split: 'row', sizes: [60, 40], panes: [{ run: 'nvim', focus: true }, { split: 'column', panes: [{ run: 'shell' }, { run: 'btop' }] }] } };
  assert.deepStrictEqual(check('look', { ...base, layout }), []);
  const bad = { ...base, layout: { arrangement: { split: 'row', panes: [{ run: 'a', colour: 'x' }, { run: 'b' }] } } };
  assert.deepStrictEqual(check('look', bad), ['$.layout.arrangement.panes[0]: unknown key "colour"']);
});
