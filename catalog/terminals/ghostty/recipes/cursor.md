---
capability: cursor
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference
---
# Cursor in Ghostty
`cursor-style` sets the shape, `cursor-style-blink` the blink, `cursor-color` and `cursor-text` the colors.
## Config
```
cursor-style = block       # block | bar | underline | block_hollow
cursor-style-blink = false
cursor-color = {palette.cursor}
cursor-text = {palette.cursorText}
```
## Notes
- Look `hollow-block` maps to `block_hollow`.
- Leaving `cursor-style-blink` unset means the cursor blinks and the app's DEC mode 12 is respected; set `true` or `false` to force it.
- With shell integration's `cursor` feature on, the shell may change the cursor shape at the prompt; disable with `shell-integration-features = no-cursor`.
