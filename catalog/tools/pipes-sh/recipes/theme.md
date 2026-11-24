---
capability: theme
tool: pipes-sh
os: macos, linux
verified: 2026-11-23 (docs: pipes.sh 1.3.0 help text; not run)
sources: https://raw.githubusercontent.com/pipeseroni/pipes.sh/master/pipes.sh, https://github.com/pipeseroni/pipes.sh
---
# Color pipes.sh from the look-spec palette

`-c INDEX` sets a pipe color as a terminal color index (`tput setaf`): 0-7 are the base ANSI colors, 8-15 the bright ones, up to 255 on 256-color terminals. The index is resolved by the terminal, so the pipes take the look's palette when the terminal palette is set. `-c` can be repeated; each new pipe cycles through the list. The README form `-c '#1f'` is a hexadecimal color INDEX, not an RGB color: there is no hex RGB option.

## Config
Map palette tokens to indexes (0 black, 1 red, 2 green, 3 yellow, 4 blue, 5 magenta, 6 cyan, 7 white; add 8 for the bright variants):
| token | `-c` |
|---|---|
| `{palette.ansi.red}` / `brightRed` | 1 / 9 |
| `{palette.ansi.green}` / `brightGreen` | 2 / 10 |
| `{palette.ansi.yellow}` / `brightYellow` | 3 / 11 |
| `{palette.ansi.blue}` / `brightBlue` | 4 / 12 |
| `{palette.ansi.magenta}` / `brightMagenta` | 5 / 13 |
| `{palette.ansi.cyan}` / `brightCyan` | 6 / 14 |

Pane command, three pipes in the look's blue, magenta and cyan:
```
pipes.sh -p 3 -t 1 -c 4 -c 5 -c 6 -B
```
`-B` disables the bold effect (bold often turns the base colors into their bright variants); drop it to get bright pipes. `-C` removes color entirely.

## Notes
- Default colors are indexes 1 to 7 then 0, which includes black (0) and white (7): always pass explicit `-c` values, and never include the index that equals `{palette.background}`.
- Verify visually; the script has no color validation beyond the terminal's color count (`tput colors`).
