'use strict';
// BMP codec. decode: 8/24/32-bit uncompressed (and BITFIELDS 32/16), bottom-up or top-down. encode: 24-bit.

function decode(buf) {
  if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
  if (buf.length < 26 || buf[0] !== 0x42 || buf[1] !== 0x4d) throw new Error('BMP: bad signature (not a BMP file)');
  const dataOff = buf.readUInt32LE(10);
  const hdrSize = buf.readUInt32LE(14);
  let width, height, bpp, compression = 0, colorsUsed = 0;
  if (hdrSize === 12) {
    width = buf.readUInt16LE(18); height = buf.readUInt16LE(20); bpp = buf.readUInt16LE(24);
  } else if (hdrSize >= 40) {
    width = buf.readInt32LE(18); height = buf.readInt32LE(22); bpp = buf.readUInt16LE(28);
    compression = buf.readUInt32LE(30); colorsUsed = buf.readUInt32LE(46);
  } else throw new Error(`BMP: unsupported header size ${hdrSize}`);
  const topDown = height < 0;
  height = Math.abs(height);
  if (width <= 0 || !height) throw new Error('BMP: invalid dimensions');
  if (width * height > 1 << 28) throw new Error('BMP: image too large');
  if (compression !== 0 && compression !== 3) throw new Error(`BMP: unsupported compression ${compression} (only uncompressed)`);
  if (![8, 16, 24, 32].includes(bpp)) throw new Error(`BMP: unsupported bit depth ${bpp} (need 8, 16, 24 or 32)`);

  let palette = null;
  if (bpp === 8) {
    const n = colorsUsed || 256;
    const entry = hdrSize === 12 ? 3 : 4;
    palette = [];
    for (let i = 0; i < n; i++) {
      const p = 14 + hdrSize + i * entry;
      if (p + 2 >= buf.length) break;
      palette.push([buf[p + 2], buf[p + 1], buf[p]]);
    }
  }
  let masks = null;
  if (compression === 3 && (bpp === 16 || bpp === 32)) {
    if (hdrSize < 52 && 14 + hdrSize + 12 > buf.length) throw new Error('BMP: missing bitfield masks');
    const m = hdrSize >= 52 ? 54 : 14 + hdrSize;
    masks = [buf.readUInt32LE(m), buf.readUInt32LE(m + 4), buf.readUInt32LE(m + 8), hdrSize >= 56 ? buf.readUInt32LE(m + 12) : 0];
  } else if (bpp === 16) masks = [0x7c00, 0x03e0, 0x001f, 0];

  const rowSize = Math.floor((bpp * width + 31) / 32) * 4;
  if (dataOff + rowSize * height > buf.length + 3) throw new Error('BMP: pixel data truncated');
  const out = new Uint8ClampedArray(width * height * 4);
  let anyAlpha = false;
  const chan = (v, mask) => {
    if (!mask) return 255;
    let shift = 0, m = mask;
    while (!(m & 1)) { m >>>= 1; shift++; }
    return Math.round((((v & mask) >>> shift) * 255) / m);
  };
  for (let y = 0; y < height; y++) {
    const srcY = topDown ? y : height - 1 - y;
    const row = dataOff + srcY * rowSize;
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      if (bpp === 24) {
        const p = row + x * 3;
        out[o] = buf[p + 2]; out[o + 1] = buf[p + 1]; out[o + 2] = buf[p]; out[o + 3] = 255;
      } else if (bpp === 32) {
        const p = row + x * 4;
        if (masks) {
          const v = buf.readUInt32LE(p);
          out[o] = chan(v, masks[0]); out[o + 1] = chan(v, masks[1]); out[o + 2] = chan(v, masks[2]);
          out[o + 3] = masks[3] ? chan(v, masks[3]) : 255;
        } else {
          out[o] = buf[p + 2]; out[o + 1] = buf[p + 1]; out[o + 2] = buf[p]; out[o + 3] = buf[p + 3];
        }
        if (out[o + 3]) anyAlpha = true;
      } else if (bpp === 16) {
        const v = buf.readUInt16LE(row + x * 2);
        out[o] = chan(v, masks[0]); out[o + 1] = chan(v, masks[1]); out[o + 2] = chan(v, masks[2]); out[o + 3] = 255;
      } else {
        const c = palette[buf[row + x]] || [0, 0, 0];
        out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = 255;
      }
    }
  }
  // 32-bit BI_RGB files commonly carry an unused (zero) alpha byte: treat as opaque.
  if (bpp === 32 && !masks && !anyAlpha) for (let i = 3; i < out.length; i += 4) out[i] = 255;
  return { width, height, data: out };
}

function encode(img) {
  const { width, height, data } = img || {};
  if (!width || !height || !data || data.length !== width * height * 4) throw new Error('BMP encode: invalid image');
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const size = 54 + rowSize * height;
  const buf = Buffer.alloc(size);
  buf.write('BM', 0, 'latin1');
  buf.writeUInt32LE(size, 2);
  buf.writeUInt32LE(54, 10);
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(width, 18);
  buf.writeInt32LE(height, 22);
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(24, 28);
  buf.writeUInt32LE(rowSize * height, 34);
  buf.writeInt32LE(2835, 38);
  buf.writeInt32LE(2835, 42);
  for (let y = 0; y < height; y++) {
    let p = 54 + (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = data[i + 3] / 255; // flatten alpha over black
      buf[p++] = Math.round(data[i + 2] * a);
      buf[p++] = Math.round(data[i + 1] * a);
      buf[p++] = Math.round(data[i] * a);
    }
  }
  return buf;
}

module.exports = { decode, encode };
