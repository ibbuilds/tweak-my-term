---
capability: transient
tool: starship
os: windows, macos, linux
verified: 2026-11-23 (docs, starship 1.27.0)
sources: https://starship.rs/advanced-config/, https://github.com/starship/starship/discussions/5950, https://github.com/starship/starship/issues/5555
---
# Transient prompt
A transient prompt collapses the previous prompt to a short one (for example just `❯`) once you press Enter. Starship supports it natively in PowerShell, fish and cmd (Clink), in bash through ble.sh, and not natively in zsh or nushell.

## Config
**PowerShell 5.1 / 7** (documented):
```powershell
function Invoke-Starship-TransientFunction { & starship module character }   # optional; default is ">"
Invoke-Expression (& starship init powershell)
Enable-TransientPrompt        # Disable-TransientPrompt turns it off
```
**fish** (documented; printed only if the command line is non-empty and syntactically valid):
```fish
function starship_transient_prompt_func
  starship module character
end
function starship_transient_rprompt_func      # optional right side
  starship module time
end
starship init fish | source
enable_transience             # disable_transience to undo
```
**bash** (needs ble.sh >= 0.4, loaded in `~/.bashrc`; value is a colon list of `always`, `same-dir`, `trim`):
```bash
bleopt prompt_ps1_transient=always
bleopt prompt_ps1_final='$(starship module character)'      # left; pattern follows the documented prompt_rps1_final
bleopt prompt_rps1_final='$(starship module time)'          # right (documented)
```
**cmd (Clink)**: run once `clink set prompt.transient always` (or `same_dir`/`off`); customise with `starship_transient_prompt_func(prompt)` / `starship_transient_rprompt_func(prompt)` in `%LocalAppData%\clink\starship.lua`.

**zsh**: not built in (upstream issue starship/starship#3522). A community snippet from discussion #5950 (unverified here) uses two profiles:
```toml
[profiles]
transient  = "$character"
rtransient = "$status$cmd_duration$time"
```
```zsh
eval "$(starship init zsh)"
TRANSIENT_PROMPT="${PROMPT// prompt / prompt --profile transient }"
TRANSIENT_RPROMPT="${PROMPT// prompt / prompt --profile rtransient }"
autoload -Uz add-zle-hook-widget
transient-prompt() { PROMPT="$TRANSIENT_PROMPT" RPROMPT="$TRANSIENT_RPROMPT" zle .reset-prompt }
add-zle-hook-widget zle-line-finish transient-prompt
```
**nushell**: no Starship integration; Nushell's own `$env.TRANSIENT_PROMPT_COMMAND` can run `^starship module character` (maintainer suggestion in issue #5555, unverified).

## Notes
- Git Bash has no transient support without ble.sh, and ble.sh costs 24-60 ms per keystroke and ~0.9 s per new tab on Windows (measured), so on Windows prefer PowerShell if transient matters.
- The transient prompt is only the module(s) you name; `starship module <name>` prints a single module with the active palette.
- Oh My Posh offers transient via `transient_prompt` in the theme for nu, fish, zsh, PowerShell, cmd and bash (ble.sh).
