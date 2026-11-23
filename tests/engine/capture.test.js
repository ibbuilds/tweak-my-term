'use strict';
const mkTmp = require('../_tmp');
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const { capture } = require('../../engine/capture');

function home(files) {
  const h = mkTmp('tmt-capt-');
  process.env.TMT_HOME = h;
  process.env.TMT_OS = 'linux';
  for (const [rel, text] of Object.entries(files)) {
    const f = path.join(h, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, text);
  }
  return h;
}
const listed = (dir) => {
  const out = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else out.push(path.relative(dir, f).replace(/\\/g, '/')); } };
  walk(dir);
  return out.sort();
};

test('capture copies config files but never shell history', () => {
  home({ '.bashrc': 'x\n', '.bash_history': 'export TOKEN=abc\n' });
  const dest = mkTmp('tmt-dest-');
  capture('linux', dest);
  const files = listed(dest);
  assert.ok(files.some((f) => f.endsWith('/.bashrc')), files.join(', '));
  assert.ok(!files.some((f) => /history/.test(f)), files.join(', '));
});

test('capture follows files an rc file sources from the home folder, including globbed loops', () => {
  home({
    '.bashrc': '. ~/.config/bash/env.bash\nsource "$HOME/.config/bash/prompt.bash"\nfor m in a b; do . ~/.config/bash/$m.bash; done\n. /etc/bash_completion\n',
    '.config/bash/env.bash': 'export X=1\n',
    '.config/bash/prompt.bash': "PS1='> '\n",
    '.config/bash/a.bash': 'a\n',
  });
  const dest = mkTmp('tmt-dest-');
  const r = capture('linux', dest);
  const files = listed(dest);
  for (const f of ['env.bash', 'prompt.bash', 'a.bash']) assert.ok(files.some((x) => x.endsWith(`sourced/.config/bash/${f}`)), `${f} in ${files.join(', ')}`);
  assert.ok(!files.some((x) => /bash_completion/.test(x)), 'files outside home are not copied');
  assert.ok(r.files.length >= 4);
});

test('the current look reads a prompt defined in a sourced file', () => {
  home({ '.bashrc': '. ~/.config/bash/prompt.bash\n', '.config/bash/prompt.bash': "PS1='\\w > '\n" });
  const dest = mkTmp('tmt-dest-');
  capture('linux', dest);
  assert.strictEqual(require('../../kit/current').readCurrent(dest).prompt.bash, 'hand-rolled');
});
