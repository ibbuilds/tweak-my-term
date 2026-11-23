---
capability: completion
tool: zsh
os: macos, linux
verified: 2026-11-23 (docs, zsh manual "Completion System"; community profiling write-ups)
sources: https://zsh.sourceforge.io/Doc/Release/Completion-System.html, https://zsh.sourceforge.io/Doc/Release/Completion-Widgets.html
---
# Completion in zsh (compsys)
Enable the completion system once with `compinit`; style it with `zstyle`. Run `compinit` exactly once, after `fpath` is final, and cache its dump.

## Config
```zsh
# extra completions (brew's site-functions, zsh-completions, tool-generated files) BEFORE compinit
fpath=(${HOMEBREW_PREFIX:+$HOMEBREW_PREFIX/share/zsh/site-functions} ~/.config/zsh/completions $fpath)

autoload -Uz compinit
_zcd=${XDG_CACHE_HOME:-$HOME/.cache}/zsh/zcompdump
mkdir -p ${_zcd:h}
# full rebuild when the dump is older than a day, otherwise skip the security scan (-C)
_old=($_zcd(N.mh+24))            # non-empty when the dump file is older than 24 h
if (( $#_old )) || [[ ! -e $_zcd ]]; then compinit -d $_zcd; else compinit -C -d $_zcd; fi
unset _zcd _old

zstyle ':completion:*' menu select                         # arrow-key menu
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}' 'r:|[._-]=* r:|=*'   # case-insens + partial
zstyle ':completion:*' list-colors ${(s.:.)LS_COLORS}      # color like ls
zstyle ':completion:*' use-cache on
zstyle ':completion:*' cache-path ${XDG_CACHE_HOME:-$HOME/.cache}/zsh/zcompcache
bindkey '^[[Z' reverse-menu-complete                       # Shift-Tab
```
Tool-provided completions: `mytool completion zsh > ~/.config/zsh/completions/_mytool` (file must be named `_mytool` and be on `fpath`).

## Notes
- Duplicate `compinit` calls (oh-my-zsh plus your own) are a common 200+ ms waste; `zprof` shows `compinit` with 2 calls.
- `compinit -C` skips the insecure-directory check and the dump regeneration check; delete `zcompdump*` after installing new completion files.
- Debug: `_complete_help` (Ctrl-x h) on a word shows which completer ran.
- `compdef _gnu_generic mytool` gives `--help`-based completion for tools without a completion function.
- Case/partial matching syntax is documented under `matcher-list`; the one above is the widely used form.
