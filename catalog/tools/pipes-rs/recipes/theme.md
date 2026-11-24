---
capability: theme
tool: pipes-rs
os: windows, macos, linux
verified: 2026-11-23 (docs: README "Color Modes" and "Options"; not run)
sources: https://github.com/lhvy/pipes-rs#configuration
---
# Color pipes-rs from the look-spec palette

There is no way to give pipes-rs a custom hex list. It has three color modes (`-c` flag or `color_mode` in the config):
- `ansi` (default): each pipe takes a random color from the terminal's color profile, so the pipes use the look's ANSI palette as soon as the terminal palette is set. This is the mode to use for a palette-matched look.
- `rgb`: random RGB colors drawn from a built-in `--palette` (`default`, `darker`, `pastel`, `matrix`); not the look palette. `--rainbow N` shifts hue N degrees per frame.
- `none`: no color set; pipes use the terminal's text color (`{palette.foreground}`).

## Config
Palette-matched pane command:
```
pipes-rs -c ansi -b false -p 3
```
Single-hue look: use `-c none` and set the pane's foreground to the accent, or pick `-c rgb --palette darker` when the look is dark and muted (approximate; it does not read the look palette).

Equivalent `config.toml` keys: `color_mode = "ansi"`, `bold = false`, `palette = "darker"` (rgb mode only).

## Notes
- `ansi` mode may draw pipes in black (`{palette.ansi.black}`) or the background color if the terminal palette makes them equal; check contrast between `{palette.ansi.black}` and `{palette.background}` first, or use `-c rgb`.
- `-b false` turns bold off; with bold on, many terminals show the bright palette variants.
