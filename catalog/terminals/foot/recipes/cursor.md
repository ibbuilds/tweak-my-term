---
capability: cursor
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://man.archlinux.org/man/foot.ini.5
---
# Cursor in foot
`[cursor]` section: `style`, `blink`, `blink-rate`, `beam-thickness`. Colors come from `cursor=` in the colors section.
## Config
```ini
[cursor]
style=block      # block | beam | underline | hollow
blink=no
blink-rate=500
beam-thickness=1.5

[colors-dark]
cursor={palette.cursorText} {palette.cursor}
```
## Notes
- Look mapping: block=`block`, bar=`beam`, underline=`underline`, hollow-block=`hollow`.
- `unfocused-style`: `unchanged`, `hollow`, `none`.
- Applications can override blink. `underline-thickness` is also available.
