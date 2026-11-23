---
capability: font
tool: alacritty
os: windows, macos, linux
verified: 2026-11-23 (docs, alacritty 0.17.0)
sources: https://alacritty.org/config-alacritty.html
---
# Font in Alacritty
Set `[font.normal]` family and style and `font.size` in points. There is no fallback list: use a Nerd Font patched build (for example "JetBrainsMono Nerd Font") as the family so icons render.

## Config
```toml
[font]
size = {font.size}

[font.normal]
family = "{font.family}"
style = "Regular"

[font.bold]
style = "Bold"

[font.italic]
style = "Italic"

[font.bold_italic]
style = "Bold Italic"
```

## Notes
- `bold`, `italic` and `bold_italic` inherit the normal family when only `style` is given. Default size is 11.25.
- Defaults when unset: Consolas (Windows), Menlo (macOS), `monospace` (Linux).
- Map a look-spec weight to `style` (for example "Medium", "Light"); the style string must match a style name the font actually has.
- `font.builtin_box_drawing` (default true) draws box-drawing, legacy computing and powerline glyphs U+E0B0-E0B3 itself, so they stay seamless regardless of the font.
- No ligature support at all (see tool notes); `font.glyph_offset` shifts glyphs inside the cell.
- Fallback for missing glyphs is up to the OS (see the font-fallback recipe).
