---
capability: font
tool: guake
os: linux
verified: 2026-11-23 (docs, Guake 3.10.1)
sources: https://github.com/Guake/guake/blob/master/guake/data/org.guake.gschema.xml
---
# Font in Guake
`guake.style.font style` is a Pango font description string (`Family Style Size`); it is used only when `guake.general use-default-font` is false.

## Config
```sh
gsettings set guake.general use-default-font false
gsettings set guake.style.font style "'{font.family} {font.size}'"
```

## Notes
- Schema default is `'Monospace 10'` with `use-default-font` true (the GNOME monospace font).
- Weight/style go inside the string, e.g. `'JetBrains Mono Medium 13'`; map `font.weight` to the style word the family exposes (check `fc-list | grep -i "jetbrains"`).
- Fractional sizes (`13.5`) are valid in Pango strings; unverified for this app.
- `guake.style.font cell-height-scale` and `cell-width-scale` (doubles, 1.0 to 2.0, default 1.0; VTE 0.52+) add line and letter spacing.
- A missing family silently falls back to a default monospace font.
