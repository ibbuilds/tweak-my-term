---
capability: config
tool: pipes-sh
os: macos, linux
verified: 2026-11-23 (docs: pipes.sh 1.3.0 help text and source; not run)
sources: https://raw.githubusercontent.com/pipeseroni/pipes.sh/master/pipes.sh
---
# pipes.sh flags

No config file. The animation fills its pane, whatever the size; it resets after a character budget so it never stays blank.

## Config
```
pipes.sh [OPTION]...
  -p N        number of pipes (default 1)
  -t T        pipe type 0-9, repeatable (0 heavy, 1 light rounded, 2 light square, 3 double, 4 ASCII +|-, 5 slashes, 6 dots, 7 dots and o, 8 railway, 9 knobby)
  -t cXXXXXXXXXXXXXXXX   custom type from 16 characters
  -c INDEX    pipe color index, repeatable (see theme.md)
  -f N        framerate 20-100 (default 75)
  -s N        straight probability, 1 in N, 5-15 (default 13; lower = more turns)
  -r N        reset after N characters (default 2000; 0 = never)
  -R          random start position and direction
  -B          no bold        -C  no color        -K  keep color and type across edges
  -h help     -v version
```
Run `pipes.sh -h` for the exact type range on the installed version.
Pane commands:
```
pipes.sh -p 4 -t 1 -f 50 -s 11 -c 4 -c 6 -B -R     # calm, many light pipes
pipes.sh -p 1 -t 0 -f 75 -c 5                      # one bold pipe
```

## Notes
- Lower `-f` (30 to 50) cuts CPU use; the default 75 is smooth but busier. A dashboard has several animated panes, so prefer 40.
- The type list above is read from the script's character table (10 entries); it was not run to confirm how each renders.
