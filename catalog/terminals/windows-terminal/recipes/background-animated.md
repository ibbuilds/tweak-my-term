---
capability: background-animated
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/profile-appearance, https://github.com/microsoft/terminal/tree/main/samples/PixelShaders
---
# Animated background in Windows Terminal
No dedicated option. Two routes: point `backgroundImage` at a .gif (accepted file type; whether it animates is not stated in the docs, so test it), or drive the animation from a pixel shader using the `Time` constant. The shader is the reliable one.

## Config
GIF route:
```jsonc
"backgroundImage": "%USERPROFILE%\\{background.image}",
"backgroundImageOpacity": {background.opacity},
"backgroundImageStretchMode": "uniformToFill"
```
Shader route (animated sample shaders `Animate_breathe.hlsl` and `Animate_scan.hlsl` exist in the Windows Terminal repo, `samples/PixelShaders`):
```jsonc
"experimental.pixelShaderPath": "%USERPROFILE%\\.config\\{look.name}\\shaders\\breathe.hlsl"
```
Inside the shader, `Time` is the number of seconds since the shader was enabled.

## Notes
- Animation costs GPU every frame; `disableAnimations: true` only disables UI animations, not the shader.
- Moving content behind text harms readability. Keep amplitude low or animate a background layer that text does not sit on.
- Shader failures: a compile error shows a warning dialog and the shader is ignored until you touch `settings.json` or open a new tab.
- See the shader recipe for the constant buffer layout and path rules.
