---
capability: gaps
tool: hyprland
os: linux
verified: 2026-11-23 (docs, hyprland v0.57.2)
sources: https://wiki.hypr.land/Configuring/Basics/Variables/, https://wiki.hypr.land/Configuring/Basics/Workspace-Rules/
---
# Gaps in Hyprland
`general.gaps_in` is the space between windows, `general.gaps_out` the space to the monitor edge. Defaults are `5` and `20`. Each accepts one integer or `{ top, left, right, bottom }` (css_gaps).

## Config
One value for a uniform look (`{layout.gap}` is the look's `layout.gap` in px):
```lua
hl.config({ general = { gaps_in = {layout.gap}, gaps_out = {layout.gap} } })
```
Hyprlang (0.54 and older):
```
general {
    gaps_in = {layout.gap}
    gaps_out = {layout.gap}
}
```

## Notes
- `general.float_gaps` (default `0`) sets the edge gap for floating windows; `-1` means use `gaps_out`.
- Smart gaps (none with a single window): `hl.workspace_rule({ workspace = "w[tv1]", gaps_out = 0, gaps_in = 0 })` and the same for `f[1]`, plus matching `border_size = 0` window rules; see the commented block in the example config.
- Per-workspace gaps: `hl.workspace_rule({ workspace = "3", gaps_in = 0, gaps_out = 0 })`.
- `general.gaps_workspaces` (default `0`) adds space between workspaces and stacks with `gaps_out`.
