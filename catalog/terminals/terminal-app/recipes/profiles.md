---
capability: profiles
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://support.apple.com/guide/terminal/import-and-export-terminal-profiles-trml4299c696/mac, https://support.apple.com/guide/terminal/default-startup-terminal-window-profiles-trml5856b1f2/mac, https://derflounder.wordpress.com/2019/12/19/deploying-terminal-profile-settings-using-macos-configuration-profiles
---
# Profiles in Terminal
A profile is a `.terminal` file (XML plist with `name`, `type` = `Window Settings`, `ProfileCurrentVersion` and the appearance keys). Importing it copies it into the preferences under `Window Settings`; there is no profile folder to write into.

## Config
Build `{look.name}.terminal` in the run folder (see the palette, font and other recipes), lint it, then import it after the user approves:
```sh
plutil -lint "{look.name}.terminal"
# documented ways: Settings > Profiles > Action (...) > Import, or drag the file onto the profile list
open "{look.name}.terminal"      # works in practice, imports and opens a window; not in Apple's docs
```
Make it the default (new windows) and startup profile, by the profile name:
```sh
defaults write com.apple.Terminal "Default Window Settings" -string "{look.name}"
defaults write com.apple.Terminal "Startup Window Settings" -string "{look.name}"
```

## Notes
- Back up before changing preferences: `cp ~/Library/Preferences/com.apple.Terminal.plist ~/Terminal.plist.bak` (or `defaults export com.apple.Terminal -`).
- The two `defaults` keys and the `Window Settings` dictionary name are visible in a published `defaults`-based deployment script (sources); the User Guide describes the same options in the UI (Default, Startup).
- Re-importing a profile with the same name: macOS asks or replaces; use a new name per revision if unsure.
- Never edit `com.apple.Terminal.plist` directly while Terminal is running; the running app and cfprefsd overwrite it. Editing profiles with `plutil -replace "Window Settings.NAME.Key"` works when Terminal is quit (community answers), but import is safer.
- The bundled profiles (Basic, Pro, Homebrew, ...) can be restored with the Action menu (User Guide); do not rename a profile to one of those names.
