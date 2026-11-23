---
capability: font-fallback
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://man.archlinux.org/man/foot.ini.5
---
# Font fallback and Nerd Font symbols in foot
`font` is a comma separated list: the first font is primary, the rest are fallbacks used when a glyph is missing.
## Config
```ini
font={font.family}:size={font.size}, {font.fallback.0}:size={font.size}, Symbols Nerd Font Mono:size={font.size}
```
## Notes
- If no listed font has the glyph, foot searches fontconfig's dynamic fallback list for the primary font, so a Nerd Font installed system-wide usually resolves icons even without listing it.
- Put "Symbols Nerd Font Mono" last so it does not override real glyphs from earlier fonts.
- `font-bold`, `font-italic` and `font-bold-italic` accept the same list syntax.
- A global fontconfig file that sets the same family with `assign` can defeat fallbacks; use `append` modes instead.
