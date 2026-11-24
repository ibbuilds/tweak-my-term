---
capability: background-image
tool: guake
os: linux
verified: 2026-11-23 (docs, Guake 3.10.1)
sources: https://github.com/Guake/guake/blob/master/guake/data/org.guake.gschema.xml, https://github.com/Guake/guake/blob/master/guake/prefs.py, https://github.com/Guake/guake/blob/master/guake/data/prefs.glade
---
# Background image in Guake
`guake.general background-image-file` takes a path to a JPEG, PNG or GIF file; `background-image-layout-mode` picks how it is placed.

## Config
```sh
gsettings set guake.general background-image-file "'{background.image}'"
gsettings set guake.general background-image-layout-mode 0
```

## Notes
- `background-image-layout-mode` (int): 0 Scale, 1 Tile, 2 Center, 3 Stretch (order of the Preferences combo in prefs.glade; the schema description does not list the values). Look `fit` mapping, to verify visually: cover=0, fill=3, center=2, tile=1.
- The Preferences code only accepts `.jpg`, `.jpeg`, `.png` and `.gif` files; other extensions are stored as an empty path. Use an absolute path.
- Clear it with `gsettings set guake.general background-image-file "''"`.
- The image sits under the terminal text; combine it with a lower `guake.style.background transparency` only if the image should show through the compositor too. Contrast over the image is not adjustable (no tint key).
