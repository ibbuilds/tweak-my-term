---
capability: palette
tool: alacritty
os: windows, macos, linux
verified: 2026-11-23 (docs, alacritty 0.17.0)
sources: https://alacritty.org/config-alacritty.html
---
# Palette in Alacritty
Colors live in `[colors.*]` tables of `alacritty.toml` (TOML since 0.13). Values are `"#RRGGBB"` strings.

## Config
```toml
[colors.primary]
background = "{palette.background}"
foreground = "{palette.foreground}"

[colors.cursor]
text = "{palette.cursorText}"
cursor = "{palette.cursor}"

[colors.selection]
text = "{palette.selectionForeground}"
background = "{palette.selectionBackground}"

[colors.normal]
black = "{palette.ansi.black}"
red = "{palette.ansi.red}"
green = "{palette.ansi.green}"
yellow = "{palette.ansi.yellow}"
blue = "{palette.ansi.blue}"
magenta = "{palette.ansi.magenta}"
cyan = "{palette.ansi.cyan}"
white = "{palette.ansi.white}"

[colors.bright]
black = "{palette.ansi.brightBlack}"
red = "{palette.ansi.brightRed}"
green = "{palette.ansi.brightGreen}"
yellow = "{palette.ansi.brightYellow}"
blue = "{palette.ansi.brightBlue}"
magenta = "{palette.ansi.brightMagenta}"
cyan = "{palette.ansi.brightCyan}"
white = "{palette.ansi.brightWhite}"
```

## Notes
- If the look spec has no cursor/selection tokens, omit those tables; defaults are `CellBackground`/`CellForeground` (inverse video). `text`/`cursor`/`background` also accept `"CellForeground"` and `"CellBackground"`.
- Colors must be `#RRGGBB`; 8-digit alpha hex is not part of the documented format. Window translucency is `window.opacity`.
- Optional extras: `[colors.dim]` (auto-derived when unset), `[colors.search]`, `[colors.hints]`, `[colors.footer_bar]`, `[colors.line_indicator]`, `indexed_colors` for 16-255.
- `draw_bold_text_with_bright_colors` defaults to false (bold stays in the base color); set `[colors] draw_bold_text_with_bright_colors = true` for the old behavior.
- `[colors] transparent_background_colors = true` applies `window.opacity` to every cell background, not only the default; leave false to keep colored cells readable.
- Themes can be split into files and loaded with `[general] import = ["~/.config/alacritty/theme.toml"]`.
