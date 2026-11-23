---
capability: palette
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/, https://sw.kovidgoyal.net/kitty/kittens/themes/
---
# Palette in kitty
Set `foreground`, `background`, `cursor`, selection colors and `color0` to `color15` in `kitty.conf`. Colors are `#RRGGBB`.
## Config
```
foreground {palette.foreground}
background {palette.background}
cursor {palette.cursor}
cursor_text_color {palette.cursorText}
selection_foreground {palette.selectionForeground}
selection_background {palette.selectionBackground}
color0 {palette.ansi.black}
color1 {palette.ansi.red}
color2 {palette.ansi.green}
color3 {palette.ansi.yellow}
color4 {palette.ansi.blue}
color5 {palette.ansi.magenta}
color6 {palette.ansi.cyan}
color7 {palette.ansi.white}
color8 {palette.ansi.brightBlack}
color9 {palette.ansi.brightRed}
color10 {palette.ansi.brightGreen}
color11 {palette.ansi.brightYellow}
color12 {palette.ansi.brightBlue}
color13 {palette.ansi.brightMagenta}
color14 {palette.ansi.brightCyan}
color15 {palette.ansi.brightWhite}
```
## Notes
- Defaults: foreground `#dddddd`, background `#000000`, cursor `#cccccc`, selection_foreground `#000000`, selection_background `#fffacd`. `selection_*` accept `none`; `cursor none` gives a reverse-video cursor.
- `cursor_text_color` exists in kitty but was not in the config excerpt read; verify with `kitty +runpy 'from kitty.config import *; print(commented_out_default_config())'`.
- Cleanest agent approach: put the colors in their own file `{xdg-config}/kitty/theme.conf` and add `include theme.conf` to `kitty.conf` (`include` paths resolve relative to the including file). `kitten themes` writes `current-theme.conf` and edits `kitty.conf` itself, commenting out existing color lines; avoid mixing both.
- Theme override file for a built-in theme name: `{xdg-config}/kitty/themes/<Theme Name>.conf`, then run `kitten themes --reload-in=all "<Theme Name>"`.
