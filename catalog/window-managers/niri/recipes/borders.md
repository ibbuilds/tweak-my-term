---
capability: borders
tool: niri
os: linux
verified: 2026-11-23 (docs, niri 26.04)
sources: https://github.com/niri-wm/niri/wiki/Configuration:-Layout, https://github.com/niri-wm/niri/wiki/Configuration:-Window-Rules
---
# Borders and rounding in niri
Two overlapping decorations: `focus-ring` (on by default, `width 4`, drawn around the active window only) and `border` (off by default, drawn around every window). Both take `width`, `active-color`, `inactive-color`, `urgent-color`, or gradients. Corner radius is set by the `geometry-corner-radius` window rule.

## Config
Border on every window, the active one in the accent color, plus rounded corners:
```kdl
prefer-no-csd

layout {
    focus-ring { off }
    border {
        width 2
        active-color "{palette.accent}"
        inactive-color "{palette.ansi.brightBlack}"
        urgent-color "{palette.ansi.red}"
    }
}

window-rule {
    geometry-corner-radius 10
    clip-to-geometry true
}
```
A gradient: `active-gradient from="{palette.accent}" to="{palette.ansi.blue}" angle=45`.

## Notes
- Use either the ring or the border; the config above turns the ring off. For the ring only, put the same colors into `focus-ring { }` and omit `border`.
- `geometry-corner-radius` rounds the ring and border; add `clip-to-geometry true` to round the window itself. It needs `prefer-no-csd` for apps that agree to drop client-side decorations.
- Without `prefer-no-csd`, the ring is a solid rectangle behind the window and shows through transparent terminals; with it, apps that negotiate server-side decorations get a clean ring.
- Colors accept CSS-style hex strings. Per-window overrides go in a `window-rule` with `border { }` or `focus-ring { }`, which also accept `on` and `off`.
