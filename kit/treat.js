'use strict';
// Treatments that turn any anchor image into a readable terminal background.
// Every function returns a new image ({ width, height, data: Uint8ClampedArray RGBA }).
//
//   apply(img, [{ op: 'fit', width: 1920, height: 1200 }, { op: 'dim', amount: 0.6 }, 'vignette:0.4'], { palette })
//   forText(img, palette, { opacity, zone }) -> reads the composition and picks the lightest fix that keeps text readable
//
// Ops: fit, dim, blur, vignette, bloom, pixelate, quantize, scanlines, ascii (alias ascii-glyphs), tint, scrim.
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
  ascii: 'alpha', 'ascii-glyphs': 'alpha', tint: 'color', quantize: 'dither', fit: 'size', scrim: 'opacity',
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
    case 'scrim': return forText(img, paletteOf(ctx, step), { opacity: step.opacity ?? 1, zone: step.zone || 'terminal', strategy: 'local' }).image;
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

// ------------------------------------------------------------------ forText (composition-aware)
//
// Every image is a different composition, so there is no fixed treatment. forText looks at where the image
// fights the text (bright areas on a dark palette, dark areas on a light one) and where text actually goes,
// then picks the lightest fix that keeps text readable:
//   none   - already readable: the image is left exactly as it is
//   local  - a soft shade only over the cells that fail; the rest keeps full strength
//   global - an even veil (+ a little blur) when most of the image is too strong anyway
// Text zone: terminal text starts at the left edge and most lines are short, so with zone 'terminal' (default)
// the left half needs full contrast and the requirement eases toward the right edge (never below 3:1 for body
// text, or 75% of a weak color's own target). zone 'full' asks for full contrast everywhere.

const GRID_COLS = 16, GRID_ROWS = 10;
const STEPS = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.96];
const LADDER = [
  { dim: 0, blur: 0 }, { dim: 0.15, blur: 0 }, { dim: 0.3, blur: 0 }, { dim: 0.45, blur: 0 },
  { dim: 0.45, blur: 1 }, { dim: 0.6, blur: 1 }, { dim: 0.7, blur: 2 }, { dim: 0.8, blur: 2 }, { dim: 0.9, blur: 3 }, { dim: 0.96, blur: 3 },
];

// How much text a column carries: 1 on the left half, easing to 0.4 at the right edge ('terminal'); 1 everywhere ('full').
function textWeight(xFrac, zone = 'terminal') {
  if (zone === 'full') return 1;
  if (zone !== 'terminal') throw new Error(`zone must be terminal or full, got "${zone}"`);
  return xFrac <= 0.5 ? 1 : 1 - 0.6 * ((xFrac - 0.5) / 0.5);
}
const required = (min, w) => Math.max(Math.min(3, min * 0.75), min * (0.55 + 0.45 * w));

// Text colors that must stay readable over the image: the foreground (4.5:1) and the colored ANSI slots. An ANSI
// color needs 4.5:1 (brightBlack 3:1, black is exempt) but never more than it already has on the plain background:
// the image must not make a color worse than the palette made it.
function textColors(pal) {
  const list = [['foreground', pal.foreground, 4.5]];
  const own = (hex, min) => Math.min(min, C.contrast(hex, pal.background) * 0.9);
  for (const n of ANSI_NAMES) if (n !== 'black') list.push(['ansi.' + n, pal.ansi[n], own(pal.ansi[n], 4.5)]);
  for (const n of BRIGHT_NAMES) list.push(['ansi.' + n, pal.ansi[n], own(pal.ansi[n], n === 'brightBlack' ? 3 : 4.5)]);
  return list.map(([name, hex, min]) => ({ name, hex, min, lum: C.luminance(hex) }));
}
const ratioLum = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

function veil(img, pal, amount, light) {
  if (!amount) return img;
  return light ? tint(img, pal.background, amount) : R.dim(img, 1 - amount);
}

function shrink(img, maxSize) {
  const big = Math.max(img.width, img.height);
  return big > maxSize ? R.resize(img, Math.max(1, Math.round((img.width * maxSize) / big)), Math.max(1, Math.round((img.height * maxSize) / big))) : img;
}

function cellBox(img, c, r) {
  const x0 = Math.floor((c * img.width) / GRID_COLS), x1 = Math.max(x0 + 1, Math.floor(((c + 1) * img.width) / GRID_COLS));
  const y0 = Math.floor((r * img.height) / GRID_ROWS), y1 = Math.max(y0 + 1, Math.floor(((r + 1) * img.height) / GRID_ROWS));
  return [x0, y0, Math.min(x1, img.width) - x0, Math.min(y1, img.height) - y0];
}

// The tone text has to fight in one cell, after a veil of `d`, shown at `opacity` over the background.
function cellTone(pal, cell, d, opacity, light) {
  const eff = R.composite(R.create(cell.width, cell.height, pal.background), veil(cell, pal, d, light), { opacity });
  const s = R.stats(eff);
  return light ? s.p10 : s.p90;
}

function cellFails(colors, tone, w) {
  const bad = [];
  for (const t of colors) {
    const ratio = ratioLum(t.lum, tone), min = required(t.min, w);
    if (ratio < min) bad.push({ color: t.name, hex: t.hex, ratio, min });
  }
  return bad;
}

// Per cell: the smallest veil that makes every text color pass there.
function needGrid(probe, pal, colors, { opacity, zone, light }) {
  const need = new Float32Array(GRID_COLS * GRID_ROWS);
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = crop(probe, ...cellBox(probe, c, r));
      const w = textWeight((c + 0.5) / GRID_COLS, zone);
      let pick = STEPS[STEPS.length - 1];
      for (const d of STEPS) if (!cellFails(colors, cellTone(pal, cell, d, opacity, light), w).length) { pick = d; break; }
      need[r * GRID_COLS + c] = pick;
    }
  }
  return need;
}

// The foreground's tightest cell over an (already treated) image: { ratio, min, col, row }, the zone-aware version
// of contrast.report's text-over-image row.
function foregroundOver(img, pal, { opacity, zone, light, maxSize }) {
  const probe = shrink(img, maxSize), lum = C.luminance(pal.foreground);
  let worst = null;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const ratio = ratioLum(lum, cellTone(pal, crop(probe, ...cellBox(probe, c, r)), 0, opacity, light));
      const min = required(4.5, textWeight((c + 0.5) / GRID_COLS, zone));
      if (!worst || ratio / min < worst.ratio / worst.min) worst = { ratio, min, col: c, row: r };
    }
  }
  return { ...worst, ratio: Math.round(worst.ratio * 100) / 100, min: Math.round(worst.min * 100) / 100 };
}

// Every failing text color over an (already treated) image, worst ratio per color.
function failingOver(img, pal, colors, { opacity, zone, light, maxSize }) {
  const probe = shrink(img, maxSize), worst = new Map();
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const tone = cellTone(pal, crop(probe, ...cellBox(probe, c, r)), 0, opacity, light);
      for (const f of cellFails(colors, tone, textWeight((c + 0.5) / GRID_COLS, zone))) {
        const prev = worst.get(f.color);
        if (!prev || f.ratio / f.min < prev.ratio / prev.min) worst.set(f.color, { ...f, ratio: Math.round(f.ratio * 100) / 100, min: Math.round(f.min * 100) / 100 });
      }
    }
  }
  return [...worst.values()];
}

// Spreads each cell's need outward with a round, eased falloff over a few cells (so a shade reads as a soft glow,
// never a box), then interpolates smoothly between cell centers. A failing cell keeps at least its own veil.
const FEATHER = 2.5; // cells
function scrimMask(need, width, height) {
  const grown = new Float32Array(need.length);
  const reach = Math.ceil(FEATHER) + 1;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      let m = 0;
      for (let dr = -reach; dr <= reach; dr++) {
        for (let dc = -reach; dc <= reach; dc++) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr >= GRID_ROWS || cc < 0 || cc >= GRID_COLS) continue;
          // full veil on the cell and its 8 neighbors (every pixel of a failing cell is covered), then a round fade
          const near = Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
          const t = near ? 0 : (Math.hypot(dr, dc) - 1) / FEATHER;
          if (t >= 1) continue;
          const fall = 1 - t * t * (3 - 2 * t); // smoothstep from 1 near the cell to 0 at the rim
          m = Math.max(m, need[rr * GRID_COLS + cc] * fall);
        }
      }
      grown[r * GRID_COLS + c] = m;
    }
  }
  const at = (c, r) => grown[clamp(r, 0, GRID_ROWS - 1) * GRID_COLS + clamp(c, 0, GRID_COLS - 1)];
  const ease = (t) => t * t * (3 - 2 * t);
  const mask = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    const v = ((y + 0.5) / height) * GRID_ROWS - 0.5, r0 = Math.floor(v), ty = ease(v - r0);
    for (let x = 0; x < width; x++) {
      const u = ((x + 0.5) / width) * GRID_COLS - 0.5, c0 = Math.floor(u), tx = ease(u - c0);
      const top = at(c0, r0) + (at(c0 + 1, r0) - at(c0, r0)) * tx;
      const bot = at(c0, r0 + 1) + (at(c0 + 1, r0 + 1) - at(c0, r0 + 1)) * tx;
      mask[y * width + x] = top + (bot - top) * ty;
    }
  }
  // Round off the square full-strength zone: three box passes (close to a Gaussian) whose total reach stays
  // under one cell, so the failing cells, a cell inside that zone, keep their full veil.
  const rx = Math.max(0, Math.floor(width / GRID_COLS / 3) - 1), ry = Math.max(0, Math.floor(height / GRID_ROWS / 3) - 1);
  for (let pass = 0; pass < 3; pass++) blurMask(mask, width, height, rx, ry);
  return mask;
}

// In-place separable box blur of a float mask (edges clamp).
function blurMask(m, w, h, rx, ry) {
  const line = (get, set, n, r) => {
    if (!r) return;
    const src = new Float32Array(n);
    for (let i = 0; i < n; i++) src[i] = get(i);
    let sum = 0;
    for (let i = -r; i <= r; i++) sum += src[clamp(i, 0, n - 1)];
    for (let i = 0; i < n; i++) {
      set(i, sum / (2 * r + 1));
      sum += src[clamp(i + r + 1, 0, n - 1)] - src[clamp(i - r, 0, n - 1)];
    }
  };
  for (let y = 0; y < h; y++) line((i) => m[y * w + i], (i, v) => { m[y * w + i] = v; }, w, rx);
  for (let x = 0; x < w; x++) line((i) => m[i * w + x], (i, v) => { m[i * w + x] = v; }, h, ry);
}

function applyMask(img, mask, pal, light) {
  const out = R.clone(img), d = out.data;
  const [br, bg, bb] = C.hexToRgb(pal.background);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const m = mask[p];
    if (m <= 0) continue;
    if (light) { d[i] += (br - d[i]) * m; d[i + 1] += (bg - d[i + 1]) * m; d[i + 2] += (bb - d[i + 2]) * m; }
    else { d[i] *= 1 - m; d[i + 1] *= 1 - m; d[i + 2] *= 1 - m; }
  }
  return out;
}

// Where the image pulls the eye (and fights text): the centroid of the pixels that stand out from its typical tone.
function focalPoint(probe, pal, light) {
  const eff = R.composite(R.create(probe.width, probe.height, pal.background), probe, { opacity: 1 });
  const d = eff.data, n = probe.width * probe.height, score = new Float32Array(n);
  for (let p = 0; p < n; p++) {
    const l = C.luminance([d[p * 4], d[p * 4 + 1], d[p * 4 + 2]]);
    score[p] = light ? 1 - l : l;
  }
  // Weight by how far each pixel stands out above the typical tone, squared so the subject dominates the texture.
  const median = Float32Array.from(score).sort()[Math.floor(n / 2)];
  let sx = 0, sy = 0, k = 0;
  for (let p = 0; p < n; p++) {
    const w = score[p] > median ? (score[p] - median) ** 2 : 0;
    sx += w * ((p % probe.width) + 0.5); sy += w * (Math.floor(p / probe.width) + 0.5); k += w;
  }
  if (!k) return { x: 0.5, y: 0.5 };
  return { x: Math.round((sx / k / probe.width) * 100) / 100, y: Math.round((sy / k / probe.height) * 100) / 100 };
}

function composition(probe, pal, need, { zone, light, strategy }) {
  const focal = focalPoint(probe, pal, light);
  const inText = zone === 'full' || focal.x < 0.5;
  const failingCells = need.reduce((a, v) => a + (v > 0 ? 1 : 0), 0);
  const notes = [];
  if (!failingCells) notes.push('Readable as it is: the image is left untouched.');
  else {
    if (strategy === 'global') notes.push('Most of the image is too strong for text, so it is veiled evenly. A darker (or, for a light palette, lighter) image, a lower background opacity, or the other palette mode would keep more of it.');
    else notes.push('Only part of the image fights the text: it is shaded locally and the rest keeps full strength.');
    if (inText && zone === 'terminal') notes.push('The strongest part of the image sits where text goes (left half). Compositions read better with the subject in the right third and calm space on the left: align the image right, mirror it, or crop it so the subject moves right.');
  }
  return { focal, focalInTextZone: inText, failingCells, cells: GRID_COLS * GRID_ROWS, notes };
}

// Returns { image, strategy: 'none'|'local'|'global', dim, blur, coverage, steps, ok, failing, composition, report }.
// dim is the strongest veil used anywhere; coverage the share of pixels that changed.
function forText(img, palette, { opacity = 1, zone = 'terminal', strategy = 'auto', maxSize = 240 } = {}) {
  if (!['auto', 'none', 'local', 'global'].includes(strategy)) throw new Error(`strategy must be auto, none, local or global, got "${strategy}"`);
  textWeight(0, zone);
  const pal = normalizePalette(palette);
  const light = C.luminance(pal.background) > 0.4;
  const colors = textColors(pal);
  const opts = { opacity, zone, light, maxSize };
  const probe = shrink(img, maxSize);
  const need = needGrid(probe, pal, colors, opts);
  const maxNeed = need.reduce((a, v) => Math.max(a, v), 0);
  const meanNeed = need.reduce((a, v) => a + v, 0) / need.length;

  const blurPx = (k, of) => Math.max(1, Math.round(k * 0.006 * Math.min(of.width, of.height)));
  const globalPick = () => {
    for (const rung of LADDER) {
      const t = veil(rung.blur ? R.boxBlur(probe, blurPx(rung.blur, probe)) : probe, pal, rung.dim, light);
      if (!failingOver(t, pal, colors, opts).length) return rung;
    }
    return LADDER[LADDER.length - 1];
  };

  let pick = strategy;
  let rung = null;
  if (pick === 'auto') {
    if (maxNeed === 0) pick = 'none';
    else {
      rung = globalPick();
      // A local shade that would cover most of the picture anyway is just a blotchy global veil.
      pick = meanNeed >= 0.6 * rung.dim ? 'global' : 'local';
    }
  }
  if (pick === 'local' && maxNeed === 0) pick = 'none';

  const local = () => {
    const mask = scrimMask(need, img.width, img.height);
    let changed = 0;
    for (const m of mask) if (m > 0.02) changed++;
    return { out: applyMask(img, mask, pal, light), steps: [{ op: 'scrim', opacity, zone }], dimUsed: maxNeed, blurUsed: 0, coverage: changed / mask.length };
  };
  const global = () => {
    rung = rung || globalPick();
    const res = { out: img, steps: [], dimUsed: rung.dim, blurUsed: 0, coverage: rung.dim || rung.blur ? 1 : 0 };
    if (rung.blur) { res.blurUsed = blurPx(rung.blur, img); res.steps.push({ op: 'blur', radius: res.blurUsed }); res.out = R.boxBlur(res.out, res.blurUsed); }
    if (rung.dim) { res.steps.push(light ? { op: 'tint', color: pal.background, amount: rung.dim } : { op: 'dim', amount: rung.dim }); res.out = veil(res.out, pal, rung.dim, light); }
    return res;
  };

  let res = pick === 'local' ? local() : pick === 'global' ? global() : { out: img, steps: [], dimUsed: 0, blurUsed: 0, coverage: 0 };
  let bad = failingOver(res.out, pal, colors, opts);
  // Fine bright detail (thin lines, stars) can beat a shade alone; in auto mode the even veil adds blur for that.
  if (strategy === 'auto' && pick === 'local' && bad.length) {
    pick = 'global';
    res = global();
    bad = failingOver(res.out, pal, colors, opts);
  }
  const { out, steps, dimUsed, blurUsed, coverage } = res;
  return {
    image: out, strategy: pick, dim: Math.round(dimUsed * 100) / 100, blur: blurUsed,
    coverage: Math.round(coverage * 1000) / 1000, steps, ok: bad.length === 0, failing: bad,
    composition: composition(probe, pal, need, { zone, light, strategy: pick }),
    report: contrast.report(pal).concat((() => {
      const fg = foregroundOver(out, pal, opts);
      return [{ pair: `foreground/image (zone ${zone}, tightest cell col ${fg.col} row ${fg.row})`, ratio: fg.ratio, min: fg.min, ok: fg.ratio >= fg.min }];
    })()),
  };
}

module.exports = {
  apply, parseStep, forText, fit, crop, dim, blur, vignette, bloom, pixelate, quantize, scanlines, asciiGlyphs, tint,
  normalizePalette, paletteHexes, FONT, textWeight, scrimMask,
};
