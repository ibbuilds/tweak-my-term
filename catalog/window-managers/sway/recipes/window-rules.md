---
capability: window-rules
tool: sway
os: linux
verified: 2026-11-23 (docs, sway 1.12)
sources: https://man.archlinux.org/man/sway.5
---
# Window rules in sway
`for_window <criteria> <command>[, <command>...]` runs commands when a window appears. `assign <criteria> → workspace <name>` is the same as moving it there. Criteria are in brackets: `app_id` (native Wayland), `class` (Xwayland), `title`, `floating`, `workspace`, `shell`; values are quoted regexes. List real values with `swaymsg -t get_tree`.

## Config
Terminal app_ids: `kitty`, `foot`, `Alacritty`, `org.wezfurlong.wezterm`, `com.mitchellh.ghostty`.
```
for_window [app_id="^(kitty|foot|Alacritty|org\.wezfurlong\.wezterm|com\.mitchellh\.ghostty)$"] opacity 0.92
assign [app_id="^foot$"] → workspace number 1
# a floating, centered scratch terminal (start with: foot --app-id scratch)
for_window [app_id="^scratch$"] floating enable, resize set width 60 ppt height 50 ppt, move position center
for_window [app_id="^scratch$"] border pixel 2
```

## Notes
- `opacity <0..1>` sets the whole window's opacity, text included (`set|plus|minus` optional). It is separate from the terminal's own background opacity; use one of the two, not both.
- `for_window` runs when a matching window appears, so open a new terminal after a reload to test a rule.
- Pre-assign to a workspace by number, not name, so renames do not break it.
- For Xwayland terminals match `[class="..."]` instead of `app_id`.
- No rounded corners or blur rules exist in sway.
