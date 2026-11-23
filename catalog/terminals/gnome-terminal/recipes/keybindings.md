---
capability: keybindings
tool: gnome-terminal
os: linux
verified: 2026-11-23 (docs, gnome-terminal 3.60.0)
sources: https://gitlab.gnome.org/GNOME/gnome-terminal/-/blob/master/src/org.gnome.Terminal.gschema.xml
---
# Key bindings in GNOME Terminal
Shortcuts are keys of `org.gnome.Terminal.Legacy.Keybindings` (path `/org/gnome/terminal/legacy/keybindings/`), GTK accelerator strings, `'disabled'` to unbind.

## Config
```sh
K=org.gnome.Terminal.Legacy.Keybindings:/org/gnome/terminal/legacy/keybindings/
gsettings set $K new-tab "'<Control><Shift>t'"
gsettings set $K close-tab "'<Control><Shift>w'"
gsettings set $K zoom-in "'<Control>plus'"
gsettings set $K find "'disabled'"
```

## Notes
- Names available include `new-tab`, `new-window`, `close-tab`, `close-window`, `copy`, `paste`, `select-all`, `find`, `next-tab`, `prev-tab`, `move-tab-left`, `move-tab-right`, `detach-tab`, `full-screen`, `reset`, `reset-and-clear`, `zoom-in`, `zoom-out`, `zoom-normal`, `switch-to-tab-1` to `switch-to-tab-35`, `switch-to-tab-last`.
- This only rebinds terminal actions. It cannot send arbitrary text/escape sequences from a key; use the shell (readline `bind`, zsh `bindkey`) for that.
- Global switches in `org.gnome.Terminal.Legacy.Settings`: `shortcuts-enabled` (turn all off so apps get the keys) and `menu-accelerator-enabled` (F10 menu).
