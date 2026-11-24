---
capability: opacity
tool: ddterm
os: linux
verified: 2026-11-23 (docs, ddterm 64.1.0)
sources: https://github.com/ddterm/gnome-shell-extension-ddterm/blob/master/schemas/org.gnome.shell.extensions.ddterm.gschema.xml, https://github.com/ddterm/gnome-shell-extension-ddterm/blob/master/ddterm/app/terminalsettings.js
---
# Window opacity in ddterm
The terminal background alpha is 1.0 when `transparent-background` is false. When it is true, the alpha is `terminal-background-opacity` if `override-background-opacity` is true, else `background-opacity` (logic read in ddterm/app/terminalsettings.js).

## Config
```sh
S=org.gnome.shell.extensions.ddterm   # see the tool notes if gsettings says No such schema
gsettings set $S transparent-background true
gsettings set $S override-background-opacity true
gsettings set $S terminal-background-opacity {window.opacity}
```

## Notes
- Values are doubles from 0.0 to 1.0. Schema defaults: `transparent-background` true, `background-opacity` 0.9, `override-background-opacity` false, `terminal-background-opacity` 0.9.
- Setting only `background-opacity` also works while `override-background-opacity` is false; the override pair is what the Preferences "Background Opacity" row edits.
- Only the background is translucent; text stays opaque. There is no blur key in the schema.
- `shortcut-background-opacity-inc` / `-dec` and `shortcut-toggle-transparent-background` change it at runtime.
