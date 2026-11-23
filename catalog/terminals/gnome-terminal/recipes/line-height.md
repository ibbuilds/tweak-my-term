---
capability: line-height
tool: gnome-terminal
os: linux
verified: 2026-11-23 (docs, gnome-terminal 3.60.0)
sources: https://gitlab.gnome.org/GNOME/gnome-terminal/-/blob/master/src/org.gnome.Terminal.gschema.xml
---
# Line height in GNOME Terminal
`cell-height-scale` multiplies the cell height (line spacing without changing the font height). Range 1.0 to 2.0, default 1.0. `cell-width-scale` does the same for letter spacing.

## Config
```sh
UUID=$(gsettings get org.gnome.Terminal.ProfilesList default | tr -d "'")
PROFILE="org.gnome.Terminal.Legacy.Profile:/org/gnome/terminal/legacy/profiles:/:$UUID/"
gsettings set "$PROFILE" cell-height-scale {font.lineHeight}
# optional letter spacing
# gsettings set "$PROFILE" cell-width-scale 1.0
```

## Notes
- The minimum is 1.0: a look-spec `lineHeight` below 1 cannot be honored; clamp to 1.0 and say so in the plan.
- The key is a double, so write `1.2`, not `'1.2'`.
