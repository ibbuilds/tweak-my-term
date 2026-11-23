---
capability: startup-speed
tool: fish
os: macos, linux
verified: 2026-11-23 (docs, fish 4.9.3 `fish` command reference; guidance on slow tools is community knowledge, not measured here)
sources: https://fishshell.com/docs/current/cmds/fish.html, https://fishshell.com/docs/current/language.html
---
# Make fish start fast
fish itself starts quickly; slowness comes from `config.fish`/`conf.d` snippets. Profile with the built-in `--profile-startup`, then defer or cache.

## Config
Measure:
```fish
time fish -ic exit                                   # total
fish -N -ic exit                                     # baseline: no config (--no-config)
fish --profile-startup /tmp/start.prof -ic exit      # per-command timing of startup (docs)
sort -nk2 /tmp/start.prof | tail -20                 # sort by the second column, as in the docs example
```
Guard and lazy-load:
```fish
# config.fish
status is-interactive; or return
type -q starship; and starship init fish | source    # cheap if starship is installed

# lazy nvm-like loader: function file ~/.config/fish/functions/nvm.fish
function nvm
    functions -e nvm
    source ~/.config/fish/nvm-real.fish
    nvm $argv
end
```
Cache generated init (instead of `tool init fish | source` each start):
```fish
function __cache_init --argument-names name
    set -l f ~/.cache/fish/$name.fish
    set -l bin (command -v $argv[2]); or return
    if not test -s $f; or test $bin -nt $f
        mkdir -p (dirname $f); $argv[2..-1] > $f
    end
    source $f
end
__cache_init zoxide zoxide init fish
```

## Notes
- The profile file lists each executed command with timing (docs: "timing for fish startup"); sort it to find offenders.
- Biggest wins: move function definitions into `functions/` (autoload), avoid `(command ...)` substitutions and external-tool inits in `config.fish`, remove plugin managers you do not need.
- Universal variables (`set -U`) are stored once, so settings that never change need no code at startup.
- Targets: well under 50 ms for a plain config on desktop hardware; investigate above ~100 ms (not measured here).
