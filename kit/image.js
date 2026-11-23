'use strict';
// Image loading/saving. PNG/BMP/GIF are decoded natively; anything else is converted to a temp PNG with OS tools.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const png = require('./png');
const bmp = require('./bmp');
const gif = require('./gif');

function sniff(buf) {
  if (buf.length >= 8 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a) return 'png';
  if (buf.length >= 2 && buf[0] === 0x42 && buf[1] === 0x4d) return 'bmp';
  if (buf.length >= 6 && buf.toString('latin1', 0, 4) === 'GIF8') return 'gif';
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf.length >= 12 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return 'webp';
  return 'unknown';
}

function have(cmd, args = ['-version']) {
  const r = spawnSync(cmd, args, { stdio: 'ignore', timeout: 15000 });
  return !r.error;
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 120000, windowsHide: true, ...opts });
  return !r.error && r.status === 0;
}

const PS_SCRIPT =
  "$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.Drawing; " +
  '$i=[System.Drawing.Image]::FromFile($env:TMT_IN); try { $i.Save($env:TMT_OUT,[System.Drawing.Imaging.ImageFormat]::Png) } finally { $i.Dispose() }';

// Each converter returns true when `out` was written.
function converters(inp, out) {
  const list = [];
  const plat = process.platform;
  if (plat === 'win32') {
    list.push({
      name: 'PowerShell System.Drawing',
      run: () => run('powershell', ['-NoProfile', '-NonInteractive', '-Command', PS_SCRIPT], { env: { ...process.env, TMT_IN: inp, TMT_OUT: out } }),
    });
  } else if (plat === 'darwin') {
    list.push({ name: 'sips', run: () => run('sips', ['-s', 'format', 'png', inp, '--out', out]) });
  }
  list.push({ name: 'ImageMagick (magick)', run: () => have('magick') && run('magick', [inp + '[0]', out]) });
  if (plat !== 'win32') list.push({ name: 'ImageMagick (convert)', run: () => have('convert') && run('convert', [inp + '[0]', out]) });
  list.push({ name: 'ffmpeg', run: () => have('ffmpeg') && run('ffmpeg', ['-y', '-loglevel', 'error', '-i', inp, '-frames:v', '1', out]) });
  return list;
}

function installHint() {
  switch (process.platform) {
    case 'win32': return 'install ImageMagick (winget install ImageMagick.ImageMagick) or ffmpeg (winget install Gyan.FFmpeg); System.Drawing cannot read WebP';
    case 'darwin': return 'sips ships with macOS; for WebP install ImageMagick or ffmpeg (brew install imagemagick ffmpeg)';
    default: return 'install ImageMagick (apt install imagemagick / dnf install ImageMagick) or ffmpeg';
  }
}

function convertToPng(file) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tmt-img-'));
  const out = path.join(dir, 'out.png');
  const tried = [];
  try {
    for (const c of converters(path.resolve(file), out)) {
      let ok = false;
      try { ok = c.run(); } catch (_) { ok = false; }
      if (ok && fs.existsSync(out) && fs.statSync(out).size > 0) return png.decode(fs.readFileSync(out));
      tried.push(c.name);
      try { fs.rmSync(out, { force: true }); } catch (_) { /* ignore */ }
    }
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) { /* ignore */ }
  }
  throw new Error(`Cannot decode ${file}: not PNG/BMP/GIF and no converter worked (tried: ${tried.join(', ')}). To read JPEG/WebP etc. ${installHint()}.`);
}

function load(file) {
  let buf;
  try { buf = fs.readFileSync(file); } catch (e) { throw new Error(`Cannot read image ${file}: ${e.message}`); }
  switch (sniff(buf)) {
    case 'png': return png.decode(buf);
    case 'bmp': return bmp.decode(buf);
    case 'gif': return gif.decodeFirstFrame(buf);
    default: return convertToPng(file);
  }
}

function save(img, file) {
  const ext = path.extname(file).toLowerCase();
  let buf;
  if (ext === '.png') buf = png.encode(img);
  else if (ext === '.bmp') buf = bmp.encode(img);
  else throw new Error(`save: unsupported extension "${ext}" (use .png or .bmp)`);
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, buf);
}

module.exports = { load, save, sniff };
