---
capability: theme
tool: cbonsai
os: macos, linux
verified: 2026-11-23 (docs: cbonsai README usage text; not run)
sources: https://gitlab.com/jallbrit/cbonsai#usage
---
# Color cbonsai from the look-spec palette

`-k, --color=LIST` takes four comma-separated color indices 0-255, in this order: dark leaves, dark wood, light leaves, light wood (default `2,3,10,11`). Indices 0-15 are resolved by the terminal's own palette, so they follow the look; 16-255 are the fixed xterm color cube and do not.

## Config
Default mapping: 2 = `{palette.ansi.green}`, 3 = `{palette.ansi.yellow}`, 10 = `{palette.ansi.brightGreen}`, 11 = `{palette.ansi.brightYellow}`. Pick indices by the role the palette entry plays:
| role | usual index | token |
|---|---|---|
| dark leaves | 2 (green) or 6 (cyan) | `{palette.ansi.green}`, `{palette.ansi.cyan}` |
| dark wood | 3 (yellow), 1 (red) or 8 (bright black) | `{palette.ansi.yellow}`, `{palette.ansi.red}`, `{palette.ansi.brightBlack}` |
| light leaves | 10 (bright green) or 14 (bright cyan) | `{palette.ansi.brightGreen}`, `{palette.ansi.brightCyan}` |
| light wood | 11 (bright yellow) or 7 (white) | `{palette.ansi.brightYellow}`, `{palette.ansi.white}` |

Pane command, magenta blossom variant (leaves 5 and 13, wood 3 and 11):
```
cbonsai -l -i -t 0.06 -w 25 -k 5,3,13,11
```
Leaf characters can be changed too: `-c '&,*,o'` (comma-delimited strings chosen at random).

## Notes
- To match an exact hex outside the 16 palette entries, find the nearest of the 256 indices: it will only approximate the hex, and the cube is the same on every terminal, so prefer indices 0-15 for a palette-bound look.
- Check contrast of the wood index against `{palette.background}`: brown-ish wood on a dark palette often needs index 3 or 11.
