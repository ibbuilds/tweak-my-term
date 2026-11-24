---
capability: theme
tool: cava
os: windows, macos, linux
verified: 2026-11-23 (docs: example_files/config of cava master (1.0.0); not run)
sources: https://raw.githubusercontent.com/karlstav/cava/master/example_files/config, https://github.com/karlstav/cava#configuration
---
# Color cava from the look-spec palette

Colors live in the `[color]` section of the config (hex in single quotes). `gradient_color_1` is the bottom of the bars and the highest number the top; up to 8 stops. A horizontal gradient colors bars left to right, one color per bar. Gradient colors must be hex; `background` must then be hex too, or left unset to keep the terminal background.

## Config
Vertical gradient from the look's cool accent at the base to a warm peak, with the terminal background left alone:
```
[color]
background = default
gradient = 1
gradient_color_1 = '{palette.ansi.blue}'
gradient_color_2 = '{palette.ansi.blue}'
gradient_color_3 = '{palette.ansi.cyan}'
gradient_color_4 = '{palette.ansi.cyan}'
gradient_color_5 = '{palette.ansi.green}'
gradient_color_6 = '{palette.ansi.yellow}'
gradient_color_7 = '{palette.ansi.brightYellow}'
gradient_color_8 = '{palette.ansi.red}'
```
Use fewer distinct stops for muted palettes: repeat a stop rather than adding a hue. A single accent instead of a gradient:
```
[color]
gradient = 0
foreground = '{palette.accent}'
background = default
```
`foreground` and `background` also take one of: black, blue, cyan, green, magenta, red, white, yellow (these follow the terminal palette, no hex needed).

Left-to-right color per bar (needs the `noncurses` output, which is the default):
```
horizontal_gradient = 1
horizontal_gradient_color_1 = '{palette.ansi.magenta}'
horizontal_gradient_color_2 = '{palette.ansi.blue}'
horizontal_gradient_color_3 = '{palette.ansi.cyan}'
```
With both enabled, `blend_direction = 'up'` blends the vertical gradient in from the bottom.

## Notes
- Reload without restarting: press `r` (all) or `c` (colors only) in cava, or `pkill -USR2 cava` on Linux and macOS. `live-config = 1` in `[general]` reloads when the file changes.
- A separate theme file can be used instead: `theme = 'name'` in `[color]` loads colors from `themes/name` in the config folder.
- Some older versions needed `gradient_count = N` alongside the gradient colors; the current example config has no such key. If a gradient shows too few colors on an old build, add it.
- Contrast: the lowest stops sit against `{palette.background}` for most of the time; check them there, not the top ones.
