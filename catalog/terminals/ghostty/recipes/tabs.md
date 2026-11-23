---
capability: tabs
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference, https://ghostty.org/docs/install/release-notes/1-4-0
---
# Tabs in Ghostty
macOS uses native tabs. On Linux (GTK) `window-show-tab-bar` and `gtk-tabs-location` control the tab bar.
## Config
```
# Linux (GTK)
window-show-tab-bar = auto      # always (1.2.0+) | auto | never
gtk-tabs-location = top         # top | bottom | hidden
window-new-tab-position = current   # current | end
# macOS: tab bar inside the titlebar
macos-titlebar-style = tabs
```
## Notes
- Look `tabs`: always=`always`, auto=`auto` (shown with two or more tabs), hidden=`never`.
- `window-show-tab-bar` is Linux (GTK) only. On macOS use `macos-titlebar-style` (`native`, `transparent`, `tabs`, `hidden`).
- 1.4.0 added `gtk-tabs-inverted` (close button at the tab start).
- Tabs in the quick terminal are not supported on macOS.
