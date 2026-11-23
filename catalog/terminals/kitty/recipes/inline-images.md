---
capability: inline-images
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/kittens/icat/
---
# Inline images in kitty
kitty invented the graphics protocol that `kitten icat` uses. Nothing to configure.
## Config
```
# no config required
# usage: kitten icat path/to/image.png
```
## Notes
- Formats: PNG, JPG, GIF, BMP, TIFF, WEBP natively; more with ImageMagick.
- Over SSH use `--transfer-mode=stream`. In tmux `--passthrough` defaults to `detect`; tmux needs `allow-passthrough on`.
- `kitten icat --detect-support` checks whether the current terminal supports it.
- kitty does not use sixel.
