---
capability: segments
tool: starship
os: windows, macos, linux
verified: 2026-11-23 (docs, starship 1.27.0)
sources: https://starship.rs/config/, https://starship.rs/presets/
---
# Choose and style segments (modules)
Starship calls segments modules. `format` lists which ones show and in what order; each `[module]` table sets symbol, style and format. Modules appear only in a matching context (git in a repo, node in a Node project).

## Config
```toml
# ~/.config/starship.toml
add_newline = false
format = "$directory$git_branch$git_status$cmd_duration$character"

[directory]
truncation_length = 3
style = "bold blue"

[git_branch]
symbol = " "
format = "[$symbol$branch]($style) "
style = "bold purple"

[git_status]
format = '([\[$all_status$ahead_behind\]]($style) )'

[cmd_duration]
min_time = 2_000                  # ms; show only slow commands
format = "[took $duration]($style) "

[character]
success_symbol = "[❯](bold green)"
error_symbol   = "[❯](bold red)"

[nodejs]
disabled = true                   # any module: disabled = true

[time]
disabled = false                  # off by default
format = "[$time]($style) "
time_format = "%H:%M"

[custom.proxy]                    # your own segment
command = "echo proxy"
when    = '[ -n "$HTTPS_PROXY" ]'  # shell test; use `shell = [...]` on Windows
format  = "[$output]($style) "
```
Presets: `starship preset --list`; `starship preset nerd-font-symbols -o ~/.config/starship.toml` (overwrites the file), `no-nerd-font`, `no-runtimes`, `pastel-powerline`, `tokyo-night`. Format-string rules: `$name` inserts a module/variable, `[text](style)` styles text, `( ... )` is hidden if every variable inside is empty, escape literals with `\$ \[ \]`, and use single-quoted TOML strings so backslashes stay literal.

## Notes
- `$all` (the default `format`) renders every module that has something to show; naming modules explicitly is faster than `$all` because fewer detectors run.
- `starship explain` lists the modules currently visible; `starship module <name>` renders one; `starship module --list` shows names.
- `custom.*` commands run through the shell on every prompt: keep them fast and set `detect_files`/`detect_extensions` or `when` so they run only where relevant. On Windows set `shell = ['pwsh.exe', '-NoProfile', '-Command', '-']` (docs example) and expect 10-60 ms per extra process.
- Icons need a Nerd Font; without one use the `no-nerd-font` preset.
