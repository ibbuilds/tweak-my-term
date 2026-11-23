---
capability: line-height
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/config/line_height.html, https://wezterm.org/config/lua/config/cell_width.html
---
# Line height in WezTerm
`config.line_height` is a multiplier of the font's natural line height (default 1.0).

## Config
```lua
config.line_height = {font.lineHeight}
```

## Notes
- 1.2 adds 20% spacing, 0.9 removes 10%. A readable range is about 1.0 to 1.3.
- Box-drawing and powerline glyphs are sized to the cell, so large values can show gaps between lines in TUIs.
- `config.cell_width` (since 20220624-141144-bd1b7c5d) scales width the same way; prefer the font `stretch` attribute when the font has one.
