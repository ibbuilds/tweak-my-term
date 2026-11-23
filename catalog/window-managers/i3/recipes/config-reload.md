---
capability: config-reload
tool: i3
os: linux
verified: 2026-11-23 (docs, i3 4.25.1)
sources: https://i3wm.org/docs/userguide.html, https://manpages.debian.org/testing/i3-wm/i3.1.en.html
---
# Config reload in i3
i3 does not watch the file. `reload` re-reads the config; `restart` restarts i3 in place and keeps the layout.

## Command
```
i3 -C -c ~/.config/i3/config   # validate only
i3-msg reload                  # apply the config
i3-msg restart                 # restart in place (layout kept); also needed after upgrading i3
```
The stock config binds `$mod+Shift+c` to reload and `$mod+Shift+r` to restart.

## Notes
- `exec` lines do not run on reload or restart; `exec_always` lines run on both.
- Validate with `i3 -C` before reloading so a syntax error does not leave a half-applied config.
- `i3 --moreversion` lists loaded config files with their modification times, including `include`d ones.
