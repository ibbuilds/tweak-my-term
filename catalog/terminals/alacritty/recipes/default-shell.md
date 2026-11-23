---
capability: default-shell
tool: alacritty
os: windows, macos, linux
verified: 2026-11-23 (docs, alacritty 0.17.0)
sources: https://alacritty.org/config-alacritty.html
---
# Default shell in Alacritty
`[terminal.shell]` sets the program and its arguments. Default: `$SHELL` or the login shell on Linux, BSD and macOS; `powershell` on Windows.

## Config
```toml
[terminal.shell]
program = "pwsh"          # Windows example; macOS/Linux: "/bin/zsh"
args = ["-NoLogo"]        # macOS/Linux: ["-l"]
```
Start a multiplexer layout instead of a bare shell (Alacritty has no tabs or splits):
```toml
[terminal.shell]
program = "tmux"
args = ["new-session", "-A", "-s", "main"]
```

## Notes
- `working_directory` in `[general]` sets the start folder (`"None"` inherits).
- `[env]` adds environment variables for the shell and anything it spawns.
- A one-off program: `alacritty -e <command> ...` (must be the last argument).
- On Windows use the executable name or full path; prefer a path with forward slashes in TOML or escape backslashes.
- `terminal.osc52` defaults to `"OnlyCopy"` (programs may write the clipboard, not read it).
