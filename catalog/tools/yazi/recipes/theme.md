---
capability: theme
tool: yazi
os: windows, macos, linux
verified: 2026-11-23 (docs theme.toml and flavors pages; yazi not installed on the verification machine)
sources: https://yazi-rs.github.io/docs/configuration/theme, https://yazi-rs.github.io/docs/flavors/overview, https://github.com/yazi-rs/flavors
---
# Theme yazi from the look-spec palette

Two routes: a ready flavor (when the user names Catppuccin or Dracula) or a `theme.toml` generated from palette tokens. Flavors live in `flavors/<name>.yazi/` and are selected in `theme.toml` under `[flavor]`; your own `theme.toml` entries override the flavor.

## Config
1. Flavor (`yazi-rs/flavors` has `catppuccin-{latte,frappe,macchiato,mocha}` and `dracula`):
```sh
ya pkg add yazi-rs/flavors:catppuccin-mocha
```
```toml
# theme.toml
[flavor]
dark = "catppuccin-mocha"
light = "catppuccin-latte"
```
Check compatibility with the installed yazi version before use (docs: outdated flavors silently fail).

2. Generated `theme.toml` (colors are `"#RRGGBB"` or one of `reset black white red lightred green lightgreen yellow lightyellow blue lightblue magenta lightmagenta cyan lightcyan gray darkgray`; styles `{ fg, bg, bold, dim, italic, underline, reversed, ... }`):
```toml
[mgr]
cwd = { fg = "{palette.ansi.cyan}" }
find_keyword  = { fg = "{palette.ansi.yellow}", bold = true, italic = true, underline = true }
find_position = { fg = "{palette.ansi.magenta}", bold = true, italic = true }
marker_copied   = { fg = "{palette.ansi.green}",  bg = "{palette.ansi.green}" }
marker_cut      = { fg = "{palette.ansi.red}",    bg = "{palette.ansi.red}" }
marker_marked   = { fg = "{palette.ansi.cyan}",   bg = "{palette.ansi.cyan}" }
marker_selected = { fg = "{palette.ansi.yellow}", bg = "{palette.ansi.yellow}" }
count_copied   = { fg = "{palette.background}", bg = "{palette.ansi.green}" }
count_cut      = { fg = "{palette.background}", bg = "{palette.ansi.red}" }
count_selected = { fg = "{palette.background}", bg = "{palette.ansi.yellow}" }
border_symbol = "│"
border_style  = { fg = "{palette.ansi.brightBlack}" }
syntect_theme = "~/.config/yazi/code.tmTheme"   # optional; generated like the bat .tmTheme

[tabs]
active   = { fg = "{palette.background}", bg = "{palette.ansi.blue}", bold = true }
inactive = { fg = "{palette.ansi.blue}", bg = "{palette.selectionBackground}" }

[mode]
normal_main = { fg = "{palette.background}", bg = "{palette.ansi.blue}", bold = true }
normal_alt  = { fg = "{palette.ansi.blue}", bg = "{palette.selectionBackground}" }
select_main = { fg = "{palette.background}", bg = "{palette.ansi.cyan}", bold = true }
select_alt  = { fg = "{palette.ansi.cyan}", bg = "{palette.selectionBackground}" }
unset_main  = { fg = "{palette.background}", bg = "{palette.ansi.magenta}", bold = true }
unset_alt   = { fg = "{palette.ansi.magenta}", bg = "{palette.selectionBackground}" }

[status]
perm_type  = { fg = "{palette.ansi.blue}" }
perm_read  = { fg = "{palette.ansi.yellow}" }
perm_write = { fg = "{palette.ansi.red}" }
perm_exec  = { fg = "{palette.ansi.green}" }
perm_sep   = { fg = "{palette.ansi.brightBlack}" }

[filetype]
rules = [
  { mime = "image/*", fg = "{palette.ansi.yellow}" },
  { mime = "{audio,video}/*", fg = "{palette.ansi.magenta}" },
  { mime = "inode/empty", fg = "{palette.ansi.cyan}" },
  { url = "*", is = "orphan", fg = "{palette.ansi.red}" },
  { url = "*/", fg = "{palette.ansi.blue}" },
]
```
Terminal background from yazi (needs OSC 11): `[app] overall = { bg = "{palette.background}" }`. Other tables (`[which] [confirm] [spot] [notify] [pick] [input] [cmp] [tasks] [help]`) fall back to the preset if omitted.
Terminal-following: use the named colors (`"blue"`, `"lightblue"`, ...) instead of hex.
Own flavor: start from https://github.com/yazi-rs/flavor-template (`flavor.toml` + `tmtheme.xml`).

## Notes
- `syntect_theme` is not available when a flavor is active: a flavor always uses its own `tmtheme.xml`. For a custom code-preview theme use `theme.toml` without `[flavor]`, or a flavor folder with your own `tmtheme.xml`.
- Make sure a `theme.toml` that selects a flavor holds only `[flavor]` unless you intend overrides (docs).
- Validate with taplo: `taplo check --schema https://yazi-rs.github.io/schemas/theme.json theme.toml` (docs).
- Icons come from the Nerd Font; `[icon]` rules in `theme.toml` can recolor them.
