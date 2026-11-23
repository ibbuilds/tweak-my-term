---
capability: borders
tool: glazewm
os: windows
verified: 2026-11-23 (docs, glazewm v3.10.1)
sources: https://github.com/glzr-io/glazewm#config-window-effects, https://github.com/glzr-io/glazewm/blob/main/resources/assets/sample-config.yaml
---
# Window borders in GlazeWM
`window_effects` has two groups: `focused_window` and `other_windows`. Each can set a colored border. Borders and corner styles are Windows 11 only (API limitation).

## Config
```yaml
window_effects:
  focused_window:
    border:
      enabled: true
      color: '{palette.accent}'
    corner_style:
      enabled: true
      style: 'rounded'      # 'square' | 'rounded' | 'small_rounded', Windows 11 only
  other_windows:
    border:
      enabled: true
      color: '{palette.ansi.brightBlack}'
    corner_style:
      enabled: true
      style: 'rounded'
```

## Notes
- Focus color is the look's accent; inactive windows get the muted `brightBlack`. Use the same `corner_style` in both groups so corners do not change on focus.
- Border width is not configurable. Set `enabled: false` under `other_windows.border` if only the focused window should be outlined.
- Other effects in the same groups: `hide_title_bar` (can break rendering in some apps) and `transparency` (`opacity: '95%'`; `0` makes a window unfocusable).
- Colors are quoted hex strings. On Windows 10 the border and corner options have no effect.
