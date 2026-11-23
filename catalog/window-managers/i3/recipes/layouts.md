---
capability: layouts
tool: i3
os: linux
verified: 2026-11-23 (docs, i3 4.25.1)
sources: https://i3wm.org/docs/userguide.html
---
# Layouts in i3
Windows live in a tree of containers. A container layout is `splith`, `splitv`, `stacking` or `tabbed`. `split horizontal|vertical|toggle` decides where the next window opens relative to the focused one; `layout splith|splitv|stacking|tabbed|toggle split` changes the focused container. `workspace_layout default|stacking|tabbed` sets the start layout of new workspaces.

## Terminal left, two stacked right
1. Open terminal 1, then terminal 2 (default `splith`: it opens on the right and takes focus).
2. With terminal 2 focused, run `split vertical`, then open terminal 3: it opens below terminal 2.
```
bindsym $mod+b split horizontal
bindsym $mod+v split vertical
bindsym $mod+w layout tabbed
bindsym $mod+s layout stacking
bindsym $mod+e layout toggle split
```

## Notes
- Split before you open the window; the split applies to the focused window only.
- The tree is easy to get lost in: `i3-msg -t get_tree` prints it.
- Resize with `resize grow width 10 px or 10 ppt` or in a resize mode; sizes are relative to siblings.
- Tabs and stacking draw a title bar on top; `titlebar` fonts come from `font pango:...`.
