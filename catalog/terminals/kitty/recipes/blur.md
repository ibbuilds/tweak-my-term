---
capability: blur
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/
---
# Background blur in kitty
`background_blur` takes a positive integer and only works when `background_opacity` is below 1. Supported on macOS and Wayland.
## Config
```
background_opacity {window.opacity}
background_blur 20
```
## Notes
- On macOS the value also sets the blur radius. On Wayland support depends on the compositor; the docs list only macOS and Wayland.
- Default is 0 (off). Version added not stated in the docs read.
