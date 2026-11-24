---
capability: quake
tool: guake
os: linux
verified: 2026-11-23 (docs, Guake 3.10.1)
sources: https://github.com/Guake/guake/blob/master/guake/data/org.guake.gschema.xml, https://github.com/Guake/guake/blob/master/docs/source/user/installing.rst
---
# Drop-down (quake) terminal in Guake
Guake is a drop-down terminal: a hotkey slides it in from a screen edge. Size, position, focus-loss behavior and the hotkey are dconf keys.

## Config
```sh
gsettings set guake.general window-height 45
gsettings set guake.general window-width 100
gsettings set guake.general window-halignment 0
gsettings set guake.general window-valignment 0
gsettings set guake.general window-ontop true
gsettings set guake.general window-losefocus false
gsettings set guake.keybindings.global show-hide "'F12'"
```

## Notes
- `window-height` and `window-width` are integer percentages of the screen (defaults 50 and 100). `window-halignment`: 0 center, 1 left, 2 right. `window-valignment`: 0 top, 1 bottom. `window-horizontal-displacement` / `window-vertical-displacement` shift the window by pixels.
- `window-losefocus` (default false) hides Guake when it loses focus; `lazy-losefocus` delays that slightly.
- `mouse-display` (bool) follows the mouse across monitors; `display-n` (int) picks a fixed monitor.
- `show-hide` (default `'F12'`) is a GTK accelerator string such as `'<Super>grave'`. `show-focus` (default empty) shows and focuses.
- Wayland: the global hotkey does not work there. Add a GNOME custom shortcut (Settings > Keyboard > Custom Shortcuts) running `guake-toggle`, as the install docs describe.
- Autostart at login: `gsettings set guake.general start-at-login true`.
