'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const png = require('../../kit/png');
const R = require('../../kit/raster');
const H = require('./_helpers');

const ROOT = path.join(__dirname, '..', '..');
const CLI = path.join(ROOT, 'engine', 'cli.js');
const ECLIPSE = path.join(ROOT, 'presets', 'eclipse', 'look.json');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-art-'));
test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

const art = (...args) => spawnSync(process.execPath, [CLI, 'art', ...args], { encoding: 'utf8', cwd: tmp, timeout: 120000 });
const ok = (...args) => { const r = art(...args); assert.strictEqual(r.status, 0, `art ${args.join(' ')} failed: ${r.stderr}`); return r; };
const j = (...args) => JSON.parse(ok(...args, '--json').stdout);
const decode = (f) => png.decode(fs.readFileSync(path.join(tmp, f)));
const px = (img, x, y) => Array.from(img.data.subarray((y * img.width + x) * 4, (y * img.width + x) * 4 + 4));
const write = (name, text) => { fs.writeFileSync(path.join(tmp, name), text); return name; };

test('help lists every subcommand; unknown commands and options are rejected clearly', () => {
  const h = ok('help').stdout;
  for (const c of ['scene', 'treat', 'palette', 'scheme', 'contrast', 'ascii', 'preview']) assert.ok(h.includes(`tmt art ${c}`), c);
  assert.strictEqual(ok().stdout, h, 'no subcommand prints help');
  const bad = art('frobnicate');
  assert.notStrictEqual(bad.status, 0);
  assert.match(bad.stderr, /unknown art command "frobnicate"/);
  const flag = art('scene', 'x.png', '--colour', 'red');
  assert.notStrictEqual(flag.status, 0);
  assert.match(flag.stderr, /unknown option --colour/);
});

test('scene: writes a decodable PNG of the asked size; same seed is byte-identical; seeds and presets differ', () => {
  const out = j('scene', 'a.png', '--preset', 'eclipse', '--width', '320', '--height', '200', '--seed', '5');
  assert.strictEqual(out.preset, 'eclipse');
  assert.deepStrictEqual([out.width, out.height], [320, 200]);
  const img = decode('a.png');
  assert.deepStrictEqual([img.width, img.height], [320, 200]);
  ok('scene', 'b.png', '--preset=eclipse', '--width=320', '--height=200', '--seed=5');
  assert.ok(fs.readFileSync(path.join(tmp, 'a.png')).equals(fs.readFileSync(path.join(tmp, 'b.png'))));
  ok('scene', 'c.png', '--preset', 'nord-mountains', '--width', '320', '--height', '200', '--seed', '5');
  assert.ok(!fs.readFileSync(path.join(tmp, 'a.png')).equals(fs.readFileSync(path.join(tmp, 'c.png'))));
  const [r, g] = H.meanRgb(img);
  assert.ok(r > 3 * g, 'eclipse is red');
});

test('scene: --palette repaints the preset in another palette; errors are readable', () => {
  write('green.json', JSON.stringify({ palette: { background: '#001008', foreground: '#E8FFF0', accent: '#00FF66', ansi: { black: '#000000', red: '#FF5555', green: '#00B84D', yellow: '#B8FF00', blue: '#3377FF', magenta: '#00B84D', cyan: '#00FFD0', white: '#DDFFEE' } } }));
  ok('scene', 'g.png', '--preset', 'synthwave', '--width', '240', '--height', '150', '--palette', 'green.json');
  const [r, g] = H.meanRgb(decode('g.png'));
  assert.ok(g > r * 1.5, `green-ish: ${r} ${g}`);
  const bad = art('scene', 'x.png', '--preset', 'nope');
  assert.notStrictEqual(bad.status, 0);
  assert.match(bad.stderr, /unknown preset "nope"/);
  assert.match(art('scene', 'x.png', '--width', 'wide').stderr, /--width must be a number from 16 to 8192/);
  assert.match(art('scene', 'x.png', '--palette', 'missing.json').stderr, /Cannot read palette file missing\.json: not found/);
  assert.match(art('scene').stderr, /usage: tmt art scene/);
});

test('palette: extracts a full 16-color scheme from an image, fixes contrast, writes look-palette.json', () => {
  ok('scene', 'src.png', '--preset', 'synthwave', '--width', '320', '--height', '200');
  const out = j('palette', 'src.png', '--mode', 'dark', '--out', 'pal.json');
  const p = out.palette;
  assert.strictEqual(Object.keys(p.ansi).length, 16);
  for (const c of [p.background, p.foreground, p.cursor, p.selectionBackground, p.accent, ...Object.values(p.ansi)]) assert.match(c, /^#[0-9A-F]{6}$/);
  assert.strictEqual(p.source, 'extracted from src.png');
  assert.ok(out.report.find((r) => r.pair === 'foreground/background').ratio >= 7);
  assert.ok(out.report.every((r) => r.ok), 'after the fix every pair passes');
  const saved = JSON.parse(fs.readFileSync(path.join(tmp, 'pal.json'), 'utf8'));
  assert.deepStrictEqual(saved.palette, p);
  const light = j('palette', 'src.png', '--mode', 'light', '--accent', 'ff8800');
  assert.ok(light.palette.background > '#C', 'light background');
  assert.strictEqual(light.palette.accent, '#FF8800');
  const text = ok('palette', 'src.png').stdout;
  assert.match(text, /background #[0-9A-F]{6}/);
  assert.match(text, /pairs pass/);
  assert.match(art('palette', 'src.png', '--mode', 'sepia').stderr, /--mode must be dark or light/);
  assert.match(art('palette', 'nothing.png').stderr, /Cannot read image nothing\.png/);
});

test('scheme: imports base16, alacritty, kitty, ghostty and iTerm2 files', () => {
  const b16 = ['base00', 'base01', 'base02', 'base03', 'base04', 'base05', 'base06', 'base07', 'base08', 'base09', 'base0A', 'base0B', 'base0C', 'base0D', 'base0E', 'base0F']
    .map((k, i) => `${k}: "${(i * 0x111111 + 0x101010).toString(16).padStart(6, '0').slice(-6)}"`).join('\n');
  write('t.yaml', `scheme: "Test"\n${b16}\n`);
  const a = j('scheme', 't.yaml');
  assert.strictEqual(a.palette.background, '#101010');
  assert.strictEqual(a.palette.ansi.red, '#' + (8 * 0x111111 + 0x101010).toString(16).toUpperCase().padStart(6, '0').slice(-6));

  write('t.toml', '[colors.primary]\nbackground = "#1e1e2e"\nforeground = "#cdd6f4"\n[colors.normal]\nblack = "#45475a"\nred = "#f38ba8"\ngreen = "#a6e3a1"\nyellow = "#f9e2af"\nblue = "#89b4fa"\nmagenta = "#f5c2e7"\ncyan = "#94e2d5"\nwhite = "#bac2de"\n');
  const t = j('scheme', 't.toml');
  assert.strictEqual(t.palette.background, '#1E1E2E');
  assert.strictEqual(t.palette.ansi.red, '#F38BA8');

  const kitty = ['background #282a36', 'foreground #f8f8f2', 'cursor #f8f8f0', 'selection_background #44475a', '# comment',
    ...['#21222c', '#ff5555', '#50fa7b', '#f1fa8c', '#bd93f9', '#ff79c6', '#8be9fd', '#f8f8f2', '#6272a4', '#ff6e6e', '#69ff94', '#ffffa5', '#d6acff', '#ff92df', '#a4ffff', '#ffffff'].map((c, i) => `color${i} ${c}`)].join('\n');
  write('t.conf', kitty);
  const k = j('scheme', 't.conf');
  assert.strictEqual(k.palette.background, '#282A36');
  assert.strictEqual(k.palette.cursor, '#F8F8F0');
  assert.strictEqual(k.palette.selectionBackground, '#44475A');
  assert.strictEqual(k.palette.ansi.magenta, '#FF79C6');
  assert.strictEqual(k.palette.ansi.brightBlue, '#D6ACFF');

  const ghostty = ['background = 282a36', 'foreground = f8f8f2', ...['#21222c', '#ff5555', '#50fa7b', '#f1fa8c', '#bd93f9', '#ff79c6', '#8be9fd', '#f8f8f2', '#6272a4', '#ff6e6e', '#69ff94', '#ffffa5', '#d6acff', '#ff92df', '#a4ffff', '#ffffff'].map((c, i) => `palette = ${i}=${c}`)].join('\n');
  write('ghostty.conf', ghostty);
  assert.strictEqual(j('scheme', 'ghostty.conf', '--format', 'ghostty').palette.ansi.green, '#50FA7B');

  const iterm = '<plist><dict>' + ['Red', 'Green', 'Blue'].length + '</dict></plist>';
  assert.match(art('scheme', write('bad.itermcolors', iterm)).stderr, /iTerm2: no colors found/);

  const wt = { name: 'T', background: '#000000', foreground: '#FFFFFF', black: '#000000', red: '#FF0000', green: '#00FF00', yellow: '#FFFF00', blue: '#0000FF', purple: '#FF00FF', cyan: '#00FFFF', white: '#CCCCCC' };
  assert.strictEqual(j('scheme', write('wt.json', JSON.stringify(wt))).palette.ansi.magenta, '#FF00FF');
  assert.match(art('scheme', write('junk.txt', 'hello world')).stderr, /could not detect format/);
  const out = j('scheme', 't.toml', '--out', 'imported.json');
  assert.ok(fs.existsSync(path.join(tmp, 'imported.json')));
  assert.strictEqual(out.palette.source, 'imported from t.toml');
});

function makeLook(name, bg, opacity) {
  const look = JSON.parse(fs.readFileSync(ECLIPSE, 'utf8'));
  look.background = { image: bg, fit: 'cover', opacity };
  fs.mkdirSync(path.join(tmp, name), { recursive: true });
  fs.writeFileSync(path.join(tmp, name, 'look.json'), JSON.stringify(look));
  return look;
}

test('contrast: reports ratios; the background image (relative to the look) adds the text-over-image row', () => {
  makeLook('c1', 'art/bg.png', 1);
  fs.mkdirSync(path.join(tmp, 'c1', 'art'));
  ok('scene', 'c1/art/bg.png', '--preset', 'synthwave', '--width', '160', '--height', '100');
  const withImg = j('contrast', 'c1/look.json');
  assert.strictEqual(withImg.rows.length, 19);
  assert.ok(withImg.rows.find((r) => r.pair.startsWith('foreground/image')));
  assert.strictEqual(withImg.rows.find((r) => r.pair === 'foreground/background').ratio, 13.28);
  assert.strictEqual(withImg.ok, false);
  const dark = j('contrast', 'c1/look.json', '--image', 'c1/art/bg.png', '--opacity', '0.02');
  assert.strictEqual(dark.rows.find((r) => r.pair.startsWith('foreground/image')).ok, true, 'a nearly transparent image does not hurt');
  assert.strictEqual(dark.opacity, 0.02);
  const text = ok('contrast', 'c1/look.json').stdout;
  assert.match(text, /LOW ansi\.red\/background/);
  assert.match(text, /pairs pass/);
  makeLook('c2', 'gone.png', 1);
  assert.match(ok('contrast', 'c2/look.json').stdout, /not found, text over image not checked/);
  assert.strictEqual(j('contrast', 'c2/look.json').rows.length, 18);
  assert.match(art('contrast', 'c2/look.json', '--image', 'nope.png').stderr, /image not found/);
  assert.match(art('contrast', write('nolook.json', '{}')).stderr, /not a look spec/);
});

test('treat: fit + dim lowers luminance at the new size; --for-text makes the palette readable over the result', () => {
  ok('scene', 't1.png', '--preset', 'synthwave', '--width', '320', '--height', '200');
  const r = j('treat', 't1.png', 't2.png', '--fit', '100x100', '--dim', '0.5');
  assert.deepStrictEqual([r.width, r.height], [100, 100]);
  const before = R.stats(decode('t1.png')).mean, after = R.stats(decode('t2.png')).mean;
  assert.ok(after < before * 0.6, `${before} -> ${after}`);
  makeLook('t', 'x.png', 0.9);
  const ft = j('treat', 't1.png', 't3.png', '--for-text', 't/look.json');
  assert.strictEqual(ft.forText.opacity, 0.9, 'opacity defaults to the look background opacity');
  assert.ok(ft.forText.dim > 0);
  assert.strictEqual(ft.forText.ok, true);
  const row = ft.forText.report.find((x) => x.pair.startsWith('foreground/image'));
  assert.ok(row.ok);
  assert.ok(R.stats(decode('t3.png')).mean < before);
  ok('treat', 't1.png', 't4.png', '--quantize', 't/look.json', '--blur', '2', '--vignette', '--pixelate', '4');
  const q = decode('t4.png');
  assert.deepStrictEqual([q.width, q.height], [320, 200]);
  assert.match(art('treat', 't1.png', 'o.png', '--fit', 'big').stderr, /--fit expects WIDTHxHEIGHT/);
  assert.match(art('treat', 't1.png', 'o.png', '--dim', '2').stderr, /--dim must be a number from 0 to 1/);
  assert.match(art('treat', 't1.png').stderr, /usage: tmt art treat/);
});

test('ascii: writes art whose lines are exactly --cols wide; prints to stdout without --out', () => {
  ok('scene', 's.png', '--preset', 'night-ocean', '--width', '300', '--height', '200');
  const o = j('ascii', 's.png', '--cols', '30', '--charset', 'braille', '--out', 'logo.txt');
  assert.strictEqual(o.cols, 30);
  const lines = fs.readFileSync(path.join(tmp, 'logo.txt'), 'utf8').split('\n');
  assert.strictEqual(lines.pop(), '', 'trailing newline');
  assert.strictEqual(lines.length, o.rows);
  assert.strictEqual(lines.length, 10);
  for (const l of lines) assert.strictEqual([...l].length, 30);
  const colored = ok('ascii', 's.png', '--cols', '20', '--charset', 'halfblock', '--color', 'truecolor').stdout;
  assert.ok(colored.includes('\x1b[0;38;2;'));
  const stripped = colored.replace(/\x1b\[[0-9;]*m/g, '').trimEnd().split('\n');
  for (const l of stripped) assert.strictEqual([...l].length, 20);
  const lookPal = ok('ascii', 's.png', '--cols', '20', '--color', 'ansi16', '--palette', ECLIPSE).stdout;
  assert.match(lookPal, /\x1b\[0;(3|9)\dm/);
  assert.match(art('ascii', 's.png', '--charset', 'emoji').stderr, /unknown charset "emoji"/);
});

test('preview: writes a self-contained page and a swatch PNG for the Eclipse preset', () => {
  const r = j('preview', ECLIPSE, '--out', 'prev/preview.html', '--swatch', 'prev/swatch.png');
  const page = fs.readFileSync(path.join(tmp, 'prev', 'preview.html'), 'utf8');
  assert.strictEqual(r.bytes, Buffer.byteLength(page));
  assert.match(page, /<title>eclipse - terminal look preview<\/title>/);
  assert.match(page, /url\(data:image\/png;base64,/, 'the look background (relative to the look file) is embedded');
  assert.match(page, /opacity:0\.9"/);
  for (const hex of ['#0B0909', '#D8D2CF', '#F2201C', '#4D1216', '#E0201E', '#B3141B', '#F2EEEA']) assert.ok(page.includes(hex), hex);
  assert.match(page, /foreground\/image \(worst region/);
  const sw = decode('prev/swatch.png');
  assert.deepStrictEqual([sw.width, sw.height], [884, 294]);
  assert.deepStrictEqual(px(sw, 30, 30), [0x0b, 0x09, 0x09, 255]);
  assert.ok(ok('preview', ECLIPSE, '--out', 'p2.html').stdout.includes('approve the look'));
});

test('preview: a missing background image is an error that names the path, not a silent omission', () => {
  makeLook('pm', 'art/none.png', 1);
  const r = art('preview', 'pm/look.json', '--out', 'pm.html');
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /background image not found: .*none\.png/);
  assert.ok(!fs.existsSync(path.join(tmp, 'pm.html')));
  assert.match(art('preview', 'missing.json').stderr, /Cannot read look file missing\.json/);
});

test('the acceptance commands from the repo root work and the PNG decodes', () => {
  const out = path.join(tmp, 'acc', 'eclipse.png');
  const r = spawnSync(process.execPath, [CLI, 'art', 'scene', out, '--preset', 'eclipse', '--width', '640', '--height', '400'], { encoding: 'utf8', cwd: ROOT });
  assert.strictEqual(r.status, 0, r.stderr);
  const img = png.decode(fs.readFileSync(out));
  assert.deepStrictEqual([img.width, img.height], [640, 400]);
});
