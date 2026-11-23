---
capability: opacity
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/config/window_background_opacity.html, https://wezterm.org/config/appearance.html
---
# Window opacity in WezTerm
`window_background_opacity` (0.0 to 1.0, default 1.0) makes the window background translucent. It also dims background images and gradients. Raise `text_background_opacity` so cells with a colored background stay readable.

## Config
```lua
config.window_background_opacity = {window.opacity}
config.text_background_opacity = 1.0
```

## Notes
- Anything other than 1.0 may reduce render performance (documented). Keep 1.0 for the fastest redraw.
- macOS, Windows and Wayland composite out of the box; X11 needs a compositor.
- On macOS the window shadow is dropped below 1.0; add `MACOS_FORCE_ENABLE_SHADOW` to `window_decorations` to keep it.
- Over a busy wallpaper, readable text needs either opacity near 0.9+ or a blur (see the blur recipe).
- Toggle at runtime with `window:set_config_overrides` (the official docs show a CTRL-o example).
