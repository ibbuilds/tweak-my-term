---
capability: install-init
tool: atuin
os: windows, macos, linux
verified: 2026-11-23 (docs; package ids machine-verified; atuin 18.25.1)
sources: https://docs.atuin.sh/cli/guide/installation/, https://docs.atuin.sh/cli/configuration/config/
---
# Install Atuin and hook it into a shell
Install the binary, add one init line to the shell's startup file, restart the shell. Atuin then records each command in a SQLite database and rebinds Ctrl-R and Up.

## Config
Install: `winget install -e Atuinsh.Atuin` or `scoop install atuin` (Windows), `brew install atuin` (macOS/Linux), `pacman -S atuin` (Arch), or the Unix script `curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh` (puts the binary in `~/.atuin/bin`).

```zsh
# ~/.zshrc  (after compinit; before zsh-syntax-highlighting, which must stay last)
eval "$(atuin init zsh)"
```
```bash
# ~/.bashrc  -- ble.sh >= 0.4 gives the best behaviour: load ble.sh first, then:
eval "$(atuin init bash)"
# Atuin >= 18.18 loads bash-preexec itself if no preexec backend is present;
# disable that with: eval "$(ATUIN_NO_BUILTIN_PREEXEC=1 atuin init bash)"
```
```fish
# ~/.config/fish/config.fish, inside the is-interactive block
atuin init fish | source
```
```powershell
# Windows PowerShell 5.1 -> {ps-profile};  PowerShell 7 -> {pwsh-profile}
atuin init powershell | Out-String | Invoke-Expression
```
```nu
# nushell: run once, then add `source ~/.atuin/init.nu` to config.nu
mkdir ~/.atuin/
atuin init nu | save ~/.atuin/init.nu
```
Config file: `~/.atuin/config.toml` (older: `~/.config/atuin/config.toml`). Import existing history with `atuin import auto`.

## Notes
- The init command must run in an interactive shell; keep it near the end of the rc file, after other widget/preexec plugins.
- Windows: only PowerShell is covered by the official instructions. The `$PROFILE` file is not created automatically.
- Sync is optional (`atuin register` / `atuin login`); local-only use needs no account. With `update_check = false` and no sync, Atuin makes no network requests.
- `atuin init <shell> --disable-up-arrow` / `--disable-ctrl-r` keep one of the two default bindings; see the keybindings recipe.
- In a tmux session set `[tmux] enabled = true` (tmux >= 3.2, zsh/bash/fish only) to open the search UI as a popup.
