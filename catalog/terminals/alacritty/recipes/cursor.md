---
capability: cursor
tool: alacritty
os: windows, macos, linux
verified: 2026-11-23 (docs, alacritty 0.17.0)
sources: https://alacritty.org/config-alacritty.html
---
# Cursor in Alacritty
`[cursor.style]` sets `shape` (`Block`, `Underline`, `Beam`) and `blinking` (`Never`, `Off`, `On`, `Always`). Colors are in `[colors.cursor]` (palette recipe).

## Config
Look spec `cursorShape`: `block` -> `Block`, `bar` -> `Beam`, `underline` -> `Underline`; `cursorBlink` true -> `On`, false -> `Off`:
```toml
[cursor]
unfocused_hollow = true
blink_interval = 750
blink_timeout = 5
thickness = 0.15

[cursor.style]
shape = "Block"
blinking = "Off"
```

## Notes
- `unfocused_hollow = true` (default) draws a hollow box when the window is not focused; this is the only hollow-block option, so look-spec `hollow-block` is approximated by `Block` plus this.
- `blinking`: `Off` disables blinking by default but programs may turn it on; `Never` forbids it; `On` enables by default; `Always` forces it.
- `blink_timeout` (seconds, default 5) stops blinking after inactivity; 0 disables the timeout. `blink_interval` is in ms (default 750).
- `thickness` (0.0-1.0 of a cell, default 0.15) applies to `Beam` and `Underline`.
- `vi_mode_style` sets a different cursor in vi mode.
