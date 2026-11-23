---
capability: install-init
tool: lazygit
os: windows, macos, linux
verified: 2026-11-23 (docs; lazygit 0.66.3 on Windows 11)
sources: https://github.com/jesseduffield/lazygit#installation, https://github.com/jesseduffield/lazygit/blob/master/docs/Config.md
---
# Install lazygit and find its config

No shell init. It needs `git` on PATH. Optional: `delta` for diffs, a Nerd Font for icons.

## Config
- Windows: `winget install JesseDuffield.lazygit`, or `scoop bucket add extras; scoop install lazygit`
- macOS: `brew install lazygit`
- Arch `sudo pacman -S lazygit`; Fedora `sudo dnf install lazygit`; Debian 13+/Ubuntu 25.10+ `sudo apt install lazygit`
- Older Debian/Ubuntu: release tarball
```sh
LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | grep -Po '"tag_name": *"v\K[^"]*')
LAZYGIT_ARCH=$(uname -m | sed -e 's/aarch64/arm64/')
curl -Lo lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/download/v${LAZYGIT_VERSION}/lazygit_${LAZYGIT_VERSION}_Linux_${LAZYGIT_ARCH}.tar.gz"
tar xf lazygit.tar.gz lazygit
sudo install lazygit -D -t /usr/local/bin/
```
Config location (docs): Linux `~/.config/lazygit/config.yml`; macOS `~/Library/Application Support/lazygit/config.yml`; Windows `%LOCALAPPDATA%\lazygit\config.yml`. Always confirm with `lazygit --print-config-dir` (it followed `XDG_CONFIG_HOME` on a Windows machine). `lazygit --config` prints the default config with comments.
Shell alias: `alias lg=lazygit` (bash/zsh/fish), `function lg { lazygit @args }` (PowerShell).

## Notes
- Old installs may keep config in `jesseduffield/lazygit/config.yml` under the same base dir; lazygit still reads it (docs).
- Repo-specific overrides: `<repo>/.git/lazygit.yml`, or `.lazygit.yml` in the repo or a parent directory.
- `LG_CONFIG_FILE="a.yml,b.yml"` or `--use-config-file=a.yml,b.yml` merges files (base + theme), later wins (docs).
