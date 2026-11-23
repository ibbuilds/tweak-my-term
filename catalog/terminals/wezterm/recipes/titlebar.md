---
capability: titlebar
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/config/window_decorations.html, https://wezterm.org/config/lua/config/integrated_title_button_style.html
---
# Title bar in WezTerm
`window_decorations` is a `|`-joined flag string. Native title bar: `'TITLE | RESIZE'` (default). Tabs in the title bar with window buttons: `'INTEGRATED_BUTTONS|RESIZE'`. No title bar but still resizable: `'RESIZE'`.

## Config
Look spec `titlebar`: `native` / `integrated` / `hidden`:
```lua
config.window_decorations = 'TITLE | RESIZE'               -- native
-- config.window_decorations = 'INTEGRATED_BUTTONS|RESIZE' -- integrated (since 20230408-112425-69ae8472)
-- config.window_decorations = 'RESIZE'                    -- hidden
config.integrated_title_button_style = 'Windows'           -- 'Windows', 'Gnome', or 'MacOsNative' (macOS default)
```

## Notes
- Do not use `'NONE'` unless required: the docs warn it breaks resizing and minimizing. Keep `RESIZE` in the set.
- With no title bar, drag the window by the tab bar, or Super+drag (Windows: CTRL+SHIFT+drag), or bind `StartWindowDrag`.
- macOS flags: `MACOS_FORCE_DISABLE_SHADOW`, `MACOS_FORCE_ENABLE_SHADOW` (since 20230320-124340-559cb7b0); `MACOS_FORCE_SQUARE_CORNERS` and `MACOS_USE_BACKGROUND_COLOR_AS_TITLEBAR_COLOR` are nightly-only.
- X11 and Wayland window managers may override decorations.
- Fancy tab bar colors double as the integrated title bar colors; set `config.window_frame` (see the tabs recipe).
