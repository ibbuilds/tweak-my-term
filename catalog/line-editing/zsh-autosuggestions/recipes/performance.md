---
capability: performance
tool: zsh-autosuggestions
os: macos, linux
verified: 2026-11-23 (docs, zsh-autosuggestions 0.7.1)
sources: https://raw.githubusercontent.com/zsh-users/zsh-autosuggestions/master/README.md
---
# Performance
Suggestions are computed on each keystroke. Defaults are cheap: the `history` strategy is a zsh-internal lookup and fetching is asynchronous on zsh >= 5.0.8, so typing is not blocked.

## Config
```zsh
ZSH_AUTOSUGGEST_STRATEGY=(history)          # cheapest; avoid 'completion' unless needed
ZSH_AUTOSUGGEST_BUFFER_MAX_SIZE=20          # stop suggesting for big pasted buffers (README recommends 20)
# unset ZSH_AUTOSUGGEST_USE_ASYNC           # only if async misbehaves; makes it synchronous
```

## Notes
- The `completion` strategy spawns a pty (`zpty`) and runs the completion engine: noticeably heavier.
- zsh older than 5.0.8: async is off by default (and Ctrl-C had a prompt-reset bug); set `ZSH_AUTOSUGGEST_USE_ASYNC=1` to enable it.
- Sourcing the plugin is one file with no subprocess; no measurable start-up impact was documented, none measured here (no zsh on the Windows machine).
- Pair with a modest `HISTSIZE`; very large history files slow the history lookup.
- If other plugins rebind widgets late, `ZSH_AUTOSUGGEST_MANUAL_REBIND` avoids re-binding on every precmd.
