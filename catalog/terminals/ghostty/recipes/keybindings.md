---
capability: keybindings
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/keybind, https://ghostty.org/docs/config/keybind/reference
---
# Keybindings in Ghostty
Each binding is `keybind = trigger=action[:param]`. When two bindings share a trigger the later one wins. `keybind = clear` removes all bindings.
## Config
```
# look keybindings[]: keys -> trigger, action -> action
keybind = ctrl+shift+t=new_tab
keybind = ctrl+shift+r=reload_config
keybind = performable:ctrl+c=copy_to_clipboard
```
## Notes
- Modifiers: `shift`, `ctrl`/`control`, `alt`/`opt`/`option`, `super`/`cmd`/`command`. `fn` cannot be a modifier.
- Prefixes: `all:`, `global:` (macOS only), `unconsumed:`, `performable:` (1.1.0+); they combine, for example `global:unconsumed:ctrl+a=reload_config`.
- `chain=` and key tables since 1.3.0; key sequence syntax is on a separate docs page that was not read in detail.
- Full action list: https://ghostty.org/docs/config/keybind/reference.
