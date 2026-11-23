---
capability: line-editing
tool: zsh
os: macos, linux
verified: 2026-11-23 (docs; plugin option names from the zsh-autosuggestions and zsh-syntax-highlighting READMEs)
sources: https://zsh.sourceforge.io/Doc/Release/Zsh-Line-Editor.html, https://github.com/zsh-users/zsh-autosuggestions, https://github.com/zsh-users/zsh-syntax-highlighting
---
# Line editing in zsh (ZLE) with fish-style suggestions
ZLE is built in (emacs or vi keymaps, widgets, multiline buffers). Autosuggestions and syntax highlighting come from two small plugins; source them at the end of `~/.zshrc`.

## Config
```zsh
bindkey -e                       # emacs keymap (default if EDITOR is not vi); `bindkey -v` for vi
export KEYTIMEOUT=10             # 0.1 s ESC wait in vi mode (default 40)

# install: brew install zsh-autosuggestions zsh-syntax-highlighting
#          apt/dnf: zsh-autosuggestions zsh-syntax-highlighting   pacman: same names
ZSH_AUTOSUGGEST_STRATEGY=(history completion)
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=#6e6264'
ZSH_AUTOSUGGEST_BUFFER_MAX_SIZE=80

source "$(brew --prefix 2>/dev/null)/share/zsh-autosuggestions/zsh-autosuggestions.zsh" 2>/dev/null \
  || source /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh
# must be LAST (after autosuggestions and any zle -N widgets)
source "$(brew --prefix 2>/dev/null)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" 2>/dev/null \
  || source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
# the plugin declares ZSH_HIGHLIGHT_STYLES; set styles after sourcing it
ZSH_HIGHLIGHT_STYLES[comment]='fg=#6e6264'
ZSH_HIGHLIGHT_STYLES[unknown-token]='fg=red,bold'
```
Arch paths: `/usr/share/zsh/plugins/zsh-autosuggestions/` and `/usr/share/zsh/plugins/zsh-syntax-highlighting/`.

## Notes
- Right arrow or End accepts the whole suggestion; `forward-word` accepts one word (README).
- `zsh-syntax-highlighting` wraps/hooks ZLE and must be sourced after everything that adds widgets; with autosuggestions, source autosuggestions first.
- `ZSH_AUTOSUGGEST_STRATEGY` entries: `history`, `completion` (uses `zpty`, costs more), `match_prev_cmd`.
- `ZSH_HIGHLIGHT_MAXLENGTH=300` disables highlighting on very long lines; each plugin adds a few ms at startup and work per keystroke, so keep to these two.
- `zle -N name` + `bindkey '^X^E' name` registers your own widgets; `zle -la` lists widgets; `bindkey` (no args) lists current keys.
- Edit the command line in `$EDITOR`: `autoload -Uz edit-command-line; zle -N edit-command-line; bindkey '^Xe' edit-command-line`.
