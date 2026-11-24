'use strict';
const mkTmp = require('../_tmp');
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const png = require('../../kit/png');
const V = require('../../kit/preview');
const H = require('./_helpers');

const LOOK = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'look.json'), 'utf8'));
const px = (img, x, y) => '#' + [0, 1, 2].map((k) => img.data[(y * img.width + x) * 4 + k].toString(16).padStart(2, '0')).join('').toUpperCase();

test('html: valid-ish document with title, viewport and no external loads', () => {
  const page = V.html({ look: LOOK });
  assert.match(page, /^<!doctype html>/i);
  assert.match(page, /<html lang="en">[\s\S]*<\/html>\s*$/);
  assert.match(page, /<title>fixture - terminal look preview<\/title>/);
  assert.match(page, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  assert.ok(!/(src|href)=["']https?:/i.test(page), 'no external src/href');
  assert.ok(!/@import|url\(\s*["']?https?:/i.test(page), 'no external css');
  assert.ok(!/<script/i.test(page), 'no scripts');
  for (const tag of ['main', 'header', 'section', 'table', 'pre']) {
    assert.strictEqual((page.match(new RegExp(`<${tag}[ >]`, 'g')) || []).length, (page.match(new RegExp(`</${tag}>`, 'g')) || []).length, tag);
  }
});

test('html: contains every palette color, with the real values', () => {
  const raw = V.html({ look: LOOK });
  const page = raw.toUpperCase();
  const p = LOOK.palette;
  const all = [p.background, p.foreground, p.cursor, p.selectionBackground, p.accent, ...Object.values(p.ansi)];
  assert.strictEqual(all.length, 21);
  for (const hex of all) assert.ok(page.includes(hex.toUpperCase()), `missing ${hex}`);
  assert.match(raw, /--c9:#E0201E/);
  assert.match(raw, /--bg:#0B0909/);
});

test('html: font stack keeps the family first, the fallbacks next and ends in generic monospace', () => {
  const page = V.html({ look: LOOK });
  const m = /font-family:([^;]+);/.exec(page.slice(page.indexOf('pre.term')));
  assert.ok(m.length);
  assert.ok(m[1].startsWith('"JetBrains Mono", "Symbols Nerd Font Mono", ui-monospace'), m[1]);
  assert.ok(m[1].endsWith('monospace'));
  const evil = V.fontStack({ family: 'Evil"; } body{display:none} /*' });
  assert.ok(!/[;}{*\/]/.test(evil.split(',')[0]), `family name is sanitized: ${evil.split(',')[0]}`);
  assert.ok(!V.fontStack({ family: 'A', fallback: ['a', 'A'] }).match(/"A".*"A"/i), 'no duplicates');
});

test('html: background image is embedded as a data URI with its opacity, and decodes back', () => {
  const bg = H.flat(64, 40, '#FF0000');
  const page = V.html({ look: LOOK, background: { image: bg, opacity: 0.5 } });
  const m = /url\(data:image\/png;base64,([A-Za-z0-9+/=]+)\)/.exec(page);
  assert.ok(m, 'data uri present');
  const back = png.decode(Buffer.from(m[1], 'base64'));
  assert.deepStrictEqual([back.width, back.height], [64, 40]);
  assert.strictEqual(px(back, 10, 10), '#FF0000');
  assert.match(page, /opacity:0\.5"/);
  assert.match(page, /background-size:cover;background-position:right top/, 'look.background fit/align are used');
  const none = V.html({ look: { ...LOOK, background: undefined } });
  assert.ok(!none.includes('data:image'));
  assert.ok(!none.includes('bgimg"'));
  assert.ok(!/(foreground\/image)/.test(none));
});

test('html: a very large image is downscaled for embedding', () => {
  const page = V.html({ look: LOOK, background: { image: H.randomImage(2000, 100, 1, true) } });
  const m = /base64,([A-Za-z0-9+/=]+)\)/.exec(page);
  assert.strictEqual(png.decode(Buffer.from(m[1], 'base64')).width, 1280);
});

test('html: contrast table lists every pair from contrast.report, plus the image row when there is a background', () => {
  const plain = V.html({ look: LOOK });
  assert.strictEqual((plain.match(/<tr class="(ok|bad)">/g) || []).length, 18);
  assert.match(plain, /foreground\/background<\/td><td class="n">13\.28:1<\/td><td class="n">7:1<\/td><td>✔ pass/);
  assert.match(plain, /ansi\.red\/background<\/td><td class="n">2\.87:1<\/td><td class="n">4\.5:1<\/td><td>✘ below/);
  assert.match(plain, /Contrast \(13 of 18 pairs pass\)/);
  const withImg = V.html({ look: LOOK, background: { image: H.flat(40, 30, '#FFFFFF'), opacity: 1 } });
  assert.strictEqual((withImg.match(/<tr class="(ok|bad)">/g) || []).length, 19);
  assert.match(withImg, /foreground\/image \(worst region/);
});

test('html: sample session shows the prompt segments, colored ls, git status, a diff and an error', () => {
  const page = V.html({ look: LOOK });
  for (const s of ['~/projects/tweak-my-term', 'main ±2', '1.2s', 'node 24.1', '┌─', '└─', 'ls</span> -la', 'git</span> status -sb',
    '##</span> <span class="a2">main</span>','diff --git a/kit/palette.js', '@@ -12,4 +12,5 @@', 'Error: ENOENT', 'class="sel"', 'class="cur"']) {
    assert.ok(page.includes(s), `missing ${JSON.stringify(s)}`);
  }
  assert.match(page, /<span class="a1">-  const sx/);
  assert.match(page, /<span class="a2">\+  const sx/);
  const pl = V.html({ look: { ...LOOK, prompt: { style: 'powerline', lines: 1, segments: ['user', 'host', 'path', 'time', 'venv'] } } });
  assert.ok(pl.includes('class="pl"') && pl.includes('class="pl n"'));
  for (const s of ['dev', 'studio', '14:32', '.venv']) assert.ok(pl.includes(`>${s}</span>`), s);
  const rounded = V.html({ look: { ...LOOK, prompt: { style: 'rounded', segments: ['path'] } } });
  assert.ok(rounded.includes('class="pill"'));
});

test('html: cursor shape, window opacity and tabs follow the look', () => {
  const bar = V.html({ look: { ...LOOK, window: { ...LOOK.window, cursorShape: 'bar', opacity: 0.8, tabs: 'hidden' } } });
  assert.match(bar, /\.cur\{border-left:2px solid var\(--cursor\)/);
  assert.match(bar, /rgba\(11,9,9,0\.8\)/);
  assert.ok(!bar.includes('role="tablist"'));
  assert.ok(V.html({ look: LOOK }).includes('role="tablist"'));
});

test('html: phone-width rules and horizontal scrolling stay inside the terminal and table', () => {
  const page = V.html({ look: LOOK });
  assert.match(page, /@media \(max-width:520px\)/);
  assert.match(page, /pre\.term\{[^}]*overflow-x:auto/);
  assert.match(page, /\.tablewrap\{overflow-x:auto/);
  assert.match(page, /font-size:clamp\(11px,3vw,16px\)/);
  assert.match(page, /main\{max-width:1000px;margin:0 auto;padding:20px 16px/);
});

test('html: everything from the look is escaped', () => {
  const page = V.html({ look: { ...LOOK, name: '<script>alert(1)</script>', description: 'a & b "c"', mood: ['<b>'], prompt: { segments: ['<img src=x>'] } } });
  assert.ok(!page.includes('<script>alert'));
  assert.ok(page.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(page.includes('a &amp; b &quot;c&quot;'));
  assert.ok(!page.includes('<img src=x>'));
});

test('html: a palette override wins over the look, and bad input fails clearly', () => {
  const alt = { background: '#FFFFFF', foreground: '#111111', ansi: LOOK.palette.ansi };
  const page = V.html({ look: LOOK, palette: alt });
  assert.match(page, /--bg:#FFFFFF/);
  assert.throws(() => V.html({}), /look is required/);
  assert.throws(() => V.html({ look: { name: 'x' } }), /palette needs at least/);
});

test('swatch: chips for 5 base colors and 16 ANSI colors, in a fixed layout, with hex labels', () => {
  const img = V.swatch(LOOK.palette);
  assert.deepStrictEqual([img.width, img.height], [884, 294]);
  const p = LOOK.palette;
  assert.strictEqual(px(img, 30, 30), p.background.toUpperCase());
  assert.strictEqual(px(img, 200, 30), p.foreground.toUpperCase());
  assert.strictEqual(px(img, 372, 30), p.cursor.toUpperCase());
  assert.strictEqual(px(img, 544, 30), p.selectionBackground.toUpperCase());
  assert.strictEqual(px(img, 716, 30), p.accent.toUpperCase());
  assert.strictEqual(px(img, 30, 130), p.ansi.black.toUpperCase());
  assert.strictEqual(px(img, 138, 130), p.ansi.red.toUpperCase());
  assert.strictEqual(px(img, 780, 130), p.ansi.white.toUpperCase());
  assert.strictEqual(px(img, 30, 220), p.ansi.brightBlack.toUpperCase());
  assert.strictEqual(px(img, 780, 220), p.ansi.brightWhite.toUpperCase());
  let label = 0;
  for (let y = 78; y < 94; y++) for (let x = 16; x < 100; x++) if (px(img, x, y) === p.foreground.toUpperCase()) label++;
  assert.ok(label > 40, `label pixels under the first chip: ${label}`);
  const decoded = png.decode(png.encode(img));
  assert.strictEqual(px(decoded, 138, 130), p.ansi.red.toUpperCase());
});

// ---- layout ----------------------------------------------------------------------------------
// The user approves the arrangement in the preview, before any config is written.

const THREE = {
  gap: 12,
  arrangement: { split: 'row', sizes: [60, 40], panes: [
    { run: 'nvim', focus: true },
    { split: 'column', panes: [{ run: 'shell' }, { run: 'btop' }] },
  ] },
};
const withLayout = (layout) => ({ ...LOOK, layout });

test('html: a pane arrangement draws one box per pane, sized and nested as specified', () => {
  const page = V.html({ look: withLayout(THREE) });
  const panes = page.match(/<div class="pane[^"]*" data-run="[^"]*"/g) || [];
  assert.deepStrictEqual(panes.map((p) => /data-run="([^"]*)"/.exec(p)[1]), ['nvim', 'shell', 'btop']);
  assert.match(page, /class="split row" style="gap:12px">\s*<div class="cell" style="flex:60 1 0">/);
  assert.match(page, /class="split column" style="gap:12px">/);
  assert.match(page, /class="pane focus" data-run="nvim"/);
  assert.strictEqual((page.match(/class="pane focus"/g) || []).length, 1);
  assert.match(page, /\.pane\.focus\{[^}]*var\(--accent\)/, 'focus border uses the accent');
  assert.ok(/data-run="shell"[\s\S]*?<span class="cur">/.test(page), 'the shell pane shows the prompt');
  assert.match(page, /Layout<\/dt><dd>row 60\/40: nvim \| column: shell, btop; gap 12px<\/dd>/);
});

test('html: a fetch pane shows the look\'s own OS, shell, terminal and font', () => {
  const look = { ...withLayout({ arrangement: { split: 'row', panes: [{ run: 'shell', focus: true }, { run: 'fastfetch' }] } }) };
  const page = V.html({ look });
  const body = /data-run="fastfetch"><pre[^>]*>([\s\S]*?)<\/pre>/.exec(page)[1].replace(/<[^>]+>/g, '');
  assert.match(body, /os\s+Windows/);
  assert.match(body, /shell\s+bash/);
  assert.match(body, /term\s+windows-terminal/);
  assert.match(body, /font\s+JetBrains Mono/);
  assert.ok(!/wezterm|Linux/.test(body), 'no hard-coded system');
});

test('html: text in a pane wraps at the pane edge instead of being cut off', () => {
  const page = V.html({ look: withLayout(THREE) });
  assert.match(page, /pre\.pt\{[^}]*white-space:pre-wrap/);
});

test('html: without an arrangement the preview is one window, as before', () => {
  const page = V.html({ look: LOOK });
  assert.ok(!/class="pane/.test(page));
  assert.match(page, /<pre class="term" aria-label="Sample terminal session">/);
});

test('html: bad arrangements fail clearly', () => {
  const bad = (arrangement, re) => assert.throws(() => V.html({ look: withLayout({ arrangement }) }), re);
  bad({ split: 'row', panes: [{ run: 'a' }] }, /a split needs at least 2 panes/);
  bad({ split: 'row', sizes: [1], panes: [{ run: 'a' }, { run: 'b' }] }, /sizes must have one number per pane/);
  bad({ run: 'a', split: 'row', panes: [{ run: 'b' }, { run: 'c' }] }, /a pane is either a split or runs something/);
  bad({ split: 'diagonal', panes: [{ run: 'a' }, { run: 'b' }] }, /split must be row or column/);
});

// ---- --png: render the preview with a local Chromium-family browser ---------------------------
// Agents without a browser tool still need to see the page they ask the user to approve.

test('findBrowser: Windows Edge from Program Files when it exists', () => {
  const edge = 'C:\\PF86\\Microsoft\\Edge\\Application\\msedge.exe';
  const got = V.findBrowser({ os: 'windows', env: { 'ProgramFiles(x86)': 'C:\\PF86' }, exists: (p) => p === edge, which: () => null });
  assert.strictEqual(got, edge);
});

test('findBrowser: Linux and macOS find a browser on PATH or in /Applications; null when none', () => {
  assert.strictEqual(V.findBrowser({ os: 'linux', env: {}, exists: () => false, which: (c) => (c === 'chromium' ? '/usr/bin/chromium' : null) }), '/usr/bin/chromium');
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  assert.strictEqual(V.findBrowser({ os: 'macos', env: {}, exists: (p) => p === mac, which: () => null }), mac);
  assert.strictEqual(V.findBrowser({ os: 'linux', env: {}, exists: () => false, which: () => null }), null);
});

test('screenshot: runs the browser headless on the page and reports the PNG it wrote', () => {
  const dir = mkTmp('tmt-shot-');
  const html = path.join(dir, 'preview.html');
  const out = path.join(dir, 'preview.png');
  fs.writeFileSync(html, '<html></html>');
  let call;
  const exec = (cmd, args) => { call = { cmd, args }; fs.writeFileSync(out, 'png'); return { status: 0, stdout: '', stderr: '' }; };
  const r = V.screenshot(html, out, { browser: '/bin/chromium', exec, width: 1200, height: 800 });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(call.cmd, '/bin/chromium');
  assert.ok(call.args.includes('--headless=new'));
  assert.ok(call.args.includes(`--screenshot=${out}`));
  assert.ok(call.args.includes('--window-size=1200,800'));
  assert.ok(call.args.some((a) => a.startsWith('file:') && a.endsWith('preview.html')));
});

test('screenshot: reports failure when the browser writes nothing', () => {
  const dir = mkTmp('tmt-shot-');
  const r = V.screenshot(path.join(dir, 'p.html'), path.join(dir, 'p.png'), { browser: 'x', exec: () => ({ status: 1, stdout: '', stderr: 'boom' }) });
  assert.strictEqual(r.ok, false);
  assert.match(r.error, /boom|no image/);
});
