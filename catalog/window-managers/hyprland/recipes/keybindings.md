---
capability: keybindings
tool: hyprland
os: linux
verified: 2026-11-23 (docs, hyprland v0.57.2)
sources: https://wiki.hypr.land/Configuring/Basics/Binds/, https://wiki.hypr.land/Configuring/Basics/Dispatchers/
---
# Keybindings in Hyprland
`hl.bind(keys, dispatcher, flags?)`. Keys are written `"SUPER + SHIFT + Q"`. Dispatchers come from `hl.dsp.*`. Flags: `locked`, `release`, `repeating`, `mouse`, `description`, `non_consuming`.

## Config
```lua
local mod = "SUPER"
hl.bind(mod .. " + RETURN", hl.dsp.exec_cmd("kitty"))
hl.bind(mod .. " + Q",      hl.dsp.window.close())
hl.bind(mod .. " + V",      hl.dsp.window.float({ action = "toggle" }))
hl.bind(mod .. " + F",      hl.dsp.window.fullscreen({ mode = "fullscreen" }))
hl.bind(mod .. " + J",      hl.dsp.layout("togglesplit"))
for _, d in ipairs({ "left", "right", "up", "down" }) do
  hl.bind(mod .. " + " .. d,         hl.dsp.focus({ direction = d }))
  hl.bind(mod .. " + SHIFT + " .. d, hl.dsp.window.move({ direction = d }))
end
for i = 1, 9 do
  hl.bind(mod .. " + " .. i,         hl.dsp.focus({ workspace = i }))
  hl.bind(mod .. " + SHIFT + " .. i, hl.dsp.window.move({ workspace = i }))
end
hl.bind(mod .. " + mouse:272", hl.dsp.window.drag(), { mouse = true })
```
Hyprlang (0.54 and older): `bind = SUPER, RETURN, exec, kitty`, `bind = SUPER, Q, killactive`, `bind = SUPER, left, movefocus, l`.

## Notes
- `hl.bind` returns a handle: `local b = hl.bind(...)`, later `b:set_enabled(false)`.
- Spawn with window rules: `hl.dsp.exec_cmd("kitty", { float = true, move = { 0, 0 } })`. The rules attach to the spawned PID, so launchers that fork do not work.
- The shipped example binds `SUPER + Q` to the terminal and `SUPER + C` to close; show the plan before changing keys the user relies on.
