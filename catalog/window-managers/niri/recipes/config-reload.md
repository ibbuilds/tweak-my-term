---
capability: config-reload
tool: niri
os: linux
verified: 2026-11-23 (docs, niri 26.04)
sources: https://github.com/niri-wm/niri/wiki/Configuration:-Introduction, https://github.com/niri-wm/niri/releases/latest
---
# Config reload in niri
The configuration is live-reloaded: saving the file applies it, including binds, outputs and window rules. No restart or reload command is needed.

## Command
```
niri validate -c ~/.config/niri/config.kdl    # parse and report errors, apply nothing
niri msg action load-config-file              # force a load (26.04 adds --path to switch files at runtime)
```

## Notes
- On a bad config niri shows an error notification and keeps the last good one; `config-notification { disable-failed }` hides that popup.
- `include "file.kdl"` splits the config. Since 26.04, `include optional=true "file.kdl"` ignores a missing file and `~` expands in include paths.
- Window rules mostly affect windows opened after the change; opening properties like `default-column-width` do not move existing windows.
- Startup entries (`spawn-at-startup`) do not run again on reload.
