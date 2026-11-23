---
capability: right-prompt
tool: starship
os: windows, macos, linux
verified: 2026-11-23 (docs, starship 1.27.0)
sources: https://starship.rs/advanced-config/, https://starship.rs/config/
---
# Right-aligned prompt
Set `right_format` to put modules on the right of the first input line. The `$all` variable then contains only modules not used in `format` or `right_format`.

## Config
```toml
# ~/.config/starship.toml
format = "$directory$git_branch$character"      # left
right_format = "$cmd_duration$time"             # right

[time]
disabled = false
format = "[$time]($style)"
```
Move everything right and keep a bare left prompt:
```toml
format = "$character"
right_format = "$all"
```
Supported shells per the docs: elvish, fish, zsh, xonsh, cmd, nushell and bash. In bash it needs ble.sh (v0.4 or higher) or Flyline (v1.7.1 or higher). PowerShell is not in the list.

## Notes
- zsh leaves a gap at the right edge by default; `ZLE_RPROMPT_INDENT=0` in `~/.zshrc` removes it (cheat-sheet tip, not from the main docs).
- The right prompt is a single line next to the input; it is hidden when the typed command is long enough to reach it.
- Windows PowerShell 5.1/7: no Starship right prompt. Use Oh My Posh (`rprompt` block) if you need one there.
- Combine with a transient right prompt (see the transient recipe) to clear the clock from scrollback.
