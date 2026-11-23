---
capability: config-reload
tool: alacritty
os: windows, macos, linux
verified: 2026-11-23 (docs, alacritty 0.17.0)
sources: https://alacritty.org/config-alacritty.html, https://github.com/alacritty/alacritty/blob/master/extra/man/alacritty.1.scd
---
# Config reload in Alacritty
`general.live_config_reload` (default true) reloads the config file when it changes. Some options need a restart. Alacritty never creates the file or its folder.

## Config
```toml
[general]
live_config_reload = true
import = [
  "~/.config/alacritty/theme.toml",   # loaded in order; the importing file is applied last
]
```

## Notes
- Needs a restart: `window.dimensions`, `window.startup_mode` (documented). Font, colors, opacity and bindings apply live.
- Invalid config produces an error or warning notice in the window (see `ClearLogNotice` action); exact fallback behavior is not documented here, so re-check with `alacritty migrate --dry-run` before saving. The 0.17 changelog fixes a brief error popup when editors save the file in two steps.
- `import` accepts absolute paths, `~/` paths or paths relative to the importing file; missing files are skipped.
- Check a file without opening a window: `alacritty migrate --dry-run --config-file <file>` (prints the migrated TOML to stdout). Without `--dry-run` it rewrites the file in place, so always pass `--dry-run`.
- Run once with another file via `alacritty --config-file <file>` or override a single key: `alacritty -o 'cursor.style.shape="Beam"'`.
- `alacritty msg get-config` prints the active configuration of a running instance (0.16+; needs `general.ipc_socket`, Unix only).
