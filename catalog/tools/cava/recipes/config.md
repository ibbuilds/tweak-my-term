---
capability: config
tool: cava
os: windows, macos, linux
verified: 2026-11-23 (docs: example_files/config and config.c of cava master (1.0.0); not run)
sources: https://raw.githubusercontent.com/karlstav/cava/master/example_files/config, https://raw.githubusercontent.com/karlstav/cava/master/config.c, https://github.com/karlstav/cava#configuration
---
# cava.conf: layout and motion

Default file: `$XDG_CONFIG_HOME/cava/config`, else `~/.config/cava/config` (on Windows `%USERPROFILE%\.config\cava\config`; config.c uses `USERPROFILE` there). Created on first launch. For a dashboard pane write a separate file and start with `cava -p <file>`, so the user's main config stays untouched. Lines starting with `;` show defaults; remove the `;` to change one.

## Config
A compact pane config (colors go in the `[color]` section from `theme.md`):
```
[general]
framerate = 30          # default 60; a lower rate costs less CPU, 30 still looks smooth in a pane
bars = 0                # 0 = fill the pane width
bar_width = 2
bar_spacing = 1
sleep_timer = 10        # idle seconds before it stops drawing
live-config = 1         # reload when the file changes

[output]
method = noncurses      # default: cursor moves, lowest CPU, least tearing
orientation = bottom    # bottom | top | left | right | horizontal | vertical
channels = stereo       # or mono

[smoothing]
noise_reduction = 77    # 0 fast and noisy .. 100 slow and smooth
monstercat = 0
waves = 0
```
Windows needs no `[input]` section. On Linux and macOS add one only if the auto-picked source is wrong (README: `method = pulse|pipewire|alsa|portaudio|coreaudio|fifo`, `source = auto`).

Pane command:
```
cava -p ~/.config/cava/dashboard.conf
```
Bar height follows the pane height (`max_height = 100` percent); the pane width sets the bar count when `bars = 0`.

## Notes
- Keys that change shape: `orientation = horizontal` draws bars up and down from the middle (good for a thin wide pane). Many fonts lack glyphs for the non-bottom orientations (config comment); check them in the chosen font.
- `sensitivity` is used only with `autosens = 0`; leave autosens on for a dashboard.
- Keys: up/down sensitivity, left/right bar width, `f`/`b` foreground/background, `r` reload, `q` quit.
- Debian 13 and Ubuntu 24.04 ship 0.6.0, which predates several keys here (`live-config`, `horizontal_gradient`, `theme`); an unknown key may be ignored or rejected. Test the installed version.
