---
capability: colors
tool: zsh-autosuggestions
os: macos, linux
verified: 2026-11-23 (docs, zsh-autosuggestions 0.7.1)
sources: https://raw.githubusercontent.com/zsh-users/zsh-autosuggestions/master/README.md, https://raw.githubusercontent.com/zsh-users/zsh-autosuggestions/master/src/config.zsh
---
# Suggestion colour
One variable styles the suggestion; it uses the `region_highlight` format from the zsh manual (Character Highlighting in `man zshzle`). Default `fg=8` (bright black, 256-colour index 8).

## Config
```zsh
# ~/.zshrc, any time before or after sourcing the plugin
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=8'                    # ANSI bright black: follows the terminal palette
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=#6c7086'              # exact hex (needs truecolor terminal)
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=#ff00ff,bg=cyan,bold,underline'   # README example
```
Map the look spec by using `fg=8` (the look's `ansi.brightBlack`) or a hex derived from `{palette.foreground}` blended with `{palette.background}`.

## Notes
- If the suggestion is invisible, the terminal's ANSI bright black equals its background (iTerm2 reports this); make Basic Colors > Background and ANSI Colors > Bright Black differ.
- With 8-colour terminals use indices 0-7 only.
- Hex colours depend on your zsh and terminal supporting 24-bit colour in `region_highlight` (check `man zshzle`, "Character Highlighting"); if the colour looks wrong fall back to a 0-255 index.
