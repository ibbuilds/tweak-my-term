---
capability: quake
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation-hotkey.html
---
# Hotkey window (quake) in iTerm2
Create it in the UI: Settings > Keys > "Create a Dedicated Hotkey Window". This makes a profile named "Hotkey Window" with the hotkey configured.
## Config
```
# UI procedure, not a file:
# 1. Settings > Keys > Create a Dedicated Hotkey Window
# 2. Set the hotkey. Edit the profile: Window > Style, Screen, Space = All Spaces, Transparency/Blur as in the look.
# 3. Export it: Profiles > Other Actions > Copy Profile as JSON, then keep it in DynamicProfiles/ for the agent to edit.
```
## Notes
- Options: Pin hotkey window, Automatically reopen on app activation, Animate showing and hiding, Floating window (needs the profile's Window > Space set to All Spaces; floats over full-screen apps and overlaps the Dock), On Dock icon click.
- Multiple hotkeys per profile and several profiles per hotkey are supported (Additional Hotkeys).
- Dynamic Profile keys for hotkeys were not documented on the pages read, so copy them from an exported profile instead of guessing.
- iTerm2 only registers the global hotkey while it is running; enable "Launch at login" for a persistent drop-down.
