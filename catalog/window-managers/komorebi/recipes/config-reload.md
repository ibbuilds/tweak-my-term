---
capability: config-reload
tool: komorebi
os: windows
verified: 2026-11-23 (docs, komorebi v0.1.41)
sources: https://github.com/LGUG2Z/komorebi/blob/v0.1.41/komorebi/src/static_config.rs, https://lgug2z.github.io/komorebi/cli/reload-configuration.html, https://lgug2z.github.io/komorebi/installation.html
---
# Reload the komorebi config
komorebi.json is reloaded when the file is saved while komorebi is running (it watches the file it was started with; found in the v0.1.41 source, the docs site does not describe it). Other files need a restart.

## Config
```powershell
komorebic check                              # validate before saving or restarting
komorebic stop --whkd --bar                  # full restart: stop everything...
komorebic start --whkd --bar                 # ...and start again
komorebic retile                             # re-lay out windows after a reload
komorebic replace-configuration ~/komorebi.json   # swap to another static config file
```
whkdrc reload: `taskkill /f /im whkd.exe; Start-Process whkd -WindowStyle hidden` (the `alt + o` binding in the keybindings recipe).

## Notes
- `komorebic reload-configuration` and `watch-configuration` only handle the legacy komorebi.ahk and komorebi.ps1 configs, not komorebi.json.
- Edit with an editor that saves in place or via a swap file: both Notepad and Vim saves are handled by the watcher.
- Changes to the bar (komorebi.bar.json) and whkdrc are separate processes: restart them (`komorebic stop --bar`, `komorebic start --bar`).
- If a reload misbehaves, `komorebic stop` and `komorebic start --clean-state` to drop the saved window state.
