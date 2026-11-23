---
capability: highlighting
tool: ble.sh
os: windows, macos, linux
verified: 2026-11-23 (docs, ble.sh 0.4 devel)
sources: https://raw.githubusercontent.com/akinomyoga/ble.sh/master/README.md, https://github.com/akinomyoga/ble.sh/wiki/Manual-%C2%A71-Introduction
---
# Syntax highlighting
ble.sh highlights the command line while you type using a real syntactic analysis (nested command substitutions, here-documents), not regex matching. Enabled by default.

## Config
```bash
# ~/.blerc : switches
bleopt highlight_syntax=        # empty = off (also removes the cost of analysis)
bleopt highlight_filename=      # colour by existing file/dir
bleopt highlight_variable=      # colour by variable type
```
Faces for token classes (set with `ble-face -s <name> <style>`, see the colors recipe): `syntax_default syntax_command syntax_quoted syntax_quotation syntax_escape syntax_expr syntax_error syntax_varname syntax_delimiter syntax_param_expansion syntax_history_expansion syntax_function_name syntax_comment syntax_glob syntax_brace syntax_tilde`.

## Notes
- Highlighting is the main per-keystroke cost in a pure-Bash editor; on Windows Git Bash total cost was 24-60 ms per key (measured). Turning `highlight_syntax` off helps but the rest of ble.sh still runs.
- Errors (unmatched quotes, bad syntax) use `syntax_error`.
- Compare zsh-syntax-highlighting (zsh) and PSReadLine token colours (PowerShell).
