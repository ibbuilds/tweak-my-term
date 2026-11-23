---
capability: keybindings
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://docs.kde.org/stable_kf6/en/konsole/konsole/commandreference.html, https://invent.kde.org/utilities/konsole/-/blob/master/src/profile/Profile.cpp
---
# Key bindings in Konsole
Two separate systems.

## Config
1. Application shortcuts (new tab, split, copy, ...): Settings > Configure Keyboard Shortcuts. They are stored by KDE's shortcut system, not in the profile; the file format was not verified, so ask the user to set them in the dialog.
2. Terminal key translation (which bytes a key sends): the profile's `[Keyboard]` group names a keytab.
```ini
[Keyboard]
KeyBindings=default
```
Custom `.keytab` files would sit next to the profiles in `~/.local/share/konsole/`; the keytab syntax and location were not verified from the pages read.

## Notes
- Handbook defaults: Shift+Left/Right previous/next tab, Ctrl+Alt+Left/Right move tab, Ctrl+Shift+F find, Ctrl+Shift+M toggle menu bar, Ctrl+Shift+Ins paste selection.
- Konsole uses Ctrl+Shift for its own actions so Ctrl+C and Ctrl+D reach the shell; keep it that way.
