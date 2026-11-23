---
capability: background-image
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://invent.kde.org/utilities/konsole/-/blob/master/src/colorscheme/ColorScheme.cpp, https://invent.kde.org/utilities/konsole/-/blob/master/src/colorscheme/ColorSchemeWallpaper.h
---
# Background image in Konsole
A color scheme can carry a wallpaper: set `Wallpaper` to an image path in the scheme's `[General]`, plus fill style, anchor and opacity.

## Config
```ini
[General]
Description={look.name}
Wallpaper={background.image}
FillStyle=Crop
Anchor=0.5,0.5
WallpaperOpacity={background.opacity}
WallpaperFlipType=NoFlip
```

## Notes
- Use an absolute path (`~` expansion is not documented).
- `FillStyle` values from the source enum: `Tile` (default), `Stretch`, `Crop`, `Adapt`, `NoScaling`. Suggested map from the look-spec fit: `cover` = `Crop`, `fill` = `Stretch`, `contain` = `Adapt`, `tile` = `Tile`, `center` = `NoScaling` with `Anchor=0.5,0.5`. The behavior of Crop and Adapt is inferred from their names; check visually.
- `Anchor` is `x,y` in 0-1. `WallpaperFlipType`: `NoFlip`, `Horizontal`, `Vertical`, `Both`.
- `WallpaperOpacity` (0-1) fades the image toward the scheme background; lower it so text stays readable.
- Static images only.
