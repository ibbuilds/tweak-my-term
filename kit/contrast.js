'use strict';
// Contrast reporting and lightness-only repair for look-spec palettes.
const C = require('./color');
const raster = require('./raster');
const { ANSI_NAMES, BRIGHT_NAMES } = require('./palette');

const HARD_FG = 4.5;

// Effective image color behind text: image dimmed, then shown at `opacity` over the palette background.
function effectiveImage(palette, { image, opacity = 1, dim = 0, maxSize = 320 }) {
  let img = image;
  const big = Math.max(img.width, img.height);
  if (big > maxSize) img = raster.resize(img, Math.max(1, Math.round((img.width * maxSize) / big)), Math.max(1, Math.round((img.height * maxSize) / big)));
  const base = raster.create(img.width, img.height, palette.background);
  const layer = raster.dim(img, 1 - dim);
  return raster.composite(base, layer, { opacity });
}

// The region tone that fights the text most: brightest p90 on a dark look, darkest p10 on a light look.
function imageTone(palette, opts) {
  const eff = effectiveImage(palette, opts);
  const regs = raster.regions(eff, opts.cols || 4, opts.rows || 3);
  const lightBg = C.luminance(palette.background) > 0.4;
  let pick = null;
  for (const r of regs) {
    const lum = lightBg ? r.p10 : r.p90;
    if (!pick || (lightBg ? lum < pick.lum : lum > pick.lum)) pick = { lum, region: r };
  }
  return { lightBg, lum: pick.lum, region: pick.region };
}
const ratioLum = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// Rows: { pair, ratio, min, ok, [hard] }. Fix targets use `fg`/`bg` keys internally (not exported).
function report(palette, opts = {}) {
  const rows = [];
  const add = (pair, a, b, min, extra = {}) => {
    const ratio = C.contrast(a, b);
    rows.push({ pair, ratio: Math.round(ratio * 100) / 100, min, ok: ratio >= min, ...extra });
  };
  const bg = palette.background;
  add('foreground/background', palette.foreground, bg, 7, { hard: HARD_FG });
  for (const n of ANSI_NAMES) add(`ansi.${n}/background`, palette.ansi[n], bg, n === 'black' ? 1.5 : 4.5);
  for (const n of BRIGHT_NAMES) add(`ansi.${n}/background`, palette.ansi[n], bg, n === 'brightBlack' ? 3 : 4.5);
  add('foreground/selectionBackground', palette.foreground, palette.selectionBackground, 4.5);
  if (opts.image) {
    const tone = imageTone(palette, opts);
    const ratio = ratioLum(C.luminance(palette.foreground), tone.lum);
    rows.push({
      pair: `foreground/image (worst region col ${tone.region.col} row ${tone.region.row})`,
      ratio: Math.round(ratio * 100) / 100, min: 4.5, ok: ratio >= 4.5,
    });
  }
  return rows;
}

// Adjusts only OKLCH lightness of failing colors (hue and chroma untouched, gamut clipping aside).
// Returns { palette, changes: [{key, from, to, pair}] }.
function fix(palette, opts = {}) {
  const p = JSON.parse(JSON.stringify(palette));
  const changes = [];
  const apply = (get, set, ref, min, label, dir = 'auto', target = min + 0.15) => {
    const cur = get();
    if (C.contrast(cur, ref) >= min) return;
    const next = C.ensureContrast(cur, ref, target, dir);
    if (next !== cur) { set(next); changes.push({ key: label, from: cur, to: next }); }
  };
  const top = (k) => ({ get: () => p[k], set: (v) => { p[k] = v; } });

  // foreground vs background (target 7, aim a little above)
  apply(() => p.foreground, (v) => { p.foreground = v; }, p.background, 7, 'foreground', 'auto', 7.2);
  for (const n of ANSI_NAMES) apply(() => p.ansi[n], (v) => { p.ansi[n] = v; }, p.background, n === 'black' ? 1.5 : 4.5, `ansi.${n}`, 'auto', n === 'black' ? 1.6 : 4.65);
  for (const n of BRIGHT_NAMES) apply(() => p.ansi[n], (v) => { p.ansi[n] = v; }, p.background, n === 'brightBlack' ? 3 : 4.5, `ansi.${n}`, 'auto', n === 'brightBlack' ? 3.1 : 4.65);
  // selection: move it away from the foreground
  apply(top('selectionBackground').get, top('selectionBackground').set, p.foreground, 4.5, 'selectionBackground', 'auto', 4.65);

  if (opts.image) {
    const tone = imageTone(p, opts);
    const ok = (hex) => ratioLum(C.luminance(hex), tone.lum) >= 4.5;
    const cur = p.foreground;
    if (!ok(cur)) {
      const [L0, Cc, h] = C.rgbToOklch(C.hexToRgb(cur));
      const sign = tone.lightBg ? -1 : 1;
      let found = null;
      for (let i = 1; i <= 400; i++) {
        const L = L0 + sign * i * 0.0025;
        if (L > 1 || L < 0) break;
        const hex = C.oklchToHex([L, Cc, h]);
        if (ok(hex)) { found = hex; break; }
      }
      if (found) { p.foreground = found; changes.push({ key: 'foreground', from: cur, to: found, pair: 'image' }); }
    }
  }
  return { palette: p, changes };
}

module.exports = { report, fix };
