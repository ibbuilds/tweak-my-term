---
capability: padding
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference
---
# Padding in Ghostty
`window-padding-x` and `window-padding-y` are in points. One value sets both sides; two comma separated values set the two sides separately.
## Config
```
# look padding = [top, right, bottom, left]
window-padding-x = {padding.left},{padding.right}
window-padding-y = {padding.top},{padding.bottom}
window-padding-balance = true
window-padding-color = extend
```
## Notes
- `window-padding-balance = true` spreads leftover pixels over all four edges instead of leaving a gap at the bottom/right.
- `window-padding-color`: `background`, `extend` or `extend-always`. `extend` stretches edge cell colors into the padding, which avoids visible borders around full-screen TUIs.
- How padding interacts with `background-image` was not verified.
