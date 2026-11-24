---
capability: theme
tool: clock-tui
os: windows, macos, linux
verified: 2026-11-23 (docs: README "Customize style", src/app.rs flag doc comment and src/config.rs; not run)
sources: https://github.com/race604/clock-tui#customize-style, https://raw.githubusercontent.com/race604/clock-tui/master/clock-tui/src/app.rs, https://raw.githubusercontent.com/race604/clock-tui/master/clock-tui/src/config.rs
---
# Color tclock from the look-spec palette

One foreground color for the whole clock. `-c` takes `#RRGGBB` or one of: Black, Red, Green, Yellow, Blue, Magenta, Cyan, Gray, DarkGray, LightRed, LightGreen, LightYellow, LightBlue, LightMagenta, LightCyan, White. The named colors are ANSI colors and follow the terminal palette; hex is exact (needs truecolor). Default is green.

## Config
Pane command with the look's accent as hex:
```
tclock -c '{palette.accent}' -s 2 clock
```
Quote the hex: `#` starts a comment in POSIX shells, and in PowerShell use single quotes too. Named alternative that follows the terminal palette: `tclock -c LightCyan -s 2 clock` (`{palette.ansi.brightCyan}`).

Or set it once in `~/.config/tclock/config.toml` (`%USERPROFILE%\.config\tclock\config.toml` on Windows):
```toml
[default]
color = "{palette.accent}"   # same values as -c; the flag wins when both are given
```

## Notes
- Source: the `-c` doc comment and `parse_color` accept names and `#RRGGBB`; the config `color` goes through the same parser and falls back to green if it cannot parse.
- On a terminal without truecolor, hex may render approximated or wrong (not checked); use the named colors there.
- Verify visually: there is no theme validator.
