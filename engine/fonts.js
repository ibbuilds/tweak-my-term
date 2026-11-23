'use strict';
// Per-user Nerd Font install, no admin: download the release zip, extract, copy the
// font files into the user font folder (and register them on Windows).

const fs = require('fs');
const os = require('os');
const path = require('path');
const paths = require('./paths');
const sys = require('./sys');

const URL = (name) => `https://github.com/ryanoasis/nerd-fonts/releases/latest/download/${name}.zip`;
const REG = 'HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts';

function fontDir(osName = paths.platform()) {
  if (osName === 'windows') return path.join(paths.localAppData(), 'Microsoft', 'Windows', 'Fonts');
  if (osName === 'macos') return path.join(paths.home(), 'Library', 'Fonts');
  return path.join(paths.home(), '.local', 'share', 'fonts');
}

/** Font files already in the user or system font folders whose name starts with `name`. */
function installed(name, osName = paths.platform()) {
  const dirs = [fontDir(osName)];
  if (!paths.fake()) {
    if (osName === 'windows') dirs.push(path.join(process.env.SystemRoot || 'C:\\Windows', 'Fonts'));
    if (osName === 'macos') dirs.push('/Library/Fonts');
    if (osName === 'linux') dirs.push('/usr/share/fonts', '/usr/local/share/fonts');
  }
  const want = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hits = [];
  const walk = (d, depth) => {
    let ents = [];
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const f = path.join(d, e.name);
      if (e.isDirectory() && depth < 3) walk(f, depth + 1);
      else if (/\.(ttf|otf)$/i.test(e.name) && e.name.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(want)) hits.push(f);
    }
  };
  dirs.forEach((d) => walk(d, 0));
  return hits;
}

/**
 * Install a Nerd Font release (e.g. "JetBrainsMono", "NerdFontsSymbolsOnly").
 * Returns { files: [created paths], registry: [value names] } for the restore manifest.
 */
function install(name, { exec = sys.exec, osName = paths.platform() } = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-font-'));
  const zip = path.join(tmp, `${name}.zip`);
  const dl = exec('curl', ['-fsSL', '--retry', '2', '-o', zip, URL(name)], { timeout: 300000 });
  if (dl.status !== 0) throw new Error(`font download failed for ${name}: ${dl.stderr.trim()}`);
  const out = path.join(tmp, 'x');
  fs.mkdirSync(out);
  let ex = exec('tar', ['-xf', zip, '-C', out]);
  if (ex.status !== 0) ex = exec('unzip', ['-o', '-q', zip, '-d', out]);
  if (ex.status !== 0) throw new Error(`could not extract ${zip}: install unzip or bsdtar`);
  const dir = fontDir(osName);
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  const registry = [];
  for (const f of fs.readdirSync(out)) {
    if (!/\.(ttf|otf)$/i.test(f)) continue;
    const dest = path.join(dir, f);
    if (fs.existsSync(dest)) continue;
    fs.copyFileSync(path.join(out, f), dest);
    files.push(dest);
    if (osName === 'windows' && !paths.fake()) {
      const value = `${path.parse(f).name} (TrueType)`;
      const r = exec('reg', ['add', REG, '/v', value, '/t', 'REG_SZ', '/d', dest, '/f']);
      if (r.status === 0) registry.push(value);
    }
  }
  if (osName === 'linux') exec('fc-cache', ['-f', dir]);
  fs.rmSync(tmp, { recursive: true, force: true });
  return { files, registry };
}

function uninstall({ files = [], registry = [] }, { exec = sys.exec } = {}) {
  for (const f of files) fs.rmSync(f, { force: true });
  for (const v of registry) exec('reg', ['delete', REG, '/v', v, '/f']);
}

module.exports = { install, uninstall, installed, fontDir, URL };
