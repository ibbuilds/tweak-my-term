---
capability: shader
tool: windows-terminal
os: windows
verified: 2026-11-23 (machine + docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/customize-settings/profile-appearance, https://github.com/microsoft/terminal/tree/main/samples/PixelShaders
---
# Pixel shader in Windows Terminal
`experimental.pixelShaderPath` applies an HLSL pixel shader to the whole terminal output. Optional `experimental.pixelShaderImagePath` makes an image available to the shader in texture register `t1`. Both are experimental (Microsoft does not guarantee they stay). A shader overrides `experimental.retroTerminalEffect`.

## Config
Profile setting (`%USERPROFILE%` is expanded; since 1.24 a path may also be next to `settings.json`):
```jsonc
"experimental.pixelShaderPath": "%USERPROFILE%\\.config\\{look.name}\\shaders\\{background.shader}"
```
Minimal pass-through shader, from the official sample layout:
```hlsl
Texture2D shaderTexture;
SamplerState samplerState;

cbuffer PixelShaderSettings {
  float  Time;        // seconds since the shader was enabled
  float  Scale;       // UI scale
  float2 Resolution;  // resolution of shaderTexture
  float4 Background;  // background color as rgba
};

float4 main(float4 pos : SV_POSITION, float2 tex : TEXCOORD) : SV_TARGET
{
    // tex runs from (0,0) top left to (1,1) bottom right
    return shaderTexture.Sample(samplerState, tex);
}
```

## Notes
- The terminal output is the input texture, so a shader can change text rendering too. A soft halo behind glyphs over background art (verified idea on this machine: it improves readability) means sampling neighbours of `tex` and darkening where text is absent; write and test it, since errors only appear at runtime.
- Compile errors: a warning dialog appears and the shader is ignored until you touch `settings.json` or open a new tab.
- Ready-made examples in the repo folder `samples/PixelShaders`: `Invert.hlsl`, `Grayscale.hlsl`, `Retro.hlsl`, `Rasterbars.hlsl`, `Outlines.hlsl`, `BackgroundImage.hlsl`, `Animate_breathe.hlsl`, `Animate_scan.hlsl`.
- A shader adds GPU work per frame, more so when it animates with `Time`. An opaque window with no shader and animations off redraws least (verified on this machine).
- `experimental.retroTerminalEffect: true` is the built-in CRT effect and is ignored when a shader path is set.
