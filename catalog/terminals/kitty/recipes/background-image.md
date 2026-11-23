---
capability: background-image
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/, https://sw.kovidgoyal.net/kitty/changelog/
---
# Background image in kitty
`background_image` takes a path to a PNG, JPEG, WEBP, TIFF, GIF or BMP file. `background_image_layout` controls placement, `background_tint` darkens it for readability.
## Config
```
background_image {background.image}
background_image_layout cscaled
background_image_linear no
background_tint 0.6
background_tint_gaps 1.0
background_opacity {window.opacity}
```
## Notes
- `background_image_layout`: `tiled` (default), `mirror-tiled`, `scaled` (stretches), `cscaled` (scaled, keeps aspect ratio), `clamped`, `centered` (the last two are not defined in the docs read). Look `fit` mapping: fill=scaled, cover=cscaled, contain=centered or clamped (verify visually), center=centered, tile=tiled.
- `background_tint` mixes the window background color over the image (default 0.0); use 0.4-0.7 so text stays readable.
- Since 0.51.0 the image must be a regular file (devices such as /dev/zero are rejected).
- `background_image_linear yes` uses linear interpolation, smoother when scaling.
- Runtime change: `kitten @ set-background-image <path>` (needs `allow_remote_control`).
