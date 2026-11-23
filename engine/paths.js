'use strict';
// Where things live on each OS. Every target the engine writes goes through target(),
// which refuses anything outside the user's home.
//
// TMT_HOME redirects home (and every token below it) to a fake folder for tests.
// TMT_OS overrides the detected OS (windows | macos | linux).

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const fake = () => Boolean(process.env.TMT_HOME);
const home = () => path.resolve(process.env.TMT_HOME || os.homedir());

function platform() {
  if (process.env.TMT_OS) return process.env.TMT_OS;
  return process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'macos' : 'linux';
}

const stateRoot = () => path.resolve(process.env.TMT_STATE || path.join(home(), '.tweak-my-term'));

let documentsCache;
function documents() {
  if (fake()) return path.join(home(), 'Documents');
  if (documentsCache) return documentsCache;
  documentsCache = path.join(home(), 'Documents');
  if (process.platform === 'win32') {
    // Documents is often redirected (OneDrive). The shell-folder registry value is the truth.
    const r = spawnSync('reg', ['query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders', '/v', 'Personal'], { encoding: 'utf8', windowsHide: true });
    const m = /Personal\s+REG_(?:EXPAND_)?SZ\s+(.+)/.exec(r.stdout || '');
    if (m) documentsCache = m[1].trim().replace(/%([^%]+)%/g, (_, v) => process.env[v] || `%${v}%`);
  }
  return documentsCache;
}

function localAppData() {
  return fake() || !process.env.LOCALAPPDATA ? path.join(home(), 'AppData', 'Local') : process.env.LOCALAPPDATA;
}
function appData() {
  return fake() || !process.env.APPDATA ? path.join(home(), 'AppData', 'Roaming') : process.env.APPDATA;
}
function xdgConfig() {
  return !fake() && process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : path.join(home(), '.config');
}

function wtSettings() {
  const la = localAppData();
  const candidates = [
    path.join(la, 'Packages', 'Microsoft.WindowsTerminal_8wekyb3d8bbwe', 'LocalState', 'settings.json'),
    path.join(la, 'Packages', 'Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe', 'LocalState', 'settings.json'),
    path.join(la, 'Microsoft', 'Windows Terminal', 'settings.json'),
  ];
  return candidates.find((c) => fs.existsSync(c)) || candidates[0];
}

function tokens(osName) {
  const win = osName === 'windows';
  return {
    'xdg-config': xdgConfig,
    'localappdata': localAppData,
    'appdata': appData,
    'documents': documents,
    'mac-app-support': () => path.join(home(), 'Library', 'Application Support'),
    'wt-settings': wtSettings,
    'ps-profile': () => path.join(documents(), 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1'),
    'pwsh-profile': () => (win ? path.join(documents(), 'PowerShell', 'Microsoft.PowerShell_profile.ps1')
      : path.join(xdgConfig(), 'powershell', 'Microsoft.PowerShell_profile.ps1')),
  };
}

/** Expand ~ and {tokens} in a target path. */
function expand(p, { os: osName = platform() } = {}) {
  const t = tokens(osName);
  let s = p.replace(/\{([a-z-]+)\}/g, (_, name) => {
    if (!t[name]) throw new Error(`unknown path token {${name}}`);
    return t[name]();
  });
  if (s === '~') s = home();
  else if (s.startsWith('~/') || s.startsWith('~\\')) s = path.join(home(), s.slice(2));
  return path.resolve(s);
}

function inside(child, parent) {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/** Expand and check a write target: it must be inside the user's home. */
function target(p, opts) {
  const abs = expand(p, opts);
  const h = home();
  const ok = process.platform === 'win32' ? inside(abs.toLowerCase(), h.toLowerCase()) : inside(abs, h);
  if (!ok) throw new Error(`target ${p} resolves outside your home folder (${abs}); tweak-my-term only writes inside home`);
  return abs;
}

/** Turn an absolute path back into a ~ form for display. */
function pretty(abs) {
  const h = home();
  return inside(process.platform === 'win32' ? abs.toLowerCase() : abs, process.platform === 'win32' ? h.toLowerCase() : h)
    ? path.join('~', path.relative(h, abs)).replace(/\\/g, '/') : abs;
}

module.exports = { home, fake, platform, stateRoot, expand, target, pretty, documents, localAppData, appData, xdgConfig, wtSettings };
