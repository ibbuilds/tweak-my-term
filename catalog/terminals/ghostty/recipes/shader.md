---
capability: shader
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference, https://ghostty.org/docs/install/release-notes/1-4-0
---
# Custom shaders in Ghostty
`custom-shader` loads a GLSL shader file that post-processes the rendered terminal. It is repeatable; shaders run in the order listed, after Ghostty's default shaders.
## Config
```
custom-shader = {background.shader}
custom-shader-animation = true
```
## Notes
- Same key on macOS and Linux; the path is a file in GLSL syntax. Uniform names and the entry point convention (Shadertoy-style `mainImage` is the common one) were not verified; read the shader docs or an example shader before writing one. The /docs/features/shaders URL returned 404 when checked.
- On compile failure the shader is ignored and the error appears only in the log. A bad shader can leave a black window; unset the key and reload to recover.
- Changeable at runtime and affects all open terminals.
- 1.4.0: custom shaders no longer receive swapped selection foreground/background uniforms.
- Cost: with animation on, the focused surface redraws continuously. Use `custom-shader-animation = false` for static effects (CRT, vignette).
