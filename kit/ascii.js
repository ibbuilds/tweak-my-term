'use strict';
// Image -> ASCII / ANSI art, aspect-corrected for terminal cells (about twice as tall as wide).
//
//   toAscii(img, { cols: 40, charset: 'blocks' | 'ascii' | 'braille' | 'halfblock', color: 'none' | 'ansi16' | 'truecolor', palette })
//
// Returns a string: `cols` visible characters per line, lines joined by "\n", no trailing newline.
// A text/ANSI file written from it works as a fastfetch/neofetch logo. `palette` (a look palette) is used for the
// transparent background and for the ansi16 mapping.
const C = require('./color');
const R = require('./raster');
const { ANSI_NAMES, BRIGHT_NAMES } = require('./palette');

const CHARSETS = ['ascii', 'blocks', 'braille', 'halfblock'];
const COLORS = ['none', 'ansi16', 'truecolor'];
const RAMPS = { ascii: ' .:-=+*#%@', blocks: ' ░▒▓█' };
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const luma = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

// xterm default colors, used for ansi16 when no palette is given.
const DEFAULT_ANSI = ['#000000', '#CD0000', '#00CD00', '#CDCD00', '#0000EE', '#CD00CD', '#00CDCD', '#E5E5E5',
  '#7F7F7F', '#FF0000', '#00FF00', '#FFFF00', '#5C5CFF', '#FF00FF', '#00FFFF', '#FFFFFF'];

function ansi16Table(palette) {
  const hexes = palette && palette.ansi ? [...ANSI_NAMES, ...BRIGHT_NAMES].map((n, i) => palette.ansi[n] || palette.ansi[ANSI_NAMES[i % 8]] || DEFAULT_ANSI[i]) : DEFAULT_ANSI;
  return hexes.map((h) => ({ rgb: C.hexToRgb(h), lab: C.rgbToOklab(C.hexToRgb(h)) }));
}

function nearestAnsi(table, cache, r, g, b) {
  const key = ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);
  let v = cache.get(key);
  if (v !== undefined) return v;
  const lab = C.rgbToOklab([r, g, b]);
  let best = 0, bd = Infinity;
  for (let i = 0; i < table.length; i++) {
    const dl = lab[0] - table[i].lab[0], da = lab[1] - table[i].lab[1], db = lab[2] - table[i].lab[2];
    const dd = dl * dl + da * da + db * db;
    if (dd < bd) { bd = dd; best = i; }
  }
  cache.set(key, best);
  return best;
}

const BAYER4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const BRAILLE_BIT = [[0x01, 0x02, 0x04, 0x40], [0x08, 0x10, 0x20, 0x80]]; // [dotCol][dotRow]

function toAscii(img, opts = {}) {
  const { charset = 'blocks', color = 'none', palette, invert = false, cellAspect = 2, stretch = true } = opts;
  const cols = Math.round(opts.cols ?? 40);
  if (!CHARSETS.includes(charset)) throw new Error(`ascii: unknown charset "${charset}" (${CHARSETS.join(', ')})`);
  if (!COLORS.includes(color)) throw new Error(`ascii: unknown color mode "${color}" (${COLORS.join(', ')})`);
  if (!(cols >= 1 && cols <= 1000)) throw new Error(`ascii: cols must be 1..1000, got ${opts.cols}`);
  const rows = Math.max(1, Math.round(opts.rows ?? (cols * img.height) / img.width / cellAspect));

  // flatten transparency onto the background
  const bgHex = palette && palette.background ? palette.background : '#000000';
  const flat = R.composite(R.create(img.width, img.height, bgHex), img);
  const sub = charset === 'braille' ? { x: 2, y: 4 } : charset === 'halfblock' ? { x: 1, y: 2 } : { x: 1, y: 1 };
  const gw = cols * sub.x, gh = rows * sub.y;
  const g = R.resize(flat, gw, gh), d = g.data;

  const lum = new Float32Array(gw * gh);
  for (let i = 0; i < lum.length; i++) lum[i] = luma(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
  let lo = 0, hi = 1;
  if (stretch && lum.length > 1 && charset !== 'halfblock') {
    const s = Float32Array.from(lum).sort();
    lo = s[Math.floor(s.length * 0.04)]; hi = s[Math.floor((s.length - 1) * 0.995)];
    if (hi - lo < 1e-4) { lo = 0; hi = 1; }
  }
  const norm = (i) => { const v = clamp((lum[i] - lo) / (hi - lo), 0, 1); return invert ? 1 - v : v; };

  const table = color === 'ansi16' ? ansi16Table(palette) : null, cache = new Map();
  const fgCode = (rgb) => {
    const [r, gg, b] = rgb.map((x) => Math.round(clamp(x, 0, 255)));
    if (color === 'truecolor') return `38;2;${r};${gg};${b}`;
    const i = nearestAnsi(table, cache, r, gg, b);
    return String(i < 8 ? 30 + i : 90 + i - 8);
  };
  const bgCode = (rgb) => {
    const [r, gg, b] = rgb.map((x) => Math.round(clamp(x, 0, 255)));
    if (color === 'truecolor') return `48;2;${r};${gg};${b}`;
    const i = nearestAnsi(table, cache, r, gg, b);
    return String(i < 8 ? 40 + i : 100 + i - 8);
  };
  const px = (x, y) => { const o = (y * gw + x) * 4; return [d[o], d[o + 1], d[o + 2]]; };
  // brighten dark cells so a glyph in them stays visible, keeping the hue
  const boost = (rgb, v) => {
    const top = Math.max(1, rgb[0], rgb[1], rgb[2]);
    const k = clamp(((0.45 + 0.55 * v) * 255) / top, 1, 6);
    return rgb.map((q) => q * k);
  };

  const lines = [];
  for (let r = 0; r < rows; r++) {
    let line = '', last = '';
    const put = (sgr, ch) => {
      if (color === 'none' || sgr === null) { if (last) { line += '\x1b[0m'; last = ''; } line += ch; return; }
      if (sgr !== last) { line += `\x1b[0;${sgr}m`; last = sgr; }
      line += ch;
    };
    for (let c = 0; c < cols; c++) {
      if (charset === 'ascii' || charset === 'blocks') {
        const i = r * gw + c, v = norm(i), ramp = RAMPS[charset];
        const k = Math.min(ramp.length - 1, Math.floor(v * ramp.length));
        put(k === 0 || color === 'none' ? null : fgCode(boost(px(c, r), v)), ramp[k]);
      } else if (charset === 'halfblock') {
        const top = px(c, r * 2), bot = px(c, r * 2 + 1);
        if (color === 'none') {
          const t = norm(r * 2 * gw + c) >= 0.5, b = norm((r * 2 + 1) * gw + c) >= 0.5;
          put(null, t && b ? '█' : t ? '▀' : b ? '▄' : ' ');
        } else put(`${fgCode(top)};${bgCode(bot)}`, '▀');
      } else { // braille: ordered-dither 2x4 dots
        let bits = 0, sr = 0, sg = 0, sb = 0, n = 0;
        for (let dx = 0; dx < 2; dx++) {
          for (let dy = 0; dy < 4; dy++) {
            const x = c * 2 + dx, y = r * 4 + dy, i = y * gw + x;
            if (norm(i) > (BAYER4[y & 3][x & 3] + 0.5) / 16) {
              bits |= BRAILLE_BIT[dx][dy];
              sr += d[i * 4]; sg += d[i * 4 + 1]; sb += d[i * 4 + 2]; n++;
            }
          }
        }
        put(bits === 0 || color === 'none' ? null : fgCode(boost([sr / n, sg / n, sb / n], 0.6)), String.fromCharCode(0x2800 + bits));
      }
    }
    if (last) line += '\x1b[0m';
    lines.push(line);
  }
  return lines.join('\n');
}

const ANSI_RE = /\x1b\[[0-9;]*m/g;
const stripAnsi = (s) => s.replace(ANSI_RE, '');

module.exports = { toAscii, stripAnsi, CHARSETS, COLORS };
