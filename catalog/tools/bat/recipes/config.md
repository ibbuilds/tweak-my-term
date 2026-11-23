---
capability: config
tool: bat
os: windows, macos, linux
verified: 2026-11-23 (bat 0.26.1: default config path read on Windows 11; sample config from a working setup)
sources: https://github.com/sharkdp/bat#configuration-file, https://github.com/sharkdp/bat#output-style
---
# bat configuration file

The config file is a list of command-line arguments, one per line, `#` comments allowed. Find the path with `bat --config-file`; create a documented default with `bat --generate-config-file`.

## Config
Default locations: Windows `%APPDATA%\bat\config` (verified), macOS and Linux `~/.config/bat/config`. Overrides: `BAT_CONFIG_PATH` (file) or `BAT_CONFIG_DIR` (directory; also where `themes/` lives). A system file exists at `/etc/bat/config` (Linux/macOS) or `C:\ProgramData\bat\config` (Windows) and the user file is appended to it.
```
# ~/.config/bat/config
--theme="ansi"
--style="numbers,changes,header-filename,grid"
--italic-text=always
--map-syntax=*.jsonc:JSON
--map-syntax=.env*:Bash
# --paging=never
```
Equivalent env vars: `BAT_THEME`, `BAT_STYLE`, `BAT_PAGER`, `BAT_THEME_DARK`, `BAT_THEME_LIGHT`.

`--style` components: `default`, `full`, `auto`, `plain`, or a list of `numbers,changes,header,header-filename,header-filesize,grid,rule,snip`. A `+`/`-` prefix adjusts the config style from the command line (`--style=-grid,+snip`).

## Notes
- `BAT_CONFIG_PATH`/`BAT_CONFIG_DIR` may already be set in the user environment (observed on one machine: pointing at a scoop app dir and a dotfiles path), so `bat --config-file` can differ from the default: always ask bat for the path before writing.
- Priority: command line > environment variables > config file.
- `--italic-text=always` needs a terminal and font with italics.
- `bat cache --build` is needed after adding themes or syntaxes under the config dir; `bat cache --clear` resets.
- Verify: `bat --config-file`, `bat --list-themes --color=never | head`, `bat --theme=ansi --color=always README.md | head`.
