#!/usr/bin/env node
'use strict';
// Rehearse a whole setup conversation: the plugin's agent on a simulated home, and a
// stand-in user (a persona with hidden wishes) who answers whenever the agent stops to ask.
// Dev only: needs the `claude` CLI and spends API credit.
//
//   node tools/rehearse.js <scenario.json> [--out dir] [--budget usd] [--rounds n]
//
// Scenario: { id, os, home: "<dir under rehearsals/homes>", request,
//             persona: { who, wants } }
// Output (in --out/<id>/): home/, state/, agent-<n>.jsonl, transcript.md, grade.json

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const STOP = 'STOP';

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}

/** Parse a stream-json transcript into { result, sessionId, cost, turns, tools: [{name, input}] }. */
function parseStream(text) {
  const out = { result: '', sessionId: null, cost: 0, turns: 0, tools: [], errors: [] };
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let ev;
    try { ev = JSON.parse(line); } catch { continue; }
    if (ev.session_id) out.sessionId = ev.session_id;
    if (ev.type === 'assistant') {
      for (const c of (ev.message && ev.message.content) || []) if (c.type === 'tool_use') out.tools.push({ name: c.name, input: c.input });
    }
    if (ev.type === 'user') {
      for (const c of (ev.message && ev.message.content) || []) {
        if (c.type === 'tool_result' && c.is_error) out.errors.push(String(typeof c.content === 'string' ? c.content : JSON.stringify(c.content)).slice(0, 300));
      }
    }
    if (ev.type === 'result') { out.result = ev.result || ''; out.cost = ev.total_cost_usd || 0; out.turns = ev.num_turns || 0; }
  }
  return out;
}

/** The newest run's state.json under a state folder, or null. */
function latestRun(stateDir) {
  const runs = path.join(stateDir, 'runs');
  if (!fs.existsSync(runs)) return null;
  const ids = fs.readdirSync(runs).filter((d) => fs.existsSync(path.join(runs, d, 'state.json'))).sort();
  if (!ids.length) return null;
  const dir = path.join(runs, ids[ids.length - 1]);
  return { dir, state: JSON.parse(fs.readFileSync(path.join(dir, 'state.json'), 'utf8')) };
}

/** The stand-in user's instructions. */
function personaPrompt(persona) {
  return [
    'You are role-playing a person who asked an AI coding agent to change their terminal. Stay in character; you are not an assistant.',
    `Who you are: ${persona.who}`,
    `What you want (you know this, but only say what the agent asks about or what it gets wrong): ${persona.wants}`,
    'Rules:',
    '- Reply in 1-4 short, casual sentences, as this person would type them.',
    '- Answer the agent\'s questions from what you want. If you have no opinion on something, say it can choose.',
    '- When it shows options, pick the one closest to what you want, in a few words.',
    '- When it asks you to approve a look or preview: approve if it fits what you want, otherwise ask for one concrete change. You cannot open files; judge from its description.',
    '- When it asks whether it may install things, say yes to free tools it needs.',
    `- When it shows the final plan (files to write, and asks you to approve it, e.g. \`tmt approve\`), reply with exactly: ${STOP}`,
    `- If it says it is finished or has nothing to ask, reply with exactly: ${STOP}`,
  ].join('\n');
}

function claude(args, { env, cwd, timeout = 1800000 } = {}) {
  const r = spawnSync('claude', args, { cwd, env, encoding: 'utf8', timeout, maxBuffer: 256 * 1024 * 1024, windowsHide: true });
  if (r.error) throw r.error;
  return r;
}

function agentTurn(text, { cwd, env, resume, budget }) {
  const args = ['-p', text, '--plugin-dir', ROOT, '--setting-sources', 'project,local',
    '--allowedTools', 'Bash', 'Read', 'Glob', 'Grep', 'Skill', 'Write', 'Edit', 'WebFetch', 'Agent', 'Task',
    '--disallowedTools', 'PowerShell', '--permission-mode', 'acceptEdits', '--max-turns', '150',
    '--max-budget-usd', String(budget), '--output-format', 'stream-json', '--verbose'];
  if (resume) args.push('--resume', resume);
  return claude(args, { cwd, env });
}

function userTurn(persona, history, agentMsg, { cwd }) {
  const prompt = `The conversation so far:\n\n${history || '(none)'}\n\nThe agent just said:\n\n${agentMsg}\n\nWrite your reply.`;
  const r = claude(['-p', prompt, '--model', 'haiku', '--tools', '', '--setting-sources', 'local', '--no-session-persistence',
    '--system-prompt', personaPrompt(persona), '--output-format', 'json'], { cwd, env: process.env, timeout: 300000 });
  try { return JSON.parse(r.stdout).result.trim(); } catch { return STOP; }
}

/** Facts for grading, from the tool calls and the run folder. */
function grade(turns, run, userMsgs) {
  const bash = turns.flatMap((t) => t.tools).filter((t) => t.name === 'Bash').map((t) => String(t.input.command || ''));
  const used = (re) => bash.some((c) => re.test(c));
  const st = run && run.state;
  let look = null;
  try { look = JSON.parse(fs.readFileSync(path.join(run.dir, 'look.json'), 'utf8')); } catch { /* none */ }
  return {
    status: st ? st.status : 'no run',
    questionsAnswered: userMsgs.filter((m) => m !== STOP).length,
    cost: Number(turns.reduce((s, t) => s + t.cost, 0).toFixed(2)),
    agentTurns: turns.reduce((s, t) => s + t.turns, 0),
    steps: {
      detect: used(/\btmt detect\b|cli\.js detect/), audit: used(/\btmt audit\b|cli\.js audit/),
      inspire: used(/\btmt inspire\b|cli\.js inspire/), inspireSave: used(/inspire[^\n]*--save/),
      scene: used(/art scene/), treat: used(/art treat/), palette: used(/art palette|art scheme/),
      previewPng: used(/art preview[^\n]*--png/), lookCheck: used(/look check/), plan: used(/\btmt plan\b|cli\.js plan/),
      readImages: turns.flatMap((t) => t.tools).filter((t) => t.name === 'Read' && /\.(png|jpe?g|webp|gif)$/i.test(String(t.input.file_path || ''))).length,
    },
    look: look && { name: look.name, background: look.background || null, font: look.font, arrangement: look.layout ? look.layout.arrangement : null },
    staged: st ? { files: st.files.map((f) => `${f.kind} ${f.target}`), installs: st.installs.map((i) => `${i.manager} ${i.id}`), fonts: st.fonts } : null,
    toolErrors: turns.flatMap((t) => t.errors).slice(0, 20),
  };
}

function rehearse(scenarioFile, { out, budget = 8, rounds = 8 } = {}) {
  const sc = JSON.parse(fs.readFileSync(scenarioFile, 'utf8'));
  const dir = path.resolve(out, sc.id);
  if (fs.existsSync(dir)) throw new Error(`${dir} exists; pick another --out`);
  copyDir(path.join(ROOT, 'rehearsals', 'homes', sc.home), path.join(dir, 'home'));
  const env = { ...process.env, TMT_HOME: path.join(dir, 'home'), TMT_STATE: path.join(dir, 'state'), TMT_OS: sc.os };
  const turns = [];
  const userMsgs = [];
  const log = [`# ${sc.id}\n`, `**User:** ${sc.request}\n`];
  let msg = sc.request;
  let session = null;
  for (let n = 0; n < rounds; n++) {
    const r = agentTurn(msg, { cwd: dir, env, resume: session, budget });
    fs.writeFileSync(path.join(dir, `agent-${n}.jsonl`), r.stdout || '');
    const t = parseStream(r.stdout || '');
    turns.push(t);
    session = t.sessionId || session;
    log.push(`**Agent:** ${t.result}\n`);
    process.stdout.write(`${sc.id} round ${n}: ${t.turns} turns, $${t.cost.toFixed(2)}\n`);
    const run = latestRun(env.TMT_STATE);
    if (run && ['planned', 'approved'].includes(run.state.status)) break;
    if (!session) break;
    const reply = userTurn(sc.persona, log.join('\n'), t.result, { cwd: dir });
    userMsgs.push(reply);
    log.push(`**User:** ${reply}\n`);
    if (reply === STOP || reply.startsWith(STOP)) break;
    msg = reply;
  }
  const g = grade(turns, latestRun(env.TMT_STATE), userMsgs);
  fs.writeFileSync(path.join(dir, 'transcript.md'), log.join('\n'));
  fs.writeFileSync(path.join(dir, 'grade.json'), JSON.stringify(g, null, 2) + '\n');
  return { dir, grade: g };
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  const flag = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv.splice(i, 2)[1] : d; };
  const out = flag('out', path.join(require('os').tmpdir(), 'tmt-rehearsals'));
  const budget = Number(flag('budget', 8));
  const rounds = Number(flag('rounds', 8));
  if (!argv.length) { process.stderr.write('usage: node tools/rehearse.js <scenario.json> [--out dir] [--budget usd] [--rounds n]\n'); process.exit(2); }
  for (const f of argv) {
    const r = rehearse(f, { out, budget, rounds });
    process.stdout.write(`${r.dir}\n${JSON.stringify(r.grade, null, 2)}\n`);
  }
}

module.exports = { parseStream, latestRun, personaPrompt, grade, rehearse };
