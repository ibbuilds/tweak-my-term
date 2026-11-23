---
capability: tabs
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://support.apple.com/guide/terminal/change-profiles-tab-settings-trmltab/mac, https://support.apple.com/guide/terminal/change-general-settings-trmlstrtup/mac
---
# Tabs in Terminal
Tabs are built in (Shell > New Tab, Cmd-T). What can be configured per profile is the tab title (Settings > Profiles > Tab): working directory or document, path, active process name, arguments, TTY name, a "show other items when there is a custom title" option and an activity indicator. How new tabs open is in Settings > General.

## Config
No tab-bar visibility or color setting is documented, so a look spec `tabs: always|auto|hidden` cannot be applied by script. The tab bar shows when a window has more than one tab; View > Show/Hide Tab Bar toggles it for a window (menu item, not verified here).

Settings > General (documented options, not scripted here):
- New tabs open with: Default Profile / Same Profile, and Default or Same Working Directory.
- Use Cmd-1 to Cmd-9 to switch tabs.

## Notes
- Tab title keys in the profile plist were not read; set them in the UI and export the profile to learn them.
- Tab colors follow the macOS appearance, not the profile palette.
