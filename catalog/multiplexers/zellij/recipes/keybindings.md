---
capability: keybindings
tool: zellij
os: windows, macos, linux
verified: 2026-11-23 (docs, zellij 0.46.0)
sources: https://zellij.dev/documentation/keybindings.html, https://raw.githubusercontent.com/zellij-org/zellij/main/zellij-utils/assets/config/default.kdl
---
# Key bindings
Bindings are grouped in modes (`normal`, `locked`, `pane`, `tab`, `resize`, `move`, `scroll`, `search`, `session`...) inside the `keybinds` block, applied on top of a preset. Presets: `default` and `unlock-first`.

## Config
```kdl
// ~/.config/zellij/config.kdl
keybinds preset="default" primary="Ctrl" secondary="Alt" {
    normal {
        bind "Alt y" { NewTab; }
        bind "Alt h" "Alt Left" { MoveFocusOrTab "Left"; }
        bind "Alt n" { NewPane; }
    }
    pane {
        bind "p" { SwitchFocus; }
    }
    locked {
        bind "Ctrl g" { SwitchToMode "normal"; }
    }
}
```
Each `bind` lists one or more keys and one or more actions run in order. See all defaults: `zellij setup --dump-keybinds default`. Presets from the CLI: `zellij setup --keybinding-preset unlock-first` (saves to config) or per session `zellij options --keybinds-preset <name>`. Theme actions: `SetDarkTheme`, `SetLightTheme`, `ToggleTheme` (bindable).

Default quick keys: `Ctrl g` lock (avoids clashes with apps), `Ctrl p` pane mode, `Ctrl t` tab mode, `Ctrl n` resize, `Ctrl h` move, `Ctrl s` scroll/search, `Ctrl o` session, `Ctrl q` quit, `Alt n` new pane, `Alt f` floating panes, `Alt h/j/k/l` focus.

## Notes
- Because Zellij binds `Ctrl` combos in normal mode, conflicts with editors and shells are common: use `locked` mode (Ctrl g) or the `unlock-first` preset.
- Settings screen (session mode, then `c`) can edit keybinds too; built-in presets and themes are read-only there.
- Windows terminals pass some `Alt`/`Ctrl+Shift` chords differently; test in your terminal. Kitty keyboard protocol support is on by default when the host supports it (`support_kitty_keyboard_protocol`).
- Mouse support (`mouse_mode`, default true) can interfere with terminal text selection; hold Shift to select in many terminals.
