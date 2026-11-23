---
capability: config
tool: fd
os: windows, macos, linux
verified: 2026-11-23 (docs, fd README; fd 10.5.2)
sources: https://github.com/sharkdp/fd#excluding-specific-files-or-directories
---
# fd defaults: global ignore file and aliases

fd has no options file. Two places hold persistent behavior: the global ignore file (patterns, `.gitignore` syntax) and shell aliases for flags.

## Config
Global ignore file: Windows `%APPDATA%\fd\ignore`, macOS/Linux `~/.config/fd/ignore` (README). Per-directory: `.fdignore` (fd only) and `.ignore` (shared with ripgrep).
```
# ~/.config/fd/ignore
.git/
node_modules/
target/
dist/
*.bak
```
Including `.git/` here keeps repositories' internals out when you search with `--hidden` (README).
Flag defaults via alias (bash/zsh):
```sh
alias fd='fd --hidden --follow'
```
```powershell
Remove-Item Alias:fd -ErrorAction SilentlyContinue
function fd { & (Get-Command fd -CommandType Application | Select-Object -First 1).Source --hidden --follow @args }
```
Useful flags: `-t f|d|l|x` type, `-e ext` extension, `-E glob` exclude, `-d N` max depth, `-g` glob mode, `-p` match full path, `-s`/`-i` case, `-0` NUL-separated output, `-x cmd` / `-X cmd` run per result / batch.

## Notes
- Alias `fd` to `fd --hidden` changes what fzf sees only if fzf calls the alias; fzf runs commands in a subshell without aliases, so put the flags in `FZF_*_COMMAND` explicitly.
- Smart case: lowercase pattern is case-insensitive, any capital makes it sensitive.
- Verify: `fd --version`, `fd -H -t d '^\.git$' | head`.
