#!/usr/bin/env node
'use strict';
// Fails if tracked files contain personal data: real-looking user folders, emails,
// machine names in paths. Placeholders (me, user, you, <name>, %USERNAME%) are fine.
//   node tools/privacy.js [--all]   (--all also scans untracked files)

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PLACEHOLDER = /^(me|user|username|you|name|runner|runneradmin|example|<[^>]+>|%[a-z]+%|\$[a-z_{}]+|\*|\.\.\.|public|default|shared|alice|bob|x|linuxbrew|someone|jdoe|john)$/i;
const RULES = [
  { name: 'Windows user folder', re: /[A-Za-z]:[\\/]{1,2}Users[\\/]{1,2}([^\\/\s"'`<>{}()]+)/g },
  // a real folder starts the path (not files/home/...) and is not a dotfile
  { name: 'macOS user folder', re: /(?<![\w.-])\/Users\/([^/.\s"'`<>{}()][^/\s"'`<>{}()]*)/g },
  { name: 'Linux home folder', re: /(?<![\w.-])\/home\/([^/.\s"'`<>{}()][^/\s"'`<>{}()]*)/g },
  { name: 'email', re: /\b(?!git@)[A-Za-z0-9._%+-]+@(?!users\.noreply\.github\.com|noreply\.|example\.|anthropic\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, any: true },
  { name: 'local projects path', re: /\b[A-Za-z]:[\\/](?:projects|worktrees)[\\/]/gi, any: true },
];
const SKIP = /\.(png|gif|jpe?g|bmp|ico|ttf|otf|woff2?|zip)$/i;

function files(all) {
  const args = ['ls-files', '-z'].concat(all ? ['--others', '--exclude-standard', '--cached'] : []);
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).split('\0').filter(Boolean);
}

const hits = [];
for (const f of files(process.argv.includes('--all'))) {
  if (SKIP.test(f) || f === 'tools/privacy.js') continue;
  let text;
  try { text = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch { continue; }
  text.split(/\r?\n/).forEach((line, i) => {
    for (const r of RULES) {
      for (const m of line.matchAll(r.re)) {
        if (!r.any && PLACEHOLDER.test(m[1])) continue;
        if (r.name === 'email' && /@[\d.]+$|@\w+\.(js|ts|md|json|lua|toml)$/i.test(m[0])) continue;
        // GNOME Shell extension UUIDs look like emails (name@author.github.com).
        if (r.name === 'email' && /@[\w-]+\.github\.(com|io)(\.shell-extension\.zip)?$/i.test(m[0]) && /extension|gnome|uuid/i.test(line)) continue;
        hits.push(`${f}:${i + 1}: ${r.name}: ${m[0]}`);
      }
    }
  });
}

if (hits.length) {
  process.stderr.write(`privacy scan: ${hits.length} finding(s)\n${hits.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write('privacy scan: clean\n');
