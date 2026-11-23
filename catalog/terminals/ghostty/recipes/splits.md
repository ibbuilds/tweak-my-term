---
capability: splits
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/keybind/reference, https://ghostty.org/docs/install/release-notes/1-4-0
---
# Splits in Ghostty
Splits are built in and driven by keybind actions. Add explicit bindings so the setup does not depend on defaults (the default bindings were not verified).
## Config
```
keybind = ctrl+shift+d=new_split:right
keybind = ctrl+shift+e=new_split:down
keybind = ctrl+alt+left=goto_split:left
keybind = ctrl+alt+right=goto_split:right
keybind = ctrl+alt+up=goto_split:up
keybind = ctrl+alt+down=goto_split:down
keybind = ctrl+shift+z=toggle_split_zoom
keybind = ctrl+shift+equal=equalize_splits
```
## Notes
- Actions: `new_split:<right|down|left|up|auto>`, `goto_split:<right|down|left|up|previous|next>`, `resize_split:<dir>,<pixels>`, `toggle_split_zoom`, `equalize_splits`.
- On macOS use `super+` instead of `ctrl+shift+` to match platform habits.
- 1.4.0: splits can be rearranged by drag and drop (GTK and macOS); `drag-handle` controls when drag handles show.
- Split appearance keys (`unfocused-split-opacity`, `split-divider-color`) exist but were not verified in the pages read.
