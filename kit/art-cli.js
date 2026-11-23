'use strict';
// `tmt art ...`: scene, treat, palette, scheme, contrast, ascii, preview. main(argv) gets the raw args after `art`.
// Errors are thrown as Error with a readable message; the caller prints them.
const fs = require('fs');
const path = require('path');
const image = require('./image');
const png = require('./png');
const scene = require('./scene');
const treat = require('./treat');
const ascii = require('./ascii');
const preview = require('./preview');
const palette = require('./palette');
const contrast = require('./contrast');
const { ANSI_NAMES, BRIGHT_NAMES } = palette;

const HELP = `tmt art: build the visual anchor, the background and the palette

  tmt art scene <out.png> [--preset name] [--seed n] [--width w --height h] [--palette look.json|scheme-file]
      paint a generated scene (presets: ${Object.keys(scene.presets).join(', ')}); same seed, same pixels
  tmt art treat <in> <out.png> [--fit WxH] [--mode cover|contain] [--align topRight] [--dim 0.6] [--blur r]
        [--vignette a] [--bloom a] [--pixelate n] [--scanlines s] [--ascii alpha] [--tint #hex|background --tint-amount a]
        [--quantize look.json] [--dither none|ordered|fs] [--for-text look.json --opacity 0.9]
      make a background; --for-text adds just enough dim/blur that the palette's text is readable
  tmt art palette <image> [--mode dark|light] [--accent #hex] [--out look-palette.json]
      extract colors, build a 16-color scheme, fix contrast (lightness only), print the result
  tmt art scheme <file> [--format auto|base16|alacritty|iterm|windows-terminal|kitty|ghostty|xresources] [--out file.json]
      import an existing color scheme
  tmt art contrast <look.json> [--image bg.png --opacity 0.9]
      WCAG ratios for text, ANSI colors and (if there is a background image) text over the image
  tmt art ascii <image> [--cols 40] [--charset blocks|ascii|braille|halfblock] [--color none|ansi16|truecolor]
        [--palette look.json] [--out file]
      ASCII/ANSI art (fastfetch logo files, banners)
  tmt art preview <look.json> [--out preview.html] [--swatch swatch.png]
      mock terminal page with the real palette, font, background and prompt, for approval

Paths inside look.json are relative to the look file. Add --json for machine-readable output.`;

const ALLOWED = {
  scene: ['preset', 'seed', 'width', 'height', 'palette'],
  treat: ['fit', 'mode', 'align', 'dim', 'blur', 'vignette', 'bloom', 'pixelate', 'scanlines', 'ascii', 'tint', 'tint-amount', 'quantize', 'dither', 'for-text', 'opacity'],
  palette: ['mode', 'accent', 'out'],
  scheme: ['format', 'out'],
  contrast: ['image', 'opacity'],
  ascii: ['cols', 'charset', 'color', 'palette', 'out', 'invert'],
  preview: ['out', 'swatch'],
};
const BOOLEAN = new Set(['json', 'invert', 'help']);

function parseArgs(argv) {
  const flags = {}, pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') { pos.push(...argv.slice(i + 1)); break; }
    if (a.startsWith('--') && a.length > 2) {
      const eq = a.indexOf('=');
      if (eq > 0) { flags[a.slice(2, eq)] = a.slice(eq + 1); continue; }
      const k = a.slice(2), next = argv[i + 1];
      if (BOOLEAN.has(k)) flags[k] = true;
      else if (next !== undefined && !(next.startsWith('--') && next.length > 2)) { flags[k] = next; i++; } else flags[k] = true;
    } else pos.push(a);
  }
  return { flags, pos };
}

function checkFlags(cmd, flags) {
  for (const k of Object.keys(flags)) {
    if (k === 'json') continue;
    if (!ALLOWED[cmd].includes(k)) throw new Error(`tmt art ${cmd}: unknown option --${k} (allowed: ${ALLOWED[cmd].map((x) => '--' + x).join(' ')} --json)`);
  }
}

// --flag value as a string; true (flag without value) is an error unless `bare` is allowed.
function str(flags, k, { bare = false } = {}) {
  const v = flags[k];
  if (v === undefined) return undefined;
  if (v === true) { if (bare) return true; throw new Error(`--${k} needs a value`); }
  return v;
}
function num(flags, k, lo, hi) {
  const v = str(flags, k);
  if (v === undefined) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) throw new Error(`--${k} must be a number from ${lo} to ${hi}, got "${v}"`);
  return n;
}
const need = (pos, n, usage) => { if (pos.length < n) throw new Error(`usage: ${usage}`); };

function readText(file, what) {
  try { return fs.readFileSync(file, 'utf8').replace(/^﻿/, ''); } catch (e) { throw new Error(`Cannot read ${what || 'file'} ${file}: ${e.code === 'ENOENT' ? 'not found' : e.message}`); }
}

function readJson(file, what) {
  const text = readText(file, what);
  try { return JSON.parse(text); } catch (e) {
    try { return JSON.parse(text.replace(/^\s*\/\/.*$/gm, '')); } catch (_) { throw new Error(`${file} is not valid JSON: ${e.message}`); }
  }
}

function readLook(file) {
  const look = readJson(file, 'look file');
  if (!look || typeof look !== 'object' || !look.palette) throw new Error(`${file} is not a look spec (no "palette")`);
  return { look, dir: path.dirname(path.resolve(file)) };
}

// ---------------------------------------------------------------- scheme import

function confToScheme(text) {
  const idx = {}, named = {};
  const hex = (v) => '#' + v.replace(/^#|^0x/i, '');
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line[0] === '#' || line[0] === '!' || line.startsWith('//')) continue;
    let m = /^(?:[\w*.]*[*.])?color(\d{1,2})\s*[:=\s]\s*(#?[0-9a-f]{6})\b/i.exec(line); // kitty, xresources
    if (m) { idx[+m[1]] = hex(m[2]); continue; }
    m = /^palette\s*=\s*(\d{1,2})\s*=\s*(#?[0-9a-f]{6})\b/i.exec(line); // ghostty
    if (m) { idx[+m[1]] = hex(m[2]); continue; }
    m = /^(?:[\w*.]*[*.])?(background|foreground|cursor|cursor[_-]color|cursorColor|selection[_-]background)\s*[:=\s]\s*(#?[0-9a-f]{6})\b/i.exec(line);
    if (m) named[m[1].toLowerCase().replace(/[_-]/g, '')] = hex(m[2]);
  }
  if (Object.keys(idx).length < 8 || !named.background || !named.foreground) throw new Error('no color0..color15 plus background/foreground found; is this a kitty, ghostty or Xresources color file?');
  const wt = { background: named.background, foreground: named.foreground, cursorColor: named.cursorcolor || named.cursor, selectionBackground: named.selectionbackground };
  ['black', 'red', 'green', 'yellow', 'blue', 'purple', 'cyan', 'white'].forEach((n, i) => {
    if (idx[i]) wt[n] = idx[i];
    if (idx[i + 8]) wt['bright' + n[0].toUpperCase() + n.slice(1)] = idx[i + 8];
  });
  return wt;
}

function importScheme(text, format) {
  const f = format && format !== 'auto' ? String(format).toLowerCase() : null;
  if (f === 'kitty' || f === 'ghostty' || f === 'xresources') return palette.fromScheme(confToScheme(text), 'windows-terminal');
  if (!f && (/^\s*color\d+\s+#?[0-9a-f]{6}/im.test(text) || /^\s*palette\s*=\s*\d+\s*=/im.test(text) || /color\d+\s*:\s*#?[0-9a-f]{6}/i.test(text))) {
    return palette.fromScheme(confToScheme(text), 'windows-terminal');
  }
  // palette.fromScheme sniffs a leading "[" as JSON, which misreads an Alacritty TOML that starts with "[colors.primary]"
  if (!f && /^\s*\[colors[.\]]/m.test(text) && !/^\s*[{[]\s*["{]/.test(text)) return palette.fromScheme(text, 'alacritty');
  return palette.fromScheme(text, f || undefined);
}

// look.json (palette inside), a bare palette json, or any scheme file
function loadPalette(file) {
  const text = readText(file, 'palette file');
  let obj = null;
  try { obj = JSON.parse(text); } catch (_) { /* not JSON */ }
  if (obj && obj.palette && obj.palette.ansi) return treat.normalizePalette(obj.palette);
  if (obj && obj.ansi && obj.background) return treat.normalizePalette(obj);
  return treat.normalizePalette(importScheme(text));
}

// ---------------------------------------------------------------- output

function emit(json, data, text) {
  process.stdout.write((json ? JSON.stringify(data, null, 2) : text) + '\n');
  return data;
}

function paletteText(p) {
  const lines = [
    `background ${p.background}  foreground ${p.foreground}  cursor ${p.cursor}  selection ${p.selectionBackground}  accent ${p.accent}`,
    ...[ANSI_NAMES, BRIGHT_NAMES].map((names) => names.map((n) => `${n} ${p.ansi[n]}`).join('  ')),
  ];
  return lines.join('\n');
}

function reportText(rows) {
  const w = Math.max(...rows.map((r) => r.pair.length));
  const lines = rows.map((r) => `${r.ok ? 'ok ' : 'LOW'} ${r.pair.padEnd(w)}  ${r.ratio.toFixed(2).padStart(5)}:1  (needs ${r.min}:1)`);
  return `${lines.join('\n')}\n${rows.filter((r) => r.ok).length} of ${rows.length} pairs pass`;
}

// ---------------------------------------------------------------- commands

function cmdScene(pos, flags, json) {
  need(pos, 1, 'tmt art scene <out.png> [--preset name] [--seed n] [--width w --height h] [--palette file]');
  const presetName = str(flags, 'preset') || 'minimal-gradient';
  if (!scene.presets[presetName]) throw new Error(`unknown preset "${presetName}" (${Object.keys(scene.presets).join(', ')})`);
  const width = num(flags, 'width', 16, 8192) ?? 1920, height = num(flags, 'height', 16, 8192) ?? 1200;
  const seedRaw = str(flags, 'seed') ?? '1';
  const seed = /^-?\d+$/.test(seedRaw) ? Number(seedRaw) : seedRaw;
  const pal = flags.palette !== undefined ? loadPalette(str(flags, 'palette')) : undefined;
  const t0 = Date.now();
  const img = scene.paint({ preset: presetName, width, height, seed, palette: pal });
  image.save(img, pos[0]);
  const data = { file: path.resolve(pos[0]), width, height, preset: presetName, seed, bytes: fs.statSync(pos[0]).size, ms: Date.now() - t0 };
  return emit(json, data, `Painted ${presetName} ${width}x${height} (seed ${seed}) in ${data.ms} ms -> ${pos[0]} (${data.bytes} bytes)`);
}

function cmdTreat(pos, flags, json) {
  need(pos, 2, 'tmt art treat <in> <out.png> [--fit WxH] [--dim 0.6] [--blur r] [--vignette a] [--quantize look.json] [--for-text look.json]');
  let img = image.load(pos[0]);
  const forTextFile = str(flags, 'for-text'), quantFile = str(flags, 'quantize'), tintArg = str(flags, 'tint', { bare: true });
  const ctx = {};
  const palFile = forTextFile || quantFile;
  if (palFile) ctx.palette = loadPalette(palFile);
  const step = (op, key, flag, lo, hi) => {
    const v = str(flags, flag, { bare: true });
    if (v === undefined) return [];
    if (v === true) return [{ op }];
    return [{ op, [key]: num(flags, flag, lo, hi) }];
  };
  const steps = [];
  if (flags.fit !== undefined) {
    const m = /^(\d+)x(\d+)$/i.exec(str(flags, 'fit'));
    if (!m) throw new Error(`--fit expects WIDTHxHEIGHT, got "${flags.fit}"`);
    steps.push({ op: 'fit', width: +m[1], height: +m[2], mode: str(flags, 'mode'), align: str(flags, 'align') });
  }
  steps.push(...step('pixelate', 'size', 'pixelate', 1, 1000));
  if (quantFile) steps.push({ op: 'quantize', dither: str(flags, 'dither') || 'none' });
  steps.push(...step('blur', 'radius', 'blur', 0, 500));
  steps.push(...step('bloom', 'amount', 'bloom', 0, 1));
  steps.push(...step('ascii', 'alpha', 'ascii', 0, 255));
  steps.push(...step('scanlines', 'strength', 'scanlines', 0, 1));
  if (tintArg !== undefined) steps.push({ op: 'tint', color: tintArg === true ? 'background' : tintArg, amount: num(flags, 'tint-amount', 0, 1) ?? 0.3 });
  steps.push(...step('vignette', 'amount', 'vignette', 0, 1));
  steps.push(...step('dim', 'amount', 'dim', 0, 1));
  img = treat.apply(img, steps, ctx);
  const data = { in: path.resolve(pos[0]), out: path.resolve(pos[1]), steps };
  let extra = '';
  if (forTextFile) {
    const lookOpacity = (() => { try { const j = JSON.parse(readText(forTextFile)); return j.background && j.background.opacity; } catch (_) { return undefined; } })();
    const opacity = num(flags, 'opacity', 0, 1) ?? lookOpacity ?? 1;
    const r = treat.forText(img, ctx.palette, { opacity });
    img = r.image;
    data.forText = { opacity, dim: r.dim, blur: r.blur, ok: r.ok, failing: r.failing, report: r.report };
    steps.push(...r.steps);
    extra = `\nfor-text at opacity ${opacity}: dim ${r.dim}, blur ${r.blur}px, ${r.ok ? 'text is readable' : `STILL LOW for ${r.failing.map((f) => f.color).join(', ')} (use a darker image, lower opacity, or fix the palette)`}`;
  }
  image.save(img, pos[1]);
  data.width = img.width; data.height = img.height;
  return emit(json, data, `Treated ${pos[0]} -> ${pos[1]} (${img.width}x${img.height}) with ${steps.length ? steps.map((s) => s.op + (s.amount !== undefined ? ':' + s.amount : s.radius !== undefined ? ':' + s.radius : '')).join(', ') : 'no steps'}${extra}`);
}

function cmdPalette(pos, flags, json) {
  need(pos, 1, 'tmt art palette <image> [--mode dark|light] [--accent #hex] [--out file.json]');
  const mode = str(flags, 'mode') || 'dark';
  if (mode !== 'dark' && mode !== 'light') throw new Error(`--mode must be dark or light, got "${mode}"`);
  let accent = str(flags, 'accent');
  if (accent && /^[0-9a-f]{6}$/i.test(accent)) accent = '#' + accent;
  if (accent && !/^#[0-9a-f]{6}$/i.test(accent)) throw new Error(`--accent must be a #RRGGBB color, got "${accent}"`);
  const img = image.load(pos[0]);
  const swatches = palette.extract(img, 12);
  if (!swatches.length) throw new Error(`${pos[0]} has no opaque pixels to extract colors from`);
  const fixed = contrast.fix(palette.scheme(swatches, { mode, accent }));
  const pal = { source: `extracted from ${path.basename(pos[0])}`, ...fixed.palette };
  const rows = contrast.report(fixed.palette);
  if (flags.out !== undefined) {
    const out = str(flags, 'out');
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ palette: pal }, null, 2) + '\n');
  }
  const data = { palette: pal, swatches: swatches.map((s) => ({ hex: s.hex, share: Math.round(s.share * 1000) / 1000 })), changes: fixed.changes, report: rows, out: flags.out ? path.resolve(flags.out) : undefined };
  return emit(json, data, `${paletteText(pal)}\n\n${reportText(rows)}${fixed.changes.length ? `\nContrast fix moved lightness of: ${fixed.changes.map((c) => c.key).join(', ')}` : ''}${data.out ? `\nWrote ${flags.out}` : ''}`);
}

function cmdScheme(pos, flags, json) {
  need(pos, 1, 'tmt art scheme <file> [--format auto] [--out file.json]');
  const pal = treat.normalizePalette(importScheme(readText(pos[0], 'scheme file'), str(flags, 'format') || 'auto'));
  pal.source = `imported from ${path.basename(pos[0])}`;
  const rows = contrast.report(pal);
  if (flags.out !== undefined) {
    const out = str(flags, 'out');
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ palette: pal }, null, 2) + '\n');
  }
  return emit(json, { palette: pal, report: rows }, `${paletteText(pal)}\n\n${reportText(rows)}${flags.out ? `\nWrote ${flags.out}` : ''}`);
}

function lookBackground(look, dir) {
  const rel = look.background && look.background.image;
  return rel ? path.resolve(dir, rel) : null;
}

function cmdContrast(pos, flags, json) {
  need(pos, 1, 'tmt art contrast <look.json> [--image bg.png --opacity 0.9]');
  const { look, dir } = readLook(pos[0]);
  const pal = treat.normalizePalette(look.palette);
  let file = flags.image !== undefined ? path.resolve(str(flags, 'image')) : lookBackground(look, dir);
  let note = '';
  if (file && !fs.existsSync(file)) {
    if (flags.image !== undefined) throw new Error(`image not found: ${file}`);
    note = `\n(background image ${file} not found, text over image not checked)`;
    file = null;
  }
  const opacity = num(flags, 'opacity', 0, 1) ?? (look.background && look.background.opacity) ?? 1;
  const rows = contrast.report(pal, file ? { image: image.load(file), opacity } : {});
  const failing = rows.filter((r) => !r.ok);
  return emit(json, { ok: failing.length === 0, image: file || undefined, opacity: file ? opacity : undefined, rows }, `${file ? `Background ${file} at opacity ${opacity}\n` : ''}${reportText(rows)}${note}`);
}

function cmdAscii(pos, flags, json) {
  need(pos, 1, 'tmt art ascii <image> [--cols 40] [--charset blocks] [--color truecolor] [--out file]');
  const img = image.load(pos[0]);
  const cols = num(flags, 'cols', 1, 1000) ?? 40;
  const text = ascii.toAscii(img, {
    cols, charset: str(flags, 'charset') || 'blocks', color: str(flags, 'color') || 'none',
    palette: flags.palette !== undefined ? loadPalette(str(flags, 'palette')) : undefined, invert: flags.invert === true,
  });
  const rows = text.split('\n').length;
  if (flags.out !== undefined) {
    const out = str(flags, 'out');
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    fs.writeFileSync(out, text + '\n');
    return emit(json, { out: path.resolve(out), cols, rows }, `Wrote ${cols}x${rows} ${flags.charset || 'blocks'} art to ${out}`);
  }
  return emit(json, { cols, rows, text }, text);
}

function cmdPreview(pos, flags, json) {
  need(pos, 1, 'tmt art preview <look.json> [--out preview.html] [--swatch swatch.png]');
  const { look, dir } = readLook(pos[0]);
  const file = lookBackground(look, dir);
  if (file && !fs.existsSync(file)) throw new Error(`background image not found: ${file} (paths in the look are relative to ${dir}). Create it first, or remove background.image from the look.`);
  const out = str(flags, 'out') || 'preview.html';
  const page = preview.html({ look, background: file ? { image: image.load(file) } : undefined });
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, page);
  const data = { out: path.resolve(out), bytes: Buffer.byteLength(page) };
  if (flags.swatch !== undefined) {
    const sw = str(flags, 'swatch');
    fs.mkdirSync(path.dirname(path.resolve(sw)), { recursive: true });
    const img = preview.swatch(look.palette);
    fs.writeFileSync(sw, png.encode(img));
    data.swatch = path.resolve(sw);
  }
  return emit(json, data, `Wrote ${out} (${data.bytes} bytes)${data.swatch ? `\nWrote ${flags.swatch}` : ''}\nOpen it in a browser and approve the look before anything is applied.`);
}

const COMMANDS = { scene: cmdScene, treat: cmdTreat, palette: cmdPalette, scheme: cmdScheme, contrast: cmdContrast, ascii: cmdAscii, preview: cmdPreview };

function main(argv = []) {
  const { flags, pos } = parseArgs(argv);
  const cmd = pos.shift();
  const json = flags.json === true;
  if (!cmd || cmd === 'help' || flags.help === true || flags.h === true) {
    process.stdout.write(HELP + '\n');
    return { help: true };
  }
  const fn = COMMANDS[cmd];
  if (!fn) throw new Error(`unknown art command "${cmd}". Commands: ${Object.keys(COMMANDS).join(', ')}, help`);
  checkFlags(cmd, flags);
  return fn(pos, flags, json);
}

module.exports = { main, parseArgs, importScheme, loadPalette };
