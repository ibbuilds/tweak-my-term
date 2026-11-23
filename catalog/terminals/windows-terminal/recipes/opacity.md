---
capability: opacity
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/profile-appearance
---
# Window opacity in Windows Terminal
`opacity` is an integer 0-100 (percent opaque, default 100) per profile. Unblurred transparency needs Windows 11; `useAcrylic: true` adds the acrylic blur (see the blur recipe).

## Config
In `profiles.defaults` (look-spec `window.opacity` 0.0-1.0 times 100):
```jsonc
"opacity": 100,
"useAcrylic": false
```
With transparency, for example `{window.opacity}` x 100:
```jsonc
"opacity": 85,
"useAcrylic": false,
"unfocusedAppearance": { "opacity": 70 }
```

## Notes
- Since 1.12 the key is `opacity` (integer). Older `acrylicOpacity` (0.0-1.0) still works.
- Unblurred opacity (`useAcrylic: false`) only works on Windows 11.
- With Mica enabled in a theme, Mica shows underneath whenever `opacity` is below 100.
- Verified preset setting: an opaque window (`opacity: 100`, `useAcrylic: false`) with animations off redraws least; use transparency sparingly.
- A transparent background reduces text contrast over busy desktops; keep opacity 85+ or add blur.
- `unfocusedAppearance` may override `opacity`, `useAcrylic` and the background image settings when the window loses focus.
