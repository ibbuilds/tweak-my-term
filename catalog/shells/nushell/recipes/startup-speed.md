---
capability: startup-speed
tool: nushell
os: windows, macos, linux
verified: 2026-11-23 (docs; no timings measured, nu not installed on the verification machine)
sources: https://www.nushell.sh/book/configuration, https://www.nushell.sh/book/3rdpartyprompts.html, https://www.nushell.sh/commands
---
# Make nushell start fast
Nushell is one native binary, so startup is mostly parsing and running your `config.nu` and autoload files. Compare against `nu -n` (no config), then remove work from the config.

## Config
Measure:
```nu
# inside nushell: time a closure
timeit { ^nu -c "exit" }                 # with config
timeit { ^nu -n -c "exit" }              # baseline: no config, no autoload (-n / --no-config-file)
```
From Windows PowerShell: `Measure-Command { nu -c exit }` vs `Measure-Command { nu -n -c exit }`; from bash/zsh: `time nu -c exit`.

Generate tool init scripts only when the tool changes, not on every start:
```nu
# config.nu
let autoload = ($nu.data-dir | path join "vendor/autoload")
mkdir $autoload
let starship_file = ($autoload | path join "starship.nu")
if not ($starship_file | path exists) {
  starship init nu | save -f $starship_file
}
```
(Files in the vendor autoload dir load after `config.nu`; a newly written file takes effect on the next start. Delete the file after upgrading the tool to regenerate it.)

## Notes
- `nu -n -c "..."` skips plugin registry, `env.nu`, `config.nu`, `login.nu` and autoload files (docs: `-n, --no-config-file`); `--no-std-lib` also drops the standard library (and the banner).
- Do not run `starship init nu | save ...` or `oh-my-posh init nu` unconditionally on each launch in `config.nu` if you want the fastest start: each is a process spawn (10-60 ms on Windows). The docs show the unconditional form for simplicity.
- Typical culprits: many `source`d files, heavy `use` modules, external tool inits, registered plugins (each plugin is a process started when used), network calls and `git` calls in `PROMPT_COMMAND`.
- Set `$env.config.show_banner = false`; the banner is cosmetic work.
- Completion caching (`completions.cache_size`) and `completions.external.enable = false` affect the first completion latency, not startup.
- Re-measure after each change; only trust numbers from your machine.
