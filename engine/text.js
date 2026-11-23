'use strict';
// Text files keep their encoding. Windows PowerShell 5.1 often writes profiles as
// UTF-16LE with a BOM; editing those as UTF-8 would corrupt them.

function decode(buf) {
  if (!buf) return { text: null, enc: 'utf8' };
  if (buf[0] === 0xff && buf[1] === 0xfe) return { text: buf.subarray(2).toString('utf16le'), enc: 'utf16le' };
  if (buf[0] === 0xfe && buf[1] === 0xff) {
    const sw = Buffer.from(buf.subarray(2));
    sw.swap16();
    return { text: sw.toString('utf16le'), enc: 'utf16be' };
  }
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) return { text: buf.subarray(3).toString('utf8'), enc: 'utf8bom' };
  return { text: buf.toString('utf8'), enc: 'utf8' };
}

function encode(text, enc = 'utf8') {
  if (enc === 'utf16le') return Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, 'utf16le')]);
  if (enc === 'utf16be') { const b = Buffer.from(text, 'utf16le'); b.swap16(); return Buffer.concat([Buffer.from([0xfe, 0xff]), b]); }
  if (enc === 'utf8bom') return Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(text, 'utf8')]);
  return Buffer.from(text, 'utf8');
}

/** Binary means NUL bytes in something that is not UTF-16. */
const isBinary = (buf) => Boolean(buf) && decode(buf).enc.startsWith('utf8') && buf.includes(0);

module.exports = { decode, encode, isBinary };
