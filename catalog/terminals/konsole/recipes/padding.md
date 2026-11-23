---
capability: padding
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://invent.kde.org/utilities/konsole/-/blob/master/src/profile/Profile.cpp
---
# Padding in Konsole
The profile's `[General]` group has one uniform `TerminalMargin` in pixels (default 1) and `TerminalCenter` to center the text grid in leftover space.

## Config
```ini
[General]
# look padding is [top, right, bottom, left]; Konsole takes one value, so use the horizontal side
TerminalMargin={window.padding.left}
TerminalCenter=false
```

## Notes
- No per-side padding. If the look spec has unequal sides, use the left value and say so in the plan.
- The margin is painted with the scheme background (or wallpaper).
- `TerminalCenter=true` helps with a fixed `TerminalColumns`/`TerminalRows` size.
