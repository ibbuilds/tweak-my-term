---
capability: palette
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/config/appearance.html
---
# Palette in WezTerm
Set `config.colors` with the foreground, background, cursor, selection and the 16 ANSI colors (`ansi` = 8 normal, `brights` = 8 bright). Hex `#RRGGBB` is accepted everywhere.

## Config
```lua
config.colors = {
  foreground = '{palette.foreground}',
  background = '{palette.background}',
  cursor_bg = '{palette.cursor}',
  cursor_border = '{palette.cursor}',
  cursor_fg = '{palette.cursorText}',
  selection_bg = '{palette.selectionBackground}',
  selection_fg = '{palette.selectionForeground}',
  ansi = {
    '{palette.ansi.black}', '{palette.ansi.red}', '{palette.ansi.green}', '{palette.ansi.yellow}',
    '{palette.ansi.blue}', '{palette.ansi.magenta}', '{palette.ansi.cyan}', '{palette.ansi.white}',
  },
  brights = {
    '{palette.ansi.brightBlack}', '{palette.ansi.brightRed}', '{palette.ansi.brightGreen}', '{palette.ansi.brightYellow}',
    '{palette.ansi.brightBlue}', '{palette.ansi.brightMagenta}', '{palette.ansi.brightCyan}', '{palette.ansi.brightWhite}',
  },
}
```

## Notes
- Key map: `background`->`background`, `foreground`->`foreground`, `cursor`->`cursor_bg` (+`cursor_border`), `cursorText`->`cursor_fg`, `selectionBackground`->`selection_bg`, `selectionForeground`->`selection_fg`. Omit a line when the look spec leaves that token unset.
- `color_scheme` (a built-in name) is applied first and `colors` overrides it key by key (behaviour since 20220903-194523-3bb1ed61). Do not set both unless that merge is intended.
- Tab bar colors live in `config.colors.tab_bar` (retro tab bar) or `config.window_frame` (fancy tab bar); see the tabs recipe.
- `bold_brightens_ansi_colors` defaults to true: bold text on ANSI 0-7 is drawn with the bright color, which can break a carefully tuned palette. Set it to `false` (or `'No'`) to keep bold in the base color.
- Colors also accept CSS names, `rgb()`, `hsl()`. Alpha is ignored except on `selection_fg`/`selection_bg`.
