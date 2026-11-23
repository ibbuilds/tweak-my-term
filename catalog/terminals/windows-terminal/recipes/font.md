---
capability: font
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/profile-appearance
---
# Font in Windows Terminal
Use the `font` object (Windows Terminal 1.10+) in `profiles.defaults`: `face`, `size`, `weight`. List a Nerd Font symbols face after the main face, separated by a comma, to get icons without a patched font.

## Config
```jsonc
"font": {
  "face": "{font.family}, Symbols Nerd Font Mono",
  "size": {font.size},
  "weight": "normal"
}
```

## Notes
- The comma-separated fallback list is the form used by the verified Eclipse preset; the reference docs only describe `face` as a single name. If a face is invalid or missing, Windows Terminal falls back to Consolas.
- `weight`: normal (default), thin, extra-light, light, semi-light, medium, semi-bold, bold, extra-bold, black, extra-black, or an OpenType number. Map the look-spec weight onto these.
- `size` is in points (default 12); the schema allows fractional values.
- Before 1.10 the flat keys `fontFace`, `fontSize`, `fontWeight` were used.
- Install the font first (system-wide or per user); Windows Terminal reads installed fonts only. Font names are the family name as shown in the Windows font list.
- `intenseTextStyle` (`none`, `bold`, `bright`, `all`; default `bright`) decides how bold text is drawn: `bright` and `all` change bold colors to the bright palette.
- `antialiasingMode` (`grayscale` default, `cleartype`, `aliased`) needs a new window to apply.
