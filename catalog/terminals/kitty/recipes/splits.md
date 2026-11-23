---
capability: splits
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/layouts/
---
# Splits in kitty
Enable the `splits` layout, then create splits with `launch --location=...`.
## Config
```
enabled_layouts splits,stack
map f5 launch --location=hsplit
map f6 launch --location=vsplit
map f4 launch --location=split
map ctrl+left neighboring_window left
map ctrl+right neighboring_window right
map ctrl+up neighboring_window up
map ctrl+down neighboring_window down
map f7 layout_action rotate
map ctrl+shift+e layout_action equalize
```
## Notes
- `hsplit` stacks vertically (one above the other), `vsplit` places side by side, `split` picks the axis from window shape.
- Resize: drag borders, `ctrl+shift+r` resize mode, `layout_action bias 80`, `layout_action maximize horizontal|vertical`.
- Default layouts (without `splits`) are tall/fat/grid/stack style tiling, not free splits.
- `map ctrl+alt+z toggle_layout stack` temporarily zooms the active window.
