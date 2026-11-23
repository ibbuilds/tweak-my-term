---
capability: gaps
tool: yabai
os: macos
verified: 2026-11-23 (docs, yabai 7.1.25)
sources: https://github.com/asmvik/yabai/wiki/Configuration, https://github.com/asmvik/yabai/blob/master/doc/yabai.asciidoc
---
# Gaps in yabai
Padding is the space to the screen edges, `window_gap` is the space between windows. Values are points. Use one number everywhere. Works with SIP on.

## Config (`~/.config/yabai/yabairc`)
```sh
yabai -m config top_padding    10
yabai -m config bottom_padding 10
yabai -m config left_padding   10
yabai -m config right_padding  10
yabai -m config window_gap     10
```

## Notes
- Default is 0. These apply to tiled (bsp or stack) windows, not floating ones.
- Per Space: `yabai -m config --space 2 window_gap 0`.
- At runtime: `yabai -m space --padding abs:10:10:10:10` (top:bottom:left:right) and `yabai -m space --gap abs:10`.
- Custom bar on top: reserve room with `yabai -m config external_bar main:24:0` (top:bottom) instead of inflating `top_padding`.
- Match the terminal's own padding: a gap of 8-12 next to a terminal padding of 8-12 looks consistent.
