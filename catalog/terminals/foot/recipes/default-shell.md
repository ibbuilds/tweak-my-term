---
capability: default-shell
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://man.archlinux.org/man/foot.ini.5
---
# Default shell in foot
`shell` sets the program started in each terminal. Default: `$SHELL`, or the passwd entry.
## Config
```ini
shell=/usr/bin/fish
login-shell=no
term=foot
```
## Notes
- `login-shell=no` is the default. `term=foot` is the default TERM (`xterm-256color` if foot was built with `-Dterminfo=disabled`).
- Override once with `foot -o shell=/usr/bin/zsh` (`-o [SECTION.]KEY=VALUE`, section defaults to main).
- The `[environment]` section sets `name=value` env vars for the client; do not set `TERM` there.
- `title`, `app-id` (`foot`, `footclient` in server mode) and `initial-window-size-chars=COLSxROWS` are other main-section keys.
