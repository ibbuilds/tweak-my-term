---
capability: opacity
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://invent.kde.org/utilities/konsole/-/blob/master/src/colorscheme/ColorScheme.cpp, https://docs.kde.org/stable_kf6/en/konsole/konsole/command-line-options.html
---
# Opacity in Konsole
Background opacity belongs to the color scheme, not the profile: `Opacity` (0.0 to 1.0) in `[General]` of `~/.local/share/konsole/{look.name}.colorscheme`.

## Config
```ini
[General]
Description={look.name}
Opacity={window.opacity}
```

## Notes
- Needs a compositor (KWin and Wayland compositors composite by default; X11 without one shows black).
- `konsole --notransparency` forces opaque windows, handy for debugging.
- Only the background is translucent; text stays solid. Pair with blur for legibility over wallpapers.
- Keep `Opacity=1` when the look spec sets none.
