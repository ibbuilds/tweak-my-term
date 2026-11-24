# Moods: from words to a terminal

Users describe a feeling ("vaporwave", "cozy", "like paper"), not settings. This page
turns common aesthetic words into the visual facts a look is built from. It is a starting
point, not a recipe: confirm with real examples (`tmt inspire <words>`), then decide.

How to use it:
1. Find the entries the request touches (several can mix: "cozy cyberpunk").
2. Take the facts as defaults; the user's own words and image win over this page.
3. Check the **Ask** line: if the request leaves that choice open and it changes the
   result, it is one of your 3 questions, as options with a recommended default.
4. Search inspiration with the **Search** words, plus `--layout` if the user asked for
   an arrangement.

Columns: **Palette** (background, text, accents), **Art** (anchor and background subjects;
`tmt art scene` preset where one exists), **Type** (font family style), **Effects**,
**Prompt**, **Layout** (typical arrangement; the user's request decides).

---

### Vaporwave
- Palette: dark purple/indigo or deep teal bg (`#1a1028`-ish), pastel pink `#ff71ce`,
  cyan `#01cdfe`, mint `#05ffa1`, lavender `#b967ff`, peach/yellow `#fffb96`. Pastel, not
  neon-saturated; text a soft off-white/lavender.
- Art: sunset sun in horizontal bands, perspective grid floor, palm silhouettes, marble
  statue busts, Windows-95 windows, checkerboards, glitch. Preset `vaporwave`
  (or `synthwave` for the darker neon cousin).
- Type: retro mono with personality (e.g. VT323 / Monocraft for headers, a readable
  Nerd Font for text); never sacrifice readability.
- Effects: soft glow, subtle scanlines, slight chromatic shift in the art, not the text.
- Prompt: rounded pastel segments (powerline/pills) or Japanese/full-width accents.
- Layout: single window with art background, or a "desktop" of a few framed panes
  (fetch with a logo, clock, music).
- Ask: dark night (purple/teal) or bright daytime pastel (pink sky)? Art as background
  or kept to the side so text sits on a plain tile?
- Search: `vaporwave`, `synthwave`, `retrowave`, `outrun`, `pastel`.

### Synthwave / outrun / retrowave
- Palette: near-black navy/purple bg, hot magenta `#ff2a6d`, electric cyan `#05d9e8`,
  orange-yellow sun gradient. Saturated, high contrast accents.
- Art: chrome sunset, neon grid to the horizon, mountains in wireframe, night city.
  Preset `synthwave`.
- Effects: neon glow (bloom), scanlines in the art. Prompt: bold powerline, magenta/cyan.
- Ask: glow/shader allowed (terminal support differs)?
- Search: `synthwave`, `outrun`, `neon`.

### Cyberpunk / neon / hacker HUD
- Palette: black or very dark blue bg, neon yellow `#fcee0a`, cyan, magenta, red alerts;
  or tokyonight-style blues with magenta. Tokyo Night, Cyberdream, Synthwave '84 schemes.
- Art: night city, rain, kanji signage, HUD frames, circuit lines.
- Type: condensed/technical mono (Iosevka, JetBrains Mono); square brackets and boxes.
- Effects: glow, glitch (art only), sharp borders. Prompt: dense, info-rich, angular.
- Layout: dashboards: big editor/shell + system monitor (btop), clock, visualizer (cava),
  matrix rain (cmatrix/unimatrix), logs. Panes with titled borders.
- Ask: how busy (one window with a HUD prompt, or a full dashboard)?
- Search: `cyberpunk`, `neon`, `hud`, `dashboard` + `--layout dashboard`.

### Cozy / warm / comfy
- Palette: warm low-contrast dark (gruvbox, everforest, kanagawa, rose-pine), cream text,
  orange/amber accent, muted greens and reds.
- Art: rain on a window, a desk with a lamp, autumn forest, coffee, lofi room.
- Type: rounded or soft mono (Iosevka Comfy, Maple Mono, Victor Mono, Fira Code).
- Effects: none or very soft; slight transparency. Prompt: short, friendly icons.
- Layout: single window or a calm split; generous padding and line height.
- Ask: dark evening or light morning?
- Search: `cozy`, `gruvbox`, `everforest`, `autumn`, `lofi`.

### Paper / light / writer
- Palette: cream/ivory bg (`#f4ecd8`), ink text (`#3b3330`), dim graphite secondary, one
  muted accent (terracotta, ink blue, sepia). Few colors.
- Art: none, or a faint paper grain. Type: readable mono with a serif feel
  (IBM Plex Mono, iA Writer Mono, Courier Prime), larger size and line height.
- Effects: none; no transparency. Prompt: one line, minimal symbol.
- Layout: one calm window, wide padding, centered feel.
- Ask: pure white-ish or warm cream?
- Search: `paper`, `light`, `latte`, `solarized light`, `minimal`.

### Minimal / clean / calm
- Palette: 2-3 colors used with intent; low-contrast dark (nord, zenbones, kanagawa
  dragon, oxocarbon) or light. Accent used sparingly.
- Art: none or a very quiet gradient. Type: clean mono (JetBrains Mono, SF Mono, Berkeley-
  style alternatives that are free), regular weight.
- Effects: slight transparency/blur at most. Prompt: tiny (`❯`), transient prompt.
- Layout: single window or one split; no bars beyond what's needed.
- Ask: dark or light? Any split (e.g. logs)?
- Search: `minimal`, `clean`, `nord`, `monochrome`.

### Retro CRT (amber / green phosphor)
- Palette: black bg with one hue: amber `#ffb000` or green `#33ff66`; dimmer shades for
  secondary text; all 16 ANSI colors mapped to brightness steps of that hue.
- Art: none, or a dark vignette. Type: pixel or bitmap-like (VT323, Monocraft,
  Px437/"IBM VGA" style free fonts, Terminus).
- Effects: scanlines, glow, curvature: shaders where the terminal supports them
  (Windows Terminal `experimental.pixelShaderPath`, Ghostty `custom-shader`); otherwise
  cool-retro-term (Linux/macOS) as the closest. Keep text legible.
- Prompt: plain `>` or `C:\>`-style. Layout: single full window.
- Ask: amber or green? Switch terminal for real shader effects?
- Search: `crt`, `retro`, `amber`, `phosphor`, `coolretroterm`.

### Hacker / matrix
- Palette: black bg, green text family; red for errors. Art: matrix rain as a pane
  (cmatrix/unimatrix) rather than a background. Type: blocky mono.
- Layout: panes with live tools (btop, logs, rain). Search: `hacker`, `matrix`.

### Pastel / cute / kawaii
- Palette: catppuccin (latte/frappé/macchiato), rose-pine dawn/moon; pinks, lavender,
  mint, sky. Art: anime/illustration (user's own or generated soft shapes), clouds,
  stars. Type: rounded mono (Maple Mono, Comic Mono-style). Prompt: pills with icons.
- Ask: light or dark pastel?
- Search: `pastel`, `catppuccin`, `cute`, `pink`.

### Ice / nordic / ocean
- Palette: nord, iceberg; slate bg, frost blues, snow text. Art: mountains, fjords, sea
  at night. Preset `nord-mountains`, `night-ocean`. Type: clean mono. Effects: blur.
- Search: `nord`, `ocean`, `iceberg`, `blue`.

### Forest / nature / solarpunk
- Palette: everforest, kanagawa; moss greens, bark browns, sky accents. Art: forest,
  leaves, mountains, sunlit greenery (solarpunk: bright greens + gold + white).
- Search: `forest`, `everforest`, `nature`, `green`.

### Lofi
- Palette: dusk purples and warm oranges, desaturated. Art: anime-style room at dusk,
  rain, a desk lamp. Layout: shell + music player (ncmpcpp/cmus/spotify_player) +
  visualizer. Search: `lofi`, `cozy`, `music`.

### Dracula / gothic / noir
- Palette: Dracula (purple-gray bg, pink/purple/green accents) or noir (black, white,
  one red). Art: moon, cathedral, rain city in black and white. Type: sharp mono.
- Search: `dracula`, `dark`, `noir`, `monochrome`.

### Brutalist / monochrome
- Palette: pure black and white (or one accent), no gradients. Art: none. Type: heavy
  grotesque-like mono (e.g. JetBrains Mono ExtraBold for headers). Borders thick, square.
- Search: `monochrome`, `brutalist`, `minimal`.

### Y2K / frutiger / glossy
- Palette: aqua blues, silver, lime, glossy white; light or bright. Art: bubbles, chrome
  blobs, sky, glass. Effects: transparency, blur. Search: `y2k`, `aqua`, `glass`.

---

## When the words don't match anything here

Read the word as a place, era, film, game or object, and ask what it looks like: its
light (day/night), its two or three dominant colors, its texture (grain, glass, metal,
paper), its shapes (grid, curves, boxes). Search inspiration with those words. If you
still can't tell, show 3-6 differing examples and let the user point.
