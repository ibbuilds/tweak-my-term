---
capability: integration
tool: fd
os: windows, macos, linux
verified: 2026-11-23 (docs; the fzf commands are from a working Windows 11 bash config, fd 10.5.2)
sources: https://github.com/sharkdp/fd#integration-with-other-programs, https://github.com/junegunn/fzf#environment-variables
---
# Use fd as the file source for fzf, ripgrep and yazi

fd is the fast, gitignore-aware lister. Tools that accept a "find command" take an fd line.

## Config
fzf (all widgets and `**` completion; see the fzf integration recipe):
```sh
export FZF_DEFAULT_COMMAND="fd --type f --hidden --follow --exclude .git --exclude node_modules"
export FZF_CTRL_T_COMMAND="fd --hidden --follow --exclude .git --exclude node_modules"
export FZF_ALT_C_COMMAND="fd --type d --hidden --follow --exclude .git --exclude node_modules"
```
Everyday aliases and helpers:
```sh
alias fdh='fd --hidden'                 # include dotfiles
alias fdu='fd --unrestricted'           # include ignored too (-u)
fdv() { fd "$@" --type f -0 | xargs -0 ${EDITOR:-nvim}; }    # open matches
```
PowerShell:
```powershell
function fdh { fd --hidden @args }
$env:FZF_DEFAULT_COMMAND = 'fd --type f --hidden --follow --exclude .git'
```
yazi searches with fd and ripgrep when they are on PATH (yazi installation docs list `fd` and `rg` as optional dependencies); no setup needed beyond installing them.
Run a command per result: `fd -e png -x convert {} {.}.jpg` (`{}` path, `{.}` without extension).

## Notes
- fd skips hidden and gitignored files by default; `--hidden --exclude .git` is the usual "everything useful" set for fzf.
- Paths with spaces: use `-0`/`--print0` with `xargs -0`.
- Debian/Ubuntu: command is `fdfind` unless symlinked (see install-init).
- Output is colorless when piped (fd checks the TTY); inside an fzf preview or `--ansi` pipeline add `--color always`.
