---
capability: line-height
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://invent.kde.org/utilities/konsole/-/blob/master/src/profile/Profile.cpp
---
# Line height in Konsole
`LineSpacing` in the profile's `[Appearance]` group adds extra space between lines, in pixels (integer, default 0).

## Config
```ini
[Appearance]
# look lineHeight 1.2 on a ~20px cell is about 4px extra; round to a whole pixel
LineSpacing=4
```

## Notes
- It is an additive pixel value, not a multiplier. Convert with `round((font.lineHeight - 1) * cell height in px)`; at 12pt and 96 DPI a cell is roughly 20px tall.
- There is no letter-spacing or cell-width key.
- New sessions pick it up; reapply the profile (Settings > Switch Profile) for open tabs.
