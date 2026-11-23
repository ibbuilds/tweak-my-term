---
capability: integration
tool: bat
os: windows, macos, linux
verified: 2026-11-23 (docs; fzf preview line used in a working Windows 11 bash config, bat 0.26.1)
sources: https://github.com/sharkdp/bat#how-to-use, https://github.com/sharkdp/bat#man, https://github.com/sharkdp/bat#using-a-different-pager
---
# Use bat as cat, man pager, fzf preview and git helper

bat is a plain command; integration is aliases and env vars. It behaves like `cat` when piped, so interactive aliases do not break scripts.

## Config
```sh
# bash/zsh/fish (alias syntax per shell)
alias cat='bat --paging=never'       # keep cat semantics: no pager
alias catp='bat --paging=never'
export MANPAGER="bat -plman"          # colorized man pages (README)
# fzf preview (see the fzf entry)
export FZF_CTRL_T_OPTS="--preview='bat --color=always --style=numbers --line-range=:300 {}'"
# pretty --help
alias -g -- --help='--help 2>&1 | bat --language=help --style=plain'      # zsh global alias (README)
```
PowerShell:
```powershell
Remove-Item Alias:cat -ErrorAction SilentlyContinue
function cat { bat --paging=never @args }
$env:MANPAGER = 'bat -plman'     # only useful with a Unix man (Git Bash, WSL)
```
bat as the pager for git diffs is better done by `delta` (see the delta entry); bat can show changed files with `git diff --name-only --relative --diff-filter=d -z | xargs -0 bat --diff`.
`tail -f app.log | bat --paging=never -l log` highlights a live log.

## Notes
- `BAT_PAGER` overrides `PAGER` for bat only (`export BAT_PAGER="less -RFK"`); an empty `BAT_PAGER` disables paging. `PAGER=more`/`most` is silently replaced by `less`.
- On Debian/Ubuntu the command may be `batcat`: alias `bat=batcat` or symlink, and use `batcat` in `MANPAGER`.
- On Windows, `man` is not native; MANPAGER only matters in Git Bash/WSL. Paging needs a `less.exe` on PATH.
- Piping into bat loses the filename, so language detection falls back to the first line; pass `-l <language>`.
- Syntax mapping for odd extensions: `--map-syntax='*.jsonc:JSON' --map-syntax='.env*:Bash'` (config file).
