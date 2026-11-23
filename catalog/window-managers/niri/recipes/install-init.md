---
capability: install-init
tool: niri
os: linux
verified: 2026-11-23 (docs, niri 26.04)
sources: https://github.com/niri-wm/niri/wiki/Getting-Started, https://github.com/niri-wm/niri/wiki/Configuration:-Introduction
---
# Install and first config for niri
Install `niri` (pacman or dnf, see tool.json) and pick the niri session in a display manager, or run `niri-session` / `niri` from a TTY. The default config starts Waybar and binds `Mod+T` to alacritty and `Mod+D` to fuzzel, so install those or change the binds.

## Config
- Path: `$XDG_CONFIG_HOME/niri/config.kdl` (usually `~/.config/niri/config.kdl`), else `/etc/niri/config.kdl`. If neither exists niri writes the default to the first path.
- Override with `niri -c <file>` or `$NIRI_CONFIG` (the flag wins).
- Syntax is KDL: `//` comments, `/-` comments out a whole section, flags are bare words (`prefer-no-csd`).

```kdl
layout {
    gaps 12
}
binds {
    Mod+Return { spawn "foot"; }
}
```

## Notes
- `niri --version` prints the version. `niri validate -c <file>` parses a config and reports errors.
- `binds {}` is not auto-filled: if you write your own `binds` section, include every default bind you still want. Start from the default config and edit it.
- `Mod` is Super on a TTY and Alt when niri runs nested in another compositor.
- Draft in the run folder and let `tmt stage` place it; never write the live config directly.
