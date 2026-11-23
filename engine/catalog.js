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

function capabilities() {
  const f = path.join(ROOT, 'capabilities.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}

module.exports = { tools, get, configPaths, capabilities, ROOT };
