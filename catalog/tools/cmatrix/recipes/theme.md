---
capability: theme
tool: cmatrix
os: macos, linux
verified: 2026-11-23 (docs: cmatrix man page and README usage; not run)
sources: https://raw.githubusercontent.com/abishekvashok/cmatrix/master/cmatrix.1, https://github.com/abishekvashok/cmatrix#usage
---
# Color cmatrix from the look-spec palette

`-C color` selects one of eight named ANSI colors: green (default), red, blue, white, yellow, cyan, magenta, black. The terminal draws the name with its own palette entry, so the rain takes the look's color automatically; there is no hex option. `-r` makes every character a different rainbow color; `-b` bolds some characters, `-B` all of them (bold often shows as the bright palette variant).

## Config
| `-C` | palette token |
|---|---|
| `red` | `{palette.ansi.red}` |
| `green` | `{palette.ansi.green}` |
| `yellow` | `{palette.ansi.yellow}` |
| `blue` | `{palette.ansi.blue}` |
| `magenta` | `{palette.ansi.magenta}` |
| `cyan` | `{palette.ansi.cyan}` |
| `white` | `{palette.ansi.white}` |

Pane command, accent cyan:
```
cmatrix -b -u 3 -C cyan
```
Use `-B` for the bright variant (`{palette.ansi.brightCyan}`) of the same color.

## Notes
- Avoid `black` unless `{palette.background}` is light.
- If the exact hex of the rain matters (an arbitrary accent), use `rusty-rain` instead, which takes `#RRGGBB`.
