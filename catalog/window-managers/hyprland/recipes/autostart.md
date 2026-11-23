---
capability: autostart
tool: hyprland
os: linux
verified: 2026-11-23 (docs, hyprland v0.57.2)
sources: https://wiki.hypr.land/Configuring/Basics/Autostart/
---
# Autostart in Hyprland
Run commands at session start by listening to the `hyprland.start` event. `hl.exec_cmd` spawns asynchronously, so no `& disown` is needed. `hyprland.shutdown` is the exit counterpart.

## Config
```lua
hl.on("hyprland.start", function()
  hl.exec_cmd("waybar")
  hl.exec_cmd("kitty")             -- terminal 1 (left)
  hl.exec_cmd("sleep 0.4; kitty")  -- terminal 2 (right)
  hl.exec_cmd("sleep 0.8; kitty")  -- terminal 3 (right, below terminal 2 under dwindle)
end)
```
Hyprlang (0.54 and older): `exec-once = waybar` (once per session), `exec = cmd` (on every reload), `exec-shutdown = cmd`.

## Notes
- `hyprland.start` fires once per session, so a config reload does not respawn the terminals.
- Windows are placed in arrival order, so stagger the spawns (or give each a `workspace` window rule) to get a deterministic dwindle layout; see the layouts recipe. The stagger delays are a practical choice, not documented values.
- Under uwsm or systemd, autostart user services instead; see the wiki's Systemd start page.
- List each autostarted command in the plan; do not add apps the user did not agree to.
