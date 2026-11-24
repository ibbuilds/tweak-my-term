'use strict';
// Read access to catalog/: tools, their config paths and capabilities.

const fs = require('fs');
const path = require('path');
const paths = require('./paths');

const ROOT = path.join(__dirname, '..', 'catalog');

let cache;
function tools() {
  if (cache) return cache;
  cache = [];
  if (!fs.existsSync(ROOT)) return cache;
  for (const cat of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    for (const t of fs.readdirSync(path.join(ROOT, cat.name), { withFileTypes: true })) {
      const f = path.join(ROOT, cat.name, t.name, 'tool.json');
      if (!t.isDirectory() || !fs.existsSync(f)) continue;
      try { cache.push({ ...JSON.parse(fs.readFileSync(f, 'utf8')), dir: path.dirname(f) }); } catch { /* the catalog check reports broken files */ }
    }
  }
  return cache;
}

const get = (id) => tools().find((t) => t.id === id) || null;

/** Every config path the catalog knows for an OS, expanded. Entries ending in / are folders. */
function configPaths(osName = paths.platform()) {
  const out = [];
  for (const t of tools()) {
    const o = t.os && t.os[osName];
    if (!o || !o.config) continue;
    for (const c of o.config) {
      try {
        const dir = /[\\/]$/.test(c);
        out.push({ tool: t.id, raw: c, abs: paths.expand(c.replace(/[\\/]$/, ''), { os: osName }), dir });
      } catch { /* token not valid on this OS */ }
    }
  }
  return out;
}

// Files that sit next to configs but hold the user's data or secrets, never look settings.
const PRIVATE = /(history|\.db$|\.sqlite\d?$|credential|secret|token|\.env$|\.pem$|\.key$|id_rsa|id_ed25519|\.zo$)/i;
const isPrivate = (file) => PRIVATE.test(path.basename(file));

/**
 * The user's own config files for an OS, for detect and capture: no font folders, no
 * history/database/secret files, one entry per path with every tool that uses it.
 */
function userConfigs(osName = paths.platform()) {
  const fontTools = new Set(tools().filter((t) => t.category === 'font').map((t) => t.id));
  const byPath = new Map();
  for (const c of configPaths(osName)) {
    if (fontTools.has(c.tool) || isPrivate(c.abs)) continue;
    const key = process.platform === 'win32' ? c.abs.toLowerCase() : c.abs;
    const seen = byPath.get(key);
    if (seen) { if (!seen.tools.includes(c.tool)) seen.tools.push(c.tool); continue; }
    byPath.set(key, { ...c, tools: [c.tool] });
  }
  return [...byPath.values()];
}

/**
 * The catalog's own check for a config file: the tool whose config path is this file, or a
 * file of the same type in that config folder. argv with {file} filled in, or null.
 */
function validatorFor(abs, osName = paths.platform()) {
  const norm = (p) => (process.platform === 'win32' ? p.toLowerCase() : p).replace(/\\/g, '/');
  const a = norm(abs);
  for (const t of tools()) {
    const o = t.os && t.os[osName];
    if (!o || !o.validate || !o.config) continue;
    for (const c of o.config) {
      if (/[\\/]$/.test(c)) continue;
      let p;
      try { p = norm(paths.expand(c, { os: osName })); } catch { continue; }
      const ext = path.extname(p);
      const same = a === p || (ext && path.posix.dirname(a) === path.posix.dirname(p) && path.extname(a) === ext);
      if (same) return { tool: t.id, argv: o.validate.map((x) => x.split('{file}').join(abs.replace(/\\/g, '/'))) };
    }
  }
  return null;
}

function capabilities() {
  const f = path.join(ROOT, 'capabilities.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}

module.exports = { tools, get, configPaths, userConfigs, isPrivate, validatorFor, capabilities, ROOT };
