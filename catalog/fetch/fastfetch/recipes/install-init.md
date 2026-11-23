---
capability: install-init
tool: fastfetch
os: windows, macos, linux
verified: 2026-11-23 (docs; fastfetch 2.71.0 on Windows 11, config search paths read from `--list-config-paths`)
sources: https://github.com/fastfetch-cli/fastfetch#installation, https://github.com/fastfetch-cli/fastfetch/wiki/Configuration
---
# Install fastfetch and show it on new shells

fastfetch needs no daemon. Install it, put a `config.jsonc` in the config folder, and call it from the shell startup if the look wants a banner.

## Config
- Windows: `winget install Fastfetch-cli.Fastfetch` or `scoop install fastfetch`
- macOS: `brew install fastfetch`
- Debian 13+/Ubuntu 25.04+ `sudo apt install fastfetch`; Fedora `sudo dnf install fastfetch`; Arch `sudo pacman -S fastfetch`

Config file: `~/.config/fastfetch/config.jsonc` (docs; also found on Windows). Generate a starter: `fastfetch --gen-config` (interactive in a terminal, minimal when not). Try a preset or file: `fastfetch -c <name|path>`; show everything: `fastfetch -c all.jsonc`. List search paths: `fastfetch --list-config-paths`.

Run on shell start, with a switch to turn it off and only for interactive shells:
```sh
# bash/zsh rc
if [[ $- == *i* && -z ${NO_BANNER:-} && -t 1 ]]; then fastfetch; fi
```
```fish
if status is-interactive; and not set -q NO_BANNER; fastfetch; end
```
```powershell
# $PROFILE
if (-not $env:NO_BANNER) { fastfetch }
```
A named config for the banner: `fastfetch -c ~/.config/fastfetch/banner.jsonc`.

## Notes
- Startup cost measured on Windows 11: about 34 ms for a 3-module config, 41 ms for the default config, against 23 ms for an empty process, so a banner adds roughly one process spawn plus the modules. Add modules by measuring (`fastfetch -s <module> --format json`).
- Fastfetch prints no colors or logo when piped (`--pipe false` forces it); this protects scripts.
- The `Command` module and `command-raw` logo run arbitrary shell commands: never load a config from an untrusted source without reading it (README).
- `$schema`: `https://github.com/fastfetch-cli/fastfetch/raw/dev/doc/json_schema.json` gives editors completion; unknown keys are errors.
- Verify config: `fastfetch -c <file> --show-errors`.
