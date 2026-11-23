'use strict';
// tmt capture: copy the user's terminal configs into a run, read-only. Also follows files the
// shell rc files source from the home folder (prompt, aliases split into ~/.config/bash/*.bash),
// because the look often lives there. History, databases, secrets and font folders are skipped.

const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const catalog = require('./catalog');

const MAX_BYTES = 2e6;
const RC = /(^\.(bash|zsh)rc$|^\.bash_profile$|^\.zprofile$|^\.profile$|\.ps1$|^config\.fish$|\.(bash|zsh|sh|fish)$)/;

/** Paths an rc file sources: `. file`, `source file`, `. $HOME/x/$var.bash` (variable = glob). */
function sourcedPaths(text, home) {
  const out = [];
  const re = /(?:^|[;&|{(]\s*|\bthen\s+|\bdo\s+)(?:\.|source)\s+["']?([^\s"';|&)]+)/gm;
  let m;
  while ((m = re.exec(text))) {
    let p = m[1].replace(/^~(?=[\\/])/, home).replace(/^\$\{?HOME\}?(?=[\\/])/, home).replace(/^\$env:USERPROFILE(?=[\\/])/i, home)
      .replace(/^\$PSScriptRoot/i, '');
    if (!path.isAbsolute(p)) continue;
    p = path.normalize(p);
    if (!/\$/.test(p)) { out.push(p); continue; }
    // A loop variable in the file name: take every file in that folder with the same extension.
    const dir = path.dirname(p);
    if (/\$/.test(dir)) continue;
    const ext = path.extname(p);
    try { for (const f of fs.readdirSync(dir)) if (!ext || f.endsWith(ext)) out.push(path.join(dir, f)); } catch { /* folder missing */ }
  }
  return out;
}

const inside = (child, parent) => { const r = path.relative(parent, child); return r && !r.startsWith('..') && !path.isAbsolute(r); };

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

/**
 * Copy every known config file for `osName` into `dest/<tool>/`, and files they source into
 * `dest/<tool>/sourced/<path relative to home>`. Returns { dir, files: [{tool, from, to}] }.
 */
function capture(osName, dest) {
  const home = paths.home();
  const got = [];
  const seen = new Set();
  const queue = [];
  for (const c of catalog.userConfigs(osName)) {
    if (!fs.existsSync(c.abs)) continue;
    const to = path.join(dest, c.tool, path.basename(c.abs));
    if (fs.statSync(c.abs).isDirectory()) {
      fs.cpSync(c.abs, to, { recursive: true, filter: (s) => { try { return !catalog.isPrivate(s) && (fs.statSync(s).isDirectory() || fs.statSync(s).size < MAX_BYTES); } catch { return false; } } });
    } else {
      copyFile(c.abs, to);
      if (RC.test(path.basename(c.abs))) queue.push({ tool: c.tool, file: c.abs });
    }
    seen.add(path.resolve(c.abs));
    got.push({ tool: c.tool, from: paths.pretty(c.abs), to });
  }
  // Follow sourced files, a few levels deep, only inside the home folder.
  for (let depth = 0; depth < 3 && queue.length; depth++) {
    const level = queue.splice(0);
    for (const { tool, file } of level) {
      let text;
      try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
      for (const p of sourcedPaths(text, home)) {
        const abs = path.resolve(p);
        if (seen.has(abs) || !inside(abs, home) || catalog.isPrivate(abs)) continue;
        let st;
        try { st = fs.statSync(abs); } catch { continue; }
        if (!st.isFile() || st.size >= MAX_BYTES) continue;
        seen.add(abs);
        const to = path.join(dest, tool, 'sourced', path.relative(home, abs));
        copyFile(abs, to);
        got.push({ tool, from: paths.pretty(abs), to, sourced: true });
        queue.push({ tool, file: abs });
      }
    }
  }
  return { dir: dest, files: got };
}

module.exports = { capture, sourcedPaths };
