---
capability: line-editing
tool: bash
os: windows, macos, linux
verified: 2026-11-23 (machine, readline settings used in the Eclipse preset on bash 5.3.9; docs for the rest)
sources: https://tiswww.case.edu/php/chet/readline/rluserman.html, https://www.gnu.org/software/bash/manual/html_node/Readline-Init-File-Syntax
---
# Line editing in bash (GNU Readline)
Bash edits lines with Readline, configured in `~/.inputrc` (or `bind` in `.bashrc`). It gives emacs/vi modes, completion display options and history search; there are no autosuggestions or syntax highlighting without a plugin.

## Config
`~/.inputrc`:
```
$include /etc/inputrc          # keep the distro / Git for Windows defaults
set editing-mode emacs         # or: vi
set bell-style none
set enable-bracketed-paste on
set show-all-if-ambiguous on   # one Tab lists matches
set completion-ignore-case on
set completion-map-case on     # - and _ match each other
set colored-stats on           # LS_COLORS in completion lists
set colored-completion-prefix on
set mark-symlinked-directories on
set history-preserve-point on
$if mode=emacs
  "\e[A": history-search-backward   # Up/Down search by typed prefix
  "\e[B": history-search-forward
$endif
```
The same settings from `.bashrc`, no file needed: `bind 'set show-all-if-ambiguous on'`.

## Notes
- Reload without restarting: `bind -f ~/.inputrc` (or `Ctrl-x Ctrl-r`). List everything: `bind -v` (variables), `bind -P` (functions and keys).
- `$include /etc/inputrc` first: once `~/.inputrc` exists, bash does not read `/etc/inputrc` on its own.
- Autosuggestions and highlighting: ble.sh provides both but costs 24-60 ms per keystroke and ~0.9 s per new tab on Windows (measured); acceptable on Linux/macOS. Without it, the readline options above give the closest zsh/fish feel.
- `INPUTRC=/path` overrides the init file location.
- Bracketed paste is on by default since readline 8.1 (bash 5.1); set it explicitly for older builds.
