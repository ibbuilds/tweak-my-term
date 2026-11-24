#!/usr/bin/env node
'use strict';
// Builds catalog/inspiration/annotations.json: what each rice screenshot shows about its
// terminals (boxes, panes, contents, layout, complexity), looked at once by a vision model or a
// person, so `tmt inspire` can search by what is in the picture instead of guessing from tags.
//
//   node tools/annotate.js prepare --top 400 --batch 20 --out <dir>   download + shrink screenshots, write batch manifests
//   node tools/annotate.js validate <batch-dir>                       check one batch without writing anything
//   node tools/annotate.js merge <dir>                                validate batch-*/annotations.json and merge them
//   node tools/annotate.js check                                      validate the committed file
//   node tools/annotate.js stats                                      coverage and distributions
//
// Screenshots stay in <dir> (local, never committed). Only facts go into the repo.

const fs = require('fs');
const path = require('path');
const inspire = require('../kit/inspire');
const schema = require('../engine/schema');

const FILE = path.join(__dirname, '..', 'catalog', 'inspiration', 'annotations.json');
const MAX_SIDE = 1600;

function readAll(file = FILE) {
  if (!fs.existsSync(file)) return { about: '', dataset: inspire.DATA_URL, entries: [] };
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeAll(data, file = FILE) {
  data.entries.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const lines = data.entries.map((e) => '    ' + JSON.stringify(e));
  const head = JSON.stringify({ about: data.about, dataset: data.dataset, schema: 'schemas/rice-annotation.schema.json' }, null, 2).replace(/\n}$/, '');
  fs.writeFileSync(file, `${head},\n  "entries": [\n${lines.join(',\n')}\n  ]\n}\n`);
}

/** Errors for one annotation (schema + sanity checks a schema can't express). */
function problems(a, known) {
  const errs = schema.check('rice-annotation', a);
  if (known && !known.has(a.id)) errs.push(`${a.id}: not in the batch manifest`);
  for (const [i, t] of (a.terminals || []).entries()) {
    const [x, y, w, h] = t.box || [];
    if (x + w > 1.001 || y + h > 1.001) errs.push(`${a.id}: terminals[${i}].box runs off the image`);
    if (w < 0.02 || h < 0.02) errs.push(`${a.id}: terminals[${i}].box is too small to be a window`);
  }
  if (a.layout === 'none' && a.terminals && a.terminals.length) errs.push(`${a.id}: layout none but terminals listed`);
  if (a.layout !== 'none' && (!a.terminals || !a.terminals.length) && a.focus !== 'other') errs.push(`${a.id}: no terminals listed`);
  return errs;
}

async function shrink(file) {
  const image = require('../kit/image');
  const R = require('../kit/raster');
  let img;
  try { img = image.load(file); } catch { return { file, shrunk: false }; }
  const k = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const out = file.replace(/\.[a-z]+$/i, '.png');
  const small = k < 1 ? R.resize(img, Math.round(img.width * k), Math.round(img.height * k)) : img;
  image.save(small, out);
  if (out !== file) fs.rmSync(file, { force: true });
  return { file: out, shrunk: k < 1, width: small.width, height: small.height };
}

async function prepare(flags) {
  const top = Number(flags.top || 100), size = Number(flags.batch || 20), offset = Number(flags.offset || 0);
  const out = path.resolve(flags.out || 'annotate-work');
  const done = new Set(readAll().entries.map((e) => e.id));
  const { entries } = await inspire.load({});
  const pool = entries.filter((e) => e.image && e.id && !done.has(e.id)).sort((a, b) => b.score - a.score).slice(offset, offset + top);
  let n = 0;
  for (let b = 0; b * size < pool.length; b++) {
    const dir = path.join(out, `batch-${String(b + 1).padStart(2, '0')}`);
    const manifest = [];
    for (const e of pool.slice(b * size, (b + 1) * size)) {
      try {
        const saved = await inspire.saveImage(e, dir);
        const s = await shrink(saved.file);
        manifest.push({ id: e.id, file: path.basename(s.file), title: e.title, wm: e.wm, colorscheme: e.colorscheme, tools: e.tools });
        n++;
      } catch (err) {
        process.stderr.write(`skip ${e.id}: ${err.message}\n`);
      }
    }
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    process.stdout.write(`${dir}: ${manifest.length} screenshot(s)\n`);
  }
  process.stdout.write(`Prepared ${n} screenshot(s) in ${out}\n`);
}

function merge(dir) {
  const data = readAll();
  if (!data.about) data.about = 'What each r/unixporn screenshot shows about its terminals, looked at once. Facts only; screenshots are linked from the dataset, never stored here.';
  const byId = new Map(data.entries.map((e) => [e.id, e]));
  let added = 0, bad = 0;
  for (const b of fs.readdirSync(dir).filter((d) => /^batch-\d+$/.test(d)).sort()) {
    const mf = path.join(dir, b, 'manifest.json'), af = path.join(dir, b, 'annotations.json');
    if (!fs.existsSync(af)) { process.stdout.write(`${b}: no annotations.json yet\n`); continue; }
    const known = new Set(JSON.parse(fs.readFileSync(mf, 'utf8')).map((m) => m.id));
    let list;
    try { list = JSON.parse(fs.readFileSync(af, 'utf8')); } catch (e) { process.stdout.write(`${b}: invalid JSON (${e.message})\n`); bad++; continue; }
    for (const a of list) {
      const errs = problems(a, known);
      if (errs.length) { bad++; process.stdout.write(`${b}: ${errs.join('; ')}\n`); continue; }
      if (!byId.has(a.id)) added++;
      byId.set(a.id, a);
    }
  }
  data.entries = [...byId.values()];
  writeAll(data);
  process.stdout.write(`Merged: ${added} new, ${data.entries.length} total, ${bad} rejected.\n`);
  return bad ? 1 : 0;
}

function validateBatch(dir) {
  const known = new Set(JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')).map((m) => m.id));
  const list = JSON.parse(fs.readFileSync(path.join(dir, 'annotations.json'), 'utf8'));
  const errs = list.flatMap((a) => problems(a, known));
  const missing = [...known].filter((id) => !list.some((a) => a.id === id));
  if (missing.length) errs.push(`missing ids: ${missing.join(', ')}`);
  for (const e of errs) process.stdout.write(e + '\n');
  process.stdout.write(errs.length ? `${errs.length} problem(s)\n` : `ok: ${list.length} annotation(s)\n`);
  return errs.length ? 1 : 0;
}

function check() {
  const data = readAll();
  const errs = data.entries.flatMap((a) => problems(a));
  const ids = data.entries.map((e) => e.id);
  if (new Set(ids).size !== ids.length) errs.push('duplicate ids');
  for (const e of errs) process.stdout.write(e + '\n');
  process.stdout.write(errs.length ? `${errs.length} problem(s)\n` : `ok: ${data.entries.length} annotation(s)\n`);
  return errs.length ? 1 : 0;
}

function stats() {
  const { entries } = readAll();
  const tally = (f) => entries.reduce((m, e) => { for (const v of [].concat(f(e))) m[v] = (m[v] || 0) + 1; return m; }, {});
  const show = (name, t) => process.stdout.write(`${name}: ${Object.entries(t).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}\n`);
  process.stdout.write(`${entries.length} annotation(s)\n`);
  show('focus', tally((e) => e.focus));
  show('layout', tally((e) => e.layout));
  show('complexity', tally((e) => String(e.complexity)));
  show('shows', tally((e) => [...new Set(e.terminals.flatMap((t) => t.shows))]));
  show('mood', tally((e) => e.mood));
}

async function main(argv) {
  const [cmd, ...rest] = argv;
  const flags = {};
  const pos = [];
  for (let i = 0; i < rest.length; i++) {
    if (rest[i].startsWith('--')) flags[rest[i].slice(2)] = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : true;
    else pos.push(rest[i]);
  }
  switch (cmd) {
    case 'prepare': return prepare(flags);
    case 'merge': return merge(path.resolve(pos[0] || 'annotate-work'));
    case 'validate': return validateBatch(path.resolve(pos[0]));
    case 'check': return check();
    case 'stats': return stats();
    default: process.stdout.write('usage: node tools/annotate.js prepare|merge|check|stats (see the header of this file)\n'); return 1;
  }
}

if (require.main === module) main(process.argv.slice(2)).then((code) => { process.exitCode = code || 0; }, (e) => { process.stderr.write(`annotate: ${e.message}\n`); process.exitCode = 1; });

module.exports = { problems, readAll, writeAll, FILE };
