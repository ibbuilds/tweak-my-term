---
capability: colors
tool: zsh-syntax-highlighting
os: macos, linux
verified: 2026-11-23 (docs, zsh-syntax-highlighting 0.8.0)
sources: https://raw.githubusercontent.com/zsh-users/zsh-syntax-highlighting/master/docs/highlighters/main.md
---
# Token colours
Styles live in the `ZSH_HIGHLIGHT_STYLES` associative array, keyed by token class; values use zsh's `region_highlight` format (`fg=`, `bg=`, `bold`, `underline`, `none`).

## Config
```zsh
# ~/.zshrc  (declare, then override; keys below are the documented main-highlighter styles)
typeset -A ZSH_HIGHLIGHT_STYLES
ZSH_HIGHLIGHT_STYLES[unknown-token]='fg=1,bold'              # {palette.ansi.red}
ZSH_HIGHLIGHT_STYLES[reserved-word]='fg=5'                   # magenta
ZSH_HIGHLIGHT_STYLES[alias]='fg=6,bold'                      # cyan
ZSH_HIGHLIGHT_STYLES[builtin]='fg=6'
ZSH_HIGHLIGHT_STYLES[function]='fg=6'
ZSH_HIGHLIGHT_STYLES[command]='fg=2'                         # green
ZSH_HIGHLIGHT_STYLES[precommand]='fg=2,underline'
ZSH_HIGHLIGHT_STYLES[commandseparator]='fg=8'                # bright black
ZSH_HIGHLIGHT_STYLES[path]='fg=4,underline'
ZSH_HIGHLIGHT_STYLES[single-quoted-argument]='fg=3'          # yellow
ZSH_HIGHLIGHT_STYLES[double-quoted-argument]='fg=3'
ZSH_HIGHLIGHT_STYLES[comment]='fg=8'
ZSH_HIGHLIGHT_STYLES[globbing]='none'                        # disable a class
```
Style keys confirmed in `docs/highlighters/main.md`: `unknown-token reserved-word alias suffix-alias global-alias builtin function command precommand commandseparator hashed-command autodirectory path path_pathseparator globbing arg0 default`. The quoting/option/comment keys used above (`single-quoted-argument`, `double-quoted-argument`, `comment`) belong to the same list but sit in a part of the page that was elided when fetched: check `docs/highlighters/main.md` of the installed version for the full set.

## Notes
- `fg=<0-255>` indices 0-15 follow the terminal's ANSI palette, so a terminal carrying the look's palette recolours the shell with no hex; `fg=#rrggbb` works on truecolor-capable zsh/terminal combinations.
- Prefer a distinct `unknown-token` colour: it is the typo signal.
- To style the autosuggestion ghost text use zsh-autosuggestions' own variable, not this array.
