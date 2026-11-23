'use strict';
const test = require('node:test');
const assert = require('node:assert');
const C = require('../../kit/color');

const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg || ''} expected ${b} +-${eps}, got ${a}`);

test('hex <-> rgb', () => {
  assert.deepStrictEqual(C.hexToRgb('#FF8000'), [255, 128, 0]);
  assert.deepStrictEqual(C.hexToRgb('f80'), [255, 136, 0]);
  assert.strictEqual(C.rgbToHex([255, 128, 0]), '#FF8000');
  assert.strictEqual(C.rgbToHex([300, -5, 0.4]), '#FF0000');
  assert.throws(() => C.hexToRgb('#12'), /Invalid hex/);
});

test('sRGB <-> linear', () => {
  near(C.srgbToLinear(255), 1, 1e-12);
  near(C.srgbToLinear(0), 0, 1e-12);
  near(C.linearToSrgb(C.srgbToLinear(100)), 100, 1e-9);
});

test('OKLab known values', () => {
  const white = C.rgbToOklab([255, 255, 255]);
  near(white[0], 1, 1e-3); near(white[1], 0, 1e-3); near(white[2], 0, 1e-3);
  const red = C.rgbToOklch([255, 0, 0]);
  near(red[0], 0.628, 2e-3, 'L'); near(red[1], 0.2577, 2e-3, 'C'); near(red[2], 29.2, 0.3, 'h');
  assert.deepStrictEqual(C.rgbToOklab([0, 0, 0]).map((v) => Math.abs(v) < 1e-9), [true, true, true]);
});

test('OKLab / OKLCH round trip over many colors', () => {
  for (let i = 0; i < 300; i++) {
    const rgb = [(i * 37) % 256, (i * 101 + 7) % 256, (i * 59 + 13) % 256];
    assert.deepStrictEqual(C.oklabToRgb(C.rgbToOklab(rgb)), rgb);
    assert.deepStrictEqual(C.oklchToRgb(C.rgbToOklch(rgb)), rgb);
  }
});

test('oklchToRgb clips out-of-gamut colors by reducing chroma (hue kept)', () => {
  const clipped = C.oklchToRgb([0.7, 0.4, 150]);
  assert.ok(clipped.every((v) => v >= 0 && v <= 255));
  const [L, Cc, h] = C.rgbToOklch(clipped);
  near(L, 0.7, 0.01); near(h, 150, 2); assert.ok(Cc < 0.4 && Cc > 0.1);
  assert.deepStrictEqual(C.oklchToRgb([1.2, 0.1, 10]), [255, 255, 255]);
  assert.deepStrictEqual(C.oklchToRgb([-0.1, 0.1, 10]), [0, 0, 0]);
});

test('WCAG luminance and contrast', () => {
  near(C.contrast('#000000', '#FFFFFF'), 21, 1e-9);
  near(C.contrast('#FFFFFF', '#000000'), 21, 1e-9);
  near(C.contrast('#777777', '#777777'), 1, 1e-12);
  near(C.luminance('#FF0000'), 0.2126, 1e-6);
  near(C.contrast('#767676', '#FFFFFF'), 4.54, 0.01); // well-known AA boundary grey
});

test('mix in OKLab', () => {
  assert.strictEqual(C.mix('#102030', '#FFEEDD', 0), '#102030');
  assert.strictEqual(C.mix('#102030', '#FFEEDD', 1), '#FFEEDD');
  const m = C.mix('#000000', '#FFFFFF', 0.5);
  near(C.rgbToOklab(m)[0], 0.5, 0.01); // perceptual mid-grey, not 128 in linear light
});

test('withLightness keeps hue and chroma (gamut permitting)', () => {
  const src = '#B05A8C';
  const [, c0, h0] = C.hexToOklch(src);
  const out = C.withLightness(src, 0.8);
  const [L1, c1, h1] = C.hexToOklch(out);
  near(L1, 0.8, 0.01); near(c1, c0, 0.02); near(h1, h0, 2);
  const dark = C.withLightness('#FFD000', 0.2);
  near(C.hexToOklch(dark)[0], 0.2, 0.01);
});

test('deltaE and ensureContrast', () => {
  assert.strictEqual(C.deltaE('#123456', '#123456'), 0);
  near(C.deltaE('#000000', '#FFFFFF'), 1, 1e-3);
  const fixed = C.ensureContrast('#555555', '#202020', 4.5);
  assert.ok(C.contrast(fixed, '#202020') >= 4.5);
  const dn = C.ensureContrast('#BBBBBB', '#FFFFFF', 4.5);
  assert.ok(C.contrast(dn, '#FFFFFF') >= 4.5);
  assert.strictEqual(C.ensureContrast('#FFFFFF', '#000000', 4.5), '#FFFFFF');
});
