---
capability: line-height
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/
---
# Line height in kitty
`modify_font cell_height` adjusts the cell height. Suffix `%` is a percentage of the original, `px` pixels, no suffix points.
## Config
```
# {font.lineHeight} = 1.2
modify_font cell_height 120%
# modify_font baseline 1px   # nudge text vertically if the glyphs sit low
```
## Notes
- Docs example: `modify_font cell_height -2px`. `cell_width` and `baseline` are also accepted.
- The percentage form is described as a percentage of the original value, so 120% means 1.2x (inferred from that wording).
- Large values can detach box-drawing and powerline glyphs.
