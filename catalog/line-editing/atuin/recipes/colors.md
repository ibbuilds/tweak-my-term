---
capability: colors
tool: atuin
os: windows, macos, linux
verified: 2026-11-23 (docs, atuin 18.25.1)
sources: https://docs.atuin.sh/cli/guide/theming/, https://docs.atuin.sh/cli/configuration/config/
---
# Themes
Atuin colours its UI from a theme: a map from semantic "meanings" to foreground colours. Pick a built-in (`default`, `autumn`, `marine`, `default-powershell`, or none) or write `~/.atuin/themes/<name>.toml`.

## Config
```toml
# ~/.atuin/config.toml
[theme]
name = "my-theme"
```
```toml
# ~/.atuin/themes/my-theme.toml  -- only override what you need; the rest comes from the parent
[theme]
name = "my-theme"
parent = "autumn"

[colors]
AlertInfo   = "#a6e3a1"      # {palette.ansi.green}
AlertWarn   = "#f9e2af"      # {palette.ansi.yellow}
AlertError  = "#f38ba8"      # {palette.ansi.red}
Annotation  = "#6c7086"      # {palette.ansi.brightBlack}
Guidance    = "#89b4fa"      # {palette.ansi.blue}
Important   = "#cba6f7"      # {palette.ansi.magenta}
Title       = "#94e2d5"      # {palette.ansi.cyan}
SyntaxCommand = "@ansi_(4)"  # keep the terminal's blue (ANSI index)
```
Meanings: `AlertInfo AlertWarn AlertError Annotation Base Guidance Important Title Muted SyntaxCommand SyntaxFlag SyntaxString SyntaxVariable SyntaxOperator`. Colour values: lowercase palette-crate names (`teal`), `#rrggbb`, or `@`-prefixed crossterm strings (`@ansi_(123)`, `@dark_yellow`, `@rgb_(255, 128, 0)`).

## Notes
- Leave `Base` unset unless the theme needs it: unset means the terminal's default foreground. A theme cannot name "default colour" explicitly.
- `default-powershell` reuses the default theme with PowerShell's syntax colours.
- Syntax highlighting inside results is controlled by `[ui] syntax_highlight`; shells without a grammar (nu, xonsh, PowerShell) are shown unhighlighted.
- Theme keys use the fetched docs list; check `docs.atuin.sh/guide/theming` for meanings added after 18.25.
