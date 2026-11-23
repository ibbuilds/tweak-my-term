---
capability: default-shell
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://docs.kde.org/stable_kf6/en/konsole/konsole/profiles.html, https://invent.kde.org/utilities/konsole/-/blob/master/src/profile/ProfileWriter.cpp
---
# Default shell in Konsole
The profile's `[General] Command` is the command run instead of the account's login shell. Without it Konsole starts the shell from the user account.

## Config
```ini
[General]
Command=/usr/bin/zsh -l
```

## Notes
- The whole command line, arguments included, is one string (the writer stores command plus arguments as a single `Command` value). Use an absolute path.
- Leaving `Command` out keeps the login shell, usually what the user wants. To change the login shell itself use `chsh`.
- One-off: `konsole -e fish` (must be the last option).
- Shell environment: `Environment=KEY=VALUE,KEY2=VALUE2` in `[General]`; start folder: `Directory=~/src`.
