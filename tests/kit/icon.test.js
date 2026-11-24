'use strict';
// tmt art icon: tab, profile and app icons drawn from the look's palette, one motif per shell.
const test = require('node:test');
const assert = require('node:assert');
const I = require('../../kit/icon');

const PAL = { background: '#140C26', foreground: '#F3E9FF', ansi: ['#3A2D5C', '#FF5C8A', '#05FFA1', '#FFFB96', '#7AA2FF', '#FF71CE', '#01CDFE', '#D9CCF0'] };
const px = (img, x, y) => Array.from(img.data.slice((y * img.width + x) * 4, (y * img.width + x) * 4 + 4));
const diff = (a, b) => { let n = 0; for (let i = 0; i < a.data.length; i += 4) if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) n++; return n / (a.data.length / 4); };

test('an icon is a square badge: transparent rounded corners, opaque middle', () => {
  const img = I.icon({ motif: 'prompt', palette: PAL, size: 64 });
  assert.strictEqual(img.width, 64);
  assert.strictEqual(img.height, 64);
  assert.strictEqual(px(img, 0, 0)[3], 0, 'corner is cut round');
  assert.strictEqual(px(img, 32, 32)[3], 255);
});

test('each motif draws a different icon, so profiles tell apart at a glance', () => {
  const a = I.icon({ motif: 'prompt', palette: PAL, size: 64 });
  for (const m of I.MOTIFS.filter((x) => x !== 'prompt')) {
    assert.ok(diff(a, I.icon({ motif: m, palette: PAL, size: 64 })) > 0.03, m);
  }
  assert.ok(I.MOTIFS.includes('powershell') && I.MOTIFS.includes('cmd') && I.MOTIFS.includes('sun'));
});

test('the accent colors the motif', () => {
  const pink = I.icon({ motif: 'prompt', palette: PAL, size: 64, accent: '#FF71CE' });
  const cyan = I.icon({ motif: 'prompt', palette: PAL, size: 64, accent: '#01CDFE' });
  assert.ok(diff(pink, cyan) > 0.02);
});

test('unknown motif is refused with the list', () => {
  assert.throws(() => I.icon({ motif: 'nope', palette: PAL }), /motif must be one of/);
});

test('ico wraps PNGs in an ICO container (Windows shortcuts and app icons)', () => {
  const ico = I.toIco([I.icon({ motif: 'sun', palette: PAL, size: 32 }), I.icon({ motif: 'sun', palette: PAL, size: 256 })]);
  assert.strictEqual(ico.readUInt16LE(0), 0);
  assert.strictEqual(ico.readUInt16LE(2), 1, 'type icon');
  assert.strictEqual(ico.readUInt16LE(4), 2, 'two images');
  assert.strictEqual(ico[6], 32);
  assert.strictEqual(ico[6 + 16], 0, '256 is stored as 0');
  const off = ico.readUInt32LE(6 + 12);
  assert.deepStrictEqual([...ico.subarray(off, off + 4)], [0x89, 0x50, 0x4e, 0x47], 'PNG payload');
});
