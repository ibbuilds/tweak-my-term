---
capability: completion
tool: nushell
os: windows, macos, linux
verified: 2026-11-23 (docs, Nushell configuration reference "Completions" and cookbook "External Completers", v0.117)
sources: https://www.nushell.sh/book/config_reference.html, https://www.nushell.sh/cookbook/external_completers.html, https://www.nushell.sh/blog/2026-11-09-nushell_v0_117_0.html
---
# Completion in nushell
Nushell completes its own commands, paths and flags natively. For external commands (git, docker, kubectl...) point `completions.external.completer` at a closure from carapace or fish.

## Config
Built-in behavior in `config.nu`:
```nu
$env.config.completions.algorithm = "prefix"     # "prefix" | "substring" | "fuzzy"
$env.config.completions.sort = "smart"           # "smart" | "alphabetical"
$env.config.completions.case_sensitive = false
$env.config.completions.quick = true             # auto-fill a single remaining suggestion
$env.config.completions.partial = true           # fill the common prefix
$env.config.completions.use_ls_colors = true
```
External completer via carapace (install carapace-bin first; closure from the Nushell cookbook):
```nu
let carapace_completer = {|place|
  carapace $place.command.0 nushell ...$place.command | from json
}
$env.config.completions.external.completer = $carapace_completer
```
Via fish (needs fish installed, Linux/macOS/WSL): see the cookbook's `$fish_completer`; combine them with a `match $place.command.0 { git => $fish_completer, _ => $carapace_completer }` closure.

Custom completion for your own command:
```nu
def "nu-complete envs" [] { ["dev" "staging" "prod"] }
def deploy [env: string@"nu-complete envs"] { print $"deploying to ($env)" }
```

## Notes
- Check what would complete without Tab: `'git swi' | commandline complete --detailed | select value description` (cookbook).
- Aliases are passed to external completers already expanded.
- Completions are cached per prompt (`completions.cache_size`, default 100; `0` disables); completers that list changing data (git branches) can look stale until cwd, PATH, commands or `$env.config` change.
- Set `$env.config.completions.external.enable = false` to stop Nushell searching PATH for command names if PATH has slow file systems.
- 0.117 adds `generate completions <cmd>`, e.g. `generate completions git | save ($nu.user-autoload-dirs | first | path join git-completions.nu)` to create a completion file loaded at startup (from the 0.117 release blog; verify with `help generate completions`).
- `$env.CARAPACE_LENIENT = 1` avoids "unknown shorthand flag" errors from carapace (cookbook troubleshooting).
