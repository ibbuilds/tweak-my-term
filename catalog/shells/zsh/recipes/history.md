---
capability: history
tool: zsh
os: macos, linux
verified: 2026-11-23 (docs, zsh manual options chapter; community configs)
sources: https://zsh.sourceforge.io/Doc/Release/Options.html, https://wiki.archlinux.org/title/Zsh
---
# Zsh history: file, size, sharing, dedupe
Zsh keeps no history file by default (HISTSIZE 30, not saved). Set `HISTFILE`, `HISTSIZE` and `SAVEHIST` and choose sharing options.

## Config
```zsh
HISTFILE=${XDG_STATE_HOME:-$HOME/.local/state}/zsh/history    # mkdir -p the dir first; or ~/.zsh_history
HISTSIZE=100000                  # in memory
SAVEHIST=100000                  # on disk
setopt EXTENDED_HISTORY          # timestamp + duration
setopt SHARE_HISTORY             # share live between sessions (implies incremental append)
setopt HIST_IGNORE_ALL_DUPS      # drop older duplicates
setopt HIST_IGNORE_SPACE         # leading space = not recorded
setopt HIST_REDUCE_BLANKS
setopt HIST_VERIFY               # show !! expansion before running
HISTORY_IGNORE='(ls|ll|cd|pwd|clear|exit|*TOKEN=*|*PASSWORD=*|*SECRET=*|*API_KEY=*)'   # zsh >= 5.3

autoload -Uz up-line-or-beginning-search down-line-or-beginning-search
zle -N up-line-or-beginning-search; zle -N down-line-or-beginning-search
bindkey '^[[A' up-line-or-beginning-search '^[[B' down-line-or-beginning-search  # prefix search
```

## Notes
- `SHARE_HISTORY` vs `INC_APPEND_HISTORY`: the first also imports other sessions' lines live; the second only writes immediately. Use one of them.
- `HIST_IGNORE_ALL_DUPS` breaks the `match_prev_cmd` strategy of zsh-autosuggestions (README note).
- Create the history directory before first use or zsh silently does not save.
- `fc -l 1` lists everything with numbers, `fc -R` re-reads the file, `history -E` shows timestamps (`EXTENDED_HISTORY`).
- Ctrl-R is `history-incremental-search-backward`; fzf/atuin replace it with fuzzy search (extra dependency).
