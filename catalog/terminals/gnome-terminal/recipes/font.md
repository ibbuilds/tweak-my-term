---
capability: font
tool: gnome-terminal
os: linux
verified: 2026-11-23 (docs, gnome-terminal 3.60.0)
sources: https://gitlab.gnome.org/GNOME/gnome-terminal/-/blob/master/src/org.gnome.Terminal.gschema.xml
---
# Font in GNOME Terminal
`font` is a Pango font description string (`Family Style Size`); it is used only when `use-system-font` is false.

## Config
```sh
UUID=$(gsettings get org.gnome.Terminal.ProfilesList default | tr -d "'")
PROFILE="org.gnome.Terminal.Legacy.Profile:/org/gnome/terminal/legacy/profiles:/:$UUID/"
gsettings set "$PROFILE" use-system-font false
gsettings set "$PROFILE" font "'{font.family} {font.size}'"
```

## Notes
- Default is `'Monospace 12'` with `use-system-font=true`.
- Weight/style go inside the string, e.g. `'JetBrains Mono Medium 13'` or `'JetBrains Mono Bold 13'`; map `font.weight` to the style word the family exposes (check `fc-list | grep -i "jetbrains"`).
- Fractional sizes (`13.5`) are valid in Pango strings; unverified for this app.
- A missing family silently falls back to the default monospace font.
- Related: `cell-height-scale` and `cell-width-scale` (1.0 to 2.0) in the line-height recipe.
