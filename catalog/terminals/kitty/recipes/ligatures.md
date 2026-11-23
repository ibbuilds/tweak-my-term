---
capability: ligatures
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/
---
# Ligatures in kitty
`disable_ligatures never|cursor|always` (default `never`, so ligatures are on). `font_features` toggles OpenType features per font.
## Config
```
# {font.ligatures} = true
disable_ligatures never
# {font.ligatures} = false
# disable_ligatures always
# per-font features, keyed by PostScript name:
# font_features FiraCode-Retina +zero +onum
```
## Notes
- `cursor` disables ligatures only under the cursor so edited text stays readable.
- Per window at runtime: `map alt+1 disable_ligatures_in active always`.
- `font_features none` disables all features for a font.
