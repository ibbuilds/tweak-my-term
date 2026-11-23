---
capability: colors
tool: ble.sh
os: windows, macos, linux
verified: 2026-11-23 (docs, ble.sh 0.4 devel; hex form unverified)
sources: https://raw.githubusercontent.com/akinomyoga/ble.sh/master/README.md, https://github.com/akinomyoga/ble.sh/wiki/Manual-%C2%A77-Completion
---
# Colours (faces)
Every visual element is a "face" set with `ble-face -s <name> <attributes>` in `~/.blerc`. Attributes: `fg=`, `bg=` (256-colour index or colour name; hex is accepted by ble.sh per its wiki but was not re-fetched here), `bold`, `underline`, `reverse`, `none`, and `ref:<face>` to inherit.

## Config
```bash
# ~/.blerc  (map look-spec ANSI slots to indices 0-15 so the terminal palette is used)
ble-face -s syntax_command           fg=4               # ANSI 4 = blue    -> {palette.ansi.blue} via the terminal scheme
ble-face -s syntax_quoted            fg=2               # green
ble-face -s syntax_quotation         fg=2,bold
ble-face -s syntax_escape            fg=5               # magenta
ble-face -s syntax_error             bg=1,fg=15         # red on bright white text
ble-face -s syntax_varname           fg=3               # yellow
ble-face -s syntax_comment           fg=8               # bright black
ble-face -s syntax_delimiter         bold
ble-face -s syntax_function_name     fg=6,bold          # cyan
ble-face -s auto_complete            fg=8               # the grey suggestion (default 'bg=254,fg=238')
ble-face -s menu_complete_match      bold
ble-face -s menu_complete_selected   reverse
ble-face -s prompt_status_line       fg=231,bg=240
```
Defaults for reference (from the blerc template): `syntax_command fg=brown`, `syntax_quoted fg=green`, `syntax_expr fg=33`, `syntax_error bg=203,fg=231`, `syntax_varname fg=202`, `syntax_comment fg=242`, `syntax_glob fg=198,bold`, `syntax_brace fg=37,bold`, `syntax_tilde fg=63,bold`.

## Notes
- Indices 0-15 follow the terminal's ANSI palette, so a terminal that already carries the look's palette recolours ble.sh with no hex (0 black, 1 red, 2 green, 3 yellow, 4 blue, 5 magenta, 6 cyan, 7 white, 8-15 bright). Use 16-255 or hex only for colours outside the 16.
- The default `auto_complete` face uses a light background (`bg=254`) that looks wrong on dark themes: set it to a dim foreground only.
- `ble-face` with no arguments lists faces; `bleopt` lists options.
- Vim-mode and menu faces (`menu_desc_default`, `menu_desc_type`, `menu_desc_quote`) inherit from syntax faces via `ref:`.
