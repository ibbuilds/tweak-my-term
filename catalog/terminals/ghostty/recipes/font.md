---
capability: font
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference
---
# Font in Ghostty
`font-family` picks the primary font (repeat the key to add fallbacks), `font-size` is in points (fractions allowed). Run `ghostty +list-fonts` to confirm the exact family name before writing it.
## Config
```
font-family = "{font.family}"
font-size = {font.size}
# optional style override; set a style to false to disable it
# font-style = "{font.weight}"
```
## Notes
- Reset an inherited list with `font-family = ""`, then list again.
- Variants: `font-family-bold`, `font-family-italic`, `font-family-bold-italic`. A style key is only valid when the matching family is set.
- `font-thicken = true` (macOS only) makes strokes heavier on low-DPI screens.
- Prefer a Nerd Font variant (for example "JetBrainsMono Nerd Font") or add a symbols fallback, see font-fallback.
- Font size changes affect existing terminals only if they were not manually resized; reload after editing.
