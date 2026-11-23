---
capability: padding
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/profile-appearance
---
# Padding in Windows Terminal
`padding` is a string or number in `profiles.defaults`. The 4-value form is in the order left, top, right, bottom, which differs from the CSS order (top, right, bottom, left) used by the look spec.

## Config
Look spec `padding: [top, right, bottom, left]` becomes `"{left}, {top}, {right}, {bottom}"`:
```jsonc
"padding": "{window.padding.left}, {window.padding.top}, {window.padding.right}, {window.padding.bottom}"
```
Example: look spec `[16, 24, 16, 24]` -> `"padding": "24, 16, 24, 16"`.

## Notes
- Accepted forms: `8` or `"8"` (all sides), `"8, 4"` (left-right, top-bottom), `"l, t, r, b"`. Default `"8, 8, 8, 8"`.
- `scrollbarState` (`visible`, `hidden`; `always` from 1.17) controls the scrollbar; hiding it is a common choice.
