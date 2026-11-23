'use strict';
// Color math. Conventions:
//   hex   = '#RRGGBB' (uppercase on output)
//   rgb   = [r, g, b] with 0..255 (floats allowed on input)
//   oklab = [L, a, b]   (L 0..1)
//   oklch = [L, C, h]   (h in degrees 0..360)
// Functions that take "a color" accept a hex string or an rgb array.

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

function hexToRgb(hex) {
  let h = String(hex).trim().replace(/^#|^0x/i, '');
  if (h.length === 3 || h.length === 4) h = h.replace(/./g, (c) => c + c);
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) throw new Error(`Invalid hex color: ${hex}`);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(rgb) {
  return '#' + rgb.slice(0, 3).map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase();
}

const toRgb = (c) => (typeof c === 'string' ? hexToRgb(c) : c);

const srgbToLinear = (v) => { // v 0..255 -> 0..1
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const linearToSrgb = (l) => { // l 0..1 -> 0..255 (unrounded)
  const c = l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
  return c * 255;
};

const LIN_LUT = new Float64Array(256);
for (let i = 0; i < 256; i++) LIN_LUT[i] = srgbToLinear(i);

function linearToOklab(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLinear(L, a, b) {
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function rgbToOklab(rgb) {
  const [r, g, b] = toRgb(rgb);
  const f = (v) => (Number.isInteger(v) && v >= 0 && v < 256 ? LIN_LUT[v] : srgbToLinear(clamp(v, 0, 255)));
  return linearToOklab(f(r), f(g), f(b));
}

// Unclamped sRGB (0..255 floats; may fall outside the gamut).
function oklabToRgbRaw(lab) {
  const [r, g, b] = oklabToLinear(lab[0], lab[1], lab[2]);
  return [linearToSrgb(Math.max(r, 0)), linearToSrgb(Math.max(g, 0)), linearToSrgb(Math.max(b, 0))];
}

function oklabToRgb(lab) {
  return oklabToRgbRaw(lab).map((v) => Math.round(clamp(v, 0, 255)));
}

function oklabToOklch(lab) {
  const C = Math.hypot(lab[1], lab[2]);
  let h = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;
  if (h < 0) h += 360;
  return [lab[0], C, C < 1e-7 ? 0 : h];
}

function oklchToOklab(lch) {
  const h = (lch[2] * Math.PI) / 180;
  return [lch[0], lch[1] * Math.cos(h), lch[1] * Math.sin(h)];
}

function rgbToOklch(rgb) { return oklabToOklch(rgbToOklab(rgb)); }

const EPS = 1e-4;
function inGamut(lin) { return lin[0] >= -EPS && lin[0] <= 1 + EPS && lin[1] >= -EPS && lin[1] <= 1 + EPS && lin[2] >= -EPS && lin[2] <= 1 + EPS; }

// OKLCH -> rgb ints. Out-of-gamut colors are clipped by reducing chroma at constant L and h.
function oklchToRgb(lch) {
  const [L, C, h] = lch;
  if (L <= 0) return [0, 0, 0];
  if (L >= 1) return [255, 255, 255];
  const hr = (h * Math.PI) / 180, ch = Math.cos(hr), sh = Math.sin(hr);
  let c = Math.max(0, C);
  let lin = oklabToLinear(L, c * ch, c * sh);
  if (!inGamut(lin)) {
    let lo = 0, hi = c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklabToLinear(L, mid * ch, mid * sh))) lo = mid; else hi = mid;
    }
    c = lo;
    lin = oklabToLinear(L, c * ch, c * sh);
  }
  return lin.map((v) => Math.round(clamp(linearToSrgb(clamp(v, 0, 1)), 0, 255)));
}

const oklchToHex = (lch) => rgbToHex(oklchToRgb(lch));
const hexToOklch = (hex) => rgbToOklch(hexToRgb(hex));

// WCAG relative luminance 0..1.
function luminance(color) {
  const [r, g, b] = toRgb(color);
  const f = (v) => (Number.isInteger(v) && v >= 0 && v < 256 ? LIN_LUT[v] : srgbToLinear(clamp(v, 0, 255)));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

// WCAG contrast ratio 1..21.
function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// Mix in OKLab. t=0 -> a, t=1 -> b. Returns hex.
function mix(a, b, t) {
  const la = rgbToOklab(a), lb = rgbToOklab(b);
  return rgbToHex(oklabToRgb([la[0] + (lb[0] - la[0]) * t, la[1] + (lb[1] - la[1]) * t, la[2] + (lb[2] - la[2]) * t]));
}

// Same hue and chroma, new OKLCH lightness (chroma reduced if needed to fit sRGB). Returns hex.
function withLightness(color, L) {
  const [, C, h] = rgbToOklch(color);
  return oklchToHex([clamp(L, 0, 1), C, h]);
}

function deltaE(a, b) {
  const x = rgbToOklab(a), y = rgbToOklab(b);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

// Move OKLCH lightness of `color` (hue/chroma kept) until contrast vs `ref` >= min.
// dir: 'auto' (away from ref's luminance), 'up' or 'down'. Returns the best hex found (may still fail at the extreme).
function ensureContrast(color, ref, min, dir = 'auto') {
  let hex = typeof color === 'string' ? color.toUpperCase() : rgbToHex(color);
  if (contrast(hex, ref) >= min) return hex;
  const [L0, C, h] = rgbToOklch(hex);
  const up = dir === 'auto' ? luminance(ref) < 0.18 : dir === 'up';
  let best = hex;
  for (let i = 1; i <= 400; i++) {
    const L = up ? L0 + i * 0.0025 : L0 - i * 0.0025;
    if (L > 1 || L < 0) break;
    best = oklchToHex([L, C, h]);
    if (contrast(best, ref) >= min) return best;
  }
  return best;
}

module.exports = {
  hexToRgb, rgbToHex, srgbToLinear, linearToSrgb,
  rgbToOklab, oklabToRgb, oklabToRgbRaw, oklabToOklch, oklchToOklab, rgbToOklch, oklchToRgb,
  oklchToHex, hexToOklch, luminance, contrast, mix, withLightness, deltaE, ensureContrast, clamp, toRgb,
};
