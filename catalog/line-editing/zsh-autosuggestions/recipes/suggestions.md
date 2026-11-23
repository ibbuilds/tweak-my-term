---
capability: suggestions
tool: zsh-autosuggestions
os: macos, linux
verified: 2026-11-23 (docs, zsh-autosuggestions 0.7.1)
sources: https://raw.githubusercontent.com/zsh-users/zsh-autosuggestions/master/README.md, https://raw.githubusercontent.com/zsh-users/zsh-autosuggestions/master/src/config.zsh
---
# Suggestion sources and behaviour
As you type, a muted suggestion appears after the cursor. `ZSH_AUTOSUGGEST_STRATEGY` is an ordered array of sources tried until one returns a suggestion.

## Config
```zsh
# ~/.zshrc  (after sourcing the plugin)
ZSH_AUTOSUGGEST_STRATEGY=(history completion)   # default is (history)
ZSH_AUTOSUGGEST_BUFFER_MAX_SIZE=20              # skip suggestions for long pasted buffers (unset = always)
```
Strategies: `history` (most recent matching entry), `completion` (what Tab would offer; needs the `zpty` module), `match_prev_cmd` (most recent match that followed the previous command; breaks with `HIST_IGNORE_ALL_DUPS`/`HIST_EXPIRE_DUPS_FIRST`).

## Notes
- Accept: Right arrow or End at end of line (whole suggestion), `forward-word` (partial). See keybindings.
- Asynchronous by default on zsh >= 5.0.8; `unset ZSH_AUTOSUGGEST_USE_ASYNC` after sourcing to go synchronous.
- Toggle at runtime with the `autosuggest-disable`, `autosuggest-enable` and `autosuggest-toggle` widgets (bind them to keys; names from the plugin README, not re-fetched in full).
- Custom strategies: define `_zsh_autosuggest_strategy_<name>` that sets `typeset -g suggestion` and add `<name>` to the array.
- Large histories make the `history` strategy slower; keep `HISTSIZE` sane or set the buffer max size.
