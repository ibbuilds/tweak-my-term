---
capability: autostart
tool: komorebi
os: windows
verified: 2026-11-23 (docs, komorebi v0.1.41)
sources: https://lgug2z.github.io/komorebi/common-workflows/autostart.html, https://lgug2z.github.io/komorebi/cli/start.html
---
# Start komorebi with Windows
`komorebic enable-autostart` writes a `komorebi.lnk` shortcut into the `shell:startup` folder. Pass the same flags you use with `komorebic start`.

## Config
```powershell
komorebic enable-autostart --whkd --bar --config ~/komorebi.json
komorebic disable-autostart
```
Options: `--config <path>` static config file, `--whkd` also start whkd, `--bar` also start komorebi-bar, `--ahk` start AutoHotkey, `--ffm` komorebi's focus-follows-mouse.

## Notes
- Without `--whkd` komorebi starts with no keybindings.
- Enabling again overwrites the shortcut, so re-run it after changing flags.
- `komorebic start --await-configuration` waits for `komorebic complete-configuration`, used by script-based setups; not needed with komorebi.json.
- On start komorebi re-applies the dumped state of a previous instance unless `--clean-state` is given.
