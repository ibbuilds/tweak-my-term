---
capability: blur
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://invent.kde.org/utilities/konsole/-/blob/master/src/colorscheme/ColorScheme.cpp
---
# Background blur in Konsole
`Blur=true` in the color scheme's `[General]` asks the compositor to blur what is behind the window. It only shows when `Opacity` is below 1.

## Config
```ini
[General]
Opacity={window.opacity}
Blur=true
```

## Notes
- Default is `Blur=false`. The key is read from the scheme (`ColorScheme.cpp`); the handbook pages read do not describe it.
- The blur is expected to come from KWin's Blur desktop effect (System Settings > Window Management > Desktop Effects); with it off, or on a compositor without a KDE blur protocol, there is likely no visible effect. Blur radius is not a Konsole key. This dependency is inferred, not documented; check visually.
