---
capability: keybindings
tool: i3
os: linux
verified: 2026-11-23 (docs, i3 4.25.1)
sources: https://i3wm.org/docs/userguide.html
---
# Keybindings in i3
`bindsym [--release] <modifiers+key> <command>`; `bindcode <code> <command>` binds by key code (use `xev` to read them). Modes: `mode "resize" { bindsym ... }`, entered with `mode "resize"`.

## Config
```
set $mod Mod4
floating_modifier $mod
bindsym $mod+Return exec kitty
bindsym $mod+Shift+q kill
bindsym $mod+f fullscreen toggle
bindsym $mod+Shift+space floating toggle
bindsym $mod+h focus left
bindsym $mod+j focus down
bindsym $mod+k focus up
bindsym $mod+l focus right
bindsym $mod+Shift+h move left
bindsym $mod+Shift+l move right
bindsym $mod+b split horizontal
bindsym $mod+v split vertical
bindsym $mod+1 workspace number 1
bindsym $mod+Shift+1 move container to workspace number 1
bindsym $mod+Shift+c reload
bindsym $mod+Shift+r restart
```

## Notes
- `Mod4` is Super, `Mod1` is Alt. Keep the user's existing `$mod`.
- Run `i3 -C -c <file>` after editing to catch syntax errors before reloading.
- `bindsym --release $mod+x exec --no-startup-id ...` fires on release.
- Show the plan before overriding binds the user already has; the stock config binds `$mod+h` to a horizontal split, which the hjkl focus keys above replace.
