---
capability: autostart
tool: niri
os: linux
verified: 2026-11-23 (docs, niri 26.04)
sources: https://github.com/niri-wm/niri/wiki/Configuration:-Miscellaneous
---
# Autostart in niri
`spawn-at-startup "<program>" "<args>"` starts a program when niri starts (same semantics as the `spawn` bind: no shell). `spawn-sh-at-startup "<command line>"` (niri 25.08+) passes one string to `sh`, so pipes, variables and `~` work. Under the systemd session, XDG desktop autostart also works.

## Config
Three terminals at login; the shell line then moves the last one under the second:
```kdl
spawn-at-startup "foot"
spawn-at-startup "foot"
spawn-at-startup "foot"
spawn-sh-at-startup "sleep 1.5; niri msg action consume-or-expel-window-left"
```
New windows open in a new column to the right and take focus, so the third window is focused when the action runs and drops into the second column.

## Notes
- The `sleep 1.5` is a practical delay, not a documented value: raise it on a slow machine. It acts on whatever is focused at that moment, so do not touch the keyboard during login.
- The default config already has `spawn-at-startup "waybar"`; remove it if the user has another bar.
- Startup entries run once per niri session, not on config reload.
- Prefer a window rule (`open-on-workspace`, `default-column-width`) over timing where it can express the same result.
- List each autostarted command in the plan.
