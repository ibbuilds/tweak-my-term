---
capability: history-search
tool: ble.sh
os: windows, macos, linux
verified: 2026-11-23 (docs, ble.sh 0.4 devel)
sources: https://github.com/akinomyoga/ble.sh/wiki/Manual-%C2%A73-Key-binding, https://github.com/akinomyoga/ble.sh/wiki/Manual-%C2%A77-Completion, https://raw.githubusercontent.com/akinomyoga/ble.sh/master/README.md
---
# History search
ble.sh provides incremental history search (keymaps `isearch` and `nsearch`), history-based auto-complete, dynamic abbreviation (`dabbrev`) and hooks for fzf/atuin integration.

## Config
```bash
# ~/.blerc
# fzf integration (load bash_completion first if you use it)
ble-import -d integration/fzf-completion
ble-import -d integration/fzf-key-bindings      # C-r, C-t, M-c via fzf
```
Atuin: with ble.sh >= 0.4 loaded in `~/.bashrc`, add `eval "$(atuin init bash)"` after it (see the atuin entry).

Built-in: `C-x C-r` starts dabbrev expansion (words from history), then `C-r`/`C-s` cycle. Filter history entries before saving with a hook:
```bash
function my/addhistory.hook { local c=$1; [[ $c != 'secret *' ]]; }
blehook ADDHISTORY=my/addhistory.hook
```

## Notes
- `-d` on `ble-import` delays initialisation until ble.sh is attached so the integration does not slow shell start.
- History auto-complete (`complete_auto_history`) is the fish-style "suggest from history" feature; see the suggestions recipe.
- If fzf bindings do not take effect, see the README section on fzf with ble.sh (load order matters).
