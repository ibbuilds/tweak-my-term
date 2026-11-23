'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const png = require('../../kit/png');
const bmp = require('../../kit/bmp');
const gif = require('../../kit/gif');
const image = require('../../kit/image');
const H = require('./_helpers');

// A dark scene with one red light source, painted here so the tests own their input.
const S = require('../../kit/scene');
const redNight = () => S.paint({
  width: 480, height: 300, seed: 3,
  palette: { background: '#0B0909', foreground: '#D8D2CF', accent: '#E0201E', ansi: { red: '#B3141B' } },
  layers: [
    { type: 'sky', stops: [[0, { mix: ['background', '#000000', 0.7] }], [1, { mix: ['background', '#000000', 0.5] }]] },
    { type: 'glow', x: 0.76, y: 0.14, r: 0.3, color: 'ansi.red', opacity: 0.22 },
    { type: 'moon', x: 0.76, y: 0.14, r: 0.045, color: 'accent', glow: 0.3, glowRadius: 2.4 },
    { type: 'hills', baseY: 0.65, amp: 0.08, color: 'ink', shade: 0 },
    { type: 'hatch', wash: 0.42 },
    { type: 'grain', amount: 0.8 },
  ],
});

test('png: encode -> decode round trip is identical (incl. odd sizes)', () => {
  for (const [w, h, seed] of [[1, 1, 1], [2, 3, 2], [7, 5, 3], [33, 17, 4], [64, 64, 5], [101, 1, 6], [1, 77, 7]]) {
    const img = H.randomImage(w, h, seed);
    const buf = png.encode(img);
    const back = png.decode(buf);
    assert.strictEqual(back.width, w);
    assert.strictEqual(back.height, h);
    assert.deepStrictEqual(Buffer.from(back.data), Buffer.from(img.data), `${w}x${h}`);
  }
});

test('png: encode picks filters on structured images and CRCs validate', () => {
  const img = H.blocks(40, 40, [[5, 5, 20, 20, '#336699']], '#102030');
  const buf = png.encode(img, { level: 9 });
  assert.ok(buf.length < 40 * 40 * 4);
  assert.deepStrictEqual(Buffer.from(png.decode(buf).data), Buffer.from(img.data));
});

test('png: decode every color type / bit depth, all filters, with and without Adam7', () => {
  const W = 7, H_ = 5;
  const cases = [];
  for (const d of [1, 2, 4, 8, 16]) cases.push({ ct: 0, d });
  for (const d of [8, 16]) cases.push({ ct: 2, d }, { ct: 4, d }, { ct: 6, d });
  for (const d of [1, 2, 4, 8]) cases.push({ ct: 3, d });
  for (const { ct, d } of cases) {
    for (const interlace of [false, true]) {
      const max = (1 << d) - 1;
      const nPal = Math.min(1 << d, 16);
      const plte = [];
      for (let i = 0; i < nPal; i++) plte.push((i * 37) & 255, (i * 91 + 10) & 255, (i * 13 + 200) & 255);
      const trnsA = [];
      for (let i = 0; i < nPal; i++) trnsA.push(i % 3 === 0 ? 255 : 100 + i);
      const sample = (x, y, c) => ((x * 31 + y * 17 + c * 53 + 5) % (max + 1));
      const pix = (x, y) => {
        if (ct === 0) return [sample(x, y, 0)];
        if (ct === 2) return [sample(x, y, 0), sample(x, y, 1), sample(x, y, 2)];
        if (ct === 3) return [(x + y * 3) % nPal];
        if (ct === 4) return [sample(x, y, 0), sample(x, y, 3)];
        return [sample(x, y, 0), sample(x, y, 1), sample(x, y, 2), sample(x, y, 3)];
      };
      const buf = H.buildPng({ w: W, h: H_, depth: d, colorType: ct, pix, interlace, plte: ct === 3 ? plte : undefined, trns: ct === 3 ? trnsA : undefined });
      const got = png.decode(buf);
      assert.strictEqual(got.width, W); assert.strictEqual(got.height, H_);
      const to8 = (v) => (d === 16 ? v >> 8 : d === 8 ? v : Math.round((v * 255) / max));
      for (let y = 0; y < H_; y++) for (let x = 0; x < W; x++) {
        const p = pix(x, y);
        let exp;
        if (ct === 0) exp = [to8(p[0]), to8(p[0]), to8(p[0]), 255];
        else if (ct === 2) exp = [to8(p[0]), to8(p[1]), to8(p[2]), 255];
        else if (ct === 3) exp = [plte[p[0] * 3], plte[p[0] * 3 + 1], plte[p[0] * 3 + 2], trnsA[p[0]]];
        else if (ct === 4) exp = [to8(p[0]), to8(p[0]), to8(p[0]), to8(p[1])];
        else exp = [to8(p[0]), to8(p[1]), to8(p[2]), to8(p[3])];
        assert.deepStrictEqual(Array.from(got.data.subarray((y * W + x) * 4, (y * W + x) * 4 + 4)), exp, `ct${ct} d${d} il${interlace} @${x},${y}`);
      }
    }
  }
});

test('png: tRNS color keys for gray and RGB make matching pixels transparent', () => {
  const g = png.decode(H.buildPng({ w: 2, h: 1, depth: 8, colorType: 0, pix: (x) => [x ? 9 : 200], trns: [0, 200] }));
  assert.deepStrictEqual(Array.from(g.data), [200, 200, 200, 0, 9, 9, 9, 255]);
  const c = png.decode(H.buildPng({ w: 2, h: 1, depth: 8, colorType: 2, pix: (x) => (x ? [1, 2, 4] : [1, 2, 3]), trns: [0, 1, 0, 2, 0, 3] }));
  assert.deepStrictEqual(Array.from(c.data), [1, 2, 3, 0, 1, 2, 4, 255]);
});

test('png: bad input throws clear errors', () => {
  assert.throws(() => png.decode(Buffer.from('definitely not a png')), /bad signature/);
  const good = png.encode(H.randomImage(4, 4, 9));
  const bad = Buffer.from(good);
  bad[good.length - 20] ^= 0xff; // corrupt IDAT payload -> CRC mismatch
  assert.throws(() => png.decode(bad), /CRC/);
  assert.throws(() => png.decode(good.subarray(0, good.length - 30)), /truncated|IDAT|CRC/);
  assert.throws(() => png.encode({ width: 2, height: 2, data: new Uint8ClampedArray(3) }), /invalid image/);
});

test('png: a painted scene survives encode -> decode', () => {
  const img = png.decode(png.encode(redNight()));
  assert.ok(img.width > 0 && img.height > 0);
  assert.strictEqual(img.data.length, img.width * img.height * 4);
});

test('bmp: round trip with row padding, bottom-up files', () => {
  for (const [w, h] of [[1, 1], [3, 2], [5, 7], [8, 4]]) {
    const img = H.randomImage(w, h, w * 10 + h, true);
    const back = bmp.decode(bmp.encode(img));
    assert.deepStrictEqual(Buffer.from(back.data), Buffer.from(img.data));
  }
});

test('bmp: decodes top-down 32-bit (zero alpha treated as opaque) and 8-bit palette', () => {
  const b = Buffer.alloc(54 + 2 * 2 * 4);
  b.write('BM'); b.writeUInt32LE(b.length, 2); b.writeUInt32LE(54, 10); b.writeUInt32LE(40, 14);
  b.writeInt32LE(2, 18); b.writeInt32LE(-2, 22); b.writeUInt16LE(1, 26); b.writeUInt16LE(32, 28);
  // top row: red, green; bottom row: blue, white (BGRA)
  Buffer.from([0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0]).copy(b, 54);
  const img = bmp.decode(b);
  assert.deepStrictEqual(Array.from(img.data), [255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255]);

  const p = Buffer.alloc(54 + 4 * 2 + 4 * 1);
  p.write('BM'); p.writeUInt32LE(54 + 8, 10); p.writeUInt32LE(40, 14);
  p.writeInt32LE(2, 18); p.writeInt32LE(1, 22); p.writeUInt16LE(1, 26); p.writeUInt16LE(8, 28); p.writeUInt32LE(2, 46);
  Buffer.from([0, 0, 255, 0, 255, 0, 0, 0]).copy(p, 54); // palette: red, blue (BGRA)
  Buffer.from([0, 1, 0, 0]).copy(p, 62);
  assert.deepStrictEqual(Array.from(bmp.decode(p).data), [255, 0, 0, 255, 0, 0, 255, 255]);
  assert.throws(() => bmp.decode(Buffer.from('nope')), /BMP/);
});

test('gif: decodes palette frame, interlaced frame, local palette and transparency', () => {
  const w = 13, h = 11;
  const r = H.rng(5);
  const palette = Array.from({ length: 16 }, (_, i) => [i * 16, 255 - i * 16, (i * 77) & 255]);
  const idx = new Uint8Array(w * h);
  for (let i = 0; i < idx.length; i++) idx[i] = i < 40 ? 3 : Math.floor(r() * 16); // flat run exercises the KwKwK case
  const check = (img, pal, transparent) => {
    assert.strictEqual(img.width, w); assert.strictEqual(img.height, h);
    for (let i = 0; i < idx.length; i++) {
      const o = i * 4;
      if (transparent !== undefined && idx[i] === transparent) { assert.strictEqual(img.data[o + 3], 0); continue; }
      assert.deepStrictEqual(Array.from(img.data.subarray(o, o + 4)), [...pal[idx[i]], 255], `pixel ${i}`);
    }
  };
  check(gif.decodeFirstFrame(H.buildGif({ w, h, palette, frames: [{ idx }] })), palette);
  check(gif.decodeFirstFrame(H.buildGif({ w, h, palette, frames: [{ idx, interlaced: true }] })), palette);
  const local = palette.map((c) => [c[2], c[0], c[1]]);
  check(gif.decodeFirstFrame(H.buildGif({ w, h, palette, frames: [{ idx, localPalette: local }] })), local);
  check(gif.decodeFirstFrame(H.buildGif({ w, h, palette, frames: [{ idx, transparent: 3 }] })), palette, 3);
});

test('gif: large image grows LZW code size to 12 bits; frameCount counts frames', () => {
  const w = 60, h = 60, r = H.rng(11);
  const idx = new Uint8Array(w * h);
  for (let i = 0; i < idx.length; i++) idx[i] = Math.floor(r() * 4);
  const palette = [[0, 0, 0], [255, 0, 0], [0, 255, 0], [0, 0, 255]];
  const buf = H.buildGif({ w, h, palette, frames: [{ idx }, { idx }, { idx }] });
  assert.strictEqual(gif.frameCount(buf), 3);
  const img = gif.decodeFirstFrame(buf);
  for (let i = 0; i < idx.length; i++) assert.deepStrictEqual(Array.from(img.data.subarray(i * 4, i * 4 + 3)), palette[idx[i]]);
  assert.throws(() => gif.decodeFirstFrame(Buffer.from('GIF nope')), /GIF/);
});

test('image: load dispatches on magic bytes; save picks png/bmp by extension', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-kit-test-'));
  try {
    const img = H.randomImage(9, 6, 21, true);
    for (const ext of ['png', 'bmp']) {
      const p = path.join(dir, 'x.' + ext);
      image.save(img, p);
      assert.deepStrictEqual(Buffer.from(image.load(p).data), Buffer.from(img.data));
    }
    // extension is irrelevant: load by magic bytes
    fs.copyFileSync(path.join(dir, 'x.png'), path.join(dir, 'looks-like.jpg'));
    assert.strictEqual(image.load(path.join(dir, 'looks-like.jpg')).width, 9);
    const g = path.join(dir, 'x.gif');
    fs.writeFileSync(g, H.buildGif({ w: 2, h: 2, palette: [[1, 2, 3], [4, 5, 6]], frames: [{ idx: Uint8Array.from([0, 1, 1, 0]) }] }));
    assert.deepStrictEqual(Array.from(image.load(g).data.subarray(0, 4)), [1, 2, 3, 255]);
    assert.throws(() => image.save(img, path.join(dir, 'x.tiff')), /unsupported extension/);
    assert.throws(() => image.load(path.join(dir, 'missing.png')), /Cannot read/);
    fs.writeFileSync(path.join(dir, 'junk.webp'), Buffer.from('not an image at all'));
    assert.throws(() => image.load(path.join(dir, 'junk.webp')), /Cannot decode/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
