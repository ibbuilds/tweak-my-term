#!/usr/bin/env node
'use strict';
// Claude Code hook handlers. They never throw: a broken hook must not break a session.
//   node engine/hook.js pre-tool-use | stop | session-start    (hook JSON on stdin)

const path = require('path');

const GENERIC = new Set(['config', 'config.toml', 'config.yml', 'config.yaml', 'config.json', 'settings.json', 'init.lua', 'theme.yml', 'theme.toml', 'conf.d']);
const WRITE_CMD = /(^|[\s;|&(])(tee|cp|mv|rm|ln|install|truncate|dd|touch)\s|\bsed\s+(-[a-zA-Z]*i|--in-place)|\bperl\s+-[a-zA-Z]*i|>{1,2}\s*["']?[^\s&|]|Set-Content|Add-Content|Out-File|Copy-Item|Move-Item|Remove-Item|New-Item|Clear-Content|WriteAll(Text|Bytes|Lines)|\bcpi\b|\bsc\s|\bac\s/i;
const HARMLESS_REDIRECT = /\d?>{1,2}\s*(\/dev\/null|\$null|nul\b|&\d)/gi;

function protectedEntries() {
  const paths = require('./paths');
  const catalog = require('./catalog');
  const run = require('./run');
  const list = catalog.configPaths().map((c) => ({ abs: c.abs, dir: c.dir }));
  const st = run.current();
  if (st) for (const f of st.files) { try { list.push({ abs: paths.target(f.target, { os: st.os }), dir: false }); } catch { /* ignore */ } }
  return list;
}

const norm = (p) => (process.platform === 'win32' ? path.resolve(p).toLowerCase() : path.resolve(p));
const within = (child, parent) => { const r = path.relative(parent, child); return r === '' || (!r.startsWith('..') && !path.isAbsolute(r)); };

function isProtected(file, entries) {
  const f = norm(file);
  return entries.find((e) => (e.dir ? within(f, norm(e.abs)) : f === norm(e.abs)));
}

function needle(abs) {
  const base = path.basename(abs);
  const parent = path.basename(path.dirname(abs));
  return GENERIC.has(base.toLowerCase()) ? `${parent}/${base}` : base;
}

// The text a heredoc or PowerShell here-string carries is data, not a target: drop it so a
// note that mentions ~/.bashrc isn't read as a write to it. The command line that names
// the destination (`cat > file <<EOF`) stays and is still checked.
function stripInlineText(cmd) {
  return cmd
    .replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n\s*\2\s*(?=\n|$)/g, (m) => m.slice(0, m.indexOf('\n')))
    .replace(/@(['"])\r?\n[\s\S]*?\r?\n\1@/g, '@\'\'@');
}

// Split a command line into simple commands (; && || | and newlines), keeping quoted text whole.
function segments(cmd) {
  const out = [];
  let cur = '';
  let q = null;
  for (let i = 0; i < cmd.length; i++) {
    const ch = cmd[i];
    if (q) { cur += ch; if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === ';' || ch === '\n' || ch === '|' || (ch === '&' && cmd[i + 1] === '&')) {
      out.push(cur); cur = '';
      if (cmd[i + 1] === ch) i++;
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

const TMT_SEGMENT = /^(tmt|node\s+\S*(engine\/)?cli\.js)\b/;

// A path token as the shell would see it, made absolute; null when it can't be known
// (an unexpanded variable), which counts as a hit to stay on the safe side.
function resolveToken(tok, cwd) {
  const home = require('./paths').home();
  if (/\$/.test(tok)) return null;
  if (tok === '~' || tok.startsWith('~/')) return path.join(home, tok.slice(2));
  const gitBash = /^\/([a-z])\/(.*)$/i.exec(tok);
  if (process.platform === 'win32' && gitBash) return `${gitBash[1]}:/${gitBash[2]}`;
  if (/^[A-Za-z]:\//.test(tok) || tok.startsWith('/')) return tok;
  return path.resolve(cwd, tok);
}

function commandHits(cmd, entries, cwd = process.cwd()) {
  const vars = {};
  for (const seg of segments(stripInlineText(cmd).replace(/\\/g, '/'))) {
    const asg = /^(?:export\s+)?([A-Za-z_]\w*)=(["']?)(.*)\2$/.exec(seg);
    if (asg) { vars[asg[1]] = asg[3]; continue; }
    if (TMT_SEGMENT.test(seg)) continue; // tmt stages and backs up; it is the way in
    // Expand variables, then blank single-quoted text (sed/awk programs, not paths).
    const c = seg.replace(/\$\{?([A-Za-z_]\w*)\}?/g, (m, v) => (v in vars ? vars[v] : m))
      .replace(/'[^']*'/g, "''").replace(HARMLESS_REDIRECT, ' ');
    const cd = /^(?:cd|Set-Location|pushd)\s+"?([^"\s]+)"?\s*$/i.exec(c);
    if (cd) { const to = resolveToken(cd[1], cwd); if (to) cwd = to; continue; }
    if (!WRITE_CMD.test(c)) continue;
    if (/\$profile\b/i.test(c)) return { abs: '$PROFILE' };
    const lower = c.toLowerCase();
    for (const e of entries) {
      const n = needle(e.abs).toLowerCase();
      if (n.length <= 3 || !lower.includes(n)) continue;
      // The name appears: check whether any path token naming it resolves to the guarded file.
      const toks = c.match(/[^\s"'<>|;&()]+/g) || [];
      for (const tok of toks.filter((t) => t.toLowerCase().includes(path.basename(n)))) {
        const abs = resolveToken(tok, cwd);
        if (!abs || isProtected(abs, [e])) return e;
      }
    }
  }
  return null;
}

const REASON = (what) => `tweak-my-term guards live terminal config (${what}) so every change is backed up, verified and undoable. `
  + 'Write the new content to a file in the run folder (see `tmt status`), then `tmt stage write|block|merge-json <target> <file>` and `tmt plan`. '
  + 'If the user wants to edit it by hand anyway, they can turn off the plugin option guard_configs.';

function preToolUse(input) {
  if (String(process.env.CLAUDE_PLUGIN_OPTION_GUARD_CONFIGS).toLowerCase() === 'false') return null;
  const paths = require('./paths');
  const ti = input.tool_input || {};
  const entries = protectedEntries();
  let hit = null;
  if (['Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(input.tool_name)) {
    const file = ti.file_path || ti.notebook_path;
    if (!file) return null;
    if (within(norm(file), norm(paths.stateRoot()))) return null;
    hit = isProtected(file, entries);
  } else if (input.tool_name === 'Bash' || input.tool_name === 'PowerShell') {
    const cmd = String(ti.command || '');
    if (/^\s*(tmt|node\s+\S*(engine[\\/])?cli\.js)\b/.test(cmd) && !/[;&|]/.test(cmd.replace(/\|\|/g, ''))) return null;
    hit = commandHits(cmd, entries, input.cwd || process.cwd());
  }
  if (!hit) return null;
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: REASON(hit.abs === '$PROFILE' ? '$PROFILE' : require('./paths').pretty(hit.abs)) } };
}

function stop(input) {
  if (input.stop_hook_active) return null;
  const run = require('./run');
  const st = run.current();
  if (!st) return null;
  if (st.status === 'applied') return { decision: 'block', reason: `tweak-my-term run ${st.id} is applied but not checked. Run \`tmt verify\`, then \`tmt measure\`, and report the results to the user before stopping.` };
  if (st.status === 'verified') return { decision: 'block', reason: `tweak-my-term run ${st.id} is verified but not measured. Run \`tmt measure\` and report startup times against the budget before stopping.` };
  if (st.status === 'failed' && st.applied) return { decision: 'block', reason: `tweak-my-term run ${st.id} failed after applying (${st.error}). Tell the user what failed and offer \`tmt restore\` (undo) or a fix in a new run before stopping.` };
  return null;
}

function sessionStart() {
  const run = require('./run');
  const s = run.status();
  if (s.status === 'none' || s.status === 'done' || s.status === 'restored') return null;
  return { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: `tweak-my-term: run ${s.id} is "${s.status}". Next: ${s.next}` } };
}

function handle(event, input) {
  if (event === 'pre-tool-use') return preToolUse(input);
  if (event === 'stop') return stop(input);
  if (event === 'session-start') return sessionStart(input);
  return null;
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => { raw += d; });
  process.stdin.on('end', () => {
    try {
      const out = handle(process.argv[2], raw ? JSON.parse(raw) : {});
      if (out) process.stdout.write(JSON.stringify(out));
    } catch (e) {
      process.stderr.write(`tweak-my-term hook: ${e.message}\n`);
    }
    process.exit(0);
  });
}

module.exports = { handle, commandHits, isProtected, needle };
