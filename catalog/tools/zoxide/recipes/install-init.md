---
capability: install-init
tool: zoxide
os: windows, macos, linux
verified: 2026-11-23 (docs; PowerShell init run on Windows PowerShell 5.1, zoxide 0.10.0)
sources: https://github.com/ajeetdsouza/zoxide#installation, https://github.com/ajeetdsouza/zoxide/blob/main/man/man1/zoxide-init.1
---
# Install zoxide and initialise it per shell

Install the binary, then add the init line at the END of the shell config (after `compinit` in zsh, after the prompt setup). It defines `z` (jump) and `zi` (interactive) and records every directory you enter.

## Config
Install: Windows `winget install ajeetdsouza.zoxide` or `scoop install zoxide`; macOS `brew install zoxide`; Linux `sudo pacman -S zoxide` / `sudo dnf install zoxide` / the install script (Debian and Ubuntu packages are old):
`curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh`

Init lines:
```sh
# bash (~/.bashrc)
eval "$(zoxide init bash)"
# zsh (~/.zshrc), AFTER compinit
eval "$(zoxide init zsh)"
# fish (~/.config/fish/config.fish)
zoxide init fish | source
# any POSIX shell
eval "$(zoxide init posix --hook prompt)"
```
```powershell
# PowerShell ($PROFILE), end of file
Invoke-Expression (& { (zoxide init powershell | Out-String) })
```
Nushell: `zoxide init nushell | save -f ~/.zoxide.nu` in env.nu, then `source ~/.zoxide.nu` in config.nu (Nushell 0.106+).

Cached init (saves one process spawn per shell, ~32 ms measured on Windows):
```sh
f=${XDG_CACHE_HOME:-$HOME/.cache}/zoxide.bash
[[ -s $f && $f -nt $(command -v zoxide) ]] || { mkdir -p "${f%/*}"; zoxide init bash > "$f"; }
source "$f"
```
Pass flags (`--cmd cd`, `--hook prompt`) to the same `zoxide init` call; they must also be in the cache invalidation (delete the cache file when they change).

## Notes
- Completions in zsh need the init after `compinit`; rebuild the cache with `rm ~/.zcompdump*; compinit` if `z <Tab>` does nothing (README).
- zoxide supports bash, elvish, fish, nushell, powershell, tcsh, xonsh, zsh and POSIX shells. No cmd.exe support.
- First use: the database is empty. `z foo` only jumps to directories you already visited (or add with `zoxide add <dir>`, or import from z/autojump with `zoxide import`).
- The init sets a hook (default `pwd`, per directory change). `--hook prompt` re-adds on every prompt (needed for shells without a pwd hook).
- Verify: `zoxide --version`; `type z` (alias or function); `zoxide query -ls | head`.
