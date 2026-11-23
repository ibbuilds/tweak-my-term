'use strict';
// Small unified line diff (LCS). Enough for config files; huge files get a summary.

function lines(s) {
  if (s === null || s === undefined) return [];
  const a = s.replace(/\r\n/g, '\n').split('\n');
  if (a[a.length - 1] === '') a.pop();
  return a;
}

function diff(before, after, { context = 3, label = 'file' } = {}) {
  const a = lines(before);
  const b = lines(after);
  if (a.length * b.length > 4e6) return `@@ ${label}: ${a.length} lines -> ${b.length} lines (too large to diff) @@\n`;
  const n = a.length; const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
    dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  const ops = [];
  let i = 0; let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push([' ', a[i]]); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) ops.push(['-', a[i++]]);
    else ops.push(['+', b[j++]]);
  }
  while (i < n) ops.push(['-', a[i++]]);
  while (j < m) ops.push(['+', b[j++]]);
  if (!ops.some(([t]) => t !== ' ')) return '';
  // keep changed lines plus `context` lines around them
  const keep = new Array(ops.length).fill(false);
  ops.forEach(([t], k) => {
    if (t !== ' ') for (let d = -context; d <= context; d++) if (ops[k + d]) keep[k + d] = true;
  });
  let out = '';
  let gap = false;
  ops.forEach(([t, l], k) => {
    if (keep[k]) { if (gap) out += '@@ ... @@\n'; gap = false; out += `${t}${l}\n`; } else gap = out !== '';
  });
  return out;
}

module.exports = { diff };
