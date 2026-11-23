---
capability: config-reload
tool: hyprland
os: linux
verified: 2026-11-23 (docs, hyprland v0.57.2)
sources: https://wiki.hypr.land/Configuring/Start/, https://wiki.hypr.land/Configuring/Advanced-and-Cool/Using-hyprctl/, https://wiki.hypr.land/Configuring/Basics/Variables/
---
# Config reload in Hyprland
Hyprland reloads the config the moment the file is saved. Force it with `hyprctl reload`.

## Command
```
hyprctl reload              # re-read the config
hyprctl configerrors        # list errors from the last load
hyprctl reload full-reset   # recreate the config context (needed to switch between lua and hyprlang)
```

## Notes
- Turn the file watcher off with `hl.config({ misc = { disable_autoreload = true } })`; then only `hyprctl reload` applies changes.
- A fundamental Lua syntax error makes Hyprland refuse the reload and show an error; runtime errors abort the rest of that file.
- `hyprland.start` handlers do not re-run on reload. `hl.permission` changes need a restart.
- No dry-run validator is documented, so verify with `hyprctl configerrors` and a screenshot after the reload.
- Explore interactively with `hyprctl repl` or `hyprctl eval '<lua>'`.
