---
capability: borders
tool: komorebi
os: windows
verified: 2026-11-23 (docs, komorebi v0.1.41)
sources: https://lgug2z.github.io/komorebi/common-workflows/borders.html, https://lgug2z.github.io/komorebi/example-configurations.html, https://raw.githubusercontent.com/LGUG2Z/komorebi/v0.1.41/schema.json
---
# Window borders in komorebi
Set `border: true` and give a color per container state in `border_colours`: `single` (one window), `stack`, `monocle`, `floating`, `unfocused`, `unfocused_locked`. Colors are hex strings (`#RRGGBB`) or `{ "r": 0, "g": 0, "b": 0 }` objects.

## Config
```json
{
  "border": true,
  "border_width": 6,
  "border_offset": -1,
  "border_style": "Rounded",
  "border_implementation": "Komorebi",
  "border_colours": {
    "single": "{palette.accent}",
    "stack": "{palette.accent}",
    "monocle": "{palette.accent}",
    "floating": "{palette.ansi.brightBlack}",
    "unfocused": "{palette.ansi.brightBlack}"
  }
}
```

## Notes
- Focus color is the look's accent in every focused state, so a stack or monocle window does not change color; inactive windows are the muted `brightBlack`.
- `border_colours` has no effect while a `theme` is set in komorebi.json (the example config sets one). Remove `theme`, or pick a Base16 or Catppuccin theme and drop `border_colours`.
- `border_style`: `System`, `Rounded` (Windows 11 look) or `Square` (Windows 10 look). `border_implementation: "Windows"` uses the thin Windows accent border instead of komorebi's overlay.
- Borders only appear on windows komorebi manages, and they are an overlay window, which the author calls a hack. Ignored windows get none; floating windows use the `floating` color.
- Defaults: width 8, offset -1.
