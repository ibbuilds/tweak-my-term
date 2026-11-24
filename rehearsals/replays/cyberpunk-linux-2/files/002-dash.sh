#!/usr/bin/env bash
# neon-grid dashboard: attach to session "dash", building it on first run
S=dash
command -v tmux >/dev/null || exec bash -l   # tmux not installed yet: plain shell, never a dead window
if ! tmux has-session -t "$S" 2>/dev/null; then
  fetch=$(tmux new-session -d -s "$S" -n grid -P -F '#{pane_id}' 'fastfetch; exec bash')
  shell=$(tmux split-window -v -l 70% -t "$fetch" -P -F '#{pane_id}')          # left bottom: your shell
  btop=$(tmux split-window -h -l 42% -t "$fetch" -P -F '#{pane_id}' 'btop')    # right column
  cava=$(tmux split-window -v -l 30% -t "$btop" -P -F '#{pane_id}' 'cava')
  matrix=$(tmux split-window -v -l 45% -t "$btop" -P -F '#{pane_id}' 'cmatrix -ab')
  tmux split-window -h -l 50% -t "$matrix" 'pipes.sh'
  tmux select-pane -t "$shell"
fi
exec tmux attach -t "$S"
