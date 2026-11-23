---
capability: gaps
tool: aerospace
os: macos
verified: 2026-11-23 (docs, aerospace 0.21.3-Beta)
sources: https://nikitabobko.github.io/AeroSpace/guide
---
# Gaps in AeroSpace
`gaps.inner.*` is the space between windows, `gaps.outer.*` is the space to the screen edges. Values are points. Use one number everywhere so the layout reads even.

## Config (`~/.aerospace.toml`)
```toml
gaps.inner.horizontal = 10
gaps.inner.vertical   = 10
gaps.outer.left       = 10
gaps.outer.right      = 10
gaps.outer.top        = 10
gaps.outer.bottom     = 10
```

## Notes
- Default is 0 for all six keys. Set all six; there is no single `gaps = 10` key.
- Per monitor: `gaps.outer.top = [{ monitor.main = 16 }, 10]`; the last item is the fallback.
- If an external bar covers the top, raise only `gaps.outer.top` for that monitor.
- Gaps apply to tiled windows. Floating windows ignore them.
- Match the terminal's own padding: a gap of 8-12 next to a terminal padding of 8-12 looks consistent.
- Apply with `aerospace reload-config`.
