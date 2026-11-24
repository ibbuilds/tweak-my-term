---
capability: config
tool: cmatrix
os: macos, linux
verified: 2026-11-23 (docs: cmatrix man page and README usage; not run)
sources: https://raw.githubusercontent.com/abishekvashok/cmatrix/master/cmatrix.1, https://github.com/abishekvashok/cmatrix#usage
---
# cmatrix flags

No config file. The rain fills the pane whatever its size.

## Config
```
cmatrix [-abBflohnsmVx] [-u update] [-C color] [-M message]
  -a  asynchronous scroll (columns fall at different speeds)
  -b  some bold characters         -B  all bold (overrides -b)       -n  no bold
  -u N  update delay 0-9 (default 4; lower is faster)
  -C color  rain color (theme.md)  -r  rainbow
  -k  characters change as they fall      -o  old-style scrolling
  -c  only print the shadows of letters
  -M 'text'  message in the center        -s  screensaver: any key exits (not for panes)
  -L  lock: cannot quit (do not use)      -x  X window mode for the mtx font   -l  Linux console mode
```
Pane commands:
```
cmatrix -ba -u 3 -C cyan       # film-like (the README says -lba looks most like the movie)
cmatrix -o -C green            # old-style scrolling (the README says -ol looks most like the Win/Mac screensaver)
cmatrix -b -u 5 -C magenta -M "tmt"
```

## Notes
- A higher `-u` slows the rain and lowers CPU use: 5 to 7 suits a background pane.
- `-l` is "Linux mode" (the man page: sets the `matrix.fnt` console font) and `-x` is for the mtx.pcf font in xterm; leave both off in a graphical terminal pane unless tested.
- Quit with `q` unless `-L` or `-s` is set.
