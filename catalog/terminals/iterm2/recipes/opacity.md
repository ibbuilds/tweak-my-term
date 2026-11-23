---
capability: opacity
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation-preferences-profiles-window.html, https://iterm2.com/python-api/profile.html
---
# Window opacity in iTerm2
The profile key is `Transparency`, a 0 to 1 number. In the iTerm2 UI 0 is fully opaque, so it is the inverse of look `opacity`.
## Config
```json
{ "Transparency": {1 - window.opacity} }
```
## Notes
- Example: opacity 0.9 gives `"Transparency": 0.1`. The inversion (0 = opaque) is how the Transparency slider behaves; the API page only says "transparency level from 0 to 1", so confirm visually once.
- Related keys (Python API): `use_transparency_initially` (new windows start transparent) and `only_the_default_bg_color_uses_transparency`.
- Pair with `Blur` for readability, see blur.
