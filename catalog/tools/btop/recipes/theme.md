---
capability: theme
tool: btop
os: windows, macos, linux
verified: 2026-11-23 (docs; key names read from the upstream dracula.theme; btop not run on the verification machine)
sources: https://github.com/aristocratos/btop#themes, https://github.com/aristocratos/btop/blob/main/themes/dracula.theme, https://github.com/aristocratos/btop4win#themes
---
# Theme btop from the look-spec palette

A theme is a `<name>.theme` file with `theme[key]="#rrggbb"` lines. The user themes folder is `$XDG_CONFIG_HOME/btop/themes` or `~/.config/btop/themes` (Linux/macOS); on Windows btop4win reads `themes/` next to `btop4win.exe`. Select it with `color_theme` in `btop.conf`. Gradients use `*_start`, `*_mid`, `*_end` triplets.

## Config
File `themes/tmt.theme` (map tokens; an empty `main_bg` keeps the terminal background):
```
theme[main_bg]="{palette.background}"
theme[main_fg]="{palette.foreground}"
theme[title]="{palette.foreground}"
theme[hi_fg]="{palette.ansi.blue}"
theme[selected_bg]="{palette.selectionBackground}"
theme[selected_fg]="{palette.ansi.brightWhite}"
theme[inactive_fg]="{palette.ansi.brightBlack}"
theme[graph_text]="{palette.foreground}"
theme[meter_bg]="{palette.selectionBackground}"
theme[proc_misc]="{palette.ansi.magenta}"
theme[cpu_box]="{palette.ansi.magenta}"
theme[mem_box]="{palette.ansi.green}"
theme[net_box]="{palette.ansi.red}"
theme[proc_box]="{palette.ansi.cyan}"
theme[div_line]="{palette.ansi.brightBlack}"
theme[temp_start]="{palette.ansi.blue}"
theme[temp_mid]="{palette.ansi.yellow}"
theme[temp_end]="{palette.ansi.red}"
theme[cpu_start]="{palette.ansi.green}"
theme[cpu_mid]="{palette.ansi.yellow}"
theme[cpu_end]="{palette.ansi.red}"
theme[free_start]="{palette.ansi.green}"
theme[free_mid]="{palette.ansi.brightGreen}"
theme[free_end]="{palette.ansi.brightGreen}"
theme[cached_start]="{palette.ansi.blue}"
theme[cached_mid]="{palette.ansi.cyan}"
theme[cached_end]="{palette.ansi.brightCyan}"
theme[available_start]="{palette.ansi.yellow}"
theme[available_mid]="{palette.ansi.brightYellow}"
theme[available_end]="{palette.ansi.brightYellow}"
theme[used_start]="{palette.ansi.green}"
theme[used_mid]="{palette.ansi.yellow}"
theme[used_end]="{palette.ansi.red}"
theme[download_start]="{palette.ansi.blue}"
theme[download_mid]="{palette.ansi.cyan}"
theme[download_end]="{palette.ansi.brightCyan}"
theme[upload_start]="{palette.ansi.magenta}"
theme[upload_mid]="{palette.ansi.brightMagenta}"
theme[upload_end]="{palette.ansi.red}"
theme[process_start]="{palette.ansi.green}"
theme[process_mid]="{palette.ansi.yellow}"
theme[process_end]="{palette.ansi.red}"
```
For gradients that read well, make `*_mid` the visual midpoint of start and end rather than a third hue when the palette is muted.
Select it:
```
# btop.conf
color_theme = "tmt"
theme_background = true     # false keeps the terminal background / transparency
truecolor = true
```
Built-in names: `Default` and `TTY`; the upstream repo has more (https://github.com/aristocratos/btop/tree/main/themes), copy any into the themes folder. Custom location: `btop --themes-dir <dir>` (takes priority).
Newer theme attributes for process pausing/following exist and are missing from most themes (README); unset keys fall back to defaults.

## Notes
- Verified from the upstream `dracula.theme`: the key set above (box, graph and gradient keys).
- Terminals without truecolor: set `truecolor = false` (24-bit converted to the 256-color cube); `force_tty = true` forces 16 colors and the TTY theme.
- `color_theme` takes the theme name as listed in the in-app Options > Color theme menu; confirm the new theme shows up there.
- `theme_background = false` is the setting for transparent or image-backed terminals; `main_bg` can also be left `""`.
