---
capability: splits
tool: windows-terminal
os: windows
verified: 2026-11-23 (machine + docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/panes, https://learn.microsoft.com/windows/terminal/customize-settings/actions
---
# Splits in Windows Terminal
Panes are built in. Use the `splitPane` action: `split` is `auto`, `right`, `down`, `left`, `up` (or `vertical`/`horizontal`), and `splitMode: "duplicate"` clones the current profile. Define actions with ids, then bind keys by id.

## Config
Add to the top-level `actions` array:
```jsonc
{ "command": { "action": "splitPane", "split": "right", "splitMode": "duplicate" }, "id": "User.split.right" },
{ "command": { "action": "splitPane", "split": "down",  "splitMode": "duplicate" }, "id": "User.split.down" },
{ "command": { "action": "splitPane", "split": "auto",  "splitMode": "duplicate" }, "id": "User.split.auto" },
{ "command": "togglePaneZoom", "id": "User.zoom" }
```
Add to `keybindings`:
```jsonc
{ "id": "User.split.right", "keys": "alt+shift+plus" },
{ "id": "User.split.down",  "keys": "alt+shift+minus" },
{ "id": "User.split.auto",  "keys": "alt+shift+d" },
{ "id": "User.zoom",        "keys": "alt+z" }
```

## Notes
- Defaults: `Alt+Shift++` splits right (vertical), `Alt+Shift+-` splits down (horizontal), `Alt+Shift+D` auto; resize panes with `Alt+Shift+arrows`.
- `"splitPane"` also takes `size` (0.0-1.0) and `profile`. From the command line: `wt sp -V -s .4`.
- Use `toggleBroadcastInput` to type into all panes.
- Pane and window layouts at launch: see the startup-layout recipe.
