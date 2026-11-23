---
capability: env
tool: zsh
os: macos, linux
verified: 2026-11-23 (docs, zsh manual "Startup/Shutdown Files"; Homebrew shellenv guidance)
sources: https://zsh.sourceforge.io/Doc/Release/Files.html, https://wiki.archlinux.org/title/Zsh, https://docs.brew.sh/Installation
---
# Environment variables and PATH in zsh
Use `export` in `~/.zshenv` for variables every program needs (small, no output) and manage PATH with the `path` array in `~/.zprofile`/`~/.zshrc`.

## Config
`~/.zprofile` (login shells; macOS Terminal):
```zsh
# Homebrew (Apple Silicon: /opt/homebrew, Intel: /usr/local, Linux: /home/linuxbrew/.linuxbrew)
[[ -x /opt/homebrew/bin/brew ]] && eval "$(/opt/homebrew/bin/brew shellenv)"

typeset -U path PATH            # keep entries unique (also works on the exported PATH)
path=("$HOME/.local/bin" "$HOME/bin" $path)
export EDITOR=nvim PAGER=less LESS='-R -F'
```
`~/.zshenv` (all shells, scripts included):
```zsh
export XDG_CONFIG_HOME="$HOME/.config" XDG_CACHE_HOME="$HOME/.cache"
export LANG=${LANG:-en_US.UTF-8}
```

## Notes
- `path` (array) is tied to `PATH` (string); `path+=(dir)` appends, `path=(dir $path)` prepends. `typeset -U` dedupes. Remove an entry: `path=(${path:#/some/dir})`.
- macOS: `/etc/zprofile` runs `path_helper` after `~/.zshenv`, so system dirs end up first; define your PATH in `~/.zprofile`.
- Linux non-login terminals skip `~/.zprofile`; if variables are missing there, move them to `~/.zshenv` or enable "run command as a login shell" in the terminal.
- Non-interactive scripts read only `~/.zshenv`; heavy or noisy commands there slow down every script and can break scp/rsync (any output).
- `setopt ALL_EXPORT` exports every assignment; avoid in rc files.
- Secrets: source from an untracked file: `[[ -f ~/.config/zsh/secrets.zsh ]] && source ~/.config/zsh/secrets.zsh`.
- GUI apps on macOS do not see shell variables; use `launchctl setenv` or a LaunchAgent.
