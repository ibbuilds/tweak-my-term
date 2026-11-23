---
capability: startup-file
tool: nushell
os: windows, macos, linux
verified: 2026-11-23 (docs, Nushell book "Configuration" and "Special Variables", v0.117)
sources: https://www.nushell.sh/book/configuration, https://www.nushell.sh/book/special_variables.html
---
# Where interactive nushell config goes
Nushell reads `env.nu`, `config.nu`, the autoload directories, then `login.nu` (login shells only) from `$nu.default-config-dir`. Put settings and startup tasks in `config.nu` (or small files in the autoload dir); `env.nu` is now optional and historical.

## Config
Find the files (they are created, empty, on first launch):
```nu
$nu.default-config-dir     # Windows: C:\Users\me\AppData\Roaming\nushell | macOS: ~/Library/Application Support/nushell | Linux: ~/.config/nushell
$nu.config-path            # config.nu
$nu.env-path               # env.nu
$nu.user-autoload-dirs     # *.nu here load after config.nu
$nu.vendor-autoload-dirs   # for tools/package managers
config nu                  # open config.nu in $env.config.buffer_editor; `config env` opens env.nu
```
`config.nu`:
```nu
$env.config.show_banner = false
$env.config.edit_mode = "emacs"
$env.EDITOR = "nvim"

# split larger configs into modules that you `use`/`source` by constant path
source ($nu.default-config-dir | path join "local.nu")   # NOTE: file must exist at parse time
```
`<config-dir>/autoload/10-aliases.nu` (loaded automatically, order by file name):
```nu
alias ll = ls -l
alias g = git
```

## Notes
- Load order (docs): `env.nu` -> `config.nu` -> `$nu.vendor-autoload-dirs` -> `$nu.user-autoload-dirs` -> `login.nu` (login only).
- `source` and `use` need a constant path that exists when the file is parsed; this is why generated init scripts go into an autoload directory (docs example for starship/oh-my-posh) instead of being sourced right after being written.
- `XDG_CONFIG_HOME` overrides the config dir on all platforms; `--config-home <path>`, `--config <file>`, `--env-config <file>` override per launch.
- Debug: `nu -n` / `--no-config-file` skips env, config, login and autoload files; `nu -c "..."` runs a command string without the REPL stage; `config nu --doc` prints documented defaults; `config default` shows built-in defaults.
- Keep `config.nu` edits additive: assign cells (`$env.config.table.mode = "light"`) instead of replacing `$env.config`.
- Nushell is not POSIX; bash-style `export` lines or `source ~/.bashrc` do not apply.
- Windows: make it the shell by pointing a Windows Terminal profile at `nu`.
