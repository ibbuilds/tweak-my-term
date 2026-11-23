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

Every image is a different composition, so there is no standard treatment. Never darken
by habit: a dark, calm image needs nothing, and an even veil over a picture whose only
bright part sits in a corner throws away what made it worth using.

`tmt art treat anchor.png bg.png --fit WxH --for-text look.json` reads the composition
and picks the lightest fix that keeps every text color readable:
- **none**: already readable, the image is left exactly as it is;
- **local**: a soft shade only where the image fights the text (`scrim` in the steps);
  the rest keeps its full strength;
- **global**: an even veil (+ slight blur) when most of the image is too strong anyway.

It also reports where the subject sits (`focal`) and notes. Text starts at the left edge
and most lines are short, so the left half needs full contrast and the right edge is
allowed less (`--zone terminal`, default). Use `--zone full` when output fills the whole
width (logs, wide tables, a multiplexer with a right pane). Force a choice with
`--strategy local|global` only for a reason you can name.

Act on the composition before reaching for more veil:
- Subject in the left half (`focalInTextZone`): align the image right, mirror it, or crop
  so the subject moves into the right third (`backgroundImageAlignment` in WT,
  `background` in WezTerm, `background_image_layout` in kitty).
- Bright everywhere: a darker frame of the same subject, a lower image opacity, or the
  light palette mode fits better than a heavy veil.
- Busy texture behind text: blur reads better than dimming.

Screenshots of rices are whole desktops: cut the terminal window out first with
`--crop X,Y,W,H` (pixels) before extracting a palette or using it as an anchor.

Manual treatments when the look calls for them: `--dim`, `--blur`, `--vignette`,
`--bloom`, `--quantize` (to the palette), `--scanlines`, `--pixelate`, `--ascii`.

Size: the window size in pixels at the user's scale (detect or ask), 2560x1600 is a safe
default for `uniformToFill`/cover. Keep PNGs under ~2 MB; some terminals re-decode on resize.
