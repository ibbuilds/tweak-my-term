---
capability: palette
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://man.archlinux.org/man/foot.ini.5, https://codeberg.org/dnkl/foot/raw/branch/master/foot.ini
---
# Palette in foot
Colors live in `[colors-dark]` (and optionally `[colors-light]`) as bare `RRGGBB` hex, no `#`. The ANSI colors are `regular0`-`regular7` and `bright0`-`bright7`.
## Config
```ini
[colors-dark]
background={palette.background}
foreground={palette.foreground}
cursor={palette.cursorText} {palette.cursor}
selection-foreground={palette.selectionForeground}
selection-background={palette.selectionBackground}
regular0={palette.ansi.black}
regular1={palette.ansi.red}
regular2={palette.ansi.green}
regular3={palette.ansi.yellow}
regular4={palette.ansi.blue}
regular5={palette.ansi.magenta}
regular6={palette.ansi.cyan}
regular7={palette.ansi.white}
bright0={palette.ansi.brightBlack}
bright1={palette.ansi.brightRed}
bright2={palette.ansi.brightGreen}
bright3={palette.ansi.brightYellow}
bright4={palette.ansi.brightBlue}
bright5={palette.ansi.brightMagenta}
bright6={palette.ansi.brightCyan}
bright7={palette.ansi.brightWhite}
```
## Notes
- Strip the leading `#` from every look hex value. `cursor` takes two colors: text color first, then cursor color ("foreground (text) and background (cursor)"); default is the inverse of foreground/background.
- `selection-*` default to the inverse of foreground/background. Other color keys: `urls`, `jump-labels`, `scrollback-indicator`, `search-box-match`, `search-box-no-match`, `flash`, `dim0`-`dim7`, and 256-color entries `16`-`255`.
- `[colors-dark]` / `[colors-light]` replaced `[colors]` / `[colors2]` in 1.26.0, and the old names were removed in 1.28.0. For foot older than 1.26 write `[colors]` instead.
- `initial-color-theme=dark|light` (main section) selects which section is active at start; switch at runtime with bindings or SIGUSR1/SIGUSR2.
- `bold-text-in-bright=no` is the default; set `palette-based` to brighten only the 8 regular colors.
