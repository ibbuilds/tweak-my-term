---
capability: config-reload
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://appleinsider.com/inside/macos/tips/how-to-use-profiles-to-change-how-terminal-windows-look-in-macos, https://stackoverflow.com/questions/79814720/change-macos-terminal-theme-background-colour-programatically
---
# Config reload in Terminal
Edits made in Settings > Profiles apply immediately to open windows that use the profile (no Save button). Importing a .terminal file also takes effect right away. Changes written to the preferences plist from outside need Terminal restarted.

## Config
```sh
open "{look.name}.terminal"            # import, applies at once (a new window opens with it)
# after defaults / plutil edits of com.apple.Terminal.plist: quit and reopen Terminal
osascript -e 'tell application "Terminal" to quit'
```
Switch a window to the profile live:
```sh
osascript -e 'tell application "Terminal" to set current settings of front window to settings set "{look.name}"'
```

## Notes
- The AppleScript `set current settings of window` form comes from a community answer; `settings set` names are profile names.
- Do not quit Terminal from a script running inside it without telling the user; it closes the session running the script.
- Window state restoration may reopen windows with the old profile; close them first.
