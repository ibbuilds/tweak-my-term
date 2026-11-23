#!/usr/bin/env node
'use strict';
// Checks the catalog and builds catalog/capabilities.json.
//   node tools/catalog.js check            validate every tool.json and recipe; exit 1 on errors
//   node tools/catalog.js build            check, then write catalog/capabilities.json
//   node tools/catalog.js check <dir>      only that tool folder

const fs = require('fs');
const path = require('path');
const { check } = require('../engine/schema');

const ROOT = path.join(__dirname, '..');
const CATALOG = path.join(ROOT, 'catalog');

const CAPABILITIES = require('../schemas/capabilities.json');

function toolDirs(base = CATALOG) {
  const out = [];
  for (const cat of fs.readdirSync(base, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    for (const t of fs.readdirSync(path.join(base, cat.name), { withFileTypes: true })) {
      if (t.isDirectory() && fs.existsSync(path.join(base, cat.name, t.name, 'tool.json'))) out.push(path.join(base, cat.name, t.name));
    }
  }
  return out.sort();
}

function frontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return fm;
}

function checkTool(dir) {
  const errors = [];
  const rel = path.relative(ROOT, dir).replace(/\\/g, '/');
  let tool;
  try { tool = JSON.parse(fs.readFileSync(path.join(dir, 'tool.json'), 'utf8')); } catch (e) { return { errors: [`${rel}/tool.json: ${e.message}`] }; }
  for (const e of check('tool', tool)) errors.push(`${rel}/tool.json ${e}`);
  if (tool.id && tool.id !== path.basename(dir)) errors.push(`${rel}: id "${tool.id}" must match folder name`);
  const known = CAPABILITIES[tool.category] || [];
  for (const [cap, c] of Object.entries(tool.capabilities || {})) {
    if (!known.includes(cap)) errors.push(`${rel}: capability "${cap}" is not in schemas/capabilities.json for ${tool.category}`);
    if (c.recipe) {
      const f = path.join(dir, c.recipe);
      if (!fs.existsSync(f)) { errors.push(`${rel}: recipe ${c.recipe} missing`); continue; }
      const fm = frontmatter(fs.readFileSync(f, 'utf8'));
      if (!fm) errors.push(`${rel}/${c.recipe}: missing frontmatter`);
      else for (const k of ['capability', 'tool', 'os', 'verified', 'sources']) if (!fm[k]) errors.push(`${rel}/${c.recipe}: frontmatter needs "${k}"`);
    }
  }
  if (fs.existsSync(path.join(dir, 'recipes'))) {
    const referenced = new Set(Object.values(tool.capabilities || {}).map((c) => c.recipe && path.normalize(c.recipe)));
    for (const f of fs.readdirSync(path.join(dir, 'recipes'))) {
      if (!referenced.has(path.normalize(`recipes/${f}`))) errors.push(`${rel}/recipes/${f}: not referenced by any capability`);
    }
  }
  return { tool, errors };
}

function main() {
  const [cmd = 'check', only] = process.argv.slice(2);
  const dirs = only ? [path.resolve(only)] : toolDirs();
  const tools = [];
  let errors = [];
  for (const d of dirs) { const r = checkTool(d); errors = errors.concat(r.errors); if (r.tool) tools.push({ dir: d, tool: r.tool }); }
  const ids = new Set();
  for (const { tool } of tools) { if (ids.has(tool.id)) errors.push(`duplicate tool id ${tool.id}`); ids.add(tool.id); }
  if (errors.length) { console.error(errors.join('\n')); console.error(`\n${errors.length} error(s) in ${dirs.length} tool(s)`); process.exit(1); }
  if (cmd === 'build') {
    const matrix = {};
    for (const { dir, tool } of tools) {
      for (const [cap, c] of Object.entries(tool.capabilities || {})) {
        matrix[cap] = matrix[cap] || {};
        const oses = Object.entries(tool.os || {}).filter(([, o]) => o.supported).map(([k]) => k);
        matrix[cap][tool.id] = { support: c.support, os: oses, recipe: c.recipe ? path.relative(ROOT, path.join(dir, c.recipe)).replace(/\\/g, '/') : undefined, notes: c.notes };
      }
    }
    const out = { generated: 'node tools/catalog.js build', tools: Object.fromEntries(tools.map(({ dir, tool }) => [tool.id, { name: tool.name, category: tool.category, path: path.relative(ROOT, dir).replace(/\\/g, '/'), os: Object.entries(tool.os || {}).filter(([, o]) => o.supported).map(([k]) => k), verified: tool.verified }])), capabilities: matrix };
    fs.writeFileSync(path.join(CATALOG, 'capabilities.json'), JSON.stringify(out, null, 2) + '\n');
  }
  console.log(`ok: ${tools.length} tool(s)`);
}

if (require.main === module) main();
module.exports = { toolDirs, checkTool, frontmatter };
