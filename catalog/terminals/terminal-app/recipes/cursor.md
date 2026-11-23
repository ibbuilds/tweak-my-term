---
capability: cursor
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://support.apple.com/guide/terminal/change-the-terminal-window-cursor-trml15226/mac, https://apple.stackexchange.com/questions/352354/how-to-change-font-size-and-font-for-all-profiles-in-terminal
---
# Cursor in Terminal
The User Guide offers three shapes (Block, Underline, Vertical Bar), a Blink cursor checkbox and a cursor color. In profile plists the shape is `CursorType` (integer); a community answer gives `2` for Vertical Bar.

## Config
```sh
f="{look.name}.terminal"
# look cursorShape: block -> 0, underline -> 1, bar -> 2   (1 is inferred, 2 is from a community answer)
plutil -insert CursorType -integer 0 "$f"
plutil -insert CursorBlink -bool false "$f"      # key name unverified
# color: CursorColor, built like the palette recipe from {palette.cursor}
```
AppleScript can set the color live: `set cursor color of settings set "{look.name}" to {r16, g16, b16}` (community-documented for windows).

## Notes
- `hollow-block` has no option; use block.
- Only `CursorType`=2 is backed by a source; verify 0 and 1 and the blink key by toggling the option in the UI and exporting the profile.
- Cursor text color is not a separate setting in Terminal's UI.
