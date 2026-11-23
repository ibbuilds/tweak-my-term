---
capability: line-editing
tool: nushell
os: windows, macos, linux
verified: 2026-11-23 (docs, Nushell configuration reference v0.117)
sources: https://www.nushell.sh/book/config_reference.html, https://www.nushell.sh/book/coloring_and_theming.html
---
# Line editing in nushell (reedline)
Nushell's editor is reedline: emacs, vi and helix modes, inline history hints, menus for completion/history, multiline editing and syntax highlighting, all built in and configured through `$env.config`.

## Config
```nu
$env.config.edit_mode = "emacs"            # "emacs" | "vi" | "helix"
$env.config.buffer_editor = "nvim"         # Ctrl-O opens the line in this editor; or ["hx", "{file}:{line}:{col}"]
$env.config.show_hints = true              # grey history hint after the cursor (accept with Right / End)
$env.config.cursor_shape.emacs = "line"
$env.config.cursor_shape.vi_insert = "line"
$env.config.cursor_shape.vi_normal = "block"
$env.config.completions.algorithm = "fuzzy"      # "prefix" (default) | "substring" | "fuzzy"
$env.config.completions.case_sensitive = false
$env.config.completions.partial = true
```

## Notes
- Syntax highlighting is on by default and colored through `$env.config.color_config.shape_*` (see colors recipe); `hints` is the color key for the history hint.
- A custom hinter can be set with `$env.config.hinter.closure` (docs list `hinter.closure`, default null).
- 0.117 adds a live REPL status line: `$env.config.status_line.enable` (default true) with `errors`, `signature`, `type`, `preview` sub-settings; disable with `$env.config.status_line.enable = false`.
- Keybindings and menus: see keybindings recipe. In 0.117, assigning `$env.config.keybindings` or `menus` replaces the whole list including Tab completion; extend with `++=`.
- Multiline: reedline continues incomplete input (open brackets, trailing pipe) automatically.
- Settings that reedline reads once at startup (history file format/path) must be set in `config.nu`, not in a session.
