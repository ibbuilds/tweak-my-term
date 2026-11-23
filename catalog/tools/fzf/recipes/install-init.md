---
capability: install-init
tool: fzf
os: windows, macos, linux
verified: 2026-11-23 (docs, fzf 0.75.0 on a Windows 11 machine)
sources: https://github.com/junegunn/fzf#setting-up-shell-integration, https://github.com/kelleyma49/PSFzf
---
# Install fzf and wire it into the shell

Install the binary, then add one init line per shell. The binary embeds the shell scripts since 0.48.0, so no files need copying.

## Config
Install: Windows `winget install junegunn.fzf` or `scoop install fzf`; macOS `brew install fzf`; Linux `sudo apt install fzf` / `sudo dnf install fzf` / `sudo pacman -S fzf`.

Init line, at the END of the rc file (after prompt and completion setup):
```sh
# bash  (~/.bashrc)
eval "$(fzf --bash)"
# zsh   (~/.zshrc)
source <(fzf --zsh)
# fish  (~/.config/fish/config.fish)
fzf --fish | source
```
```powershell
# PowerShell (fzf has no native init; use PSFzf), $PROFILE
Install-Module PSFzf -Scope CurrentUser    # once
Import-Module PSFzf
Set-PsFzfOption -PSReadlineChordProvider 'Ctrl+t' -PSReadlineChordReverseHistory 'Ctrl+r'
```
Skip a binding by blanking its command before the init: `FZF_CTRL_R_COMMAND= FZF_ALT_C_COMMAND= eval "$(fzf --bash)"`. Setting the variable after the init has no effect.

Fast start, cached (measured: the plain `eval` costs one process spawn, ~35 ms on Windows):
```sh
f=${XDG_CACHE_HOME:-$HOME/.cache}/fzf.bash
[[ -s $f && $f -nt $(command -v fzf) ]] || { mkdir -p "${f%/*}"; fzf --bash > "$f"; }
source "$f"
```

## Notes
- `fzf --bash/--zsh/--fish` need fzf 0.48.0 or newer. Ubuntu 24.04 apt has 0.44.1: install the release binary (https://github.com/junegunn/fzf/releases) or source the key-binding scripts that older Debian/Ubuntu packages keep under /usr/share/doc/fzf/examples (path unverified).
- PSFzf default chords: Ctrl+t (provider paths), Alt+c (cd), Alt+a (history args). Ctrl+r is not overridden unless you pass `-PSReadlineChordReverseHistory` as above. PSFzf needs `fzf` on PATH.
- In Git Bash on Windows the bash init works.
- Init order matters when other tools bind Ctrl-R (atuin, ble.sh): the one initialised last wins the key.
- Rc files are replaced via the engine's managed block; do not append the line a second time.
