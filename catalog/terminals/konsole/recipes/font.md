---
capability: font
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://invent.kde.org/utilities/konsole/-/blob/master/src/profile/Profile.cpp
---
# Font in Konsole
The profile's `[Appearance]` group holds `Font` as a Qt font string: `family,pointSize,pixelSize,styleHint,weight,italic,underline,strikeOut,fixedPitch,...`. Edit it in `~/.local/share/konsole/{look.name}.profile`.

## Config
```ini
[Appearance]
Font={font.family},{font.size},-1,5,400,0,0,0,0,0,0,0,0,0,0,1
AntiAliasFonts=true
```

## Notes
- The tail `-1,5,400,0,0,0,0,0,0,0,0,0,0,1` is what Konsole writes on Qt6 builds (weight 400 = Normal, 700 = Bold). Older Qt5 builds use 0-99 (Normal 50, Bold 75); copy the format from an existing profile if unsure. `font.weight` maps to the weight field.
- Use the family name only. Check installed names with `fc-list : family | sort -u`; a missing family silently falls back.
- `EmojiFont` (same group) sets a separate emoji font.
- `UseFontLineChararacters=true` draws box characters from the font instead of Konsole's own drawing (the key has this typo in the source).
