'use strict';
// Inspire: search ~4,000 r/unixporn rices (public awesome-dotfiles JSON) and hand back a few
// candidates, each with a screenshot link and its dotfiles repo.
//
// Data: https://github.com/0xN1nja/awesome-dotfiles (data/reddit/rice-details.json).
// Screenshots are third-party: they are linked, never rehosted. `--save` downloads one into a
// local folder, for use as the visual anchor only.
//
// TMT_RICES_FILE points at a local copy of the JSON (tests, offline); TMT_STATE moves the cache.
//
// What each screenshot shows (terminal boxes, panes, what runs in them, layout, complexity) comes
// from catalog/inspiration/annotations.json (tools/annotate.js): it is joined as `entry.seen`, and
// search, filters and ranking trust it over the tags. TMT_ANNOTATIONS_FILE overrides the path.

const fs = require('fs');
const path = require('path');
const paths = require('../engine/paths');

const DATA_URL = 'https://raw.githubusercontent.com/0xN1nja/awesome-dotfiles/master/data/reddit/rice-details.json';
const MAX_AGE_MS = 7 * 24 * 3600 * 1000;
const ATTRIBUTION = 'Data: awesome-dotfiles (r/unixporn), links to original posts.';
const UA = 'tweak-my-term-inspire';

// ---- tools ------------------------------------------------------------------------------------

const TERMINALS = ['alacritty', 'kitty', 'wezterm', 'ghostty', 'windows-terminal', 'iterm2', 'foot', 'konsole', 'st', 'urxvt',
  'termite', 'xterm', 'terminator', 'gnome-terminal', 'xfce4-terminal', 'cool-retro-term', 'hyper', 'tabby'];
const SHELLS = ['zsh', 'fish', 'bash', 'powershell', 'nushell'];
const OTHER_TOOLS = ['starship', 'oh-my-posh', 'oh-my-zsh', 'powerlevel10k', 'tmux', 'zellij', 'neovim', 'fastfetch', 'neofetch'];

// key: raw name with everything but letters and digits stripped; value: canonical id
const ALIASES = {};
function alias(canon, ...raws) { for (const r of [canon, ...raws]) ALIASES[compact(r)] = canon; }
function compact(s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]+/g, ''); }

[...TERMINALS, ...SHELLS, ...OTHER_TOOLS].forEach((t) => alias(t));
alias('st', 'simple terminal', 'suckless terminal', 'st terminal');
alias('urxvt', 'rxvt-unicode', 'rxvtunicode', 'urxvtc', 'rxvt');
alias('iterm2', 'iterm');
alias('windows-terminal', 'wt', 'microsoft terminal');
alias('gnome-terminal', 'gnometerminal', 'gnome terminal');
alias('xfce4-terminal', 'xfce terminal', 'xfce4terminal');
alias('cool-retro-term', 'coolretroterm');
alias('powershell', 'pwsh');
alias('nushell', 'nu');
alias('starship', 'starship prompt');
alias('oh-my-posh', 'ohmyposh');
alias('oh-my-zsh', 'ohmyzsh');
alias('powerlevel10k', 'p10k', 'powerlevel10k');
alias('neovim', 'nvim', 'lunarvim', 'astronvim', 'lazyvim', 'nvchad');
alias('fish', 'fish shell');
alias('zsh', 'zshell');

const WORD_SCAN = new Set([...TERMINALS, ...SHELLS, ...OTHER_TOOLS].filter((t) => t !== 'st'));

function canonTool(raw) {
  const c = compact(raw);
  if (!c) return null;
  if (ALIASES[c]) return [ALIASES[c]];
  if (c.startsWith('neovim') || c.startsWith('nvim')) return ['neovim'];
  const out = [];
  const words = String(raw).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (words.length > 1) for (const w of words) if (WORD_SCAN.has(ALIASES[w] || w)) out.push(ALIASES[w] || w);
  return out.length ? out : [String(raw).toLowerCase().trim().replace(/\s+/g, ' ')];
}

function normalizeTools(list) {
  const seen = new Set();
  for (const raw of Array.isArray(list) ? list : []) {
    for (const t of canonTool(raw) || []) if (t) seen.add(t);
  }
  return [...seen];
}

// Which things from a rice also exist on Windows (the look can be rebuilt there).
const PORTABLE_TERMINALS = new Set(['alacritty', 'wezterm', 'windows-terminal', 'hyper', 'tabby']);
const PORTABLE_LOOK = new Set([...PORTABLE_TERMINALS, 'starship', 'oh-my-posh', 'fastfetch', 'neofetch', 'powershell', 'nushell', 'neovim', 'zellij']);
const TERMINAL_SET = new Set(TERMINALS);

// ---- normalize --------------------------------------------------------------------------------

const MAC_WMS = /^(yabai|aerospace|amethyst|chunkwm|rectangle|aqua|magnet|spectacle|skhd)$/i;
const MAC_TOOLS = new Set(['iterm2', 'sketchybar', 'yabai', 'aerospace', 'ubersicht', 'alfred', 'amethyst', 'skhd']);
const MAC_TITLE = /\[(macos|mac os|osx|mac|aqua)\]|\bmac ?os\b|\bosx\b/i;
const WIN_TOOLS = new Set(['windows-terminal', 'rainmeter', 'komorebi', 'glazewm', 'windhawk', 'powertoys', 'explorerpatcher', 'whkd', 'yasb']);
const WIN_TITLE = /\[windows\]|\bwindows ?(10|11|terminal|rice)\b|\bwin ?(10|11)\b|\bwsl2?\b|\brainmeter\b|\bkomorebi\b|\bglazewm\b|\bwindhawk\b/i;

function inferOs({ distro, wm, title, tools }) {
  const d = String(distro || '');
  if (/windows/i.test(d)) return 'windows';
  if (/mac ?os|osx|darwin/i.test(d)) return 'macos';
  if (d) return 'linux';
  if (tools.some((t) => WIN_TOOLS.has(t)) || WIN_TITLE.test(title)) return 'windows';
  if (MAC_WMS.test(String(wm || '')) || tools.some((t) => MAC_TOOLS.has(t)) || MAC_TITLE.test(title)) return 'macos';
  return 'linux';
}

const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

function absReddit(p) {
  const s = str(p);
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s : `https://www.reddit.com${s.startsWith('/') ? '' : '/'}${s}`;
}

function normalize(entry) {
  const e = entry || {};
  const title = String(e.title || '').trim();
  const tools = normalizeTools(e.utils_used);
  const distro = str(e.distro);
  const wm = str(e.wm);
  const os = inferOs({ distro, wm, title, tools });
  const colorscheme = str(e.colorscheme);
  const image = str(e.preview_image) || str(e.url) || null;
  const images = [...new Set([image, ...(Array.isArray(e.gallery_images) ? e.gallery_images : [])].filter((x) => typeof x === 'string' && x))];
  const created = Number(e.created_utc);
  const portable = os === 'windows' || (!tools.some((t) => TERMINAL_SET.has(t) && !PORTABLE_TERMINALS.has(t)) && (colorscheme !== null || tools.some((t) => PORTABLE_LOOK.has(t))));
  return {
    id: String(e.id || ''),
    title,
    url: absReddit(e.permalink),
    author: str(e.author),
    image,
    images,
    repo: str(e.github_url),
    wm,
    distro,
    os,
    colorscheme,
    tools,
    score: Number.isFinite(Number(e.score)) ? Number(e.score) : 0,
    date: Number.isFinite(created) && created > 0 ? new Date(created * 1000).toISOString().slice(0, 10) : null,
    portable,
    seen: null,
  };
}

// ---- what the screenshots show ----------------------------------------------------------------

const ANNOTATIONS = path.join(__dirname, '..', 'catalog', 'inspiration', 'annotations.json');
const CONTENTS = ['shell', 'fetch', 'monitor', 'editor', 'file-manager', 'clock', 'visualizer', 'music', 'pipes', 'matrix', 'art', 'git',
  'chat', 'mail', 'calendar', 'weather', 'logs', 'notes', 'browser', 'other'];

function loadSeen(file = process.env.TMT_ANNOTATIONS_FILE || ANNOTATIONS) {
  const data = readJson(file);
  return data && Array.isArray(data.entries) ? data.entries : [];
}

/** Attach annotations (what each screenshot shows) to entries as `seen`; entries without one get null. */
function withSeen(entries, list = loadSeen()) {
  const by = new Map(list.map((a) => [a.id, a]));
  for (const e of entries) e.seen = by.get(e.id) || null;
  return entries;
}

const shows = (s) => [...new Set(s.terminals.flatMap((t) => t.shows || []))];

// "complexity" spec: "4", "4+", "2-3", "high" (4+), "low" (1-2).
function parseComplexity(v) {
  if (v == null || v === '') return null;
  const s = String(v).toLowerCase().trim();
  if (s === 'high') return [4, 5];
  if (s === 'low') return [1, 2];
  let m;
  if ((m = /^([1-5])\+$/.exec(s))) return [+m[1], 5];
  if ((m = /^([1-5])-([1-5])$/.exec(s))) return [+m[1], +m[2]];
  if ((m = /^([1-5])$/.exec(s))) return [+m[1], +m[1]];
  throw new Error(`--complexity must be 1-5, n+, n-m, high or low; got "${v}".`);
}

// ---- load -------------------------------------------------------------------------------------

function entriesOf(data) {
  const list = Array.isArray(data) ? data : data && typeof data === 'object' ? Object.values(data) : [];
  return list.filter((x) => x && typeof x === 'object' && (x.title || x.permalink));
}

function atomicWrite(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

async function load(opts = {}) {
  const local = process.env.TMT_RICES_FILE;
  if (local) {
    const data = readJson(local);
    if (!data) throw new Error(`TMT_RICES_FILE ${local} is missing or is not valid JSON.`);
    return result(entriesOf(data), { source: 'file', file: local });
  }

  const dir = opts.cacheDir || path.join(paths.stateRoot(), 'cache');
  const file = path.join(dir, 'rices.json');
  const metaFile = path.join(dir, 'rices.meta.json');
  const now = opts.now || Date.now();
  const meta = readJson(metaFile) || {};
  const cached = fs.existsSync(file) ? readJson(file) : null;
  const age = cached && meta.fetchedAt ? now - Date.parse(meta.fetchedAt) : Infinity;

  if (cached && !opts.refresh && age < MAX_AGE_MS) {
    return result(entriesOf(cached), { source: 'cache', file, fetchedAt: meta.fetchedAt });
  }

  const doFetch = opts.fetchImpl || globalThis.fetch;
  const url = opts.url || DATA_URL;
  try {
    if (typeof doFetch !== 'function') throw new Error('this Node has no global fetch (need Node 20+)');
    const headers = { 'user-agent': UA };
    if (cached && meta.etag) headers['if-none-match'] = meta.etag;
    const res = await doFetch(url, { headers, signal: AbortSignal.timeout(opts.timeoutMs || 60000) });
    if (res.status === 304 && cached) {
      const m = { ...meta, fetchedAt: new Date(now).toISOString() };
      atomicWrite(metaFile, JSON.stringify(m, null, 2));
      return result(entriesOf(cached), { source: 'cache', file, fetchedAt: m.fetchedAt, revalidated: true });
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const data = JSON.parse(text);
    if (!entriesOf(data).length) throw new Error('the downloaded file has no rice entries');
    const m = { etag: res.headers.get('etag') || null, fetchedAt: new Date(now).toISOString(), url, count: entriesOf(data).length };
    atomicWrite(file, text);
    atomicWrite(metaFile, JSON.stringify(m, null, 2));
    return result(entriesOf(data), { source: 'network', file, fetchedAt: m.fetchedAt });
  } catch (e) {
    const why = e && e.name === 'TimeoutError' ? 'the request timed out' : e && e.message ? e.message : String(e);
    if (cached) {
      return result(entriesOf(cached), { source: 'stale-cache', file, fetchedAt: meta.fetchedAt || null, warning: `Could not refresh the rice index (${why}); using the copy from ${meta.fetchedAt || 'an unknown date'}.` });
    }
    throw new Error(`Could not download the rice index (${why}) and there is no cached copy at ${file}. Connect to the network and retry, or set TMT_RICES_FILE to a local copy of ${url}.`);
  }

  function result(raw, info) {
    const entries = withSeen(raw.map(normalize));
    return { entries, count: raw.length, seen: entries.filter((e) => e.seen).length, ...info };
  }
}

// ---- search -----------------------------------------------------------------------------------

const STOP = new Set(['a', 'an', 'the', 'and', 'or', 'with', 'on', 'in', 'for', 'my', 'me', 'to', 'of', 'like', 'something', 'looking',
  'want', 'i', 'setup', 'rice', 'theme', 'terminal', 'using', 'style', 'vibe', 'vibes', 'look', 'looks', 'feel', 'please', 'make', 'it',
  'is', 'that', 'some', 'kind', 'ish', 'term', 'shell', 'based', 'but', 'more', 'very', 'really', 'want', 'would', 'love', 'prompt']);

// A vague word expands to concrete things that appear in rice metadata.
const MOODS = {
  cozy: ['warm', 'gruvbox', 'everforest', 'catppuccin', 'rosepine', 'kanagawa', 'autumn', 'coffee', 'comfy'],
  warm: ['gruvbox', 'amber', 'orange', 'autumn', 'everforest', 'kanagawa'],
  comfy: ['cozy', 'gruvbox', 'everforest', 'catppuccin'],
  cyberpunk: ['neon', 'synthwave', 'tokyonight', 'cyber', 'hud', 'outrun', 'vaporwave', 'retrowave', 'glitch'],
  neon: ['synthwave', 'cyberpunk', 'tokyonight', 'outrun', 'vaporwave'],
  synthwave: ['neon', 'outrun', 'vaporwave', 'retrowave'],
  futuristic: ['cyberpunk', 'neon', 'hud', 'scifi', 'cyber'],
  hud: ['cyberpunk', 'futuristic', 'cyber', 'scifi'],
  minimal: ['minimalist', 'clean', 'simple', 'nord', 'monochrome', 'plain'],
  minimalist: ['minimal', 'clean', 'simple', 'nord', 'monochrome'],
  clean: ['minimal', 'simple', 'nord', 'monochrome'],
  simple: ['minimal', 'clean', 'nord', 'plain'],
  retro: ['crt', 'amber', 'green', 'phosphor', 'vintage', 'coolretroterm', 'cathode'],
  crt: ['retro', 'amber', 'phosphor', 'coolretroterm'],
  hacker: ['matrix', 'green', 'cmatrix', 'phosphor', 'retro'],
  matrix: ['green', 'cmatrix', 'hacker'],
  pastel: ['catppuccin', 'rosepine', 'soft', 'pink', 'sweet'],
  cute: ['pastel', 'pink', 'kawaii', 'anime', 'catppuccin', 'sweet'],
  soft: ['pastel', 'catppuccin', 'rosepine', 'muted'],
  forest: ['everforest', 'green', 'nature'],
  nature: ['everforest', 'green', 'forest'],
  ocean: ['nord', 'blue', 'iceberg', 'cold'],
  cold: ['nord', 'blue', 'iceberg', 'ice'],
  dark: ['black', 'oled', 'dracula', 'onedark', 'tokyonight', 'nord'],
  light: ['white', 'solarized', 'latte', 'day', 'paper', 'bright'],
  bright: ['light', 'white', 'latte'],
  colorful: ['rainbow', 'vibrant', 'neon', 'dracula', 'pywal'],
  muted: ['soft', 'nord', 'kanagawa', 'rosepine'],
  // the rest of the mood lexicon (skills/setup/references/moods.md)
  vaporwave: ['synthwave', 'retrowave', 'outrun', 'pastel', 'pink', 'neon', 'aesthetic'],
  aesthetic: ['vaporwave', 'pastel', 'synthwave'],
  outrun: ['synthwave', 'retrowave', 'neon', 'vaporwave'],
  retrowave: ['synthwave', 'outrun', 'vaporwave', 'neon'],
  lofi: ['cozy', 'chill', 'music', 'anime', 'warm', 'rain'],
  chill: ['lofi', 'cozy', 'calm'],
  calm: ['minimal', 'soft', 'muted', 'nord'],
  paper: ['light', 'bright', 'latte', 'solarized', 'cream', 'white'],
  writer: ['paper', 'light', 'minimal'],
  kawaii: ['pastel', 'cute', 'pink', 'anime', 'catppuccin'],
  anime: ['cute', 'pastel', 'kawaii', 'lofi'],
  noir: ['monochrome', 'black', 'dark', 'minimal'],
  gothic: ['dracula', 'dark', 'black', 'monochrome'],
  dracula: ['dark', 'purple', 'gothic'],
  monochrome: ['black', 'white', 'minimal', 'gray'],
  brutalist: ['monochrome', 'minimal', 'black', 'white'],
  y2k: ['aqua', 'glass', 'chrome', 'blue', 'bright'],
  glass: ['blur', 'transparent', 'aqua'],
  solarpunk: ['green', 'nature', 'everforest', 'bright', 'gold'],
  ice: ['nord', 'blue', 'iceberg', 'cold'],
  sunset: ['synthwave', 'orange', 'pink', 'warm'],
  space: ['stars', 'galaxy', 'dark', 'purple'],
};

const THEMES = new Set(['tokyonight', 'rosepine', 'onedark', 'onelight', 'gruvbox', 'catppuccin', 'solarized', 'everforest', 'kanagawa', 'oxocarbon', 'palenight']);
const OS_WORDS = { mac: 'macos', macos: 'macos', osx: 'macos', macbook: 'macos', win: 'windows', win10: 'windows', win11: 'windows', windows: 'windows', linux: 'linux' };
const FIELD_WEIGHT = { colorscheme: 3, seen: 2.5, tools: 2, wm: 2, distro: 1.5, title: 1.5, os: 1.5 };

// Words about how much is on screen; matched against the screenshot's complexity when it was seen.
const COMPLEXITY_WORDS = {
  complex: 'high', busy: 'high', advanced: 'high', rich: 'high', dense: 'high', loaded: 'high', maximal: 'high', maximalist: 'high',
  detailed: 'high', elaborate: 'high', fancy: 'high', dashboard: 'high', widgets: 'high', cockpit: 'high', productive: 'high',
  minimal: 'low', minimalist: 'low', simple: 'low', clean: 'low', plain: 'low', calm: 'low', focused: 'low', zen: 'low',
};
// Words for what runs in a terminal; matched against what the screenshot shows.
const CONTENT_WORDS = {
  clock: 'clock', clocks: 'clock', time: 'clock', visualizer: 'visualizer', visualiser: 'visualizer', audio: 'visualizer', cava: 'visualizer',
  monitor: 'monitor', monitoring: 'monitor', btop: 'monitor', htop: 'monitor', stats: 'monitor', pipes: 'pipes', matrix: 'matrix',
  fetch: 'fetch', neofetch: 'fetch', fastfetch: 'fetch', editor: 'editor', vim: 'editor', neovim: 'editor', nvim: 'editor',
  files: 'file-manager', filemanager: 'file-manager', ranger: 'file-manager', yazi: 'file-manager', lf: 'file-manager',
  music: 'music', ncmpcpp: 'music', git: 'git', lazygit: 'git', calendar: 'calendar', weather: 'weather', mail: 'mail', chat: 'chat', art: 'art',
};

function parseQuery(query) {
  const raw = Array.isArray(query) ? query.join(' ') : String(query || '');
  const words = raw.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const terms = [];
  for (let i = 0; i < words.length; i++) {
    const pair = i + 1 < words.length ? compact(words[i] + words[i + 1]) : '';
    if (pair && (ALIASES[pair] || THEMES.has(pair))) { terms.push(ALIASES[pair] || pair); i++; continue; }
    if (STOP.has(words[i])) continue;
    terms.push(ALIASES[words[i]] || words[i]);
  }
  return [...new Set(terms)].map((t) => ({
    term: t, key: compact(t), expansions: (MOODS[t] || []).filter((x) => x !== t),
    complexity: COMPLEXITY_WORDS[t] || null, content: CONTENT_WORDS[t] || null,
  }));
}

function tokenSet(...values) {
  const set = new Set();
  for (const v of values) {
    const words = String(v == null ? '' : v).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    for (let i = 0; i < words.length; i++) {
      set.add(words[i]);
      if (i + 1 < words.length) set.add(words[i] + words[i + 1]);
    }
    const whole = compact(v);
    if (whole) set.add(whole);
  }
  return set;
}

const indexCache = new WeakMap();
function fieldsOf(e) {
  let f = indexCache.get(e);
  if (!f) {
    f = { colorscheme: tokenSet(e.colorscheme), tools: tokenSet(...e.tools), wm: tokenSet(e.wm), distro: tokenSet(e.distro), title: tokenSet(e.title), os: new Set([e.os]),
      seen: e.seen ? tokenSet(...e.seen.mood, e.seen.layout, ...shows(e.seen)) : new Set() };
    indexCache.set(e, f);
  }
  return f;
}

// Best (weight, field) for one concrete term on one entry.
function best(f, key) {
  let w = 0;
  let field = null;
  for (const name of Object.keys(FIELD_WEIGHT)) {
    if (f[name].has(key) && FIELD_WEIGHT[name] > w) { w = FIELD_WEIGHT[name]; field = name; }
  }
  return { w, field };
}

function scoreEntry(e, terms) {
  const f = fieldsOf(e);
  let total = 0;
  const matched = [];
  for (const q of terms) {
    const key = OS_WORDS[q.key] ? OS_WORDS[q.key] : q.key;
    const d = best(f, key);
    // A mood word in the tools list is a theme package (Paper icons, Nordic GTK), not the mood.
    if (q.expansions.length && d.field === 'tools') { d.w = 0; d.field = null; }
    // What the screenshot shows beats tags: complexity words and content words.
    if (q.complexity || q.content) {
      let w = 0;
      if (e.seen && q.complexity) {
        const c = e.seen.complexity;
        w = q.complexity === 'high' ? (c >= 4 ? 3 : c === 3 ? 1.5 : 0) : (c <= 2 ? 3 : c === 3 ? 0.5 : 0);
        if (q.complexity === 'low' && w === 0) { total -= 2; continue; } // seen as busy: not minimal, whatever the tags say
      } else if (!e.seen && q.complexity === 'high') {
        w = e.tools.filter((t) => WIDGET_TOOLS.has(t)).length >= 2 ? 1 : 0;
      }
      if (e.seen && q.content && shows(e.seen).includes(q.content)) w = Math.max(w, 3);
      if (w > d.w) { d.w = w; d.field = 'seen'; }
      if (e.seen && q.complexity === 'high' && w === 0) { continue; } // seen as simple: not complex
    }
    const syn = [];
    for (const x of q.expansions) {
      const s = best(f, compact(x));
      if (s.w) syn.push({ x, w: s.w * 0.5, field: s.field });
    }
    syn.sort((a, b) => b.w - a.w);
    const synScore = syn.length ? syn[0].w + 0.25 * syn.slice(1).reduce((n, s) => n + s.w, 0) : 0;
    total += Math.max(d.w, synScore) + 0.25 * Math.min(d.w, synScore);
    if (d.w) matched.push({ term: q.term, field: d.field, via: null });
    for (const s of syn.slice(0, 2)) if (s.x !== q.term || s.field !== d.field) matched.push({ term: s.x, field: s.field, via: q.term });
  }
  return { relevance: terms.length ? total / terms.length : 0, matched, hit: total > 0 };
}

function canonOs(v) {
  if (v == null || v === '') return null;
  const c = compact(v);
  const m = { windows: 'windows', win: 'windows', win10: 'windows', win11: 'windows', macos: 'macos', mac: 'macos', osx: 'macos', darwin: 'macos', linux: 'linux', unix: 'linux' }[c];
  if (!m) throw new Error(`Unknown --os "${v}". Use linux, macos or windows.`);
  return m;
}

function canonIn(v, list, label) {
  if (v == null || v === '') return null;
  const c = ALIASES[compact(v)] || String(v).toLowerCase();
  if (!list.includes(c)) throw new Error(`Unknown ${label} "${v}". Known: ${list.join(', ')}.`);
  return c;
}

const fmtCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));

function explain(e, matched, filters, exact) {
  const parts = [];
  const seen = new Set();
  for (const m of [...matched.filter((x) => !x.via), ...matched.filter((x) => x.via)]) {
    const key = `${m.field} ${m.term}`;
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(m.via ? `${key} (fits "${m.via}")` : key);
  }
  const fl = [];
  if (filters.os) fl.push(filters.os === 'windows' && e.os !== 'windows' ? 'portable to Windows' : `os ${e.os}`);
  if (filters.terminal) fl.push(e.tools.includes(filters.terminal) ? `uses ${filters.terminal}` : `no ${filters.terminal}`);
  if (filters.shell) fl.push(e.tools.includes(filters.shell) ? `uses ${filters.shell}` : `no ${filters.shell}`);
  if (filters.layout) { const ev = layoutEvidence(filters.layout, e); fl.push(ev ? `layout ${filters.layout} (${String(ev).toLowerCase()})` : `not ${filters.layout}`); }
  if (filters.has) fl.push(e.seen ? `shows ${filters.has.filter((h) => shows(e.seen).includes(h)).join(', ') || 'none of ' + filters.has.join(', ')}` : 'not looked at yet');
  if (filters.complexity) fl.push(e.seen ? `complexity ${e.seen.complexity} (seen)` : 'complexity unknown');
  const out = [];
  if (parts.length) out.push(`matches ${parts.slice(0, 4).join(', ')}`);
  if (fl.length) out.push(fl.join(', '));
  if (!parts.length) out.push('popular pick');
  out.push(`${fmtCount(e.score)} upvotes`);
  if (!exact) out.push('closest match, not exact');
  return out.join('; ');
}

// ---- layout ----------------------------------------------------------------------------------
// Layout is how things are arranged; style is how they look. The dataset has no layout field, so it
// is inferred from the window manager and tools. Each test returns the evidence, or null.

const TILING_WMS = /^(i3|i3wm|i3-gaps|i3gaps|bspwm|hyprland|dwm|sway|swaywm|awesome|awesomewm|qtile|xmonad|yabai|aerospace|amethyst|komorebi|glazewm|herbstluftwm|leftwm|river|spectrwm|dwl|ratpoison|stumpwm|frankenwm|berry|2bwm|nimdow|instantwm|wayfire)$/;
const SCROLLING_WMS = /^(niri|paperwm|karousel|papersway|hyprscroller)$/;
const FLOATING_WMS = /^(openbox|fluxbox|xfce|xfwm|xfwm4|kde|kde plasma|kwin|plasma|gnome|gnome shell|mutter|cinnamon|mate|budgie|lxqt|lxde|icewm|jwm|windowmaker|window maker|enlightenment|cosmic|pantheon|aqua|explorer|fvwm|twm|cwm|marco)$/;
const WIDGET_TOOLS = new Set(['eww', 'conky', 'btop', 'htop', 'gotop', 'bottom', 'cava', 'ncmpcpp', 'cmatrix', 'pipes', 'tty-clock', 'peaclock', 'cbonsai', 'rainmeter', 'ubersicht', 'glances']);
const MUX_TOOLS = ['tmux', 'zellij', 'screen', 'byobu'];
const wmKey = (e) => String(e.wm || '').toLowerCase().trim();
const LAYOUTS = {
  tiling: (e) => (TILING_WMS.test(wmKey(e)) ? e.wm : /\btiling\b/i.test(e.title) ? 'title' : null),
  floating: (e) => {
    if (FLOATING_WMS.test(wmKey(e))) return e.wm;
    if (!e.wm && (e.os === 'windows' || e.os === 'macos')) return `stock ${e.os}`;
    return /\bfloating\b/i.test(e.title) ? 'title' : null;
  },
  panes: (e) => MUX_TOOLS.find((t) => e.tools.includes(t)) || (/\b(splits?|panes?|tmux|zellij)\b/i.test(e.title) ? 'title' : null),
  dashboard: (e) => {
    const w = e.tools.filter((t) => WIDGET_TOOLS.has(t));
    return w.length >= 2 ? w.slice(0, 3).join(', ') : /\b(dashboard|hud|widgets?)\b/i.test(e.title) ? 'title' : null;
  },
  scrolling: (e) => (SCROLLING_WMS.test(wmKey(e)) ? e.wm : /\bscrolling\b/i.test(e.title) ? 'title' : null),
};
const LAYOUT_NAMES = Object.keys(LAYOUTS);

// From the screenshot when it was looked at, otherwise inferred from WM and tools.
const SEEN_LAYOUT = {
  panes: (s) => s.layout === 'panes' || s.terminals.some((t) => (t.panes || 1) > 1),
  dashboard: (s) => s.layout === 'dashboard' || s.complexity >= 4,
  tiling: (s) => s.layout === 'tiling',
  floating: (s) => s.layout === 'floating',
  scrolling: (s) => s.layout === 'scrolling',
};
function layoutEvidence(name, e) {
  if (e.seen) return SEEN_LAYOUT[name](e.seen) ? 'seen in the screenshot' : null;
  return LAYOUTS[name](e);
}

// Shots where the terminals are the point rank up; shots with no terminal in them sink.
const FOCUS_BOOST = { terminal: 3, mixed: 1, other: -12 };

function canonHas(v) {
  if (v == null || v === '') return null;
  const list = (Array.isArray(v) ? v : String(v).split(',')).map((x) => String(x).toLowerCase().trim()).filter(Boolean)
    .map((x) => CONTENT_WORDS[x] || x);
  for (const x of list) if (!CONTENTS.includes(x)) throw new Error(`Unknown --has "${x}". Known: ${CONTENTS.join(', ')}.`);
  return [...new Set(list)];
}

function canonLayout(v) {
  if (v == null || v === '') return null;
  const c = String(v).toLowerCase().trim();
  if (!LAYOUTS[c]) throw new Error(`Unknown layout "${v}". Known: ${LAYOUT_NAMES.join(', ')}.`);
  return c;
}

// ---- variety ----------------------------------------------------------------------------------
// The same few popular rices for every request teach nothing. Results are picked greedily: each next
// one is the best remaining match after a penalty for sharing a colorscheme, window manager, author or
// terminal with what is already picked, so a shortlist shows different layouts and palettes.

function seededRandom(seed) {
  let a = (Number(seed) >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const firstTerminal = (e) => e.tools.find((t) => TERMINAL_SET.has(t)) || null;
const same = (a, b) => a != null && b != null && String(a).toLowerCase() === String(b).toLowerCase();

// pool is sorted best first; returns up to `limit` entries chosen for variety.
function diversify(pool, limit) {
  const n = pool.length;
  const window = pool.slice(0, Math.max(limit * 10, 60));
  const base = new Map(window.map((p, i) => [p, 1 - i / Math.max(1, n)]));
  const picked = [];
  const left = new Set(window);
  while (picked.length < limit && left.size) {
    let best = null, bestScore = -Infinity;
    for (const p of left) {
      let pen = 0;
      for (const q of picked) {
        if (same(p.e.colorscheme, q.e.colorscheme)) pen += 0.5;
        if (same(p.e.wm, q.e.wm)) pen += 0.35;
        if (same(p.e.author, q.e.author)) pen += 1;
        if (same(firstTerminal(p.e), firstTerminal(q.e))) pen += 0.1;
      }
      const sc = base.get(p) - pen;
      if (sc > bestScore) { best = p; bestScore = sc; }
    }
    picked.push(best);
    left.delete(best);
  }
  return picked;
}

// Pure ranking over normalized entries.
// opts.sort: 'relevance' (default), 'new' (newest first) or 'random' (with opts.seed); opts.diverse (default true).
function rank(entries, query, opts = {}) {
  const sort = opts.sort || 'relevance';
  if (!['relevance', 'new', 'random'].includes(sort)) throw new Error(`sort must be relevance, new or random, got "${sort}"`);
  const terms = parseQuery(query);
  const filters = {
    os: canonOs(opts.os), terminal: canonIn(opts.terminal, TERMINALS, 'terminal'), shell: canonIn(opts.shell, SHELLS, 'shell'), layout: canonLayout(opts.layout),
    has: canonHas(opts.has), complexity: parseComplexity(opts.complexity),
  };
  const active = Object.keys(filters).filter((k) => filters[k]);
  const limit = Number.isInteger(opts.limit) && opts.limit > 0 ? opts.limit : 6;
  const minScore = Number(opts.minScore) || 0;
  const notes = [];

  let times = entries.map((e) => Date.parse(e.date)).filter(Number.isFinite);
  const t0 = times.length ? Math.min(...times) : 0;
  const span = times.length ? Math.max(...times) - t0 || 1 : 1;

  const pass = {
    os: (e) => (filters.os === 'windows' ? e.os === 'windows' || e.portable : e.os === filters.os),
    terminal: (e) => e.tools.includes(filters.terminal),
    shell: (e) => e.tools.includes(filters.shell),
    layout: (e) => layoutEvidence(filters.layout, e) !== null,
    has: (e) => Boolean(e.seen) && filters.has.every((h) => shows(e.seen).includes(h)),
    complexity: (e) => Boolean(e.seen) && e.seen.complexity >= filters.complexity[0] && e.seen.complexity <= filters.complexity[1],
  };

  let pool = [];
  for (const e of entries) {
    if (e.score < minScore) continue;
    const s = scoreEntry(e, terms);
    if (terms.length && !s.hit) continue;
    pool.push({ e, s, fm: active.filter((k) => pass[k](e)) });
  }
  if (terms.length && !pool.length) notes.push(`No rice matched "${terms.map((t) => t.term).join(' ')}". Try a mood (cozy, minimal, retro, cyberpunk), a colorscheme (gruvbox, nord) or a tool (kitty, zsh).`);

  let exact = true;
  if (active.length) {
    const full = pool.filter((p) => p.fm.length === active.length);
    if (full.length) pool = full;
    else if (pool.length) {
      exact = false;
      notes.push(`No rice matches all of ${active.map((k) => `${k}=${filters[k]}`).join(', ')}${terms.length ? ' for this query' : ''}; showing the closest (partial matches first).`);
    }
  }
  if (filters.os === 'windows' && exact && pool.length) {
    const native = pool.filter((p) => p.e.os === 'windows').length;
    notes.push(`${native ? `Only ${native} Windows-native rice${native === 1 ? '' : 's'} matched` : 'No Windows-native rices matched'}; the rest are Linux/macOS rices whose look only needs things that exist on Windows (colors, prompt, fetch tool, wezterm/alacritty).`);
  }

  for (const p of pool) {
    const e = p.e;
    const recency = (Date.parse(e.date) - t0) / span || 0;
    p.rank = p.s.relevance * 10 + 1.5 * Math.log1p(Math.max(0, e.score)) + 1.5 * recency + p.fm.length * (exact ? 0 : 8)
      + (filters.os === 'windows' ? (e.os === 'windows' ? 6 : e.portable ? 2 : 0) : 0)
      + (e.seen ? FOCUS_BOOST[e.seen.focus] || 0 : 0);
  }
  if (sort !== 'relevance') for (const p of pool) if (p.e.seen && p.e.seen.focus === 'other') p.sink = true;
  if (sort === 'new') for (const p of pool) p.rank = (Date.parse(p.e.date) || 0) + p.fm.length * (exact ? 0 : 1e13);
  if (sort === 'random') {
    const rnd = seededRandom(opts.seed ?? Date.now());
    const top = Math.log1p(Math.max(1, ...pool.map((p) => p.e.score)));
    // a fresh draw each time, tilted toward posts people rated well
    for (const p of pool.sort((a, b) => (a.e.id < b.e.id ? -1 : 1))) p.rank = rnd() + 0.6 * (Math.log1p(Math.max(0, p.e.score)) / top) + p.fm.length * (exact ? 0 : 10);
  }
  pool.sort((a, b) => (a.sink ? 1 : 0) - (b.sink ? 1 : 0) || b.rank - a.rank || b.e.score - a.e.score || (a.e.id < b.e.id ? -1 : 1));
  const chosen = opts.diverse === false ? pool.slice(0, limit) : diversify(pool, limit);

  const results = chosen.map((p) => ({
    ...p.e,
    relevance: Math.round(p.s.relevance * 100) / 100,
    exact: exact || p.fm.length === active.length,
    why: explain(p.e, p.s.matched, filters, exact || p.fm.length === active.length),
  }));
  const unseen = results.filter((x) => !x.seen).length;
  if ((filters.layout || terms.some((t) => t.complexity || t.content)) && unseen) {
    notes.push(`${unseen} of ${results.length} result(s) have not been looked at yet: their layout and contents are guessed from tags; check the screenshot.`);
  }
  return { query: terms.map((t) => t.term).join(' '), filters, matches: pool.length, notes, results };
}

async function searchDetailed(query, opts = {}) {
  const data = opts.entries ? { entries: opts.entries } : await load(opts);
  const r = rank(data.entries, query, opts);
  if (data.warning) r.notes.unshift(data.warning);
  r.source = data.source || 'given';
  return r;
}

async function search(query, opts = {}) {
  return (await searchDetailed(query, opts)).results;
}

// ---- facets -----------------------------------------------------------------------------------

function tally(values, top) {
  const m = new Map();
  for (const v of values) if (v) m.set(v, (m.get(v) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, top).map(([name, count]) => ({ name, count }));
}

function facetsOf(entries, top = 15) {
  const lower = (s) => (s ? s : null);
  return {
    total: entries.length,
    os: tally(entries.map((e) => e.os), 3),
    colorschemes: tally(entries.map((e) => lower(e.colorscheme)), top),
    terminals: tally(entries.flatMap((e) => e.tools.filter((t) => TERMINAL_SET.has(t))), top),
    shells: tally(entries.flatMap((e) => e.tools.filter((t) => SHELLS.includes(t))), top),
    wms: tally(entries.map((e) => e.wm), top),
    distros: tally(entries.map((e) => e.distro), top),
  };
}

async function facets(opts = {}) {
  const data = opts.entries ? { entries: opts.entries } : await load(opts);
  return facetsOf(data.entries, opts.top);
}

// ---- save one screenshot ----------------------------------------------------------------------

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };

async function saveImage(entry, dir, opts = {}) {
  const url = entry && entry.image;
  if (!url) throw new Error('This rice has no screenshot link.');
  const doFetch = opts.fetchImpl || globalThis.fetch;
  const res = await doFetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(opts.timeoutMs || 60000), redirect: 'follow' });
  if (!res.ok) throw new Error(`Could not download the screenshot (HTTP ${res.status}): ${url}`);
  const type = String(res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (type && !type.startsWith('image/')) throw new Error(`The screenshot link did not return an image (${type}): ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 25 * 1024 * 1024) throw new Error('The screenshot is larger than 25 MB; not saving it.');
  let ext = EXT[type];
  if (!ext) { const m = /\.(png|jpe?g|webp|gif)(?:[?#]|$)/i.exec(url); ext = m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'png'; }
  const abs = path.resolve(dir);
  fs.mkdirSync(abs, { recursive: true });
  const file = path.join(abs, `rice-${String(entry.id).replace(/[^a-z0-9_-]/gi, '')}.${ext}`);
  fs.writeFileSync(file, buf);
  return { file, bytes: buf.length, source: url };
}

// Cuts each annotated terminal window out of a saved screenshot: <name>-t1.png, -t2.png...
// The agent then judges the terminals, not the desktop around them.
function cropTerminals(file, seen, outDir = path.dirname(file)) {
  if (!seen || !seen.terminals || !seen.terminals.length) return [];
  const image = require('./image');
  const img = image.load(file);
  const base = path.basename(file).replace(/\.[a-z]+$/i, '');
  return seen.terminals.map((t, i) => {
    const [bx, by, bw, bh] = t.box;
    const x = Math.min(img.width - 1, Math.max(0, Math.round(bx * img.width)));
    const y = Math.min(img.height - 1, Math.max(0, Math.round(by * img.height)));
    const w = Math.max(1, Math.min(img.width - x, Math.round(bw * img.width)));
    const h = Math.max(1, Math.min(img.height - y, Math.round(bh * img.height)));
    const out = { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
    for (let r = 0; r < h; r++) out.data.set(img.data.subarray(((y + r) * img.width + x) * 4, ((y + r) * img.width + x + w) * 4), r * w * 4);
    const f = path.join(outDir, `${base}-t${i + 1}.png`);
    image.save(out, f);
    return { file: f, box: t.box, shows: t.shows };
  });
}

// Downloads every result's screenshot (sequentially, politely) for a visual review.
async function saveAll(list, dir, opts = {}) {
  const saved = [], failed = [];
  for (const e of list) {
    try { saved.push({ id: e.id, ...(await saveImage(e, dir, opts)) }); } catch (err) { failed.push({ id: e.id, error: err.message }); }
  }
  return { saved, failed };
}

// ---- CLI --------------------------------------------------------------------------------------

const USAGE = `Usage: tmt inspire <query...> [--os linux|macos|windows] [--terminal x] [--shell x] [--layout ${LAYOUT_NAMES.join('|')}] [--limit n] [--min-score n]
                   [--has clock,monitor,...] [--complexity 1-5|n+|n-m|high|low]
                   [--sort relevance|new|random] [--seed n] [--json] [--refresh] [--facets] [--save <n|all> <dir> [--crop]]
Results vary by design: no repeated colorscheme, window manager or author while other matches exist.
--sort random --seed n draws a different set each time; --save all <dir> downloads every screenshot to review;
--crop also cuts out each terminal window seen in it (rice-<id>-t1.png...). Words like complex, busy, dashboard,
minimal, clean, and clock, monitor, visualizer, fetch match what the screenshots were seen to show.
Search r/unixporn rices by mood, colorscheme, tool or WM. Example: tmt inspire cozy gruvbox --terminal kitty`;

function parseArgs(argv) {
  const a = { query: [], flags: {} };
  const valued = new Set(['os', 'terminal', 'shell', 'layout', 'limit', 'min-score', 'sort', 'seed', 'has', 'complexity']);
  const bool = new Set(['json', 'refresh', 'facets', 'help', 'crop']);
  const list = argv.filter((x) => x !== undefined && x !== null).map(String);
  for (let i = 0; i < list.length; i++) {
    const x = list[i];
    if (x === '--') { a.query.push(...list.slice(i + 1)); break; }
    if (!x.startsWith('--')) { a.query.push(x); continue; }
    const eq = x.indexOf('=');
    const name = (eq > 0 ? x.slice(2, eq) : x.slice(2));
    const inline = eq > 0 ? x.slice(eq + 1) : null;
    if (bool.has(name)) { a.flags[name] = true; continue; }
    if (name === 'save') {
      const n = inline !== null ? inline : list[++i];
      const dir = list[++i];
      if (n === undefined || dir === undefined || !/^(\d+|all)$/.test(n)) throw new Error('--save needs a result number (or all) and a folder: --save <n|all> <dir>');
      a.flags.save = { n: n === 'all' ? 'all' : Number(n), dir };
      continue;
    }
    if (valued.has(name)) {
      const v = inline !== null ? inline : list[++i];
      if (v === undefined || v.startsWith('--')) throw new Error(`--${name} needs a value.`);
      a.flags[name] = v;
      continue;
    }
    throw new Error(`Unknown flag --${name}.\n${USAGE}`);
  }
  return a;
}

function intFlag(v, name) {
  if (v === undefined) return undefined;
  if (!/^\d+$/.test(String(v)) || Number(v) < 1) throw new Error(`--${name} must be a positive whole number.`);
  return Number(v);
}

function formatResults(r) {
  const lines = [];
  if (!r.results.length) lines.push('No matches.');
  r.results.forEach((x, i) => {
    lines.push(`${i + 1}. ${x.title}  (${x.score} upvotes, ${x.date || 'n/a'})`);
    lines.push(`   colorscheme: ${x.colorscheme || 'n/a'} | wm: ${x.wm || 'n/a'} | distro: ${x.distro || 'n/a'} | os: ${x.os}${x.portable && x.os !== 'windows' ? ' (portable to Windows)' : ''}`);
    lines.push(`   tools: ${x.tools.length ? x.tools.join(', ') : 'n/a'}`);
    lines.push(`   screenshot: ${x.image || 'n/a'}`);
    lines.push(`   reddit: ${x.url || 'n/a'}`);
    lines.push(`   repo: ${x.repo ? `${x.repo}  (its files per tool: tmt parts rice ${x.repo})` : 'n/a'}`);
    lines.push(`   why: ${x.why}`);
    if (x.seen) {
      const t = x.seen.terminals;
      const focus = { terminal: 'terminals are the point', mixed: 'terminals share the shot', other: 'no real terminal in the shot' }[x.seen.focus];
      lines.push(`   seen: ${x.seen.layout}, complexity ${x.seen.complexity}, ${focus}; prompt ${x.seen.prompt}; mood ${x.seen.mood.join(', ') || 'n/a'}`);
      if (t.length) lines.push(`   terminals: ${t.map((w, j) => `t${j + 1} [${w.box.join(',')}] ${w.shows.join('+')}${(w.panes || 1) > 1 ? ` ${w.panes} panes` : ''}`).join(' | ')}`);
      lines.push(`   note: ${x.seen.note}`);
    }
  });
  if (r.notes.length) lines.push('', ...r.notes.map((n) => `Note: ${n}`));
  lines.push('', ATTRIBUTION);
  return lines.join('\n');
}

function formatFacets(f) {
  const row = (title, list) => `${title}: ${list.map((x) => `${x.name} ${x.count}`).join(', ')}`;
  return [`${f.total} rices`, row('OS', f.os), row('Colorschemes', f.colorschemes), row('Terminals', f.terminals), row('Shells', f.shells), row('WMs', f.wms), row('Distros', f.distros), '', ATTRIBUTION].join('\n');
}

async function main(argv = []) {
  const { query, flags } = parseArgs(argv);
  const out = (s) => process.stdout.write(`${s}\n`);
  if (flags.help) { out(USAGE); return 0; }
  const loadOpts = { refresh: Boolean(flags.refresh) };

  if (flags.facets) {
    const f = await facets(loadOpts);
    out(flags.json ? JSON.stringify({ facets: f, attribution: ATTRIBUTION }, null, 2) : formatFacets(f));
    return 0;
  }

  const limit = intFlag(flags.limit, 'limit');
  const minScore = flags['min-score'] === undefined ? undefined : Number(flags['min-score']);
  if (minScore !== undefined && !Number.isFinite(minScore)) throw new Error('--min-score must be a number.');
  const r = await searchDetailed(query, { ...loadOpts, os: flags.os, terminal: flags.terminal, shell: flags.shell, layout: flags.layout, has: flags.has, complexity: flags.complexity, limit, minScore, sort: flags.sort, seed: flags.seed === undefined ? undefined : Number(flags.seed) });

  let saved = null;
  if (flags.save && flags.save.n === 'all') {
    saved = await saveAll(r.results, flags.save.dir);
  } else if (flags.save) {
    const pick = r.results[flags.save.n - 1];
    if (!pick) throw new Error(`--save ${flags.save.n}: there are only ${r.results.length} results.`);
    saved = { n: flags.save.n, id: pick.id, ...(await saveImage(pick, flags.save.dir)) };
  }

  let crops = null;
  if (flags.crop) {
    if (!flags.save) throw new Error('--crop needs --save <n|all> <dir>.');
    crops = [];
    for (const sv of saved.saved ? saved.saved : [saved]) {
      const e = r.results.find((x) => x.id === sv.id);
      if (!e || !e.seen || !e.seen.terminals.length) continue;
      try { crops.push(...cropTerminals(sv.file, e.seen).map((c) => ({ id: e.id, ...c }))); } catch (err) { crops.push({ id: e.id, error: err.message }); }
    }
  }

  if (flags.json) {
    out(JSON.stringify({ query: r.query, filters: r.filters, matches: r.matches, notes: r.notes, results: r.results, saved, crops, attribution: ATTRIBUTION }, null, 2));
  } else {
    out(formatResults(r));
    if (saved && saved.saved) out(`\nSaved ${saved.saved.length} screenshot(s) to ${flags.save.dir} for review${saved.failed.length ? `; failed: ${saved.failed.map((x) => x.id).join(', ')}` : ''}. Local reference only; do not redistribute. Look at the terminal window in each, not the whole desktop.`);
    if (saved && !saved.saved) out(`\nSaved screenshot ${saved.n} to ${saved.file} (${saved.bytes} bytes). Local reference only; do not redistribute.`);
    if (crops) out(`Cut out ${crops.filter((c) => c.file).length} terminal window(s) as rice-<id>-t<n>.png: judge these, not the whole desktop.${crops.filter((c) => c.error).map((c) => `\n  ${c.id}: could not crop (${c.error})`).join('')}`);
  }
  return 0;
}

module.exports = {
  DATA_URL, ATTRIBUTION, TERMINALS, SHELLS, MOODS,
  load, normalize, normalizeTools, withSeen, loadSeen, cropTerminals, formatResults, CONTENTS, rank, search, searchDetailed, facets, facetsOf, saveImage, saveAll, parseQuery, parseArgs, main,
};
