---
capability: install-init
tool: eza
os: windows, macos, linux
verified: 2026-11-23 (docs INSTALL.md; eza 0.23.5 on Windows 11)
sources: https://github.com/eza-community/eza/blob/main/INSTALL.md, https://repology.org/project/eza/versions
---
# Install eza

eza has no shell init. Install the binary, then make `ls` an alias (see `integration.md`). Icons need a Nerd Font in the terminal.

## Config
- Windows: `winget install eza-community.eza` or `scoop install eza`
- macOS: `brew install eza`
- Arch: `sudo pacman -S eza`; Fedora: `sudo dnf install eza`
- Debian/Ubuntu: `sudo apt install eza` where the distro has it (Debian 13: 0.21.0, Ubuntu 25.10: 0.21.0, Ubuntu 24.04: 0.18.2), or the project repo from INSTALL.md:
```sh
sudo mkdir -p /etc/apt/keyrings
wget -qO- https://raw.githubusercontent.com/eza-community/eza/main/deb.asc | sudo gpg --dearmor -o /etc/apt/keyrings/gierens.gpg
echo "deb [signed-by=/etc/apt/keyrings/gierens.gpg] http://deb.gierens.de stable main" | sudo tee /etc/apt/sources.list.d/gierens.list
sudo chmod 644 /etc/apt/keyrings/gierens.gpg /etc/apt/sources.list.d/gierens.list
sudo apt update && sudo apt install -y eza
```
Verify: `eza --version`, then `eza --icons=always -l` (icons show only with a Nerd Font).

## Notes
- `theme.yml` support needs a recent eza (the file landed in the 0.19.x series). Ubuntu 24.04's 0.18.2 ignores it; use `EZA_COLORS` there.
- No daemon, no startup cost: eza only runs when you call it (`eza --version` took ~32 ms on Windows, mostly process spawn).
- On Windows the mode column shows file attribute flags (observed: `-a---`, `d----`), not Unix permissions or owners.
