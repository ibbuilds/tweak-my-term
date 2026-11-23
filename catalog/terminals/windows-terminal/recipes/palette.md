---
capability: palette
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/color-schemes
---
# Palette in Windows Terminal
Add a scheme object to the top-level `schemes` array and select it by name with `colorScheme` in `profiles.defaults` (or a single profile). Merge into the existing `settings.json`; do not replace the file.

## Config
Inside `schemes`:
```jsonc
{
  "name": "{look.name}",
  "background": "{palette.background}",
  "foreground": "{palette.foreground}",
  "cursorColor": "{palette.cursor}",
  "selectionBackground": "{palette.selectionBackground}",
  "black": "{palette.ansi.black}",
  "red": "{palette.ansi.red}",
  "green": "{palette.ansi.green}",
  "yellow": "{palette.ansi.yellow}",
  "blue": "{palette.ansi.blue}",
  "purple": "{palette.ansi.magenta}",
  "cyan": "{palette.ansi.cyan}",
  "white": "{palette.ansi.white}",
  "brightBlack": "{palette.ansi.brightBlack}",
  "brightRed": "{palette.ansi.brightRed}",
  "brightGreen": "{palette.ansi.brightGreen}",
  "brightYellow": "{palette.ansi.brightYellow}",
  "brightBlue": "{palette.ansi.brightBlue}",
  "brightPurple": "{palette.ansi.brightMagenta}",
  "brightCyan": "{palette.ansi.brightCyan}",
  "brightWhite": "{palette.ansi.brightWhite}"
}
```
Inside `profiles.defaults`:
```jsonc
"colorScheme": "{look.name}"
```

## Notes
- Magenta is called `purple` (and `brightPurple`) in Windows Terminal.
- Only `name`, `foreground`, `background`, `cursorColor`, `selectionBackground` and the 16 colors exist; look-spec `cursorText` and `selectionForeground` have no key. Colors are `#rgb` or `#rrggbb`.
- If a scheme with the same `name` exists, update it in place instead of adding a duplicate.
- Profile-level `foreground`, `background`, `cursorColor` and `selectionBackground` override the scheme.
- `adjustIndistinguishableColors` (`always`, `indexed`, `never`) makes the terminal nudge foregrounds that blend into the background; `"indexed"` only touches palette colors. Use `never` if exact palette colors matter.
- `colorScheme` also accepts `{ "light": "...", "dark": "..." }` to follow the application theme.
- The scheme also sets the tab color when a theme uses `"background": "terminalBackground"`.
