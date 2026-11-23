'use strict';
// Parametric scene painter: turns a palette and a list of layers into a wallpaper-sized image.
// Deterministic: the same { width, height, seed, palette, layers } always gives the same pixels.
// Layers are painted in order; colors are palette roles ('background', 'foreground', 'accent', 'ansi.red',
// 'red', 'ink') or hex strings, or { mix: [a, b, t] } / { dark: [a, t] } / { light: [a, t] }.
//
//   paint({ width, height, seed, palette, layers })   or   paint({ preset: 'eclipse', ... })
//
// Layer types: sky, stars, moon, sun, glow, haze, hills, grid, waves, fog (alias noise), hatch, blades, grain.
const C = require('./color');
const R = require('./raster');

const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function hashStr(s) {
  let h = 2166136261;
  for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h | 0;
}
const seedInt = (seed) => (typeof seed === 'number' && Number.isFinite(seed) ? Math.trunc(seed) | 0 : hashStr(seed));

function mulberry32(a) {
  let s = a >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x, y) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ------------------------------------------------------------------ colors

function makeResolver(pal = {}) {
  const ansi = pal.ansi || {};
  const bg = pal.background || '#0B0D12';
  const fg = pal.foreground || '#D8DEE9';
  const accent = pal.accent || pal.cursor || ansi.blue || '#7AA2F7';
  const res = (spec) => {
    if (Array.isArray(spec)) return spec.slice(0, 3);
    if (typeof spec === 'string') {
      const s = spec.trim();
      if (s[0] === '#') return C.hexToRgb(s);
      const k = s.replace(/^ansi\./, '');
      if (k === 'background' || k === 'bg') return C.hexToRgb(bg);
      if (k === 'foreground' || k === 'fg') return C.hexToRgb(fg);
      if (k === 'accent') return C.hexToRgb(accent);
      if (k === 'cursor') return C.hexToRgb(pal.cursor || accent);
      if (k === 'selection') return C.hexToRgb(pal.selectionBackground || C.mix(bg, accent, 0.3));
      if (k === 'ink') return C.hexToRgb(C.mix(bg, '#000000', 0.7));
      if (k === 'black' && !ansi.black) return C.hexToRgb(C.mix(bg, '#000000', 0.5));
      if (k === 'white' && !ansi.white) return C.hexToRgb(fg);
      if (/^(bright)?(black|red|green|yellow|blue|magenta|cyan|white)$/i.test(k)) {
        const v = ansi[k] || ansi[k.replace(/^bright/i, '').toLowerCase()] || accent;
        return C.hexToRgb(v);
      }
      throw new Error(`scene: unknown color "${spec}" (use a hex, a palette role like accent/ansi.red/ink, or {mix:[a,b,t]})`);
    }
    if (spec && Array.isArray(spec.mix)) return C.hexToRgb(C.mix(res(spec.mix[0]), res(spec.mix[1]), spec.mix[2]));
    if (spec && Array.isArray(spec.dark)) return C.hexToRgb(C.mix(res(spec.dark[0]), '#000000', spec.dark[1]));
    if (spec && Array.isArray(spec.light)) return C.hexToRgb(C.mix(res(spec.light[0]), '#FFFFFF', spec.light[1]));
    throw new Error(`scene: invalid color ${JSON.stringify(spec)}`);
  };
  return res;
}

const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// ------------------------------------------------------------------ pixel primitives (opaque canvas)

function blend(d, o, rgb, a) {
  if (a <= 0) return;
  if (a > 1) a = 1;
  d[o] += (rgb[0] - d[o]) * a;
  d[o + 1] += (rgb[1] - d[o + 1]) * a;
  d[o + 2] += (rgb[2] - d[o + 2]) * a;
}

function stamp(ctx, cx, cy, rad, rgb, a) {
  const { w, h, data: d } = ctx;
  if (rad < 0.75) {
    const x = Math.round(cx), y = Math.round(cy);
    if (x >= 0 && y >= 0 && x < w && y < h) blend(d, (y * w + x) * 4, rgb, a * rad / 0.75);
    return;
  }
  const x0 = Math.max(0, Math.floor(cx - rad - 1)), x1 = Math.min(w - 1, Math.ceil(cx + rad + 1));
  const y0 = Math.max(0, Math.floor(cy - rad - 1)), y1 = Math.min(h - 1, Math.ceil(cy + rad + 1));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const cov = rad - Math.hypot(x + 0.5 - cx, y + 0.5 - cy) + 0.5;
      if (cov > 0) blend(d, (y * w + x) * 4, rgb, a * (cov > 1 ? 1 : cov));
    }
  }
}

// Tapered polyline made of stamps ~1px apart.
function stroke(ctx, pts, w0, w1, rgb, a) {
  let total = 0;
  const seg = [];
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
  let s = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], n = Math.max(1, Math.ceil(seg[i - 1]));
    for (let j = 0; j < n; j++) {
      const f = j / n, t = total ? (s + seg[i - 1] * f) / total : 0;
      stamp(ctx, ax + (bx - ax) * f, ay + (by - ay) * f, (w0 + (w1 - w0) * t) / 2, rgb, a);
    }
    s += seg[i - 1];
  }
}

const bez = (p0, p1, p2, n = 8) => {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
  }
  return pts;
};

// Anti-aliased straight line of constant width; walks the major axis so long lines stay cheap.
function thickLine(ctx, x0, y0, x1, y1, width, rgb, a) {
  const { w, h, data: d } = ctx;
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
  if (!len) return;
  const horiz = Math.abs(dx) >= Math.abs(dy);
  const major = horiz ? Math.abs(dx) : Math.abs(dy);
  const cosPhi = major / len; // perpendicular distance = minor-axis distance * cosPhi
  const half = width / 2;
  const reach = Math.ceil(half / cosPhi + 1);
  const a0 = horiz ? x0 : y0, a1 = horiz ? x1 : y1, b0 = horiz ? y0 : x0, b1 = horiz ? y1 : x1;
  const lo = Math.floor(Math.min(a0, a1)), hi = Math.ceil(Math.max(a0, a1));
  for (let m = lo; m <= hi; m++) {
    const t = (m + 0.5 - a0) / (a1 - a0);
    if (t < -0.01 || t > 1.01) continue;
    const c = b0 + (b1 - b0) * t;
    const mi0 = Math.floor(c - reach), mi1 = Math.ceil(c + reach);
    for (let n = mi0; n <= mi1; n++) {
      const cov = half - Math.abs(n + 0.5 - c) * cosPhi + 0.5;
      if (cov <= 0) continue;
      const x = horiz ? m : n, y = horiz ? n : m;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      blend(d, (y * w + x) * 4, rgb, a * (cov > 1 ? 1 : cov));
    }
  }
}

function glowAt(ctx, cx, cy, radius, rgb, strength, power = 2.2) {
  const { w, h, data: d } = ctx;
  const x0 = Math.max(0, Math.floor(cx - radius)), x1 = Math.min(w - 1, Math.ceil(cx + radius));
  const y0 = Math.max(0, Math.floor(cy - radius)), y1 = Math.min(h - 1, Math.ceil(cy + radius));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const t = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / radius;
      if (t >= 1) continue;
      blend(d, (y * w + x) * 4, rgb, strength * Math.pow(1 - t, power));
    }
  }
}

// ------------------------------------------------------------------ layers

const LAYERS = {};

LAYERS.sky = (ctx, s) => {
  const stops = s.stops || [[0, 'background'], [0.65, { mix: ['background', 'accent', 0.12] }], [1, { mix: ['background', 'accent', 0.3] }]];
  const st = stops.map(([pos, c]) => ({ pos, color: ctx.col(c) }));
  R.fillRect(ctx.img, 0, 0, ctx.w, ctx.h, st[0].color);
  R.linearGradient(ctx.img, st, s.angle ?? 90);
  ctx.horizon = s.horizon ? ctx.col(s.horizon) : st[st.length - 1].color;
};

LAYERS.stars = (ctx, s, rnd) => {
  const { w, h, u } = ctx;
  const count = s.count ?? Math.round((w * h) / 5500);
  const [y0, y1] = s.region || [0, 0.65];
  const color = ctx.col(s.color ?? 'foreground');
  const minSize = (s.minSize ?? 0.5) * u, maxSize = (s.maxSize ?? 1.8) * u;
  for (let i = 0; i < count; i++) {
    const x = rnd() * w, t = Math.pow(rnd(), 1.2), y = (y0 + (y1 - y0) * t) * h;
    const mag = Math.pow(rnd(), 3);
    const fade = 1 - smooth(0.55, 1, t);
    const a = (0.25 + 0.75 * mag) * fade * (s.opacity ?? 1);
    const rad = minSize + mag * (maxSize - minSize);
    stamp(ctx, x, y, rad, color, a);
    if (mag > 0.8) {
      const len = rad * 5;
      thickLine(ctx, x - len, y, x + len, y, 0.8 * u, color, a * 0.25);
      thickLine(ctx, x, y - len, x, y + len, 0.8 * u, color, a * 0.25);
    }
  }
};

LAYERS.glow = (ctx, s) => {
  const r = (s.r ?? 0.2) * Math.min(ctx.w, ctx.h);
  glowAt(ctx, (s.x ?? 0.5) * ctx.w, (s.y ?? 0.4) * ctx.h, r, ctx.col(s.color ?? 'accent'), s.opacity ?? 0.3, s.power ?? 2.2);
};

function disc(kind) {
  return (ctx, s) => {
    const { w, h, img } = ctx;
    const cx = (s.x ?? 0.75) * w, cy = (s.y ?? 0.2) * h, r = (s.r ?? (kind === 'sun' ? 0.16 : 0.06)) * Math.min(w, h);
    const sun = kind === 'sun';
    const base = ctx.col(s.color ?? (sun ? 'ansi.yellow' : 'foreground'));
    const top = sun && !s.color ? ctx.col(s.top ?? 'ansi.yellow') : base;
    const bottom = sun ? ctx.col(s.bottom ?? { mix: ['accent', 'ansi.magenta', 0.35] }) : base;
    const glowRgb = ctx.col(s.glowColor ?? (sun ? { mix: [bottom, top, 0.5] } : base));
    const glowStrength = s.glow ?? (sun ? 0.55 : 0.25);
    if (glowStrength > 0) glowAt(ctx, cx, cy, r * (s.glowRadius ?? 3.2), glowRgb, glowStrength);
    const texture = s.texture ?? !sun;
    const stripes = s.stripes ?? false;
    const lut = [];
    for (let i = 0; i < 64; i++) lut.push(sun ? lerp3(top, bottom, i / 63) : base);
    const mare = R.fbm(ctx.seed + 4242, { octaves: 4 });
    const x0 = Math.max(0, Math.floor(cx - r - 2)), x1 = Math.min(w - 1, Math.ceil(cx + r + 2));
    const y0 = Math.max(0, Math.floor(cy - r - 2)), y1 = Math.min(h - 1, Math.ceil(cy + r + 2));
    const period = Math.max(2, r * 0.2);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        let cov = clamp(r - d + 0.5);
        if (cov <= 0) continue;
        if (stripes) {
          const t = (y - cy) / r;
          if (t > -0.05) {
            const gap = clamp((t + 0.05) * 0.85, 0, 0.8);
            const f = (((y - cy) / period) % 1 + 1) % 1;
            if (f < gap) cov *= clamp((gap - f) * period < 1 ? 1 - (gap - f) * period : 0);
          }
        }
        if (cov <= 0) continue;
        let rgb = lut[Math.round(clamp((y - (cy - r)) / (2 * r)) * 63)];
        if (texture) {
          const k = (0.94 + 0.06 * hash2(x * 3, y * 7)) * (0.84 + 0.16 * smooth(0.4, 0.7, mare(x / (r * 0.3), y / (r * 0.3))));
          rgb = [rgb[0] * k, rgb[1] * k, rgb[2] * k];
        }
        blend(img.data, (y * w + x) * 4, rgb, cov);
      }
    }
  };
}
LAYERS.moon = disc('moon');
LAYERS.sun = disc('sun');

LAYERS.haze = (ctx, s) => {
  const { w, h } = ctx;
  const bandH = Math.max(2, Math.round((s.height ?? 0.2) * h));
  const [r, g, b] = ctx.col(s.color ?? 'accent');
  const band = R.create(w, bandH);
  const o = s.opacity ?? 0.3;
  R.linearGradient(band, [[0, [r, g, b, 0]], [0.5, [r, g, b, 255 * o]], [1, [r, g, b, 0]]], 90);
  R.composite(ctx.img, band, { x: 0, y: Math.round((s.y ?? 0.6) * h - bandH / 2), mode: s.mode ?? 'normal' });
};

LAYERS.hills = (ctx, s, rnd, index) => {
  const { w, h, u, data: d } = ctx;
  const n = s.count ?? 1;
  const color = ctx.col(s.color ?? { mix: ['background', 'accent', 0.1] });
  const horizon = ctx.horizon || ctx.col('background');
  const fade = s.fade ?? (n > 1 ? 0.55 : 0);
  const shade = s.shade ?? 0.5;
  const dark = ctx.col(s.shadeColor ?? { dark: ['background', 0.4] });
  const base = (s.baseY ?? 0.68) * h, amp = (s.amp ?? 0.08) * h, spacing = (s.spacing ?? 0.05) * h;
  const scale = s.scale ?? 3;
  const lightK = s.light ?? 0;
  const rim = s.rim ? ctx.col(s.rim) : null;
  const litColor = ctx.col(s.litColor ?? { mix: ['foreground', 'accent', 0.3] });
  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 1; // 0 = far, 1 = near
    const noise = R.fbm(ctx.seed + 977 * (index + 1) + 131 * i, { octaves: s.octaves ?? 5, gain: s.gain ?? 0.5 });
    const crest = new Float32Array(w);
    if (s.points) {
      const P = s.points;
      for (let x = 0; x < w; x++) {
        const uu = x / (w - 1 || 1);
        let k = 0;
        while (k < P.length - 2 && uu > P[k + 1][0]) k++;
        const [u0, v0] = P[k], [u1, v1] = P[k + 1], f = clamp((uu - u0) / (u1 - u0 || 1));
        crest[x] = h * (v0 + (v1 - v0) * f * f * (3 - 2 * f) + (s.jitter ?? 0.004) * (noise(uu * 14, 2.3 + i) - 0.5));
      }
    } else {
      const baseY = base - (n - 1 - i) * spacing, a = amp * (0.55 + 0.45 * t);
      for (let x = 0; x < w; x++) {
        const v = clamp((noise((x / w) * scale + 13 * i, i * 3.7) - 0.5) * 1.8 + 0.5);
        const height = s.ridged ? (1 - Math.abs(2 * v - 1)) * 1.7 - 0.55 : (v - 0.5) * 2;
        crest[x] = Math.min(h - 2, baseY - a * height);
      }
    }
    const top = lerp3(color, horizon, (1 - t) * fade);
    const bottom = lerp3(top, dark, shade);
    const depth = 0.3 * h;
    for (let x = 0; x < w; x++) {
      const cy = crest[x];
      const slope = (crest[Math.min(w - 1, x + 12)] - crest[Math.max(0, x - 12)]) / 24;
      const lit = lightK ? clamp(-slope * 0.35, -1, 1) * lightK : 0;
      const yStart = Math.max(0, Math.floor(cy));
      for (let y = yStart; y < h; y++) {
        const cov = y === yStart ? clamp(yStart + 1 - cy) : 1;
        const dd = (y - cy) / depth;
        let rgb = lerp3(top, bottom, clamp(dd));
        if (lit) {
          const fall = Math.exp(-dd * 9);
          rgb = lit > 0 ? lerp3(rgb, litColor, lit * fall) : lerp3(rgb, dark, -lit * fall * 0.8);
        }
        if (rim && y - cy < 2 * u) rgb = lerp3(rgb, rim, (s.rimOpacity ?? 0.35) * (1 - (y - cy) / (2 * u)));
        blend(d, (y * w + x) * 4, rgb, cov);
      }
    }
    ctx.crest = crest;
  }
};

LAYERS.grid = (ctx, s) => {
  const { w, h, u, data: d } = ctx;
  const hy = (s.horizon ?? 0.62) * h;
  const color = ctx.col(s.color ?? 'accent');
  const floorTop = ctx.col(s.floor ?? { mix: ['background', color, 0.2] });
  const floorBottom = ctx.col(s.floorBottom ?? 'background');
  for (let y = Math.max(0, Math.floor(hy)); y < h; y++) {
    const rgb = lerp3(floorTop, floorBottom, Math.pow(clamp((y - hy) / (h - hy)), 0.7));
    for (let x = 0; x < w; x++) blend(d, (y * w + x) * 4, rgb, y === Math.floor(hy) ? clamp(Math.floor(hy) + 1 - hy) : 1);
  }
  const rows = s.rows ?? 14, cols = s.cols ?? 28, curve = s.curve ?? 2.2, cx = w / 2;
  const lines = (glow) => {
    for (let k = 1; k <= rows; k++) {
      const tk = Math.pow(k / rows, curve), y = hy + (h - hy) * tk;
      const wd = (0.8 + 2.4 * tk) * u;
      glow ? thickLine(ctx, 0, y, w, y, wd * 5, color, 0.1) : thickLine(ctx, 0, y, w, y, wd, color, 0.35 + 0.6 * tk);
    }
    for (let i = -cols / 2; i <= cols / 2; i++) {
      const xb = cx + i * ((w * (s.spread ?? 2.4)) / cols);
      glow ? thickLine(ctx, cx, hy, xb, h, 5 * u, color, 0.1) : thickLine(ctx, cx, hy, xb, h, 1.6 * u, color, 0.8);
    }
  };
  lines(true);
  lines(false);
  const hot = lerp3(color, [255, 255, 255], 0.45);
  thickLine(ctx, 0, hy, w, hy, 7 * u, color, 0.25);
  thickLine(ctx, 0, hy, w, hy, 1.8 * u, hot, 0.95);
};

LAYERS.waves = (ctx, s, rnd) => {
  const { w, h, u, data: d } = ctx;
  const y0 = (s.y ?? 0.62) * h, count = s.count ?? 14;
  const color = ctx.col(s.color ?? 'accent');
  const water = ctx.col(s.water ?? { mix: ['background', color, 0.18] });
  const deep = ctx.col(s.deep ?? 'background');
  for (let k = 0; k < count; k++) {
    const tk = (k + 1) / count;
    const yk = y0 + (h - y0) * Math.pow(tk, 1.5);
    const amp = (s.amp ?? 0.012) * h * (0.3 + tk * 1.5);
    const wl = (s.wavelength ?? 0.12) * w * (0.5 + tk);
    const ph = rnd() * 6.283, ph2 = rnd() * 6.283;
    const crest = (x) => yk + amp * (Math.sin((x / wl) * 6.283 + ph) + 0.5 * Math.sin((x / (wl * 0.43)) * 6.283 + ph2));
    const body = lerp3(deep, water, 0.35 + 0.65 * tk);
    for (let x = 0; x < w; x++) {
      const cy = crest(x), ys = Math.max(0, Math.floor(cy));
      for (let y = ys; y < h; y++) blend(d, (y * w + x) * 4, body, y === ys ? clamp(ys + 1 - cy) : 1);
    }
    const step = 4;
    for (let x = 0; x < w; x += step) thickLine(ctx, x, crest(x), x + step, crest(x + step), (0.8 + 1.8 * tk) * u, color, 0.25 + 0.55 * tk);
  }
};

LAYERS.fog = (ctx, s) => {
  const { w, h } = ctx;
  const gw = Math.max(32, Math.round(w / (s.cell ?? 6))), gh = Math.max(16, Math.round((gw * h) / w));
  const f = R.fbm(ctx.seed + 31337, { octaves: s.octaves ?? 4 });
  const scale = s.scale ?? 3, stretch = s.stretch ?? 1.6;
  const [r, g, b] = ctx.col(s.color ?? 'foreground');
  const opacity = s.opacity ?? 0.25;
  const small = R.create(gw, gh);
  const sd = small.data;
  const band = s.y0 !== undefined && s.y1 !== undefined;
  for (let y = 0; y < gh; y++) {
    const fy = (y + 0.5) / gh;
    const env = band ? Math.sin(Math.PI * clamp((fy - s.y0) / (s.y1 - s.y0))) : 1;
    for (let x = 0; x < gw; x++) {
      const n = f(((x / gw) * scale) / stretch, (fy * scale * h) / w);
      const a = smooth(s.lo ?? 0.35, s.hi ?? 0.8, n) * env * opacity;
      const o = (y * gw + x) * 4;
      sd[o] = r; sd[o + 1] = g; sd[o + 2] = b; sd[o + 3] = a * 255;
    }
  }
  R.composite(ctx.img, R.resize(small, w, h), { mode: s.mode ?? 'normal' });
};
LAYERS.noise = LAYERS.fog;

// Engraving: a wash under the light band, then hatch strokes below the crest of the last hills layer.
LAYERS.hatch = (ctx, s, rnd) => {
  const { w, h, u, K, data: d } = ctx;
  const crest = ctx.crest || Float32Array.from({ length: w }, () => (s.y ?? 0.6) * h);
  const lit = ctx.col(s.lit ?? 'accent');
  const ink = ctx.col(s.ink ?? 'ink');
  const bandCfg = s.band || [26, 34];
  const bandW = (x) => (bandCfg[0] + bandCfg[1] * (x / w)) * u;
  const clump = R.fbm(ctx.seed + 55, { octaves: 4 });
  const mot = R.fbm(ctx.seed + 56, { octaves: 4 });
  const dir = R.fbm(ctx.seed + 57, { octaves: 2 });
  const light = (x, y) => {
    const ry = crest[clamp(Math.floor(x), 0, w - 1)], uu = x / w;
    if (y < ry) return 0;
    const bw = bandW(x), off = (y - ry - 0.45 * bw) / bw;
    const band = Math.exp(-off * off * 1.6) * (0.62 + 0.38 * uu) * (0.4 + 0.8 * smooth(0.35, 0.7, clump(x / (70 * u), y / (22 * u))));
    const mottle = 0.16 * smooth(0.55, 0.85, mot(x / (160 * u), y / (60 * u)));
    return clamp((band + mottle * Math.exp(-(y - ry) / (260 * u))) * (s.strength ?? 1));
  };
  const wash = s.wash ?? 0.42;
  if (wash > 0) {
    for (let x = 0; x < w; x++) {
      const bw = bandW(x), yEnd = Math.min(h, Math.ceil(crest[x] + 5 * bw + 260 * u));
      for (let y = Math.max(0, Math.floor(crest[x])); y < yEnd; y++) {
        const L = light(x, y);
        if (L > 0.01) blend(d, (y * w + x) * 4, lit, wash * L);
      }
    }
  }
  const count = Math.round((s.count ?? 340000 * K * K) * (s.density ?? 1));
  for (let i = 0; i < count; i++) {
    const x = rnd() * w, xi = Math.floor(x), ry = crest[xi];
    const y = ry + rnd() * (h - ry);
    const dep = clamp((y - ry) / (h - ry));
    const len = (6 + 34 * Math.pow(dep, 1.2) + 8 * rnd()) * u;
    const leanV = 0.4 + 0.3 * (dir(x / (300 * u), y / (300 * u)) - 0.5) + (rnd() - 0.5) * 0.8, bend = (rnd() - 0.3) * 0.5;
    const pts = bez([x, y], [x + leanV * len * 0.3, y - len * 0.6], [x + (leanV + bend) * len, y - len * (1 - Math.abs(bend) * 0.4)], 4);
    const L = light(x, y), wd = (0.9 + 2.0 * dep) * u;
    if (L > 0.3) {
      const isInk = rnd() < 0.36;
      stroke(ctx, pts, wd * 1.2, wd * 0.3, isInk ? ink : lit, (0.55 + 0.4 * rnd()) * (isInk ? 1 : 0.55 + 0.6 * L));
    } else if (rnd() < L * 2.2 + 0.1 * (1 - dep) + 0.07) stroke(ctx, pts, wd * 0.8, wd * 0.2, lit, (0.3 + 0.55 * rnd()) * (0.45 + L));
    else stroke(ctx, pts, wd, wd * 0.25, ink, 0.5);
  }
  for (let x = 0; x < w; x += 1.3 * u) {                         // grass tips breaking the crest line
    const ry = crest[Math.floor(x)], len = (4 + 12 * rnd()) * u * (0.6 + 0.6 * (x / w));
    const lean = 0.35 + (rnd() - 0.5) * 0.5, L = light(x, ry + 3 * u);
    stroke(ctx, [[x, ry + 3 * u], [x + lean * len, ry + 3 * u - len]], 1.1 * u, 0.3 * u, lit, (0.35 + 0.5 * rnd()) * L);
  }
};

// Tall hooked foreground blades: dark with a lit edge.
LAYERS.blades = (ctx, s, rnd) => {
  const { w, h, u, K } = ctx;
  const lit = ctx.col(s.lit ?? 'accent');
  const ink = ctx.col(s.ink ?? 'ink');
  const top = s.top ?? 0.76;
  const clumps = Math.round((s.clumps ?? 150) * K * K * (s.density ?? 1));
  const pool = [];
  for (let i = 0; i < clumps; i++) {
    const cx = rnd() * w, cy = h * (top + (1 - top + 0.06) * Math.pow(rnd(), 0.55)), n = 4 + Math.floor(rnd() * 7);
    for (let j = 0; j < n; j++) pool.push([cx + (rnd() - 0.5) * 40 * u, cy + (rnd() - 0.5) * 16 * u]);
  }
  pool.sort((a, b) => a[1] - b[1]);
  for (const [x, y] of pool) {
    const dep = clamp((y - top * h) / ((1 - top) * h));
    const len = (14 + 160 * dep * dep) * u * (0.5 + 0.6 * rnd());
    const dirn = rnd() < 0.62 ? 1 : -1, wd = (1.5 + 9 * dep * dep) * u;
    const pts = bez([x, y], [x + dirn * len * 0.15, y - len * 1.05], [x + dirn * len * (0.55 + 0.3 * rnd()), y - len * (0.45 + 0.25 * rnd())], 10);
    stroke(ctx, pts, wd, wd * 0.25, ink, 0.95);
    const litA = (rnd() < 0.35 ? 0 : 0.3 + 0.55 * rnd()) * (0.35 + 0.65 * dep);
    stroke(ctx, pts.slice(1).map(([px, py]) => [px + dirn * 0.6 * wd, py - 0.4 * wd]), wd * 0.42, wd * 0.08, lit, litA * (0.5 + 0.5 * dep));
  }
};

LAYERS.grain = (ctx, s) => {
  const amount = s.amount ?? 6, d = ctx.data;
  for (let y = 0; y < ctx.h; y++) {
    for (let x = 0; x < ctx.w; x++) {
      const n = (hash2(x + 17, y + 91) - 0.5) * amount * 2, o = (y * ctx.w + x) * 4;
      d[o] += n; d[o + 1] += n; d[o + 2] += n;
    }
  }
};

// ------------------------------------------------------------------ presets

const presets = {
  eclipse: {
    description: 'Blood moon over a black sky and a hatched, red-lit hill with dark foreground blades (engraving look).',
    palette: {
      background: '#0B0909', foreground: '#D8D2CF', cursor: '#F2201C', accent: '#E0201E',
      ansi: { red: '#B3141B', yellow: '#C2924A', blue: '#5E7186', magenta: '#7E6A8F', cyan: '#6A8C8A', brightRed: '#E0201E' },
    },
    layers: [
      { type: 'sky', stops: [[0, { mix: ['background', '#000000', 0.7] }], [1, { mix: ['background', '#000000', 0.5] }]] },
      { type: 'glow', x: 0.76, y: 0.14, r: 0.3, color: 'ansi.red', opacity: 0.22 },
      { type: 'moon', x: 0.76, y: 0.14, r: 0.045, color: 'accent', glow: 0.3, glowRadius: 2.4 },
      { type: 'hills', points: [[0, 0.588], [0.12, 0.598], [0.27, 0.618], [0.45, 0.655], [0.66, 0.728], [0.83, 0.79], [1, 0.885]], color: 'ink', shade: 0, jitter: 0.004 },
      { type: 'hatch', wash: 0.42 },
      { type: 'blades', clumps: 150 },
      { type: 'grain', amount: 0.8 },
    ],
  },
  synthwave: {
    description: 'Striped sun over a neon perspective grid, with a starry violet sky and dark mountain silhouettes.',
    palette: {
      background: '#120B2E', foreground: '#F2E9FF', cursor: '#FF2E97', accent: '#FF2E97',
      ansi: { red: '#FF4D6D', yellow: '#FFD319', blue: '#4D7CFF', magenta: '#B967FF', cyan: '#00E5FF' },
    },
    layers: [
      { type: 'sky', stops: [[0, 'background'], [0.5, { mix: ['background', 'ansi.magenta', 0.3] }], [0.62, { mix: ['ansi.magenta', 'accent', 0.5] }]], horizon: { mix: ['ansi.magenta', 'accent', 0.5] } },
      { type: 'stars', region: [0, 0.55], count: 420 },
      { type: 'sun', x: 0.5, y: 0.47, r: 0.2, stripes: true, glow: 0.5, glowRadius: 2.6 },
      { type: 'hills', baseY: 0.62, amp: 0.08, scale: 4, ridged: true, color: { mix: ['background', 'ansi.magenta', 0.12] }, shade: 0.2, rim: 'ansi.cyan', fade: 0 },
      { type: 'grid', horizon: 0.62, color: 'accent' },
      { type: 'haze', y: 0.62, height: 0.18, color: 'accent', opacity: 0.35, mode: 'screen' },
      { type: 'grain', amount: 3 },
    ],
  },
  'nord-mountains': {
    description: 'Cold layered mountain ridges under a pale moon, with mist between the ranges.',
    palette: {
      background: '#2E3440', foreground: '#D8DEE9', cursor: '#88C0D0', accent: '#88C0D0',
      ansi: { red: '#BF616A', yellow: '#EBCB8B', blue: '#5E81AC', magenta: '#B48EAD', cyan: '#8FBCBB', green: '#A3BE8C', white: '#E5E9F0' },
    },
    layers: [
      { type: 'sky', stops: [[0, { dark: ['background', 0.25] }], [0.7, 'background'], [1, { mix: ['background', 'ansi.blue', 0.45] }]] },
      { type: 'stars', region: [0, 0.5], count: 260, opacity: 0.8 },
      { type: 'moon', x: 0.72, y: 0.2, r: 0.05, color: 'ansi.white', glow: 0.3, glowRadius: 3.5 },
      { type: 'hills', count: 4, baseY: 0.84, amp: 0.15, spacing: 0.075, scale: 2.2, ridged: true, color: { mix: ['background', 'ansi.blue', 0.1] }, shade: 0.6, fade: 0.9, light: 0.3, litColor: 'ansi.white', rim: { mix: ['ansi.white', 'ansi.blue', 0.3] }, rimOpacity: 0.18 },
      { type: 'fog', y0: 0.5, y1: 0.95, opacity: 0.22, color: { mix: ['ansi.white', 'ansi.blue', 0.5] }, scale: 2.5 },
      { type: 'grain', amount: 3 },
    ],
  },
  'night-ocean': {
    description: 'Moonlit sea: layered swells under a starry sky.',
    palette: {
      background: '#0B1220', foreground: '#D6E4F0', cursor: '#5CC8FF', accent: '#5CC8FF',
      ansi: { blue: '#3E7BD1', cyan: '#5CC8FF', white: '#EAF3FA', yellow: '#F2D58B', magenta: '#8F7BD6' },
    },
    layers: [
      { type: 'sky', stops: [[0, { dark: ['background', 0.3] }], [1, { mix: ['background', 'ansi.blue', 0.35] }]] },
      { type: 'stars', region: [0, 0.55], count: 300 },
      { type: 'moon', x: 0.68, y: 0.26, r: 0.06, color: 'ansi.white', glow: 0.35, glowRadius: 3.5 },
      { type: 'waves', y: 0.6, count: 16, color: 'ansi.cyan' },
      { type: 'grain', amount: 3 },
    ],
  },
  'minimal-gradient': {
    description: 'A soft diagonal gradient from the background toward the accent, with a faint mist and fine grain.',
    palette: {
      background: '#14161B', foreground: '#D5D9E0', cursor: '#7AA2F7', accent: '#7AA2F7',
      ansi: { magenta: '#BB9AF7', blue: '#7AA2F7' },
    },
    layers: [
      { type: 'sky', angle: 45, stops: [[0, { mix: ['background', 'accent', 0.1] }], [0.5, 'background'], [1, { mix: ['background', 'ansi.magenta', 0.3] }]] },
      { type: 'fog', opacity: 0.07, scale: 2, color: 'foreground' },
      { type: 'grain', amount: 3 },
    ],
  },
};

// ------------------------------------------------------------------ paint

function paint(opts = {}) {
  const preset = opts.preset ? presets[opts.preset] : null;
  if (opts.preset && !preset) throw new Error(`scene: unknown preset "${opts.preset}" (${Object.keys(presets).join(', ')})`);
  const width = Math.round(opts.width ?? 1280), height = Math.round(opts.height ?? 800);
  if (!(width >= 8 && height >= 8 && width * height <= 64e6)) throw new Error(`scene: invalid size ${width}x${height}`);
  const palette = opts.palette || (preset && preset.palette) || presets['minimal-gradient'].palette;
  const layers = opts.layers || (preset && preset.layers) || presets['minimal-gradient'].layers;
  const seed = seedInt(opts.seed ?? 1);
  const K = width / 2560;
  const img = R.create(width, height, [0, 0, 0, 255]);
  const ctx = {
    w: width, h: height, K, u: Math.max(0.45, K), seed, img, data: img.data,
    col: makeResolver(palette), horizon: null, crest: null,
  };
  R.fillRect(img, 0, 0, width, height, ctx.col('background'));
  layers.forEach((spec, i) => {
    const layer = typeof spec === 'string' ? { type: spec } : spec;
    const fn = LAYERS[layer.type];
    if (!fn) throw new Error(`scene: unknown layer type "${layer.type}" (${Object.keys(LAYERS).join(', ')})`);
    fn(ctx, layer, mulberry32(seed ^ Math.imul(i + 1, 0x9e3779b1) ^ hashStr(layer.type)), i);
  });
  // fixed final dither so smooth gradients do not band
  const d = img.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const n = (hash2(x, y) - 0.5) * 1.6, o = (y * width + x) * 4;
      d[o] += n; d[o + 1] += n; d[o + 2] += n; d[o + 3] = 255;
    }
  }
  return img;
}

module.exports = { paint, presets, layerTypes: Object.keys(LAYERS) };
