'use strict';
// Judges the current look (kit/current.js) against the objective rules of
// skills/setup/references/design.md, so a restyle keeps what already works and fixes the rest.
// Verdicts: keep (passes), improve (works but breaks a rule), missing (not set up), info (a fact
// to plan with, e.g. layout: one window is a choice, not a flaw).

const contrast = require('./contrast');

const NERD = /nerd|\bNF\b|NFM?\b|Symbols Nerd/i;
const PROMPT_TOOLS = new Set(['starship', 'oh-my-posh', 'powerlevel10k', 'pure']);
const PRIMARIES = new Set(['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']);

function terminalFindings(id, t, prompts) {
  const out = [];
  const add = (area, verdict, what, why, fix) => out.push({ terminal: id, area, verdict, what, why, fix });
  const usesIcons = Object.values(prompts).some((p) => PROMPT_TOOLS.has(p));

  // Palette.
  const p = t.palette;
  if (!p) {
    add('palette', t.scheme ? 'info' : 'missing', t.scheme ? `named scheme "${t.scheme}" (colors not in the config)` : 'no color scheme set',
      'Colors defined elsewhere cannot be checked here.', t.scheme ? 'Import it with `tmt art scheme <file>` to check contrast.' : 'Pick a palette (anchor or a named scheme).');
  } else if (t.stock && t.stock.palette) {
    add('palette', 'improve', `stock scheme (${t.scheme})`, 'The default look: all 16 colors at full saturation, nothing chosen.', 'Build a palette from an anchor or the chosen inspiration.');
  } else {
    const bad = [];
    if (p.background.toUpperCase() === '#000000') bad.push('pure black background #000000');
    if (p.foreground.toUpperCase() === '#FFFFFF') bad.push('pure white text #FFFFFF');
    const harsh = Object.entries(p.ansi).filter(([, v]) => PRIMARIES.has(String(v).toUpperCase())).map(([k]) => k);
    if (harsh.length) bad.push(`raw primaries in ${harsh.join(', ')}`);
    if (bad.length) add('palette', 'improve', bad.join('; '), 'Gorgeous terminals use a tinted near-black, a soft off-white and tamed ANSI colors.', 'Shift to a tinted bg (#101010-#1a1a24), fg ~#d0d0d0, desaturate primaries.');
    else add('palette', 'keep', `${t.scheme || 'custom'} palette, bg ${p.background}, fg ${p.foreground}`, 'Tinted background, soft foreground, no raw primaries.', null);

    const fails = contrast.report(p).filter((r) => !r.ok);
    if (fails.length) add('contrast', 'improve', fails.map((r) => `${r.pair.replace('/background', '')} ${r.ratio}:1 < ${r.min}`).join('; '), 'Text in these colors is hard to read on the background.', '`tmt art contrast` / `--fix` shifts lightness only, so hues stay.');
    else add('contrast', 'keep', 'every color passes contrast on the background', 'WCAG ratios from the contrast report.', null);
  }

  // Type.
  const f = t.font || {};
  const issues = [];
  if (t.stock && t.stock.font) issues.push(`stock font (${f.family})`);
  if (f.size && f.size < 10) issues.push(`size ${f.size} is small (11-14 reads well)`);
  if (f.lineHeight !== null && f.lineHeight !== undefined && f.lineHeight < 1.1) issues.push(`line height ${f.lineHeight} looks flat (1.2-1.3)`);
  if (usesIcons && f.family && !NERD.test(f.family)) issues.push(`"${f.family}" is not a Nerd Font, so prompt icons show as boxes`);
  if (issues.length) add('font', 'improve', issues.join('; '), 'Type sets the feel; icons need a Nerd Font.', 'Pick a Nerd Font variant at 12-14 pt, line height 1.2-1.3.');
  else add('font', 'keep', `${f.family || 'font'}${f.size ? ` ${f.size}pt` : ''}${f.lineHeight ? `, line height ${f.lineHeight}` : ''}`, 'Readable size and rhythm.', null);

  // Space.
  const pad = t.window && t.window.padding;
  if (pad) {
    const min = Math.min(...pad);
    if (min < 8) add('padding', 'improve', `padding ${pad.join('/')} px: text touches the window edge`, 'Zero padding is the most common thing that makes a good palette look cheap.', 'Use 16-24 px sides and about one line top/bottom.');
    else add('padding', 'keep', `padding ${pad.join('/')} px`, 'Text has room to breathe.', null);
  }

  // Surface over a picture.
  const op = t.window && t.window.opacity;
  if (op !== null && op !== undefined && op < 0.8 && !(t.window.blur)) {
    add('surface', 'improve', `window ${Math.round(op * 100)}% opaque without blur`, 'Busy desktop art shows through and fights the text.', 'Raise opacity to ~85%+, or add blur where the terminal supports it.');
  } else if (t.background && t.background.image) {
    add('surface', 'info', `background image ${t.background.image}${t.background.opacity !== null ? ` at ${t.background.opacity}` : ''}`, 'Readability over images depends on the picture.', 'Check it: `tmt art contrast <look> --image <file>`.');
  } else if (t.shader) {
    add('surface', 'info', 'custom pixel shader is active', 'Shaders draw over or behind text; judge them on a screenshot.', null);
  }

  // Layout: report only.
  const lay = t.layout || {};
  add('layout', 'info', lay.panes > 1 ? `${lay.panes} panes at startup` : `single window${lay.splitKeys ? ' (splits on keys)' : ''}`, 'Arrangement is the user\'s choice; change it only if they ask.', null);
  return out;
}

/** Findings for every terminal found, plus the shells' prompts and startup. */
function audit(current) {
  const findings = [];
  const prompts = current.prompt || {};
  for (const [id, t] of Object.entries(current.terminals || {})) findings.push(...terminalFindings(id, t, prompts));
  for (const [shell, engine] of Object.entries(prompts)) {
    if (engine === 'default') findings.push({ area: 'prompt', verdict: 'missing', what: `${shell}: the default prompt`, why: 'A considered one- or two-line prompt with one accent glyph is part of the look.', fix: 'starship (any shell) or oh-my-posh (PowerShell), or a hand-rolled prompt.' });
    else if (engine === 'oh-my-zsh' || engine === 'framework') findings.push({ area: 'prompt', verdict: 'improve', what: `${shell}: prompt from a ${engine === 'oh-my-zsh' ? 'oh-my-zsh' : 'shell framework'} theme`, why: 'Framework loaders cost startup time.', fix: 'A compiled prompt (starship) keeps the look and starts faster; keep their plugins only if used.' });
    else findings.push({ area: 'prompt', verdict: 'keep', what: `${shell}: ${engine} prompt`, why: 'A chosen prompt; restyle its colors, keep its structure unless asked.', fix: null });
  }
  const s = current.startup || {};
  if (s.fetch && s.fetch.length) findings.push({ area: 'startup', verdict: 'info', what: `runs ${s.fetch.join(', ')} at shell start`, why: 'Fetch output is part of the composition and costs startup time.', fix: null });
  if (s.multiplexer) findings.push({ area: 'startup', verdict: 'info', what: `starts ${s.multiplexer} automatically`, why: 'Panes come from the multiplexer; theme its bar in the same palette.', fix: null });
  if (!Object.keys(current.terminals || {}).length) findings.push({ area: 'terminal', verdict: 'missing', what: 'no terminal config found', why: 'Nothing to keep: the terminal runs its defaults.', fix: null });
  return { findings, counts: count(findings) };
}

function count(findings) {
  const c = { keep: 0, improve: 0, missing: 0, info: 0 };
  for (const f of findings) c[f.verdict]++;
  return c;
}

/** Markdown for audit.md in the run folder. */
function format(r) {
  const sec = (title, verdict) => {
    const list = r.findings.filter((f) => f.verdict === verdict);
    if (!list.length) return [];
    return [`## ${title}`, '', ...list.map((f) => `- **${f.area}**${f.terminal ? ` (${f.terminal})` : ''}: ${f.what}. ${f.why}${f.fix ? ` Fix: ${f.fix}` : ''}`), ''];
  };
  return [
    '# Audit of the current setup', '',
    `keep ${r.counts.keep} · improve ${r.counts.improve} · missing ${r.counts.missing} · facts ${r.counts.info}`, '',
    ...sec('Keep', 'keep'), ...sec('Improve', 'improve'), ...sec('Missing', 'missing'), ...sec('Facts to plan with', 'info'),
  ].join('\n');
}

module.exports = { audit, format };
