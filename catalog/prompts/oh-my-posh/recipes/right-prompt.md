---
capability: right-prompt
tool: oh-my-posh
os: windows, macos, linux
verified: 2026-11-23 (docs, oh-my-posh 33.x)
sources: https://ohmyposh.dev/docs/configuration/block
---
# Right-aligned prompt
Two ways: an `rprompt` block (drawn to the right of the cursor on the input line) or a right-aligned `prompt` block (drawn on the same line as the left block, optionally joined by a `filler`).

## Config
```json
{
  "blocks": [
    { "type": "prompt", "alignment": "left", "segments": [
      { "type": "path", "style": "plain", "foreground": "blue", "template": "{{ .Path }} ", "options": { "style": "folder" } }
    ] },
    { "type": "rprompt", "segments": [
      { "type": "text", "style": "plain", "foreground": "darkGray", "template": "{{ now | date \"15:04\" }}" }
    ] }
  ]
}
```
Same-line variant with filler and overflow control:
```json
{ "type": "prompt", "alignment": "right", "filler": "<darkGray>.</>", "overflow": "hide", "segments": [ ] }
```
`rprompt`: only one block allowed; supported in bash (with ble.sh), zsh, PowerShell, cmd, nu and fish. `overflow`: `hide` or `break` when the right block would collide with the left (default: printed as is).

## Notes
- `filler` goes on the right-aligned block; its template exposes `.Overflow` and `.Padding`.
- The transient prompt has its own `right_template` (zsh, PowerShell, fish).
- In PowerShell right prompts rely on the console host redraw; if the text bleeds into the next line set `patch_pwsh_bleed: true` at the top level.
- Plain bash without ble.sh: no right prompt.
