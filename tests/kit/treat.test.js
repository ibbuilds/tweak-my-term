'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const T = require('../../kit/treat');
const P = require('../../kit/palette');
const K = require('../../kit/contrast');
const R = require('../../kit/raster');
const S = require('../../kit/scene');
const H = require('./_helpers');

const LOOK = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'look.json'), 'utf8'));
const px = (img, x, y) => Array.from(img.data.subarray((y * img.width + x) * 4, (y * img.width + x) * 4 + 4));
const meanLuma = (img) => R.stats(img).mean;
const imageRow = (pal, img, opacity) => K.report(T.normalizePalette(pal), { image: img, opacity }).find((x) => x.pair.startsWith('foreground/image'));

test('fit cover: crops to the aspect, honoring alignment', () => {
  const src = H.blocks(400, 200, [[0, 0, 200, 200, '#FF0000'], [200, 0, 200, 200, '#0000FF']]);
  const mid = T.fit(src, 100, 100);
  assert.deepStrictEqual([mid.width, mid.height], [100, 100]);
  assert.deepStrictEqual(px(mid, 10, 50), [255, 0, 0, 255]);
  assert.deepStrictEqual(px(mid, 90, 50), [0, 0, 255, 255]);
  const left = T.fit(src, 100, 100, { align: 'left' });
  assert.deepStrictEqual(px(left, 90, 50), [255, 0, 0, 255]);
  const right = T.fit(src, 100, 100, { align: 'topRight' });
  assert.deepStrictEqual(px(right, 10, 50), [0, 0, 255, 255]);
});

test('fit contain: letterboxes onto the background color', () => {
  const src = H.flat(200, 100, '#FF0000');
  const out = T.fit(src, 100, 100, { mode: 'contain', background: '#112233' });
  assert.deepStrictEqual(px(out, 50, 2), [0x11, 0x22, 0x33, 255]);
  assert.deepStrictEqual(px(out, 50, 50), [255, 0, 0, 255]);
  assert.throws(() => T.fit(src, 100, 100, { mode: 'stretch' }), /unknown mode/);
});

test('dim removes the given fraction of light; vignette darkens corners only', () => {
  const grey = H.flat(40, 40, '#C8C8C8');
  assert.deepStrictEqual(px(T.dim(grey, 0.5), 5, 5), [100, 100, 100, 255]);
  assert.ok(meanLuma(T.dim(grey, 0.3)) < meanLuma(grey));
  assert.deepStrictEqual(px(T.dim(grey, 0), 5, 5), [200, 200, 200, 255]);
  assert.throws(() => T.dim(grey, 1.5), /dim amount must be a number from 0 to 1/);
  const v = T.vignette(grey, 0.8);
  assert.ok(px(v, 0, 0)[0] < 100, `corner ${px(v, 0, 0)}`);
  assert.ok(px(v, 20, 20)[0] >= 198, `center ${px(v, 20, 20)}`);
});

test('blur smooths an edge but leaves far pixels alone', () => {
  const edge = H.blocks(60, 10, [[30, 0, 30, 10, '#FFFFFF']]);
  const b = T.blur(edge, 3);
  assert.strictEqual(px(b, 2, 5)[0], 0);
  assert.strictEqual(px(b, 57, 5)[0], 255);
  const at = px(b, 30, 5)[0];
  assert.ok(at > 60 && at < 200, `edge pixel ${at}`);
  assert.ok(px(b, 27, 5)[0] > 0 && px(b, 27, 5)[0] < at);
});

test('bloom brightens around a bright spot; pixelate makes constant blocks; scanlines alternate rows', () => {
  const dot = H.blocks(40, 40, [[18, 18, 4, 4, '#FFFFFF']]);
  const b = T.bloom(dot, 1, { radius: 4, threshold: 0.5 });
  assert.ok(px(b, 14, 20)[0] > 0, 'glow reaches a few pixels away');
  assert.strictEqual(px(b, 2, 2)[0], 0);
  const noisy = H.randomImage(16, 16, 9, true);
  const p = T.pixelate(noisy, 4);
  assert.deepStrictEqual(px(p, 0, 0), px(p, 3, 3));
  assert.deepStrictEqual(px(p, 4, 4), px(p, 7, 7));
  const s = T.scanlines(H.flat(4, 4, '#FFFFFF'), 0.5, 2);
  assert.deepStrictEqual([px(s, 0, 0)[0], px(s, 0, 1)[0], px(s, 0, 2)[0], px(s, 0, 3)[0]], [255, 128, 255, 128]);
});

test('tint mixes toward a color; quantize leaves only palette colors', () => {
  assert.deepStrictEqual(px(T.tint(H.flat(2, 2, '#FFFFFF'), '#000000', 0.5), 0, 0), [128, 128, 128, 255]);
  const q = T.quantize(H.randomImage(30, 30, 4, true), ['#000000', '#FFFFFF', '#FF0000']);
  const seen = new Set();
  for (let i = 0; i < q.data.length; i += 4) seen.add(`${q.data[i]},${q.data[i + 1]},${q.data[i + 2]}`);
  for (const c of seen) assert.ok(['0,0,0', '255,255,255', '255,0,0'].includes(c), c);
  assert.ok(seen.size >= 2);
  const fromLook = T.quantize(H.randomImage(20, 20, 2, true), LOOK.palette);
  const allowed = new Set(T.paletteHexes(LOOK.palette));
  for (let i = 0; i < fromLook.data.length; i += 4) {
    assert.ok(allowed.has('#' + [0, 1, 2].map((k) => fromLook.data[i + k].toString(16).padStart(2, '0')).join('').toUpperCase()));
  }
});

test('asciiGlyphs: same size, glyphs change pixels where there is tone, flat areas stay put', () => {
  const grad = H.flat(140, 140, '#000000');
  for (let y = 0; y < 140; y++) {
    for (let x = 0; x < 140; x++) { const v = Math.round((x / 139) * 255), o = (y * 140 + x) * 4; grad.data[o] = v; grad.data[o + 1] = v; grad.data[o + 2] = v; }
  }
  const out = T.asciiGlyphs(grad, { alpha: 0.8 });
  assert.deepStrictEqual([out.width, out.height], [140, 140]);
  let changed = 0;
  for (let i = 0; i < out.data.length; i += 4) if (out.data[i] !== grad.data[i]) changed++;
  assert.ok(changed > 500, `changed ${changed}`);
  const flat = H.flat(70, 70, '#303030');
  const f = T.asciiGlyphs(flat, { rowGap: 0 });
  assert.deepStrictEqual(Buffer.from(f.data), Buffer.from(flat.data));
});

test('parseStep / apply: look-spec strings and objects, in order', () => {
  assert.deepStrictEqual(T.parseStep('dim:0.66'), { op: 'dim', amount: 0.66 });
  assert.deepStrictEqual(T.parseStep('ascii-glyphs:95'), { op: 'ascii-glyphs', alpha: 95 });
  assert.deepStrictEqual(T.parseStep('vignette'), { op: 'vignette' });
  assert.deepStrictEqual(T.parseStep('fit:100x50'), { op: 'fit', width: 100, height: 50 });
  assert.throws(() => T.parseStep('sparkle:3'), /Unknown treatment "sparkle"/);
  assert.throws(() => T.apply(H.flat(4, 4, '#FFFFFF'), [{ op: 'quantize' }]), /needs a palette/);
  const src = H.flat(80, 40, '#FFFFFF');
  const out = T.apply(src, [{ op: 'fit', width: 40, height: 40 }, { op: 'dim', amount: 0.6 }]);
  assert.deepStrictEqual([out.width, out.height], [40, 40]);
  assert.deepStrictEqual(px(out, 20, 20), [102, 102, 102, 255]);
  const img = S.paint({ preset: 'synthwave', width: 140, height: 140 });
  const treated = T.apply(img, LOOK.background.treatment, { palette: LOOK.palette });
  assert.ok(meanLuma(treated) < meanLuma(img), 'the fixture treatment darkens');
  const wash = T.apply(src, [{ op: 'tint', color: 'background', amount: 1 }], { palette: LOOK.palette });
  assert.deepStrictEqual(px(wash, 1, 1), [0x0b, 0x09, 0x09, 255]);
});

test('forText (dark palette): a bright busy image is dimmed until contrast.report passes, ANSI colors included', () => {
  const img = H.randomImage(240, 160, 5, true);
  assert.ok(!imageRow(LOOK.palette, img, 1).ok, 'the raw image would not pass');
  const r = T.forText(img, LOOK.palette, { opacity: 1 });
  assert.ok(r.dim > 0, 'needed dimming');
  assert.ok(meanLuma(r.image) < meanLuma(img));
  assert.deepStrictEqual([r.image.width, r.image.height], [240, 160]);
  assert.strictEqual(r.ok, true);
  assert.ok(imageRow(LOOK.palette, r.image, 1).ok, 'foreground over the treated image');
  assert.deepStrictEqual(r.failing, []);
  assert.ok(r.report.find((x) => x.pair.startsWith('foreground/image')).ok);
});

test('forText: leaves a readable image alone; a faint overlay needs no dimming', () => {
  const dark = H.flat(100, 60, '#101010');
  const same = T.forText(dark, LOOK.palette, { opacity: 1 });
  assert.strictEqual(same.dim, 0);
  assert.strictEqual(same.blur, 0);
  assert.strictEqual(same.ok, true);
  assert.deepStrictEqual(Buffer.from(same.image.data), Buffer.from(dark.data));
  const faint = T.forText(H.randomImage(100, 60, 6, true), LOOK.palette, { opacity: 0.05 });
  assert.strictEqual(faint.dim, 0);
  assert.strictEqual(faint.ok, true);
});

test('forText (light palette): washes toward the background instead of darkening', () => {
  const img = H.randomImage(200, 120, 8, true);
  const pal = K.fix(P.scheme(P.extract(S.paint({ preset: 'minimal-gradient', width: 100, height: 60 })), { mode: 'light' })).palette;
  const r = T.forText(img, pal, { opacity: 1 });
  assert.ok(r.steps.some((s) => s.op === 'tint'), JSON.stringify(r.steps));
  assert.ok(meanLuma(r.image) >= meanLuma(img) * 0.9, 'not darker than the input');
  assert.strictEqual(r.ok, true, JSON.stringify(r.failing));
});

test('forText: reports honestly when no amount of dimming can help', () => {
  const dull = '#1B1B1B';
  const pal = { background: '#101010', foreground: '#1C1C1C', ansi: { black: '#000000', red: dull, green: dull, yellow: dull, blue: dull, magenta: dull, cyan: dull, white: dull } };
  const r = T.forText(H.flat(60, 40, '#808080'), pal, { opacity: 1 });
  assert.strictEqual(r.ok, false);
  assert.ok(r.failing.some((f) => f.color === 'foreground'));
  assert.strictEqual(r.dim, 0.96);
});

test('normalizePalette: fills optional colors, rejects a palette without ANSI; paletteHexes lists the colors', () => {
  const p = T.normalizePalette({ background: '#000000', foreground: '#ffffff', ansi: LOOK.palette.ansi });
  assert.strictEqual(p.foreground, '#FFFFFF');
  assert.strictEqual(p.accent, LOOK.palette.ansi.blue);
  assert.strictEqual(p.cursor, p.accent);
  assert.match(p.selectionBackground, /^#[0-9A-F]{6}$/);
  assert.throws(() => T.normalizePalette({ background: '#000000', foreground: '#ffffff', ansi: {} }), /palette\.ansi\.black is missing/);
  const hexes = T.paletteHexes(LOOK.palette);
  assert.ok(hexes.includes('#0B0909') && hexes.includes('#D8D2CF') && hexes.includes('#F2EEEA'));
  assert.strictEqual(new Set(hexes).size, hexes.length);
});
