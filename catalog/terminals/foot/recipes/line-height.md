---
capability: line-height
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://man.archlinux.org/man/foot.ini.5
---
# Line height in foot
`line-height` is absolute, in points or pixels with a `px` suffix. It is not a multiplier.
## Config
```ini
# {font.lineHeight} = 1.2 and size 12  ->  1.2 * 12 = 14.4 (points)
line-height=14.4
# or in pixels:
# line-height=20px
```
## Notes
- Unset by default (uses the font's metrics). Compute the value as `font.size * font.lineHeight` in points; the font's natural line box is slightly taller than its size, so adjust visually.
- `vertical-letter-offset` shifts glyphs inside the taller cell; use it to re-center text.
- `box-drawings-uses-font-glyphs=no` (default) means foot draws box-drawing characters itself, so tall cells keep lines joined; leave it at the default.
