---
capability: colors
tool: bash
os: windows, macos, linux
verified: 2026-11-23 (docs; readline color options verified on bash 5.3.9 / Git for Windows)
sources: https://tiswww.case.edu/php/chet/readline/rluserman.html, https://eza.rocks/, https://github.com/sharkdp/vivid
---
# Colors in bash: ls, completion, tools
Plain bash has no syntax highlighting. Colors come from `LS_COLORS` (ls, readline completion), `EZA_COLORS`, `GREP_COLORS`, and the prompt escapes.

## Config
```bash
# GNU ls / coreutils (Linux, Git Bash): load a dircolors theme or a generated LS_COLORS
alias ls='ls --color=auto'
[ -r ~/.dircolors ] && eval "$(dircolors -b ~/.dircolors)"
# or a generated theme (vivid is cross-platform):
# export LS_COLORS="$(vivid generate molokai)"

# eza reads LS_COLORS and overrides with EZA_COLORS (two-letter keys)
export EZA_COLORS="da=38;2;110;98;100:di=1;38;2;194;146;74"

# grep / less
export GREP_COLORS='mt=01;38;2;224;32;30'
export LESS_TERMCAP_md=$'\e[1;38;2;224;32;30m'    # bold in man pages
```
macOS BSD `ls` ignores LS_COLORS: use `export CLICOLOR=1 LSCOLORS=ExFxBxDxCxegedabagacad`, or `brew install coreutils` and `gls`.

`~/.inputrc` — make completion lists use LS_COLORS:
```
set colored-stats on
set colored-completion-prefix on
```

## Notes
- Truecolor escapes `\e[38;2;R;G;Bm` work in Windows Terminal, iTerm2, kitty, WezTerm, modern GNOME Terminal; check `$COLORTERM` (`truecolor`).
- Wrap prompt colors in `\[ \]` (see prompt recipe).
- `NO_COLOR` is honored by many CLIs; do not export it unless you want everything uncolored.
- Syntax highlighting while typing needs ble.sh (24-60 ms per keystroke on Windows, measured) or switching to zsh/fish.
- `dircolors -p > ~/.dircolors` dumps the default database as a starting point.
