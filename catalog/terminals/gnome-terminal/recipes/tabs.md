---
capability: tabs
tool: gnome-terminal
os: linux
verified: 2026-11-23 (docs, gnome-terminal 3.60.0)
sources: https://gitlab.gnome.org/GNOME/gnome-terminal/-/blob/master/src/org.gnome.Terminal.gschema.xml
---
# Tabs in GNOME Terminal
Tabs are built in. Tab behavior is global, in `org.gnome.Terminal.Legacy.Settings` (path `/org/gnome/terminal/legacy/`), not per profile.

## Config
```sh
S=org.gnome.Terminal.Legacy.Settings
# look tabs: always -> 'always', auto -> 'automatic' (default). 'hidden' is not available.
gsettings set $S tab-policy "'automatic'"
# open new terminals as tabs instead of windows ('window' is the default)
gsettings set $S new-terminal-mode "'tab'"
# 'last' (default) or 'next' (next to the current tab)
gsettings set $S new-tab-position "'last'"
```

## Notes
- The tab-policy enum has only `always` and `automatic`; the `never` value is commented out in the schema, so `hidden` cannot be honored.
- The older `tab-position` key is marked deprecated and unused.
- Default keys: Ctrl+Shift+T new tab, Ctrl+PageUp/PageDown switch (see the keybindings recipe for the schema names).
- `rounded-corners` (`none`, `top`, `all`; default `top`) is a window-shape option in the same schema.
