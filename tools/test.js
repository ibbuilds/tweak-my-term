#!/usr/bin/env node
'use strict';
// Runs every tests/**/*.test.js with node:test. Node 20's `node --test` does not expand
// glob patterns (Node 21+ does), so the files are listed here and passed explicitly.
//   node tools/test.js [extra node --test flags]

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function find(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'fixtures' || e.name === 'node_modules' ? [] : find(p);
    return e.name.endsWith('.test.js') ? [p] : [];
  }).sort();
}

const files = find(path.join(ROOT, 'tests')).map((f) => path.relative(ROOT, f));
if (!files.length) { console.error('no test files under tests/'); process.exit(1); }
const r = spawnSync(process.execPath, ['--test', ...process.argv.slice(2), ...files], { cwd: ROOT, stdio: 'inherit' });
process.exit(r.status === null ? 1 : r.status);
