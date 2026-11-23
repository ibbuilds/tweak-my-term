---
capability: font
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://support.apple.com/en-ca/guide/terminal/trmltxt/mac, https://apple.stackexchange.com/questions/352354/how-to-change-font-size-and-font-for-all-profiles-in-terminal
---
# Font in Terminal
The profile key `Font` is a base64 NSKeyedArchiver archive of an NSFont (PostScript name and point size). `FontAntialias` is a boolean. For a live, scriptable alternative, AppleScript can set the font on an existing profile.

## Config
AppleScript (no plist surgery, works on a profile that already exists in Terminal):
```sh
osascript -e 'tell application "Terminal" to set {font name of settings set "{look.name}", font size of settings set "{look.name}"} to {"{font.postscript}", {font.size}}'
```
Plist route (inside the .terminal file; same archive shape as the color helper in the palette recipe, with these `$objects`):
```
<dict> $class -> UID 3, NSSize (real) {font.size}, NSfFlags (integer) 16, NSName -> UID 2 </dict>
<string>{font.postscript}</string>
<dict> $classes [NSFont, NSObject], $classname NSFont </dict>
```
```sh
plutil -insert Font -data "$FONT_BLOB" "{look.name}.terminal"
plutil -insert FontAntialias -bool true "{look.name}.terminal"
```

## Notes
- Use the PostScript name (for example `JetBrainsMonoNFM-Regular`), not the family name; the AppleScript example from a community answer uses `Menlo-Regular` the same way. Find names in Font Book (Show font info).
- The NSFont archive layout (NSSize, NSfFlags 16, NSName) was read from a Terminal profile dump in a community answer, not from Apple docs; prefer the AppleScript route, or set the font once in the UI and copy the exported `Font` blob.
- Font settings are in Settings > Profiles > Text > Font (User Guide). `FontWidthSpacing` (real, around 1.0) is the character-spacing slider seen in profile dumps.
- Terminal uses a single font; there is no separate bold, italic or fallback font setting beyond the "Use bold fonts" checkbox.
