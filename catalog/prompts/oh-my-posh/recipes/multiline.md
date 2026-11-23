---
capability: multiline
tool: oh-my-posh
os: windows, macos, linux
verified: 2026-11-23 (docs, oh-my-posh 33.x)
sources: https://ohmyposh.dev/docs/configuration/block, https://ohmyposh.dev/docs/configuration/secondary-prompt, https://ohmyposh.dev/docs/configuration/general
---
# Two-line prompt and continuation prompt
Start a second block with `newline: true` for the input line; use `secondary_prompt` for continued commands. `final_space` adds a trailing space after the prompt.

## Config
```json
{
  "final_space": true,
  "blocks": [
    { "type": "prompt", "alignment": "left", "segments": [
      { "type": "path", "style": "plain", "foreground": "blue", "template": "{{ .Path }}", "options": { "style": "folder" } }
    ] },
    { "type": "prompt", "alignment": "left", "newline": true, "segments": [
      { "type": "text", "style": "plain", "foreground": "green", "template": "❯" }
    ] }
  ],
  "secondary_prompt": { "foreground": "darkGray", "background": "transparent", "template": "-> " }
}
```
Block option `newline: true` starts the block on a new line. For pwsh and cmd the leading newline of the first block is skipped when the prompt is on the first line (after clear / first prompt); for bash and zsh set top-level `enable_cursor_positioning: true` to get the same (it can swallow keystrokes typed while the prompt loads).

## Notes
- `secondary_prompt` works in powershell, zsh and bash. In zsh `multiline_keepprompt: true` keeps the full prompt while editing a multi-line command (continuation lines then get no secondary prompt).
- With a coloured cycle (`cycle`) set `restart_cycle: true` on the second block so the second line starts from the first colour.
- Keep an ASCII fallback character in the input line block if the font lacks the glyph.
