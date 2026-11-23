---
capability: colors
tool: zsh
os: macos, linux
verified: 2026-11-23 (docs; plugin variable names from their READMEs)
sources: https://zsh.sourceforge.io/Doc/Release/Prompt-Expansion.html, https://github.com/zsh-users/zsh-syntax-highlighting, https://github.com/sharkdp/vivid, https://eza.rocks/
---
# Colors in zsh: prompt, ls, completion, highlighting
Prompt colors use `%F{...}%f` (and `%K{...}%k` for background); file colors come from `LS_COLORS`, which `compsys` can reuse; typing colors come from the syntax-highlighting plugin.

## Config
```zsh
# prompt: 0-255 or names; #rrggbb needs zsh >= 5.7 and a truecolor terminal
PROMPT='%F{#c2924a}%~%f %F{red}%(?..✘ %?)%f ❯ '

# ls / completion colors
export LS_COLORS="$(vivid generate molokai)"      # or: eval "$(dircolors -b ~/.dircolors)" on Linux
zstyle ':completion:*' list-colors ${(s.:.)LS_COLORS}
export EZA_COLORS="da=38;2;110;98;100"            # eza overrides on top of LS_COLORS

# macOS BSD ls: CLICOLOR=1 LSCOLORS=ExFxBxDxCxegedabagacad (ignores LS_COLORS)

# typing: zsh-syntax-highlighting (source last) and autosuggestions
typeset -A ZSH_HIGHLIGHT_STYLES
ZSH_HIGHLIGHT_STYLES[command]='fg=#f2eeea'
ZSH_HIGHLIGHT_STYLES[unknown-token]='fg=#e0201e,bold'
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=#6e6264'
```

## Notes
- Check truecolor: `echo $COLORTERM` (`truecolor`/`24bit`). Without it zsh approximates `#rrggbb` to 256 colors.
- `autoload -Uz colors && colors` defines `$fg[red]`, `$reset_color` for use in scripts; prompts prefer `%F`.
- zsh-syntax-highlighting style keys (`command`, `alias`, `builtin`, `path`, `comment`, `single-quoted-argument`, `unknown-token`, ...) are listed in its `docs/highlighters/main.md`; values are zle region_highlight specs (`fg=`, `bg=`, `bold`, `underline`).
- Autosuggestion default style is `fg=8`; override as above.
- Pager colors for completion menus: `zstyle ':completion:*:descriptions' format '%F{8}-- %d --%f'`.
