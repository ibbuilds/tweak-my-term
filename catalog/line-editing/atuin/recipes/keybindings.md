---
capability: keybindings
tool: atuin
os: windows, macos, linux
verified: 2026-11-23 (docs, atuin 18.25.1)
sources: https://docs.atuin.sh/cli/configuration/key-binding/
---
# Key bindings
`atuin init` binds Ctrl-R (search) and Up (search for commands matching the current line). Disable either one, or bind your own keys. These snippets must live in the shell's startup file, in the same place as `atuin init`.

## Config
```zsh
# keep Ctrl-R, drop Up                       # or: --disable-ctrl-r to keep Up only
eval "$(atuin init zsh --disable-up-arrow)"

# bind nothing automatically, then bind yourself
export ATUIN_NOBIND="true"
eval "$(atuin init zsh)"
bindkey '^r' atuin-search
bindkey '^[[A' atuin-up-search      # up arrow (normal mode)
bindkey '^[OA' atuin-up-search      # up arrow (application mode)
```
```bash
export ATUIN_NOBIND="true"
eval "$(atuin init bash)"
atuin-bind '\C-r' atuin-search          # atuin >= 18.10.0
atuin-bind '\e[A' atuin-up-search
atuin-bind '\eOA' atuin-up-search
```
```fish
set -gx ATUIN_NOBIND "true"
atuin init fish | source
bind \cr _atuin_search
bind -M insert \cr _atuin_search
bind \e\[A _atuin_bind_up     # Up
```
Config equivalents: `bind_ctrl_r = false`, `bind_up_arrow = false`, `ctrl_n_shortcuts = true` (use Ctrl-0..9 instead of Alt-0..9, helpful on macOS), `keymap_mode = "emacs" | "vim-insert" | "vim-normal" | "auto"`, `[keys] prefix = 'a'`.

In the UI: Enter runs, Tab edits, Ctrl-R cycles filter modes, Ctrl-S cycles search modes, Alt-1..9 pick an entry, Ctrl-O opens the inspector, Ctrl-A then d deletes the entry, Esc/Ctrl-G/Ctrl-C returns the original line.

## Notes
- Up-arrow binding is contentious: give it its own filter with `filter_mode_shell_up_key_binding = "directory"` or turn it off.
- PowerShell and nushell have different binding mechanisms; for nushell append a `keybindings` entry using `_atuin_search_cmd` (docs example), PowerShell uses the init script's PSReadLine handlers.
- `atuin-search-viins` / `atuin-search-vicmd` start the UI in a specific vim keymap.
