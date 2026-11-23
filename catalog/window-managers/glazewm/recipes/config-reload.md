---
capability: config-reload
tool: glazewm
os: windows
verified: 2026-11-23 (docs, glazewm v3.10.1)
sources: https://github.com/glzr-io/glazewm/blob/main/resources/assets/sample-config.yaml, https://github.com/glzr-io/glazewm/blob/main/packages/wm-common/src/app_command.rs
---
# Reload the GlazeWM config
Run `wm-reload-config`: bound to `alt+shift+r` in the generated config, or from a shell against the running instance.

## Config
```powershell
glazewm command wm-reload-config
```
```yaml
general:
  config_reload_commands: []     # commands to run after every reload
```

## Notes
- The docs do not say GlazeWM watches the file, so reload explicitly after each edit.
- `wm-redraw` (`alt+shift+w`) redraws windows if borders or positions look stale after a reload.
- `glazewm command` and `glazewm query` need an already running instance. `wm-exit` (`alt+shift+e`) stops it.
- Changing the config path (`--config`) needs a restart.
