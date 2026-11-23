---
capability: quake
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference, https://ghostty.org/docs/config/keybind/reference
---
# Quick terminal (quake) in Ghostty
Drop-down terminal toggled by the `toggle_quick_terminal` action. Position and size are set with `quick-terminal-*` keys.
## Config
```
keybind = global:cmd+backquote=toggle_quick_terminal    # macOS
# Linux: `global:` is macOS only, so bind a normal key (or a compositor shortcut)
# keybind = ctrl+grave_accent=toggle_quick_terminal
quick-terminal-position = top    # top | bottom | left | right | center
quick-terminal-size = 40%        # or 300px, or 50%,500px (primary,secondary axis)
quick-terminal-screen = main     # main | mouse | macos-menu-bar
quick-terminal-autohide = true
quick-terminal-animation-duration = 0.2
```
## Notes
- `global:` keybinds are macOS only and need Accessibility permission.
- Linux: Wayland only (not X11) and only on compositors with `wlr-layer-shell-v1`, so not GNOME. Slide animation only on KDE with the "Sliding Popups" plugin. `gtk-quick-terminal-layer`: overlay, top (default), bottom, background. `quick-terminal-keyboard-interactivity`: none, on-demand (default), exclusive (Wayland only).
- `quick-terminal-screen` is implemented on macOS and, since 1.4.0, Wayland. `quick-terminal-animation-duration` is macOS only. On macOS, changing `quick-terminal-position` needs a full restart.
- A bare size number without `%` or `px` is a config error. `quick-terminal-autohide` defaults to true on macOS and false on Linux.
