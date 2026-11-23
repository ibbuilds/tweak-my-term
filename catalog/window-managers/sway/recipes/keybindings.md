---
capability: keybindings
tool: sway
os: linux
verified: 2026-11-23 (docs, sway 1.12)
sources: https://man.archlinux.org/man/sway.5
---
# Keybindings in sway
`bindsym [flags] <modifiers+key> <command>`. Flags include `--release`, `--locked`, `--to-code`, `--no-repeat`. `bindcode` uses key codes. Group related binds in `mode "name" { ... }`. Bindings by keysym depend on the keyboard layout; `--to-code` binds the first layout's code.

## Config
```
set $mod Mod4
set $term foot
floating_modifier $mod normal
bindsym $mod+Return exec $term
bindsym $mod+Shift+q kill
bindsym $mod+f fullscreen toggle
bindsym $mod+Shift+space floating toggle
bindsym $mod+h focus left
bindsym $mod+j focus down
bindsym $mod+k focus up
bindsym $mod+l focus right
bindsym $mod+Shift+h move left
bindsym $mod+Shift+l move right
bindsym $mod+b splith
bindsym $mod+v splitv
bindsym $mod+1 workspace number 1
bindsym $mod+Shift+1 move container to workspace number 1
bindsym $mod+Shift+c reload
```

## Notes
- sway warns (swaynag) when a bind overwrites another; silence with `--no-warn`.
- `Mod4` is Super, `Mod1` is Alt. Keep the user's existing `$mod`.
- `unbindsym <combo>` removes a default bind.
- Override a bind only after the plan is shown to the user; the default config is full of working ones.
