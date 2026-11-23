---
capability: keybindings
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/
---
# Keybindings in kitty
Each binding is `map <keys> <action> [args]`. `kitty_mod` defaults to `ctrl+shift`.
## Config
```
# look keybindings[]: keys, action
map ctrl+shift+t new_tab
map ctrl+alt+t goto_layout tall
map ctrl+alt+z toggle_layout stack
map f5 load_config_file
```
## Notes
- Removing a default binding with `map <keys> no_op` and `clear_all_shortcuts yes` are standard kitty options but were not in the excerpt read (unverified).
- Multi-key sequence syntax was not verified here; check the "Keyboard shortcuts" section of the conf docs.
- `kitty +runpy 'from kitty.config import *; print(commented_out_default_config())'` prints every default option and binding.
