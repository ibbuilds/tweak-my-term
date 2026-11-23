---
capability: install-init
tool: komorebi
os: windows
verified: 2026-11-23 (docs, komorebi v0.1.41)
sources: https://lgug2z.github.io/komorebi/installation.html, https://lgug2z.github.io/komorebi/example-configurations.html, https://lgug2z.github.io/komorebi/common-workflows/komorebi-config-home.html
---
# Install komorebi and create the config
Install komorebi and the hotkey daemon whkd, download the example config, then start everything.

## Config
```powershell
winget install LGUG2Z.komorebi
winget install LGUG2Z.whkd
# scoop alternative: scoop bucket add extras; scoop install komorebi whkd
komorebic quickstart                    # downloads komorebi.json, whkdrc, applications.json (check its output for the folder)
komorebic start --whkd --bar            # drop --bar if you do not want komorebi's status bar
komorebic check                         # reports common config problems
komorebic stop --whkd --bar             # also required before an upgrade
```

## Notes
- Files live in `~` (komorebi.json, applications.json) and `~/.config/whkdrc`. Set `KOMOREBI_CONFIG_HOME` to move them, and update `app_specific_configuration_path` in komorebi.json to match.
- The example komorebi.json sets a Base16 `theme`. A `theme` overrides `border_colours`; delete it when using the borders recipe.
- `komorebic fetch-asc` refreshes the community applications.json that fixes apps which misbehave when tiled.
- Install docs recommend enabling long path support and "Turn off all unnecessary animations" in Ease of Access.
- License: personal use is free; using komorebi at work needs a paid commercial license.
- Upgrade: `komorebic stop --whkd --bar`, then `winget upgrade LGUG2Z.komorebi` (or `scoop update komorebi`).
