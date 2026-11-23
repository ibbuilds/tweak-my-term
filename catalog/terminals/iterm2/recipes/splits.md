---
capability: splits
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation.html
---
# Splits in iTerm2
Split panes are built in (Shell menu > Split Vertically / Split Horizontally). No profile keys are needed.
## Config
```
# no config; default shortcuts:
#   Cmd+D        split vertically (side by side)
#   Cmd+Shift+D  split horizontally (stacked)
```
## Notes
- Shortcuts above are the long-standing iTerm2 defaults; they were not on the pages fetched here, so check the Shell menu.
- Per-profile start layout is not a profile key. Use window arrangements or the Python/AppleScript API for scripted splits.
- Tab color shows the active pane's session color when panes are split.
