---
capability: titlebar
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://invent.kde.org/utilities/konsole/-/blob/master/src/settings/konsole.kcfg
---
# Titlebar in Konsole
`[KonsoleWindow] RemoveWindowTitleBarAndFrame` in `~/.config/konsolerc` drops the window title bar and frame. Otherwise the title bar is drawn by the window manager.

## Config
```sh
# look titlebar: native -> false, hidden -> true. integrated has no equivalent: use native.
kwriteconfig6 --file konsolerc --group KonsoleWindow --key RemoveWindowTitleBarAndFrame true
```

## Notes
- Only native or borderless; there is no tabs-in-titlebar mode.
- Removing the frame removes the drag area and resize edges unless the window manager offers Alt+drag. Keep it native unless the user runs a tiling setup.
- `ShowWindowTitleOnTitleBar` (same group) toggles the title text. Ctrl+Shift+M toggles the menu bar; `konsole --hide-menubar` hides it for one launch.
- Applies to new windows; restart Konsole.
