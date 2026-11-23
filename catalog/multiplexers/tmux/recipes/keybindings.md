---
capability: keybindings
tool: tmux
os: macos, linux
verified: 2026-11-23 (docs, tmux 3.8)
sources: https://github.com/tmux/tmux/wiki/Getting-Started, https://github.com/tmux/tmux/blob/master/tmux.1
---
# Prefix and key bindings
Keys live in key tables: `prefix` (after the prefix key), `root` (no prefix), `copy-mode`, `copy-mode-vi`. The default prefix is `C-b`.

## Config
```tmux
# change the prefix
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# prefix table
bind r source-file ~/.tmux.conf \; display "reloaded"
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R
bind -r H resize-pane -L 5          # -r = repeatable without re-pressing the prefix
bind -r J resize-pane -D 5

# root table: no prefix needed
bind -n M-Left  previous-window
bind -n M-Right next-window

# copy mode
setw -g mode-keys vi
bind -T copy-mode-vi v send -X begin-selection
bind -T copy-mode-vi y send -X copy-selection-and-cancel

set -g mouse on
```
List bindings: `tmux list-keys` (`-T prefix`). Remove one: `unbind <key>`.

## Notes
- `\;` chains commands in a binding; in `source`d files a bare `;` also works.
- Terminals and editors may swallow `M-` (Alt) combos; macOS needs "Option as Meta".
- Extended keys: `set -s extended-keys on` plus `terminal-features ...:extkeys` lets tmux receive modified keys such as `C-Enter` from terminals that support them.
- Atuin's tmux popup (tmux >= 3.2, `[tmux] enabled = true` in Atuin config) adds a history search UI inside tmux.
