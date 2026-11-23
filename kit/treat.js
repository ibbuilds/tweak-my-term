'use strict';
// Treatments that turn any anchor image into a readable terminal background.
// Every function returns a new image ({ width, height, data: Uint8ClampedArray RGBA }).
//
//   apply(img, [{ op: 'fit', width: 1920, height: 1200 }, { op: 'dim', amount: 0.6 }, 'vignette:0.4'], { palette })
//   forText(img, palette, { opacity })   -> picks dim/blur until text is readable over the image
//
// Ops: fit, dim, blur, vignette, bloom, pixelate, quantize, scanlines, ascii (alias ascii-glyphs), tint.
// "dim amount" is how much light is removed (0 = unchanged, 1 = black), the same meaning as contrast.js `dim`.
// Look specs may list treatments as strings ("dim:0.66", "bloom:0.08", "ascii-glyphs:95", "vignette"); apply() parses them.
const C = require('./color');
const R = require('./raster');
const contrast = require('./contrast');
const { ANSI_NAMES, BRIGHT_NAMES } = require('./palette');

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// ------------------------------------------------------------------ palette helpers (shared by ascii/preview)

// Fills the optional fields so every kit module can rely on them.
function normalizePalette(p) {
  if (!p || typeof p !== 'object' || !p.background || !p.foreground) throw new Error('palette needs at least background, foreground and ansi');
  const ansi = {};
  ANSI_NAMES.forEach((n, i) => {
    const bn = BRIGHT_NAMES[i];
    const base = p.ansi && (p.ansi[n] || p.ansi[bn]);
    if (!base) throw new Error(`palette.ansi.${n} is missing`);
    ansi[n] = C.rgbToHex(C.hexToRgb(base));
  });
  BRIGHT_NAMES.forEach((bn, i) => { ansi[bn] = C.rgbToHex(C.hexToRgb((p.ansi && p.ansi[bn]) || ansi[ANSI_NAMES[i]])); });
  const accent = C.rgbToHex(C.hexToRgb(p.accent || p.cursor || ansi.blue));
  const hex = (v) => C.rgbToHex(C.hexToRgb(v));
  const out = {
    background: hex(p.background), foreground: hex(p.foreground),
    cursor: hex(p.cursor || accent), selectionBackground: hex(p.selectionBackground || C.mix(p.background, accent, 0.3)),
    accent, ansi,
  };
  if (p.source) out.source = p.source;
  return out;
}

// Background, foreground, accent and the 16 ANSI colors, uppercase hex, no duplicates.
function paletteHexes(palette) {
  const p = normalizePalette(palette);
  return [...new Set([p.background, p.foreground, p.accent, ...ANSI_NAMES.map((n) => p.ansi[n]), ...BRIGHT_NAMES.map((n) => p.ansi[n])])];
}

// ------------------------------------------------------------------ crop / fit

function crop(img, x, y, w, h) {
  x = Math.max(0, Math.round(x)); y = Math.max(0, Math.round(y));
  w = Math.max(1, Math.min(img.width - x, Math.round(w))); h = Math.max(1, Math.min(img.height - y, Math.round(h)));
  const out = R.create(w, h);
  for (let r = 0; r < h; r++) {
    const s = ((y + r) * img.width + x) * 4;
    out.data.set(img.data.subarray(s, s + w * 4), r * w * 4);
  }
  return out;
}

function alignFractions(align = 'center') {
  const a = String(align).toLowerCase();
  const ax = a.includes('left') ? 0 : a.includes('right') ? 1 : 0.5;
  const ay = a.includes('top') ? 0 : a.includes('bottom') ? 1 : 0.5;
  return [ax, ay];
}

// mode 'cover' (crop to the aspect, default) or 'contain' (letterbox onto `background`).
function fit(img, width, height, { mode = 'cover', align = 'center', background = '#000000' } = {}) {
  if (!(width >= 1 && height >= 1)) throw new Error(`fit: invalid size ${width}x${height}`);
  width = Math.round(width); height = Math.round(height);
  const [ax, ay] = alignFractions(align);
  if (mode === 'cover') {
    const scale = Math.max(width / img.width, height / img.height);
    const cw = Math.min(img.width, width / scale), ch = Math.min(img.height, height / scale);
    return R.resize(crop(img, (img.width - cw) * ax, (img.height - ch) * ay, cw, ch), width, height);
  }
  if (mode === 'contain') {
    const scale = Math.min(width / img.width, height / img.height);
    const w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
    const canvas = R.create(width, height, background);
    return R.composite(canvas, R.resize(img, w, h), { x: (width - w) * ax, y: (height - h) * ay });
  }
  throw new Error(`fit: unknown mode "${mode}" (cover|contain)`);
}

// ------------------------------------------------------------------ simple ops

function num(v, name, lo, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) throw new Error(`${name} must be a number from ${lo} to ${hi}, got "${v}"`);
  return n;
}

const dim = (img, amount = 0.5) => R.dim(img, 1 - num(amount, 'dim amount', 0, 1));
const blur = (img, radius = 4) => R.boxBlur(img, num(radius, 'blur radius', 0, 500));
const vignette = (img, amount = 0.5) => R.vignette(img, num(amount, 'vignette amount', 0, 1));
const pixelate = (img, size = 4) => R.pixelate(img, num(size, 'pixelate size', 1, 1000));
const scanlines = (img, strength = 0.3, period = 2) => R.scanlines(img, num(period, 'scanlines period', 2, 200), num(strength, 'scanlines strength', 0, 1));

function bloom(img, amount = 0.6, { threshold = 0.7, radius } = {}) {
  const r = radius ?? Math.max(2, Math.round(Math.min(img.width, img.height) / 60));
  return R.bloom(img, num(threshold, 'bloom threshold', 0, 0.99), r, num(amount, 'bloom amount', 0, 1));
}

// Mix every pixel toward `color` (hex) by `amount` 0..1 in sRGB; alpha is kept.
function tint(img, color, amount = 0.3) {
  const [r, g, b] = typeof color === 'string' ? C.hexToRgb(color) : color;
  const a = num(amount, 'tint amount', 0, 1);
  const out = R.clone(img), d = out.data;
  for (let i = 0; i < d.length; i += 4) { d[i] += (r - d[i]) * a; d[i + 1] += (g - d[i + 1]) * a; d[i + 2] += (b - d[i + 2]) * a; }
  return out;
}

function quantize(img, palette, { dither = 'none' } = {}) {
  const hexes = Array.isArray(palette) ? palette : paletteHexes(palette);
  return R.quantize(img, hexes, { dither });
}

// ------------------------------------------------------------------ ASCII glyph overlay (built-in 5x7 bitmaps, no font needed)

const FONT = {
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.XX..', '.XX..'],
  ':': ['.....', '.XX..', '.XX..', '.....', '.XX..', '.XX..', '.....'],
  '-': ['.....', '.....', '.....', 'XXXXX', '.....', '.....', '.....'],
  '=': ['.....', '.....', 'XXXXX', '.....', 'XXXXX', '.....', '.....'],
  '+': ['.....', '..X..', '..X..', 'XXXXX', '..X..', '..X..', '.....'],
  '*': ['.....', 'X.X.X', '.XXX.', 'XXXXX', '.XXX.', 'X.X.X', '.....'],
  '#': ['.X.X.', '.X.X.', 'XXXXX', '.X.X.', 'XXXXX', '.X.X.', '.X.X.'],
  '%': ['XX..X', 'XX..X', '...X.', '..X..', '.X...', 'X..XX', 'X..XX'],
  '@': ['.XXX.', 'X...X', 'X.XXX', 'X.X.X', 'X.XXX', 'X....', '.XXX.'],
  0: ['.XXX.', 'X...X', 'X..XX', 'X.X.X', 'XX..X', 'X...X', '.XXX.'],
  1: ['..X..', '.XX..', '..X..', '..X..', '..X..', '..X..', '.XXX.'],
  2: ['.XXX.', 'X...X', '....X', '...X.', '..X..', '.X...', 'XXXXX'],
  3: ['XXXX.', '....X', '....X', '.XXX.', '....X', '....X', 'XXXX.'],
  4: ['...X.', '..XX.', '.X.X.', 'X..X.', 'XXXXX', '...X.', '...X.'],
  5: ['XXXXX', 'X....', 'XXXX.', '....X', '....X', 'X...X', '.XXX.'],
  6: ['..XX.', '.X...', 'X....', 'XXXX.', 'X...X', 'X...X', '.XXX.'],
  7: ['XXXXX', '....X', '...X.', '..X..', '.X...', '.X...', '.X...'],
  8: ['.XXX.', 'X...X', 'X...X', '.XXX.', 'X...X', 'X...X', '.XXX.'],
  9: ['.XXX.', 'X...X', 'X...X', '.XXXX', '....X', '...X.', '.XX..'],
  A: ['.XXX.', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
  B: ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X...X', 'X...X', 'XXXX.'],
  C: ['.XXX.', 'X...X', 'X....', 'X....', 'X....', 'X...X', '.XXX.'],
  D: ['XXXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'XXXX.'],
  E: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'],
  F: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'X....'],
};
const RAMP = ' .:-=+*#%@';

// Draws one 5x7 glyph scaled into the box (x, y, w, h) with `rgb` at `alpha`.
function drawGlyph(img, ch, x, y, w, h, rgb, alpha) {
  const rows = FONT[ch];
  if (!rows) return;
  const { width: W, height: H, data: d } = img;
  for (let py = 0; py < h; py++) {
    const yy = Math.round(y) + py;
    if (yy < 0 || yy >= H) continue;
    const row = rows[Math.min(6, Math.floor((py * 7) / h))];
    for (let px = 0; px < w; px++) {
      const xx = Math.round(x) + px;
      if (xx < 0 || xx >= W || row[Math.min(4, Math.floor((px * 5) / w))] !== 'X') continue;
      const o = (yy * W + xx) * 4;
      d[o] += (rgb[0] - d[o]) * alpha; d[o + 1] += (rgb[1] - d[o + 1]) * alpha; d[o + 2] += (rgb[2] - d[o + 2]) * alpha;
    }
  }
}

// Replaces nothing: lays a grid of density glyphs (colored by the picture) over the image, with dark row gaps.
function asciiGlyphs(img, { cellW = 7, cellH = 14, alpha = 0.37, gamma = 0.7, rowGap = 0.2 } = {}) {
  alpha = alpha > 1 ? alpha / 255 : alpha;
  num(alpha, 'ascii alpha', 0, 1);
  const out = R.clone(img), { width: W, height: H } = img, s = img.data;
  const cols = Math.floor(W / cellW), rows = Math.floor(H / cellH);
  if (cols < 1 || rows < 1) return out;
  const cell = new Float32Array(cols * rows), mean = new Float32Array(cols * rows * 3);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let sr = 0, sg = 0, sb = 0, mx = 0, n = 0;
      for (let y = r * cellH; y < (r + 1) * cellH; y++) {
        for (let x = c * cellW; x < (c + 1) * cellW; x++) {
          const o = (y * W + x) * 4;
          sr += s[o]; sg += s[o + 1]; sb += s[o + 2]; n++;
          const m = Math.max(s[o], s[o + 1], s[o + 2]) / 255;
          if (m > mx) mx = m;
        }
      }
      const i = r * cols + c;
      mean[i * 3] = sr / n; mean[i * 3 + 1] = sg / n; mean[i * 3 + 2] = sb / n;
      cell[i] = 0.5 * (Math.max(sr, sg, sb) / n / 255) + 0.5 * mx;
    }
  }
  const sorted = Float32Array.from(cell).sort();
  const lo = sorted[Math.floor(sorted.length * 0.06)], hi = sorted[Math.floor(sorted.length * 0.995)];
  const span = Math.max(1e-6, hi - lo);
  const gw = Math.max(3, cellW - 1), gh = Math.max(5, Math.round(cellH * 0.72));
  const gapPx = Math.round(cellH * rowGap * 0.5);
  for (let r = 0; r < rows; r++) {
    if (gapPx > 0) {
      for (let y = (r + 1) * cellH - gapPx; y < (r + 1) * cellH; y++) {
        for (let x = 0; x < cols * cellW; x++) { const o = (y * W + x) * 4; out.data[o] *= 0.78; out.data[o + 1] *= 0.78; out.data[o + 2] *= 0.78; }
      }
    }
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const v = Math.pow(clamp((cell[i] - lo) / span, 0, 1), gamma);
      const k = Math.floor(v * RAMP.length);
      if (k < 1) continue;
      const ch = RAMP[Math.min(RAMP.length - 1, k)];
      const m = [mean[i * 3], mean[i * 3 + 1], mean[i * 3 + 2]];
      const top = Math.max(1, m[0], m[1], m[2]);
      const scale = clamp(((0.45 + 0.55 * v) * 255) / top, 1, 6);
      const rgb = m.map((q) => clamp(q * scale, 0, 255));
      const gx = c * cellW + (cellW - gw) / 2, gy = r * cellH + cellH * 0.06;
      if (v > 0.82) { drawGlyph(out, ch, gx - 1, gy, gw, gh, rgb, alpha * 0.4); drawGlyph(out, ch, gx + 1, gy, gw, gh, rgb, alpha * 0.4); }
      drawGlyph(out, ch, gx, gy, gw, gh, rgb, alpha);
    }
  }
  return out;
}

// ------------------------------------------------------------------ apply

const ARG_KEY = {
  dim: 'amount', blur: 'radius', vignette: 'amount', bloom: 'amount', pixelate: 'size', scanlines: 'strength',
  ascii: 'alpha', 'ascii-glyphs': 'alpha', tint: 'color', quantize: 'dither', fit: 'size',
};

// 'dim:0.66' -> { op: 'dim', amount: 0.66 }; 'fit:1920x1200'; 'tint:#112233'; objects pass through.
function parseStep(step) {
  if (step && typeof step === 'object') return step;
  const m = /^([a-z-]+)(?::(.*))?$/i.exec(String(step).trim());
  if (!m) throw new Error(`Invalid treatment "${step}"`);
  const op = m[1].toLowerCase();
  if (!(op in ARG_KEY)) throw new Error(`Unknown treatment "${op}" (${Object.keys(ARG_KEY).join(', ')})`);
  if (m[2] === undefined || m[2] === '') return { op };
  if (op === 'fit') {
    const f = /^(\d+)x(\d+)$/.exec(m[2]);
    if (!f) throw new Error(`fit expects WIDTHxHEIGHT, got "${m[2]}"`);
    return { op, width: +f[1], height: +f[2] };
  }
  const key = ARG_KEY[op];
  return { op, [key]: key === 'color' || key === 'dither' ? m[2] : Number(m[2]) };
}

function paletteOf(ctx, step) {
  const p = step.palette || ctx.palette;
  if (!p) throw new Error(`${step.op} needs a palette: pass { palette } to apply() or put one in the step`);
  return normalizePalette(p);
}

function run(img, step, ctx) {
  switch (step.op) {
    case 'fit': return fit(img, step.width, step.height, { mode: step.mode, align: step.align, background: step.background || (ctx.palette ? normalizePalette(ctx.palette).background : '#000000') });
    case 'dim': return dim(img, step.amount);
    case 'blur': return blur(img, step.radius);
    case 'vignette': return vignette(img, step.amount);
    case 'bloom': return bloom(img, step.amount, { threshold: step.threshold, radius: step.radius });
    case 'pixelate': return pixelate(img, step.size);
    case 'scanlines': return scanlines(img, step.strength, step.period);
    case 'quantize': return quantize(img, step.colors || paletteOf(ctx, step), { dither: step.dither });
    case 'ascii': case 'ascii-glyphs': return asciiGlyphs(img, { cellW: step.cellW, cellH: step.cellH, alpha: step.alpha, gamma: step.gamma, rowGap: step.rowGap });
    case 'tint': {
      const c = step.color === 'background' || step.color === undefined ? paletteOf(ctx, step).background : step.color;
      return tint(img, c, step.amount);
    }
    default: throw new Error(`Unknown treatment "${step.op}" (${Object.keys(ARG_KEY).join(', ')})`);
  }
}

function apply(img, steps, ctx = {}) {
  let cur = img;
  for (const raw of steps || []) cur = run(cur, parseStep(raw), ctx);
  return cur;
}

// ------------------------------------------------------------------ forText

const LADDER = [
  { dim: 0, blur: 0 }, { dim: 0.15, blur: 0 }, { dim: 0.3, blur: 0 }, { dim: 0.45, blur: 0 },
  { dim: 0.45, blur: 1 }, { dim: 0.6, blur: 1 }, { dim: 0.7, blur: 2 }, { dim: 0.8, blur: 2 }, { dim: 0.9, blur: 3 }, { dim: 0.96, blur: 3 },
];

// Text colors that must stay readable over the image: the foreground (4.5:1) and the colored ANSI slots. An ANSI
// color needs 4.5:1 (brightBlack 3:1, black is exempt) but never more than it already has on the plain background:
// the image must not make a color worse than the palette made it.
function textColors(pal) {
  const list = [['foreground', pal.foreground, 4.5]];
  const own = (hex, min) => Math.min(min, C.contrast(hex, pal.background) * 0.9);
  for (const n of ANSI_NAMES) if (n !== 'black') list.push(["ansi." + n, pal.ansi[n], own(pal.ansi[n], 4.5)]);
  for (const n of BRIGHT_NAMES) list.push(["ansi." + n, pal.ansi[n], own(pal.ansi[n], n === "brightBlack" ? 3 : 4.5)]);
  return list;
}

function imageRatio(pal, color, image, opacity, maxSize) {
  const row = contrast.report({ ...pal, foreground: color }, { image, opacity, maxSize }).find((r) => r.pair.startsWith('foreground/image'));
  return row.ratio;
}

function failing(pal, image, opacity, maxSize) {
  const bad = [];
  for (const [name, hex, min] of textColors(pal)) {
    const ratio = imageRatio(pal, hex, image, opacity, maxSize);
    if (ratio < min) bad.push({ color: name, hex, ratio, min });
  }
  return bad;
}

function veil(img, pal, amount, light) {
  return light ? tint(img, pal.background, amount) : R.dim(img, 1 - amount);
}

// Darkens (or, on a light palette, washes toward the background) and blurs the image just enough that the
// foreground and ANSI colors stay readable when it is shown at `opacity` behind text. Returns
// { image, dim, blur, steps, ok, failing, report }; ok is false when even the strongest rung is not enough.
function forText(img, palette, { opacity = 1, maxSize = 240 } = {}) {
  const pal = normalizePalette(palette);
  const light = C.luminance(pal.background) > 0.4;
  const big = Math.max(img.width, img.height);
  const probe = big > maxSize ? R.resize(img, Math.max(1, Math.round((img.width * maxSize) / big)), Math.max(1, Math.round((img.height * maxSize) / big))) : img;
  const blurPx = (k, of) => Math.max(1, Math.round(k * 0.006 * Math.min(of.width, of.height)));
  let pick = LADDER[LADDER.length - 1];
  for (const rung of LADDER) {
    const t = veil(rung.blur ? R.boxBlur(probe, blurPx(rung.blur, probe)) : probe, pal, rung.dim, light);
    if (!failing(pal, t, opacity, maxSize).length) { pick = rung; break; }
  }
  const steps = [];
  let out = img;
  if (pick.blur) { const r = blurPx(pick.blur, img); steps.push({ op: 'blur', radius: r }); out = R.boxBlur(out, r); }
  if (pick.dim) { steps.push(light ? { op: 'tint', color: pal.background, amount: pick.dim } : { op: 'dim', amount: pick.dim }); out = veil(out, pal, pick.dim, light); }
  const bad = failing(pal, out, opacity, 320);
  return {
    image: out, dim: pick.dim, blur: pick.blur ? blurPx(pick.blur, img) : 0, steps, ok: bad.length === 0, failing: bad,
    report: contrast.report(pal, { image: out, opacity }),
  };
}

module.exports = {
  apply, parseStep, forText, fit, crop, dim, blur, vignette, bloom, pixelate, quantize, scanlines, asciiGlyphs, tint,
  normalizePalette, paletteHexes, FONT,
};
