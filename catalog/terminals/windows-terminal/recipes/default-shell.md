---
capability: default-shell
tool: windows-terminal
os: windows
verified: 2026-11-23 (machine + docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/startup, https://learn.microsoft.com/windows/terminal/customize-settings/profile-general
---
# Default shell in Windows Terminal
`defaultProfile` (GUID or profile name) decides which profile opens with `Ctrl+Shift+T`, `wt new-tab` and the `+` button. The shell itself is the profile's `commandline`.

## Config
```jsonc
"defaultProfile": "{56bdf882-63c4-4ded-ab5f-fa0835746798}"
```
The matching profile in `profiles.list` carries `"commandline"` (see the profiles recipe). A key bound to a specific profile:
```jsonc
{ "command": { "action": "newTab", "profile": "{56bdf882-63c4-4ded-ab5f-fa0835746798}" }, "id": "User.newTab.bash" }
```

## Notes
- `defaultProfile` is required; its default is PowerShell's GUID.
- Making Windows Terminal the system default terminal for console apps is an OS setting (Settings > Startup > Default terminal application), not a key in `settings.json`; it needs Windows 11 or recent Windows 10 builds.
- When `startingDirectory` is not set, the shell starts in `%USERPROFILE%` by default per the profile docs, but the launch method can change it (Start menu launches use `%WINDIR%\System32`); set it explicitly.
- `"startingDirectory": null` explicitly inherits the launching directory.
