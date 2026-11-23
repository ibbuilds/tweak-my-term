---
capability: line-height
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/python-api/profile.html
---
# Line height in iTerm2
`Vertical Spacing` is a multiplier (default 1.0) applied to the cell height; `Horizontal Spacing` does the same for width.
## Config
```json
{ "Vertical Spacing": {font.lineHeight}, "Horizontal Spacing": 1.0 }
```
## Notes
- Python API: both are non-negative fractions; 1.0 means normal. Key strings and the 1.0 default come from the iTerm2 source via DeepWiki.
- Settings UI: Profiles > Text, Spacing sliders (not on the Text page read here; the UI location is unverified).
