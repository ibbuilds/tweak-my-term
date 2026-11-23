---
capability: install-init
tool: oh-my-posh
os: windows, macos, linux
verified: 2026-11-23 (docs, oh-my-posh 33.x)
sources: https://ohmyposh.dev/docs/installation/windows, https://ohmyposh.dev/docs/installation/prompt, https://ohmyposh.dev/docs/installation/customize
---
# Install Oh My Posh and hook it into a shell
Install the binary, add one `oh-my-posh init <shell> --config <file>` line to the shell's startup file, and point `--config` at your own theme file (a local path is fastest; a theme name or URL downloads on shell start).

## Config
Install: `winget install JanDeDobbeleer.OhMyPosh --source winget` (Windows), `brew install jandedobbeleer/oh-my-posh/oh-my-posh` (macOS), `curl -s https://ohmyposh.dev/install.sh | bash -s` (Linux).

```powershell
# Windows PowerShell 5.1 -> {ps-profile}     PowerShell 7 -> {pwsh-profile}
oh-my-posh init pwsh --config "$HOME/.config/oh-my-posh/config.omp.json" | Invoke-Expression
# Execution policy blocks the generated script? Evaluate instead (slower):
# oh-my-posh init pwsh --eval --config "..." | Invoke-Expression
```
```bash
# bash (Git Bash too) -> ~/.bashrc
eval "$(oh-my-posh init bash --config ~/.config/oh-my-posh/config.omp.json)"
```
```zsh
# zsh -> ~/.zshrc
eval "$(oh-my-posh init zsh --config ~/.config/oh-my-posh/config.omp.json)"
```
```fish
# fish -> ~/.config/fish/config.fish
oh-my-posh init fish --config ~/.config/oh-my-posh/config.omp.json | source
```
Nushell (`init nu`) and cmd (Clink) are supported shells in the docs; their exact lines were not captured here, run `oh-my-posh init nu --help` / see https://ohmyposh.dev/docs/installation/prompt.

`--config` accepts a file path, a built-in theme name without extension (`jandedobbeleer`), or a URL. Start from a theme: `oh-my-posh config export --config jandedobbeleer --output ~/.config/oh-my-posh/config.omp.json` (export can also write yaml or toml per the docs; check `oh-my-posh config export --help` for the flag).

## Notes
- `oh-my-posh get shell` prints the shell it detects. After editing the profile reload with `. $PROFILE`.
- Add `--strict` (`eval "$(oh-my-posh init bash --strict)"`) when a package manager may replace the binary path during upgrades; the init script then resolves `oh-my-posh` through PATH.
- Preview without touching the shell: `oh-my-posh print primary --config <file> --shell uni`; `oh-my-posh print preview` renders every configured prompt, `--force` renders all segments regardless of context.
- Config is cached; `oh-my-posh enable reload` makes edits apply without restarting the shell.
- Needs a Nerd Font in the terminal for the glyphs most themes use.
- WSL: use the Linux install inside WSL; the theme can live on the Windows side under `/mnt/c/Users/<name>/` to share it.
- Windows startup is the weak point: see the performance recipe (`async`, cached init).
