---
capability: keybindings
tool: ble.sh
os: windows, macos, linux
verified: 2026-11-23 (docs, ble.sh 0.4 devel)
sources: https://github.com/akinomyoga/ble.sh/wiki/Manual-%C2%A73-Key-binding
---
# Key bindings
Bind key sequences with `ble-bind` in `~/.blerc`. Key specifiers use `C-`, `M-`, `S-` modifiers plus names like `RET`, `TAB`, `ESC`, `SP`, `BS`, `DEL`, `up`, `f1`, and sequences separated by spaces (`C-x C-r`).

## Config
```bash
# bind to a ble.sh widget in a keymap (default keymap if -m omitted)
ble-bind -m emacs -f 'C-m' accept-single-line-or-newline
# bind to a user shell function that edits READLINE_LINE / READLINE_POINT
ble-bind -x 'C-o' 'my_func'
# bind to a command (executed like a command line)
ble-bind -c 'C-t' 'git status'
# macro (0.3+)
ble-bind -s 'M-1' 'echo hello\n'
# tell ble.sh how a terminal sequence decodes
ble-bind -k 'ESC O A' up
# inspect
ble-bind --print          # current bindings
ble-bind --list-widgets   # widget names
```
Keymaps: `emacs` (default), `vi_imap`, `vi_nmap`, `vi_omap`, `vi_xmap`, `vi_smap`, `vi_cmap`, `auto_complete`, `menu_complete`, `isearch`, `nsearch`, `dabbrev`, `safe`. Vim mode: `set -o vi` in bashrc or blerc. Bind after a keymap loads with `blehook/eval-after-load keymap_vi my-func`.

## Notes
- Vim editing mode is a first-class feature; cursor shape per mode needs a terminal supporting DECSCUSR.
- Isolated `ESC` handling: `bleopt decode_isolated_esc=auto|esc|meta`.
- Standard readline `bind` lines in `~/.inputrc` are honoured for the default bindings but `ble-bind` is needed for ble.sh widgets.
- Modern terminals' `modifyOtherKeys` is toggled by ble.sh (`term_modifyOtherKeys_internal`/`_external`); tune if modified keys misbehave in a multiplexer.
