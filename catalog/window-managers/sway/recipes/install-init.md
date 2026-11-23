---
capability: install-init
tool: sway
os: linux
verified: 2026-11-23 (docs, sway 1.12)
sources: https://manpages.debian.org/testing/sway/sway.1.en.html, https://man.archlinux.org/man/sway.5
---
# Install and first config for sway
Install `sway` from the distro (see tool.json) plus a terminal and launcher. Start it from a TTY with `sway` or choose the Sway session in a display manager.

## Config
- Path: `$XDG_CONFIG_HOME/sway/config` (usually `~/.config/sway/config`); `sway -c <file>` overrides it.
- Start from the shipped default: `mkdir -p ~/.config/sway && cp /etc/sway/config ~/.config/sway/config`. It defines `$mod`, `$term` and a bar.
- The config format is i3's: one command per line, `set $name value` for variables.

```
set $mod Mod4
set $term foot
bindsym $mod+Return exec $term
```

## Notes
- `sway --version` prints the version; `sway -C -c <file>` checks a config and exits (documented in sway(1)).
- The default config also has `$mod+Shift+c reload` and `$mod+Shift+e` exit prompt.
- If no config file is found, sway raises an error and does not start.
- Draft in the run folder and let `tmt stage` place it; never write the live config directly.
