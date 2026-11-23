---
capability: keybindings
tool: aerospace
os: macos
verified: 2026-11-23 (docs, aerospace 0.21.3-Beta)
sources: https://nikitabobko.github.io/AeroSpace/guide, https://nikitabobko.github.io/AeroSpace/commands
---
# Keybindings in AeroSpace
AeroSpace binds keys itself, in `[mode.main.binding]`. Modifiers are `alt`, `cmd`, `ctrl`, `shift`, joined with `-`. A value is one command or a list.

## Config
```toml
[mode.main.binding]
alt-enter   = 'exec-and-forget open -na Ghostty'   # new terminal window; use the app name
alt-h = 'focus left'
alt-j = 'focus down'
alt-k = 'focus up'
alt-l = 'focus right'
alt-shift-h = 'move left'
alt-shift-j = 'move down'
alt-shift-k = 'move up'
alt-shift-l = 'move right'
alt-minus = 'resize smart -50'
alt-equal = 'resize smart +50'
alt-slash = 'layout tiles horizontal vertical'
alt-comma = 'layout accordion horizontal vertical'
alt-1 = 'workspace 1'
alt-shift-1 = 'move-node-to-workspace 1'
alt-tab = 'workspace-back-and-forth'
```

## Notes
- Most of this is the default-config set (alt-based); `alt-enter` is an addition.
- Change the modifier if it clashes with terminal bindings (alt as Meta in shells, tmux and vim). `ctrl-alt` is a safe pair.
- `open -na` opens a new instance; plain `open -a` only focuses the app.
- Extra binding modes are `[mode.<name>.binding]`, entered with `mode <name>`; the default config has a `service` mode.
- Keys are read as qwerty unless `key-mapping.preset` is set.
- Reload after editing: `aerospace reload-config`.
