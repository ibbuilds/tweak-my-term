---
capability: background-animated
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference
---
# Animated background in Ghostty
No animated image support: `background-image` is PNG/JPEG only. For animation use a custom shader with `custom-shader-animation` (see shader).
## Config
```
custom-shader = {background.shader}
custom-shader-animation = true
```
## Notes
- `custom-shader-animation`: `true` (default) animates only the focused surface, `false` renders only on terminal updates, `always` animates even when unfocused (more CPU).
- Animation uses extra CPU/GPU; on battery prefer `false`.
- GIF, APNG and video backgrounds are not documented as supported.
