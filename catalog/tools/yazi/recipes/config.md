---
capability: config
tool: yazi
os: windows, macos, linux
verified: 2026-11-23 (docs yazi.toml and configuration overview pages; yazi not installed on the verification machine)
sources: https://yazi-rs.github.io/docs/configuration/overview, https://yazi-rs.github.io/docs/configuration/yazi
---
# yazi.toml: layout, sorting, hidden files

Files: `yazi.toml` (behavior), `keymap.toml`, `theme.toml`, `init.lua`, `flavors/`, `plugins/`. Defaults ship in the binary; your file only needs the keys you change. Defaults are published on the `shipped` tag: https://github.com/sxyazi/yazi/tree/shipped/yazi-config/preset

## Config
Location: `~/.config/yazi/` (Unix), `%AppData%\yazi\config\` (Windows); `YAZI_CONFIG_HOME` overrides.
```toml
# yazi.toml
[mgr]
ratio          = [1, 4, 3]       # parent : current : preview; 0 hides a panel
sort_by        = "natural"       # none mtime btime extension alphabetical natural size random
sort_dir_first = true
sort_reverse   = false
show_hidden    = true
show_symlink   = true
scrolloff      = 5
mouse_events   = ["click", "scroll"]   # click scroll touch move drag; [] disables the mouse

[preview]
wrap     = "no"
tab_size = 2
```
Merging rules: keys in your file override the defaults; for lists such as `[opener]`, `[open]`, `[icon]` rules use `prepend_*`/`append_*` to extend instead of replace (docs "Configuration mixing").

## Notes
- Panel ratio `[0, 1, 0]` gives a single-pane list.
- Verify: start `yazi` in a directory and check the layout; invalid TOML is reported on start (docs recommend taplo for checking).
