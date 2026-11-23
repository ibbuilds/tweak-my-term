---
capability: segments
tool: oh-my-posh
os: windows, macos, linux
verified: 2026-11-23 (docs, oh-my-posh 33.x)
sources: https://ohmyposh.dev/docs/configuration/general, https://ohmyposh.dev/docs/configuration/block, https://ohmyposh.dev/docs/segments/overview
---
# Blocks and segments
A config is a list of `blocks`; each block holds `segments`. A segment has a `type` (path, git, text, executiontime, status, session, os, time, ...), a `style`, colours and a Go `template` (text/template + sprig) over that segment's properties. Segment options live under `options`.

## Config
```json
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "version": 4,
  "final_space": true,
  "blocks": [
    {
      "type": "prompt",
      "alignment": "left",
      "segments": [
        { "type": "path", "style": "powerline", "powerline_symbol": "",
          "foreground": "black", "background": "blue",
          "template": " {{ .Path }} ", "options": { "style": "folder" } },
        { "type": "git", "style": "powerline", "powerline_symbol": "",
          "foreground": "black", "background": "green",
          "template": " {{ .HEAD }}{{ if .Working.Changed }} *{{ end }} " },
        { "type": "text", "style": "plain", "foreground": "green",
          "template": " ❯ " }
      ]
    }
  ]
}
```
Common segment fields: `type`, `style` (`plain`, `powerline`, `diamond`), `powerline_symbol`, `foreground`, `background`, `foreground_templates`/`background_templates` (first non-empty wins), `template`, `options`. Block fields: `type` (`prompt`/`rprompt`), `alignment`, `newline`, `filler`, `overflow`, `segments`. Top level: `final_space`, `terminal_background`, `async`, `streaming`, `transient_prompt`, `secondary_prompt`, `palette(s)`, `extends`, `var`, `shell_integration`, `pwd`.

## Notes
- Browse segment properties at https://ohmyposh.dev/docs/segments/overview; each segment page lists its template properties and `options`. Check the options exist for the installed version (config `version` is 4).
- Show a segment only in some shells with `{{ if eq .Shell "pwsh" }}...{{ end }}`; an empty template hides the segment.
- `extends` lets a small file override blocks/segments of a base theme (match by `type`+`alignment`, or 1-based `index`).
- Edit with the JSON schema for validation: warnings appear for unknown segment types and missing required keys.
- Each git/language segment runs external commands; `oh-my-posh debug` shows per-segment timings.
