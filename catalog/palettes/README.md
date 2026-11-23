# Palette sources

`sources.json` lists collections of terminal color schemes (verified 2026-11-23). Use them to
find a starting palette or to turn a scheme the user names ("Dracula", "gruvbox dark") into
the look-spec `palette` (`schemas/look.schema.json`): `background`, `foreground`, optional
`cursor`, `cursorText`, `selectionBackground`, `selectionForeground`, `accent`, `source`, and
`ansi` with all 16 of `black red green yellow blue magenta cyan white` plus the `bright*`
versions. Colors are `#RRGGBB` (or `#RRGGBBAA`).

Pick the source by format, not by taste: the Windows Terminal JSON in iTerm2-Color-Schemes
and the Gogh JSON are flat and need almost no mapping. Fetch with `curl`/`Invoke-WebRequest`
(URLs in `howToFetch`), never scrape a gallery site. Record the origin in `palette.source`
(for example `iterm2-color-schemes: Catppuccin Mocha`) and keep the license (see `license`
per source; iTerm2 has per-scheme licenses in `licenses.yml`).

## Mapping tables

### Windows Terminal JSON (iTerm2-Color-Schemes `windowsterminal/`)
| look spec | source key |
|---|---|
| background / foreground | `background` / `foreground` |
| cursor | `cursorColor` |
| selectionBackground | `selectionBackground` |
| ansi.black..white | `black red green yellow blue purple cyan white` (`purple` is magenta) |
| ansi.brightBlack..brightWhite | `brightBlack brightRed brightGreen brightYellow brightBlue brightPurple brightCyan brightWhite` |

Ghostty files (`ghostty/<Name>`) use `palette = N=#hex` for N 0..15 in ANSI order plus
`background`, `foreground`, `cursor-color`, `cursor-text`, `selection-background`,
`selection-foreground`, which also give `cursorText` and `selectionForeground`.

### Gogh (`color_01..color_16`) and iTerm2 `yaml/`
`color_01..color_08` = black, red, green, yellow, blue, magenta, cyan, white;
`color_09..color_16` = the bright versions in the same order. `background`, `foreground`,
`cursor` map directly. Gogh has no selection color: derive it (see below). iTerm2 `yaml/`
files also carry `cursor_text`, `selection`, `selection_text`.

### kitty `.conf`
`color0..color15` are the ANSI index; `background`, `foreground`, `cursor`,
`selection_background`, `selection_foreground`, `cursor_text_color`.

### Alacritty TOML
`[colors.primary] background/foreground`, `[colors.normal]` and `[colors.bright]` with
`black red green yellow blue magenta cyan white`, optional `[colors.cursor] cursor/text`,
`[colors.selection] background/text`.

### Catppuccin `palette.json`
For a flavor `f` in `latte frappe macchiato mocha`: `ansi.<name>` = `f.ansiColors.<name>.normal.hex`,
`ansi.bright<Name>` = `f.ansiColors.<name>.bright.hex`. Terminal convention (matches the
iTerm2 port): `background` = `colors.base`, `foreground` = `colors.text`, `cursor` =
`colors.rosewater`, `selectionBackground` = `colors.surface2`. `accent` = any of the accent
colors (`mauve`, `blue`, ...).

### tinted-theming base16 (`palette.base00..base0F`)
Base16 has no ANSI slots. The styling guideline's terminal column (tinted-theming/home
`styling.md`) gives:

| look spec | base16 | look spec | base16 |
|---|---|---|---|
| background | base00 | foreground, cursor | base05 |
| selectionBackground | base02 | ansi.black | base00 |
| ansi.red, brightRed | base08 | ansi.green, brightGreen | base0B |
| ansi.yellow, brightYellow | base0A | ansi.blue, brightBlue | base0D |
| ansi.magenta, brightMagenta | base0E | ansi.cyan, brightCyan | base0C |
| ansi.white | base05 | ansi.brightBlack | base03 |
| ansi.brightWhite | base07 | accent (optional) | base09 or base0D |

Bright accents are the same as the normal accents, which looks flat. Improve it by lightening
each bright accent about 8 to 12 percent in OKLab lightness (never change hue), or use the
base24 variant of the same theme when it exists. Light schemes (`variant: light`) run
base00..base07 from light to dark; the table still applies because the roles do, but check
contrast (below).

### tinted-theming base24 (`palette.base00..base17`)
Same as base16 for `base00..base0F`, plus true brights: `brightRed` = base12, `brightYellow`
= base13, `brightGreen` = base14, `brightCyan` = base15, `brightBlue` = base16,
`brightMagenta` = base17. Verified against the Dracula base24 scheme (base12 `#ff6e6e` is its
bright red).

## After mapping

1. Fill what the source lacks: `cursor` = `foreground`; `cursorText` = `background`;
   `selectionBackground` = the color halfway between `background` and `foreground` at about
   20 to 30 percent (blend toward `foreground` for dark themes, toward `black` for light),
   or `ansi.brightBlack` if that already reads well; `selectionForeground` only if the source
   sets one.
2. Check contrast with the kit before using it. Minimums that keep a terminal readable:
   `foreground` on `background` at least 7:1 (WCAG AAA body text), every `ansi.*` on
   `background` at least 4.5:1 for text colors, `ansi.brightBlack` at least 3:1 (it is the
   color of comments, suggestions and dim hints; many schemes fail here), `ansi.black` on
   `background` is meant to be nearly invisible: do not use it for text, see below.
3. `ansi.black` and `ansi.white` are the common failures. In dark schemes `black` often equals
   or sits next to `background`, so programs that print it (some `ls` and git colors) vanish.
   `white` is not `brightWhite`. Fix by shifting lightness only, keep hue (the kit `contrast`
   command does this).
4. Do not trust the scheme's name. Light/dark comes from `background` luminance, not the
   `variant` field alone.
5. Keep the licence: copy colors only from entries whose licence permits it, and put the
   source name and URL in `palette.source` and `anchor.source`/preset README.

## Mapping a palette into tool themes

Tool recipes in this catalog use tokens such as `{palette.background}` and
`{palette.ansi.red}`. Substitute the hex from the mapped palette. Three kinds of themes exist:
- ANSI-following (bat `ansi`, delta `syntax-theme = ansi`, fzf `--color=base16`, eza default):
  nothing to convert, the terminal palette does it. Best for portability.
- Hex-based (fzf `--color=...`, lazygit, yazi, btop, eza `theme.yml`, bat `.tmTheme`):
  substitute tokens, one file per tool.
- Per-scheme ports that already exist (catppuccin/<app>, eza-themes, yazi-rs/flavors,
  btop themes): use them when the user picks exactly that scheme, they are hand-tuned.
