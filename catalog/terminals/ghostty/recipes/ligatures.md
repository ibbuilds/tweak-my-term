---
capability: ligatures
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference, https://ghostty.org/docs/features
---
# Ligatures in Ghostty
Ligatures render by default in fonts that provide them. Disable programming ligatures with `font-feature = -calt`.
## Config
```
# {font.ligatures} = true: nothing to set (default)
# {font.ligatures} = false:
font-feature = -calt
```
## Notes
- `font-feature` can be repeated or comma separated (`font-feature = -calt, -liga`). Enable a feature with `+name`, for example `font-feature = +ss01`.
- Many fonts (Fira Code, JetBrains Mono, Monaspace) implement ligatures through `calt`; some also use `liga`/`clig`. If ligatures persist after `-calt`, add `-liga` and `-clig` (font-specific, unverified per font).
- Applies to new terminals after reload.
