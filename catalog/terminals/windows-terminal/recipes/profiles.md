---
capability: profiles
tool: windows-terminal
os: windows
verified: 2026-11-23 (machine + docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/profile-general, https://learn.microsoft.com/windows/terminal/customize-settings/appearance, https://learn.microsoft.com/windows/terminal/dynamic-profiles
---
# Profiles in Windows Terminal
`profiles.defaults` holds settings shared by all profiles; `profiles.list` has one object per shell. A profile needs a `guid`, `name` and usually a `commandline`. Dynamic profiles (PowerShell, WSL distributions, Azure Cloud Shell) are generated automatically and can be hidden.

## Config
```jsonc
"profiles": {
  "defaults": { "colorScheme": "{look.name}" },
  "list": [
    {
      "guid": "{56bdf882-63c4-4ded-ab5f-fa0835746798}",
      "name": "Git Bash",
      "commandline": "\"C:\\Program Files\\Git\\usr\\bin\\bash.exe\" -i",
      "startingDirectory": "%USERPROFILE%",
      "icon": "%USERPROFILE%\\.config\\{look.name}\\art\\icon-bash.png",
      "hidden": false
    },
    { "guid": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}", "name": "Windows PowerShell", "hidden": false }
  ]
},
"newTabMenu": [ { "type": "remainingProfiles" } ]
```

## Notes
- Generate a fresh GUID (`[guid]::NewGuid()`) for a new profile; keep existing GUIDs for built-in profiles because actions and `defaultProfile` refer to them.
- Profile order sets the `Ctrl+Shift+1..9` slots; `newTabMenu` entry types: `profile`, `folder`, `separator`, `matchProfiles`, `remainingProfiles`, `action`.
- `commandline` defaults to `cmd.exe`; backslashes must be escaped in JSON; set `"hidden": true` rather than deleting a built-in profile.
- Profile `icon` should be about 32x32 (PNG, GIF or ICO); `%USERPROFILE%` expands in it.
- `"pathTranslationStyle": "msys2"` (used by the verified preset for Git Bash) translates dropped paths to MSYS2 form.
- Dynamic profile sources can be disabled with `disabledProfileSources`. JSON fragment extensions let a package ship profiles without editing `settings.json`.
