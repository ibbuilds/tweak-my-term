---
capability: quake
tool: windows-terminal
os: windows
verified: 2026-11-23 (machine + docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/tips-and-tricks, https://learn.microsoft.com/windows/terminal/customize-settings/actions
---
# Quake mode in Windows Terminal
A window named `_quake` is the drop-down window: it snaps to the top half of the monitor, enters focus mode and hides from the taskbar and Alt+Tab when minimized. Bind the `quakeMode` action to a global hotkey.

## Config
Top-level `actions`:
```jsonc
{ "command": { "action": "quakeMode" }, "id": "User.quake" }
```
Top-level `keybindings` (a global hotkey; the verified preset uses the key left of 1, scancode 41):
```jsonc
{ "id": "User.quake", "keys": "win+sc(41)" }
```
Or open it from a shell: `wt -w _quake`.

## Notes
- Global hotkeys only work while Windows Terminal is running. Start it at login with `"startOnUserLogin": true`.
- Preview adds `"compatibility.allowHeadless": true` so the quake hotkey keeps working after the last window closes.
- `quakeMode` is shorthand for a `globalSummon` action with `name: "_quake"`, `dropdownDuration: 200`, `toggleVisibility: true`, `monitor: "toMouse"`, `desktop: "toCurrent"`. Define your own `globalSummon` with different values to change the behaviour.
- A key already registered by another app (RegisterHotKey) cannot be used. Elevated and unelevated instances, and Preview and stable, cannot share a key.
- If the quake window is minimized without a `quakeMode` binding it can only be closed from Task Manager.
