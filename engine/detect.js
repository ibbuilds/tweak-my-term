'use strict';
// What is on this machine: OS, terminals, shells, prompt and CLI tools with versions,
// package managers, fonts and existing config files. Facts first, questions second.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const paths = require('./paths');
const sys = require('./sys');
const catalog = require('./catalog');
const fonts = require('./fonts');

function run(cmd, args, timeout = 8000) {
  return new Promise((resolve) => {
    const exe = sys.resolveCmd(cmd);
    if (!exe) return resolve(null);
    const shell = sys.WIN && /\.(cmd|bat)$/i.test(exe);
    let out = '';
    let done = false;
    let child;
    try {
      child = spawn(shell ? `"${exe}"` : exe, args, { windowsHide: true, shell, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch { return resolve(null); }
    const finish = (v) => { if (!done) { done = true; clearTimeout(t); resolve(v); } };
    const t = setTimeout(() => { try { child.kill(); } catch { /* gone */ } finish(out.trim() || null); }, timeout);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('error', () => finish(null));
    child.on('close', () => finish(out.trim()));
  });
}

const firstLine = (s) => (s ? s.split(/\r?\n/).find((l) => l.trim()) || '' : '').trim().slice(0, 120);
const version = (s) => { const m = /(\d+\.\d+(?:\.\d+)?(?:[-+.\w]*)?)/.exec(s || ''); return m ? m[1] : null; };

const MAC_APPS = { 'iterm2': 'iTerm.app', ghostty: 'Ghostty.app', kitty: 'kitty.app', wezterm: 'WezTerm.app', alacritty: 'Alacritty.app', 'terminal-app': 'Terminal.app' };
const MANAGERS = { windows: ['winget', 'scoop', 'choco'], macos: ['brew', 'port', 'nix'], linux: ['apt-get', 'dnf', 'pacman', 'zypper', 'apk', 'flatpak', 'snap', 'brew', 'nix'] };

async function detect() {
  const osName = paths.platform();
  const result = {
    at: new Date().toISOString(),
    os: { name: osName, release: os.release(), arch: os.arch(), distro: null },
    session: {
      term: process.env.TERM || null, termProgram: process.env.TERM_PROGRAM || null, colorterm: process.env.COLORTERM || null,
      windowsTerminal: Boolean(process.env.WT_SESSION), shell: process.env.SHELL || process.env.ComSpec || null,
    },
    node: process.version,
    managers: {},
    tools: {},
    terminals: {},
    fonts: { nerd: [], userDir: fonts.fontDir(osName) },
    configs: [],
    notes: [],
  };
  if (osName === 'linux') {
    try { const r = fs.readFileSync('/etc/os-release', 'utf8'); const m = /^PRETTY_NAME="?([^"\n]+)/m.exec(r); result.os.distro = m && m[1]; } catch { /* not there */ }
  }
  await Promise.all((MANAGERS[osName] || []).map(async (m) => { result.managers[m] = Boolean(sys.resolveCmd(m)); }));

  const jobs = [];
  for (const t of catalog.tools()) {
    const o = t.os && t.os[osName];
    if (!o || !o.supported) continue;
    if (o.detect && o.detect.length) {
      jobs.push(run(o.detect[0], o.detect.slice(1)).then((out) => {
        // no output (e.g. an Appx query for a package that isn't there) means not installed
        result.tools[t.id] = !out ? { installed: false } : { installed: true, version: version(out), raw: firstLine(out) };
      }));
    }
  }
  await Promise.all(jobs);

  // terminals that have no CLI version command, or are apps
  if (osName === 'windows') {
    const wt = paths.wtSettings();
    result.terminals['windows-terminal'] = { installed: fs.existsSync(path.dirname(wt)) || Boolean(sys.which('wt')), settings: fs.existsSync(wt) ? paths.pretty(wt) : null };
    result.tools.bash = { ...(result.tools.bash || {}), gitBash: sys.gitBash() };
    const ps = await run('powershell', ['-NoProfile', '-Command', '$v=(Get-Module PSReadLine -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1).Version; "$($PSVersionTable.PSVersion) $v"'], 15000);
    if (ps) {
      const [psv, rl] = ps.split(/\s+/);
      result.tools.powershell = { ...(result.tools.powershell || {}), installed: true, version: psv, psreadline: rl || null };
      if (rl && /^2\.[01]\./.test(rl)) result.notes.push(`Windows PowerShell has PSReadLine ${rl}: no prediction colors or list view; install PSReadLine >= 2.2 for them.`);
    }
  }
  if (osName === 'macos') {
    for (const [id, app] of Object.entries(MAC_APPS)) {
      const found = ['/Applications', path.join(os.homedir(), 'Applications')].some((d) => fs.existsSync(path.join(d, app)));
      result.terminals[id] = { installed: found };
    }
  }
  for (const t of catalog.tools().filter((x) => x.category === 'terminal')) {
    if (result.tools[t.id] && !result.terminals[t.id]) result.terminals[t.id] = result.tools[t.id];
  }

  // fonts: Nerd Fonts and common coding fonts present
  const families = new Set();
  const dirs = [fonts.fontDir(osName)];
  if (osName === 'windows') dirs.push(path.join(process.env.SystemRoot || 'C:\\Windows', 'Fonts'));
  if (osName === 'macos') dirs.push('/Library/Fonts');
  if (osName === 'linux') dirs.push('/usr/share/fonts', '/usr/local/share/fonts');
  const walk = (d, depth) => {
    let ents = [];
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (e.isDirectory() && depth < 3) walk(path.join(d, e.name), depth + 1);
      else if (/nerd|nf[-.]|mono|code|jetbrains|fira|iosevka|hack|cascadia|meslo/i.test(e.name) && /\.(ttf|otf)$/i.test(e.name)) {
        families.add(e.name.replace(/\.(ttf|otf)$/i, '').replace(/[-_ ]?(Regular|Bold|Italic|Light|Medium|Thin|ExtraBold|ExtraLight|SemiBold|BoldItalic|LightItalic|MediumItalic|Oblique|Book)+$/i, ''));
      }
    }
  };
  dirs.forEach((d) => walk(d, 0));
  result.fonts.nerd = [...families].sort().slice(0, 200);

  for (const c of catalog.configPaths(osName)) {
    if (fs.existsSync(c.abs)) {
      const s = fs.statSync(c.abs);
      result.configs.push({ tool: c.tool, path: paths.pretty(c.abs), dir: s.isDirectory(), bytes: s.isDirectory() ? undefined : s.size, modified: s.mtime.toISOString().slice(0, 10) });
    }
  }
  if (!result.tools.hyperfine || !result.tools.hyperfine.installed) result.notes.push('hyperfine not found: tmt measure uses its own timing loop.');
  return result;
}

module.exports = { detect };
