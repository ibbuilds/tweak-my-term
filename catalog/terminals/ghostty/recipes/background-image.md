---
capability: background-image
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference
---
# Background image in Ghostty
`background-image` takes a PNG or JPEG path (since 1.2.0). Control fit, position, repeat and opacity with the companion keys.
## Config
```
background-image = {background.image}
background-image-opacity = {background.opacity}
background-image-fit = cover
background-image-position = center
background-image-repeat = false
```
## Notes
- Formats: PNG and JPEG only; other formats are not supported yet.
- `background-image-fit`: `contain` (default), `cover`, `stretch`, `none`. Map look `fit`: fill=stretch, cover=cover, contain=contain, center=none with `background-image-position = center`, tile=none with `background-image-repeat = true`.
- `background-image-position`: top-left, top-center, top-right, center-left, center (default), center-right, bottom-left, bottom-center, bottom-right.
- `background-image-opacity` default 1.0, relative to `background-opacity`.
- Readability: keep the image dim (opacity about 0.15-0.35) or darken the image itself; no tint option was seen in the reference.
- Use an absolute path; `~` expansion was not verified.
