---
capability: config
tool: rusty-rain
os: windows, macos, linux
verified: 2026-11-23 (docs: README option list and src/cli.rs; not run)
sources: https://github.com/cowboy8625/rusty-rain#customization, https://raw.githubusercontent.com/cowboy8625/rusty-rain/master/src/cli.rs
---
# rusty-rain options

The rain fills the pane. Options are flags; a config file exists only for `speed` and custom character groups, and it overrides the flags (README), so do not create it for a pane.

## Config
```
rusty-rain [OPTIONS]
  -g, --group NAME      characters: bin (default), num, classic, jap, alphalow, alphaup, large-letters, all, cards, arrow, shapes, ...
  -s, --shade           fade the trail (uses -G)
  -d, --direction DIR   south (default), north, west, east (up, down, left, right also accepted)
  -S, --speed A,B       range of per-column delay in ms, default 0,200
  -D, --display-group   display the character group
  colors: -C, -H, -G, -B (see theme.md)
```
Pane commands:
```
rusty-rain -g classic -s -C '#a6e3a1' -H '#ffffff' -G '#1e1e2e' -S 0,200   # film-like
rusty-rain -g num -s -C '{palette.accent}' -G '{palette.background}' -d south
```
`classic` is described as closest to cmatrix. Emoji and icon groups (`crab`, `pglangs`, `open-source`) need a font with those glyphs.

## Notes
- Speed is `A,B` as in `--speed 0,200`; which end is faster was not confirmed. If the rain is too fast or slow, change one number and look, or read `rusty-rain --help` on the installed version.
- Quit with `q`, Esc or Ctrl+C.
