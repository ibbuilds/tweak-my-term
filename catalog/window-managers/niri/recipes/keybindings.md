---
capability: keybindings
tool: niri
os: linux
verified: 2026-11-23 (docs, niri 26.04)
sources: https://github.com/niri-wm/niri/wiki/Configuration:-Key-Bindings, https://raw.githubusercontent.com/niri-wm/niri/main/resources/default-config.kdl
---
# Keybindings in niri
`binds { <Mod+Key> [props] { <action>; } }`. Modifiers join with `+` before an XKB key name. Props include `repeat=false`, `cooldown-ms=150`, `allow-when-locked=true`, `hotkey-overlay-title="..."`. `spawn "cmd" "arg"` runs a program without a shell; `spawn-sh "cmd | pipe"` (25.08+) uses `sh`.

## Config
```kdl
binds {
    Mod+Return { spawn "foot"; }
    Mod+Q repeat=false { close-window; }
    Mod+Left  { focus-column-left; }
    Mod+Right { focus-column-right; }
    Mod+Down  { focus-window-down; }
    Mod+Up    { focus-window-up; }
    Mod+Shift+Left  { move-column-left; }
    Mod+Shift+Right { move-column-right; }
    Mod+BracketLeft  { consume-or-expel-window-left; }
    Mod+BracketRight { consume-or-expel-window-right; }
    Mod+R { switch-preset-column-width; }
    Mod+F { maximize-column; }
    Mod+Shift+F { fullscreen-window; }
    Mod+V { toggle-window-floating; }
    Mod+1 { focus-workspace 1; }
    Mod+Shift+E { quit; }
}
```

## Notes
- This section is not filled with defaults: copy the whole `binds` block from the default config (`resources/default-config.kdl`) and then edit it, or you lose workspace, screenshot and quit binds.
- The default config binds `Mod+T` to alacritty and `Mod+Shift+/` to a hotkey overlay.
- Mouse wheel binds exist (`Mod+WheelScrollDown cooldown-ms=150 { focus-workspace-down; }`).
- Duplicate binds are a config error and the message shows the first definition.
- Show the plan before replacing a bind the user already uses.
