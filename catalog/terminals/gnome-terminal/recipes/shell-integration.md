---
capability: shell-integration
tool: gnome-terminal
os: linux
verified: 2026-11-23 (docs, gnome-terminal 3.60.0)
sources: https://gitlab.gnome.org/GNOME/gnome-terminal/-/blob/master/src/org.gnome.Terminal.gschema.xml
---
# Shell integration in GNOME Terminal
A global switch exists: `shell-integration-enabled` in `org.gnome.Terminal.Legacy.Settings` (default true). It controls the terminal side of the integration.

## Config
```sh
gsettings set org.gnome.Terminal.Legacy.Settings shell-integration-enabled true
```

## Notes
- The schema gives only the key and its default; what the integration does and what the shell must source (distros typically ship a `vte` profile.d script) was not verified here.
- The `preserve-working-directory` profile key (`never`, `safe` default, `always`) controls whether a new terminal opened from an existing one starts in its directory; it depends on the shell reporting its directory.
- `confirm-close` (global, default true) asks before closing a terminal that has a running process.
