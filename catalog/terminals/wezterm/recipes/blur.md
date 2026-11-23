---
capability: blur
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/config/win32_system_backdrop.html, https://wezterm.org/config/lua/config/macos_window_background_blur.html, https://wezterm.org/config/lua/config/wayland_window_background_blur.html
---
# Background blur in WezTerm
Blur needs a translucent window (`window_background_opacity < 1`) plus an OS-specific key: `win32_system_backdrop` on Windows, `macos_window_background_blur` on macOS, `wayland_window_background_blur` on Wayland.

## Config
Windows (`win32_system_backdrop` since 20230712-072601-f4abf8fd):
```lua
config.window_background_opacity = 0
config.win32_system_backdrop = 'Acrylic'   -- or 'Mica' / 'Tabbed' (Windows 11 build 22621+)
```
macOS (since 20230326-111934-3666303c):
```lua
config.window_background_opacity = 0.3
config.macos_window_background_blur = 20
```
Linux Wayland (nightly only, not in 20240203):
```lua
config.window_background_opacity = 0.4
config.wayland_window_background_blur = true
```

## Notes
- Emit only the block for the current OS (`wezterm.target_triple` contains `windows`, `apple` or `linux`); when the look spec has `window.blur: false`, set none of these.
- Windows: opacity must be below 1.0 for any backdrop. `Mica` and `Tabbed` work best at opacity 0. `Acrylic` uses more resources than the others. Values: Auto (default, same as Disable), Disable, Acrylic, Mica, Tabbed.
- Raise `text_background_opacity` so colored cell backgrounds stay readable on blur.
- X11: no blur option. Wayland compositors may need blur enabled (KDE: Blur effect).
