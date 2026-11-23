---
capability: opacity
tool: alacritty
os: windows, macos, linux
verified: 2026-11-23 (docs, alacritty 0.17.0)
sources: https://alacritty.org/config-alacritty.html
---
# Window opacity in Alacritty
`window.opacity` is a float from 0.0 (transparent) to 1.0 (opaque, default).

## Config
```toml
[window]
opacity = {window.opacity}

[colors]
transparent_background_colors = false
```

## Notes
- `transparent_background_colors = false` (default) keeps cells with a non-default background opaque so selections, status lines and highlighted text stay readable; `true` makes every cell translucent.
- Without a compositor X11 shows no transparency. macOS, Windows and Wayland composite by default.
- Translucency has a render cost and lowers text contrast over busy desktops; 0.9+ is safe for readability, otherwise add `window.blur` on macOS/KDE (see the blur recipe).
