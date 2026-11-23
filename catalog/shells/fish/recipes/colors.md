---
capability: colors
tool: fish
os: macos, linux
verified: 2026-11-23 (docs, fish 4.9.3 "Interactive use: syntax highlighting variables")
sources: https://fishshell.com/docs/current/interactive.html, https://fishshell.com/docs/current/cmds/fish_config.html, https://fishshell.com/docs/current/cmds/set_color.html
---
# Colors in fish: syntax, pager, prompt, ls
Highlighting colors are the `fish_color_*` variables; completion pager colors are `fish_pager_color_*`. Values are anything `set_color` accepts (name, hex, plus `--bold`, `--dim`, `--italics`, `--underline`, `--background=`).

## Config
```fish
# in config.fish (or set universally once: `set -U fish_color_command ...`)
set -g fish_color_normal       d8d2cf
set -g fish_color_command      f2eeea --bold
set -g fish_color_param        9a8e8f
set -g fish_color_quote        7f9172
set -g fish_color_error        e0201e --underline
set -g fish_color_comment      6e6264
set -g fish_color_operator     c2924a
set -g fish_color_autosuggestion 6e6264
set -g fish_color_valid_path   --underline
set -g fish_color_search_match --background=4d1216
set -g fish_pager_color_prefix       c2924a --bold
set -g fish_pager_color_progress     6e6264
set -g fish_pager_color_selected_background --background=4d1216
```
Themes: `fish_config theme show` (preview all), `fish_config theme choose <name>`; the web UI `fish_config` also edits colors.

ls/eza colors: `set -gx LS_COLORS (vivid generate molokai)`; `set -gx EZA_COLORS 'da=38;2;110;98;100'`.

## Notes
- Available variables (docs): `fish_color_normal, _command, _builtin, _function, _keyword, _quote, _redirection, _end, _error, _param, _valid_path, _option, _comment, _selection, _operator, _escape, _autosuggestion, _cwd, _user, _host, _status, _cancel, _search_match, _history_current`. Unset builtin/function/keyword fall back to `fish_color_command`.
- `set_color` accepts hex without `#`: `set_color ff0000`.
- Truecolor: fish uses 24-bit by default; if a terminal misbehaves set `fish_term24bit 0` (falls back to 256) (docs: `fish_term24bit`, `fish_term256`).
- Universal variables (`set -U`) persist across sessions without touching `config.fish`; global (`-g`) in `config.fish` is reproducible and version-controllable, which is better for dotfiles.
- The prompt can use the same palette: `set_color $fish_color_cwd`.
