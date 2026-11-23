---
capability: palette
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation-dynamic-profiles.html, https://iterm2.com/documentation-preferences-profiles-colors.html, https://iterm2.com/python-api/profile.html
---
# Palette in iTerm2
Colors are profile keys holding color dictionaries (`Ansi 0 Color` to `Ansi 15 Color`, `Background Color`, `Foreground Color`, `Cursor Color`, `Cursor Text Color`, `Selection Color`, `Selected Text Color`). Alternatively import a `.itermcolors` preset.
## Config
Dynamic Profile fragment (merge into the profile object). Each color is `{"Red Component": r, "Green Component": g, "Blue Component": b, "Alpha Component": 1, "Color Space": "sRGB"}` where r, g, b are the hex channels divided by 255 (a float 0-1):
```json
{
  "Background Color": {"Red Component": {palette.background.r}, "Green Component": {palette.background.g}, "Blue Component": {palette.background.b}, "Alpha Component": 1, "Color Space": "sRGB"},
  "Foreground Color": {"Red Component": {palette.foreground.r}, "Green Component": {palette.foreground.g}, "Blue Component": {palette.foreground.b}, "Alpha Component": 1, "Color Space": "sRGB"},
  "Cursor Color": {"...": "{palette.cursor}"},
  "Cursor Text Color": {"...": "{palette.cursorText}"},
  "Selection Color": {"...": "{palette.selectionBackground}"},
  "Selected Text Color": {"...": "{palette.selectionForeground}"},
  "Ansi 0 Color": {"...": "{palette.ansi.black}"},
  "Ansi 1 Color": {"...": "{palette.ansi.red}"},
  "Ansi 2 Color": {"...": "{palette.ansi.green}"},
  "Ansi 3 Color": {"...": "{palette.ansi.yellow}"},
  "Ansi 4 Color": {"...": "{palette.ansi.blue}"},
  "Ansi 5 Color": {"...": "{palette.ansi.magenta}"},
  "Ansi 6 Color": {"...": "{palette.ansi.cyan}"},
  "Ansi 7 Color": {"...": "{palette.ansi.white}"},
  "Ansi 8 Color": {"...": "{palette.ansi.brightBlack}"},
  "Ansi 9 Color": {"...": "{palette.ansi.brightRed}"},
  "Ansi 10 Color": {"...": "{palette.ansi.brightGreen}"},
  "Ansi 11 Color": {"...": "{palette.ansi.brightYellow}"},
  "Ansi 12 Color": {"...": "{palette.ansi.brightBlue}"},
  "Ansi 13 Color": {"...": "{palette.ansi.brightMagenta}"},
  "Ansi 14 Color": {"...": "{palette.ansi.brightCyan}"},
  "Ansi 15 Color": {"...": "{palette.ansi.brightWhite}"}
}
```
Every `{"...": ...}` entry above stands for a full color dictionary with that token's channels; the final file must spell out all five fields for every color.
## Notes
- Key names for colors are the serialized profile keys from the iTerm2 source (`Ansi N Color`, `Background Color`, `Foreground Color`, `Cursor Color`, `Cursor Text Color`, `Selection Color`, `Selected Text Color`). The dictionary field names (`Red Component`, etc.) are the format iTerm2 itself exports; the Dynamic Profiles page does not show them, so verify by exporting one profile.
- Light/dark mode: when separate light/dark colors are enabled, keys get a ` (Light)` / ` (Dark)` suffix (for example `Background Color (Dark)`), and plain keys apply only when that mode is off.
- Preset route: a `.itermcolors` file is an XML plist with these same keys. Import with Settings > Profiles > Colors > Color Presets... > Import (preset is named after the file). There is no documented CLI import; `open file.itermcolors` is not confirmed by the docs.
- Related color keys (Python API names): bold, underline, link, badge, cursor guide, tab color. Minimum contrast and Cursor Boost are in the Colors tab.
