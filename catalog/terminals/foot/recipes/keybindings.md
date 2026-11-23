---
capability: keybindings
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://man.archlinux.org/man/foot.ini.5
---
# Keybindings in foot
Bindings live in `[key-bindings]`: `action=Mod+Mod+key [more bindings...]`. Setting an action to `none` removes its binding.
## Config
```ini
[key-bindings]
# look keybindings[]: keys -> Modifier+key, action -> foot action
clipboard-copy=Control+Shift+c XF86Copy
clipboard-paste=Control+Shift+v XF86Paste
spawn-terminal=Control+Shift+n
font-increase=Control+plus Control+equal Control+KP_Add
font-decrease=Control+minus Control+KP_Subtract
font-reset=Control+0 Control+KP_0
search-start=Control+Shift+r
show-urls-launch=Control+Shift+o
prompt-prev=Control+Shift+z
prompt-next=Control+Shift+x
```
## Notes
- Actions are foot-specific names (no arbitrary commands). Unbound by default: `minimize`, `maximize`, `fullscreen`, `color-theme-switch-dark`, `color-theme-switch-light`, `color-theme-toggle`, `quit`, scrollback home/end.
- Mouse bindings are a separate `[mouse-bindings]` section (not verified here).
- `spawn-terminal` opens in the cwd only if the shell reports OSC 7 (see shell-integration).
