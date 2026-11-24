#!/usr/bin/env bash
# Neon District dashboard: attach if it exists, otherwise build the 7-pane layout.
S=dashboard
C=~/.config/neon-district/tmux.conf
have() { command -v "$1" >/dev/null 2>&1; }
cmd() { if have "$1"; then echo "$2"; else echo "bash -l"; fi; }
have tmux || exec bash -l
tmux -f "$C" has-session -t $S 2>/dev/null && exec tmux -f "$C" attach -t $S
split() { tmux split-window -d -P -F '#{pane_id}' "$@"; }
A=$(tmux -f "$C" new-session -d -s $S -n main -P -F '#{pane_id}' "$(cmd fastfetch 'fastfetch; exec bash -l')")
B=$(split -h -t "$A" -l 64% "$(cmd btop btop)")
Y=$(split -v -t "$A" -l 68% "$(cmd yazi yazi)")
V=$(split -h -t "$B" -l 42% "$(cmd cava cava)")
R=$(split -v -t "$B" -l 52% "bash -l")
M=$(split -h -t "$R" -l 42% "$(cmd cmatrix 'cmatrix -b -C magenta')")
K=$(split -v -t "$M" -l 28% "$(cmd tty-clock 'tty-clock -c -C 5 -s')")
tmux select-pane -t "$R"
exec tmux -f "$C" attach -t $S
