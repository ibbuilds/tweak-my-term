---
capability: cursor
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/
---
# Cursor in kitty
`cursor_shape` (`block`, `beam`, `underline`), `cursor_blink_interval` and cursor colors.
## Config
```
cursor_shape block          # look bar -> beam, hollow-block -> unfocused hollow via cursor_shape_unfocused
cursor_blink_interval 0     # 0 disables blinking, -1 follows the system, e.g. "0.5 ease-in-out"
cursor {palette.cursor}
cursor_text_color {palette.cursorText}
```
## Notes
- Default `cursor` is `#cccccc`; `cursor none` gives a reverse-video effect.
- Shell integration switches to a bar at prompts; keep the shape with `shell_integration enabled no-cursor`.
- Look `hollow-block`: kitty shows a hollow block when unfocused (`cursor_shape_unfocused hollow`, unverified key). Trails: `cursor_trail 1` plus a trail shader.
