---
capability: config-reload
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/, https://sw.kovidgoyal.net/kitty/invocation/
---
# Config reload in kitty
kitty reloads automatically when the config file changes (`auto_reload_config`), or manually with `ctrl+shift+f5` (macOS `ctrl+cmd+,`) or by sending `SIGUSR1`.
## Config
```
map ctrl+shift+f5 load_config_file
# alternative file (replaces, does not merge):
# map f5 load_config_file /path/to/alternative/kitty.conf
```
## Notes
- Some options need a full restart, notably macOS global menu bar shortcuts. `dynamic_background_opacity` must be on at start for opacity reloads to apply.
- Reload from a script: `kill -SIGUSR1 $(pgrep -x kitty)`; `kitten themes --reload-in=all` reloads every instance.
- Debug the effective config: `debug_config` (ctrl+shift+f6) shows config and environment. No standalone validator was found in the docs.
- Launch with overrides: `kitty --config <file>`, `kitty -o name=value` (repeatable); `--config NONE` skips the config.
