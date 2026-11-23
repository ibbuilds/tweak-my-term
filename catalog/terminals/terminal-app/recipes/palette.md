---
capability: palette
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://support.apple.com/en-ca/guide/terminal/trmltxt/mac, https://support.apple.com/guide/terminal/import-and-export-terminal-profiles-trml4299c696/mac, https://github.com/mbadolato/iTerm2-Color-Schemes/blob/master/terminal/Dracula.terminal
---
# Palette in Terminal
A profile has `BackgroundColor`, `TextColor`, `TextBoldColor`, `CursorColor`, `SelectionColor` and the 16 colors `ANSIBlackColor`, `ANSIRedColor`, `ANSIGreenColor`, `ANSIYellowColor`, `ANSIBlueColor`, `ANSIMagentaColor`, `ANSICyanColor`, `ANSIWhiteColor` and the same with `Bright` after `ANSI` (`ANSIBrightBlackColor` ...). Each value is `<data>`: a base64 NSKeyedArchiver archive of an NSColor. Colors are not typed by hand; build each blob with plutil (macOS 12+ for `-create`).

## Config
Helper that prints the base64 blob for one color (`r g b` as 0-1 floats with 4 decimals, from `{palette.X}` hex / 255):
```sh
terminal_color() {
  t=$(mktemp)
  d=$(printf '%s\0' "$1" | base64)
  cat > "$t" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
<key>\$archiver</key><string>NSKeyedArchiver</string>
<key>\$objects</key><array>
<string>\$null</string>
<dict><key>\$class</key><dict><key>CF\$UID</key><integer>2</integer></dict><key>NSColorSpace</key><integer>2</integer><key>NSRGB</key><data>$d</data></dict>
<dict><key>\$classes</key><array><string>NSColor</string><string>NSObject</string></array><key>\$classname</key><string>NSColor</string></dict>
</array>
<key>\$top</key><dict><key>root</key><dict><key>CF\$UID</key><integer>1</integer></dict></dict>
<key>\$version</key><integer>100000</integer></dict></plist>
PL
  plutil -convert binary1 "$t" && base64 < "$t" | tr -d '\n'; rm -f "$t"
}
f="{look.name}.terminal"
plutil -create xml1 "$f"
plutil -insert name -string "{look.name}" "$f"
plutil -insert type -string "Window Settings" "$f"
plutil -insert ProfileCurrentVersion -float 2.07 "$f"
plutil -insert BackgroundColor -data "$(terminal_color '{palette.background.rgb01}')" "$f"
plutil -insert TextColor -data "$(terminal_color '{palette.foreground.rgb01}')" "$f"
plutil -insert CursorColor -data "$(terminal_color '{palette.cursor.rgb01}')" "$f"
plutil -insert SelectionColor -data "$(terminal_color '{palette.selectionBackground.rgb01}')" "$f"
plutil -insert ANSIBlackColor -data "$(terminal_color '{palette.ansi.black.rgb01}')" "$f"
# ... same for Red, Green, Yellow, Blue, Magenta, Cyan, White, then ANSIBrightBlackColor ... ANSIBrightWhiteColor
```
Then import it (profiles recipe).

## Notes
- `{palette.X.rgb01}` means the token as `R G B` floats 0-1, four decimals (for `#212224`: `0.1294 0.1333 0.1412`).
- The blob structure (NSRGB string with a trailing NUL byte, `NSColorSpace` 2, class `NSColor`) was read from a profile exported by Terminal (the Dracula .terminal in the sources). Apple does not document it; test with one color first.
- `TextBoldColor` is optional; with "Use bright colors for bold text" on (Text settings) bold uses the bright ANSI colors.
- The key names `ANSI*Color`, `BackgroundColor`, `TextColor`, `CursorColor`, `SelectionColor`, `TextBoldColor` appear in exported profiles; the User Guide only lists the matching UI controls.
- Alpha (opacity) is carried by the background color; see the opacity recipe.
