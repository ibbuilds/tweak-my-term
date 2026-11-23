---
capability: opacity
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference
---
# Window opacity in Ghostty
`background-opacity` takes 0 to 1 (clamped). Text stays opaque; only the background is translucent.
## Config
```
background-opacity = {window.opacity}
```
## Notes
- On macOS, changing it requires a full restart of Ghostty, not just a config reload.
- Combine with `background-blur` for readability over busy desktops, see blur.
- `background-image-opacity` is relative to `background-opacity`, see background-image.
- Keep opacity at 0.85 or higher for body text unless blur is on.
