#!/usr/bin/env node
'use strict';
// tmt: the tweak-my-term command line. Run `tmt help`.

const fs = require('fs');
const path = require('path');
const run = require('./run');
const paths = require('./paths');

const HELP = `tmt: build a terminal look safely (stage -> plan -> approve -> apply -> verify -> measure)

Run
  tmt new [--force] [--note text]          start a run (refuses while another is applied but unfinished)
  tmt status                               where the current run is and the next step
  tmt runs                                 list runs
  tmt detect                               OS, terminals, shells, tools, fonts, configs (saved in the run)
  tmt capture                              copy the user's current terminal configs into the run (read-only)

Stage (only into an open run; nothing touches the machine yet)
  tmt stage write <target> <file>          replace a whole file
  tmt stage block <target> <file>          insert/replace a managed block in an rc file
  tmt stage merge-json <target> <file>     merge keys into a JSON(C) config (Windows Terminal)
  tmt stage install <manager> <id>         winget | scoop | brew | apt | dnf | pacman | zypper | flatpak | psgallery | git
  tmt stage install auto <tool-id>         the catalog install for this OS, with a manager found here
  tmt stage font <NerdFontName>            per-user Nerd Font install (e.g. JetBrainsMono)
  tmt stage check -- <cmd> [args...]       extra check for verify
  tmt stage shell <id>                     shell to time in measure (bash, zsh, fish, powershell, pwsh, nu)
  tmt stage look <look.json>               attach the look spec (validated)
  Targets use ~ and tokens: {xdg-config} {appdata} {localappdata} {documents} {mac-app-support}
                            {wt-settings} {ps-profile} {pwsh-profile}

Gate
  tmt plan                                 diff of every file, installs, fonts; prints the plan hash
  tmt approve <hash>                       after the user agrees to the plan
  tmt apply [--allow-installs]             backup, install, write
  tmt verify                               each config's own checks; each must pass
  tmt measure [--before] [--runs N] [--shell id]   shell startup vs budget
  tmt restore [run-id]                     byte-for-byte undo

Design kit
  tmt art <command> ...                    palette, scheme, contrast, treat, scene, ascii, preview, swatch (tmt art help)
  tmt inspire <query...> [--limit N]       search 4,000+ r/unixporn rices with their dotfiles repos
  tmt shot [--title text] [--delay s]      screenshot the terminal window into the run
  tmt catalog list | show <id> | cap <capability> | paths
  tmt look check <look.json>

Add --json to any command for machine-readable output.`;

function parseArgs(argv) {
  const flags = {};
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') { pos.push('--', ...argv.slice(i + 1)); break; }
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) flags[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--') && ['note', 'runs', 'shell', 'title', 'delay', 'limit', 'os', 'out'].includes(k)) flags[k] = argv[++i];
      else flags[k] = true;
    } else pos.push(a);
  }
  return { flags, pos };
}

function out(data, json, text) {
  if (json) process.stdout.write(JSON.stringify(data, null, 2) + '\n');
  else process.stdout.write((typeof text === 'function' ? text(data) : text || JSON.stringify(data, null, 2)) + '\n');
}

function planText(p) {
  const lines = [`Plan for run ${p.id}`, ''];
  for (const f of p.files) lines.push(`  ${f.change.padEnd(9)} ${f.display}  (${f.kind})`);
  for (const i of p.installs) lines.push(`  install   ${i.command}${i.sudo ? '   (needs sudo: the user runs it)' : ''}`);
  for (const f of p.fonts) lines.push(`  font      ${f.name}${f.present ? ' (already installed, skipped)' : ' (per-user Nerd Font)'}`);
  for (const c of p.checks) lines.push(`  check     ${c.join(' ')}`);
  lines.push('', '--- diffs ---');
  for (const f of p.files) if (f.diff) lines.push(`=== ${f.change.toUpperCase()} ${f.display}`, f.diff);
  lines.push(`Plan hash: ${p.hash}`, `Approve with: tmt approve ${p.hash.slice(0, 12)}`);
  return lines.join('\n');
}

process.stdout.on("error", (e) => { if (e.code === "EPIPE") process.exit(0); throw e; });

async function main() {
  const { flags, pos } = parseArgs(process.argv.slice(2));
  const json = Boolean(flags.json);
  const [cmd, sub, ...rest] = pos;
  switch (cmd) {
    case undefined: case 'help': case '-h': return out(null, false, HELP);
    case 'new': { const st = run.newRun({ force: Boolean(flags.force), note: flags.note || '' }); return out({ id: st.id, dir: run.runDir(st.id) }, json, (d) => `Run ${d.id} started.\nRun folder: ${d.dir}\nNext: tmt detect, then design (look.json) and stage files.`); }
    case 'status': return out(run.status(), json, (s) => (s.id ? `Run ${s.id}: ${s.status}\nStaged: ${s.staged.files} files, ${s.staged.installs} installs, ${s.staged.fonts} fonts, ${s.staged.checks} checks\nFolder: ${s.dir}\n${s.error ? `Error: ${s.error}\n` : ''}Next: ${s.next}` : `No run. Next: ${s.next}`));
    case 'runs': return out(run.list(), json, (l) => l.map((r) => `${r.id}  ${r.status}`).join('\n') || 'no runs');
    case 'detect': {
      const d = await require('./detect').detect();
      const st = run.current();
      if (st && ['open', 'planned', 'approved'].includes(st.status)) fs.writeFileSync(path.join(run.runDir(st.id), 'detect.json'), JSON.stringify(d, null, 2) + '\n');
      return out(d, json, (x) => {
        const inst = Object.entries(x.tools).filter(([, v]) => v.installed).map(([k, v]) => `${k} ${v.version || ''}`.trim());
        const miss = Object.entries(x.tools).filter(([, v]) => !v.installed).map(([k]) => k);
        const terms = Object.entries(x.terminals).filter(([, v]) => v.installed).map(([k]) => k);
        return [`OS: ${x.os.name} ${x.os.distro || x.os.release} ${x.os.arch}   node ${x.node}`,
          `Package managers: ${Object.entries(x.managers).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none'}`,
          `Terminals: ${terms.join(', ') || 'none detected'}`, `Installed: ${inst.join(', ') || '-'}`, `Not installed: ${miss.join(', ') || '-'}`,
          `Fonts (coding/Nerd): ${x.fonts.nerd.slice(0, 15).join(', ')}${x.fonts.nerd.length > 15 ? ` (+${x.fonts.nerd.length - 15})` : ''}`,
          `Existing configs: ${x.configs.map((c) => c.path).join(', ') || 'none'}`, ...x.notes.map((n) => `Note: ${n}`)].join('\n');
      });
    }
    case 'capture': {
      const st = run.current();
      if (!st) throw new run.GateError('start a run first: tmt new');
      const dest = path.join(run.runDir(st.id), 'captured');
      const got = [];
      for (const c of require('./catalog').configPaths(st.os)) {
        if (!fs.existsSync(c.abs)) continue;
        const to = path.join(dest, c.tool, path.basename(c.abs));
        fs.mkdirSync(path.dirname(to), { recursive: true });
        if (fs.statSync(c.abs).isDirectory()) fs.cpSync(c.abs, to, { recursive: true, filter: (s) => { try { return fs.statSync(s).size < 2e6; } catch { return false; } } });
        else fs.copyFileSync(c.abs, to);
        got.push({ tool: c.tool, from: paths.pretty(c.abs), to });
      }
      return out({ dir: dest, files: got }, json, (d) => `Captured ${d.files.length} config(s) into ${d.dir}\n${d.files.map((f) => `  ${f.tool}: ${f.from}`).join('\n')}`);
    }
    case 'stage': {
      let r;
      if (['write', 'block', 'merge-json'].includes(sub)) { if (rest.length < 2) throw new run.GateError(`usage: tmt stage ${sub} <target> <file>`); r = run.stageFile(sub, rest[0], path.resolve(rest[1])); }
      else if (sub === 'install' && rest[0] === 'auto') {
        const st = run.current();
        const osName = flags.os || (st && st.os);
        const pick = require('./installers').resolve(rest[1], osName);
        if (!pick) throw new run.GateError(`no install for ${rest[1]} on ${osName} with a package manager found here. See \`tmt catalog show ${rest[1]}\`; stage one with \`tmt stage install <manager> <id>\`.`);
        r = run.stageInstall(pick.manager, pick.id);
      }
      else if (sub === 'install') r = run.stageInstall(rest[0], rest.slice(1).join(' '));
      else if (sub === 'font') r = run.stageFont(rest[0]);
      else if (sub === 'check') { const i = pos.indexOf('--'); r = run.stageCheck(i >= 0 ? pos.slice(i + 1) : rest); }
      else if (sub === 'shell') r = run.stageShell(rest[0]);
      else if (sub === 'look') r = run.setLook(path.resolve(rest[0]));
      else throw new run.GateError('usage: tmt stage write|block|merge-json|install|font|check|shell|look ...');
      return out(run.status(), json, (s) => `Staged. ${s.staged.files} files, ${s.staged.installs} installs, ${s.staged.fonts} fonts, ${s.staged.checks} checks. Next: ${s.next}`);
    }
    case 'plan': return out(run.plan({ os: flags.os }), json, planText);
    case 'approve': run.approve(sub); return out(run.status(), json, (s) => `Approved. Next: ${s.next}`);
    case 'apply': {
      const allow = Boolean(flags['allow-installs']) || String(process.env.CLAUDE_PLUGIN_OPTION_ALLOW_INSTALLS).toLowerCase() === 'true';
      const r = run.apply({ allowInstalls: allow });
      return out(r, json, (x) => `Applied run ${x.id}.\nWritten: ${x.written.join(', ') || 'nothing'}${x.fonts.length ? `\nFonts installed: ${x.fonts.join(', ')}` : ''}\nNext: tmt verify (open a new terminal tab/window to see the look)`);
    }
    case 'verify': {
      const r = run.verify();
      out(r, json, (x) => `${x.checks.map((c) => `${c.status === 0 ? (c.skipped ? 'skip' : 'ok  ') : 'FAIL'} ${c.name}${c.skipped ? ` (${c.skipped})` : ''}${c.status !== 0 && c.output ? `\n       ${c.output.replace(/\n/g, '\n       ')}` : ''}`).join('\n')}\n${x.ok ? 'Verified. Next: tmt measure' : 'Verify FAILED. Fix in a new run or undo with tmt restore.'}`);
      return r.ok ? undefined : process.exit(1);
    }
    case 'measure': {
      const r = run.measure({ before: Boolean(flags.before), runs: Number(flags.runs) || 5, shells: flags.shell ? String(flags.shell).split(',') : undefined });
      return out(r, json, (x) => {
        const prev = Object.fromEntries((x.before || []).map((b) => [b.shell, b]));
        return `${x.results.map((m) => (m.skipped ? `${m.shell}: skipped (${m.skipped})` : `${m.shell}: ${m.medianMs} ms median (min ${m.minMs})${prev[m.shell] && prev[m.shell].medianMs ? `, before ${prev[m.shell].medianMs} ms` : ''}${m.medianMs > x.budgetMs ? '  OVER BUDGET' : ''}${m.error ? `\n  stderr: ${m.error}` : ''}`)).join('\n')}\nBudget: ${x.budgetMs} ms per shell start.${x.overBudget.length ? ' Over budget: see skills/setup/references/performance.md.' : ''}`;
      });
    }
    case 'restore': { const r = run.restore(sub); return out(r, json, (x) => `Restored run ${x.id}: ${x.restored.join(', ')}${x.changedSince.length ? `\nChanged after apply (kept a copy in the run's pre-restore folder): ${x.changedSince.join(', ')}` : ''}`); }
    case 'shot': {
      const st = run.current();
      const dir = st ? path.join(run.runDir(st.id), 'shots') : path.join(paths.stateRoot(), 'shots');
      const f = require('./shot').shot({ dir, title: flags.title || '', delay: Number(flags.delay || 0.5) });
      return out({ file: f }, json, (x) => `Screenshot: ${x.file}`);
    }
    case 'catalog': {
      const catalog = require('./catalog');
      if (sub === 'show') { const t = catalog.get(rest[0]); if (!t) throw new run.GateError(`no tool ${rest[0]}`); return out(t, true); }
      if (sub === 'cap') { const c = catalog.capabilities(); const row = c && c.capabilities[rest[0]]; return out(row || {}, json, (r) => Object.entries(r).map(([id, v]) => `${id.padEnd(22)} ${v.support.padEnd(8)} ${v.os.join(',').padEnd(20)} ${v.recipe || ''}${v.notes ? `  ${v.notes}` : ''}`).join('\n') || `no tool lists ${rest[0]}`); }
      if (sub === 'paths') return out(catalog.configPaths().map((c) => ({ tool: c.tool, path: paths.pretty(c.abs), exists: fs.existsSync(c.abs) })), json, (l) => l.map((c) => `${c.exists ? '*' : ' '} ${c.tool.padEnd(22)} ${c.path}`).join('\n'));
      return out(catalog.tools().map((t) => ({ id: t.id, category: t.category, os: Object.keys(t.os || {}).filter((k) => t.os[k].supported), verified: t.verified && t.verified.date })), json, (l) => l.map((t) => `${t.category.padEnd(13)} ${t.id.padEnd(24)} ${t.os.join(',')}`).join('\n'));
    }
    case 'look': {
      if (sub !== 'check') throw new run.GateError('usage: tmt look check <look.json>');
      const errs = require('./schema').check('look', require('./jsonc').parse(fs.readFileSync(rest[0], 'utf8')));
      out({ ok: !errs.length, errors: errs }, json, (r) => (r.ok ? 'look spec is valid' : `look spec is invalid:\n  ${r.errors.join('\n  ')}`));
      return errs.length ? process.exit(1) : undefined;
    }
    case 'art': return require('../kit/cli').art(process.argv.slice(3));
    case 'inspire': return require('../kit/cli').inspire(process.argv.slice(3));
    case 'hook': return undefined; // hooks call engine/hook.js directly
    default: throw new run.GateError(`unknown command "${cmd}". Run tmt help.`);
  }
}

main().catch((e) => {
  const gate = e instanceof run.GateError;
  process.stderr.write(`${gate ? 'tmt: ' : 'tmt error: '}${e.message}\n`);
  if (!gate && process.env.TMT_DEBUG) process.stderr.write(`${e.stack}\n`);
  process.exit(gate ? 2 : 1);
});
