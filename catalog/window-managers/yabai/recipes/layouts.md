---
capability: layouts
tool: yabai
os: macos
verified: 2026-11-23 (docs, yabai 7.1.25)
sources: https://github.com/asmvik/yabai/wiki/Configuration, https://github.com/asmvik/yabai/wiki/Commands, https://github.com/asmvik/yabai/blob/master/doc/yabai.asciidoc
---
# Layouts in yabai
A Space layout is `bsp` (binary tree, every new window splits the focused one), `stack` (all windows stacked in one frame) or `float` (yabai leaves windows alone; the default). Set per Space. Works with SIP on.

## Config
```sh
yabai -m config layout bsp
yabai -m config window_placement second_child   # new window goes right or bottom
yabai -m config split_type auto                 # auto picks the axis from the width/height ratio
yabai -m config auto_balance off
yabai -m config split_ratio 0.5                 # 0.55 gives the left window a bit more
```

## Terminal on the left, two stacked on the right
In an empty bsp Space open the first terminal (full screen), then the second: it takes the right half. Before opening the third, make the right window split downward, then open the third:
```sh
yabai -m window --insert south      # focused (right) window splits top/bottom next
```
Result: left terminal, right column with two. With `split_type auto` the right half of a landscape screen already splits top/bottom, so the `--insert` is a safeguard.

## Other commands
- `yabai -m space --layout stack` (or `bsp`) switches the focused Space; stack windows are cycled with `yabai -m window --focus stack.next`.
- `yabai -m space --balance` equalizes sizes; `--rotate 90` and `--mirror y-axis` reshape the tree.
- `yabai -m window --toggle zoom-parent` zooms one window within its parent; `--toggle split` flips its split direction.
- `yabai -m window --stack <WINDOW_SEL>` stacks one window onto another inside a bsp tree.
- The tree is not saved. A launch script opens the windows in order and then runs the commands above.
