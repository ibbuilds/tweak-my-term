---
capability: titlebar
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://man.archlinux.org/man/foot.ini.5
---
# Titlebar in foot
`[csd] preferred` hints whether the compositor draws the titlebar (`server`, default), foot draws it (`client`), or none.
## Config
```ini
# look titlebar: native -> server, integrated -> client, hidden -> none
[csd]
preferred=server
```
## Notes
- It is only a hint; the compositor may ignore it. With `client`, tune `size` (26), `color`, `border-width`, `border-color`, `button-*` colors and `hide-when-maximized`.
- `none` removes decorations when the compositor allows it (tiling compositors usually hide them anyway).
- `initial-window-mode=windowed|maximized|fullscreen` sets the starting state.
