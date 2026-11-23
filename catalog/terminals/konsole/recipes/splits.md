---
capability: splits
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://docs.kde.org/stable_kf6/en/konsole/konsole/commandreference.html, https://invent.kde.org/utilities/konsole/-/blob/master/src/settings/konsole.kcfg
---
# Splits in Konsole
Split view is built in (View > Split View). Splitting is an action, not a config. Handbook shortcuts:

| Action | Default key |
| --- | --- |
| Split left/right | Ctrl+( |
| Split top/bottom | Ctrl+) |
| Expand / shrink view | Ctrl+Shift+] / Ctrl+Shift+[ |
| Maximize current view | Ctrl+Shift+E |
| Equal sizes | Ctrl+Shift+\ |
| Detach current view | Ctrl+Shift+H |

## Config
Only the divider handle size is configurable, in `~/.config/konsolerc` `[SplitView]`:
```sh
# SplitDragHandleSize choices in order: Small 0, Medium 1, Large 2
kwriteconfig6 --file konsolerc --group SplitView --key SplitDragHandleSize 0
```
Pre-built layouts: see the startup-layout recipe.

## Notes
- The handbook says splitting duplicates output across the views of the same tab; confirm in use that a new pane runs its own shell before promising independent panes.
- Focus moves with the Focus Above/Below/Left/Right Terminal shortcuts (Ctrl+Shift+arrows by default per user reports, unverified).
- Use tmux or zellij for splits that survive closing the window.
