---
capability: font-fallback
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/profile-appearance
---
# Font fallback in Windows Terminal
Put several family names in `font.face`, comma separated, most important first. Glyphs missing from the first font are taken from the next. Use this to add a Nerd Font symbols font to a plain text font.

## Config
```jsonc
"font": {
  "face": "{font.family}, Symbols Nerd Font Mono, Segoe UI Emoji",
  "size": {font.size}
}
```

## Notes
- This comma-separated form is what the verified Eclipse preset uses (`JetBrains Mono, Symbols Nerd Font Mono`); the reference docs only list a single name. Treat as working but keep an eye on it after Windows Terminal upgrades.
- The symbols font must be installed (the `Symbols Nerd Font Mono` family comes from the Nerd Fonts "NerdFontsSymbolsOnly" release).
- An unresolvable face makes Windows Terminal use Consolas for the whole profile.
