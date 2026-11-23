---
capability: splits
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/keyassignment/SplitHorizontal.html, https://wezterm.org/config/lua/keyassignment/SplitVertical.html, https://wezterm.org/config/lua/config/colors.html
---
# Splits in WezTerm
Panes are built in. Bind `SplitHorizontal` (new pane to the right) and `SplitVertical` (new pane below) to keys; style the divider with `colors.split` and dim inactive panes with `inactive_pane_hsb`.

## Config
```lua
config.keys = {
  { key = 'd', mods = 'CTRL|SHIFT', action = wezterm.action.SplitHorizontal { domain = 'CurrentPaneDomain' } },
  { key = 'e', mods = 'CTRL|SHIFT', action = wezterm.action.SplitVertical { domain = 'CurrentPaneDomain' } },
}
config.inactive_pane_hsb = { saturation = 0.9, brightness = 0.8 }   -- default values
```
Divider color goes inside the palette table:
```lua
config.colors.split = '{palette.ansi.brightBlack}'   -- set after config.colors = {...}; do not reassign config.colors
```

## Notes
- Existing `config.keys` entries must be merged into one table; a second assignment replaces the first.
- Newer pane keys exist (`SplitPane`, `ActivatePaneDirection`, `TogglePaneZoomState`); see the key assignment index in the docs. Defaults already include `CTRL+SHIFT+ALT` + `%` (SplitHorizontal) and `CTRL+SHIFT+ALT` + `"` (SplitVertical).
- `inactive_pane_hsb` multiplies hue/saturation/brightness of inactive panes; set `{ saturation = 1.0, brightness = 1.0 }` to disable dimming.
- Startup layouts with several panes: see the startup-layout recipe.
