---
capability: font-fallback
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference
---
# Font fallback and Nerd Font symbols in Ghostty
List several `font-family` lines; later ones are used for glyphs the earlier ones lack. Use `font-codepoint-map` to force code point ranges into a symbols font.
## Config
```
font-family = "{font.family}"
font-family = "{font.fallback.0}"
font-family = "{font.fallback.1}"
# Force Nerd Font private-use icons from a symbols-only font:
font-codepoint-map = U+E000-U+F8FF=Symbols Nerd Font Mono
font-codepoint-map = U+F0000-U+FFFFD=Symbols Nerd Font Mono
```
## Notes
- `font-codepoint-map` format is `codepoint-or-range=font name` (docs example `U+ABCD-U+DEFG=fontname`). Runtime changes affect only new terminals.
- The ranges above are the Nerd Fonts private-use blocks; they come from Nerd Fonts, not from the Ghostty docs (unverified against the current Nerd Fonts release).
- Ghostty may ship an embedded Symbols Nerd Font fallback so a patched font is not strictly required; this was not confirmed in the pages read. Test with `printf ' \n'`.
- Check family names with `ghostty +list-fonts --family "<name>"`.
