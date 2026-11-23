---
capability: history
tool: nushell
os: windows, macos, linux
verified: 2026-11-23 (docs, Nushell configuration reference "History", v0.117)
sources: https://www.nushell.sh/book/config_reference.html, https://www.nushell.sh/commands
---
# History in nushell
History is on by default in a plain-text file in the config directory; you can switch to SQLite for timestamps, duration, exit status, cwd and per-session isolation. Set these in `config.nu`: reedline reads them once at startup.

## Config
```nu
$env.config.history.file_format = "sqlite"        # "plaintext" (default) | "sqlite"
$env.config.history.max_size = 100_000            # plaintext only
$env.config.history.sync_on_enter = true          # plaintext: share new entries between sessions after each command
$env.config.history.isolation = false             # sqlite only: true = hide other sessions' commands while walking history
$env.config.history.ignore_space_prefixed = true  # leading space = not saved (default)
# $env.config.history.path = ($nu.home-dir | path join ".nu_history.txt")   # custom location; null = in-memory only
```
Use it:
```nu
history | where command =~ docker | last 10
history --long                       # sqlite: start time, duration, exit status, cwd, host, session
history import                       # after changing file_format: copy entries from the other format's file
```

## Notes
- File: `history.txt` or `history.sqlite3` in `$nu.default-config-dir` (`$nu.history-path` shows the file in use).
- Changing `file_format`, `max_size`, `isolation` or `path` after startup raises `nu::shell::config_option_locked_after_startup`; edit `config.nu` and restart.
- `nu --no-history` starts without reading or writing history. Commands run with `nu -c` or in scripts are never recorded.
- `max_size` is ignored by SQLite history.
- Secrets: there is no pattern filter built in; use the leading-space rule, or keep secrets in env files read with `open .env | load-env`.
- Ctrl-R opens the history menu (a default binding, kept as long as you extend `keybindings` with `++=`).
