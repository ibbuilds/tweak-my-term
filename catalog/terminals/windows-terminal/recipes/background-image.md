---
capability: background-image
tool: windows-terminal
os: windows
verified: 2026-11-23 (machine + docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/profile-appearance, https://learn.microsoft.com/windows/terminal/customize-settings/appearance
---
# Background image in Windows Terminal
Set `backgroundImage` plus alignment, stretch mode and opacity in `profiles.defaults` (or one profile). The image can be .jpg, .png or .gif. The key names below were verified on Windows 11.

## Config
```jsonc
"backgroundImage": "%USERPROFILE%\\.config\\{look.name}\\art\\{background.image}",
"backgroundImageAlignment": "topRight",
"backgroundImageOpacity": {background.opacity},
"backgroundImageStretchMode": "uniformToFill"
```

## Notes
- Stretch mode map: look-spec `cover` -> `uniformToFill` (default), `contain` -> `uniform`, `fill` -> `fill`, `center` -> `none` with `backgroundImageAlignment: "center"`. `tile` is not supported.
- `backgroundImageAlignment`: center (default), left, top, right, bottom, topLeft, topRight, bottomLeft, bottomRight.
- `backgroundImageOpacity` is a float 0-1 (default 1.0). Lower it, or darken the image itself, so text keeps contrast.
- `%USERPROFILE%` is expanded in `backgroundImage` (verified on this machine). Backslashes must be escaped in JSON. `"desktopWallpaper"` uses the desktop wallpaper. Since 1.24 a path may also point to a file next to `settings.json`; `ms-appdata:///Local/` and `ms-appdata:///Roaming/` URIs map into the packaged LocalState/RoamingState folders.
- Windows Terminal caches background images by path: after regenerating an image, save it under a new file name (for example `art-v2.png`) and update the setting.
- `experimental.useBackgroundImageForWindow: true` (top level, experimental) stretches the focused profile's image beneath all panes.
- `unfocusedAppearance` can swap the image or opacity when the window is unfocused.
- Big images cost GPU memory and decode time; resize to the target window resolution. Opaque window plus no animation redraws least.
- For text readability over art, combine a lower `backgroundImageOpacity` with a pixel shader halo (see the shader recipe) and `adjustIndistinguishableColors`.
