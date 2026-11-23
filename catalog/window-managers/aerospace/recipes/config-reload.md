---
capability: config-reload
tool: aerospace
os: macos
verified: 2026-11-23 (docs, aerospace 0.21.3-Beta)
sources: https://nikitabobko.github.io/AeroSpace/commands, https://nikitabobko.github.io/AeroSpace/guide
---
# Reload the AeroSpace config
```sh
aerospace reload-config --dry-run --no-gui   # validate only; exit 0 = no errors, errors go to stdout
aerospace reload-config                      # apply; on errors a diagnostics window opens
aerospace run-callback --for-every-window on-window-detected   # re-apply window rules to open windows
```

## Notes
- `--dry-run` checks the config at its normal path, not a staged draft. Validate after the file is in place and keep the previous file to restore on failure.
- Warnings go to stderr and open no window; `--warnings-as-errors` makes them fail the command.
- `auto-reload-config = true` reloads on every save (reload once by hand to turn it on).
- `aerospace config --config-path` prints which file is loaded.
- A reload does not move windows already placed; run the `run-callback` line to re-apply rules.
