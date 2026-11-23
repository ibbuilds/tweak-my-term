---
capability: borders
tool: i3
os: linux
verified: 2026-11-23 (docs, i3 4.25.1)
sources: https://i3wm.org/docs/userguide.html
---
# Borders in i3
`default_border pixel <px>` gives new tiled windows an n px border without a title bar (`normal <px>` keeps the title bar, `none` removes the border). `default_floating_border` does the same for new floating windows. Colors: `client.<class> <border> <background> <text> <indicator> <child_border>`; with `pixel` the line around the window is `child_border`.

## Config
```
default_border pixel 2
default_floating_border pixel 2
#                        border             background         text                  indicator          child_border
client.focused           {palette.accent}   {palette.accent}   {palette.background}  {palette.accent}   {palette.accent}
client.focused_inactive  {palette.ansi.brightBlack} {palette.ansi.brightBlack} {palette.foreground} {palette.ansi.brightBlack} {palette.ansi.brightBlack}
client.unfocused         {palette.ansi.brightBlack} {palette.background} {palette.ansi.brightBlack} {palette.background} {palette.ansi.brightBlack}
client.urgent            {palette.ansi.red} {palette.ansi.red} {palette.background} {palette.ansi.red} {palette.ansi.red}
```

## Notes
- Colors are `#RRGGBB`, or `#RRGGBBAA` since 4.22.
- The title bar always shows in stacking and tabbed layouts and cannot be hidden by config.
- i3 has no rounded corners. On X11 they need a compositor (for example picom); that is outside i3 and not covered by its docs.
- `border pixel 3` / `border none` change the focused window at runtime; `for_window [class="X"] border pixel 1` sets it per class.
