---
capability: gaps
tool: glazewm
os: windows
verified: 2026-11-23 (docs, glazewm v3.10.1)
sources: https://github.com/glzr-io/glazewm#config-gaps, https://github.com/glzr-io/glazewm/blob/main/resources/assets/sample-config.yaml
---
# Gaps in GlazeWM
`gaps.inner_gap` is the space between adjacent windows; `gaps.outer_gap` is the space between windows and the screen edge, set per side. Use one value for all of them for a uniform look.

## Config
```yaml
gaps:
  scale_with_dpi: true     # scale the gaps with monitor DPI
  inner_gap: '12px'
  outer_gap:
    top: '12px'
    right: '12px'
    bottom: '12px'
    left: '12px'
```

## Notes
- Values are strings with a unit (`'12px'`). The docs only show `px`.
- With a status bar such as Zebar, raise `outer_gap.top` by the bar height (the generated sample uses `'60px'`), otherwise tiled windows sit under the bar.
- For no gaps at all set every value to `'0px'`.
