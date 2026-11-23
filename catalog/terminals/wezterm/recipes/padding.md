---
capability: padding
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/config/window_padding.html
---
# Padding in WezTerm
`config.window_padding` sets the space between the window edge and the text grid. Units: plain numbers or `'px'` are pixels; strings can use `pt`, `cell` or `%` (since 20211204-082213-a66c61ee9).

## Config
Look spec padding is `[top, right, bottom, left]` in CSS order:
```lua
config.window_padding = {
  top = {window.padding.top},
  right = {window.padding.right},
  bottom = {window.padding.bottom},
  left = {window.padding.left},
}
```

## Notes
- Default is `left/right = '1cell'`, `top/bottom = '0.5cell'`. Older releases defaulted to 0.
- If `enable_scroll_bar = true`, the `right` value sets the scrollbar width.
- Use `cell` units for padding that follows the font size; `pt` follows DPI.
- The background image/gradient is drawn behind the padding too.
