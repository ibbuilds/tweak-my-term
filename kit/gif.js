'use strict';
// GIF decoder: first frame only (+ frame count). Output RGBA at logical-screen size; unpainted/transparent = alpha 0.

function skipSubBlocks(buf, p) {
  while (p < buf.length && buf[p] !== 0) p += buf[p] + 1;
  return p + 1;
}

function readSubBlocks(buf, p) {
  const parts = [];
  while (p < buf.length && buf[p] !== 0) {
    parts.push(buf.subarray(p + 1, p + 1 + buf[p]));
    p += buf[p] + 1;
  }
  return { data: Buffer.concat(parts), next: p + 1 };
}

function lzwDecode(data, minCodeSize, pixelCount) {
  const out = new Uint8Array(pixelCount);
  const clear = 1 << minCodeSize, eoi = clear + 1;
  let codeSize = minCodeSize + 1;
  let next = eoi + 1;
  const prefix = new Int32Array(4096), suffix = new Uint8Array(4096), first = new Uint8Array(4096), lens = new Uint16Array(4096);
  for (let i = 0; i < clear; i++) { suffix[i] = i; first[i] = i; lens[i] = 1; prefix[i] = -1; }
  const stack = new Uint8Array(4097);
  let prev = -1, op = 0, bits = 0, acc = 0, ip = 0;
  while (op < pixelCount) {
    while (bits < codeSize) {
      if (ip >= data.length) return out; // out of data: remainder stays index 0
      acc |= data[ip++] << bits;
      bits += 8;
    }
    const code = acc & ((1 << codeSize) - 1);
    acc >>>= codeSize;
    bits -= codeSize;
    if (code === clear) { codeSize = minCodeSize + 1; next = eoi + 1; prev = -1; continue; }
    if (code === eoi) break;
    if (prev === -1) {
      if (code >= clear) throw new Error('GIF: corrupt LZW data');
      out[op++] = suffix[code];
      prev = code;
      continue;
    }
    let f;
    if (code < next) {
      f = first[code];
      const n = lens[code];
      let t = code;
      for (let i = n - 1; i >= 0; i--) { stack[i] = suffix[t]; t = prefix[t]; }
      for (let i = 0; i < n && op < pixelCount; i++) out[op++] = stack[i];
    } else if (code === next) {
      f = first[prev];
      const n = lens[prev];
      let t = prev;
      for (let i = n - 1; i >= 0; i--) { stack[i] = suffix[t]; t = prefix[t]; }
      for (let i = 0; i < n && op < pixelCount; i++) out[op++] = stack[i];
      if (op < pixelCount) out[op++] = f;
    } else throw new Error('GIF: corrupt LZW data');
    if (next < 4096) {
      prefix[next] = prev; suffix[next] = f; first[next] = first[prev]; lens[next] = lens[prev] + 1;
      next++;
    }
    if (next === 1 << codeSize && codeSize < 12) codeSize++;
    prev = code;
  }
  return out;
}

function checkHeader(buf) {
  if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
  const sig = buf.toString('latin1', 0, 6);
  if (sig !== 'GIF87a' && sig !== 'GIF89a') throw new Error('GIF: bad signature (not a GIF file)');
  return buf;
}

// Walks blocks; calls onImage(descriptorPos, gce) for each image; stops when it returns true.
function walk(buf, onImage) {
  const flags = buf[10];
  let p = 13 + (flags & 0x80 ? 3 * (1 << ((flags & 7) + 1)) : 0);
  let gce = null;
  while (p < buf.length) {
    const b = buf[p];
    if (b === 0x3b) break;
    if (b === 0x21) {
      const label = buf[p + 1];
      if (label === 0xf9 && buf[p + 2] >= 4) {
        gce = { transparent: !!(buf[p + 3] & 1), index: buf[p + 6], disposal: (buf[p + 3] >> 2) & 7 };
      }
      p = skipSubBlocks(buf, p + 2);
    } else if (b === 0x2c) {
      if (onImage(p, gce)) return;
      gce = null;
      const lf = buf[p + 9];
      p += 10 + (lf & 0x80 ? 3 * (1 << ((lf & 7) + 1)) : 0);
      p = skipSubBlocks(buf, p + 1);
    } else throw new Error(`GIF: unexpected block 0x${b.toString(16)} at ${p}`);
  }
}

function frameCount(buf) {
  buf = checkHeader(buf);
  let n = 0;
  walk(buf, () => { n++; return false; });
  return n;
}

function decodeFirstFrame(buf) {
  buf = checkHeader(buf);
  if (buf.length < 13) throw new Error('GIF: truncated header');
  const width = buf.readUInt16LE(6), height = buf.readUInt16LE(8);
  const flags = buf[10];
  let global = null;
  if (flags & 0x80) {
    const n = 1 << ((flags & 7) + 1);
    global = buf.subarray(13, 13 + n * 3);
  }
  let result = null;
  walk(buf, (p, gce) => {
    const fx = buf.readUInt16LE(p + 1), fy = buf.readUInt16LE(p + 3);
    const fw = buf.readUInt16LE(p + 5), fh = buf.readUInt16LE(p + 7);
    const lf = buf[p + 9];
    let q = p + 10;
    let table = global;
    if (lf & 0x80) {
      const n = 1 << ((lf & 7) + 1);
      table = buf.subarray(q, q + n * 3);
      q += n * 3;
    }
    if (!table) throw new Error('GIF: image has no color table');
    const interlaced = !!(lf & 0x40);
    const minCode = buf[q++];
    if (minCode < 1 || minCode > 11) throw new Error('GIF: invalid LZW minimum code size');
    const { data } = readSubBlocks(buf, q);
    const idx = lzwDecode(data, minCode, fw * fh);
    const W = width || fx + fw, H = height || fy + fh;
    const out = new Uint8ClampedArray(W * H * 4);
    // map interlaced row order
    let rowMap = null;
    if (interlaced) {
      rowMap = [];
      for (const [start, step] of [[0, 8], [4, 8], [2, 4], [1, 2]]) for (let y = start; y < fh; y += step) rowMap.push(y);
    }
    for (let r = 0; r < fh; r++) {
      const y = fy + (rowMap ? rowMap[r] : r);
      if (y >= H) continue;
      for (let x = 0; x < fw; x++) {
        const X = fx + x;
        if (X >= W) continue;
        const ci = idx[r * fw + x];
        const o = (y * W + X) * 4;
        if (gce && gce.transparent && ci === gce.index) continue; // stays transparent
        out[o] = table[ci * 3]; out[o + 1] = table[ci * 3 + 1]; out[o + 2] = table[ci * 3 + 2]; out[o + 3] = 255;
      }
    }
    result = { width: W, height: H, data: out };
    return true;
  });
  if (!result) throw new Error('GIF: no image frames found');
  return result;
}

module.exports = { decodeFirstFrame, frameCount };
