---
capability: shader
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/custom-shaders/, https://sw.kovidgoyal.net/kitty/changelog/
---
# Custom shaders in kitty
`custom_shaders` takes a space-separated list of pipeline/shader names (added in 0.49.0, official since then). Shaders are written in Slang, not GLSL.
## Config
```
custom_shaders {background.shader}
# bundled demo: custom_shaders inside-the-matrix
# cursor trail shaders also need: cursor_trail 1
```
## Notes
- Lookup: a relative name loads from `{xdg-config}/kitty/shaders/` (`.pipeline` extension added automatically); an absolute path (including `~`) loads directly; otherwise bundled shaders, then a default pipeline for a single shader file with that name.
- Bundled: `cursor-trail-motion-blur`, `cursor-trail-blaze`, `cursor-trail-lightning`, `cursor-trail-railgun`, `cursor-trail-torpedo`, `cursor-trail-pixiedust`, `inside-the-matrix`, `northern-lights`, `fireworks`, `water`, `pond-ripple`, `spotlight`, `dim-inactive-windows`, `tab-change`, `focus-highlight`, `screen-shake`, `screen-shake-random`, `crt`, `crt-blue`, `tft`.
- A shader defines `fragment_main()` over linear-RGB colors and a data struct (mouse, geometry, cursor, timing, alt-screen and command-running state); textures include `backbuffer`, `a`, `b`, `persist`. Pipelines have up to 16 groups; groups animate via `animation_start`, `animation_stop`, `animation_toggle` and events such as `bell-in-window`, `user-idle`.
- `shader_event` (0.50.0) triggers events from key maps. Cost: inactive groups are not drawn; keep animated pipelines off on battery.
- Needs kitty 0.49 or newer; older distro packages will ignore or reject the option.
