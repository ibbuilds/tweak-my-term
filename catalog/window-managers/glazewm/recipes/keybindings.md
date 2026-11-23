---
capability: keybindings
tool: glazewm
os: windows
verified: 2026-11-23 (docs, glazewm v3.10.1)
sources: https://github.com/glzr-io/glazewm#config-keybindings, https://github.com/glzr-io/glazewm/blob/main/resources/assets/sample-config.yaml
---
# Keybindings in GlazeWM
Built in; no extra hotkey tool. Each entry has `commands` (run in sequence) and `bindings` (key combos). The docs recommend `alt`: the Windows key is hard to rebind because the OS reserves some combos (e.g. `lwin+l`).

## Config
```yaml
keybindings:
  - commands: ['shell-exec wt']            # or: shell-exec wezterm-gui / shell-exec alacritty
    bindings: ['alt+enter']
  - commands: ['focus --direction left']
    bindings: ['alt+h', 'alt+left']
  - commands: ['focus --direction right']
    bindings: ['alt+l', 'alt+right']
  - commands: ['move --direction left']
    bindings: ['alt+shift+h']
  - commands: ['resize --width +2%']
    bindings: ['alt+p']
  - commands: ['toggle-tiling-direction']
    bindings: ['alt+v']
  - commands: ['toggle-floating --centered']
    bindings: ['alt+shift+space']
  - commands: ['close']
    bindings: ['alt+shift+q']
  - commands: ['wm-reload-config']
    bindings: ['alt+shift+r']
  - commands: ['move --workspace 1', 'focus --workspace 1']
    bindings: ['alt+shift+1']
```

## Notes
- Generated defaults: `alt+h/j/k/l` focus, `alt+shift+h/j/k/l` move, `alt+1..9` workspaces, `alt+r` resize mode, `alt+shift+p` pause all bindings, `alt+shift+e` exit.
- Keys: `a-z`, `0-9`, `f1-f24`, `shift`, `control`, `alt`, `lwin`, `space`, `enter`, arrows, `oem_*` and more (full table in the README). German and US-international layouts need `ralt+ctrl` for the right alt.
- Bindings cannot be ignored per app. Use the pause binding while a game or remote desktop has focus.
