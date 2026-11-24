---
capability: config
tool: tty-clock
os: macos, linux
verified: 2026-11-23 (docs: README usage text; not run)
sources: https://raw.githubusercontent.com/xorg62/tty-clock/master/README
---
# tty-clock flags

There is no config file. Everything is a flag. The digits have a fixed size (there is no size flag), so the pane must be big enough for the big-digit time plus the date line; `-D` drops the date line. Exact minimum pane size was not checked.

## Config
```
tty-clock [-iuvsScbtrahDBxn] [-C [0-7]] [-f format] [-d delay] [-a nsdelay] [-T tty]
  -s  show seconds            -c  center in the terminal
  -x  draw a box              -D  hide the date
  -t  12-hour format          -u  use UTC
  -B  blinking colon          -b  bold colors
  -r  rebound (bounce around) -S  screensaver mode
  -f 'format'  date format (strftime)                 -d N  redraw delay in seconds (default 1)
  -n  do not quit on keypress (use in panes)          -C N  color 0-7 (see theme.md)
```
Pane commands for a dashboard:
```
tty-clock -s -c -C 4 -b -n              # large clock with seconds
tty-clock -c -C 4 -D -B -n              # time only, blinking colon
tty-clock -s -c -x -C 5 -f '%a %d %b' -n  # boxed, short date
```

## Notes
- `-S` (screensaver) exits on key press and moves the clock; skip it for a static pane.
- `-d` is the delay between redraws (default 1 s) and `-a` adds nanoseconds; leave both at the defaults for a clock.
- Quit with `q` (unless the flags in use change that; check `tty-clock -h` on the installed version).
