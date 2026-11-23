---
capability: highlighting
tool: zsh-syntax-highlighting
os: macos, linux
verified: 2026-11-23 (docs, zsh-syntax-highlighting 0.8.0)
sources: https://raw.githubusercontent.com/zsh-users/zsh-syntax-highlighting/master/docs/highlighters.md, https://raw.githubusercontent.com/zsh-users/zsh-syntax-highlighting/master/docs/highlighters/main.md
---
# Choose highlighters
Highlighting is done by pluggable highlighters. `main` (commands, options, arguments, paths, strings) is the default; add others by appending to `ZSH_HIGHLIGHT_HIGHLIGHTERS` before or after sourcing.

## Config
```zsh
# ~/.zshrc
ZSH_HIGHLIGHT_HIGHLIGHTERS=(main brackets pattern cursor)     # default is (main)
ZSH_HIGHLIGHT_MAXLENGTH=512            # do not highlight lines longer than this (chars)

# pattern highlighter: highlight dangerous commands
typeset -A ZSH_HIGHLIGHT_PATTERNS
ZSH_HIGHLIGHT_PATTERNS+=('rm -rf *' 'fg=white,bold,bg=red')
```
Available highlighters: `main`, `brackets`, `pattern`, `regexp`, `cursor`, `root` (whole line if root), `line`. Each is documented under `docs/highlighters/`.

## Notes
- Unknown commands are shown with the `unknown-token` style (red by default); that is how typos are spotted.
- Highlighting recomputes after each edit, so long lines cost more; use `ZSH_HIGHLIGHT_MAXLENGTH` for pasted or `fned` edits.
- Custom highlighters: define `_zsh_highlight_highlighter_<name>_predicate` and `_zsh_highlight_highlighter_<name>_paint`, then add `<name>` to the array (see the docs page).
- Highlighting does not apply inside programs like fzf/atuin popups; those have their own colours.
