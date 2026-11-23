---
capability: palette
tool: tmux
os: macos, linux
verified: 2026-11-23 (docs, tmux 3.8)
sources: https://github.com/tmux/tmux/wiki/Getting-Started, https://github.com/tmux/tmux/blob/master/tmux.1, https://github.com/tmux/tmux/wiki/FAQ
---
# Colours: status line, panes, messages, copy-mode
tmux colours are set with `*-style` options. A colour is a name (`black red green yellow blue magenta cyan white`, `bright*`), `colour0`-`colour255`, `default`, `terminal`, or hex `#rrggbb`. Use `fg=`, `bg=` and attributes (`bold`, `reverse`...).

## Config
```tmux
# ~/.tmux.conf   (replace {palette.*} with the look's hex values)
set -as terminal-features ",xterm-256color:RGB"

set -g status-style               "bg={palette.background},fg={palette.foreground}"
set -g message-style              "bg={palette.accent},fg={palette.background},bold"
set -g message-command-style      "bg={palette.background},fg={palette.accent}"
set -g mode-style                 "bg={palette.selectionBackground},fg={palette.selectionForeground}"
set -g pane-border-style          "fg={palette.ansi.brightBlack}"
set -g pane-active-border-style   "fg={palette.accent}"
setw -g window-status-style         "fg={palette.ansi.brightBlack}"
setw -g window-status-current-style "fg={palette.accent},bold"
setw -g window-status-activity-style "fg={palette.ansi.yellow}"
set -g display-panes-colour        "{palette.ansi.brightBlack}"
set -g display-panes-active-colour "{palette.accent}"
set -g clock-mode-colour           "{palette.accent}"

# dim inactive panes (optional)
setw -g window-style        "bg={palette.background}"
setw -g window-active-style "bg={palette.background}"
```
Use the terminal's own palette instead of hex by naming ANSI colours (`fg=blue`, `fg=brightblack`): they follow the terminal scheme and need no RGB setup. Transparent status bar: `set -g status-style "bg=default"`.

## Notes
- Hex colours render muddy unless tmux knows the outer terminal supports RGB (`terminal-features ...:RGB`); see install-init.
- Old options `status-bg`, `pane-border-fg`, `mode-bg` etc. were removed in tmux 2.9: use `*-style`.
- `display-panes-colour`, `clock-mode-colour` are colour options, not style options: use `set -gF` if you feed them a format like `#{@my_colour}`.
- Style options set with `set -g` are global; `setw -g` for window options. A window-level style overrides the global one.
