'use strict';
// Temp folders for tests, removed when the test file finishes.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { after } = require('node:test');

const made = [];
after(() => { for (const d of made) fs.rmSync(d, { recursive: true, force: true }); });

module.exports = function mkTmp(prefix) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  made.push(d);
  return d;
};
