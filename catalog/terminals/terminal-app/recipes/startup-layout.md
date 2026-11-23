---
capability: startup-layout
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://support.apple.com/guide/terminal/change-general-settings-trmlstrtup/mac, https://support.apple.com/guide/terminal/default-startup-terminal-window-profiles-trml5856b1f2/mac
---
# Startup layout in Terminal
General settings > "On startup, open" takes either "New window with profile" or a "Window group" (a saved set of windows and tabs). Window groups are made in the UI (Shell > Save as Window Group...; the User Guide links a "Use window groups" page); their on-disk form was not read.

## Config
Startup profile by script (the documented UI option, stored under this key in the preferences domain):
```sh
defaults write com.apple.Terminal "Startup Window Settings" -string "{look.name}"
```
Window groups: ask the user to arrange tabs, run Shell > Save as Window Group, then pick the group in Settings > General > On startup, open.

## Notes
- Each tab in a group can run its own profile and command (profile Shell > Run command).
- No splits or pane geometry exist in Terminal; for that use tmux or zellij started from the profile's startup command.
- Quit and reopen Terminal for the defaults change to apply.
