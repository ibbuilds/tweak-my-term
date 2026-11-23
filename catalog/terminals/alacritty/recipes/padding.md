---
capability: padding
tool: alacritty
os: windows, macos, linux
verified: 2026-11-23 (docs, alacritty 0.17.0)
sources: https://alacritty.org/config-alacritty.html
---
# Padding in Alacritty
`window.padding` takes one x and one y value in pixels, applied on both opposing sides and scaled by DPI. Different top/bottom or left/right values are not possible.

## Config
Look spec `padding` `[top, right, bottom, left]`: use the left/right value for `x` and the top/bottom value for `y`:
```toml
[window]
padding = { x = {window.padding.left}, y = {window.padding.top} }
dynamic_padding = false
```

## Notes
- `dynamic_padding = true` spreads additional padding evenly around the terminal content (documented wording).
- If the look spec has unequal sides, pick the larger of each pair or note the loss in the report.
- Padding shows the `colors.primary.background`; there is no background image to extend into it.
