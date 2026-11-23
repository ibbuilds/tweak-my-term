---
capability: config-reload
tool: yabai
os: macos
verified: 2026-11-23 (docs, yabai 7.1.25)
sources: https://github.com/asmvik/yabai/wiki/Configuration, https://github.com/asmvik/yabai/blob/master/doc/yabai.asciidoc, https://github.com/asmvik/skhd
---
# Reload yabai and skhd config
```sh
sh -n ~/.config/yabai/yabairc      # syntax check only (yabairc is a shell script)
yabai --restart-service            # re-runs yabairc from a clean state, rules included
skhd -r                            # skhd also hot-reloads on save
yabai -m rule --apply              # re-apply rules to windows that are already open
```

## Notes
- `yabai -m config <key> <value>` changes a setting live without any restart; yabairc only repeats those lines at start.
- Do not re-run yabairc by hand to reload: `rule --add` and `signal --add` lines pile up as duplicates. Restart the service instead.
- To see errors, add `yabai -m config debug_output on` or run `yabai -V` in a terminal; where service logs go is described in the Configuration wiki (Debug output section).
- yabai has no config validator; a typo in a `yabai -m config` line prints an error to the log and the rest of the file still runs.
