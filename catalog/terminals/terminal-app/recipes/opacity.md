---
capability: opacity
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://support.apple.com/en-ca/guide/terminal/trmltxt/mac, https://apple.stackexchange.com/questions/348762/how-to-have-a-random-background-color-in-terminal-app/348808
---
# Window opacity in Terminal
The User Guide (Text settings, Background, Color & Effects) says the opacity slider makes the window translucent; there is a separate opacity and blur for inactive windows. Opacity is part of the background color, so it is scriptable through the AppleScript `background color`, which takes four 16-bit values (R, G, B, alpha 0-65535).

## Config
```sh
# alpha = window.opacity * 65535; R,G,B = hex channel * 257
osascript -e 'tell application "Terminal" to set background color of settings set "{look.name}" to {r16, g16, b16, a16}'
```
Example for `#212224` at 0.9: `{8481, 8738, 9252, 58982}`.

## Notes
- The AppleScript property names (`background color`, `settings set`) come from the Terminal scripting dictionary as used in community answers; the 4-value form with alpha is shown in one. Verify visually.
- A scripted change updates the profile in the preferences, so it persists. In a .terminal file the alpha has to be encoded inside the BackgroundColor archive, which was not verified; set it with AppleScript or in the UI instead.
- Blur is separate (see the blur recipe). Keep opacity at 0.85 or above for readable text over a busy wallpaper.
