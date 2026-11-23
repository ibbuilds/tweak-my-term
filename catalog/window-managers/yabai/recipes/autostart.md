---
capability: autostart
tool: yabai
os: macos
verified: 2026-11-23 (docs, yabai 7.1.25)
sources: https://github.com/asmvik/yabai/wiki/Installing-yabai-(latest-release), https://github.com/asmvik/skhd, https://github.com/asmvik/yabai/blob/master/doc/yabai.asciidoc
---
# Autostart for yabai and skhd
Both ship a launchd service installer.

```sh
yabai --start-service     # writes ~/Library/LaunchAgents/com.asmvik.yabai.plist if missing, loads and starts it
skhd --start-service      # writes ~/Library/LaunchAgents/com.asmvik.skhd.plist likewise
```
The services start at login from then on.

## Stop and remove
```sh
yabai --stop-service
yabai --uninstall-service     # removes the plist
skhd --stop-service
skhd --uninstall-service
```

## Notes
- Accessibility must be allowed first (prompted on the first start); skhd needs a restart after that.
- After a Homebrew upgrade of yabai, run `yabai --uninstall-service`, `brew upgrade yabai`, then `yabai --start-service`: the binary path changes and the old plist points at the old one.
- Anything else to run at login (for example `borders ... &`) goes at the end of yabairc, not in a separate login item.
