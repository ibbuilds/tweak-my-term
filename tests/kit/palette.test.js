'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const png = require('../../kit/png');
const C = require('../../kit/color');
const P = require('../../kit/palette');
const K = require('../../kit/contrast');
const R = require('../../kit/raster');
const H = require('./_helpers');

// A dark scene with one red light source, painted here so the tests own their input.
const S = require('../../kit/scene');
const redNight = () => S.paint({
  width: 480, height: 300, seed: 3,
  palette: { background: '#0B0909', foreground: '#D8D2CF', accent: '#E0201E', ansi: { red: '#B3141B' } },
  layers: [
    { type: 'sky', stops: [[0, { mix: ['background', '#000000', 0.7] }], [1, { mix: ['background', '#000000', 0.5] }]] },
    { type: 'glow', x: 0.76, y: 0.14, r: 0.3, color: 'ansi.red', opacity: 0.22 },
    { type: 'moon', x: 0.76, y: 0.14, r: 0.045, color: 'accent', glow: 0.3, glowRadius: 2.4 },
    { type: 'hills', baseY: 0.65, amp: 0.08, color: 'ink', shade: 0 },
    { type: 'hatch', wash: 0.42 },
    { type: 'grain', amount: 0.8 },
  ],
});
const HEX = /^#[0-9A-F]{6}$/;
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const allColors = (p) => [p.background, p.foreground, p.cursor, p.selectionBackground, p.accent, ...Object.values(p.ansi)];

function checkShape(p) {
  assert.deepStrictEqual(Object.keys(p), ['background', 'foreground', 'cursor', 'selectionBackground', 'accent', 'ansi']);
  assert.deepStrictEqual(Object.keys(p.ansi), [...P.ANSI_NAMES, ...P.BRIGHT_NAMES]);
  for (const c of allColors(p)) assert.match(c, HEX);
}

test('extract: three flat colors come back as those three, with shares', () => {
  const img = H.blocks(100, 100, [[0, 0, 100, 50, '#1A1A2E'], [0, 50, 60, 50, '#E94560'], [60, 50, 40, 50, '#F5F5DC']], '#000000');
  const sw = P.extract(img);
  assert.strictEqual(sw.length, 3);
  assert.deepStrictEqual(sw.map((s) => s.hex), ['#1A1A2E', '#E94560', '#F5F5DC']);
  assert.ok(Math.abs(sw[0].share - 0.5) < 1e-9 && Math.abs(sw[1].share - 0.3) < 1e-9 && Math.abs(sw[2].share - 0.2) < 1e-9);
  for (const s of sw) { assert.ok(s.L >= 0 && s.L <= 1 && s.C >= 0 && s.h >= 0 && s.h < 360); }
});

test('extract: merges near-duplicates, caps at k, ignores transparent pixels, handles big images', () => {
  const img = H.blocks(60, 60, [[0, 0, 30, 60, '#303030'], [30, 0, 30, 60, '#323232']], '#000000');
  assert.strictEqual(P.extract(img).length, 1);
  const noisy = H.randomImage(300, 300, 3, true);
  const sw = P.extract(noisy, 6);
  assert.ok(sw.length <= 6 && sw.length >= 2);
  assert.ok(Math.abs(sw.reduce((a, s) => a + s.share, 0) - 1) < 1e-9);
  const t = H.blocks(10, 10, [[0, 0, 10, 5, '#FF0000']], '#00FF00');
  for (let i = 3; i < t.data.length / 2; i += 4) t.data[i] = 0; // top half transparent
  assert.deepStrictEqual(P.extract(t).map((s) => s.hex), ['#00FF00']);
});

test('scheme: dark red-lit scene -> dark red-accent palette that passes after fix', () => {
  const img = redNight();
  const sw = P.extract(img);
  const p = P.scheme(sw, { mode: 'dark' });
  checkShape(p);
  const bg = C.hexToOklch(p.background);
  assert.ok(bg[0] >= 0.125 && bg[0] <= 0.205, `bg L ${bg[0]}`);
  assert.ok(bg[1] > 0.005, 'background is tinted, not pure grey');
  assert.ok(C.contrast(p.foreground, p.background) >= 7);
  const acc = C.hexToOklch(p.accent);
  assert.ok(acc[1] > 0.06 && (acc[2] < 50 || acc[2] > 340), `accent should be red-ish: h=${acc[2]} C=${acc[1]}`);
  assert.strictEqual(p.cursor, p.accent);
  assert.ok(C.contrast(p.foreground, p.selectionBackground) >= 4.5);
  assert.ok(hueDist(C.hexToOklch(p.ansi.red)[2], 25) < 25);
  assert.ok(hueDist(C.hexToOklch(p.ansi.blue)[2], 255) < 25);
  const opts = { image: img, opacity: 0.85, dim: 0.3 };
  assert.deepStrictEqual(K.report(p).filter((r) => !r.ok), [], 'scheme output already meets the contrast rules');
  const fixed = K.fix(p, opts).palette;
  const rows = K.report(fixed, opts);
  assert.deepStrictEqual(rows.filter((r) => !r.ok), []);
  for (const n of [...P.ANSI_NAMES.slice(1, 8), ...P.BRIGHT_NAMES.slice(1, 8)]) assert.ok(C.contrast(fixed.ansi[n], fixed.background) >= 4.5, n);
});

test('scheme: blue/teal image -> blue-ish accent; brights are lighter than normals', () => {
  const img = H.blocks(120, 60, [[0, 0, 120, 30, '#0B1E33'], [0, 30, 70, 30, '#1F6F8B'], [70, 30, 50, 30, '#2E86C1']], '#0B1E33');
  const sw = P.extract(img);
  const p = P.scheme(sw, { mode: 'dark' });
  checkShape(p);
  const h = C.hexToOklch(p.accent)[2];
  assert.ok(h > 190 && h < 275, `accent hue ${h}`);
  const fixed = K.fix(p).palette;
  for (const n of [...P.ANSI_NAMES.slice(1, 8), ...P.BRIGHT_NAMES.slice(1, 8)]) assert.ok(C.contrast(fixed.ansi[n], fixed.background) >= 4.5, n);
  for (const n of ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan']) {
    const b = 'bright' + n[0].toUpperCase() + n.slice(1);
    assert.ok(C.hexToOklch(p.ansi[b])[0] > C.hexToOklch(p.ansi[n])[0], n);
  }
  // a swatch near blue's hue is used: blue picks up the image's chroma, not a generic default
  assert.ok(hueDist(C.hexToOklch(p.ansi.blue)[2], 255) < 25);
});

test('scheme: muted images give muted ANSI colors, vivid ones vivid', () => {
  const muted = P.scheme(P.extract(H.blocks(60, 60, [[0, 0, 30, 60, '#2B2B2E'], [30, 0, 30, 60, '#5B5560']], '#2B2B2E')));
  const vivid = P.scheme(P.extract(H.blocks(60, 60, [[0, 0, 20, 60, '#101028'], [20, 0, 20, 60, '#FF2A6D'], [40, 0, 20, 60, '#05D9E8']], '#101028')));
  const meanC = (p) => ['green', 'yellow', 'cyan', 'magenta'].reduce((a, n) => a + C.hexToOklch(p.ansi[n])[1], 0) / 4;
  assert.ok(meanC(vivid) > meanC(muted) + 0.03, `${meanC(vivid)} vs ${meanC(muted)}`);
});

test('scheme: light mode and accent override', () => {
  const sw = P.extract(H.blocks(60, 60, [[0, 0, 60, 40, '#F4EFE6'], [0, 40, 60, 20, '#2E6F95']], '#F4EFE6'));
  const p = P.scheme(sw, { mode: 'light', accent: '#c0392b' });
  checkShape(p);
  assert.strictEqual(p.accent, '#C0392B');
  assert.strictEqual(p.cursor, '#C0392B');
  const L = C.hexToOklch(p.background)[0];
  assert.ok(L >= 0.945 && L <= 0.985, `light bg L ${L}`);
  assert.ok(C.contrast(p.foreground, p.background) >= 7);
  const fixed = K.fix(p).palette;
  assert.deepStrictEqual(K.report(fixed).filter((r) => !r.ok), []);
  assert.throws(() => P.scheme([], {}), /no swatches/);
  assert.throws(() => P.scheme(sw, { mode: 'sepia' }), /mode/);
});

// ---- fromScheme ------------------------------------------------------------

const ITERM = (() => {
  const col = (name, r, g, b) => `<key>${name}</key><dict><key>Alpha Component</key><real>1</real><key>Blue Component</key><real>${b}</real><key>Color Space</key><string>sRGB</string><key>Green Component</key><real>${g}</real><key>Red Component</key><real>${r}</real></dict>`;
  const ansi = [];
  for (let i = 0; i < 16; i++) ansi.push(col(`Ansi ${i} Color`, i / 15, 0.5, 1 - i / 15));
  return `<?xml version="1.0"?><plist version="1.0"><dict>${ansi.join('\n')}
${col('Background Color', 0.1, 0.2, 0.3)}${col('Foreground Color', 1, 1, 1)}${col('Cursor Color', 1, 0, 0)}${col('Selection Color', 0, 0, 1)}</dict></plist>`;
})();

test('fromScheme: iTerm2 .itermcolors', () => {
  const p = P.fromScheme(ITERM, 'iterm');
  checkShape(p);
  assert.strictEqual(p.background, '#1A334D');
  assert.strictEqual(p.foreground, '#FFFFFF');
  assert.strictEqual(p.cursor, '#FF0000');
  assert.strictEqual(p.selectionBackground, '#0000FF');
  assert.strictEqual(p.ansi.black, '#0080FF');
  assert.strictEqual(p.ansi.brightWhite, '#FF8000');
  assert.strictEqual(p.ansi.red, C.rgbToHex([Math.round(255 / 15), 128, Math.round(255 * (1 - 1 / 15))]));
  assert.strictEqual(P.fromScheme(ITERM).background, '#1A334D', 'format auto-detected');
  assert.throws(() => P.fromScheme('<plist><dict></dict></plist>', 'iterm'), /no colors/);
});

const BASE16 = `scheme: "Test"
author: "me"
base00: "1e1e2e"
base01: "181825"
base02: "313244"
base03: "45475a"
base04: "585b70"
base05: "cdd6f4"
base06: "f5e0dc"
base07: "b4befe"
base08: "f38ba8"
base09: "fab387"
base0A: "f9e2af"
base0B: "a6e3a1"
base0C: "94e2d5"
base0D: "89b4fa"
base0E: "cba6f7"
base0F: "f2cdcd"
`;

test('fromScheme: base16 YAML follows the styling-guide mapping', () => {
  const p = P.fromScheme(BASE16, 'base16');
  checkShape(p);
  assert.strictEqual(p.background, '#1E1E2E');
  assert.strictEqual(p.foreground, '#CDD6F4');
  assert.strictEqual(p.ansi.red, '#F38BA8');
  assert.strictEqual(p.ansi.green, '#A6E3A1');
  assert.strictEqual(p.ansi.yellow, '#F9E2AF');
  assert.strictEqual(p.ansi.blue, '#89B4FA');
  assert.strictEqual(p.ansi.magenta, '#CBA6F7');
  assert.strictEqual(p.ansi.cyan, '#94E2D5');
  assert.strictEqual(p.ansi.brightBlack, '#45475A');
  assert.strictEqual(p.ansi.brightWhite, '#B4BEFE');
  assert.strictEqual(p.ansi.brightRed, p.ansi.red);
  assert.strictEqual(p.selectionBackground, '#313244');
});

test('fromScheme: base16 missing keys throws', () => {
  assert.throws(() => P.fromScheme(BASE16.replace(/base0C.*\n/, ''), 'base16'), /missing base0C/);
});

const WT = {
  name: 'Test', background: '#0C0C0C', foreground: '#CCCCCC', cursorColor: '#FFFFFF', selectionBackground: '#334455',
  black: '#0C0C0C', red: '#C50F1F', green: '#13A10E', yellow: '#C19C00', blue: '#0037DA', purple: '#881798', cyan: '#3A96DD', white: '#CCCCCC',
  brightBlack: '#767676', brightRed: '#E74856', brightGreen: '#16C60C', brightYellow: '#F9F1A5', brightBlue: '#3B78FF', brightPurple: '#B4009E', brightCyan: '#61D6D6', brightWhite: '#F2F2F2',
};

test('fromScheme: Windows Terminal JSON (purple -> magenta), string or object', () => {
  for (const input of [JSON.stringify(WT), WT, JSON.stringify({ schemes: [WT] })]) {
    const p = P.fromScheme(input, 'windows-terminal');
    checkShape(p);
    assert.strictEqual(p.ansi.magenta, '#881798');
    assert.strictEqual(p.ansi.brightMagenta, '#B4009E');
    assert.strictEqual(p.background, '#0C0C0C');
    assert.strictEqual(p.cursor, '#FFFFFF');
    assert.strictEqual(p.selectionBackground, '#334455');
    assert.strictEqual(p.ansi.brightWhite, '#F2F2F2');
  }
  assert.throws(() => P.fromScheme('{ nope', 'windows-terminal'), /invalid JSON/);
});

const ALACRITTY = `
[colors.primary]
background = "#1d1f21"
foreground = '#c5c8c6'

[colors.cursor]
text = "#1d1f21"
cursor = "#c5c8c6"

[colors.selection]
background = "0x373b41"

[colors.normal]
black   = "#1d1f21"
red     = "#cc6666"
green   = "#b5bd68"
yellow  = "#f0c674"
blue    = "#81a2be"
magenta = "#b294bb"
cyan    = "#8abeb7"
white   = "#c5c8c6"

[colors.bright]
black   = "#969896"
red     = "#cc6666"
green   = "#b5bd68"
yellow  = "#f0c674"
blue    = "#81a2be"
magenta = "#b294bb"
cyan    = "#8abeb7"
white   = "#ffffff"  # comment
`;

test('fromScheme: Alacritty TOML colors sections', () => {
  const p = P.fromScheme(ALACRITTY, 'alacritty');
  checkShape(p);
  assert.strictEqual(p.background, '#1D1F21');
  assert.strictEqual(p.foreground, '#C5C8C6');
  assert.strictEqual(p.cursor, '#C5C8C6');
  assert.strictEqual(p.selectionBackground, '#373B41');
  assert.strictEqual(p.ansi.magenta, '#B294BB');
  assert.strictEqual(p.ansi.brightBlack, '#969896');
  assert.strictEqual(p.ansi.brightWhite, '#FFFFFF');
  const inline = P.fromScheme('[colors]\nprimary = { background = "#000000", foreground = "#ffffff" }\nnormal = { red = "#ff0000" }', 'alacritty');
  assert.strictEqual(inline.ansi.red, '#FF0000');
  assert.strictEqual(inline.background, '#000000');
  assert.throws(() => P.fromScheme('x = 1', 'alacritty'), /no \[colors/);
  assert.throws(() => P.fromScheme('x', 'kitty'), /unknown format/);
});

// ---- contrast ----------------------------------------------------------------

test('contrast.report rows and fix: only lightness changes, hue untouched', () => {
  const p = P.fromScheme(WT, 'windows-terminal'); // real-world scheme: blue on black fails
  const rows = K.report(p);
  assert.strictEqual(rows.length, 1 + 16 + 1);
  for (const r of rows) { assert.ok(typeof r.pair === 'string' && typeof r.ratio === 'number' && typeof r.min === 'number' && typeof r.ok === 'boolean'); }
  const row = (pair) => rows.find((r) => r.pair === pair);
  assert.strictEqual(row('foreground/background').min, 7);
  assert.strictEqual(row('ansi.black/background').min, 1.5);
  assert.strictEqual(row('ansi.brightBlack/background').min, 3);
  assert.strictEqual(row('ansi.blue/background').min, 4.5);
  assert.strictEqual(row('ansi.blue/background').ok, false);
  const { palette, changes } = K.fix(p);
  assert.ok(changes.length > 0);
  assert.deepStrictEqual(K.report(palette).filter((r) => !r.ok), []);
  for (const ch of changes) {
    const a = C.hexToOklch(ch.from), b = C.hexToOklch(ch.to);
    if (a[1] > 0.03 && b[1] > 0.03) assert.ok(hueDist(a[2], b[2]) < 4, `${ch.key} hue ${a[2]} -> ${b[2]}`);
  }
  assert.strictEqual(palette.background, p.background);
  assert.strictEqual(palette.ansi.red === p.ansi.red, C.contrast(p.ansi.red, p.background) >= 4.5, 'passing colors are left alone');
  assert.notStrictEqual(palette, p, 'input is not mutated');
  assert.strictEqual(p.ansi.blue, '#0037DA');
  assert.deepStrictEqual(K.fix(palette).changes, []);
});

test('contrast: image rows use dim/opacity and the worst region; fix lifts the foreground', () => {
  const p = P.scheme(P.extract(H.blocks(40, 40, [[0, 0, 40, 40, '#1A1626'], [0, 0, 8, 8, '#E94560']], '#1A1626')), { mode: 'dark' });
  const bright = H.blocks(120, 80, [[80, 40, 40, 40, '#707070']], '#202020'); // one brighter corner
  const bad = K.report(p, { image: bright });
  const row = bad.find((r) => r.pair.startsWith('foreground/image'));
  assert.ok(row && !row.ok, `expected failure, got ${row && row.ratio}`);
  assert.match(row.pair, /col [23] row [12]/);
  const dimmed = K.report(p, { image: bright, dim: 0.7, opacity: 0.6 }).find((r) => r.pair.startsWith('foreground/image'));
  assert.ok(dimmed.ratio > row.ratio && dimmed.ok);
  const { palette, changes } = K.fix(p, { image: bright });
  assert.ok(K.report(palette, { image: bright }).every((r) => r.ok), 'all rows pass');
  assert.ok(changes.some((c) => c.key === 'foreground'));
});

test('fromScheme detects an Alacritty TOML that starts with a [colors.*] table', () => {
  const toml = "[colors.primary]\nbackground = '#101010'\nforeground = '#e0e0e0'\n\n[colors.normal]\nblack = '#000000'\nred = '#cc0000'\ngreen = '#00cc00'\nyellow = '#cccc00'\nblue = '#0000cc'\nmagenta = '#cc00cc'\ncyan = '#00cccc'\nwhite = '#cccccc'\n";
  const p = require('../../kit/palette').fromScheme(toml);
  assert.strictEqual(p.background.toLowerCase(), '#101010');
});
