---
capability: install-init
tool: starship
os: windows, macos, linux
verified: 2026-11-23 (docs, starship 1.27.0)
sources: https://starship.rs/guide/, https://starship.rs/config/
---
# Install Starship and hook it into a shell
Install the binary with a package manager, add one init line to the end of the shell's startup file, then create `~/.config/starship.toml`. Needs a Nerd Font in the terminal for icon symbols.

## Config
Install ids: `winget install --id Starship.Starship`, `scoop install starship`, `brew install starship`, `pacman -S starship`, or `curl -sS https://starship.rs/install.sh | sh` (Linux/macOS).

Init line, appended to the END of the startup file:

```sh
# bash (also Git Bash)  ->  ~/.bashrc
eval "$(starship init bash)"
```
```sh
# zsh  ->  ~/.zshrc
eval "$(starship init zsh)"
```
```fish
# fish  ->  ~/.config/fish/config.fish
starship init fish | source
```
```powershell
# Windows PowerShell 5.1  ->  {ps-profile}
# PowerShell 7            ->  {pwsh-profile}
Invoke-Expression (& starship init powershell)
```
```nu
# nushell (v0.96+): run once, then restart
mkdir ($nu.data-dir | path join "vendor/autoload")
starship init nu | save -f ($nu.data-dir | path join "vendor/autoload/starship.nu")
```
```lua
-- cmd via Clink 1.2.30+  ->  %LocalAppData%\clink\starship.lua
load(io.popen('starship init cmd'):read("*a"))()
```
Config file (all OS): `~/.config/starship.toml`, or any path via `STARSHIP_CONFIG`:
```sh
mkdir -p ~/.config && touch ~/.config/starship.toml
```
```powershell
$ENV:STARSHIP_CONFIG = "$HOME\example\non\default\path\starship.toml"   # in $PROFILE
```

## Notes
- Starship has no config validator. `starship print-config` dumps the merged config (defaults included); unknown keys are warned about when a prompt renders (`STARSHIP_CONFIG=./x.toml starship prompt`; behaviour reported by a secondary source, not verified here).
- Other `starship` commands: `explain` (why each module shows), `timings` (per-module cost), `module <name>` (render one module), `preset <name> -o ~/.config/starship.toml` (overwrites the file), `config <key> <value>`.
- Startup file order: keep the init line last so it is not overwritten by other prompt hooks. In bash, transient and right prompts need ble.sh loaded as that tool's recipe describes.
- Windows: both PowerShell editions use the same `powershell` init. The 5.1 profile path is `{ps-profile}`, PowerShell 7 is `{pwsh-profile}`; a profile is not created automatically (`New-Item -Path $PROFILE -Type File -Force`).
- WSL: install the Linux build inside WSL; the `git_status.windows_starship` option can point at the Windows binary for `/mnt/c` repos where git is slow.
