'use strict';
// Test helpers: seeded RNG, image builders, and raw PNG / GIF writers (independent of kit/ encoders).
const zlib = require('zlib');
const png = require('../../kit/png');

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomImage(w, h, seed = 1, opaque = false) {
  const r = rng(seed);
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < data.length; i++) data[i] = Math.floor(r() * 256);
  if (opaque) for (let i = 3; i < data.length; i += 4) data[i] = 255;
  return { width: w, height: h, data };
}

function flat(w, h, hex) {
  const v = parseInt(hex.slice(1), 16);
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < data.length; i += 4) { data[i] = v >> 16; data[i + 1] = (v >> 8) & 255; data[i + 2] = v & 255; data[i + 3] = 255; }
  return { width: w, height: h, data };
}

// Fills rectangular regions: blocks = [[x, y, w, h, hex], ...]
function blocks(w, h, list, bg = '#000000') {
  const img = flat(w, h, bg);
  for (const [x0, y0, bw, bh, hex] of list) {
    const v = parseInt(hex.slice(1), 16);
    for (let y = y0; y < y0 + bh; y++) for (let x = x0; x < x0 + bw; x++) {
      const o = (y * w + x) * 4;
      img.data[o] = v >> 16; img.data[o + 1] = (v >> 8) & 255; img.data[o + 2] = v & 255;
    }
  }
  return img;
}

function meanRgb(img) {
  const s = [0, 0, 0];
  const n = img.width * img.height;
  for (let i = 0; i < img.data.length; i += 4) { s[0] += img.data[i]; s[1] += img.data[i + 1]; s[2] += img.data[i + 2]; }
  return s.map((v) => v / n);
}

// ---- raw PNG builder -------------------------------------------------------
const ADAM7 = [[0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2]];

function packRow(samples, depth) { // samples: flat list of channel values at `depth` bits
  if (depth === 8) return Buffer.from(samples);
  if (depth === 16) { const b = Buffer.alloc(samples.length * 2); samples.forEach((v, i) => b.writeUInt16BE(v, i * 2)); return b; }
  const b = Buffer.alloc(Math.ceil((samples.length * depth) / 8));
  samples.forEach((v, i) => { const bit = i * depth; b[bit >> 3] |= v << (8 - depth - (bit & 7)); });
  return b;
}

function filterRow(type, cur, prev, bpp) {
  const out = Buffer.alloc(cur.length);
  for (let i = 0; i < cur.length; i++) {
    const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
    let p = 0;
    if (type === 1) p = a;
    else if (type === 2) p = b;
    else if (type === 3) p = (a + b) >> 1;
    else if (type === 4) {
      const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c);
      p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    }
    out[i] = (cur[i] - p) & 255;
  }
  return out;
}

function rawChunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'latin1');
  data.copy(out, 8);
  out.writeUInt32BE(png.crc32(out, 4, 8 + data.length), 8 + data.length);
  return out;
}

// pix(x, y) -> array of channel sample values at `depth`.
function buildPng({ w, h, depth, colorType, pix, interlace = false, plte, trns, filters = [0, 1, 2, 3, 4] }) {
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  const bpp = Math.max(1, (ch * depth) >> 3);
  const passes = interlace ? ADAM7 : [[0, 0, 1, 1]];
  const parts = [];
  let rowNo = 0;
  for (const [x0, y0, dx, dy] of passes) {
    let prev = null;
    for (let y = y0; y < h; y += dy) {
      const samples = [];
      for (let x = x0; x < w; x += dx) samples.push(...pix(x, y));
      if (!samples.length) continue;
      const cur = packRow(samples, depth);
      const f = filters[rowNo++ % filters.length];
      parts.push(Buffer.from([f]), filterRow(f, cur, prev || Buffer.alloc(cur.length), bpp));
      prev = cur;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = depth; ihdr[9] = colorType; ihdr[12] = interlace ? 1 : 0;
  const chunks = [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), rawChunk('IHDR', ihdr)];
  if (plte) chunks.push(rawChunk('PLTE', Buffer.from(plte)));
  if (trns) chunks.push(rawChunk('tRNS', Buffer.from(trns)));
  chunks.push(rawChunk('IDAT', zlib.deflateSync(Buffer.concat(parts))), rawChunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(chunks);
}

// ---- GIF builder -----------------------------------------------------------
function lzwEncode(idx, minCode) {
  const clear = 1 << minCode, eoi = clear + 1;
  let size = minCode + 1, next = eoi + 1;
  const dict = new Map();
  const bytes = [];
  let acc = 0, bits = 0;
  const emit = (code) => {
    acc |= code << bits; bits += size;
    while (bits >= 8) { bytes.push(acc & 255); acc >>>= 8; bits -= 8; }
  };
  emit(clear);
  let cur = idx[0];
  for (let i = 1; i < idx.length; i++) {
    const k = idx[i], key = (cur << 8) | k;
    if (dict.has(key)) { cur = dict.get(key); continue; }
    if (next - 1 === 1 << size && size < 12) size++;
    emit(cur);
    dict.set(key, next++);
    cur = k;
  }
  if (next - 1 === 1 << size && size < 12) size++;
  emit(cur);
  emit(eoi);
  if (bits) bytes.push(acc & 255);
  const out = [];
  for (let i = 0; i < bytes.length; i += 255) { const part = bytes.slice(i, i + 255); out.push(part.length, ...part); }
  out.push(0);
  return Buffer.from(out);
}

// frames: [{ idx: Uint8Array(w*h), interlaced?, localPalette?, transparent? (index) }]
function buildGif({ w, h, palette, frames }) {
  const bitsFor = (n) => Math.max(1, Math.ceil(Math.log2(n)));
  const gb = bitsFor(palette.length);
  const hdr = Buffer.alloc(13);
  hdr.write('GIF89a', 0, 'latin1');
  hdr.writeUInt16LE(w, 6); hdr.writeUInt16LE(h, 8);
  hdr[10] = 0x80 | (gb - 1);
  const gct = Buffer.alloc(3 << gb);
  palette.forEach((c, i) => gct.set(c, i * 3));
  const parts = [hdr, gct];
  for (const f of frames) {
    if (f.transparent !== undefined) parts.push(Buffer.from([0x21, 0xf9, 4, 1, 0, 0, f.transparent, 0]));
    const pal = f.localPalette;
    const lb = pal ? bitsFor(pal.length) : 0;
    const desc = Buffer.alloc(10);
    desc[0] = 0x2c; desc.writeUInt16LE(w, 5); desc.writeUInt16LE(h, 7);
    desc[9] = (pal ? 0x80 | (lb - 1) : 0) | (f.interlaced ? 0x40 : 0);
    parts.push(desc);
    if (pal) { const t = Buffer.alloc(3 << lb); pal.forEach((c, i) => t.set(c, i * 3)); parts.push(t); }
    let idx = f.idx;
    if (f.interlaced) {
      const order = [];
      for (const [s, st] of [[0, 8], [4, 8], [2, 4], [1, 2]]) for (let y = s; y < h; y += st) order.push(y);
      idx = new Uint8Array(w * h);
      order.forEach((y, r) => idx.set(f.idx.subarray(y * w, (y + 1) * w), r * w));
    }
    const minCode = Math.max(2, pal ? lb : gb);
    parts.push(Buffer.from([minCode]), lzwEncode(idx, minCode));
  }
  parts.push(Buffer.from([0x3b]));
  return Buffer.concat(parts);
}

module.exports = { rng, randomImage, flat, blocks, meanRgb, buildPng, buildGif };
