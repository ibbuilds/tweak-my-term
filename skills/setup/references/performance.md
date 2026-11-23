# Performance: shell startup and prompt speed

Budget: a new shell is ready in under 500 ms (plugin option `startup_budget_ms`), and the
prompt redraws in under 50 ms. `tmt measure --before` records the baseline; `tmt measure`
after apply compares.

## Find the cost

1. No-profile baseline: `bash --norc --noprofile -i -c exit`, `zsh -f -i -c exit`,
   `fish --no-config -c exit`, `powershell -NoProfile -Command exit`, `pwsh -NoProfile -c exit`.
   The difference to the full start is the config's cost.
2. Bisect the config: time each sourced file (`time source f` in bash/zsh;
   `Measure-Command { . f }` in PowerShell; `fish --profile-startup /tmp/p.txt -i -c exit`).
   zsh: `zmodload zsh/zprof` at the top, `zprof` at the end.

## Usual fixes

| Cost | Fix |
|---|---|
| `eval "$(starship init bash)"` / `oh-my-posh init` each start (fork + run) | cache the init output to a file, regenerate when the binary changes; source the file |
| oh-my-zsh / prezto / zinit with many plugins | source the 2-3 plugins directly; `compinit -C` with a daily dump |
| nvm, pyenv, conda, rbenv init | lazy-load on first use of `node`/`python`, or use fnm/mise (fast) |
| completions generated at startup (`kubectl completion`, `gh completion`) | generate once into a file |
| PowerShell module imports (posh-git, Terminal-Icons, PSReadLine 2.4 on 5.1) | import on first prompt or on idle (`Register-EngineEvent PowerShell.OnIdle`), drop Terminal-Icons for eza |
| `git status` in the prompt on big repos | prompt tool with status timeout (starship `command_timeout`, `scan_timeout`) |
| antivirus scanning profile/script folders (Windows) | keep the profile small; the user may exclude the folder (their call) |
| fancy line editors (ble.sh) | measure per keystroke; drop if typing lags |

## Prompt rules

One process per prompt at most (the prompt tool). No `$(...)` per segment in bash.
Use the shell's built-in timer (`EPOCHREALTIME`, `$CMD_DURATION`, `(Get-History -Count 1).Duration`)
for command duration, not `date`.

Report before/after numbers to the user; if over budget, say what costs what and
offer the trade.
