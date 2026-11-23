---
capability: layouts
tool: tmux
os: macos, linux
verified: 2026-11-23 (docs, tmux 3.8)
sources: https://github.com/tmux/tmux/wiki/Getting-Started, https://github.com/tmux/tmux/wiki/Advanced-Use
---
# Splits, preset layouts and startup layouts
tmux has no layout file format: arrange panes with commands, preset layouts, or a layout string, and script startup with a shell script or `tmux source`d config.

## Config
```tmux
# ~/.tmux.conf : splits that keep the working directory
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
bind c new-window -c "#{pane_current_path}"
unbind '"'
unbind %
# preset layouts: even-horizontal even-vertical main-horizontal main-vertical tiled
bind = select-layout tiled
```
Startup layout script (run from a shell; `-d` creates detached):
```sh
tmux new-session -d -s dev -n edit -c ~/project 'nvim .'
tmux split-window -h -t dev:edit -c ~/project -l 30%
tmux split-window -v -t dev:edit.2 -c ~/project
tmux new-window -t dev -n run -c ~/project
tmux select-window -t dev:edit
tmux attach -t dev
```
Capture and restore an exact layout: `tmux list-windows -F '#{window_layout}'` prints a layout string; `tmux select-layout "<string>"` re-applies it. Auto-start a session when the server starts by putting `new-session -d -s main` in `~/.tmux.conf`.

## Notes
- Percent sizes: `-l 30%` (tmux 3.1+; older uses `-p 30`).
- Resurrection across reboots is a plugin job (tmux-resurrect / tmux-continuum via TPM); tmux itself keeps sessions only while the server runs.
- Zellij, by contrast, has declarative KDL layout files.
- `set -g remain-on-exit on` keeps dead panes visible, useful for command panes.
