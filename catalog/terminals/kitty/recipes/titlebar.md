---
capability: titlebar
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/
---
# Titlebar in kitty
`hide_window_decorations` removes the OS titlebar/borders; `macos_titlebar_color` and `wayland_titlebar_color` tint it.
## Config
```
# look titlebar: native | integrated | hidden
hide_window_decorations no              # yes -> hidden
macos_titlebar_color background         # system | light | dark | background | <color>
wayland_titlebar_color background       # system | background | <color>
```
## Notes
- macOS values for `hide_window_decorations`: `yes`, `titlebar-only` (hide only the titlebar), `titlebar-and-corners`.- `macos_titlebar_color background` blends the titlebar into the terminal, the nearest thing to an integrated look.
- kitty has no tabs-in-titlebar mode; the tab bar is drawn inside the terminal area.
