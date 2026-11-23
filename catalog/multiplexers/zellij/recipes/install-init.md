---
capability: install-init
tool: zellij
os: windows, macos, linux
verified: 2026-11-23 (docs; winget/scoop ids machine-verified; zellij 0.46.0)
sources: https://zellij.dev/documentation/installation.html, https://zellij.dev/documentation/configuration.html, https://zellij.dev/documentation/commands.html
---
# Install Zellij and create a config
Install the binary, run `zellij` inside any terminal, and let it write `config.kdl` on first run (or dump the default one). Native Windows support arrived in 0.44.0.

## Config
Install: `winget install --id Zellij.Zellij` or `scoop install zellij` (Windows), `brew install zellij` (macOS), `pacman -S zellij` (Arch), `cargo binstall zellij` / `cargo install --locked zellij` (anywhere), or the launch script (`bash <(curl -L https://zellij.dev/launch)` on Linux/macOS, `irm https://zellij.dev/launch.ps1 | iex` on Windows). Windows also has an MSI installer and a zip (`zellij.exe` + `zellij-terminal.exe`) on the releases page.

```sh
zellij --version
mkdir -p ~/.config/zellij
zellij setup --dump-config > ~/.config/zellij/config.kdl     # skip if it already exists
zellij setup --check                                          # prints CONFIG DIR, LAYOUT DIR, plugin dir, problems
```
```powershell
# Windows PowerShell 5.1 / PowerShell 7
New-Item -ItemType Directory -Force "$HOME/.config/zellij" | Out-Null
zellij setup --dump-config | Out-File -Encoding utf8 "$HOME/.config/zellij/config.kdl"
# pin the config dir explicitly (the default differs between builds):
$env:ZELLIJ_CONFIG_DIR = "$HOME/.config/zellij"        # put in {ps-profile}/{pwsh-profile}
```
Auto-start in a shell: `zellij setup --generate-auto-start bash|zsh|fish` prints the snippet; env `ZELLIJ_AUTO_ATTACH=true` and `ZELLIJ_AUTO_EXIT=true` control behaviour.

Search order for the config dir: `--config-dir`, `ZELLIJ_CONFIG_DIR`, `$HOME/.config/zellij`, the OS default (macOS: `~/Library/Application Support/org.Zellij-Contributors.Zellij`), `/etc/zellij`. Single file: `zellij --config FILE` or `ZELLIJ_CONFIG_FILE`. Start without config: `zellij options --clean`. Running sessions pick up most config edits live.

## Notes
- `zellij setup --check` is the only config check; run it after editing (`zellij --config FILE setup --check` to test a file elsewhere; exit code not verified).
- Windows 0.44-0.46: default shell may follow `$env:SHELL`; set `default_shell "pwsh"` in config.kdl and verify. Config location differs between reports (`~/.config/zellij` vs `%APPDATA%\Zellij\config`): trust `zellij setup --check`.
- First run opens a setup screen offering to copy Zellij to a permanent folder and add shortcuts; `zellij setup --copy-to-permanent-folder` does it from the CLI.
- Keys at the default preset: `Ctrl g` lock, `Ctrl p` pane, `Ctrl t` tab, `Ctrl n` resize, `Ctrl s` scroll, `Ctrl o` session, `Ctrl q` quit.
- Zellij also runs as its own window (`zellij terminal`; not in musl builds).
