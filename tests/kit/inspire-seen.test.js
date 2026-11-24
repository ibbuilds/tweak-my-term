'use strict';
// Inspiration from what the screenshots show (catalog/inspiration/annotations.json), not only tags.
const mkTmp = require('../_tmp');
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const I = require('../../kit/inspire');
const png = require('../../kit/png');
const H = require('./_helpers');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'rices-sample.json'), 'utf8'));
const base = Object.values(raw).map(I.normalize);

const seenOf = (id, over) => ({
  id, focus: 'terminal', terminals: [{ box: [0.1, 0.1, 0.5, 0.6], panes: 1, shows: ['shell'], surface: 'opaque' }],
  layout: 'single', complexity: 1, tone: 'dark', prompt: 'minimal', mood: ['minimal'], note: 'n', ...over,
});
const ANN = [
  seenOf('fx0001', {}),
  seenOf('fx0015', { layout: 'dashboard', complexity: 5, mood: ['cyberpunk'], terminals: [
    { box: [0, 0, 0.3, 0.5], shows: ['fetch'] }, { box: [0.3, 0, 0.3, 0.5], shows: ['monitor'] },
    { box: [0.6, 0, 0.4, 0.5], shows: ['clock'] }, { box: [0, 0.5, 1, 0.5], shows: ['visualizer', 'pipes'] }] }),
  seenOf('fx0006', { layout: 'single' }),
  seenOf('fx0014', { layout: 'panes', complexity: 3, mood: ['cozy'], terminals: [{ box: [0.2, 0.2, 0.6, 0.6], panes: 3, shows: ['editor', 'shell'] }] }),
  seenOf('fx0005', { focus: 'other', layout: 'none', terminals: [], complexity: 1 }),
];
const entries = () => I.withSeen(base.map((e) => ({ ...e })), ANN);
const ids = (r) => r.results.map((x) => x.id);

test('withSeen attaches what the screenshot shows to its rice', () => {
  const e = entries();
  assert.strictEqual(e.find((x) => x.id === 'fx0015').seen.complexity, 5);
  assert.strictEqual(e.find((x) => x.id === 'fx0002').seen, null);
});

test('"complex" finds busy setups by what is on screen, and skips simple ones', () => {
  const r = I.rank(entries(), 'complex', { limit: 5 });
  assert.ok(r.results.length > 0, r.notes.join(' '));
  assert.strictEqual(r.results[0].id, 'fx0015');
  assert.ok(!ids(r).includes('fx0001'), ids(r).join(','));
});

test('"minimal" prefers screenshots seen as simple', () => {
  const r = I.rank(entries(), 'minimal', { limit: 3 });
  assert.ok(ids(r).includes('fx0001'), ids(r).join(','));
  assert.ok(!ids(r).includes('fx0015'));
});

test('words for what runs in a terminal match the screenshot (clock, visualizer)', () => {
  assert.deepStrictEqual(ids(I.rank(entries(), 'clock', { limit: 3 })), ['fx0015']);
});

test('--layout uses the screenshot when it was looked at: tmux in the tags but one window on screen is not panes', () => {
  const r = I.rank(entries(), '', { layout: 'panes', limit: 15 });
  assert.ok(ids(r).includes('fx0014'), ids(r).join(','));
  assert.ok(!ids(r).includes('fx0006'), ids(r).join(','));
  assert.match(r.results.find((x) => x.id === 'fx0014').why, /seen/);
});

test('--has keeps only screenshots that show those things', () => {
  const r = I.rank(entries(), '', { has: ['monitor', 'clock'], limit: 10 });
  assert.deepStrictEqual(ids(r), ['fx0015']);
});

test('--complexity filters by the 1-5 scale (n, n+ or n-m)', () => {
  assert.deepStrictEqual(ids(I.rank(entries(), '', { complexity: '4+', limit: 10 })), ['fx0015']);
  assert.deepStrictEqual(ids(I.rank(entries(), '', { complexity: '3', limit: 10 })), ['fx0014']);
});

test('a screenshot seen with no terminal in it sinks below ones that have one', () => {
  const r = I.rank(entries(), 'kitty', { limit: 10 });
  const order = ids(r);
  assert.ok(order.indexOf('fx0005') > order.indexOf('fx0013'), order.join(','));
});

test('results carry the terminal boxes, and the text output lists them', () => {
  const r = I.rank(entries(), 'clock', { limit: 1 });
  assert.strictEqual(r.results[0].seen.terminals.length, 4);
  assert.match(I.formatResults(r), /seen: dashboard, complexity 5/);
});

test('cropTerminals cuts each terminal out of a saved screenshot', () => {
  const dir = mkTmp('tmt-crop-');
  const file = path.join(dir, 'rice-x.png');
  fs.writeFileSync(file, png.encode(H.flat(200, 100, '#336699')));
  const out = I.cropTerminals(file, { terminals: [{ box: [0.5, 0, 0.5, 1], shows: ['shell'] }, { box: [0, 0, 0.25, 0.5], shows: ['clock'] }] });
  assert.strictEqual(out.length, 2);
  const a = png.decode(fs.readFileSync(out[0].file));
  assert.deepStrictEqual([a.width, a.height], [100, 100]);
  assert.match(path.basename(out[1].file), /rice-x-t2\.png$/);
});
