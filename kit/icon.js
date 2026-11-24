'use strict';
// Icons for tabs, profiles and the app (taskbar, dock, launcher), drawn from a look's palette:
// a rounded badge with a gradient and one motif per shell, so profiles tell apart at a glance.
// No fonts or third-party art: every shape is drawn here.

const R = require('./raster');
const C = require('./color');
const png = require('./png');

const MOTIFS = ['prompt', 'powershell', 'cmd', 'dev', 'sun'];

const mix = (a, b, t) => {
  const [r1, g1, b1] = C.hexToRgb(a), [r2, g2, b2] = C.hexToRgb(b);
  const h = (v) => Math.round(v).toString(16).padStart(2, '0');
  return `#${h(r1 + (r2 - r1) * t)}${h(g1 + (g2 - g1) * t)}${h(b1 + (b2 - b1) * t)}`;
};

// Coverage (0..1) of a rounded square of side s and corner radius r at pixel center (x, y).
function roundedCover(x, y, s, r) {
  const cx = Math.min(Math.max(x, r), s - r), cy = Math.min(Math.max(y, r), s - r);
  return Math.min(1, Math.max(0, r - Math.hypot(x - cx, y - cy) + 0.5));
}

function polyline(img, pts, color, width) {
  for (let i = 1; i < pts.length; i++) R.line(img, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], color, width);
  for (const [x, y] of pts) R.disc(img, x, y, width / 2, color); // round joins
}

const DRAW = {
  // >_  (bash, zsh, fish: a plain prompt)
  prompt(img, s, c, w) {
    polyline(img, [[s * 0.26, s * 0.32], [s * 0.46, s * 0.5], [s * 0.26, s * 0.68]], c.accent, w);
    R.line(img, s * 0.52, s * 0.7, s * 0.76, s * 0.7, c.second, w);
  },
  // a chevron inside a slanted frame
  powershell(img, s, c, w) {
    polyline(img, [[s * 0.3, s * 0.24], [s * 0.86, s * 0.24], [s * 0.7, s * 0.76], [s * 0.14, s * 0.76], [s * 0.3, s * 0.24]], c.second, w * 0.6);
    polyline(img, [[s * 0.34, s * 0.36], [s * 0.5, s * 0.5], [s * 0.3, s * 0.64]], c.accent, w);
    R.line(img, s * 0.5, s * 0.64, s * 0.62, s * 0.64, c.accent, w);
  },
  // C:\  (cmd)
  cmd(img, s, c, w) {
    const arc = [];
    for (let a = 0.25; a <= 1.75; a += 0.125) arc.push([s * 0.34 + Math.cos(a * Math.PI) * s * 0.16, s * 0.5 - Math.sin(a * Math.PI) * s * 0.18]);
    polyline(img, arc, c.accent, w);
    R.disc(img, s * 0.56, s * 0.4, w * 0.6, c.second);
    R.disc(img, s * 0.56, s * 0.6, w * 0.6, c.second);
    R.line(img, s * 0.66, s * 0.3, s * 0.8, s * 0.7, c.second, w);
  },
  // </>  (developer shells)
  dev(img, s, c, w) {
    polyline(img, [[s * 0.32, s * 0.32], [s * 0.16, s * 0.5], [s * 0.32, s * 0.68]], c.accent, w);
    polyline(img, [[s * 0.68, s * 0.32], [s * 0.84, s * 0.5], [s * 0.68, s * 0.68]], c.accent, w);
    R.line(img, s * 0.56, s * 0.26, s * 0.44, s * 0.74, c.second, w);
  },
  // a striped sun over a grid (the app itself)
  sun(img, s, c, w) {
    const cx = s * 0.5, cy = s * 0.5, r = s * 0.27;
    for (let y = Math.floor(cy - r); y <= cy + r * 0.55; y++) {
      const t = (y - (cy - r)) / (r * 1.55);
      const gap = y > cy && Math.floor((y - cy) / Math.max(2, s * 0.045)) % 2 === 1; // stripes in the lower half
      if (gap) continue;
      const half = Math.sqrt(Math.max(0, r * r - (y + 0.5 - cy) ** 2));
      R.line(img, cx - half, y + 0.5, cx + half, y + 0.5, mix(c.third, c.accent, Math.min(1, Math.max(0, t))), 1);
    }
    const hy = cy + r * 0.6;
    R.line(img, s * 0.1, hy, s * 0.9, hy, c.second, Math.max(1, w * 0.35));
    for (const k of [-3, -1.6, -0.5, 0.5, 1.6, 3]) R.line(img, cx + k * s * 0.05, hy, cx + k * s * 0.14, s * 0.9, c.second, Math.max(1, w * 0.25));
    R.line(img, s * 0.12, s * 0.8, s * 0.88, s * 0.8, c.second, Math.max(1, w * 0.25));
  },
};

/**
 * One icon. palette: { background, foreground, ansi: [8+] }. accent: the motif color
 * (default the palette's magenta). Returns a raster image (RGBA).
 */
function icon({ motif = 'prompt', palette, size = 256, accent } = {}) {
  if (!DRAW[motif]) throw new Error(`motif must be one of ${MOTIFS.join(', ')}, got "${motif}"`);
  if (!palette || !palette.background) throw new Error('icon needs a palette with a background');
  const NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
  const ansi = Array.isArray(palette.ansi) ? palette.ansi : NAMES.map((n) => (palette.ansi || {})[n]);
  const c = {
    accent: accent || ansi[5] || palette.foreground,
    second: accent && accent.toLowerCase() === String(ansi[6] || '').toLowerCase() ? ansi[5] || palette.foreground : ansi[6] || palette.foreground,
    third: ansi[3] || palette.foreground,
  };
  const s = size;
  const img = R.create(s, s, palette.background);
  // body: a soft vertical gradient toward the accent, then the motif
  const top = mix(palette.background, c.accent, 0.08), bottom = mix(palette.background, c.accent, 0.3);
  R.linearGradient(img, [[0, top], [1, bottom]], 90);
  DRAW[motif](img, s, c, Math.max(1.5, s * 0.075));
  // rounded corners and a thin accent rim
  const r = s * 0.22, d = img.data;
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const cov = roundedCover(x + 0.5, y + 0.5, s, r);
      const o = (y * s + x) * 4;
      d[o + 3] = Math.round(d[o + 3] * cov);
    }
  }
  return img;
}

/** ICO container with PNG payloads (Windows Vista+), sizes up to 256. */
function toIco(images) {
  const pngs = images.map((im) => png.encode(im));
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  let off = head.length;
  pngs.forEach((p, i) => {
    const e = 6 + 16 * i, im = images[i];
    head[e] = im.width >= 256 ? 0 : im.width; head[e + 1] = im.height >= 256 ? 0 : im.height;
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(p.length, e + 8); head.writeUInt32LE(off, e + 12);
    off += p.length;
  });
  return Buffer.concat([head, ...pngs]);
}

module.exports = { icon, toIco, MOTIFS };
