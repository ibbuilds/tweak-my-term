---
capability: cursor
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/profile-appearance
---
# Cursor in Windows Terminal
`cursorShape` picks the shape; `cursorColor` (profile or scheme) the color. `cursorHeight` (1-100) only applies to the `vintage` shape.

## Config
```jsonc
"cursorShape": "filledBox",
"cursorColor": "{palette.cursor}",
"unfocusedAppearance": { "cursorShape": "emptyBox" }
```
Shape map: look-spec `block` -> `filledBox`, `bar` -> `bar` (default), `underline` -> `underscore`, `hollow-block` -> `emptyBox`. Other values: `vintage`, `doubleUnderscore`.

## Notes
- `cursorColor` set in a scheme (palette recipe) applies to every profile using it; a profile `cursorColor` overrides it.
- `unfocusedAppearance` accepts `cursorShape`, `cursorColor` and `cursorHeight`, so an unfocused window can show a hollow box (used by the verified preset).
- A blink setting is not documented on the profile pages; blinking is not controlled here (unverified).
