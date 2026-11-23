---
capability: background-image
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation-preferences-profiles-window.html, https://iterm2.com/python-api/profile.html
---
# Background image in iTerm2
`Background Image Location` is the file path, `Blend` mixes the default background color over the image (0 to 1), `Background Image Mode` sets the fit.
## Config
```json
{
  "Background Image Location": "{background.image}",
  "Blend": 0.7,
  "Background Image Mode": 2
}
```
## Notes
- `Background Image Mode`: 0 stretch, 1 tile, 2 aspect fill (crop, like cover), 3 aspect fit (letterbox, like contain). Look `fit` mapping: fill=0, cover=2, contain=3, tile=1, center=3 (no pure center mode documented).
- `Blend` default meaning: how much the background color blends with the image; higher is dimmer image. Use 0.5-0.8 for readable text.
- Setting the path to an empty string clears the image. A folder of images can be chosen in the UI to rotate through them.
- Escape code alternative: `OSC 1337 ; SetBackgroundImageFile=<base64 filename>` (user must confirm).
- `Background Image Is Tiled` is a deprecated boolean; use the mode key.
- Absolute path required; `~` expansion unverified.
