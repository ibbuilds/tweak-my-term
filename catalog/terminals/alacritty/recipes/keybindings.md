---
capability: keybindings
tool: alacritty
os: windows, macos, linux
verified: 2026-11-23 (docs, alacritty 0.17.0)
sources: https://alacritty.org/config-alacritty.html, https://github.com/alacritty/alacritty/blob/master/extra/man/alacritty-bindings.5.scd
---
# Keybindings in Alacritty
Bindings are an array of inline tables under `[keyboard]`: `key`, `mods` (joined by `|`), optional `mode`, and one of `action`, `chars` or `command`.

## Config
```toml
[keyboard]
bindings = [
  { key = "N", mods = "Control|Shift", action = "CreateNewWindow" },
  { key = "Return", mods = "Alt", action = "ToggleFullscreen" },
  { key = "L", mods = "Control|Shift", chars = "\u000c" },
  { key = "G", mods = "Control|Shift", command = { program = "lazygit" } },
]
```
Look spec `keybindings: [{ keys, action }]`: split `keys` into `key` and `mods` (`ctrl+shift+n` -> `key = "N"`, `mods = "Control|Shift"`).

## Notes
- Mods: `Command`, `Control`, `Option`, `Super`, `Shift`, `Alt`. `mode` values: `AppCursor`, `AppKeypad`, `Search`, `Alt`, `Vi`, prefixed with `~` for "not".
- Actions include `Paste`, `Copy`, `IncreaseFontSize`, `DecreaseFontSize`, `ResetFontSize`, `ScrollPageUp`, `ClearHistory`, `Hide`, `Minimize`, `Quit`, `SpawnNewInstance`, `CreateNewWindow`, `ToggleFullscreen`, `ToggleMaximized`, `ToggleViMode`, `SearchForward`, `SearchBackward`; macOS also `CreateNewTab`, `SelectNextTab`, `SelectTab1..9`.
- `command` forks a process (a string or `{ program, args }`); `chars` writes text to the terminal.
- Disable a default binding with `action = "ReceiveChar"` (lets the key through) or `action = "None"`.
- Several bindings can fire on one key press, in definition order. Defaults are listed in the alacritty-bindings(5) page.
- Key names follow winit (`Return`, `Escape`, `F1`, `Numpad0`...); scancodes can be given as numbers.
