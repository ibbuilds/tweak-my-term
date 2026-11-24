---
capability: theme
tool: rusty-rain
os: windows, macos, linux
verified: 2026-11-23 (docs: README option list and src/cli.rs color parser (accepts #RRGGBB or r,g,b for every color flag); not run)
sources: https://github.com/cowboy8625/rusty-rain#customization, https://raw.githubusercontent.com/cowboy8625/rusty-rain/master/src/cli.rs
---
# Color rusty-rain from the look-spec palette

Every color flag takes `#RRGGBB` or `r,g,b` (0-255 each), read from `src/cli.rs`; the README help text lists names (white, red, blue, green) and mentions hex for some flags. The named colors are fixed RGB values (green is pure `#00ff00`), not the terminal palette, and any other string falls back to white: always pass hex. Output is 24-bit color, so a truecolor terminal is expected (not checked on 256-color ones).

| flag | role | default |
|---|---|---|
| `-C, --color` | the rain body | green |
| `-H, --head` | first character of each column | white |
| `-G, --shade-gradient` | fade color used with `-s, --shade` | `#000000` |
| `-B, --bg-color` | background behind the rain | unset |

## Config
Rain in the accent, bright head, fading into the background:
```
rusty-rain -C '{palette.accent}' -H '{palette.ansi.brightWhite}' -s -G '{palette.background}'
```
`-G` should equal `{palette.background}` so the trail fades into the pane instead of to black. Leave `-B` unset to keep the terminal background (transparency, blur or an image behind the terminal then show through).

## Notes
- Quote the hex (`#` starts a comment in POSIX shells; use single quotes in PowerShell too).
- A config.toml also exists, but it only holds `speed` and custom character groups, and the README says its values override CLI options: leave it absent in a pane build.
- Verify visually; the program does not validate colors beyond parsing.
