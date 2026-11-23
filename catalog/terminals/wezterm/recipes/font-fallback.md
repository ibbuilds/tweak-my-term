---
capability: font-fallback
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/wezterm/font_with_fallback.html, https://wezterm.org/config/fonts.html
---
# Font fallback in WezTerm
`wezterm.font_with_fallback` takes an ordered list; each glyph is taken from the first font that has it. Put the Nerd Font symbols font after the text font. WezTerm adds its bundled Nerd Font Symbols and Noto Color Emoji afterwards by itself.

## Config
```lua
config.font = wezterm.font_with_fallback {
  '{font.family}',
  'Symbols Nerd Font Mono',   -- optional: bundled Nerd Font Symbols is already the default fallback
  'Noto Sans CJK JP',         -- example CJK fallback; use a font that exists on the machine
}
```

## Notes
- Per-font attributes: `{ family = 'Name', weight = 'Medium', scale = 1.5 }` (`scale` since 20220408-101518-b908e2dd, useful for CJK).
- `config.use_cap_height_to_scale_fallback_fonts = true` evens out glyph heights between families.
- If no listed or default font has a glyph, system fallback is tried, then a "Last Resort" placeholder glyph shows.
- Check with `wezterm ls-fonts --text "<chars>"`, which prints the font used per glyph.
