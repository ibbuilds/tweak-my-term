---
capability: keybindings
tool: bash
os: windows, macos, linux
verified: 2026-11-23 (machine, Windows Terminal + Git Bash on Windows 11; docs for the rest)
sources: https://tiswww.case.edu/php/chet/readline/rluserman.html, https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins
---
# Key bindings in bash
Bind keys to readline functions in `~/.inputrc`, or to shell commands with `bind -x` in `.bashrc`.

## Config
`~/.inputrc` (keymap syntax: `"keyseq": function`):
```
"\e[1;5C": forward-word          # Ctrl-Right
"\e[1;5D": backward-word         # Ctrl-Left
"\C-h": backward-kill-word       # Ctrl-Backspace in Windows Terminal
"\e[3;5~": kill-word             # Ctrl-Delete
"\e[Z": menu-complete-backward   # Shift-Tab
"\ee": edit-and-execute-command  # Alt-e opens $EDITOR
```
`.bashrc` (run a shell command, with the line in `READLINE_LINE`):
```bash
bind -x '"\C-g": git status -sb'
```

## Notes
- Find a key's byte sequence: press `Ctrl-v` then the key (prints e.g. `^[[1;5C`), or run `cat -v` and press it. Terminals differ, so bind both `\e[A` and `\eOA` style variants for arrows.
- Inspect: `bind -P` (all functions and keys), `bind -p | grep forward-word`, `bind -l` (function names). Unbind: `bind -r "\C-g"`.
- `bind -x` handlers can read and set `READLINE_LINE`/`READLINE_POINT`; they cost one function call per press, not per keystroke.
- Windows Terminal sends `^H` for Ctrl-Backspace; other terminals send `\C-?` or `\e\C-?`. Check first.
- Modal: `$if mode=emacs ... $endif`, `$if mode=vi`, and `$if term=xterm` scope bindings.
