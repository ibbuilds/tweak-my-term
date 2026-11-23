---
capability: config
tool: eza
os: windows, macos, linux
verified: 2026-11-23 (docs eza.1.md; eza 0.23.5)
sources: https://github.com/eza-community/eza/blob/main/man/eza.1.md
---
# eza options and environment variables

eza has no options file. Defaults are set by aliases and by environment variables. The theme file is covered in `theme.md`.

## Config
Environment variables (man page):

| Variable | Effect |
|---|---|
| `EZA_COLORS`, `LS_COLORS` | colors by two-letter code or glob (overrides `theme.yml`) |
| `EZA_CONFIG_DIR` | directory holding `theme.yml` |
| `EZA_ICON_SPACING` | spaces between icon and name |
| `EZA_GRID_ROWS` | minimum rows before the grid-details view activates |
| `EZA_STRICT` | error on conflicting options (for scripts) |
| `NO_COLOR` | disable colors; `--color` overrides it |
| `COLUMNS` | override terminal width |

Useful flags for a clean default:
```sh
eza --group-directories-first --icons=auto --color=auto --git-ignore -l --header --time-style=relative
eza --color-scale=size --color-scale-mode=gradient      # size/age gradient, uses the theme's number colors
eza --tree --level=3 --git-ignore --ignore-glob='.git|node_modules'
```
`--time-style` accepts `default`, `iso`, `long-iso`, `full-iso`, `relative`, or a `+FORMAT` string.

## Notes
- Options override right to left, so an alias default is overridden by what the user types (unless `EZA_STRICT` is set).
- `-l` columns can be dropped: `--no-user`, `--no-time`, `--no-filesize`, `--no-permissions`, `-o` (octal permissions) exist (eza 0.23.5 `--help`); check the installed version's help before relying on one.
- `--git` cost grows with repo size; `--git-repos` lists git status of repo roots (`--git-repos-no-status` is much faster).
- Config reload is not needed: every call rereads env and `theme.yml`.
