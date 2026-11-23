---
capability: layouts
tool: aerospace
os: macos
verified: 2026-11-23 (docs, aerospace 0.21.3-Beta)
sources: https://nikitabobko.github.io/AeroSpace/guide, https://nikitabobko.github.io/AeroSpace/commands
---
# Layouts in AeroSpace
Each workspace is a tree. A container is `tiles` (split) or `accordion` (windows stacked, neighbors peek out) with a `horizontal` or `vertical` orientation: `h_tiles`, `v_tiles`, `h_accordion` (like i3 tabbed), `v_accordion` (like i3 stacked). There is no bsp mode; nest containers by hand.

## Default for new workspaces
```toml
default-root-container-layout = 'tiles'           # or 'accordion'
default-root-container-orientation = 'horizontal'  # horizontal | vertical | auto (follows monitor shape)
accordion-padding = 30                             # 0 disables the peek padding
```

## Terminal on the left, two terminals stacked on the right
Open three terminal windows in a horizontal root (they land side by side), focus the middle one, then:
```sh
aerospace join-with right      # middle + right window go into a v_tiles container
```
Result: `h_tiles [ terminal1, v_tiles [ terminal2, terminal3 ] ]` (this is the documented `join-with` example). Resize with `aerospace resize smart +100` or `-100`; reset sizes with `aerospace balance-sizes`.

## Other commands
- `aerospace layout tiles accordion` toggles split or stack for the focused container; `layout v_accordion` stacks terminals vertically.
- `aerospace layout --root h_tiles` sets the whole workspace; `aerospace flatten-workspace-tree` resets a messy tree.
- `join-with` nests on purpose; `move up|down` can also create containers implicitly.
- The tree is not saved: it is rebuilt as windows open. A launch script runs the commands above after opening the windows.
