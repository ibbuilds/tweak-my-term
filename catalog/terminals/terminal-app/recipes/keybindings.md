---
capability: keybindings
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://support.apple.com/guide/terminal/profiles-change-terminal-windows-trml107/mac, https://support.apple.com/guide/terminal/change-profiles-shell-settings-trmlshll/mac
---
# Key bindings in Terminal
Two places, neither with a documented file format.

## Config
1. What a key sends to the shell: Settings > Profiles > Keyboard (function keys, Option as Meta, alternate screen). The profile plist keys were not read, so set once in the UI.
2. Menu command shortcuts (new tab, find, ...): System Settings > Keyboard > Keyboard Shortcuts > App Shortcuts, add an entry for Terminal using the exact menu title. This can be scripted with `defaults write com.apple.Terminal NSUserKeyEquivalents -dict-add "Menu Title" "@~k"` (standard macOS mechanism; `@` is Cmd, `~` Option, `^` Ctrl, `$` Shift; not in Apple's Terminal guide, so verify).

## Notes
- Option as Meta is the usual need for readline/emacs bindings in the shell; enable "Use Option as Meta key" in Profiles > Keyboard.
- Restart Terminal after changing `NSUserKeyEquivalents`.
