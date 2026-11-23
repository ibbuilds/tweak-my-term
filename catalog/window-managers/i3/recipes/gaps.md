---
capability: gaps
tool: i3
os: linux
verified: 2026-11-23 (docs, i3 4.25.1)
sources: https://i3wm.org/docs/userguide.html, https://i3wm.org/downloads/RELEASE-NOTES-4.22.txt
---
# Gaps in i3
Native gaps exist since i3 4.22 (the i3-gaps fork was merged into it; the config is compatible). Before 4.22, plain i3 has no gaps: install i3 4.22+ or use the fork. Gaps are off by default.

## Config
`gaps inner <px>` is the space between adjacent windows or split containers. `gaps outer <px>` is the space along the screen edges and is added to the inner gap. One value (`{layout.gap}` is the look's `layout.gap` in px):
```
gaps inner {layout.gap}
gaps outer 0
```

## Notes
- Per side: `gaps top|right|bottom|left <px>`; `horizontal` and `vertical` are shortcuts for pairs.
- Per workspace: `workspace 3 gaps inner 0`.
- `smart_gaps on|off|inverse_outer` hides gaps with a single window (`inverse_outer` shows only outer gaps then).
- Runtime: `i3-msg 'gaps inner all set 10'` (`current` or `all`; `set|plus|minus|toggle`). It does not change the config file.
- `hide_edge_borders smart_no_gaps` (4.22+) hides borders against the screen edge only when gaps are 0.
