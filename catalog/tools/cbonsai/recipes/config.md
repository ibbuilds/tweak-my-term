---
capability: config
tool: cbonsai
os: macos, linux
verified: 2026-11-23 (docs: cbonsai README usage text and tips; not run)
sources: https://gitlab.com/jallbrit/cbonsai#usage, https://gitlab.com/jallbrit/cbonsai#tips
---
# cbonsai flags

No config file; the layout follows the pane and the tree grows from the bottom center.

## Config
```
cbonsai [options]
  -l, --live            show each growth step         -t, --time=SECS   delay per step (default 0.03)
  -i, --infinite        keep growing new trees        -w, --wait=SECS   pause between trees (default 4.00)
  -S, --screensaver     -l and -i, quits on any key and saves/loads progress in the cache file
  -m, --message=STR     text next to the tree         -b, --base=N      pot style, 0 = none
  -g, --geometry=ROW,COL  place the base              -c, --leaf=LIST   leaf characters
  -k, --color=LIST      4 color indices (theme.md)    -L, --life=N      0-200 (default 32): bigger tree
  -M, --multiplier=N    0-20 (default 5): more branches
  -s, --seed=N          fixed tree                    -p, --print       print the finished tree and exit
```
Pane commands:
```
cbonsai -l -i -t 0.06 -w 25 -L 36 -M 6 -b 1 -k 2,3,10,11   # calm, endless
cbonsai -p -s 7 -L 40 -k 2,3,10,11                          # static, printed once
```
The static variant (`-p`) suits a pane that must not animate or take CPU; it exits after printing, so follow it with `read -r` (bash or zsh) if the pane should stay open: `cbonsai -p -s 7 -L 40; read -r`.

## Notes
- Do not use `-S` in a dashboard pane: any key press quits it (and it writes the cache file `~/.cache/cbonsai`).
- `-m` takes one string; for rotating messages the README shows a bash wrapper loop around `cbonsai`.
- A larger `-t` slows growth and lowers CPU use.
