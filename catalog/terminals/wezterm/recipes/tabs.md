---
capability: tabs
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/config/enable_tab_bar.html, https://wezterm.org/config/lua/config/hide_tab_bar_if_only_one_tab.html, https://wezterm.org/config/lua/config/use_fancy_tab_bar.html, https://wezterm.org/config/appearance.html
---
# Tabs in WezTerm
Tabs are built in. Control the bar with `enable_tab_bar`, `hide_tab_bar_if_only_one_tab`, `use_fancy_tab_bar` and `tab_bar_at_bottom`.

## Config
Look spec `tabs`: `always` / `auto` / `hidden`:
```lua
config.enable_tab_bar = true                    -- hidden: false
config.hide_tab_bar_if_only_one_tab = false     -- auto: true, always: false
config.use_fancy_tab_bar = false                -- false = retro bar in the terminal font; true (default) = native look
config.tab_bar_at_bottom = false                -- since 20210502-130208-bff6815d
config.tab_max_width = 24                       -- retro bar only, default 16
config.colors.tab_bar = {
  background = '{palette.background}',
  active_tab = { bg_color = '{palette.selectionBackground}', fg_color = '{palette.foreground}' },
  inactive_tab = { bg_color = '{palette.background}', fg_color = '{palette.ansi.brightBlack}' },
  inactive_tab_hover = { bg_color = '{palette.background}', fg_color = '{palette.foreground}', italic = true },
  new_tab = { bg_color = '{palette.background}', fg_color = '{palette.ansi.brightBlack}' },
  new_tab_hover = { bg_color = '{palette.background}', fg_color = '{palette.foreground}' },
}
```
Fancy tab bar colors (when `use_fancy_tab_bar = true`):
```lua
config.window_frame = {
  active_titlebar_bg = '{palette.background}',
  inactive_titlebar_bg = '{palette.background}',
  font = wezterm.font { family = '{font.family}', weight = 'Bold' },
  font_size = {font.size},
}
```
Default keys: `CTRL+SHIFT+T` (or `SUPER+t`) new tab, `CTRL+Tab` next tab, `CTRL+SHIFT+Tab` previous tab.

## Notes
- The retro bar uses the main terminal font and `config.colors.tab_bar`; the fancy bar uses `window_frame` and its own font (default Roboto, 10pt on Windows, 12pt elsewhere).
- `window_frame` color keys mainly matter on Wayland client-side decorations and for the fancy tab bar (documented).
- `tab_bar` is a key inside `config.colors`: put it inside the palette table, or assign `config.colors.tab_bar` after `config.colors = {...}`. A second `config.colors = {...}` assignment would overwrite the palette.
