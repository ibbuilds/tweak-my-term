'use strict';
// Process helpers: find commands, run them, time them. Kept in one place so tests can
// pass their own executor and nothing else crosses the process boundary.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const WIN = process.platform === 'win32';

function which(cmd) {
  if (path.isAbsolute(cmd)) return fs.existsSync(cmd) ? cmd : null;
  const exts = WIN ? (process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';').map((e) => e.toLowerCase()).concat(['']) : [''];
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      const f = path.join(dir, cmd + ext);
      try { if (fs.statSync(f).isFile()) return f; } catch { /* app execution aliases (winget, wt) cannot be stat-ed, only lstat-ed */ try { if (fs.lstatSync(f).isSymbolicLink() || fs.lstatSync(f).size === 0) return f; } catch { /* keep looking */ } }
    }
  }
  return null;
}

/** Git for Windows' bash (never WSL's System32\bash.exe). Elsewhere, bash on PATH. */
function gitBash() {
  if (!WIN) return which('bash');
  const candidates = [];
  const git = which('git');
  if (git) candidates.push(path.join(path.dirname(path.dirname(git)), 'usr', 'bin', 'bash.exe'), path.join(path.dirname(path.dirname(git)), 'bin', 'bash.exe'));
  for (const pf of [process.env.ProgramFiles, process.env['ProgramFiles(x86)'], process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs')]) {
    if (pf) candidates.push(path.join(pf, 'Git', 'usr', 'bin', 'bash.exe'));
  }
  return candidates.find((c) => fs.existsSync(c)) || null;
}

/** Resolve a shell id or command name to an executable. */
function resolveCmd(cmd) {
  if (cmd === 'bash') return gitBash();
  if (cmd === 'powershell' && WIN) return which('powershell') || path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  return which(cmd);
}

/** Run a command; .cmd/.bat shims on Windows go through the shell. */
function exec(cmd, args = [], opts = {}) {
  const exe = resolveCmd(cmd) || cmd;
  const shell = WIN && /\.(cmd|bat)$/i.test(exe);
  const r = spawnSync(shell ? `"${exe}"` : exe, shell ? args.map((a) => (/[\s"&|<>^]/.test(a) ? `"${a.replace(/"/g, '""')}"` : a)) : args, {
    encoding: 'utf8', windowsHide: true, timeout: opts.timeout || 120000, env: opts.env || process.env, input: opts.input, shell, cwd: opts.cwd,
  });
  return { status: r.error ? -1 : r.status, stdout: r.stdout || '', stderr: r.error ? String(r.error.message) : (r.stderr || '') };
}

module.exports = { which, gitBash, resolveCmd, exec, WIN };
