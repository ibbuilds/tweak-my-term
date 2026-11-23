'use strict';
// JSON with comments and trailing commas (Windows Terminal settings, VS Code-style configs).

/** Remove // and /* *\/ comments and trailing commas, leaving strings untouched. */
function strip(text) {
  let out = '';
  let i = 0;
  const n = text.length;
  if (text.charCodeAt(0) === 0xfeff) i = 1; // BOM
  while (i < n) {
    const c = text[i];
    if (c === '"') {
      let j = i + 1;
      while (j < n && text[j] !== '"') j += text[j] === '\\' ? 2 : 1;
      out += text.slice(i, j + 1);
      i = j + 1;
    } else if (c === '/' && text[i + 1] === '/') {
      while (i < n && text[i] !== '\n') i++;
    } else if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end < 0 ? n : end + 2;
    } else if (c === ',') {
      let j = i + 1;
      while (j < n && /\s/.test(text[j])) j++;
      // a comma followed by a comment and then a closer is still trailing
      if (text[j] === '/' && (text[j + 1] === '/' || text[j + 1] === '*')) {
        const rest = strip(text.slice(j));
        if (/^\s*[}\]]/.test(rest)) { out += rest; return out; }
      }
      if (text[j] !== '}' && text[j] !== ']') out += c;
      i++;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

function parse(text) {
  return JSON.parse(strip(text));
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
// Identity keys, in order of preference. Windows Terminal keybindings repeat "id"
// (several keys can run one action), so a key only counts if it is unique in both lists.
const KEYS = ['guid', 'name', 'id', 'keys'];

const val = (item, k) => (isObj(item) && typeof item[k] === 'string' ? item[k].toLowerCase() : null);

const unique = (list, k) => {
  const vals = list.map((x) => val(x, k)).filter((v) => v !== null);
  return new Set(vals).size === vals.length;
};

/** Deep merge: fragment wins; object lists are matched by a unique guid/name/id/keys; other lists are replaced. */
function merge(base, frag) {
  if (Array.isArray(frag)) {
    const keys = Array.isArray(base) ? KEYS.filter((k) => unique(frag, k) && unique(base, k)) : [];
    const keyFor = (item) => keys.find((k) => val(item, k) !== null) || null;
    if (!frag.some(keyFor)) return structuredClone(frag);
    const out = structuredClone(base);
    for (const item of frag) {
      const key = keyFor(item);
      const idx = key ? out.findIndex((b) => val(b, key) === val(item, key)) : -1;
      if (idx >= 0) out[idx] = merge(out[idx], item);
      else out.push(structuredClone(item));
    }
    return out;
  }
  if (isObj(frag)) {
    const out = isObj(base) ? structuredClone(base) : {};
    for (const [k, v] of Object.entries(frag)) out[k] = k in out ? merge(out[k], v) : structuredClone(v);
    return out;
  }
  return frag;
}

/**
 * Serialize like the file it came from. "split" is Windows Terminal's style (jsoncpp):
 * a non-empty object or list value starts on its own line under its key.
 */
function styleOf(text) {
  return text && /"\s*:\s*\r?\n\s*[[{]/.test(text) ? 'split' : 'inline';
}

function stringify(value, style = 'inline', indent = '    ') {
  if (style !== 'split') return JSON.stringify(value, null, indent.length);
  const ser = (v, pad) => {
    const inner = pad + indent;
    if (Array.isArray(v)) {
      if (!v.length) return '[]';
      return `[\n${v.map((x) => inner + ser(x, inner)).join(',\n')}\n${pad}]`;
    }
    if (isObj(v)) {
      const keys = Object.keys(v);
      if (!keys.length) return '{}';
      return `{\n${keys.map((k) => {
        const x = v[k];
        const nested = (Array.isArray(x) && x.length) || (isObj(x) && Object.keys(x).length);
        return nested ? `${inner}${JSON.stringify(k)}:\n${inner}${ser(x, inner)}` : `${inner}${JSON.stringify(k)}: ${ser(x, inner)}`;
      }).join(',\n')}\n${pad}}`;
    }
    return JSON.stringify(v);
  };
  return ser(value, '');
}

module.exports = { strip, parse, merge, styleOf, stringify };
