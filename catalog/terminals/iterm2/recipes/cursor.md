---
capability: cursor
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/python-api/profile.html, https://iterm2.com/documentation-preferences-profiles-text.html
---
# Cursor in iTerm2
`Cursor Type` (0 underline, 1 vertical bar, 2 box) and `Blinking Cursor` (boolean), plus cursor colors in the palette.
## Config
```json
{
  "Cursor Type": 2,
  "Blinking Cursor": false
}
```
## Notes
- Look mapping: block=2, bar=1, underline=0. iTerm2 draws a hollow box when the window is unfocused; no separate hollow-block profile value was documented.
- Colors: `Cursor Color`, `Cursor Text Color` (see palette). "Smart cursor color" adjusts a box cursor's color automatically (`smart_cursor_color`).
- Text tab also offers Shadow (underline and bar cursors) and Smooth blink.
