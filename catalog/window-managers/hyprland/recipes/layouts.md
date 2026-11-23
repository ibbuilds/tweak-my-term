---
capability: layouts
tool: hyprland
os: linux
verified: 2026-11-23 (docs, hyprland v0.57.2)
sources: https://wiki.hypr.land/Configuring/Layouts/Dwindle-Layout/, https://wiki.hypr.land/Configuring/Layouts/Master-Layout/, https://wiki.hypr.land/Configuring/Layouts/Scrolling-Layout/
---
# Layouts in Hyprland
`general.layout` is `"dwindle"` (default, binary tree), `"master"`, `"scrolling"` or `"monocle"`. The master and scrolling layouts also take per-workspace options through `hl.workspace_rule({ workspace = "2", layout_opts = { ... } })`.

## Terminal left, two stacked right
Dwindle on a wide monitor does this by itself: window 1 fills the screen, window 2 splits to its right, window 3 splits the focused right window top and bottom.
```lua
hl.config({ general = { layout = "dwindle" }, dwindle = { preserve_split = true } })
hl.bind("SUPER + J", hl.dsp.layout("togglesplit"))         -- flip a split (needs preserve_split)
hl.bind("SUPER + SHIFT + D", hl.dsp.layout("preselect d")) -- next window opens below
```
Master layout alternative (master left, the rest stacked on the right):
```lua
hl.config({ general = { layout = "master" }, master = { orientation = "left", mfact = 0.55, new_status = "slave" } })
```

## Notes
- Dwindle keys: `preserve_split`, `force_split` (0 follows the mouse, 1 new left/top, 2 new right/bottom), `default_split_ratio` (0.1 to 1.9, 1 is 50/50), `split_width_multiplier`. Messages: `togglesplit`, `swapsplit`, `rotatesplit`, `preselect <l|r|u|d>` (applies to the next window only).
- Master messages: `swapwithmaster master`, `cyclenext`. `master.mfact` is the master share (default `0.55`).
- Scrolling (a niri-like tape): `column_width`, `explicit_column_widths`, `direction`; window rule `scrolling_width`.
- Hyprlang (0.54 and older): `bind = SUPER, J, layoutmsg, togglesplit` and `layoutmsg, preselect d`; options live in `dwindle { }` / `master { }`.
