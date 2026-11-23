'use strict';
// Managed blocks: tweak-my-term owns only the lines between its markers, so a user's
// .bashrc, .zshrc, $PROFILE or .gitconfig keeps everything else.

const path = require('path');

const COMMENT = { '.lua': '--', '.vim': '"', '.el': ';;', '.ini': ';' };

function markerFor(target) {
  const ext = path.extname(target).toLowerCase();
  if (ext === '.json' || ext === '.jsonc') throw new Error(`${target}: JSON has no comments, so a block can't be marked; use merge-json`);
  const c = COMMENT[ext] || '#';
  return { start: `${c} >>> tweak-my-term >>>`, end: `${c} <<< tweak-my-term <<<` };
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function applyBlock(existing, body, target) {
  const { start, end } = markerFor(target);
  const eol = existing && existing.includes('\r\n') ? '\r\n' : '\n';
  const inner = body.replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n').join(eol);
  const block = `${start}${eol}${inner}${eol}${end}${eol}`;
  if (!existing) return block;
  const re = new RegExp(`${esc(start)}[\\s\\S]*?${esc(end)}(\\r?\\n)?`);
  if (re.test(existing)) return existing.replace(re, () => block);
  const base = /\r?\n$/.test(existing) ? existing : existing + eol;
  return `${base}${eol}${block}`;
}

function removeBlock(existing, target) {
  if (!existing) return existing;
  const { start, end } = markerFor(target);
  const re = new RegExp(`(\\r?\\n)?${esc(start)}[\\s\\S]*?${esc(end)}(\\r?\\n)?`);
  return existing.replace(re, '');
}

/** True when every non-blank, non-comment line of the block is already in the file. */
function alreadyPresent(existing, body, target) {
  const { start } = markerFor(target);
  const c = start.split(' ')[0];
  const have = new Set(existing.replace(/\r\n/g, '\n').split('\n').map((l) => l.trim()));
  const need = body.replace(/\r\n/g, '\n').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith(c));
  return need.length > 0 && need.every((l) => have.has(l));
}

module.exports = { markerFor, applyBlock, removeBlock, alreadyPresent };
