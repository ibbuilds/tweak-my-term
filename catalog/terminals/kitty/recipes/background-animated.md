---
capability: background-animated
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/custom-shaders/
---
# Animated background in kitty
Use a bundled animated shader through `custom_shaders` (kitty 0.49+). GIF is a listed `background_image` format but animation of it is not documented.
## Config
```
custom_shaders {background.shader}
# e.g. custom_shaders inside-the-matrix  |  northern-lights  |  fireworks  |  water
```
## Notes
- Bundled animated backgrounds: `inside-the-matrix`, `northern-lights`, `fireworks`, `water`. Mouse effects: `pond-ripple`, `spotlight`.
- Default animation frame interval is 50 ms (about 20 fps) and cannot go below `repaint_delay`. Inactive pipeline groups cost no GPU work.
- Static shaders can use `animation_step 0` to redraw only on content or shader events.
