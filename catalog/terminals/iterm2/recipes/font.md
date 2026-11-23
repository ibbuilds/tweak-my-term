---
capability: font
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation-preferences-profiles-text.html, https://iterm2.com/python-api/profile.html
---
# Font in iTerm2
`Normal Font` holds the regular font as a string `<PostScript name> <size>`. A separate non-ASCII font is optional.
## Config
```json
{
  "Normal Font": "{font.postscript} {font.size}",
  "Use Bold Font": true,
  "Use Italic Font": true
}
```
## Notes
- The PostScript name is the face name, for example `JetBrainsMonoNFM-Regular`, not the family name; check it in Font Book (Show font info) or the font picker. The `Normal Font` string format (name, space, size) is the format iTerm2 exports; the docs read here do not spell it out (unverified).
- `Use Bold Font` / `Use Italic Font` key names are inferred from the Python API properties `use_bold_font` / `use_italic_font`; verify by exporting a profile.
- Non-ASCII font, Special Exceptions (remap ranges, including an Install Nerd Font Bundle option) and powerline glyph drawing are in Profiles > Text. Use a Nerd Font as Normal Font for icons.
- Enabling ligatures disables the GPU renderer (see ligatures).
