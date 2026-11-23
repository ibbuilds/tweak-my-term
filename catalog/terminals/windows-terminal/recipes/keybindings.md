---
capability: keybindings
tool: windows-terminal
os: windows
verified: 2026-11-23 (machine + docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/actions
---
# Keybindings in Windows Terminal
Define actions in the top-level `actions` array with a unique `id`, then bind keys by id in the top-level `keybindings` array. Actions also appear in the command palette.

## Config
```jsonc
"actions": [
  { "command": { "action": "copy", "singleLine": false }, "id": "User.copy" },
  { "command": "paste", "id": "User.paste" },
  { "command": "find", "id": "User.find" },
  { "command": { "action": "sendInput", "input": "lazygit\r" }, "id": "User.lazygit", "name": "lazygit" }
],
"keybindings": [
  { "id": "User.copy",    "keys": "ctrl+shift+c" },
  { "id": "User.paste",   "keys": "ctrl+shift+v" },
  { "id": "User.find",    "keys": "ctrl+shift+f" },
  { "id": "User.lazygit", "keys": "ctrl+shift+g" }
]
```
Look spec `keybindings: [{ keys, action }]`: write `keys` in lowercase `modifier+key` form (`ctrl+shift+d`, `alt+shift+minus`, `win+sc(41)` for a scancode), add an action with a `User.` id, and bind it.

## Notes
- Use `id` references, not inline `command` in `keybindings`: the id form is current. Older files put `{ "command": ..., "keys": ... }` directly in `keybindings` or `actions`; both parse, but merge into whichever style the file already uses.
- To unbind a default, add `{ "id": "unbound", "keys": "alt+shift+-" }` or `{ "id": null, "keys": "ctrl+v" }`; the key then passes through to the application.
- Binding `ctrl+c` to copy (verified on Windows 11) is safe: the docs say that with no selection the key chord is sent to the terminal, so interrupt still works.
- `sendInput` text: `\r` presses Enter.
