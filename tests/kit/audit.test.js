'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { audit, format } = require('../../kit/audit');
const { fromParts } = require('../../kit/palette');

const GOOD = fromParts({
  background: '#16141F', foreground: '#D6D0E0', cursor: '#C9A0F0', selectionBackground: '#3A3350',
  ansi: {
    black: '#3E3854', red: '#E08A99', green: '#8FBF9A', yellow: '#E0C08A', blue: '#8AA4E0', magenta: '#C9A0F0', cyan: '#86C5C9', white: '#C8C2D4',
    brightBlack: '#7A728F', brightRed: '#E896A4', brightGreen: '#A8D4B2', brightYellow: '#ECD3A6', brightBlue: '#A6BBEC', brightMagenta: '#D9BCF5', brightCyan: '#A3D6D9', brightWhite: '#EEEAF4',
  },
});

function term(over = {}) {
  return {
    scheme: 'Dusk', palette: GOOD, stock: {},
    font: { family: 'JetBrainsMono Nerd Font', size: 13, lineHeight: 1.25 },
    window: { padding: [12, 20, 12, 20], opacity: 1, blur: false, cursorShape: 'bar' },
    background: { image: null, opacity: null }, shader: false, layout: { panes: 1, startup: null },
    ...over,
  };
}
const current = (t, prompt = { bash: 'starship' }) => ({ terminals: { kitty: t }, prompt, startup: { fetch: [], multiplexer: null }, notes: [] });
const find = (r, area, verdict) => r.findings.find((f) => f.area === area && (!verdict || f.verdict === verdict));

test('a considered setup is kept: palette, type, padding and prompt all pass', () => {
  const r = audit(current(term()));
  for (const area of ['palette', 'font', 'padding', 'prompt']) assert.ok(find(r, area, 'keep'), `${area}: ${JSON.stringify(r.findings.filter((f) => f.area === area))}`);
  assert.ok(!r.findings.some((f) => f.verdict === 'improve'), JSON.stringify(r.findings.filter((f) => f.verdict === 'improve')));
});

test('the stock scheme is flagged for a new palette', () => {
  const r = audit(current(term({ scheme: 'Campbell', stock: { palette: true } })));
  assert.ok(find(r, 'palette', 'improve'));
});

test('pure black background and pure white text are flagged', () => {
  const p = { ...GOOD, background: '#000000', foreground: '#FFFFFF' };
  const r = audit(current(term({ palette: p })));
  assert.match(find(r, 'palette', 'improve').what, /#000000|pure black/i);
});

test('colors that fail contrast are named', () => {
  const p = { ...GOOD, ansi: { ...GOOD.ansi, blue: '#1F2A55' } };
  const r = audit(current(term({ palette: p })));
  assert.match(find(r, 'contrast', 'improve').what, /blue/);
});

test('text touching the window edge is flagged', () => {
  assert.ok(find(audit(current(term({ window: { padding: [0, 0, 0, 0], opacity: 1 } }))), 'padding', 'improve'));
});

test('flat line height and tiny type are flagged', () => {
  const r = audit(current(term({ font: { family: 'JetBrainsMono Nerd Font', size: 9, lineHeight: 1.0 } })));
  assert.ok(find(r, 'font', 'improve'));
});

test('icons need a Nerd Font when the prompt uses a prompt tool', () => {
  const r = audit(current(term({ font: { family: 'Consolas', size: 12, lineHeight: 1.2 } })));
  assert.match(find(r, 'font', 'improve').what, /Nerd Font/);
});

test('a shell with the default prompt is missing a prompt; a framework is flagged for speed', () => {
  const r = audit(current(term(), { bash: 'default', zsh: 'oh-my-zsh' }));
  assert.ok(r.findings.some((f) => f.area === 'prompt' && f.verdict === 'missing' && /bash/.test(f.what)));
  assert.ok(r.findings.some((f) => f.area === 'prompt' && f.verdict === 'improve' && /zsh/.test(f.what)));
});

test('see-through window over a picture without blur is flagged for readability', () => {
  const r = audit(current(term({ window: { padding: [12, 20, 12, 20], opacity: 0.6, blur: false } })));
  assert.ok(find(r, 'surface', 'improve'));
});

test('layout is reported, never judged: one window is a fact, not a flaw', () => {
  const r = audit(current(term()));
  assert.strictEqual(find(r, 'layout').verdict, 'info');
});

test('format writes keep / improve / missing sections', () => {
  const md = format(audit(current(term({ window: { padding: [0, 0, 0, 0], opacity: 1 } }), { bash: 'default' })));
  assert.match(md, /## Keep/);
  assert.match(md, /## Improve/);
  assert.match(md, /## Missing/);
});
