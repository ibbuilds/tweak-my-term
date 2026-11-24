#!/usr/bin/env bash
# neon-grid dashboard: btop | fastfetch / (yazi | lazygit) / shell. Falls back to plain bash.
command -v tmux >/dev/null 2>&1 || exec bash -l
S=neon
if tmux has-session -t "$S" 2>/dev/null; then exec tmux attach -t "$S"; fi
run() { command -v "$1" >/dev/null 2>&1 && printf '%s' "$2" || printf '%s' "echo '$1 not installed'; exec bash"; }
hold() { printf '%s; while :; do sleep 3600; done' "$1"; }
left=$(tmux new-session -d -s "$S" -n dash -x "$(tput cols)" -y "$(tput lines)" -P -F '#{pane_id}' "$(run btop btop)")
top=$(tmux split-window -h -t "$left" -l 55% -P -F '#{pane_id}' "$(run fastfetch "$(hold fastfetch)")")
mid=$(tmux split-window -v -t "$top" -l 70% -P -F '#{pane_id}')
tmux split-window -v -t "$mid" -l 43% -P -F '#{pane_id}' >/dev/null
tmux split-window -h -t "$mid" -l 50% "$(run lazygit lazygit)"
tmux send-keys -t "$mid" yazi Enter
tmux select-pane -t "$(tmux list-panes -t "$S:dash" -F '#{pane_id}' | tail -1)"
exec tmux attach -t "$S"
