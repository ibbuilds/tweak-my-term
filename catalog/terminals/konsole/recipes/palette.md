---
capability: palette
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://invent.kde.org/utilities/konsole/-/blob/master/src/colorscheme/ColorScheme.cpp, https://github.com/KDE/konsole/blob/master/data/color-schemes/Breeze.colorscheme
---
# Palette in Konsole
Write a color scheme file `~/.local/share/konsole/{look.name}.colorscheme` (INI), then point the profile at it with `ColorScheme={look.name}` (see the profiles recipe). Every color is its own section with `Color=R,G,B` in decimal 0-255; `{palette.X.rgb}` below means the token converted from hex to `R,G,B`.

## Config
```ini
[General]
Description={look.name}
Opacity=1
Wallpaper=

[Background]
Color={palette.background.rgb}
[BackgroundIntense]
Color={palette.background.rgb}
[BackgroundFaint]
Color={palette.background.rgb}
[Foreground]
Color={palette.foreground.rgb}
[ForegroundIntense]
Color={palette.foreground.rgb}
[ForegroundFaint]
Color={palette.foreground.rgb}

[Color0]
Color={palette.ansi.black.rgb}
[Color1]
Color={palette.ansi.red.rgb}
[Color2]
Color={palette.ansi.green.rgb}
[Color3]
Color={palette.ansi.yellow.rgb}
[Color4]
Color={palette.ansi.blue.rgb}
[Color5]
Color={palette.ansi.magenta.rgb}
[Color6]
Color={palette.ansi.cyan.rgb}
[Color7]
Color={palette.ansi.white.rgb}
[Color0Intense]
Color={palette.ansi.brightBlack.rgb}
[Color1Intense]
Color={palette.ansi.brightRed.rgb}
[Color2Intense]
Color={palette.ansi.brightGreen.rgb}
[Color3Intense]
Color={palette.ansi.brightYellow.rgb}
[Color4Intense]
Color={palette.ansi.brightBlue.rgb}
[Color5Intense]
Color={palette.ansi.brightMagenta.rgb}
[Color6Intense]
Color={palette.ansi.brightCyan.rgb}
[Color7Intense]
Color={palette.ansi.brightWhite.rgb}
```
Also add `[Color0Faint]` to `[Color7Faint]` (dim SGR 2 text): each normal color blended about 40% toward the background.

## Notes
- Section names come from the source color table: `Foreground`, `Background`, `Color0`-`Color7`, each with an `Intense` and a `Faint` variant. Breeze ships all of them, so write all of them.
- A scheme has no cursor or selection colors. Cursor colors are profile keys (cursor recipe); `selectionBackground` has no direct key (the profile's `InvertSelectionColors` is the only selection option found).
- Konsole draws bold text in the Intense color when the profile's `BoldIntense=true` (default).
- Other `[General]` keys: `Opacity`, `Blur`, `Wallpaper`, `FillStyle`, `Anchor`, `WallpaperOpacity`, `WallpaperFlipType`, `ColorRandomization` (see the opacity, blur and background-image recipes).
