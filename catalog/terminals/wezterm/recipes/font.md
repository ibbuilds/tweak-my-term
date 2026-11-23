---
capability: font
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/fonts.html, https://wezterm.org/config/lua/wezterm/font.html
---
# Font in WezTerm
Use `wezterm.font_with_fallback` with the primary family first and a Nerd Font symbols font second; set size with `font_size`. WezTerm already bundles JetBrains Mono, Nerd Font Symbols and Noto Color Emoji, so the defaults render icons without patched fonts.

## Config
```lua
config.font = wezterm.font_with_fallback {
  { family = '{font.family}', weight = '{font.weight}' },
  'Symbols Nerd Font Mono',
}
config.font_size = {font.size}
```

## Notes
- Use the family name (no style words). Weight values: Thin, ExtraLight, Light, DemiLight, Book, Regular (default), Medium, DemiBold, Bold, ExtraBold, Black, ExtraBlack. Drop the `weight` field when the look spec has none.
- Default `font_size` is 12.0 points; fractional sizes such as 13.3 are accepted.
- WezTerm appends its own default fallback (Nerd Font Symbols, Noto Color Emoji) to any list you give, then system fallback.
- Run `wezterm ls-fonts --list-system` to see exact family names and `wezterm ls-fonts` to see which file is chosen. A missing family silently falls back, so check this after changing fonts. Extra font folders can be added with `config.font_dirs`.
