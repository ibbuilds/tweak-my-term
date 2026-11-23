---
capability: config-reload
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/config/automatically_reload_config.html, https://wezterm.org/config/files.html
---
# Config reload in WezTerm
WezTerm watches the config file and reloads it on change (`automatically_reload_config = true`, the default). Most options apply immediately. Force a reload with `CTRL+SHIFT+R`.

## Config
```lua
config.automatically_reload_config = true
config.keys = {
  { key = 'r', mods = 'CTRL|SHIFT', action = wezterm.action.ReloadConfiguration },
}
```

## Notes
- The file may be evaluated several times per process (start and every reload). Keep it free of side effects.
- A broken config shows an error and leaves the previous or default settings in place (current versions do not silently ignore a file that fails to parse).
- `wezterm --config key=value` overrides survive reloads, and per-window overrides (`window:set_config_overrides`) are re-applied on top.
- Path used: `--config-file`, then `$WEZTERM_CONFIG_FILE`, then `$XDG_CONFIG_HOME/wezterm/wezterm.lua`, then `~/.config/wezterm/wezterm.lua`, then `~/.wezterm.lua`. If both `~/.config/wezterm/wezterm.lua` and `~/.wezterm.lua` exist, the former wins.
- Restart-only items such as the front end (`front_end`) may need a new window.
