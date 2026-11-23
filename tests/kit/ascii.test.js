'use strict';
const test = require('node:test');
const assert = require('node:assert');
const A = require('../../kit/ascii');
const S = require('../../kit/scene');
const H = require('./_helpers');

const plain = (s) => A.stripAnsi(s).split('\n');
const width = (line) => [...line].length;

test('width equals cols for every charset and color mode; rows follow the aspect (cells are 2x tall)', () => {
  const img = S.paint({ preset: 'night-ocean', width: 200, height: 100, seed: 2 });
  for (const charset of A.CHARSETS) {
    for (const color of A.COLORS) {
      const lines = plain(A.toAscii(img, { cols: 40, charset, color }));
      assert.strictEqual(lines.length, 10, `${charset}/${color} rows`);
      for (const l of lines) assert.strictEqual(width(l), 40, `${charset}/${color}`);
    }
  }
  const tall = plain(A.toAscii(H.flat(100, 200, '#808080'), { cols: 20 }));
  assert.strictEqual(tall.length, 20);
  assert.strictEqual(width(tall[0]), 20);
  assert.strictEqual(plain(A.toAscii(H.flat(100, 100, '#808080'), { cols: 33, rows: 5 })).length, 5);
});

test('ascii and blocks: white is the densest glyph, black is blank, halves split where the image does', () => {
  const white = H.flat(40, 40, '#FFFFFF'), black = H.flat(40, 40, '#000000');
  assert.deepStrictEqual(plain(A.toAscii(white, { cols: 10, charset: 'ascii' })), Array(5).fill('@'.repeat(10)));
  assert.deepStrictEqual(plain(A.toAscii(black, { cols: 10, charset: 'ascii' })), Array(5).fill(' '.repeat(10)));
  assert.deepStrictEqual(plain(A.toAscii(white, { cols: 10, charset: 'blocks' })), Array(5).fill('█'.repeat(10)));
  const half = H.blocks(40, 20, [[0, 0, 20, 20, '#FFFFFF']]);
  const lines = plain(A.toAscii(half, { cols: 20, charset: 'ascii' }));
  assert.strictEqual(lines.length, 5);
  for (const l of lines) assert.strictEqual(l, '@'.repeat(10) + ' '.repeat(10));
  assert.strictEqual(plain(A.toAscii(half, { cols: 20, charset: 'ascii', invert: true }))[0], ' '.repeat(10) + '@'.repeat(10));
});

test('braille: full white is all dots, black is the empty braille cell', () => {
  assert.deepStrictEqual(plain(A.toAscii(H.flat(40, 40, '#FFFFFF'), { cols: 10, charset: 'braille' })), Array(5).fill('⣿'.repeat(10)));
  assert.deepStrictEqual(plain(A.toAscii(H.flat(40, 40, '#000000'), { cols: 10, charset: 'braille' })), Array(5).fill('⠀'.repeat(10)));
});

test('color none emits no escape codes; truecolor emits exact RGB, run-length encoded, reset at line end', () => {
  const red = H.flat(40, 40, '#FF0000');
  assert.ok(!A.toAscii(red, { cols: 10, charset: 'ascii' }).includes('\x1b'));
  const lines = A.toAscii(red, { cols: 10, charset: 'ascii', color: 'truecolor' }).split('\n');
  assert.strictEqual(lines.length, 5);
  assert.ok(lines[0].startsWith('\x1b[0;38;2;255;0;0m'));
  assert.ok(lines[0].endsWith('\x1b[0m'));
  assert.strictEqual((lines[0].match(/\x1b\[0;38/g) || []).length, 1, 'identical neighbors share one escape');
});

test('halfblock: top pixel is the foreground, bottom pixel the background', () => {
  const img = H.blocks(10, 10, [[0, 0, 10, 5, '#FF0000'], [0, 5, 10, 5, '#0000FF']]);
  const lines = A.toAscii(img, { cols: 10, charset: 'halfblock', color: 'truecolor' }).split('\n');
  assert.strictEqual(lines.length, 5);
  assert.ok(lines[0].startsWith('\x1b[0;38;2;255;0;0;48;2;255;0;0m▀'), 'red over red');
  assert.ok(lines[2].startsWith('\x1b[0;38;2;255;0;0;48;2;0;0;255m▀'), JSON.stringify(lines[2].slice(0, 40)));
  assert.ok(lines[4].startsWith('\x1b[0;38;2;0;0;255;48;2;0;0;255m▀'), 'blue over blue');
  // without color: a white top half over a black bottom half is the upper-half block
  const bw = H.blocks(10, 10, [[0, 0, 10, 5, '#FFFFFF']]);
  assert.deepStrictEqual(plain(A.toAscii(bw, { cols: 10, charset: 'halfblock' })).map((l) => l[0]), ['█', '█', '▀', ' ', ' ']);
});

test('ansi16 maps to the palette slots (default xterm colors without a palette)', () => {
  const red = H.flat(40, 40, '#FF0000');
  assert.ok(A.toAscii(red, { cols: 10, charset: 'ascii', color: 'ansi16' }).startsWith('\x1b[0;91m'));
  const palette = {
    background: '#000000',
    ansi: {
      black: '#000000', red: '#FE0000', green: '#00FF00', yellow: '#FFFF00', blue: '#0000FF', magenta: '#FF00FF', cyan: '#00FFFF', white: '#FFFFFF',
      brightBlack: '#555555', brightRed: '#400000', brightGreen: '#00FF00', brightYellow: '#FFFF00', brightBlue: '#0000FF', brightMagenta: '#FF00FF', brightCyan: '#00FFFF', brightWhite: '#FFFFFF',
    },
  };
  assert.ok(A.toAscii(red, { cols: 10, charset: 'ascii', color: 'ansi16', palette }).startsWith('\x1b[0;31m'), 'closest palette slot is red (31)');
});

test('transparent pixels take the palette background', () => {
  const clear = H.flat(20, 10, '#000000');
  for (let i = 3; i < clear.data.length; i += 4) clear.data[i] = 0;
  assert.deepStrictEqual(plain(A.toAscii(clear, { cols: 5, charset: 'ascii', palette: { background: '#FFFFFF' } })), ['@'.repeat(5)]);
  assert.deepStrictEqual(plain(A.toAscii(clear, { cols: 5, charset: 'ascii' })), [' '.repeat(5)]);
});

test('bad options fail with a clear message', () => {
  const img = H.flat(8, 8, '#FFFFFF');
  assert.throws(() => A.toAscii(img, { charset: 'emoji' }), /unknown charset "emoji"/);
  assert.throws(() => A.toAscii(img, { color: 'rainbow' }), /unknown color mode "rainbow"/);
  assert.throws(() => A.toAscii(img, { cols: 0 }), /cols must be 1\.\.1000/);
});
