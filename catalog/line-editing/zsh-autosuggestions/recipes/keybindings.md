---
capability: keybindings
tool: zsh-autosuggestions
os: macos, linux
verified: 2026-11-23 (docs, zsh-autosuggestions 0.7.1)
sources: https://raw.githubusercontent.com/zsh-users/zsh-autosuggestions/master/src/config.zsh, https://raw.githubusercontent.com/zsh-users/zsh-autosuggestions/master/README.md
---
# Accepting suggestions
The plugin wraps existing ZLE widgets: each widget is in one of four arrays that decide what happens to the suggestion when you invoke it.

## Config
Defaults (from `src/config.zsh`):
```zsh
ZSH_AUTOSUGGEST_ACCEPT_WIDGETS=(forward-char end-of-line vi-forward-char vi-end-of-line vi-add-eol)
ZSH_AUTOSUGGEST_PARTIAL_ACCEPT_WIDGETS=(forward-word emacs-forward-word vi-forward-word vi-forward-word-end vi-forward-blank-word vi-forward-blank-word-end vi-find-next-char vi-find-next-char-skip)
ZSH_AUTOSUGGEST_EXECUTE_WIDGETS=()          # accept and run
ZSH_AUTOSUGGEST_CLEAR_WIDGETS=(history-search-forward history-search-backward history-beginning-search-forward history-beginning-search-backward up-line-or-history down-line-or-history accept-line copy-earlier-word ...)
```
Bind your own keys to those widgets, then add them to the right array:
```zsh
bindkey '^ ' autosuggest-accept            # Ctrl+Space accepts
bindkey '^[[1;5C' forward-word              # Ctrl+Right: partial accept (forward-word is a partial-accept widget)
bindkey '^[^M' autosuggest-execute          # Alt+Enter: accept and run (plugin widget; no default binding)
ZSH_AUTOSUGGEST_ACCEPT_WIDGETS+=(my-widget)
```
Plugin widgets: `autosuggest-accept`, `autosuggest-execute`, `autosuggest-clear`, `autosuggest-fetch`, `autosuggest-enable`, `autosuggest-disable`, `autosuggest-toggle`.

## Notes
- A widget must belong to exactly one of the arrays; widgets that modify the buffer and are in none fetch a new suggestion afterwards.
- Right arrow only accepts when the cursor is at the end of the buffer.
- Widgets are re-bound each precmd; set `ZSH_AUTOSUGGEST_MANUAL_REBIND=1` to stop that (then call `_zsh_autosuggest_bind_widgets` yourself after changing bindings).
- Widget names above come from the plugin README's key-binding section (not re-fetched in full); run `zle -la | grep autosuggest` to confirm them on your install.
