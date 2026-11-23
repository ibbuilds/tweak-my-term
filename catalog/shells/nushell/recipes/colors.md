---
capability: colors
tool: nushell
os: windows, macos, linux
verified: 2026-11-23 (docs, Nushell book "Coloring and Theming" and default_config.nu, v0.113-0.117)
sources: https://www.nushell.sh/book/coloring_and_theming.html, https://github.com/nushell/nushell/blob/main/crates/nu-utils/src/default_files/default_config.nu, https://www.nushell.sh/book/config_reference.html
---
# Colors in nushell
Everything is in the `$env.config.color_config` record: data types, table chrome, hints, and `shape_*` keys that color the command line as you type. File listings use `LS_COLORS`.

## Config
```nu
$env.config.color_config.shape_internalcall = { fg: "#f2eeea" attr: b }
$env.config.color_config.shape_external      = "#9a8e8f"
$env.config.color_config.shape_string        = "#7f9172"
$env.config.color_config.shape_garbage       = { fg: "#d8d2cf" bg: "#e0201e" attr: b }   # errors
$env.config.color_config.hints               = "#6e6264"           # history hint
$env.config.color_config.header              = { fg: "#c2924a" attr: b }
$env.config.color_config.separator           = "#6e6264"
$env.config.color_config.search_result       = { bg: "#4d1216" fg: default }

# files in `ls`
$env.LS_COLORS = (vivid generate molokai)     # third-party generator; or set a hand-written LS_COLORS string
$env.config.ls.use_ls_colors = true
```
`color_config` values can be a name (`green_bold`, `dark_gray`), a hex string, an 8-bit number string, or a record `{ fg, bg, attr }` (`attr`: `b` bold, `u` underline, `i` italic, `n` normal...).

## Notes
- See current values: `$env.config.color_config | sort`; defaults: `config default`/the `default_config.nu` in the nushell repo (keys include `shape_internalcall`, `shape_external`, `shape_string`, `shape_variable`, `shape_operator`, `shape_filepath`, `shape_garbage`, `hints`, `row_index`, `header`, `bool`, `int`, `filesize`, `duration`, `datetime`).
- Define theme records before assigning them to `$env.config.color_config` (book guidance); assign cells instead of the whole record to keep unset keys.
- If `LS_COLORS` is unset Nushell uses a built-in 8-bit default; it respects `LS_COLORS` on macOS, Linux and Windows.
- `FORCE_COLOR`, `NO_COLOR`, `CLICOLOR` and `TERM` control `config use-colors` (read from the global environment; changes in `config.nu`/`env.nu` count, changes inside scripts or `with-env` do not).
- `$env.config.use_ansi_coloring` can force/disable color output.
- Prompt colors: use `(ansi red)`/`(ansi reset)` or `(ansi --escape { fg: "#e0201e" })` in prompt closures; see prompt recipe.
- Table styling is separate: `$env.config.table.mode = "rounded"` etc.
