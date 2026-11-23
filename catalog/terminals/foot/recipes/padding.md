---
capability: padding
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://man.archlinux.org/man/foot.ini.5
---
# Padding in foot
`pad` is `XxY` or `LEFTxTOPxRIGHTxBOTTOM`, optionally followed by a centering mode.
## Config
```ini
# look padding = [top, right, bottom, left]
pad={padding.left}x{padding.top}x{padding.right}x{padding.bottom} center-when-maximized-and-fullscreen
```
## Notes
- Default is `0x0 center-when-maximized-and-fullscreen`. Other modes: `center`, `center-when-fullscreen`.
- Note the order differs from the look spec (CSS top/right/bottom/left): foot wants left, top, right, bottom.
- `resize-by-cells=yes` (default) snaps window size to whole cells, which can show extra bar space; set `no` for pixel-exact tiling.
- The unit (pixels) is not spelled out in the man page excerpt read; assumed pixels.
