---
capability: font-fallback
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/
---
# Font fallback and Nerd Font symbols in kitty
`symbol_map` sends code point ranges to a specific font; `narrow_symbols` forces icons into one or more cells.
## Config
```
symbol_map U+E000-U+F8FF,U+F0000-U+FFFFD Symbols Nerd Font Mono
narrow_symbols U+E0A0-U+E0D7 1
```
## Notes
- Syntax: `symbol_map codepoints Font Family Name` (repeatable), `narrow_symbols codepoints [cells]`.
- The Nerd Font ranges come from Nerd Fonts, not from the kitty docs; adjust to the installed font version.
- kitty is documented to bundle a Nerd Font symbols fallback so a patched font may be unnecessary; not confirmed in the pages read here, test with `printf ' \n'`.
- General fallback for missing glyphs and emoji uses fontconfig (Linux) or CoreText (macOS) automatically; there is no ordered fallback list key.
