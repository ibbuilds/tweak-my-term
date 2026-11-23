---
capability: blur
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/profile-appearance, https://learn.microsoft.com/windows/terminal/customize-settings/themes
---
# Background blur in Windows Terminal
Two effects: acrylic (`useAcrylic: true` on a profile, needs `opacity` below 100) and Mica (theme `window.useMica: true`, Windows 11 build 22621+, shows when `opacity` is below 100).

## Config
Acrylic, in `profiles.defaults`:
```jsonc
"useAcrylic": true,
"opacity": 70
```
Mica, in `themes` plus `"theme": "{look.name}"` at the top level:
```jsonc
{
  "name": "{look.name}",
  "tab": { "background": "terminalBackground" },
  "tabRow": { "background": "#00000000" },
  "window": { "applicationTheme": "dark", "useMica": true }
}
```
With Mica keep the profile at `"useAcrylic": false` and `"opacity"` below 100.

## Notes
- Windows 11 is required for unblurred transparency; Mica needs build 22621 or later.
- The tab row must be transparent (`#00000000`) for Mica to show through it.
- `useAcrylicInTabRow: true` gives the tab row a 50% acrylic background (restart needed).
- `compatibility.enableUnfocusedAcrylic` (Preview only per the docs) keeps acrylic on an unfocused window.
- Blur and transparency add GPU work and lower contrast; opaque windows redraw least.
- When look-spec `window.blur` is false, set `useAcrylic: false` and leave `useMica` false.
