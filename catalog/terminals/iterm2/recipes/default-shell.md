---
capability: default-shell
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation-dynamic-profiles.html
---
# Default shell / command in iTerm2
A profile runs the login shell by default; override with `Custom Command` and `Command`.
## Config
```json
{
  "Custom Command": "Yes",
  "Command": "/opt/homebrew/bin/fish -l"
}
```
## Notes
- Keys appear in the Dynamic Profiles docs examples (SSH profiles use `"Custom Command" : "Yes"` and `"Command"`). `Custom Command` is the string `"Yes"`, not a boolean (Python API: `set_use_custom_command` takes "Yes"/"No").
- Without these keys the profile uses the user's login shell from the system account, so changing it with `chsh` also works.
- Automatic shell integration (3.5+) works with a supported login shell Command.
