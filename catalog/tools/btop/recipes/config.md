---
capability: config
tool: btop
os: windows, macos, linux
verified: 2026-11-23 (docs: README configurability section of btop 1.4.5 sample config; btop not run on the verification machine)
sources: https://github.com/aristocratos/btop#configurability, https://github.com/aristocratos/btop4win#configurability
---
# btop.conf: look-related options

`btop.conf` is auto-generated on first run; all options are editable in the UI (Esc > Options). Location: `$XDG_CONFIG_HOME/btop/` or `~/.config/btop/` on Linux/macOS; for btop4win, the folder of `btop4win.exe`.

## Config
```
color_theme = "tmt"            # "Default", "TTY" or a themes/<name>.theme
theme_background = true        # false: transparent terminal background
truecolor = true               # false: convert to 256 colors
force_tty = false              # true: 16 colors + TTY theme
rounded_corners = true         # ignored in TTY mode
graph_symbol = "braille"       # "braille" | "block" | "tty"
graph_symbol_cpu = "default"   # per box: cpu, mem, net, proc
update_ms = 2000               # >= 2000 recommended for good sample times
```
Edit only keys you change; btop saves its settings from the UI, so close btop before editing the file by hand.

## Notes
- Braille graphs need a font with U+2800..U+28FF; Windows consoles default to `tty` for that reason (btop4win README). Cascadia Code and Nerd Fonts have them.
- Presets for box layout (`presets = "cpu:0:default,mem:0:tty,proc:1:default"`, up to 9) are space-separated; see the sample config in the README.
- Lower `update_ms` raises CPU use; the monitoring cost is part of the shell budget only if btop is auto-started (do not).
- btop4win keeps `btop.conf`, logs and `themes/` beside the executable: a reinstall or scoop upgrade can wipe edits.
