'use strict';
// Palette extraction (median cut in OKLab), look-spec scheme generation, and scheme import.
const C = require('./color');

const clamp = C.clamp;
const ANSI_NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
const BRIGHT_NAMES = ANSI_NAMES.map((n) => 'bright' + n[0].toUpperCase() + n.slice(1));
const HUE_TARGET = { red: 25, yellow: 90, green: 145, cyan: 200, blue: 255, magenta: 330 };

const hueDiff = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

// ---------------------------------------------------------------- extract

// Returns [{ hex, share, L, C, h }] sorted by share (desc). Transparent pixels are ignored.
function extract(img, k = 12) {
  const { width: w, height: h, data: d } = img;
  const sx = Math.max(1, Math.ceil(w / 200)), sy = Math.max(1, Math.ceil(h / 200));
  const hist = new Map();
  let total = 0;
  for (let y = 0; y < h; y += sy) {
    for (let x = 0; x < w; x += sx) {
      const o = (y * w + x) * 4;
      if (d[o + 3] < 128) continue;
      const key = (d[o] << 16) | (d[o + 1] << 8) | d[o + 2];
      hist.set(key, (hist.get(key) || 0) + 1);
      total++;
    }
  }
  if (!total) return [];
  const items = [];
  for (const [key, n] of hist) items.push({ lab: C.rgbToOklab([key >> 16, (key >> 8) & 255, key & 255]), n });

  const makeBox = (list) => {
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    let n = 0;
    for (const it of list) {
      n += it.n;
      for (let c = 0; c < 3; c++) { if (it.lab[c] < lo[c]) lo[c] = it.lab[c]; if (it.lab[c] > hi[c]) hi[c] = it.lab[c]; }
    }
    let axis = 0, range = 0;
    for (let c = 0; c < 3; c++) if (hi[c] - lo[c] > range) { range = hi[c] - lo[c]; axis = c; }
    return { list, n, axis, range, priority: list.length > 1 ? range * Math.sqrt(n) : -1 };
  };

  const boxes = [makeBox(items)];
  while (boxes.length < k) {
    let bi = -1, bp = 0;
    boxes.forEach((b, i) => { if (b.priority > bp) { bp = b.priority; bi = i; } });
    if (bi < 0) break;
    const b = boxes[bi];
    const sorted = b.list.slice().sort((p, q) => p.lab[b.axis] - q.lab[b.axis]);
    let acc = 0, cut = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      acc += sorted[i].n;
      cut = i + 1;
      if (acc >= b.n / 2) break;
    }
    boxes.splice(bi, 1, makeBox(sorted.slice(0, cut)), makeBox(sorted.slice(cut)));
  }

  let sw = boxes.map((b) => {
    const m = [0, 0, 0];
    for (const it of b.list) for (let c = 0; c < 3; c++) m[c] += it.lab[c] * it.n;
    return { lab: m.map((v) => v / b.n), n: b.n };
  }).sort((p, q) => q.n - p.n);

  // merge near-duplicates (deltaE < 0.04), keeping the bigger swatch's identity
  const kept = [];
  for (const s of sw) {
    const hit = kept.find((t) => Math.hypot(t.lab[0] - s.lab[0], t.lab[1] - s.lab[1], t.lab[2] - s.lab[2]) < 0.04);
    if (hit) {
      const n = hit.n + s.n;
      hit.lab = hit.lab.map((v, c) => (v * hit.n + s.lab[c] * s.n) / n);
      hit.n = n;
    } else kept.push({ lab: s.lab, n: s.n });
  }
  return kept.sort((p, q) => q.n - p.n).map((s) => {
    const hex = C.rgbToHex(C.oklabToRgb(s.lab));
    const [L, Ch, hue] = C.oklabToOklch(C.rgbToOklab(C.hexToRgb(hex)));
    return { hex, share: s.n / total, L, C: Ch, h: hue };
  });
}

// ---------------------------------------------------------------- scheme

function circularMeanHue(list) { // [{h, w}]
  let x = 0, y = 0;
  for (const { h, w } of list) { x += w * Math.cos((h * Math.PI) / 180); y += w * Math.sin((h * Math.PI) / 180); }
  if (!x && !y) return null;
  const a = (Math.atan2(y, x) * 180) / Math.PI;
  return a < 0 ? a + 360 : a;
}

const lch = (L, c, h) => C.oklchToHex([L, c, h]);

function scheme(swatches, { mode = 'dark', accent } = {}) {
  if (!swatches || !swatches.length) throw new Error('scheme: no swatches');
  if (mode !== 'dark' && mode !== 'light') throw new Error(`scheme: mode must be "dark" or "light", got "${mode}"`);
  const dark = mode === 'dark';
  const sw = swatches.map((s) => ({ ...s }));

  const chromatic = sw.filter((s) => s.C >= 0.03);
  const imageHue = circularMeanHue(chromatic.map((s) => ({ h: s.h, w: s.share * s.C }))) ?? 255;
  const typicalC = clamp(
    chromatic.length ? chromatic.reduce((a, s) => a + s.C * s.share, 0) / chromatic.reduce((a, s) => a + s.share, 0) : 0.03,
    0.06, 0.16);

  // background
  const dominant = sw.filter((s) => s.share >= 0.03);
  const pool = dominant.length ? dominant : [sw.slice().sort((a, b) => b.share - a.share)[0]];
  const bgSw = pool.reduce((a, b) => ((dark ? b.L < a.L : b.L > a.L) ? b : a));
  const bgH = bgSw.C >= 0.01 ? bgSw.h : imageHue;
  const bgL = dark ? clamp(bgSw.L, 0.13, 0.20) : clamp(bgSw.L, 0.95, 0.98);
  const bgC = clamp(bgSw.C, 0.012, dark ? 0.045 : 0.03);
  const background = lch(bgL, bgC, bgH);

  // foreground: tinted near-white (dark) / near-black (light)
  const fgH = imageHue;
  const fgC = clamp(typicalC * 0.35, 0.01, 0.035);
  const foreground = C.ensureContrast(lch(dark ? 0.92 : 0.25, fgC, fgH), background, 8, 'auto');

  // accent
  let accentHex;
  if (accent) accentHex = C.rgbToHex(C.hexToRgb(accent));
  else {
    const cand = chromatic.filter((s) => s.share >= 0.004);
    const list = cand.length ? cand : sw.slice().sort((a, b) => b.C - a.C).slice(0, 1);
    const best = list.reduce((a, b) => {
      const sc = (s) => s.C * (0.4 + 0.6 * Math.min(1, s.share / 0.04));
      return sc(b) > sc(a) ? b : a;
    });
    const aL = dark ? clamp(best.L, 0.62, 0.82) : clamp(best.L, 0.35, 0.55);
    accentHex = C.ensureContrast(lch(aL, clamp(best.C * 1.25, 0.08, 0.2), best.h), background, 4.5, 'auto');
  }

  // ANSI hues
  const nL = dark ? 0.72 : 0.52, bL = dark ? nL + 0.1 : nL - 0.08;
  const ansi = {};
  for (const name of Object.keys(HUE_TARGET)) {
    const target = HUE_TARGET[name];
    const near = chromatic.filter((s) => s.C >= 0.04 && hueDiff(s.h, target) <= 25);
    let hue = target, chroma = typicalC;
    if (near.length) {
      const solid = near.filter((x) => x.share >= 0.005);
      const s = (solid.length ? solid : near).reduce((a, b) => (b.C > a.C ? b : a));
      let dh = ((s.h - target + 540) % 360) - 180; // signed shortest difference
      hue = (target + dh * 0.65 + 360) % 360;
      chroma = clamp(s.C, 0.05, 0.2);
    }
    ansi[name] = C.ensureContrast(lch(nL, chroma, hue), background, 4.7, 'auto');
    ansi['bright' + name[0].toUpperCase() + name.slice(1)] = C.ensureContrast(lch(bL, Math.min(0.22, chroma * 1.05), hue), background, 4.7, 'auto');
  }
  // neutrals
  if (dark) {
    ansi.black = C.ensureContrast(lch(bgL + 0.14, bgC, bgH), background, 1.6, 'auto');
    ansi.brightBlack = C.ensureContrast(lch(0.48, Math.min(bgC, 0.03), bgH), background, 3.2, 'auto');
    ansi.white = C.ensureContrast(lch(0.86, fgC, fgH), background, 4.7, 'auto');
    ansi.brightWhite = C.ensureContrast(lch(0.97, fgC * 0.5, fgH), background, 4.7, 'auto');
  } else {
    ansi.black = C.ensureContrast(lch(0.25, fgC, fgH), background, 1.6, 'auto');
    ansi.brightBlack = C.ensureContrast(lch(0.42, fgC, fgH), background, 3.2, 'auto');
    ansi.white = C.ensureContrast(lch(0.52, fgC, fgH), background, 4.7, 'auto');
    ansi.brightWhite = C.ensureContrast(lch(0.46, fgC, fgH), background, 4.7, 'auto');
  }

  // selection: background drifting toward accent while fg stays readable
  let selectionBackground = background;
  for (let t = 0.32; t >= 0.04; t -= 0.02) {
    selectionBackground = C.mix(background, accentHex, t);
    if (C.contrast(foreground, selectionBackground) >= 4.7) break;
  }

  const ordered = {};
  for (const n of ANSI_NAMES) ordered[n] = ansi[n];
  for (const n of BRIGHT_NAMES) ordered[n] = ansi[n];
  return { background, foreground, cursor: accentHex, selectionBackground, accent: accentHex, ansi: ordered };
}

// ---------------------------------------------------------------- fromScheme

const hex6 = (v) => {
  const h = String(v).trim().replace(/^#|^0x/i, '');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Invalid color value "${v}"`);
  return '#' + h.toUpperCase();
};

function finish(p, source) {
  const need = (k, v) => { if (!v) throw new Error(`${source}: missing ${k}`); return v; };
  const bg = need('background', p.background), fg = need('foreground', p.foreground);
  const a = p.ansi || {};
  const fallbackMix = (i) => C.mix(bg, fg, [0, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.8][i]);
  const ansi = {};
  ANSI_NAMES.forEach((n, i) => { ansi[n] = a[n] ? hex6(a[n]) : fallbackMix(i); });
  BRIGHT_NAMES.forEach((n, i) => { ansi[n] = a[n] ? hex6(a[n]) : ansi[ANSI_NAMES[i]]; });
  const accent = hex6(p.accent || p.cursor || ansi.blue);
  const cursor = hex6(p.cursor || accent);
  const selectionBackground = p.selectionBackground ? hex6(p.selectionBackground) : C.mix(bg, accent, 0.3);
  return { background: hex6(bg), foreground: hex6(fg), cursor, selectionBackground, accent, ansi };
}

function fromItermcolors(xml) {
  const colors = {};
  const re = /<key>([^<]+)<\/key>\s*<dict>([\s\S]*?)<\/dict>/g;
  let m;
  while ((m = re.exec(xml))) {
    const comp = {};
    const cre = /<key>(Red|Green|Blue) Component<\/key>\s*<real>([^<]+)<\/real>/g;
    let c;
    while ((c = cre.exec(m[2]))) comp[c[1]] = parseFloat(c[2]);
    if ('Red' in comp && 'Green' in comp && 'Blue' in comp) {
      colors[m[1].trim()] = C.rgbToHex([comp.Red, comp.Green, comp.Blue].map((v) => clamp(v, 0, 1) * 255));
    }
  }
  if (!Object.keys(colors).length) throw new Error('iTerm2: no colors found (is this an .itermcolors plist?)');
  const ansi = {};
  for (let i = 0; i < 16; i++) {
    const v = colors[`Ansi ${i} Color`];
    if (v) ansi[i < 8 ? ANSI_NAMES[i] : BRIGHT_NAMES[i - 8]] = v;
  }
  return finish({
    background: colors['Background Color'], foreground: colors['Foreground Color'],
    cursor: colors['Cursor Color'], selectionBackground: colors['Selection Color'], ansi,
  }, 'iTerm2');
}

function fromBase16(yaml) {
  const b = {};
  const re = /\bbase([0-9a-f]{2})\s*:\s*["']?#?([0-9a-f]{6})\b/gi;
  let m;
  while ((m = re.exec(yaml))) b['base' + m[1].toUpperCase()] = '#' + m[2].toUpperCase();
  for (let i = 0; i < 16; i++) if (!b['base' + i.toString(16).toUpperCase().padStart(2, '0')]) throw new Error(`base16: missing base${i.toString(16).toUpperCase().padStart(2, '0')}`);
  return finish({
    background: b.base00, foreground: b.base05, cursor: b.base05, selectionBackground: b.base02, accent: b.base0D,
    ansi: {
      black: b.base00, red: b.base08, green: b.base0B, yellow: b.base0A, blue: b.base0D, magenta: b.base0E, cyan: b.base0C, white: b.base05,
      brightBlack: b.base03, brightRed: b.base08, brightGreen: b.base0B, brightYellow: b.base0A, brightBlue: b.base0D,
      brightMagenta: b.base0E, brightCyan: b.base0C, brightWhite: b.base07,
    },
  }, 'base16');
}

function fromWindowsTerminal(input) {
  let o = input;
  if (typeof o === 'string') {
    try { o = JSON.parse(o.replace(/^﻿/, '').replace(/^\s*\/\/.*$/gm, '')); } catch (e) { throw new Error('Windows Terminal: invalid JSON (' + e.message + ')'); }
  }
  if (Array.isArray(o)) o = o[0];
  if (o && Array.isArray(o.schemes)) o = o.schemes[0];
  if (!o || typeof o !== 'object') throw new Error('Windows Terminal: expected a scheme object');
  const ansi = {};
  for (const n of ANSI_NAMES) {
    const wt = n === 'magenta' ? 'purple' : n;
    if (o[wt]) ansi[n] = o[wt];
    const bn = BRIGHT_NAMES[ANSI_NAMES.indexOf(n)];
    const bwt = 'bright' + wt[0].toUpperCase() + wt.slice(1);
    if (o[bwt]) ansi[bn] = o[bwt];
  }
  return finish({ background: o.background, foreground: o.foreground, cursor: o.cursorColor, selectionBackground: o.selectionBackground, ansi }, 'Windows Terminal');
}

function fromAlacritty(toml) {
  const vals = {}; // 'section.key' -> value
  let section = '';
  const setKV = (sec, key, val) => { vals[`${sec}.${key}`.replace(/^colors\./, '')] = val; };
  for (let raw of toml.split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, '').trim();
    if (!line || line.startsWith('#')) continue;
    const sec = line.match(/^\[([^\]]+)\]$/);
    if (sec) { section = sec[1].trim(); continue; }
    const inline = line.match(/^([\w.]+)\s*=\s*\{([^}]*)\}/);
    if (inline) {
      const base = (section ? section + '.' : '') + inline[1];
      for (const kv of inline[2].matchAll(/(\w+)\s*=\s*["']([^"']+)["']/g)) setKV(base, kv[1], kv[2]);
      continue;
    }
    const kv = line.match(/^([\w.]+)\s*=\s*["']([^"']+)["']/);
    if (kv) setKV(section, kv[1], kv[2]);
  }
  const ansi = {};
  for (const n of ANSI_NAMES) {
    if (vals[`normal.${n}`]) ansi[n] = vals[`normal.${n}`];
    if (vals[`bright.${n}`]) ansi[BRIGHT_NAMES[ANSI_NAMES.indexOf(n)]] = vals[`bright.${n}`];
  }
  if (!vals['primary.background'] && !Object.keys(ansi).length) throw new Error('Alacritty: no [colors.*] sections found');
  return finish({
    background: vals['primary.background'], foreground: vals['primary.foreground'],
    cursor: vals['cursor.cursor'], selectionBackground: vals['selection.background'], ansi,
  }, 'Alacritty');
}

const FORMATS = {
  iterm: fromItermcolors, itermcolors: fromItermcolors, iterm2: fromItermcolors,
  base16: fromBase16, yaml: fromBase16,
  'windows-terminal': fromWindowsTerminal, wt: fromWindowsTerminal, windowsterminal: fromWindowsTerminal, json: fromWindowsTerminal,
  alacritty: fromAlacritty, toml: fromAlacritty,
};

// obj: file text (or parsed object for Windows Terminal). format: iterm | base16 | windows-terminal | alacritty (auto-detected if omitted).
function fromScheme(obj, format) {
  if (!format) {
    if (obj && typeof obj === 'object') format = 'windows-terminal';
    else if (/<plist|<dict>/.test(obj)) format = 'iterm';
    else if (/^\s*[{[]/.test(obj)) format = 'windows-terminal';
    else if (/\bbase00\s*:/i.test(obj)) format = 'base16';
    else if (/\[colors\./.test(obj) || /\bprimary\b/.test(obj)) format = 'alacritty';
    else throw new Error('fromScheme: could not detect format; pass iterm | base16 | windows-terminal | alacritty');
  }
  const fn = FORMATS[String(format).toLowerCase()];
  if (!fn) throw new Error(`fromScheme: unknown format "${format}" (iterm | base16 | windows-terminal | alacritty)`);
  return fn(obj);
}

module.exports = { extract, scheme, fromScheme, ANSI_NAMES, BRIGHT_NAMES };
