---
capability: config-reload
tool: sway
os: linux
verified: 2026-11-23 (docs, sway 1.12)
sources: https://man.archlinux.org/man/sway.5, https://manpages.debian.org/testing/sway/sway.1.en.html
---
# Config reload in sway
sway does not watch the file. Reload with the `reload` command: `swaymsg reload`, or `$mod+Shift+c` in the default config.

## Command
```
sway --validate --config ~/.config/sway/config   # check without applying (-C -c)
swaymsg reload                                    # apply
```

## Notes
- `reload` re-reads the config at the path sway was started with, or the first match of the documented search order.
- `exec` lines do not run again on reload; `exec_always` lines do.
- `default_border` changes only affect windows opened after the reload. Existing windows keep their border style until toggled with `border pixel N`.
- Output and some input settings apply live; `primary_selection`, `xwayland` and similar are launch-time only.
- On a config error, swaynag shows the message; fix it and reload again.
