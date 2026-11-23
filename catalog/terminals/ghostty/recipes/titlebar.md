---
capability: titlebar
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference
---
# Titlebar in Ghostty
`window-decoration` toggles OS decorations; `macos-titlebar-style` and `gtk-titlebar` tune the look.
## Config
```
# look titlebar: native | integrated | hidden
window-decoration = auto            # none | auto | client | server (client/server since 1.1.0)
macos-titlebar-style = transparent  # native | transparent | tabs | hidden (default transparent)
gtk-titlebar = true                 # Linux GTK: full GTK titlebar instead of the WM titlebar
window-theme = auto                 # auto | system | light | dark | ghostty (ghostty is Linux only)
```
## Notes
- Hidden: `window-decoration = none` (or `macos-titlebar-style = hidden`, which keeps native borders).
- Integrated (tabs in the titlebar) on macOS: `macos-titlebar-style = tabs`.
- `window-titlebar-background` and `window-titlebar-foreground` need `window-theme = ghostty` and only work in the GTK runtime.
- `macos-titlebar-style` changes apply to new windows only. `gtk-titlebar` has no effect when decoration is `none`.
