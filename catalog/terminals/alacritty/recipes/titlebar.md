---
capability: titlebar
tool: alacritty
os: windows, macos, linux
verified: 2026-11-23 (docs, alacritty 0.17.0)
sources: https://alacritty.org/config-alacritty.html
---
# Title bar in Alacritty
`window.decorations` chooses `Full` (borders and title bar, default) or `None` (no borders or title bar). `Transparent` and `Buttonless` exist on macOS only. There is no integrated tab bar.

## Config
Look spec `titlebar`: `native` -> `Full`, `hidden` -> `None`, `integrated` -> `Transparent` on macOS (otherwise `Full`):
```toml
[window]
decorations = "Full"
decorations_theme_variant = "Dark"   # "Dark", "Light" or "None" (system default)
title = "Alacritty"
dynamic_title = true
```

## Notes
- With `None` there is nothing to drag or resize with; rely on the window manager (Windows: Alt+Space menu or snap).
- `Transparent`: title bar, transparent background and title bar buttons (macOS). `Buttonless`: same without buttons (macOS).
- `decorations_theme_variant` overrides the system or GTK theme variant of the decorations.
- `startup_mode` (`Windowed`, `Maximized`, `Fullscreen`, `SimpleFullscreen` macOS) and `dimensions` need a restart to change.
