---
capability: install-init
tool: fd
os: windows, macos, linux
verified: 2026-11-23 (docs; fd 10.5.2 on Windows 11)
sources: https://github.com/sharkdp/fd#installation
---
# Install fd

No shell init. On Debian and Ubuntu the executable is named `fdfind`.

## Config
- Windows: `winget install sharkdp.fd` or `scoop install fd`
- macOS: `brew install fd`
- Arch: `sudo pacman -S fd`; Fedora: `sudo dnf install fd-find`
- Debian/Ubuntu: `sudo apt install fd-find`, then
```sh
mkdir -p ~/.local/bin && ln -sf "$(command -v fdfind)" ~/.local/bin/fd     # ~/.local/bin must be on PATH
```
Verify: `fd --version`.

## Notes
- The name `fd` clashes with another Debian package, hence `fdfind` (README). The .deb on the project's release page still installs `fd`.
- Versions in distros lag: Ubuntu 24.04 has 9.0.0; all options used in this catalog exist there, but use the release `.deb` for 10.x features.
- Default behavior: ignores hidden files and anything in `.gitignore`, smart-case regex search. `-H` includes hidden, `-I` ignores ignore files, `-u` is both.
