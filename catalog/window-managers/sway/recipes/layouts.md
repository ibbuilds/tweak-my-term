---
capability: layouts
tool: sway
os: linux
verified: 2026-11-23 (docs, sway 1.12)
sources: https://man.archlinux.org/man/sway.5
---
# Layouts in sway
Containers form a tree. Each container has a layout: `splith`, `splitv`, `stacking` or `tabbed`. `layout <name>` sets the focused container's layout; `splith` / `splitv` (or `split horizontal|vertical|toggle`) make the next window open to the right or below the focused one. `workspace_layout default|stacking|tabbed` sets the start layout of an empty workspace and `default_orientation horizontal|vertical|auto` the default split.

## Terminal left, two stacked right
1. Open terminal 1, then terminal 2 (default `splith` puts it on the right and focuses it).
2. With terminal 2 focused run `splitv`, then open terminal 3: it opens below terminal 2.
```
bindsym $mod+Return exec $term
bindsym $mod+b splith
bindsym $mod+v splitv
bindsym $mod+w layout tabbed
bindsym $mod+s layout stacking
bindsym $mod+e layout toggle split
```
Make it start that way: see the autostart recipe.

## Notes
- Resize: `resize set width 60 ppt` or `resize grow width 40 px`. Default config binds `$mod+r` to a resize mode.
- `layout toggle split` swaps `splith` and `splitv`; `layout toggle all` cycles every layout.
- `focus_wrapping yes|no|force|workspace` controls focus wrapping at the edge.
- `swaymsg -t get_tree` shows the container tree, useful when a layout is not what you expect.
