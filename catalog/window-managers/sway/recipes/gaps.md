---
capability: gaps
tool: sway
os: linux
verified: 2026-11-23 (docs, sway 1.12)
sources: https://man.archlinux.org/man/sway.5
---
# Gaps in sway
`gaps inner <px>` is the space around each window; `gaps outer <px>` is the space around the workspace edge and is added on top of inner gaps. Both apply to new workspaces; per side: `gaps top|right|bottom|left|horizontal|vertical <px>`.

## Config
One value for a uniform look (`{layout.gap}` is the look's `layout.gap` in px):
```
gaps inner {layout.gap}
gaps outer 0
```
Outer gaps stack on top of inner gaps, so the distance from a window to the screen edge is inner plus outer. For a look that wants equal spacing everywhere use the same value for both and compare with a screenshot.

## Notes
- `smart_gaps on` hides gaps when a workspace has one window; `smart_gaps inverse_outer` shows outer gaps only then.
- Per workspace: `workspace 3 gaps inner 0` (affects the workspace when it is created).
- Runtime change: `swaymsg gaps inner all set 10` (`all` or `current`; `set|plus|minus|toggle`).
- Outer gaps may be negative to cancel the edge space.
