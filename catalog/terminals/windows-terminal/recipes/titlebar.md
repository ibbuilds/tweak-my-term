---
capability: titlebar
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/appearance, https://learn.microsoft.com/windows/terminal/customize-settings/startup, https://learn.microsoft.com/windows/terminal/customize-settings/themes
---
# Title bar in Windows Terminal
`showTabsInTitlebar` chooses between tabs inside the title bar (integrated, default) and a separate native title bar above the tabs. A fully hidden title bar is focus mode.

## Config
Look spec `titlebar`:
```jsonc
// integrated (default)
"showTabsInTitlebar": true,
// native
// "showTabsInTitlebar": false,
// hidden: start in focus mode (no tabs, no title bar); toggle later with the toggleFocusMode action
// "launchMode": "focus",
"showTerminalTitleInTitlebar": true,
"theme": "{look.name}"
```
Theme `window` object for the window chrome:
```jsonc
"window": {
  "applicationTheme": "dark",
  "useMica": false,
  "frame": "{palette.selectionBackground}",
  "unfocusedFrame": "{palette.background}"
}
```

## Notes
- `launchMode`: `default`, `maximized`, `fullscreen`, `focus`, `maximizedFocus`. Bind `toggleFocusMode` (bindable) to switch at runtime.
- `frame` and `unfocusedFrame` (window border colors) are documented as Windows 11 and Preview-only; they were accepted on Windows 11 in testing. Leave them out when targeting the stable channel unless confirmed.
- `showTabsInTitlebar`, `useAcrylicInTabRow` and `showTerminalTitleInTitlebar` require a new terminal instance.
- `useMica: true` needs Windows 11 build 22621+ and transparent layers above it (see the blur recipe).
