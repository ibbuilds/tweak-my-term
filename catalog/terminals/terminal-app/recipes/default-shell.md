---
capability: default-shell
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://support.apple.com/guide/terminal/change-general-settings-trmlstrtup/mac, https://support.apple.com/guide/terminal/change-profiles-shell-settings-trmlshll/mac
---
# Default shell in Terminal
Two documented settings. Globally, Settings > General > "Shells open with": Default login shell (zsh on current macOS) or "Command (complete path)". Per profile, Settings > Profiles > Shell > Startup > "Run command" (with a "Run inside shell" checkbox).

## Config
```sh
# preferred: change the account's login shell (affects every terminal)
chsh -s /opt/homebrew/bin/fish        # the path must be listed in /etc/shells
```
Global command in Terminal only (key name unverified; set it once in the UI and read it back with `defaults read com.apple.Terminal Shell`):
```sh
defaults write com.apple.Terminal Shell -string "/opt/homebrew/bin/fish"
```
Per profile (inside the .terminal file; key names `CommandString` and `RunCommandAsShell` are from community knowledge, unverified):
```sh
plutil -insert CommandString -string "/opt/homebrew/bin/fish" "{look.name}.terminal"
plutil -insert RunCommandAsShell -bool true "{look.name}.terminal"
```

## Notes
- `chsh` needs the user's password and an entry in `/etc/shells`; ask first.
- The "When the shell exits" option (close, close if clean, don't close) is per profile; the key (`shellExitAction`, integer; 2 was seen in a profile dump) is not documented.
- Check what the profile actually runs with `echo $SHELL` and `ps -p $$`.
