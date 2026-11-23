---
capability: logo
tool: fastfetch
os: windows, macos, linux
verified: 2026-11-23 (Logo-options wiki; text logo with color slots and hex/256 colors rendered on fastfetch 2.71.0, Windows 11; file-raw logo from a working config)
sources: https://github.com/fastfetch-cli/fastfetch/wiki/Logo-options, https://github.com/fastfetch-cli/fastfetch/wiki/Color-Format-Specification
---
# Custom logo: ASCII art, raw ANSI art or an image

The `logo` section chooses what is drawn left of the info. Types (`fastfetch -h logo-type`): `auto builtin small file file-raw data data-raw command-raw sixel kitty kitty-direct kitty-icat iterm chafa raw spin none`.

## Config
Text logo with color slots (`file`): in the art file, `$1`..`$9` switch to color slot N and `$$` prints a dollar sign. Slots get their colors from `logo.color`:
```
$1/\$2__
$1\/$2__
```
```jsonc
{
  "logo": {
    "type": "file",
    "source": "~/.config/fastfetch/logo.txt",
    "color": { "1": "{palette.ansi.red}", "2": "{palette.ansi.brightBlack}" },
    "padding": { "top": 0, "left": 2, "right": 3 }
  }
}
```
Pre-colored art (already contains escape sequences, e.g. made by a converter): use `file-raw`, which does no placeholder replacement; give its size so the info column aligns:
```jsonc
"logo": { "type": "file-raw", "source": "~/.config/fastfetch/logo.txt", "width": 25, "height": 12, "padding": { "left": 4, "right": 5 } }
```
Image logos (`source` is an image file; the terminal must support the protocol, see its catalog entry):
```jsonc
"logo": { "type": "kitty-direct", "source": "~/art/logo.png", "width": 28, "height": 14 }   // fastest; wezterm, warp, kitty, ghostty (png)
"logo": { "type": "sixel",        "source": "~/art/logo.png", "width": 28, "height": 14 }   // widest terminal support
"logo": { "type": "iterm",        "source": "~/art/logo.png", "width": 28, "height": 14 }   // iTerm2, wezterm, konsole
"logo": { "type": "chafa",        "source": "~/art/logo.png", "width": 28, "height": 14 }   // image to text art, any terminal; needs a chafa-enabled build
```
Disable or shrink: `"logo": null` (none), `"logo": { "type": "small" }` for the compact builtin, `"logo": "arch"` picks a builtin by name. Command line: `fastfetch -l <path> --logo-type file --logo-color-1 red`, `--file`, `--file-raw`, `--sixel`.
Random pick from many images: `"source": "~/art/*.png"` (docs: one file is chosen at random).

## Notes
- Hex colors work in `logo.color` (`#RRGGBB`, v2.42.0+), as do `@N` (256-color), names (`red`, `light_red`, `bold_white`) and raw SGR (`38;2;R;G;B`). Verified output for `#B3141B` and `@244`.
- Set `width` and `height` (columns and rows) for `kitty-direct`, `iterm` and `raw`, so fastfetch does not need to query the cursor (docs). Mismatch causes overlap with the info column.
- On Windows, sixel/kitty/iterm images are decoded by the platform image framework; on Linux/BSD fastfetch must be built with ImageMagick (and chafa for `chafa`): `fastfetch --list-features`.
- Animated GIF: `--logo-animation-frame 1` (default) shows a still; `0` plays (kitty type decodes itself; iterm/kitty-direct pass the file to the terminal).
- Image cache: `--logo-cache regen` after changing options without touching the file.
- Windows paths in JSONC: `%USERPROFILE%/path` or `~/path` (2.41.0+).
- ASCII/ANSI art from an image: convert it with any image-to-ANSI tool (the project kit does this), then use `file-raw` with `width`/`height`.
- Check: `fastfetch -c <file> --pipe false --show-errors`; if the builtin logo appears instead, the file is unreadable.
