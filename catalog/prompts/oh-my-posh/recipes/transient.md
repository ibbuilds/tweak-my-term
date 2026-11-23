---
capability: transient
tool: oh-my-posh
os: windows, macos, linux
verified: 2026-11-23 (docs, oh-my-posh 33.x)
sources: https://ohmyposh.dev/docs/configuration/transient
---
# Transient prompt
Add a `transient_prompt` object to the theme and Oh My Posh collapses each submitted prompt to it. The feature turns on automatically for every shell except cmd.

## Config
```json
{
  "transient_prompt": {
    "foreground": "p:green",
    "background": "transparent",
    "template": "❯ ",
    "right_template": "{{ now | date \"15:04\" }}",
    "newline": false
  }
}
```
Fields: `foreground`, `foreground_templates`, `background`, `background_templates`, `template` (default `{{ .Shell }}>`), `right_template` (zsh, powershell, fish; for single-line transients), `filler`, `newline`.

Shell support: nu, fish, zsh, PowerShell (not in ConstrainedLanguage mode), cmd, and bash only with ble.sh. For cmd run once `clink set prompt.transient always`.

## Notes
- zsh: with a multi-line command, set `secondary_prompt.multiline_keepprompt: true` so the full prompt stays until the whole command is submitted.
- `.Interrupted` (e.g. show `^C` before the transient prompt) is only set in zsh; other shells always report false.
- Plain Git Bash has no transient support; ble.sh would add it at 24-60 ms per keystroke and ~0.9 s per new tab on Windows (measured), so use PowerShell or fish/zsh if you want it.
- Compared with Starship, transient is first-class here and configured in the theme file.
