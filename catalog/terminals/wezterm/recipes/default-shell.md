---
capability: default-shell
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/config/default_prog.html, https://wezterm.org/config/launch.html
---
# Default shell in WezTerm
Set `config.default_prog` to an argv array. Without it WezTerm runs the login shell from the password database on macOS/Linux (it ignores `$SHELL` on purpose) and `%COMSPEC%` (cmd.exe) on Windows.

## Config
```lua
-- Windows: PowerShell
config.default_prog = { 'powershell.exe', '-NoLogo' }
-- Windows: Git Bash (adjust the path to the install)
-- config.default_prog = { 'C:/Program Files/Git/usr/bin/bash.exe', '-i', '-l' }
-- macOS / Linux
-- config.default_prog = { '/usr/bin/zsh', '-l' }
```

## Notes
- Do not change `COMSPEC` to switch shells (documented as not recommended); use `default_prog`.
- Element 0 is the program, the rest are arguments. The shell spawns as a login shell on POSIX (argv0 prefixed with `-`) when no `default_prog` is set.
- Branch by OS with `wezterm.target_triple` (`x86_64-pc-windows-msvc` on Windows) when one config serves several machines.
- `config.exit_behavior` ('CloseOnCleanExit' default, 'Close', 'Hold') controls what happens when the shell exits; use 'Hold' while debugging a startup failure so the error stays visible.
- `wezterm start -- <prog>` launches a one-off program.
