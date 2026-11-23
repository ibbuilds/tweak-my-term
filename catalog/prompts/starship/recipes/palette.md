---
capability: palette
tool: starship
os: windows, macos, linux
verified: 2026-11-23 (docs, starship 1.27.0)
sources: https://starship.rs/config/, https://starship.rs/advanced-config/
---
# Colour palette
Define named colours under `[palettes.<name>]`, select one with the top-level `palette` key, then use the names in any style string. A palette entry can also override a built-in colour name such as `blue`.

## Config
Map look-spec tokens to palette entries (substitute the hex values; `{palette.ansi.*}` are the 16 ANSI slots):

```toml
# ~/.config/starship.toml
palette = "tmt"

[palettes.tmt]
bg      = "{palette.background}"
fg      = "{palette.foreground}"
accent  = "{palette.accent}"
black   = "{palette.ansi.black}"
red     = "{palette.ansi.red}"
green   = "{palette.ansi.green}"
yellow  = "{palette.ansi.yellow}"
blue    = "{palette.ansi.blue}"
purple  = "{palette.ansi.magenta}"     # starship's style word is "purple"
cyan    = "{palette.ansi.cyan}"
white   = "{palette.ansi.white}"

[directory]
style = "bold fg:accent"

[character]
success_symbol = "[❯](bold green)"
error_symbol   = "[❯](bold red)"

[git_branch]
style = "bold purple"
```
Style strings accept `bold italic underline dimmed inverted blink hidden strikethrough`, `fg:<color>`, `bg:<color>`, a bare `<color>`, and `none`. Colour values are ANSI names, `#rrggbb` or 0-255.

## Notes
- If you do NOT define a palette, ANSI names (`red`, `blue`...) follow the terminal's own colour scheme, so a terminal palette already recolours Starship. Use a Starship palette only when you need exact hex values or extra names (`accent`, `bg`).
- A palette cannot reference its own entries. Only the palette chosen by `palette` is active; keep several under `[palettes.*]` and switch by changing one line.
- Overriding `red`/`green`/... changes every module that uses those words, including defaults; add new names instead if you want to leave built-ins alone.
- Powerline-style segments need a terminal background colour match: use `bg:` with the same hex as `{palette.background}` for transparent-looking separators.
