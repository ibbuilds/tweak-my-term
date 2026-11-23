---
capability: window-rules
tool: hyprland
os: linux
verified: 2026-11-23 (docs, hyprland v0.57.2)
sources: https://wiki.hypr.land/Configuring/Basics/Window-Rules/, https://wiki.hypr.land/0.54.0/Configuring/Window-Rules/
---
# Window rules in Hyprland
A rule has a `match` table (`class`, `title`, `initial_class`, `float`, `workspace`, `tag`; RE2 regex) and effects. At least one match field is required. The last matching rule wins; named rules are evaluated before anonymous ones. Terminal classes: `kitty`, `foot`, `Alacritty`, `org.wezfurlong.wezterm`, `com.mitchellh.ghostty` (confirm with `hyprctl clients`).

## Config (Lua, 0.55+)
```lua
local term = "^(kitty|foot|Alacritty|org\\.wezfurlong\\.wezterm|com\\.mitchellh\\.ghostty)$"
hl.window_rule({ name = "term-opacity", match = { class = term }, opacity = "0.92 0.85" }) -- active, inactive
hl.window_rule({ name = "term-ws1",     match = { class = term }, workspace = "1" })
-- floating scratch terminal, started with: kitty --class scratch
hl.window_rule({ name = "scratch", match = { class = "^scratch$" }, float = true,
                 size = { "monitor_w*0.6", "monitor_h*0.5" }, center = true })
```
Hyprlang: 0.53 and 0.54 use `windowrule = opacity 0.92 0.85, match:class ^(kitty)$` and `windowrule = float on, match:class ^scratch$`. Before 0.53: `windowrulev2 = float, class:^scratch$`.

## Notes
- Opacity multiplies with `decoration.active_opacity`; add `override` after a value for an absolute one (`"0.92 override 0.85 override"`).
- Static effects (`float`, `size`, `move`, `center`, `workspace`, `monitor`, `tile`) apply when the window opens, not after a later title change.
- `workspace = "2 silent"` opens it without switching. `size` and `move` accept expressions like `monitor_w*0.5`.
- Other effects: `border_size`, `rounding`, `border_color`, `no_blur`, `no_shadow`, `pin`, `fullscreen`, `no_initial_focus`.
