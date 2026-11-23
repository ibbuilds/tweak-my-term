---
capability: profiles
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://docs.kde.org/stable_kf6/en/konsole/konsole/profiles.html, https://docs.kde.org/stable_kf6/en/konsole/konsole/command-line-options.html, https://invent.kde.org/utilities/konsole/-/blob/master/src/profile/ProfileWriter.cpp
---
# Profiles in Konsole
A profile is `~/.local/share/konsole/{look.name}.profile` (INI). Every other Konsole recipe is a set of keys for this file or for the matching `.colorscheme`.

## Config
`~/.local/share/konsole/{look.name}.profile`:
```ini
[General]
Name={look.name}
Parent=FALLBACK/

[Appearance]
ColorScheme={look.name}
```
Make it the default for new windows:
```sh
kwriteconfig6 --file konsolerc --group "Desktop Entry" --key DefaultProfile "{look.name}.profile"
```

## Notes
- Unset keys inherit from the parent; `Parent=FALLBACK/` is the built-in profile (what Konsole writes itself).
- `Name` should match the file basename; names are case sensitive. Check with `konsole --list-profiles`; `-p KEY=VALUE` overrides a key for one launch.
- Konsole writes only keys that differ from the parent, so keep files small.
- Other General keys: `Icon`, `Environment` (default `TERM=xterm-256color,COLORTERM=truecolor`), `Directory`, `LocalTabTitleFormat`.
- Open a tab with a profile: `konsole --new-tab --profile NAME`.
