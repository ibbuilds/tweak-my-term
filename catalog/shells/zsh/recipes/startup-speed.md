---
capability: startup-speed
tool: zsh
os: macos, linux
verified: 2026-11-23 (docs; zprof and compinit guidance corroborated by community profiling write-ups, not measured on this machine)
sources: https://zsh.sourceforge.io/Doc/Release/Zsh-Modules.html, https://zsh.sourceforge.io/Doc/Release/Completion-System.html, https://github.com/zsh-users/zsh-syntax-highlighting
---
# Make zsh start fast
Profile with the built-in `zprof`, then fix the top entries: usually `compinit`, oh-my-zsh, nvm, and `eval "$(tool init)"` lines.

## Config
Measure:
```zsh
time zsh -i -c exit                          # wall time
zsh -f -i -c exit                            # baseline without config
# profile functions: add as FIRST line of ~/.zshrc, and `zprof` as the LAST line
zmodload zsh/zprof
# line-by-line trace of everything:
zsh -xv -i -c exit 2> /tmp/zsh-trace.log     # large; add PS4='+%D{%s.%.} %N:%i> ' via env for timestamps
```
Cache a tool's init script:
```zsh
_cache_init() {            # _cache_init <name> <command...>
  local f=${XDG_CACHE_HOME:-$HOME/.cache}/zsh/$1.zsh bin=${commands[$2]}
  [[ -n $bin ]] || return
  if [[ ! -s $f || $bin -nt $f ]]; then mkdir -p ${f:h}; "${@:2}" > $f; fi
  source $f
}
_cache_init starship starship init zsh
_cache_init zoxide zoxide init zsh
```
Lazy-load nvm and friends:
```zsh
nvm() { unfunction nvm; source "$NVM_DIR/nvm.sh"; nvm "$@" }
```

## Notes
- `compinit` once only, with the `-C` + daily-rebuild pattern (see completion recipe); duplicate calls (oh-my-zsh sources it for you) can cost hundreds of ms.
- oh-my-zsh: set `DISABLE_AUTO_UPDATE="true"` before sourcing, trim `plugins=(...)`, avoid `nvm`/`conda` plugins; consider dropping the framework for 3 plugins and a prompt.
- Plugin managers that defer loading (zinit turbo, zsh-defer) or loading plugins from a `precmd` hook once can push syntax-highlighting/autosuggestions past the first prompt.
- `zcompile ~/.zshrc` and compiled completion dumps load faster.
- Prompts: `starship` and `powerlevel10k` instant prompt both aim to show the prompt before slow init finishes; p10k instant prompt requires its block at the very top of `~/.zshrc` and no console output before it.
- Targets: ~50 ms with prompt + completion + two plugins on a modern machine; investigate above ~200 ms.
