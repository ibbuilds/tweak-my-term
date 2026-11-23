---
capability: line-height
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference
---
# Line height in Ghostty
`adjust-cell-height` is added to the font's cell height; use a percentage. A look `lineHeight` of 1.2 maps to `20%`.
## Config
```
# {font.lineHeight} = 1.2  ->  (lineHeight - 1) * 100 percent
adjust-cell-height = 20%
```
## Notes
- The value is an offset, not an absolute: `1` adds one pixel, `-1` removes one, `20%` adds 20 percent. No adjustment is the default (lineHeight 1.0).
- `adjust-cell-width` works the same way for letter spacing. `adjust-font-baseline` and `adjust-cursor-height` also exist.
- Large values (above about 1.3) can visibly break box-drawing and powerline joins.
