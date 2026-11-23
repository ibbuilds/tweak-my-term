---
capability: font
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://man.archlinux.org/man/foot.ini.5
---
# Font in foot
`font` takes a fontconfig pattern with `size=` in points. The first entry is the primary font.
## Config
```ini
font={font.family}:size={font.size}
# optional explicit variants; default is the bold/italic of `font`
# font-bold={font.family}:weight=bold:size={font.size}
```
## Notes
- Default is `monospace:size=8`. Check names with `fc-list : family | sort -u`.
- `font-bold`, `font-italic`, `font-bold-italic` default to variants of `font`; to disable bold/italic set `font-bold` to exactly the same value as `font`.
- `dpi-aware=no` (default) sizes by the output scale factor; `yes` sizes by monitor DPI so physical size stays constant across monitors.
- `font-size-adjustment` (default 0.5) controls the step of the zoom bindings. `letter-spacing`, `horizontal-letter-offset`, `vertical-letter-offset` fine-tune glyph placement.
- `box-drawings-uses-font-glyphs=no` (default) means foot draws box-drawing itself.
- Ligatures are not supported by foot (see tool notes).
