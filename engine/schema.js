'use strict';
// Minimal JSON Schema validator: the subset our schemas use (type, enum, const, pattern,
// required, properties, additionalProperties, items, minItems, maxItems, minimum, maximum,
// oneOf, $ref to #/$defs). No dependencies, so the engine runs anywhere Node runs.

const fs = require('fs');
const path = require('path');

const SCHEMAS = path.join(__dirname, '..', 'schemas');

const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array'
  : Number.isInteger(v) ? 'integer' : typeof v);

function validate(schema, value, root = schema, at = '$', errors = []) {
  if (schema.$ref) {
    const m = /^#\/\$defs\/(.+)$/.exec(schema.$ref);
    if (!m || !root.$defs || !root.$defs[m[1]]) { errors.push(`${at}: unknown $ref ${schema.$ref}`); return errors; }
    return validate(root.$defs[m[1]], value, root, at, errors);
  }
  if (schema.oneOf) {
    const fits = schema.oneOf.filter((b) => !validate(b, value, root, at, []).length).length;
    if (fits !== 1) errors.push(`${at}: must match exactly one of ${schema.oneOf.length} forms (matches ${fits})`);
  }
  const t = typeOf(value);
  if (schema.type) {
    const ok = [].concat(schema.type).some((s) => s === t || (s === 'number' && t === 'integer'));
    if (!ok) { errors.push(`${at}: expected ${[].concat(schema.type).join('|')}, got ${t}`); return errors; }
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${at}: must be one of ${schema.enum.join(', ')}`);
  if ('const' in schema && schema.const !== value) errors.push(`${at}: must be ${JSON.stringify(schema.const)}`);
  if (t === 'string' && schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${at}: does not match ${schema.pattern}`);
  if ((t === 'number' || t === 'integer')) {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${at}: below minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${at}: above maximum ${schema.maximum}`);
  }
  if (t === 'array') {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${at}: needs at least ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${at}: allows at most ${schema.maxItems} items`);
    if (schema.items) value.forEach((v, i) => validate(schema.items, v, root, `${at}[${i}]`, errors));
  }
  if (t === 'object') {
    for (const k of schema.required || []) if (!(k in value)) errors.push(`${at}: missing required "${k}"`);
    const props = schema.properties || {};
    for (const [k, v] of Object.entries(value)) {
      if (props[k]) validate(props[k], v, root, `${at}.${k}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${at}: unknown key "${k}"`);
      else if (typeof schema.additionalProperties === 'object') validate(schema.additionalProperties, v, root, `${at}.${k}`, errors);
    }
  }
  return errors;
}

const cache = {};
function load(name) {
  if (!cache[name]) cache[name] = JSON.parse(fs.readFileSync(path.join(SCHEMAS, `${name}.schema.json`), 'utf8'));
  return cache[name];
}

/** Validate a value against schemas/<name>.schema.json. Returns a list of error strings. */
function check(name, value) {
  return validate(load(name), value);
}

module.exports = { validate, check, load };
