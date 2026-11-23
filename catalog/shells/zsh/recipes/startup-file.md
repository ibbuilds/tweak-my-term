---
capability: startup-file
tool: zsh
os: macos, linux
verified: 2026-11-23 (docs, zsh manual "Startup/Shutdown Files")
sources: https://zsh.sourceforge.io/Doc/Release/Files.html, https://wiki.archlinux.org/title/Zsh
---
# Where interactive zsh config goes
Put interactive settings (prompt, aliases, completion, key bindings, plugins) in `~/.zshrc`. Environment that must exist for every shell goes in `~/.zshenv` (keep tiny) or, for PATH, `~/.zprofile`.

## Config
Read order: `/etc/zshenv` -> `~/.zshenv` (all shells) -> `/etc/zprofile`, `~/.zprofile` (login) -> `/etc/zshrc`, `~/.zshrc` (interactive) -> `/etc/zlogin`, `~/.zlogin` (login).

`~/.zshenv` (runs for scripts too: no output, no slow commands):
```zsh
export XDG_CONFIG_HOME="$HOME/.config"
# optional: keep dotfiles out of $HOME
# export ZDOTDIR="$XDG_CONFIG_HOME/zsh"
```
`~/.zprofile` (login shells; macOS Terminal runs it):
```zsh
typeset -U path                     # unique PATH entries
path=("$HOME/.local/bin" "$HOME/bin" $path)
export EDITOR=nvim
```
`~/.zshrc`:
```zsh
[[ -o interactive ]] || return
setopt AUTO_CD INTERACTIVE_COMMENTS
for f in ~/.config/zsh/{prompt,history,completion,aliases}.zsh(N); do source $f; done   # (N) = ignore missing
```

## Notes
- `$ZDOTDIR` relocates all of these except `/etc/*` (`ZDOTDIR` itself must be set in `/etc/zshenv` or the environment, since `~/.zshenv` is read from `$ZDOTDIR` once it exists).
- macOS: `/etc/zprofile` runs `path_helper`, which moves system dirs to the front of PATH after `~/.zshenv`; so PATH set only in `~/.zshenv` loses ordering. Set PATH in `~/.zprofile`.
- Linux terminals (GNOME Terminal, Konsole, kitty) are non-login: `~/.zprofile` is not read. Either put PATH in `~/.zshenv`/`~/.zshrc`, or configure the terminal to run a login shell.
- `zsh -f` skips all startup files except `/etc/zshenv`. Check mode with `print -r -- "interactive=$options[interactive] login=$options[login]"`.
- Compile rarely-changing files for faster load: `zcompile ~/.zshrc` (a newer `.zwc` is used automatically).
- Windows: not supported natively (WSL or MSYS2 only).
