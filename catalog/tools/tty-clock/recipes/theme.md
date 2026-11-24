---
capability: theme
tool: tty-clock
os: macos, linux
verified: 2026-11-23 (docs: README usage text, -C 0-7 and -b; not run)
sources: https://raw.githubusercontent.com/xorg62/tty-clock/master/README, https://github.com/xorg62/tty-clock
---
# Color tty-clock from the look-spec palette

tty-clock has no hex option. `-C 0..7` picks one of the eight base ANSI colors (0 black, 1 red, 2 green, 3 yellow, 4 blue, 5 magenta, 6 cyan, 7 white) and the terminal draws it with its own palette entry. So the clock takes the look's color as soon as the terminal palette is set; pick the index whose palette entry is the one you want.

## Config
Pick the index for the accent color of the look:
| palette token | `-C` |
|---|---|
| `{palette.ansi.red}` | 1 |
| `{palette.ansi.green}` | 2 |
| `{palette.ansi.yellow}` | 3 |
| `{palette.ansi.blue}` | 4 |
| `{palette.ansi.magenta}` | 5 |
| `{palette.ansi.cyan}` | 6 |
| `{palette.ansi.white}` | 7 |

Pane command (cyan accent, bold, centered, with seconds):
```
tty-clock -s -c -C 6 -b
```
`-b` uses bold, which many terminals render as the bright variant (`{palette.ansi.brightCyan}`); drop `-b` to get the exact base color.

## Notes
- Only 0-7 are accepted, so `{palette.ansi.brightX}` is reachable only through `-b`.
- If the palette entry for the chosen index has poor contrast against `{palette.background}`, change the index, not the palette.
- The README does not state the default color; always pass `-C` explicitly.
