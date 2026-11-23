---
capability: blur
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference, https://ghostty.org/docs/install/release-notes/1-4-0
---
# Background blur in Ghostty
`background-blur` is a nonnegative integer radius, or `true` (equals 20) / `false` (0). It is only useful when `background-opacity` is below 1.
## Config
```
background-opacity = {window.opacity}
background-blur = 20
```
## Notes
- macOS 26.0+ also accepts `macos-glass-regular` and `macos-glass-clear`.
- KDE Plasma ignores the intensity value (on or off only).
- 1.4.0: on GTK 4.23.3+ it uses GTK's built-in blur; on Wayland it uses a compositor-agnostic protocol so more compositors work. Which compositors show blur was not verified.
- Blur costs GPU on the compositor side; turn it off on weak hardware.
