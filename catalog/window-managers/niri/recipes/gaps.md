---
capability: gaps
tool: niri
os: linux
verified: 2026-11-23 (docs, niri 26.04)
sources: https://github.com/niri-wm/niri/wiki/Configuration:-Layout, https://raw.githubusercontent.com/niri-wm/niri/main/resources/default-config.kdl
---
# Gaps in niri
`layout { gaps <px> }` sets one gap, in logical pixels, used between windows and around the screen edges. The default config uses `16`.

## Config
One value (`{layout.gap}` is the look's `layout.gap` in px):
```kdl
layout {
    gaps {layout.gap}
}
```

## Notes
- There are no separate inner and outer gaps in `layout`. To add extra space only at the screen edges use `struts` in `layout` (`left`, `right`, `top`, `bottom`); it is not covered by the pages used here, so check the Layout wiki before relying on it.
- Gaps are also the space the focus ring or border is drawn in; with a 4 px focus ring, keep `gaps` at least twice the ring width or the rings touch.
- Fractional values are allowed and rounded to physical pixels per output scale.
