---
capability: font
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/
---
# Font in kitty
`font_family` (default `monospace`), `bold_font`/`italic_font`/`bold_italic_font` (default `auto`) and `font_size`.
## Config
```
font_family {font.family}
bold_font auto
italic_font auto
bold_italic_font auto
font_size {font.size}
```
## Notes
- `kitten choose-fonts` is the docs-recommended interactive picker; it also writes the right `font_family` form. List installed fonts with `kitty +list-fonts`.
- Variable or multi-width families sometimes need the named form `font_family family="Name" style="Medium"`; the exact syntax was not in the excerpt read, so use `kitten choose-fonts` when a plain name does not resolve.
- The default `font_size` was not confirmed (older versions use 11.0). Always set it explicitly.
- Prefer a Nerd Font family or rely on `symbol_map`, see font-fallback.
