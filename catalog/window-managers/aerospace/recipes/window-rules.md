---
capability: window-rules
tool: aerospace
os: macos
verified: 2026-11-23 (docs, aerospace 0.21.3-Beta)
sources: https://nikitabobko.github.io/AeroSpace/guide, https://nikitabobko.github.io/AeroSpace/commands
---
# Window rules in AeroSpace
Rules are `on-window-detected` callbacks matched by bundle id, run top to bottom. The first match stops processing unless `check-further-callbacks = true`. Confirm a bundle id with `aerospace list-apps`.

| Terminal | Bundle id (confirm with list-apps) |
|---|---|
| iTerm2 | `com.googlecode.iterm2` |
| Ghostty | `com.mitchellh.ghostty` |
| kitty | `net.kovidgoyal.kitty` |
| WezTerm | `com.github.wez.wezterm` |
| Alacritty | `org.alacritty` |
| Terminal.app | `com.apple.Terminal` |

## Config (config-version 2, AeroSpace 0.21+)
```toml
on-window-detected = [
  # tile every Ghostty window and send it to workspace T
  { if = 'test %{app-bundle-id} = com.mitchellh.ghostty', run = ['layout tiling', 'move-node-to-workspace T'] },
  # keep kitty floating, out of the tree
  { if = 'test %{app-bundle-id} = net.kovidgoyal.kitty', run = 'layout floating' },
]
```
Older syntax, still supported: `{ if.app-id = 'org.alacritty', run = 'layout floating' }`.

## Notes
- Several apps in one rule: `'test %{app-bundle-id} = org.alacritty || test %{app-bundle-id} = com.googlecode.iterm2'`.
- No size or position setting exists for floating windows. Set the size in the terminal (columns and rows) or place it by hand.
- Match a single window by title with `%{window-title}` in the `test`.
- Rules fire when a window is detected. After editing, re-apply to open windows with `aerospace run-callback --for-every-window on-window-detected`.
- Dialogs of an app are tiled too; see the guide's dialog heuristics before forcing `layout tiling` on every window of an app.
