---
capability: statusbar
tool: tmux
os: macos, linux
verified: 2026-11-23 (docs, tmux 3.8)
sources: https://github.com/tmux/tmux/wiki/Getting-Started, https://github.com/tmux/tmux/blob/master/tmux.1
---
# Status line layout
The status line has `status-left`, the window list, and `status-right`. Each takes a format string with `#{variables}`, `strftime` codes (`%H:%M`) and embedded styles `#[fg=...,bg=...]`.

## Config
```tmux
set -g status on
set -g status-position top               # or bottom
set -g status-interval 5                 # seconds between refreshes
set -g status-justify left               # left | centre | right | absolute-centre
set -g status-left-length 40
set -g status-right-length 80

set -g status-left  "#[bold] #S #[default] "
set -g status-right "#{?client_prefix,#[reverse] PREFIX #[default] ,}#h  %a %d %b  %H:%M "

setw -g window-status-format         " #I:#W#{?window_flags,#{window_flags},} "
setw -g window-status-current-format "#[bold] #I:#W#{?window_zoomed_flag, Z,} "
setw -g window-status-separator ""

# one-line status off / second line
# set -g status off
# set -g status 2
# set -g status-format[1] "#[align=centre]second line"
```
Useful variables: `#S` session, `#I` window index, `#W` window name, `#P` pane index, `#h` host, `#{pane_current_path}`, `#{client_prefix}`, `#{window_zoomed_flag}`. Per-pane border text: `set -g pane-border-status top` and `set -g pane-border-format '#[bold]#{pane_title}#[default]'`.

## Notes
- `#(command)` runs a shell command every `status-interval`; cache expensive ones and avoid slow network calls. Literal `%` in shell commands must be doubled (`%%`).
- Styling inside format strings uses the same hex/ANSI colours as the palette recipe; colours must be quoted in the config (`"#[fg=#a6e3a1]"`).
- Status-line plugins (themes, CPU/battery widgets) normally rewrite `status-left`/`status-right`: give the status line one owner.
- Powerline separators need a Nerd Font in the terminal.
