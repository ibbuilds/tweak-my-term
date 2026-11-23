---
capability: borders
tool: hyprland
os: linux
verified: 2026-11-23 (docs, hyprland v0.57.2)
sources: https://wiki.hypr.land/Configuring/Basics/Variables/, https://raw.githubusercontent.com/hyprwm/Hyprland/main/example/hyprland.lua
---
# Borders and rounding in Hyprland
`general.border_size` (default `1`) is the width. `general.col.active_border` and `inactive_border` are gradients: one color, or `{ colors = {...}, angle = 45 }`. `decoration.rounding` is the corner radius in px (default `0`).

## Config
```lua
hl.config({
  general = {
    border_size = 2,
    col = {
      active_border   = "{palette.accent}",           -- or { colors = {"{palette.accent}", "{palette.ansi.blue}"}, angle = 45 }
      inactive_border = "{palette.ansi.brightBlack}", -- subtle
    },
  },
  decoration = { rounding = 8, rounding_power = 2 },
})
```
Hyprlang (0.54 and older), inside `general { }`: `col.active_border = rgba(RRGGBBff)` or `rgba(aaaaaaff) rgba(bbbbbbff) 45deg`; `rounding = 8` inside `decoration { }`.

## Notes
- Color formats: `rgba(RRGGBBAA)`, `rgb(RRGGBB)`, a web hash string, or legacy `0xAARRGGBB`. The `{palette.*}` tokens expand to `#RRGGBB`; if a 6-digit hash string is not accepted, strip the `#` and write `rgb(RRGGBB)`.
- Per-window override: `hl.window_rule({ match = { class = "kitty" }, border_size = 3, rounding = 12 })` (effects `border_size`, `rounding`, `border_color`).
- `decoration.shadow`, `blur` and `glow` are separate settings; leave them as shipped unless the look asks.
- A transparent terminal shows the compositor background behind rounded corners; check the result with a screenshot.
