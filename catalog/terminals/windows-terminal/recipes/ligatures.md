---
capability: ligatures
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/profile-appearance
---
# Ligatures in Windows Terminal
Control ligatures with OpenType features inside the `font` object: `features` takes `"tag": 1|0`. Ligature fonts (Cascadia Code, JetBrains Mono, Fira Code) render them by default; set `liga` and `calt` to 0 to turn them off.

## Config
Ligatures on:
```jsonc
"font": {
  "face": "{font.family}",
  "features": { "calt": 1, "liga": 1 }
}
```
Ligatures off:
```jsonc
"font": {
  "face": "{font.family}",
  "features": { "calt": 0, "liga": 0 }
}
```

## Notes
- Keep `face`, `size` and `weight` from the font recipe in the same `font` object; this snippet shows only the relevant keys.
- Other features use the same map, for example `"ss01": 1` for a stylistic set (docs example); the available tags depend on the font.
- Variable-font axes go in `font.axes`, for example `"ital": 1`.
