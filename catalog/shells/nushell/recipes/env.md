---
capability: env
tool: nushell
os: windows, macos, linux
verified: 2026-11-23 (docs, Nushell book "Environment", "Configuration" and 0.117 release notes)
sources: https://www.nushell.sh/book/environment.html, https://www.nushell.sh/book/configuration, https://www.nushell.sh/blog/2026-11-09-nushell_v0_117_0.html, https://www.nushell.sh/book/standard_library/util.html
---
# Environment variables and PATH in nushell
Set variables with `$env.NAME = value` in `config.nu`. `PATH` is a list inside Nushell (converted from the inherited string, and back for child processes). `$env` is case-insensitive when accessed by cell path.

## Config
```nu
$env.EDITOR = "nvim"
$env.LESS = "-R -F"
load-env { RIPGREP_CONFIG_PATH: ($nu.home-dir | path join ".config/ripgrep/rc") }

# PATH
use std/util "path add"
path add "~/.local/bin"                              # prepends (expands ~, no symlink resolution)
path add ($nu.home-dir | path join ".cargo" "bin")
path add --append "/opt/tools/bin"
# plain-list alternative: $env.PATH ++= ["~/.local/bin"]   (Windows: $env.Path works the same)

# dotenv (0.117+)
open .env | load-env                                 # quoted/multiline values, comments, ${VAR} expansion; no command execution
```
One-off: `with-env { RUST_LOG: debug } { cargo run }` or `RUST_LOG=debug cargo run`.

## Notes
- Env values can be any type; they are converted to strings when passed to external programs via `$env.ENV_CONVERSIONS` (`from_string`/`to_string` closures per variable, e.g. for `XDG_DATA_DIRS`).
- In 0.117, `load-env`, `with-env` and `FOO=bar cmd` apply `ENV_CONVERSIONS` (so a string `PATH` becomes a list); pass `--no-convert` to set raw values. In older versions re-assign `$env.ENV_CONVERSIONS = $env.ENV_CONVERSIONS` after `load-env`.
- `$env.config` is not inherited and not exported to child processes; ordinary variables are.
- Changes made inside a script, `def` or block are scoped; use `def --env` to let a custom command change the caller's environment.
- Variables set in `config.nu` exist only in Nushell and its children. To persist for all programs use the OS mechanism (Windows: System settings or `[Environment]::SetEnvironmentVariable(..., 'User')`); Nushell sees what its parent process inherited.
- Remove: `hide-env FOO`. Test: `"FOO" in $env` or `$env.FOO?`.
- Secrets: keep in an untracked `.env`-style file loaded with `open`/`load-env`; do not commit them in `config.nu`.
