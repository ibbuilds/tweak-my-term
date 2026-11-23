---
capability: autostart
tool: glazewm
os: windows
verified: 2026-11-23 (docs, glazewm v3.10.1)
sources: https://github.com/glzr-io/glazewm#faq, https://github.com/glzr-io/glazewm/releases/tag/v3.10.1
---
# Start GlazeWM with Windows
Right-click the GlazeWM tray icon and choose **Run on system startup**. This option was broken before v3.10.1; update first.

## Config
Helpers started by GlazeWM itself (not GlazeWM's own autostart):
```yaml
general:
  startup_commands: ['shell-exec zebar']              # runs once GlazeWM has started
  shutdown_commands: ['shell-exec taskkill /IM zebar.exe /F']
```

## Notes
- The tray toggle is the documented method and cannot be set from the config file.
- A manual alternative is a shortcut to the GlazeWM executable in `shell:startup` (standard Windows mechanism, not documented by GlazeWM).
- `startup_commands` is for launching helpers (the bar, scripts, terminals), not for starting GlazeWM itself.
