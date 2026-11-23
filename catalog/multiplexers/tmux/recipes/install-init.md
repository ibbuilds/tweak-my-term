---
capability: install-init
tool: tmux
os: macos, linux
verified: 2026-11-23 (docs, tmux 3.8)
sources: https://github.com/tmux/tmux/wiki/Installing, https://github.com/tmux/tmux/wiki/FAQ
---
# Install tmux and write a base config
Install with the system package manager, then create `~/.tmux.conf` (or `~/.config/tmux/tmux.conf`, tmux 3.2+). Not available natively on Windows: use WSL, or Zellij.

## Config
Install: `brew install tmux`, `apt install tmux`, `dnf install tmux`, `pacman -S tmux`. Check with `tmux -V`.

```tmux
# ~/.tmux.conf  -- sensible base
set -g default-terminal "tmux-256color"
set -as terminal-features ",xterm-256color:RGB"   # true colour for hex styles (tmux >= 3.2)
set -g history-limit 50000
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on
set -g mouse on
set -g focus-events on
set -sg escape-time 10
set -g status-interval 5
bind r source-file ~/.tmux.conf \; display "reloaded"
```
Reload a running server: `tmux source-file ~/.tmux.conf`. Try a config on a separate server: `tmux -L test -f ~/new.conf new -s trial` then `tmux -L test kill-server`. Check syntax without running it (tmux wiki): `tmux -f /dev/null new -d; tmux source -n ~/.tmux.conf` (`-v` prints each parsed command).

## Notes
- `default-terminal` must be a `screen*`/`tmux*` entry, never `xterm-256color`. If tmux reports "missing or unsuitable terminal: tmux-256color", install ncurses terminfo (`brew install ncurses`, `apt install ncurses-term`), or use `screen-256color`.
- RGB: tmux must be told the outer terminal supports it (`terminal-features ...:RGB`, or `terminal-overrides ",xterm*:Tc"` on older tmux). Newer versions (3.6+) also honour `COLORTERM=truecolor`, per a secondary source. Test: `printf '\033[38;2;255;100;0mORANGE\033[0m\n'`.
- Many options only apply to panes/servers created after the change: `tmux kill-server` to be sure.
- After upgrading tmux, restart the server (`tmux kill-server`); running old servers reject newer clients.
- Windows: no native tmux. Third-party psmux (winget `marlocarlo.psmux`) offers tmux-like commands; compatibility unverified.
