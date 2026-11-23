---
capability: performance
tool: atuin
os: windows, macos, linux
verified: 2026-11-23 (docs, atuin 18.25.1)
sources: https://docs.atuin.sh/cli/configuration/config/, https://docs.atuin.sh/cli/guide/installation/
---
# Performance
Costs are one process at shell start (`atuin init`), history writes on each command, and the search UI when you open it. The optional background daemon makes history writes instant and powers the faster `daemon-fuzzy` search.

## Config
```toml
# ~/.atuin/config.toml
update_check = false           # default true: checks api.atuin.sh at most once per hour
auto_sync = false              # local only (default true but only acts when logged in)

search_mode = "daemon-fuzzy"   # in-memory index in the daemon (18.13+)
[daemon]
enabled = true
autostart = true               # Atuin starts and manages the daemon (launchd on macOS)
sync_frequency = "5m"
# tcp_port = 8889              # used instead of a unix socket on non-Unix systems (Windows)

inline_height = 20             # smaller inline UI than the default 40
```
```sh
atuin config set daemon.autostart true      # CLI equivalents
atuin daemon stop
```

## Notes
- Without the daemon each recorded command spawns an `atuin` process in the preexec/precmd hooks; on Windows that is 10-60 ms per command (the measured range for any extra process on this machine). Daemon support on Windows uses TCP; unverified here.
- Do not cache `atuin init` output blindly: it depends on the installed version and config.
- ble.sh >= 0.4 is the recommended bash backend but costs 24-60 ms per keystroke on Windows Git Bash; bash-preexec is lighter but can misreport duration/exit status.
- Large databases: the prune command (docs: reference/prune) removes entries matching updated filters.
- The tmux popup (`[tmux] enabled = true`, tmux >= 3.2) avoids redrawing over scrollback inside tmux.
