---
capability: keybindings
tool: yazi
os: windows, macos, linux
verified: 2026-11-23 (docs keymap.toml page; yazi not installed on the verification machine)
sources: https://yazi-rs.github.io/docs/configuration/keymap
---
# Add or override yazi keybindings

`keymap.toml` has one table per layer (`[mgr]`, `[tasks]`, `[spot]`, `[pick]`, `[input]`, `[confirm]`, `[cmp]`, `[help]`). In each layer, `prepend_keymap` is checked before the defaults and `append_keymap` after them; the first match wins.

## Config
```toml
# ~/.config/yazi/keymap.toml  (Windows: %AppData%\yazi\config\keymap.toml)
[mgr]
prepend_keymap = [
  { on = "<C-a>", run = "act1", desc = "Single action with Ctrl+a" },
]
append_keymap = [
  { on = [ "g", "b" ], run = "act2", desc = "Chord g then b" },
  { on = "c", run = [ "act1", "act2" ], desc = "Several actions on c" },
]
```
Use `keymap = [ ... ]` instead to drop every default in that layer. Replace `act1`/`act2` with real actions: yazi's default bindings are in `yazi-config/preset/keymap-default.toml` on the `shipped` tag (https://github.com/sxyazi/yazi/tree/shipped/yazi-config/preset), and the in-app help (`~` or `F1`) lists the active ones with their `run` values.

## Notes
- Key notation: `<C-a>` is Ctrl+a (docs example); a list of keys is a chord.
- Prefer prepend/append so upstream default updates still apply.
- Check a binding by pressing `~`/`F1` in the right layer.
- Config directory override: `YAZI_CONFIG_HOME`.
