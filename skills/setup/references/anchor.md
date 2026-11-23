# Visual anchor

One image defines the look: palette, mood, contrast and layout all follow from it. Save it
as `anchor.png` in the run folder (convert other formats with `tmt art treat in out.png`).

## Sources, in order

1. **The user's file or URL.** Download URLs into the run folder. JPEG/GIF/BMP/PNG load
   natively; WebP/AVIF need a converter (the error says which).
2. **A rice** picked in Inspire: `tmt inspire --save <n> <run-folder>`. Its screenshot
   shows a whole desktop: crop to the terminal window before extracting the palette
   (`tmt art treat in.png anchor.png --crop x,y,w,h` if supported, else describe the
   crop and use `--fit`).
3. **Generated.** No external service needed:
   - `tmt art scene anchor.png --preset <synthwave|nord-mountains|night-ocean|minimal-gradient> --seed n --palette look.json`
   - custom: write `paint.js` in the run folder using `${CLAUDE_PLUGIN_ROOT}/kit/raster.js`
     (gradients, discs, lines, noise, blur, glow) and `kit/scene.js` layers, then
     `node paint.js`. Keep it deterministic (seeded).
   - text art: `tmt art ascii logo.png --cols 40 --color truecolor --out logo.ans` for
     fastfetch logos and MOTDs.
4. **An image tool the user has** (an image-generation MCP or app): ask it for a
   wide (16:10) image, dark and low-detail where text will sit (left/center). Treat the
   result like a user file.

Show the anchor and get a nod before deriving the style. A wrong anchor wastes the run.

## Rights

Use only images the user owns, generated ones, or ones they explicitly chose. Never
bundle copyrighted characters or third-party art into a preset; link, don't rehost.

## Animated anchors

GIF/video backgrounds only work where the terminal supports them (WezTerm, Ghostty
shaders, iTerm2 none, Windows Terminal: static image + `experimental.pixelShaderPath`
shaders). Check `tmt catalog cap background-animated`. Otherwise use one still frame and
convey motion with the cursor/blink or a shader if supported.

## From anchor to background

Text must stay readable over the image. `tmt art treat anchor.png bg.png --fit WxH
--for-text look.json` dims/blurs until every ANSI color passes contrast. Manual
treatments: `--dim`, `--blur`, `--vignette`, `--quantize` (to the palette), scanlines,
pixelate. Place busy detail where text isn't (a corner, right side): terminals align
images (`backgroundImageAlignment` in WT, `background` in WezTerm, `background_image_layout`
in kitty).

Size: the window size in pixels at the user's scale (detect or ask), 2560x1600 is a safe
default for `uniformToFill`/cover. Keep PNGs under ~2 MB; some terminals re-decode on resize.
