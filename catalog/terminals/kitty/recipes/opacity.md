---
capability: opacity
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/
---
# Window opacity in kitty
`background_opacity` is 0 to 1 (default 1.0). Set `dynamic_background_opacity yes` to allow runtime changes.
## Config
```
background_opacity {window.opacity}
dynamic_background_opacity yes
```
## Notes
- `dynamic_background_opacity` is off by default because of its performance cost; if it was off at start, a config reload does not change the opacity.
- Runtime change: `kitten @ set-background-opacity 0.8` (needs `allow_remote_control`).
- 0.49.2 fixed a macOS regression where `background_opacity` below 1 without `background_blur` made the titlebar transparent.
