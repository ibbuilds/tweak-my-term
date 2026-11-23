'use strict';
// Presets: tested looks shipped in presets/<name>/.

const fs = require('fs');
const path = require('path');
const schema = require('./schema');
const run = require('./run');

const ROOT = path.join(__dirname, '..', 'presets');

function list() {
  if (!fs.existsSync(ROOT)) return [];
  return fs.readdirSync(ROOT).filter((d) => fs.existsSync(path.join(ROOT, d, 'preset.json'))).map((d) => {
    const p = JSON.parse(fs.readFileSync(path.join(ROOT, d, 'preset.json'), 'utf8'));
    return { name: p.name, title: p.title, description: p.description, os: Object.keys(p.os), dir: path.join(ROOT, d) };
  });
}

function load(name) {
  const dir = path.join(ROOT, name);
  const f = path.join(dir, 'preset.json');
  if (!/^[a-z0-9-]+$/.test(name) || !fs.existsSync(f)) throw new run.GateError(`no preset "${name}" (have: ${list().map((p) => p.name).join(', ') || 'none'})`);
  const p = JSON.parse(fs.readFileSync(f, 'utf8'));
  const errs = schema.check('preset', p);
  if (errs.length) throw new run.GateError(`preset ${name} is invalid:\n  ${errs.join('\n  ')}`);
  return { p, dir };
}

/** Stage everything a preset needs for the run's OS into the open run. */
function stage(name, { osName } = {}) {
  const { p, dir } = load(name);
  const st = run.current();
  const target = osName || (st && st.os);
  const plan = p.os[target];
  if (!plan) {
    throw new run.GateError(`preset ${name} has no ${target} version yet (has: ${Object.keys(p.os).join(', ')}). Build it from presets/${name}/look.json with the catalog recipes for ${target}.`);
  }
  run.setLook(path.join(dir, p.look));
  for (const f of plan.files) run.stageFile(f.kind, f.to, path.join(dir, f.from), { os: target });
  for (const i of plan.installs || []) run.stageInstall(i.manager, i.id);
  for (const font of plan.fonts || []) run.stageFont(font);
  for (const c of plan.checks || []) run.stageCheck(c);
  return { name, os: target, files: plan.files.length, installs: (plan.installs || []).length, fonts: (plan.fonts || []).length, checks: (plan.checks || []).length };
}

module.exports = { list, load, stage, ROOT };
