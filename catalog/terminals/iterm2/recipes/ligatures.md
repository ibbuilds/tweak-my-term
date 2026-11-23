---
capability: ligatures
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation-preferences-profiles-text.html
---
# Ligatures in iTerm2
`ASCII Ligatures` is a boolean profile key. Ligatures only work with fonts that provide them (FiraCode, Monaspace) and slow drawing.
## Config
```json
{ "ASCII Ligatures": {font.ligatures} }
```
## Notes
- Documented cost: ligatures make drawing slower and disable the GPU renderer.
- A separate non-ASCII ligatures setting exists (`non_ascii_ligatures` in the Python API); its profile key was not confirmed.
- Contextual Alternates (`calt`) is a toggle in the font picker's options menu; turning it off disables certain substitutions (for example Monaspace's `[]`).
- Default is off.
