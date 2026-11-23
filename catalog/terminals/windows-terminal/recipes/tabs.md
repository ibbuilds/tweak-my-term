---
capability: tabs
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/appearance, https://learn.microsoft.com/windows/terminal/customize-settings/themes
---
# Tabs in Windows Terminal
Tabs are built in. Visibility is `alwaysShowTabs` plus `showTabsInTitlebar`; width is `tabWidthMode`; colors come from a theme (`tab` and `tabRow` objects) selected with the top-level `theme`.

## Config
Look spec `tabs: always`:
```jsonc
"alwaysShowTabs": true,
"showTabsInTitlebar": true,
"tabWidthMode": "equal",
"newTabPosition": "afterLastTab",
"theme": "{look.name}",
"themes": [
  {
    "name": "{look.name}",
    "window": { "applicationTheme": "dark" },
    "tab": {
      "background": "{palette.selectionBackground}",
      "unfocusedBackground": "#00000000",
      "showCloseButton": "hover"
    },
    "tabRow": {
      "background": "{palette.background}",
      "unfocusedBackground": "{palette.background}"
    }
  }
]
```
Look spec `auto`: set `"showTabsInTitlebar": false` and `"alwaysShowTabs": false` (tabs appear after the second tab is opened). `hidden`: use focus mode (see the titlebar recipe).

## Notes
- `alwaysShowTabs` has no effect while `showTabsInTitlebar` is true (the default).
- `tabWidthMode`: `equal` (default), `titleLength`, `compact`. `newTabPosition`: `afterLastTab` or `afterCurrentTab` (docs mark it Preview).
- Theme colors accept `#RRGGBB`, `#RRGGBBAA` and the name `terminalBackground`. The `themes` array and `theme` key are also valid as a pair per light/dark: `"theme": { "light": "...", "dark": "..." }`.
- Per-profile tab color: `tabColor`; per-profile icon: `icon` (a path, `%USERPROFILE%` expands, or an emoji).
- Changing `showTabsInTitlebar`, `useAcrylicInTabRow` or `showTerminalTitleInTitlebar` needs a new terminal instance.
