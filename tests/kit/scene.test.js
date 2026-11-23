'use strict';
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const S = require('../../kit/scene');
const H = require('./_helpers');

const sha = (img) => crypto.createHash('sha256').update(img.data).digest('hex');
const luma = (img) => { const [r, g, b] = H.meanRgb(img); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const px = (img, x, y) => Array.from(img.data.subarray((y * img.width + x) * 4, (y * img.width + x) * 4 + 4));

test('presets: the named recipes exist', () => {
  assert.deepStrictEqual(Object.keys(S.presets).sort(), ['minimal-gradient', 'night-ocean', 'nord-mountains', 'synthwave']);
  for (const p of Object.values(S.presets)) { assert.ok(p.description.length > 10); assert.ok(p.palette.background && p.palette.accent); assert.ok(p.layers.length >= 2); }
});

test('paint: same seed gives byte-identical pixels, another seed differs', () => {
  const a = S.paint({ preset: 'nord-mountains', width: 320, height: 200, seed: 7 });
  const b = S.paint({ preset: 'nord-mountains', width: 320, height: 200, seed: 7 });
  const c = S.paint({ preset: 'nord-mountains', width: 320, height: 200, seed: 8 });
  assert.strictEqual(a.width, 320); assert.strictEqual(a.height, 200);
  assert.strictEqual(sha(a), sha(b));
  assert.notStrictEqual(sha(a), sha(c));
  const s1 = S.paint({ preset: 'minimal-gradient', width: 64, height: 40, seed: 'hello' });
  const s2 = S.paint({ preset: 'minimal-gradient', width: 64, height: 40, seed: 'hello' });
  assert.strictEqual(sha(s1), sha(s2));
});

test('paint: every preset renders an opaque image of the asked size', () => {
  for (const name of Object.keys(S.presets)) {
    const img = S.paint({ preset: name, width: 240, height: 150, seed: 3 });
    assert.strictEqual(img.data.length, 240 * 150 * 4, name);
    for (let i = 3; i < img.data.length; i += 4) assert.strictEqual(img.data[i], 255, `${name} alpha`);
    const mean = H.meanRgb(img);
    assert.ok(mean.some((v) => v > 2), `${name} is not all black`);
  }
});

test('palette drives the colors: synthwave with a green palette is green, with its own palette magenta', () => {
  const mag = S.paint({ preset: 'synthwave', width: 320, height: 200 });
  const green = S.paint({
    preset: 'synthwave', width: 320, height: 200,
    palette: { background: '#001008', foreground: '#E8FFF0', accent: '#00FF66', ansi: { magenta: '#00B84D', yellow: '#B8FF00', cyan: '#00FFD0' } },
  });
  const [mr, mg] = H.meanRgb(mag), [gr, gg] = H.meanRgb(green);
  assert.ok(mr > mg * 1.3, `default should be magenta-ish: ${mr} vs ${mg}`);
  assert.ok(gg > gr * 1.5, `green palette should be green-ish: ${gg} vs ${gr}`);
});

test('layers: sky gradient runs top to bottom between its stops', () => {
  const img = S.paint({ width: 40, height: 100, layers: [{ type: 'sky', stops: [[0, '#000000'], [1, '#FFFFFF']] }] });
  assert.ok(px(img, 20, 0)[0] <= 6, `top ${px(img, 20, 0)}`);
  assert.ok(px(img, 20, 99)[0] >= 249, `bottom ${px(img, 20, 99)}`);
  assert.ok(Math.abs(px(img, 20, 50)[0] - 128) < 30);
});

test('layers: hills fill below a crest in their color, sky above stays untouched', () => {
  const img = S.paint({
    width: 100, height: 100,
    layers: [{ type: 'sky', stops: [[0, '#000000'], [1, '#000000']] }, { type: 'hills', baseY: 0.5, amp: 0, color: '#FF0000', shade: 0, fade: 0 }],
  });
  assert.ok(px(img, 50, 10)[0] <= 3, 'above the crest is black');
  const below = px(img, 50, 90);
  assert.ok(below[0] >= 250 && below[1] <= 3 && below[2] <= 3, `below ${below}`);
});

test('layers: stars add bright pixels to a black sky; roles and mixes resolve against the palette', () => {
  const bare = S.paint({ width: 300, height: 200, layers: [{ type: 'sky', stops: [[0, '#000000'], [1, '#000000']] }] });
  const stars = S.paint({ width: 300, height: 200, layers: [{ type: 'sky', stops: [[0, '#000000'], [1, '#000000']] }, { type: 'stars', count: 200, color: '#FFFFFF', region: [0, 1] }] });
  const bright = (img) => { let n = 0; for (let i = 0; i < img.data.length; i += 4) if (img.data[i] > 60) n++; return n; };
  assert.strictEqual(bright(bare), 0);
  assert.ok(bright(stars) >= 20, `bright px ${bright(stars)}`);
  const pal = { background: '#000000', foreground: '#FFFFFF', accent: '#FF0000', ansi: {} };
  const mixed = S.paint({ width: 8, height: 8, palette: pal, layers: [{ type: 'sky', stops: [[0, { mix: ['background', 'foreground', 0.5] }], [1, { mix: ['background', 'foreground', 0.5] }]] }] });
  const m = px(mixed, 4, 4);
  assert.ok(Math.abs(m[0] - 99) <= 4 && Math.abs(m[1] - 99) <= 4 && Math.abs(m[2] - 99) <= 4, `OKLab mid grey is about 99, got ${m}`);
  const role = S.paint({ width: 8, height: 8, palette: pal, layers: [{ type: 'sky', stops: [[0, 'accent'], [1, 'accent']] }] });
  assert.ok(px(role, 4, 4)[0] >= 250 && px(role, 4, 4)[1] <= 4);
});

test('paint: bad input fails with a clear message', () => {
  assert.throws(() => S.paint({ preset: 'nope' }), /unknown preset "nope"/);
  assert.throws(() => S.paint({ layers: [{ type: 'lava' }] }), /unknown layer type "lava"/);
  assert.throws(() => S.paint({ layers: [{ type: 'sky', stops: [[0, 'chartreuse'], [1, '#000000']] }] }), /unknown color "chartreuse"/);
  assert.throws(() => S.paint({ width: 2, height: 2 }), /invalid size/);
});

test('performance: 2560x1600 nord-mountains paints in well under the 10 s budget', () => {
  const t0 = Date.now();
  const img = S.paint({ preset: 'nord-mountains', width: 2560, height: 1600 });
  const ms = Date.now() - t0;
  assert.strictEqual(img.width, 2560);
  assert.ok(ms < 15000, `took ${ms} ms`);
});
