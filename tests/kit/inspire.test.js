'use strict';
// Inspire tests. Never touch the network: the dataset is a local fixture (TMT_RICES_FILE) and
// downloads go through a fake fetch.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const I = require('../../kit/inspire');

const FIXTURE = path.join(__dirname, 'fixtures', 'rices-sample.json');
const CLI = path.join(__dirname, '..', '..', 'engine', 'cli.js');
const raw = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
const entries = Object.values(raw).map(I.normalize);
const byId = Object.fromEntries(entries.map((e) => [e.id, e]));
const ids = (list) => list.map((x) => x.id);
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-inspire-'));

function withEnv(vars, fn) {
  const old = {};
  for (const k of Object.keys(vars)) { old[k] = process.env[k]; if (vars[k] === undefined) delete process.env[k]; else process.env[k] = vars[k]; }
  const restore = () => { for (const k of Object.keys(old)) { if (old[k] === undefined) delete process.env[k]; else process.env[k] = old[k]; } };
  return Promise.resolve().then(fn).finally(restore);
}

const fakeRes = (status, body, headers = {}) => ({
  status,
  ok: status >= 200 && status < 300,
  headers: { get: (k) => headers[k.toLowerCase()] ?? null },
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  arrayBuffer: async () => Buffer.from(body),
});

// ---- normalize --------------------------------------------------------------------------------

test('normalize: full shape for a typical entry', () => {
  assert.deepStrictEqual(byId.fx0001, {
    id: 'fx0001',
    title: '[Hyprland] cozy evening on Arch',
    url: 'https://www.reddit.com/r/unixporn/comments/fx0001/fx0001_slug/',
    author: 'fixture_user_01',
    image: 'https://example.invalid/img/fx0001.png',
    images: ['https://example.invalid/img/fx0001.png'],
    repo: 'https://github.com/example-user-01/dotfiles',
    wm: 'Hyprland',
    distro: 'Arch Linux',
    os: 'linux',
    colorscheme: 'Gruvbox',
    tools: ['kitty', 'zsh', 'waybar', 'starship', 'neovim'],
    score: 900,
    date: '2024-09-09',
    portable: false,
  });
});

test('normalize: gallery images follow the preview, missing fields become null or empty', () => {
  assert.deepStrictEqual(byId.fx0013.images, [
    'https://example.invalid/img/fx0013.png',
    'https://example.invalid/img/fx0013-b.png',
    'https://example.invalid/img/fx0013-c.png',
  ]);
  assert.strictEqual(byId.fx0014.colorscheme, null);
  assert.deepStrictEqual(byId.fx0014.tools, []);
  assert.deepStrictEqual(byId.fx0014.images, ['https://example.invalid/img/fx0014.png']);
  const bare = I.normalize({ id: 'x', title: 't', permalink: '/r/unixporn/comments/x/t/', github_url: 'https://github.com/a/b' });
  assert.strictEqual(bare.url, 'https://www.reddit.com/r/unixporn/comments/x/t/');
  assert.strictEqual(bare.image, null);
  assert.deepStrictEqual(bare.images, []);
  assert.strictEqual(bare.score, 0);
  assert.strictEqual(bare.date, null);
});

test('normalize: os inference from distro, wm, tools and title', () => {
  assert.strictEqual(byId.fx0001.os, 'linux'); // distro Arch Linux
  assert.strictEqual(byId.fx0003.os, 'macos'); // distro macOS
  assert.strictEqual(byId.fx0007.os, 'macos'); // no distro, wm AeroSpace
  assert.strictEqual(byId.fx0004.os, 'windows'); // no distro, tool Windows Terminal
  assert.strictEqual(byId.fx0012.os, 'windows'); // no distro, title "Windows 11 + WSL2"
  assert.strictEqual(byId.fx0010.os, 'linux'); // title says "purged Windows", wm AwesomeWM
  assert.strictEqual(I.normalize({ title: '[Aqua] desktop', distro: null, wm: null, utils_used: [] }).os, 'macos');
  assert.strictEqual(I.normalize({ title: 'rice', distro: 'FreeBSD' }).os, 'linux');
  assert.strictEqual(I.normalize({ title: 'rice', distro: 'Windows 10' }).os, 'windows');
});

test('normalizeTools: aliases collapse to canonical ids, order kept, duplicates dropped', () => {
  assert.deepStrictEqual(
    I.normalizeTools(['Kitty', 'Simple Terminal', 'rxvt-unicode', 'Oh My Posh', 'Windows Terminal', 'neovim with nvchad', 'pwsh', 'iTerm', 'Starship Prompt', 'foot running tmux', 'Polybar', 'kitty', 'ZSH', 'nvim']),
    ['kitty', 'st', 'urxvt', 'oh-my-posh', 'windows-terminal', 'neovim', 'powershell', 'iterm2', 'starship', 'foot', 'tmux', 'polybar', 'zsh'],
  );
  assert.deepStrictEqual(I.normalizeTools(undefined), []);
  assert.deepStrictEqual(I.normalizeTools(['  Jetbrains   Mono ']), ['jetbrains mono']);
});

test('normalize: portable means the look only needs things that exist on Windows', () => {
  assert.strictEqual(byId.fx0004.portable, true); // windows entry
  assert.strictEqual(byId.fx0007.portable, true); // wezterm + starship + fastfetch
  assert.strictEqual(byId.fx0015.portable, true); // alacritty + a colorscheme
  assert.strictEqual(byId.fx0001.portable, false); // kitty
  assert.strictEqual(byId.fx0011.portable, false); // foot
  assert.strictEqual(byId.fx0014.portable, false); // nothing to carry over
});

// ---- search -----------------------------------------------------------------------------------

test('search: "cozy" ranks the gruvbox entry first and pulls in warm colorschemes', async () => {
  const r = await I.searchDetailed('cozy', { entries, diverse: false });
  assert.deepStrictEqual(ids(r.results), ['fx0001', 'fx0003', 'fx0011', 'fx0013', 'fx0007', 'fx0012']);
  assert.strictEqual(r.results[0].colorscheme, 'Gruvbox');
  assert.strictEqual(r.results[0].why, 'matches title cozy, colorscheme gruvbox (fits "cozy"); 900 upvotes');
  assert.strictEqual(r.results[1].why, 'matches colorscheme catppuccin (fits "cozy"); 700 upvotes');
  assert.deepStrictEqual(r.notes, []);
});

test('search: other moods', async () => {
  const top = async (q) => ids(await I.search(q, { entries }));
  assert.deepStrictEqual(await top('cyberpunk'), ['fx0005', 'fx0004']);
  assert.deepStrictEqual(await top('like a cyberpunk HUD'), ['fx0005', 'fx0004']);
  assert.deepStrictEqual(await top('retro'), ['fx0006']);
  assert.deepStrictEqual(await top('minimal'), ['fx0002', 'fx0007']);
  assert.deepStrictEqual(await top('light'), ['fx0009']);
});

test('search: tool and distro words match, extra words in the query are ignored', async () => {
  assert.deepStrictEqual(ids(await I.search('kitty + zsh on Arch', { entries, limit: 3, diverse: false })), ['fx0005', 'fx0001', 'fx0013']);
  assert.deepStrictEqual(ids(await I.search('something with nvim', { entries })), ['fx0001', 'fx0011', 'fx0013', 'fx0007']);
  assert.deepStrictEqual(ids(await I.search('windows terminal', { entries })), ['fx0004']);
  assert.deepStrictEqual(ids(await I.search('tokyo night', { entries })), ['fx0004']);
});

test('parseQuery: stop words dropped, aliases and two-word names merged', () => {
  assert.deepStrictEqual(I.parseQuery('kitty + zsh on Arch').map((t) => t.term), ['kitty', 'zsh', 'arch']);
  assert.deepStrictEqual(I.parseQuery('Windows Terminal with nvim').map((t) => t.term), ['windows-terminal', 'neovim']);
  assert.deepStrictEqual(I.parseQuery('Tokyo Night').map((t) => t.term), ['tokyonight']);
  assert.deepStrictEqual(I.parseQuery('').map((t) => t.term), []);
});

test('search: no hit gives an empty list and a hint', async () => {
  const r = await I.searchDetailed('xyzzy', { entries });
  assert.deepStrictEqual(r.results, []);
  assert.match(r.notes[0], /^No rice matched "xyzzy"\. Try a mood/);
});

test('search: os filter is exact when anything matches', async () => {
  assert.deepStrictEqual(ids(await I.search('cozy', { entries, os: 'macos' })), ['fx0003', 'fx0007']);
  assert.deepStrictEqual(ids(await I.search('cozy', { entries, os: 'linux', limit: 20 })), ['fx0001', 'fx0011', 'fx0013', 'fx0015']);
  assert.throws(() => I.rank(entries, 'cozy', { os: 'beos' }), /Unknown --os "beos"/);
});

test('search: os=windows keeps native entries first, then portable ones, and says so', async () => {
  const r = await I.searchDetailed('cozy', { entries, os: 'windows' });
  assert.deepStrictEqual(ids(r.results), ['fx0012', 'fx0007', 'fx0015']);
  assert.deepStrictEqual(r.results.map((x) => x.portable), [true, true, true]);
  assert.strictEqual(r.results[1].why, 'matches colorscheme rosepine (fits "cozy"); portable to Windows; 260 upvotes');
  assert.strictEqual(r.notes.length, 1);
  assert.match(r.notes[0], /^Only 1 Windows-native rice matched; the rest are Linux\/macOS rices/);
});

test('search: terminal and shell filters; soft fallback when nothing matches exactly', async () => {
  assert.deepStrictEqual(ids(await I.search('gruvbox', { entries, terminal: 'alacritty' })), ['fx0012', 'fx0015']);
  const soft = await I.searchDetailed('gruvbox', { entries, terminal: 'wezterm' });
  assert.deepStrictEqual(ids(soft.results), ['fx0001', 'fx0012', 'fx0015']);
  assert.strictEqual(soft.results.every((x) => x.exact === false), true);
  assert.strictEqual(soft.notes[0], 'No rice matches all of terminal=wezterm for this query; showing the closest (partial matches first).');
  assert.match(soft.results[0].why, /no wezterm; 900 upvotes; closest match, not exact$/);
  const both = await I.searchDetailed('gruvbox', { entries, terminal: 'kitty', shell: 'bash' });
  assert.deepStrictEqual(ids(both.results), ['fx0001', 'fx0015', 'fx0012']);
  assert.throws(() => I.rank(entries, 'x', { terminal: 'notaterminal' }), /Unknown terminal "notaterminal"/);
  assert.deepStrictEqual(ids(await I.search('gruvbox', { entries, terminal: 'Windows Terminal' })).length, 3); // alias accepted, soft
});

test('search: limit, default limit, minScore and an empty query', async () => {
  assert.strictEqual((await I.search('cozy', { entries, limit: 2 })).length, 2);
  assert.strictEqual((await I.search('', { entries })).length, 6);
  assert.deepStrictEqual(ids(await I.search('', { entries, limit: 2, diverse: false })), ['fx0005', 'fx0001']);
  assert.deepStrictEqual(ids(await I.search('cozy', { entries, minScore: 500 })), ['fx0001', 'fx0003']);
});

// ---- facets -----------------------------------------------------------------------------------

test('facetsOf: counts by colorscheme, terminal, shell, wm, distro and os', () => {
  const f = I.facetsOf(entries, 3);
  assert.strictEqual(f.total, 15);
  assert.deepStrictEqual(f.os, [{ name: 'linux', count: 11 }, { name: 'macos', count: 2 }, { name: 'windows', count: 2 }]);
  assert.deepStrictEqual(f.colorschemes, [{ name: 'Gruvbox', count: 3 }, { name: 'Catppuccin', count: 2 }, { name: 'Everforest', count: 1 }]);
  assert.deepStrictEqual(f.terminals, [{ name: 'alacritty', count: 3 }, { name: 'kitty', count: 3 }, { name: 'konsole', count: 2 }]);
  assert.deepStrictEqual(f.shells, [{ name: 'zsh', count: 6 }, { name: 'bash', count: 3 }, { name: 'fish', count: 2 }]);
  assert.deepStrictEqual(f.wms, [{ name: 'Hyprland', count: 2 }, { name: 'i3', count: 2 }, { name: 'AeroSpace', count: 1 }]);
  assert.deepStrictEqual(f.distros, [{ name: 'Arch Linux', count: 4 }, { name: 'Debian', count: 1 }, { name: 'Fedora', count: 1 }]);
});

// ---- load -------------------------------------------------------------------------------------

test('load: TMT_RICES_FILE wins and needs no cache or network', async () => {
  await withEnv({ TMT_RICES_FILE: FIXTURE }, async () => {
    const d = await I.load({ fetchImpl: () => { throw new Error('network must not be used'); }, cacheDir: path.join(tmp(), 'none') });
    assert.strictEqual(d.source, 'file');
    assert.strictEqual(d.entries.length, 15);
    assert.deepStrictEqual(ids(await I.search('cozy', { limit: 1 })), ['fx0001']);
    assert.strictEqual((await I.facets()).total, 15);
  });
});

test('load: downloads once, serves the cache while fresh, revalidates with the etag when stale', async () => {
  await withEnv({ TMT_RICES_FILE: undefined }, async () => {
    const cacheDir = tmp();
    const calls = [];
    const text = fs.readFileSync(FIXTURE, 'utf8');
    const fetchImpl = async (url, init) => {
      calls.push(init.headers['if-none-match'] || null);
      return init.headers['if-none-match'] === '"v1"' ? fakeRes(304, '') : fakeRes(200, text, { etag: '"v1"' });
    };
    const t0 = Date.parse('2026-01-01T00:00:00Z');
    const a = await I.load({ cacheDir, fetchImpl, now: t0 });
    assert.strictEqual(a.source, 'network');
    assert.strictEqual(a.entries.length, 15);
    const meta = JSON.parse(fs.readFileSync(path.join(cacheDir, 'rices.meta.json'), 'utf8'));
    assert.strictEqual(meta.etag, '"v1"');
    assert.strictEqual(meta.fetchedAt, '2026-01-01T00:00:00.000Z');
    assert.strictEqual(meta.count, 15);

    const b = await I.load({ cacheDir, fetchImpl, now: t0 + 6 * 24 * 3600 * 1000 });
    assert.strictEqual(b.source, 'cache');
    assert.deepStrictEqual(calls, [null]);

    const c = await I.load({ cacheDir, fetchImpl, now: t0 + 8 * 24 * 3600 * 1000 });
    assert.strictEqual(c.source, 'cache');
    assert.strictEqual(c.revalidated, true);
    assert.deepStrictEqual(calls, [null, '"v1"']);
    assert.strictEqual(JSON.parse(fs.readFileSync(path.join(cacheDir, 'rices.meta.json'), 'utf8')).fetchedAt, '2026-01-09T00:00:00.000Z');

    const d = await I.load({ cacheDir, fetchImpl, now: t0 + 8 * 24 * 3600 * 1000, refresh: true });
    assert.strictEqual(d.revalidated, true);
    assert.strictEqual(calls.length, 3);
  });
});

test('load: network error falls back to the stale cache with a warning', async () => {
  await withEnv({ TMT_RICES_FILE: undefined }, async () => {
    const cacheDir = tmp();
    const t0 = Date.parse('2026-01-01T00:00:00Z');
    await I.load({ cacheDir, now: t0, fetchImpl: async () => fakeRes(200, fs.readFileSync(FIXTURE, 'utf8')) });
    const r = await I.load({ cacheDir, now: t0 + 30 * 24 * 3600 * 1000, fetchImpl: async () => { throw new Error('getaddrinfo ENOTFOUND'); } });
    assert.strictEqual(r.source, 'stale-cache');
    assert.strictEqual(r.entries.length, 15);
    assert.strictEqual(r.warning, 'Could not refresh the rice index (getaddrinfo ENOTFOUND); using the copy from 2026-01-01T00:00:00.000Z.');
    const s = await I.searchDetailed('cozy', { cacheDir, now: t0 + 30 * 24 * 3600 * 1000, fetchImpl: async () => fakeRes(503, '') });
    assert.match(s.notes[0], /^Could not refresh the rice index \(HTTP 503\)/);
    assert.strictEqual(s.results[0].id, 'fx0001');
  });
});

test('load: no cache and no network is a clear error, and bad downloads are not cached', async () => {
  await withEnv({ TMT_RICES_FILE: undefined }, async () => {
    const cacheDir = path.join(tmp(), 'cache');
    await assert.rejects(
      I.load({ cacheDir, fetchImpl: async () => { throw new Error('offline'); } }),
      (e) => /^Could not download the rice index \(offline\) and there is no cached copy at .*rices\.json\. Connect to the network and retry, or set TMT_RICES_FILE/.test(e.message),
    );
    await assert.rejects(I.load({ cacheDir, fetchImpl: async () => fakeRes(200, '<html>nope</html>') }), /Could not download the rice index/);
    await assert.rejects(I.load({ cacheDir, fetchImpl: async () => fakeRes(200, {}) }), /no rice entries/);
    assert.strictEqual(fs.existsSync(path.join(cacheDir, 'rices.json')), false);
  });
});

// ---- saveImage --------------------------------------------------------------------------------

test('saveImage: writes one screenshot locally, refuses non-images', async () => {
  const dir = path.join(tmp(), 'anchor');
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
  const seen = [];
  const ok = await I.saveImage(byId.fx0001, dir, { fetchImpl: async (u) => { seen.push(u); return fakeRes(200, png, { 'content-type': 'image/png' }); } });
  assert.deepStrictEqual(seen, ['https://example.invalid/img/fx0001.png']);
  assert.strictEqual(ok.file, path.join(path.resolve(dir), 'rice-fx0001.png'));
  assert.strictEqual(ok.bytes, 4);
  assert.deepStrictEqual(fs.readFileSync(ok.file), png);
  const jpg = await I.saveImage({ id: 'abc', image: 'https://i.example/x.jpg?w=1' }, dir, { fetchImpl: async () => fakeRes(200, png, { 'content-type': 'image/jpeg' }) });
  assert.strictEqual(path.basename(jpg.file), 'rice-abc.jpg');
  await assert.rejects(I.saveImage(byId.fx0001, dir, { fetchImpl: async () => fakeRes(200, '<html>', { 'content-type': 'text/html' }) }), /did not return an image \(text\/html\)/);
  await assert.rejects(I.saveImage(byId.fx0001, dir, { fetchImpl: async () => fakeRes(404, '') }), /HTTP 404/);
  await assert.rejects(I.saveImage({ id: 'z', image: null }, dir), /no screenshot link/);
});

// ---- CLI --------------------------------------------------------------------------------------

function tmt(args, extra = {}) {
  const state = tmp();
  const r = spawnSync(process.execPath, [CLI, 'inspire', ...args], {
    encoding: 'utf8',
    env: { ...process.env, TMT_RICES_FILE: FIXTURE, TMT_STATE: state, ...extra },
  });
  return { ...r, state };
}

test('parseArgs: query words, valued flags, --save takes two values', () => {
  const a = I.parseArgs(['cozy', 'gruvbox', '--os', 'linux', '--limit=3', '--json', '--save', '2', 'out', 'dir']);
  assert.deepStrictEqual(a.query, ['cozy', 'gruvbox', 'dir']);
  assert.deepStrictEqual(a.flags, { os: 'linux', limit: '3', json: true, save: { n: 2, dir: 'out' } });
  assert.throws(() => I.parseArgs(['--save', 'x']), /--save needs a result number \(or all\) and a folder/);
  assert.throws(() => I.parseArgs(['--os']), /--os needs a value/);
  assert.throws(() => I.parseArgs(['--bogus']), /Unknown flag --bogus/);
});

test('cli: tmt inspire cozy --json has the documented shape', () => {
  const r = tmt(['cozy', '--json']);
  assert.strictEqual(r.status, 0, r.stderr);
  const j = JSON.parse(r.stdout);
  assert.deepStrictEqual(Object.keys(j), ['query', 'filters', 'matches', 'notes', 'results', 'saved', 'attribution']);
  assert.strictEqual(j.query, 'cozy');
  assert.deepStrictEqual(j.filters, { os: null, terminal: null, shell: null, layout: null });
  assert.strictEqual(j.matches, 7);
  assert.strictEqual(j.saved, null);
  assert.strictEqual(j.attribution, 'Data: awesome-dotfiles (r/unixporn), links to original posts.');
  assert.deepStrictEqual(j.results.map((x) => x.id), ['fx0001', 'fx0003', 'fx0007', 'fx0011', 'fx0013', 'fx0012'], 'varied: Catppuccin and Hyprland do not repeat while others match');
  assert.deepStrictEqual(Object.keys(j.results[0]), ['id', 'title', 'url', 'author', 'image', 'images', 'repo', 'wm', 'distro', 'os', 'colorscheme', 'tools', 'score', 'date', 'portable', 'relevance', 'exact', 'why']);
  assert.strictEqual(j.results[0].image, 'https://example.invalid/img/fx0001.png');
  assert.strictEqual(j.results[0].repo, 'https://github.com/example-user-01/dotfiles');
});

test('cli: flags --os --limit --terminal and text output', () => {
  const j = JSON.parse(tmt(['cozy', '--os', 'macos', '--limit', '1', '--json']).stdout);
  assert.deepStrictEqual(j.results.map((x) => x.id), ['fx0003']);
  assert.strictEqual(j.filters.os, 'macos');

  const t = tmt(['cozy', 'gruvbox', '--limit', '1']);
  assert.strictEqual(t.status, 0, t.stderr);
  const lines = t.stdout.split('\n');
  assert.strictEqual(lines[0], '1. [Hyprland] cozy evening on Arch  (900 upvotes, 2024-09-09)');
  assert.strictEqual(lines[1], '   colorscheme: Gruvbox | wm: Hyprland | distro: Arch Linux | os: linux');
  assert.strictEqual(lines[2], '   tools: kitty, zsh, waybar, starship, neovim');
  assert.strictEqual(lines[3], '   screenshot: https://example.invalid/img/fx0001.png');
  assert.strictEqual(lines[4], '   reddit: https://www.reddit.com/r/unixporn/comments/fx0001/fx0001_slug/');
  assert.strictEqual(lines[5], '   repo: https://github.com/example-user-01/dotfiles');
  assert.match(lines[6], /^   why: matches /);
  assert.ok(t.stdout.trimEnd().endsWith('Data: awesome-dotfiles (r/unixporn), links to original posts.'));
});

test('cli: --facets and errors', () => {
  const f = JSON.parse(tmt(['--facets', '--json']).stdout);
  assert.strictEqual(f.facets.total, 15);
  assert.deepStrictEqual(f.facets.os, [{ name: 'linux', count: 11 }, { name: 'macos', count: 2 }, { name: 'windows', count: 2 }]);
  const text = tmt(['--facets']).stdout;
  assert.match(text, /^15 rices\nOS: linux 11, macos 2, windows 2\nColorschemes: Gruvbox 3, Catppuccin 2,/);

  const bad = tmt(['cozy', '--os', 'beos']);
  assert.strictEqual(bad.status, 1);
  assert.match(bad.stderr, /Unknown --os "beos"/);

  const save = tmt(['cozy', '--save', '9', path.join(tmp(), 'x')]);
  assert.strictEqual(save.status, 1);
  assert.match(save.stderr, /--save 9: there are only 6 results\./);
});

// ---- variety ----------------------------------------------------------------------------------

test('rank: results vary by default - no repeated colorscheme, window manager or author while others match', () => {
  const r = I.rank(entries, '', { limit: 6 });
  const schemes = r.results.map((x) => x.colorscheme).filter(Boolean);
  const wms = r.results.map((x) => x.wm).filter(Boolean);
  assert.strictEqual(new Set(schemes).size, schemes.length, schemes.join(', '));
  assert.strictEqual(new Set(wms).size, wms.length, wms.join(', '));
  assert.strictEqual(r.results[0].id, I.rank(entries, '', { limit: 6, diverse: false }).results[0].id, 'the best match still leads');
});

test('rank: sort "random" with a seed gives a different, repeatable set of matches; "new" puts the newest first', () => {
  const a = ids(I.rank(entries, '', { limit: 5, sort: 'random', seed: 1 }).results);
  assert.deepStrictEqual(ids(I.rank(entries, '', { limit: 5, sort: 'random', seed: 1 }).results), a);
  const others = [2, 3, 4, 5].map((seed) => ids(I.rank(entries, '', { limit: 5, sort: 'random', seed }).results).join());
  assert.ok(others.some((o) => o !== a.join()), 'another seed changes the pick');
  for (const x of I.rank(entries, 'gruvbox', { sort: 'random', seed: 9 }).results) assert.match(String(x.colorscheme), /gruvbox/i);
  const fresh = I.rank(entries, '', { limit: 3, sort: 'new', diverse: false }).results;
  const dates = entries.map((e) => e.date).filter(Boolean).sort().reverse();
  assert.strictEqual(fresh[0].date, dates[0]);
  assert.throws(() => I.rank(entries, '', { sort: 'hot' }), /sort must be relevance, new or random/);
});

test('saveAll: downloads every result screenshot for a visual review, and reports the ones that fail', async () => {
  const dir = path.join(tmp(), 'review');
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
  const list = [byId.fx0001, byId.fx0002, { id: 'nolink', image: null }];
  const r = await I.saveAll(list, dir, { fetchImpl: async () => fakeRes(200, png, { 'content-type': 'image/png' }) });
  assert.deepStrictEqual(r.saved.map((s) => path.basename(s.file)), ['rice-fx0001.png', 'rice-fx0002.png']);
  assert.deepStrictEqual(r.failed.map((f) => f.id), ['nolink']);
  assert.deepStrictEqual(I.parseArgs(['--save', 'all', 'out']).flags.save, { n: 'all', dir: 'out' });
  assert.deepStrictEqual(I.parseArgs(['--sort', 'random', '--seed', '4']).flags, { sort: 'random', seed: '4' });
});

// ---- layout -----------------------------------------------------------------------------------
// Layout (how things are arranged) is a separate axis from style (how it looks). The dataset has no
// layout field, so it is inferred from the window manager and tools, and the agent confirms it on
// the screenshot.

const layoutIds = (layout, query = '') => ids(I.rank(entries, query, { layout, limit: 20, diverse: false }).results.filter((x) => x.exact)).sort();

test('rank: --layout panes keeps rices with a multiplexer', () => {
  assert.deepStrictEqual(layoutIds('panes'), ['fx0006', 'fx0010', 'fx0011']);
});

test('rank: --layout tiling keeps tiling window managers, floating keeps desktops and stock Windows/macOS', () => {
  assert.deepStrictEqual(layoutIds('tiling', 'nord'), ['fx0002']);
  assert.deepStrictEqual(layoutIds('floating'), ['fx0004', 'fx0009', 'fx0012', 'fx0014']);
});

test('rank: --layout dashboard needs several widget tools or a dashboard title', () => {
  assert.deepStrictEqual(layoutIds('dashboard'), ['fx0005']);
});

test('rank: layout explains itself, falls back softly, rejects unknown kinds', () => {
  const r = I.rank(entries, 'gruvbox', { layout: 'floating' });
  assert.deepStrictEqual(ids(r.results), ['fx0012']);
  assert.match(r.results[0].why, /layout floating \(stock windows\)/);
  assert.ok(r.notes.includes('Layout is inferred from the window manager and tools; confirm it on each screenshot.'));
  const soft = I.rank(entries, 'gruvbox', { layout: 'scrolling' });
  assert.strictEqual(soft.results.every((x) => x.exact === false), true);
  assert.match(soft.results[0].why, /not scrolling/);
  assert.throws(() => I.rank(entries, 'x', { layout: 'grid' }), /Unknown layout "grid". Known: tiling, floating, panes, dashboard, scrolling/);
});

test('cli: --layout is a filter', () => {
  const j = JSON.parse(tmt(['--layout', 'panes', '--json']).stdout);
  assert.strictEqual(j.filters.layout, 'panes');
  assert.deepStrictEqual(j.results.map((x) => x.id).sort(), ['fx0006', 'fx0010', 'fx0011']);
});
