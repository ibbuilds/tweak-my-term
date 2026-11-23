---
capability: opacity
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://man.archlinux.org/man/foot.ini.5
---
# Window opacity in foot
`alpha` is 0.0 to 1.0 (default 1.0) in a colors section. `alpha-mode` chooses which cells become translucent.
## Config
```ini
[colors-dark]
alpha={window.opacity}
alpha-mode=default
```
## Notes
- `alpha-mode`: `default`, `matching`, `all` (default `default`).
- Set `alpha` in `[colors-light]` as well if you use the light theme.
- 1.23.0: OSC 11 without an alpha restores the configured alpha.
- The effect needs a compositing Wayland compositor. Combine with `blur` where available.
