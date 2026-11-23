---
capability: cursor
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/config/default_cursor_style.html, https://wezterm.org/config/lua/config/cursor_blink_rate.html, https://wezterm.org/config/lua/config/animation_fps.html
---
# Cursor in WezTerm
`default_cursor_style` picks shape and blink; `cursor_blink_rate` is in milliseconds (0 disables blinking). Cursor colors come from the palette (`cursor_bg`, `cursor_fg`, `cursor_border`).

## Config
```lua
-- look spec cursorShape: block|bar|underline  ->  Block|Bar|Underline; blink: true -> Blinking*, false -> Steady*
config.default_cursor_style = 'SteadyBlock'   -- SteadyBlock, BlinkingBlock, SteadyUnderline, BlinkingUnderline, SteadyBar, BlinkingBar
config.cursor_blink_rate = 0                  -- ms; 0 = no blink (use 800 for a blink)
config.cursor_thickness = '2px'               -- bar/underline thickness (since 20221119-145034-49b9839f)
```

## Notes
- The six styles above are the only choices; look-spec `hollow-block` has no direct key (use `SteadyBlock`).
- Applications (vim, shells) can override the style via escape sequences; `default_cursor_style` is what a reset returns to.
- Blinking raises GPU load and battery use (documented). `animation_fps` (default 10, since 20220319-142410-0fcdea07) sets the easing frame rate; `animation_fps = 1` plus `cursor_blink_ease_in/out = 'Constant'` gives a hard blink with no easing.
- `force_reverse_video_cursor = true` makes the cursor ignore the palette cursor colors.
