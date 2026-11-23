---
capability: startup-layout
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/lua/gui-events/gui-startup.html, https://wezterm.org/config/lua/wezterm.mux/spawn_window.html
---
# Startup layout in WezTerm
Handle the `gui-startup` event (since 20220624-141144-bd1b7c5d): spawn a window with `wezterm.mux.spawn_window` and split panes from it. If the handler creates panes, they replace the default program.

## Config
```lua
local mux = wezterm.mux
wezterm.on('gui-startup', function(cmd)
  -- cmd carries `wezterm start -- <prog>` arguments (since 20220807-113146-c2fee766)
  local tab, pane, window = mux.spawn_window(cmd or {})
  -- right 30% pane
  pane:split { size = 0.3 }
  -- a second tab running something
  window:spawn_tab { args = { 'top' } }
  window:gui_window():maximize()   -- optional
end)
```
Look spec `layout.arrangement` (pane tree, see render.md) becomes the `split` calls: `direction = 'Right'|'Left'|'Top'|'Bottom'`, `size = 0.3`, `cwd = '/path'`, `args = { ... }`.

## Notes
- Register the handler at top level of the config, outside any function.
- The config file is evaluated more than once per process (at start and on reload); do not launch side-effect processes in the main flow.
- `wezterm.mux.spawn_window` options: `args`, `cwd`, `set_environment_variables`, `domain`, `workspace`. `pane:send_text('cmd\n')` types into a pane.
- The event does not fire for `wezterm connect`.
- `window:spawn_tab { args = ... }` is the MuxWindow API method; `window:gui_window()` returns the GUI window for `maximize()`.
