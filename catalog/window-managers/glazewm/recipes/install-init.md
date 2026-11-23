---
capability: install-init
tool: glazewm
os: windows
verified: 2026-11-23 (docs, glazewm v3.10.1)
sources: https://github.com/glzr-io/glazewm#installation, https://github.com/glzr-io/glazewm#config-documentation
---
# Install GlazeWM and create the config
Install, start it once, and accept the prompt to generate the default config at `~/.glzr/glazewm/config.yaml`.

## Config
```powershell
winget install glzr-io.glazewm      # or: scoop bucket add extras; scoop install extras/glazewm
glazewm --version                   # if glazewm is not on PATH, start it from the Start menu instead
glazewm start                       # first launch offers to write the default config
```
Custom location: `glazewm start --config="<path>\config.yaml"` or the `GLAZEWM_CONFIG_PATH` environment variable.

## Notes
- Top-level keys of the file: `general`, `gaps`, `window_effects`, `window_behavior`, `workspaces`, `window_rules`, `binding_modes`, `keybindings`. Edit values in place and keep the rest of the generated file.
- The generated config starts Zebar (the bar) with `general.startup_commands: ['shell-exec zebar']` and kills it on shutdown. Remove both lines if Zebar is not installed.
- The generated `outer_gap.top` is `60px` to leave room for Zebar; see the gaps recipe.
- No config validator is documented. Run `glazewm start` in a terminal after edits to see parse errors.
