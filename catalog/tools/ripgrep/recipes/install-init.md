---
capability: install-init
tool: ripgrep
os: windows, macos, linux
verified: 2026-11-23 (docs; rg 15.2.0 on Windows 11)
sources: https://github.com/BurntSushi/ripgrep#installation
---
# Install ripgrep

The package is `ripgrep`, the command is `rg`. No shell init.

## Config
- Windows: `winget install BurntSushi.ripgrep.MSVC` or `scoop install ripgrep`
- macOS: `brew install ripgrep`
- Debian/Ubuntu `sudo apt install ripgrep`; Fedora `sudo dnf install ripgrep`; Arch `sudo pacman -S ripgrep`
Verify: `rg --version`.

## Notes
- Defaults: recursive, skips hidden files, binary files and anything in `.gitignore`/`.ignore`/`.rgignore`; `-uuu` removes all filters.
- Distro versions differ (Debian 13: 14.1.1, Ubuntu 24.04: 14.1.0); the options used here exist in both.
- Completions: `rg --generate complete-bash|complete-zsh|complete-fish|complete-powershell` (check `rg --help` for the installed version).
