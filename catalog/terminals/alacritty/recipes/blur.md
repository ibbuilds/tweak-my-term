---
capability: blur
tool: alacritty
os: macos, linux
verified: 2026-11-23 (docs, alacritty 0.17.0)
sources: https://alacritty.org/config-alacritty.html
---
# Background blur in Alacritty
`window.blur = true` asks the compositor to blur what is behind a translucent window. The docs list it as working on macOS and KDE Wayland only. It does nothing on Windows or X11.

## Config
```toml
[window]
opacity = {window.opacity}   # must be below 1.0 for blur to be visible
blur = true
```

## Notes
- Needs `window.opacity` below 1.0.
- On Windows use WezTerm (`win32_system_backdrop`) or Windows Terminal (`useAcrylic`/Mica) for blur.
- Leave `blur = false` (the default) when the look spec has no blur.
