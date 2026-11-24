'use strict';
// Parts: find existing theme ports and rice dotfiles on GitHub and fetch them into the run
// folder. Never touches the network: a fake fetch serves GitHub API trees and raw files.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const mkTmp = require('../_tmp');
const P = require('../../kit/parts');

const API = 'https://api.github.com/repos';
const blob = (p) => ({ path: p, type: 'blob', sha: `b-${p}` });
const dir = (p, sha) => ({ path: p, type: 'tree', sha });

// A small fake GitHub: recursive trees per repo, non-recursive trees per sha, raw files.
function fakeGitHub({ trees = {}, shas = {}, raw = {} } = {}) {
  const calls = [];
  const json = (body) => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body), headers: { get: () => null } });
  const fetchImpl = async (url) => {
    calls.push(url);
    let m = /^https:\/\/api\.github\.com\/repos\/([^/]+\/[^/]+)\/git\/trees\/HEAD\?recursive=1$/.exec(url);
    if (m && trees[m[1]]) return json({ tree: trees[m[1]], truncated: false });
    m = /^https:\/\/api\.github\.com\/repos\/([^/]+\/[^/]+)\/git\/trees\/([^?]+)$/.exec(url);
    if (m && shas[`${m[1]}@${m[2]}`]) return json({ tree: shas[`${m[1]}@${m[2]}`], truncated: false });
    if (raw[url] !== undefined) return { ok: true, status: 200, arrayBuffer: async () => Buffer.from(raw[url]), headers: { get: () => null } };
    return { ok: false, status: 404, json: async () => ({}), text: async () => '', headers: { get: () => null } };
  };
  return { fetchImpl, calls };
}

test('parseRepo accepts owner/repo and GitHub URLs', () => {
  assert.deepStrictEqual(P.parseRepo('catppuccin/kitty'), { owner: 'catppuccin', repo: 'kitty' });
  assert.deepStrictEqual(P.parseRepo('https://github.com/someone/dotfiles.git'), { owner: 'someone', repo: 'dotfiles' });
  assert.deepStrictEqual(P.parseRepo('https://github.com/someone/dots/tree/main/.config'), { owner: 'someone', repo: 'dots' });
  assert.throws(() => P.parseRepo('not a repo'), /GitHub repo/);
});

test('port finds the flavor file in a per-app org repo and skips templates', async () => {
  const gh = fakeGitHub({ trees: { 'catppuccin/kitty': [
    blob('templates/kitty.tera'), blob('themes/diff-mocha.conf'), blob('themes/mocha.conf'),
    blob('themes/latte.conf'), blob('README.md'), blob('renovate.json'),
  ] } });
  const r = await P.port('catppuccin', 'kitty', { flavor: 'mocha', fetchImpl: gh.fetchImpl, cacheDir: mkTmp('tmt-parts-') });
  assert.strictEqual(r.source, 'https://github.com/catppuccin/kitty');
  assert.deepStrictEqual(r.files.map((f) => f.path), ['themes/mocha.conf', 'themes/diff-mocha.conf']);
  assert.strictEqual(r.files[0].url, 'https://raw.githubusercontent.com/catppuccin/kitty/HEAD/themes/mocha.conf');
});

test('port walks into an extras folder and tries app-name spellings', async () => {
  const gh = fakeGitHub({ shas: {
    'folke/tokyonight.nvim@HEAD': [dir('extras', 's1'), blob('README.md')],
    'folke/tokyonight.nvim@s1': [dir('kitty', 's2'), dir('windows_terminal', 's3')],
    'folke/tokyonight.nvim@s3': [blob('tokyonight_night.json'), blob('tokyonight_day.json')],
  } });
  const r = await P.port('Tokyo Night', 'windows-terminal', { flavor: 'night', fetchImpl: gh.fetchImpl, cacheDir: mkTmp('tmt-parts-') });
  assert.deepStrictEqual(r.files.map((f) => f.path), ['extras/windows_terminal/tokyonight_night.json']);
});

test('any other scheme falls back to the iTerm2-Color-Schemes port for that app', async () => {
  const gh = fakeGitHub({ shas: {
    'mbadolato/iTerm2-Color-Schemes@HEAD': [dir('kitty', 'k'), dir('schemes', 's')],
    'mbadolato/iTerm2-Color-Schemes@k': [blob('Gruvbox Dark Hard.conf'), blob('Gruvbox Dark.conf'), blob('GruvboxDarkHard Extra.conf'), blob('Nord.conf')],
  } });
  const r = await P.port('gruvbox dark hard', 'kitty', { fetchImpl: gh.fetchImpl, cacheDir: mkTmp('tmt-parts-') });
  assert.strictEqual(r.source, 'https://github.com/mbadolato/iTerm2-Color-Schemes');
  assert.deepStrictEqual(r.files.map((f) => f.path), ['kitty/Gruvbox Dark Hard.conf', 'kitty/GruvboxDarkHard Extra.conf']);
  assert.match(r.files[0].url, /\/HEAD\/kitty\/Gruvbox%20Dark%20Hard\.conf$/);
});

test('port with nothing found says where else to look', async () => {
  const gh = fakeGitHub();
  const r = await P.port('catppuccin', 'cool-retro-term', { fetchImpl: gh.fetchImpl, cacheDir: mkTmp('tmt-parts-') });
  assert.deepStrictEqual(r.files, []);
  assert.match(r.hint, /catalog recipe/);
});

test('rice groups a dotfiles repo by tool, with wallpapers and license', async () => {
  const gh = fakeGitHub({ trees: { 'someone/dots': [
    blob('.config/kitty/kitty.conf'), blob('.config/kitty/theme.conf'), blob('.config/starship.toml'),
    blob('.tmux.conf'), blob('.config/btop/themes/neon.theme'), blob('wallpapers/city.png'),
    blob('screenshots/rice.png'), blob('LICENSE'), blob('install.sh'), blob('home/.zshrc'), blob('config/zsh/zhistory'),
  ] } });
  const r = await P.rice('https://github.com/someone/dots', { tools: ['kitty', 'starship', 'tmux', 'btop', 'zsh'], fetchImpl: gh.fetchImpl, cacheDir: mkTmp('tmt-parts-') });
  assert.strictEqual(r.license, 'LICENSE');
  assert.deepStrictEqual(r.tools, {
    kitty: ['.config/kitty/kitty.conf', '.config/kitty/theme.conf'],
    starship: ['.config/starship.toml'],
    tmux: ['.tmux.conf'],
    btop: ['.config/btop/themes/neon.theme'],
    zsh: ['home/.zshrc'],
  });
  assert.deepStrictEqual(r.wallpapers, ['wallpapers/city.png']);
});

test('rice without a license says to take values, not whole files', async () => {
  const gh = fakeGitHub({ trees: { 'someone/dots': [blob('.config/kitty/kitty.conf')] } });
  const r = await P.rice('someone/dots', { tools: ['kitty'], fetchImpl: gh.fetchImpl, cacheDir: mkTmp('tmt-parts-') });
  assert.strictEqual(r.license, null);
  assert.match(r.note, /no license/i);
});

test('get downloads files into the folder, keeping repo paths, and refuses escapes', async () => {
  const url = 'https://raw.githubusercontent.com/someone/dots/HEAD/.config/kitty/kitty.conf';
  const gh = fakeGitHub({ raw: { [url]: 'font_size 12\n' } });
  const to = mkTmp('tmt-parts-get-');
  const got = await P.get('someone/dots', ['.config/kitty/kitty.conf'], to, { fetchImpl: gh.fetchImpl });
  assert.strictEqual(fs.readFileSync(path.join(to, 'someone-dots', '.config', 'kitty', 'kitty.conf'), 'utf8'), 'font_size 12\n');
  assert.strictEqual(got[0].source, url);
  await assert.rejects(P.get('someone/dots', ['../../evil'], to, { fetchImpl: gh.fetchImpl }), /outside/);
});

test('repo listings are cached, so a second lookup makes no request', async () => {
  const gh = fakeGitHub({ trees: { 'catppuccin/kitty': [blob('themes/mocha.conf')] } });
  const cacheDir = mkTmp('tmt-parts-');
  await P.port('catppuccin', 'kitty', { fetchImpl: gh.fetchImpl, cacheDir });
  const n = gh.calls.length;
  await P.port('catppuccin', 'kitty', { fetchImpl: gh.fetchImpl, cacheDir });
  assert.strictEqual(gh.calls.length, n);
});
