---
capability: keybindings
tool: zsh
os: macos, linux
verified: 2026-11-23 (docs, zsh manual "Zsh Line Editor")
sources: https://zsh.sourceforge.io/Doc/Release/Zsh-Line-Editor.html, https://zsh.sourceforge.io/Doc/Release/Zsh-Modules.html
---
# Key bindings in zsh
`bindkey 'sequence' widget` binds keys in the current keymap (`emacs`, `viins`, `vicmd`). Define your own widgets with `zle -N`.

## Config
```zsh
bindkey -e
bindkey '^[[1;5C' forward-word            # Ctrl-Right
bindkey '^[[1;5D' backward-word           # Ctrl-Left
bindkey '^[[3;5~' kill-word               # Ctrl-Delete
bindkey '^H'      backward-kill-word      # Ctrl-Backspace (many terminals)
bindkey '^[[H' beginning-of-line          # Home
bindkey '^[[F' end-of-line                # End
bindkey '^[[3~' delete-char               # Delete
bindkey '^[[Z' reverse-menu-complete      # Shift-Tab

# custom widget: prepend sudo with Alt-s
_sudo_line() { BUFFER="sudo $BUFFER"; CURSOR+=5 }
zle -N _sudo_line
bindkey '^[s' _sudo_line
```
Terminfo-safe form (works across terminals):
```zsh
zmodload zsh/terminfo
typeset -g -A key=( [Home]=${terminfo[khome]} [End]=${terminfo[kend]} [Delete]=${terminfo[kdch1]} )
[[ -n ${key[Home]} ]] && bindkey -- ${key[Home]} beginning-of-line
```

## Notes
- Discover a key's sequence: run `cat -v` (or `read -k`/`showkey -a` on Linux) and press it; arrows are `^[[A` (normal) or `^[OA` (application mode) depending on the terminal.
- List: `bindkey` (all), `bindkey | grep word`, `zle -la` (all widgets), `bindkey -M viins` for another keymap.
- `bindkey -s '^o' 'ls\n'` types text instead of calling a widget.
- Widget variables: `BUFFER`, `CURSOR`, `LBUFFER`, `RBUFFER`; use `zle accept-line`/`zle redisplay` to act.
- vi mode: `bindkey -v` then set `KEYTIMEOUT=10`; show mode in the prompt via `zle-keymap-select` widget.
- Frameworks (oh-my-zsh, prezto) rebind keys; load yours after them.
