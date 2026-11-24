---
capability: config
tool: pipes-rs
os: windows, macos, linux
verified: 2026-11-23 (docs: README configuration and options tables; not run)
sources: https://github.com/lhvy/pipes-rs#configuration
---
# pipes-rs options

Flags or an optional TOML file at `~/.config/pipes-rs/config.toml` (README gives this path for all OSes; on Windows prefer flags, see `tool.json`). The animation fills its pane.

## Config
Defaults from the README:
```toml
bold = true
color_mode = "ansi"        # ansi | rgb | none
palette = "default"        # default | darker | pastel | matrix (rgb mode)
rainbow = 0                # 0-255 degrees of hue shift per frame (rgb mode)
delay_ms = 20
inherit_style = false
kinds = ["heavy"]          # heavy light curved knobby emoji outline dots blocks sus
num_pipes = 1
reset_threshold = 0.5      # 0.0-1.0 fraction of the screen filled before reset
turn_chance = 0.15         # 0.0-1.0
```
Flags (README options table): `-b true|false` bold, `-c ansi|rgb|none`, `-d MS` delay, `-i true|false` inherit style at edges, `-k a,b` kinds, `-p N` pipes, `-r F` reset threshold, `-t F` turn chance, `--palette NAME`, `--rainbow N`.

Pane commands for a dashboard:
```
pipes-rs -c ansi -b false -p 4 -k heavy,curved -d 40 -t 0.2 -r 0.6   # calm, 4 pipes
pipes-rs -c ansi -p 1 -k knobby -d 25                                 # single pipe
```

## Notes
- `-d` is the delay in milliseconds between frames: raise it (30 to 50) to lower CPU use when several animated panes run.
- The README does not say which wins when a flag and the config file disagree. Keep the file out of a reproducible build; the pane command is enough.
