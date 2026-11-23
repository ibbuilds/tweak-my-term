---
capability: borders
tool: sway
os: linux
verified: 2026-11-23 (docs, sway 1.12)
sources: https://man.archlinux.org/man/sway.5
---
# Borders in sway
`default_border pixel <n>` gives new tiled windows an n px border with no title bar (`normal <n>` keeps a title bar, `none` removes it). `default_floating_border` does the same for new floating windows. Colors are set per state with `client.<class> <border> <background> <text> [<indicator> [<child_border>]]`; with `pixel`, the visible line around the window is `child_border`.

## Config
```
default_border pixel 2
default_floating_border pixel 2
#                        border             background         text                    indicator          child_border
client.focused           {palette.accent}   {palette.accent}   {palette.background}    {palette.accent}   {palette.accent}
client.focused_inactive  {palette.ansi.brightBlack} {palette.ansi.brightBlack} {palette.foreground} {palette.ansi.brightBlack} {palette.ansi.brightBlack}
client.unfocused         {palette.ansi.brightBlack} {palette.background} {palette.ansi.brightBlack} {palette.background} {palette.ansi.brightBlack}
client.urgent            {palette.ansi.red} {palette.ansi.red} {palette.background}  {palette.ansi.red} {palette.ansi.red}
```

## Notes
- Colors are `#RRGGBB` or `#RRGGBBAA`. `default_border` changes affect only windows created after a reload.
- Title bars always show in stacking and tabbed containers; `titlebar_border_thickness` and `titlebar_padding` tune them.
- Rounded corners are not available in sway 1.12 (the man page has no such command); the SwayFX fork adds `corner_radius`, but it is a different compositor.
- `hide_edge_borders smart` or `smart_borders on` hides borders when a workspace has one window.
