---
capability: performance
tool: zsh-syntax-highlighting
os: macos, linux
verified: 2026-11-23 (docs, zsh-syntax-highlighting 0.8.0)
sources: https://raw.githubusercontent.com/zsh-users/zsh-syntax-highlighting/master/docs/highlighters.md
---
# Performance
The plugin wraps every ZLE widget and repaints highlighting after each edit, so cost scales with command-line length and the number of enabled highlighters, not with history size.

## Config
```zsh
ZSH_HIGHLIGHT_HIGHLIGHTERS=(main)       # default; each extra highlighter adds work
ZSH_HIGHLIGHT_MAXLENGTH=512             # skip highlighting very long lines (documented option)
```

## Notes
- Source it last in `~/.zshrc` (upstream requirement) so it wraps the final set of widgets.
- The `main` highlighter checks whether path arguments exist to colour them; on slow network mounts that can make typing paths laggy (inferred from how it works, not measured).
- No numbers were measured here (no zsh on this machine); upstream documents only `ZSH_HIGHLIGHT_MAXLENGTH` as the tuning knob.
- Lighter alternative on zsh: none built in; on bash ble.sh (heavy), on PowerShell PSReadLine (built in).
