---
capability: palette
tool: oh-my-posh
os: windows, macos, linux
verified: 2026-11-23 (docs, oh-my-posh 33.x)
sources: https://ohmyposh.dev/docs/configuration/colors, https://ohmyposh.dev/docs/configuration/general
---
# Colour palette
Define a top-level `palette` object of named colours and reference them as `p:<key>` wherever a colour is expected (`foreground`, `background`, `*_templates`). Several palettes can be switched by a template with `palettes`.

## Config
```json
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "version": 4,
  "palette": {
    "bg":      "{palette.background}",
    "fg":      "{palette.foreground}",
    "accent":  "{palette.accent}",
    "red":     "{palette.ansi.red}",
    "green":   "{palette.ansi.green}",
    "yellow":  "{palette.ansi.yellow}",
    "blue":    "{palette.ansi.blue}",
    "magenta": "{palette.ansi.magenta}",
    "cyan":    "{palette.ansi.cyan}"
  },
  "blocks": [
    { "type": "prompt", "alignment": "left", "segments": [
      { "type": "path", "style": "powerline", "powerline_symbol": "",
        "foreground": "p:bg", "background": "p:accent",
        "template": " {{ .Path }} ", "options": { "style": "folder" } },
      { "type": "git", "style": "powerline", "powerline_symbol": "",
        "foreground": "p:bg", "background": "p:green",
        "background_templates": [
          "{{ if or (.Working.Changed) (.Staging.Changed) }}p:yellow{{ end }}",
          "{{ if gt .Ahead 0 }}p:cyan{{ end }}"
        ],
        "template": " {{ .HEAD }} " }
    ] }
  ]
}
```
Several palettes (e.g. light/dark by shell) with a fallback `palette`:
```json
"palettes": {
  "template": "{{ if eq .Shell \"pwsh\" }}light{{ else }}dark{{ end }}",
  "list": { "dark": { "bg": "#1e1e2e" }, "light": { "bg": "#eff1f5" } }
}
```
(A color defined in both `palette` and `palettes` takes the `palettes` value.)

## Notes
- Valid colour forms: `#rrggbb`, the 16 ANSI names (`black red green yellow blue magenta cyan white default darkGray lightRed lightGreen lightYellow lightBlue lightMagenta lightCyan lightWhite`), 0-255 numbers, `transparent`, `foreground`, `background`, `parentForeground`, `parentBackground`, and `accent` (OS accent colour, Windows/macOS).
- ANSI names and 256-colour numbers follow the terminal scheme, so with a terminal that already carries the look's ANSI palette you can skip `palette` and write `red`, `blue`... directly. Use `palette` hex when exactness matters.
- A mistyped reference (`p:bleu`) silently becomes `transparent`; if segments look uncoloured, check the keys. If a palette value is itself `p:<key>` it is resolved recursively.
- Gradients and shades (`darken(p:accent, 20)`) need hex or `p:` references that resolve to hex; ANSI names/numbers render no colour there.
- If black blocks show up in Windows Terminal or the VS Code terminal, set `terminal_background` to the terminal's background colour.
