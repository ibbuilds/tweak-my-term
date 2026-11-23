---
capability: prompt
tool: zsh
os: macos, linux
verified: 2026-11-23 (docs, zsh manual "Prompt Expansion" and "Hook Functions"; starship guide)
sources: https://zsh.sourceforge.io/Doc/Release/Prompt-Expansion.html, https://zsh.sourceforge.io/Doc/Release/Functions.html, https://starship.rs/guide/
---
# Custom or third-party prompt in zsh
`PROMPT` (left) and `RPROMPT` (right) are expanded with `%`-escapes; with `PROMPT_SUBST` they also run `$(...)`/`${...}`. Update dynamic parts from a `precmd` hook.

## Config
```zsh
autoload -Uz add-zsh-hook
setopt PROMPT_SUBST

typeset -g _prompt_git=''
_prompt_precmd() {
  local b; b=$(git symbolic-ref --short -q HEAD 2>/dev/null) && _prompt_git=" %F{3}$b%f" || _prompt_git=''
}
add-zsh-hook precmd _prompt_precmd

PROMPT='%F{8}%~%f${_prompt_git}
%(?.%F{2}.%F{1})❯%f '          # green/red by last exit status
RPROMPT='%F{8}%*%f'            # time on the right
```
Third party:
```zsh
eval "$(starship init zsh)"                               # starship.rs
eval "$(oh-my-posh init zsh --config ~/.config/omp.json)" # ohmyposh.dev
```

## Notes
- Escapes: `%~` cwd, `%n` user, `%m` host, `%?` status, `%F{n}...%f` color (name, 0-255, or `#rrggbb` in zsh >= 5.7 with truecolor), `%B...%b` bold, `%(?.yes.no)` conditional, `%*` time, `%#` `%`/`#`.
- Hooks: `precmd` (before each prompt), `preexec` (before a command runs, gets the line), `chpwd`. Register with `add-zsh-hook`, not by redefining the function, so frameworks keep working.
- Right prompt hides on narrow lines; `ZLE_RPROMPT_INDENT=0` removes the trailing gap.
- Transient prompt (collapse old prompts): zsh has no built-in; starship/powerlevel10k implement it with ZLE hooks. Keep one prompt framework only: two frameworks fight over `PROMPT`.
- Cost: each `$(git ...)` is a fork (~2-5 ms Linux/macOS, more on slow filesystems/large repos). Prefer `vcs_info` (`autoload -Uz vcs_info`) or cache per directory.
- Frameworks that need to run first (powerlevel10k "instant prompt") require their snippet at the very top of `~/.zshrc`.
