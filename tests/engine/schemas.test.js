'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', '..', 'schemas');
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  test(`schemas/${f} is valid JSON`, () => {
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  });
}
