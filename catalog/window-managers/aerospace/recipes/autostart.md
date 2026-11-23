---
capability: autostart
tool: aerospace
os: macos
verified: 2026-11-23 (docs, aerospace 0.21.3-Beta)
sources: https://nikitabobko.github.io/AeroSpace/guide
---
# Autostart in AeroSpace
One config key starts AeroSpace.app at login.

## Config
```toml
start-at-login = true

# optional: commands run once AeroSpace is up
after-startup-command = [
  'exec-and-forget open -na Ghostty',
]
```

## Notes
- Default is `false`. It takes effect once AeroSpace has loaded the config (launch it, or `aerospace reload-config`).
- `after-startup-command` runs on every AeroSpace start, including a restart. JankyBorders de-duplicates itself; terminals do not, so avoid opening windows here unless a fresh window on every start is wanted.
- The Accessibility permission must already be granted, or AeroSpace cannot manage windows.
