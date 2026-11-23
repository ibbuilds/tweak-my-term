---
capability: install-init
tool: i3
os: linux
verified: 2026-11-23 (docs, i3 4.25.1)
sources: https://i3wm.org/docs/userguide.html, https://manpages.debian.org/testing/i3-wm/i3.1.en.html
---
# Install and first config for i3
Install `i3-wm` (Arch) or `i3` (Debian, Fedora), then pick the i3 session in a display manager or run `exec i3` from `~/.xinitrc`. i3 is X11 only.

## Config
- Path: `~/.config/i3/config` (or `$XDG_CONFIG_HOME/i3/config`); `i3 -c <file>` overrides it.
- On first start i3 offers `i3-config-wizard` and writes the config for you. Run it later with `i3-config-wizard` (it exits if `~/.i3/config` exists).
- The template is `/etc/i3/config`; copy it if you skip the wizard.

```
set $mod Mod4
bindsym $mod+Return exec kitty
font pango:monospace 10
```

## Notes
- Gaps need i3 4.22 or newer. Check with `i3 --version`; on an older i3 the `gaps` lines are errors, and the fork i3-gaps used the same syntax.
- Validate without restarting: `i3 -C -c <file>`.
- `i3 --moreversion` lists the loaded config files, including `include` files (include has existed since 4.20).
- Draft in the run folder and let `tmt stage` place it; never write the live config directly.
