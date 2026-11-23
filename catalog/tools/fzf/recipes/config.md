---
capability: config
tool: fzf
os: windows, macos, linux
verified: 2026-11-23 (docs, fzf 0.75.0 README)
sources: https://github.com/junegunn/fzf#environment-variables, https://github.com/junegunn/fzf#tips
---
# Configure fzf layout and behavior

fzf has no config file. Options live in `FZF_DEFAULT_OPTS` (a string) or in a file named by `FZF_DEFAULT_OPTS_FILE` (one option per line). Widget-specific options go in `FZF_CTRL_T_OPTS`, `FZF_CTRL_R_OPTS`, `FZF_ALT_C_OPTS`.

## Config
Options file (`~/.config/fzf/fzfrc`), loaded with `export FZF_DEFAULT_OPTS_FILE=~/.config/fzf/fzfrc`:
```
--layout=reverse
--height=40%
--border=sharp
--info=inline-right
--prompt='> '
--pointer='>'
--marker='+'
--cycle
--scroll-off=3
--bind=ctrl-/:toggle-preview
```
Popup instead of in-place (README: requires tmux 3.3+ or Zellij 0.44+; silently ignored elsewhere):
```sh
export FZF_DEFAULT_OPTS='--height 40% --popup bottom,40% --layout reverse --border top'
```
Windows PowerShell: `[Environment]::SetEnvironmentVariable('FZF_DEFAULT_OPTS_FILE', "$HOME\.config\fzf\fzfrc", 'User')` (new shells only).

## Notes
- `--height` below 100% keeps scrollback visible; full-screen is the default. `--layout=reverse` puts the prompt on top like most prompt-first UIs.
- `--popup` is a no-op outside tmux/Zellij; use `--height` for plain terminals. Old tmux: the `fzf-tmux` script.
- `FZF_DEFAULT_OPTS` is read on every fzf call, not only the shell widgets; keep it small. Never put `--preview` there (README).
- Colors: see `theme.md`. Search defaults: `--smart-case`-like behavior is default; `--exact` changes matching to exact.
- Verify: `fzf --help | head`; `FZF_DEFAULT_OPTS_FILE=... fzf --version` still works; options errors print on the first run of the picker.
