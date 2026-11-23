---
capability: blur
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://codeberg.org/dnkl/foot/releases, https://man.archlinux.org/man/foot.ini.5
---
# Background blur in foot
`blur=yes` inside a colors section blurs the transparent background. Preliminary support since 1.26.0.
## Config
```ini
[colors-dark]
alpha={window.opacity}
blur=yes
```
## Notes
- Requires foot built against wayland-protocols 1.45+ and a compositor implementing the `ext-background-effect-v1` protocol. Without it the key is accepted but has no visible effect.
- Distro packages may be built without it; verify visually.
- Default is `no`.
