'use strict';
// What the user's terminal looks like today, read from captured config files (tmt capture).
// Best effort and read-only: each field is a fact found in a file, or null when unknown.
// The audit (kit/audit.js) judges it; the setup skill keeps what passes.

const fs = require('fs');
const path = require('path');
const jsonc = require('../engine/jsonc');
const { fromScheme, fromParts, ANSI_NAMES, BRIGHT_NAMES } = require('./palette');

const hex6 = (v) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(v || '').trim());
  return m ? '#' + m[1].toUpperCase() : null;
};
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };

// Windows Terminal's default scheme and font, used when settings name none.
const CAMPBELL = {
  name: 'Campbell', background: '#0C0C0C', foreground: '#CCCCCC', cursorColor: '#FFFFFF', selectionBackground: '#FFFFFF',
  black: '#0C0C0C', red: '#C50F1F', green: '#13A10E', yellow: '#C19C00', blue: '#0037DA', purple: '#881798', cyan: '#3A96DD', white: '#CCCCCC',
  brightBlack: '#767676', brightRed: '#E74856', brightGreen: '#16C60C', brightYellow: '#F9F1A5', brightBlue: '#3B78FF', brightPurple: '#B4009E', brightCyan: '#61D6D6', brightWhite: '#F2F2F2',
};

function blank() {
  return {
    scheme: null, palette: null, stock: {},
    font: { family: null, size: null, lineHeight: null },
    window: { padding: null, opacity: null, blur: null, cursorShape: null },
    background: { image: null, opacity: null }, shader: false,
    layout: { panes: 1, startup: null }, source: null,
  };
}

// [top, right, bottom, left] from 1, 2 or 4 numbers in CSS-like "x y" order (horizontal first for WT).
function padWT(v) {
  const n = String(v).split(/[ ,]+/).map(num).filter((x) => x !== null);
  if (n.length === 1) return [n[0], n[0], n[0], n[0]];
  if (n.length === 2) return [n[1], n[0], n[1], n[0]];
  if (n.length === 4) return [n[1], n[2], n[3], n[0]]; // WT: left, top, right, bottom
  return null;
}

// ---------------------------------------------------------------- Windows Terminal
function windowsTerminal(text, source) {
  const o = jsonc.parse(text);
  const t = blank();
  t.source = source;
  const prof = (o.profiles && !Array.isArray(o.profiles) ? o.profiles : { list: o.profiles || [] });
  const defaults = prof.defaults || {};
  const def = (prof.list || []).find((p) => p.guid === o.defaultProfile) || {};
  const get = (k) => (def[k] !== undefined ? def[k] : defaults[k]);

  let schemeName = get('colorScheme');
  if (schemeName && typeof schemeName === 'object') schemeName = schemeName.dark || schemeName.light;
  const schemes = (o.schemes || []).concat([CAMPBELL]);
  t.scheme = schemeName || 'Campbell';
  t.stock.palette = !schemeName || schemeName === 'Campbell';
  const s = schemes.find((x) => x.name === t.scheme);
  if (s) t.palette = fromScheme(s, 'windows-terminal');

  const font = get('font') || {};
  t.font.family = font.face || get('fontFace') || 'Cascadia Mono';
  t.stock.font = !font.face && !get('fontFace');
  t.font.size = num(font.size !== undefined ? font.size : get('fontSize')) || 12;
  t.font.lineHeight = num(font.cellHeight);

  const pad = get('padding');
  t.window.padding = pad === undefined ? [8, 8, 8, 8] : padWT(pad);
  const op = get('opacity');
  t.window.opacity = op === undefined ? 1 : num(op) / 100;
  t.window.blur = get('useAcrylic') === true;
  t.window.cursorShape = get('cursorShape') || 'bar';
  if (get('backgroundImage')) { t.background.image = get('backgroundImage'); t.background.opacity = num(get('backgroundImageOpacity')) ?? 1; }
  t.shader = Boolean(get('experimental.pixelShaderPath'));

  const sa = o.startupActions;
  if (typeof sa === 'string' && sa.trim()) {
    t.layout.startup = sa;
    t.layout.panes = 1 + (sa.match(/\b(split-pane|sp)\b/g) || []).length;
  }
  return t;
}

// ---------------------------------------------------------------- kitty
const KITTY_CURSOR = { beam: 'bar', block: 'block', underline: 'underline' };
function kitty(text, source) {
  const t = blank();
  t.source = source;
  const p = { ansi: {} };
  let any = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [k, ...rest] = line.split(/\s+/);
    const v = rest.join(' ');
    const c = /^color(\d+)$/.exec(k);
    if (c && +c[1] < 16) { const i = +c[1]; p.ansi[i < 8 ? ANSI_NAMES[i] : BRIGHT_NAMES[i - 8]] = hex6(v); any = true; continue; }
    switch (k) {
      case 'background': p.background = hex6(v); any = true; break;
      case 'foreground': p.foreground = hex6(v); any = true; break;
      case 'cursor': p.cursor = hex6(v); break;
      case 'selection_background': p.selectionBackground = hex6(v); break;
      case 'font_family': t.font.family = v; break;
      case 'font_size': t.font.size = num(v); break;
      case 'modify_font': { const m = /^cell_height\s+([\d.]+)%/.exec(v); if (m) t.font.lineHeight = num(m[1]) / 100; break; }
      case 'window_padding_width': {
        const n = v.split(/\s+/).map(num);
        t.window.padding = n.length === 1 ? [n[0], n[0], n[0], n[0]] : n.length === 2 ? [n[0], n[1], n[0], n[1]] : n.length === 4 ? n : null;
        break;
      }
      case 'background_opacity': t.window.opacity = num(v); break;
      case 'background_blur': t.window.blur = num(v) > 0; break;
      case 'cursor_shape': t.window.cursorShape = KITTY_CURSOR[v] || v; break;
      case 'background_image': t.background.image = v; break;
      case 'include': if (/theme/i.test(v)) t.scheme = path.basename(v, path.extname(v)); break;
      default:
    }
  }
  if (any && p.background && p.foreground) t.palette = fromParts(p, source);
  return t;
}

// ---------------------------------------------------------------- Alacritty
function alacritty(text, source) {
  const t = blank();
  t.source = source;
  try { t.palette = fromScheme(text, 'alacritty'); } catch { /* no colors in this file */ }
  let section = '';
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, '').trim();
    const sec = /^\[([^\]]+)\]$/.exec(line);
    if (sec) { section = sec[1]; continue; }
    const kv = /^([\w.]+)\s*=\s*(.+)$/.exec(line);
    if (!kv) continue;
    const key = (section ? section + '.' : '') + kv[1];
    const val = kv[2].replace(/^["']|["']$/g, '');
    if (key === 'font.normal.family' || key === 'font.normal') t.font.family = (/family\s*=\s*["']([^"']+)/.exec(kv[2]) || [])[1] || val;
    else if (key === 'font.size') t.font.size = num(val);
    else if (key === 'window.opacity') t.window.opacity = num(val);
    else if (key === 'window.blur') t.window.blur = val === 'true';
    else if (key === 'window.padding') {
      const x = num((/x\s*=\s*([\d.]+)/.exec(kv[2]) || [])[1]);
      const y = num((/y\s*=\s*([\d.]+)/.exec(kv[2]) || [])[1]);
      if (x !== null && y !== null) t.window.padding = [y, x, y, x];
    } else if (key === 'cursor.style.shape' || key === 'cursor.style') t.window.cursorShape = String((/shape\s*=\s*["']?(\w+)/.exec(kv[2]) || [])[1] || val).toLowerCase().replace('beam', 'bar');
    else if (key === 'general.import' || key === 'import') { const m = /([\w-]+)\.toml/.exec(kv[2]); if (m) t.scheme = m[1]; }
  }
  return t;
}

// ---------------------------------------------------------------- WezTerm (lua, read by pattern)
function wezterm(text, source) {
  const t = blank();
  t.source = source;
  const str = (k) => (new RegExp(`\\b${k}\\s*=\\s*["']([^"']+)["']`).exec(text) || [])[1] || null;
  const n = (k) => num((new RegExp(`\\b${k}\\s*=\\s*([\\d.]+)`).exec(text) || [])[1]);
  t.scheme = str('color_scheme');
  const f = /\bfont\s*=\s*wezterm\.font(?:_with_fallback)?\s*\(\s*\{?\s*(?:family\s*=\s*)?["']([^"']+)["']/.exec(text);
  t.font.family = f ? f[1] : null;
  t.font.size = n('font_size');
  t.font.lineHeight = n('line_height');
  t.window.opacity = n('window_background_opacity');
  const pad = /window_padding\s*=\s*\{([^}]*)\}/.exec(text);
  if (pad) {
    const side = (s) => num((new RegExp(`${s}\\s*=\\s*['"]?([\\d.]+)`).exec(pad[1]) || [])[1]) ?? 0;
    t.window.padding = [side('top'), side('right'), side('bottom'), side('left')];
  }
  const cur = str('default_cursor_style');
  if (cur) t.window.cursorShape = /Bar/.test(cur) ? 'bar' : /Underline/.test(cur) ? 'underline' : 'block';
  if (/\bwindow_background_image\s*=/.test(text) || /\bbackground\s*=\s*\{/.test(text)) t.background.image = str('window_background_image') || 'configured';
  t.window.blur = /\b(macos_window_background_blur|win32_system_backdrop|kde_window_background_blur)\b/.test(text);
  const splits = (text.match(/:split\s*[({]|split_pane\s*\(|SplitHorizontal|SplitVertical|SplitPane/g) || []).length;
  // Only splits made at startup count as the layout; keybindings that split on demand do not.
  const startup = /gui-startup|mux-startup/.test(text) ? (text.match(/:split\s*[({]/g) || []).length : 0;
  t.layout.panes = 1 + startup;
  if (startup) t.layout.startup = 'gui-startup';
  if (splits && !startup) t.layout.splitKeys = true;
  return t;
}

// ---------------------------------------------------------------- Ghostty / foot (key = value)
function keyValue(text, source, map) {
  const t = blank();
  t.source = source;
  const p = { ansi: {} };
  let section = '';
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^\s*[#;].*$/, '').trim();
    const sec = /^\[([^\]]+)\]$/.exec(line);
    if (sec) { section = sec[1]; continue; }
    const m = /^([\w-]+)\s*=\s*(.*)$/.exec(line);
    if (m) map(section, m[1], m[2].trim().replace(/^["']|["']$/g, ''), t, p);
  }
  if (p.background && p.foreground) t.palette = fromParts(p, source);
  return t;
}
const ansiIndex = (i, p, v) => { if (i >= 0 && i < 16 && hex6(v)) p.ansi[i < 8 ? ANSI_NAMES[i] : BRIGHT_NAMES[i - 8]] = hex6(v); };
function ghostty(text, source) {
  return keyValue(text, source, (_, k, v, t, p) => {
    if (k === 'theme') t.scheme = v;
    else if (k === 'background') p.background = hex6(v);
    else if (k === 'foreground') p.foreground = hex6(v);
    else if (k === 'palette') { const m = /^(\d+)\s*=\s*(#?\w{6})/.exec(v); if (m) ansiIndex(+m[1], p, m[2]); }
    else if (k === 'font-family' && !t.font.family) t.font.family = v;
    else if (k === 'font-size') t.font.size = num(v);
    else if (k === 'adjust-cell-height') { const m = /([\d.]+)%/.exec(v); if (m) t.font.lineHeight = 1 + num(m[1]) / 100; }
    else if (k === 'window-padding-x') { const x = num(v); const pd = t.window.padding || [0, 0, 0, 0]; t.window.padding = [pd[0], x, pd[2], x]; }
    else if (k === 'window-padding-y') { const y = num(v); const pd = t.window.padding || [0, 0, 0, 0]; t.window.padding = [y, pd[1], y, pd[3]]; }
    else if (k === 'background-opacity') t.window.opacity = num(v);
    else if (k === 'background-blur' || k === 'background-blur-radius') t.window.blur = v !== 'false' && v !== '0';
    else if (k === 'cursor-style') t.window.cursorShape = v;
    else if (k === 'custom-shader') t.shader = true;
  });
}
function foot(text, source) {
  return keyValue(text, source, (sec, k, v, t, p) => {
    if (sec === '' && k === 'font') { const m = /^([^:]+)(?::size=([\d.]+))?/.exec(v); t.font.family = m[1].trim(); t.font.size = num(m[2]); }
    else if (sec === '' && k === 'pad') { const m = /^(\d+)x(\d+)/.exec(v); if (m) t.window.padding = [+m[2], +m[1], +m[2], +m[1]]; }
    else if (sec === '' && k === 'line-height') t.font.lineHeight = null;
    else if ((sec === 'colors' || sec === 'colors-dark') && k === 'background') p.background = hex6(v);
    else if ((sec === 'colors' || sec === 'colors-dark') && k === 'foreground') p.foreground = hex6(v);
    else if ((sec === 'colors' || sec === 'colors-dark') && k === 'alpha') t.window.opacity = num(v);
    else if ((sec === 'colors' || sec === 'colors-dark') && /^regular\d$/.test(k)) ansiIndex(+k.slice(7), p, v);
    else if ((sec === 'colors' || sec === 'colors-dark') && /^bright\d$/.test(k)) ansiIndex(8 + +k.slice(6), p, v);
    else if (sec === 'cursor' && k === 'style') t.window.cursorShape = v === 'beam' ? 'bar' : v;
  });
}

// ---------------------------------------------------------------- shells
const SHELL_FILES = {
  '.bashrc': 'bash', '.bash_profile': 'bash', '.zshrc': 'zsh', 'config.fish': 'fish', 'config.nu': 'nushell',
  'Microsoft.PowerShell_profile.ps1': 'powershell', 'profile.ps1': 'powershell',
};
// Files an rc file sources (captured under `<tool>/sourced/`), by extension.
const SOURCED_EXT = { '.bash': 'bash', '.sh': 'bash', '.zsh': 'zsh', '.ps1': 'powershell', '.fish': 'fish', '.nu': 'nushell' };
function promptOf(text, shell) {
  if (/starship\s+init/.test(text)) return 'starship';
  if (/oh-my-posh\s+(init|--init)/.test(text)) return 'oh-my-posh';
  if (/powerlevel10k|p10k/.test(text)) return 'powerlevel10k';
  if (/\bpure\b.*prompt|prompt\s+pure|sindresorhus\/pure/.test(text)) return 'pure';
  if (/oh-my-zsh\.sh|ZSH_THEME=/.test(text)) return 'oh-my-zsh';
  if (/bash-it|oh-my-bash/.test(text)) return 'framework';
  if (shell === 'powershell' && /function\s+(global:)?prompt\b/i.test(text)) return 'hand-rolled';
  if (shell === 'fish' && /function\s+fish_prompt/.test(text)) return 'hand-rolled';
  if (/^\s*(export\s+)?(PS1|PROMPT)=/m.test(text)) return 'hand-rolled';
  return 'default';
}
const FETCHES = ['fastfetch', 'neofetch', 'pfetch', 'nitch', 'macchina', 'onefetch', 'winfetch', 'screenfetch', 'hyfetch', 'freshfetch'];

// ---------------------------------------------------------------- entry
const TERMINAL_FILES = [
  [/^settings\.json$/i, 'windows-terminal', windowsTerminal, (dir) => /windows-terminal|WindowsTerminal/i.test(dir)],
  [/^kitty\.conf$/, 'kitty', kitty],
  [/^alacritty\.toml$/, 'alacritty', alacritty],
  [/^(\.?wezterm\.lua)$/, 'wezterm', wezterm],
  [/^config(\.ghostty)?$/, 'ghostty', ghostty, (dir) => /ghostty/i.test(dir)],
  [/^foot\.ini$/, 'foot', foot],
];

function walk(dir, out = []) {
  let ents = [];
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (fs.statSync(f).size < 2e6) out.push(f);
  }
  return out;
}

/**
 * Read the look of every terminal and shell found under a captured folder
 * (`<run>/captured/<tool>/<file>`). Unknown or unparsable files are listed in `notes`.
 */
function readCurrent(dir) {
  const result = { terminals: {}, prompt: {}, startup: { fetch: [], multiplexer: null }, notes: [] };
  for (const f of walk(dir)) {
    const base = path.basename(f);
    const rel = path.relative(dir, f).replace(/\\/g, '/');
    const term = TERMINAL_FILES.find(([re, , , when]) => re.test(base) && (!when || when(rel)));
    if (term) {
      try { result.terminals[term[1]] = term[2](fs.readFileSync(f, 'utf8'), rel); } catch (e) { result.notes.push(`${rel}: could not read (${e.message})`); }
      continue;
    }
    const shell = SHELL_FILES[base] || (/(^|\/)sourced\//.test(rel) && SOURCED_EXT[path.extname(base)]);
    if (shell) {
      const text = fs.readFileSync(f, 'utf8');
      const p = promptOf(text, shell);
      if (!result.prompt[shell] || result.prompt[shell] === 'default') result.prompt[shell] = p;
      // Lines that run a command at startup, not ones inside functions or aliases we can't see.
      for (const fx of FETCHES) if (new RegExp(`^\\s*${fx}\\b`, 'm').test(text) && !result.startup.fetch.includes(fx)) result.startup.fetch.push(fx);
      const mux = /^[^#\n]*\b(exec\s+)?(tmux|zellij)\b[^\n]*(new|attach|-A|options|setup|--layout)?/m.exec(text);
      if (mux && /\$TMUX|\$ZELLIJ|exec\s+(tmux|zellij)|(tmux|zellij)\s+(new|attach|a\b)/.test(text)) result.startup.multiplexer = mux[2];
    }
  }
  return result;
}

module.exports = { readCurrent, promptOf, CAMPBELL };
