---
capability: palette
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference, https://ghostty.org/docs/features/theme
---
# Palette in Ghostty
Set `background`, `foreground`, cursor and selection colors directly, and the 16 ANSI colors with `palette = N=#RRGGBB` (N is 0-15; 0-255 allowed). Colors accept `#RRGGBB`, `RRGGBB` or X11 names.
## Config
```
background = {palette.background}
foreground = {palette.foreground}
cursor-color = {palette.cursor}
cursor-text = {palette.cursorText}
selection-background = {palette.selectionBackground}
selection-foreground = {palette.selectionForeground}
palette = 0={palette.ansi.black}
palette = 1={palette.ansi.red}
palette = 2={palette.ansi.green}
palette = 3={palette.ansi.yellow}
palette = 4={palette.ansi.blue}
palette = 5={palette.ansi.magenta}
palette = 6={palette.ansi.cyan}
palette = 7={palette.ansi.white}
palette = 8={palette.ansi.brightBlack}
palette = 9={palette.ansi.brightRed}
palette = 10={palette.ansi.brightGreen}
palette = 11={palette.ansi.brightYellow}
palette = 12={palette.ansi.brightBlue}
palette = 13={palette.ansi.brightMagenta}
palette = 14={palette.ansi.brightCyan}
palette = 15={palette.ansi.brightWhite}
```
## Notes
- Omit `cursor-color`, `cursor-text` and `selection-*` to use Ghostty defaults (unset selection means inverted window colors). `cursor-color` and `selection-*` also accept `cell-foreground` / `cell-background` (since 1.2.0).
- Alternative: write the same lines into a theme file at `{xdg-config}/ghostty/themes/<name>` and set `theme = <name>`. A theme can also be an absolute path. Light/dark: `theme = light:NameA,dark:NameB`. `ghostty +list-themes` lists built-ins.
- `palette-generate` (since 1.3.0, default false) exists for deriving extended palette entries; its exact behavior was not verified here.
- Substitute real hex values for the `{}` tokens in the final file.
