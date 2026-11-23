---
capability: integration
tool: eza
os: windows, macos, linux
verified: 2026-11-23 (docs; alias set taken from a working bash config on Windows 11, eza 0.23.5)
sources: https://github.com/eza-community/eza/blob/main/man/eza.1.md, https://github.com/eza-community/eza#readme
---
# Replace ls with eza in each shell

eza is a normal command; integration is aliases/functions. Use `--icons=auto` so icons appear only on a TTY, and keep the interactive aliases out of non-interactive shells so scripts keep real `ls`.

## Config
bash / zsh:
```sh
_eza='eza --group-directories-first --icons=auto --color=auto'
alias ls="$_eza --hyperlink=auto"
alias l="$_eza -a --hyperlink=auto"
alias ll="$_eza -la --hyperlink=auto --git --time-style=relative --no-user --header"
alias la="$_eza -la --hyperlink=auto --git --time-style=long-iso"
alias lt="$_eza --tree --hyperlink=auto --level=2 -a --git-ignore --ignore-glob='.git|node_modules'"
unset _eza
```
fish:
```fish
alias ls 'eza --group-directories-first --icons=auto'
alias ll 'eza -la --git --header --time-style=relative'
alias lt 'eza --tree --level=2 --git-ignore'
```
PowerShell (aliases cannot carry arguments; use functions, and remove the built-in `ls` alias first):
```powershell
Remove-Item Alias:ls -ErrorAction SilentlyContinue
function ls { eza --group-directories-first --icons=auto @args }
function ll { eza -la --git --header --time-style=relative @args }
function lt { eza --tree --level=2 --git-ignore @args }
```
Tree/preview use in other tools: `eza --tree --level=2 --color=always --icons=always {}` as an fzf `--preview` (see fzf integration).

## Notes
- `--icons=auto` needs a Nerd Font (see the nerd-fonts entry); `EZA_ICON_SPACING=2` adds space when icons overlap the name.
- `--hyperlink=auto` makes names clickable in terminals that support OSC 8 (Windows Terminal, WezTerm, kitty, iTerm2, Ghostty); safe elsewhere.
- `--git` adds a per-file git column and costs time in large repos; omit it from the plain `ls`.
- `--group-directories-first` is the eza flag name (also `--group-directories-last`).
- `ls` colors for other tools: eza reads `LS_COLORS`; if your shell exports one, eza and fd stay consistent.
- Check: `eza --version`, `type ls` (alias/function), `ls --icons=always` renders icons.
