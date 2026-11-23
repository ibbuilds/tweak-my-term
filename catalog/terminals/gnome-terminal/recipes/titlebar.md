---
capability: titlebar
tool: gnome-terminal
os: linux
verified: 2026-11-23 (docs, gnome-terminal 3.60.0)
sources: https://gitlab.gnome.org/GNOME/gnome-terminal/-/blob/master/src/org.gnome.Terminal.gschema.xml
---
# Titlebar in GNOME Terminal
The schema has two window-chrome keys in `org.gnome.Terminal.Legacy.Settings`: `headerbar` (optional boolean: unset = follow the desktop, true = GNOME header bar, false = classic title bar) and `unified-menu` (menu inside the header bar). The schema notes they take effect only after `gnome-terminal-server` restarts.

## Config
```sh
S=org.gnome.Terminal.Legacy.Settings
# look titlebar: integrated -> headerbar true; native -> headerbar false
gsettings set $S headerbar true
# apply: close all terminal windows, then
pkill gnome-terminal-server
```
Reset to the desktop default: `gsettings reset $S headerbar`.

## Notes
- `hidden` (no title bar) is not a key. Under GNOME it needs a Shell extension or a window rule in the compositor.
- The `headerbar` type is `mb` (maybe-boolean); the true/false semantics above are inferred from the type and the GNOME Terminal UI, the schema only says default `nothing`. Check visually.
- Menu bar: the deprecated `default-show-menubar` key is unused.
