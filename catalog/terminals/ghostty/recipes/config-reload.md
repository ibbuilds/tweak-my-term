---
capability: config-reload
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config
---
# Config reload in Ghostty
Reload with `ctrl+shift+,` (Linux) or `cmd+shift+,` (macOS), or rebind the `reload_config` action.
## Config
```
keybind = ctrl+shift+comma=reload_config
```
## Notes
- Not everything reloads: `background-opacity` on macOS, `quick-terminal-position` on macOS and `language` need a restart; font and some other options affect only new terminals.
- Validate before reloading: `ghostty +validate-config` (default location) or `ghostty +validate-config --config-file=<path>`. The man page says it validates a config file; the exit code on failure was not confirmed in the official pages (third-party docs say 0 on success).
- Inspect the effective config with `ghostty +show-config` (add `--default --docs` for every option with docs).
- Includes: `config-file = path` (relative to the including file, `?path` for optional); they are processed at the end of the file.
