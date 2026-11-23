---
capability: tabs
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/, https://sw.kovidgoyal.net/kitty/overview/
---
# Tabs in kitty
`tab_bar_style` (`fade` default, `slant`, `separator`, `powerline`, `custom`, `hidden`) and `tab_bar_edge` (`bottom` default, `top`, `left`, `right`).
## Config
```
tab_bar_style powerline
tab_bar_edge top
tab_bar_min_tabs 1          # always: 1, auto: 2 (default)
# hidden: tab_bar_style hidden
```
## Notes
- `tab_bar_min_tabs` is not in the excerpt read (unverified); the tab_bar_style `hidden` value is documented.
- Defaults: new tab `ctrl+shift+t` (macOS `cmd+t`), close `ctrl+shift+q`, next `ctrl+shift+right`, previous `ctrl+shift+left`, move `ctrl+shift+.` / `ctrl+shift+,`, title `ctrl+shift+alt+t`.
- `custom` style needs a `draw_tab` function in `tab_bar.py` in the config dir.
