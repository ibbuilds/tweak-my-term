#!/bin/zsh
# Attach to the "dev" tmux session; rebuild the 3-pane layout if it doesn't exist.
LOG="${DEV_LOG:-$HOME/logs/app.log}"
if ! tmux has-session -t dev 2>/dev/null; then
  mkdir -p "$(dirname "$LOG")"; touch "$LOG"
  tmux new-session -d -s dev -n dev -c "$HOME" 'nvim'
  tmux split-window -h -t dev:dev -c "$HOME" -l 40% "tail -f \"$LOG\""
  tmux split-window -v -t dev:dev.2 -c "$HOME"
  tmux select-pane -t dev:dev.1
fi
exec tmux attach -t dev
