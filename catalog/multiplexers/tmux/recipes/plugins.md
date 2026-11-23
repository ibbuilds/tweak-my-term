---
capability: plugins
tool: tmux
os: macos, linux
verified: 2026-11-23 (docs, TPM README)
sources: https://raw.githubusercontent.com/tmux-plugins/tpm/master/README.md
---
# Plugins with TPM
TPM (tmux plugin manager) clones plugins from git into `~/.tmux/plugins/` and sources them. It needs tmux 1.9+, git and bash (tested on Linux, macOS and Cygwin).

## Config
Install TPM:
```sh
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```
Bottom of `~/.tmux.conf` (`$XDG_CONFIG_HOME/tmux/tmux.conf` also works):
```tmux
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
# set -g @plugin 'github_username/plugin_name'
# set -g @plugin 'github_username/plugin_name#branch'
# set -g @plugin 'git@github.com:user/plugin'

# keep this line at the very bottom
run '~/.tmux/plugins/tpm/tpm'
```
Reload: `tmux source ~/.tmux.conf`. Then press `prefix` + `I` (capital i) to install, `prefix` + `U` to update, `prefix` + `Alt-u` to remove plugins deleted from the list.

Commonly used plugins (names only; check each README): `tmux-plugins/tmux-sensible`, `tmux-plugins/tmux-resurrect` (save/restore sessions), `tmux-plugins/tmux-continuum` (automatic saves), `christoomey/vim-tmux-navigator`, `tmux-plugins/tmux-yank`.

## Notes
- Windows: TPM needs bash and tmux; use WSL. Zellij uses WASM plugins instead (see its entry).
- TPM-alternative: `tpack` (drop-in replacement with a TUI), per the TPM README.
- Plugins that rewrite `status-left`/`status-right` (themes) conflict with each other; use one.
- `run` plugin scripts execute arbitrary shell: review plugins before installing them.
- Headless install on a new machine: see TPM docs "Automatic TPM installation".
