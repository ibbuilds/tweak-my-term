'use strict';
const test = require('node:test');
const assert = require('node:assert');
const R = require('../../kit/raster');
const C = require('../../kit/color');
const H = require('./_helpers');

const px = (img, x, y) => Array.from(R.get(img, x, y));

test('create / get / set / fillRect / clone', () => {
  const a = R.create(4, 3, '#102030');
  assert.deepStrictEqual(px(a, 3, 2), [16, 32, 48, 255]);
  R.set(a, 1, 1, [1, 2, 3, 4]);
  assert.deepStrictEqual(px(a, 1, 1), [1, 2, 3, 4]);
  const b = R.clone(a);
  R.fillRect(b, 0, 0, 2, 2, '#FF0000');
  assert.deepStrictEqual(px(b, 1, 1), [255, 0, 0, 255]);
  assert.deepStrictEqual(px(a, 1, 1), [1, 2, 3, 4], 'clone is independent');
  assert.deepStrictEqual(px(R.create(2, 2), 0, 0), [0, 0, 0, 0]);
});

test('disc / circle / line are anti-aliased and clipped', () => {
  const img = R.create(40, 40, '#000000');
  R.disc(img, 20, 20, 8, '#FFFFFF');
  assert.deepStrictEqual(px(img, 20, 20), [255, 255, 255, 255]);
  assert.deepStrictEqual(px(img, 2, 2), [0, 0, 0, 255]);
  let partial = 0;
  for (let x = 0; x < 40; x++) { const v = px(img, x, 20)[0]; if (v > 0 && v < 255) partial++; }
  assert.ok(partial >= 2, 'edge pixels have partial coverage');
  const ring = R.create(40, 40, '#000000');
  R.circle(ring, 20, 20, 10, '#FFFFFF', 2);
  assert.strictEqual(px(ring, 20, 20)[0], 0);
  assert.ok(px(ring, 30, 20)[0] > 100);
  const l = R.create(20, 20, '#000000');
  R.line(l, 0, 10, 19, 10, '#FFFFFF', 1);
  assert.ok(px(l, 10, 9)[0] + px(l, 10, 10)[0] > 200);
  R.line(l, -50, -50, 200, 200, '#FF0000', 3); // must not throw when clipped
});

test('linearGradient / radialGradient hit their end stops', () => {
  const img = R.create(100, 10, '#000000');
  R.linearGradient(img, [{ pos: 0, color: '#FF0000' }, { pos: 1, color: '#0000FF' }], 0);
  const left = px(img, 0, 5), right = px(img, 99, 5);
  assert.ok(left[0] > 240 && left[2] < 15);
  assert.ok(right[2] > 240 && right[0] < 15);
  const vert = R.create(10, 100, '#000000');
  R.linearGradient(vert, [[0, '#000000'], [1, '#FFFFFF']], 90);
  assert.ok(px(vert, 5, 0)[0] < 10 && px(vert, 5, 99)[0] > 245);
  const rad = R.create(51, 51, '#000000');
  R.radialGradient(rad, [[0, '#FFFFFF'], [1, '#000000']], { r: 25 });
  assert.ok(px(rad, 25, 25)[0] > 240 && px(rad, 0, 25)[0] < 15);
});

test('valueNoise / fbm are deterministic per seed and in [0,1]', () => {
  const a = R.valueNoise(42), b = R.valueNoise(42), c = R.valueNoise(43);
  let differs = false;
  for (let i = 0; i < 50; i++) {
    const x = i * 0.37, y = i * 0.91;
    assert.strictEqual(a(x, y), b(x, y));
    if (a(x, y) !== c(x, y)) differs = true;
    assert.ok(a(x, y) >= 0 && a(x, y) <= 1);
  }
  assert.ok(differs);
  const f1 = R.fbm('seed', { octaves: 4 }), f2 = R.fbm('seed', { octaves: 4 });
  for (let i = 0; i < 50; i++) { const v = f1(i * 0.21, i * 0.13); assert.strictEqual(v, f2(i * 0.21, i * 0.13)); assert.ok(v >= 0 && v <= 1); }
});

test('boxBlur preserves mean and flat colors, smooths edges', () => {
  const img = H.blocks(48, 32, [[10, 8, 20, 12, '#FF8040']], '#202020');
  const m0 = H.meanRgb(img);
  const out = R.boxBlur(img, 4);
  const m1 = H.meanRgb(out);
  for (let c = 0; c < 3; c++) assert.ok(Math.abs(m0[c] - m1[c]) < 1, `channel ${c}: ${m0[c]} vs ${m1[c]}`);
  assert.deepStrictEqual(Array.from(R.boxBlur(R.create(8, 8, '#336699'), 3).data), Array.from(R.create(8, 8, '#336699').data));
  const edge = px(out, 10, 14)[0];
  assert.ok(edge > 0x20 && edge < 0xff, 'edge is blended');
  assert.deepStrictEqual(Array.from(R.boxBlur(img, 0).data), Array.from(img.data));
});

test('resize dims, flat color preservation, area-average and bilinear', () => {
  const img = H.blocks(40, 20, [[0, 0, 20, 20, '#FFFFFF']], '#000000');
  const down = R.resize(img, 10, 5);
  assert.strictEqual(down.width, 10); assert.strictEqual(down.height, 5);
  assert.deepStrictEqual(px(down, 0, 2), [255, 255, 255, 255]);
  assert.deepStrictEqual(px(down, 9, 2), [0, 0, 0, 255]);
  const odd = R.resize(H.blocks(30, 10, [[0, 0, 15, 10, '#FFFFFF']], '#000000'), 10, 10);
  assert.ok(Math.abs(H.meanRgb(odd)[0] - 127.5) < 1);
  const up = R.resize(R.create(3, 3, '#123456'), 17, 9);
  assert.strictEqual(up.width, 17); assert.strictEqual(up.height, 9);
  assert.deepStrictEqual(px(up, 8, 4), [0x12, 0x34, 0x56, 255]);
  const ramp = R.create(2, 1, '#000000'); R.set(ramp, 1, 0, '#FFFFFF');
  const big = R.resize(ramp, 8, 1);
  assert.ok(px(big, 0, 0)[0] === 0 && px(big, 7, 0)[0] === 255 && px(big, 3, 0)[0] > 0 && px(big, 3, 0)[0] < 255);
});

test('quantize outputs only palette colors (all dither modes) and keeps alpha', () => {
  const pal = ['#000000', '#FFFFFF', '#FF0000', '#2040A0'];
  const img = H.randomImage(30, 20, 77);
  for (const dither of ['none', 'ordered', 'fs']) {
    const q = R.quantize(img, pal, { dither });
    const seen = new Set();
    for (let i = 0; i < q.data.length; i += 4) {
      seen.add(C.rgbToHex([q.data[i], q.data[i + 1], q.data[i + 2]]));
      assert.strictEqual(q.data[i + 3], img.data[i + 3]);
    }
    for (const h of seen) assert.ok(pal.includes(h), `${dither}: ${h}`);
  }
  assert.strictEqual(C.rgbToHex(R.get(R.quantize(R.create(1, 1, '#F0F0F0'), pal), 0, 0)), '#FFFFFF');
  assert.strictEqual(C.rgbToHex(R.get(R.quantize(R.create(1, 1, '#E04040'), pal), 0, 0)), '#FF0000');
  const grey = R.quantize(R.create(16, 16, '#808080'), ['#000000', '#FFFFFF'], { dither: 'fs' });
  const white = [...grey.data].filter((v, i) => i % 4 === 0 && v === 255).length;
  assert.ok(white > 64 && white < 192, 'error diffusion mixes black/white for mid grey');
  assert.throws(() => R.quantize(img, []), /empty palette/);
});

test('composite opacity math and blend modes', () => {
  const dst = R.create(2, 1, '#FFFFFF');
  const src = R.create(1, 1, '#000000');
  R.composite(dst, src, { x: 0, y: 0, opacity: 0.5 });
  assert.ok(Math.abs(px(dst, 0, 0)[0] - 127.5) <= 1);
  assert.deepStrictEqual(px(dst, 1, 0), [255, 255, 255, 255]);
  const a = R.create(1, 1, '#808080');
  R.composite(a, R.create(1, 1, '#404040'), { mode: 'add' });
  assert.strictEqual(px(a, 0, 0)[0], 192);
  const m = R.create(1, 1, '#808080');
  R.composite(m, R.create(1, 1, '#808080'), { mode: 'multiply' });
  assert.ok(Math.abs(px(m, 0, 0)[0] - 64) <= 1);
  const s = R.create(1, 1, '#808080');
  R.composite(s, R.create(1, 1, '#808080'), { mode: 'screen' });
  assert.ok(Math.abs(px(s, 0, 0)[0] - 192) <= 1);
  const clip = R.create(3, 3, '#000000');
  R.composite(clip, R.create(2, 2, '#FF0000'), { x: 2, y: 2 }); // partially outside
  assert.deepStrictEqual(px(clip, 2, 2), [255, 0, 0, 255]);
  assert.throws(() => R.composite(clip, clip, { mode: 'nope' }), /unknown mode/);
  const t = R.create(1, 1, [0, 0, 0, 0]);
  R.composite(t, R.create(1, 1, '#336699'), { opacity: 0.5 });
  assert.deepStrictEqual(px(t, 0, 0).slice(0, 3), [0x33, 0x66, 0x99]);
  assert.ok(Math.abs(px(t, 0, 0)[3] - 127.5) <= 1);
});

test('dim / vignette / bloom / pixelate / scanlines', () => {
  const img = R.create(20, 20, '#808080');
  assert.deepStrictEqual(px(R.dim(img, 0.5), 3, 3), [64, 64, 64, 255]);
  assert.deepStrictEqual(px(img, 3, 3), [128, 128, 128, 255], 'inputs are not mutated');
  const v = R.vignette(img, 0.8);
  assert.ok(px(v, 0, 0)[0] < px(v, 10, 10)[0] && px(v, 10, 10)[0] > 120);
  const dark = H.blocks(40, 40, [[18, 18, 4, 4, '#FFFFFF']], '#000000');
  const b = R.bloom(dark, 0.5, 5, 1);
  assert.ok(px(b, 12, 20)[0] > 0, 'glow spreads outside the bright area');
  assert.deepStrictEqual(px(b, 20, 20), [255, 255, 255, 255]);
  assert.strictEqual(px(b, 1, 1)[0], 0);
  const p = R.pixelate(H.blocks(8, 8, [[0, 0, 4, 8, '#FFFFFF']], '#000000'), 4);
  assert.deepStrictEqual([px(p, 0, 0)[0], px(p, 3, 7)[0], px(p, 4, 0)[0]], [255, 255, 0]);
  const mixed = R.pixelate(H.blocks(4, 4, [[0, 0, 2, 4, '#FFFFFF']], '#000000'), 4);
  assert.ok(Math.abs(px(mixed, 1, 1)[0] - 127.5) <= 1);
  const sl = R.scanlines(img, 4, 0.5);
  assert.deepStrictEqual([px(sl, 0, 0)[0], px(sl, 0, 1)[0], px(sl, 0, 2)[0], px(sl, 0, 3)[0]], [128, 128, 64, 64]);
});

test('stats and regions: luminance mean and percentiles', () => {
  const half = H.blocks(20, 10, [[10, 0, 10, 10, '#FFFFFF']], '#000000');
  const s = R.stats(half);
  assert.ok(Math.abs(s.mean - 0.5) < 1e-6);
  assert.ok(s.p10 < 1e-6 && s.p90 > 0.999 && s.p50 >= 0 && s.p50 <= 1);
  const flat = R.stats(R.create(8, 8, '#808080'));
  const want = C.luminance('#808080');
  for (const k of ['mean', 'p10', 'p50', 'p90']) assert.ok(Math.abs(flat[k] - want) < 1e-6, k);
  const reg = R.regions(half, 2, 1);
  assert.strictEqual(reg.length, 2);
  assert.ok(reg[0].p90 < 1e-6 && reg[1].p10 > 0.999);
  assert.deepStrictEqual([reg[1].col, reg[1].row], [1, 0]);
  assert.strictEqual(R.regions(half, 4, 3).length, 12);
});
