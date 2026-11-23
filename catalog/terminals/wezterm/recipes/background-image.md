---
capability: background-image
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/config/background.html, https://wezterm.org/config/lua/config/window_background_image.html
---
# Background image in WezTerm
Use `config.background`, an ordered list of layers (back to front). A layer is an image file, a gradient or a solid color; layers composite by alpha. Dim the image with `hsb.brightness` and an `opacity` below 1 so text stays readable. Needs 20220624-141144-bd1b7c5d or later.

## Config
```lua
config.background = {
  { source = { Color = '{palette.background}' }, width = '100%', height = '100%' },
  {
    source = { File = '{background.image}' },   -- absolute path; PNG, JPEG, GIF, BMP, ICO, TIFF, PNM, DDS, TGA, farbfeld
    height = 'Cover',                           -- 'Cover' (default), 'Contain', pixels, '50%', '2cell'
    width = 'Cover',
    horizontal_align = 'Right',                 -- 'Left' (default), 'Center', 'Right'
    vertical_align = 'Top',                     -- 'Top' (default), 'Middle', 'Bottom'
    repeat_x = 'NoRepeat',                      -- 'Repeat' (default), 'Mirror', 'NoRepeat'
    repeat_y = 'NoRepeat',
    opacity = {background.opacity},             -- 0.0 to 1.0
    hsb = { brightness = 0.6, saturation = 1.0, hue = 1.0 },
  },
}
```

## Notes
- Fit mapping: look-spec `cover` = `height/width = 'Cover'`; `contain` = `'Contain'` with `repeat_x/repeat_y = 'NoRepeat'`; `fill` = `width = '100%', height = '100%'`; `tile` = `repeat_x/repeat_y = 'Repeat'`; `center` = `horizontal_align = 'Center', vertical_align = 'Middle'` with the natural size.
- `attachment`: `'Fixed'` (default) stays put while scrolling; `'Scroll'` moves 1:1; `{ Parallax = 0.1 }` moves slower.
- Relative paths are not documented for `background` sources; use an absolute path (on Windows use forward slashes or double backslashes). The older `window_background_image` expands relative paths from the config dir, but mixing it with `background` is discouraged.
- Very large images cost render performance and VRAM (documented): pre-resize the file to roughly the window resolution.
- `window_background_opacity` also applies to every layer (see the opacity recipe). The solid first layer above keeps the base color opaque when opacity is 1.
- `hsb` multiplies hue/saturation/brightness (0.0+, 1.0 = unchanged); brightness 0.3 to 0.7 is the usual range for text-heavy windows.
- Animated GIF/PNG files animate (see the background-animated recipe). Gradients: `source = { Gradient = { preset = 'Warm' } }`.
