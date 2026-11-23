---
capability: blur
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation-preferences-profiles-window.html, https://iterm2.com/python-api/profile.html
---
# Background blur in iTerm2
`Blur` (boolean) and `Blur Radius` (0 to 30) apply when the profile has some transparency.
## Config
```json
{ "Transparency": {1 - window.opacity}, "Blur": true, "Blur Radius": 12 }
```
## Notes
- Blur only shows with `Transparency` above 0. `Blur Radius` requires `Blur` enabled.
- Key strings `Blur` and `Blur Radius` are from the iTerm2 source (`KEY_BLUR`, `KEY_BLUR_RADIUS`); the radius range comes from the Python API docs.
