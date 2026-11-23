---
capability: window-rules
tool: i3
os: linux
verified: 2026-11-23 (docs, i3 4.25.1)
sources: https://i3wm.org/docs/userguide.html
---
# Window rules in i3
`for_window <criteria> <command>[, <command>...]` runs commands on matching windows as they appear; `assign <criteria> → workspace <name>` places them. Criteria are bracketed: `class`, `instance`, `title`, `window_role`, values are regexes. Find the real values with `xprop WM_CLASS` (click the terminal).

## Config
Typical X11 terminal classes: `kitty`, `Alacritty`, `org.wezfurlong.wezterm`, `com.mitchellh.ghostty`, `XTerm`. (`foot` is Wayland only and cannot run under i3.)
```
for_window [class="^(kitty|Alacritty)$"] border pixel 2
assign [class="^kitty$"] → workspace number 1
# floating, centered scratch terminal (start with: kitty --class scratch)
for_window [class="^scratch$"] floating enable, resize set 1000 600, move position center
```

## Notes
- i3 has no `opacity` command. Window transparency, blur and rounded corners come from an X11 compositor such as picom, configured outside i3.
- `resize set <w> <h>` takes px by default; `ppt` is percent of the parent. `move position center` centers a floating window.
- `assign` and `for_window` run once when the window is created; they do not move already open windows.
- `for_window [class=".*"] title_format "<b>%title</b>"` styles titles for all windows.
- Use `workspace number 1` so a renamed workspace still matches.
