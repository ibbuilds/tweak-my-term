---
capability: config
tool: clock-tui
os: windows, macos, linux
verified: 2026-11-23 (docs: src/app.rs clap definitions, src/config.rs, src/bin/main.rs key handling; not run)
sources: https://raw.githubusercontent.com/race604/clock-tui/master/clock-tui/src/app.rs, https://raw.githubusercontent.com/race604/clock-tui/master/clock-tui/src/config.rs, https://github.com/race604/clock-tui#usage
---
# tclock options

Global options (`-c` color, `-s` size) go before the subcommand. Modes: `clock` (default), `timer`, `stopwatch`, `countdown`. The size is a whole-number multiplier of the digit size (`-s 1` is the smallest), so a pane picks its size by the multiplier rather than by stretching.

## Config
Clock mode flags: `-z <tz>` timezone (for example `America/New_York`), `-D` hide the date, `-S` hide seconds, `-m` show milliseconds.
```
tclock -c '{palette.accent}' -s 2 clock                  # time, seconds and date
tclock -c '{palette.accent}' -s 3 clock -D -S            # big HH:MM only
tclock -c '{palette.ansi.cyan}' -s 1 clock -z Europe/Berlin
```
Optional `~/.config/tclock/config.toml` (all OSes, under the home folder; keys are all optional):
```toml
[default]
mode = "clock"      # clock | timer | stopwatch | countdown
color = "#89b4fa"
size = 2
[clock]
show_date = true
show_seconds = true
show_millis = false
timezone = "Europe/Berlin"   # omit for local time
```
Flags override the file. Inside the running program: `c` clock, `t` timer, `w` stopwatch, space pauses, `q` quits.

## Notes
- Keep the file out of a dashboard build unless the user wants one fixed look; the pane command alone is reproducible.
- Timer/countdown flags (durations, titles, repeat, `-Q` quit at end, an execute-on-finish command) exist; see `tclock timer -h` and `tclock countdown -h`.
