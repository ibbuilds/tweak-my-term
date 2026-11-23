---
capability: line-height
tool: alacritty
os: windows, macos, linux
verified: 2026-11-23 (docs, alacritty 0.17.0)
sources: https://alacritty.org/config-alacritty.html
---
# Line height in Alacritty
No multiplier. `font.offset` adds extra pixels around every cell: `y` changes line spacing, `x` changes letter spacing. Values are integers.

## Config
Convert the look-spec multiplier to pixels: `y = round((lineHeight - 1) * cellHeightPx)`. For a 16px cell and `{font.lineHeight}` = 1.25 that is 4:
```toml
[font.offset]
x = 0
y = 4

[font.glyph_offset]
x = 0
y = 2   # half of the extra spacing, so the glyph stays centered in the taller cell
```

## Notes
- The cell height in pixels depends on font, size and DPI; measure by trying a value and checking, or start with `y = 2` to `4`.
- `offset.y` adds space once per cell, so glyphs sit at the bottom; `glyph_offset.y` raises them (positive moves up).
- Negative offsets tighten spacing but can clip glyphs.
- Box-drawing glyphs are drawn by Alacritty to fill the cell, so TUIs remain connected.
