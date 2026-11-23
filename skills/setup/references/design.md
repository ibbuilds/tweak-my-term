# What makes a terminal gorgeous

Distilled from looking at about 60 r/unixporn screenshots, judging the terminal window
inside each desktop: dense/tiling, image-led/retro, and minimal/type-led. Numbers were
read off screenshots, so treat them as ranges, not specs. Use this guide to judge
inspiration, to make design choices, and as the polish checklist. It describes qualities,
not a look: every terminal you build should still be different.

## The difference in one paragraph

A theme swaps 16 ANSI colors. A gorgeous terminal also decides the surface (bg tone and
how it meets the desktop or image), the space (padding, window size, gaps), the type
(font, size, line height), the prompt, and where the one accent goes. Everything on
screen comes from one small palette, there is deliberate empty space, and text is easy to
read everywhere. The default look shows all 16 colors at full saturation, text touching
the window edge, a three-line prompt, and a picture fighting the text.

## Palette discipline

- **2-4 colors carry weight**: a background, a foreground, a dim tone, one accent. A second
  hue appears only in small doses (syntax, fetch labels, a chip), at pastel saturation.
- **One accent, reused in 3-4 places**: prompt glyph or first segment, cursor, selection or
  active tab/chip, focus border. The same hex everywhere, not three similar ones.
- **Background is a tinted near-black, never #000**: neutral #101010-#141414, or a tint from
  the palette's family (#14131f violet, #2e3440 slate). Light looks use warm cream
  (~#faf3eb), never #fff, with a muted dark fg (plum-grey, not black).
- **Foreground is soft**: off-white #c8c8c8-#dcdcdc (or warm #e0d6c2), never pure white.
  Secondary text is clearly dimmer (~40-50% luminance). "Dim label, bright value" is the
  recurring structure (`os  Arch Linux`).
- **Derive from the anchor**: with an image, the accent comes from the image's dominant hue
  and bg/border/prompt stay in that family (`tmt art palette` does this). Without one, the bg
  hue matches the desktop or contrasts with it cleanly (dark card on a flat light desktop).
- **ANSI bright row tamed**: no pure #ff0000/#00ff00. Saturated primaries on a pastel scheme
  or a light background are the most common palette mistake.
- **One scheme across every tool**: prompt, editor, fetch, btop/htop, fzf, multiplexer bar,
  syntax highlighting. One off-scheme app breaks the whole picture.
- **Comments and dim text still pass contrast** (the `tmt art contrast` report). Grey-on-grey
  without a bright anchor reads as washed out.

## Space and layout

- **Padding**: 2-3 cells horizontal (~16-24 px), about 1 line vertical. Zero padding (text
  touching the edge) is the single most common thing that makes a good palette look
  cheap. Tight 1-cell padding works only with a visible border.
- **A centered text column** (wide side margins, ~10 cells) reads as the most refined
  single-window look; use it when the user wants calm or focus.
- **Window sized to content** for minimal looks (25-60% of the screen), with real empty
  space around it. Full-bleed is fine for work setups, but then padding matters more.
- **Splits**: 2-4 big panes (50/50, 60/40, one big plus two stacked). Around 6 panes it
  becomes a wall. One job per pane.
- **One gap value everywhere** (8-20 px, 12-16 is the sweet spot), outer margin equal to the
  gap. Inconsistent gaps read as sloppy before anything else is noticed.
- **Corners**: 8-14 px rounded with a soft shadow, or square with a deliberate 1-2 px flat
  border. Never mixed in one setup.
- **Borders**: same width everywhere; only color signals focus. Inactive borders 10-15%
  lighter than the bg, the active one in the accent.
- **All panes share one bg** (at most 5-8% lightness apart). A pure-black pane beside tinted
  ones, or one light window among dark ones, is a visible mistake.

## Type

- Monospace with open, even rhythm, regular weight for body text (Nerd Font variant when
  the prompt or bar uses icons). Bold only for emphasis.
- 11-14 pt at 100% scale (larger on HiDPI). Density comes from more lines, not smaller type.
- **Line height 1.2-1.3** (up to 1.4 for a calm single window). 1.0 looks flat, especially
  over images.

## Prompt and chrome

- One line, two at most. One accent glyph (`❯`, `>`, `->`), a dim path, optional git status
  (right-aligned works well). Hide `user@host` or dim it.
- At most one powerline chip or segment in the accent; "statusline soup" (many colored
  segments) is the dense-setup failure.
- Minimal chrome: no scrollbar, no title bar where the terminal allows it. A tab or
  multiplexer strip is one thin flat line with 2-4 labeled chips, the active one in the
  accent. A status bar, if any, is 24-32 px, flat, active workspace as a pill.

## Images and composition

- **Art and text in separate zones.** The subject sits in the left or right third, or
  lower; text goes over the calm area (sky, flat tone, empty space). Never put the
  subject's face or a contrast hotspot under body text. Move or crop the image before
  shading it (`tmt art treat --align`, `--fit`).
- **Readability decides the treatment, not habit.** `tmt art treat --for-text look.json`
  reads the composition: untouched when text already passes, a local shade where only
  part of the image fights the text, an even veil only when most of it does. Busy,
  detailed art behind body text needs ~85%+ effective opacity (or ~75% with blur); a flat
  or dark, low-detail image can show through much more.
- **Opaque dark box beside the subject** is the most reliable image-led layout; a ghosted
  image (10-15% visible) through the terminal works when the image has big flat tones.
- **Retro/CRT feel lives in the art, not the text.** Scanline or grid wallpaper with clean
  monospace beats scanlines or glow over the text, which cut legibility.
- **Fetch logo / sprite**: height equal to the info block, 1-2 flat palette colors (never
  the default rainbow), flush to the left padding, info top-aligned beside it. A giant
  logo dominating the window is a mistake.
- **Monochrome focus** (art and terminal in one tint: teal, orange, black-and-white) is
  the easiest way to make an image setup cohere.

## Common mistakes (reject or fix these)

- Text touching the window edge; padding under 1 cell without a border.
- Translucent terminal over busy art, no blur, ~50% opacity: the picture fights the text.
- Dim labels or comments over a bright or colorful part of the image.
- The terminal covering the image's subject.
- Default rainbow fetch logo, all 16 ANSI colors shouting, raw bright swatch row.
- Several accents (red, pink, orange borders) unrelated to the palette.
- Pure #000 pane among tinted ones; one bright window among dark ones.
- Widget overload: cmatrix, cava, clocks, 6+ panes with no single job each.
- Inconsistent gaps, mixed corner styles, no visible focus.
- Tiny fonts to fit more; line height 1.0.

## Polish checklist

Look at the screenshot (`tmt shot`) next to the chosen inspiration and answer each line;
any "no" is a fix:

1. Can you name the 2-4 colors carrying weight and the one accent? Is the accent the same
   hex in prompt, cursor, selection and focus?
2. Is there at least 2 cells of padding on every side, and do all gaps match?
3. Is body text, dim text and every ANSI color readable everywhere it can appear (contrast
   report and the zone-aware image row pass)?
4. Does the image's subject sit outside the text area, and was shading applied only where
   needed?
5. Is the prompt one or two lines with one accent glyph?
6. Do every tool on screen (editor, fetch, monitor, bar) use the same scheme?
7. Line height 1.2-1.3, a font size that reads without leaning in?
8. Is there deliberate empty space, and is nothing on screen without a job?
9. Side by side with the inspiration: what does it do better, and is that fixable here?

## Exemplars (links only; open them to see the point)

Dense and tiling:
- [yabai, rounded corners](https://www.reddit.com/r/unixporn/comments/1q4mlpg/yabai_apple_aint_forcing_me_to_have_rounded/): one gap, one radius, focus by color only.
- [Niri Rhodium](https://www.reddit.com/r/unixporn/comments/1m54iq5/niri_rhodium_an_elegant_hypermodular_nixos_system/): many tools, one scheme.
- [Hyprland, simple and productive](https://www.reddit.com/r/unixporn/comments/1l858m2/hyprland_simple_and_productive/): 2-3 big panes, quiet wallpaper.
- [yabai, first macOS rice](https://www.reddit.com/r/unixporn/comments/1frcfxg/yabai_first_macos_rice/): tiling look on macOS.
- [bspwm, life in the forest](https://www.reddit.com/r/unixporn/comments/i901nk/bspwm_life_in_the_forest/): palette from a nature wallpaper.
- [Sway OneDark](https://www.reddit.com/r/unixporn/comments/uhd2wz/sway_look_at_this_onedark_beauty/) and [SwayWM](https://www.reddit.com/r/unixporn/comments/1w6dxbu/swaywm_still_the_best_wayland_compositor_for_me/): consistent borders and bar.
- [Openbox Nord](https://www.reddit.com/r/unixporn/comments/s2u2pv/openbox_nordy_feeling_for_the_cold_winter/): floating windows, calm.
- [COSMIC, terminal-centric](https://www.reddit.com/r/unixporn/comments/1ow2nap/cosmic_clean_and_terminal_centric_setup_after/): the terminal as the whole desktop.
- [i3 + zellij](https://www.reddit.com/r/unixporn/comments/1hyr9jk/i3_u_know_ure_on_my_mind/): good layout; the translucency is the part not to copy.

Image-led and retro:
- [Hyprland, anime sky + cava](https://www.reddit.com/r/unixporn/comments/18ev134/hyprland_flashy_cava_background_first_time_using/): palette from the sky, logo sized to the fetch block.
- [yabai, red sun](https://www.reddit.com/r/unixporn/comments/ry5hfg/yabai_i_really_love_this_background_image/): opaque dark windows beside a loud subject.
- [Clean Outrun](https://www.reddit.com/r/unixporn/comments/eeh4i1/xfce_clean_outrun/): retro in the wallpaper, minimal dark panels.
- [Retro Neon](https://www.reddit.com/r/unixporn/comments/arc2su/i3wm_retro_neon/): one cyan accent in border, prompt and selection.
- [PokéCRT](https://www.reddit.com/r/unixporn/comments/1x1xeq8/oc_pokécrt_a_little_pokémon_adventure_in_my/): sprite logo placement (its dim labels fail over the gradient).
- [vim + cute anime](https://www.reddit.com/r/unixporn/comments/f5ok38/vim_node_cute_anime/): window between the subjects, syntax colors from the art.
- [Pixel City](https://www.reddit.com/r/unixporn/comments/fewrfe/i3gaps_pixel_city/): pixel art with a clean near-black terminal.
- [bspwm molecule](https://www.reddit.com/r/unixporn/comments/u1axux/bspwm_hmm/): monochrome accent discipline.
- [aesthetic cyberpunk](https://www.reddit.com/r/unixporn/comments/lkrffb/i3gaps_your_generic/): one pane works, the translucent one over neon doesn't.

Minimal and type-led:
- [bspwm, clean and minimal](https://www.reddit.com/r/unixporn/comments/110lnn4/bspwm_clean_and_minimal/): dark card on a flat light desktop, dim label/bright value.
- [yabai Pink](https://www.reddit.com/r/unixporn/comments/kssnqs/yabai_pink/): centered text column, pastel syntax, two-chip tmux strip.
- [bspwm Nord](https://www.reddit.com/r/unixporn/comments/plf3z1/bspwm_tried_to_rice_with_the_nord_theme/): terminal and desktop share a hue.
- [sway, simple rice](https://www.reddit.com/r/unixporn/comments/1m6ce66/sway_simple_rice/): palette from a photo, flat square borders.
- [Hyprland Mauve](https://www.reddit.com/r/unixporn/comments/10g2do6/hyprland_mauve/): tinted near-black, one lavender accent.
- [bspwm emacs, light](https://www.reddit.com/r/unixporn/comments/lktlob/bspwm_emacs/): light done right.
- [Sør-Helgeland](https://www.reddit.com/r/unixporn/comments/nbanhk/bspwm_sørhelgeland/): one powerline chip, wallpaper-derived palette.
- [dwm monochrome + blur](https://www.reddit.com/r/unixporn/comments/p6xes8/dwm_monochrome_and_blur/): translucency that works (dark, low-detail photo).
- [aerospace + fastfetch, macOS](https://www.reddit.com/r/unixporn/comments/1sggz7z/aerospace_my_first_rice_with_blahaj_fastfetch/): surface matched to wallpaper; padding too tight.

These are references for qualities, not looks to reproduce. Find fresh examples for each
user with `tmt inspire`; these are here so you know what to look for.
