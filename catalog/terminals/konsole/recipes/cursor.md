---
capability: cursor
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://invent.kde.org/utilities/konsole/-/blob/master/src/profile/Profile.cpp, https://invent.kde.org/utilities/konsole/-/blob/master/src/Enumeration.h
---
# Cursor in Konsole
Shape and color are in `[Cursor Options]`; blinking is in `[Terminal Features]`.

## Config
```ini
[Cursor Options]
# look cursorShape: block -> 0, bar -> 1 (I-beam), underline -> 2
CursorShape=0
UseCustomCursorColor=true
CustomCursorColor={palette.cursor.rgb}
CustomCursorTextColor={palette.cursorText.rgb}

[Terminal Features]
BlinkingCursorEnabled=false
```

## Notes
- `hollow-block` has no key; use block.
- With `UseCustomCursorColor=false` (default) the cursor inverts the cell colors. Colors are decimal `R,G,B`.
- `AnimatingCursorEnabled` (same group as blinking, default false) smooths cursor movement.
- Applications can still change the shape with escape sequences.
