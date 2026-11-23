---
capability: background-animated
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/config/background.html, https://wezterm.org/config/lua/config/window_background_image.html, https://wezterm.org/config/lua/config/max_fps.html
---
# Animated background in WezTerm
Point a `background` layer at an animated GIF (or animated PNG). It plays while the window has focus. `speed` scales the playback rate. Video files are not supported.

## Config
```lua
config.background = {
  {
    source = { File = { path = '{background.image}', speed = 0.2 } },  -- animated .gif; 0.2 = 20% speed
    height = 'Cover',
    width = 'Cover',
    opacity = {background.opacity},
    hsb = { brightness = 0.4 },
  },
}
config.max_fps = 30   -- optional: cap redraws to cut GPU use (default 60)
```

## Notes
- The `{ File = { path = ..., speed = ... } }` form is in the current docs; `speed` availability in 20240203 is not separately dated (the `background` option itself is since 20220624-141144-bd1b7c5d). If `speed` errors, fall back to `{ File = '...' }`.
- Animation only runs while the window is focused (documented).
- Cost: continuous redraw uses GPU and battery, and a large GIF is decoded into memory. Use a small, low-fps loop, pair with `hsb.brightness` below 0.5, and keep `window_background_opacity` at 1 if frame rate matters.
- `max_fps` is honored on Windows and macOS since 20220903-194523-3bb1ed61 and on X11 since 20211204-082213-a66c61ee9; Wayland ignores it.
- Text over moving pixels is hard to read. Prefer a very dim, slow loop or set `text_background_opacity` below 1 only if you accept lower contrast.
