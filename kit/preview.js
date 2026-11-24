'use strict';
// Preview of a look before anything touches the machine: a self-contained HTML page (mock terminal window with the
// real palette, font stack, background image, prompt and a sample session, plus swatches and a contrast table) and
// a swatch PNG.
//
//   html({ look, palette, background, prompt })  -> string
//       look        look spec (name, font, window, background, prompt, ...)
//       palette     optional override of look.palette
//       background  { image: raster | png: Buffer | dataUri: string, opacity, fit, align } (opacity/fit/align default to look.background)
//       prompt      optional override of look.prompt
//   swatch(palette) -> raster image of the 5 base colors and the 16 ANSI colors with hex labels
const C = require('./color');
const R = require('./raster');
const png = require('./png');
const contrast = require('./contrast');
const { ANSI_NAMES, BRIGHT_NAMES } = require('./palette');
const { normalizePalette, FONT } = require('./treat');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const ALL = [...ANSI_NAMES, ...BRIGHT_NAMES];
const GENERIC = ['ui-monospace', 'SFMono-Regular', 'Cascadia Mono', 'Menlo', 'Consolas', 'DejaVu Sans Mono', 'Liberation Mono', 'monospace'];

// "JetBrains Mono", "Symbols Nerd Font Mono", ui-monospace, ..., monospace  (names are sanitized, nothing is loaded)
function fontStack(font = {}) {
  const names = [font.family, ...(font.fallback || []), ...GENERIC].filter(Boolean);
  const seen = new Set();
  return names
    .map((n) => String(n).replace(/[^\w .+-]/g, '').trim())
    .filter((n) => n && !seen.has(n.toLowerCase()) && seen.add(n.toLowerCase()))
    .map((n) => (n === 'monospace' || n === 'ui-monospace' ? n : `"${n}"`))
    .join(', ');
}

const readable = (bg, a, b) => (C.contrast(bg, a) >= C.contrast(bg, b) ? a : b);

// ------------------------------------------------------------------ background image

function backgroundInfo(look, bg) {
  const spec = look.background || {};
  const opts = bg || {};
  let image = opts.image || null;
  if (!image && opts.png) image = png.decode(opts.png);
  let uri = opts.dataUri || null;
  if (image && !uri) {
    const big = Math.max(image.width, image.height), scale = big > 1280 ? 1280 / big : 1;
    const small = scale < 1 ? R.resize(image, Math.round(image.width * scale), Math.round(image.height * scale)) : image;
    uri = 'data:image/png;base64,' + png.encode(small).toString('base64');
  }
  if (!uri) return null;
  return { uri, image, opacity: opts.opacity ?? spec.opacity ?? 1, fit: opts.fit || spec.fit || 'cover', align: opts.align || spec.align || 'center' };
}

function cssFit(fit, align) {
  const a = String(align).toLowerCase();
  const pos = `${a.includes('left') ? 'left' : a.includes('right') ? 'right' : 'center'} ${a.includes('top') ? 'top' : a.includes('bottom') ? 'bottom' : 'center'}`;
  const size = { cover: 'cover', contain: 'contain', fill: '100% 100%', center: 'auto', tile: 'auto' }[fit] || 'cover';
  return `background-size:${size};background-position:${pos};background-repeat:${fit === 'tile' ? 'repeat' : 'no-repeat'}`;
}

// ------------------------------------------------------------------ prompt

const SEG_COLOR = { path: 4, git: 5, duration: 3, status: 2, runtimes: 6, time: 8, user: 2, host: 5, venv: 6, battery: 3 };
const SEG_TEXT = {
  path: () => '~/projects/tweak-my-term', git: () => 'main ±2', duration: () => '1.2s', runtimes: () => 'node 24.1',
  time: () => '14:32', user: () => 'dev', host: () => 'studio', venv: () => '.venv', battery: () => '82%',
  status: (ok) => (ok ? '✔' : '✘ 1'),
};

function promptHtml(spec = {}, ok = true, withCursor = false) {
  const style = spec.style || 'plain';
  const lines = spec.lines || 1;
  const segs = (spec.segments && spec.segments.length ? spec.segments : ['path', 'git']).filter((s) => style !== 'minimal' || s === 'path');
  const arrow = `<span class="${ok ? 'a2' : 'a1'} b">❯</span> `;
  const item = (name) => {
    const fn = SEG_TEXT[name];
    return { name, text: fn ? fn(name === 'status' ? ok : undefined) : name, ci: name === 'status' ? (ok ? 2 : 1) : SEG_COLOR[name] ?? 8 };
  };
  const items = segs.map(item);
  let first;
  if (style === 'powerline') {
    first = items.map((it, i) => `<span class="pl${i ? ' n' : ''}" style="--sb:var(--c${it.ci});--st:var(--ink${it.ci})">${esc(it.text)}</span>`).join('');
  } else if (style === 'rounded') {
    first = items.map((it) => `<span class="pill" style="--sb:var(--c${it.ci});--st:var(--ink${it.ci})">${esc(it.text)}</span>`).join(' ');
  } else if (style === 'boxed') {
    first = `<span class="a8">┌─</span>` + items.map((it) => `<span class="a8">[</span><span class="a${it.ci}">${esc(it.text)}</span><span class="a8">]</span>`).join('<span class="a8">─</span>');
  } else {
    first = items.map((it) => `<span class="a${it.ci}${it.name === 'path' ? ' b' : ''}">${esc(it.text)}</span>`).join(' ');
  }
  const cur = withCursor ? '<span class="cur"> </span>' : '';
  const input = style === 'boxed' ? `<span class="a8">└─</span>${arrow}` : arrow;
  const out = [];
  if (lines === 1 && style !== 'boxed') out.push(first + ' ' + arrow);
  else {
    if (lines === 3) out.push('');
    out.push(first);
    out.push(input);
  }
  return { head: out.slice(0, -1), last: out[out.length - 1], cur };
}

// ------------------------------------------------------------------ sample session

function session(prompt) {
  const L = [];
  const p = (ok, cmd, cursor) => {
    const ph = promptHtml(prompt, ok, cursor);
    for (const h of ph.head) L.push(h);
    L.push(ph.last + cmd + ph.cur);
  };
  const cmd = (name, rest = '') => `<span class="a2 b">${esc(name)}</span>${rest ? ' ' + esc(rest) : ''}`;
  p(true, cmd('ls', '-la'));
  L.push('<span class="a8">drwxr-xr-x</span> <span class="a2">dev</span>    <span class="a2">-</span> <span class="a4">Nov 23 10:12</span> <span class="a4 b">catalog/</span>');
  L.push('<span class="a8">drwxr-xr-x</span> <span class="a2">dev</span>    <span class="a2">-</span> <span class="a4">Nov 22 18:40</span> <span class="a4 b">kit/</span>');
  L.push('<span class="a8">-rw-r--r--</span> <span class="a2">dev</span> <span class="a2">1.2k</span> <span class="a4">Nov 23 09:58</span> package.json');
  L.push('<span class="a8">-rwxr-xr-x</span> <span class="a2">dev</span> <span class="a2">4.1k</span> <span class="a4">Nov 21 17:02</span> <span class="a2 b">build.sh*</span>');
  L.push('<span class="a8">lrwxrwxrwx</span> <span class="a2">dev</span>   <span class="a2">20</span> <span class="a4">Nov 20 08:15</span> <span class="a6">current</span> <span class="a8">-&gt;</span> releases/v2');
  L.push('<span class="a8">-rw-r--r--</span> <span class="a2">dev</span> <span class="a2">880k</span> <span class="a4">Nov 19 14:30</span> <span class="a1">anchor.tar.gz</span>');
  L.push('');
  p(true, cmd('git', 'status -sb'));
  L.push('<span class="a8">##</span> <span class="a2">main</span>...<span class="a1">origin/main</span> [ahead 1]');
  L.push('<span class="a1"> M</span> kit/scene.js');
  L.push('<span class="a2">A </span> kit/treat.js');
  L.push('<span class="a1">??</span> tmp/');
  L.push('');
  p(true, cmd('git', 'diff kit/palette.js'));
  L.push('<span class="b">diff --git a/kit/palette.js b/kit/palette.js</span>');
  L.push('<span class="a6">@@ -12,4 +12,5 @@</span> <span class="a8">function extract(img, k = 12) {</span>');
  L.push('   const { width: w, height: h } = img;');
  L.push('<span class="a1">-  const sx = Math.ceil(w / 200);</span>');
  L.push('<span class="a2">+  const sx = Math.max(1, Math.ceil(w / 200));</span>');
  L.push('   const hist = new Map();');
  L.push('');
  p(true, `${cmd('node', 'build.js')}`);
  L.push('<span class="a9 b">Error: ENOENT: no such file or directory, open \'config.json\'</span>');
  L.push('<span class="a8">    at Object.openSync (node:fs:573:18)</span>');
  L.push('<span class="a8">    at readFileSync (node:fs:452:35)</span>');
  L.push('');
  p(false, `${cmd('echo')} "<span class="sel">selected text</span>"`);
  p(true, '', true);
  return L.join('\n');
}

// ------------------------------------------------------------------ panes
// look.layout.arrangement: { split: 'row'|'column', sizes?: [n...], panes: [node...] } or a leaf { run, focus? }.
// Each pane shows a small mock of what runs in it, so the user can judge the arrangement before configs exist.

function checkArrangement(node, at = 'layout.arrangement') {
  if (!node || typeof node !== 'object') throw new Error(`${at}: a pane must be an object`);
  const isSplit = node.split !== undefined || node.panes !== undefined;
  if (isSplit && node.run !== undefined) throw new Error(`${at}: a pane is either a split or runs something, not both`);
  if (!isSplit) return;
  if (node.split !== 'row' && node.split !== 'column') throw new Error(`${at}: split must be row or column`);
  if (!Array.isArray(node.panes) || node.panes.length < 2) throw new Error(`${at}: a split needs at least 2 panes`);
  if (node.sizes !== undefined && (!Array.isArray(node.sizes) || node.sizes.length !== node.panes.length || node.sizes.some((n) => !(n > 0)))) {
    throw new Error(`${at}: sizes must have one number per pane, each above 0`);
  }
  node.panes.forEach((p, i) => checkArrangement(p, `${at}.panes[${i}]`));
}

function describeArrangement(node, depth = 0) {
  if (!node.panes) return String(node.run || 'shell');
  return `${node.split}${node.sizes ? ' ' + node.sizes.join('/') : ''}: ${node.panes.map((p) => describeArrangement(p, depth + 1)).join(depth ? ', ' : ' | ')}`;
}


// 3x5 block digits for a clock pane (what tclock, tty-clock or a clock script prints).
const DIGITS = {
  0: ['███', '█ █', '█ █', '█ █', '███'], 1: [' █ ', '██ ', ' █ ', ' █ ', '███'],
  2: ['███', '  █', '███', '█  ', '███'], 3: ['███', '  █', '███', '  █', '███'],
  4: ['█ █', '█ █', '███', '  █', '  █'], 5: ['███', '█  ', '███', '  █', '███'],
  6: ['███', '█  ', '███', '█ █', '███'], 7: ['███', '  █', '  █', '  █', '  █'],
  8: ['███', '█ █', '███', '█ █', '███'], 9: ['███', '█ █', '███', '  █', '███'],
  ':': [' ', '█', ' ', '█', ' '],
};
const bigTime = (t) => [0, 1, 2, 3, 4].map((row) => [...t].map((ch) => DIGITS[ch][row]).join(' '));

const SHELLS_RUN = /^(shell|sh|bash|zsh|fish|pwsh|powershell|nu|nushell|cmd|terminal)?$/i;
function paneBody(run, prompt, sys = {}) {
  const r = String(run || '').toLowerCase();
  const L = [];
  if (SHELLS_RUN.test(r)) {
    const ph = promptHtml(prompt, true, false);
    for (const h of ph.head) L.push(h);
    L.push(ph.last + '<span class="a2 b">git</span> log --oneline -2');
    L.push('<span class="a3">4eda6be</span> docs: design guide');
    L.push('<span class="a3">a7dced9</span> feat(catalog): window managers');
    const pc = promptHtml(prompt, true, true);
    for (const h of pc.head) L.push(h);
    L.push(pc.last + pc.cur);
  } else if (/vim|nvim|hx|helix|editor|code|emacs|micro/.test(r)) {
    const code = [
      '<span class="a5">function</span> <span class="a4">fit</span>(img, w, h) {',
      '  <span class="a5">const</span> s = Math.<span class="a4">max</span>(w / img.width, h / img.height);',
      '  <span class="a8">// cover: crop the overflow</span>',
      '  <span class="a5">return</span> <span class="a4">resize</span>(img, s, <span class="a2">&#39;cover&#39;</span>);',
      '}',
    ];
    code.forEach((c, i) => L.push(`<span class="a8">${String(i + 1).padStart(3)}</span>  ${c}`));
  } else if (/btop|htop|top|monitor|bottom|glances/.test(r)) {
    const bar = (n, cls) => `<span class="${cls}">${'█'.repeat(n)}</span><span class="a8">${'░'.repeat(20 - n)}</span>`;
    L.push(`<span class="a8">cpu</span>  ${bar(7, 'a2')}  34%`);
    L.push(`<span class="a8">mem</span>  ${bar(12, 'a3')}  61%`);
    L.push(`<span class="a8">gpu</span>  ${bar(16, 'a1')}  82%`);
    L.push(`<span class="a8">net</span>  <span class="a6">↓ 2.1 MB/s</span>  <span class="a5">↑ 180 kB/s</span>`);
  } else if (/git|lazygit|tig/.test(r)) {
    L.push('<span class="a8">Commits</span>');
    L.push('<span class="sel"><span class="a3">4eda6be</span> docs: design guide </span>');
    L.push('<span class="a3">71ee89f</span> feat(kit): layout search');
    L.push('<span class="a8">Files</span>  <span class="a1">M</span> kit/preview.js');
  } else if (/yazi|ranger|lf|nnn|files|broot|mc/.test(r)) {
    L.push('<span class="a4 b">catalog/</span>');
    L.push('<span class="sel"><span class="a4 b">kit/</span>         </span>');
    L.push('package.json');
    L.push('<span class="a2 b">build.sh</span>');
  } else if (/clock|tclock|tty-clock|time/.test(r)) {
    L.push('');
    for (const row of bigTime('21:47')) L.push(`<span class="a5">${row}</span>`);
    L.push('', '<span class="a8">  tue 24 nov</span>');
  } else if (/fetch|neofetch|fastfetch/.test(r)) {
    for (const [k, v] of [['os', sys.os], ['shell', sys.shell], ['term', sys.term], ['font', sys.font]]) if (v) L.push(`<span class="a8">${k.padEnd(6)}</span><span class="a4">${esc(v)}</span>`);
  } else {
    L.push(`<span class="a8">${esc(run)}</span>`);
  }
  return L.join('\n');
}

// What a fetch pane would print for this look: its first target OS, default shell,
// terminal and font. Nothing invented when the look doesn't say.
const OS_NAMES = { windows: 'Windows', macos: 'macOS', linux: 'Linux' };
function systemInfo(look) {
  const [osKey, target] = Object.entries(look.targets || {})[0] || [];
  const shell = (look.shells || []).find((x) => x.default) || (look.shells || [])[0];
  return { os: OS_NAMES[osKey], shell: shell && shell.id, term: target && target.terminal, font: look.font && look.font.family };
}

function panesHtml(node, prompt, gap, sys, depth = 0) {
  if (!node.panes) {
    return `<div class="pane${node.focus ? ' focus' : ''}" data-run="${esc(node.run || 'shell')}"><pre class="term pt" aria-label="${esc(node.run || 'shell')} pane">${paneBody(node.run, prompt, sys)}</pre></div>`;
  }
  const cells = node.panes.map((p, i) => `<div class="cell" style="flex:${node.sizes ? node.sizes[i] : 1} 1 0">${panesHtml(p, prompt, gap, sys, depth + 1)}</div>`);
  return `<div class="split ${node.split}" style="gap:${gap}px">\n${cells.join('\n')}\n</div>`;
}

// ------------------------------------------------------------------ html

function html({ look, palette, background, prompt } = {}) {
  if (!look || typeof look !== 'object') throw new Error('preview.html: look is required');
  const pal = normalizePalette(palette || look.palette);
  const bg = backgroundInfo(look, background);
  const pr = prompt || look.prompt || {};
  const win = look.window || {};
  const lay = look.layout || {};
  if (lay.arrangement) checkArrangement(lay.arrangement);
  const gap = Number.isInteger(lay.gap) && lay.gap >= 0 ? lay.gap : 0;
  const font = look.font || {};
  const name = look.name || 'look';
  const pad = (win.padding && win.padding.length ? win.padding : [12, 16, 12, 16]);
  const [pt, pr_, pb, pl] = pad.length === 1 ? [pad[0], pad[0], pad[0], pad[0]] : pad.length === 2 ? [pad[0], pad[1], pad[0], pad[1]] : pad.length === 3 ? [pad[0], pad[1], pad[2], pad[1]] : pad;
  const opacity = win.opacity ?? 1;
  const fontPx = Math.round(((font.size || 12) * 4) / 3 * 10) / 10;
  const cursorCss = { bar: 'border-left:2px solid var(--cursor)', underline: 'border-bottom:2px solid var(--cursor)', 'hollow-block': 'outline:1px solid var(--cursor);outline-offset:-1px' }[win.cursorShape] || 'background:var(--cursor);color:var(--bg)';
  const rows = contrast.report(pal, bg && bg.image ? { image: bg.image, opacity: bg.opacity } : {});
  const passed = rows.filter((r) => r.ok).length;
  const chips = [['background', pal.background], ['foreground', pal.foreground], ['cursor', pal.cursor], ['selection', pal.selectionBackground], ['accent', pal.accent]];
  const vars = [
    `--bg:${pal.background}`, `--fg:${pal.foreground}`, `--cursor:${pal.cursor}`, `--sel:${pal.selectionBackground}`, `--accent:${pal.accent}`,
    ...ALL.map((n, i) => `--c${i}:${pal.ansi[n]}`),
    ...ALL.map((n, i) => `--ink${i}:${readable(pal.ansi[n], pal.background, pal.foreground)}`),
  ].join(';');
  const ansiCss = ALL.map((n, i) => `.a${i}{color:var(--c${i})}`).join('');
  const shells = (look.shells || []).map((s) => s.id);
  const tabNames = shells.length ? shells : ['shell'];
  const tabsHidden = win.tabs === 'hidden';
  const titlebarHidden = win.titlebar === 'hidden';
  const barBg = C.mix(pal.background, pal.foreground, 0.09);
  const tabBar = tabsHidden ? '' : `<div class="tabs" role="tablist">${tabNames.map((t, i) => `<span class="tab${i ? '' : ' on'}" role="tab">${esc(t)}</span>`).join('')}<span class="tab plus">+</span></div>`;
  const title = titlebarHidden ? '' : `<div class="title"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="ttl">${esc(name)}</span></div>`;

  const facts = [];
  const fact = (k, v) => { if (v !== undefined && v !== null && v !== '') facts.push([k, v]); };
  fact('Font', `${font.family || 'default'}${font.fallback && font.fallback.length ? ' + ' + font.fallback.join(', ') : ''} ${font.size || ''}pt${font.ligatures ? ', ligatures' : ''}${font.lineHeight ? `, line height ${font.lineHeight}` : ''}`);
  fact('Window', [win.columns && win.rows ? `${win.columns}x${win.rows}` : '', win.opacity !== undefined ? `opacity ${win.opacity}` : '', win.blur ? 'blur' : '', win.cursorShape ? `${win.cursorShape} cursor` : '', win.padding ? `padding ${win.padding.join('/')}` : ''].filter(Boolean).join(', '));
  if (look.background && (look.background.image || bg)) {
    fact('Background', [look.background.image || 'image', `${bg ? bg.fit : look.background.fit || ''}`, `opacity ${bg ? bg.opacity : look.background.opacity ?? 1}`, (look.background.treatment || []).join(' + ')].filter(Boolean).join(', '));
  }
  fact('Prompt', [pr.engine, pr.style, pr.lines ? `${pr.lines} line${pr.lines > 1 ? 's' : ''}` : '', (pr.segments || []).join(' ')].filter(Boolean).join(', '));
  if (lay.arrangement) fact('Layout', `${describeArrangement(lay.arrangement)}${gap ? `; gap ${gap}px` : ''}`);
  fact('Shells', (look.shells || []).map((s) => s.id + (s.default ? ' (default)' : '')).join(', '));
  fact('On start', look.onStart ? [look.onStart.fetch, look.onStart.art].filter(Boolean).join(', ') : '');
  fact('Tools', (look.tools || []).join(', '));

  const chipHtml = (label, hex, sub) => `<div class="chip" style="background:${hex};color:${readable(hex, '#000000', '#FFFFFF')}"><b>${esc(label)}</b><span>${hex}</span>${sub ? `<em>${esc(sub)}</em>` : ''}</div>`;
  const rowsHtml = rows.map((r) => `<tr class="${r.ok ? 'ok' : 'bad'}"><td>${esc(r.pair)}</td><td class="n">${r.ratio.toFixed(2)}:1</td><td class="n">${r.min}:1</td><td>${r.ok ? '✔ pass' : '✘ below'}</td></tr>`).join('');

  const screenBg = opacity < 1 ? `background:rgba(${C.hexToRgb(pal.background).join(',')},${opacity})` : 'background:var(--bg)';
  const bgLayer = bg ? `<div class="bgimg" style="background-image:url(${bg.uri});${cssFit(bg.fit, bg.align)};opacity:${bg.opacity}"></div>` : '';
  const desc = look.description ? `<p class="desc">${esc(look.description)}</p>` : '';
  const mood = look.mood && look.mood.length ? `<ul class="mood">${look.mood.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>` : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name)} - terminal look preview</title>
<style>
:root{color-scheme:light dark;--page:#f3f4f6;--ink:#1b1d22;--mute:#5b6270;--card:#fff;--line:#d9dce2;--ok:#17703a;--no:#b3261e}
@media (prefers-color-scheme:dark){:root{--page:#14161a;--ink:#e6e8ec;--mute:#9aa2b0;--card:#1c1f25;--line:#30343c;--ok:#6fcf97;--no:#ff8a80}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--page);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:1000px;margin:0 auto;padding:20px 16px 48px}
h1{font-size:1.6rem;margin:0 0 4px}h2{font-size:1.1rem;margin:28px 0 10px}
.desc{margin:0 0 8px;color:var(--mute)}
.mood{list-style:none;padding:0;margin:0 0 16px;display:flex;flex-wrap:wrap;gap:6px}
.mood li{border:1px solid var(--line);border-radius:999px;padding:1px 10px;font-size:.85rem;color:var(--mute)}
.win{max-width:100%;border-radius:10px;overflow:hidden;border:1px solid var(--line);box-shadow:0 12px 32px rgba(0,0,0,.28);${opacity < 1 ? 'background:repeating-conic-gradient(#8884 0 25%,#0000 0 50%) 0 0/20px 20px,linear-gradient(135deg,#5b7cfa,#c44ec4)' : 'background:var(--bg)'}}
.bar{background:${barBg};color:${C.mix(pal.foreground, pal.background, 0.35)};font:13px system-ui,sans-serif}
.title{display:flex;align-items:center;gap:10px;padding:7px 12px}
.dots{display:flex;gap:6px}.dots i{width:11px;height:11px;border-radius:50%;background:${C.mix(pal.background, pal.foreground, 0.35)};display:block}
.ttl{flex:1;text-align:center;font-size:12px;opacity:.8}
.tabs{display:flex;gap:2px;padding:4px 8px 0;overflow-x:auto}
.tab{padding:4px 14px;border-radius:6px 6px 0 0;font-size:12px;white-space:nowrap}
.tab.on{background:var(--bg);color:var(--fg);border-top:2px solid var(--accent)}
.screen{position:relative;isolation:isolate;${screenBg}}
.bgimg{position:absolute;inset:0;z-index:0}
pre.term{position:relative;z-index:1;margin:0;padding:${pt}px ${pr_}px ${pb}px ${pl}px;color:var(--fg);overflow-x:auto;white-space:pre;tab-size:4;font-family:${fontStack(font)};font-size:clamp(11px,3vw,${fontPx}px);line-height:${font.lineHeight || 1.3};${font.ligatures === false ? 'font-variant-ligatures:none;' : ''}font-weight:${/^(bold|[5-9]00)$/.test(String(font.weight)) ? 'bold' : 'normal'}}
${ansiCss}.b{font-weight:bold}
.sel{background:var(--sel);color:var(--fg)}
.cur{${cursorCss};display:inline-block;width:.6em}
.layout{position:relative;z-index:1;display:flex;min-height:300px;aspect-ratio:16/10;padding:${gap}px}
.layout>.split,.cell{display:flex;flex:1 1 0;min-width:0;min-height:0}
.split{display:flex;flex:1 1 0;min-width:0;min-height:0}.split.row{flex-direction:row}.split.column{flex-direction:column}
.pane{flex:1 1 0;min-width:0;overflow:hidden;${screenBg};border:1px solid ${C.mix(pal.background, pal.foreground, 0.14)};border-radius:${gap ? 8 : 0}px}
.pane.focus{border-color:var(--accent)}
.pane:not(.focus) pre{opacity:.72}
pre.pt{overflow:hidden;white-space:pre-wrap;overflow-wrap:anywhere;font-size:clamp(10px,2.4vw,${fontPx}px)}
.pl{display:inline-block;background:var(--sb);color:var(--st);padding:0 .9em 0 .6em;clip-path:polygon(0 0,calc(100% - .5em) 0,100% 50%,calc(100% - .5em) 100%,0 100%)}
.pl.n{padding-left:1.1em;margin-left:-.45em;clip-path:polygon(0 0,calc(100% - .5em) 0,100% 50%,calc(100% - .5em) 100%,0 100%,.5em 50%)}
.pill{display:inline-block;background:var(--sb);color:var(--st);border-radius:999px;padding:0 .7em}
.chips{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
.chip{border-radius:8px;padding:8px 10px;border:1px solid var(--line);min-height:62px;display:flex;flex-direction:column;gap:2px;font-size:.8rem;overflow-wrap:anywhere}
.chip b{font-size:.85rem}.chip span{font-family:ui-monospace,Consolas,monospace}.chip em{font-style:normal;opacity:.8}
.tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:8px;background:var(--card)}
table{border-collapse:collapse;width:100%;font-size:.85rem;min-width:420px}
th,td{padding:6px 10px;text-align:left;border-bottom:1px solid var(--line)}td.n{font-variant-numeric:tabular-nums;white-space:nowrap}
tr.ok td:last-child{color:var(--ok)}tr.bad td:last-child{color:var(--no);font-weight:600}
dl{display:grid;grid-template-columns:max-content 1fr;gap:4px 16px;margin:0}dt{color:var(--mute)}dd{margin:0;overflow-wrap:anywhere}
@media (max-width:520px){dl{grid-template-columns:1fr}dt{margin-top:6px}}
.note{margin-top:28px;color:var(--mute);font-size:.85rem}
</style>
</head>
<body>
<main>
<header>
<h1>${esc(name)}</h1>
${desc}${mood}
</header>
<section aria-label="Terminal preview">
<div class="win" style="${vars}">
<div class="bar">${title}${tabBar}</div>
<div class="screen">${bgLayer}${lay.arrangement ? `<div class="layout">${panesHtml(lay.arrangement, pr, gap, systemInfo(look))}</div>` : `<pre class="term" aria-label="Sample terminal session">${session(pr)}</pre>`}</div>
</div>
</section>
<section aria-label="Palette">
<h2>Palette</h2>
<div class="chips">
${chips.map(([l, h]) => chipHtml(l, h)).join('\n')}
${ALL.map((n, i) => chipHtml(`${i} ${n}`, pal.ansi[n])).join('\n')}
</div>
</section>
<section aria-label="Contrast">
<h2>Contrast (${passed} of ${rows.length} pairs pass)</h2>
<div class="tablewrap"><table>
<thead><tr><th>Pair</th><th>Ratio</th><th>Needs</th><th>Result</th></tr></thead>
<tbody>
${rowsHtml}
</tbody>
</table></div>
</section>
${facts.length ? `<section aria-label="Details"><h2>Details</h2><dl>${facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>` : ''}
<p class="note">Preview only: nothing has been applied to this machine. Fonts show as installed locally, otherwise a fallback monospace font is used.</p>
</main>
</body>
</html>
`;
}

// ------------------------------------------------------------------ swatch

function drawText(img, text, x, y, scale, rgb) {
  let cx = x;
  for (const ch of String(text).toUpperCase()) {
    const rows = FONT[ch] || FONT[' '];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 5; c++) if (rows[r][c] === 'X') R.fillRect(img, cx + c * scale, y + r * scale, scale, scale, rgb);
    }
    cx += 6 * scale;
  }
}

function swatch(palette) {
  const pal = normalizePalette(palette);
  const M = 16, GAP = 12, CW = 96, CH = 56, LABEL = 14, ROW = CH + 6 + LABEL + 14;
  const W = M * 2 + 8 * CW + 7 * GAP, H = M * 2 + 3 * ROW - 14 + 6;
  const img = R.create(W, H, pal.background);
  const edge = C.mix(pal.background, pal.foreground, 0.4);
  const chip = (x, y, w, hex) => {
    R.fillRect(img, x - 1, y - 1, w + 2, CH + 2, edge);
    R.fillRect(img, x, y, w, CH, hex);
    drawText(img, hex, x + Math.round((w - 6 * 2 * 7 + 2) / 2), y + CH + 6, 2, pal.foreground);
  };
  const baseW = Math.floor((W - 2 * M - 4 * GAP) / 5);
  [pal.background, pal.foreground, pal.cursor, pal.selectionBackground, pal.accent].forEach((hex, i) => chip(M + i * (baseW + GAP), M, baseW, hex));
  ANSI_NAMES.forEach((n, i) => chip(M + i * (CW + GAP), M + ROW, CW, pal.ansi[n]));
  BRIGHT_NAMES.forEach((n, i) => chip(M + i * (CW + GAP), M + 2 * ROW, CW, pal.ansi[n]));
  return img;
}

// ------------------------------------------------------------------ png
// A local Chromium-family browser renders the page headless, so an agent without a browser
// tool can still look at what it asks the user to approve.

const BROWSERS = {
  windows: (env) => {
    // Windows env names are case-insensitive, but a copied env object is not (Git Bash
    // passes PROGRAMFILES), so look them up in any case.
    const get = (k) => env[Object.keys(env).find((n) => n.toLowerCase() === k.toLowerCase())];
    const roots = [get('ProgramFiles(x86)'), get('ProgramFiles'), get('LOCALAPPDATA')].filter(Boolean);
    const rel = [['Microsoft', 'Edge', 'Application', 'msedge.exe'], ['Google', 'Chrome', 'Application', 'chrome.exe'],
      ['BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'], ['Chromium', 'Application', 'chrome.exe']];
    return roots.flatMap((r) => rel.map((p) => require('path').win32.join(r, ...p)));
  },
  macos: () => ['Google Chrome', 'Microsoft Edge', 'Chromium', 'Brave Browser'].map((n) => `/Applications/${n}.app/Contents/MacOS/${n}`),
  linux: () => [],
};
const ON_PATH = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge', 'microsoft-edge-stable', 'brave-browser', 'msedge', 'chrome'];

/** Path of a Chromium-family browser on this machine, or null. */
function findBrowser({ os, env = process.env, exists = require('fs').existsSync, which = require('../engine/sys').which } = {}) {
  // The browser runs on this machine, so the host OS decides, never the simulated TMT_OS.
  const osName = os || { win32: 'windows', darwin: 'macos' }[process.platform] || 'linux';
  const file = (BROWSERS[osName] || BROWSERS.linux)(env).find((p) => exists(p));
  if (file) return file;
  for (const c of ON_PATH) { const w = which(c); if (w) return w; }
  return null;
}

/** Render htmlFile to pngFile with a headless browser. Returns { ok, out } or { ok: false, error }. */
function screenshot(htmlFile, pngFile, { browser = findBrowser(), exec = require('../engine/sys').exec, width = 1280, height = 1000 } = {}) {
  const fs = require('fs');
  const path = require('path');
  if (!browser) return { ok: false, error: 'no Chrome, Edge, Chromium or Brave found; open the HTML file instead' };
  const out = path.resolve(pngFile);
  const profile = fs.mkdtempSync(path.join(require('os').tmpdir(), 'tmt-browser-'));
  try { fs.rmSync(out, { force: true }); } catch { /* nothing to clear */ }
  const url = require('url').pathToFileURL(path.resolve(htmlFile)).href;
  const r = exec(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`, `--screenshot=${out}`, url], { timeout: 60000 });
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* temp profile; the OS cleans it */ }
  if (fs.existsSync(out)) return { ok: true, out };
  return { ok: false, error: `the browser wrote no image (exit ${r.status}${r.stderr ? ': ' + r.stderr.trim().split(/\r?\n/).pop() : ''})` };
}

module.exports = { html, swatch, fontStack, findBrowser, screenshot };
