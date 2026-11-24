---
capability: font
tool: ddterm
os: linux
verified: 2026-11-23 (docs, ddterm 64.1.0)
sources: https://github.com/ddterm/gnome-shell-extension-ddterm/blob/master/schemas/org.gnome.shell.extensions.ddterm.gschema.xml
---
# Font in ddterm
`custom-font` is a Pango font description string (`Family Style Size`); it is used only when `use-system-font` is false.

## Config
```sh
S=org.gnome.shell.extensions.ddterm   # see the tool notes if gsettings says No such schema
gsettings set $S use-system-font false
gsettings set $S custom-font "'{font.family} {font.size}'"
```

## Notes
- Schema default is `"Monospace Regular 10"` with `use-system-font` true.
- Weight/style go inside the string, e.g. `'JetBrains Mono Medium 13'`; map `font.weight` to the style word the family exposes (check `fc-list | grep -i "jetbrains"`).
- Fractional sizes (`13.5`) are valid in Pango strings; unverified for this app.
- A missing family silently falls back to the default monospace font.
- Runtime zoom shortcuts exist (`shortcut-font-scale-increase`, `-decrease`, `-reset`); they do not change the stored font.
