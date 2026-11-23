'use strict';
// Small raster toolkit on { width, height, data: Uint8ClampedArray RGBA }.
// In-place (mutating) functions: set, fillRect, circle, disc, line, linearGradient, radialGradient, composite.
// Everything else returns a new image.
const color = require('./color');

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const LIN = new Float64Array(256);
for (let i = 0; i < 256; i++) LIN[i] = color.srgbToLinear(i);

// Color spec -> [r,g,b,a(0..255)]. Accepts '#RGB', '#RRGGBB', '#RRGGBBAA' or [r,g,b(,a)].
function parseColor(c) {
  if (typeof c === 'string') {
    let h = c.trim().replace(/^#/, '');
    if (h.length === 3 || h.length === 4) h = h.replace(/./g, (x) => x + x);
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) throw new Error(`Invalid color: ${c}`);
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255];
  }
  if (Array.isArray(c) && c.length >= 3) return [c[0], c[1], c[2], c.length > 3 ? c[3] : 255];
  throw new Error('Invalid color: ' + JSON.stringify(c));
}

function create(w, h, fill = [0, 0, 0, 0]) {
  w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
  const img = { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
  const [r, g, b, a] = parseColor(fill);
  if (r || g || b || a) {
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) { d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a; }
  }
  return img;
}

const clone = (img) => ({ width: img.width, height: img.height, data: new Uint8ClampedArray(img.data) });
function get(img, x, y) {
  if (x < 0 || y < 0 || x >= img.width || y >= img.height) return [0, 0, 0, 0];
  const o = (y * img.width + x) * 4, d = img.data;
  return [d[o], d[o + 1], d[o + 2], d[o + 3]];
}
function set(img, x, y, c) {
  if (x < 0 || y < 0 || x >= img.width || y >= img.height) return img;
  const [r, g, b, a] = parseColor(c);
  const o = (y * img.width + x) * 4, d = img.data;
  d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = a;
  return img;
}

// Source-over blend of (r,g,b) at coverage*alpha `sa` (0..1) into data[o].
function blendPx(d, o, r, g, b, sa) {
  if (sa <= 0) return;
  const da = d[o + 3] / 255;
  if (sa >= 1 || da === 0) {
    if (da === 0) { d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = Math.round(sa * 255); return; }
    d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255; return;
  }
  const oa = sa + da * (1 - sa);
  const k = da * (1 - sa);
  d[o] = (r * sa + d[o] * k) / oa;
  d[o + 1] = (g * sa + d[o + 1] * k) / oa;
  d[o + 2] = (b * sa + d[o + 2] * k) / oa;
  d[o + 3] = oa * 255;
}

function fillRect(img, x, y, w, h, c) {
  const [r, g, b, a] = parseColor(c);
  const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
  const x1 = Math.min(img.width, Math.round(x + w)), y1 = Math.min(img.height, Math.round(y + h));
  for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) blendPx(img.data, (yy * img.width + xx) * 4, r, g, b, a / 255);
  return img;
}

// Anti-aliased disc (filled circle).
function disc(img, cx, cy, radius, c) {
  const [r, g, b, a] = parseColor(c);
  const x0 = Math.max(0, Math.floor(cx - radius - 1)), x1 = Math.min(img.width - 1, Math.ceil(cx + radius + 1));
  const y0 = Math.max(0, Math.floor(cy - radius - 1)), y1 = Math.min(img.height - 1, Math.ceil(cy + radius + 1));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dist = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      const cov = clamp(radius - dist + 0.5, 0, 1);
      if (cov > 0) blendPx(img.data, (y * img.width + x) * 4, r, g, b, (cov * a) / 255);
    }
  }
  return img;
}

// Anti-aliased ring of stroke `width` centered on `radius`.
function circle(img, cx, cy, radius, c, width = 1) {
  const [r, g, b, a] = parseColor(c);
  const outer = radius + width / 2 + 1;
  const x0 = Math.max(0, Math.floor(cx - outer)), x1 = Math.min(img.width - 1, Math.ceil(cx + outer));
  const y0 = Math.max(0, Math.floor(cy - outer)), y1 = Math.min(img.height - 1, Math.ceil(cy + outer));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dist = Math.abs(Math.hypot(x + 0.5 - cx, y + 0.5 - cy) - radius);
      const cov = clamp(width / 2 - dist + 0.5, 0, 1);
      if (cov > 0) blendPx(img.data, (y * img.width + x) * 4, r, g, b, (cov * a) / 255);
    }
  }
  return img;
}

// Anti-aliased line with round-ish caps and stroke `width`.
function line(img, x0, y0, x1, y1, c, width = 1) {
  const [r, g, b, a] = parseColor(c);
  const pad = width / 2 + 1;
  const bx0 = Math.max(0, Math.floor(Math.min(x0, x1) - pad)), bx1 = Math.min(img.width - 1, Math.ceil(Math.max(x0, x1) + pad));
  const by0 = Math.max(0, Math.floor(Math.min(y0, y1) - pad)), by1 = Math.min(img.height - 1, Math.ceil(Math.max(y0, y1) + pad));
  const dx = x1 - x0, dy = y1 - y0, len2 = dx * dx + dy * dy;
  for (let y = by0; y <= by1; y++) {
    for (let x = bx0; x <= bx1; x++) {
      const px = x + 0.5, py = y + 0.5;
      const t = len2 ? clamp(((px - x0) * dx + (py - y0) * dy) / len2, 0, 1) : 0;
      const dist = Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
      const cov = clamp(width / 2 - dist + 0.5, 0, 1);
      if (cov > 0) blendPx(img.data, (y * img.width + x) * 4, r, g, b, (cov * a) / 255);
    }
  }
  return img;
}

// stops: [{pos, color}] or [[pos, color]] (pos 0..1). Returns a 1024-entry LUT of [r,g,b,a] interpolated in OKLab.
function gradientLut(stops) {
  let s = stops.map((st) => (Array.isArray(st) ? { pos: st[0], color: st[1] } : st));
  s = s.map((st) => ({ pos: st.pos, rgba: parseColor(st.color) })).sort((p, q) => p.pos - q.pos);
  if (!s.length) throw new Error('gradient needs at least one stop');
  const labs = s.map((st) => color.rgbToOklab(st.rgba));
  const N = 1024;
  const lut = new Float64Array(N * 4);
  let k = 0;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    while (k < s.length - 2 && t > s[k + 1].pos) k++;
    let rgba;
    if (s.length === 1 || t <= s[0].pos) rgba = s[0].rgba;
    else if (t >= s[s.length - 1].pos) rgba = s[s.length - 1].rgba;
    else {
      const a = s[k], b = s[k + 1];
      const u = b.pos === a.pos ? 0 : (t - a.pos) / (b.pos - a.pos);
      const la = labs[k], lb = labs[k + 1];
      const rgb = color.oklabToRgbRaw([la[0] + (lb[0] - la[0]) * u, la[1] + (lb[1] - la[1]) * u, la[2] + (lb[2] - la[2]) * u]);
      rgba = [rgb[0], rgb[1], rgb[2], a.rgba[3] + (b.rgba[3] - a.rgba[3]) * u];
    }
    lut[i * 4] = rgba[0]; lut[i * 4 + 1] = rgba[1]; lut[i * 4 + 2] = rgba[2]; lut[i * 4 + 3] = rgba[3];
  }
  return lut;
}

function paintLut(img, lut, tAt) {
  const { width: w, height: h, data: d } = img;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = clamp(tAt(x + 0.5, y + 0.5), 0, 1);
      const i = Math.round(t * 1023) * 4;
      blendPx(d, (y * w + x) * 4, lut[i], lut[i + 1], lut[i + 2], lut[i + 3] / 255);
    }
  }
  return img;
}

// angle in degrees: 0 = left->right, 90 = top->bottom. Corners map to t=0 and t=1 (CSS-like).
function linearGradient(img, stops, angle = 0) {
  const lut = gradientLut(stops);
  const a = (angle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const w = img.width, h = img.height;
  const extent = Math.abs(w * c) + Math.abs(h * s) || 1;
  return paintLut(img, lut, (x, y) => ((x - w / 2) * c + (y - h / 2) * s) / extent + 0.5);
}

// opts: { cx, cy, r, ry } in pixels. Defaults: centre, r = half diagonal. ry makes it elliptical.
function radialGradient(img, stops, opts = {}) {
  const lut = gradientLut(stops);
  const w = img.width, h = img.height;
  const cx = opts.cx ?? w / 2, cy = opts.cy ?? h / 2;
  const rx = opts.r ?? Math.hypot(w, h) / 2, ry = opts.ry ?? rx;
  return paintLut(img, lut, (x, y) => Math.hypot((x - cx) / rx, (y - cy) / ry));
}

function seedToInt(seed) {
  if (typeof seed === 'number') return seed | 0;
  let h = 2166136261;
  for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h | 0;
}

function hash2(x, y, s) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  h = Math.imul(h, 2246822519);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

// Deterministic smooth value noise: returns f(x, y) in [0, 1] (lattice spacing 1).
function valueNoise(seed = 0) {
  const s = seedToInt(seed);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

// Fractal Brownian motion of valueNoise octaves, normalised to [0, 1].
function fbm(seed = 0, { octaves = 5, lacunarity = 2, gain = 0.5 } = {}) {
  const layers = [];
  for (let i = 0; i < octaves; i++) layers.push(valueNoise(seedToInt(seed) + i * 1013));
  let norm = 0, amp = 1;
  for (let i = 0; i < octaves; i++) { norm += amp; amp *= gain; }
  return (x, y) => {
    let sum = 0, a = 1, f = 1;
    for (let i = 0; i < octaves; i++) { sum += a * layers[i](x * f + i * 17.3, y * f - i * 9.1); a *= gain; f *= lacunarity; }
    return sum / norm;
  };
}

// Premultiplied float copy.
function toPremul(img) {
  const d = img.data, out = new Float32Array(d.length);
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] / 255;
    out[i] = d[i] * a; out[i + 1] = d[i + 1] * a; out[i + 2] = d[i + 2] * a; out[i + 3] = d[i + 3];
  }
  return out;
}
function fromPremul(buf, w, h) {
  const out = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < out.length; i += 4) {
    const a = buf[i + 3] / 255;
    if (a > 0) { out[i] = buf[i] / a; out[i + 1] = buf[i + 1] / a; out[i + 2] = buf[i + 2] / a; }
    out[i + 3] = buf[i + 3];
  }
  return { width: w, height: h, data: out };
}

function boxPass(src, dst, w, h, r, horizontal) {
  const n = horizontal ? w : h, lines = horizontal ? h : w;
  const step = horizontal ? 4 : w * 4, lineStep = horizontal ? w * 4 : 4;
  const inv = 1 / (2 * r + 1);
  for (let l = 0; l < lines; l++) {
    const base = l * lineStep;
    for (let c = 0; c < 4; c++) {
      let sum = 0;
      for (let i = -r; i <= r; i++) sum += src[base + c + clamp(i, 0, n - 1) * step];
      for (let i = 0; i < n; i++) {
        dst[base + c + i * step] = sum * inv;
        sum += src[base + c + Math.min(i + r + 1, n - 1) * step] - src[base + c + Math.max(i - r, 0) * step];
      }
    }
  }
}

// 3-pass separable box blur (~ gaussian). Alpha-aware (premultiplied). r in pixels.
function boxBlur(img, r) {
  r = Math.round(r);
  if (r < 1) return clone(img);
  const { width: w, height: h } = img;
  let a = toPremul(img), b = new Float32Array(a.length);
  for (let p = 0; p < 3; p++) {
    boxPass(a, b, w, h, r, true); [a, b] = [b, a];
    boxPass(a, b, w, h, r, false); [a, b] = [b, a];
  }
  return fromPremul(a, w, h);
}

// 1D resampling weights: area-average when shrinking, bilinear when enlarging.
function axisWeights(n, m) {
  const out = new Array(m);
  if (m < n) {
    const scale = n / m;
    for (let i = 0; i < m; i++) {
      const s = i * scale, e = (i + 1) * scale;
      const i0 = Math.floor(s), i1 = Math.min(n - 1, Math.ceil(e) - 1);
      const idx = [], wt = [];
      for (let j = i0; j <= i1; j++) {
        const ov = Math.min(e, j + 1) - Math.max(s, j);
        if (ov > 0) { idx.push(j); wt.push(ov / scale); }
      }
      out[i] = [idx, wt];
    }
  } else {
    const scale = n / m;
    for (let i = 0; i < m; i++) {
      const p = clamp((i + 0.5) * scale - 0.5, 0, n - 1);
      const i0 = Math.floor(p), f = p - i0;
      out[i] = f === 0 || i0 + 1 >= n ? [[i0], [1]] : [[i0, i0 + 1], [1 - f, f]];
    }
  }
  return out;
}

function resize(img, w, h) {
  w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
  const sw = img.width, sh = img.height;
  if (w === sw && h === sh) return clone(img);
  const src = toPremul(img);
  const wx = axisWeights(sw, w), wy = axisWeights(sh, h);
  const tmp = new Float32Array(w * sh * 4);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < w; x++) {
      const [idx, wt] = wx[x];
      let r = 0, g = 0, b = 0, a = 0;
      for (let k = 0; k < idx.length; k++) {
        const o = (y * sw + idx[k]) * 4, q = wt[k];
        r += src[o] * q; g += src[o + 1] * q; b += src[o + 2] * q; a += src[o + 3] * q;
      }
      const t = (y * w + x) * 4;
      tmp[t] = r; tmp[t + 1] = g; tmp[t + 2] = b; tmp[t + 3] = a;
    }
  }
  const out = new Float32Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const [idx, wt] = wy[y];
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let k = 0; k < idx.length; k++) {
        const o = (idx[k] * w + x) * 4, q = wt[k];
        r += tmp[o] * q; g += tmp[o + 1] * q; b += tmp[o + 2] * q; a += tmp[o + 3] * q;
      }
      const t = (y * w + x) * 4;
      out[t] = r; out[t + 1] = g; out[t + 2] = b; out[t + 3] = a;
    }
  }
  return fromPremul(out, w, h);
}

const BLEND = {
  normal: (b, s) => s,
  add: (b, s) => Math.min(1, b + s),
  screen: (b, s) => b + s - b * s,
  multiply: (b, s) => b * s,
};

// Composites src onto dst IN PLACE at (x, y). Returns dst.
function composite(dst, src, { x = 0, y = 0, mode = 'normal', opacity = 1 } = {}) {
  const fn = BLEND[mode];
  if (!fn) throw new Error(`composite: unknown mode "${mode}" (normal|add|screen|multiply)`);
  x = Math.round(x); y = Math.round(y);
  const sd = src.data, dd = dst.data;
  for (let sy = 0; sy < src.height; sy++) {
    const dy = y + sy;
    if (dy < 0 || dy >= dst.height) continue;
    for (let sx = 0; sx < src.width; sx++) {
      const dx = x + sx;
      if (dx < 0 || dx >= dst.width) continue;
      const so = (sy * src.width + sx) * 4, o = (dy * dst.width + dx) * 4;
      const as = (sd[so + 3] / 255) * opacity;
      if (as <= 0) continue;
      const ab = dd[o + 3] / 255;
      const ao = as + ab * (1 - as);
      for (let c = 0; c < 3; c++) {
        const cb = dd[o + c] / 255, cs = sd[so + c] / 255;
        const co = ((1 - as) * ab * cb + as * ((1 - ab) * cs + ab * fn(cb, cs))) / ao;
        dd[o + c] = co * 255;
      }
      dd[o + 3] = ao * 255;
    }
  }
  return dst;
}

// Multiply RGB by f (0..1 darkens, >1 brightens).
function dim(img, f) {
  const out = clone(img), d = out.data;
  for (let i = 0; i < d.length; i += 4) { d[i] *= f; d[i + 1] *= f; d[i + 2] *= f; }
  return out;
}

// Darkens towards the corners. strength 0..1 (1 = corners go black).
function vignette(img, strength = 0.5) {
  const out = clone(img), d = out.data, w = img.width, h = img.height;
  const cx = (w - 1) / 2, cy = (h - 1) / 2;
  const rmax = Math.hypot(cx, cy) || 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const r = Math.hypot(x - cx, y - cy) / rmax;
      const t = r * r * (3 - 2 * Math.min(1, r)); // smoothstep-ish falloff
      const f = 1 - strength * t * t;
      const o = (y * w + x) * 4;
      d[o] *= f; d[o + 1] *= f; d[o + 2] *= f;
    }
  }
  return out;
}

// Bright-pass (sRGB luma > threshold 0..1), blurred by `radius`, screened back over the image at `strength`.
function bloom(img, threshold = 0.7, radius = 8, strength = 0.6) {
  const bright = clone(img), bd = bright.data;
  const thr = clamp(threshold, 0, 0.999);
  for (let i = 0; i < bd.length; i += 4) {
    const luma = (0.2126 * bd[i] + 0.7152 * bd[i + 1] + 0.0722 * bd[i + 2]) / 255;
    const k = clamp((luma - thr) / (1 - thr), 0, 1);
    bd[i] *= k; bd[i + 1] *= k; bd[i + 2] *= k;
  }
  const glow = boxBlur(bright, radius);
  const out = clone(img), d = out.data, gd = glow.data;
  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const a = d[i + c] / 255, b = clamp((gd[i + c] / 255) * strength, 0, 1);
      d[i + c] = (a + b - a * b) * 255;
    }
  }
  return out;
}

function pixelate(img, size) {
  size = Math.max(1, Math.round(size));
  if (size === 1) return clone(img);
  const { width: w, height: h } = img, s = img.data;
  const out = new Uint8ClampedArray(s.length);
  for (let by = 0; by < h; by += size) {
    for (let bx = 0; bx < w; bx += size) {
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      const ye = Math.min(h, by + size), xe = Math.min(w, bx + size);
      for (let y = by; y < ye; y++) for (let x = bx; x < xe; x++) {
        const o = (y * w + x) * 4, al = s[o + 3];
        r += s[o] * al; g += s[o + 1] * al; b += s[o + 2] * al; a += al; n++;
      }
      const R = a ? r / a : 0, G = a ? g / a : 0, B = a ? b / a : 0, A = a / n;
      for (let y = by; y < ye; y++) for (let x = bx; x < xe; x++) {
        const o = (y * w + x) * 4;
        out[o] = R; out[o + 1] = G; out[o + 2] = B; out[o + 3] = A;
      }
    }
  }
  return { width: w, height: h, data: out };
}

const BAYER8 = (() => {
  let m = [[0]];
  for (let n = 1; n < 8; n *= 2) {
    const k = m.length, next = [];
    for (let y = 0; y < 2 * k; y++) { next.push([]); for (let x = 0; x < 2 * k; x++) next[y].push(4 * m[y % k][x % k] + [[0, 2], [3, 1]][Math.floor(y / k)][Math.floor(x / k)]); }
    m = next;
  }
  return m; // 8x8 values 0..63
})();

// Snap every pixel to the nearest palette color in OKLab. dither: 'none' | 'ordered' | 'fs'. Alpha is kept.
function quantize(img, hexes, { dither = 'none' } = {}) {
  if (!hexes || !hexes.length) throw new Error('quantize: empty palette');
  const pal = hexes.map((h) => color.hexToRgb(h));
  const labs = pal.map((p) => color.rgbToOklab(p));
  const cache = new Map();
  const nearest = (r, g, b) => {
    r = clamp(Math.round(r), 0, 255); g = clamp(Math.round(g), 0, 255); b = clamp(Math.round(b), 0, 255);
    const key = (r << 16) | (g << 8) | b;
    let v = cache.get(key);
    if (v === undefined) {
      const lab = color.rgbToOklab([r, g, b]);
      let best = 0, bd = Infinity;
      for (let i = 0; i < labs.length; i++) {
        const dl = lab[0] - labs[i][0], da = lab[1] - labs[i][1], db = lab[2] - labs[i][2];
        const dd = dl * dl + da * da + db * db;
        if (dd < bd) { bd = dd; best = i; }
      }
      v = best; cache.set(key, v);
    }
    return v;
  };
  const { width: w, height: h } = img;
  const out = clone(img), d = out.data;
  if (dither === 'fs') {
    let cur = new Float32Array((w + 2) * 3), nxt = new Float32Array((w + 2) * 3);
    for (let y = 0; y < h; y++) {
      nxt.fill(0);
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4;
        const r = d[o] + cur[(x + 1) * 3], g = d[o + 1] + cur[(x + 1) * 3 + 1], b = d[o + 2] + cur[(x + 1) * 3 + 2];
        const p = pal[nearest(r, g, b)];
        const er = r - p[0], eg = g - p[1], eb = b - p[2];
        d[o] = p[0]; d[o + 1] = p[1]; d[o + 2] = p[2];
        const c = (x + 2) * 3, n0 = x * 3, n1 = (x + 1) * 3, n2 = (x + 2) * 3;
        cur[c] += er * 7 / 16; cur[c + 1] += eg * 7 / 16; cur[c + 2] += eb * 7 / 16;
        nxt[n0] += er * 3 / 16; nxt[n0 + 1] += eg * 3 / 16; nxt[n0 + 2] += eb * 3 / 16;
        nxt[n1] += er * 5 / 16; nxt[n1 + 1] += eg * 5 / 16; nxt[n1 + 2] += eb * 5 / 16;
        nxt[n2] += er / 16; nxt[n2 + 1] += eg / 16; nxt[n2 + 2] += eb / 16;
      }
      [cur, nxt] = [nxt, cur];
    }
  } else {
    const spread = dither === 'ordered' ? 48 : 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4;
        const t = spread ? ((BAYER8[y & 7][x & 7] + 0.5) / 64 - 0.5) * spread : 0;
        const p = pal[nearest(d[o] + t, d[o + 1] + t, d[o + 2] + t)];
        d[o] = p[0]; d[o + 1] = p[1]; d[o + 2] = p[2];
      }
    }
  }
  return out;
}

// Darken every other band of rows: rows with (y % period) >= period/2 are multiplied by (1 - strength).
function scanlines(img, period = 2, strength = 0.3) {
  period = Math.max(2, Math.round(period));
  const out = clone(img), d = out.data, w = img.width;
  const f = 1 - strength, half = period / 2;
  for (let y = 0; y < img.height; y++) {
    if (y % period < half) continue;
    for (let x = 0; x < w; x++) { const o = (y * w + x) * 4; d[o] *= f; d[o + 1] *= f; d[o + 2] *= f; }
  }
  return out;
}

function summarize(lums) {
  const n = lums.length;
  if (!n) return { mean: 0, p10: 0, p50: 0, p90: 0 };
  let sum = 0;
  for (let i = 0; i < n; i++) sum += lums[i];
  const sorted = Float32Array.from(lums).sort();
  const pct = (q) => {
    const p = q * (n - 1), i = Math.floor(p), f = p - i;
    return sorted[i] + (i + 1 < n ? (sorted[i + 1] - sorted[i]) * f : 0);
  };
  return { mean: sum / n, p10: pct(0.1), p50: pct(0.5), p90: pct(0.9) };
}

function regionLums(img, x0, y0, x1, y1, maxSamples = 400000) {
  const d = img.data, w = img.width;
  const total = (x1 - x0) * (y1 - y0);
  const step = Math.max(1, Math.ceil(Math.sqrt(total / maxSamples)));
  const arr = [];
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const o = (y * w + x) * 4, a = d[o + 3] / 255;
      arr.push((0.2126 * LIN[d[o]] + 0.7152 * LIN[d[o + 1]] + 0.0722 * LIN[d[o + 2]]) * a); // over black
    }
  }
  return arr;
}

// WCAG relative luminance stats (alpha composited over black): { mean, p10, p50, p90 }.
function stats(img) {
  return summarize(regionLums(img, 0, 0, img.width, img.height));
}

// Per-cell stats for a cols x rows grid, row-major: [{ col, row, mean, p10, p50, p90 }].
function regions(img, cols, rows) {
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor((c * img.width) / cols), x1 = Math.max(x0 + 1, Math.floor(((c + 1) * img.width) / cols));
      const y0 = Math.floor((r * img.height) / rows), y1 = Math.max(y0 + 1, Math.floor(((r + 1) * img.height) / rows));
      out.push({ col: c, row: r, ...summarize(regionLums(img, x0, y0, Math.min(x1, img.width), Math.min(y1, img.height))) });
    }
  }
  return out;
}

module.exports = {
  create, clone, get, set, fillRect, circle, disc, line, linearGradient, radialGradient,
  valueNoise, fbm, boxBlur, resize, composite, dim, vignette, bloom, pixelate, quantize, scanlines,
  stats, regions, parseColor,
};
