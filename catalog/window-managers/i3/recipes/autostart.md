---
capability: autostart
tool: i3
os: linux
verified: 2026-11-23 (docs, i3 4.25.1)
sources: https://i3wm.org/docs/userguide.html
---
# Autostart in i3
`exec [--no-startup-id] <command>` runs on the initial start only, not on restart. `exec_always` runs on every start and restart. Commands run in order, through `sh`.

## Config
Open a terminal on the left and two stacked on the right at login:
```
exec --no-startup-id kitty
exec --no-startup-id sh -c 'sleep 0.4; kitty'
exec --no-startup-id sh -c 'sleep 0.8; i3-msg split vertical; kitty'
```
Each new window takes focus, so the third `kitty` opens below the second after `split vertical`.

## Notes
- `--no-startup-id` turns off startup notification (the busy cursor and workspace tracking); fine for apps that do not support it. Without it, i3 tries to open the window on the workspace where the command ran.
- `exec_always` for terminals would open more windows on every `restart`; use it only for helpers like a wallpaper setter or compositor.
- The `sleep` delays keep the spawn order stable; the values are a practical choice, not documented ones. A small script started with `exec` is easier to tune.
- `i3 -a` disables autostart, handy when testing a bad config.
- Pre-place a terminal with `assign [class="^kitty$"] → workspace number 1` instead of timing.
- List each autostarted command in the plan.
