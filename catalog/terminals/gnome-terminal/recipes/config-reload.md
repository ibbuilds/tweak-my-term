---
capability: config-reload
tool: gnome-terminal
os: linux
verified: 2026-11-23 (docs, gnome-terminal 3.60.0)
sources: https://gitlab.gnome.org/GNOME/gnome-terminal/-/blob/master/src/org.gnome.Terminal.gschema.xml
---
# Config reload in GNOME Terminal
Settings are read from dconf, which notifies listeners, so profile changes made with `gsettings` or `dconf write` are expected to show up in open windows without a restart. That behavior was not confirmed from the docs read; verify once on the user's system.

## Config
```sh
# change something, then look at an open window
gsettings set "$PROFILE" foreground-color "'#ffffff'"
# the exceptions: window-chrome keys need the server restarted
pkill gnome-terminal-server
```

## Notes
- The schema comment says `headerbar` and `unified-menu` take effect only when `gnome-terminal-server` restarts. Restarting the server closes all open terminal windows, so ask first.
- To undo any key: `gsettings reset "$PROFILE" KEY`; to reset a whole profile: `dconf reset -f /org/gnome/terminal/legacy/profiles:/:$UUID/`.
- Needs the user's D-Bus session; the commands must run as that user from a desktop session.
