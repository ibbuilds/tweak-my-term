'use strict';
// Minimal PNG codec (zero dependencies). Image = { width, height, data: Uint8ClampedArray RGBA }.
const zlib = require('zlib');

const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

let CRC_TABLE = null;
function crc32(buf, start = 0, end = buf.length) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let c = -1;
  for (let i = start; i < end; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
const VALID_DEPTHS = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };

const ADAM7 = [
  [0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2],
]; // [xStart, yStart, xStep, yStep]

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

// Unfilters in place inside `raw`; rows are laid out as [filter][bytes]. Returns offset past the pass.
function unfilter(raw, off, rowBytes, rows, bpp) {
  let prev = -1;
  for (let y = 0; y < rows; y++) {
    const ft = raw[off];
    const row = off + 1;
    if (ft > 4) throw new Error(`PNG: invalid filter type ${ft} on row ${y}`);
    if (ft === 1) {
      for (let i = bpp; i < rowBytes; i++) raw[row + i] = (raw[row + i] + raw[row + i - bpp]) & 255;
    } else if (ft === 2) {
      if (prev >= 0) for (let i = 0; i < rowBytes; i++) raw[row + i] = (raw[row + i] + raw[prev + i]) & 255;
    } else if (ft === 3) {
      for (let i = 0; i < rowBytes; i++) {
        const l = i >= bpp ? raw[row + i - bpp] : 0;
        const u = prev >= 0 ? raw[prev + i] : 0;
        raw[row + i] = (raw[row + i] + ((l + u) >> 1)) & 255;
      }
    } else if (ft === 4) {
      for (let i = 0; i < rowBytes; i++) {
        const l = i >= bpp ? raw[row + i - bpp] : 0;
        const u = prev >= 0 ? raw[prev + i] : 0;
        const ul = i >= bpp && prev >= 0 ? raw[prev + i - bpp] : 0;
        raw[row + i] = (raw[row + i] + paeth(l, u, ul)) & 255;
      }
    }
    prev = row;
    off += rowBytes + 1;
  }
  return off;
}

function decode(buf) {
  if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
  if (buf.length < 8 || !buf.subarray(0, 8).equals(SIG)) throw new Error('PNG: bad signature (not a PNG file)');
  let pos = 8;
  let ihdr = null, plte = null, trns = null;
  const idat = [];
  let sawEnd = false;
  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('latin1', pos + 4, pos + 8);
    const dStart = pos + 8, dEnd = dStart + len;
    if (dEnd + 4 > buf.length) throw new Error(`PNG: truncated ${type} chunk`);
    const crc = buf.readUInt32BE(dEnd);
    if (crc32(buf, pos + 4, dEnd) !== crc) throw new Error(`PNG: CRC mismatch in ${type} chunk`);
    const data = buf.subarray(dStart, dEnd);
    if (type === 'IHDR') {
      if (len !== 13) throw new Error('PNG: bad IHDR length');
      ihdr = {
        width: data.readUInt32BE(0), height: data.readUInt32BE(4),
        depth: data[8], colorType: data[9], compression: data[10], filter: data[11], interlace: data[12],
      };
    } else if (type === 'PLTE') plte = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') { sawEnd = true; break; }
    pos = dEnd + 4;
  }
  if (!ihdr) throw new Error('PNG: missing IHDR');
  if (!idat.length) throw new Error('PNG: missing IDAT' + (sawEnd ? '' : ' (truncated file?)'));
  const { width, height, depth, colorType, interlace } = ihdr;
  if (!width || !height) throw new Error('PNG: zero-sized image');
  if (width * height > 1 << 28) throw new Error('PNG: image too large');
  if (!(colorType in CHANNELS)) throw new Error(`PNG: unsupported color type ${colorType}`);
  if (!VALID_DEPTHS[colorType].includes(depth)) throw new Error(`PNG: invalid bit depth ${depth} for color type ${colorType}`);
  if (ihdr.compression !== 0 || ihdr.filter !== 0) throw new Error('PNG: unsupported compression/filter method');
  if (interlace !== 0 && interlace !== 1) throw new Error(`PNG: unsupported interlace method ${interlace}`);
  if (colorType === 3 && !plte) throw new Error('PNG: palette image without PLTE');

  let raw;
  try { raw = zlib.inflateSync(Buffer.concat(idat)); } catch (e) { throw new Error('PNG: corrupt image data (' + e.message + ')'); }

  const ch = CHANNELS[colorType];
  const bitsPerPixel = ch * depth;
  const bpp = Math.max(1, bitsPerPixel >> 3);
  const out = new Uint8ClampedArray(width * height * 4);

  // transparency keys
  let tGray = -1, tR = -1, tG = -1, tB = -1;
  if (trns && colorType === 0 && trns.length >= 2) tGray = trns.readUInt16BE(0);
  if (trns && colorType === 2 && trns.length >= 6) { tR = trns.readUInt16BE(0); tG = trns.readUInt16BE(2); tB = trns.readUInt16BE(4); }
  const maxv = (1 << Math.min(depth, 8)) - 1;

  const passes = interlace ? ADAM7 : [[0, 0, 1, 1]];
  let off = 0;
  for (const [x0, y0, dx, dy] of passes) {
    const pw = Math.ceil((width - x0) / dx), ph = Math.ceil((height - y0) / dy);
    if (pw <= 0 || ph <= 0) continue;
    const rowBytes = Math.ceil((pw * bitsPerPixel) / 8);
    const need = (rowBytes + 1) * ph;
    if (off + need > raw.length) throw new Error('PNG: image data too short');
    const start = off;
    off = unfilter(raw, off, rowBytes, ph, bpp);
    for (let py = 0; py < ph; py++) {
      const row = start + py * (rowBytes + 1) + 1;
      const y = y0 + py * dy;
      for (let px = 0; px < pw; px++) {
        const x = x0 + px * dx;
        const o = (y * width + x) * 4;
        let r, g, b, a = 255;
        if (depth === 8) {
          const i = row + px * ch;
          if (colorType === 6) { r = raw[i]; g = raw[i + 1]; b = raw[i + 2]; a = raw[i + 3]; }
          else if (colorType === 2) {
            r = raw[i]; g = raw[i + 1]; b = raw[i + 2];
            if (tR >= 0 && r === tR && g === tG && b === tB) a = 0;
          } else if (colorType === 0) { r = g = b = raw[i]; if (r === tGray) a = 0; }
          else if (colorType === 4) { r = g = b = raw[i]; a = raw[i + 1]; }
          else { // palette 8
            const idx = raw[i];
            if (idx * 3 + 2 >= plte.length) throw new Error('PNG: palette index out of range');
            r = plte[idx * 3]; g = plte[idx * 3 + 1]; b = plte[idx * 3 + 2];
            a = trns && idx < trns.length ? trns[idx] : 255;
          }
        } else if (depth === 16) {
          const i = row + px * ch * 2;
          if (colorType === 6) { r = raw[i]; g = raw[i + 2]; b = raw[i + 4]; a = raw[i + 6]; }
          else if (colorType === 2) {
            r = raw[i]; g = raw[i + 2]; b = raw[i + 4];
            if (tR >= 0 && ((raw[i] << 8) | raw[i + 1]) === tR && ((raw[i + 2] << 8) | raw[i + 3]) === tG && ((raw[i + 4] << 8) | raw[i + 5]) === tB) a = 0;
          } else if (colorType === 0) {
            r = g = b = raw[i];
            if (((raw[i] << 8) | raw[i + 1]) === tGray) a = 0;
          } else { r = g = b = raw[i]; a = raw[i + 2]; }
        } else { // 1, 2, 4 bit: gray or palette
          const bit = px * depth;
          const v = (raw[row + (bit >> 3)] >> (8 - depth - (bit & 7))) & maxv;
          if (colorType === 0) {
            r = g = b = Math.round((v * 255) / maxv);
            if (v === tGray) a = 0;
          } else {
            if (v * 3 + 2 >= plte.length) throw new Error('PNG: palette index out of range');
            r = plte[v * 3]; g = plte[v * 3 + 1]; b = plte[v * 3 + 2];
            a = trns && v < trns.length ? trns[v] : 255;
          }
        }
        out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = a;
      }
    }
  }
  return { width, height, data: out };
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'latin1');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out, 4, 8 + data.length), 8 + data.length);
  return out;
}

function encode(img, { level = 6 } = {}) {
  const { width, height, data } = img || {};
  if (!width || !height || !data || data.length !== width * height * 4) {
    throw new Error('PNG encode: invalid image (need width, height and RGBA data of matching length)');
  }
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  const cand = [0, 1, 2, 3, 4].map(() => Buffer.alloc(stride));
  const zero = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const cur = data.subarray(y * stride, (y + 1) * stride);
    const prev = y ? data.subarray((y - 1) * stride, y * stride) : zero;
    const sums = [0, 0, 0, 0, 0];
    for (let i = 0; i < stride; i++) {
      const x = cur[i];
      const a = i >= 4 ? cur[i - 4] : 0, b = prev[i], c = i >= 4 ? prev[i - 4] : 0;
      const v1 = (x - a) & 255;
      const v2 = (x - b) & 255;
      const v3 = (x - ((a + b) >> 1)) & 255;
      const v4 = (x - paeth(a, b, c)) & 255;
      cand[0][i] = x; cand[1][i] = v1; cand[2][i] = v2; cand[3][i] = v3; cand[4][i] = v4;
      sums[0] += x < 128 ? x : 256 - x;
      sums[1] += v1 < 128 ? v1 : 256 - v1;
      sums[2] += v2 < 128 ? v2 : 256 - v2;
      sums[3] += v3 < 128 ? v3 : 256 - v3;
      sums[4] += v4 < 128 ? v4 : 256 - v4;
    }
    let best = 0;
    for (let f = 1; f < 5; f++) if (sums[f] < sums[best]) best = f;
    const o = y * (stride + 1);
    raw[o] = best;
    cand[best].copy(raw, o + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([SIG, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level })), chunk('IEND', Buffer.alloc(0))]);
}

module.exports = { decode, encode, crc32 };
